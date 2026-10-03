'use strict';

/* Strutture di pagina: dove mettere logo, titoli, colonne. Tutte responsive senza media query dove possibile. */

const LOGO = '<svg class="cat-logo" viewBox="0 0 120 40" role="img" aria-label="Logo"><rect width="120" height="40" rx="8" fill="currentColor" opacity="0.15"/><text x="60" y="26" text-anchor="middle" font-size="14" font-family="sans-serif" fill="currentColor">LOGO</text></svg>';
const LOGO_CSS = '.cat-logo {\n  display: block;\n  height: 2.5rem;\n  width: auto;\n  color: var(--cat-color-primary, #2f6f4e);\n}\n';

module.exports = [
  {
    nome: 'Hero con logo centrato',
    descrizione: 'Logo in alto, titolo, testo e due pulsanti, tutto centrato',
    tag: ['hero', 'logo', 'centro'],
    html: `<section class="cat-hero">\n  <!-- Sostituisci con <img src="logo.svg" alt="Nome del sito" class="cat-logo"> -->\n  ${LOGO}\n  <h1>Titolo della pagina</h1>\n  <p>Una frase che spiega cosa trovi qui, lunga al massimo due righe.</p>\n  <div class="cat-hero__actions">\n    <a class="cat-btn" href="#">Azione principale</a>\n    <a class="cat-btn cat-btn--outline" href="#">Scopri di più</a>\n  </div>\n</section>\n`,
    css: `${LOGO_CSS}\n.cat-hero {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: var(--cat-space-3, 1rem);\n  padding: clamp(2rem, 8vw, 6rem) var(--cat-space-3, 1rem);\n  text-align: center;\n}\n\n.cat-hero h1 {\n  margin: 0;\n  font-size: clamp(2rem, 5vw + 1rem, 3.5rem);\n  line-height: 1.1;\n}\n\n.cat-hero p {\n  max-width: 40rem;\n  margin: 0;\n  color: var(--cat-color-text-muted, #5c5c57);\n}\n\n.cat-hero__actions {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: var(--cat-space-2, 0.5rem);\n}\n\n.cat-btn {\n  display: inline-block;\n  padding: 0.6rem 1.2rem;\n  border: 2px solid var(--cat-color-primary, #2f6f4e);\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #2f6f4e);\n  color: #fff;\n  text-decoration: none;\n}\n\n.cat-btn--outline {\n  background: transparent;\n  color: var(--cat-color-primary, #2f6f4e);\n}\n`
  },
  {
    nome: 'Hero a due colonne',
    descrizione: 'Testo a sinistra, immagine a destra; su schermo stretto l\'immagine va sotto',
    tag: ['hero', 'colonne', 'immagine'],
    html: `<section class="cat-hero-2">\n  <div class="cat-hero-2__text">\n    <h1>Titolo che dice cosa fai</h1>\n    <p>Testo di supporto. Spiega il vantaggio principale in una o due frasi.</p>\n    <a class="cat-btn" href="#">Inizia ora</a>\n  </div>\n  <div class="cat-hero-2__media" role="img" aria-label="Immagine di esempio">Immagine</div>\n</section>\n`,
    css: `.cat-hero-2 {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: var(--cat-space-4, 2rem);\n  padding: clamp(1.5rem, 6vw, 4rem) var(--cat-space-3, 1rem);\n}\n\n.cat-hero-2__text {\n  flex: 1 1 20rem;\n}\n\n.cat-hero-2__text h1 {\n  margin-top: 0;\n  font-size: clamp(2rem, 4vw + 1rem, 3rem);\n}\n\n.cat-hero-2__media {\n  flex: 1 1 20rem;\n  display: grid;\n  place-items: center;\n  min-height: 14rem;\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  background: var(--cat-color-border, #d9d9d2);\n  color: var(--cat-color-text-muted, #5c5c57);\n}\n\n.cat-btn {\n  display: inline-block;\n  padding: 0.6rem 1.2rem;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #2f6f4e);\n  color: #fff;\n  text-decoration: none;\n}\n`
  },
  {
    nome: 'Header logo, menu e pulsante',
    descrizione: 'Logo a sinistra, menu al centro, pulsante a destra; su schermo stretto va a capo',
    tag: ['header', 'logo', 'menu'],
    html: `<header class="cat-site-header">\n  <a href="/" class="cat-site-header__brand" aria-label="Home">\n    ${LOGO}\n  </a>\n  <nav class="cat-site-header__nav" aria-label="Principale">\n    <a href="#">Home</a>\n    <a href="#">Servizi</a>\n    <a href="#">Chi siamo</a>\n    <a href="#">Contatti</a>\n  </nav>\n  <a class="cat-site-header__cta" href="#">Richiedi un preventivo</a>\n</header>\n`,
    css: `${LOGO_CSS}\n.cat-site-header {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  border-bottom: 1px solid var(--cat-color-border, #d9d9d2);\n}\n\n.cat-site-header__nav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-space-3, 1rem);\n}\n\n.cat-site-header__nav a {\n  color: inherit;\n  text-decoration: none;\n}\n\n.cat-site-header__nav a:hover {\n  text-decoration: underline;\n}\n\n.cat-site-header__cta {\n  padding: 0.5rem 1rem;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #2f6f4e);\n  color: #fff;\n  text-decoration: none;\n}\n`
  },
  {
    nome: 'Header con logo al centro',
    descrizione: 'Menu a sinistra, logo al centro, azioni a destra (griglia a 3 colonne)',
    tag: ['header', 'logo', 'centro'],
    html: `<header class="cat-header-c">\n  <nav class="cat-header-c__left" aria-label="Principale">\n    <a href="#">Negozio</a>\n    <a href="#">Storia</a>\n  </nav>\n  <a href="/" class="cat-header-c__logo" aria-label="Home">${LOGO}</a>\n  <div class="cat-header-c__right">\n    <a href="#">Accedi</a>\n    <a href="#">Carrello</a>\n  </div>\n</header>\n`,
    css: `${LOGO_CSS}\n.cat-header-c {\n  display: grid;\n  grid-template-columns: 1fr auto 1fr;\n  align-items: center;\n  gap: var(--cat-space-3, 1rem);\n  padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem);\n  border-bottom: 1px solid var(--cat-color-border, #d9d9d2);\n}\n\n.cat-header-c__left,\n.cat-header-c__right {\n  display: flex;\n  gap: var(--cat-space-3, 1rem);\n}\n\n.cat-header-c__right {\n  justify-content: flex-end;\n}\n\n.cat-header-c a {\n  color: inherit;\n  text-decoration: none;\n}\n\n@media (max-width: 480px) {\n  .cat-header-c {\n    grid-template-columns: 1fr;\n    justify-items: center;\n  }\n}\n`
  },
  {
    nome: 'Griglia di feature con icona',
    descrizione: 'Tre blocchi icona + titolo + testo che vanno a capo da soli',
    tag: ['griglia', 'feature', 'icone'],
    html: `<section class="cat-features">\n  <article class="cat-feature">\n    <span class="cat-feature__icon" aria-hidden="true">★</span>\n    <h3>Vantaggio uno</h3>\n    <p>Una frase breve che spiega il vantaggio.</p>\n  </article>\n  <article class="cat-feature">\n    <span class="cat-feature__icon" aria-hidden="true">✦</span>\n    <h3>Vantaggio due</h3>\n    <p>Una frase breve che spiega il vantaggio.</p>\n  </article>\n  <article class="cat-feature">\n    <span class="cat-feature__icon" aria-hidden="true">●</span>\n    <h3>Vantaggio tre</h3>\n    <p>Una frase breve che spiega il vantaggio.</p>\n  </article>\n</section>\n`,
    css: `.cat-features {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: var(--cat-space-4, 2rem);\n  padding: var(--cat-space-4, 2rem) var(--cat-space-3, 1rem);\n}\n\n.cat-feature__icon {\n  display: grid;\n  place-items: center;\n  width: 3rem;\n  height: 3rem;\n  border-radius: 50%;\n  background: var(--cat-color-primary, #2f6f4e);\n  color: #fff;\n  font-size: 1.25rem;\n}\n\n.cat-feature h3 {\n  margin: var(--cat-space-2, 0.5rem) 0;\n}\n\n.cat-feature p {\n  margin: 0;\n  color: var(--cat-color-text-muted, #5c5c57);\n}\n`
  },
  {
    nome: 'Griglia auto-fit di card',
    descrizione: 'CSS grid: tante colonne quante ne stanno, minimo 15rem',
    tag: ['griglia', 'card'],
    html: `<div class="cat-grid">\n  <article class="cat-grid__item"><h3>Uno</h3><p>Testo.</p></article>\n  <article class="cat-grid__item"><h3>Due</h3><p>Testo.</p></article>\n  <article class="cat-grid__item"><h3>Tre</h3><p>Testo.</p></article>\n  <article class="cat-grid__item"><h3>Quattro</h3><p>Testo.</p></article>\n  <article class="cat-grid__item"><h3>Cinque</h3><p>Testo.</p></article>\n</div>\n`,
    css: `.cat-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));\n  gap: var(--cat-gap, 1rem);\n}\n\n.cat-grid__item {\n  padding: var(--cat-space-3, 1rem);\n  border: 1px solid var(--cat-color-border, #d9d9d2);\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-surface, #fff);\n}\n\n.cat-grid__item h3 {\n  margin-top: 0;\n}\n`
  },
  {
    nome: 'Listino a tre piani',
    descrizione: 'Tre colonne di prezzo, quella centrale evidenziata',
    tag: ['prezzi', 'card'],
    html: `<section class="cat-pricing">\n  <article class="cat-plan">\n    <h3>Base</h3>\n    <p class="cat-plan__price">9 €<small>/mese</small></p>\n    <ul><li>Funzione uno</li><li>Funzione due</li></ul>\n    <a class="cat-plan__btn" href="#">Scegli</a>\n  </article>\n  <article class="cat-plan cat-plan--featured">\n    <h3>Pro</h3>\n    <p class="cat-plan__price">19 €<small>/mese</small></p>\n    <ul><li>Tutto di Base</li><li>Funzione tre</li><li>Funzione quattro</li></ul>\n    <a class="cat-plan__btn" href="#">Scegli</a>\n  </article>\n  <article class="cat-plan">\n    <h3>Studio</h3>\n    <p class="cat-plan__price">49 €<small>/mese</small></p>\n    <ul><li>Tutto di Pro</li><li>Funzione cinque</li></ul>\n    <a class="cat-plan__btn" href="#">Scegli</a>\n  </article>\n</section>\n`,
    css: `.cat-pricing {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-space-3, 1rem);\n  align-items: stretch;\n}\n\n.cat-plan {\n  flex: 1 1 14rem;\n  padding: var(--cat-space-4, 1.5rem);\n  border: 1px solid var(--cat-color-border, #d9d9d2);\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  text-align: center;\n}\n\n.cat-plan--featured {\n  border: 2px solid var(--cat-color-primary, #2f6f4e);\n  box-shadow: var(--cat-shadow-md, 0 4px 12px rgb(0 0 0 / 0.12));\n}\n\n.cat-plan__price {\n  font-size: 2rem;\n  font-weight: 700;\n}\n\n.cat-plan__price small {\n  font-size: 0.875rem;\n  font-weight: 400;\n}\n\n.cat-plan ul {\n  padding: 0;\n  list-style: none;\n}\n\n.cat-plan__btn {\n  display: inline-block;\n  padding: 0.5rem 1.25rem;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-primary, #2f6f4e);\n  color: #fff;\n  text-decoration: none;\n}\n`
  },
  {
    nome: 'Riga di loghi clienti',
    descrizione: 'Fascia con titolo e loghi in fila che vanno a capo',
    tag: ['logo', 'clienti', 'flex'],
    html: `<section class="cat-logos">\n  <p class="cat-logos__title">Hanno scelto noi</p>\n  <ul class="cat-logos__row">\n    <li>${LOGO}</li>\n    <li>${LOGO}</li>\n    <li>${LOGO}</li>\n    <li>${LOGO}</li>\n  </ul>\n</section>\n`,
    css: `${LOGO_CSS}\n.cat-logos {\n  padding: var(--cat-space-4, 2rem) var(--cat-space-3, 1rem);\n  text-align: center;\n}\n\n.cat-logos__title {\n  margin: 0 0 var(--cat-space-3, 1rem);\n  color: var(--cat-color-text-muted, #5c5c57);\n  font-size: 0.875rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n\n.cat-logos__row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: var(--cat-space-4, 2rem);\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.cat-logos__row .cat-logo {\n  opacity: 0.7;\n  filter: grayscale(1);\n}\n`
  },
  {
    nome: 'Footer con logo e colonne',
    descrizione: 'Logo e descrizione a sinistra, colonne di link, riga del copyright',
    tag: ['footer', 'logo', 'colonne'],
    html: `<footer class="cat-footer">\n  <div class="cat-footer__top">\n    <div class="cat-footer__brand">\n      ${LOGO}\n      <p>Una riga che descrive chi siete.</p>\n    </div>\n    <nav class="cat-footer__col" aria-label="Prodotto">\n      <h3>Prodotto</h3>\n      <a href="#">Funzioni</a><a href="#">Prezzi</a>\n    </nav>\n    <nav class="cat-footer__col" aria-label="Azienda">\n      <h3>Azienda</h3>\n      <a href="#">Chi siamo</a><a href="#">Contatti</a>\n    </nav>\n    <nav class="cat-footer__col" aria-label="Legale">\n      <h3>Legale</h3>\n      <a href="#">Privacy</a><a href="#">Cookie</a>\n    </nav>\n  </div>\n  <p class="cat-footer__copy">© 2026 Nome del sito</p>\n</footer>\n`,
    css: `${LOGO_CSS}\n.cat-footer {\n  padding: var(--cat-space-4, 2rem) var(--cat-space-3, 1rem);\n  border-top: 1px solid var(--cat-color-border, #d9d9d2);\n}\n\n.cat-footer__top {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-space-4, 2rem);\n}\n\n.cat-footer__brand {\n  flex: 2 1 16rem;\n}\n\n.cat-footer__col {\n  flex: 1 1 8rem;\n  display: flex;\n  flex-direction: column;\n  gap: var(--cat-space-2, 0.5rem);\n}\n\n.cat-footer__col h3 {\n  margin: 0 0 var(--cat-space-2, 0.5rem);\n  font-size: 1rem;\n}\n\n.cat-footer a {\n  color: inherit;\n  text-decoration: none;\n}\n\n.cat-footer__copy {\n  margin: var(--cat-space-4, 2rem) 0 0;\n  color: var(--cat-color-text-muted, #5c5c57);\n  font-size: 0.875rem;\n}\n`
  },
  {
    nome: 'Pagina con header, sidebar e footer',
    descrizione: 'Holy grail con CSS grid: header, sidebar, contenuto, footer a tutta altezza',
    tag: ['layout', 'grid', 'sidebar'],
    html: `<div class="cat-page">\n  <header class="cat-page__header">Header</header>\n  <aside class="cat-page__side">Sidebar</aside>\n  <main class="cat-page__main">Contenuto</main>\n  <footer class="cat-page__footer">Footer</footer>\n</div>\n`,
    css: `.cat-page {\n  display: grid;\n  grid-template-columns: 14rem 1fr;\n  grid-template-areas:\n    "header header"\n    "side main"\n    "footer footer";\n  grid-template-rows: auto 1fr auto;\n  min-height: 24rem;\n  gap: 1px;\n  background: var(--cat-color-border, #d9d9d2);\n}\n\n.cat-page > * {\n  padding: var(--cat-space-3, 1rem);\n  background: var(--cat-color-surface, #fff);\n}\n\n.cat-page__header { grid-area: header; }\n.cat-page__side { grid-area: side; }\n.cat-page__main { grid-area: main; }\n.cat-page__footer { grid-area: footer; }\n\n@media (max-width: 640px) {\n  .cat-page {\n    grid-template-columns: 1fr;\n    grid-template-areas: "header" "side" "main" "footer";\n  }\n}\n`
  },
  {
    nome: 'Immagine e testo affiancati',
    descrizione: 'Media object: immagine piccola a sinistra, testo a destra',
    tag: ['flex', 'immagine'],
    html: `<article class="cat-media">\n  <div class="cat-media__img" role="img" aria-label="Immagine">Img</div>\n  <div class="cat-media__body">\n    <h3>Titolo</h3>\n    <p>Testo che si affianca all'immagine e va sotto su schermo stretto.</p>\n  </div>\n</article>\n`,
    css: `.cat-media {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--cat-space-3, 1rem);\n}\n\n.cat-media__img {\n  flex: 0 0 8rem;\n  display: grid;\n  place-items: center;\n  height: 8rem;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-border, #d9d9d2);\n}\n\n.cat-media__body {\n  flex: 1 1 14rem;\n}\n\n.cat-media__body h3 {\n  margin-top: 0;\n}\n`
  },
  {
    nome: 'Banda call to action',
    descrizione: 'Fascia colorata con testo e pulsante che si impilano su schermo stretto',
    tag: ['cta', 'flex'],
    html: `<section class="cat-cta">\n  <div>\n    <h2>Pronto a iniziare?</h2>\n    <p>Scrivici, rispondiamo entro un giorno.</p>\n  </div>\n  <a class="cat-cta__btn" href="#">Contattaci</a>\n</section>\n`,
    css: `.cat-cta {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: var(--cat-space-3, 1rem);\n  padding: var(--cat-space-4, 2rem);\n  border-radius: var(--cat-radius-lg, 0.75rem);\n  background: var(--cat-color-primary, #2f6f4e);\n  color: #fff;\n}\n\n.cat-cta h2,\n.cat-cta p {\n  margin: 0;\n}\n\n.cat-cta__btn {\n  padding: 0.6rem 1.25rem;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: #fff;\n  color: var(--cat-color-primary, #2f6f4e);\n  text-decoration: none;\n}\n`
  },
  {
    nome: 'Colonne di testo (giornale)',
    descrizione: 'Testo lungo in colonne CSS che diventano una su schermo stretto',
    tag: ['testo', 'colonne'],
    html: `<div class="cat-columns">\n  <p>Testo lungo di esempio. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>\n  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n</div>\n`,
    css: `.cat-columns {\n  columns: 18rem 2;\n  column-gap: var(--cat-space-4, 2rem);\n}\n\n.cat-columns p {\n  margin-top: 0;\n}\n`
  },
  {
    nome: 'Galleria a mattonelle',
    descrizione: 'Immagini di altezze diverse in colonne (masonry con CSS columns)',
    tag: ['galleria', 'immagini'],
    html: `<div class="cat-gallery">\n  <div style="height:8rem">1</div>\n  <div style="height:12rem">2</div>\n  <div style="height:10rem">3</div>\n  <div style="height:14rem">4</div>\n  <div style="height:9rem">5</div>\n  <div style="height:11rem">6</div>\n</div>\n`,
    css: `.cat-gallery {\n  columns: 12rem;\n  column-gap: var(--cat-gap, 1rem);\n}\n\n.cat-gallery > * {\n  display: grid;\n  place-items: center;\n  margin-bottom: var(--cat-gap, 1rem);\n  break-inside: avoid;\n  border-radius: var(--cat-radius-md, 0.5rem);\n  background: var(--cat-color-border, #d9d9d2);\n}\n`
  }
];
