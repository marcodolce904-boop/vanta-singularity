#!/usr/bin/env node
'use strict';

/*
 * Connettore MCP di CAT-ALOG: permette a Claude (Claude Code o Claude Desktop) di leggere e scrivere il catalogo
 * usando le STESSE regole dell'app (nomi, versioni, cestino). Parla solo in locale (stdio), non apre porte di rete.
 * L'app può restare aperta: vede le modifiche con «Ricarica da file».
 *
 * Avvio di prova:  node mcp/server.js     (la cartella dati si sceglie con CAT_DATA_DIR, altrimenti quella dell'app)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { createStore } = require('../lib/store');
const { resolveDataDir } = require('../lib/datadir');
const S = require('../lib/shared');

const KINDS = ['strutture', 'componenti', 'animazioni', 'interazioni'];
const MAX_TESTO = 1024 * 1024;
const kindSchema = z.enum(KINDS).describe('Tipo: strutture, componenti, animazioni o interazioni');
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,80}$/).describe('Identificatore (come in lista_elementi)');
const testo = z.string().max(MAX_TESTO);

function apri(dataDir) {
  if (!fs.existsSync(dataDir) || !fs.statSync(dataDir).isDirectory()) {
    throw new Error('Cartella dati non trovata: ' + dataDir + '. Apri una volta CAT-ALOG, oppure imposta CAT_DATA_DIR.');
  }
  const store = createStore(dataDir);
  store.init();
  return store;
}

function ok(valore) {
  return { content: [{ type: 'text', text: typeof valore === 'string' ? valore : JSON.stringify(valore, null, 2) }] };
}

function ko(e) {
  return { isError: true, content: [{ type: 'text', text: 'Errore: ' + (e && e.message ? e.message : String(e)) }] };
}

function safe(fn) {
  return async function (args) {
    try {
      return ok(await fn(args || {}));
    } catch (e) {
      return ko(e);
    }
  };
}

function creaServer(store) {
  const server = new McpServer({ name: 'cat-alog', version: '1.0.0' });

  server.registerTool('catalogo_info', {
    title: 'Informazioni sul catalogo',
    description: 'Mostra la cartella dati, il prefisso delle classi e quanti elementi ci sono per tipo.',
    inputSchema: {}
  }, safe(function () {
    const conteggi = {};
    KINDS.forEach(function (k) { conteggi[k] = store.list(k).length; });
    return { cartellaDati: store.dataDir, prefisso: store.getSettings().prefisso, elementi: conteggi, classiGruppi: store.getClassi().gruppi.length };
  }));

  server.registerTool('lista_elementi', {
    title: 'Elenco elementi',
    description: 'Elenca gli elementi di un tipo (id, nome, descrizione, tag). Con "cerca" filtra per nome, descrizione e tag.',
    inputSchema: { kind: kindSchema, cerca: z.string().max(100).optional() }
  }, safe(function (a) {
    const q = S.str(a.cerca).toLowerCase().trim();
    return store.list(a.kind).filter(function (x) {
      return !q || (x.nome + ' ' + x.descrizione + ' ' + x.tag.join(' ')).toLowerCase().indexOf(q) !== -1;
    }).map(function (x) { return { id: x.id, nome: x.nome, descrizione: x.descrizione, tag: x.tag, preferito: x.preferito }; });
  }));

  server.registerTool('leggi_elemento', {
    title: 'Leggi un elemento',
    description: 'Restituisce HTML, CSS e JavaScript di un elemento, con i suoi dati.',
    inputSchema: { kind: kindSchema, id: idSchema }
  }, safe(function (a) { return store.get(a.kind, a.id); }));

  server.registerTool('salva_elemento', {
    title: 'Crea o aggiorna un elemento',
    description: 'Senza "id" crea un elemento nuovo; con "id" aggiorna quello esistente (la versione precedente resta in «Versioni…» nell\'app). Le strutture non hanno JavaScript.',
    inputSchema: {
      kind: kindSchema,
      id: idSchema.optional(),
      nome: z.string().min(1).max(120),
      descrizione: z.string().max(500).optional(),
      tag: z.array(z.string().max(40)).max(20).optional(),
      html: testo.optional(),
      css: testo.optional(),
      js: testo.optional()
    }
  }, safe(function (a) {
    const r = store.save(a.kind, a.id == null ? null : a.id, { nome: a.nome, descrizione: a.descrizione || '', tag: a.tag || [], html: a.html || '', css: a.css || '', js: a.js || '' });
    return { id: r.id, nome: r.nome, creatoNuovo: a.id == null };
  }));

  server.registerTool('elimina_elemento', {
    title: 'Metti un elemento nel cestino',
    description: 'Sposta l\'elemento nel cestino del catalogo (recuperabile, non viene cancellato davvero).',
    inputSchema: { kind: kindSchema, id: idSchema }
  }, safe(function (a) { return store.remove(a.kind, a.id); }));

  server.registerTool('controlla_qualita', {
    title: 'Controllo qualità',
    description: 'Esegue il controllo qualità dell\'app (accessibilità, struttura, stile) su un elemento salvato.',
    inputSchema: { kind: kindSchema, id: idSchema }
  }, safe(function (a) {
    const it = store.get(a.kind, a.id);
    let parse = null;
    try {
      const { JSDOM } = require('jsdom');
      parse = function (html) { return new JSDOM('<!doctype html><body>' + html).window.document; };
    } catch (e) { /* senza jsdom il controllo salta i test sul markup */ }
    return S.qualityCheck({ html: it.html, css: it.css, js: it.js }, parse);
  }));

  server.registerTool('crea_anteprima', {
    title: 'Crea una pagina di anteprima',
    description: 'Scrive un file HTML con l\'elemento già completo di variabili root e classi, da aprire nel browser o con Live Server. Restituisce il percorso del file.',
    inputSchema: { kind: kindSchema, id: idSchema }
  }, safe(function (a) {
    const it = store.get(a.kind, a.id);
    const g = store.globalCss();
    const doc = S.buildPreviewDoc({ html: it.html, css: it.css, js: it.js, rootCss: g.rootCss, classiCss: g.classiCss });
    const dir = path.join(os.tmpdir(), 'cat-alog-anteprima');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, a.kind + '-' + a.id + '.html');
    fs.writeFileSync(file, doc, 'utf8');
    return { file: file };
  }));

  server.registerTool('leggi_root', {
    title: 'Leggi le variabili :root',
    description: 'Restituisce i gruppi di variabili CSS :root del catalogo.',
    inputSchema: {}
  }, safe(function () { return store.getRoot(); }));

  server.registerTool('imposta_variabile_root', {
    title: 'Cambia una variabile :root',
    description: 'Cambia il valore di una variabile :root esistente (per esempio --cat-color-primary), oppure la aggiunge al gruppo indicato.',
    inputSchema: {
      nome: z.string().regex(/^--[a-z0-9-]{1,60}$/),
      valore: z.string().min(1).max(200),
      gruppo: z.string().max(60).optional()
    }
  }, safe(function (a) {
    const data = store.getRoot();
    let trovata = false;
    data.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) { if (v.nome === a.nome) { v.valore = a.valore; trovata = true; } });
    });
    if (!trovata) {
      const nome = a.gruppo || 'Altre';
      let g = data.gruppi.filter(function (x) { return x.nome === nome; })[0];
      if (!g) { g = { nome: nome, variabili: [] }; data.gruppi.push(g); }
      g.variabili.push({ nome: a.nome, valore: a.valore });
    }
    store.saveRoot(data);
    return { aggiornata: trovata, aggiunta: !trovata, nome: a.nome, valore: a.valore };
  }));

  server.registerTool('lista_classi', {
    title: 'Elenco classi',
    description: 'Elenca i gruppi di classi CSS del catalogo con i nomi delle classi (senza il codice).',
    inputSchema: { cerca: z.string().max(100).optional() }
  }, safe(function (a) {
    const q = S.str(a.cerca).toLowerCase().trim();
    return store.getClassi().gruppi.map(function (g) {
      return { gruppo: g.nome, classi: g.classi.map(function (c) { return c.nome; }).filter(function (n) { return !q || n.toLowerCase().indexOf(q) !== -1; }) };
    }).filter(function (g) { return g.classi.length; });
  }));

  return server;
}

async function main() {
  const dataDir = resolveDataDir();
  const store = apri(dataDir);
  const server = creaServer(store);
  await server.connect(new StdioServerTransport());
  process.stderr.write('CAT-ALOG connettore pronto. Dati: ' + dataDir + '\n');
}

if (require.main === module) {
  main().catch(function (e) {
    process.stderr.write('CAT-ALOG connettore: ' + (e && e.message ? e.message : e) + '\n');
    process.exit(1);
  });
}

module.exports = { creaServer, apri };
