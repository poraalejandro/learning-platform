# learning-platform

A gamified learning platform for mastering Python and AI engineering: skill-tree progression, active-recall exercises, spaced repetition, and an AI tutor that hints instead of answers — synced across devices via a real backend, not localStorage.

Portfolio project #3 in a transition into AI engineering. Where [rag-finance](https://github.com/poraalejandro/rag-finance) (#1) demonstrated retrieval and [trade-signal-agent](https://github.com/poraalejandro/trade-signal-agent) (#2) demonstrated an agent reasoning over tools, this project demonstrates full-stack delivery: auth, a real database, a deployed backend and frontend, and cross-device state.

See [CLAUDE.md](CLAUDE.md) for the full spec, phased build order, and hard rules.

## Monorepo layout

```
frontend/   Next.js (TypeScript, Tailwind) — deployed on Vercel
backend/    FastAPI (Python) — deployed on Render
```

## Status: Phase 0 — Foundations (in progress)

Local "hello world" for both halves is working. Not yet done: Supabase project, auth, and deployment — see the Phase 0 DONE criterion in CLAUDE.md.

## Running locally

**Frontend:**

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
```

Copy each `.env.example` to `.env` in its own folder before running.
