'use strict';

/*
 * Libreria di esempio. Si installa nell'app una volta sola per versione:
 * le voci già presenti (stesso nome) non si toccano, quelle che elimini non tornano.
 * Quando aggiungo voci nuove alzo VERSIONE e arrivano alla prossima apertura.
 */

module.exports = {
  VERSIONE: 2,
  strutture: require('./strutture').concat(require('./strutture2')),
  componenti: require('./componenti').concat(require('./componenti2')),
  animazioni: require('./animazioni').concat(require('./animazioni2')),
  interazioni: require('./interazioni').concat(require('./interazioni2'))
};
