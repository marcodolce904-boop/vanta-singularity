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
    html: '<div class="md-center">\n  <p>Contenuto centrato in orizzontale e in verticale</p>\n</div>\n',
    css: '.md-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 12rem;\n  padding: var(--md-space-3, 1rem);\n  text-align: center;\n}\n'
  },
  {
    nome: 'Due colonne 50/50',
    descrizione: 'Due colonne che si impilano su schermo stretto',
    tag: ['flex', 'colonne'],
    html: '<div class="md-cols-2">\n  <div class="md-cols-2__item">\n    <h2>Colonna uno</h2>\n    <p>Testo di esempio.</p>\n  </div>\n  <div class="md-cols-2__item">\n    <h2>Colonna due</h2>\n    <p>Testo di esempio.</p>\n  </div>\n</div>\n',
    css: '.md-cols-2 {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--md-gap, 1rem);\n}\n\n.md-cols-2__item {\n  flex: 1 1 20rem;\n}\n'
  },
  {
    nome: 'Card che vanno a capo',
    descrizione: 'Da tre card per riga a una sola su schermo stretto',
    tag: ['flex', 'card'],
    html: '<div class="md-cards">\n  <article class="md-card"><h2>Card uno</h2><p>Testo di esempio.</p></article>\n  <article class="md-card"><h2>Card due</h2><p>Testo di esempio.</p></article>\n  <article class="md-card"><h2>Card tre</h2><p>Testo di esempio.</p></article>\n</div>\n',
    css: '.md-cards {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--md-gap, 1rem);\n}\n\n.md-card {\n  flex: 1 1 17rem;\n  padding: var(--md-space-3, 1rem);\n  border: 1px solid var(--md-color-border, #d9d9d2);\n  border-radius: var(--md-radius-md, 0.5rem);\n  background: var(--md-color-surface, #ffffff);\n}\n'
  },
  {
    nome: 'Sidebar + contenuto',
    descrizione: 'La sidebar va sopra il contenuto su schermo stretto',
    tag: ['flex', 'sidebar'],
    html: '<div class="md-sidebar">\n  <aside class="md-sidebar__side">\n    <h2>Sidebar</h2>\n    <p>Menu o filtri.</p>\n  </aside>\n  <section class="md-sidebar__main">\n    <h1>Contenuto</h1>\n    <p>Testo di esempio.</p>\n  </section>\n</div>\n',
    css: '.md-sidebar {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--md-gap, 1rem);\n}\n\n.md-sidebar__side {\n  flex: 1 1 14rem;\n}\n\n.md-sidebar__main {\n  flex: 3 1 24rem;\n}\n'
  },
  {
    nome: 'Header logo e menu',
    descrizione: 'Logo a sinistra, menu a destra; il menu va sotto il logo su schermo stretto',
    tag: ['flex', 'header'],
    html: '<header class="md-header">\n  <a class="md-header__logo" href="#">Logo</a>\n  <nav class="md-header__nav" aria-label="Principale">\n    <a href="#">Home</a>\n    <a href="#">Lavori</a>\n    <a href="#">Contatti</a>\n  </nav>\n</header>\n',
    css: '.md-header {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: var(--md-gap, 1rem);\n  padding: var(--md-space-3, 1rem);\n}\n\n.md-header__nav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--md-gap, 1rem);\n}\n'
  },
  {
    nome: 'Footer a 4 colonne',
    descrizione: 'Quattro colonne, poi due, poi una',
    tag: ['flex', 'footer'],
    html: '<footer class="md-footer-cols">\n  <div><h3>Colonna uno</h3><p>Testo.</p></div>\n  <div><h3>Colonna due</h3><p>Testo.</p></div>\n  <div><h3>Colonna tre</h3><p>Testo.</p></div>\n  <div><h3>Colonna quattro</h3><p>Testo.</p></div>\n</footer>\n',
    css: '.md-footer-cols {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2rem;\n  padding: 2rem var(--md-space-3, 1rem);\n}\n\n.md-footer-cols > * {\n  flex: 1 1 12rem;\n}\n'
  }
];

const componenti = [
  {
    nome: 'Pulsante',
    descrizione: 'Pulsante primario e secondario',
    tag: ['pulsante'],
    html: '<button type="button" class="md-btn">Primario</button>\n<button type="button" class="md-btn md-btn--alt">Secondario</button>\n',
    css: '.md-btn {\n  padding: var(--md-space-2, 0.5rem) var(--md-space-3, 1rem);\n  border: 0;\n  border-radius: var(--md-radius-md, 0.5rem);\n  background: var(--md-color-primary, #2f6f4e);\n  color: #ffffff;\n  font: inherit;\n  cursor: pointer;\n  transition: transform var(--md-duration, 200ms) var(--md-ease, ease);\n}\n\n.md-btn--alt {\n  background: var(--md-color-secondary, #4a5568);\n}\n\n.md-btn:hover {\n  transform: translateY(-1px);\n}\n\n.md-btn:focus-visible {\n  outline: 3px solid var(--md-color-accent, #d97706);\n  outline-offset: 2px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .md-btn { transition: none; }\n  .md-btn:hover { transform: none; }\n}\n',
    js: ''
  },
  {
    nome: 'Accordion',
    descrizione: 'Pannelli che si aprono e chiudono, con tastiera e aria',
    tag: ['accordion', 'js'],
    html: '<div class="md-accordion">\n  <h3><button type="button" class="md-accordion__trigger" aria-expanded="false" aria-controls="md-acc-1">Domanda uno</button></h3>\n  <div id="md-acc-1" class="md-accordion__panel" hidden><p>Risposta uno.</p></div>\n  <h3><button type="button" class="md-accordion__trigger" aria-expanded="false" aria-controls="md-acc-2">Domanda due</button></h3>\n  <div id="md-acc-2" class="md-accordion__panel" hidden><p>Risposta due.</p></div>\n</div>\n',
    css: '.md-accordion h3 {\n  margin: 0;\n}\n\n.md-accordion__trigger {\n  width: 100%;\n  padding: var(--md-space-2, 0.5rem) var(--md-space-3, 1rem);\n  border: 1px solid var(--md-color-border, #d9d9d2);\n  background: var(--md-color-surface, #ffffff);\n  color: inherit;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n}\n\n.md-accordion__panel {\n  padding: var(--md-space-3, 1rem);\n  border: 1px solid var(--md-color-border, #d9d9d2);\n  border-top: 0;\n}\n',
    js: "document.querySelectorAll('.md-accordion__trigger').forEach(function (btn) {\n  btn.addEventListener('click', function () {\n    var aperto = btn.getAttribute('aria-expanded') === 'true';\n    btn.setAttribute('aria-expanded', String(!aperto));\n    document.getElementById(btn.getAttribute('aria-controls')).hidden = aperto;\n  });\n});\n"
  }
];

const classi = {
  gruppi: [
    {
      nome: 'Flex',
      classi: [
        c('md-flex', 'Display flex', '.md-flex {\n  display: flex;\n}'),
        c('md-flex-col', 'Direzione colonna', '.md-flex-col {\n  flex-direction: column;\n}'),
        c('md-flex-wrap', 'Va a capo', '.md-flex-wrap {\n  flex-wrap: wrap;\n}'),
        c('md-justify-start', 'Allinea all\'inizio (asse principale)', '.md-justify-start {\n  justify-content: flex-start;\n}'),
        c('md-justify-center', 'Centra (asse principale)', '.md-justify-center {\n  justify-content: center;\n}'),
        c('md-justify-between', 'Spazio tra gli elementi', '.md-justify-between {\n  justify-content: space-between;\n}'),
        c('md-justify-end', 'Allinea alla fine (asse principale)', '.md-justify-end {\n  justify-content: flex-end;\n}'),
        c('md-items-start', 'Allinea in alto (asse trasversale)', '.md-items-start {\n  align-items: flex-start;\n}'),
        c('md-items-center', 'Centra (asse trasversale)', '.md-items-center {\n  align-items: center;\n}'),
        c('md-items-end', 'Allinea in basso (asse trasversale)', '.md-items-end {\n  align-items: flex-end;\n}'),
        c('md-grow', 'Occupa lo spazio libero', '.md-grow {\n  flex-grow: 1;\n}'),
        c('md-shrink-0', 'Non si restringe', '.md-shrink-0 {\n  flex-shrink: 0;\n}'),
        c('md-gap-1', 'Spazio piccolo tra gli elementi', '.md-gap-1 {\n  gap: var(--md-space-1, 0.25rem);\n}'),
        c('md-gap-2', 'Spazio medio tra gli elementi', '.md-gap-2 {\n  gap: var(--md-space-2, 0.5rem);\n}'),
        c('md-gap-3', 'Spazio grande tra gli elementi', '.md-gap-3 {\n  gap: var(--md-space-3, 1rem);\n}')
      ]
    },
    {
      nome: 'Spaziature',
      classi: [
        c('md-p-1', 'Padding piccolo', '.md-p-1 {\n  padding: var(--md-space-1, 0.25rem);\n}'),
        c('md-p-2', 'Padding medio', '.md-p-2 {\n  padding: var(--md-space-2, 0.5rem);\n}'),
        c('md-p-3', 'Padding grande', '.md-p-3 {\n  padding: var(--md-space-3, 1rem);\n}'),
        c('md-m-1', 'Margine piccolo', '.md-m-1 {\n  margin: var(--md-space-1, 0.25rem);\n}'),
        c('md-m-2', 'Margine medio', '.md-m-2 {\n  margin: var(--md-space-2, 0.5rem);\n}'),
        c('md-m-3', 'Margine grande', '.md-m-3 {\n  margin: var(--md-space-3, 1rem);\n}'),
        c('md-mt-2', 'Margine sopra', '.md-mt-2 {\n  margin-top: var(--md-space-2, 0.5rem);\n}'),
        c('md-mb-2', 'Margine sotto', '.md-mb-2 {\n  margin-bottom: var(--md-space-2, 0.5rem);\n}'),
        c('md-mx-auto', 'Centra il blocco in orizzontale', '.md-mx-auto {\n  margin-inline: auto;\n}')
      ]
    },
    {
      nome: 'Testo',
      classi: [
        c('md-text-sm', 'Testo piccolo', '.md-text-sm {\n  font-size: 0.875rem;\n}'),
        c('md-text-lg', 'Testo grande', '.md-text-lg {\n  font-size: var(--md-text-lg, 1.25rem);\n}'),
        c('md-text-center', 'Testo centrato', '.md-text-center {\n  text-align: center;\n}'),
        c('md-text-bold', 'Testo in grassetto', '.md-text-bold {\n  font-weight: var(--md-weight-bold, 700);\n}'),
        c('md-text-muted', 'Testo attenuato', '.md-text-muted {\n  color: var(--md-color-text-muted, #5c5c57);\n}')
      ]
    },
    {
      nome: 'Display e visibilità',
      classi: [
        c('md-block', 'Display block', '.md-block {\n  display: block;\n}'),
        c('md-hide-mobile', 'Nascosto sotto 768 px', '@media (max-width: 767px) {\n  .md-hide-mobile {\n    display: none;\n  }\n}'),
        c('md-hide-desktop', 'Nascosto da 768 px in su', '@media (min-width: 768px) {\n  .md-hide-desktop {\n    display: none;\n  }\n}'),
        c('md-stack', 'Figli in riga che si impilano su schermo stretto', '.md-stack {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--md-gap, 1rem);\n}\n\n.md-stack > * {\n  flex: 1 1 17rem;\n}')
      ]
    },
    {
      nome: 'Larghezze e contenitore',
      classi: [
        c('md-container', 'Contenitore centrato con larghezza massima', '.md-container {\n  width: min(100% - 2rem, var(--md-container-max, 72rem));\n  margin-inline: auto;\n}'),
        c('md-w-full', 'Larghezza piena', '.md-w-full {\n  width: 100%;\n}'),
        c('md-max-w-prose', 'Larghezza massima per testi lunghi', '.md-max-w-prose {\n  max-width: 65ch;\n}')
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
        v('--md-color-primary', '#2f6f4e', 'colore'),
        v('--md-color-secondary', '#4a5568', 'colore'),
        v('--md-color-accent', '#d97706', 'colore'),
        v('--md-color-bg', '#fafaf7', 'colore'),
        v('--md-color-surface', '#ffffff', 'colore'),
        v('--md-color-text', '#1c1c1a', 'colore'),
        v('--md-color-text-muted', '#5c5c57', 'colore'),
        v('--md-color-border', '#d9d9d2', 'colore'),
        v('--md-color-success', '#2f7d32', 'colore'),
        v('--md-color-warning', '#b26a00', 'colore'),
        v('--md-color-error', '#b3261e', 'colore')
      ]
    },
    {
      nome: 'Font',
      variabili: [
        v('--md-font-heading', '"Inter", system-ui, sans-serif'),
        v('--md-font-body', '"Inter", system-ui, sans-serif'),
        v('--md-font-mono', 'ui-monospace, Menlo, Consolas, monospace'),
        v('--md-text-base', 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)'),
        v('--md-text-lg', 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)'),
        v('--md-text-xl', 'clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)'),
        v('--md-weight-normal', '400'),
        v('--md-weight-bold', '700'),
        v('--md-line-height', '1.6')
      ]
    },
    {
      nome: 'Spaziature',
      variabili: [
        v('--md-space-1', '0.25rem'),
        v('--md-space-2', '0.5rem'),
        v('--md-space-3', '1rem'),
        v('--md-space-4', '1.5rem'),
        v('--md-space-5', '2.5rem'),
        v('--md-gap', '1rem')
      ]
    },
    {
      nome: 'Raggi e ombre',
      variabili: [
        v('--md-radius-sm', '0.25rem'),
        v('--md-radius-md', '0.5rem'),
        v('--md-radius-lg', '1rem'),
        v('--md-shadow-sm', '0 1px 2px rgb(0 0 0 / 0.08)'),
        v('--md-shadow-md', '0 4px 12px rgb(0 0 0 / 0.12)')
      ]
    },
    {
      nome: 'Movimento e contenitore',
      variabili: [
        v('--md-duration', '200ms'),
        v('--md-ease', 'cubic-bezier(0.2, 0.8, 0.2, 1)'),
        v('--md-container-max', '72rem')
      ]
    }
  ]
};

module.exports = { strutture: strutture, componenti: componenti, classi: classi, root: root };
