@echo off
title Tapety Studio — tworzenie skrotu
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-shortcut-windows.ps1"
pause
