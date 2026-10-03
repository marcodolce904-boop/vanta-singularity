'use strict';

/* Componenti v2: form avanzati, contenuti, feedback, effetti di superficie. */

module.exports = [
  {
    nome: 'Accordion senza JavaScript',
    descrizione: 'Pannelli con details/summary, accessibili di serie',
    tag: ['accordion', 'senza-js'],
    html: `<div class="cat-acc">\n  <details open><summary>Primo pannello</summary><p>Contenuto del primo pannello.</p></details>\n  <details><summary>Secondo pannello</summary><p>Contenuto del secondo pannello.</p></details>\n</div>\n`,
    css: `.cat-acc details { border: 1px solid var(--cat-color-border, #d9d9d2); }\n.cat-acc details + details { border-top: 0; }\n.cat-acc summary { padding: var(--cat-space-2, 0.5rem) var(--cat-space-3, 1rem); font-weight: 600; cursor: pointer; }\n.cat-acc p { margin: 0; padding: 0 var(--cat-space-3, 1rem) var(--cat-space-3, 1rem); }\n`,
    js: ''
  },
  {
    nome: 'Campo con icona e errore',
    descrizione: 'Input con icona a sinistra, aiuto sotto e stato di errore',
    tag: ['form', 'input', 'icona'],
    html: `<div class="cat-input">\n  <label for="cat-in-1">Email</label>\n  <div class="cat-input__box">\n    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>\n    <input id="cat-in-1" type="email" placeholder="tu@esempio.it" aria-describedby="cat-in-1-help">\n  </div>\n  <small id="cat-in-1-help">Non la condividiamo con nessuno.</small>\n</div>\n<div class="cat-input cat-input--error">\n  <label for="cat-in-2">Email</label>\n  <div class="cat-input__box">\n    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>\n    <input id="cat-in-2" type="email" value="sbagliata" aria-invalid="true" aria-describedby="cat-in-2-help">\n  </div>\n  <small id="cat-in-2-help">Inserisci un'email valida.</small>\n</div>\n`,
    css: `.cat-input { display: grid; gap: 0.25rem; max-width: 22rem; margin-bottom: var(--cat-space-3, 1rem); }\n.cat-input label { font-weight: 600; }\n.cat-input__box { display: flex; align-items: center; gap: 0.5rem; padding: 0 0.7rem; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-md, 0.5rem); background: var(--cat-color-surface, #fff); }\n.cat-input__box:focus-within { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: 1px; }\n.cat-input__box input { flex: 1; min-width: 0; padding: 0.55rem 0; border: 0; outline: 0; background: none; color: inherit; font: inherit; }\n.cat-input small { color: var(--cat-color-text-muted, #5c5c57); }\n.cat-input--error .cat-input__box { border-color: var(--cat-color-error, #b3261e); }\n.cat-input--error small { color: var(--cat-color-error, #b3261e); }\n`,
    js: ''
  },
  {
    nome: 'Barra di ricerca',
    descrizione: 'Campo grande con lente e pulsante, per header e hero',
    tag: ['form', 'ricerca'],
    html: `<form role="search" class="cat-search">\n  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>\n  <input type="search" placeholder="Cerca…" aria-label="Cerca">\n  <button type="submit">Cerca</button>\n</form>\n`,
    css: `.cat-search { display: flex; align-items: center; gap: 0.5rem; max-width: 32rem; padding: 0.35rem 0.35rem 0.35rem 1rem; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: 999px; background: var(--cat-color-surface, #fff); }\n.cat-search:focus-within { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: 1px; }\n.cat-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; color: inherit; font: inherit; }\n.cat-search button { padding: 0.5rem 1.1rem; border: 0; border-radius: 999px; background: var(--cat-color-primary, #2f6f4e); color: #fff; font: inherit; cursor: pointer; }\n`,
    js: ''
  },
  {
    nome: 'Checkbox e radio personalizzati',
    descrizione: 'Controlli nativi con aspetto curato, tastiera e screen reader intatti',
    tag: ['form', 'checkbox', 'radio'],
    html: `<fieldset class="cat-choices">\n  <legend>Preferenze</legend>\n  <label><input type="checkbox" checked> Newsletter</label>\n  <label><input type="checkbox"> Offerte</label>\n</fieldset>\n<fieldset class="cat-choices">\n  <legend>Consegna</legend>\n  <label><input type="radio" name="cat-del" checked> Standard</label>\n  <label><input type="radio" name="cat-del"> Express</label>\n</fieldset>\n`,
    css: `.cat-choices { margin: 0 0 var(--cat-space-3, 1rem); padding: 0; border: 0; }\n.cat-choices legend { margin-bottom: 0.4rem; font-weight: 600; }\n.cat-choices label { display: flex; align-items: center; gap: 0.6rem; padding: 0.2rem 0; cursor: pointer; }\n.cat-choices input { width: 1.25rem; height: 1.25rem; accent-color: var(--cat-color-primary, #2f6f4e); }\n.cat-choices input:focus-visible { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: 2px; }\n`,
    js: ''
  },
  {
    nome: 'Cursore (range) con valore',
    descrizione: 'Slider con colore del marchio e valore mostrato accanto',
    tag: ['form', 'slider'],
    html: `<label class="cat-range">Volume <output id="cat-range-out">40</output>\n  <input type="range" min="0" max="100" value="40" id="cat-range-in">\n</label>\n`,
    css: `.cat-range { display: grid; gap: 0.4rem; max-width: 20rem; font-weight: 600; }\n.cat-range input { width: 100%; accent-color: var(--cat-color-primary, #2f6f4e); }\n`,
    js: `var rin = document.getElementById('cat-range-in');\nvar rout = document.getElementById('cat-range-out');\nrin.addEventListener('input', function () { rout.textContent = rin.value; });\n`
  },
  {
    nome: 'Chip rimovibili',
    descrizione: 'Etichette con X per togliere filtri o tag',
    tag: ['chip', 'filtro'],
    html: `<ul class="cat-chips" aria-label="Filtri attivi">\n  <li class="cat-chip">Rosso <button type="button" aria-label="Rimuovi Rosso">×</button></li>\n  <li class="cat-chip">Taglia M <button type="button" aria-label="Rimuovi Taglia M">×</button></li>\n</ul>\n`,
    css: `.cat-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }\n.cat-chip { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.3rem 0.2rem 0.75rem; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: 999px; background: var(--cat-color-surface, #fff); }\n.cat-chip button { width: 1.5rem; height: 1.5rem; border: 0; border-radius: 50%; background: rgb(0 0 0 / 0.06); color: inherit; cursor: pointer; line-height: 1; }\n.cat-chip button:hover { background: rgb(0 0 0 / 0.14); }\n`,
    js: `document.querySelectorAll('.cat-chips').forEach(function (ul) {\n  ul.addEventListener('click', function (e) {\n    var b = e.target.closest('button');\n    if (b) b.closest('li').remove();\n  });\n});\n`
  },
  {
    nome: 'Valutazione a stelle',
    descrizione: 'Stelle di sola lettura con testo alternativo',
    tag: ['recensione', 'stelle'],
    html: `<p class="cat-stars" role="img" aria-label="Valutazione 4 su 5" style="--rating:4">★★★★★</p>\n`,
    css: `.cat-stars {\n  --size: 1.5rem;\n  display: inline-block;\n  margin: 0;\n  font-size: var(--size);\n  line-height: 1;\n  letter-spacing: 0.1em;\n  background: linear-gradient(90deg, #f5a623 calc(var(--rating) / 5 * 100%), var(--cat-color-border, #d9d9d2) 0);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n`,
    js: ''
  },
  {
    nome: 'Stepper (passaggi)',
    descrizione: 'Indicatore a tappe per procedure e checkout',
    tag: ['processo', 'checkout'],
    html: `<ol class="cat-steps" aria-label="Avanzamento">\n  <li class="is-done">Carrello</li>\n  <li class="is-current" aria-current="step">Dati</li>\n  <li>Pagamento</li>\n  <li>Fine</li>\n</ol>\n`,
    css: `.cat-steps { display: flex; gap: 0; margin: 0; padding: 0; list-style: none; counter-reset: s; }\n.cat-steps li { position: relative; flex: 1; padding-top: 2.25rem; text-align: center; color: var(--cat-color-text-muted, #5c5c57); font-size: 0.875rem; counter-increment: s; }\n.cat-steps li::before { content: counter(s); position: absolute; top: 0; left: 50%; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; margin-left: -0.875rem; border-radius: 50%; background: var(--cat-color-border, #d9d9d2); color: var(--cat-color-text, #1c1c1a); font-weight: 700; z-index: 1; }\n.cat-steps li::after { content: ""; position: absolute; top: 0.85rem; left: -50%; width: 100%; height: 2px; background: var(--cat-color-border, #d9d9d2); }\n.cat-steps li:first-child::after { display: none; }\n.cat-steps .is-done::before, .cat-steps .is-current::before { background: var(--cat-color-primary, #2f6f4e); color: #fff; }\n.cat-steps .is-done::after, .cat-steps .is-current::after { background: var(--cat-color-primary, #2f6f4e); }\n.cat-steps .is-current { color: var(--cat-color-text, #1c1c1a); font-weight: 700; }\n`,
    js: ''
  },
  {
    nome: 'Card articolo del blog',
    descrizione: 'Immagine, categoria, titolo, estratto, autore e data',
    tag: ['card', 'blog'],
    html: `<article class="cat-post">\n  <div class="cat-post__img" role="img" aria-label="Copertina"></div>\n  <div class="cat-post__body">\n    <span class="cat-post__cat">Guide</span>\n    <h3><a href="#">Come scegliere i colori di un sito</a></h3>\n    <p>Un estratto di due righe che invita a leggere l'articolo completo.</p>\n    <footer><span>Anna Bianchi</span> · <time datetime="2026-10-03">3 ott 2026</time></footer>\n  </div>\n</article>\n`,
    css: `.cat-post { max-width: 22rem; overflow: hidden; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); background: var(--cat-color-surface, #fff); }\n.cat-post__img { aspect-ratio: 16 / 9; background: var(--cat-color-border, #d9d9d2); }\n.cat-post__body { padding: var(--cat-space-3, 1rem); }\n.cat-post__cat { color: var(--cat-color-primary, #2f6f4e); font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }\n.cat-post h3 { margin: 0.25rem 0 0.5rem; }\n.cat-post h3 a { color: inherit; text-decoration: none; }\n.cat-post h3 a:hover { text-decoration: underline; }\n.cat-post p { margin: 0 0 var(--cat-space-2, 0.5rem); color: var(--cat-color-text-muted, #5c5c57); }\n.cat-post footer { font-size: 0.875rem; color: var(--cat-color-text-muted, #5c5c57); }\n`,
    js: ''
  },
  {
    nome: 'Citazione in evidenza',
    descrizione: 'Blockquote con barra laterale e fonte',
    tag: ['testo', 'citazione'],
    html: `<figure class="cat-pullquote">\n  <blockquote><p>Il design non è come appare. Il design è come funziona.</p></blockquote>\n  <figcaption>— Autore, <cite>Fonte</cite></figcaption>\n</figure>\n`,
    css: `.cat-pullquote { margin: 0; padding-left: var(--cat-space-4, 1.5rem); border-left: 4px solid var(--cat-color-primary, #2f6f4e); }\n.cat-pullquote blockquote { margin: 0; }\n.cat-pullquote p { margin: 0 0 0.5rem; font-size: clamp(1.25rem, 2.5vw, 1.75rem); line-height: 1.3; }\n.cat-pullquote figcaption { color: var(--cat-color-text-muted, #5c5c57); }\n`,
    js: ''
  },
  {
    nome: 'Blocco di codice',
    descrizione: 'Codice in riquadro scuro con scorrimento orizzontale',
    tag: ['codice', 'documentazione'],
    html: `<pre class="cat-code" tabindex="0"><code>npm install cat-alog\nnpm start</code></pre>\n`,
    css: `.cat-code { margin: 0; padding: var(--cat-space-3, 1rem); overflow-x: auto; border-radius: var(--cat-radius-md, 0.5rem); background: #1c1c1a; color: #f2f2ee; font: 0.875rem/1.6 ui-monospace, Menlo, Consolas, monospace; }\n`,
    js: ''
  },
  {
    nome: 'Stato vuoto',
    descrizione: 'Icona, messaggio e azione quando non c\'è ancora nulla da mostrare',
    tag: ['stato', 'vuoto'],
    html: `<div class="cat-empty">\n  <div class="cat-empty__icon" aria-hidden="true">📭</div>\n  <h3>Ancora nessun messaggio</h3>\n  <p>Quando qualcuno ti scrive, lo trovi qui.</p>\n  <a href="#">Scrivi il primo</a>\n</div>\n`,
    css: `.cat-empty { display: grid; justify-items: center; gap: 0.4rem; padding: var(--cat-space-5, 3rem) var(--cat-space-3, 1rem); border: 2px dashed var(--cat-color-border, #d9d9d2); border-radius: var(--cat-radius-lg, 0.75rem); text-align: center; }\n.cat-empty__icon { font-size: 2.5rem; }\n.cat-empty h3, .cat-empty p { margin: 0; }\n.cat-empty p { color: var(--cat-color-text-muted, #5c5c57); }\n.cat-empty a { margin-top: 0.5rem; padding: 0.55rem 1.2rem; border-radius: 999px; background: var(--cat-color-primary, #2f6f4e); color: #fff; text-decoration: none; }\n`,
    js: ''
  },
  {
    nome: 'Selettore segmentato',
    descrizione: 'Tre opzioni in una pillola (radio nativi), per mensile/annuale e simili',
    tag: ['form', 'segmented'],
    html: `<fieldset class="cat-seg">\n  <legend class="cat-seg__legend">Fatturazione</legend>\n  <label><input type="radio" name="cat-seg" checked><span>Mensile</span></label>\n  <label><input type="radio" name="cat-seg"><span>Annuale</span></label>\n</fieldset>\n`,
    css: `.cat-seg { display: inline-flex; margin: 0; padding: 4px; border: 1px solid var(--cat-color-border, #d9d9d2); border-radius: 999px; background: var(--cat-color-surface, #fff); }\n.cat-seg__legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }\n.cat-seg label { position: relative; cursor: pointer; }\n.cat-seg input { position: absolute; opacity: 0; }\n.cat-seg span { display: block; padding: 0.4rem 1.1rem; border-radius: 999px; transition: background 150ms ease, color 150ms ease; }\n.cat-seg input:checked + span { background: var(--cat-color-primary, #2f6f4e); color: #fff; }\n.cat-seg input:focus-visible + span { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: 2px; }\n@media (prefers-reduced-motion: reduce) { .cat-seg span { transition: none; } }\n`,
    js: ''
  },
  {
    nome: 'Banner annuncio in alto',
    descrizione: 'Striscia sottile sopra l\'header con messaggio e link',
    tag: ['banner', 'annuncio'],
    html: `<div class="cat-announce" role="region" aria-label="Annuncio">\n  <p>Spedizione gratuita fino a domenica. <a href="#">Approfitta ora →</a></p>\n</div>\n`,
    css: `.cat-announce { padding: 0.5rem var(--cat-space-3, 1rem); background: var(--cat-color-primary, #2f6f4e); color: #fff; text-align: center; font-size: 0.9375rem; }\n.cat-announce p { margin: 0; }\n.cat-announce a { color: inherit; font-weight: 700; }\n`,
    js: ''
  },
  {
    nome: 'Card con effetto vetro',
    descrizione: 'Glassmorphism: sfondo sfocato e bordo luminoso su un fondo colorato',
    tag: ['card', 'vetro', 'moderno'],
    html: `<div class="cat-glass-bg">\n  <div class="cat-glass">\n    <h3>Effetto vetro</h3>\n    <p>Sfocatura dello sfondo e bordo sottile.</p>\n  </div>\n</div>\n`,
    css: `.cat-glass-bg { display: grid; place-items: center; min-height: 14rem; padding: var(--cat-space-4, 2rem); background: linear-gradient(135deg, var(--cat-color-primary, #2f6f4e), var(--cat-color-accent, #d97706)); border-radius: var(--cat-radius-lg, 0.75rem); }\n.cat-glass { max-width: 20rem; padding: var(--cat-space-4, 1.5rem); border: 1px solid rgb(255 255 255 / 0.35); border-radius: var(--cat-radius-lg, 0.75rem); background: rgb(255 255 255 / 0.18); color: #fff; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }\n.cat-glass h3 { margin-top: 0; }\n.cat-glass p { margin-bottom: 0; }\n`,
    js: ''
  },
  {
    nome: 'Pulsante con bagliore',
    descrizione: 'Pulsante CTA con sfumatura e ombra colorata che cresce all\'hover',
    tag: ['pulsante', 'cta', 'moderno'],
    html: `<a href="#" class="cat-glow">Inizia ora</a>\n`,
    css: `.cat-glow { display: inline-block; padding: 0.8rem 1.8rem; border-radius: 999px; background: linear-gradient(135deg, var(--cat-color-primary, #2f6f4e), #3f9a6e); color: #fff; font-weight: 700; text-decoration: none; box-shadow: 0 6px 18px rgb(47 111 78 / 0.35); transition: transform 200ms ease, box-shadow 200ms ease; }\n.cat-glow:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgb(47 111 78 / 0.5); }\n.cat-glow:focus-visible { outline: 3px solid var(--cat-color-accent, #d97706); outline-offset: 3px; }\n@media (prefers-reduced-motion: reduce) { .cat-glow { transition: none; } .cat-glow:hover { transform: none; } }\n`,
    js: ''
  },
  {
    nome: 'Card con testo che appare',
    descrizione: 'Immagine con titolo; al passaggio compare un velo con descrizione',
    tag: ['card', 'hover', 'overlay'],
    html: `<article class="cat-reveal-card" tabindex="0">\n  <div class="cat-reveal-card__img" role="img" aria-label="Progetto"></div>\n  <div class="cat-reveal-card__over"><h3>Nome progetto</h3><p>Descrizione breve del lavoro.</p></div>\n</article>\n`,
    css: `.cat-reveal-card { position: relative; max-width: 20rem; overflow: hidden; border-radius: var(--cat-radius-lg, 0.75rem); }\n.cat-reveal-card__img { aspect-ratio: 4 / 3; background: linear-gradient(135deg, var(--cat-color-secondary, #4a5568), var(--cat-color-primary, #2f6f4e)); }\n.cat-reveal-card__over { position: absolute; inset: 0; display: grid; align-content: end; padding: var(--cat-space-3, 1rem); background: linear-gradient(transparent 30%, rgb(0 0 0 / 0.75)); color: #fff; opacity: 0; transform: translateY(8px); transition: opacity 250ms ease, transform 250ms ease; }\n.cat-reveal-card:hover .cat-reveal-card__over, .cat-reveal-card:focus-visible .cat-reveal-card__over { opacity: 1; transform: none; }\n.cat-reveal-card h3, .cat-reveal-card p { margin: 0; }\n@media (prefers-reduced-motion: reduce) { .cat-reveal-card__over { transition: none; } }\n`,
    js: ''
  },
  {
    nome: 'Gruppo di avatar',
    descrizione: 'Avatar sovrapposti con contatore «+3»',
    tag: ['avatar', 'team'],
    html: `<div class="cat-avatars" aria-label="Partecipanti">\n  <span>AB</span><span>LR</span><span>SV</span><span class="cat-avatars__more">+3</span>\n</div>\n`,
    css: `.cat-avatars { display: inline-flex; }\n.cat-avatars span { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; margin-left: -0.6rem; border: 2px solid var(--cat-color-surface, #fff); border-radius: 50%; background: var(--cat-color-secondary, #4a5568); color: #fff; font-size: 0.8125rem; font-weight: 700; }\n.cat-avatars span:first-child { margin-left: 0; }\n.cat-avatars__more { background: var(--cat-color-border, #d9d9d2) !important; color: var(--cat-color-text, #1c1c1a) !important; }\n`,
    js: ''
  },
  {
    nome: 'Etichetta prezzo con sconto',
    descrizione: 'Prezzo barrato, prezzo nuovo e badge percentuale',
    tag: ['prezzo', 'shop'],
    html: `<p class="cat-price"><s>49,00 €</s> <strong>39,00 €</strong> <span class="cat-price__off">-20%</span></p>\n`,
    css: `.cat-price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin: 0; }\n.cat-price s { color: var(--cat-color-text-muted, #5c5c57); }\n.cat-price strong { font-size: 1.5rem; }\n.cat-price__off { padding: 0.1rem 0.5rem; border-radius: 999px; background: var(--cat-color-error, #b3261e); color: #fff; font-size: 0.8125rem; font-weight: 700; }\n`,
    js: ''
  }
];
