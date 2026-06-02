#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "========================================"
echo "  Tapety Studio — PIERWSZA INSTALACJA"
echo "  Marek Zettel | Cyfrowy Przyjaciel"
echo "========================================"
echo ""
cat "$SCRIPT_DIR/PIERWSZE-URUCHOMIENIE.txt"
echo ""
echo "----------------------------------------"
echo "Rozpoczynam instalację..."
echo "----------------------------------------"
echo ""

chmod +x "$SCRIPT_DIR"/*.sh "$SCRIPT_DIR/lib/common.sh" 2>/dev/null || true

"$SCRIPT_DIR/install-server-macos.sh"
"$SCRIPT_DIR/create-shortcut-macos.sh"
"$SCRIPT_DIR/run-macos.sh"

echo ""
echo "Gotowe! Na przyszłość używaj skrótu na pulpicie."
