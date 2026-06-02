#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

print_header
echo "Uruchamianie Tapety Studio — macOS"
show_first_use_hint

start_server
open_app

echo ""
echo "Aplikacja otwarta w przeglądarce."
echo "Safari/Chrome: Dodaj do Docka / Zainstaluj aplikację (PWA)."
