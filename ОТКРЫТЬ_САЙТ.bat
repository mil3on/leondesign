@echo off
setlocal
cd /d "%~dp0"
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0tools\serve.ps1" -Root "%CD%" -Port 4173

for /L %%I in (1,1,15) do (
  powershell.exe -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>&1
  if not errorlevel 1 goto ready
  timeout /t 1 /nobreak >nul
)

echo Не удалось запустить локальный сервер сайта.
pause
exit /b 1

:ready
start "" http://127.0.0.1:4173/
endlocal
