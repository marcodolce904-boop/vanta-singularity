# Come provare CAT-ALOG (Windows)

Segui i passi nell'ordine. Ogni passo è una sola azione e dice cosa devi vedere.
Se qualcosa non torna, annota il numero del passo e cosa hai visto: mi basta quello.

## A. Avvio (circa 5 minuti)

1. Installa Node.js 20 o più nuovo da https://nodejs.org (se `node --version` risponde già, salta). Dettagli in `INSTALLA.md`; per avviare basta anche il doppio clic su `AVVIA.bat`.
2. Scarica il branch `claude/sweet-newton-uovnqp` del repo `vanta-singularity` e apri la cartella `CAT-ALOG`.
3. In quella cartella apri il terminale ed esegui `npm install`. *Vedi:* scarica Electron, nessun errore rosso.
4. Esegui `npm start`. *Vedi:* si apre la finestra «CAT-ALOG» con il titolo CAT-ALOG al centro e il gatto accanto.
5. Passa il mouse sul gatto. *Vedi:* la zampa saluta per qualche secondo.

## B. Aspetto

6. **Impostazioni → Aspetto → Gatti**. *Vedi:* sfondo crema, pulsanti arancio e rotondi.
7. Scegli **Gatti scuro**, poi **Classico**. *Vedi:* i colori cambiano subito; chiudi e riapri l'app: resta l'ultimo scelto.

## C. Il catalogo (Strutture, Componenti, Animazioni, Interazioni)

8. Apri **Strutture** e clicca «Bento grid». *Vedi:* l'anteprima al centro e il codice a destra con i colori e i numeri di riga.
9. Clicca **375 px**, poi **Ruota**, poi **Scuro**. *Vedi:* l'anteprima cambia larghezza e tema.
10. Nel codice CSS premi Invio dopo una `{`. *Vedi:* la riga successiva è rientrata. Seleziona due righe e premi Tab: si rientrano insieme.
11. Premi **☆ Preferito** e poi **Salva**. *Vedi:* l'elemento sale in cima all'elenco con la stella.
12. Premi **Ctrl+K** e scrivi «off-canvas». *Vedi:* i risultati di tutte le schede; un clic apre l'elemento.
13. Apri **Componenti → Off-canvas da sinistra** e guarda il riquadro **Controllo qualità**. *Vedi:* pallini verdi (tutto a posto).
14. Premi **Versioni…** dopo aver salvato due volte con una modifica. *Vedi:* l'elenco delle versioni precedenti.

## D. Altre schede

15. **Pagine**: apri «Pagina vetrina (esempio)». *Vedi:* la pagina intera in anteprima; sposta una sezione con ↑ e salva.
16. In **Pagine** premi **Esporta il sito (kit)…**, scegli una cartella vuota e conferma. *Vedi:* una cartella con `index.html`, `css/`, `js/`, `LEGGIMI.txt`.
16b. **Griglia CSS**: premi **Magazine**, poi trascina «Nav» sopra «Aside». *Vedi:* i due riquadri si scambiano e nel codice a destra cambiano le righe evidenziate di `grid-template-areas`. Trascina l'angolo in basso a destra di un riquadro per allargarlo; prova anche le frecce e Maiusc+frecce. Cambia una colonna in `200px`, sposta lo slider del gap, premi **center** e poi **Copia**.
17. Apri `index.html` dal kit col browser. *Vedi:* la pagina con i suoi colori; restringi la finestra: si adatta.
18. **Responsive**: restringi la finestra dell'app sotto i 768 px. *Vedi:* sulle voci compare «vale ora» e cambia il punto di rottura in alto.
19. **Tipografia**: scegli «Baloo 2 + Nunito» e premi **Scrivi nel Root**. *Vedi:* un messaggio con quante variabili cambiano; conferma.
20. **Asset**: premi **+ Aggiungi** e scegli una foto. *Vedi:* miniatura, peso, dimensioni; **Copia <img>** e incolla in un file di testo.
21. **Icone**: cerca «gatto», apri l'icona e premi **Copia SVG**. Poi **+ Aggiungi allo sprite** e **Salva sprite.svg…**.
22. **Testi UI**: clicca «Invia» in italiano e incolla da qualche parte. Poi **Salva en.json…**.
23. **Head e SEO**: scrivi titolo, descrizione e indirizzo. *Vedi:* l'anteprima di Google e i controlli; **Salva**.
24. **Classi**: cerca «cat-col-md-6» e copia la regola.
25. **Root**: premi **Strumenti colore…** su un colore. *Vedi:* la scala 50–900 e come lo vede chi è daltonico.

## E. Cose che solo la finestra vera può fare (le ho scritte ma non provate)

26. In un elemento premi **Apri in VS Code**. *Vedi:* VS Code si apre con i file; se non c'è il comando `code`, si apre la cartella e un messaggio spiega come installarlo.
27. In VS Code cambia una riga di `markup.html`, salva, torna nell'app. *Vedi:* l'elemento si aggiorna da solo.
28. Premi **Esporta PNG** su un elemento e scegli una cartella. *Vedi:* tre immagini (375, 768, 1280). Se escono vuote, dimmelo.
29. **Impostazioni → Crea backup ZIP…**, poi **Ripristina da backup…**. *Vedi:* il backup si crea; il ripristino sposta il vecchio nel cestino.
30. (facoltativo) `npm run dist` per creare l'installer `.exe`. Non l'ho mai eseguito: può servire qualche aggiustamento.

## F. Chiusura

31. Modifica un elemento senza salvare e chiudi la finestra. *Vedi:* l'app chiede se restare o uscire.

I tuoi dati sono nella cartella `Documenti/Catalogo MD` (apribile da **Impostazioni → Apri la cartella**).
