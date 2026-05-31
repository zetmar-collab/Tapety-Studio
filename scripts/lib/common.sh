#!/usr/bin/env bash
# Wspólne funkcje dla macOS i Linux — Tapety Studio

APP_NAME="Tapety Studio"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT_FILE="$SCRIPT_DIR/config.port"
PID_FILE="$SCRIPT_DIR/.server.pid"
LOG_FILE="$SCRIPT_DIR/.server.log"

get_port() {
  if [[ -f "$PORT_FILE" ]]; then
    tr -d '[:space:]' < "$PORT_FILE"
  else
    echo "8088"
  fi
}

PORT="$(get_port)"
APP_URL="http://127.0.0.1:${PORT}/index.html"

print_header() {
  echo ""
  echo "========================================"
  echo "  Tapety Studio — Marek Zettel"
  echo "  Cyfrowy Przyjaciel"
  echo "========================================"
  echo ""
}

show_first_use_hint() {
  echo "Pierwsze uruchomienie? Przeczytaj:"
  echo "  $SCRIPT_DIR/PIERWSZE-URUCHOMIENIE.txt"
  echo ""
}

detect_runtime() {
  if command -v python3 >/dev/null 2>&1; then
    echo "python3"
    return 0
  fi
  if command -v python >/dev/null 2>&1; then
    echo "python"
    return 0
  fi
  if command -v npx >/dev/null 2>&1; then
    echo "npx"
    return 0
  fi
  return 1
}

is_server_running() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS "$APP_URL" >/dev/null 2>&1
    return $?
  fi
  if command -v wget >/dev/null 2>&1; then
    wget -q -O /dev/null "$APP_URL" 2>/dev/null
    return $?
  fi
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
    return $?
  fi
  return 1
}

start_server() {
  local runtime
  runtime="$(detect_runtime)" || {
    echo "BŁĄD: Zainstaluj Python 3 lub Node.js (npx)." >&2
    echo "Szczegóły: $SCRIPT_DIR/PIERWSZE-URUCHOMIENIE.txt" >&2
    return 1
  }

  if is_server_running; then
    echo "Serwer już działa: $APP_URL"
    return 0
  fi

  echo "Uruchamiam serwer HTTP (port $PORT)..."
  cd "$APP_DIR" || exit 1

  case "$runtime" in
    python3)
      nohup python3 -m http.server "$PORT" >>"$LOG_FILE" 2>&1 &
      ;;
    python)
      nohup python -m http.server "$PORT" >>"$LOG_FILE" 2>&1 &
      ;;
    npx)
      nohup npx --yes serve -l "$PORT" >>"$LOG_FILE" 2>&1 &
      ;;
  esac

  echo $! > "$PID_FILE"
  sleep 2

  if is_server_running; then
    echo "Serwer gotowy: $APP_URL"
    return 0
  fi

  echo "BŁĄD: Serwer nie odpowiada. Sprawdź $LOG_FILE" >&2
  return 1
}

open_app() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$APP_URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "$APP_URL" || true
  else
    echo "Otwórz ręcznie: $APP_URL"
  fi
}

install_server_config() {
  local runtime
  runtime="$(detect_runtime)" || {
    echo "BŁĄD: Brak Python 3 lub Node.js." >&2
    echo ""
    echo "Instalacja Python:"
    echo "  macOS  : brew install python3  LUB pobierz z python.org"
    echo "  Linux  : sudo apt install python3  /  sudo dnf install python3"
    return 1
  }

  echo "$PORT" > "$PORT_FILE"
  echo "Konfiguracja zapisana: port $PORT"
  echo "Wykryty runtime: $runtime"
  echo "Katalog aplikacji: $APP_DIR"
  return 0
}
