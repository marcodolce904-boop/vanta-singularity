@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
if not exist node_modules\@modelcontextprotocol (
  echo Installo i componenti del connettore ^(1-3 minuti^)...
  call npm install || (echo Installazione non riuscita. & pause & exit /b 1)
)
echo Controllo che il connettore parta...
node -e "require('./mcp/server.js')" || (echo Il connettore non parte. Copia l'errore e mandamelo. & pause & exit /b 1)
echo OK.
echo.
node mcp\installa-desktop.js
if %errorlevel%==2 (
  echo.
  echo Il file di Claude Desktop e' rovinato e non si riesce a ripararlo: ne scrivo uno nuovo ^(il vecchio resta come copia di sicurezza^)...
  node mcp\installa-desktop.js --forza
)
echo.
pause
