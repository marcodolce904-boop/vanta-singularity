# CAT-ALOG

App desktop personale (Electron) per tenere in un posto solo le tue **strutture flex**, i **componenti** (HTML, CSS, JS), le **classi** e le **variabili `:root`**: si modificano nell'app, si copiano con un clic, si esportano in cartelle vere da aprire in VS Code.

## Avvio (circa 5 minuti)

1. Installa Node.js 20 o più recente da https://nodejs.org (se `node --version` risponde già, salta questo passo).
2. Apri il terminale nella cartella del progetto ed esegui `npm install` (scarica Electron: 1-3 minuti).
3. Esegui `npm start`: si apre la finestra.

Alla prima apertura l'app crea la cartella `Documenti/Catalogo MD` e ci mette dei **contenuti di esempio**. Servono solo a far vedere come funziona: cancellali o modificali quando vuoi (finiscono nel cestino, vedi sotto).

## Le 6 schede

| Scheda | A cosa serve | Cosa fai |
|---|---|---|
| **Strutture** | layout flex pronti | scegli dall'elenco, guardi l'anteprima (375 / 768 / 1280 px / piena), **Copia HTML**, **Copia CSS** o **Copia tutto** |
| **Componenti** | come Strutture, in più il JavaScript | stesso flusso, con la scheda **JS** |
| **Animazioni** | `@keyframes` e transizioni pronte (fade, slide, hover, scroll-reveal), solo `transform`/`opacity` e `prefers-reduced-motion` | stesso flusso di Componenti |
| **Interazioni** | comportamenti in JS vanilla (menu mobile, modale `<dialog>`, tab, tooltip, tema scuro) con attributi `data-cat-*` | stesso flusso di Componenti |
| **Classi** | catalogo di sole classi CSS, a gruppi | copi il nome o la regola, **Prova** la classe in un riquadro, aggiungi/modifichi/togli classi e gruppi, **Salva**, **Esporta file CSS** |
| **Root** | variabili `:root` (colori, font, spaziature, raggi, ombre…) | cambi i valori (selettore colore incluso), **preset** di palette, controllo contrasto AA, **Copia :root**, **Salva root.css**, **Esporta token Figma** |

Regole che valgono ovunque:

- Le modifiche si salvano **solo** con **Salva** (o Ctrl/Cmd+S). Finché non salvi, in alto a destra vedi «● Modifiche non salvate».
- Se cambi elemento, scheda o chiudi l'app con modifiche non salvate, l'app chiede: **Salva e continua**, **Scarta**, **Annulla**.
- **Ripristina** torna all'ultima versione salvata.
- Scorciatoie: **Ctrl/Cmd+S** salva · **Ctrl/Cmd+1…6** cambia scheda · frecce sinistra/destra sulle schede.
- Nel campo del codice **Tab** inserisce 2 spazi; per uscire dal campo con la tastiera: **Esc**, poi **Tab**.
- «Usa root e classi» nell'anteprima applica le variabili e le classi **salvate** alla tua struttura.

## Libreria di esempi

All'apertura l'app installa una **libreria** pronta (circa 60 voci): strutture di pagina con i punti per il logo (hero, header, footer, riga di loghi clienti), componenti (pulsanti, navbar, card, form, tabelle, switch, loader, carosello, icone social…), animazioni e interazioni. Regole:

- Si installa **una volta per versione**: le voci che modifichi restano tue, quelle che elimini **non tornano**.
- Il segnaposto del logo è un SVG con scritto LOGO, con il commento su come sostituirlo con `<img src="logo.svg">`.
- Le nuove voci che aggiungo in futuro arrivano alla prima apertura dopo l'aggiornamento (file `libreria.json` nella tua cartella dei dati).

## Dove sono i tuoi file

```
Documenti/Catalogo MD/
  catalogo.json               prefisso (di partenza: cat)
  strutture/<nome>/           meta.json, markup.html, style.css
  componenti/<nome>/          meta.json, markup.html, style.css, script.js
  classi/                     classi.json, cat-classi.css  (il CSS si rigenera a ogni Salva)
  root/                       root.json, root.css, presets/<nome>.json
  _cestino/                   quello che elimini (si recupera a mano)
```

Sono file normali: puoi aprirli con VS Code, metterli su Git o in Drive. La cartella si cambia da **Impostazioni**.

Sicurezza dei dati: elimina = sposta in `_cestino` (mai cancellazione definitiva) · ogni Salva di classi/root lascia una copia `.bak` · un JSON rovinato non blocca l'app e ne resta una copia `.corrotto-<data>` · i file si scrivono in modo atomico (niente file a metà se si spegne il PC).

## Importare

In Strutture, Componenti, Animazioni e Interazioni c'è il pulsante **Importa…** sopra l'elenco:

- **Da codice incollato**: pagina intera, frammento o blocchi ``` copiati da una chat (v0, Magic Patterns…). Lo divido in HTML, CSS e JS; `<style>` e `<script>` interni vanno nei loro campi. Il codice React (JSX) non viene convertito: finisce nel campo JS con un avviso.
- **Da una cartella**: legge `index.html` (o il primo `.html`), tutti i `.css` e `.js` (fino a 3 livelli, max 2 MB a file).

## Esportare

- **Esporta cartella** (in Strutture/Componenti): una cartella con `index.html` (pagina completa), `style.css` ed eventualmente `script.js`, che si apre da sola nel browser.
- **Esporta tutto** (in alto): una cartella `catalogo-cat/` pronta per VS Code:
  ```
  catalogo-cat/
    css/root.css  css/cat-classi.css
    tokens/figma-tokens.json
    strutture/<nome>/index.html, style.css
    componenti/<nome>/index.html, style.css, script.js
  ```
  Le pagine collegano già `root.css` e `cat-classi.css`.
- Il prefisso (di partenza `cat`) cambia solo il **nome del file** delle classi (`cat-classi.css`). Per cambiarlo: Impostazioni.

## Figma: cosa c'è e cosa no

- C'è: `figma-tokens.json` (Esporta token Figma, scheda Root) nel formato del plugin **Tokens Studio**. Non l'ho potuto provare dentro Figma: se qualcosa non torna, dimmelo.
- Non c'è: esportare in Figma i layout e i componenti come frame. Strumenti che hai già e che lo fanno meglio: Figma stesso (con i token), Magic Patterns, v0.

## Cosa NON fa (ancora)

- Riordinare a mano strutture e classi (le strutture sono in ordine alfabetico; i gruppi di classi nell'ordine in cui li crei).
- Cronologia delle versioni (c'è Ripristina e la copia `.bak` dell'ultimo salvataggio di classi e root).

## Installer (facoltativo, non provato qui)

`npm run dist` usa electron-builder per creare l'installer del tuo sistema (Windows, Mac o Linux). Non l'ho eseguito: la prima volta può servire qualche aggiustamento.

## Per chi sviluppa

- `npm test`: prove automatiche (file, funzioni, e tutte e 4 le schermate in un browser simulato con i file veri in una cartella temporanea).
- `npm run smoke` (solo Linux con xvfb): apre l'app Electron vera e controlla finestra protetta, schede, salvataggio, finestra stretta, chiusura con modifiche non salvate. Salva anche le immagini della finestra (`SMOKE_OUT=cartella`).
- Struttura del codice: `main.js` (finestra) · `preload.js` (ponte sicuro) · `lib/store.js` (lettura e scrittura file) · `lib/api.js` (le funzioni che la finestra può chiamare) · `lib/shared.js` (logica comune) · `renderer/` (schermate: `index.html`, `style.css`, `js/*.js`, `app.js`).
- Se aggiungi una funzione a `lib/api.js`, aggiungi il nome anche in `API_NAMES` e in `preload.js` (un test controlla che le due liste siano uguali).

## Per approfondire (link utili)

- Flexbox: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout · https://www.w3schools.com/css/css3_flexbox.asp
- Variabili CSS (`:root`): https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties · https://www.w3schools.com/css/css3_variables.asp
- `clamp()` per testi fluidi: https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
