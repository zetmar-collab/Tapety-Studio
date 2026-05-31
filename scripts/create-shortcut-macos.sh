#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib/common.sh"

print_header
echo "Tworzenie skrótu na pulpicie — macOS"
echo ""

DESKTOP="$HOME/Desktop"
SHORTCUT="$DESKTOP/Tapety Studio.command"
RUN_SCRIPT="$SCRIPT_DIR/run-macos.sh"

cat > "$SHORTCUT" <<EOF
#!/usr/bin/env bash
cd "$SCRIPT_DIR"
exec "$RUN_SCRIPT"
EOF

chmod +x "$SHORTCUT"
chmod +x "$RUN_SCRIPT"

echo "Skrót utworzony: $SHORTCUT"
echo "Ikona: $APP_DIR/assets/icon-512.png"
echo ""
echo "Kliknij dwukrotnie „Tapety Studio.command” na pulpicie."
echo "Przy pierwszym uruchomieniu macOS może poprosić o zgodę — wybierz Otwórz."
