(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoGridLab = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Laboratorio per CSS Grid: la logica, senza interfaccia.
   * Lo stato descrive una griglia con aree nominate (header, nav, main, aside, footer) e da lì si ricava
   * il CSS (grid-template-areas, colonne, righe, gap, place-items) e l'HTML.
   *   state = { preset, cols: ['1fr', ...], rows: [...], areas: [['header', ...], ...], colGap, rowGap, place }
   * Nelle aree una cella vuota è '.'.
   */

  var AREAS = [
    { id: 'header', tag: 'header', label: 'Header', testo: 'Intestazione' },
    { id: 'nav', tag: 'nav', label: 'Nav', testo: 'Navigazione' },
    { id: 'main', tag: 'main', label: 'Main', testo: 'Contenuto principale' },
    { id: 'aside', tag: 'aside', label: 'Aside', testo: 'Colonna laterale' },
    { id: 'footer', tag: 'footer', label: 'Footer', testo: 'Piè di pagina' }
  ];

  var PLACE = ['stretch', 'start', 'end', 'center'];

  var PRESETS = [
    {
      id: 'holy-grail', nome: 'Holy grail',
      descr: 'Header e footer a tutta larghezza, nav, contenuto e aside in mezzo: il classico layout a tre colonne.',
      cols: ['1fr', '3fr', '1fr'], rows: ['1fr', '3fr', '1fr'],
      areas: [['header', 'header', 'header'], ['nav', 'main', 'aside'], ['footer', 'footer', 'footer']]
    },
    {
      id: 'sidebar', nome: 'Sidebar',
      descr: 'Una colonna laterale a sinistra per tutta l\'altezza, il resto a destra.',
      cols: ['1fr', '3fr'], rows: ['1fr', '3fr', '1fr'],
      areas: [['aside', 'header'], ['aside', 'main'], ['aside', 'footer']]
    },
    {
      id: 'dashboard', nome: 'Dashboard',
      descr: 'Menu laterale a tutta altezza, header in alto, contenuto e aside, footer in basso.',
      cols: ['1fr', '2fr', '1fr'], rows: ['1fr', '3fr', '1fr'],
      areas: [['nav', 'header', 'header'], ['nav', 'main', 'aside'], ['nav', 'footer', 'footer']]
    },
    {
      id: 'magazine', nome: 'Magazine',
      descr: 'Contenuto grande a sinistra, aside alto a destra, due riquadri in basso.',
      cols: ['2fr', '1fr', '1fr'], rows: ['1fr', '2fr', '1fr'],
      areas: [['header', 'header', 'header'], ['main', 'main', 'aside'], ['footer', 'nav', 'aside']]
    },
    {
      id: 'hero', nome: 'Hero',
      descr: 'Un blocco grande in alto (hero) e tre riquadri sotto.',
      cols: ['1fr', '1fr', '1fr'], rows: ['3fr', '1fr', '1fr'],
      areas: [['header', 'header', 'header'], ['main', 'main', 'main'], ['nav', 'aside', 'footer']]
    }
  ];

  function clone(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function fromPreset(id) {
    var p = PRESETS.filter(function (x) { return x.id === id; })[0] || PRESETS[0];
    return { preset: p.id, cols: p.cols.slice(), rows: p.rows.slice(), areas: clone(p.areas), colGap: 12, rowGap: 12, place: 'stretch' };
  }

  function sizeOf(state) {
    return { r: state.areas.length, c: state.areas[0] ? state.areas[0].length : 0 };
  }

  /* Rettangolo che contiene tutte le celle di un'area; null se l'area non c'è. */
  function rectOf(areas, name) {
    var r1 = Infinity, c1 = Infinity, r2 = -1, c2 = -1;
    areas.forEach(function (row, r) {
      row.forEach(function (n, c) {
        if (n !== name) return;
        r1 = Math.min(r1, r); c1 = Math.min(c1, c);
        r2 = Math.max(r2, r); c2 = Math.max(c2, c);
      });
    });
    return r2 < 0 ? null : { r1: r1, c1: c1, r2: r2, c2: c2 };
  }

  /* Vero se ogni area (tranne '.') occupa esattamente un rettangolo: è la regola di grid-template-areas. */
  function isValid(areas) {
    var names = {};
    areas.forEach(function (row) { row.forEach(function (n) { if (n !== '.') names[n] = true; }); });
    return Object.keys(names).every(function (n) {
      var rc = rectOf(areas, n);
      for (var r = rc.r1; r <= rc.r2; r++) for (var c = rc.c1; c <= rc.c2; c++) if (areas[r][c] !== n) return false;
      return true;
    });
  }

  function placed(state) {
    var out = [];
    AREAS.forEach(function (a) { if (rectOf(state.areas, a.id)) out.push(a.id); });
    return out;
  }

  function unplaced(state) {
    return AREAS.map(function (a) { return a.id; }).filter(function (id) { return !rectOf(state.areas, id); });
  }

  /* Scambia due aree: ognuna prende il posto dell'altra (con qualsiasi forma, il risultato resta valido). */
  function swap(state, a, b) {
    if (a === b) return state;
    var s = clone(state);
    s.areas = s.areas.map(function (row) { return row.map(function (n) { return n === a ? b : n === b ? a : n; }); });
    return s;
  }

  /* Sposta un'area con l'angolo in alto a sinistra in (r, c): serve che le celle di arrivo siano libere. */
  function moveTo(state, name, r, c) {
    var rc = rectOf(state.areas, name);
    if (!rc) return null;
    var h = rc.r2 - rc.r1 + 1, w = rc.c2 - rc.c1 + 1, sz = sizeOf(state);
    if (r < 0 || c < 0 || r + h > sz.r || c + w > sz.c) return null;
    for (var i = r; i < r + h; i++) for (var j = c; j < c + w; j++) {
      var n = state.areas[i][j];
      if (n !== '.' && n !== name) return null;
    }
    var s = clone(state);
    for (var a = rc.r1; a <= rc.r2; a++) for (var b = rc.c1; b <= rc.c2; b++) s.areas[a][b] = '.';
    for (var x = r; x < r + h; x++) for (var y = c; y < c + w; y++) s.areas[x][y] = name;
    return s;
  }

  /* Allarga o restringe un'area fino alla cella (r, c): l'angolo in alto a sinistra resta fermo. */
  function resizeTo(state, name, r, c) {
    var rc = rectOf(state.areas, name);
    if (!rc) return null;
    var r2 = Math.max(r, rc.r1), c2 = Math.max(c, rc.c1), sz = sizeOf(state);
    if (r2 >= sz.r || c2 >= sz.c) return null;
    if (r2 === rc.r2 && c2 === rc.c2) return state;
    for (var i = rc.r1; i <= r2; i++) for (var j = rc.c1; j <= c2; j++) {
      var n = state.areas[i][j];
      if (n !== '.' && n !== name) return null;
    }
    var s = clone(state);
    for (var a = rc.r1; a <= rc.r2; a++) for (var b = rc.c1; b <= rc.c2; b++) s.areas[a][b] = '.';
    for (var x = rc.r1; x <= r2; x++) for (var y = rc.c1; y <= c2; y++) s.areas[x][y] = name;
    return s;
  }

  /* Tastiera: sposta (o scambia con il vicino) un'area di una cella nella direzione data. */
  function nudge(state, name, dr, dc) {
    var rc = rectOf(state.areas, name);
    if (!rc) return null;
    var sz = sizeOf(state);
    var tr = dr < 0 ? rc.r1 - 1 : dr > 0 ? rc.r2 + 1 : rc.r1;
    var tc = dc < 0 ? rc.c1 - 1 : dc > 0 ? rc.c2 + 1 : rc.c1;
    if (tr < 0 || tc < 0 || tr >= sz.r || tc >= sz.c) return null;
    var other = state.areas[tr][tc];
    if (other !== '.' && other !== name) return swap(state, name, other);
    return moveTo(state, name, rc.r1 + dr, rc.c1 + dc);
  }

  /* Tastiera: allarga (dr/dc positivi) o restringe (negativi) l'area dal lato destro/basso. */
  function stretch(state, name, dr, dc) {
    var rc = rectOf(state.areas, name);
    if (!rc) return null;
    var nr = rc.r2 + dr, nc = rc.c2 + dc;
    if (nr < rc.r1 || nc < rc.c1) return null;
    return resizeTo(state, name, nr, nc);
  }

  function validTrack(v) {
    return /^(auto|min-content|max-content|0|\d*\.?\d+(fr|px|%|rem|em|vw|vh|ch)|(minmax|fit-content)\([^()]{1,40}\))$/i.test(String(v).trim());
  }

  function setTrack(state, axis, i, value) {
    var v = String(value).trim().toLowerCase();
    if (!validTrack(v) || !state[axis] || i < 0 || i >= state[axis].length) return null;
    var s = clone(state);
    s[axis][i] = v;
    return s;
  }

  function addTrack(state, axis) {
    var s = clone(state);
    if (s[axis].length >= 8) return null;
    s[axis].push('1fr');
    if (axis === 'cols') s.areas.forEach(function (row) { row.push('.'); });
    else s.areas.push(s.areas[0].map(function () { return '.'; }));
    return s;
  }

  /* Toglie l'ultima colonna o riga. Ritorna { state, tolte } con i nomi delle aree sparite del tutto. */
  function removeTrack(state, axis) {
    if (state[axis].length <= 1) return null;
    var before = placed(state);
    var s = clone(state);
    s[axis].pop();
    if (axis === 'cols') s.areas.forEach(function (row) { row.pop(); });
    else s.areas.pop();
    var after = placed(s);
    return { state: s, tolte: before.filter(function (n) { return after.indexOf(n) === -1; }) };
  }

  /* Rimette in griglia un'area tolta, nella prima cella libera. */
  function place(state, name) {
    if (rectOf(state.areas, name)) return null;
    for (var r = 0; r < state.areas.length; r++) for (var c = 0; c < state.areas[r].length; c++) {
      if (state.areas[r][c] === '.') {
        var s = clone(state);
        s.areas[r][c] = name;
        return s;
      }
    }
    return null;
  }

  function areaLines(state) {
    return state.areas.map(function (row) { return '"' + row.join(' ') + '"'; });
  }

  function gapDecl(state) {
    return state.colGap === state.rowGap ? 'gap: ' + state.colGap + 'px;' : 'gap: ' + state.rowGap + 'px ' + state.colGap + 'px;';
  }

  /* opts: { cls: 'layout', base: true (stile di base), stack: true (una colonna su schermo stretto), neutro } */
  function buildCss(state, opts) {
    var o = opts || {};
    var cls = o.cls || 'layout';
    var out = [];
    out.push('.' + cls + ' {');
    out.push('  display: grid;');
    out.push('  grid-template-columns: ' + state.cols.join(' ') + ';');
    out.push('  grid-template-rows: ' + state.rows.join(' ') + ';');
    out.push('  ' + gapDecl(state));
    out.push('  place-items: ' + state.place + ';');
    out.push('  grid-template-areas:');
    areaLines(state).forEach(function (l, i, arr) { out.push('    ' + l + (i === arr.length - 1 ? ';' : '')); });
    out.push('}');
    var ids = placed(state);
    if (ids.length) out.push('');
    ids.forEach(function (id) { out.push('.' + cls + ' > .' + id + ' { grid-area: ' + id + '; }'); });
    if (o.base !== false) {
      out.push('');
      out.push('.' + cls + ' > * {');
      out.push('  padding: var(--cat-space-3, 1rem);');
      out.push('  border: 1px solid var(--cat-color-border, #8f8f8f);');
      out.push('  border-radius: var(--cat-radius-md, 0.5rem);');
      out.push('  background: var(--cat-color-surface, #ffffff);');
      out.push('}');
    }
    if (o.stack !== false && ids.length) {
      out.push('');
      out.push('@media (max-width: 767.98px) {');
      out.push('  .' + cls + ' {');
      out.push('    grid-template-columns: 1fr;');
      out.push('    grid-template-rows: auto;');
      out.push('    grid-template-areas:');
      ids.forEach(function (id, i) { out.push('      "' + id + '"' + (i === ids.length - 1 ? ';' : '')); });
      out.push('  }');
      out.push('}');
    }
    return out.join('\n') + '\n';
  }

  function buildHtml(state, opts) {
    var cls = (opts && opts.cls) || 'layout';
    var ids = placed(state);
    var out = ['<div class="' + cls + '">'];
    AREAS.forEach(function (a) {
      if (ids.indexOf(a.id) === -1) return;
      out.push('  <' + a.tag + ' class="' + a.id + '">' + a.testo + '</' + a.tag + '>');
    });
    out.push('</div>');
    return out.join('\n') + '\n';
  }

  return {
    AREAS: AREAS, PLACE: PLACE, PRESETS: PRESETS,
    fromPreset: fromPreset, clone: clone, sizeOf: sizeOf, rectOf: rectOf, isValid: isValid,
    placed: placed, unplaced: unplaced, swap: swap, moveTo: moveTo, resizeTo: resizeTo, nudge: nudge, stretch: stretch,
    validTrack: validTrack, setTrack: setTrack, addTrack: addTrack, removeTrack: removeTrack, place: place,
    areaLines: areaLines, buildCss: buildCss, buildHtml: buildHtml
  };
});
