'use strict';

/*
 * Dove sono i dati di CAT-ALOG, per gli strumenti che stanno FUORI dall'app (connettore per Claude, estensione per VS Code).
 * Ordine: variabile CAT_DATA_DIR, poi la cartella scelta nell'app (config.json di CAT-ALOG), poi Documenti/Catalogo MD.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

function configFile(o) {
  const platform = (o && o.platform) || process.platform;
  const env = (o && o.env) || process.env;
  const home = (o && o.home) || os.homedir();
  if (platform === 'win32') return path.join(env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'CAT-ALOG', 'config.json');
  if (platform === 'darwin') return path.join(home, 'Library', 'Application Support', 'CAT-ALOG', 'config.json');
  return path.join(env.XDG_CONFIG_HOME || path.join(home, '.config'), 'CAT-ALOG', 'config.json');
}

function readJson(file) {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    return j && typeof j === 'object' ? j : {};
  } catch (e) {
    return {};
  }
}

function resolveDataDir(o) {
  const opts = o || {};
  const env = opts.env || process.env;
  const home = opts.home || os.homedir();
  const exists = opts.exists || function (p) { try { return fs.statSync(p).isDirectory(); } catch (e) { return false; } };
  if (env.CAT_DATA_DIR && String(env.CAT_DATA_DIR).trim()) return path.resolve(String(env.CAT_DATA_DIR).trim());
  const cfg = opts.config || readJson(configFile(opts));
  if (typeof cfg.dataDir === 'string' && cfg.dataDir && exists(cfg.dataDir)) return path.resolve(cfg.dataDir);
  const candidati = [path.join(home, 'Documents'), path.join(home, 'Documenti'), path.join(home, 'OneDrive', 'Documents'), path.join(home, 'OneDrive', 'Documenti')];
  for (const base of candidati) {
    const dir = path.join(base, 'Catalogo MD');
    if (exists(dir)) return dir;
  }
  return path.join(candidati[0], 'Catalogo MD');
}

module.exports = { configFile, resolveDataDir };
