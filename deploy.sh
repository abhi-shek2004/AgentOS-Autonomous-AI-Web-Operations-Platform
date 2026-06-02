#!/usr/bin/env bash
# AgentOS — Deploy frontend to Vercel with public backend tunnel.
#
# What it does:
#   1. Ensures backend is running on :8000
#   2. Starts a Cloudflare quick tunnel (free, no signup)
#   3. Captures the public URL
#   4. Rebuilds Next.js with NEXT_PUBLIC_API_URL/WE_URL pointing to the tunnel
#   5. Deploys to Vercel production
#
# Prereqs: backend running, vercel CLI logged in (`vercel login`)
# After: live site at https://frontend-two-ivory-76.vercel.app

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/.runtime"
mkdir -p "$LOG_DIR"

VERCEL_SCOPE="${VERCEL_SCOPE:-abhisheks-projects-e35caf40}"
ALIAS="${ALIAS:-frontend-two-ivory-76}"

echo "============================================================"
echo "  AgentOS — Deploy to Vercel"
echo "============================================================"

# ---- 1. Backend health ----
if ! curl -sf -m 3 http://localhost:8000/ >/dev/null 2>&1; then
  echo "[!] Backend not responding on :8000. Starting it..."
  "$ROOT_DIR/start.sh" --backend-only
fi
echo "    ✓ Backend is healthy on :8000"

# ---- 2. Stop any existing tunnel ----
if [ -f "$LOG_DIR/cloudflared.pid" ]; then
  kill "$(cat "$LOG_DIR/cloudflared.pid")" 2>/dev/null || true
  pkill -f "cloudflared tunnel" 2>/dev/null || true
  sleep 2
fi

# ---- 3. Start cloudflared quick tunnel ----
echo "[*] Starting Cloudflare quick tunnel..."
nohup cloudflared tunnel --url http://localhost:8000 --no-autoupdate \
  > "$LOG_DIR/cloudflared.log" 2>&1 &
echo $! > "$LOG_DIR/cloudflared.pid"
disown

# Wait for URL to appear
TUNNEL_URL=""
for i in 1 2 3 4 5 6 7 8 9 10; do
  TUNNEL_URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" "$LOG_DIR/cloudflared.log" 2>/dev/null | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 2
done

if [ -z "$TUNNEL_URL" ]; then
  echo "[!] Tunnel URL not found. Check $LOG_DIR/cloudflared.log"
  exit 1
fi

echo "$TUNNEL_URL" > "$LOG_DIR/tunnel.url"
WS_URL="${TUNNEL_URL/https/wss}"
echo "    ✓ Public API URL:  $TUNNEL_URL"
echo "    ✓ Public WS URL:   $WS_URL"

# ---- 4. Warm up tunnel ----
echo "[*] Warming up tunnel (Cloudflare quick tunnels are flaky on first hits)..."
for i in 1 2 3 4 5 6 7 8; do
  curl -s -m 10 -o /dev/null "$TUNNEL_URL/" 2>/dev/null || true
  sleep 1
done

# ---- 5. Rebuild frontend ----
echo "[*] Building Next.js with tunnel env vars..."
cd "$ROOT_DIR/frontend"
NEXT_PUBLIC_API_URL="$TUNNEL_URL" \
NEXT_PUBLIC_WS_URL="$WS_URL" \
  npm run build > "$LOG_DIR/build.log" 2>&1 || {
    echo "[!] Build failed. Last 30 lines of build.log:"
    tail -30 "$LOG_DIR/build.log"
    exit 1
  }
echo "    ✓ Build complete"

# ---- 6. Deploy to Vercel ----
echo "[*] Deploying to Vercel..."
cd "$ROOT_DIR"
vercel deploy --prod \
  --yes \
  --scope "$VERCEL_SCOPE" \
  --cwd frontend \
  --force \
  -b NEXT_PUBLIC_API_URL="$TUNNEL_URL" \
  -b NEXT_PUBLIC_WS_URL="$WS_URL" \
  > "$LOG_DIR/deploy.log" 2>&1

DEPLOY_URL=$(grep -oE "https://$ALIAS\.vercel\.app" "$LOG_DIR/deploy.log" | head -1)
DEPLOY_STATUS=$(grep -oE '"status": *"[^"]+"' "$LOG_DIR/deploy.log" | head -1)

echo ""
echo "============================================================"
echo "  ✓ DEPLOYED"
echo "    Live site:  https://$ALIAS.vercel.app"
echo "    API tunnel: $TUNNEL_URL"
echo "    Backend:    http://localhost:8000 (local)"
echo "    Status:     $DEPLOY_STATUS"
echo ""
echo "  Important: Cloudflare quick tunnels are FREE and change URL"
echo "  on restart. To keep the same URL, set up a Cloudflare named"
echo "  tunnel (free) or run a stable tunnel like ngrok."
echo "============================================================"
