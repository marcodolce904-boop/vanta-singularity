(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoTypography = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Coppie di font (titoli + testo). Quelle senza «google» usano solo font già presenti nel sistema.
   * Per le altre, `google` è l'indirizzo del foglio di stile da mettere nel <head>
   * (serve connessione; i font di riserva dello stack valgono se manca).
   */

  var SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  var SERIF = 'Georgia, "Times New Roman", Times, serif';
  var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  function g(families) {
    return 'https://fonts.googleapis.com/css2?' + families.map(function (f) { return 'family=' + f; }).join('&') + '&display=swap';
  }

  var coppie = [
    { id: 'sistema', nome: 'Sistema moderno', descrizione: 'Il font del sistema operativo: veloce, nitido, niente da scaricare.', titoli: SANS, testo: SANS },
    { id: 'editoriale', nome: 'Editoriale', descrizione: 'Titoli con le grazie e testo senza: aspetto da rivista, tutto di sistema.', titoli: SERIF, testo: SANS },
    { id: 'libro', nome: 'Da libro', descrizione: 'Solo font con le grazie: per testi lunghi da leggere.', titoli: SERIF, testo: SERIF },
    { id: 'tecnico', nome: 'Tecnico', descrizione: 'Titoli a spaziatura fissa (stile codice) e testo senza grazie.', titoli: MONO, testo: SANS },
    { id: 'inter', nome: 'Inter', descrizione: 'Pulito e neutro, ottimo per interfacce e dashboard.', titoli: '"Inter", ' + SANS, testo: '"Inter", ' + SANS, google: g(['Inter:wght@400;600;700']) },
    { id: 'playfair-source', nome: 'Playfair Display + Source Sans 3', descrizione: 'Eleganza classica per titoli, testo leggibile.', titoli: '"Playfair Display", ' + SERIF, testo: '"Source Sans 3", ' + SANS, google: g(['Playfair+Display:wght@600;700', 'Source+Sans+3:wght@400;600']) },
    { id: 'dm-serif-sans', nome: 'DM Serif Display + DM Sans', descrizione: 'Moderno e caldo: studi creativi, portfolio.', titoli: '"DM Serif Display", ' + SERIF, testo: '"DM Sans", ' + SANS, google: g(['DM+Serif+Display', 'DM+Sans:wght@400;500;700']) },
    { id: 'space-inter', nome: 'Space Grotesk + Inter', descrizione: 'Un tocco tecnologico nei titoli, testo neutro.', titoli: '"Space Grotesk", ' + SANS, testo: '"Inter", ' + SANS, google: g(['Space+Grotesk:wght@500;700', 'Inter:wght@400;600']) },
    { id: 'montserrat-merri', nome: 'Montserrat + Merriweather', descrizione: 'Titoli geometrici e testo con le grazie.', titoli: '"Montserrat", ' + SANS, testo: '"Merriweather", ' + SERIF, google: g(['Montserrat:wght@600;800', 'Merriweather:wght@400;700']) },
    { id: 'poppins-lato', nome: 'Poppins + Lato', descrizione: 'Amichevole e rotondo, per siti di servizi.', titoli: '"Poppins", ' + SANS, testo: '"Lato", ' + SANS, google: g(['Poppins:wght@600;700', 'Lato:wght@400;700']) },
    { id: 'fraunces-inter', nome: 'Fraunces + Inter', descrizione: 'Titoli con carattere morbido e un po\' vintage.', titoli: '"Fraunces", ' + SERIF, testo: '"Inter", ' + SANS, google: g(['Fraunces:wght@600;800', 'Inter:wght@400;600']) },
    { id: 'baloo-nunito', nome: 'Baloo 2 + Nunito', descrizione: 'Tondo e giocoso: perfetto per un tema gatti, bambini, app leggere.', titoli: '"Baloo 2", ' + SANS, testo: '"Nunito", ' + SANS, google: g(['Baloo+2:wght@600;800', 'Nunito:wght@400;600;700']) },
    { id: 'lora-roboto', nome: 'Lora + Roboto', descrizione: 'Blog e articoli: titoli leggibili con le grazie.', titoli: '"Lora", ' + SERIF, testo: '"Roboto", ' + SANS, google: g(['Lora:wght@600;700', 'Roboto:wght@400;500']) },
    { id: 'jetbrains-inter', nome: 'JetBrains Mono + Inter', descrizione: 'Documentazione e strumenti per sviluppatori.', titoli: '"JetBrains Mono", ' + MONO, testo: '"Inter", ' + SANS, google: g(['JetBrains+Mono:wght@600;700', 'Inter:wght@400;600']) }
  ];

  return { coppie: coppie, SANS: SANS, SERIF: SERIF, MONO: MONO };
});
