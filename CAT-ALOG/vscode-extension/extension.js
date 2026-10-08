'use strict';

const vscode = require('vscode');
const path = require('path');
const core = require('./src/core');

let ctx = null; /* { store, S, dataDir, appPath } */
let treeProvider = null;
const panels = new Map(); /* "kind/id" -> pannello */

function cfg() {
  return vscode.workspace.getConfiguration('catAlog');
}

function connect(silent) {
  const dirs = (vscode.workspace.workspaceFolders || []).map(function (f) { return f.uri.fsPath; });
  const appPath = core.findAppPath(cfg().get('appPath'), dirs);
  if (!appPath) {
    if (!silent) vscode.window.showWarningMessage('CAT-ALOG: non trovo la cartella dell\'app. Apri la cartella CAT-ALOG oppure scegli "CAT-ALOG: Scegli la cartella dell\'app".');
    ctx = null;
    return null;
  }
  try {
    const o = core.openStore(appPath, cfg().get('dataDir'));
    ctx = { store: o.store, S: o.S, dataDir: o.dataDir, appPath: appPath };
  } catch (e) {
    ctx = null;
    if (!silent) vscode.window.showErrorMessage('CAT-ALOG: ' + e.message);
  }
  return ctx;
}

class Tree {
  constructor() {
    this._emitter = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._emitter.event;
  }

  refresh() {
    this._emitter.fire();
  }

  getTreeItem(node) {
    return node;
  }

  getChildren(node) {
    if (!ctx && !connect(true)) {
      return node ? [] : [Object.assign(new vscode.TreeItem('Non trovo l\'app: apri la cartella CAT-ALOG'), { command: { command: 'catAlog.chooseFolder', title: 'Scegli' } })];
    }
    if (!node) {
      return core.listTree(ctx.store).map(function (g) {
        const t = new vscode.TreeItem(g.label + ' (' + g.items.length + ')', vscode.TreeItemCollapsibleState.Collapsed);
        t.group = g;
        return t;
      });
    }
    return (node.group ? node.group.items : []).map(function (it) {
      const t = new vscode.TreeItem(it.nome, vscode.TreeItemCollapsibleState.None);
      t.description = it.descrizione;
      t.tooltip = it.descrizione || it.nome;
      t.contextValue = 'item';
      t.itemRef = { kind: node.group.kind, id: it.id };
      t.command = { command: 'catAlog.open', title: 'Apri', arguments: [t] };
      return t;
    });
  }
}

async function openItem(node) {
  if (!node || !node.itemRef || !connect(true)) return;
  const f = ctx.store.itemFiles(node.itemRef.kind, node.itemRef.id);
  let col = vscode.ViewColumn.One;
  for (const file of f.files) {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
    await vscode.window.showTextDocument(doc, { viewColumn: col, preview: false, preserveFocus: true });
    col = vscode.ViewColumn.Beside;
  }
}

function renderPanel(key) {
  const p = panels.get(key);
  if (!p || !ctx) return;
  try {
    p.panel.webview.html = core.webviewHtml(core.previewDoc(ctx.store, ctx.S, p.kind, p.id));
  } catch (e) {
    p.panel.webview.html = '<p style="font:14px sans-serif;padding:1rem">Elemento non disponibile: ' + core.escapeAttr(e.message) + '</p>';
  }
}

function openPreview(node) {
  if (!node || !node.itemRef || !connect(true)) return;
  const key = node.itemRef.kind + '/' + node.itemRef.id;
  if (panels.has(key)) {
    panels.get(key).panel.reveal(vscode.ViewColumn.Beside, true);
    return renderPanel(key);
  }
  const panel = vscode.window.createWebviewPanel('catAlogPreview', 'Anteprima: ' + node.label, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, { enableScripts: true });
  panels.set(key, { panel: panel, kind: node.itemRef.kind, id: node.itemRef.id });
  panel.onDidDispose(function () { panels.delete(key); });
  renderPanel(key);
}

async function saveCurrent() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) return vscode.window.showWarningMessage('CAT-ALOG: apri prima un file .html, .css o .js.');
  if (!connect(false)) return;
  let draft;
  try {
    const sel = ed.selection && !ed.selection.isEmpty ? ed.document.getText(ed.selection) : null;
    draft = core.draftFromFile(ed.document.uri.fsPath, sel != null ? sel : ed.document.getText());
  } catch (e) {
    return vscode.window.showWarningMessage('CAT-ALOG: ' + e.message);
  }
  const tipo = await vscode.window.showQuickPick(core.TIPI.map(function (t) { return { label: t.label, kind: t.kind }; }), { placeHolder: 'In quale gruppo lo salvo?' });
  if (!tipo) return;
  const nome = await vscode.window.showInputBox({ prompt: 'Nome dell\'elemento', value: draft.nome });
  if (!nome) return;
  try {
    const r = ctx.store.save(tipo.kind, null, { nome: nome, descrizione: '', tag: [], html: draft.html, css: draft.css, js: tipo.kind === 'strutture' ? '' : draft.js });
    treeProvider.refresh();
    vscode.window.showInformationMessage('CAT-ALOG: salvato «' + r.nome + '» in ' + tipo.label + '. Nell\'app premi «Ricarica da file» o riapri la scheda.');
  } catch (e) {
    vscode.window.showErrorMessage('CAT-ALOG: ' + e.message);
  }
}

async function chooseFolder() {
  const r = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Scegli la cartella CAT-ALOG (quella con lib/store.js)' });
  if (!r || !r[0]) return;
  await cfg().update('appPath', r[0].fsPath, vscode.ConfigurationTarget.Global);
  connect(false);
  treeProvider.refresh();
}

function activate(context) {
  treeProvider = new Tree();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('catAlogItems', treeProvider),
    vscode.commands.registerCommand('catAlog.refresh', function () { connect(true); treeProvider.refresh(); panels.forEach(function (_, k) { renderPanel(k); }); }),
    vscode.commands.registerCommand('catAlog.open', openItem),
    vscode.commands.registerCommand('catAlog.preview', openPreview),
    vscode.commands.registerCommand('catAlog.saveCurrent', saveCurrent),
    vscode.commands.registerCommand('catAlog.chooseFolder', chooseFolder)
  );

  /* dal vivo: quando cambia un file del catalogo (da VS Code, dall'app o da Claude) si aggiornano elenco e anteprime */
  if (connect(true)) {
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(ctx.dataDir, '**/{markup.html,style.css,script.js,meta.json}'));
    let timer = null;
    const soon = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        treeProvider.refresh();
        panels.forEach(function (_, k) { renderPanel(k); });
      }, 250);
    };
    watcher.onDidChange(soon);
    watcher.onDidCreate(soon);
    watcher.onDidDelete(soon);
    context.subscriptions.push(watcher);
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
