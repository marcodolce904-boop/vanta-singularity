# CAT-ALOG: riassunto completo del lavoro svolto

> Scritto per riprendere il lavoro in una **chat locale** (Claude Code sul PC, cartella `C:\Users\xaide\Desktop\CAT-ALOG`).
> Data: 2026-10-05. Stato: 140 test automatici su 140 verdi. Cartella dati dell'utente: `Documenti\Catalogo MD` (mai toccata dagli aggiornamenti).
> Nota: tutto quello che è scritto qui è stato verificato nell'ambiente cloud (Node + jsdom + Chromium). **Non è stato provato sul PC Windows dell'utente**: vedi «Cosa NON è verificato».

---

## 1. Cos'è

**CAT-ALOG** è un'app desktop personale per Windows (Electron, JavaScript senza framework) derivata dal «Catalogo MD» v1.0 dell'utente. Serve a conservare e riusare **componenti per il web design** (HTML/CSS/JS), classi, variabili `:root`, pagine e kit di sito. Prefisso delle classi: **`cat-`**. Tema grafico a tema gatti con logo Maneki-neko (il logo/le icone verranno sostituiti dall'utente: `build/icon.png` 1024×1024, `build/icon-256.png`; il logo nell'interfaccia è un SVG). Titolo «CAT-ALOG» in **Montserrat Black**, centrato col logo.

L'utente lavora **a blocchi**, le prove le fa lui alla fine; vuole le istruzioni di prova/installazione scritte (`PROVA.md`, `INSTALLA.md`). Risponde in italiano; con il plugin «i-have-adhd» attivo le risposte seguono questo stile: prima riga = cosa funziona ora, passi numerati, tempi concreti, **una sola** prossima azione sotto i 2 minuti, niente preamboli, liste ≤ 5 voci.

## 2. Come si avvia (Windows)

- `AVVIA.bat`: controlla Node.js, la prima volta fa `npm install`, poi `npm start`.
- `AGGIORNA.bat`: fa `git pull` e poi avvia (serve solo se si usa ancora un repository Git: l'utente ha deciso di lavorare **solo in locale** e di **eliminare il repository GitHub**, quindi non serve più).
- Installer (facoltativo): `npm run dist:win` → `dist\CAT-ALOG-Setup-….exe` (non provato su Windows).

## 3. Struttura del progetto

```
main.js            Electron: finestra (sandbox, contextIsolation), IPC "api", dialoghi, apri in editor, PNG offscreen
preload.js         contextBridge: espone window.api (elenco NAMES = lib/api.js API_NAMES, devono coincidere)
lib/api.js         API (createApi): config, store, esportazioni, importazioni, editor, ecc.
lib/store.js       dati su disco (elementi, versioni, cestino, backup ZIP, asset, SEO, pagine/kit, installLibrary + correzioni)
lib/shared.js      funzioni condivise (UMD): colori/contrasto, splitCode, qualityCheck, buildPreviewDoc, addPreviewShim, applyPreviewOptions, neutralizeColors…
lib/*.js (UMD)     highlight, editing, responsive, typography, icone, testi, seo, gridlab, griglia, pagebuilder, zip, assetinfo
lib/libreria/*     la libreria di esempi (vedi §5), VERSIONE = 6, correzioni
renderer/          index.html (l'ordine degli <script> = ordine delle schede), app.js, style.css, js/*.js (una per scheda), font Montserrat
test/              node:test + jsdom (test/helpers/boot.js carica l'interfaccia vera con la vera API su cartella temporanea)
scripts/           smoke-electron.js (Linux+xvfb), verifica-componenti.js (Chromium, vedi §8)
```

Convenzioni: ogni scheda si registra con `App.defineTab({id,label,create})` e `create()` restituisce `{el, show, isDirty, save, discard, reset, state}`. `test/ui-boot.test.js` elenca le schede e la mappatura Ctrl+numero: **va aggiornato quando si aggiunge una scheda**. Le librerie in `lib/` sono UMD (usate sia da Node nei test sia dall'interfaccia).

## 4. Le 14 schede (in ordine)

1. **Strutture** – layout e sezioni (header, hero, griglie, footer…).
2. **Componenti** – pulsanti, navbar, off-canvas, tendine, modali, form, card, mobile/tablet…
3. **Animazioni** – effetti CSS/JS.
4. **Interazioni** – comportamenti JS (menu, lightbox, cookie, form a passi…).
5. **Pagine** – assembla una pagina da strutture/componenti, anteprima, esporta cartella o **sito intero (kit)**.
6. **Griglia CSS** – laboratorio visivo di CSS Grid (vedi §6).
7. **Classi** – classi `cat-` (incluso il sistema container/row/col in stile Bootstrap) con prova HTML.
8. **Responsive** – media query già pronti da copiare, indicazione di quali valgono ora, esportazione `responsive.css`.
9. **Tipografia** – coppie di font, scala fluida (clamp), copia/scrivi nel Root.
10. **Asset** – immagini/video/Lottie/font importati, rinomina, uso nei progetti.
11. **Icone** – set di icone SVG a tratto, sprite, pulizia di SVG incollati.
12. **Testi UI** – testi dell'interfaccia in più lingue (export JSON).
13. **Head e SEO** – title, description, Open Graph, anteprima Google, controlli.
14. **Root** – variabili `:root`, preset di palette, controllo contrasto AA, strumenti colore (scale 50–900, CMYK indicativo, daltonismo), esportazione token **Figma**, SCSS, JSON, override Bootstrap 5.3.

Funzioni trasversali: ricerca globale (Ctrl+K), preferiti, versioni di ogni elemento («Versioni…»), cestino `_cestino`, backup/ripristino ZIP, controllo qualità, anteprima con larghezze/rotazione/scuro/senza animazioni/griglia 8 px, «Apri in VS Code» (comando `code`, ripiego: apre la cartella), ricarica da file modificati fuori, esportazione PNG (375/768/1280), temi **Gatti / Gatti scuro / Classico**, impostazioni (cartella dati, prefisso, editor), «Aggiorna i colori degli esempi».

## 5. Libreria di esempio (installata una sola volta per versione)

Numeri attuali (verificabili col comando in §8): **36 strutture, 93 componenti, 22 animazioni, 19 interazioni, 12 gruppi di classi, 2 pagine di esempio**. Le voci già presenti o già installate in passato (anche se poi eliminate) non si toccano; quando si aggiungono voci si alza `VERSIONE` in `lib/libreria/index.js` e arrivano alla prossima apertura. Esiste anche `correzioni` (migrazioni una-tantum di voci già installate, applicate solo se la voce non è stata modificata dall'utente: oggi corregge «Torna su»).

Palette dei componenti: **neutra a contrasto alto** (nero `#111111` primario, grigi per testo/bordi; blu `#005fcc` solo per il focus; verde/ambra/rosso scuri per stati). Variabili `--cat-color-*`, `--cat-space-*`, `--cat-radius-*`, `--cat-shadow-*`. Per i riempimenti c'è `--cat-color-placeholder`.

## 6. Scheda «Griglia CSS» (richiesta importante dell'utente, da un video)

Ricalca il «CSS Grid Concepts» interattivo del video: 5 preset (Holy grail, Sidebar, Dashboard, Magazine, Hero), riquadri colorati (header/nav/main/aside/footer) che si **scambiano trascinando**, maniglia d'angolo per allargare/restringere, tracce `grid-template-columns/rows` modificabili (chip) con −/+ (max 8), slider `column-gap`/`row-gap`, `place-items` (stretch/start/end/center), «Mostra le tracce», pannello codice scuro `layout.css`/HTML con le righe di `grid-template-areas` evidenziate. Extra: tastiera (frecce sposta/scambia, Maiusc+frecce allarga), opzioni «stile di base» e «una colonna sotto i 768 px», **Copia**, **Salva come struttura…**, e la vista **Anteprima responsive** (finestra ridimensionabile trascinando il bordo o con slider/375-768-1024-1280, si ricompone in tempo reale). Logica in `lib/gridlab.js` (+ `test/gridlab.test.js`), interfaccia in `renderer/js/gridlab.js` (+ `test/ui-gridlab.test.js`).

## 7. Cronologia delle scoperte e correzioni importanti

- Revisione dei componenti («alcuni non funzionano»): trovato con Chromium che nell'anteprima isolata (iframe sandbox) **un clic su un link `href="/"` o `#sezione` svuotava l'anteprima** (~30 elementi), **i moduli non inviavano** (mancava `allow-forms`), `localStorage` e `navigator.clipboard` davano errore, «Torna su» dichiarava `var top` (proprietà del browser non riassegnabile), 5 componenti sbordavano a 375 px (mancava `box-sizing`), navbar fissa non andava a capo. Rimedi: `S.addPreviewShim` (script **solo anteprima**: link e moduli non navigano, `#ancora` scorre dentro l'anteprima grazie a `<base href="about:srcdoc">`, memoria temporanea al posto di localStorage, copia con ripiego `execCommand`), sandbox `allow-scripts allow-forms allow-modals`, `*{box-sizing:border-box}` nel documento di anteprima, correzioni alle voci, migrazione «Torna su».
- Controllo di sicurezza: nessuna falla grave. Corretti: limiti anti-«bomba ZIP» in `lib/zip.js`, IPC accettato solo dalla schermata dell'app (non dalle anteprime), nessun permesso (fotocamera, posizione…) a nessuna pagina, `will-attach-webview` bloccato. `npm audit`: 0 vulnerabilità. Limite noto: nessuna Content-Security-Policy sulla finestra principale (le anteprime ne erediterebbero le regole e il loro JS smetterebbe di funzionare).
- Distribuzione: provato **electron-updater + GitHub Releases** (build Windows riuscita in CI ma pubblicazione fallita per tag mancante), poi l'utente ha scelto di lavorare **solo in locale**: workflow e aggiornamento automatico **rimossi**.
- Test storici corretti: conteggi schede, nomi versioni monotoni, ecc.

## 8. COMANDI DI REVISIONE (per verificare i fatti)

Dalla cartella `CAT-ALOG`:

```bat
:: 1) test automatici (si aspettano: tests 140, pass 140, fail 0)
npm test

:: 2) numero di elementi della libreria (si aspettano 36 / 93 / 22 / 19, VERSIONE 6)
node -e "const L=require('./lib/libreria');console.log('VERSIONE',L.VERSIONE);for(const k of ['strutture','componenti','animazioni','interazioni'])console.log(k,L[k].length)"

:: 3) le 14 schede, nell'ordine di index.html
findstr /n "js/" renderer\index.html

:: 4) nessuna dipendenza di rete a runtime e nessuna vulnerabilità
npm audit

:: 5) prova di TUTTI i componenti in Chromium (errori, anteprima che si svuota, clic senza effetto)
::    si aspettano ~16 segnalazioni, tutte spiegate (menu mobili a 1000 px, scroll, digitazione, clic destro, trascinamento)
npm install --no-save playwright
npx playwright install chromium
node scripts\verifica-componenti.js

:: 6) prova dell'app vera (solo Linux con xvfb; in Windows non serve): npm run smoke
```

Poi, a mano, la guida **`PROVA.md`** (31 passi, i passi 26-30 sono quelli «solo finestra vera»). Controlli rapidi a vista: tab «Griglia CSS» (trascina Nav su Aside in Magazine; Anteprima responsive: trascina il bordo nero), «Navbar con logo» in Componenti (clic sul logo non deve svuotare l'anteprima; a 375 px il menu si apre), «Torna su» in Interazioni (scorri: compare il pulsante e riporta in cima), «Form di contatto» (Invia senza email → compare l'errore).

## 9. Cosa NON è verificato (da provare sul PC)

- Avvio con `AVVIA.bat` su Windows e installazione di Node.js.
- **Esporta PNG**, **Apri in VS Code** (serve il comando `code`), **Crea backup / Ripristina da backup**, `npm run dist:win` (installer).
- Aspetto reale del titolo Montserrat Black e del logo, temi Gatti/Gatti scuro sullo schermo vero.
- Alcune interazioni non-clic (trascinamento file nella dropzone, clic destro nel menu contestuale) sono state provate solo da script.

## 10. Idee e passi successivi possibili

- Continuare ad **aggiungere componenti** (richiesta dell'utente: «tutti i componenti necessari che vogliamo», aggiornamenti man mano insieme). Per aggiungere voci: creare l'oggetto `{nome, descrizione, tag, html, css, js}` in `lib/libreria/componenti*.js` (o strutture/animazioni/interazioni), alzare `VERSIONE` in `lib/libreria/index.js`, controllare i conteggi nei test (`test/*`), lanciare `npm test` e `node scripts/verifica-componenti.js`.
- Sostituire logo/icone (svg nell'interfaccia + `build/icon.png`; per l'SVG del logo si era data una dimensione massima).
- Eventuale soglia 768 px regolabile nell'anteprima responsive della Griglia CSS (proposta fatta, non decisa).
- Firma dell'installer e CSP della finestra principale (limiti noti).

## 11. Prompt pronto da incollare nella nuova chat locale

> Sto lavorando a **CAT-ALOG** (app Electron per Windows in questa cartella). Leggi `RIASSUNTO.md`, `README.md` e `PROVA.md`. Poi esegui `npm test` e i comandi di revisione del §8 di `RIASSUNTO.md` per verificare che quanto scritto sia vero (conteggi libreria, 14 schede, 140 test verdi, audit dei componenti in Chromium). Dimmi cosa non torna. Rispondi in italiano, in stile ADHD (prima riga = cosa funziona; passi numerati; una sola prossima azione sotto i 2 minuti). Poi continuiamo ad aggiungere componenti.
