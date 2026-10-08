#!/usr/bin/env node
'use strict';

/*
 * Collega CAT-ALOG a Claude Desktop senza copiare a mano nessun blocco JSON:
 * trova il file di configurazione di Claude Desktop, ne fa una copia di sicurezza e aggiunge (senza toccare il resto)
 * il connettore "cat-alog" con il percorso COMPLETO di Node (così funziona anche se Node non è nel PATH).
 *
 *   node mcp/installa-desktop.js            (usa i percorsi normali)
 *   node mcp/installa-desktop.js --config C:\percorso\claude_desktop_config.json
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const NOME = 'cat-alog';
const FILE = 'claude_desktop_config.json';

function candidates(o) {
  const platform = (o && o.platform) || process.platform;
  const env = (o && o.env) || process.env;
  const home = (o && o.home) || os.homedir();
  const out = [];
  if (platform === 'win32') {
    const roaming = env.APPDATA || path.join(home, 'AppData', 'Roaming');
    out.push(path.join(roaming, 'Claude', FILE));
    /* versione del Microsoft Store: la cartella è dentro Packages */
    const local = env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    try {
      fs.readdirSync(path.join(local, 'Packages')).filter(function (n) { return /^Claude_/i.test(n); }).forEach(function (n) {
        out.push(path.join(local, 'Packages', n, 'LocalCache', 'Roaming', 'Claude', FILE));
      });
    } catch (e) { /* nessun pacchetto */ }
  } else if (platform === 'darwin') {
    out.push(path.join(home, 'Library', 'Application Support', 'Claude', FILE));
  } else {
    out.push(path.join(env.XDG_CONFIG_HOME || path.join(home, '.config'), 'Claude', FILE));
  }
  return out;
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/* Legge più oggetti JSON attaccati uno all'altro (succede quando si incolla un blocco dopo la fine del file).
   Ritorna la lista degli oggetti, oppure null se non si riesce a capire il testo. */
function parseConcatenated(text) {
  const out = [];
  let rest = text;
  for (let giri = 0; giri < 10 && rest.trim(); giri++) {
    try {
      out.push(JSON.parse(rest));
      rest = '';
    } catch (e) {
      const m = /position (\d+)/.exec(e.message);
      if (!m) return null;
      const pos = parseInt(m[1], 10);
      let parte;
      try {
        parte = JSON.parse(rest.slice(0, pos));
      } catch (e2) {
        return null;
      }
      out.push(parte);
      rest = rest.slice(pos);
    }
  }
  if (rest.trim()) return null;
  return out.every(function (x) { return x && typeof x === 'object' && !Array.isArray(x); }) ? out : null;
}

/* Unisce gli oggetti: le impostazioni del primo restano, i server di tutti si sommano. */
function mergeObjects(list) {
  const res = {};
  list.forEach(function (o) {
    Object.keys(o).forEach(function (k) {
      if (k === 'mcpServers' && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) {
        res.mcpServers = Object.assign({}, res.mcpServers || {}, o[k]);
      } else if (!(k in res)) {
        res[k] = o[k];
      }
    });
  });
  return res;
}

/* Aggiunge il connettore a UN file. Ritorna { file, creato, copia } oppure lancia un errore chiaro. */
function installInto(file, serverJs, nodePath, forza) {
  let data = {};
  let riparato = false;
  let ripartito = false;
  let esisteva = fs.existsSync(file);
  if (esisteva) {
    const text = fs.readFileSync(file, 'utf8');
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        const lista = parseConcatenated(text);
        if (lista) {
          data = mergeObjects(lista);
          riparato = true;
        } else if (forza) {
          data = {};
          ripartito = true;
        } else {
          const err = new Error('Il file ' + file + ' non è un JSON valido (' + e.message + '). Non l\'ho toccato.');
          err.irreparabile = true;
          throw err;
        }
      }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Il file ' + file + ' ha un formato inatteso. Non l\'ho toccato.');
  }
  let copia = null;
  if (esisteva) {
    copia = file + '.bak-' + stamp();
    fs.copyFileSync(file, copia);
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  if (!data.mcpServers || typeof data.mcpServers !== 'object' || Array.isArray(data.mcpServers)) data.mcpServers = {};
  data.mcpServers[NOME] = { command: nodePath, args: [serverJs] };
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return { file: file, creato: !esisteva, copia: copia, riparato: riparato, ripartito: ripartito };
}

function install(o) {
  const opts = o || {};
  const serverJs = opts.serverJs || path.resolve(__dirname, 'server.js');
  const nodePath = opts.nodePath || process.execPath;
  if (!fs.existsSync(serverJs)) throw new Error('Non trovo ' + serverJs);
  let files;
  if (opts.config) {
    files = [path.resolve(opts.config)];
  } else {
    const c = candidates(opts);
    const esistenti = c.filter(function (f) { return fs.existsSync(f); });
    files = esistenti.length ? esistenti : [c[0]];
  }
  return files.map(function (f) { return installInto(f, serverJs, nodePath, !!opts.forza); });
}

function main() {
  const i = process.argv.indexOf('--config');
  const config = i !== -1 ? process.argv[i + 1] : null;
  const forza = process.argv.indexOf('--forza') !== -1;
  try {
    const r = install({ config: config, forza: forza });
    r.forEach(function (x) {
      console.log((x.creato ? 'Creato: ' : 'Aggiornato: ') + x.file);
      if (x.copia) console.log('  copia di sicurezza (il file com\'era prima): ' + x.copia);
      if (x.riparato) console.log('  il file aveva più blocchi attaccati: li ho uniti in uno solo.');
      if (x.ripartito) console.log('  il file era illeggibile: ne ho scritto uno nuovo (il vecchio è nella copia di sicurezza).');
    });
    console.log('\nFATTO. Ora:');
    console.log('  1. Chiudi Claude Desktop DEL TUTTO (anche l\'icona vicino all\'orologio: tasto destro > Esci).');
    console.log('  2. Riaprilo.');
    console.log('  3. In una chat clicca l\'icona degli strumenti: deve comparire "cat-alog".');
  } catch (e) {
    console.error('\nERRORE: ' + e.message);
    process.exit(e.irreparabile ? 2 : 1);
  }
}

if (require.main === module) main();

module.exports = { install, installInto, candidates, parseConcatenated, mergeObjects, NOME };
