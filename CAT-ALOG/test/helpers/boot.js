'use strict';

/* Aiuti per provare le schermate vere (renderer/index.html) in un browser simulato (jsdom),
   collegate alla vera API dei file (lib/api.js) dentro una cartella temporanea. */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { createApi, API_NAMES } = require('../../lib/api');

function tmp() {
  return fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-ui-'));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitFor(fn, label, ms) {
  const end = Date.now() + (ms || 4000);
  for (;;) {
    const v = fn();
    if (v) return v;
    if (Date.now() > end) throw new Error('Tempo scaduto: ' + (label || String(fn)));
    await sleep(10);
  }
}

async function boot() {
  const base = tmp();
  const state = { clip: [], opened: [], folder: null, saveFile: null, files: [], errors: [], calls: [] };
  const ui = {
    chooseFolder: async () => state.folder,
    chooseSaveFile: async () => state.saveFile,
    chooseOpenFiles: async () => state.files,
    openInEditor: async (dir, files, cmd) => { state.editor = { dir, files, cmd }; return { aperto: true, ripiego: false, messaggio: '' }; },
    chooseOpenFile: async () => state.files[0] || null,
    copy: (t) => state.clip.push(t),
    openPath: async (p) => state.opened.push(p)
  };
  const real = createApi({
    configFile: path.join(base, 'cfg', 'config.json'),
    defaultDataDir: path.join(base, 'dati'),
    ui
  });

  /* Come in Electron: argomenti e risultati attraversano un "tubo" che li copia, e gli errori arrivano con il prefisso di Electron. */
  const api = {};
  API_NAMES.forEach((name) => {
    api[name] = async (...args) => {
      state.calls.push(name);
      let out;
      try {
        out = await real[name](...JSON.parse(JSON.stringify(args)));
      } catch (e) {
        throw new Error("Error invoking remote method 'api': Error: " + e.message);
      }
      return out === undefined ? undefined : JSON.parse(JSON.stringify(out));
    };
  });

  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => state.errors.push(String(e.message) + (e.detail ? ' | ' + e.detail : '')));
  vc.on('error', (...a) => state.errors.push(a.join(' ')));

  const dom = await JSDOM.fromFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.api = api;
    }
  });
  const w = dom.window;
  if (w.document.readyState !== 'complete') await new Promise((res) => w.addEventListener('load', res));
  await w.CatalogoApp.ready;

  const d = w.document;
  const H = {
    w,
    d,
    dom,
    state,
    real,
    base,
    dataDir: path.join(base, 'dati'),
    api,
    sleep,
    waitFor,
    tab: (id) => d.getElementById('panel-' + id),
    click(el) {
      if (!el) throw new Error('click su un elemento che non esiste');
      el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    },
    type(el, value) {
      if (!el) throw new Error('scrittura in un elemento che non esiste');
      el.value = value;
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
    },
    key(el, key, extra) {
      el.dispatchEvent(new w.KeyboardEvent('keydown', Object.assign({ key, bubbles: true, cancelable: true }, extra || {})));
    },
    /* primo elemento con questo selettore: prima il testo identico, poi quello che comincia così */
    find(root, selector, text) {
      const els = Array.from(root.querySelectorAll(selector));
      return els.find((e) => e.textContent.trim() === text) || els.find((e) => e.textContent.trim().startsWith(text));
    },
    button(root, text) {
      return H.find(root, 'button', text);
    },
    async dialog() {
      return waitFor(() => d.querySelector('dialog.modal'), 'finestra di dialogo');
    },
    async noDialog() {
      return waitFor(() => !d.querySelector('dialog.modal'), 'finestra chiusa');
    },
    async answer(buttonText) {
      const dlg = await H.dialog();
      H.click(H.button(dlg, buttonText));
      await H.noDialog();
    },
    async fillDialog(values, submitText) {
      const dlg = await H.dialog();
      Object.keys(values).forEach((name) => H.type(dlg.querySelector('[name="' + name + '"]'), values[name]));
      H.click(H.button(dlg, submitText));
    },
    toast: () => {
      const t = d.getElementById('toast');
      return t.hidden ? '' : t.textContent;
    },
    async showTab(id) {
      H.click(d.getElementById('tab-' + id));
      await waitFor(() => d.getElementById('tab-' + id).getAttribute('aria-selected') === 'true', 'scheda ' + id);
      await H.settle();
    },
    /* aspetta che finiscano le chiamate e i ritardi (anteprima, CSS generato) */
    async settle() {
      await sleep(350);
    },
    close() {
      w.close();
    }
  };
  return H;
}

module.exports = { boot, tmp, sleep, waitFor };
