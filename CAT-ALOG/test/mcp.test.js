'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { resolveDataDir, configFile } = require('../lib/datadir');

test('datadir: variabile, config dell\'app e Documenti/Catalogo MD', () => {
  assert.equal(resolveDataDir({ env: { CAT_DATA_DIR: '/x/dati' }, home: '/h' }), path.resolve('/x/dati'));
  assert.equal(resolveDataDir({ env: {}, home: '/h', config: { dataDir: '/c/dati' }, exists: (p) => p === '/c/dati' }), path.resolve('/c/dati'));
  assert.equal(resolveDataDir({ env: {}, home: '/h', config: {}, exists: (p) => p === path.join('/h', 'Documenti', 'Catalogo MD') }), path.join('/h', 'Documenti', 'Catalogo MD'));
  assert.equal(resolveDataDir({ env: {}, home: '/h', config: {}, exists: () => false }), path.join('/h', 'Documents', 'Catalogo MD'));
  assert.equal(configFile({ platform: 'win32', env: { APPDATA: 'C:\\A' }, home: 'C:\\U' }), path.join('C:\\A', 'CAT-ALOG', 'config.json'));
});

test('connettore MCP: strumenti veri via stdio su una cartella temporanea', async (t) => {
  const dir = fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-mcp-'));
  const data = path.join(dir, 'dati');
  fs.mkdirSync(data);
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(__dirname, '..', 'mcp', 'server.js')],
    env: Object.assign({}, process.env, { CAT_DATA_DIR: data })
  });
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(transport);
  t.after(() => client.close());
  const call = async (name, args) => {
    const r = await client.callTool({ name, arguments: args || {} });
    const text = r.content[0].text;
    return { isError: !!r.isError, text, json: r.isError ? null : JSON.parse(text) };
  };

  const tools = (await client.listTools()).tools.map((x) => x.name).sort();
  assert.deepEqual(tools, ['catalogo_info', 'controlla_qualita', 'crea_anteprima', 'elimina_elemento', 'imposta_variabile_root', 'leggi_elemento', 'leggi_root', 'lista_classi', 'lista_elementi', 'salva_elemento']);

  const info = await call('catalogo_info');
  assert.equal(info.json.cartellaDati, data);
  assert.ok(info.json.elementi.componenti >= 90);

  const found = await call('lista_elementi', { kind: 'componenti', cerca: 'navbar' });
  assert.ok(found.json.length >= 3);

  const nuovo = await call('salva_elemento', { kind: 'componenti', nome: 'Prova connettore', html: '<button class="cat-prova">Ciao</button>', css: '.cat-prova{padding:1rem}', js: 'console.log(1)', tag: ['prova'] });
  assert.equal(nuovo.json.creatoNuovo, true);
  const id = nuovo.json.id;
  assert.ok(fs.existsSync(path.join(data, 'componenti', id, 'markup.html')), 'il file esiste su disco, come per VS Code');
  const letto = await call('leggi_elemento', { kind: 'componenti', id });
  assert.match(letto.json.html, /cat-prova/);

  const agg = await call('salva_elemento', { kind: 'componenti', id, nome: 'Prova connettore', html: '<button class="cat-prova">Ciao 2</button>', css: '', js: '' });
  assert.equal(agg.json.creatoNuovo, false);
  assert.ok(fs.readdirSync(path.join(data, 'componenti', id, '_versioni')).length >= 1, 'la versione di prima resta');

  const prev = await call('crea_anteprima', { kind: 'componenti', id });
  assert.match(fs.readFileSync(prev.json.file, 'utf8'), /Ciao 2/);
  assert.ok(Array.isArray((await call('controlla_qualita', { kind: 'componenti', id })).json));

  const root = await call('imposta_variabile_root', { nome: '--cat-prova-colore', valore: '#123456', gruppo: 'Prova' });
  assert.equal(root.json.aggiunta, true);
  assert.match(JSON.stringify((await call('leggi_root')).json), /--cat-prova-colore/);
  assert.ok((await call('lista_classi', { cerca: 'col-md' })).json.length >= 1);

  const del = await call('elimina_elemento', { kind: 'componenti', id });
  assert.ok(del.json.cestino);
  assert.ok(!fs.existsSync(path.join(data, 'componenti', id)));

  /* errori chiari, senza chiudere il connettore */
  assert.equal((await call('leggi_elemento', { kind: 'componenti', id: 'non-esiste' })).isError, true);
  const rifiuta = async (name, args) => {
    try {
      const r = await client.callTool({ name, arguments: args });
      return !!r.isError;
    } catch (e) {
      return true;
    }
  };
  assert.equal(await rifiuta('leggi_elemento', { kind: 'componenti', id: '../../etc' }), true, 'percorsi non permessi');
  assert.equal(await rifiuta('lista_elementi', { kind: 'altro' }), true, 'tipo non valido');
  assert.equal(await rifiuta('salva_elemento', { kind: 'componenti', nome: 'x', html: 'a'.repeat(1024 * 1024 + 1) }), true, 'testo troppo grande');
  assert.equal((await call('catalogo_info')).isError, false);
});

test('collegamento a Claude Desktop: unisce al file esistente, copia di sicurezza, rifiuta JSON rotti', () => {
  const { install, candidates } = require('../mcp/installa-desktop');
  const dir = fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-desk-'));
  const file = path.join(dir, 'Claude', 'claude_desktop_config.json');
  const server = path.join(__dirname, '..', 'mcp', 'server.js');

  /* file che non esiste: viene creato */
  const r1 = install({ config: file, serverJs: server, nodePath: 'C:\\Program Files\\nodejs\\node.exe' });
  assert.equal(r1[0].creato, true);
  const j1 = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(j1.mcpServers['cat-alog'], { command: 'C:\\Program Files\\nodejs\\node.exe', args: [server] });

  /* file con altre impostazioni e altri server: restano */
  fs.writeFileSync(file, JSON.stringify({ theme: 'dark', mcpServers: { altro: { command: 'x', args: [] } } }));
  const r2 = install({ config: file, serverJs: server, nodePath: 'node' });
  assert.ok(r2[0].copia && fs.existsSync(r2[0].copia), 'copia di sicurezza');
  const j2 = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(j2.theme, 'dark');
  assert.ok(j2.mcpServers.altro && j2.mcpServers['cat-alog']);

  /* rilancio: nessun doppione */
  install({ config: file, serverJs: server, nodePath: 'node' });
  assert.equal(Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')).mcpServers).length, 2);

  /* JSON rotto: errore chiaro e file intatto */
  fs.writeFileSync(file, '{ "mcpServers": { ');
  assert.throws(() => install({ config: file, serverJs: server, nodePath: 'node' }), /non è un JSON valido/);
  assert.equal(fs.readFileSync(file, 'utf8'), '{ "mcpServers": { ');

  /* file vuoto */
  fs.writeFileSync(file, '');
  install({ config: file, serverJs: server, nodePath: 'node' });
  assert.ok(JSON.parse(fs.readFileSync(file, 'utf8')).mcpServers['cat-alog']);

  assert.match(candidates({ platform: 'win32', env: { APPDATA: 'C:\\R', LOCALAPPDATA: dir }, home: 'C:\\U' })[0], /Claude/);
});
