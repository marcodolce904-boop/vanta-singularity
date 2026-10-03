'use strict';

/*
 * Contenuti di esempio. Servono solo a far vedere come funziona la struttura:
 * si possono modificare o cancellare dall'app. Vengono scritti una volta sola,
 * quando la cartella dei dati è nuova.
 */

function c(nome, descrizione, css) {
  return { nome: nome, descrizione: descrizione, css: css };
}

const strutture = [
  {
    nome: 'Riga centrata',
    descrizione: 'Contenuto centrato in orizzontale e in verticale',
    tag: ['flex', 'centro'],
    html: '<div class="cat-center">\n  <p>Contenuto centrato in orizzontale e in verticale</p>\n</div>\n',
    css: '.cat-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 12rem;\n  padding: var(--cat-space-3, 1rem);\n  text-align: center;\n}\n'
  },
  {
    nome: 'Due colonne 50/50',
    descrizione: 'Due colonne che si impilano su schermo stretto',
    tag: ['flex', 'colonne'],
    html: '<div class="cat-cols-2">\n  <div class="cat-cols-2__item">\n    <h2>Colonna uno</h2>\n    <p>Testo di esempio.</p>\n  </div>\n  <div class="cat-cols-2__item">\n    <h2>Colonna due</h2>\n    <p>Testo di esempio.</p>\n  </div>\n</div>\n',
    css: '.cat-cols-2 {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-gap, 1rem);\n}\n\n.cat-cols-2__item {\n  flex: 1 1 20rem;\n}\n'
  },
  {
    nome: 'Card che vanno a capo',
    descrizione: 'Da tre card per riga a una sola su schermo stretto',
    tag: ['flex', 'card'],
    html: '<div class="cat-cards">\n  <article class="cat-card"><h2>Card uno</h2><p>Testo di esempio.</p></article>\n  <article class="cat-card"><h2>Card due</h2><p>Testo di esempio.</p></article>\n  <article class="cat-card"><h2>Card tre</h2><p>Testo di esempio.</p></article>\n</div>\n',
    css: '.cat-cards {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-gap, 1rem);\n}\n\n.cat-card {\n  flex: 1 1 17rem;\n  padding: var(--cat-space-3, 1rem);\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-surface, #ffffff);\n}\n'
  },
  {
    nome: 'Sidebar + contenuto',
    descrizione: 'La sidebar va sopra il contenuto su schermo stretto',
    tag: ['flex', 'sidebar'],
    html: '<div class="cat-sidebar">\n  <aside class="cat-sidebar__side">\n    <h2>Sidebar</h2>\n    <p>Menu o filtri.</p>\n  </aside>\n  <section class="cat-sidebar__main">\n    <h1>Contenuto</h1>\n    <p>Testo di esempio.</p>\n  </section>\n</div>\n',
    css: '.cat-sidebar {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-gap, 1rem);\n}\n\n.cat-sidebar__side {\n  flex: 1 1 14rem;\n}\n\n.cat-sidebar__main {\n  flex: 3 1 24rem;\n}\n'
  },
  {
    nome: 'Header logo e menu',
    descrizione: 'Logo a sinistra, menu a destra; il menu va sotto il logo su schermo stretto',
    tag: ['flex', 'header'],
    html: '<header class="cat-header">\n  <a class="cat-header__logo" href="#">Logo</a>\n  <nav class="cat-header__nav" aria-label="Principale">\n    <a href="#">Home</a>\n    <a href="#">Lavori</a>\n    <a href="#">Contatti</a>\n  </nav>\n</header>\n',
    css: '.cat-header {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: var(--cat-gap, 1rem);\n  padding: var(--cat-space-3, 1rem);\n}\n\n.cat-header__nav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-gap, 1rem);\n}\n'
  },
  {
    nome: 'Footer a 4 colonne',
    descrizione: 'Quattro colonne, poi due, poi una',
    tag: ['flex', 'footer'],
    html: '<footer class="cat-footer-cols">\n  <div><h3>Colonna uno</h3><p>Testo.</p></div>\n  <div><h3>Colonna due</h3><p>Testo.</p></div>\n  <div><h3>Colonna tre</h3><p>Testo.</p></div>\n  <div><h3>Colonna quattro</h3><p>Testo.</p></div>\n</footer>\n',
    css: '.cat-footer-cols {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2rem;\n  padding: 2rem var(--cat-space-3, 1rem);\n}\n\n.cat-footer-cols > * {\n  flex: 1 1 12rem;\n}\n'
  }
];

const componenti = [
  {
    nome: 'Pulsante',
    descrizione: 'Pulsante primario e secondario',
    tag: ['pulsante'],
    html: '<button type="button" class="cat-btn">Primario</button>\n<button type="button" class="cat-btn cat-btn--alt">Secondario</button>\n',
    css: '.cat-btn {\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  border: 0;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #111111);\n  color: #ffffff;\n  font: inherit;\n  cursor: pointer;\n  transition: transform var(--cat-duration, 200ms) var(--cat-ease, ease);\n}\n\n.cat-btn--alt {\n  background: var(--cat-color-secondary, #404040);\n}\n\n.cat-btn:hover {\n  transform: translateY(-1px);\n}\n\n.cat-btn:focus-visible {\n  outline: 3px solid var(--cat-color-accent, #005fcc);\n  outline-offset: 2px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-btn { transition: none; }\n  .cat-btn:hover { transform: none; }\n}\n',
    js: ''
  },
  {
    nome: 'Accordion',
    descrizione: 'Pannelli che si aprono e chiudono, con tastiera e aria',
    tag: ['accordion', 'js'],
    html: '<div class="cat-accordion">\n  <h3><button type="button" class="cat-accordion__trigger" aria-expanded="false" aria-controls="cat-acc-1">Domanda uno</button></h3>\n  <div id="cat-acc-1" class="cat-accordion__panel" hidden><p>Risposta uno.</p></div>\n  <h3><button type="button" class="cat-accordion__trigger" aria-expanded="false" aria-controls="cat-acc-2">Domanda due</button></h3>\n  <div id="cat-acc-2" class="cat-accordion__panel" hidden><p>Risposta due.</p></div>\n</div>\n',
    css: '.cat-accordion h3 {\n  margin: 0;\n}\n\n.cat-accordion__trigger {\n  width: 100%;\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  background: var(--cat-color-surface, #ffffff);\n  color: inherit;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n}\n\n.cat-accordion__panel {\n  padding: var(--cat-space-3, 1rem);\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-top: 0;\n}\n',
    js: "document.querySelectorAll('.cat-accordion__trigger').forEach(function (btn) {\n  btn.addEventListener('click', function () {\n    var aperto = btn.getAttribute('aria-expanded') === 'true';\n    btn.setAttribute('aria-expanded', String(!aperto));\n    document.getElementById(btn.getAttribute('aria-controls')).hidden = aperto;\n  });\n});\n"
  }
];

const classi = {
  gruppi: [
    {
      nome: 'Flex',
      classi: [
        c('cat-flex', 'Display flex', '.cat-flex {\n  display: flex;\n}'),
        c('cat-flex-col', 'Direzione colonna', '.cat-flex-col {\n  flex-direction: column;\n}'),
        c('cat-flex-wrap', 'Va a capo', '.cat-flex-wrap {\n  flex-wrap: wrap;\n}'),
        c('cat-justify-start', 'Allinea all\'inizio (asse principale)', '.cat-justify-start {\n  justify-content: flex-start;\n}'),
        c('cat-justify-center', 'Centra (asse principale)', '.cat-justify-center {\n  justify-content: center;\n}'),
        c('cat-justify-between', 'Spazio tra gli elementi', '.cat-justify-between {\n  justify-content: space-between;\n}'),
        c('cat-justify-end', 'Allinea alla fine (asse principale)', '.cat-justify-end {\n  justify-content: flex-end;\n}'),
        c('cat-items-start', 'Allinea in alto (asse trasversale)', '.cat-items-start {\n  align-items: flex-start;\n}'),
        c('cat-items-center', 'Centra (asse trasversale)', '.cat-items-center {\n  align-items: center;\n}'),
        c('cat-items-end', 'Allinea in basso (asse trasversale)', '.cat-items-end {\n  align-items: flex-end;\n}'),
        c('cat-grow', 'Occupa lo spazio libero', '.cat-grow {\n  flex-grow: 1;\n}'),
        c('cat-shrink-0', 'Non si restringe', '.cat-shrink-0 {\n  flex-shrink: 0;\n}'),
        c('cat-gap-1', 'Spazio piccolo tra gli elementi', '.cat-gap-1 {\n  gap: var(--cat-space-1, 0.25rem);\n}'),
        c('cat-gap-2', 'Spazio medio tra gli elementi', '.cat-gap-2 {\n  gap: var(--cat-space-2, 0.5rem);\n}'),
        c('cat-gap-3', 'Spazio grande tra gli elementi', '.cat-gap-3 {\n  gap: var(--cat-space-3, 1rem);\n}')
      ]
    },
    {
      nome: 'Spaziature',
      classi: [
        c('cat-p-1', 'Padding piccolo', '.cat-p-1 {\n  padding: var(--cat-space-1, 0.25rem);\n}'),
        c('cat-p-2', 'Padding medio', '.cat-p-2 {\n  padding: var(--cat-space-2, 0.5rem);\n}'),
        c('cat-p-3', 'Padding grande', '.cat-p-3 {\n  padding: var(--cat-space-3, 1rem);\n}'),
        c('cat-m-1', 'Margine piccolo', '.cat-m-1 {\n  margin: var(--cat-space-1, 0.25rem);\n}'),
        c('cat-m-2', 'Margine medio', '.cat-m-2 {\n  margin: var(--cat-space-2, 0.5rem);\n}'),
        c('cat-m-3', 'Margine grande', '.cat-m-3 {\n  margin: var(--cat-space-3, 1rem);\n}'),
        c('cat-mt-2', 'Margine sopra', '.cat-mt-2 {\n  margin-top: var(--cat-space-2, 0.5rem);\n}'),
        c('cat-mb-2', 'Margine sotto', '.cat-mb-2 {\n  margin-bottom: var(--cat-space-2, 0.5rem);\n}'),
        c('cat-mx-auto', 'Centra il blocco in orizzontale', '.cat-mx-auto {\n  margin-inline: auto;\n}')
      ]
    },
    {
      nome: 'Testo',
      classi: [
        c('cat-text-sm', 'Testo piccolo', '.cat-text-sm {\n  font-size: 0.875rem;\n}'),
        c('cat-text-lg', 'Testo grande', '.cat-text-lg {\n  font-size: var(--cat-text-lg, 1.25rem);\n}'),
        c('cat-text-center', 'Testo centrato', '.cat-text-center {\n  text-align: center;\n}'),
        c('cat-text-bold', 'Testo in grassetto', '.cat-text-bold {\n  font-weight: var(--cat-weight-bold, 700);\n}'),
        c('cat-text-muted', 'Testo attenuato', '.cat-text-muted {\n  color: var(--cat-color-text-muted, #4a4a4a);\n}')
      ]
    },
    {
      nome: 'Display e visibilità',
      classi: [
        c('cat-block', 'Display block', '.cat-block {\n  display: block;\n}'),
        c('cat-hide-mobile', 'Nascosto sotto 768 px', '@media (max-width: 767px) {\n  .cat-hide-mobile {\n    display: none;\n  }\n}'),
        c('cat-hide-desktop', 'Nascosto da 768 px in su', '@media (min-width: 768px) {\n  .cat-hide-desktop {\n    display: none;\n  }\n}'),
        c('cat-stack', 'Figli in riga che si impilano su schermo stretto', '.cat-stack {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-gap, 1rem);\n}\n\n.cat-stack > * {\n  flex: 1 1 17rem;\n}')
      ]
    },
    {
      nome: 'Larghezze e contenitore',
      classi: [
        c('cat-container', 'Contenitore centrato con larghezza massima', '.cat-container {\n  width: min(100% - 2rem, var(--cat-container-max, 72rem));\n  margin-inline: auto;\n}'),
        c('cat-w-full', 'Larghezza piena', '.cat-w-full {\n  width: 100%;\n}'),
        c('cat-max-w-prose', 'Larghezza massima per testi lunghi', '.cat-max-w-prose {\n  max-width: 65ch;\n}')
      ]
    }
  ]
};

function v(nome, valore, tipo) {
  return { nome: nome, valore: valore, tipo: tipo || 'testo' };
}

const root = {
  gruppi: [
    {
      nome: 'Colori',
      variabili: [
        v('--cat-color-primary', '#111111', 'colore'),
        v('--cat-color-secondary', '#404040', 'colore'),
        v('--cat-color-accent', '#005fcc', 'colore'),
        v('--cat-color-bg', '#f5f5f5', 'colore'),
        v('--cat-color-surface', '#ffffff', 'colore'),
        v('--cat-color-text', '#111111', 'colore'),
        v('--cat-color-text-muted', '#4a4a4a', 'colore'),
        v('--cat-color-border', '#8f8f8f', 'colore'),
        v('--cat-color-placeholder', '#e2e2e2', 'colore'),
        v('--cat-color-success', '#1e7a34', 'colore'),
        v('--cat-color-warning', '#8a5a00', 'colore'),
        v('--cat-color-error', '#b00020', 'colore')
      ]
    },
    {
      nome: 'Font',
      variabili: [
        v('--cat-font-heading', '"Inter", system-ui, sans-serif'),
        v('--cat-font-body', '"Inter", system-ui, sans-serif'),
        v('--cat-font-mono', 'ui-monospace, Menlo, Consolas, monospace'),
        v('--cat-text-base', 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)'),
        v('--cat-text-lg', 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)'),
        v('--cat-text-xl', 'clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)'),
        v('--cat-weight-normal', '400'),
        v('--cat-weight-bold', '700'),
        v('--cat-line-height', '1.6')
      ]
    },
    {
      nome: 'Spaziature',
      variabili: [
        v('--cat-space-1', '0.25rem'),
        v('--cat-space-2', '0.5rem'),
        v('--cat-space-3', '1rem'),
        v('--cat-space-4', '1.5rem'),
        v('--cat-space-5', '2.5rem'),
        v('--cat-gap', '1rem')
      ]
    },
    {
      nome: 'Raggi e ombre',
      variabili: [
        v('--cat-radius-sm', '0.25rem'),
        v('--cat-radius-md', '0.5rem'),
        v('--cat-radius-lg', '1rem'),
        v('--cat-shadow-sm', '0 1px 2px rgb(0 0 0 / 0.08)'),
        v('--cat-shadow-md', '0 4px 12px rgb(0 0 0 / 0.12)')
      ]
    },
    {
      nome: 'Movimento e contenitore',
      variabili: [
        v('--cat-duration', '200ms'),
        v('--cat-ease', 'cubic-bezier(0.2, 0.8, 0.2, 1)'),
        v('--cat-container-max', '72rem')
      ]
    }
  ]
};

const extra = require('./seed-extra');

module.exports = {
  strutture: strutture,
  componenti: componenti,
  animazioni: extra.animazioni,
  interazioni: extra.interazioni,
  classi: classi,
  root: root
};
