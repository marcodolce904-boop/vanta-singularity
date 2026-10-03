'use strict';

const fs = require('fs');
const path = require('path');
const S = require('./shared');
const seed = require('./seed');
const libreria = require('./libreria');
const zip = require('./zip');

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

  function get(kind, id) {
    const dir = itemDir(kind, id);
    if (!fs.existsSync(dir)) throw new Error('Elemento non trovato: ' + id);
    const meta = readJsonSafe(path.join(dir, 'meta.json'), null);
    return Object.assign(summary(id, meta), {
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

  /* ---------- backup e ripristino ---------- */

  const BACKUP_TOP = Object.keys(KINDS).concat(['classi', 'root']);
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
    seen.__gruppi = nowG;
    writeFile(file, JSON.stringify({ versione: libreria.VERSIONE, installate: seen }, null, 2) + '\n');
    return n;
  }

  function init() {
    fs.mkdirSync(root, { recursive: true });
    const fresh = !fs.existsSync(p('catalogo.json'));
    const added = [];
    Object.keys(KINDS).concat(['classi', 'root']).forEach(function (d) {
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
    listVersions: listVersions,
    getVersion: getVersion,
    backupZip: backupZip,
    restoreZip: restoreZip
  };
}

module.exports = { createStore: createStore, KINDS: KINDS };
