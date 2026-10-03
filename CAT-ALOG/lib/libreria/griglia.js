'use strict';

/* Strutture con il sistema a griglia container › row › col. Il CSS contiene solo le regole usate nell'HTML. */

const { cssFor } = require('../griglia');

const EXTRA =
  '\n.cat-demo {\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-1, 0.25rem);\n  border: 1px solid var(--cat-color-border, #d9d9d2);\n  border-radius: var(--cat-radius-sm, 0.25rem);\n  background: var(--cat-color-surface, #fff);\n  text-align: center;\n  overflow-wrap: anywhere;\n}\n\n.cat-mt {\n  margin-top: var(--cat-space-3, 1rem);\n}\n';

function item(nome, descrizione, tag, html) {
  return { nome: nome, descrizione: descrizione, tag: ['griglia', 'bootstrap'].concat(tag), html: html, css: cssFor(html) + EXTRA, js: '' };
}

const box = (cls, txt) => '<div class="' + cls + '"><div class="cat-demo">' + txt + '</div></div>';

module.exports = [
  item(
    'Griglia: come funziona (container › row › col)',
    'Tutte le combinazioni: 12 colonne, metà, uguali, auto, offset, ordine',
    ['riferimento'],
    `<div class="cat-container">
  <!-- 1. Dodici colonne: ogni riga somma al massimo 12 -->
  <div class="cat-row cat-g-2">
    ${Array.from({ length: 12 }, (_, i) => box('cat-col-1', String(i + 1))).join('\n    ')}
  </div>

  <!-- 2. Metà e metà da tablet (md, 768 px) in su; sotto, impilate -->
  <div class="cat-row cat-g-2 cat-mt">
    ${box('cat-col-12 cat-col-md-6', 'col-12 col-md-6')}
    ${box('cat-col-12 cat-col-md-6', 'col-12 col-md-6')}
  </div>

  <!-- 3. Tre uguali: .cat-col senza numero si divide lo spazio -->
  <div class="cat-row cat-g-2 cat-mt">
    ${box('cat-col', 'col')}
    ${box('cat-col', 'col')}
    ${box('cat-col', 'col')}
  </div>

  <!-- 4. Una larga quanto il suo contenuto, le altre si dividono il resto -->
  <div class="cat-row cat-g-2 cat-mt">
    ${box('cat-col-auto', 'auto')}
    ${box('cat-col', 'col')}
    ${box('cat-col-md-3', 'col-md-3')}
  </div>

  <!-- 5. Colonna centrata con offset -->
  <div class="cat-row cat-g-2 cat-mt">
    ${box('cat-col-md-6 cat-offset-md-3', 'col-md-6 offset-md-3')}
  </div>

  <!-- 6. Ordine: su telefono la terza va per prima -->
  <div class="cat-row cat-g-2 cat-mt">
    ${box('cat-col-md-4', 'uno')}
    ${box('cat-col-md-4', 'due')}
    ${box('cat-col-md-4 cat-order-first cat-order-md-last', 'tre (prima su telefono)')}
  </div>
</div>
`
  ),
  item(
    'Griglia: due colonne 50/50',
    'Impilate sotto i 768 px, affiancate da lì in su',
    ['colonne'],
    `<div class="cat-container">
  <div class="cat-row cat-g-4">
    <div class="cat-col-12 cat-col-md-6"><h2>Colonna uno</h2><p>Testo di esempio.</p></div>
    <div class="cat-col-12 cat-col-md-6"><h2>Colonna due</h2><p>Testo di esempio.</p></div>
  </div>
</div>
`
  ),
  item(
    'Griglia: tre colonne uguali',
    'Una, poi due (sm), poi tre (lg) per riga',
    ['colonne'],
    `<div class="cat-container">
  <div class="cat-row cat-g-4">
    <div class="cat-col-12 cat-col-sm-6 cat-col-lg-4">${'<div class="cat-demo">Uno</div>'}</div>
    <div class="cat-col-12 cat-col-sm-6 cat-col-lg-4">${'<div class="cat-demo">Due</div>'}</div>
    <div class="cat-col-12 cat-col-sm-12 cat-col-lg-4">${'<div class="cat-demo">Tre</div>'}</div>
  </div>
</div>
`
  ),
  item(
    'Griglia: sidebar 3/9',
    'Sidebar a sinistra (3 colonne) e contenuto (9) da lg in su; sotto, la sidebar sta sopra',
    ['sidebar'],
    `<div class="cat-container">
  <div class="cat-row cat-g-4">
    <aside class="cat-col-12 cat-col-lg-3"><div class="cat-demo">Sidebar</div></aside>
    <main class="cat-col-12 cat-col-lg-9"><div class="cat-demo">Contenuto principale</div></main>
  </div>
</div>
`
  ),
  item(
    'Griglia: sidebar, contenuto, sidebar (2/8/2)',
    'Tre fasce da xl in su; il contenuto va per primo su schermo stretto',
    ['sidebar'],
    `<div class="cat-container">
  <div class="cat-row cat-g-3">
    <aside class="cat-col-12 cat-col-xl-2 cat-order-last cat-order-xl-first"><div class="cat-demo">Sinistra</div></aside>
    <main class="cat-col-12 cat-col-xl-8 cat-order-first cat-order-xl-1"><div class="cat-demo">Contenuto</div></main>
    <aside class="cat-col-12 cat-col-xl-2 cat-order-last"><div class="cat-demo">Destra</div></aside>
  </div>
</div>
`
  ),
  item(
    'Griglia: card 1-2-4 per riga',
    'Row-cols: una colonna su telefono, due da sm, quattro da lg',
    ['card', 'row-cols'],
    `<div class="cat-container">
  <div class="cat-row cat-row-cols-1 cat-row-cols-sm-2 cat-row-cols-lg-4 cat-g-3">
    ${Array.from({ length: 8 }, (_, i) => '<div class="cat-col"><div class="cat-demo">Card ' + (i + 1) + '</div></div>').join('\n    ')}
  </div>
</div>
`
  ),
  item(
    'Griglia: colonna centrata',
    'Una colonna larga 6 su 12, centrata con offset',
    ['centro', 'offset'],
    `<div class="cat-container">
  <div class="cat-row">
    <div class="cat-col-12 cat-col-md-8 cat-offset-md-2 cat-col-lg-6 cat-offset-lg-3"><div class="cat-demo">Contenuto centrato</div></div>
  </div>
</div>
`
  ),
  item(
    'Griglia: allineamenti verticali e orizzontali',
    'align-items e justify per allineare le colonne dentro la riga',
    ['allineamento'],
    `<div class="cat-container">
  <div class="cat-row cat-g-2 cat-align-items-center cat-justify-between" style="min-height:8rem;background:rgb(0 0 0 / 0.04)">
    <div class="cat-col-4"><div class="cat-demo" style="height:5rem">Alta</div></div>
    <div class="cat-col-3"><div class="cat-demo">Centrata</div></div>
    <div class="cat-col-3 cat-align-self-end"><div class="cat-demo">In basso</div></div>
  </div>
</div>
`
  )
];
