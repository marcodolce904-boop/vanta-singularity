'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell, clipboard, session } = require('electron');
const { pathToFileURL } = require('url');
const path = require('path');
const { spawn } = require('child_process');
const { setupUpdates } = require('./lib/updates');
const { createApi, API_NAMES } = require('./lib/api');

let win = null;
let api = null;

function makeUi() {
  return {
    chooseFolder: async function (titolo) {
      const r = await dialog.showOpenDialog(win, {
        title: titolo,
        properties: ['openDirectory', 'createDirectory']
      });
      return r.canceled || !r.filePaths.length ? null : r.filePaths[0];
    },
    chooseSaveFile: async function (nome, filtri) {
      const r = await dialog.showSaveDialog(win, { defaultPath: nome, filters: filtri });
      return r.canceled || !r.filePath ? null : r.filePath;
    },
    /* Apre la cartella dell'elemento e i suoi file in un altro editor (di solito VS Code, comando «code»). */
    openInEditor: async function (dir, files, cmd) {
      return new Promise(function (resolve) {
        const win32 = process.platform === 'win32';
        let done = false;
        function finish(r) {
          if (!done) {
            done = true;
            resolve(r);
          }
        }
        try {
          const quote = function (x) { return win32 ? '"' + x + '"' : x; };
          const args = ['--reuse-window', quote(dir)].concat(files.map(quote));
          const child = spawn(cmd, args, { shell: win32, detached: true, stdio: 'ignore', windowsHide: true });
          child.on('error', function () {
            shell.openPath(dir).then(function () {
              finish({ aperto: false, ripiego: true, messaggio: 'Non trovo «' + cmd + '»: ho aperto la cartella. Per VS Code serve il comando «code» (VS Code: Ctrl+Maiusc+P, poi «Shell Command: Install \'code\' command in PATH»).' });
            });
          });
          child.on('spawn', function () {
            child.unref();
            finish({ aperto: true, ripiego: false, messaggio: '' });
          });
        } catch (e) {
          shell.openPath(dir).then(function () {
            finish({ aperto: false, ripiego: true, messaggio: 'Non riesco ad avviare «' + cmd + '»: ho aperto la cartella.' });
          });
        }
      });
    },
    chooseOpenFile: async function (titolo, filtri) {
      const r = await dialog.showOpenDialog(win, { title: titolo, properties: ['openFile'], filters: filtri });
      return r.canceled || !r.filePaths.length ? null : r.filePaths[0];
    },
    chooseOpenFiles: async function (titolo, filtri) {
      const r = await dialog.showOpenDialog(win, { title: titolo, properties: ['openFile', 'multiSelections'], filters: filtri });
      return r.canceled ? [] : r.filePaths;
    },
    /* Disegna la pagina in una finestra nascosta e ne fa una foto intera per ogni larghezza. */
    renderPng: async function (doc, widths) {
      const out = [];
      for (const width of widths) {
        const w = new BrowserWindow({
          show: false,
          width: width,
          height: 800,
          useContentSize: true,
          webPreferences: { offscreen: true, sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
        });
        try {
          w.webContents.setFrameRate(5);
          await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(doc));
          await new Promise(function (r) { setTimeout(r, 400); });
          const height = await w.webContents.executeJavaScript('Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))');
          w.setContentSize(width, Math.min(Math.max(height, 100), 6000));
          await new Promise(function (r) { setTimeout(r, 300); });
          const img = await w.webContents.capturePage();
          out.push({ width: width, png: img.toPNG() });
        } finally {
          w.destroy();
        }
      }
      return out;
    },
    copy: function (testo) {
      clipboard.writeText(testo);
    },
    openPath: async function (percorso) {
      const errore = await shell.openPath(percorso);
      if (errore) throw new Error('Non riesco ad aprire la cartella: ' + errore);
    }
  };
}

/* Cartella dei dati predefinita: Documenti/Catalogo MD (nome tenuto uguale a prima, così i tuoi dati restano dove sono).
   Su alcuni Linux «Documenti» coincide con la cartella personale: in quel caso si usa la sottocartella «Documents». */
function defaultDataDir() {
  const docs = app.getPath('documents');
  const home = app.getPath('home');
  const base = path.resolve(docs) === path.resolve(home) ? path.join(home, 'Documents') : docs;
  return path.join(base, 'Catalogo MD');
}

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'CAT-ALOG',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.webContents.setWindowOpenHandler(function () {
    return { action: 'deny' };
  });

  win.webContents.on('will-attach-webview', function (event) {
    event.preventDefault();
  });

  win.webContents.on('will-navigate', function (event) {
    event.preventDefault();
  });

  win.webContents.on('will-prevent-unload', function (event) {
    const scelta = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['Resta nell\'app', 'Esci senza salvare'],
      defaultId: 0,
      cancelId: 0,
      message: 'Ci sono modifiche non salvate.',
      detail: 'Se esci ora le perdi.'
    });
    if (scelta === 1) event.preventDefault();
  });

  win.on('closed', function () {
    win = null;
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

/* Una sola finestra alla volta: due copie dell'app potrebbero sovrascriversi i file a vicenda. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', function () {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(function () {
    api = createApi({
      configFile: path.join(app.getPath('userData'), 'config.json'),
      defaultDataDir: defaultDataDir(),
      ui: makeUi()
    });

    /* nessun permesso (fotocamera, posizione, notifiche…) a nessuna pagina */
    session.defaultSession.setPermissionRequestHandler(function (wc, permission, callback) { callback(false); });
    session.defaultSession.setPermissionCheckHandler(function () { return false; });

    ipcMain.handle('api', async function (event, name, args) {
      /* solo la schermata dell'app può chiamare le funzioni, non le anteprime né altre pagine */
      const url = event.senderFrame ? event.senderFrame.url : '';
      if (url !== pathToFileURL(path.join(__dirname, 'renderer', 'index.html')).href) throw new Error('Chiamata non permessa');
      if (API_NAMES.indexOf(name) === -1) throw new Error('Funzione non permessa: ' + name);
      return api[name].apply(null, Array.isArray(args) ? args : []);
    });

    createWindow();
    setupUpdates({ app, dialog, getWindow: function () { return win; } });

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
