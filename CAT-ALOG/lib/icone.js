(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoIcone = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Icone a tratto su griglia 24×24 (stroke currentColor, angoli arrotondati), disegnate per questo catalogo.
   * `corpo` è il contenuto dell'<svg>. Il colore segue il testo (currentColor).
   */

  function i(id, nome, tag, corpo) {
    return { id: id, nome: nome, tag: tag.split(' '), corpo: corpo };
  }

  var icone = [
    /* navigazione e azioni */
    i('home', 'Casa', 'home pagina', '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/>'),
    i('search', 'Cerca', 'lente ricerca', '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    i('menu', 'Menu', 'hamburger', '<path d="M4 6h16M4 12h16M4 18h16"/>'),
    i('x', 'Chiudi', 'close croce', '<path d="M6 6l12 12M18 6 6 18"/>'),
    i('plus', 'Più', 'aggiungi', '<path d="M12 5v14M5 12h14"/>'),
    i('minus', 'Meno', 'togli', '<path d="M5 12h14"/>'),
    i('check', 'Spunta', 'ok conferma', '<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    i('chevron-left', 'Freccia piccola sinistra', 'chevron indietro', '<path d="m15 5-7 7 7 7"/>'),
    i('chevron-right', 'Freccia piccola destra', 'chevron avanti', '<path d="m9 5 7 7-7 7"/>'),
    i('chevron-up', 'Freccia piccola su', 'chevron', '<path d="m5 15 7-7 7 7"/>'),
    i('chevron-down', 'Freccia piccola giù', 'chevron tendina', '<path d="m5 9 7 7 7-7"/>'),
    i('arrow-left', 'Freccia sinistra', 'indietro', '<path d="M20 12H4M10 6l-6 6 6 6"/>'),
    i('arrow-right', 'Freccia destra', 'avanti', '<path d="M4 12h16M14 6l6 6-6 6"/>'),
    i('arrow-up', 'Freccia su', 'su', '<path d="M12 20V4M6 10l6-6 6 6"/>'),
    i('arrow-down', 'Freccia giù', 'giù', '<path d="M12 4v16M6 14l6 6 6-6"/>'),
    i('external', 'Apri in nuova scheda', 'link esterno', '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    i('link', 'Link', 'catena collegamento', '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    i('more-h', 'Altro (orizzontale)', 'puntini', '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
    i('more-v', 'Altro (verticale)', 'puntini', '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>'),
    i('filter', 'Filtro', 'imbuto', '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>'),
    i('grid', 'Griglia', 'riquadri', '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>'),
    i('list', 'Elenco', 'righe', '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
    i('refresh', 'Aggiorna', 'ricarica', '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/>'),
    i('settings', 'Impostazioni', 'ingranaggio opzioni', '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    /* persone e comunicazione */
    i('user', 'Persona', 'utente profilo', '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>'),
    i('users', 'Persone', 'gruppo team', '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 19c0-3.4 3-5 6.5-5s6.5 1.6 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M17.5 14c2.6.2 4 1.6 4 4"/>'),
    i('mail', 'Email', 'posta lettera', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
    i('phone', 'Telefono', 'chiamata', '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    i('message', 'Messaggio', 'chat fumetto', '<path d="M4 5h16v11H9l-5 4z"/>'),
    i('send', 'Invia', 'aeroplano', '<path d="M21 3 3 10.5l7 3 3 7z"/><path d="m10 13.5 11-10.5"/>'),
    i('share', 'Condividi', 'share social', '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>'),
    i('bell', 'Campanella', 'notifica avviso', '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>'),
    i('thumbs-up', 'Mi piace', 'like pollice', '<path d="M7 11v9H4v-9z"/><path d="M7 11l4-7a2 2 0 0 1 2 2.5L12.5 10H19a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.7 20H7"/>'),
    i('heart', 'Cuore', 'preferito amore', '<path d="M12 20S4 15 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20z"/>'),
    i('star', 'Stella', 'preferito valutazione', '<path d="m12 3.5 2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9L6.7 20l1.1-6L3.4 9.8l6-.8z"/>'),
    /* contenuti */
    i('image', 'Immagine', 'foto', '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/>'),
    i('camera', 'Fotocamera', 'foto', '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    i('video', 'Video', 'film', '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10.5 5-3v9l-5-3z"/>'),
    i('play', 'Riproduci', 'play', '<path d="M7 4.5v15l12-7.5z"/>'),
    i('pause', 'Pausa', 'pause', '<path d="M8 5v14M16 5v14"/>'),
    i('music', 'Musica', 'nota audio', '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
    i('file', 'File', 'documento', '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>'),
    i('folder', 'Cartella', 'directory', '<path d="M3 6a1 1 0 0 1 1-1h5l2 2.5h9a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>'),
    i('bookmark', 'Segnalibro', 'salva', '<path d="M6 3h12v18l-6-4.5L6 21z"/>'),
    i('tag', 'Etichetta', 'prezzo cartellino', '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>'),
    i('edit', 'Modifica', 'matita scrivi', '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>'),
    i('copy', 'Copia', 'duplica', '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    i('trash', 'Cestino', 'elimina', '<path d="M4 7h16M10 7V4h4v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>'),
    i('download', 'Scarica', 'download', '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
    i('upload', 'Carica', 'upload', '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>'),
    i('save', 'Salva', 'floppy', '<path d="M5 3h12l3 3v15H5z"/><path d="M8 3v6h7V3M8 21v-7h8v7"/>'),
    i('code', 'Codice', 'sviluppo', '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>'),
    i('terminal', 'Terminale', 'console', '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 10 3 2.5L7 15M12.5 15H17"/>'),
    /* stato e avvisi */
    i('info', 'Informazione', 'info', '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.8" r="0.6"/>'),
    i('help', 'Aiuto', 'domanda', '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2.2-2.5 4"/><circle cx="12" cy="17.2" r="0.6"/>'),
    i('alert', 'Attenzione', 'avviso pericolo', '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r="0.6"/>'),
    i('check-circle', 'Fatto', 'successo ok', '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>'),
    i('x-circle', 'Errore', 'errore chiudi', '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'),
    i('lock', 'Lucchetto chiuso', 'sicurezza password', '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    i('unlock', 'Lucchetto aperto', 'sblocca', '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
    i('eye', 'Mostra', 'occhio visibile', '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    i('eye-off', 'Nascondi', 'occhio barrato', '<path d="M3 3l18 18"/><path d="M10 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.7C3.8 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 4-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    /* luogo, tempo, commercio */
    i('pin', 'Posizione', 'mappa luogo', '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>'),
    i('globe', 'Mondo', 'lingua sito', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
    i('calendar', 'Calendario', 'data', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    i('clock', 'Orologio', 'ora tempo', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>'),
    i('cart', 'Carrello', 'shop acquisti', '<path d="M3 4h2.500l2.200 11h10l2-8H7"/><circle cx="9" cy="19.500" r="1.400"/><circle cx="17" cy="19.500" r="1.400"/>'),
    i('bag', 'Borsa', 'shopping', '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    i('card', 'Carta di credito', 'pagamento', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>'),
    i('gift', 'Regalo', 'pacco', '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18v-3H3zM12 6v14M12 6c-1-3-5-3-5-1s3 1 5 1zM12 6c1-3 5-3 5-1s-3 1-5 1z"/>'),
    /* tema */
    i('sun', 'Sole', 'tema chiaro', '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600 7 7M17 17l1.400 1.400M18.400 5.600 17 7M7 17l-1.400 1.400"/>'),
    i('moon', 'Luna', 'tema scuro notte', '<path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z"/>'),
    i('cloud', 'Nuvola', 'meteo', '<path d="M7 18a4.500 4.500 0 0 1-.5-9A6 6 0 0 1 18 10a4 4 0 0 1-.5 8z"/>'),
    i('zap', 'Fulmine', 'veloce energia', '<path d="M13 3 5 13.500h6L10 21l8-10.500h-6z"/>'),
    i('award', 'Premio', 'medaglia', '<circle cx="12" cy="9" r="5.500"/><path d="m8.500 14 -1.500 7 5-3 5 3-1.500-7"/>'),
    /* gatti */
    i('paw', 'Zampa', 'gatto impronta', '<ellipse cx="12" cy="16" rx="4.500" ry="3.500"/><ellipse cx="5.500" cy="11" rx="1.800" ry="2.400"/><ellipse cx="9.500" cy="6.500" rx="1.800" ry="2.400"/><ellipse cx="14.500" cy="6.500" rx="1.800" ry="2.400"/><ellipse cx="18.500" cy="11" rx="1.800" ry="2.400"/>'),
    i('cat', 'Gatto', 'muso faccia', '<path d="M5 9 4.500 3.500 9 6.200a8 8 0 0 1 6 0l4.500-2.700L19 9a7.500 7.500 0 0 1 1 3.800C20 17.500 16.500 20.500 12 20.500S4 17.500 4 12.800A7.500 7.500 0 0 1 5 9z"/><circle cx="9" cy="12" r="0.8"/><circle cx="15" cy="12" r="0.8"/><path d="M12 14v1.500M10.500 16.500c.7.600 2.300.6 3 0M4 14.500l-2 .5M4 16.500l-2 1M20 14.500l2 .5M20 16.500l2 1"/>')
  ];

  function attrs(o) {
    var opt = o || {};
    var size = opt.size ? ' width="' + opt.size + '" height="' + opt.size + '"' : '';
    var sw = opt.stroke || 2;
    return 'viewBox="0 0 24 24"' + size + ' fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"';
  }

  /* SVG da incollare nella pagina: aria-hidden se è decorativo, role="img" con titolo se ha un significato. */
  function svgInline(ic, o) {
    var opt = o || {};
    var a = opt.label ? 'role="img" aria-label="' + String(opt.label).replace(/"/g, '&quot;') + '"' : 'aria-hidden="true" focusable="false"';
    return '<svg ' + attrs(opt) + ' ' + a + '>' + ic.corpo + '</svg>';
  }

  function symbol(ic) {
    return '<symbol id="icon-' + ic.id + '" viewBox="0 0 24 24">' + ic.corpo + '</symbol>';
  }

  function sprite(list, o) {
    var opt = o || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" fill="none" stroke="currentColor" stroke-width="' + (opt.stroke || 2) +
      '" stroke-linecap="round" stroke-linejoin="round">\n' + list.map(function (ic) { return '  ' + symbol(ic); }).join('\n') + '\n</svg>\n';
  }

  function useTag(ic, o) {
    var opt = o || {};
    return '<svg ' + (opt.size ? 'width="' + opt.size + '" height="' + opt.size + '" ' : '') + 'fill="none" stroke="currentColor" stroke-width="' + (opt.stroke || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#icon-' + ic.id + '"/></svg>';
  }

  function standalone(ic, o) {
    var opt = o || {};
    return '<svg xmlns="http://www.w3.org/2000/svg" ' + attrs(opt) + '>' + ic.corpo + '</svg>';
  }

  /* Per le maschere CSS il colore va scritto (currentColor non esiste dentro un data URI): si usa nero, il colore viene dallo sfondo. */
  function dataUri(ic, o) {
    var svg = standalone(ic, o).replace(/currentColor/g, '#000');
    return 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'");
  }

  function cssMask(ic, o) {
    var uri = dataUri(ic, o);
    return '.icona-' + ic.id + ' {\n  display: inline-block;\n  width: 1.5em;\n  height: 1.5em;\n  background-color: currentColor;\n  -webkit-mask: url("' + uri + '") center / contain no-repeat;\n  mask: url("' + uri + '") center / contain no-repeat;\n}';
  }

  /* Pulisce un SVG incollato: toglie script, gestori di eventi, riferimenti esterni, commenti e metadati;
     usa currentColor al posto dei colori fissi di riempimento/tratto e aggiunge il viewBox se manca. */
  function cleanSvg(testo, o) {
    var opt = o || {};
    var avvisi = [];
    var s = String(testo || '').trim();
    if (!/<svg[\s>]/i.test(s)) return { svg: '', avvisi: ['Non trovo un tag <svg> nel testo incollato.'] };
    s = s.replace(/<\?xml[\s\S]*?\?>/gi, '').replace(/<!doctype[\s\S]*?>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
    var before = s;
    s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
    if (s !== before) avvisi.push('Tolti script o foreignObject.');
    before = s;
    s = s.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
    if (s !== before) avvisi.push('Tolti i gestori di eventi (onclick, onload…).');
    before = s;
    s = s.replace(/\s(?:xlink:)?href\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, '');
    s = s.replace(/\s(?:xlink:)?href\s*=\s*"https?:[^"]*"/gi, function () { return ''; });
    if (s !== before) avvisi.push('Tolti i riferimenti esterni.');
    s = s.replace(/<(title|desc|metadata|sodipodi:namedview)[\s\S]*?<\/\1>/gi, function (m, tag) { return opt.tieniTitolo && tag.toLowerCase() === 'title' ? m : ''; });
    s = s.replace(/<\/?(sodipodi|inkscape|dc|cc|rdf):[^>]*>/gi, '');
    s = s.replace(/\s(?:sodipodi|inkscape|xmlns:(?:sodipodi|inkscape|dc|cc|rdf|xlink))[:\w-]*\s*=\s*("[^"]*"|'[^']*')/gi, '');
    s = s.replace(/\s(?:id|class|data-[\w-]+|style)\s*=\s*("[^"]*"|'[^']*')/gi, function (m) { return /^\s(?:id|class|data-)/i.test(m) ? '' : m; });
    var openTag = /<svg\b[^>]*>/i.exec(s)[0];
    var tag = openTag;
    var hadVb = /viewBox\s*=/i.test(tag);
    if (!hadVb) {
      var w = /\swidth\s*=\s*["']\s*([0-9.]+)/i.exec(tag);
      var h = /\sheight\s*=\s*["']\s*([0-9.]+)/i.exec(tag);
      if (w && h) {
        tag = tag.replace(/<svg/i, '<svg viewBox="0 0 ' + w[1] + ' ' + h[1] + '"');
        avvisi.push('Aggiunto il viewBox (' + w[1] + ' × ' + h[1] + '), così l\'icona si ridimensiona.');
      } else {
        avvisi.push('Manca il viewBox e non riesco a ricavarlo: l\'icona potrebbe non ridimensionarsi.');
      }
    }
    if (opt.size) {
      tag = tag.replace(/\s(?:width|height)\s*=\s*("[^"]*"|'[^']*')/gi, '');
      tag = tag.replace(/<svg/i, '<svg width="' + opt.size + '" height="' + opt.size + '"');
    } else if (hadVb) {
      tag = tag.replace(/\s(?:width|height)\s*=\s*("[^"]*"|'[^']*')/gi, '');
    }
    if (!/\saria-(?:hidden|label)/i.test(tag) && !/\srole=/i.test(tag)) tag = tag.replace(/<svg/i, '<svg aria-hidden="true" focusable="false"');
    s = s.replace(openTag, tag);
    if (opt.currentColor !== false) {
      var n = 0;
      s = s.replace(/\b(fill|stroke)\s*=\s*"(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]*\)|black|white|red|green|blue|gray|grey)"/g, function (m, k) {
        n += 1;
        return k + '="currentColor"';
      });
      if (n) avvisi.push('Colori fissi sostituiti con currentColor (' + n + ').');
    }
    s = s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
    return { svg: s, avvisi: avvisi };
  }

  return {
    icone: icone,
    svgInline: svgInline,
    symbol: symbol,
    sprite: sprite,
    useTag: useTag,
    standalone: standalone,
    dataUri: dataUri,
    cssMask: cssMask,
    cleanSvg: cleanSvg
  };
});
