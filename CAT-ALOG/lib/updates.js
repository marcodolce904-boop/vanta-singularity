'use strict';

/*
 * Aggiornamenti automatici (solo nell'app installata): controlla le nuove versioni su GitHub Releases,
 * le scarica da sola e le installa alla chiusura, oppure subito se premi «Riavvia e aggiorna».
 * I tuoi dati (cartella «Catalogo MD») non si toccano: l'aggiornamento cambia solo il programma.
 */

const CONTROLLO_OGNI_MS = 4 * 60 * 60 * 1000;

function setupUpdates(deps) {
  const app = deps.app;
  const dialog = deps.dialog;
  if (!app.isPackaged || process.env.CAT_NO_UPDATE === '1') return null;

  let autoUpdater;
  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (e) {
    return null;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = null;

  autoUpdater.on('update-downloaded', function (info) {
    const win = deps.getWindow();
    const scelta = dialog.showMessageBoxSync(win || undefined, {
      type: 'info',
      buttons: ['Riavvia e aggiorna', 'Più tardi'],
      defaultId: 0,
      cancelId: 1,
      message: 'È pronta la versione ' + info.version + ' di CAT-ALOG.',
      detail: 'Se scegli «Più tardi» si installa da sola alla chiusura dell\'app. I tuoi dati non cambiano.'
    });
    if (scelta === 0) autoUpdater.quitAndInstall();
  });

  /* senza rete o senza release non è un problema: riprova al prossimo giro */
  autoUpdater.on('error', function () {});

  function check() {
    autoUpdater.checkForUpdates().catch(function () {});
  }
  check();
  const timer = setInterval(check, CONTROLLO_OGNI_MS);
  if (timer.unref) timer.unref();
  return { check: check };
}

module.exports = { setupUpdates, CONTROLLO_OGNI_MS };
