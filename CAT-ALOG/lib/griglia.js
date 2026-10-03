'use strict';

/*
 * Sistema a griglia container › row › col (12 colonne, mobile-first, flexbox), nello stile di Bootstrap 5.
 * Genera le regole una per una: servono sia al catalogo Classi sia alle strutture di esempio.
 *   rules() -> [{ cls, gruppo, descrizione, css }] nell'ordine giusto della cascata.
 */

const BP = [
  { k: 'sm', px: 576 },
  { k: 'md', px: 768 },
  { k: 'lg', px: 992 },
  { k: 'xl', px: 1200 }
];

const P = 'cat-';

function fmt(selector, decls, px) {
  const body = decls.map(function (d) { return '  ' + d + ';'; }).join('\n');
  const rule = selector + ' {\n' + body + '\n}';
  if (!px) return rule;
  return '@media (min-width: ' + px + 'px) {\n' + rule.replace(/^/gm, '  ') + '\n}';
}

function pct(n) {
  const v = (n / 12) * 100;
  return (Math.round(v * 1e6) / 1e6) + '%';
}

function rules() {
  const out = [];
  function add(cls, gruppo, descrizione, selector, decls, px) {
    out.push({ cls: cls, gruppo: gruppo, descrizione: descrizione, css: fmt(selector, decls, px) });
  }

  /* contenitori */
  const G1 = 'Griglia · Contenitore';
  add(P + 'container-fluid', G1, 'Contenitore a tutta larghezza, con un po\' di margine ai lati', '.' + P + 'container-fluid', [
    'box-sizing: border-box', 'width: 100%', 'padding-inline: calc(var(--cat-gutter, 1.5rem) * 0.5)', 'margin-inline: auto'
  ]);
  add(P + 'container', G1, 'Contenitore centrato: largo quanto lo schermo, poi fisso a 540, 720, 960, 1140, 1320 px', '.' + P + 'container', [
    'box-sizing: border-box', 'width: 100%', 'padding-inline: calc(var(--cat-gutter, 1.5rem) * 0.5)', 'margin-inline: auto'
  ]);
  [[576, 540], [768, 720], [992, 960], [1200, 1140], [1400, 1320]].forEach(function (w) {
    out[out.length - 1].css += '\n\n' + fmt('.' + P + 'container', ['max-width: ' + w[1] + 'px'], w[0]);
  });
  const widths = [
    ['sm', 576, 540], ['md', 768, 720], ['lg', 992, 960], ['xl', 1200, 1140], ['xxl', 1400, 1320]
  ];
  widths.forEach(function (w) {
    add(P + 'container-' + w[0], G1,
      'Largo quanto lo schermo fino a ' + w[1] + ' px, poi fisso a ' + w[2] + ' px e centrato',
      '.' + P + 'container-' + w[0], ['box-sizing: border-box', 'width: 100%', 'padding-inline: calc(var(--cat-gutter, 1.5rem) * 0.5)', 'margin-inline: auto']);
    out[out.length - 1].css += '\n\n' + fmt('.' + P + 'container-' + w[0], ['max-width: ' + w[2] + 'px'], w[1]);
  });

  /* riga e gutter */
  const G2 = 'Griglia · Riga e gutter';
  add(P + 'row', G2, 'Riga: contiene le colonne, che vanno a capo da sole (gutter di 1,5rem, modificabile con --cat-gutter)', '.' + P + 'row', [
    '--cat-gx: var(--cat-gutter, 1.5rem)', '--cat-gy: 0', 'display: flex', 'flex-wrap: wrap',
    'margin-top: calc(var(--cat-gy) * -1)', 'margin-inline: calc(var(--cat-gx) * -0.5)'
  ]);
  out[out.length - 1].css += '\n\n' + fmt('.' + P + 'row > *', [
    'box-sizing: border-box', 'flex-shrink: 0', 'width: 100%', 'max-width: 100%',
    'padding-inline: calc(var(--cat-gx) * 0.5)', 'margin-top: var(--cat-gy)'
  ]);
  const sizes = ['0', '0.25rem', '0.5rem', '1rem', '1.5rem', '3rem'];
  sizes.forEach(function (s, i) {
    add(P + 'g-' + i, G2, 'Spazio tra le colonne (orizzontale e verticale): ' + s, '.' + P + 'g-' + i, ['--cat-gx: ' + s, '--cat-gy: ' + s]);
  });
  sizes.forEach(function (s, i) {
    add(P + 'gx-' + i, G2, 'Spazio orizzontale tra le colonne: ' + s, '.' + P + 'gx-' + i, ['--cat-gx: ' + s]);
  });
  sizes.forEach(function (s, i) {
    add(P + 'gy-' + i, G2, 'Spazio verticale tra le righe: ' + s, '.' + P + 'gy-' + i, ['--cat-gy: ' + s]);
  });

  /* colonne uguali (prima delle «colonne per riga», così queste ultime hanno la precedenza) */
  [{ k: '', px: 0 }].concat(BP).forEach(function (b) {
    const pre = P + 'col' + (b.k ? '-' + b.k : '');
    add(pre, 'Griglia · Colonne uguali', 'Colonne di larghezza uguale' + (b.px ? ' da ' + b.px + ' px in su' : ''), '.' + pre, ['flex: 1 0 0%'], b.px);
  });

  /* colonne per riga */
  const G3 = 'Griglia · Colonne per riga';
  [{ k: '', px: 0 }].concat(BP).forEach(function (b) {
    for (let n = 1; n <= 6; n++) {
      const cls = P + 'row-cols-' + (b.k ? b.k + '-' : '') + n;
      add(cls, G3, n + ' colonne per riga' + (b.px ? ' da ' + b.px + ' px in su' : ''), '.' + cls + ' > *', ['flex: 0 0 auto', 'width: ' + pct(12 / n)], b.px);
    }
  });

  /* colonne */
  function cols(b, gruppo) {
    const pre = P + 'col' + (b.k ? '-' + b.k : '');
    const da = b.px ? ' da ' + b.px + ' px in su' : '';
    add(pre + '-auto', gruppo, 'Colonna larga quanto il suo contenuto' + da, '.' + pre + '-auto', ['flex: 0 0 auto', 'width: auto'], b.px);
    for (let n = 1; n <= 12; n++) {
      add(pre + '-' + n, gruppo, n + ' colonne su 12' + da, '.' + pre + '-' + n, ['flex: 0 0 auto', 'width: ' + pct(n)], b.px);
    }
  }
  cols({ k: '', px: 0 }, 'Griglia · Colonne');
  BP.forEach(function (b) { cols(b, 'Griglia · Colonne ' + b.k + ' (≥ ' + b.px + ' px)'); });

  /* offset */
  const G4 = 'Griglia · Offset';
  [{ k: '', px: 0 }, BP[1], BP[2]].forEach(function (b) {
    for (let n = b.px ? 0 : 1; n <= 11; n++) {
      const cls = P + 'offset-' + (b.k ? b.k + '-' : '') + n;
      add(cls, G4, n ? 'Sposta a destra di ' + n + ' colonne' + (b.px ? ' da ' + b.px + ' px in su' : '') : 'Azzera lo spostamento da ' + b.px + ' px in su',
        '.' + cls, ['margin-left: ' + (n ? pct(n) : '0')], b.px);
    }
  });

  /* ordine */
  const G5 = 'Griglia · Ordine';
  [{ k: '', px: 0 }, BP[1], BP[2]].forEach(function (b) {
    const pre = P + 'order-' + (b.k ? b.k + '-' : '');
    add(pre + 'first', G5, 'Mette la colonna per prima' + (b.px ? ' da ' + b.px + ' px in su' : ''), '.' + pre + 'first', ['order: -1'], b.px);
    for (let n = 0; n <= 5; n++) {
      add(pre + n, G5, 'Posizione ' + n + (b.px ? ' da ' + b.px + ' px in su' : ''), '.' + pre + n, ['order: ' + n], b.px);
    }
    add(pre + 'last', G5, 'Mette la colonna per ultima' + (b.px ? ' da ' + b.px + ' px in su' : ''), '.' + pre + 'last', ['order: 6'], b.px);
  });

  /* allineamento */
  const G6 = 'Griglia · Allineamento';
  [['start', 'flex-start'], ['center', 'center'], ['end', 'flex-end'], ['stretch', 'stretch']].forEach(function (a) {
    add(P + 'align-items-' + a[0], G6, 'Allinea tutte le colonne in verticale: ' + a[0], '.' + P + 'align-items-' + a[0], ['align-items: ' + a[1]]);
  });
  [['start', 'flex-start'], ['center', 'center'], ['end', 'flex-end']].forEach(function (a) {
    add(P + 'align-self-' + a[0], G6, 'Allinea questa colonna in verticale: ' + a[0], '.' + P + 'align-self-' + a[0], ['align-self: ' + a[1]]);
  });
  [['start', 'flex-start'], ['center', 'center'], ['end', 'flex-end'], ['between', 'space-between'], ['around', 'space-around'], ['evenly', 'space-evenly']].forEach(function (a) {
    add(P + 'justify-' + a[0], G6, 'Distribuisce le colonne in orizzontale: ' + a[0], '.' + P + 'justify-' + a[0], ['justify-content: ' + a[1]]);
  });

  return out;
}

/* Raggruppa le regole nel formato del catalogo Classi. */
function gruppiClassi(escludi) {
  const skip = new Set(escludi || []);
  const map = new Map();
  rules().forEach(function (r) {
    if (skip.has(r.cls)) return;
    if (!map.has(r.gruppo)) map.set(r.gruppo, []);
    map.get(r.gruppo).push({ nome: r.cls, descrizione: r.descrizione, css: r.css });
  });
  return Array.from(map.entries()).map(function (e) { return { nome: e[0], classi: e[1] }; });
}

/* Solo le regole usate in un pezzo di HTML (più quelle di base): per strutture copiabili e leggere. */
function cssFor(html) {
  const used = new Set();
  String(html).replace(/class\s*=\s*"([^"]*)"/g, function (_, v) {
    v.split(/\s+/).forEach(function (c) { if (c) used.add(c); });
    return _;
  });
  const needRow = used.has(P + 'row');
  return rules()
    .filter(function (r) {
      return used.has(r.cls) || (needRow && r.cls === P + 'row' && true);
    })
    .map(function (r) { return r.css; })
    .join('\n\n') + '\n';
}

module.exports = { rules: rules, gruppiClassi: gruppiClassi, cssFor: cssFor, BP: BP };
