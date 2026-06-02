#Requires -Version 5.1
. "$PSScriptRoot\lib\windows-common.ps1"

Write-AppHeader
Write-Host "Uruchamianie Tapety Studio - Windows" -ForegroundColor Cyan
Show-FirstUseHint

if (Start-AppServer) {
    Open-AppBrowser
    Write-Host ""
    Write-Host "Aplikacja otwarta w przegladarce." -ForegroundColor Green
    Write-Host "Chrome/Edge: Zainstaluj aplikacje (PWA) z paska adresu." -ForegroundColor Yellow
    exit 0
}

exit 1
