@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
if not exist node_modules\@modelcontextprotocol (
  echo Installo i componenti del connettore ^(1-3 minuti^)...
  call npm install || (echo Installazione non riuscita. & pause & exit /b 1)
)
echo.
echo Controllo che il connettore parta...
node -e "require('./mcp/server.js')" || (echo Il connettore non parte. Copia l'errore e mandamelo. & pause & exit /b 1)
echo OK.
echo.
where claude >nul 2>nul
if errorlevel 1 (
  echo Claude Code non e' installato: salto il collegamento automatico.
) else (
  echo Collego CAT-ALOG a Claude Code...
  call claude mcp remove cat-alog --scope user >nul 2>nul
  call claude mcp add cat-alog --scope user -- node "%~dp0mcp\server.js" && echo Collegato a Claude Code. || echo Collegamento non riuscito: usa il comando scritto in CONNETTORI.md.
)
echo.
echo Per CLAUDE DESKTOP: apri Impostazioni ^> Sviluppatore ^> Modifica configurazione e aggiungi questo blocco in "mcpServers":
echo.
set "P=%~dp0mcp\server.js"
set "P=%P:\=\\%"
echo     "cat-alog": { "command": "node", "args": ["%P%"] }
echo.
echo ^(stesso testo salvato in mcp\claude-desktop.json^)
> "%~dp0mcp\claude-desktop.json" echo { "mcpServers": { "cat-alog": { "command": "node", "args": ["%P%"] } } }
echo.
echo Poi riavvia Claude: gli strumenti "cat-alog" compaiono nell'elenco degli strumenti.
pause
