@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
where code >nul 2>nul || (echo Il comando "code" non c'e'. In VS Code: Ctrl+Maiusc+P, poi "Shell Command: Install 'code' command in PATH". & pause & exit /b 1)
echo [1/2] Creo l'estensione...
pushd vscode-extension
call npx --yes @vscode/vsce package --allow-missing-repository --skip-license -o "%~dp0cat-alog.vsix" || (popd & echo Creazione non riuscita. Copia l'errore e mandamelo. & pause & exit /b 1)
popd
echo [2/2] La installo in VS Code...
call code --install-extension "%~dp0cat-alog.vsix" --force || (echo Installazione non riuscita. & pause & exit /b 1)
echo.
echo FATTO. Riavvia VS Code, apri la cartella CAT-ALOG: a sinistra compare l'icona del gatto con il catalogo.
pause
