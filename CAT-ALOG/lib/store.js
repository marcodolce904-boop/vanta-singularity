'use strict';

const fs = require('fs');
const path = require('path');
const S = require('./shared');
const seed = require('./seed');
const libreria = require('./libreria');
const zip = require('./zip');
const assetinfo = require('./assetinfo');
const Seo = require('./seo');
const PB = require('./pagebuilder');
const Resp = require('./responsive');

const KINDS = {
  strutture: { js: false },
  componenti: { js: true },
  animazioni: { js: true },
  interazioni: { js: true }
};

const PREFIX_RE = /^[a-z][a-z0-9]{0,11}$/;

function assertKind(kind) {
  if (!Object.prototype.hasOwnProperty.call(KINDS, kind)) throw new Error('Tipo non valido: ' + kind);
}

function assertId(id) {
  if (!S.isValidId(id)) throw new Error('Identificatore non valido');
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp-' + process.pid + '-' + Date.now();
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, file);
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return '';
  }
}

function readJsonSafe(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    try {
      fs.copyFileSync(file, file + '.corrotto-' + stamp());
    } catch (e2) {
      /* copia di sicurezza non riuscita: si prosegue comunque */
    }
    return fallback;
  }
}

function parseTags(t) {
  const arr = Array.isArray(t) ? t : S.str(t).split(',');
  const out = [];
  arr.forEach(function (x) {
    const s = String(x).trim();
    if (s && out.indexOf(s) === -1) out.push(s);
  });
  return out.slice(0, 20);
}

function uniqueDir(parent, name) {
  let dir = path.join(parent, name);
  let n = 2;
  while (fs.existsSync(dir)) {
    dir = path.join(parent, name + '-' + n);
    n += 1;
  }
  return dir;
}

function createStore(dataDir) {
  if (!dataDir || typeof dataDir !== 'string') throw new Error('Cartella dati mancante');
  const root = path.resolve(dataDir);
  const p = function () {
    return path.join.apply(path, [root].concat(Array.prototype.slice.call(arguments)));
  };

  function moveToTrash(src, label) {
    const trash = p('_cestino');
    fs.mkdirSync(trash, { recursive: true });
    const base = label + '-' + stamp();
    let dest = path.join(trash, base);
    let n = 1;
    while (fs.existsSync(dest)) {
      dest = path.join(trash, base + '-' + n);
      n += 1;
    }
    fs.renameSync(src, dest);
    return dest;
  }

  function backup(file) {
    if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak');
  }

  /* ---------- impostazioni ---------- */

  function getSettings() {
    const s = readJsonSafe(p('catalogo.json'), {}) || {};
    return { versione: 1, prefisso: PREFIX_RE.test(S.str(s.prefisso)) ? s.prefisso : 'cat' };
  }

  function writeGenerated(oldPrefix) {
    const prefisso = getSettings().prefisso;
    writeFile(p('classi', prefisso + '-classi.css'), S.buildClassiCss(getClassi()));
    writeFile(p('root', 'root.css'), S.buildRootCss(getRoot()));
    if (oldPrefix && oldPrefix !== prefisso) {
      const old = p('classi', oldPrefix + '-classi.css');
      if (fs.existsSync(old)) moveToTrash(old, 'file-generato');
    }
  }

  function setSettings(patch) {
    const cur = getSettings();
    const next = { versione: 1, prefisso: cur.prefisso };
    if (patch && patch.prefisso != null) {
      const pre = String(patch.prefisso).trim().toLowerCase();
      if (!PREFIX_RE.test(pre)) {
        throw new Error('Prefisso non valido: usa lettere minuscole e numeri, massimo 12 caratteri (esempio: cat)');
      }
      next.prefisso = pre;
    }
    writeFile(p('catalogo.json'), JSON.stringify(next, null, 2) + '\n');
    if (next.prefisso !== cur.prefisso) writeGenerated(cur.prefisso);
    return next;
  }

  /* ---------- strutture e componenti ---------- */

  function itemDir(kind, id) {
    assertKind(kind);
    assertId(id);
    return p(kind, id);
  }

  function summary(id, meta) {
    const m = meta && typeof meta === 'object' ? meta : {};
    return {
      id: id,
      nome: S.str(m.nome) || id,
      descrizione: S.str(m.descrizione),
      tag: Array.isArray(m.tag) ? m.tag.map(String) : [],
      modificato: S.str(m.modificato),
      preferito: m.preferito === true
    };
  }

  function list(kind) {
    assertKind(kind);
    const base = p(kind);
    if (!fs.existsSync(base)) return [];
    const out = [];
    fs.readdirSync(base, { withFileTypes: true }).forEach(function (ent) {
      if (!ent.isDirectory() || ent.name.charAt(0) === '_' || !S.isValidId(ent.name)) return;
      out.push(summary(ent.name, readJsonSafe(path.join(base, ent.name, 'meta.json'), null)));
    });
    out.sort(function (a, b) {
      return a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' });
    });
    return out;
  }

  /* Il file toccato più di recente nella cartella dell'elemento (per accorgersi di modifiche fatte fuori dall'app). */
  function stampOf(dir) {
    let m = 0;
    ['markup.html', 'style.css', 'script.js', 'meta.json'].forEach(function (f) {
      try {
        m = Math.max(m, Math.round(fs.statSync(path.join(dir, f)).mtimeMs));
      } catch (e) { /* file non presente */ }
    });
    return m;
  }

  function itemStamp(kind, id) {
    const dir = itemDir(kind, id);
    return { mtime: fs.existsSync(dir) ? stampOf(dir) : 0 };
  }

  /* Cartella e file di un elemento, per aprirli in un altro editor. */
  function itemFiles(kind, id) {
    const dir = itemDir(kind, id);
    if (!fs.existsSync(dir)) throw new Error('Elemento non trovato: ' + id);
    const files = ['markup.html', 'style.css'].concat(KINDS[kind].js ? ['script.js'] : []).map(function (f) {
      const full = path.join(dir, f);
      if (!fs.existsSync(full)) writeFile(full, '');
      return full;
    });
    return { dir: dir, files: files };
  }

  function get(kind, id) {
    const dir = itemDir(kind, id);
    if (!fs.existsSync(dir)) throw new Error('Elemento non trovato: ' + id);
    const meta = readJsonSafe(path.join(dir, 'meta.json'), null);
    return Object.assign(summary(id, meta), {
      mtime: stampOf(dir),
      creato: S.str(meta && meta.creato),
      html: readText(path.join(dir, 'markup.html')),
      css: readText(path.join(dir, 'style.css')),
      js: KINDS[kind].js ? readText(path.join(dir, 'script.js')) : ''
    });
  }

  function save(kind, id, data) {
    assertKind(kind);
    const d = data || {};
    const nome = S.str(d.nome).trim() || 'Senza nome';
    const now = new Date().toISOString();
    let creato = now;
    let pref = d.preferito === true;
    let theId = id;
    if (theId == null) {
      const existing = new Set(fs.existsSync(p(kind)) ? fs.readdirSync(p(kind)) : []);
      theId = S.uniqueSlug(S.slugify(nome), existing);
    } else {
      assertId(theId);
      if (!fs.existsSync(p(kind, theId))) throw new Error('Elemento non trovato: ' + theId);
      const old = readJsonSafe(p(kind, theId, 'meta.json'), null);
      if (old && old.creato) creato = old.creato;
      if (d.preferito === undefined && old) pref = old.preferito === true;
    }
    const dir = p(kind, theId);
    if (id != null) snapshotVersion(kind, theId, d);
    fs.mkdirSync(dir, { recursive: true });
    writeFile(path.join(dir, 'markup.html'), S.str(d.html));
    writeFile(path.join(dir, 'style.css'), S.str(d.css));
    if (KINDS[kind].js) writeFile(path.join(dir, 'script.js'), S.str(d.js));
    writeFile(path.join(dir, 'meta.json'), JSON.stringify({
      nome: nome,
      descrizione: S.str(d.descrizione),
      tag: parseTags(d.tag),
      preferito: pref,
      creato: creato,
      modificato: now
    }, null, 2) + '\n');
    return get(kind, theId);
  }

  function duplicate(kind, id) {
    const o = get(kind, id);
    return save(kind, null, {
      nome: o.nome + ' (copia)',
      descrizione: o.descrizione,
      tag: o.tag,
      html: o.html,
      css: o.css,
      js: o.js
    });
  }

  function remove(kind, id) {
    const dir = itemDir(kind, id);
    if (!fs.existsSync(dir)) throw new Error('Elemento non trovato: ' + id);
    return { cestino: moveToTrash(dir, kind + '-' + id) };
  }

  /* ---------- classi ---------- */

  function getClassi() {
    return S.normalizeClassi(readJsonSafe(p('classi', 'classi.json'), null) || { gruppi: [] });
  }

  function saveClassi(data) {
    const norm = S.normalizeClassi(data);
    norm.gruppi.forEach(function (g) {
      g.classi.forEach(function (c) {
        if (!c.nome) throw new Error('Una classe del gruppo «' + g.nome + '» non ha il nome');
        if (!S.validaClasseNome(c.nome)) throw new Error('Nome classe non valido: ' + c.nome);
      });
    });
    backup(p('classi', 'classi.json'));
    writeFile(p('classi', 'classi.json'), JSON.stringify(norm, null, 2) + '\n');
    writeFile(p('classi', getSettings().prefisso + '-classi.css'), S.buildClassiCss(norm));
    return norm;
  }

  /* ---------- root ---------- */

  function checkRoot(norm) {
    const nomi = new Set();
    norm.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) {
        const err = S.validaVariabile(v);
        if (err) throw new Error(err);
        if (nomi.has(v.nome)) throw new Error('Variabile duplicata: ' + v.nome);
        nomi.add(v.nome);
      });
    });
  }

  function getRoot() {
    return S.normalizeRoot(readJsonSafe(p('root', 'root.json'), null) || { gruppi: [] });
  }

  function saveRoot(data) {
    const norm = S.normalizeRoot(data);
    checkRoot(norm);
    backup(p('root', 'root.json'));
    writeFile(p('root', 'root.json'), JSON.stringify(norm, null, 2) + '\n');
    writeFile(p('root', 'root.css'), S.buildRootCss(norm));
    return norm;
  }

  function globalCss() {
    return { rootCss: S.buildRootCss(getRoot()), classiCss: S.buildClassiCss(getClassi()) };
  }

  /* ---------- preset della root ---------- */

  function listPresets() {
    const dir = p('root', 'presets');
    if (!fs.existsSync(dir)) return [];
    const out = [];
    fs.readdirSync(dir).forEach(function (f) {
      const m = /^(.+)\.json$/.exec(f);
      if (!m || !S.isValidId(m[1])) return;
      const j = readJsonSafe(path.join(dir, f), null);
      if (!j) return;
      out.push({ id: m[1], nome: S.str(j.nome) || m[1], creato: S.str(j.creato) });
    });
    out.sort(function (a, b) {
      return a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' });
    });
    return out;
  }

  function getPreset(id) {
    assertId(id);
    const file = p('root', 'presets', id + '.json');
    if (!fs.existsSync(file)) throw new Error('Preset non trovato: ' + id);
    const j = readJsonSafe(file, null);
    if (!j) throw new Error('Preset non leggibile: ' + id);
    const norm = S.normalizeRoot(j);
    return { id: id, nome: S.str(j.nome) || id, gruppi: norm.gruppi };
  }

  function savePreset(nome, rootData) {
    const n = S.str(nome).trim();
    if (!n) throw new Error('Dai un nome al preset');
    const norm = S.normalizeRoot(rootData);
    checkRoot(norm);
    const id = S.slugify(n);
    writeFile(p('root', 'presets', id + '.json'), JSON.stringify({
      versione: 1,
      nome: n,
      creato: new Date().toISOString(),
      gruppi: norm.gruppi
    }, null, 2) + '\n');
    return { id: id, nome: n };
  }

  function deletePreset(id) {
    assertId(id);
    const file = p('root', 'presets', id + '.json');
    if (!fs.existsSync(file)) throw new Error('Preset non trovato: ' + id);
    return { cestino: moveToTrash(file, 'preset-' + id) };
  }

  /* ---------- esportazioni ---------- */

  function cssText(which, data) {
    if (which === 'root') {
      const norm = data ? S.normalizeRoot(data) : getRoot();
      if (data) checkRoot(norm);
      return S.buildRootCss(norm);
    }
    if (which === 'classi') {
      return S.buildClassiCss(data ? S.normalizeClassi(data) : getClassi());
    }
    throw new Error('Tipo di CSS non valido');
  }

  function rootFormatText(format, data) {
    const norm = data ? S.normalizeRoot(data) : getRoot();
    if (data) checkRoot(norm);
    if (format === 'scss') return S.buildRootScss(norm);
    if (format === 'json') return S.buildRootJson(norm);
    if (format === 'bootstrap') return S.buildBootstrapOverride(norm);
    throw new Error('Formato non valido: ' + format);
  }

  function tokensText(data) {
    const norm = data ? S.normalizeRoot(data) : getRoot();
    if (data) checkRoot(norm);
    return JSON.stringify(S.toTokens(norm), null, 2) + '\n';
  }

  function writeItemFiles(dir, nome, d, opts) {
    fs.mkdirSync(dir, { recursive: true });
    const hasJs = !!opts.js && S.str(d.js).trim() !== '';
    const files = ['index.html', 'style.css'];
    writeFile(path.join(dir, 'style.css'), S.str(d.css));
    if (hasJs) {
      writeFile(path.join(dir, 'script.js'), S.str(d.js));
      files.push('script.js');
    }
    writeFile(path.join(dir, 'index.html'), S.buildFullPage({
      titolo: nome,
      html: d.html,
      js: hasJs,
      links: opts.links || []
    }));
    return files;
  }

  function exportItem(kind, data, destDir) {
    assertKind(kind);
    if (!destDir) throw new Error('Cartella di destinazione mancante');
    const d = data || {};
    const nome = S.str(d.nome).trim() || 'senza-nome';
    const dir = uniqueDir(path.resolve(destDir), S.slugify(nome));
    const file = writeItemFiles(dir, nome, d, { js: true, links: [] });
    return { cartella: dir, file: file };
  }

  function exportAll(destDir) {
    if (!destDir) throw new Error('Cartella di destinazione mancante');
    const prefisso = getSettings().prefisso;
    const base = uniqueDir(path.resolve(destDir), 'catalogo-' + prefisso);
    fs.mkdirSync(base, { recursive: true });
    writeFile(path.join(base, 'css', 'root.css'), cssText('root'));
    writeFile(path.join(base, 'css', prefisso + '-classi.css'), cssText('classi'));
    writeFile(path.join(base, 'css', 'responsive.css'), require('./responsive').buildCss());
    listAssets().forEach(function (a) {
      fs.mkdirSync(path.join(base, 'assets'), { recursive: true });
      fs.copyFileSync(a.percorso, path.join(base, 'assets', a.nome));
    });
    writeFile(path.join(base, 'tokens', 'figma-tokens.json'), tokensText());
    const links = ['../../css/root.css', '../../css/' + prefisso + '-classi.css'];
    const counts = {};
    Object.keys(KINDS).forEach(function (kind) {
      const items = list(kind);
      items.forEach(function (it) {
        const full = get(kind, it.id);
        writeItemFiles(path.join(base, kind, it.id), full.nome, full, { js: KINDS[kind].js, links: links });
      });
      counts[kind] = items.length;
    });
    return Object.assign({ cartella: base }, counts);
  }

  /* Legge una cartella HTML/CSS/JS qualsiasi e la restituisce divisa in html, css, js. */
  function importFolder(dir) {
    const base = path.resolve(String(dir || ''));
    if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) throw new Error('Cartella non trovata');
    const files = [];
    (function walk(d, depth) {
      fs.readdirSync(d, { withFileTypes: true }).forEach(function (ent) {
        if (ent.name.charAt(0) === '.' || ent.name === 'node_modules') return;
        const full = path.join(d, ent.name);
        if (ent.isDirectory()) {
          if (depth < 3) walk(full, depth + 1);
        } else if (/\.(html?|css|js|mjs)$/i.test(ent.name) && fs.statSync(full).size <= 2 * 1024 * 1024) {
          files.push(full);
        }
      });
    })(base, 0);
    const byExt = function (re) { return files.filter(function (f) { return re.test(f); }).sort(); };
    const htmls = byExt(/\.html?$/i);
    const main = htmls.find(function (f) { return /index\.html?$/i.test(f); }) || htmls[0];
    const parts = { html: '', css: [], js: [], avvisi: [] };
    if (main) {
      const r = S.splitCode(readText(main));
      parts.html = r.html;
      if (r.css) parts.css.push(r.css);
      if (r.js) parts.js.push(r.js);
      parts.avvisi = r.avvisi;
    }
    byExt(/\.css$/i).forEach(function (f) { parts.css.push('/* ' + path.relative(base, f).replace(/\\/g, '/') + ' */\n' + readText(f).trim() + '\n'); });
    byExt(/\.m?js$/i).forEach(function (f) { parts.js.push('/* ' + path.relative(base, f).replace(/\\/g, '/') + ' */\n' + readText(f).trim() + '\n'); });
    if (!main && !parts.css.length && !parts.js.length) throw new Error('Nella cartella non ci sono file .html, .css o .js');
    return {
      nome: path.basename(base),
      html: parts.html,
      css: parts.css.join('\n'),
      js: parts.js.join('\n'),
      avvisi: parts.avvisi,
      file: files.length
    };
  }

  /* ---------- cronologia delle versioni (ultime 20 per elemento) ---------- */

  const MAX_VERSIONS = 20;
  const VER_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}(?:-[0-9]+)?$/;

  function snapshotVersion(kind, id, next) {
    let old;
    try {
      old = get(kind, id);
    } catch (e) {
      return;
    }
    const n = next || {};
    const same =
      old.html === S.str(n.html) && old.css === S.str(n.css) && (!KINDS[kind].js || old.js === S.str(n.js)) &&
      old.nome === (S.str(n.nome).trim() || 'Senza nome');
    if (same) return;
    const dir = p(kind, id, '_versioni');
    fs.mkdirSync(dir, { recursive: true });
    /* nome crescente: se due salvataggi cadono nello stesso millisecondo, il secondo prende il millisecondo dopo */
    let t = Date.now();
    const last = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort().pop();
    if (last) {
      const m = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})-(\d{3})/.exec(last);
      if (m) t = Math.max(t, Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], +m[7]) + 1);
    }
    const name = new Date(t).toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
    writeFile(path.join(dir, name + '.json'), JSON.stringify({
      nome: old.nome, descrizione: old.descrizione, tag: old.tag, html: old.html, css: old.css, js: old.js,
      salvato: old.modificato
    }));
    const all = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
    all.slice(0, Math.max(0, all.length - MAX_VERSIONS)).forEach(function (f) {
      try { fs.unlinkSync(path.join(dir, f)); } catch (e) { /* già tolta */ }
    });
  }

  function listVersions(kind, id) {
    const dir = path.join(itemDir(kind, id), '_versioni');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort().reverse().map(function (f) {
      const ver = f.slice(0, -5);
      const j = readJsonSafe(path.join(dir, f), {}) || {};
      return { ver: ver, nome: S.str(j.nome), salvato: S.str(j.salvato) };
    });
  }

  function getVersion(kind, id, ver) {
    if (!VER_RE.test(S.str(ver))) throw new Error('Versione non valida');
    const j = readJsonSafe(path.join(itemDir(kind, id), '_versioni', ver + '.json'), null);
    if (!j) throw new Error('Versione non trovata');
    return { ver: ver, nome: S.str(j.nome), descrizione: S.str(j.descrizione), tag: Array.isArray(j.tag) ? j.tag.map(String) : [], html: S.str(j.html), css: S.str(j.css), js: S.str(j.js) };
  }

  /* ---------- asset (immagini, SVG, Lottie, video, font) ---------- */

  function assetPath(nome) {
    const n = S.str(nome);
    if (!/^[a-z0-9][a-z0-9._-]*\.[a-z0-9]+$/.test(n) || n.indexOf('..') !== -1) throw new Error('Nome di asset non valido');
    return p('assets', n);
  }

  function readHead(file, max) {
    const fd = fs.openSync(file, 'r');
    try {
      const buf = Buffer.alloc(max);
      const n = fs.readSync(fd, buf, 0, max, 0);
      return buf.slice(0, n);
    } finally {
      fs.closeSync(fd);
    }
  }

  function describeAsset(nome) {
    const file = assetPath(nome);
    const st = fs.statSync(file);
    const ext = assetinfo.extOf(nome);
    const tipo = assetinfo.tipoPer(ext);
    const head = readHead(file, tipo === 'immagine' ? 1024 * 1024 : tipo === 'svg' || tipo === 'lottie' ? 2 * 1024 * 1024 : 16);
    const info = assetinfo.inspect(nome, head, st.size);
    info.nome = nome;
    info.modificato = st.mtime.toISOString();
    info.percorso = file;
    return info;
  }

  function listAssets() {
    const dir = p('assets');
    if (!fs.existsSync(dir)) return [];
    const out = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
      if (!ent.isFile() || !/^[a-z0-9][a-z0-9._-]*\.[a-z0-9]+$/.test(ent.name)) return;
      if (!assetinfo.tipoPer(assetinfo.extOf(ent.name))) return;
      try {
        out.push(describeAsset(ent.name));
      } catch (e) { /* file illeggibile: si salta */ }
    });
    out.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }); });
    return out;
  }

  /* Copia un file dentro la cartella assets, con nome pulito e unico. */
  function addAsset(srcFile) {
    const src = path.resolve(S.str(srcFile));
    if (!fs.existsSync(src) || !fs.statSync(src).isFile()) throw new Error('File non trovato');
    const ext = assetinfo.extOf(src);
    const tipo = assetinfo.tipoPer(ext);
    if (!tipo) throw new Error('Tipo di file non supportato: .' + ext);
    const size = fs.statSync(src).size;
    if (size > assetinfo.MAX_BYTE) throw new Error('File troppo grande (massimo 50 MB)');
    if (tipo === 'lottie' && !assetinfo.lottieInfo(fs.readFileSync(src, 'utf8'))) throw new Error('Il file .json non sembra un\'animazione Lottie');
    const base = S.slugify(path.basename(src, path.extname(src)));
    const existing = new Set(fs.existsSync(p('assets')) ? fs.readdirSync(p('assets')) : []);
    let nome = base + '.' + ext;
    let n = 2;
    while (existing.has(nome)) { nome = base + '-' + n + '.' + ext; n += 1; }
    fs.mkdirSync(p('assets'), { recursive: true });
    fs.copyFileSync(src, p('assets', nome));
    return describeAsset(nome);
  }

  function removeAsset(nome) {
    const file = assetPath(nome);
    if (!fs.existsSync(file)) throw new Error('Asset non trovato');
    return { cestino: moveToTrash(file, 'asset-' + nome) };
  }

  function renameAsset(nome, nuovo) {
    const from = assetPath(nome);
    if (!fs.existsSync(from)) throw new Error('Asset non trovato');
    const ext = assetinfo.extOf(nome);
    const base = S.slugify(S.str(nuovo).replace(/\.[a-z0-9]+$/i, ''));
    const to = assetPath(base + '.' + ext);
    if (to !== from && fs.existsSync(to)) throw new Error('Esiste già un asset con questo nome');
    fs.renameSync(from, to);
    return describeAsset(base + '.' + ext);
  }

  /* ---------- SEO: valori del modulo, ricordati tra una sessione e l'altra ---------- */

  function getSeo() {
    return Seo.normalize(readJsonSafe(p('seo', 'seo.json'), null) || {});
  }

  function saveSeo(values) {
    const norm = Seo.normalize(values || {});
    writeFile(p('seo', 'seo.json'), JSON.stringify(norm, null, 2) + '\n');
    return norm;
  }

  /* ---------- pagine e kit ---------- */

  const PAGE_KINDS = Object.keys(KINDS);

  function normPage(d, old) {
    const x = d || {};
    const inc = x.includi && typeof x.includi === 'object' ? x.includi : {};
    return {
      nome: S.str(x.nome).trim() || 'Senza nome',
      titolo: S.str(x.titolo),
      descrizione: S.str(x.descrizione),
      lingua: S.str(x.lingua).trim() || 'it',
      includi: { root: inc.root !== false, classi: inc.classi !== false, responsive: inc.responsive === true },
      usaSeo: x.usaSeo === true,
      sezioni: (Array.isArray(x.sezioni) ? x.sezioni : [])
        .filter(function (z) { return z && PAGE_KINDS.indexOf(z.kind) !== -1 && S.isValidId(z.id); })
        .map(function (z) { return { kind: z.kind, id: z.id }; })
    };
  }

  function summaryPage(id, j) {
    const m = j && typeof j === 'object' ? j : {};
    return {
      id: id,
      nome: S.str(m.nome) || id,
      titolo: S.str(m.titolo),
      sezioni: Array.isArray(m.sezioni) ? m.sezioni.length : 0,
      modificato: S.str(m.modificato)
    };
  }

  function listPages() {
    const base = p('pagine');
    if (!fs.existsSync(base)) return [];
    const out = [];
    fs.readdirSync(base, { withFileTypes: true }).forEach(function (ent) {
      if (!ent.isDirectory() || ent.name.charAt(0) === '_' || !S.isValidId(ent.name)) return;
      out.push(summaryPage(ent.name, readJsonSafe(path.join(base, ent.name, 'pagina.json'), null)));
    });
    out.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }); });
    return out;
  }

  function getPage(id) {
    assertId(id);
    const j = readJsonSafe(p('pagine', id, 'pagina.json'), null);
    if (!j) throw new Error('Pagina non trovata: ' + id);
    return Object.assign({ id: id, creato: S.str(j.creato), modificato: S.str(j.modificato) }, normPage(j));
  }

  function savePage(id, data) {
    const norm = normPage(data);
    const now = new Date().toISOString();
    let theId = id;
    let creato = now;
    if (theId == null) {
      const existing = new Set(fs.existsSync(p('pagine')) ? fs.readdirSync(p('pagine')) : []);
      theId = S.uniqueSlug(S.slugify(norm.nome), existing);
    } else {
      assertId(theId);
      const old = readJsonSafe(p('pagine', theId, 'pagina.json'), null);
      if (!old) throw new Error('Pagina non trovata: ' + theId);
      if (old.creato) creato = old.creato;
    }
    writeFile(p('pagine', theId, 'pagina.json'), JSON.stringify(Object.assign({}, norm, { creato: creato, modificato: now }), null, 2) + '\n');
    return getPage(theId);
  }

  function duplicatePage(id) {
    const o = getPage(id);
    return savePage(null, Object.assign({}, o, { nome: o.nome + ' (copia)' }));
  }

  function removePage(id) {
    assertId(id);
    if (!fs.existsSync(p('pagine', id))) throw new Error('Pagina non trovata: ' + id);
    return { cestino: moveToTrash(p('pagine', id), 'pagina-' + id) };
  }

  function resolveSections(sezioni) {
    const out = [];
    const mancanti = [];
    sezioni.forEach(function (z) {
      try {
        const it = get(z.kind, z.id);
        out.push({ kind: z.kind, id: z.id, nome: it.nome, html: it.html, css: it.css, js: it.js });
      } catch (e) {
        mancanti.push(z.kind + '/' + z.id);
      }
    });
    return { sezioni: out, mancanti: mancanti };
  }

  function seoHeadExtra() {
    return Seo.buildHead(getSeo()).split('\n').filter(function (l) {
      return !/^<meta charset|^<meta name="viewport"|^<title>|^<meta name="description"/.test(l);
    }).join('\n').replace(/^\n+/, '');
  }

  function buildPage(data, extra) {
    const page = normPage(data);
    const r = resolveSections(page.sezioni);
    const built = PB.assemble(
      Object.assign({}, page, { headExtra: page.usaSeo ? seoHeadExtra() : '' }),
      r.sezioni,
      { prefisso: getSettings().prefisso }
    );
    r.mancanti.forEach(function (m) { built.avvisi.unshift('Sezione non trovata (eliminata?): ' + m); });
    built.pagina = page;
    return built;
  }

  /* Anteprima in un file solo, con immagini e video piccoli già dentro. */
  function previewPage(data) {
    const built = buildPage(data);
    const inc = built.pagina.includi;
    const g = globalCss();
    const map = {};
    built.assets.forEach(function (name) {
      try {
        const f = assetPath(name);
        if (fs.existsSync(f) && fs.statSync(f).size <= 2 * 1024 * 1024) {
          const ext = assetinfo.extOf(name);
          const mime = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', ico: 'image/x-icon' }[ext] || 'application/octet-stream';
          map[name] = 'data:' + mime + ';base64,' + fs.readFileSync(f).toString('base64');
        }
      } catch (e) { /* asset non valido: resta il percorso */ }
    });
    const doc = PB.inlinePreview(
      built,
      ['body{margin:0;font-family:system-ui,sans-serif}', inc.root ? g.rootCss : '', inc.classi ? g.classiCss : '', inc.responsive ? Resp.buildCss() : ''],
      map
    );
    return { doc: doc, avvisi: built.avvisi, assets: built.assets };
  }

  function writeSharedCss(dir, inc) {
    const prefisso = getSettings().prefisso;
    if (inc.root) writeFile(path.join(dir, 'css', 'root.css'), cssText('root'));
    if (inc.classi) writeFile(path.join(dir, 'css', prefisso + '-classi.css'), cssText('classi'));
    if (inc.responsive) writeFile(path.join(dir, 'css', 'responsive.css'), Resp.buildCss());
  }

  function copyAssets(dir, names, avvisi) {
    names.forEach(function (name) {
      try {
        const src = assetPath(name);
        if (!fs.existsSync(src)) { avvisi.push('Asset mancante: ' + name); return; }
        fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
        fs.copyFileSync(src, path.join(dir, 'assets', name));
      } catch (e) {
        avvisi.push('Asset non copiato: ' + name);
      }
    });
  }

  function exportPage(data, destDir) {
    if (!destDir) throw new Error('Cartella di destinazione mancante');
    const built = buildPage(data);
    const dir = uniqueDir(path.resolve(destDir), S.slugify(built.pagina.nome));
    writeFile(path.join(dir, 'index.html'), built.html);
    if (built.css.trim()) writeFile(path.join(dir, 'css', 'pagina.css'), built.css);
    if (built.js.trim()) writeFile(path.join(dir, 'js', 'pagina.js'), built.js);
    writeSharedCss(dir, built.pagina.includi);
    const avvisi = built.avvisi.slice();
    copyAssets(dir, built.assets, avvisi);
    return { cartella: dir, file: path.join(dir, 'index.html'), avvisi: avvisi, assets: built.assets.length };
  }

  function normKit(d) {
    const x = d || {};
    return {
      nome: S.str(x.nome).trim() || 'Il mio sito',
      pagine: (Array.isArray(x.pagine) ? x.pagine : []).filter(function (id) { return S.isValidId(id); }),
      asset: ['usati', 'tutti', 'nessuno'].indexOf(x.asset) !== -1 ? x.asset : 'usati',
      seo: x.seo !== false,
      tokens: x.tokens !== false
    };
  }

  function getKit() {
    return normKit(readJsonSafe(p('kit', 'kit.json'), null) || {});
  }

  function saveKit(data) {
    const norm = normKit(data);
    writeFile(p('kit', 'kit.json'), JSON.stringify(norm, null, 2) + '\n');
    return norm;
  }

  /* Un sito intero: pagine collegate agli stessi css/, più asset, token, head e un file che lo descrive. */
  function exportKit(data, destDir) {
    if (!destDir) throw new Error('Cartella di destinazione mancante');
    const kit = normKit(data);
    const tutte = listPages();
    const ids = kit.pagine.length ? kit.pagine.filter(function (id) { return tutte.some(function (x) { return x.id === id; }); }) : tutte.map(function (x) { return x.id; });
    if (!ids.length) throw new Error('Non ci sono pagine da esportare. Crea almeno una pagina nella scheda Pagine.');
    const dir = uniqueDir(path.resolve(destDir), S.slugify(kit.nome));
    const avvisi = [];
    const usati = [];
    const files = [];
    const inc = { root: true, classi: true, responsive: false };
    ids.forEach(function (id, i) {
      const page = getPage(id);
      const built = buildPage(page);
      inc.responsive = inc.responsive || built.pagina.includi.responsive;
      const slug = i === 0 ? 'index' : S.slugify(page.nome);
      let html = built.html;
      if (built.css.trim()) {
        writeFile(path.join(dir, 'css', slug + '.css'), built.css);
        html = html.replace('css/pagina.css', 'css/' + slug + '.css');
      }
      if (built.js.trim()) {
        writeFile(path.join(dir, 'js', slug + '.js'), built.js);
        html = html.replace('js/pagina.js', 'js/' + slug + '.js');
      }
      /* anche le pagine che non chiedono i css condivisi funzionano: i file ci sono comunque */
      writeFile(path.join(dir, slug + '.html'), html);
      files.push(slug + '.html');
      built.avvisi.forEach(function (a) { avvisi.push(page.nome + ': ' + a); });
      built.assets.forEach(function (a) { if (usati.indexOf(a) === -1) usati.push(a); });
    });
    writeSharedCss(dir, { root: true, classi: true, responsive: true });
    const tuttiAsset = listAssets().map(function (a) { return a.nome; });
    const daCopiare = kit.asset === 'tutti' ? tuttiAsset : kit.asset === 'usati' ? usati : [];
    copyAssets(dir, daCopiare, avvisi);
    if (kit.tokens) writeFile(path.join(dir, 'tokens', 'figma-tokens.json'), tokensText());
    if (kit.seo) writeFile(path.join(dir, 'seo', 'head.html'), Seo.buildHead(getSeo()));
    writeFile(path.join(dir, 'kit.json'), JSON.stringify({
      nome: kit.nome,
      creato: new Date().toISOString(),
      app: 'CAT-ALOG',
      pagine: files,
      asset: daCopiare,
      css: ['root.css', getSettings().prefisso + '-classi.css', 'responsive.css']
    }, null, 2) + '\n');
    writeFile(path.join(dir, 'LEGGIMI.txt'),
      kit.nome + '\n' + '='.repeat(kit.nome.length) + '\n\n' +
      'Sito creato con CAT-ALOG.\n\n' +
      'Pagine: ' + files.join(', ') + '\n' +
      'css/    stili condivisi (root.css = colori e variabili, ' + getSettings().prefisso + '-classi.css = classi, responsive.css = media query) e uno per pagina\n' +
      'js/     un file per pagina\n' +
      (daCopiare.length ? 'assets/ immagini, SVG e altri file usati\n' : '') +
      (kit.tokens ? 'tokens/ variabili per Figma (Tokens Studio)\n' : '') +
      (kit.seo ? 'seo/    blocco <head> pronto da incollare\n' : '') +
      '\nApri index.html con il browser, oppure la cartella con VS Code.\n');
    return { cartella: dir, pagine: files.length, asset: daCopiare.length, avvisi: avvisi };
  }

  /* ---------- palette neutra: aggiorna i colori degli esempi già salvati ---------- */

  /* Cambia i colori della vecchia palette (esattamente quelli) in root, classi e in tutti gli elementi.
     Le versioni precedenti restano nella cronologia («Versioni…»). */
  function neutralizeSaved() {
    const out = { root: 0, classi: 0, elementi: 0 };
    const root = getRoot();
    root.gruppi.forEach(function (g) {
      g.variabili.forEach(function (v) {
        const nv = S.neutralizeColors(v.valore);
        if (nv !== v.valore) { v.valore = nv; out.root += 1; }
      });
    });
    if (out.root) saveRoot(root);
    const cl = getClassi();
    cl.gruppi.forEach(function (g) {
      g.classi.forEach(function (c) {
        const nc = S.neutralizeColors(c.css);
        if (nc !== c.css) { c.css = nc; out.classi += 1; }
      });
    });
    if (out.classi) saveClassi(cl);
    Object.keys(KINDS).forEach(function (kind) {
      list(kind).forEach(function (it) {
        const o = get(kind, it.id);
        const next = { nome: o.nome, descrizione: o.descrizione, tag: o.tag, html: S.neutralizeColors(o.html), css: S.neutralizeColors(o.css), js: S.neutralizeColors(o.js) };
        if (next.html !== o.html || next.css !== o.css || next.js !== o.js) {
          save(kind, it.id, next);
          out.elementi += 1;
        }
      });
    });
    return out;
  }

  /* ---------- backup e ripristino ---------- */

  const BACKUP_TOP = Object.keys(KINDS).concat(['classi', 'root', 'assets', 'seo', 'pagine', 'kit']);
  const BACKUP_FILES = ['catalogo.json', 'libreria.json'];

  function backupEntries() {
    const out = [];
    (function walk(dir, rel) {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
        const r = rel ? rel + '/' + ent.name : ent.name;
        if (!rel && !(ent.isDirectory() ? BACKUP_TOP.indexOf(ent.name) !== -1 : BACKUP_FILES.indexOf(ent.name) !== -1)) return;
        if (/\.tmp-|\.corrotto-/.test(ent.name)) return;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(full, r);
        else out.push({ name: r, data: fs.readFileSync(full) });
      });
    })(root, '');
    return out;
  }

  function backupZip() {
    return zip.createZip(backupEntries());
  }

  /* Rimette i dati da uno ZIP. Prima sposta nel cestino quello che c'è ora. */
  function restoreZip(buf) {
    const entries = zip.readZip(buf).filter(function (e) {
      const top = e.name.split('/')[0];
      return e.name.indexOf('/') === -1 ? BACKUP_FILES.indexOf(e.name) !== -1 : BACKUP_TOP.indexOf(top) !== -1;
    });
    if (!entries.length) throw new Error('Questo ZIP non contiene un backup di CAT-ALOG');
    const tops = {};
    entries.forEach(function (e) { tops[e.name.split('/')[0]] = true; });
    let cestino = null;
    Object.keys(tops).forEach(function (t) {
      if (fs.existsSync(p(t))) cestino = moveToTrash(p(t), 'prima-del-ripristino-' + t);
    });
    entries.forEach(function (e) {
      const dest = path.resolve(root, e.name);
      if (dest.indexOf(root + path.sep) !== 0) return;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, e.data);
    });
    init();
    return { file: entries.length, cestino: cestino };
  }

  /* ---------- avvio ---------- */

  /* Libreria di esempio: si installa una volta per versione, senza toccare né ripristinare nulla. */
  function installLibrary() {
    const file = p('libreria.json');
    const done = readJsonSafe(file, null);
    const have = done && Number.isInteger(done.versione) ? done.versione : 0;
    if (have >= libreria.VERSIONE) return 0;
    const seen = done && done.installate && typeof done.installate === 'object' ? done.installate : {};
    let n = 0;
    Object.keys(KINDS).forEach(function (kind) {
      const prev = Array.isArray(seen[kind]) ? seen[kind] : [];
      const now = prev.slice();
      (libreria[kind] || []).forEach(function (it) {
        const slug = S.slugify(it.nome);
        if (now.indexOf(slug) === -1) now.push(slug);
        /* già installata in passato (anche se poi eliminata) o già presente: non la tocco */
        if (prev.indexOf(slug) !== -1 || fs.existsSync(p(kind, slug))) return;
        save(kind, null, it);
        n += 1;
      });
      seen[kind] = now;
    });
    /* gruppi di classi della libreria (griglia): si aggiungono solo i gruppi nuovi, saltando i nomi di classe già presenti */
    const prevG = Array.isArray(seen.__gruppi) ? seen.__gruppi : [];
    const nowG = prevG.slice();
    const catalogo = getClassi();
    const esistenti = new Set();
    catalogo.gruppi.forEach(function (g) { g.classi.forEach(function (c) { esistenti.add(c.nome); }); });
    let nuoviGruppi = 0;
    (libreria.classi || []).forEach(function (g) {
      if (nowG.indexOf(g.nome) === -1) nowG.push(g.nome);
      if (prevG.indexOf(g.nome) !== -1 || catalogo.gruppi.some(function (x) { return x.nome === g.nome; })) return;
      const classi = g.classi.filter(function (c) { return !esistenti.has(c.nome); });
      if (!classi.length) return;
      catalogo.gruppi.push({ nome: g.nome, classi: classi });
      nuoviGruppi += 1;
      n += classi.length;
    });
    if (nuoviGruppi) saveClassi(catalogo);
    /* pagine di esempio: una volta sola, se i loro pezzi esistono */
    const prevP = Array.isArray(seen.__pagine) ? seen.__pagine : [];
    const nowP = prevP.slice();
    (libreria.pagine || []).forEach(function (pg) {
      const key = S.slugify(pg.nome);
      if (nowP.indexOf(key) === -1) nowP.push(key);
      if (prevP.indexOf(key) !== -1 || fs.existsSync(p('pagine', key))) return;
      const sezioni = pg.sezioni.map(function (z) { return { kind: z[0], id: S.slugify(z[1]) }; })
        .filter(function (z) { return fs.existsSync(p(z.kind, z.id)); });
      if (!sezioni.length) return;
      savePage(null, Object.assign({}, pg, { sezioni: sezioni }));
      n += 1;
    });
    seen.__pagine = nowP;
    /* correzioni a voci già installate (una volta sola ciascuna) */
    const prevC = Array.isArray(seen.__correzioni) ? seen.__correzioni : [];
    const nowC = prevC.slice();
    (libreria.correzioni || []).forEach(function (c) {
      if (nowC.indexOf(c.id) !== -1) return;
      nowC.push(c.id);
      const id = S.slugify(c.nome);
      if (!fs.existsSync(p(c.kind, id))) return;
      const fixed = c.fix(get(c.kind, id));
      if (fixed) { save(c.kind, id, fixed); n += 1; }
    });
    seen.__correzioni = nowC;
    /* colori di Root: se sono ancora quelli della vecchia palette, passano alla nuova (una volta sola) */
    if (!seen.__neutro) {
      seen.__neutro = true;
      const rootNow = getRoot();
      let cambiati = 0;
      rootNow.gruppi.forEach(function (g) {
        g.variabili.forEach(function (v) {
          const nv = S.neutralizeColors(v.valore);
          if (nv !== v.valore) { v.valore = nv; cambiati += 1; }
        });
      });
      if (cambiati) saveRoot(rootNow);
    }
    seen.__gruppi = nowG;
    writeFile(file, JSON.stringify({ versione: libreria.VERSIONE, installate: seen }, null, 2) + '\n');
    return n;
  }

  function init() {
    fs.mkdirSync(root, { recursive: true });
    const fresh = !fs.existsSync(p('catalogo.json'));
    const added = [];
    Object.keys(KINDS).concat(['classi', 'root', 'assets', 'seo', 'pagine', 'kit']).forEach(function (d) {
      if (!fs.existsSync(p(d))) added.push(d);
      fs.mkdirSync(p(d), { recursive: true });
    });
    /* Cartelle nuove in una versione più recente dell'app: metto gli esempi solo lì. */
    if (!fresh) {
      ['animazioni', 'interazioni'].forEach(function (k) {
        if (added.indexOf(k) !== -1) seed[k].forEach(function (s) { save(k, null, s); });
      });
      return { seeded: false, libreria: installLibrary() };
    }
    writeFile(p('catalogo.json'), JSON.stringify({ versione: 1, prefisso: 'cat' }, null, 2) + '\n');
    Object.keys(KINDS).forEach(function (k) {
      seed[k].forEach(function (s) { save(k, null, s); });
    });
    saveClassi(seed.classi);
    saveRoot(seed.root);
    return { seeded: true, libreria: installLibrary() };
  }

  return {
    dataDir: root,
    init: init,
    getSettings: getSettings,
    setSettings: setSettings,
    list: list,
    get: get,
    itemStamp: itemStamp,
    itemFiles: itemFiles,
    save: save,
    duplicate: duplicate,
    remove: remove,
    getClassi: getClassi,
    saveClassi: saveClassi,
    getRoot: getRoot,
    saveRoot: saveRoot,
    globalCss: globalCss,
    listPresets: listPresets,
    getPreset: getPreset,
    savePreset: savePreset,
    deletePreset: deletePreset,
    cssText: cssText,
    tokensText: tokensText,
    rootFormatText: rootFormatText,
    exportItem: exportItem,
    exportAll: exportAll,
    importFolder: importFolder,
    neutralizeSaved: neutralizeSaved,
    listPages: listPages,
    getPage: getPage,
    savePage: savePage,
    duplicatePage: duplicatePage,
    removePage: removePage,
    previewPage: previewPage,
    exportPage: exportPage,
    getKit: getKit,
    saveKit: saveKit,
    exportKit: exportKit,
    getSeo: getSeo,
    saveSeo: saveSeo,
    listAssets: listAssets,
    addAsset: addAsset,
    removeAsset: removeAsset,
    renameAsset: renameAsset,
    listVersions: listVersions,
    getVersion: getVersion,
    backupZip: backupZip,
    restoreZip: restoreZip
  };
}

module.exports = { createStore: createStore, KINDS: KINDS };
