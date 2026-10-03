'use strict';

/* Strutture v2: pattern ricorrenti nei siti più curati (bento, zig-zag, FAQ, timeline, dashboard, login, 404…). */

const LOGO = '<svg class="cat-logo" viewBox="0 0 120 40" role="img" aria-label="Logo"><rect width="120" height="40" rx="8" fill="currentColor" opacity="0.15"/><text x="60" y="26" text-anchor="middle" font-size="14" font-family="sans-serif" fill="currentColor">LOGO</text></svg>';
const LOGO_CSS = '.cat-logo { display: block; height: 2.5rem; width: auto; color: var(--cat-color-primary, #111111); }\n';

module.exports = [
  {
    nome: 'Bento grid',
    descrizione: 'Riquadri di dimensioni diverse in una griglia, stile Apple/Linear',
    tag: ['griglia', 'bento', 'moderno'],
    html: `<section class="cat-bento">\n  <article class="cat-bento__a"><h3>Funzione principale</h3><p>Il riquadro grande racconta la cosa più importante.</p></article>\n  <article class="cat-bento__b"><h3>Veloce</h3><p>Testo breve.</p></article>\n  <article class="cat-bento__c"><h3>Sicuro</h3><p>Testo breve.</p></article>\n  <article class="cat-bento__d"><h3>Integrazioni</h3><p>Il riquadro largo ospita un elenco di loghi o uno schema.</p></article>\n</section>\n`,
    css: `.cat-bento {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  grid-auto-rows: minmax(9rem, auto);\n  gap: var(--cat-gap, 1rem);\n}\n\n.cat-bento > * {\n  padding: var(--cat-space-4, 1.5rem);\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  background: var(--cat-color-surface, #fff);\n}\n\n.cat-bento h3 { margin: 0 0 0.5rem; }\n.cat-bento p { margin: 0; color: var(--cat-color-text-muted, #4a4a4a); }\n\n.cat-bento__a { grid-column: span 2; grid-row: span 2; background: var(--cat-color-primary, #111111) !important; color: #fff; }\n.cat-bento__a p { color: inherit; }\n.cat-bento__d { grid-column: span 3; }\n\n@media (max-width: 720px) {\n  .cat-bento { grid-template-columns: repeat(2, 1fr); }\n  .cat-bento__d { grid-column: span 2; }\n}\n\n@media (max-width: 480px) {\n  .cat-bento { grid-template-columns: 1fr; }\n  .cat-bento__a, .cat-bento__d { grid-column: auto; grid-row: auto; }\n}\n`
  },
  {
    nome: 'Hero con gradiente e badge',
    descrizione: 'Etichetta «Novità», titolo con parola colorata, sfondo sfumato morbido',
    tag: ['hero', 'gradiente', 'moderno'],
    html: `<section class="cat-hero-g">\n  <span class="cat-hero-g__badge">Novità · versione 2</span>\n  <h1>Costruisci più in fretta con <em>meno fatica</em></h1>\n  <p>Una frase chiara sul valore del prodotto, senza gergo.</p>\n  <div class="cat-hero-g__actions">\n    <a class="cat-hero-g__btn" href="#">Prova gratis</a>\n    <a class="cat-hero-g__link" href="#">Guarda la demo →</a>\n  </div>\n</section>\n`,
    css: `.cat-hero-g {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: var(--cat-space-3, 1rem);\n  padding: clamp(3rem, 10vw, 7rem) var(--cat-space-3, 1rem);\n  background: radial-gradient(60rem 24rem at 50% 0%, rgb(17 17 17 / 0.18), transparent 70%);\n  text-align: center;\n}\n\n.cat-hero-g__badge {\n  padding: 0.25rem 0.85rem;\n  border: 1px solid var(--cat-color-border, #8f8f8f);\n  border-radius: 999px;\n  background: var(--cat-color-surface, #fff);\n  font-size: 0.875rem;\n}\n\n.cat-hero-g h1 { margin: 0; max-width: 18ch; font-size: clamp(2.25rem, 6vw + 0.5rem, 4.5rem); line-height: 1.05; letter-spacing: -0.02em; }\n.cat-hero-g em { color: var(--cat-color-primary, #111111); font-style: normal; }\n.cat-hero-g p { max-width: 36rem; margin: 0; color: var(--cat-color-text-muted, #4a4a4a); font-size: 1.125rem; }\n.cat-hero-g__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: var(--cat-space-3, 1rem); }\n.cat-hero-g__btn { padding: 0.75rem 1.5rem; border-radius: 999px; background: var(--cat-color-primary, #111111); color: #fff; text-decoration: none; }\n.cat-hero-g__link { color: inherit; }\n`
  },
  {
    nome: 'Sezioni alternate (zig-zag)',
    descrizione: 'Immagine e testo che si alternano a sinistra e destra',
    tag: ['sezione', 'immagine', 'alternato'],
    html: `<section class="cat-zig">\n  <div class="cat-zig__row">\n    <div class="cat-zig__media" role="img" aria-label="Immagine uno"></div>\n    <div class="cat-zig__text"><h2>Primo punto</h2><p>Spiega il punto in poche righe.</p></div>\n  </div>\n  <div class="cat-zig__row cat-zig__row--rev">\n    <div class="cat-zig__media" role="img" aria-label="Immagine due"></div>\n    <div class="cat-zig__text"><h2>Secondo punto</h2><p>Spiega il punto in poche righe.</p></div>\n  </div>\n</section>\n`,
    css: `.cat-zig { display: grid; gap: var(--cat-space-5, 3rem); }\n.cat-zig__row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--cat-space-4, 2rem); }\n.cat-zig__row--rev { flex-direction: row-reverse; }\n.cat-zig__media, .cat-zig__text { flex: 1 1 18rem; }\n.cat-zig__media { aspect-ratio: 4 / 3; border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-placeholder, #e2e2e2); }\n.cat-zig__text h2 { margin-top: 0; }\n`
  },
  {
    nome: 'Testimonianze',
    descrizione: 'Tre citazioni con avatar, nome e ruolo',
    tag: ['testimonial', 'card', 'prova-sociale'],
    html: `<section class="cat-quotes">\n  <figure class="cat-quote">\n    <blockquote>“Ha cambiato il modo in cui lavoriamo, in meglio.”</blockquote>\n    <figcaption><span class="cat-quote__avatar" aria-hidden="true">AB</span><span><strong>Anna Bianchi</strong><br>Direttrice, Studio Alfa</span></figcaption>\n  </figure>\n  <figure class="cat-quote">\n    <blockquote>“Semplice, chiaro, fa quello che promette.”</blockquote>\n    <figcaption><span class="cat-quote__avatar" aria-hidden="true">LR</span><span><strong>Luca Rossi</strong><br>Fondatore, Beta</span></figcaption>\n  </figure>\n  <figure class="cat-quote">\n    <blockquote>“Lo consiglio a chiunque abbia fretta e poco tempo.”</blockquote>\n    <figcaption><span class="cat-quote__avatar" aria-hidden="true">SV</span><span><strong>Sara Verdi</strong><br>Freelance</span></figcaption>\n  </figure>\n</section>\n`,
    css: `.cat-quotes { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--cat-gap, 1rem); }\n.cat-quote { margin: 0; padding: var(--cat-space-4, 1.5rem); border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-surface, #fff); }\n.cat-quote blockquote { margin: 0 0 var(--cat-space-3, 1rem); font-size: 1.125rem; }\n.cat-quote figcaption { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9375rem; }\n.cat-quote__avatar { display: grid; place-items: center; flex: 0 0 auto; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--cat-color-secondary, #404040); color: #fff; font-weight: 700; font-size: 0.8125rem; }\n`
  },
  {
    nome: 'FAQ con details',
    descrizione: 'Domande frequenti che si aprono, senza JavaScript, con freccia che ruota',
    tag: ['faq', 'accordion', 'senza-js'],
    html: `<section class="cat-faq">\n  <details>\n    <summary>Come funziona?</summary>\n    <p>Risposta chiara e breve alla domanda.</p>\n  </details>\n  <details>\n    <summary>Quanto costa?</summary>\n    <p>Risposta chiara e breve alla domanda.</p>\n  </details>\n  <details>\n    <summary>Posso annullare quando voglio?</summary>\n    <p>Risposta chiara e breve alla domanda.</p>\n  </details>\n</section>\n`,
    css: `.cat-faq { max-width: 42rem; }\n.cat-faq details { border-bottom: 1px solid var(--cat-color-border, #8f8f8f); }\n.cat-faq summary { display: flex; justify-content: space-between; align-items: center; padding: var(--cat-space-3, 1rem) 0; font-weight: 600; cursor: pointer; list-style: none; }\n.cat-faq summary::-webkit-details-marker { display: none; }\n.cat-faq summary::after { content: "+"; font-size: 1.5rem; line-height: 1; transition: transform 200ms ease; }\n.cat-faq details[open] summary::after { transform: rotate(45deg); }\n.cat-faq p { margin: 0 0 var(--cat-space-3, 1rem); color: var(--cat-color-text-muted, #4a4a4a); }\n@media (prefers-reduced-motion: reduce) { .cat-faq summary::after { transition: none; } }\n`
  },
  {
    nome: 'Timeline verticale',
    descrizione: 'Tappe con linea e punto, per storia o processo',
    tag: ['timeline', 'processo'],
    html: `<ol class="cat-timeline">\n  <li><time>2022</time><h3>Nasce l'idea</h3><p>Breve descrizione della tappa.</p></li>\n  <li><time>2024</time><h3>Primo cliente</h3><p>Breve descrizione della tappa.</p></li>\n  <li><time>2026</time><h3>Nuova versione</h3><p>Breve descrizione della tappa.</p></li>\n</ol>\n`,
    css: `.cat-timeline { margin: 0; padding: 0 0 0 1.5rem; border-left: 2px solid var(--cat-color-border, #8f8f8f); list-style: none; }\n.cat-timeline li { position: relative; padding-bottom: var(--cat-space-4, 1.5rem); }\n.cat-timeline li::before { content: ""; position: absolute; left: calc(-1.5rem - 7px); top: 0.3rem; width: 12px; height: 12px; border-radius: 50%; background: var(--cat-color-primary, #111111); }\n.cat-timeline time { color: var(--cat-color-text-muted, #4a4a4a); font-size: 0.875rem; }\n.cat-timeline h3 { margin: 0.1rem 0; }\n.cat-timeline p { margin: 0; }\n`
  },
  {
    nome: 'Griglia del team',
    descrizione: 'Persone con foto tonda, nome e ruolo',
    tag: ['team', 'avatar', 'griglia'],
    html: `<section class="cat-team">\n  <article><div class="cat-team__photo" role="img" aria-label="Foto"></div><h3>Anna Bianchi</h3><p>Direttrice</p></article>\n  <article><div class="cat-team__photo" role="img" aria-label="Foto"></div><h3>Luca Rossi</h3><p>Sviluppo</p></article>\n  <article><div class="cat-team__photo" role="img" aria-label="Foto"></div><h3>Sara Verdi</h3><p>Design</p></article>\n  <article><div class="cat-team__photo" role="img" aria-label="Foto"></div><h3>Marco Neri</h3><p>Contenuti</p></article>\n</section>\n`,
    css: `.cat-team { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--cat-space-4, 1.5rem); text-align: center; }\n.cat-team__photo { width: 7rem; aspect-ratio: 1; margin: 0 auto var(--cat-space-2, 0.5rem); border-radius: 50%; background: var(--cat-color-placeholder, #e2e2e2); }\n.cat-team h3 { margin: 0; }\n.cat-team p { margin: 0; color: var(--cat-color-text-muted, #4a4a4a); }\n`
  },
  {
    nome: 'Contatti: info e form',
    descrizione: 'A sinistra indirizzo e orari, a destra il form; si impilano su schermo stretto',
    tag: ['contatti', 'form', 'colonne'],
    html: `<section class="cat-contact">\n  <div class="cat-contact__info">\n    <h2>Contattaci</h2>\n    <p>Via Esempio 1, 10100 Torino</p>\n    <p><a href="mailto:ciao@esempio.it">ciao@esempio.it</a></p>\n    <p>Lun-Ven · 9:00-18:00</p>\n  </div>\n  <form class="cat-contact__form">\n    <label>Nome<input type="text" autocomplete="name"></label>\n    <label>Email<input type="email" autocomplete="email"></label>\n    <label>Messaggio<textarea rows="4"></textarea></label>\n    <button type="submit">Invia</button>\n  </form>\n</section>\n`,
    css: `.cat-contact { display: flex; flex-wrap: wrap; gap: var(--cat-space-5, 3rem); }\n.cat-contact__info { flex: 1 1 16rem; }\n.cat-contact__form { flex: 2 1 20rem; display: grid; gap: var(--cat-space-3, 1rem); }\n.cat-contact label { display: grid; gap: 0.25rem; font-weight: 600; }\n.cat-contact input, .cat-contact textarea { padding: 0.55rem 0.7rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); font: inherit; }\n.cat-contact button { justify-self: start; padding: 0.6rem 1.4rem; border: 0; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-primary, #111111); color: #fff; font: inherit; cursor: pointer; }\n`
  },
  {
    nome: 'Hero con immagine di sfondo',
    descrizione: 'Immagine a tutta larghezza con velo scuro e testo bianco leggibile',
    tag: ['hero', 'sfondo', 'overlay'],
    html: `<section class="cat-cover">\n  <div class="cat-cover__content">\n    <h1>Titolo sopra l'immagine</h1>\n    <p>Il velo scuro garantisce il contrasto del testo.</p>\n    <a class="cat-cover__btn" href="#">Scopri</a>\n  </div>\n</section>\n`,
    css: `.cat-cover {\n  display: grid;\n  place-items: center;\n  min-height: min(70vh, 32rem);\n  padding: var(--cat-space-4, 2rem) var(--cat-space-3, 1rem);\n  background:\n    linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)),\n    var(--cat-cover-image, linear-gradient(135deg, #404040, #111111)) center / cover;\n  color: #fff;\n  text-align: center;\n}\n\n.cat-cover h1 { margin: 0 0 0.5rem; font-size: clamp(2rem, 5vw + 1rem, 3.5rem); }\n.cat-cover p { margin: 0 0 var(--cat-space-3, 1rem); }\n.cat-cover__btn { display: inline-block; padding: 0.7rem 1.5rem; border-radius: 999px; background: #fff; color: #111111; text-decoration: none; }\n`
  },
  {
    nome: 'Layout dashboard',
    descrizione: 'Sidebar con logo, barra in alto e area di riquadri con numeri',
    tag: ['dashboard', 'sidebar', 'app'],
    html: `<div class="cat-dash">\n  <aside class="cat-dash__side">\n    ${LOGO}\n    <nav aria-label="App"><a href="#" aria-current="page">Panoramica</a><a href="#">Clienti</a><a href="#">Ordini</a><a href="#">Impostazioni</a></nav>\n  </aside>\n  <div class="cat-dash__main">\n    <header class="cat-dash__top"><strong>Panoramica</strong><span>Mario Rossi</span></header>\n    <div class="cat-dash__cards">\n      <div><small>Ricavi</small><b>12.480 €</b></div>\n      <div><small>Ordini</small><b>342</b></div>\n      <div><small>Clienti</small><b>1.208</b></div>\n    </div>\n  </div>\n</div>\n`,
    css: `${LOGO_CSS}\n.cat-dash { display: flex; min-height: 22rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-lg, 0.75rem); overflow: hidden; }\n.cat-dash__side { flex: 0 0 13rem; display: grid; align-content: start; gap: var(--cat-space-3, 1rem); padding: var(--cat-space-3, 1rem); border-right: 1px solid var(--cat-color-border, #8f8f8f); background: var(--cat-color-surface, #fff); }\n.cat-dash__side nav { display: grid; gap: 0.25rem; }\n.cat-dash__side a { padding: 0.45rem 0.7rem; border-radius: var(--cat-radius-md, 0.5rem); color: inherit; text-decoration: none; }\n.cat-dash__side a[aria-current="page"] { background: var(--cat-color-primary, #111111); color: #fff; }\n.cat-dash__main { flex: 1 1 auto; min-width: 0; }\n.cat-dash__top { display: flex; justify-content: space-between; padding: var(--cat-space-3, 1rem); border-bottom: 1px solid var(--cat-color-border, #8f8f8f); }\n.cat-dash__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--cat-gap, 1rem); padding: var(--cat-space-3, 1rem); }\n.cat-dash__cards div { padding: var(--cat-space-3, 1rem); border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); }\n.cat-dash__cards small { display: block; color: var(--cat-color-text-muted, #4a4a4a); }\n.cat-dash__cards b { font-size: 1.5rem; }\n@media (max-width: 560px) { .cat-dash { flex-direction: column; } .cat-dash__side { flex-basis: auto; border-right: 0; border-bottom: 1px solid var(--cat-color-border, #8f8f8f); } }\n`
  },
  {
    nome: 'Pagina di accesso con logo',
    descrizione: 'Scheda centrata con logo, campi e link «password dimenticata»',
    tag: ['login', 'form', 'logo', 'centro'],
    html: `<main class="cat-login">\n  <form class="cat-login__card">\n    ${LOGO}\n    <h1>Accedi</h1>\n    <label>Email<input type="email" autocomplete="username"></label>\n    <label>Password<input type="password" autocomplete="current-password"></label>\n    <button type="submit">Entra</button>\n    <a href="#">Password dimenticata?</a>\n  </form>\n</main>\n`,
    css: `${LOGO_CSS}\n.cat-login { display: grid; place-items: center; min-height: 26rem; padding: var(--cat-space-3, 1rem); background: var(--cat-color-bg, #f5f5f5); }\n.cat-login__card { display: grid; gap: var(--cat-space-3, 1rem); width: min(100%, 24rem); padding: var(--cat-space-5, 2rem); border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-surface, #fff); box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12)); }\n.cat-login__card .cat-logo { margin-inline: auto; }\n.cat-login h1 { margin: 0; text-align: center; font-size: 1.5rem; }\n.cat-login label { display: grid; gap: 0.25rem; font-weight: 600; }\n.cat-login input { padding: 0.55rem 0.7rem; border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-md, 0.5rem); font: inherit; }\n.cat-login button { padding: 0.65rem; border: 0; border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-primary, #111111); color: #fff; font: inherit; cursor: pointer; }\n.cat-login a { text-align: center; color: var(--cat-color-primary, #111111); }\n`
  },
  {
    nome: 'Pagina 404',
    descrizione: 'Numero grande, messaggio gentile e pulsante per tornare alla home',
    tag: ['errore', '404', 'centro'],
    html: `<main class="cat-404">\n  <p class="cat-404__code" aria-hidden="true">404</p>\n  <h1>Pagina non trovata</h1>\n  <p>L'indirizzo non esiste più o è stato spostato.</p>\n  <a href="/">Torna alla home</a>\n</main>\n`,
    css: `.cat-404 { display: grid; justify-items: center; gap: var(--cat-space-2, 0.5rem); padding: var(--cat-space-6, 4rem) var(--cat-space-3, 1rem); text-align: center; }\n.cat-404__code { margin: 0; font-size: clamp(5rem, 20vw, 10rem); font-weight: 800; line-height: 1; color: var(--cat-color-primary, #111111); }\n.cat-404 h1 { margin: 0; }\n.cat-404 p { margin: 0; color: var(--cat-color-text-muted, #4a4a4a); }\n.cat-404 a { margin-top: var(--cat-space-2, 0.5rem); padding: 0.65rem 1.4rem; border-radius: 999px; background: var(--cat-color-primary, #111111); color: #fff; text-decoration: none; }\n`
  },
  {
    nome: 'Footer minimale',
    descrizione: 'Una riga: logo, link legali e copyright, che va a capo',
    tag: ['footer', 'logo', 'minimale'],
    html: `<footer class="cat-footer-min">\n  ${LOGO}\n  <nav aria-label="Legale"><a href="#">Privacy</a><a href="#">Cookie</a><a href="#">Contatti</a></nav>\n  <small>© 2026 Nome del sito</small>\n</footer>\n`,
    css: `${LOGO_CSS}\n.cat-footer-min { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--cat-space-3, 1rem); padding: var(--cat-space-3, 1rem); border-top: 1px solid var(--cat-color-border, #8f8f8f); }\n.cat-footer-min nav { display: flex; flex-wrap: wrap; gap: var(--cat-space-3, 1rem); }\n.cat-footer-min a { color: inherit; text-decoration: none; }\n.cat-footer-min small { color: var(--cat-color-text-muted, #4a4a4a); }\n`
  },
  {
    nome: 'Testo fisso + contenuto che scorre',
    descrizione: 'Colonna sinistra «sticky» con titolo, a destra le voci che scorrono',
    tag: ['sticky', 'colonne', 'moderno'],
    html: `<section class="cat-sticky-split">\n  <div class="cat-sticky-split__fixed"><h2>Come lavoriamo</h2><p>Il titolo resta visibile mentre scorri le tappe.</p></div>\n  <div class="cat-sticky-split__list">\n    <article><h3>1. Ascolto</h3><p>Testo della tappa.</p></article>\n    <article><h3>2. Progetto</h3><p>Testo della tappa.</p></article>\n    <article><h3>3. Realizzazione</h3><p>Testo della tappa.</p></article>\n  </div>\n</section>\n`,
    css: `.cat-sticky-split { display: flex; flex-wrap: wrap; gap: var(--cat-space-5, 3rem); align-items: flex-start; }\n.cat-sticky-split__fixed { position: sticky; top: var(--cat-space-4, 2rem); flex: 1 1 16rem; }\n.cat-sticky-split__list { flex: 2 1 22rem; display: grid; gap: var(--cat-space-4, 1.5rem); }\n.cat-sticky-split__list article { min-height: 10rem; padding: var(--cat-space-4, 1.5rem); border: 1px solid var(--cat-color-border, #8f8f8f); border-radius: var(--cat-radius-lg, 0.75rem); }\n.cat-sticky-split h2, .cat-sticky-split h3 { margin-top: 0; }\n@media (max-width: 640px) { .cat-sticky-split__fixed { position: static; } }\n`
  }
];
