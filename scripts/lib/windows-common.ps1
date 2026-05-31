#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $PSScriptRoot
$AppDir = Split-Path -Parent $ScriptDir
$PortFile = Join-Path $ScriptDir "config.port"
$LogFile = Join-Path $ScriptDir ".server.log"
$FirstUseFile = Join-Path $ScriptDir "PIERWSZE-URUCHOMIENIE.txt"
$IconIco = Join-Path $AppDir "assets\icon.ico"
$IconPng = Join-Path $AppDir "assets\icon-192.png"

function Get-AppPort {
    if (Test-Path $PortFile) {
        return (Get-Content $PortFile -Raw).Trim()
    }
    return "8088"
}

function Get-AppUrl {
    $port = Get-AppPort
    return "http://127.0.0.1:$port/index.html"
}

function Write-AppHeader {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Tapety Studio - Marek Zettel" -ForegroundColor Cyan
    Write-Host "  Cyfrowy Przyjaciel" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-FirstUseHint {
    Write-Host "Pierwsze uruchomienie? Przeczytaj:" -ForegroundColor Yellow
    Write-Host "  $FirstUseFile"
    Write-Host ""
}

function Get-Runtime {
    if (Get-Command python -ErrorAction SilentlyContinue) { return "python" }
    if (Get-Command py -ErrorAction SilentlyContinue) { return "py" }
    if (Get-Command node -ErrorAction SilentlyContinue) { return "node" }
    return $null
}

function Test-ServerRunning {
    $url = Get-AppUrl
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Start-AppServer {
    $port = Get-AppPort
    $url = Get-AppUrl

    if (Test-ServerRunning) {
        Write-Host "Serwer juz dziala: $url" -ForegroundColor Green
        return $true
    }

    $runtime = Get-Runtime
    if (-not $runtime) {
        Write-Host "BLAD: Zainstaluj Python 3 lub Node.js." -ForegroundColor Red
        Write-Host "Python: https://www.python.org/downloads/ (zaznacz Add to PATH)" -ForegroundColor Yellow
        Write-Host "Szczegoly: $FirstUseFile" -ForegroundColor Yellow
        return $false
    }

    Write-Host "Uruchamiam serwer HTTP (port $port)..." -ForegroundColor Cyan

    switch ($runtime) {
        "python" {
            Start-Process -WindowStyle Minimized python "-m http.server $port --directory `"$AppDir`"" `
                -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
        }
        "py" {
            Start-Process -WindowStyle Minimized py "-3 -m http.server $port --directory `"$AppDir`"" `
                -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
        }
        "node" {
            Start-Process -WindowStyle Minimized npx "--yes serve `"$AppDir`" -l $port" `
                -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile
        }
    }

    Start-Sleep -Seconds 2

    if (Test-ServerRunning) {
        Write-Host "Serwer gotowy: $url" -ForegroundColor Green
        return $true
    }

    Write-Host "BLAD: Serwer nie odpowiada. Sprawdz: $LogFile" -ForegroundColor Red
    return $false
}

function Open-AppBrowser {
    Start-Process (Get-AppUrl)
}

function Install-ServerConfig {
    $runtime = Get-Runtime
    if (-not $runtime) {
        Write-Host "BLAD: Brak Python 3 lub Node.js." -ForegroundColor Red
        Write-Host ""
        Write-Host "Instalacja Python (Windows):" -ForegroundColor Yellow
        Write-Host "  1. Pobierz: https://www.python.org/downloads/"
        Write-Host "  2. Zaznacz: Add python.exe to PATH"
        Write-Host "  3. Uruchom ten skrypt ponownie"
        return $false
    }

    $port = Get-AppPort
    Set-Content -Path $PortFile -Value $port -Encoding ASCII
    Write-Host "Konfiguracja zapisana: port $port" -ForegroundColor Green
    Write-Host "Wykryty runtime: $runtime" -ForegroundColor Green
    Write-Host "Katalog aplikacji: $AppDir" -ForegroundColor Green
    return $true
}

function New-DesktopShortcut {
    param(
        [string]$ShortcutName = "Tapety Studio"
    )

    $runScript = Join-Path $ScriptDir "run-windows.bat"
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktop "$ShortcutName.lnk"
    $iconPath = if (Test-Path $IconIco) { $IconIco } else { $IconPng }

    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $runScript
    $shortcut.WorkingDirectory = $ScriptDir
    $shortcut.IconLocation = "$iconPath,0"
    $shortcut.Description = "Tapety Studio - Marek Zettel, Cyfrowy Przyjaciel"
    $shortcut.Save()

    Write-Host "Skrot utworzony: $shortcutPath" -ForegroundColor Green
    Write-Host "Ikona: $iconPath" -ForegroundColor Gray
}
