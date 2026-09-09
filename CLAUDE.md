learning-platform

## What this project is

A gamified learning platform for mastering Python and AI engineering, focused on active recall and problem-solving rather than passive lessons. Skill-tree progression (main quest: Python + AI/LLMs + agents; side quests: SOLID, design patterns, testing, Docker), multiple exercise types, an AI tutor that gives progressive hints instead of answers, spaced repetition, and cross-device sync.

This is portfolio project #3 in a transition into AI engineering. Its job is to demonstrate full-stack delivery: auth, a real database, a deployed backend and frontend, and cross-device state — the skills projects #1 (RAG) and #2 (trading agent) don't show.

## Working style

The owner is prioritizing completion on this project: Claude Code does the bulk of the implementation, the owner reviews. This is a deliberate choice — it differs from the active-learning style used on earlier projects. That said: when a piece is central to understanding the system (auth flow, the hint-ladder tutor logic, the SRS algorithm), pause and explain what it does and why, so the owner can speak to it later. Don't just generate silently on those.

## Stack (decided — do not relitigate)

- Frontend: Next.js (React) + Tailwind CSS → deployed on Vercel
- Backend: FastAPI (Python) → deployed on Render (free tier; accept cold starts)
- DB + Auth: Supabase (PostgreSQL + Auth + Row Level Security)
- Code execution (student's Python): Pyodide — runs in the browser (WASM), no server-side sandboxing, works offline. Backend only receives test results.
- AI tutor: a FastAPI endpoint calling an LLM API, with per-user rate limiting from day one (it's the only variable-cost piece).
- NO Pinecone / vector DB. The tutor's context is always known (current lesson + the user's code), so there's no retrieval step. If semantic search is ever needed, use pgvector inside Supabase — no extra service.

## Cross-device sync

Supabase Auth issues a JWT. The client reads/writes the user's own progress directly against Supabase, protected by Row Level Security (`user_id = auth.uid()`). FastAPI verifies the same JWT only for the tutor endpoint. LocalStorage is never the source of truth — state lives in the cloud; a device is just a window into it. Start on mobile, continue on desktop, automatically.

## Build order — PHASES. Do not start a phase before the previous one is DEPLOYED.

- **Phase 0 — Foundations** (smallest deployable thing). Monorepo, Supabase project with auth working, Next.js "hello world" on Vercel, FastAPI "hello world" on Render. DONE = the owner can log in from phone and PC with the same account. No content yet.
- **Phase 1 — Content & tree.** SQL schema migrated to Supabase (see schema below), visual skill tree (read-only), one real content unit migrated from the existing learning app. DONE = the owner sees the tree with their progress.
- **Phase 2 — Minimal engine.** code exercises (Pyodide + tests) and flashcard exercises (SM-2 spaced repetition), progress synced. DONE = solve an exercise on the bus, see it completed at home.
- **Phase 3 — Tutor.** LLM endpoint with the progressive hint ladder and contextual chat, rate-limited. DONE = getting stuck triggers hints that unblock without giving the answer away.
- **Phase 4 — Rest of engine & polish.** parsons, fix_bug, match, predict_output exercise types, the "review your own mistakes" feature, side quests, skill-tree animations.

## Database schema (Supabase / PostgreSQL)

Key design rules:

- RLS ON for every progress table (`user_id = auth.uid()`); content tables (`skill_nodes`, `exercises`) are public-read.
- Node unlocking is CALCULATED, never stored: a node is 'available' when all its `skill_prerequisites` are 'completed'. Adding content never corrupts existing progress.
- `exercise_attempts` is an event log, not state — it feeds the "review your mistakes" feature and reveals which exercises cause the most struggle.
- Exercise content lives in a JSONB column so new exercise types don't require schema migrations.

Tables: `profiles`, `user_stats` (xp, streak), `skill_nodes`, `skill_prerequisites` (M2M), `exercises` (type + JSONB content), `exercise_attempts` (event log), `user_node_progress` (bridge table, composite PK user+node), `srs_cards` (SM-2: interval, ease, due_date).

(Full SQL was drafted in the architecture doc — reuse it.)

## Hard rules

- Never start a phase before the previous one is deployed and meets its DONE criterion.
- `.env`, secrets, and Supabase service keys go in `.gitignore` from the first commit.
- Per-user rate limiting on the tutor endpoint is not optional — ship it in Phase 3.
- Enable Row Level Security on all user-data tables. A user must only ever read/write their own rows.
- Commit in small, descriptive steps per feature, not one giant commit.
