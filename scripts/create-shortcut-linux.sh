#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

print_header
echo "Tworzenie skrótu na pulpicie — Linux"
echo ""

DESKTOP="$HOME/Desktop"
if [[ ! -d "$DESKTOP" ]]; then
  DESKTOP="$HOME"
fi

SHORTCUT="$DESKTOP/tapety-studio.desktop"
RUN_SCRIPT="$SCRIPT_DIR/run-linux.sh"
ICON="$APP_DIR/assets/icon-512.png"

cat > "$SHORTCUT" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Tapety Studio
Comment=Marek Zettel — Cyfrowy Przyjaciel
Exec=$RUN_SCRIPT
Icon=$ICON
Path=$SCRIPT_DIR
Terminal=true
Categories=Utility;
StartupNotify=true
EOF

chmod +x "$SHORTCUT" "$RUN_SCRIPT" 2>/dev/null || true

if command -v gio >/dev/null 2>&1; then
  gio set "$SHORTCUT" metadata::trusted true 2>/dev/null || true
fi

echo "Skrót utworzony: $SHORTCUT"
echo "Ikona: $ICON"
echo ""
echo "Kliknij „Tapety Studio” na pulpicie (lub w menu aplikacji)."
echo "Jeśli system blokuje skrót: kliknij PPM → Zezwalaj na uruchamianie."
