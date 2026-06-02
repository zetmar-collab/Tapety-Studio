#Requires -Version 5.1
. "$PSScriptRoot\lib\windows-common.ps1"

Write-AppHeader
Write-Host "Tworzenie skrotu na pulpicie - Windows" -ForegroundColor Cyan
Write-Host ""

New-DesktopShortcut
Write-Host ""
Write-Host "Kliknij skrot Tapety Studio na pulpicie, aby uruchomic aplikacje." -ForegroundColor Green
exit 0
