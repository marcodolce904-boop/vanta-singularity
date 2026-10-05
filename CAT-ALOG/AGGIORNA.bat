@echo off
chcp 65001 >nul
cd /d "%~dp0"
where git >nul 2>nul || (echo Git non trovato. Installalo da https://git-scm.com e riprova. & pause & exit /b 1)
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
echo Scarico le novita...
git pull --ff-only || (echo Aggiornamento non riuscito: controlla internet e l'accesso a GitHub. & pause & exit /b 1)
call npm install || (echo Installazione non riuscita. & pause & exit /b 1)
call npm start
