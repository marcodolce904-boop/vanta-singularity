'use strict';

/* Componenti di uso comune. HTML + CSS (+ JS dove serve). Le variabili --cat-* hanno sempre un valore di riserva. */

const LOGO = '<svg class="cat-logo" viewBox="0 0 120 40" role="img" aria-label="Logo"><rect width="120" height="40" rx="8" fill="currentColor" opacity="0.15"/><text x="60" y="26" text-anchor="middle" font-size="14" font-family="sans-serif" fill="currentColor">LOGO</text></svg>';

module.exports = [
  {
    nome: 'Pulsanti: varianti',
    descrizione: 'Primario, secondario, outline, ghost, pill, piccolo/grande, disabilitato',
    tag: ['pulsante', 'bottone'],
    html: `<div class="cat-btn-row">\n  <button type="button" class="cat-button">Primario</button>\n  <button type="button" class="cat-button cat-button--secondary">Secondario</button>\n  <button type="button" class="cat-button cat-button--outline">Outline</button>\n  <button type="button" class="cat-button cat-button--ghost">Ghost</button>\n  <button type="button" class="cat-button cat-button--pill">Pill</button>\n  <button type="button" class="cat-button cat-button--sm">Piccolo</button>\n  <button type="button" class="cat-button cat-button--lg">Grande</button>\n  <button type="button" class="cat-button" disabled>Disabilitato</button>\n</div>\n`,
    css: `.cat-btn-row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: var(--cat-space-2, 0.5rem);\n}\n\n.cat-button {\n  padding: 0.6rem 1.2rem;\n  border: 2px solid var(--cat-color-primary, #111111);\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n  transition: transform 150ms ease, opacity 150ms ease;\n}\n\n.cat-button:hover { transform: translateY(-1px); }\n.cat-button:active { transform: translateY(0); }\n.cat-button:focus-visible { outline: 3px solid var(--cat-color-accent, #005fcc); outline-offset: 2px; }\n.cat-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }\n\n.cat-button--secondary { border-color: var(--cat-color-secondary, #404040); background: var(--cat-color-secondary, #404040); }\n.cat-button--outline { background: transparent; color: var(--cat-color-primary, #111111); }\n.cat-button--ghost { border-color: transparent; background: transparent; color: var(--cat-color-primary, #111111); }\n.cat-button--pill { border-radius: 999px; }\n.cat-button--sm { padding: 0.3rem 0.8rem; font-size: 0.875rem; }\n.cat-button--lg { padding: 0.9rem 1.8rem; font-size: 1.125rem; }\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-button { transition: none; }\n  .cat-button:hover { transform: none; }\n}\n`,
    js: ''
  },
  {
    nome: 'Pulsante con icona',
    descrizione: 'Testo + icona SVG (currentColor) e pulsante solo icona con etichetta nascosta',
    tag: ['pulsante', 'icona', 'svg'],
    html: `<button type="button" class="cat-icon-btn">\n  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>\n  Avanti\n</button>\n<button type="button" class="cat-icon-btn cat-icon-btn--only" aria-label="Cerca">\n  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>\n</button>\n`,
    css: `.cat-icon-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--cat-space-2, 0.5rem);\n  padding: 0.6rem 1.1rem;\n  border: 0;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cat-icon-btn--only {\n  padding: 0.6rem;\n  border-radius: 50%;\n}\n\n.cat-icon-btn:focus-visible {\n  outline: 3px solid var(--cat-color-accent, #005fcc);\n  outline-offset: 2px;\n}\n`,
    js: ''
  },
  {
    nome: 'Gruppo di pulsanti',
    descrizione: 'Pulsanti attaccati con bordi arrotondati solo agli estremi',
    tag: ['pulsante', 'gruppo'],
    html: `<div class="cat-btn-group" role="group" aria-label="Vista">\n  <button type="button" aria-pressed="true">Giorno</button>\n  <button type="button" aria-pressed="false">Settimana</button>\n  <button type="button" aria-pressed="false">Mese</button>\n</div>\n`,
    css: `.cat-btn-group {\n  display: inline-flex;\n}\n\n.cat-btn-group button {\n  padding: 0.5rem 1rem;\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  margin-left: -1px;\n  background: var(--cat-color-surface, #fff);\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cat-btn-group button:first-child { margin-left: 0; border-radius: var(--cat-radius-md, 0.5rem) 0 0 var(--cat-radius-md, 0.5rem); }\n.cat-btn-group button:last-child { border-radius: 0 var(--cat-radius-md, 0.5rem) var(--cat-radius-md, 0.5rem) 0; }\n.cat-btn-group button[aria-pressed="true"] { background: var(--cat-color-primary, #111111); color: #fff; }\n`,
    js: `document.querySelectorAll('.cat-btn-group').forEach(function (g) {\n  g.addEventListener('click', function (e) {\n    var b = e.target.closest('button');\n    if (!b) return;\n    g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });\n  });\n});\n`
  },
  {
    nome: 'Navbar con logo',
    descrizione: 'Logo a sinistra, link, pulsante hamburger su schermo stretto (con JS)',
    tag: ['navbar', 'logo', 'menu'],
    html: `<header class="cat-navbar">\n  <a href="/" class="cat-navbar__brand" aria-label="Home">\n    <!-- Sostituisci con <img src="logo.svg" alt="Nome del sito"> -->\n    ${LOGO}\n  </a>\n  <button type="button" class="cat-navbar__toggle" aria-expanded="false" aria-controls="cat-navbar-menu" aria-label="Apri il menu">\n    <span></span><span></span><span></span>\n  </button>\n  <nav id="cat-navbar-menu" class="cat-navbar__menu" aria-label="Principale">\n    <a href="#" aria-current="page">Home</a>\n    <a href="#">Servizi</a>\n    <a href="#">Portfolio</a>\n    <a href="#">Contatti</a>\n  </nav>\n</header>\n`,
    css: `.cat-logo { display: block; height: 2.5rem; width: auto; color: var(--cat-color-primary, #111111); }\n\n.cat-navbar {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  border-bottom: 1px solid var(--cat-color-border, #8f8f8f);\n  background: var(--cat-color-surface, #fff);\n}\n\n.cat-navbar__menu {\n  display: flex;\n  gap: var(--cat-space-3, 1rem);\n}\n\n.cat-navbar__menu a {\n  padding: 0.25rem 0;\n  border-bottom: 2px solid transparent;\n  color: inherit;\n  text-decoration: none;\n}\n\n.cat-navbar__menu a:hover,\n.cat-navbar__menu a[aria-current="page"] {\n  border-bottom-color: var(--cat-color-primary, #111111);\n}\n\n.cat-navbar__toggle {\n  display: none;\n  flex-direction: column;\n  gap: 4px;\n  padding: 0.5rem;\n  border: 0;\n  background: none;\n  cursor: pointer;\n}\n\n.cat-navbar__toggle span {\n  display: block;\n  width: 1.5rem;\n  height: 2px;\n  background: currentColor;\n}\n\n@media (max-width: 640px) {\n  .cat-navbar__toggle { display: flex; }\n  .cat-navbar__menu {\n    flex-basis: 100%;\n    flex-direction: column;\n    gap: var(--cat-space-2, 0.5rem);\n    padding-top: var(--cat-space-2, 0.5rem);\n  }\n  .cat-navbar__menu[hidden] { display: none; }\n}\n`,
    js: `document.querySelectorAll('.cat-navbar').forEach(function (nav) {\n  var btn = nav.querySelector('.cat-navbar__toggle');\n  var menu = nav.querySelector('.cat-navbar__menu');\n  var narrow = window.matchMedia('(max-width: 640px)');\n  function sync() {\n    if (!narrow.matches) { menu.hidden = false; btn.setAttribute('aria-expanded', 'false'); }\n    else if (btn.getAttribute('aria-expanded') !== 'true') menu.hidden = true;\n  }\n  btn.addEventListener('click', function () {\n    var open = btn.getAttribute('aria-expanded') !== 'true';\n    btn.setAttribute('aria-expanded', String(open));\n    menu.hidden = !open;\n  });\n  narrow.addEventListener('change', sync);\n  sync();\n});\n`
  },
  {
    nome: 'Navbar fissa in alto',
    descrizione: 'Barra sticky con logo, link e pulsante, ombra quando scorri',
    tag: ['navbar', 'sticky', 'logo'],
    html: `<header class="cat-sticky-nav" id="cat-sticky-nav">\n  <a href="/" aria-label="Home">${LOGO}</a>\n  <nav aria-label="Principale">\n    <a href="#">Home</a>\n    <a href="#">Servizi</a>\n    <a href="#">Contatti</a>\n  </nav>\n  <a class="cat-sticky-nav__cta" href="#">Prenota</a>\n</header>\n<div style="height:150vh;padding:1rem">Scorri la pagina per vedere l'ombra.</div>\n`,
    css: `.cat-logo { display: block; height: 2.25rem; width: auto; color: var(--cat-color-primary, #111111); }\n\n.cat-sticky-nav {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: var(--cat-space-3, 1rem);\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  background: var(--cat-color-surface, #fff);\n  transition: box-shadow 200ms ease;\n}\n\n@media (prefers-reduced-motion: reduce) { .cat-sticky-nav { transition: none; } }\n\n.cat-sticky-nav.is-scrolled { box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12)); }\n.cat-sticky-nav nav { display: flex; gap: var(--cat-space-3, 1rem); }\n.cat-sticky-nav a { color: inherit; text-decoration: none; }\n.cat-sticky-nav__cta { padding: 0.45rem 1rem; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-primary, #111111); color: #fff !important; }\n`,
    js: `var bar = document.getElementById('cat-sticky-nav');\nfunction onScroll() { bar.classList.toggle('is-scrolled', window.scrollY > 8); }\nwindow.addEventListener('scroll', onScroll, { passive: true });\nonScroll();\n`
  },
  {
    nome: 'Breadcrumb',
    descrizione: 'Briciole di pane accessibili con separatore',
    tag: ['navigazione'],
    html: `<nav aria-label="Percorso" class="cat-breadcrumb">\n  <ol>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">Categoria</a></li>\n    <li aria-current="page">Pagina attuale</li>\n  </ol>\n</nav>\n`,
    css: `.cat-breadcrumb ol {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  font-size: 0.875rem;\n}\n\n.cat-breadcrumb li + li::before {\n  content: "/";\n  margin-right: 0.5rem;\n  color: var(--cat-color-text-muted, #4a4a4a);\n}\n\n.cat-breadcrumb a { color: var(--cat-color-primary, #111111); }\n`,
    js: ''
  },
  {
    nome: 'Paginazione',
    descrizione: 'Pagine numerate con precedente/successivo',
    tag: ['navigazione', 'lista'],
    html: `<nav aria-label="Pagine" class="cat-pagination">\n  <a href="#" aria-label="Precedente">‹</a>\n  <a href="#">1</a>\n  <a href="#" aria-current="page">2</a>\n  <a href="#">3</a>\n  <a href="#" aria-label="Successiva">›</a>\n</nav>\n`,
    css: `.cat-pagination {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n}\n\n.cat-pagination a {\n  min-width: 2.25rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-sm, 0.25rem);\n  color: inherit;\n  text-align: center;\n  text-decoration: none;\n}\n\n.cat-pagination a[aria-current="page"] {\n  border-color: var(--cat-color-primary, #111111);\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n}\n`,
    js: ''
  },
  {
    nome: 'Card con immagine',
    descrizione: 'Immagine, titolo, testo e link; immagine che tiene il rapporto 16:9',
    tag: ['card', 'immagine'],
    html: `<article class="cat-card-img">\n  <div class="cat-card-img__media" role="img" aria-label="Immagine di esempio"></div>\n  <div class="cat-card-img__body">\n    <h3>Titolo della card</h3>\n    <p>Due righe di testo che descrivono il contenuto.</p>\n    <a href="#">Leggi di più →</a>\n  </div>\n</article>\n`,
    css: `.cat-card-img {\n  max-width: 20rem;\n  overflow: hidden;\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  background: var(--cat-color-surface, #fff);\n}\n\n.cat-card-img__media {\n  aspect-ratio: 16 / 9;\n  background: var(--cat-color-placeholder, #e2e2e2);\n}\n\n.cat-card-img__body { padding: var(--cat-space-3, 1rem); }\n.cat-card-img__body h3 { margin: 0 0 var(--cat-space-2, 0.5rem); }\n.cat-card-img__body p { margin: 0 0 var(--cat-space-2, 0.5rem); color: var(--cat-color-text-muted, #4a4a4a); }\n.cat-card-img__body a { color: var(--cat-color-primary, #111111); }\n`,
    js: ''
  },
  {
    nome: 'Card prodotto',
    descrizione: 'Immagine, nome, prezzo e pulsante aggiungi',
    tag: ['card', 'prodotto', 'shop'],
    html: `<article class="cat-product">\n  <div class="cat-product__img" role="img" aria-label="Prodotto"></div>\n  <h3>Nome prodotto</h3>\n  <p class="cat-product__price">29,00 €</p>\n  <button type="button" class="cat-product__btn">Aggiungi al carrello</button>\n</article>\n`,
    css: `.cat-product {\n  max-width: 16rem;\n  padding: var(--cat-space-3, 1rem);\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  text-align: center;\n}\n\n.cat-product__img { aspect-ratio: 1; margin-bottom: var(--cat-space-2, 0.5rem); border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-placeholder, #e2e2e2); }\n.cat-product h3 { margin: 0; }\n.cat-product__price { margin: 0.25rem 0 var(--cat-space-2, 0.5rem); font-weight: 700; }\n.cat-product__btn { width: 100%; padding: 0.55rem; border: 0; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-primary, #111111); color: #fff; font: inherit; cursor: pointer; }\n`,
    js: ''
  },
  {
    nome: 'Card profilo',
    descrizione: 'Avatar tondo, nome, ruolo e link social',
    tag: ['card', 'avatar', 'team'],
    html: `<article class="cat-profile">\n  <div class="cat-avatar cat-avatar--lg" aria-hidden="true">MR</div>\n  <h3>Mario Rossi</h3>\n  <p>Designer</p>\n  <div class="cat-profile__links"><a href="#">Sito</a><a href="#">Email</a></div>\n</article>\n`,
    css: `.cat-profile {\n  max-width: 16rem;\n  padding: var(--cat-space-4, 1.5rem);\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  text-align: center;\n}\n\n.cat-avatar {\n  display: inline-grid;\n  place-items: center;\n  width: 2.5rem;\n  height: 2.5rem;\n  border-radius: 50%;\n  background: var(--cat-color-secondary, #404040);\n  color: #fff;\n  font-weight: 700;\n}\n\n.cat-avatar--lg { width: 5rem; height: 5rem; font-size: 1.5rem; }\n.cat-profile h3 { margin: var(--cat-space-2, 0.5rem) 0 0; }\n.cat-profile p { margin: 0 0 var(--cat-space-2, 0.5rem); color: var(--cat-color-text-muted, #4a4a4a); }\n.cat-profile__links { display: flex; justify-content: center; gap: var(--cat-space-3, 1rem); }\n.cat-profile__links a { color: var(--cat-color-primary, #111111); }\n`,
    js: ''
  },
  {
    nome: 'Badge e tag',
    descrizione: 'Etichette colorate per stati e categorie',
    tag: ['badge', 'tag'],
    html: `<span class="cat-badge">Nuovo</span>\n<span class="cat-badge cat-badge--success">Attivo</span>\n<span class="cat-badge cat-badge--warning">In attesa</span>\n<span class="cat-badge cat-badge--error">Errore</span>\n`,
    css: `.cat-badge {\n  display: inline-block;\n  padding: 0.15rem 0.6rem;\n  border-radius: 999px;\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  font-size: 0.8125rem;\n  font-weight: 600;\n}\n\n.cat-badge--success { background: var(--cat-color-success, #1e7a34); }\n.cat-badge--warning { background: var(--cat-color-warning, #8a5a00); }\n.cat-badge--error { background: var(--cat-color-error, #b00020); }\n`,
    js: ''
  },
  {
    nome: 'Alert e notifiche',
    descrizione: 'Messaggi di info, successo, avviso ed errore con role corretto',
    tag: ['alert', 'messaggio'],
    html: `<div class="cat-alert cat-alert--info" role="status">Informazione: il tuo profilo è aggiornato.</div>\n<div class="cat-alert cat-alert--success" role="status">Salvato con successo.</div>\n<div class="cat-alert cat-alert--warning" role="status">Attenzione: la sessione sta per scadere.</div>\n<div class="cat-alert cat-alert--error" role="alert">Errore: controlla i campi evidenziati.</div>\n`,
    css: `.cat-alert {\n  margin-bottom: var(--cat-space-2, 0.5rem);\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  border-left: 4px solid;\n  border-radius: var(--cat-radius-sm, 0.25rem);\n  background: var(--cat-color-surface, #fff);\n  box-shadow: inset 0 0 0 1px var(--cat-color-border, #8f8f8f);\n}\n\n.cat-alert--info { border-color: var(--cat-color-secondary, #404040); }\n.cat-alert--success { border-color: var(--cat-color-success, #1e7a34); }\n.cat-alert--warning { border-color: var(--cat-color-warning, #8a5a00); }\n.cat-alert--error { border-color: var(--cat-color-error, #b00020); }\n`,
    js: ''
  },
  {
    nome: 'Form di contatto',
    descrizione: 'Nome, email, messaggio e invio, con etichette e stati di errore',
    tag: ['form', 'contatti'],
    html: `<form class="cat-form" novalidate>\n  <label class="cat-field">\n    <span>Nome</span>\n    <input type="text" name="nome" autocomplete="name" required>\n  </label>\n  <label class="cat-field">\n    <span>Email</span>\n    <input type="email" name="email" autocomplete="email" required aria-describedby="cat-email-err">\n    <small id="cat-email-err" class="cat-field__error" hidden>Inserisci un’email valida</small>\n  </label>\n  <label class="cat-field">\n    <span>Messaggio</span>\n    <textarea name="messaggio" rows="4" required></textarea>\n  </label>\n  <button type="submit" class="cat-form__submit">Invia</button>\n</form>\n`,
    css: `.cat-form {\n  display: grid;\n  gap: var(--cat-space-3, 1rem);\n  max-width: 28rem;\n}\n\n.cat-field { display: grid; gap: 0.25rem; }\n.cat-field span { font-weight: 600; font-size: 0.9375rem; }\n\n.cat-field input,\n.cat-field textarea {\n  padding: 0.55rem 0.7rem;\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-surface, #fff);\n  color: inherit;\n  font: inherit;\n}\n\n.cat-field input:focus-visible,\n.cat-field textarea:focus-visible {\n  outline: 3px solid var(--cat-color-accent, #005fcc);\n  outline-offset: 1px;\n}\n\n.cat-field input[aria-invalid="true"] { border-color: var(--cat-color-error, #b00020); }\n.cat-field__error { color: var(--cat-color-error, #b00020); }\n\n.cat-form__submit {\n  justify-self: start;\n  padding: 0.6rem 1.4rem;\n  border: 0;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #111111);\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n`,
    js: `document.querySelectorAll('.cat-form').forEach(function (form) {\n  form.addEventListener('submit', function (e) {\n    e.preventDefault();\n    var email = form.querySelector('input[type="email"]');\n    var err = document.getElementById(email.getAttribute('aria-describedby'));\n    var ok = email.validity.valid && email.value.trim() !== '';\n    email.setAttribute('aria-invalid', String(!ok));\n    err.hidden = ok;\n    if (!ok) email.focus();\n  });\n});\n`
  },
  {
    nome: 'Newsletter in una riga',
    descrizione: 'Campo email e pulsante affiancati, impilati su schermo stretto',
    tag: ['form', 'newsletter'],
    html: `<form class="cat-newsletter">\n  <label for="cat-nl" class="cat-newsletter__label">Iscriviti alla newsletter</label>\n  <div class="cat-newsletter__row">\n    <input id="cat-nl" type="email" placeholder="tu@esempio.it" autocomplete="email">\n    <button type="submit">Iscriviti</button>\n  </div>\n</form>\n`,
    css: `.cat-newsletter__label { display: block; margin-bottom: 0.4rem; font-weight: 600; }\n.cat-newsletter__row { display: flex; flex-wrap: wrap; gap: var(--cat-space-2, 0.5rem); }\n.cat-newsletter input { flex: 1 1 14rem; padding: 0.55rem 0.7rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); font: inherit; }\n.cat-newsletter button { flex: 0 0 auto; padding: 0.55rem 1.2rem; border: 0; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-primary, #111111); color: #fff; font: inherit; cursor: pointer; }\n`,
    js: ''
  },
  {
    nome: 'Interruttore (switch)',
    descrizione: 'Toggle on/off accessibile con checkbox nativa',
    tag: ['form', 'toggle'],
    html: `<label class="cat-switch">\n  <input type="checkbox" role="switch">\n  <span class="cat-switch__track" aria-hidden="true"></span>\n  <span>Notifiche</span>\n</label>\n`,
    css: `.cat-switch {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--cat-space-2, 0.5rem);\n  cursor: pointer;\n}\n\n.cat-switch input {\n  position: absolute;\n  opacity: 0;\n}\n\n.cat-switch__track {\n  position: relative;\n  width: 2.75rem;\n  height: 1.5rem;\n  border-radius: 999px;\n  background: var(--cat-color-border, #8f8f8f);\n  transition: background 150ms ease;\n}\n\n.cat-switch__track::after {\n  content: "";\n  position: absolute;\n  top: 0.15rem;\n  left: 0.15rem;\n  width: 1.2rem;\n  height: 1.2rem;\n  border-radius: 50%;\n  background: #fff;\n  transition: transform 150ms ease;\n}\n\n.cat-switch input:checked + .cat-switch__track { background: var(--cat-color-primary, #111111); }\n.cat-switch input:checked + .cat-switch__track::after { transform: translateX(1.25rem); }\n.cat-switch input:focus-visible + .cat-switch__track { outline: 3px solid var(--cat-color-accent, #005fcc); outline-offset: 2px; }\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-switch__track, .cat-switch__track::after { transition: none; }\n}\n`,
    js: ''
  },
  {
    nome: 'Tabella responsive',
    descrizione: 'Tabella con righe a zebra che scorre in orizzontale su schermo stretto',
    tag: ['tabella', 'dati'],
    html: `<div class="cat-table-wrap" tabindex="0" role="region" aria-label="Tabella scorrevole">\n  <table class="cat-table">\n    <thead><tr><th>Nome</th><th>Ruolo</th><th>Città</th><th>Email</th></tr></thead>\n    <tbody>\n      <tr><td>Anna</td><td>Designer</td><td>Torino</td><td>anna@esempio.it</td></tr>\n      <tr><td>Luca</td><td>Sviluppatore</td><td>Milano</td><td>luca@esempio.it</td></tr>\n      <tr><td>Sara</td><td>Redattrice</td><td>Roma</td><td>sara@esempio.it</td></tr>\n    </tbody>\n  </table>\n</div>\n`,
    css: `.cat-table-wrap { overflow-x: auto; }\n.cat-table { width: 100%; min-width: 32rem; border-collapse: collapse; }\n.cat-table th, .cat-table td { padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--cat-color-border, #8f8f8f); text-align: left; }\n.cat-table th { background: var(--cat-color-surface, #fff); font-weight: 700; }\n.cat-table tbody tr:nth-child(even) { background: rgb(0 0 0 / 0.03); }\n`,
    js: ''
  },
  {
    nome: 'Barra di avanzamento',
    descrizione: 'Progress bar semantica con valore',
    tag: ['progress', 'stato'],
    html: `<label class="cat-progress-label" for="cat-prog">Caricamento 60%</label>\n<progress id="cat-prog" class="cat-progress" value="60" max="100">60%</progress>\n`,
    css: `.cat-progress-label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; }\n.cat-progress { width: 100%; height: 0.75rem; appearance: none; border: 0; border-radius: 999px; overflow: hidden; background: var(--cat-color-placeholder, #e2e2e2); }\n.cat-progress::-webkit-progress-bar { background: var(--cat-color-placeholder, #e2e2e2); }\n.cat-progress::-webkit-progress-value { background: var(--cat-color-primary, #111111); border-radius: 999px; }\n.cat-progress::-moz-progress-bar { background: var(--cat-color-primary, #111111); border-radius: 999px; }\n`,
    js: ''
  },
  {
    nome: 'Spinner di caricamento',
    descrizione: 'Cerchio che gira, con testo per gli screen reader',
    tag: ['loader', 'stato'],
    html: `<div class="cat-spinner" role="status"><span class="cat-sr-only">Caricamento…</span></div>\n`,
    css: `.cat-spinner {\n  width: 2.5rem;\n  height: 2.5rem;\n  border: 4px solid var(--cat-color-border, #8f8f8f);\n  border-top-color: var(--cat-color-primary, #111111);\n  border-radius: 50%;\n  animation: cat-spin 800ms linear infinite;\n}\n\n@keyframes cat-spin { to { transform: rotate(360deg); } }\n\n.cat-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-spinner { animation-duration: 3s; }\n}\n`,
    js: ''
  },
  {
    nome: 'Skeleton di caricamento',
    descrizione: 'Segnaposto grigi con luce che scorre mentre i contenuti arrivano',
    tag: ['loader', 'stato'],
    html: `<div class="cat-skeleton-card" aria-busy="true" aria-label="Caricamento">\n  <div class="cat-skeleton cat-skeleton--img"></div>\n  <div class="cat-skeleton cat-skeleton--line"></div>\n  <div class="cat-skeleton cat-skeleton--line cat-skeleton--short"></div>\n</div>\n`,
    css: `.cat-skeleton-card { display: grid; gap: 0.6rem; max-width: 18rem; }\n.cat-skeleton { position: relative; overflow: hidden; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-placeholder, #e2e2e2); }\n.cat-skeleton--img { aspect-ratio: 16 / 9; }\n.cat-skeleton--line { height: 0.9rem; }\n.cat-skeleton--short { width: 60%; }\n\n.cat-skeleton::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.5), transparent);\n  transform: translateX(-100%);\n  animation: cat-shimmer 1.4s ease infinite;\n}\n\n@keyframes cat-shimmer { to { transform: translateX(100%); } }\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-skeleton::after { animation: none; }\n}\n`,
    js: ''
  },
  {
    nome: 'Carosello con scroll-snap',
    descrizione: 'Slide che si fanno scorrere e si agganciano, senza JavaScript',
    tag: ['carosello', 'galleria'],
    html: `<div class="cat-carousel" tabindex="0" role="region" aria-label="Carosello">\n  <div class="cat-carousel__slide">Slide 1</div>\n  <div class="cat-carousel__slide">Slide 2</div>\n  <div class="cat-carousel__slide">Slide 3</div>\n  <div class="cat-carousel__slide">Slide 4</div>\n</div>\n`,
    css: `.cat-carousel {\n  display: flex;\n  gap: var(--cat-space-2, 0.5rem);\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  scrollbar-width: thin;\n}\n\n.cat-carousel__slide {\n  flex: 0 0 min(80%, 22rem);\n  display: grid;\n  place-items: center;\n  height: 11rem;\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  background: var(--cat-color-placeholder, #e2e2e2);\n  scroll-snap-align: start;\n}\n`,
    js: ''
  },
  {
    nome: 'Divisore con testo',
    descrizione: 'Linea orizzontale con scritta al centro (per esempio «oppure»)',
    tag: ['separatore'],
    html: `<div class="cat-divider" role="separator"><span>oppure</span></div>\n`,
    css: `.cat-divider {\n  display: flex;\n  align-items: center;\n  gap: var(--cat-space-2, 0.5rem);\n  color: var(--cat-color-text-muted, #4a4a4a);\n  font-size: 0.875rem;\n}\n\n.cat-divider::before,\n.cat-divider::after {\n  content: "";\n  flex: 1;\n  height: 1px;\n  background: var(--cat-color-placeholder, #e2e2e2);\n}\n`,
    js: ''
  },
  {
    nome: 'Statistiche (KPI)',
    descrizione: 'Numeri grandi con etichetta, in riga che va a capo',
    tag: ['numeri', 'dati'],
    html: `<dl class="cat-stats">\n  <div><dt>Clienti</dt><dd>1.240</dd></div>\n  <div><dt>Progetti</dt><dd>380</dd></div>\n  <div><dt>Anni</dt><dd>12</dd></div>\n</dl>\n`,
    css: `.cat-stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-space-4, 2rem);\n  margin: 0;\n}\n\n.cat-stats div { flex: 1 1 8rem; text-align: center; }\n.cat-stats dd { margin: 0; font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: var(--cat-color-primary, #111111); }\n.cat-stats dt { color: var(--cat-color-text-muted, #4a4a4a); }\n`,
    js: ''
  },
  {
    nome: 'Logo (segnaposto con testo)',
    descrizione: 'Slot per il logo: SVG segnaposto + nome del sito, in tre dimensioni',
    tag: ['logo', 'brand'],
    html: `<a href="/" class="cat-brand" aria-label="Nome del sito, home">\n  <!-- Sostituisci l'SVG con <img src="logo.svg" alt="" width="40" height="40"> -->\n  <svg class="cat-brand__mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="currentColor"/></svg>\n  <span class="cat-brand__name">Nome del sito</span>\n</a>\n`,
    css: `.cat-brand {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.6rem;\n  color: var(--cat-color-primary, #111111);\n  text-decoration: none;\n}\n\n.cat-brand__mark { width: 2.5rem; height: 2.5rem; }\n.cat-brand__name { color: var(--cat-color-text, #111111); font-size: 1.25rem; font-weight: 800; }\n`,
    js: ''
  },
  {
    nome: 'Icone social',
    descrizione: 'Riga di icone SVG in cerchi, con etichette accessibili',
    tag: ['social', 'icone', 'svg'],
    html: `<ul class="cat-social">\n  <li><a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg></a></li>\n  <li><a href="#" aria-label="Sito web"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></a></li>\n  <li><a href="#" aria-label="Email"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a></li>\n</ul>\n`,
    css: `.cat-social {\n  display: flex;\n  gap: var(--cat-space-2, 0.5rem);\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.cat-social a {\n  display: grid;\n  place-items: center;\n  width: 2.5rem;\n  height: 2.5rem;\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: 50%;\n  color: inherit;\n  transition: background 150ms ease, color 150ms ease;\n}\n\n.cat-social a:hover { background: var(--cat-color-primary, #111111); color: #fff; }\n.cat-social a:focus-visible { outline: 3px solid var(--cat-color-accent, #005fcc); outline-offset: 2px; }\n`,
    js: ''
  },
  {
    nome: 'Hamburger animato',
    descrizione: 'Icona menu che diventa una X (solo transform e opacity)',
    tag: ['menu', 'icona', 'animazione'],
    html: `<button type="button" class="cat-burger" aria-expanded="false" aria-label="Menu">\n  <span></span><span></span><span></span>\n</button>\n`,
    css: `.cat-burger {\n  display: inline-flex;\n  flex-direction: column;\n  justify-content: center;\n  gap: 5px;\n  width: 2.75rem;\n  height: 2.75rem;\n  padding: 0.6rem;\n  border: 0;\n  background: none;\n  cursor: pointer;\n}\n\n.cat-burger span {\n  display: block;\n  height: 2px;\n  background: currentColor;\n  transition: transform 200ms ease, opacity 200ms ease;\n}\n\n.cat-burger[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }\n.cat-burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }\n.cat-burger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }\n\n@media (prefers-reduced-motion: reduce) {\n  .cat-burger span { transition: none; }\n}\n`,
    js: `document.querySelectorAll('.cat-burger').forEach(function (b) {\n  b.addEventListener('click', function () {\n    b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));\n  });\n});\n`
  }
];
