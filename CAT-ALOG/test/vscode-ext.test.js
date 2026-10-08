'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const APP = path.join(__dirname, '..');
const EXT = path.join(APP, 'vscode-extension');
const core = require(path.join(EXT, 'src', 'core.js'));

function tmpData() {
  const d = fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-vsc-'));
  fs.mkdirSync(path.join(d, 'dati'));
  return d;
}

test('estensione: trova l\'app, sceglie il tipo di file e legge i file «fratelli»', () => {
  assert.equal(core.findAppPath('', [path.join(APP, 'lib')]), APP, 'anche da una sottocartella');
  assert.equal(core.findAppPath('', [path.dirname(APP)]), APP, 'anche dalla cartella sopra');
  assert.equal(core.findAppPath(APP, []), APP);
  assert.equal(core.findAppPath('', ['/non/esiste']), null);
  assert.equal(core.fieldFor('a/b.HTML'), 'html');
  assert.equal(core.fieldFor('x.mjs'), 'js');
  assert.equal(core.fieldFor('x.png'), null);

  const d = tmpData();
  fs.writeFileSync(path.join(d, 'scheda.html'), '<p>ciao</p>');
  fs.writeFileSync(path.join(d, 'scheda.css'), 'p{color:red}');
  fs.writeFileSync(path.join(d, 'scheda.js'), 'var a=1');
  assert.deepEqual(core.draftFromFile(path.join(d, 'scheda.html')), { html: '<p>ciao</p>', css: 'p{color:red}', js: 'var a=1', nome: 'scheda' });
  assert.equal(core.draftFromFile(path.join(d, 'scheda.css'), 'p{color:blue}').css, 'p{color:blue}', 'usa la selezione se c\'è');
  fs.writeFileSync(path.join(d, 'markup.html'), '<b>m</b>');
  fs.writeFileSync(path.join(d, 'style.css'), 'b{}');
  assert.equal(core.draftFromFile(path.join(d, 'markup.html')).css, 'b{}', 'markup + style');
  assert.throws(() => core.draftFromFile(path.join(d, 'x.png')), /html, \.css o \.js/);
});

test('estensione: elenco, anteprima e pagina del pannello usano i dati veri', () => {
  const d = tmpData();
  const o = core.openStore(APP, path.join(d, 'dati'));
  const tree = core.listTree(o.store);
  assert.deepEqual(tree.map((g) => g.kind), ['strutture', 'componenti', 'animazioni', 'interazioni']);
  assert.ok(tree[1].items.length >= 90);
  const it = o.store.save('componenti', null, { nome: 'Prova VS', html: '<a href="/">Casa</a><script>1</script>', css: '.x{}', js: 'var q=1;' });
  const doc = core.previewDoc(o.store, o.S, 'componenti', it.id);
  assert.match(doc, /<base href="about:srcdoc">/);
  assert.match(doc, /Casa/);
  const page = core.webviewHtml(doc);
  assert.match(page, /sandbox="allow-scripts allow-forms allow-modals"/);
  assert.ok(!/srcdoc="[^"]*"[^>]*"/.test(page.replace(/&quot;/g, '')), 'virgolette dentro srcdoc ben protette');
  assert.ok(o.store.itemFiles('componenti', it.id).files.every((f) => fs.existsSync(f)));
  assert.throws(() => core.openStore(APP, path.join(d, 'manca')), /Cartella dati non trovata/);
});

test('estensione: extension.js si attiva con VS Code finto e registra comandi, elenco e osservatore', async () => {
  const d = tmpData();
  const reg = { commands: {}, provider: null, watchers: 0, opened: [], shown: [], infos: [] };
  class TreeItem { constructor(label, state) { this.label = label; this.collapsibleState = state; } }
  class EventEmitter { constructor() { this.event = () => ({ dispose() {} }); } fire() { reg.fired = (reg.fired || 0) + 1; } }
  const fake = {
    TreeItem, EventEmitter,
    TreeItemCollapsibleState: { None: 0, Collapsed: 1 },
    ViewColumn: { One: 1, Beside: -2 },
    ConfigurationTarget: { Global: 1 },
    RelativePattern: class { constructor(base, p) { this.base = base; this.pattern = p; } },
    Uri: { file: (p) => ({ fsPath: p }) },
    commands: { registerCommand: (n, fn) => { reg.commands[n] = fn; return { dispose() {} }; } },
    window: {
      registerTreeDataProvider: (id, p) => { reg.provider = p; return { dispose() {} }; },
      showTextDocument: async (doc) => { reg.shown.push(doc.uri.fsPath); },
      showInformationMessage: (m) => reg.infos.push(m),
      showWarningMessage() {}, showErrorMessage() {},
      activeTextEditor: null,
      createWebviewPanel: () => ({ webview: {}, onDidDispose() {}, reveal() {} })
    },
    workspace: {
      workspaceFolders: [{ uri: { fsPath: APP } }],
      getConfiguration: () => ({ get: (k) => (k === 'dataDir' ? path.join(d, 'dati') : ''), update: async () => {} }),
      openTextDocument: async (u) => ({ uri: u }),
      createFileSystemWatcher: () => { reg.watchers += 1; return { onDidChange() {}, onDidCreate() {}, onDidDelete() {}, dispose() {} }; }
    }
  };
  const orig = Module._load;
  Module._load = function (request, parent, isMain) {
    return request === 'vscode' ? fake : orig.call(this, request, parent, isMain);
  };
  try {
    const ext = require(path.join(EXT, 'extension.js'));
    ext.activate({ subscriptions: [] });
    assert.deepEqual(Object.keys(reg.commands).sort(), ['catAlog.chooseFolder', 'catAlog.open', 'catAlog.preview', 'catAlog.refresh', 'catAlog.saveCurrent']);
    assert.equal(reg.watchers, 1);
    const gruppi = reg.provider.getChildren();
    assert.equal(gruppi.length, 4);
    assert.match(gruppi[1].label, /^Componenti \(\d+\)$/);
    const voci = reg.provider.getChildren(gruppi[1]);
    assert.ok(voci.length >= 90 && voci[0].itemRef.kind === 'componenti');
    await reg.commands['catAlog.open'](voci[0]);
    assert.deepEqual(reg.shown.map((f) => path.basename(f)), ['markup.html', 'style.css', 'script.js']);
  } finally {
    Module._load = orig;
  }
});
