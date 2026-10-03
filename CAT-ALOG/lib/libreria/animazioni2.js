'use strict';

/* Animazioni v2: effetti da siti curati. Rispettano prefers-reduced-motion. */

module.exports = [
  {
    nome: 'Logo cloud che scorre (marquee)',
    descrizione: 'Fascia di loghi che scorre all\'infinito, si ferma al passaggio del mouse',
    tag: ['loop', 'logo', 'marquee'],
    html: `<div class="cat-marquee" aria-label="Clienti">\n  <ul class="cat-marquee__track">\n    <li>Alfa</li><li>Beta</li><li>Gamma</li><li>Delta</li><li>Omega</li>\n    <li aria-hidden="true">Alfa</li><li aria-hidden="true">Beta</li><li aria-hidden="true">Gamma</li><li aria-hidden="true">Delta</li><li aria-hidden="true">Omega</li>\n  </ul>\n</div>\n`,
    css: `.cat-marquee { overflow: hidden; -webkit-mask: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); mask: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); }\n.cat-marquee__track { display: flex; gap: 3rem; width: max-content; margin: 0; padding: 0; list-style: none; animation: cat-marquee 20s linear infinite; }\n.cat-marquee:hover .cat-marquee__track { animation-play-state: paused; }\n.cat-marquee li { font-size: 1.5rem; font-weight: 800; color: var(--cat-color-text-muted, #5c5c57); }\n@keyframes cat-marquee { to { transform: translateX(calc(-50% - 1.5rem)); } }\n@media (prefers-reduced-motion: reduce) { .cat-marquee__track { animation: none; flex-wrap: wrap; width: auto; } .cat-marquee li[aria-hidden] { display: none; } }\n`,
    js: ''
  },
  {
    nome: 'Testo con sfumatura che scorre',
    descrizione: 'Titolo con gradiente animato nel colore del testo',
    tag: ['testo', 'gradiente', 'loop'],
    html: '<h2 class="cat-gradient-text">Un titolo che brilla</h2>\n',
    css: `.cat-gradient-text { margin: 0; font-size: clamp(2rem, 6vw, 3.5rem); background: linear-gradient(90deg, var(--cat-color-primary, #2f6f4e), var(--cat-color-accent, #d97706), var(--cat-color-primary, #2f6f4e)); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: cat-gradient-shift 6s linear infinite; }\n@keyframes cat-gradient-shift { to { background-position: 200% center; } }\n@media (prefers-reduced-motion: reduce) { .cat-gradient-text { animation: none; } }\n`,
    js: ''
  },
  {
    nome: 'Cursore che lampeggia (macchina da scrivere)',
    descrizione: 'Testo che si scrive da solo con cursore lampeggiante',
    tag: ['testo', 'js', 'loop'],
    html: '<p class="cat-typing" aria-live="polite"><span id="cat-typing-text"></span><span class="cat-typing__caret" aria-hidden="true">|</span></p>\n',
    css: `.cat-typing { margin: 0; font-size: 1.5rem; font-weight: 700; }\n.cat-typing__caret { animation: cat-blink 1s steps(1) infinite; }\n@keyframes cat-blink { 50% { opacity: 0; } }\n@media (prefers-reduced-motion: reduce) { .cat-typing__caret { animation: none; } }\n`,
    js: `var words = ['Design.', 'Codice.', 'Gatti.'];\nvar out = document.getElementById('cat-typing-text');\nvar calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\nif (calm) { out.textContent = words.join(' '); }\nelse {\n  var w = 0, c = 0, del = false;\n  (function tick() {\n    var word = words[w];\n    c += del ? -1 : 1;\n    out.textContent = word.slice(0, c);\n    var wait = del ? 50 : 110;\n    if (!del && c === word.length) { del = true; wait = 1200; }\n    else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }\n    setTimeout(tick, wait);\n  })();\n}\n`
  },
  {
    nome: 'Riflesso sul pulsante (shine)',
    descrizione: 'Una luce attraversa il pulsante all\'hover',
    tag: ['hover', 'pulsante'],
    html: '<button type="button" class="cat-shine">Scopri</button>\n',
    css: `.cat-shine { position: relative; overflow: hidden; padding: 0.75rem 1.6rem; border: 0; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-primary, #2f6f4e); color: #fff; font: inherit; cursor: pointer; }\n.cat-shine::after { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.45) 50%, transparent 70%); transform: translateX(-100%); }\n.cat-shine:hover::after { transform: translateX(100%); transition: transform 600ms ease; }\n@media (prefers-reduced-motion: reduce) { .cat-shine:hover::after { transition: none; } }\n`,
    js: ''
  },
  {
    nome: 'Cuore che pulsa (like)',
    descrizione: 'Pulsante mi piace con scatto elastico al clic',
    tag: ['click', 'js', 'icona'],
    html: '<button type="button" class="cat-like" aria-pressed="false" aria-label="Mi piace">♥</button>\n',
    css: `.cat-like { width: 3rem; height: 3rem; border: 2px solid var(--cat-color-border, #d9d9d2); border-radius: 50%; background: var(--cat-color-surface, #fff); color: var(--cat-color-border, #d9d9d2); font-size: 1.4rem; cursor: pointer; transition: color 150ms ease, border-color 150ms ease; }\n.cat-like[aria-pressed="true"] { color: #e0245e; border-color: #e0245e; animation: cat-pop 350ms ease; }\n@keyframes cat-pop { 0% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1); } }\n@media (prefers-reduced-motion: reduce) { .cat-like[aria-pressed="true"] { animation: none; } }\n`,
    js: `document.querySelectorAll('.cat-like').forEach(function (b) {\n  b.addEventListener('click', function () {\n    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));\n  });\n});\n`
  },
  {
    nome: 'Card che si inclina (tilt 3D)',
    descrizione: 'La card segue il mouse con una leggera rotazione in 3D',
    tag: ['hover', '3d', 'js'],
    html: '<div class="cat-tilt" id="cat-tilt"><h3>Muovi il mouse</h3><p>Mi inclino verso di te.</p></div>\n',
    css: `.cat-tilt { max-width: 18rem; padding: var(--cat-space-4, 1.5rem); border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-surface, #fff); box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12)); transition: transform 150ms ease-out; will-change: transform; }\n.cat-tilt h3 { margin-top: 0; }\n`,
    js: `var card = document.getElementById('cat-tilt');\nif (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {\n  card.addEventListener('mousemove', function (e) {\n    var r = card.getBoundingClientRect();\n    var x = (e.clientX - r.left) / r.width - 0.5;\n    var y = (e.clientY - r.top) / r.height - 0.5;\n    card.style.transform = 'perspective(600px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';\n  });\n  card.addEventListener('mouseleave', function () { card.style.transform = ''; });\n}\n`
  },
  {
    nome: 'Parallasse leggero',
    descrizione: 'Lo sfondo scorre più piano del testo mentre scorri la pagina',
    tag: ['scroll', 'js', 'profondità'],
    html: '<section class="cat-parallax"><div class="cat-parallax__bg" id="cat-px-bg"></div><h2>Scorri la pagina</h2></section>\n<div style="height:80vh"></div>\n',
    css: `.cat-parallax { position: relative; display: grid; place-items: center; height: 60vh; overflow: hidden; color: #fff; }\n.cat-parallax__bg { position: absolute; inset: -20% 0; background: linear-gradient(135deg, var(--cat-color-secondary, #4a5568), var(--cat-color-primary, #2f6f4e)); will-change: transform; }\n.cat-parallax h2 { position: relative; margin: 0; }\n`,
    js: `var bg = document.getElementById('cat-px-bg');\nif (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {\n  window.addEventListener('scroll', function () {\n    bg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px)';\n  }, { passive: true });\n}\n`
  },
  {
    nome: 'Titolo che compare lettera per lettera',
    descrizione: 'Ogni lettera sale e appare con un piccolo ritardo',
    tag: ['testo', 'ingresso', 'js'],
    html: '<h2 class="cat-letters" aria-label="Benvenuto">Benvenuto</h2>\n',
    css: `.cat-letters { margin: 0; font-size: clamp(2rem, 6vw, 3.5rem); }\n.cat-letters span { display: inline-block; opacity: 0; transform: translateY(0.6em); animation: cat-letter 400ms ease-out forwards; animation-delay: calc(var(--i) * 50ms); }\n@keyframes cat-letter { to { opacity: 1; transform: none; } }\n@media (prefers-reduced-motion: reduce) { .cat-letters span { animation: none; opacity: 1; transform: none; } }\n`,
    js: `document.querySelectorAll('.cat-letters').forEach(function (h) {\n  var text = h.textContent;\n  h.textContent = '';\n  text.split('').forEach(function (ch, i) {\n    var s = document.createElement('span');\n    s.setAttribute('aria-hidden', 'true');\n    s.style.setProperty('--i', i);\n    s.textContent = ch === ' ' ? '\\u00a0' : ch;\n    h.appendChild(s);\n  });\n});\n`
  },
  {
    nome: 'Alone che segue il mouse',
    descrizione: 'Un bagliore morbido segue il cursore dentro il riquadro',
    tag: ['hover', 'js', 'moderno'],
    html: '<div class="cat-spot" id="cat-spot"><h3>Spotlight</h3><p>Muovi il mouse qui dentro.</p></div>\n',
    css: `.cat-spot { --x: 50%; --y: 50%; padding: var(--cat-space-5, 3rem); border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); background: radial-gradient(18rem circle at var(--x) var(--y), rgb(47 111 78 / 0.22), transparent 70%), var(--cat-color-surface, #fff); }\n.cat-spot h3 { margin-top: 0; }\n`,
    js: `var spot = document.getElementById('cat-spot');\nspot.addEventListener('mousemove', function (e) {\n  var r = spot.getBoundingClientRect();\n  spot.style.setProperty('--x', (e.clientX - r.left) + 'px');\n  spot.style.setProperty('--y', (e.clientY - r.top) + 'px');\n});\n`
  },
  {
    nome: 'Spinner a tre puntini',
    descrizione: 'Tre puntini che saltano in sequenza, per «sta scrivendo…»',
    tag: ['loader', 'loop'],
    html: '<div class="cat-dots" role="status"><span></span><span></span><span></span><i class="cat-dots__sr">Caricamento…</i></div>\n',
    css: `.cat-dots { display: inline-flex; gap: 0.35rem; }\n.cat-dots span { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--cat-color-primary, #2f6f4e); animation: cat-dot 1s ease-in-out infinite; }\n.cat-dots span:nth-child(2) { animation-delay: 150ms; }\n.cat-dots span:nth-child(3) { animation-delay: 300ms; }\n.cat-dots__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }\n@keyframes cat-dot { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-0.5rem); opacity: 1; } }\n@media (prefers-reduced-motion: reduce) { .cat-dots span { animation: none; } }\n`,
    js: ''
  }
];
