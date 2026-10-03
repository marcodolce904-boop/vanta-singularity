'use strict';

/* Interazioni in JavaScript vanilla, agganciate con attributi data-cat-*. Nessuna libreria. */

module.exports = [
  {
    nome: 'Menu a tendina',
    descrizione: 'Pulsante che apre un elenco di voci; Esc e clic fuori lo chiudono',
    tag: ['menu', 'dropdown', 'aria'],
    html: `<div class="cat-dropdown" data-cat-dropdown>\n  <button type="button" class="cat-dropdown__btn" aria-haspopup="true" aria-expanded="false">Opzioni ▾</button>\n  <ul class="cat-dropdown__menu" hidden>\n    <li><a href="#">Profilo</a></li>\n    <li><a href="#">Impostazioni</a></li>\n    <li><a href="#">Esci</a></li>\n  </ul>\n</div>\n`,
    css: `.cat-dropdown { position: relative; display: inline-block; }\n.cat-dropdown__btn { padding: 0.5rem 1rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-surface, #fff); color: inherit; font: inherit; cursor: pointer; }\n.cat-dropdown__menu { position: absolute; left: 0; top: calc(100% + 4px); z-index: 20; min-width: 12rem; margin: 0; padding: 0.25rem; list-style: none; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-surface, #fff); box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12)); }\n.cat-dropdown__menu a { display: block; padding: 0.5rem 0.75rem; border-radius: var(--cat-radius-sm, 0.25rem); color: inherit; text-decoration: none; }\n.cat-dropdown__menu a:hover, .cat-dropdown__menu a:focus-visible { background: rgb(0 0 0 / 0.06); }\n`,
    js: `document.querySelectorAll('[data-cat-dropdown]').forEach(function (root) {\n  var btn = root.querySelector('button');\n  var menu = root.querySelector('ul');\n  function set(open) {\n    btn.setAttribute('aria-expanded', String(open));\n    menu.hidden = !open;\n  }\n  btn.addEventListener('click', function () { set(menu.hidden); });\n  document.addEventListener('click', function (e) { if (!root.contains(e.target)) set(false); });\n  root.addEventListener('keydown', function (e) {\n    if (e.key === 'Escape') { set(false); btn.focus(); }\n  });\n});\n`
  },
  {
    nome: 'Notifica toast',
    descrizione: 'Messaggio che compare in basso e sparisce da solo dopo 3 secondi',
    tag: ['toast', 'messaggio'],
    html: `<button type="button" data-cat-toast="Salvato con successo">Mostra notifica</button>\n<div id="cat-toast" class="cat-toast" role="status" aria-live="polite" hidden></div>\n`,
    css: `.cat-toast {\n  position: fixed;\n  left: 50%;\n  bottom: 1.5rem;\n  transform: translateX(-50%);\n  padding: 0.6rem 1.2rem;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: #111111;\n  color: #fff;\n  box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12));\n}\n`,
    js: `var toast = document.getElementById('cat-toast');\nvar timer = null;\ndocument.querySelectorAll('[data-cat-toast]').forEach(function (btn) {\n  btn.addEventListener('click', function () {\n    toast.textContent = btn.getAttribute('data-cat-toast');\n    toast.hidden = false;\n    clearTimeout(timer);\n    timer = setTimeout(function () { toast.hidden = true; }, 3000);\n  });\n});\n`
  },
  {
    nome: 'Copia negli appunti',
    descrizione: 'Pulsante che copia un testo e conferma con «Copiato!»',
    tag: ['copia', 'clipboard'],
    html: `<code id="cat-copy-src">npm install cat-alog</code>\n<button type="button" data-cat-copy="#cat-copy-src">Copia</button>\n`,
    css: `[data-cat-copy] { margin-left: 0.5rem; padding: 0.3rem 0.8rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-sm, 0.25rem); background: var(--cat-color-surface, #fff); color: inherit; font: inherit; cursor: pointer; }\n`,
    js: `document.querySelectorAll('[data-cat-copy]').forEach(function (btn) {\n  var label = btn.textContent;\n  btn.addEventListener('click', function () {\n    var src = document.querySelector(btn.getAttribute('data-cat-copy'));\n    if (!src || !navigator.clipboard) return;\n    navigator.clipboard.writeText(src.textContent).then(function () {\n      btn.textContent = 'Copiato!';\n      setTimeout(function () { btn.textContent = label; }, 1500);\n    });\n  });\n});\n`
  },
  {
    nome: 'Torna su',
    descrizione: 'Pulsante che compare dopo aver scorso e riporta in cima',
    tag: ['scroll', 'navigazione'],
    html: `<div style="height:200vh;padding:1rem">Scorri verso il basso: compare il pulsante in basso a destra.</div>\n<button type="button" class="cat-to-top" id="cat-to-top" aria-label="Torna su" hidden>↑</button>\n`,
    css: `.cat-to-top {\n  position: fixed;\n  right: 1.25rem;\n  bottom: 1.25rem;\n  width: 3rem;\n  height: 3rem;\n  border: 0;\n  border-radius: 50%;\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  font-size: 1.25rem;\n  cursor: pointer;\n  box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12));\n}\n`,
    js: `var top = document.getElementById('cat-to-top');\nwindow.addEventListener('scroll', function () { top.hidden = window.scrollY < 300; }, { passive: true });\ntop.addEventListener('click', function () {\n  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n  window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });\n});\n`
  },
  {
    nome: 'Contatore animato',
    descrizione: 'Il numero sale da 0 al valore quando entra nella finestra',
    tag: ['numeri', 'scroll'],
    html: `<p class="cat-count">Clienti: <strong data-cat-count="1240">0</strong></p>\n<p class="cat-count">Progetti: <strong data-cat-count="380">0</strong></p>\n`,
    css: `.cat-count strong { font-size: 2rem; font-variant-numeric: tabular-nums; color: var(--cat-color-primary, #111111); }\n`,
    js: `var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\nfunction run(el) {\n  var end = parseInt(el.getAttribute('data-cat-count'), 10);\n  if (calm) { el.textContent = end; return; }\n  var start = performance.now();\n  (function step(now) {\n    var t = Math.min((now - start) / 1000, 1);\n    el.textContent = Math.round(end * t);\n    if (t < 1) requestAnimationFrame(step);\n  })(start);\n}\nvar io = new IntersectionObserver(function (entries) {\n  entries.forEach(function (e) {\n    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }\n  });\n});\ndocument.querySelectorAll('[data-cat-count]').forEach(function (el) { io.observe(el); });\n`
  },
  {
    nome: 'Filtro lista in tempo reale',
    descrizione: 'Campo di ricerca che nasconde le voci che non corrispondono',
    tag: ['ricerca', 'filtro'],
    html: `<label for="cat-filter">Cerca</label>\n<input id="cat-filter" type="search" data-cat-filter="#cat-filter-list" placeholder="Scrivi…">\n<ul id="cat-filter-list">\n  <li>Mela</li>\n  <li>Pera</li>\n  <li>Banana</li>\n  <li>Arancia</li>\n</ul>\n`,
    css: `[data-cat-filter] { margin-left: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); font: inherit; }\n`,
    js: `document.querySelectorAll('[data-cat-filter]').forEach(function (input) {\n  var list = document.querySelector(input.getAttribute('data-cat-filter'));\n  input.addEventListener('input', function () {\n    var q = input.value.trim().toLowerCase();\n    list.querySelectorAll('li').forEach(function (li) {\n      li.hidden = q !== '' && li.textContent.toLowerCase().indexOf(q) === -1;\n    });\n  });\n});\n`
  },
  {
    nome: 'Lightbox per immagini',
    descrizione: 'Clic su una miniatura: la apre grande in un <dialog>; Esc la chiude',
    tag: ['galleria', 'dialog'],
    html: `<div class="cat-thumbs">\n  <button type="button" data-cat-lightbox="Immagine 1">1</button>\n  <button type="button" data-cat-lightbox="Immagine 2">2</button>\n  <button type="button" data-cat-lightbox="Immagine 3">3</button>\n</div>\n<dialog id="cat-lightbox" class="cat-lightbox" aria-label="Immagine ingrandita">\n  <p id="cat-lightbox-text"></p>\n  <button type="button" id="cat-lightbox-close">Chiudi</button>\n</dialog>\n`,
    css: `.cat-thumbs { display: flex; gap: 0.5rem; }\n.cat-thumbs button { width: 4rem; height: 4rem; border: 0; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-placeholder, #e2e2e2); font: inherit; cursor: pointer; }\n.cat-lightbox { border: 0; border-radius: var(--cat-radius-lg, 0.75rem); padding: 2rem; text-align: center; }\n.cat-lightbox::backdrop { background: rgb(0 0 0 / 0.7); }\n`,
    js: `var dlg = document.getElementById('cat-lightbox');\ndocument.querySelectorAll('[data-cat-lightbox]').forEach(function (b) {\n  b.addEventListener('click', function () {\n    document.getElementById('cat-lightbox-text').textContent = b.getAttribute('data-cat-lightbox');\n    dlg.showModal();\n  });\n});\ndocument.getElementById('cat-lightbox-close').addEventListener('click', function () { dlg.close(); });\ndlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });\n`
  },
  {
    nome: 'Banner dei cookie',
    descrizione: 'Barra in basso con Accetta/Rifiuta che ricorda la scelta',
    tag: ['cookie', 'privacy'],
    html: `<div class="cat-cookie" id="cat-cookie" role="region" aria-label="Cookie" hidden>\n  <p>Usiamo cookie tecnici e, se vuoi, statistici. <a href="#">Informativa</a></p>\n  <div class="cat-cookie__actions">\n    <button type="button" data-cat-cookie="no">Rifiuta</button>\n    <button type="button" data-cat-cookie="si">Accetta</button>\n  </div>\n</div>\n`,
    css: `.cat-cookie { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.75rem 1rem; background: #111111; color: #fff; }\n.cat-cookie p { margin: 0; }\n.cat-cookie a { color: inherit; }\n.cat-cookie__actions { display: flex; gap: 0.5rem; }\n.cat-cookie button { padding: 0.4rem 1rem; border: 1px solid #fff; border-radius: var(--cat-radius-md, 0.5rem); background: transparent; color: #fff; font: inherit; cursor: pointer; }\n.cat-cookie button[data-cat-cookie="si"] { background: #fff; color: #111111; }\n`,
    js: `var box = document.getElementById('cat-cookie');\nvar saved = null;\ntry { saved = localStorage.getItem('cat-cookie'); } catch (e) {}\nbox.hidden = !!saved;\nbox.addEventListener('click', function (e) {\n  var b = e.target.closest('[data-cat-cookie]');\n  if (!b) return;\n  try { localStorage.setItem('cat-cookie', b.getAttribute('data-cat-cookie')); } catch (x) {}\n  box.hidden = true;\n});\n`
  },
  {
    nome: 'Link attivo durante lo scroll',
    descrizione: 'Il menu evidenzia la sezione visibile (scrollspy con IntersectionObserver)',
    tag: ['scroll', 'navigazione'],
    html: `<nav class="cat-spy" aria-label="Sezioni">\n  <a href="#cat-s1">Uno</a><a href="#cat-s2">Due</a><a href="#cat-s3">Tre</a>\n</nav>\n<section id="cat-s1" style="min-height:70vh"><h2>Uno</h2></section>\n<section id="cat-s2" style="min-height:70vh"><h2>Due</h2></section>\n<section id="cat-s3" style="min-height:70vh"><h2>Tre</h2></section>\n`,
    css: `.cat-spy { position: sticky; top: 0; display: flex; gap: 1rem; padding: 0.5rem 1rem; background: var(--cat-color-surface, #fff); border-bottom: 1px solid var(--cat-color-border, #8f8f8f); }\n.cat-spy a { color: inherit; text-decoration: none; padding-bottom: 2px; border-bottom: 2px solid transparent; }\n.cat-spy a.is-active { border-bottom-color: var(--cat-color-primary, #111111); font-weight: 700; }\nhtml { scroll-behavior: smooth; }\n@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }\n`,
    js: `var links = document.querySelectorAll('.cat-spy a');\nvar io = new IntersectionObserver(function (entries) {\n  entries.forEach(function (e) {\n    if (!e.isIntersecting) return;\n    links.forEach(function (a) {\n      a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);\n    });\n  });\n}, { rootMargin: '-40% 0px -50% 0px' });\nlinks.forEach(function (a) {\n  var s = document.querySelector(a.getAttribute('href'));\n  if (s) io.observe(s);\n});\n`
  },
  {
    nome: 'Header che si nasconde scorrendo',
    descrizione: 'La barra sparisce scorrendo in giù e riappare scorrendo in su',
    tag: ['header', 'scroll'],
    html: `<header class="cat-hide-header" id="cat-hide-header">Header che si nasconde</header>\n<div style="height:200vh;padding:4rem 1rem 1rem">Scorri su e giù.</div>\n`,
    css: `.cat-hide-header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  z-index: 10;\n  padding: 0.9rem 1rem;\n  background: var(--cat-color-surface, #fff);\n  border-bottom: 1px solid var(--cat-color-border, #8f8f8f);\n  transition: transform 250ms ease;\n}\n\n.cat-hide-header.is-hidden { transform: translateY(-100%); }\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-hide-header { transition: none; }\n}\n`,
    js: `var header = document.getElementById('cat-hide-header');\nvar last = window.scrollY;\nwindow.addEventListener('scroll', function () {\n  var y = window.scrollY;\n  header.classList.toggle('is-hidden', y > last && y > 80);\n  last = y;\n}, { passive: true });\n`
  },
  {
    nome: 'Immagini caricate al bisogno (lazy)',
    descrizione: 'Attributo loading=lazy e dimensioni dichiarate per evitare salti di layout',
    tag: ['immagini', 'prestazioni'],
    html: `<img class="cat-lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='100%25' height='100%25' fill='%23d9d9d2'/%3E%3C/svg%3E" width="640" height="360" loading="lazy" decoding="async" alt="Descrizione dell'immagine">\n`,
    css: `.cat-lazy {\n  display: block;\n  max-width: 100%;\n  height: auto;\n  border-radius: var(--cat-radius-md, 0.5rem);\n}\n`,
    js: ''
  }
];
