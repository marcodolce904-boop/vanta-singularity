(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoResponsive = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Catalogo dei media query già pronti. Ogni voce:
   *   { id, nome, descrizione, query (stringa per matchMedia, oppure null), lang: 'css' | 'html', codice }
   * Le soglie sono quelle di Bootstrap 5 (576, 768, 992, 1200, 1400). Si usa 767.98px e non 768px
   * nel max-width per non far valere insieme min-width: 768px e max-width: 768px sul pixel esatto.
   */

  function css(sel, body) {
    return sel + ' {\n  ' + body + '\n}';
  }

  function mq(query, selector, body) {
    return '@media ' + query + ' {\n  ' + css(selector || '.selettore', body || '/* … */').replace(/\n/g, '\n  ') + '\n}';
  }

  function voce(id, nome, descrizione, query, codice, lang) {
    return { id: id, nome: nome, descrizione: descrizione, query: query, lang: lang || 'css', codice: codice };
  }

  function bp(id, nome, px, descrizione) {
    var q = '(min-width: ' + px + 'px)';
    return voce(id, nome + ' (≥ ' + px + ' px)', descrizione, q, mq(q));
  }

  var gruppi = [
    {
      id: 'mobile-first',
      nome: 'Punti di rottura (mobile-first)',
      nota: 'Si scrive prima lo stile per il telefono, poi si aggiunge con min-width man mano che lo schermo cresce. È il modo consigliato.',
      voci: [
        voce('base', 'Base (telefono, nessun media query)', 'Lo stile senza media query vale per tutti gli schermi: scrivi qui il telefono.', null, '.selettore {\n  /* stile di partenza, per lo schermo più piccolo */\n}'),
        bp('sm', 'Piccolo (sm)', 576, 'Telefoni grandi e telefoni in orizzontale.'),
        bp('md', 'Medio (md)', 768, 'Tablet in verticale.'),
        bp('lg', 'Grande (lg)', 992, 'Tablet in orizzontale e portatili piccoli.'),
        bp('xl', 'Molto grande (xl)', 1200, 'Computer da scrivania.'),
        bp('xxl', 'Enorme (xxl)', 1400, 'Schermi larghi.')
      ]
    },
    {
      id: 'solo-intervallo',
      nome: 'Solo un intervallo',
      nota: 'Lo stile vale soltanto tra due soglie. Utile per correggere un solo formato senza toccare gli altri.',
      voci: [
        voce('solo-xs', 'Solo telefono (< 576 px)', 'Soltanto sotto la soglia sm.', '(max-width: 575.98px)', mq('(max-width: 575.98px)')),
        voce('solo-sm', 'Solo sm (576 – 767 px)', 'Tra sm e md.', '(min-width: 576px) and (max-width: 767.98px)', mq('(min-width: 576px) and (max-width: 767.98px)')),
        voce('solo-md', 'Solo md (768 – 991 px)', 'Tra md e lg.', '(min-width: 768px) and (max-width: 991.98px)', mq('(min-width: 768px) and (max-width: 991.98px)')),
        voce('solo-lg', 'Solo lg (992 – 1199 px)', 'Tra lg e xl.', '(min-width: 992px) and (max-width: 1199.98px)', mq('(min-width: 992px) and (max-width: 1199.98px)')),
        voce('solo-xl', 'Solo xl (1200 – 1399 px)', 'Tra xl e xxl.', '(min-width: 1200px) and (max-width: 1399.98px)', mq('(min-width: 1200px) and (max-width: 1399.98px)')),
        voce('range', 'Sintassi a intervallo (moderna)', 'Stessa cosa di «tra md e lg» scritta con i segni < e ≤. Funziona nei browser recenti.', '(768px <= width < 992px)', mq('(768px <= width < 992px)'))
      ]
    },
    {
      id: 'desktop-first',
      nome: 'Dal grande al piccolo (max-width)',
      nota: 'Si parte dallo schermo grande e si corregge scendendo. Va bene per adattare un sito già fatto, ma il mobile-first è più leggero.',
      voci: [
        voce('max-xxl', 'Sotto xxl (< 1400 px)', 'Tutto ciò che è più stretto di 1400 px.', '(max-width: 1399.98px)', mq('(max-width: 1399.98px)')),
        voce('max-xl', 'Sotto xl (< 1200 px)', 'Più stretto di 1200 px.', '(max-width: 1199.98px)', mq('(max-width: 1199.98px)')),
        voce('max-lg', 'Sotto lg (< 992 px)', 'Più stretto di 992 px: tablet e telefoni.', '(max-width: 991.98px)', mq('(max-width: 991.98px)')),
        voce('max-md', 'Sotto md (< 768 px)', 'Più stretto di 768 px: telefoni e tablet piccoli.', '(max-width: 767.98px)', mq('(max-width: 767.98px)')),
        voce('max-sm', 'Sotto sm (< 576 px)', 'Più stretto di 576 px: telefoni.', '(max-width: 575.98px)', mq('(max-width: 575.98px)'))
      ]
    },
    {
      id: 'dispositivi',
      nome: 'Dispositivi tipici',
      nota: 'Soglie pensate per famiglie di dispositivi. I valori esatti cambiano ogni anno: meglio ragionare per larghezza che per modello.',
      voci: [
        voce('tel-piccolo', 'Telefono molto piccolo (≤ 374 px)', 'iPhone SE di prima generazione, vecchi Android.', '(max-width: 374.98px)', mq('(max-width: 374.98px)')),
        voce('tel', 'Telefono in verticale (≤ 575 px)', 'La maggior parte dei telefoni (360 – 430 px).', '(max-width: 575.98px) and (orientation: portrait)', mq('(max-width: 575.98px) and (orientation: portrait)')),
        voce('tel-orizz', 'Telefono in orizzontale', 'Poca altezza (≤ 500 px): attenzione a header e barre fisse.', '(max-height: 500px) and (orientation: landscape)', mq('(max-height: 500px) and (orientation: landscape)')),
        voce('tab-vert', 'Tablet in verticale (768 – 1023 px)', 'iPad e tablet Android tenuti in verticale.', '(min-width: 768px) and (max-width: 1023.98px) and (orientation: portrait)', mq('(min-width: 768px) and (max-width: 1023.98px) and (orientation: portrait)')),
        voce('tab-orizz', 'Tablet in orizzontale (1024 – 1279 px)', 'iPad e tablet in orizzontale, piccoli portatili.', '(min-width: 1024px) and (max-width: 1279.98px) and (orientation: landscape)', mq('(min-width: 1024px) and (max-width: 1279.98px) and (orientation: landscape)')),
        voce('portatile', 'Portatile (≥ 1280 px)', 'Portatili e monitor standard.', '(min-width: 1280px)', mq('(min-width: 1280px)')),
        voce('desktop-largo', 'Schermo largo (≥ 1440 px)', 'Monitor da scrivania.', '(min-width: 1440px)', mq('(min-width: 1440px)')),
        voce('fullhd', 'Full HD e oltre (≥ 1920 px)', 'Monitor grandi e 4K scalati.', '(min-width: 1920px)', mq('(min-width: 1920px)')),
        voce('piegh', 'Schermo pieghevole (sperimentale)', 'Telefoni pieghevoli con due schermi (funziona solo in alcuni browser).', '(horizontal-viewport-segments: 2)', mq('(horizontal-viewport-segments: 2)'))
      ]
    },
    {
      id: 'forma',
      nome: 'Orientamento e forma dello schermo',
      nota: 'Orientamento, proporzioni e altezza. L\'altezza conta: un telefono in orizzontale è largo ma bassissimo.',
      voci: [
        voce('verticale', 'Verticale (portrait)', 'Altezza maggiore della larghezza.', '(orientation: portrait)', mq('(orientation: portrait)')),
        voce('orizzontale', 'Orizzontale (landscape)', 'Larghezza maggiore dell\'altezza.', '(orientation: landscape)', mq('(orientation: landscape)')),
        voce('wide', 'Schermo molto largo (≥ 16:9)', 'Proporzioni 16:9 o più larghe.', '(min-aspect-ratio: 16/9)', mq('(min-aspect-ratio: 16/9)')),
        voce('quadrato', 'Schermo quasi quadrato (≤ 4:3)', 'Proporzioni 4:3 o più strette: tablet, finestre ridotte.', '(max-aspect-ratio: 4/3)', mq('(max-aspect-ratio: 4/3)')),
        voce('bassa', 'Finestra bassa (≤ 600 px di altezza)', 'Per rendere compatte barre e pannelli fissi.', '(max-height: 600px)', mq('(max-height: 600px)')),
        voce('alta', 'Finestra alta (≥ 900 px di altezza)', 'Per sfruttare l\'altezza dei monitor grandi.', '(min-height: 900px)', mq('(min-height: 900px)'))
      ]
    },
    {
      id: 'puntatore',
      nome: 'Mouse, touch e hover',
      nota: 'Distingue chi usa il dito da chi usa il mouse. Non fidarti della larghezza: un tablet ha molti pixel ma si usa con le dita.',
      voci: [
        voce('mouse', 'Mouse o trackpad (con hover)', 'Il puntatore è preciso e può passare sopra gli elementi: attiva gli effetti :hover qui.', '(hover: hover) and (pointer: fine)', mq('(hover: hover) and (pointer: fine)', 'a:hover', '/* effetto al passaggio */')),
        voce('touch', 'Touch (dito)', 'Il puntatore è impreciso: area di tocco di almeno 44 px.', '(pointer: coarse)', mq('(pointer: coarse)', 'button, a', 'min-height: 44px;\n  min-width: 44px;')),
        voce('no-hover', 'Senza hover', 'Chi non può passare sopra: i suggerimenti devono essere visibili in altro modo.', '(hover: none)', mq('(hover: none)')),
        voce('any-touch', 'Anche touch (qualsiasi puntatore)', 'Almeno un dispositivo di input è touch (per esempio portatile con schermo tattile).', '(any-pointer: coarse)', mq('(any-pointer: coarse)'))
      ]
    },
    {
      id: 'preferenze',
      nome: 'Preferenze dell\'utente',
      nota: 'Impostazioni del sistema operativo. Rispettarle è accessibilità, non un extra.',
      voci: [
        voce('scuro', 'Tema scuro', 'L\'utente ha scelto il tema scuro nel sistema.', '(prefers-color-scheme: dark)', mq('(prefers-color-scheme: dark)', ':root', '--cat-color-bg: #121211;\n  --cat-color-surface: #1c1c1a;\n  --cat-color-text: #f2f2ee;')),
        voce('chiaro', 'Tema chiaro', 'Tema chiaro (o nessuna preferenza).', '(prefers-color-scheme: light)', mq('(prefers-color-scheme: light)')),
        voce('poco-movimento', 'Meno movimento', 'L\'utente chiede meno animazioni. Da usare quasi sempre.', '(prefers-reduced-motion: reduce)', mq('(prefers-reduced-motion: reduce)', '*,\n  *::before,\n  *::after', 'animation-duration: 0.01ms !important;\n  animation-iteration-count: 1 !important;\n  transition-duration: 0.01ms !important;\n  scroll-behavior: auto !important;')),
        voce('movimento-ok', 'Movimento consentito', 'Nessuna richiesta di ridurre le animazioni: puoi aggiungere animazioni di solo abbellimento.', '(prefers-reduced-motion: no-preference)', mq('(prefers-reduced-motion: no-preference)')),
        voce('contrasto', 'Contrasto alto', 'L\'utente chiede più contrasto.', '(prefers-contrast: more)', mq('(prefers-contrast: more)', ':root', '--cat-color-border: #000;')),
        voce('colori-forzati', 'Colori forzati (modo ad alto contrasto di Windows)', 'Il sistema impone i suoi colori: non affidarti a sfondi e ombre per mostrare i bordi.', '(forced-colors: active)', mq('(forced-colors: active)', '.selettore', 'border: 1px solid CanvasText;')),
        voce('poca-trasparenza', 'Meno trasparenze', 'Chi chiede di evitare effetti vetro e sfocature.', '(prefers-reduced-transparency: reduce)', mq('(prefers-reduced-transparency: reduce)', '.selettore', 'backdrop-filter: none;\n  background: var(--cat-color-surface, #fff);')),
        voce('pochi-dati', 'Risparmio dati', 'Connessione costosa o lenta: evita immagini e video pesanti.', '(prefers-reduced-data: reduce)', mq('(prefers-reduced-data: reduce)'))
      ]
    },
    {
      id: 'schermo',
      nome: 'Schermo, stampa e app installata',
      nota: 'Tipo di uscita e qualità del display.',
      voci: [
        voce('stampa', 'Stampa', 'Stile per la carta: nascondi menu e pulsanti, mostra gli indirizzi dei link.', 'print', mq('print', 'nav, .cat-no-print', 'display: none;') + '\n\n@media print {\n  a[href]::after {\n    content: " (" attr(href) ")";\n  }\n}'),
        voce('schermo', 'Solo schermo', 'Esclude la stampa.', 'screen', mq('screen')),
        voce('retina', 'Schermo ad alta densità (retina)', 'Due o più pixel per punto: usa immagini a risoluzione doppia.', '(min-resolution: 2dppx)', mq('(min-resolution: 2dppx)', '.selettore', 'background-image: url("immagine@2x.png");\n  background-size: 100px 100px;')),
        voce('pwa', 'App installata (PWA)', 'Il sito gira come app, senza barra del browser.', '(display-mode: standalone)', mq('(display-mode: standalone)', '.cat-install-hint', 'display: none;')),
        voce('p3', 'Colori ampi (Display P3)', 'Monitor con più colori dello standard sRGB.', '(color-gamut: p3)', mq('(color-gamut: p3)', ':root', '--cat-color-primary: color(display-p3 0.15 0.45 0.3);')),
        voce('hdr', 'Schermo HDR', 'Luminosità e contrasto elevati.', '(dynamic-range: high)', mq('(dynamic-range: high)')),
        voce('no-js', 'Senza JavaScript', 'Funziona solo se JavaScript è disattivato o bloccato.', '(scripting: none)', mq('(scripting: none)', '.cat-needs-js', 'display: none;'))
      ]
    },
    {
      id: 'container',
      nome: 'Container query (in base al contenitore)',
      nota: 'Il componente reagisce alla larghezza del suo contenitore, non dello schermo. Ideale per componenti riusati in colonne diverse.',
      voci: [
        voce('cq-def', 'Dichiarare un contenitore', 'Il genitore diventa un riferimento per le container query.', null, '.cat-contenitore {\n  container-type: inline-size;\n  /* opzionale: container-name: scheda; */\n}'),
        voce('cq-min', 'Container query ≥ 400 px', 'Lo stile cambia quando il contenitore supera 400 px.', null, '@container (min-width: 400px) {\n  .cat-scheda {\n    display: grid;\n    grid-template-columns: 8rem 1fr;\n  }\n}'),
        voce('cq-nome', 'Container query con nome', 'Si rivolge a un contenitore preciso quando ce ne sono più di uno annidati.', null, '.cat-colonna {\n  container: colonna / inline-size; /* nome / tipo */\n}\n\n@container colonna (min-width: 30rem) {\n  .cat-scheda { flex-direction: row; }\n}'),
        voce('cq-unita', 'Unità del contenitore (cqi)', 'Dimensioni che seguono il contenitore invece dello schermo.', null, '.cat-titolo {\n  font-size: clamp(1.25rem, 4cqi, 2.25rem);\n}'),
        voce('cq-range', 'Container query a intervallo', 'Tra due larghezze del contenitore.', null, '@container (300px < width < 600px) {\n  .cat-scheda { padding: 1rem; }\n}')
      ]
    },
    {
      id: 'snippet',
      nome: 'Pronti da copiare (senza o con pochi media query)',
      nota: 'Tecniche che rendono la pagina fluida senza dover scrivere un media query per ogni schermo.',
      voci: [
        voce('viewport', 'Meta viewport (obbligatorio)', 'Va nel <head>. Senza, il telefono mostra la pagina come se fosse un desktop rimpicciolito.', null, '<meta name="viewport" content="width=device-width, initial-scale=1">', 'html'),
        voce('safe-area-meta', 'Viewport che usa anche la tacca (iPhone)', 'Con viewport-fit=cover si può usare env(safe-area-inset-*) per non finire sotto la tacca.', null, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', 'html'),
        voce('safe-area', 'Rispettare la tacca e la barra home', 'Padding che evita la tacca e la barra in basso.', null, '.cat-barra-fissa {\n  padding-top: env(safe-area-inset-top);\n  padding-bottom: env(safe-area-inset-bottom);\n  padding-left: env(safe-area-inset-left);\n  padding-right: env(safe-area-inset-right);\n}'),
        voce('altezza-schermo', 'Altezza schermo affidabile su telefono', '100vh sul telefono ignora la barra del browser. dvh la segue; la riga prima fa da riserva.', null, '.cat-schermo-intero {\n  min-height: 100vh;  /* browser vecchi */\n  min-height: 100dvh; /* segue la barra del browser */\n}'),
        voce('fluid-text', 'Testo fluido con clamp()', 'Cresce con lo schermo tra un minimo e un massimo, senza media query.', null, 'h1 { font-size: clamp(2rem, 1.2rem + 3vw, 3.5rem); }\nh2 { font-size: clamp(1.5rem, 1rem + 2vw, 2.25rem); }\np  { font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem); }'),
        voce('fluid-space', 'Spaziature fluide', 'Margini e padding che seguono la larghezza.', null, '.cat-sezione {\n  padding-block: clamp(2rem, 6vw, 5rem);\n  padding-inline: clamp(1rem, 4vw, 3rem);\n}'),
        voce('container-fluid', 'Contenitore fluido con margini', 'Largo quanto lo schermo meno due margini, fino a un massimo.', null, '.cat-contenitore {\n  width: min(100% - 2rem, 72rem);\n  margin-inline: auto;\n}'),
        voce('grid-auto', 'Griglia che si adatta da sola', 'Quante colonne ci stanno, da 15rem in su: nessun media query.', null, '.cat-griglia {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));\n  gap: 1rem;\n}'),
        voce('img-fluid', 'Immagini che non escono dallo schermo', 'Le immagini si restringono ma non si ingrandiscono oltre la loro dimensione.', null, 'img, video, svg {\n  max-width: 100%;\n  height: auto;\n}'),
        voce('hide-bp', 'Mostra e nascondi per punto di rottura', 'Classi pronte: cat-d-none, cat-d-block e le varianti md e lg.', null, '.cat-d-none { display: none !important; }\n.cat-d-block { display: block !important; }\n\n@media (min-width: 768px) {\n  .cat-d-md-none { display: none !important; }\n  .cat-d-md-block { display: block !important; }\n}\n\n@media (min-width: 992px) {\n  .cat-d-lg-none { display: none !important; }\n  .cat-d-lg-block { display: block !important; }\n}'),
        voce('table-scroll', 'Tabella che scorre in orizzontale', 'Evita che una tabella larga allarghi tutta la pagina.', null, '.cat-tabella-scroll {\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}'),
        voce('no-zoom-input', 'Campi che non fanno zoomare iOS', 'Su iPhone un campo con testo sotto 16 px fa zoomare la pagina al tocco.', null, 'input, select, textarea {\n  font-size: max(16px, 1rem);\n}'),
        voce('overflow', 'Evitare lo scorrimento orizzontale', 'Se compare una barra orizzontale, cerca l\'elemento più largo. Questo è solo l\'ultima spiaggia.', null, 'html, body {\n  max-width: 100%;\n  overflow-x: clip;\n}')
      ]
    }
  ];

  /* Dimensioni (CSS px) dei formati più comuni: servono per provare le pagine. */
  var dispositivi = [
    { id: 'se', nome: 'iPhone SE', w: 375, h: 667, tipo: 'telefono' },
    { id: 'i15', nome: 'iPhone 15', w: 393, h: 852, tipo: 'telefono' },
    { id: 'pixel', nome: 'Pixel 8', w: 412, h: 915, tipo: 'telefono' },
    { id: 'galaxy', nome: 'Galaxy S24', w: 360, h: 780, tipo: 'telefono' },
    { id: 'mini', nome: 'iPad mini', w: 744, h: 1133, tipo: 'tablet' },
    { id: 'ipad', nome: 'iPad', w: 820, h: 1180, tipo: 'tablet' },
    { id: 'pro11', nome: 'iPad Pro 11"', w: 834, h: 1194, tipo: 'tablet' },
    { id: 'pro13', nome: 'iPad Pro 13"', w: 1024, h: 1366, tipo: 'tablet' },
    { id: 'laptop', nome: 'Portatile', w: 1280, h: 720, tipo: 'computer' },
    { id: 'desk', nome: 'Desktop', w: 1440, h: 900, tipo: 'computer' },
    { id: 'fhd', nome: 'Full HD', w: 1920, h: 1080, tipo: 'computer' }
  ];

  var SOGLIE = [
    { k: 'xs', min: 0 },
    { k: 'sm', min: 576 },
    { k: 'md', min: 768 },
    { k: 'lg', min: 992 },
    { k: 'xl', min: 1200 },
    { k: 'xxl', min: 1400 }
  ];

  function breakpointFor(width) {
    var cur = SOGLIE[0].k;
    SOGLIE.forEach(function (s) { if (width >= s.min) cur = s.k; });
    return cur;
  }

  function lista(gruppoIds) {
    var sel = Array.isArray(gruppoIds) ? gruppoIds : null;
    var out = [];
    gruppi.forEach(function (g) {
      if (sel && sel.indexOf(g.id) === -1) return;
      g.voci.forEach(function (v) { out.push({ gruppo: g, voce: v }); });
    });
    return out;
  }

  /* File responsive.css con tutte le voci in CSS, raggruppate e commentate. */
  function buildCss(gruppoIds) {
    var sel = Array.isArray(gruppoIds) ? gruppoIds : null;
    var out = ['/* Media query responsive - file generato dall\'app (CAT-ALOG). Sostituisci «.selettore» con la tua classe. */'];
    gruppi.forEach(function (g) {
      if (sel && sel.indexOf(g.id) === -1) return;
      var blocchi = g.voci.filter(function (v) { return v.lang === 'css'; });
      if (!blocchi.length) return;
      out.push('', '/* ========== ' + g.nome + ' ========== */');
      blocchi.forEach(function (v) {
        out.push('', '/* ' + v.nome + ' */', v.codice);
      });
    });
    return out.join('\n') + '\n';
  }

  return {
    gruppi: gruppi,
    dispositivi: dispositivi,
    soglie: SOGLIE,
    breakpointFor: breakpointFor,
    lista: lista,
    buildCss: buildCss
  };
});
