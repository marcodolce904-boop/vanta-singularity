'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createApi, API_NAMES } = require('../lib/api');

const root = path.join(__dirname, '..');

function tmp() {
  return fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-test-'));
}

function make(over) {
  const base = tmp();
  const log = { copied: [], opened: [], saveDialogs: [], folderDialogs: [] };
  const ui = Object.assign(
    {
      chooseFolder: async (titolo) => {
        log.folderDialogs.push(titolo);
        return null;
      },
      chooseSaveFile: async (nome, filtri) => {
        log.saveDialogs.push({ nome, filtri });
        return null;
      },
      copy: (t) => log.copied.push(t),
      openPath: async (p) => log.opened.push(p),
      chooseOpenFile: async () => null,
      chooseOpenFiles: async () => [],
      renderPng: async (doc, widths) => widths.map((width) => ({ width, png: Buffer.from('PNG' + width) }))
    },
    over || {}
  );
  const configFile = path.join(base, 'cfg', 'config.json');
  const defaultDataDir = path.join(base, 'dati');
  const api = createApi({ configFile, defaultDataDir, ui });
  return { api, log, base, configFile, defaultDataDir, ui };
}

test('ogni nome della lista è una funzione dell\'API, e non ce ne sono altre', async () => {
  const { api } = make();
  assert.deepEqual(Object.keys(api).sort(), API_NAMES.slice().sort());
  API_NAMES.forEach((n) => assert.equal(typeof api[n], 'function', n));
  assert.equal(new Set(API_NAMES).size, API_NAMES.length);
});

test('preload.js espone esattamente i nomi di lib/api.js', () => {
  const src = fs.readFileSync(path.join(root, 'preload.js'), 'utf8');
  const body = /const NAMES = \[([\s\S]*?)\];/.exec(src)[1];
  const names = body.match(/'([A-Za-z]+)'/g).map((s) => s.slice(1, -1));
  assert.deepEqual(names, API_NAMES);
  assert.match(src, /contextBridge\.exposeInMainWorld\('api'/);
});

test('main.js usa la finestra protetta e la lista dei nomi permessi', () => {
  const src = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
  assert.match(src, /contextIsolation: true/);
  assert.match(src, /nodeIntegration: false/);
  assert.match(src, /sandbox: true/);
  assert.match(src, /API_NAMES\.indexOf\(name\) === -1/);
  assert.match(src, /will-prevent-unload/);
  assert.match(src, /setWindowOpenHandler/);
});

test('getConfig: cartella dei dati e prefisso, e il file di configurazione viene scritto', async () => {
  const { api, configFile, defaultDataDir } = make();
  const cfg = await api.getConfig();
  assert.equal(cfg.dataDir, path.resolve(defaultDataDir));
  assert.equal(cfg.prefisso, 'cat');
  assert.equal(JSON.parse(fs.readFileSync(configFile, 'utf8')).dataDir, path.resolve(defaultDataDir));
  assert.ok((await api.list('strutture')).length > 0);
});

test('chooseDataDir: annullare non cambia nulla, scegliere cambia e si ricorda', async () => {
  const dest = path.join(tmp(), 'altra');
  let scelta = null;
  const { api, base, configFile, defaultDataDir, ui } = make({ chooseFolder: async () => scelta });
  const before = await api.getConfig();
  const annullato = await api.chooseDataDir();
  assert.equal(annullato.annullato, true);
  assert.equal(annullato.dataDir, before.dataDir);

  scelta = dest;
  const r = await api.chooseDataDir();
  assert.equal(r.annullato, false);
  assert.equal(r.dataDir, path.resolve(dest));
  assert.ok(fs.existsSync(path.join(dest, 'catalogo.json')));
  await api.save('strutture', null, { nome: 'Solo qui', html: '<p>x</p>' });
  assert.ok((await api.list('strutture')).some((x) => x.id === 'solo-qui'));
  assert.equal(fs.existsSync(path.join(defaultDataDir, 'strutture', 'solo-qui')), false);

  const again = createApi({ configFile, defaultDataDir: path.join(base, 'dati'), ui });
  assert.equal((await again.getConfig()).dataDir, path.resolve(dest));
});

test('se la cartella salvata non è usabile si torna a quella predefinita', async () => {
  const base = tmp();
  const configFile = path.join(base, 'config.json');
  const occupata = path.join(base, 'e-un-file');
  fs.writeFileSync(occupata, 'x');
  fs.writeFileSync(configFile, JSON.stringify({ dataDir: occupata }));
  const api = createApi({ configFile, defaultDataDir: path.join(base, 'dati'), ui: {} });
  assert.equal((await api.getConfig()).dataDir, path.resolve(path.join(base, 'dati')));
  fs.writeFileSync(configFile, 'non è json');
  const api2 = createApi({ configFile, defaultDataDir: path.join(base, 'dati2'), ui: {} });
  assert.equal((await api2.getConfig()).dataDir, path.resolve(path.join(base, 'dati2')));
});

test('esportazioni: annullare il dialogo non scrive niente', async () => {
  const { api, log } = make();
  assert.deepEqual(await api.exportAll(), { annullato: true });
  assert.deepEqual(await api.exportItem('strutture', { nome: 'x' }), { annullato: true });
  assert.deepEqual(await api.exportCss('root'), { annullato: true });
  assert.deepEqual(await api.exportTokens(), { annullato: true });
  assert.equal(log.folderDialogs.length, 2);
  assert.equal(log.saveDialogs.length, 2);
});

test('exportItem ed exportAll scrivono nella cartella scelta', async () => {
  const dest = tmp();
  const { api } = make({ chooseFolder: async () => dest });
  const one = await api.exportItem('componenti', { nome: 'Mio', html: '<p>a</p>', css: 'p{}', js: 'x()' });
  assert.equal(one.annullato, false);
  assert.ok(fs.existsSync(path.join(one.cartella, 'index.html')));
  assert.ok(fs.existsSync(path.join(one.cartella, 'script.js')));
  const all = await api.exportAll();
  assert.equal(all.annullato, false);
  assert.ok(fs.existsSync(path.join(all.cartella, 'css', 'root.css')));
  assert.ok(all.strutture > 0 && all.componenti > 0);
});

test('exportCss ed exportTokens usano la bozza e i nomi di file giusti', async () => {
  const base = tmp();
  const files = [path.join(base, 'a.css'), path.join(base, 'b.css'), path.join(base, 'c.json')];
  let i = 0;
  const { api, log } = make({
    chooseSaveFile: async (nome, filtri) => {
      log.saveDialogs.push({ nome, filtri });
      return files[i++];
    }
  });
  const bozza = { gruppi: [{ nome: 'g', variabili: [{ nome: '--cat-color-x', valore: '#abcdef', tipo: 'colore' }] }] };
  const r1 = await api.exportCss('root', bozza);
  assert.equal(r1.percorso, files[0]);
  assert.match(fs.readFileSync(files[0], 'utf8'), /--cat-color-x: #abcdef;/);
  await api.exportCss('classi', { gruppi: [{ nome: 'G', classi: [{ nome: 'a', css: '.a { x: y; }' }] }] });
  assert.match(fs.readFileSync(files[1], 'utf8'), /\.a \{ x: y; \}/);
  await api.exportTokens(bozza);
  assert.equal(JSON.parse(fs.readFileSync(files[2], 'utf8')).global.color.x.value, '#abcdef');
  assert.deepEqual(log.saveDialogs.map((d) => d.nome), ['root.css', 'cat-classi.css', 'figma-tokens.json']);
  assert.deepEqual(log.saveDialogs[0].filters || log.saveDialogs[0].filtri, [{ name: 'CSS', extensions: ['css'] }]);
  await assert.rejects(() => api.exportCss('root', { gruppi: [{ nome: 'g', variabili: [{ nome: 'no', valore: '1' }] }] }), /non valido/);
});

test('copy, openDataDir e setPrefix', async () => {
  const { api, log, defaultDataDir } = make();
  await api.copy('ciao');
  await api.copy(null);
  await api.copy(12);
  assert.deepEqual(log.copied, ['ciao', '', '12']);
  await api.openDataDir();
  assert.deepEqual(log.opened, [path.resolve(defaultDataDir)]);
  assert.equal((await api.setPrefix('ab')).prefisso, 'ab');
  await assert.rejects(() => api.setPrefix('A-b'), /Prefisso non valido/);
  assert.equal((await api.getConfig()).prefisso, 'ab');
});

test('classi, root e preset passano dall\'API come dagli archivi', async () => {
  const { api } = make();
  const classi = await api.getClassi();
  classi.gruppi[0].classi[0].descrizione = 'cambiata';
  assert.equal((await api.saveClassi(classi)).gruppi[0].classi[0].descrizione, 'cambiata');
  const rootData = await api.getRoot();
  rootData.gruppi[0].variabili[0].valore = '#010203';
  await api.saveRoot(rootData);
  assert.match((await api.getGlobalCss()).rootCss, /#010203/);
  const p = await api.savePreset('Prova', rootData);
  assert.deepEqual((await api.listPresets()).map((x) => x.id), [p.id]);
  assert.equal((await api.getPreset(p.id)).gruppi[0].variabili[0].valore, '#010203');
  await api.deletePreset(p.id);
  assert.deepEqual(await api.listPresets(), []);
});

test('backup, ripristino ed esporta PNG usano le finestre di scelta file', async () => {
  const out = path.join(tmp(), 'uscita');
  fs.mkdirSync(out, { recursive: true });
  const { api, log } = make({
    chooseSaveFile: async (nome) => path.join(out, nome),
    chooseFolder: async () => out
  });
  const b = await api.backup();
  assert.equal(b.annullato, false);
  assert.match(path.basename(b.percorso), /^cat-alog-backup-\d{4}-\d{2}-\d{2}-\d{4}\.zip$/);
  assert.ok(fs.statSync(b.percorso).size > 1000);

  assert.deepEqual(await api.restore(), { annullato: true });
  const png = await api.exportPng('strutture', { nome: 'Mia Pagina', html: '<p>x</p>', css: 'p{}' });
  assert.deepEqual(png.files.map((f) => path.basename(f)), ['mia-pagina-375.png', 'mia-pagina-768.png', 'mia-pagina-1280.png']);
  assert.equal(fs.readFileSync(png.files[0], 'utf8'), 'PNG375');
  assert.ok(log);
});
