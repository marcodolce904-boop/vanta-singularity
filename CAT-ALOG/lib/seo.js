(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoSeo = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VALORI_BASE = {
    lingua: 'it',
    titolo: '',
    descrizione: '',
    url: '',
    immagine: '',
    nomeSito: '',
    autore: '',
    themeColor: '#111111',
    tipoOg: 'website',
    twitter: '',
    robots: 'index, follow',
    favicon: true,
    ldTipo: 'nessuno',
    ldNome: '',
    ldLogo: '',
    ldTelefono: '',
    ldEmail: '',
    ldIndirizzo: '',
    ldSocial: '',
    ldData: '',
    ldPrezzo: '',
    ldValuta: 'EUR'
  };

  var LD_TIPI = [
    { id: 'nessuno', label: 'Nessuno' },
    { id: 'Organization', label: 'Organizzazione' },
    { id: 'WebSite', label: 'Sito web' },
    { id: 'LocalBusiness', label: 'Attività locale' },
    { id: 'Article', label: 'Articolo' },
    { id: 'Product', label: 'Prodotto' }
  ];

  function str(v) {
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  }

  function esc(t) {
    return str(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function normalize(v) {
    var out = {};
    Object.keys(VALORI_BASE).forEach(function (k) {
      var def = VALORI_BASE[k];
      out[k] = typeof def === 'boolean' ? !!(v && v[k] !== undefined ? v[k] : def) : str(v && v[k] !== undefined ? v[k] : def);
    });
    if (['website', 'article', 'product', 'profile'].indexOf(out.tipoOg) === -1) out.tipoOg = 'website';
    if (!LD_TIPI.some(function (t) { return t.id === out.ldTipo; })) out.ldTipo = 'nessuno';
    return out;
  }

  function lines(t) {
    return str(t).split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function jsonLd(v) {
    var o = null;
    var nome = v.ldNome || v.nomeSito || v.titolo;
    var base = { '@context': 'https://schema.org' };
    if (v.ldTipo === 'Organization' || v.ldTipo === 'LocalBusiness') {
      o = Object.assign({}, base, { '@type': v.ldTipo, name: nome });
      if (v.url) o.url = v.url;
      if (v.ldLogo) o.logo = v.ldLogo;
      if (v.ldTelefono) o.telephone = v.ldTelefono;
      if (v.ldEmail) o.email = v.ldEmail;
      if (v.ldIndirizzo) o.address = { '@type': 'PostalAddress', streetAddress: v.ldIndirizzo };
      if (lines(v.ldSocial).length) o.sameAs = lines(v.ldSocial);
      if (v.descrizione) o.description = v.descrizione;
    } else if (v.ldTipo === 'WebSite') {
      o = Object.assign({}, base, { '@type': 'WebSite', name: nome });
      if (v.url) o.url = v.url;
      if (v.descrizione) o.description = v.descrizione;
      if (v.lingua) o.inLanguage = v.lingua;
    } else if (v.ldTipo === 'Article') {
      o = Object.assign({}, base, { '@type': 'Article', headline: v.titolo || nome });
      if (v.immagine) o.image = [v.immagine];
      if (v.ldData) o.datePublished = v.ldData;
      if (v.autore) o.author = { '@type': 'Person', name: v.autore };
      if (v.nomeSito) o.publisher = { '@type': 'Organization', name: v.nomeSito };
      if (v.descrizione) o.description = v.descrizione;
    } else if (v.ldTipo === 'Product') {
      o = Object.assign({}, base, { '@type': 'Product', name: nome });
      if (v.descrizione) o.description = v.descrizione;
      if (v.immagine) o.image = [v.immagine];
      if (v.ldPrezzo) o.offers = { '@type': 'Offer', price: v.ldPrezzo, priceCurrency: v.ldValuta || 'EUR', availability: 'https://schema.org/InStock' };
    }
    return o ? JSON.stringify(o, null, 2).replace(/</g, '\\u003c') : '';
  }

  /* Blocco <head> completo, pronto da incollare. */
  function buildHead(values) {
    var v = normalize(values);
    var out = [];
    out.push('<meta charset="utf-8">');
    out.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
    out.push('<title>' + esc(v.titolo) + '</title>');
    if (v.descrizione) out.push('<meta name="description" content="' + esc(v.descrizione) + '">');
    if (v.url) out.push('<link rel="canonical" href="' + esc(v.url) + '">');
    if (v.robots) out.push('<meta name="robots" content="' + esc(v.robots) + '">');
    if (v.autore) out.push('<meta name="author" content="' + esc(v.autore) + '">');
    if (v.themeColor) out.push('<meta name="theme-color" content="' + esc(v.themeColor) + '">');
    if (v.favicon) {
      out.push('');
      out.push('<link rel="icon" href="/favicon.ico" sizes="32x32">');
      out.push('<link rel="icon" href="/icon.svg" type="image/svg+xml">');
      out.push('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
      out.push('<link rel="manifest" href="/site.webmanifest">');
    }
    out.push('');
    out.push('<!-- Open Graph (Facebook, LinkedIn, WhatsApp, Telegram…) -->');
    out.push('<meta property="og:type" content="' + esc(v.tipoOg) + '">');
    if (v.nomeSito) out.push('<meta property="og:site_name" content="' + esc(v.nomeSito) + '">');
    out.push('<meta property="og:title" content="' + esc(v.titolo) + '">');
    if (v.descrizione) out.push('<meta property="og:description" content="' + esc(v.descrizione) + '">');
    if (v.url) out.push('<meta property="og:url" content="' + esc(v.url) + '">');
    if (v.immagine) {
      out.push('<meta property="og:image" content="' + esc(v.immagine) + '">');
      out.push('<meta property="og:image:width" content="1200">');
      out.push('<meta property="og:image:height" content="630">');
    }
    if (v.lingua) out.push('<meta property="og:locale" content="' + esc(v.lingua.length === 2 ? v.lingua + '_' + v.lingua.toUpperCase() : v.lingua.replace('-', '_')) + '">');
    out.push('');
    out.push('<!-- Twitter / X -->');
    out.push('<meta name="twitter:card" content="' + (v.immagine ? 'summary_large_image' : 'summary') + '">');
    if (v.twitter) out.push('<meta name="twitter:site" content="' + esc(v.twitter.charAt(0) === '@' ? v.twitter : '@' + v.twitter) + '">');
    out.push('<meta name="twitter:title" content="' + esc(v.titolo) + '">');
    if (v.descrizione) out.push('<meta name="twitter:description" content="' + esc(v.descrizione) + '">');
    if (v.immagine) out.push('<meta name="twitter:image" content="' + esc(v.immagine) + '">');
    var ld = jsonLd(v);
    if (ld) {
      out.push('');
      out.push('<!-- Dati strutturati (Google) -->');
      out.push('<script type="application/ld+json">\n' + ld + '\n</script>');
    }
    return out.join('\n') + '\n';
  }

  /* Il tag <html> con la lingua, da ricordare. */
  function htmlTag(values) {
    var v = normalize(values);
    return '<html lang="' + esc(v.lingua || 'it') + '">';
  }

  /* Controlli: { id, stato: 'ok' | 'avviso' | 'errore', titolo, dettaglio } */
  function checks(values) {
    var v = normalize(values);
    var res = [];
    function add(id, stato, titolo, dettaglio) { res.push({ id: id, stato: stato, titolo: titolo, dettaglio: dettaglio || '' }); }
    var t = v.titolo.trim().length;
    if (!t) add('titolo', 'errore', 'Titolo della pagina', 'Manca: è la cosa più importante per Google e per le schede condivise.');
    else if (t < 30) add('titolo', 'avviso', 'Titolo della pagina', t + ' caratteri: un po\' corto (meglio 30-60).');
    else if (t > 60) add('titolo', 'avviso', 'Titolo della pagina', t + ' caratteri: Google lo taglia oltre i 60 circa.');
    else add('titolo', 'ok', 'Titolo della pagina', t + ' caratteri.');
    var d = v.descrizione.trim().length;
    if (!d) add('descrizione', 'avviso', 'Descrizione', 'Manca: Google ne sceglie una da solo e di solito è peggiore.');
    else if (d < 70) add('descrizione', 'avviso', 'Descrizione', d + ' caratteri: corta (meglio 70-160).');
    else if (d > 160) add('descrizione', 'avviso', 'Descrizione', d + ' caratteri: oltre i 160 viene tagliata.');
    else add('descrizione', 'ok', 'Descrizione', d + ' caratteri.');
    if (!v.url) add('url', 'avviso', 'Indirizzo canonico', 'Manca: serve per evitare pagine duplicate.');
    else if (!/^https:\/\//.test(v.url)) add('url', 'errore', 'Indirizzo canonico', 'Deve essere un indirizzo completo che comincia con https://');
    else add('url', 'ok', 'Indirizzo canonico');
    if (!v.immagine) add('immagine', 'avviso', 'Immagine di anteprima', 'Manca: senza, i social mostrano una scheda senza immagine (consigliata 1200×630).');
    else if (!/^https:\/\//.test(v.immagine)) add('immagine', 'errore', 'Immagine di anteprima', 'Deve essere un indirizzo completo https:// (non un percorso relativo).');
    else add('immagine', 'ok', 'Immagine di anteprima');
    if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(v.lingua)) add('lingua', 'errore', 'Lingua della pagina', 'Usa un codice come it, en o it-IT.');
    else add('lingua', 'ok', 'Lingua della pagina', 'Metti anche ' + '<html lang="' + v.lingua + '">.');
    if (v.themeColor && !/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v.themeColor)) add('colore', 'errore', 'Colore del tema', 'Scrivilo come #rrggbb.');
    if (/noindex/i.test(v.robots)) add('robots', 'avviso', 'Indicizzazione', 'noindex: la pagina non comparirà su Google.');
    if (v.ldTipo !== 'nessuno') {
      var nome = v.ldNome || v.nomeSito || v.titolo;
      if (!nome) add('ld', 'errore', 'Dati strutturati', 'Serve un nome.');
      else if (v.ldTipo === 'Article' && !v.ldData) add('ld', 'avviso', 'Dati strutturati', 'Per un articolo manca la data (AAAA-MM-GG).');
      else if (v.ldTipo === 'Product' && !v.ldPrezzo) add('ld', 'avviso', 'Dati strutturati', 'Per un prodotto manca il prezzo.');
      else add('ld', 'ok', 'Dati strutturati', v.ldTipo);
    }
    return res;
  }

  return { VALORI_BASE: VALORI_BASE, LD_TIPI: LD_TIPI, normalize: normalize, buildHead: buildHead, htmlTag: htmlTag, checks: checks, jsonLd: jsonLd };
});
