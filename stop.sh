#!/usr/bin/env bash
# Stop AgentOS services started by start.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/.runtime"

stop_pidfile() {
  local f="$1"
  if [ -f "$f" ]; then
    local pid
    pid=$(cat "$f")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      echo "  Stopped PID $pid"
    fi
    rm -f "$f"
  fi
}

echo "[*] Stopping AgentOS services…"
stop_pidfile "$LOG_DIR/frontend.pid"
stop_pidfile "$LOG_DIR/backend.pid"
# Catch any orphans
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
echo "[*] Done."
