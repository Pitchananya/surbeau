# Sur Beau

Beauty clinic affiliate platform — เชื่อมคลินิก, Sale (พนักงานหาลูกค้า), และลูกค้าทั่วไปเข้าด้วยกัน

## Repo structure

```
surbeau/
├── frontend/      ← Next.js 15 + Neon Postgres + Auth.js v5 + Tailwind v4
│                    Production target. Deploy to Vercel.
│                    Read frontend/README.md for setup.
│
├── backend/       ← Flask + SQLite/Postgres (legacy reference)
│                    Original prototype. Useful as feature reference until
│                    frontend/ reaches parity, then can be deleted.
│
├── .gitignore
└── README.md      ← this file
```

## Stack at a glance

| Layer | frontend/ (production) | backend/ (legacy) |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Flask 3.1 |
| Language | TypeScript | Python 3.10+ |
| Database | Neon Postgres + Drizzle ORM | SQLite (dev) / Postgres (Docker) |
| Auth | Auth.js v5 + LINE OAuth (JWT) | Custom session + werkzeug hash |
| Styling | Tailwind v4 (CSS-first) | Jinja templates + Bootstrap |
| Hosting | Vercel | Docker Compose / self-host |

## Quick start

### Frontend (the active codebase)

```powershell
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Setup: see [frontend/README.md](frontend/README.md) for Neon + LINE Login + env vars.

### Backend (Flask, kept for reference)

```powershell
cd backend
pip install -r requirements.txt
python app.py
# → http://localhost:5000

# OR via Docker
docker-compose up
# → http://localhost:5000 (Flask) + Postgres on :5433
```

## Why two stacks?

Started as Flask + SQLite. Pivoted to Next.js + Neon for:
- LINE Login built into Auth.js v5 (no custom OAuth)
- Postgres + RLS-ready vs SQLite single-file
- Vercel deploy + edge middleware
- React/JSX kills XSS class of bugs (was 4 `innerHTML` sinks in Flask templates)
- Type safety end-to-end via TypeScript + Drizzle

Flask code is preserved in `backend/` until frontend reaches feature parity. See git history at the migration commits:
- `c7a6881` Merge Next.js + Neon + Auth.js
- `784ff04` /clinics/[id] public detail page
- `06b112d` Sale dashboard + payout flow

## Roadmap

- ✅ Home discovery (responsive: mobile + PC)
- ✅ Clinic detail + lead form
- ✅ Sale signup + dashboard + payout
- ⏳ Clinic dashboard (campaign CRUD, lead management)
- ⏳ Admin console (approvals, payouts, reports)
- ⏳ LINE Login live test (need keys)
- ⏳ Vercel deploy
- 🔭 Phase 2: Job marketplace + AI clinic recommender (pgvector)
