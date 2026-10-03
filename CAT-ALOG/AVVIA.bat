@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
if not exist node_modules (
  echo Prima volta: installo i componenti ^(1-3 minuti^)...
  call npm install || (echo Installazione non riuscita. & pause & exit /b 1)
)
call npm start
