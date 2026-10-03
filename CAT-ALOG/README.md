# CAT-ALOG

App desktop personale (Electron) per tenere in un posto solo le tue **strutture flex**, i **componenti** (HTML, CSS, JS), le **classi** e le **variabili `:root`**: si modificano nell'app, si copiano con un clic, si esportano in cartelle vere da aprire in VS Code.

## Avvio (circa 5 minuti)

1. Installa Node.js 20 o più recente da https://nodejs.org (se `node --version` risponde già, salta questo passo).
2. Apri il terminale nella cartella del progetto ed esegui `npm install` (scarica Electron: 1-3 minuti).
3. Esegui `npm start`: si apre la finestra.

Alla prima apertura l'app crea la cartella `Documenti/Catalogo MD` e ci mette dei **contenuti di esempio**. Servono solo a far vedere come funziona: cancellali o modificali quando vuoi (finiscono nel cestino, vedi sotto).

## Le 9 schede

| Scheda | A cosa serve | Cosa fai |
|---|---|---|
| **Strutture** | layout flex pronti | scegli dall'elenco, guardi l'anteprima (375 / 768 / 1280 px / piena), **Copia HTML**, **Copia CSS** o **Copia tutto** |
| **Componenti** | come Strutture, in più il JavaScript | stesso flusso, con la scheda **JS** |
| **Animazioni** | `@keyframes` e transizioni pronte (fade, slide, hover, scroll-reveal), solo `transform`/`opacity` e `prefers-reduced-motion` | stesso flusso di Componenti |
| **Interazioni** | comportamenti in JS vanilla (menu mobile, modale `<dialog>`, tab, tooltip, tema scuro) con attributi `data-cat-*` | stesso flusso di Componenti |
| **Responsive** | media query già pronti, in una pagina sola | scegli un gruppo, **Copia**; vedi quali valgono adesso; provi le larghezze dei dispositivi |
| **Tipografia** | coppie di font e scala dei caratteri fluida | scegli la coppia, regola la scala, **Copia :root** o **Scrivi nel Root** |
| **Asset** | immagini, SVG, Lottie, video, font, PDF | **+ Aggiungi**, anteprima, peso, avvisi, frammenti pronti da copiare |
| **Classi** | catalogo di sole classi CSS, a gruppi | copi il nome o la regola, **Prova** la classe in un riquadro, aggiungi/modifichi/togli classi e gruppi, **Salva**, **Esporta file CSS** |
| **Root** | variabili `:root` (colori, font, spaziature, raggi, ombre…) | cambi i valori (selettore colore incluso), **preset** di palette, controllo contrasto AA, **Copia :root**, **Salva root.css**, **Esporta token Figma** |

Regole che valgono ovunque:

- Le modifiche si salvano **solo** con **Salva** (o Ctrl/Cmd+S). Finché non salvi, in alto a destra vedi «● Modifiche non salvate».
- Se cambi elemento, scheda o chiudi l'app con modifiche non salvate, l'app chiede: **Salva e continua**, **Scarta**, **Annulla**.
- **Ripristina** torna all'ultima versione salvata.
- Scorciatoie: **Ctrl/Cmd+S** salva · **Ctrl/Cmd+1…9** cambia scheda · frecce sinistra/destra sulle schede.
- Nel campo del codice **Tab** inserisce 2 spazi; per uscire dal campo con la tastiera: **Esc**, poi **Tab**.
- «Usa root e classi» nell'anteprima applica le variabili e le classi **salvate** alla tua struttura.

## Libreria di esempi

All'apertura l'app installa una **libreria** pronta (circa 170 voci): strutture di pagina con i punti per il logo (hero, header, footer, riga di loghi clienti), componenti (pulsanti, navbar, card, form, tabelle, switch, loader, carosello, icone social…), animazioni e interazioni. Regole:

- Si installa **una volta per versione**: le voci che modifichi restano tue, quelle che elimini **non tornano**.
- Il segnaposto del logo è un SVG con scritto LOGO, con il commento su come sostituirlo con `<img src="logo.svg">`.
- Le nuove voci che aggiungo in futuro arrivano alla prima apertura dopo l'aggiornamento (file `libreria.json` nella tua cartella dei dati).

## Tipografia

- **14 coppie di font** (titoli + testo): 4 solo di sistema (niente da scaricare) e 10 di Google Fonts (serve la connessione; **Copia il link dei font** dà i tag per il `<head>`). C'è anche Baloo 2 + Nunito, rotondo e giocoso, pensato per il tema gatti.
- **Scala fluida**: scegli la dimensione del testo base su schermo piccolo e grande, il rapporto (1,125 … 1,5), la larghezza minima e massima. Il programma calcola `clamp()` per ogni passo (`--cat-text-xs … --cat-text-5xl`) e le interlinee.
- **Scrivi nel Root**: aggiorna le variabili che esistono già e aggiunge le nuove nel gruppo «Tipografia»; ti dice quante cambiano e salva subito.

## Asset

Immagini (png, jpg, gif, webp, avif, ico), SVG, Lottie (.json), video (mp4, webm), font (woff2, woff, ttf, otf) e PDF, fino a 50 MB l'uno. I file vengono **copiati** nella cartella `assets/` dei dati (l'originale non si tocca) con un nome pulito. Per ognuno vedi anteprima, peso, dimensioni in pixel e, per i Lottie, fps/durata/livelli. Avvisi: file pesanti, immagini troppo larghe, SVG con script, font non woff2, video grandi. Frammenti da copiare: percorso, `<img>` con `width`/`height`, sfondo CSS, maschera CSS per SVG, codice Lottie, `<video>`, `@font-face`. «Esporta tutto» e il backup includono la cartella `assets/`. Non c'è anteprima animata dei Lottie (servirebbe una libreria): il frammento pronto li fa partire nel tuo sito.

## Pagina Responsive

Scheda **Responsive**: tutti i media query che servono, già scritti e copiabili. Dieci gruppi:

- Punti di rottura mobile-first (sm 576, md 768, lg 992, xl 1200, xxl 1400), solo un intervallo, dal grande al piccolo (max-width).
- Dispositivi tipici (telefono, tablet verticale/orizzontale, portatile, schermi larghi, pieghevoli), orientamento e forma.
- Mouse/touch/hover, preferenze dell'utente (tema scuro, meno movimento, contrasto, colori forzati…), schermo/stampa/app installata.
- Container query e pronti da copiare (meta viewport, tacca dell'iPhone, `100dvh`, testo fluido con `clamp()`, griglia che si adatta da sola, mostra/nascondi per punto di rottura…).

Come si usa: **Copia** sulla singola voce, **Copia il gruppo**, **Copia tutto** oppure **Esporta responsive.css…**. Sulle voci che si possono verificare compare **«vale ora»** quando il media query è vero per la finestra dell'app. A destra provi le larghezze (iPhone SE, iPhone 15, Pixel, iPad, portatile, Full HD…): i riquadri dell'anteprima si accendono con i media query veri. «Esporta tutto» include `css/responsive.css`. Controllato in Chromium: tutte le 74 regole sono CSS valido e le query vengono riconosciute.

## Griglia container › row › col (stile Bootstrap)

Sistema a 12 colonne, mobile-first, in flexbox. Si trova in due posti:

- **Classi**: gruppi «Griglia · …» (contenitore, riga e gutter, colonne uguali, colonne per riga, colonne base/sm/md/lg/xl, offset, ordine, allineamento). Sono circa 190 classi, già in ordine giusto nel file `cat-classi.css`.
- **Strutture**: 8 esempi «Griglia: …» con l'HTML pronto e **solo il CSS che usano** (copiabile da solo, senza il resto del catalogo). Il primo, «come funziona», mostra tutte le combinazioni.

Come si scrive:

```html
<div class="cat-container">
  <div class="cat-row cat-g-4">
    <div class="cat-col-12 cat-col-md-6">Metà da tablet in su</div>
    <div class="cat-col-12 cat-col-md-6">Metà da tablet in su</div>
  </div>
</div>
```

Punti di rottura: `sm` ≥ 576 px, `md` ≥ 768, `lg` ≥ 992, `xl` ≥ 1200 (come Bootstrap). Differenze: prefisso `cat-`; il gutter si cambia con `--cat-gutter` (di partenza 1,5rem) o con `cat-g-0…5`; l'allineamento si chiama `cat-align-items-*`, `cat-align-self-*` e `cat-justify-*` (al posto di `justify-content-*`). Se avevi già una classe `cat-container` nel catalogo, resta la tua e quella a gradini compare solo nelle strutture; le varianti `cat-container-sm…xxl` e `cat-container-fluid` arrivano nel catalogo. Ho controllato il risultato in Chromium a 375, 700, 900 e 1280 px (larghezze delle colonne, impilamento, offset, ordine e numero di card per riga).

## Componenti per telefono e tablet

Nella libreria: barra delle schede in basso, barra in alto con tacca, pulsante flottante con azioni, bottom sheet, menu a tutto schermo, barra di acquisto fissa, impostazioni stile iOS, chat, storie, onboarding, griglia di icone dell'app, cornice di **smartphone** e di **tablet** (mockup in solo CSS), vista divisa elenco/dettaglio, barra laterale stretta (rail) e posta a tre colonne. In più: quattro **off-canvas** (sinistra, destra, alto, basso, con focus intrappolato ed Esc), **tendine** (con tastiera, pulsante diviso, mega menu, select personalizzata, menu contestuale, collapse, popover, tooltip) e otto **navbar** (con ricerca e utente, trasparente che si riempie, scura, a due livelli, laterale comprimibile, con off-canvas su mobile).

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

Sono file normali: puoi aprirli con VS Code, metterli su Git o in Drive. La cartella si cambia da **Impostazioni**. La cartella di partenza si chiama ancora `Catalogo MD`, così i dati che hai già non si spostano.

Sicurezza dei dati: elimina = sposta in `_cestino` (mai cancellazione definitiva) · ogni Salva di classi/root lascia una copia `.bak` · un JSON rovinato non blocca l'app e ne resta una copia `.corrotto-<data>` · i file si scrivono in modo atomico (niente file a metà se si spegne il PC).

## Cercare e preferiti

- **Ctrl/Cmd+K** (o il pulsante **Cerca** in alto): cerca in Strutture, Componenti, Animazioni e Interazioni insieme e apre l'elemento.
- **☆ Preferito** nell'editor (si salva con **Salva**): i preferiti vanno in cima all'elenco, con la stella; la casella **Solo preferiti** filtra l'elenco.

## Backup, versioni e PNG

- **Versioni…** (nell'editor): a ogni salvataggio che cambia qualcosa, la versione precedente viene conservata (le ultime 20 per elemento, nella sottocartella `_versioni` dell'elemento). Scegline una: va nell'editor, ma resta non salvata finché non premi **Salva**.
- **Impostazioni → Crea backup ZIP…**: un unico `cat-alog-backup-AAAA-MM-GG-HHMM.zip` con strutture, componenti, animazioni, interazioni, classi e root (non il cestino). **Ripristina da backup…** rimette tutto e sposta quello che c'era prima in `_cestino/prima-del-ripristino-…`.
- **Esporta PNG** (nell'editor): tre immagini a 375, 768 e 1280 px, a pagina intera, con root e classi applicati. Usa una finestra nascosta di Electron: la parte di scatto non è provata in questo ambiente (la logica dei file sì). Se l'immagine esce vuota, dimmelo.

## Controllo qualità e anteprima

- Nell'editor, il riquadro **Controllo qualità** si aggiorna mentre scrivi: ● a posto, ▲ da vedere, ■ errore. Controlla un solo h1, `alt` sulle immagini, nome di pulsanti e link, etichette dei campi, id unici, focus visibile, contrasto AA (solo coppie colore/sfondo scritte come `#rrggbb` nella stessa regola), `prefers-reduced-motion` e animazioni di proprietà diverse da `transform`/`opacity`. Sotto ci sono tre caselle da spuntare a mano (non vengono ricordate).
- Nella barra dell'anteprima: **Ruota** (667, 1024, 800 px), **Scuro** (imposta `data-theme="dark"`), **Senza animazioni** (le ferma) e **Griglia 8 px**.

## Strumenti colore

Scheda Root → **Strumenti colore…**: per un colore `#rrggbb` mostra la scala 50–900, il CMYK approssimato (solo indicativo), come lo vedono protanopia, deuteranopia e tritanopia, e la versione scura. **Aggiungi la scala come variabili** crea un gruppo con 10 variabili.

## Importare

In Strutture, Componenti, Animazioni e Interazioni c'è il pulsante **Importa…** sopra l'elenco:

- **Da codice incollato**: pagina intera, frammento o blocchi ``` copiati da una chat (v0, Magic Patterns…). Lo divido in HTML, CSS e JS; `<style>` e `<script>` interni vanno nei loro campi. Il codice React (JSX) non viene convertito: finisce nel campo JS con un avviso.
- **Da una cartella**: legge `index.html` (o il primo `.html`), tutti i `.css` e `.js` (fino a 3 livelli, max 2 MB a file).

## Esportare

- **Esporta cartella** (in Strutture/Componenti): una cartella con `index.html` (pagina completa), `style.css` ed eventualmente `script.js`, che si apre da sola nel browser.
- **Root in altri formati** (scheda Root → **Altri formati…**): JSON, SCSS (variabili + mappa) e override per Bootstrap 5.3 (`$primary`, `$danger`, `$border-radius`…). L'override è stato compilato con Sass e Bootstrap 5.3.8 veri. Le variabili che puntano ad altre (`var(…)`) vengono saltate.
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
