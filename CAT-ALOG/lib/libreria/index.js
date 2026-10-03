'use strict';

/*
 * Libreria di esempio. Si installa nell'app una volta sola per versione:
 * le voci già presenti (stesso nome) non si toccano, quelle che elimini non tornano.
 * Quando aggiungo voci nuove alzo VERSIONE e arrivano alla prossima apertura.
 */

module.exports = {
  VERSIONE: 5,
  strutture: require('./strutture').concat(require('./strutture2'), require('./griglia')),
  componenti: require('./componenti').concat(require('./componenti2'), require('./componenti3'), require('./componenti4'), require('./componenti5')),
  animazioni: require('./animazioni').concat(require('./animazioni2')),
  classi: require('../griglia').gruppiClassi(),
  /* pagine di esempio: ogni sezione è [tipo, nome dell'elemento] */
  pagine: [
    {
      nome: 'Pagina vetrina (esempio)',
      titolo: 'Studio Esempio · Grafica e siti web',
      descrizione: 'Pagina di esempio costruita mettendo in fila strutture e componenti del catalogo.',
      includi: { root: true, classi: true, responsive: false },
      sezioni: [
        ['strutture', 'Header logo, menu e pulsante'],
        ['strutture', 'Hero con gradiente e badge'],
        ['strutture', 'Griglia di feature con icona'],
        ['strutture', 'Testimonianze'],
        ['strutture', 'Banda call to action'],
        ['strutture', 'Footer minimale']
      ]
    },
    {
      nome: 'Schermata app (esempio)',
      titolo: 'App di esempio',
      descrizione: 'Schermata per telefono: barra in alto, impostazioni e barra di acquisto fissa.',
      includi: { root: true, classi: true, responsive: false },
      sezioni: [
        ['componenti', 'Mobile: barra in alto (app bar)'],
        ['componenti', 'Mobile: elenco impostazioni (stile iOS)'],
        ['componenti', 'Mobile: barra di azione fissa in basso']
      ]
    }
  ],
  interazioni: require('./interazioni').concat(require('./interazioni2'))
};
