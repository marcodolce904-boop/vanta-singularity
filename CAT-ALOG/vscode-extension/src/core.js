'use strict';

/* Logica dell'estensione senza dipendere da VS Code (così si prova con i test). */

const fs = require('fs');
const path = require('path');

const TIPI = [
  { kind: 'strutture', label: 'Strutture' },
  { kind: 'componenti', label: 'Componenti' },
  { kind: 'animazioni', label: 'Animazioni' },
  { kind: 'interazioni', label: 'Interazioni' }
];

function isAppFolder(dir) {
  try {
    return fs.existsSync(path.join(dir, 'lib', 'store.js')) && fs.existsSync(path.join(dir, 'lib', 'shared.js'));
  } catch (e) {
    return false;
  }
}

/* Trova la cartella dell'app: impostazione, poi le cartelle aperte in VS Code (anche una sopra). */
function findAppPath(configured, workspaceDirs) {
  const candidati = [];
  if (configured) candidati.push(configured);
  (workspaceDirs || []).forEach(function (d) {
    candidati.push(d, path.join(d, 'CAT-ALOG'), path.dirname(d));
  });
  for (const c of candidati) if (isAppFolder(c)) return path.resolve(c);
  return null;
}

function loadLib(appPath) {
  if (!appPath || !isAppFolder(appPath)) throw new Error('Cartella dell\'app non trovata');
  return {
    createStore: require(path.join(appPath, 'lib', 'store.js')).createStore,
    S: require(path.join(appPath, 'lib', 'shared.js')),
    resolveDataDir: require(path.join(appPath, 'lib', 'datadir.js')).resolveDataDir
  };
}

function openStore(appPath, dataDirSetting) {
  const lib = loadLib(appPath);
  const dir = dataDirSetting && dataDirSetting.trim() ? path.resolve(dataDirSetting.trim()) : lib.resolveDataDir();
  if (!fs.existsSync(dir)) throw new Error('Cartella dati non trovata: ' + dir + '. Apri una volta CAT-ALOG oppure imposta catAlog.dataDir.');
  const store = lib.createStore(dir);
  store.init();
  return { store: store, S: lib.S, dataDir: dir };
}

function listTree(store) {
  return TIPI.map(function (t) {
    return { kind: t.kind, label: t.label, items: store.list(t.kind).map(function (x) { return { id: x.id, nome: x.nome, descrizione: x.descrizione }; }) };
  });
}

/* Dal nome del file al campo del catalogo. */
function fieldFor(fileName) {
  const ext = path.extname(String(fileName)).toLowerCase();
  if (ext === '.html' || ext === '.htm') return 'html';
  if (ext === '.css') return 'css';
  if (ext === '.js' || ext === '.mjs') return 'js';
  return null;
}

/* Legge il file aperto e i suoi «fratelli» con lo stesso nome (pagina.html + pagina.css + pagina.js, o markup/style/script). */
function draftFromFile(file, textOverride) {
  const field = fieldFor(file);
  if (!field) throw new Error('Apri un file .html, .css o .js');
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const gruppi = [[base, base, base], ['markup', 'style', 'script'], ['index', 'style', 'script'], ['index', 'index', 'index']];
  const draft = { html: '', css: '', js: '', nome: base };
  draft[field] = textOverride != null ? textOverride : fs.readFileSync(file, 'utf8');
  let famiglia = gruppi[0];
  gruppi.forEach(function (g) {
    const mio = { html: g[0], css: g[1], js: g[2] }[field];
    if (mio === base) famiglia = g;
  });
  [['html', famiglia[0], '.html'], ['css', famiglia[1], '.css'], ['js', famiglia[2], '.js']].forEach(function (x) {
    if (x[0] === field) return;
    const f = path.join(dir, x[1] + x[2]);
    if (fs.existsSync(f) && fs.statSync(f).isFile() && fs.statSync(f).size < 1024 * 1024) draft[x[0]] = fs.readFileSync(f, 'utf8');
  });
  return draft;
}

function previewDoc(store, S, kind, id) {
  const it = store.get(kind, id);
  const g = store.globalCss();
  return S.addPreviewShim(S.buildPreviewDoc({ html: it.html, css: it.css, js: it.js, rootCss: g.rootCss, classiCss: g.classiCss }));
}

function escapeAttr(t) {
  return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Pagina per il pannello di anteprima di VS Code: un iframe isolato con la pagina dentro. */
function webviewHtml(doc) {
  return '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#fff}iframe{border:0;width:100%;height:100vh;display:block}</style></head><body>' +
    '<iframe sandbox="allow-scripts allow-forms allow-modals" srcdoc="' + escapeAttr(doc) + '"></iframe></body></html>';
}

module.exports = { TIPI, isAppFolder, findAppPath, loadLib, openStore, listTree, fieldFor, draftFromFile, previewDoc, escapeAttr, webviewHtml };
