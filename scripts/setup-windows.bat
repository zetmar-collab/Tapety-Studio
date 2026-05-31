@echo off
title Tapety Studio — pierwsza instalacja
cd /d "%~dp0"
echo.
echo ========================================
echo   Tapety Studio — PIERWSZA INSTALACJA
echo   Marek Zettel ^| Cyfrowy Przyjaciel
echo ========================================
echo.
type "%~dp0PIERWSZE-URUCHOMIENIE.txt"
echo.
echo ----------------------------------------
echo Rozpoczynam instalacje...
echo ----------------------------------------
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-server-windows.ps1"
if errorlevel 1 goto :error
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-shortcut-windows.ps1"
if errorlevel 1 goto :error
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-windows.ps1"
goto :end
:error
echo.
echo Instalacja nie powiodla sie. Sprawdz komunikaty powyzej.
pause
exit /b 1
:end
echo.
echo Gotowe! Na przyszlosc uzywaj skrotu na pulpicie.
pause
