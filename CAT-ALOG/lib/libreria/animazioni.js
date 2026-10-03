'use strict';

/* Animazioni: solo transform/opacity, 150-400 ms dove sono transizioni, prefers-reduced-motion sempre rispettato. */

const RM = (sel) => `\n@media (prefers-reduced-motion: reduce) {\n  ${sel} { animation: none; transition: none; }\n}\n`;

module.exports = [
  {
    nome: 'Slide da sinistra',
    descrizione: 'Entra scorrendo da sinistra (300 ms)',
    tag: ['slide', 'ingresso'],
    html: '<div class="cat-slide-left"><p>Arrivo da sinistra.</p></div>\n',
    css: `@keyframes cat-slide-left {\n  from { opacity: 0; transform: translateX(-24px); }\n  to   { opacity: 1; transform: translateX(0); }\n}\n\n.cat-slide-left {\n  animation: cat-slide-left 300ms ease-out both;\n}\n${RM('.cat-slide-left')}`,
    js: ''
  },
  {
    nome: 'Zoom in',
    descrizione: 'Compare ingrandendosi da 90% a 100% (250 ms)',
    tag: ['zoom', 'ingresso'],
    html: '<div class="cat-zoom-in"><p>Compaio con uno zoom leggero.</p></div>\n',
    css: `@keyframes cat-zoom-in {\n  from { opacity: 0; transform: scale(0.9); }\n  to   { opacity: 1; transform: scale(1); }\n}\n\n.cat-zoom-in {\n  animation: cat-zoom-in 250ms ease-out both;\n}\n${RM('.cat-zoom-in')}`,
    js: ''
  },
  {
    nome: 'Pulse (battito)',
    descrizione: 'Pulsa in loop per attirare l\'attenzione',
    tag: ['loop', 'attenzione'],
    html: '<button type="button" class="cat-pulse">Nuovo!</button>\n',
    css: `@keyframes cat-pulse {\n  0%, 100% { transform: scale(1); }\n  50%      { transform: scale(1.06); }\n}\n\n.cat-pulse {\n  padding: 0.6rem 1.2rem;\n  border: 0;\n  border-radius: 999px;\n  background: var(--cat-color-accent, #005fcc);\n  color: #fff;\n  font: inherit;\n  animation: cat-pulse 1.6s ease-in-out infinite;\n}\n${RM('.cat-pulse')}`,
    js: ''
  },
  {
    nome: 'Rimbalzo',
    descrizione: 'Salta su e giù, utile per una freccia «scorri»',
    tag: ['loop', 'bounce'],
    html: '<div class="cat-bounce" aria-hidden="true">↓</div>\n',
    css: `@keyframes cat-bounce {\n  0%, 100% { transform: translateY(0); }\n  50%      { transform: translateY(-10px); }\n}\n\n.cat-bounce {\n  display: inline-block;\n  font-size: 2rem;\n  animation: cat-bounce 1.2s ease-in-out infinite;\n}\n${RM('.cat-bounce')}`,
    js: ''
  },
  {
    nome: 'Scossa (errore)',
    descrizione: 'Il campo trema da sinistra a destra quando c\'è un errore; si riavvia con il pulsante',
    tag: ['errore', 'form'],
    html: '<input class="cat-shake" id="cat-shake-input" type="text" value="Campo con errore" aria-label="Campo di esempio" aria-invalid="true">\n<button type="button" id="cat-shake-btn">Riprova</button>\n',
    css: `@keyframes cat-shake {\n  0%, 100% { transform: translateX(0); }\n  20%, 60% { transform: translateX(-6px); }\n  40%, 80% { transform: translateX(6px); }\n}\n\n.cat-shake {\n  padding: 0.5rem;\n  border: 2px solid var(--cat-color-error, #b00020);\n  border-radius: var(--cat-radius-md, 0.5rem);\n}\n\n.cat-shake.is-shaking {\n  animation: cat-shake 400ms ease;\n}\n${RM('.cat-shake.is-shaking')}`,
    js: `var input = document.getElementById('cat-shake-input');\ndocument.getElementById('cat-shake-btn').addEventListener('click', function () {\n  input.classList.remove('is-shaking');\n  void input.offsetWidth; // riavvia l'animazione\n  input.classList.add('is-shaking');\n});\n`
  },
  {
    nome: 'Levitazione (float)',
    descrizione: 'Oggetto che fluttua piano su e giù: perfetto per mascotte e illustrazioni',
    tag: ['loop', 'mascotte'],
    html: '<div class="cat-float" role="img" aria-label="Illustrazione">🐱</div>\n',
    css: `@keyframes cat-float {\n  0%, 100% { transform: translateY(0); }\n  50%      { transform: translateY(-12px); }\n}\n\n.cat-float {\n  display: inline-block;\n  font-size: 4rem;\n  animation: cat-float 3s ease-in-out infinite;\n}\n${RM('.cat-float')}`,
    js: ''
  },
  {
    nome: 'Saluto (dondolio)',
    descrizione: 'Ruota avanti e indietro da un angolo, come una zampa che saluta (Maneki-neko)',
    tag: ['loop', 'mascotte', 'rotate'],
    html: '<div class="cat-wave" role="img" aria-label="Saluto">👋</div>\n',
    css: `@keyframes cat-wave {\n  0%, 100% { transform: rotate(0deg); }\n  25%      { transform: rotate(18deg); }\n  75%      { transform: rotate(-12deg); }\n}\n\n.cat-wave {\n  display: inline-block;\n  font-size: 3rem;\n  transform-origin: 70% 80%;\n  animation: cat-wave 1.6s ease-in-out infinite;\n}\n${RM('.cat-wave')}`,
    js: ''
  },
  {
    nome: 'Card che si gira (flip)',
    descrizione: 'Fronte e retro: la card ruota di 180° al passaggio o al focus',
    tag: ['hover', 'card', '3d'],
    html: '<div class="cat-flip" tabindex="0">\n  <div class="cat-flip__inner">\n    <div class="cat-flip__face">Fronte</div>\n    <div class="cat-flip__face cat-flip__face--back">Retro</div>\n  </div>\n</div>\n',
    css: `.cat-flip {\n  width: 12rem;\n  height: 8rem;\n  perspective: 800px;\n}\n\n.cat-flip__inner {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  transition: transform 400ms ease;\n  transform-style: preserve-3d;\n}\n\n.cat-flip:hover .cat-flip__inner,\n.cat-flip:focus-visible .cat-flip__inner {\n  transform: rotateY(180deg);\n}\n\n.cat-flip__face {\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  backface-visibility: hidden;\n}\n\n.cat-flip__face--back {\n  background: var(--cat-color-secondary, #404040);\n  transform: rotateY(180deg);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-flip__inner { transition: none; }\n}\n`,
    js: ''
  },
  {
    nome: 'Link con sottolineatura animata',
    descrizione: 'La linea cresce da sinistra a destra al passaggio del mouse',
    tag: ['hover', 'link'],
    html: '<a href="#" class="cat-underline">Passa sopra di me</a>\n',
    css: `.cat-underline {\n  position: relative;\n  color: inherit;\n  text-decoration: none;\n}\n\n.cat-underline::after {\n  content: "";\n  position: absolute;\n  left: 0;\n  bottom: -2px;\n  width: 100%;\n  height: 2px;\n  background: var(--cat-color-primary, #111111);\n  transform: scaleX(0);\n  transform-origin: left;\n  transition: transform 250ms ease;\n}\n\n.cat-underline:hover::after,\n.cat-underline:focus-visible::after {\n  transform: scaleX(1);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-underline::after { transition: none; }\n}\n`,
    js: ''
  },
  {
    nome: 'Lista a cascata (stagger)',
    descrizione: 'Gli elementi compaiono uno dopo l\'altro con un piccolo ritardo',
    tag: ['ingresso', 'lista'],
    html: '<ul class="cat-stagger">\n  <li>Primo</li>\n  <li>Secondo</li>\n  <li>Terzo</li>\n  <li>Quarto</li>\n</ul>\n',
    css: `@keyframes cat-stagger-in {\n  from { opacity: 0; transform: translateY(12px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.cat-stagger li {\n  animation: cat-stagger-in 300ms ease-out both;\n  animation-delay: calc(var(--i, 0) * 80ms);\n}\n\n.cat-stagger li:nth-child(1) { --i: 0; }\n.cat-stagger li:nth-child(2) { --i: 1; }\n.cat-stagger li:nth-child(3) { --i: 2; }\n.cat-stagger li:nth-child(4) { --i: 3; }\n${RM('.cat-stagger li')}`,
    js: ''
  },
  {
    nome: 'Ripple sul pulsante',
    descrizione: 'Onda che parte dal punto del clic (cerchio che si espande e svanisce)',
    tag: ['click', 'pulsante', 'js'],
    html: '<button type="button" class="cat-ripple">Cliccami</button>\n',
    css: `.cat-ripple {\n  position: relative;\n  overflow: hidden;\n  padding: 0.7rem 1.4rem;\n  border: 0;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cat-ripple__wave {\n  position: absolute;\n  width: 20px;\n  height: 20px;\n  margin: -10px 0 0 -10px;\n  border-radius: 50%;\n  background: rgb(255 255 255 / 0.5);\n  pointer-events: none;\n  animation: cat-ripple 400ms ease-out forwards;\n}\n\n@keyframes cat-ripple {\n  from { opacity: 1; transform: scale(1); }\n  to   { opacity: 0; transform: scale(14); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-ripple__wave { display: none; }\n}\n`,
    js: `document.querySelectorAll('.cat-ripple').forEach(function (btn) {\n  btn.addEventListener('click', function (e) {\n    var r = btn.getBoundingClientRect();\n    var w = document.createElement('span');\n    w.className = 'cat-ripple__wave';\n    w.style.left = (e.clientX - r.left) + 'px';\n    w.style.top = (e.clientY - r.top) + 'px';\n    btn.appendChild(w);\n    w.addEventListener('animationend', function () { w.remove(); });\n  });\n});\n`
  },
  {
    nome: 'Disegno del tratto SVG',
    descrizione: 'Una linea SVG che si disegna da sola (stroke-dashoffset)',
    tag: ['svg', 'ingresso'],
    html: '<svg class="cat-draw" viewBox="0 0 120 60" width="240" height="120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">\n  <path d="M5 50 C 25 5, 45 5, 60 30 S 95 55, 115 10" pathLength="1"/>\n</svg>\n',
    css: `.cat-draw {\n  color: var(--cat-color-primary, #111111);\n}\n\n.cat-draw path {\n  stroke-dasharray: 1;\n  stroke-dashoffset: 1;\n  animation: cat-draw 1.2s ease forwards;\n}\n\n@keyframes cat-draw {\n  to { stroke-dashoffset: 0; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-draw path { animation: none; stroke-dashoffset: 0; }\n}\n`,
    js: ''
  }
];
