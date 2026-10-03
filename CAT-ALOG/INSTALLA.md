# Installare CAT-ALOG su Windows

Tempo: circa 10 minuti la prima volta (serve internet). Spazio: circa 600 MB.

## 1. Node.js (una volta sola)

1. Vai su https://nodejs.org e scarica la versione **LTS** (20 o più nuova).
2. Installa con le scelte predefinite e **riavvia il terminale** se era già aperto.
3. Controlla: apri PowerShell ed esegui `node --version`. Deve rispondere un numero come `v22.x`.

## 2. Scarica l'app

Scegli **una** delle due strade.

**A. Con Git**

    git clone --branch claude/sweet-newton-uovnqp https://github.com/marcodolce904-boop/vanta-singularity.git

**B. Senza Git**

1. Apri il repository `vanta-singularity` su GitHub e scegli il branch `claude/sweet-newton-uovnqp`.
2. **Code → Download ZIP**, poi estrai lo ZIP dove vuoi (per esempio `C:\Programmi-miei\`).

In entrambi i casi la cartella dell'app è **`CAT-ALOG`** dentro il repository.

## 3. Primo avvio

**Metodo facile:** apri la cartella `CAT-ALOG` e fai doppio clic su **`AVVIA.bat`**.
La prima volta installa i componenti (1-3 minuti), poi apre la finestra. Le volte dopo la apre subito.

**Metodo con il terminale** (se preferisci vedere cosa succede):

1. Nella cartella `CAT-ALOG` clicca sulla barra dell'indirizzo di Esplora file, scrivi `powershell` e premi Invio.
2. Esegui `npm install` e aspetta (1-3 minuti, scarica Electron).
3. Esegui `npm start`.

Cosa devi vedere: si apre la finestra **CAT-ALOG** con il gatto Maneki-neko e il titolo al centro. Alla prima apertura l'app crea la cartella **`Documenti\Catalogo MD`** con circa 170 esempi già pronti.

## 4. Scegliere l'aspetto

**Impostazioni → Aspetto**: Classico, Gatti o Gatti scuro. Resta salvato.

## 5. Provarla

Segui `PROVA.md` (31 passi, ognuno con quello che devi vedere).

## 6. Aggiornare l'app quando ci sono novità

- Con Git: nella cartella del repository `git pull`, poi nella cartella `CAT-ALOG` `npm install` (solo se `package.json` è cambiato).
- Senza Git: riscarica lo ZIP del branch e sostituisci la cartella `CAT-ALOG` (i tuoi dati sono altrove, in `Documenti\Catalogo MD`, e non si toccano).

Prima di aggiornare, per sicurezza: **Impostazioni → Crea backup ZIP…**

## 7. Creare l'installer (.exe) — facoltativo, non provato

1. Nella cartella `CAT-ALOG` esegui `npm run dist:win`.
2. Cerca il file in `CAT-ALOG\dist\` (qualcosa come `CAT-ALOG Setup 1.0.0.exe`) e avvialo.
3. Windows può mostrare «SmartScreen ha protetto il PC» perché l'installer non è firmato: **Maggiori informazioni → Esegui comunque**.

Non ho mai potuto eseguire questo passo in questo ambiente: la prima volta può servire qualche aggiustamento. Se si blocca, copiami l'errore.

## Se qualcosa non va

| Cosa vedi | Cosa fare |
| --- | --- |
| `npm non è riconosciuto` | Chiudi e riapri il terminale dopo aver installato Node.js; se persiste, riavvia il PC. |
| `AVVIA.bat` dice «Node.js non trovato» | Installa Node.js (passo 1). |
| `npm install` si ferma sul download di Electron | Controlla la connessione, l'antivirus o il proxy aziendale; riprova. |
| La finestra non si apre e non c'è errore | Esegui `npm start` dal terminale e copiami il messaggio. |
| «Apri in VS Code» apre solo la cartella | In VS Code: Ctrl+Maiusc+P → «Shell Command: Install \'code\' command in PATH», poi riprova. |
| I dati sembrano spariti | Sono in `Documenti\Catalogo MD`: **Impostazioni → Apri la cartella**. |

## Disinstallare

Cancella la cartella `CAT-ALOG`. I tuoi dati restano in `Documenti\Catalogo MD` finché non li cancelli tu.
