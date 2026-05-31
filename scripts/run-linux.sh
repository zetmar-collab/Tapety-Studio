#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

print_header
echo "Uruchamianie Tapety Studio — Linux"
show_first_use_hint

start_server
open_app

echo ""
echo "Aplikacja otwarta w przeglądarce."
echo "Chrome/Edge: Zainstaluj aplikację (PWA) z paska adresu."
