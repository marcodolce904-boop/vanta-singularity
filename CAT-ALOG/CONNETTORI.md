# Connettore per Claude e estensione per VS Code

Tutto è **locale**: nessun server, nessuna porta aperta, nessun account. Claude e VS Code leggono e scrivono gli stessi file di CAT-ALOG (`Documenti\Catalogo MD`), con le stesse regole dell'app (nomi, versioni, cestino).

```
Claude (Code o Desktop) ──► connettore MCP  ──┐
VS Code ──► estensione "CAT-ALOG"   ──────────┼──► cartella Catalogo MD ◄── app CAT-ALOG
                                              ┘     (l'app vede le modifiche con «Ricarica da file»)
```

## 1. Connettore per Claude (`mcp/server.js`)

**Installazione, la via facile (2 minuti):**
- **Claude Desktop:** doppio clic su **`COLLEGA-CLAUDE-DESKTOP.bat`**. Trova da solo il file di configurazione, ne fa una copia di sicurezza e aggiunge il connettore senza toccare il resto. Poi chiudi Claude Desktop **del tutto** (icona vicino all'orologio → tasto destro → Esci) e riaprilo.
- **Claude Code:** doppio clic su **`COLLEGA-CLAUDE.bat`**.

**Se non compare "cat-alog":**
1. Hai chiuso Claude Desktop del tutto e riaperto? (la sola X della finestra non basta)
2. Apri il file di log: `%APPDATA%\Claude\logs\mcp-server-cat-alog.log` (incollalo nella barra di Esplora file) e mandami le ultime righe.
3. Rilancia `COLLEGA-CLAUDE-DESKTOP.bat`: se il file di configurazione era rovinato, lo script lo dice e non lo tocca.

**Cosa può fare Claude** (strumenti `cat-alog`):

| Strumento | A cosa serve |
|---|---|
| `catalogo_info` | cartella dati, prefisso, quanti elementi |
| `lista_elementi` | elenco (con ricerca) di strutture, componenti, animazioni, interazioni |
| `leggi_elemento` | HTML, CSS, JS di un elemento |
| `salva_elemento` | crea un elemento nuovo o aggiorna uno esistente (la versione di prima resta in «Versioni…») |
| `elimina_elemento` | lo mette nel cestino (recuperabile) |
| `controlla_qualita` | il controllo qualità dell'app |
| `crea_anteprima` | scrive una pagina HTML completa (root + classi) da aprire nel browser o con Live Server |
| `leggi_root`, `imposta_variabile_root` | variabili `:root` |
| `lista_classi` | nomi delle classi `cat-` |

Esempi da scrivere a Claude: «aggiungi al catalogo un componente "Card prezzo" con le classi cat-», «controlla la qualità di tutti i componenti che contengono "navbar"», «cambia --cat-color-primary in #1b1b1b».

**Sicurezza:** gira solo sul tuo PC (stdio), scrive solo dentro la cartella del catalogo, rifiuta percorsi strani, limita le dimensioni (1 MB per campo) e non cancella mai davvero (cestino). Per cambiare cartella dati: variabile `CAT_DATA_DIR`.

## 2. Estensione per VS Code (`vscode-extension/`)

**Installazione (3 minuti):** doppio clic su **`COLLEGA-VSCODE.bat`** (serve il comando `code`), poi riavvia VS Code e apri la cartella `CAT-ALOG`.

**Cosa fa:**
- Barra laterale **CAT-ALOG** (icona gatto): elenco di strutture, componenti, animazioni, interazioni.
- Clic su un elemento: apre `markup.html`, `style.css`, `script.js` affiancati. Salvi, e l'app li vede con «Ricarica da file».
- Icona anteprima accanto all'elemento: pannello **anteprima dal vivo** (root e classi comprese) che si aggiorna a ogni salvataggio, anche se a salvare è l'app o Claude.
- Comando **«CAT-ALOG: Salva il file aperto come elemento del catalogo»** (Ctrl+Maiusc+P): prende il file aperto (o la selezione) più i file con lo stesso nome (`pagina.html` + `pagina.css` + `pagina.js`, oppure `markup/style/script`) e li salva nel catalogo.
- Se non trova l'app: **«CAT-ALOG: Scegli la cartella dell'app»**.

## Limiti da sapere

- Provati con test automatici (protocollo MCP vero via stdio; estensione con un VS Code finto) e con la creazione del pacchetto `.vsix`. **L'installazione sul tuo PC e l'uso dentro Claude/VS Code veri vanno provati da te.**
- Le due parti leggono i file dell'app dalla cartella `CAT-ALOG` (non dall'app installata): se sposti la cartella, rilancia i due `.bat`.
- L'app non si aggiorna da sola mentre è aperta: usa «Ricarica da file» o cambia scheda.
