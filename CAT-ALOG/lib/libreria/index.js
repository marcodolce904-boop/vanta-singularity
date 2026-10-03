'use strict';

/*
 * Libreria di esempio. Si installa nell'app una volta sola per versione:
 * le voci già presenti (stesso nome) non si toccano, quelle che elimini non tornano.
 * Quando aggiungo voci nuove alzo VERSIONE e arrivano alla prossima apertura.
 */

module.exports = {
  VERSIONE: 1,
  strutture: require('./strutture'),
  componenti: require('./componenti'),
  animazioni: require('./animazioni'),
  interazioni: require('./interazioni')
};
