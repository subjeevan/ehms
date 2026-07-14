@echo off
setlocal

set "SOURCE=D:\Web 3.0\ehms\frontend"
set "OUTPUT=D:\Web 3.0\ehms\frontend-next"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Convert-EhmsFrontendToNext.ps1" -SourceFrontend "%SOURCE%" -OutputFrontend "%OUTPUT%" -Force

if errorlevel 1 (
  echo.
  echo Conversion failed.
  pause
  exit /b 1
)

echo.
echo Conversion completed.
echo Open: %OUTPUT%
pause
