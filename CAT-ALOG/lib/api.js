'use strict';

const fs = require('fs');
const path = require('path');
const { createStore } = require('./store');

const API_NAMES = [
  'getConfig',
  'chooseDataDir',
  'openDataDir',
  'setPrefix',
  'list',
  'get',
  'save',
  'duplicate',
  'remove',
  'getClassi',
  'saveClassi',
  'getRoot',
  'saveRoot',
  'getGlobalCss',
  'listPresets',
  'getPreset',
  'savePreset',
  'deletePreset',
  'exportItem',
  'exportCss',
  'exportTokens',
  'exportAll',
  'copy'
];

/*
 * ui = {
 *   chooseFolder(titolo) -> Promise<string|null>
 *   chooseSaveFile(nomeSuggerito, filtri) -> Promise<string|null>
 *   copy(testo)
 *   openPath(percorso) -> Promise
 * }
 */
function createApi(opzioni) {
  const configFile = opzioni.configFile;
  const defaultDataDir = opzioni.defaultDataDir;
  const ui = opzioni.ui;

  function readConfig() {
    try {
      const j = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      return j && typeof j === 'object' ? j : {};
    } catch (e) {
      return {};
    }
  }

  function writeConfig(cfg) {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  }

  function openStore(dir) {
    const s = createStore(dir);
    s.init();
    return s;
  }

  const config = readConfig();
  let store;
  try {
    store = openStore(typeof config.dataDir === 'string' && config.dataDir ? config.dataDir : defaultDataDir);
  } catch (e) {
    store = openStore(defaultDataDir);
  }
  config.dataDir = store.dataDir;
  writeConfig(config);

  function currentConfig() {
    return { dataDir: store.dataDir, prefisso: store.getSettings().prefisso };
  }

  const api = {
    getConfig: async function () {
      return currentConfig();
    },

    chooseDataDir: async function () {
      const dir = await ui.chooseFolder('Scegli la cartella dei dati del catalogo');
      if (!dir) return Object.assign({ annullato: true }, currentConfig());
      const nuovo = openStore(dir);
      store = nuovo;
      config.dataDir = nuovo.dataDir;
      writeConfig(config);
      return Object.assign({ annullato: false }, currentConfig());
    },

    openDataDir: async function () {
      await ui.openPath(store.dataDir);
      return { ok: true };
    },

    setPrefix: async function (prefisso) {
      store.setSettings({ prefisso: prefisso });
      return currentConfig();
    },

    list: async function (kind) { return store.list(kind); },
    get: async function (kind, id) { return store.get(kind, id); },
    save: async function (kind, id, data) { return store.save(kind, id, data); },
    duplicate: async function (kind, id) { return store.duplicate(kind, id); },
    remove: async function (kind, id) { return store.remove(kind, id); },

    getClassi: async function () { return store.getClassi(); },
    saveClassi: async function (data) { return store.saveClassi(data); },
    getRoot: async function () { return store.getRoot(); },
    saveRoot: async function (data) { return store.saveRoot(data); },
    getGlobalCss: async function () { return store.globalCss(); },

    listPresets: async function () { return store.listPresets(); },
    getPreset: async function (id) { return store.getPreset(id); },
    savePreset: async function (nome, data) { return store.savePreset(nome, data); },
    deletePreset: async function (id) { return store.deletePreset(id); },

    exportItem: async function (kind, data) {
      const dest = await ui.chooseFolder('Dove esporto la cartella?');
      if (!dest) return { annullato: true };
      return Object.assign({ annullato: false }, store.exportItem(kind, data, dest));
    },

    exportCss: async function (which, data) {
      const testo = store.cssText(which, data);
      const nome = which === 'root' ? 'root.css' : store.getSettings().prefisso + '-classi.css';
      const file = await ui.chooseSaveFile(nome, [{ name: 'CSS', extensions: ['css'] }]);
      if (!file) return { annullato: true };
      fs.writeFileSync(file, testo, 'utf8');
      return { annullato: false, percorso: file };
    },

    exportTokens: async function (data) {
      const testo = store.tokensText(data);
      const file = await ui.chooseSaveFile('figma-tokens.json', [{ name: 'JSON', extensions: ['json'] }]);
      if (!file) return { annullato: true };
      fs.writeFileSync(file, testo, 'utf8');
      return { annullato: false, percorso: file };
    },

    exportAll: async function () {
      const dest = await ui.chooseFolder('Dove esporto tutto il catalogo?');
      if (!dest) return { annullato: true };
      return Object.assign({ annullato: false }, store.exportAll(dest));
    },

    copy: async function (testo) {
      ui.copy(String(testo == null ? '' : testo));
      return { ok: true };
    }
  };

  return api;
}

module.exports = { createApi: createApi, API_NAMES: API_NAMES };
