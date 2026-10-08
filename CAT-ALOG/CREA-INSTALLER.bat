@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
echo [1/3] Installo i componenti ^(1-3 minuti la prima volta^)...
call npm install || (echo Installazione non riuscita. & pause & exit /b 1)
echo [2/3] Controllo che tutto funzioni...
call npm test || (echo I controlli non sono passati: l'installer non viene creato. & pause & exit /b 1)
echo [3/3] Creo l'installer ^(2-5 minuti^)...
call npx electron-builder --win --publish never || (echo Creazione dell'installer non riuscita. Copia l'errore e mandamelo. & pause & exit /b 1)
echo.
echo FATTO. L'installer e' nella cartella "dist": CAT-ALOG-Setup-1.0.0.exe
start "" "%~dp0dist"
pause
