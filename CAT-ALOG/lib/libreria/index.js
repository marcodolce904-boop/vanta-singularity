'use strict';

/*
 * Libreria di esempio. Si installa nell'app una volta sola per versione:
 * le voci già presenti (stesso nome) non si toccano, quelle che elimini non tornano.
 * Quando aggiungo voci nuove alzo VERSIONE e arrivano alla prossima apertura.
 */

module.exports = {
  VERSIONE: 4,
  strutture: require('./strutture').concat(require('./strutture2'), require('./griglia')),
  componenti: require('./componenti').concat(require('./componenti2'), require('./componenti3'), require('./componenti4'), require('./componenti5')),
  animazioni: require('./animazioni').concat(require('./animazioni2')),
  classi: require('../griglia').gruppiClassi(),
  interazioni: require('./interazioni').concat(require('./interazioni2'))
};
