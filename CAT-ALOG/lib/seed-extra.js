'use strict';

/*
 * Esempi per le schede Animazioni e Interazioni. Solo transform/opacity,
 * durate 150-400 ms, e prefers-reduced-motion rispettato.
 */

function j(lines) {
  return lines.join('\n') + '\n';
}

const animazioni = [
  {
    nome: 'Fade in',
    descrizione: 'Compare con una dissolvenza (250 ms)',
    tag: ['fade', 'ingresso'],
    html: j(['<div class="cat-fade-in">', '  <p>Compaio con una dissolvenza.</p>', '</div>']),
    css: j([
      '@keyframes cat-fade-in {',
      '  from { opacity: 0; }',
      '  to   { opacity: 1; }',
      '}',
      '',
      '.cat-fade-in {',
      '  animation: cat-fade-in var(--cat-duration, 250ms) var(--cat-ease, ease-out) both;',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  .cat-fade-in { animation: none; }',
      '}'
    ]),
    js: ''
  },
  {
    nome: 'Slide up',
    descrizione: 'Sale di 16 px mentre compare (300 ms)',
    tag: ['slide', 'ingresso'],
    html: j(['<div class="cat-slide-up">', '  <p>Salgo e compaio.</p>', '</div>']),
    css: j([
      '@keyframes cat-slide-up {',
      '  from { opacity: 0; transform: translateY(16px); }',
      '  to   { opacity: 1; transform: translateY(0); }',
      '}',
      '',
      '.cat-slide-up {',
      '  animation: cat-slide-up 300ms var(--cat-ease, ease-out) both;',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  .cat-slide-up { animation: none; }',
      '}'
    ]),
    js: ''
  },
  {
    nome: 'Hover lift',
    descrizione: 'La card si solleva al passaggio del mouse (200 ms)',
    tag: ['hover', 'card'],
    html: j(['<article class="cat-lift">', '  <h3>Passa sopra</h3>', '  <p>Mi sollevo di 4 px.</p>', '</article>']),
    css: j([
      '.cat-lift {',
      '  padding: var(--cat-space-3, 1rem);',
      '  border: 1px solid var(--cat-color-border, #d9d9d2);',
      '  border-radius: var(--cat-radius-md, 0.5rem);',
      '  transition: transform 200ms ease, box-shadow 200ms ease;',
      '}',
      '',
      '.cat-lift:hover {',
      '  transform: translateY(-4px);',
      '  box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12));',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  .cat-lift { transition: none; }',
      '  .cat-lift:hover { transform: none; }',
      '}'
    ]),
    js: ''
  },
  {
    nome: 'Scroll reveal',
    descrizione: 'Gli elementi compaiono quando entrano nella finestra',
    tag: ['scroll', 'js'],
    html: j([
      '<section class="cat-reveal-demo">',
      '  <p class="cat-reveal">Uno</p>',
      '  <p class="cat-reveal">Due</p>',
      '  <p class="cat-reveal">Tre</p>',
      '</section>'
    ]),
    css: j([
      '.cat-reveal {',
      '  opacity: 0;',
      '  transform: translateY(16px);',
      '  transition: opacity 300ms ease, transform 300ms ease;',
      '}',
      '',
      '.cat-reveal.is-visible {',
      '  opacity: 1;',
      '  transform: none;',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  .cat-reveal { opacity: 1; transform: none; transition: none; }',
      '}'
    ]),
    js: j([
      "var items = document.querySelectorAll('.cat-reveal');",
      "if (!('IntersectionObserver' in window)) {",
      "  items.forEach(function (el) { el.classList.add('is-visible'); });",
      '} else {',
      '  var io = new IntersectionObserver(function (entries) {',
      '    entries.forEach(function (e) {',
      '      if (e.isIntersecting) {',
      "        e.target.classList.add('is-visible');",
      '        io.unobserve(e.target);',
      '      }',
      '    });',
      '  }, { threshold: 0.2 });',
      '  items.forEach(function (el) { io.observe(el); });',
      '}'
    ])
  }
];

const interazioni = [
  {
    nome: 'Menu mobile',
    descrizione: 'Pulsante che apre e chiude il menu (aria-expanded, Esc chiude)',
    tag: ['menu', 'navbar'],
    html: j([
      '<nav class="cat-nav">',
      '  <button type="button" class="cat-nav__toggle" data-cat-menu="#cat-menu" aria-expanded="false" aria-controls="cat-menu">Menu</button>',
      '  <ul id="cat-menu" class="cat-nav__list" hidden>',
      '    <li><a href="#">Home</a></li>',
      '    <li><a href="#">Chi siamo</a></li>',
      '    <li><a href="#">Contatti</a></li>',
      '  </ul>',
      '</nav>'
    ]),
    css: j([
      '.cat-nav__list { list-style: none; margin: 0; padding: var(--cat-space-2, 0.5rem) 0; }',
      '.cat-nav__list a { display: block; padding: var(--cat-space-2, 0.5rem); }',
      '.cat-nav__toggle { font: inherit; padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem); }'
    ]),
    js: j([
      "document.querySelectorAll('[data-cat-menu]').forEach(function (btn) {",
      '  var menu = document.querySelector(btn.getAttribute(\'data-cat-menu\'));',
      '  if (!menu) return;',
      '  function set(open) {',
      "    btn.setAttribute('aria-expanded', String(open));",
      '    menu.hidden = !open;',
      '  }',
      "  btn.addEventListener('click', function () { set(menu.hidden); });",
      "  document.addEventListener('keydown', function (e) {",
      "    if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }",
      '  });',
      '});'
    ])
  },
  {
    nome: 'Modale',
    descrizione: 'Finestra con <dialog>: Esc e clic fuori la chiudono',
    tag: ['modale', 'dialog'],
    html: j([
      '<button type="button" data-cat-open="#cat-modal">Apri la modale</button>',
      '<dialog id="cat-modal" class="cat-modal" aria-labelledby="cat-modal-title">',
      '  <h2 id="cat-modal-title">Titolo</h2>',
      '  <p>Contenuto della modale.</p>',
      '  <button type="button" data-cat-close>Chiudi</button>',
      '</dialog>'
    ]),
    css: j([
      '.cat-modal {',
      '  border: 1px solid var(--cat-color-border, #d9d9d2);',
      '  border-radius: var(--cat-radius-lg, 0.75rem);',
      '  padding: var(--cat-space-4, 1.5rem);',
      '  max-width: min(90vw, 28rem);',
      '}',
      '',
      '.cat-modal::backdrop { background: rgb(0 0 0 / 0.45); }'
    ]),
    js: j([
      "document.querySelectorAll('[data-cat-open]').forEach(function (btn) {",
      "  var d = document.querySelector(btn.getAttribute('data-cat-open'));",
      '  if (!d) return;',
      "  btn.addEventListener('click', function () { d.showModal(); });",
      "  d.querySelectorAll('[data-cat-close]').forEach(function (c) {",
      "    c.addEventListener('click', function () { d.close(); });",
      '  });',
      "  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });",
      '});'
    ])
  },
  {
    nome: 'Tab',
    descrizione: 'Schede con frecce sinistra/destra e ruoli aria',
    tag: ['tab', 'aria'],
    html: j([
      '<div class="cat-tabs">',
      '  <div role="tablist" aria-label="Esempio">',
      '    <button role="tab" id="cat-t1" aria-controls="cat-p1" aria-selected="true">Uno</button>',
      '    <button role="tab" id="cat-t2" aria-controls="cat-p2" aria-selected="false" tabindex="-1">Due</button>',
      '  </div>',
      '  <div role="tabpanel" id="cat-p1" aria-labelledby="cat-t1"><p>Pannello uno.</p></div>',
      '  <div role="tabpanel" id="cat-p2" aria-labelledby="cat-t2" hidden><p>Pannello due.</p></div>',
      '</div>'
    ]),
    css: j([
      '.cat-tabs [role="tab"] { font: inherit; padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem); border: 1px solid var(--cat-color-border, #d9d9d2); background: var(--cat-color-surface, #fff); cursor: pointer; }',
      '.cat-tabs [role="tab"][aria-selected="true"] { background: var(--cat-color-primary, #2f6f4e); color: #fff; }',
      '.cat-tabs [role="tabpanel"] { padding: var(--cat-space-3, 1rem); }'
    ]),
    js: j([
      "document.querySelectorAll('.cat-tabs').forEach(function (root) {",
      "  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role=\"tab\"]'));",
      '  function select(i) {',
      '    tabs.forEach(function (t, n) {',
      '      var on = n === i;',
      "      t.setAttribute('aria-selected', String(on));",
      '      t.tabIndex = on ? 0 : -1;',
      "      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;",
      '    });',
      '    tabs[i].focus();',
      '  }',
      '  tabs.forEach(function (t, i) {',
      "    t.addEventListener('click', function () { select(i); });",
      "    t.addEventListener('keydown', function (e) {",
      "      if (e.key === 'ArrowRight') select((i + 1) % tabs.length);",
      "      if (e.key === 'ArrowLeft') select((i - 1 + tabs.length) % tabs.length);",
      '    });',
      '  });',
      '});'
    ])
  },
  {
    nome: 'Tooltip',
    descrizione: 'Suggerimento al passaggio e al focus, letto dagli screen reader',
    tag: ['tooltip', 'aria'],
    html: j([
      '<span class="cat-tip">',
      '  <button type="button" aria-describedby="cat-tip-1">Passa sopra</button>',
      '  <span role="tooltip" id="cat-tip-1" class="cat-tip__bubble">Sono un suggerimento</span>',
      '</span>'
    ]),
    css: j([
      '.cat-tip { position: relative; display: inline-block; }',
      '.cat-tip__bubble { position: absolute; left: 0; top: 100%; margin-top: 4px; padding: 4px 8px; border-radius: var(--cat-radius-sm, 0.25rem); background: #1c1c1a; color: #fff; font-size: 0.875rem; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 150ms ease; }',
      '.cat-tip:hover .cat-tip__bubble, .cat-tip:focus-within .cat-tip__bubble { opacity: 1; }',
      '@media (prefers-reduced-motion: reduce) { .cat-tip__bubble { transition: none; } }'
    ]),
    js: ''
  },
  {
    nome: 'Tema scuro',
    descrizione: 'Interruttore chiaro/scuro che ricorda la scelta',
    tag: ['tema', 'dark'],
    html: '<button type="button" data-cat-theme aria-pressed="false">Tema scuro</button>\n',
    css: j([
      ':root[data-theme="dark"] {',
      '  --cat-color-bg: #121211;',
      '  --cat-color-surface: #1c1c1a;',
      '  --cat-color-text: #f2f2ee;',
      '  --cat-color-border: #3a3a36;',
      '}'
    ]),
    js: j([
      "var btn = document.querySelector('[data-cat-theme]');",
      'if (btn) {',
      '  function apply(dark) {',
      "    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');",
      "    btn.setAttribute('aria-pressed', String(dark));",
      '  }',
      '  var saved = null;',
      "  try { saved = localStorage.getItem('cat-theme'); } catch (e) {}",
      "  apply(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);",
      "  btn.addEventListener('click', function () {",
      "    var dark = btn.getAttribute('aria-pressed') !== 'true';",
      '    apply(dark);',
      "    try { localStorage.setItem('cat-theme', dark ? 'dark' : 'light'); } catch (e) {}",
      '  });',
      '}'
    ])
  }
];

module.exports = { animazioni: animazioni, interazioni: interazioni };
