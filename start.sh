#!/usr/bin/env bash
# AgentOS — start backend + frontend for local production use.
# Usage: ./start.sh
#
# Prerequisites:
#   - Python 3.9+ (with venv at backend/venv, or create one with `python3 -m venv backend/venv`)
#   - Node 18+
#
# After starting, the dashboard is at http://localhost:3000
# The FastAPI backend is at http://localhost:8000  (docs at /docs)

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_DIR="$ROOT_DIR/.runtime"
mkdir -p "$LOG_DIR"

echo "============================================================"
echo "  AgentOS — Autonomous AI Web Operations Platform"
echo "  Starting backend + frontend locally"
echo "============================================================"

# -------- Backend --------
if [ ! -d "$BACKEND_DIR/venv" ]; then
  echo "[*] Creating Python virtual environment..."
  python3 -m venv "$BACKEND_DIR/venv"
  "$BACKEND_DIR/venv/bin/pip" install --upgrade pip --quiet
  echo "[*] Installing backend dependencies..."
  "$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt" --quiet
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "[*] Creating .env from .env.example"
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

echo "[*] Starting backend (FastAPI on :8000)…"
cd "$BACKEND_DIR"
nohup "$BACKEND_DIR/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 \
  > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$LOG_DIR/backend.pid"
disown
echo "    PID: $(cat "$LOG_DIR/backend.pid"), log: $LOG_DIR/backend.log"

# -------- Frontend --------
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "[*] Installing frontend dependencies (npm install)…"
  cd "$FRONTEND_DIR" && npm install --no-audit --no-fund
fi

echo "[*] Building frontend (next build)…"
cd "$FRONTEND_DIR" && npm run build > "$LOG_DIR/build.log" 2>&1 || {
  echo "    Build failed — see $LOG_DIR/build.log"
  tail -40 "$LOG_DIR/build.log"
  exit 1
}

echo "[*] Starting frontend (Next.js on :3000)…"
nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"
disown
echo "    PID: $(cat "$LOG_DIR/frontend.pid"), log: $LOG_DIR/frontend.log"

# -------- Wait for services --------
echo ""
echo "[*] Waiting for services to come online…"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf http://localhost:8000/ >/dev/null 2>&1; then
    echo "    ✓ Backend up (http://localhost:8000)"
    break
  fi
  sleep 1
done
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -sf http://localhost:3000/ >/dev/null 2>&1; then
    echo "    ✓ Frontend up (http://localhost:3000)"
    break
  fi
  sleep 1
done

echo ""
echo "============================================================"
echo "  AgentOS is live."
echo "  • Dashboard:  http://localhost:3000"
echo "  • API:        http://localhost:8000"
echo "  • API docs:   http://localhost:8000/docs"
echo "  • Logs:       $LOG_DIR/{backend,frontend}.log"
echo "  • Stop:       ./stop.sh"
echo "============================================================"
