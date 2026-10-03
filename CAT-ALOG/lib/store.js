'use strict';

const fs = require('fs');
const path = require('path');
const S = require('./shared');
const seed = require('./seed');

const KINDS = {
  strutture: { js: false },
  componenti: { js: true }
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
    return { versione: 1, prefisso: PREFIX_RE.test(S.str(s.prefisso)) ? s.prefisso : 'md' };
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
        throw new Error('Prefisso non valido: usa lettere minuscole e numeri, massimo 12 caratteri (esempio: md)');
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
      modificato: S.str(m.modificato)
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
    let theId = id;
    if (theId == null) {
      const existing = new Set(fs.existsSync(p(kind)) ? fs.readdirSync(p(kind)) : []);
      theId = S.uniqueSlug(S.slugify(nome), existing);
    } else {
      assertId(theId);
      if (!fs.existsSync(p(kind, theId))) throw new Error('Elemento non trovato: ' + theId);
      const old = readJsonSafe(p(kind, theId, 'meta.json'), null);
      if (old && old.creato) creato = old.creato;
    }
    const dir = p(kind, theId);
    fs.mkdirSync(dir, { recursive: true });
    writeFile(path.join(dir, 'markup.html'), S.str(d.html));
    writeFile(path.join(dir, 'style.css'), S.str(d.css));
    if (KINDS[kind].js) writeFile(path.join(dir, 'script.js'), S.str(d.js));
    writeFile(path.join(dir, 'meta.json'), JSON.stringify({
      nome: nome,
      descrizione: S.str(d.descrizione),
      tag: parseTags(d.tag),
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
    return { cartella: base, strutture: counts.strutture, componenti: counts.componenti };
  }

  /* ---------- avvio ---------- */

  function init() {
    fs.mkdirSync(root, { recursive: true });
    const fresh = !fs.existsSync(p('catalogo.json'));
    ['strutture', 'componenti', 'classi', 'root'].forEach(function (d) {
      fs.mkdirSync(p(d), { recursive: true });
    });
    if (!fresh) return { seeded: false };
    writeFile(p('catalogo.json'), JSON.stringify({ versione: 1, prefisso: 'md' }, null, 2) + '\n');
    seed.strutture.forEach(function (s) { save('strutture', null, s); });
    seed.componenti.forEach(function (s) { save('componenti', null, s); });
    saveClassi(seed.classi);
    saveRoot(seed.root);
    return { seeded: true };
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
    exportItem: exportItem,
    exportAll: exportAll
  };
}

module.exports = { createStore: createStore, KINDS: KINDS };
