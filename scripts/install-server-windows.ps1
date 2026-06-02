#Requires -Version 5.1
. "$PSScriptRoot\lib\windows-common.ps1"

Write-AppHeader
Write-Host "Instalacja serwera - Windows" -ForegroundColor Cyan
Write-Host ""

if (Install-ServerConfig) {
    Write-Host ""
    Write-Host "Instalacja serwera zakonczona." -ForegroundColor Green
    Write-Host "Nastepny krok: setup-windows.bat LUB create-shortcut-windows.bat" -ForegroundColor Yellow
    exit 0
}

exit 1
