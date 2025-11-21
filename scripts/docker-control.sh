#!/usr/bin/env zsh
set -euo pipefail

# docker-control.sh
# Basit bir yardımcı: docker compose komutlarını proje kökünden çalıştırır.
# Kullanım: ./scripts/docker-control.sh {start|stop|restart|status|logs|rebuild} [service]

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

# Choose compose command (supports both `docker-compose` and `docker compose`)
if command -v docker-compose >/dev/null 2>&1; then
  compose_cmd="docker-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  compose_cmd="docker compose"
else
  echo "ERROR: neither 'docker-compose' nor 'docker compose' is available in PATH." >&2
  exit 1
fi

usage() {
  echo "Usage: $0 {start|stop|restart|status|logs|rebuild} [service]"
  echo "Examples:"
  echo "  $0 start             # build & start all services"
  echo "  $0 stop backend      # stop and remove backend container"
  echo "  $0 logs backend      # follow logs for backend"
  exit 1
}

cmd="$1" || usage
service="${2:-all}"

start() {
  if [[ "$service" == "all" ]]; then
    echo "Starting all services (build if needed)..."
    $compose_cmd up -d --build
  else
    echo "Starting service: $service"
    $compose_cmd up -d --build "$service"
  fi
}

stop() {
  if [[ "$service" == "all" ]]; then
    echo "Stopping all services and removing containers..."
    $compose_cmd down
  else
    echo "Stopping service: $service"
    $compose_cmd stop "$service" || true
    # Try to remove container (if exists)
    $compose_cmd rm -f "$service" || true
  fi
}

restart() {
  stop
  start
}

status() {
  echo "Compose status:"
  $compose_cmd ps
}

logs() {
  if [[ "$service" == "all" ]]; then
    echo "Tailing logs for all services..."
    $compose_cmd logs -f
  else
    echo "Tailing logs for service: $service"
    $compose_cmd logs -f "$service"
  fi
}

rebuild() {
  if [[ "$service" == "all" ]]; then
    echo "Rebuilding all services (no cache) and starting..."
    $compose_cmd build --no-cache
    $compose_cmd up -d
  else
    echo "Rebuilding service: $service (no cache) and starting..."
    $compose_cmd build --no-cache "$service"
    $compose_cmd up -d "$service"
  fi
}

case "$cmd" in
  start) start ;;
  stop) stop ;;
  restart) restart ;;
  status) status ;;
  logs) logs ;;
  rebuild) rebuild ;;
  *) usage ;;
esac
