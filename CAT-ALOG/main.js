'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron');
const path = require('path');
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

    ipcMain.handle('api', async function (event, name, args) {
      if (API_NAMES.indexOf(name) === -1) throw new Error('Funzione non permessa: ' + name);
      return api[name].apply(null, Array.isArray(args) ? args : []);
    });

    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
