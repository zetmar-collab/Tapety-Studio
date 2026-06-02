#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

print_header
echo "Instalacja serwera — macOS"
echo ""

if install_server_config; then
  echo ""
  echo "Instalacja serwera zakończona."
  echo "Następny krok: ./scripts/setup-macos.sh LUB ./scripts/create-shortcut-macos.sh"
fi
