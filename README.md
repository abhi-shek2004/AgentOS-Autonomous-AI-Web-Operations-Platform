# AgentOS — Autonomous AI Web Operations Platform

<p align="center">
  <a href="https://frontend-two-ivory-76.vercel.app"><img src="https://img.shields.io/badge/LIVE_DEMO-https%3A%2F%2Ffrontend--two--ivory--76.vercel.app-00C7B7?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Platform-Autonomous%20Web%20OS-indigo?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Orchestrator-LangGraph%20Multi--Agent-blue?style=for-the-badge" alt="Orchestrator" />
  <img src="https://img.shields.io/badge/Engines-Playwright%20%7C%20Vision-emerald?style=for-the-badge" alt="Engines" />
  <img src="https://img.shields.io/badge/Security-AES--256%20Vault-cyan?style=for-the-badge" alt="Security" />
</p>

<p align="center">
  <a href="https://frontend-two-ivory-76.vercel.app"><strong>🌐 Launch Live Site →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/abhi-shek2004/AgentOS-Autonomous-AI-Web-Operations-Platform">📦 Source</a>
  &nbsp;·&nbsp;
  <a href="https://frontend-two-ivory-76.vercel.app/docs">📖 API Docs (in-app)</a>
</p>

---

> **"An autonomous multi-agent system capable of understanding, planning, executing, monitoring, and optimizing complex browser workflows without human intervention."**

AgentOS is a production-grade autonomous web operations platform that executes complex, multi-tab internet workflows natively. A 7-agent **LangGraph** orchestrator decomposes natural language goals, analyzes visible layouts via visual DOM coordinate grids, safely injects credentials from an AES-256 Vault, executes mouse/keyboard gestures via Playwright, and self-heals broken selectors automatically.

The frontend is an elite dark-glass dashboard with WebGL neural backdrop, live WebSocket traces, and pixel-accurate replay center.

---

## Architecture

```
                     ┌────────────────────┐
   User goal  ─────▶ │   Supervisor Agent │  ◀── routes state
                     └────────┬───────────┘
            ┌──────────────────┼─────────────────────┐
            ▼                  ▼                     ▼
       Planner            Navigator              Memory
   (Tree-of-Thought)   (DOM coordinate grid)   (index trajectories)
            │                  │                     ▲
            ▼                  ▼                     │
       Validator ◀─────   Executor                  │
       (gatekeeper)     (Playwright + PIL sim)      │
            │                  │                     │
            └─────▶ Recovery ◀─┘ (self-heal) ────────┘
```

Seven specialized agents share a typed LangGraph `AgentState` and stream every node transition over a FastAPI WebSocket to the dashboard.

| Agent            | File                                                       | Role                                              |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| Supervisor       | `backend/app/agents/supervisor.py`                         | Routes graph, manages safety gates & token budget |
| Planner          | `backend/app/agents/planner.py`                            | Tree-of-thought decomposition into JSON plan      |
| Navigator        | `backend/app/agents/navigator.py`                          | Builds visual accessibility grid + coordinates    |
| Executor         | `backend/app/agents/executor.py`                           | Playwright driver + PIL canvas simulator          |
| Validator        | `backend/app/agents/validator.py`                          | Audits outcomes against plan criteria             |
| Recovery         | `backend/app/agents/recovery.py`                           | Heuristic self-heal for broken selectors          |
| Memory           | `backend/app/agents/memory.py`                             | Indexes successful trajectories for reuse         |

---

## Stack

- **Frontend** — Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, WebGL/Three.js shader backdrop
- **Backend** — FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.x, LangGraph 0.6, LangChain
- **Browser Engine** — Playwright (Chromium) for live mode, custom PIL canvas for simulation
- **Storage** — SQLite (default) or PostgreSQL (via Docker / `DATABASE_URL`)
- **Security** — AES-256 Fernet symmetric vault with PBKDF2-derived keys
- **Deploy** — Vercel (frontend) + Cloudflare quick tunnel (backend) via `./deploy.sh`

---

## 🌐 Live Demo

**👉 [https://frontend-two-ivory-76.vercel.app](https://frontend-two-ivory-76.vercel.app)**

The site is live on Vercel. The backend is tunneled from a local FastAPI server through a Cloudflare quick tunnel — so when you launch a mission on the live site, the LangGraph orchestrator runs on the host machine that started the tunnel.

> **Note**: Cloudflare quick tunnels change URL on restart. The site is live while the tunnel is active. To keep it always-on, see [Deployment](#deployment) below.

---

## Quick Start (Local Mac)

```bash
# From project root: /Users/abhishekraj/Desktop/AgentOS
cd "/Users/abhishekraj/Desktop/AgentOS"

./start.sh     # installs deps, builds, starts backend (:8000) + frontend (:3000)
```

Open **http://localhost:3000** for the dashboard and **http://localhost:8000/docs** for the API.

```bash
./stop.sh      # stops both services cleanly
```

The startup script:
1. Creates `backend/venv` if missing and installs `requirements.txt`
2. Copies `.env.example` → `.env` on first run
3. Builds the Next.js production bundle
4. Launches Uvicorn (no reload) and `next start` in the background with logs in `.runtime/`

### Manual mode (development)

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Configuration

Edit `backend/.env` (auto-created from `.env.example`):

| Key                    | Default                    | Notes                                                  |
| ---------------------- | -------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`         | `sqlite:///./agentos.db`   | Swap to `postgresql+psycopg2://...` for Postgres       |
| `SECRET_VAULT_KEY`     | auto-derived (dev only)    | **Set a strong value before any real credential use**  |
| `OPENAI_API_KEY`       | empty                      | Required only for live (non-simulation) mode           |
| `AGENTOS_HEADLESS`     | `true`                     | Set `false` to watch Playwright in a real browser      |
| `ALLOWED_ORIGINS`      | `http://localhost:3000`    | Comma-separated CORS origins                           |

Frontend env (in `frontend/.env.local` — optional, defaults are correct for local dev):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Simulation vs Live Mode

AgentOS has two execution modes, toggleable from the **Settings** tab in the dashboard.

- **Simulation** (default) — generates ultra-realistic page mockups, mouse pointer trails, and step events via a custom Pillow canvas. Recruiter-friendly, zero API cost.
- **Live** — boots sandboxed Playwright Chromium, takes real screenshots, calls OpenAI Vision or NVIDIA NIM. Requires `OPENAI_API_KEY`.

---

## Database

Default is **SQLite** at `backend/agentos.db` — zero-config, works on any machine.

To upgrade to PostgreSQL:

```bash
# Option 1 — local Postgres via Homebrew
brew install postgresql@16
brew services start postgresql@16
createdb agentos
# Then in backend/.env:
# DATABASE_URL=postgresql+psycopg2://USER:PASS@localhost:5432/agentos

# Option 2 — Docker Compose
docker compose up -d db
```

---

## API Endpoints

| Method | Path                              | Purpose                          |
| ------ | --------------------------------- | -------------------------------- |
| GET    | `/`                               | Health check                     |
| GET    | `/api/workflows`                  | List workflows                   |
| POST   | `/api/workflows`                  | Create workflow + run mission    |
| GET    | `/api/sessions`                   | List sessions                    |
| GET    | `/api/sessions/{id}`              | Session details                  |
| WS     | `/ws/{session_id}`                | Live event stream (LangGraph)    |
| GET    | `/api/memory`                     | List indexed memory entries      |
| GET    | `/api/credentials`                | List vault entries (masked)      |
| POST   | `/api/credentials`                | Add vault entry (encrypted)      |
| DELETE | `/api/credentials/{id}`           | Remove vault entry               |
| GET    | `/api/metrics`                    | Aggregate usage metrics          |
| GET    | `/api/settings`                   | Runtime settings                 |
| POST   | `/api/settings`                   | Update runtime settings          |

Interactive docs at **http://localhost:8000/docs**.

---

## End-to-End Test (curl)

```bash
# 1. Create a workflow
curl -s -X POST http://localhost:8000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"goal":"Apply to remote React developer roles on LinkedIn"}'

# 2. Stream events (use the session_id from the response)
wscat -c ws://localhost:8000/ws/<session_id>
```

The dashboard does the same thing: creates a workflow, opens a WebSocket, and renders every LangGraph node transition in real time with live screenshots, step traces, and the "Re-Center Brain" neural visualization.

---

## Project Layout

```
AgentOS/
├── backend/
│   ├── app/
│   │   ├── agents/            # 7 LangGraph agents + compiled graph
│   │   │   ├── graph.py       # Main compiled LangGraph
│   │   │   ├── state.py       # Shared AgentState schema
│   │   │   ├── planner.py
│   │   │   ├── navigator.py
│   │   │   ├── executor.py
│   │   │   ├── validator.py
│   │   │   ├── recovery.py
│   │   │   ├── memory.py
│   │   │   └── supervisor.py
│   │   ├── api/               # REST endpoints
│   │   ├── core/              # Settings + AES-256 vault
│   │   ├── db/                # SQLAlchemy session + models
│   │   └── main.py            # FastAPI app + WebSocket manager
│   ├── requirements.txt
│   ├── .env.example
│   └── agentos.db             # SQLite (created on first run)
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # Hero, Dashboard, NeuralBackdrop
│   │   ├── lib/api.ts         # Typed API client
│   │   └── styles/            # Tailwind + globals
│   ├── next.config.js
│   └── package.json
├── start.sh                   # One-shot local deploy
├── stop.sh                    # Clean shutdown
├── docker-compose.yml         # Optional Postgres container
└── README.md
```

---

## Deployment

### Deploy frontend to Vercel + tunnel backend

The included `./deploy.sh` script does everything in one shot:

```bash
./deploy.sh
```

What it does:
1. Verifies the local FastAPI backend is running on `:8000`
2. Starts a Cloudflare quick tunnel (free, no signup) → captures the public URL
3. Rebuilds the Next.js bundle with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` pointing at the tunnel
4. Deploys to Vercel production with `--force` so the new env vars are baked in

Current live site: **[https://frontend-two-ivory-76.vercel.app](https://frontend-two-ivory-76.vercel.app)**

### Vercel project settings

`vercel.json` configures the build:

- `rootDirectory`: `frontend` (Vercel only sees the Next.js app)
- `framework`: `nextjs`
- `regions`: `iad1` (US East)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

### Stable tunnel (recommended for production-feel demo)

The default Cloudflare quick tunnel URL changes on every restart. To keep the same URL forever, set up a free [Cloudflare named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):

```bash
cloudflared tunnel login
cloudflared tunnel create agentos
cloudflared tunnel route dns agentos agentos.yourdomain.com
cloudflared tunnel run agentos
```

Then in `deploy.sh`, replace the cloudflared line with your named tunnel command and remove the URL-grabbing logic. The Vercel env vars stay stable forever.

### Manual Vercel deploy (without the script)

```bash
cd frontend
NEXT_PUBLIC_API_URL=https://your-tunnel.example.com \
NEXT_PUBLIC_WS_URL=wss://your-tunnel.example.com \
  npm run build
vercel deploy --prod --cwd frontend \
  -b NEXT_PUBLIC_API_URL=https://your-tunnel.example.com \
  -b NEXT_PUBLIC_WS_URL=wss://your-tunnel.example.com
```

---

## Troubleshooting

- **`venv` not found / wrong path** — Run `rm -rf backend/venv && ./start.sh` to recreate it.
- **`recursion limit exceeded`** — The compiled graph is configured with `recursion_limit=200`; do not override it lower.
- **Frontend shows "Backend Offline"** — Check `.runtime/backend.log`; usually means the venv path changed.
- **Port 3000 / 8000 in use** — `lsof -i :8000` to find the process, or change ports in `start.sh` and `frontend/.env.local`.
- **Live mode does nothing** — `OPENAI_API_KEY` is empty; you are in simulation mode. Add a key in **Settings** to switch.

---

## Security Notes

- Credentials encrypted at rest with **AES-256-Fernet**; key derived via PBKDF2 from `SECRET_VAULT_KEY`.
- Plaintext credentials are decrypted **only inside the executor frame** for the duration of one action, never logged.
- All API inputs validated with Pydantic; CORS locked to `ALLOWED_ORIGINS`.
- Playwright runs in a sandboxed context — no filesystem access outside its user data dir.

---

## License

Private project. All rights reserved.
