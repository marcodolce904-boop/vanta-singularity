(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogoTesti = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Microcopy riusabile in italiano e in inglese: pulsanti, errori, stati vuoti, conferme, ecc.
   * Ogni voce: [chiave, italiano, inglese, nota]. La chiave serve per esportare i file di traduzione (it.json / en.json).
   */

  function g(id, nome, righe) {
    return {
      id: id,
      nome: nome,
      voci: righe.map(function (r) { return { chiave: id + '.' + r[0], it: r[1], en: r[2], nota: r[3] || '' }; })
    };
  }

  var gruppi = [
    g('azioni', 'Pulsanti e azioni', [
      ['invia', 'Invia', 'Send', 'Verbo breve; meglio di «Submit».'],
      ['salva', 'Salva', 'Save'],
      ['salva_modifiche', 'Salva le modifiche', 'Save changes'],
      ['annulla', 'Annulla', 'Cancel'],
      ['conferma', 'Conferma', 'Confirm'],
      ['continua', 'Continua', 'Continue'],
      ['indietro', 'Indietro', 'Back'],
      ['avanti', 'Avanti', 'Next'],
      ['chiudi', 'Chiudi', 'Close'],
      ['elimina', 'Elimina', 'Delete', 'Azione distruttiva: chiedi conferma.'],
      ['modifica', 'Modifica', 'Edit'],
      ['aggiungi', 'Aggiungi', 'Add'],
      ['copia', 'Copia', 'Copy'],
      ['scarica', 'Scarica', 'Download'],
      ['carica_file', 'Carica un file', 'Upload a file'],
      ['condividi', 'Condividi', 'Share'],
      ['cerca', 'Cerca', 'Search'],
      ['filtra', 'Filtra', 'Filter'],
      ['ordina', 'Ordina', 'Sort'],
      ['ricarica', 'Riprova', 'Try again']
    ]),
    g('cta', 'Inviti all\'azione (CTA)', [
      ['inizia', 'Inizia ora', 'Get started'],
      ['prova_gratis', 'Prova gratis', 'Try it free'],
      ['scopri', 'Scopri di più', 'Learn more'],
      ['contattaci', 'Contattaci', 'Contact us'],
      ['preventivo', 'Richiedi un preventivo', 'Request a quote'],
      ['prenota', 'Prenota ora', 'Book now'],
      ['acquista', 'Acquista ora', 'Buy now'],
      ['aggiungi_carrello', 'Aggiungi al carrello', 'Add to cart'],
      ['iscriviti', 'Iscriviti', 'Subscribe'],
      ['registrati', 'Crea un account', 'Create an account'],
      ['demo', 'Guarda la demo', 'Watch the demo'],
      ['vedi_tutti', 'Vedi tutti', 'See all'],
      ['leggi', 'Leggi l\'articolo', 'Read the article'],
      ['parla', 'Parliamone', 'Let\'s talk']
    ]),
    g('account', 'Accesso e account', [
      ['accedi', 'Accedi', 'Log in'],
      ['esci', 'Esci', 'Log out'],
      ['registrati', 'Registrati', 'Sign up'],
      ['email', 'Indirizzo email', 'Email address'],
      ['password', 'Password', 'Password'],
      ['conferma_password', 'Ripeti la password', 'Confirm password'],
      ['dimenticata', 'Password dimenticata?', 'Forgot your password?'],
      ['reimposta', 'Reimposta la password', 'Reset password'],
      ['ricordami', 'Ricordami su questo dispositivo', 'Remember me on this device'],
      ['accedi_con', 'Oppure accedi con', 'Or log in with'],
      ['nessun_account', 'Non hai un account?', 'Don\'t have an account?'],
      ['hai_account', 'Hai già un account?', 'Already have an account?'],
      ['profilo', 'Il mio profilo', 'My profile']
    ]),
    g('errori_form', 'Errori nei moduli', [
      ['obbligatorio', 'Questo campo è obbligatorio.', 'This field is required.'],
      ['email_non_valida', 'Inserisci un indirizzo email valido.', 'Enter a valid email address.'],
      ['password_corta', 'La password deve avere almeno 8 caratteri.', 'The password must be at least 8 characters.'],
      ['password_diverse', 'Le password non coincidono.', 'The passwords don\'t match.'],
      ['telefono', 'Inserisci un numero di telefono valido.', 'Enter a valid phone number.'],
      ['troppo_lungo', 'Il testo è troppo lungo (massimo {max} caratteri).', 'The text is too long (max {max} characters).', '{max} è un segnaposto.'],
      ['file_pesante', 'Il file è troppo grande (massimo {max}).', 'The file is too large (max {max}).'],
      ['file_tipo', 'Questo tipo di file non è supportato.', 'This file type isn\'t supported.'],
      ['privacy', 'Devi accettare l\'informativa sulla privacy per continuare.', 'You must accept the privacy policy to continue.'],
      ['correggi', 'Controlla i campi evidenziati e riprova.', 'Check the highlighted fields and try again.']
    ]),
    g('errori', 'Errori e problemi', [
      ['generico', 'Qualcosa è andato storto. Riprova tra un attimo.', 'Something went wrong. Please try again in a moment.'],
      ['connessione', 'Non riesco a collegarmi. Controlla la connessione.', 'We can\'t connect. Check your internet connection.'],
      ['non_trovata', 'Pagina non trovata', 'Page not found'],
      ['non_trovata_testo', 'L\'indirizzo non esiste più o è stato spostato.', 'The address no longer exists or has moved.'],
      ['permesso', 'Non hai il permesso di vedere questa pagina.', 'You don\'t have permission to view this page.'],
      ['sessione', 'La sessione è scaduta. Accedi di nuovo.', 'Your session has expired. Please log in again.'],
      ['manutenzione', 'Stiamo facendo manutenzione. Torniamo presto.', 'We\'re doing maintenance. We\'ll be back soon.'],
      ['server', 'Errore del server. Il problema è nostro, non tuo.', 'Server error. It\'s on us, not you.'],
      ['non_salvato', 'Non siamo riusciti a salvare. Le tue modifiche sono ancora qui.', 'We couldn\'t save. Your changes are still here.']
    ]),
    g('successo', 'Conferme e successo', [
      ['salvato', 'Salvato', 'Saved'],
      ['inviato', 'Messaggio inviato. Ti rispondiamo entro un giorno lavorativo.', 'Message sent. We\'ll reply within one business day.'],
      ['iscritto', 'Iscrizione completata. Controlla la tua email.', 'You\'re subscribed. Check your email.'],
      ['copiato', 'Copiato negli appunti', 'Copied to clipboard'],
      ['eliminato', 'Elemento eliminato', 'Item deleted'],
      ['annulla_azione', 'Annulla', 'Undo'],
      ['aggiornato', 'Aggiornato', 'Updated'],
      ['ordine_ok', 'Grazie! Il tuo ordine è stato ricevuto.', 'Thank you! We\'ve received your order.'],
      ['benvenuto', 'Benvenuto a bordo!', 'Welcome aboard!']
    ]),
    g('conferme', 'Finestre di conferma', [
      ['eliminare_titolo', 'Eliminare questo elemento?', 'Delete this item?'],
      ['eliminare_testo', 'Non potrai più recuperarlo.', 'You won\'t be able to get it back.'],
      ['uscire_titolo', 'Uscire senza salvare?', 'Leave without saving?'],
      ['uscire_testo', 'Le modifiche non salvate andranno perse.', 'Unsaved changes will be lost.'],
      ['resta', 'Resta qui', 'Stay here'],
      ['esci_senza', 'Esci senza salvare', 'Leave without saving'],
      ['sicuro', 'Sei sicuro?', 'Are you sure?'],
      ['irreversibile', 'Questa azione non si può annullare.', 'This can\'t be undone.']
    ]),
    g('vuoto', 'Stati vuoti', [
      ['nessun_risultato', 'Nessun risultato', 'No results'],
      ['nessun_risultato_testo', 'Prova con altre parole o togli qualche filtro.', 'Try different keywords or remove some filters.'],
      ['nessun_messaggio', 'Nessun messaggio', 'No messages'],
      ['carrello_vuoto', 'Il carrello è vuoto', 'Your cart is empty'],
      ['carrello_vuoto_testo', 'Aggiungi qualcosa per cominciare.', 'Add something to get started.'],
      ['nessuna_notifica', 'Sei in pari: nessuna notifica.', 'You\'re all caught up: no notifications.'],
      ['ancora_nulla', 'Ancora niente qui', 'Nothing here yet'],
      ['crea_primo', 'Crea il tuo primo elemento', 'Create your first item']
    ]),
    g('caricamento', 'Caricamento e attesa', [
      ['caricamento', 'Caricamento…', 'Loading…'],
      ['salvataggio', 'Salvataggio in corso…', 'Saving…'],
      ['invio', 'Invio in corso…', 'Sending…'],
      ['un_attimo', 'Un attimo…', 'One moment…'],
      ['quasi', 'Ci siamo quasi', 'Almost there'],
      ['carica_altro', 'Carica altri', 'Load more']
    ]),
    g('navigazione', 'Navigazione e struttura', [
      ['home', 'Home', 'Home'],
      ['chi_siamo', 'Chi siamo', 'About us'],
      ['servizi', 'Servizi', 'Services'],
      ['prodotti', 'Prodotti', 'Products'],
      ['portfolio', 'Portfolio', 'Portfolio'],
      ['blog', 'Blog', 'Blog'],
      ['prezzi', 'Prezzi', 'Pricing'],
      ['faq', 'Domande frequenti', 'FAQ'],
      ['contatti', 'Contatti', 'Contact'],
      ['salta', 'Vai al contenuto', 'Skip to content', 'Link nascosto per chi usa la tastiera.'],
      ['menu', 'Menu', 'Menu'],
      ['apri_menu', 'Apri il menu', 'Open menu'],
      ['chiudi_menu', 'Chiudi il menu', 'Close menu'],
      ['pagina_x_di_y', 'Pagina {x} di {y}', 'Page {x} of {y}'],
      ['torna_su', 'Torna su', 'Back to top']
    ]),
    g('footer', 'Footer, privacy e cookie', [
      ['copyright', '© {anno} {nome}. Tutti i diritti riservati.', '© {anno} {nome}. All rights reserved.'],
      ['privacy', 'Privacy', 'Privacy'],
      ['cookie', 'Cookie', 'Cookies'],
      ['termini', 'Termini e condizioni', 'Terms and conditions'],
      ['cookie_banner', 'Usiamo cookie tecnici e, se vuoi, statistici per migliorare il sito.', 'We use essential cookies and, if you agree, analytics cookies to improve the site.'],
      ['accetta', 'Accetta', 'Accept'],
      ['rifiuta', 'Rifiuta', 'Reject'],
      ['personalizza', 'Personalizza', 'Customize'],
      ['piva', 'P. IVA {numero}', 'VAT no. {numero}'],
      ['seguici', 'Seguici', 'Follow us']
    ]),
    g('newsletter', 'Newsletter e contatti', [
      ['titolo', 'Resta aggiornato', 'Stay in the loop'],
      ['testo', 'Una email al mese, niente spam. Puoi disiscriverti quando vuoi.', 'One email a month, no spam. Unsubscribe anytime.'],
      ['placeholder', 'tu@esempio.it', 'you@example.com'],
      ['nome', 'Nome e cognome', 'Full name'],
      ['messaggio', 'Il tuo messaggio', 'Your message'],
      ['telefono', 'Telefono (facoltativo)', 'Phone (optional)'],
      ['orari', 'Lun-Ven · 9:00-18:00', 'Mon-Fri · 9am-6pm'],
      ['risposta', 'Rispondiamo entro un giorno lavorativo.', 'We reply within one business day.']
    ]),
    g('shop', 'Negozio e prezzi', [
      ['prezzo', 'Prezzo', 'Price'],
      ['sconto', 'Risparmi {importo}', 'You save {importo}'],
      ['disponibile', 'Disponibile', 'In stock'],
      ['esaurito', 'Esaurito', 'Out of stock'],
      ['ultimi', 'Ultimi {n} pezzi', 'Only {n} left'],
      ['spedizione', 'Spedizione gratuita sopra {importo}', 'Free shipping over {importo}'],
      ['al_mese', '{importo} al mese', '{importo} per month'],
      ['iva', 'IVA inclusa', 'VAT included'],
      ['vai_cassa', 'Vai alla cassa', 'Go to checkout'],
      ['codice_sconto', 'Hai un codice sconto?', 'Have a promo code?'],
      ['totale', 'Totale', 'Total'],
      ['recensioni', '{n} recensioni', '{n} reviews']
    ]),
    g('accessibilita', 'Accessibilità (etichette per screen reader)', [
      ['apri_nuova', 'si apre in una nuova scheda', 'opens in a new tab'],
      ['chiudi_finestra', 'Chiudi la finestra', 'Close dialog'],
      ['campo_obbligatorio', 'campo obbligatorio', 'required field'],
      ['immagine_decorativa', '', '', 'Immagine decorativa: alt="" (vuoto).'],
      ['pagina_corrente', 'pagina corrente', 'current page'],
      ['mostra_password', 'Mostra la password', 'Show password'],
      ['nascondi_password', 'Nascondi la password', 'Hide password'],
      ['precedente', 'Precedente', 'Previous'],
      ['successivo', 'Successivo', 'Next'],
      ['caricamento_sr', 'Caricamento in corso', 'Loading']
    ])
  ];

  function lista() {
    var out = [];
    gruppi.forEach(function (gr) { gr.voci.forEach(function (v) { out.push({ gruppo: gr, voce: v }); }); });
    return out;
  }

  /* File di traduzione annidato: { azioni: { invia: "Invia" } } per la lingua richiesta. */
  function buildJson(lang, gruppoIds) {
    var sel = Array.isArray(gruppoIds) ? gruppoIds : null;
    var out = {};
    gruppi.forEach(function (gr) {
      if (sel && sel.indexOf(gr.id) === -1) return;
      out[gr.id] = {};
      gr.voci.forEach(function (v) {
        var k = v.chiave.slice(gr.id.length + 1);
        if (v[lang] !== '' && v[lang] != null) out[gr.id][k] = v[lang];
      });
    });
    return JSON.stringify(out, null, 2) + '\n';
  }

  return { gruppi: gruppi, lista: lista, buildJson: buildJson };
});
