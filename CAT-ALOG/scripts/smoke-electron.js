'use strict';

/*
 * Prova dell'app VERA (solo per sviluppo, serve Linux con xvfb):
 * apre Electron con la finestra vera, la pilota con il protocollo di debug di Chromium
 * e controlla che le schermate funzionino davvero dentro Electron (finestra protetta, preload, IPC, file veri).
 *
 *   xvfb-run -a -s "-screen 0 1440x900x24" node scripts/smoke-electron.js
 *
 * Variabili: SMOKE_OUT = cartella dove salvare le immagini della finestra (default: la cartella temporanea).
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const electronPath = require(path.join(root, 'node_modules', 'electron'));
const { API_NAMES } = require(path.join(root, 'lib', 'api'));
const port = 9300 + Math.floor(Math.random() * 500);
const home = fs.mkdtempSync(path.join(process.env.TEST_TMPDIR || os.tmpdir(), 'catalogo-smoke-'));
const outDir = process.env.SMOKE_OUT || home;
const dataDir = path.join(home, 'Documents', 'Catalogo MD');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
function check(nome, ok, dettaglio) {
  results.push({ nome, ok: !!ok });
  console.log((ok ? 'OK    ' : 'ERRORE') + ' ' + nome + (ok ? '' : '  ->  ' + dettaglio));
}

async function findPage(p) {
  for (let i = 0; i < 150; i += 1) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + p + '/json')).json();
      const page = list.find((t) => t.type === 'page' && /Catalogo MD/.test(t.title));
      if (page) return page;
    } catch (e) {
      /* l'app non è ancora pronta */
    }
    await sleep(200);
  }
  throw new Error('La finestra non si è aperta entro 30 secondi');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) p.rej(new Error(m.error.message));
        else p.res(m.result);
      }
    };
    ws.onerror = () => reject(new Error('Collegamento al debug non riuscito'));
    ws.onopen = () =>
      resolve({
        send(method, params) {
          return new Promise((res, rej) => {
            id += 1;
            pending.set(id, { res, rej });
            ws.send(JSON.stringify({ id, method, params }));
          });
        }
      });
  });
}

const childEnv = Object.assign({}, process.env, { HOME: home, XDG_CONFIG_HOME: path.join(home, 'cfg') });
const electronArgs = (p) => ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-port=' + p, '--user-data-dir=' + path.join(home, 'ud'), root];

async function launch(offset) {
  const p = port + (offset || 0);
  const logs = [];
  const state = { exited: false };
  const child = spawn(electronPath, electronArgs(p), { env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (b) => logs.push(String(b)));
  child.stderr.on('data', (b) => logs.push(String(b)));
  child.on('exit', () => {
    state.exited = true;
  });
  const page = await findPage(p);
  const cdp = await connect(page.webSocketDebuggerUrl);
  const ev = async (expression, userGesture) => {
    const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: !!userGesture });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error('Errore nella pagina: ' + ((d.exception && d.exception.description) || d.text));
    }
    return r.result.value;
  };
  const until = async (expression, nome, ms) => {
    const end = Date.now() + (ms || 8000);
    for (;;) {
      if (await ev(expression)) return true;
      if (Date.now() > end) throw new Error('Tempo scaduto: ' + nome);
      await sleep(100);
    }
  };
  const stop = async () => {
    child.kill();
    await sleep(300);
    if (!state.exited) child.kill('SIGKILL');
  };
  return { child, cdp, ev, until, logs, state, stop };
}

async function main() {
  const app = await launch();
  const { cdp, ev, until, logs } = app;
  try {
    const shot = async (nome) => {
      const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const file = path.join(outDir, 'finestra-' + nome + '.png');
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
      return file;
    };

    check('la pagina non ha accesso a Node', (await ev("[typeof window.require, typeof window.process, typeof window.module].join('|')")) === 'undefined|undefined|undefined', 'la pagina vede Node');
    check('window.api ha esattamente le funzioni previste', (await ev('Object.keys(window.api).join(",")')) === API_NAMES.join(','), 'lista diversa');
    check('l\'app parte', (await ev("window.CatalogoApp.ready.then(() => 'ok')")) === 'ok', 'ready non risolto');
    check('quattro schede', (await ev("document.querySelectorAll('#tabs [role=tab]').length")) === 4, 'schede diverse da 4');
    const cfgDir = await ev('window.api.getConfig().then((c) => c.dataDir)');
    check('cartella dei dati in Documenti/Catalogo MD', cfgDir === dataDir, 'trovata: ' + cfgDir + ' invece di ' + dataDir);
    check('i contenuti di esempio sono su disco', fs.existsSync(path.join(dataDir, 'catalogo.json')) && fs.existsSync(path.join(dataDir, 'strutture')), 'file mancanti');
    check('Strutture mostra l\'elenco', (await ev("document.querySelectorAll('#panel-strutture .list-btn').length")) >= 6, 'elenco vuoto');
    const isolato = "(() => { const f = document.querySelector('#panel-strutture iframe'); return f.getAttribute('sandbox') === 'allow-scripts' && f.contentDocument === null; })()";
    let anteprimaIsolata = false;
    for (let i = 0; i < 50 && !anteprimaIsolata; i += 1) {
      anteprimaIsolata = (await ev(isolato)) === true;
      if (!anteprimaIsolata) await sleep(100);
    }
    check('l\'anteprima è in un riquadro isolato', anteprimaIsolata, 'riquadro non isolato: ' + (await ev("(() => { const f = document.querySelector('#panel-strutture iframe'); return JSON.stringify({ sandbox: f.getAttribute('sandbox'), contentDocumentNull: f.contentDocument === null, src: !!f.srcdoc }); })()")));
    await sleep(500);
    await shot('strutture');

    // salvataggio con clic veri sui pulsanti
    await ev(`(() => {
      const p = document.getElementById('panel-strutture');
      const i = p.querySelector('.col-editor input[type=text]');
      i.value = 'Prova da Electron';
      i.dispatchEvent(new Event('input', { bubbles: true }));
      Array.from(p.querySelectorAll('button')).find((b) => b.textContent === 'Salva').click();
    })()`);
    await until("document.querySelector('#panel-strutture .col-editor .status').textContent === 'Tutto salvato'", 'salvataggio');
    const metas = fs.readdirSync(path.join(dataDir, 'strutture')).map((d) => JSON.parse(fs.readFileSync(path.join(dataDir, 'strutture', d, 'meta.json'), 'utf8')).nome);
    check('Salva scrive il file vero', metas.includes('Prova da Electron'), 'nome non trovato su disco');

    const tab = async (id) => {
      await ev("document.getElementById('tab-" + id + "').click()");
      await until("document.getElementById('tab-" + id + "').getAttribute('aria-selected') === 'true' && !document.getElementById('panel-" + id + "').hidden", 'scheda ' + id);
      await sleep(600);
    };
    await tab('componenti');
    check('Componenti mostra l\'elenco', (await ev("document.querySelectorAll('#panel-componenti .list-btn').length")) >= 2, 'elenco vuoto');
    await shot('componenti');
    await tab('classi');
    check('Classi mostra gruppi e righe', (await ev("document.querySelectorAll('#panel-classi .col-list .list-btn').length")) >= 5 && (await ev("document.querySelectorAll('#panel-classi .rows > li.row').length")) > 3, 'gruppi o righe mancanti');
    await shot('classi');
    await tab('root');
    check('Root mostra le variabili e il CSS', (await ev("document.querySelectorAll('#panel-root .var-row').length")) > 20 && (await ev("document.querySelector('#panel-root pre.css-out').textContent")).includes(':root {'), 'variabili o CSS mancanti');
    await shot('root');
    // finestra stretta (minimo 900 px): niente scorrimento orizzontale e schermate leggibili
    for (const larghezza of [1360, 920]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: larghezza, height: larghezza === 920 ? 640 : 860, deviceScaleFactor: 1, mobile: false });
      await sleep(500);
      for (const id of ['strutture', 'componenti', 'classi', 'root']) {
        await tab(id);
        const largo = await ev('document.documentElement.scrollWidth - window.innerWidth');
        check('nessuno scorrimento orizzontale a ' + larghezza + ' px in ' + id, largo <= 0, 'la pagina è più larga di ' + largo + ' px');
        await shot('larghezza-' + larghezza + '-' + id);
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride');
    check('Copia negli appunti passa dal programma principale', (await ev('window.api.copy("prova").then((r) => r.ok)')) === true, 'copia fallita');
    check('un errore dell\'API arriva leggibile', (await ev("window.api.get('strutture', '../x').then(() => 'nessun errore', (e) => e.message)")).includes('Identificatore non valido'), 'errore non arrivato');
    check('nessun errore nella console della finestra', !logs.join('').match(/Uncaught|TypeError|ReferenceError/), logs.join('').slice(0, 400));
  } finally {
    await app.stop();
  }

  console.log('Immagini della finestra in: ' + outDir);
}

async function chiusura() {
  // senza modifiche: chiudere la finestra chiude l'app
  let app = await launch(1);
  try {
    await app.ev("window.CatalogoApp.ready.then(() => 'ok')");
    await sleep(500);
    app.cdp.send('Page.close').catch(() => {});
    for (let i = 0; i < 60 && !app.state.exited; i += 1) await sleep(100);
    check('senza modifiche, chiudere la finestra chiude l\'app', app.state.exited, 'l\'app è rimasta aperta');
  } finally {
    await app.stop();
  }

  // con modifiche non salvate: la finestra non si chiude da sola (l'app chiede cosa fare)
  app = await launch(2);
  try {
    await app.ev("window.CatalogoApp.ready.then(() => 'ok')");
    await app.ev(`(() => {
      const i = document.querySelector('#panel-strutture .col-editor input[type=text]');
      i.focus();
      i.value = 'Modifica non salvata';
      i.dispatchEvent(new Event('input', { bubbles: true }));
      return document.querySelector('#panel-strutture .col-editor .status').textContent;
    })()`, true);
    await sleep(300);
    app.cdp.send('Page.close').catch(() => {});
    await sleep(3000);
    check('con modifiche non salvate la finestra non si chiude da sola', !app.state.exited, 'l\'app si è chiusa senza avvisare');
  } finally {
    await app.stop();
  }
}

async function istanzaUnica() {
  const app = await launch(3);
  try {
    await app.ev("window.CatalogoApp.ready.then(() => 'ok')");
    const seconda = spawn(electronPath, electronArgs(port + 4), { env: childEnv, stdio: 'ignore' });
    let finita = false;
    seconda.on('exit', () => {
      finita = true;
    });
    for (let i = 0; i < 80 && !finita; i += 1) await sleep(100);
    check('una seconda copia dell\'app si chiude da sola', finita, 'la seconda copia è rimasta aperta');
    check('la prima copia resta aperta', !app.state.exited, 'la prima copia si è chiusa');
    if (!finita) seconda.kill('SIGKILL');
  } finally {
    await app.stop();
  }
}

main().then(chiusura).then(istanzaUnica).then(() => {
  const falliti = results.filter((r) => !r.ok);
  console.log('\nTotale: ' + (results.length - falliti.length) + ' controlli su ' + results.length + ' riusciti.');
  process.exit(falliti.length ? 1 : 0);
}).catch((e) => {
  console.error('ERRORE: ' + e.message);
  process.exit(1);
});
