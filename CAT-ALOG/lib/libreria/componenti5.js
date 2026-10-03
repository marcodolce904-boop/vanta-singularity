'use strict';

/* Componenti v5: elementi di uso comune che mancavano (liste, tab, input group, dropzone, toast, alert chiudibili…). */

module.exports = [
  {
    nome: 'Lista di elementi (list group)',
    descrizione: 'Elenco con voci cliccabili, attiva, disabilitata e con badge',
    tag: ['lista', 'list-group'],
    html: `<ul class="cat-listgroup" aria-label="Elenco">\n  <li><a href="#" aria-current="true">Voce attiva</a></li>\n  <li><a href="#">Voce normale <span class="cat-listgroup__badge">4</span></a></li>\n  <li><a href="#">Un’altra voce</a></li>\n  <li><span aria-disabled="true">Voce disabilitata</span></li>\n</ul>\n`,
    css: `.cat-listgroup { margin: 0; padding: 0; list-style: none; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-md, 0.5rem); overflow: hidden; background: var(--cat-color-surface, #fff); }\n.cat-listgroup li + li { border-top: 1px solid var(--cat-color-border, #d9d9d2); }\n.cat-listgroup a, .cat-listgroup span[aria-disabled] { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem var(--cat-space-3, 1rem); color: inherit; text-decoration: none; }\n.cat-listgroup a:hover { background: rgb(0 0 0 / 0.05); }\n.cat-listgroup a[aria-current="true"] { background: var(--cat-color-primary, #2f6f4e); color: #fff; }\n.cat-listgroup span[aria-disabled] { color: var(--cat-color-text-muted, #5c5c57); opacity: 0.6; }\n.cat-listgroup__badge { padding: 0.1rem 0.55rem; border-radius: 999px; background: var(--cat-color-secondary, #4a5568); color: #fff; font-size: 0.75rem; }\n`,
    js: ''
  },
  {
    nome: 'Schede (tabs) a linguetta e a pillola',
    descrizione: 'Due stili di tab con frecce, Home/End e ruoli aria',
    tag: ['tab', 'schede', 'aria'],
    html: `<div class="cat-tabs2" data-cat-tabs2>\n  <div role="tablist" aria-label="Esempio">\n    <button role="tab" id="cat-t2a" aria-controls="cat-p2a" aria-selected="true">Profilo</button>\n    <button role="tab" id="cat-t2b" aria-controls="cat-p2b" aria-selected="false" tabindex="-1">Sicurezza</button>\n    <button role="tab" id="cat-t2c" aria-controls="cat-p2c" aria-selected="false" tabindex="-1">Fatture</button>\n  </div>\n  <div role="tabpanel" id="cat-p2a" aria-labelledby="cat-t2a" tabindex="0"><p>Pannello profilo.</p></div>\n  <div role="tabpanel" id="cat-p2b" aria-labelledby="cat-t2b" tabindex="0" hidden><p>Pannello sicurezza.</p></div>\n  <div role="tabpanel" id="cat-p2c" aria-labelledby="cat-t2c" tabindex="0" hidden><p>Pannello fatture.</p></div>\n</div>\n`,
    css: `.cat-tabs2 [role="tablist"] { display: flex; gap: 0.25rem; border-bottom: 1px solid var(--cat-color-border, #d9d9d2); overflow-x: auto; }\n.cat-tabs2 [role="tab"] { padding: 0.6rem 1rem; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--cat-color-text-muted, #5c5c57); font: inherit; white-space: nowrap; cursor: pointer; }\n.cat-tabs2 [role="tab"][aria-selected="true"] { border-bottom-color: var(--cat-color-primary, #2f6f4e); color: var(--cat-color-text, #1c1c1a); font-weight: 700; }\n.cat-tabs2 [role="tab"]:focus-visible { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: -3px; }\n.cat-tabs2 [role="tabpanel"] { padding: var(--cat-space-3, 1rem) 0; }\n`,
    js: `document.querySelectorAll('[data-cat-tabs2]').forEach(function (root) {\n  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));\n  function select(i) {\n    tabs.forEach(function (t, n) {\n      var on = n === i;\n      t.setAttribute('aria-selected', String(on));\n      t.tabIndex = on ? 0 : -1;\n      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;\n    });\n    tabs[i].focus();\n  }\n  tabs.forEach(function (t, i) {\n    t.addEventListener('click', function () { select(i); });\n    t.addEventListener('keydown', function (e) {\n      if (e.key === 'ArrowRight') select((i + 1) % tabs.length);\n      else if (e.key === 'ArrowLeft') select((i - 1 + tabs.length) % tabs.length);\n      else if (e.key === 'Home') select(0);\n      else if (e.key === 'End') select(tabs.length - 1);\n    });\n  });\n});\n`
  },
  {
    nome: 'Campo con prefisso e suffisso (input group)',
    descrizione: 'Testo o icona attaccati al campo: @, €, .it, pulsante',
    tag: ['form', 'input-group'],
    html: `<div class="cat-ig">\n  <label for="cat-ig-1">Nome utente</label>\n  <div class="cat-ig__row"><span>@</span><input id="cat-ig-1" type="text" placeholder="nome"></div>\n</div>\n<div class="cat-ig">\n  <label for="cat-ig-2">Importo</label>\n  <div class="cat-ig__row"><span>€</span><input id="cat-ig-2" type="number" placeholder="0,00"><span>,00</span></div>\n</div>\n<div class="cat-ig">\n  <label for="cat-ig-3">Codice sconto</label>\n  <div class="cat-ig__row"><input id="cat-ig-3" type="text"><button type="button">Applica</button></div>\n</div>\n`,
    css: `.cat-ig { max-width: 24rem; margin-bottom: var(--cat-space-3, 1rem); }\n.cat-ig label { display: block; margin-bottom: 0.25rem; font-weight: 600; }\n.cat-ig__row { display: flex; }\n.cat-ig__row > * { padding: 0.5rem 0.8rem; border: 1px solid var(--cat-color-border, #d9d9d2); background: var(--cat-color-surface, #fff); color: inherit; font: inherit; }\n.cat-ig__row > span { background: rgb(0 0 0 / 0.05); color: var(--cat-color-text-muted, #5c5c57); }\n.cat-ig__row > input { flex: 1; min-width: 0; }\n.cat-ig__row > * + * { margin-left: -1px; }\n.cat-ig__row > :first-child { border-radius: var(--cat-radius-md, 0.5rem) 0 0 var(--cat-radius-md, 0.5rem); }\n.cat-ig__row > :last-child { border-radius: 0 var(--cat-radius-md, 0.5rem) var(--cat-radius-md, 0.5rem) 0; }\n.cat-ig__row > button { background: var(--cat-color-primary, #2f6f4e); border-color: var(--cat-color-primary, #2f6f4e); color: #fff; cursor: pointer; }\n.cat-ig__row > input:focus-visible { position: relative; z-index: 1; outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: -1px; }\n`,
    js: ''
  },
  {
    nome: 'Etichetta flottante',
    descrizione: 'L\'etichetta sta dentro il campo e sale sopra quando scrivi (solo CSS)',
    tag: ['form', 'input'],
    html: `<div class="cat-float-field">\n  <input id="cat-ff" type="text" placeholder=" " autocomplete="name">\n  <label for="cat-ff">Nome e cognome</label>\n</div>\n`,
    css: `.cat-float-field { position: relative; max-width: 22rem; }\n.cat-float-field input { width: 100%; box-sizing: border-box; padding: 1.35rem 0.8rem 0.4rem; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-surface, #fff); color: inherit; font: inherit; }\n.cat-float-field label { position: absolute; left: 0.8rem; top: 0.85rem; color: var(--cat-color-text-muted, #5c5c57); pointer-events: none; transform-origin: left top; transition: transform 150ms ease; }\n.cat-float-field input:focus + label, .cat-float-field input:not(:placeholder-shown) + label { transform: translateY(-0.6rem) scale(0.78); }\n.cat-float-field input:focus-visible { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: 1px; }\n@media (prefers-reduced-motion: reduce) { .cat-float-field label { transition: none; } }\n`,
    js: ''
  },
  {
    nome: 'Area per trascinare un file (dropzone)',
    descrizione: 'Riquadro tratteggiato che accetta file trascinati o scelti, con elenco dei nomi',
    tag: ['form', 'file', 'upload'],
    html: `<div class="cat-drop" id="cat-drop">\n  <input type="file" id="cat-drop-input" multiple hidden>\n  <p><strong>Trascina qui i file</strong> oppure <label for="cat-drop-input" class="cat-drop__pick" tabindex="0">scegli dal computer</label></p>\n  <ul class="cat-drop__list" aria-live="polite"></ul>\n</div>\n`,
    css: `.cat-drop { padding: var(--cat-space-5, 2.5rem) var(--cat-space-3, 1rem); border: 2px dashed var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); text-align: center; transition: background 150ms ease, border-color 150ms ease; }\n@media (prefers-reduced-motion: reduce) { .cat-drop { transition: none; } }\n.cat-drop.is-over { border-color: var(--cat-color-primary, #2f6f4e); background: rgb(47 111 78 / 0.08); }\n.cat-drop p { margin: 0; }\n.cat-drop__pick { color: var(--cat-color-primary, #2f6f4e); text-decoration: underline; cursor: pointer; }\n.cat-drop__list { margin: var(--cat-space-2, 0.5rem) 0 0; padding: 0; list-style: none; font-size: 0.875rem; color: var(--cat-color-text-muted, #5c5c57); }\n`,
    js: `var drop = document.getElementById('cat-drop');\nvar input = document.getElementById('cat-drop-input');\nvar out = drop.querySelector('.cat-drop__list');\nfunction show(files) {\n  out.textContent = '';\n  Array.prototype.forEach.call(files, function (f) {\n    var li = document.createElement('li');\n    li.textContent = f.name + ' (' + Math.max(1, Math.round(f.size / 1024)) + ' KB)';\n    out.appendChild(li);\n  });\n}\n['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });\n['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });\ndrop.addEventListener('drop', function (e) { show(e.dataTransfer.files); });\ninput.addEventListener('change', function () { show(input.files); });\ndrop.querySelector('.cat-drop__pick').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });\n`
  },
  {
    nome: 'Card orizzontale',
    descrizione: 'Immagine a sinistra e testo a destra; l\'immagine passa sopra su schermo stretto',
    tag: ['card', 'orizzontale', 'responsive'],
    html: `<article class="cat-hcard">\n  <div class="cat-hcard__img" role="img" aria-label="Immagine"></div>\n  <div class="cat-hcard__body">\n    <h3>Titolo della card</h3>\n    <p>Testo che accompagna l’immagine e va a capo da solo.</p>\n    <a href="#">Leggi tutto →</a>\n  </div>\n</article>\n`,
    css: `.cat-hcard { display: flex; flex-wrap: wrap; overflow: hidden; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-surface, #fff); }\n.cat-hcard__img { flex: 1 1 12rem; min-height: 10rem; background: linear-gradient(135deg, var(--cat-color-secondary, #4a5568), var(--cat-color-primary, #2f6f4e)); }\n.cat-hcard__body { flex: 2 1 16rem; padding: var(--cat-space-3, 1rem); }\n.cat-hcard__body h3 { margin: 0 0 0.4rem; }\n.cat-hcard__body p { margin: 0 0 0.5rem; color: var(--cat-color-text-muted, #5c5c57); }\n.cat-hcard__body a { color: var(--cat-color-primary, #2f6f4e); }\n`,
    js: ''
  },
  {
    nome: 'Alert chiudibile',
    descrizione: 'Messaggio con pulsante di chiusura che lo toglie dalla pagina',
    tag: ['alert', 'messaggio'],
    html: `<div class="cat-alert2" role="alert">\n  <span><strong>Attenzione:</strong> controlla i dati prima di inviare.</span>\n  <button type="button" class="cat-alert2__close" aria-label="Chiudi il messaggio">×</button>\n</div>\n`,
    css: `.cat-alert2 { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; padding: 0.75rem var(--cat-space-3, 1rem); border: 1px solid var(--cat-color-warning, #b26a00); border-radius: var(--cat-radius-md, 0.5rem); background: rgb(178 106 0 / 0.1); }\n.cat-alert2__close { width: 1.75rem; height: 1.75rem; border: 0; border-radius: 50%; background: none; color: inherit; font-size: 1.25rem; line-height: 1; cursor: pointer; }\n.cat-alert2__close:hover { background: rgb(0 0 0 / 0.08); }\n`,
    js: `document.querySelectorAll('.cat-alert2__close').forEach(function (b) {\n  b.addEventListener('click', function () { b.closest('.cat-alert2').remove(); });\n});\n`
  },
  {
    nome: 'Notifiche toast impilate',
    descrizione: 'Più messaggi in alto a destra, ognuno con chiusura e scomparsa automatica',
    tag: ['toast', 'notifica', 'js'],
    html: `<button type="button" id="cat-toast-add">Mostra una notifica</button>\n<div class="cat-toasts" id="cat-toasts" role="region" aria-label="Notifiche" aria-live="polite"></div>\n`,
    css: `.cat-toasts { position: fixed; top: 1rem; right: 1rem; z-index: 60; display: grid; gap: 0.5rem; width: min(22rem, calc(100vw - 2rem)); }\n.cat-toast-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; padding: 0.75rem 1rem; border-left: 4px solid var(--cat-color-primary, #2f6f4e); border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-surface, #fff); box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12)); animation: cat-toast-in 250ms ease-out; }\n.cat-toast-item button { border: 0; background: none; color: inherit; font-size: 1.1rem; cursor: pointer; }\n@keyframes cat-toast-in { from { opacity: 0; transform: translateX(1rem); } to { opacity: 1; transform: none; } }\n@media (prefers-reduced-motion: reduce) { .cat-toast-item { animation: none; } }\n`,
    js: `var box = document.getElementById('cat-toasts');\nvar count = 0;\ndocument.getElementById('cat-toast-add').addEventListener('click', function () {\n  count += 1;\n  var item = document.createElement('div');\n  item.className = 'cat-toast-item';\n  var text = document.createElement('span');\n  text.textContent = 'Notifica numero ' + count;\n  var close = document.createElement('button');\n  close.type = 'button';\n  close.setAttribute('aria-label', 'Chiudi la notifica');\n  close.textContent = '×';\n  close.addEventListener('click', function () { item.remove(); });\n  item.appendChild(text);\n  item.appendChild(close);\n  box.appendChild(item);\n  setTimeout(function () { item.remove(); }, 4000);\n});\n`
  },
  {
    nome: 'Icona con pallino di notifica',
    descrizione: 'Campanella con puntino o numero in alto a destra',
    tag: ['badge', 'notifica', 'icona'],
    html: `<button type="button" class="cat-bell" aria-label="Notifiche, 3 nuove">\n  <span aria-hidden="true">🔔</span>\n  <span class="cat-bell__count" aria-hidden="true">3</span>\n</button>\n`,
    css: `.cat-bell { position: relative; width: 2.75rem; height: 2.75rem; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: 50%; background: var(--cat-color-surface, #fff); font-size: 1.25rem; cursor: pointer; }\n.cat-bell__count { position: absolute; top: -0.25rem; right: -0.25rem; display: grid; place-items: center; min-width: 1.25rem; height: 1.25rem; padding: 0 0.3rem; border: 2px solid var(--cat-color-surface, #fff); border-radius: 999px; background: var(--cat-color-error, #b3261e); color: #fff; font-size: 0.6875rem; font-weight: 700; }\n`,
    js: ''
  },
  {
    nome: 'Barra di avanzamento a strisce',
    descrizione: 'Progress animata a strisce con percentuale dentro',
    tag: ['progress', 'stato'],
    html: `<div class="cat-bar" role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" aria-label="Avanzamento">\n  <div class="cat-bar__fill" style="width:65%">65%</div>\n</div>\n`,
    css: `.cat-bar { overflow: hidden; height: 1.5rem; border-radius: 999px; background: var(--cat-color-border, #d9d9d2); }\n.cat-bar__fill { height: 100%; display: grid; place-items: center; background-color: var(--cat-color-primary, #2f6f4e); background-image: linear-gradient(45deg, rgb(255 255 255 / 0.2) 25%, transparent 25% 50%, rgb(255 255 255 / 0.2) 50% 75%, transparent 75%); background-size: 1.5rem 1.5rem; color: #fff; font-size: 0.75rem; font-weight: 700; animation: cat-stripes 1s linear infinite; }\n@keyframes cat-stripes { to { background-position: 1.5rem 0; } }\n@media (prefers-reduced-motion: reduce) { .cat-bar__fill { animation: none; } }\n`,
    js: ''
  },
  {
    nome: 'Contenitore video 16:9 (embed responsive)',
    descrizione: 'Riquadro che mantiene il rapporto 16:9 per iframe e video, a qualsiasi larghezza',
    tag: ['video', 'embed', 'responsive'],
    html: `<div class="cat-ratio cat-ratio--16x9">\n  <iframe title="Video di esempio" src="about:blank" loading="lazy" allowfullscreen></iframe>\n</div>\n`,
    css: `.cat-ratio { position: relative; width: 100%; background: #1c1c1a; border-radius: var(--cat-radius-md, 0.5rem); overflow: hidden; }\n.cat-ratio--16x9 { aspect-ratio: 16 / 9; }\n.cat-ratio--4x3 { aspect-ratio: 4 / 3; }\n.cat-ratio--1x1 { aspect-ratio: 1; }\n.cat-ratio > iframe, .cat-ratio > video, .cat-ratio > img { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; object-fit: cover; }\n`,
    js: ''
  },
  {
    nome: 'Immagine con didascalia',
    descrizione: 'Figure con immagine adattabile e testo sotto',
    tag: ['immagine', 'figure'],
    html: `<figure class="cat-figure">\n  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='100%25' height='100%25' fill='%23d9d9d2'/%3E%3C/svg%3E" width="640" height="360" alt="Descrizione dell'immagine" loading="lazy">\n  <figcaption>Didascalia: chi, dove, quando.</figcaption>\n</figure>\n`,
    css: `.cat-figure { margin: 0; max-width: 40rem; }\n.cat-figure img { display: block; width: 100%; height: auto; border-radius: var(--cat-radius-md, 0.5rem); }\n.cat-figure figcaption { margin-top: 0.4rem; color: var(--cat-color-text-muted, #5c5c57); font-size: 0.875rem; }\n`,
    js: ''
  },
  {
    nome: 'Riquadro statistica con tendenza',
    descrizione: 'Numero grande, etichetta e variazione in verde o rosso',
    tag: ['dati', 'kpi', 'card'],
    html: `<div class="cat-stat">\n  <small>Ricavi del mese</small>\n  <strong>12.480 €</strong>\n  <span class="cat-stat__up">▲ 8,4% rispetto al mese scorso</span>\n</div>\n`,
    css: `.cat-stat { display: grid; gap: 0.2rem; max-width: 16rem; padding: var(--cat-space-3, 1rem); border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-surface, #fff); }\n.cat-stat small { color: var(--cat-color-text-muted, #5c5c57); }\n.cat-stat strong { font-size: 1.9rem; line-height: 1.1; }\n.cat-stat__up { color: var(--cat-color-success, #2f7d32); font-size: 0.875rem; }\n.cat-stat__down { color: var(--cat-color-error, #b3261e); font-size: 0.875rem; }\n`,
    js: ''
  },
  {
    nome: 'Avatar con stato (online)',
    descrizione: 'Avatar tondo con pallino verde, grigio o rosso in basso a destra',
    tag: ['avatar', 'stato'],
    html: `<span class="cat-avatar2" data-status="online" role="img" aria-label="Anna, online">AB</span>\n<span class="cat-avatar2" data-status="away" role="img" aria-label="Luca, assente">LR</span>\n<span class="cat-avatar2" data-status="busy" role="img" aria-label="Sara, occupata">SV</span>\n`,
    css: `.cat-avatar2 { position: relative; display: inline-grid; place-items: center; width: 2.75rem; height: 2.75rem; margin-right: 0.5rem; border-radius: 50%; background: var(--cat-color-secondary, #4a5568); color: #fff; font-weight: 700; }\n.cat-avatar2::after { content: ""; position: absolute; right: 0; bottom: 0; width: 0.75rem; height: 0.75rem; border: 2px solid var(--cat-color-surface, #fff); border-radius: 50%; background: #9a9a92; }\n.cat-avatar2[data-status="online"]::after { background: var(--cat-color-success, #2f7d32); }\n.cat-avatar2[data-status="busy"]::after { background: var(--cat-color-error, #b3261e); }\n.cat-avatar2[data-status="away"]::after { background: var(--cat-color-warning, #b26a00); }\n`,
    js: ''
  },
  {
    nome: 'Tabella a schede su mobile',
    descrizione: 'Tabella normale su desktop; sotto 576 px ogni riga diventa una scheda con le etichette',
    tag: ['tabella', 'mobile', 'responsive'],
    html: `<table class="cat-rtable">\n  <thead><tr><th scope="col">Nome</th><th scope="col">Ruolo</th><th scope="col">Città</th></tr></thead>\n  <tbody>\n    <tr><td data-label="Nome">Anna</td><td data-label="Ruolo">Designer</td><td data-label="Città">Torino</td></tr>\n    <tr><td data-label="Nome">Luca</td><td data-label="Ruolo">Sviluppatore</td><td data-label="Città">Milano</td></tr>\n  </tbody>\n</table>\n`,
    css: `.cat-rtable { width: 100%; border-collapse: collapse; }\n.cat-rtable th, .cat-rtable td { padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--cat-color-border, #d9d9d2); text-align: left; }\n@media (max-width: 575.98px) {\n  .cat-rtable thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }\n  .cat-rtable, .cat-rtable tbody, .cat-rtable tr, .cat-rtable td { display: block; }\n  .cat-rtable tr { margin-bottom: 0.75rem; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-md, 0.5rem); }\n  .cat-rtable td { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--cat-color-border, #d9d9d2); }\n  .cat-rtable td:last-child { border-bottom: 0; }\n  .cat-rtable td::before { content: attr(data-label); font-weight: 700; }\n}\n`,
    js: ''
  }
];
