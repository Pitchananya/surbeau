# Sur Beau — Web

Beauty clinic affiliate platform — Next.js 15 + Neon Postgres + Auth.js v5 (LINE Login) + Drizzle ORM, deployed on Vercel.

## Stack

| Layer | Pick | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | SSR, Edge middleware, Server Actions |
| Styling | Tailwind CSS v4 (CSS-first config) | Fast, no JS config |
| Database | [Neon](https://neon.tech) (Postgres) | Serverless, scale-to-zero free tier, branching |
| ORM | [Drizzle](https://orm.drizzle.team) | Type-safe, schema-as-code, lightweight |
| Auth | [Auth.js v5](https://authjs.dev) | Built-in LINE provider, JWT sessions |
| Hosting | Vercel | Native Next.js + Neon integration |

## Setup

### 1. Install
```powershell
cd web
npm install
```

### 2. Create Neon project
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create project (region: **Singapore** for TH latency)
3. Copy connection string (Settings → Connection Details → **Pooled connection**)

### 3. LINE Login
1. [developers.line.biz](https://developers.line.biz) → your LINE Login channel
2. **Basic settings** tab → copy **Channel ID** + **Channel secret**
3. **LINE Login** tab → **Callback URL** add:
   - `http://localhost:3000/api/auth/callback/line`
   - `https://<your-project>.vercel.app/api/auth/callback/line` (after deploy)

### 4. Env file
```powershell
copy .env.example .env.local
```
Fill in:
```
DATABASE_URL=postgresql://...neon.tech/...
AUTH_SECRET=...           # npx auth secret
AUTH_URL=http://localhost:3000
LINE_CHANNEL_ID=...
LINE_CHANNEL_SECRET=...
```

### 5. Run migrations
**Option A — paste SQL in Neon Console** (easiest):
1. Neon Console → SQL Editor
2. Paste `db/migrations/0001_initial.sql` → Run
3. Paste `db/migrations/0002_seed_demo.sql` → Run

**Option B — Drizzle CLI**:
```powershell
npm run db:push          # pushes schema based on db/schema.ts
```

### 6. Run dev server
```powershell
npm run dev
# → http://localhost:3000
```

## Deploy to Vercel

1. Import this repo in Vercel
2. **Root Directory** → `web`
3. **Environment Variables** → paste from `.env.local` (set `AUTH_URL` to your Vercel URL)
4. Deploy
5. Add Vercel URL to LINE Login Callback URL list

## Structure

```
web/
├── app/
│   ├── page.tsx                 # Home — discovery (matches mockup)
│   ├── auth/login/page.tsx      # LINE login button (Server Action)
│   ├── api/auth/[...nextauth]/  # Auth.js handler
│   ├── layout.tsx
│   └── globals.css              # Tailwind v4 + design tokens
├── auth.ts                      # Auth.js full config (Node, DB-aware)
├── auth.config.ts               # Auth.js edge-safe config (middleware)
├── middleware.ts                # Route protection
├── components/
│   ├── brand/                   # Logo
│   └── home/                    # Header, hero, search, categories, cards, nav
├── lib/
│   ├── types.ts, utils.ts, mock-data.ts
├── db/
│   ├── index.ts                 # Drizzle client (Neon HTTP)
│   ├── schema.ts                # Type-safe schema
│   └── migrations/
│       ├── 0001_initial.sql
│       └── 0002_seed_demo.sql
├── types/next-auth.d.ts         # session.user.role typing
└── drizzle.config.ts
```

## Why this stack vs Supabase

Same Postgres schema works on both. We switched because Supabase free tier limits to **2 active projects per user** which we hit. Neon free tier has no project-per-user limit and is more generous on compute.

What we lost vs Supabase:
- ❌ Studio UI — use `npm run db:studio` for Drizzle Studio instead
- ❌ Built-in RLS — authorization done in TS layer (Server Actions check `auth().user.role`)

What we gained:
- ✅ All in code, not split between Supabase Dashboard + repo
- ✅ Drizzle type-safety: `db.query.users.findFirst({...})` is fully typed
- ✅ One service to manage

## Authorization model

Auth.js JWT carries `userId`, `role`, `status`. Server-side guards:

```ts
import { auth } from "@/auth";

const session = await auth();
if (!session?.user) redirect("/auth/login");
if (session.user.role !== "admin") notFound();
```

Roles: `customer` (default LINE login), `sale`, `clinic`, `admin`.

## What's done / next

✅ **Done**
- Foundation, design tokens (black-gold luxe theme)
- Home discovery page (mock data)
- Drizzle schema + SQL migration + seed
- Auth.js LINE login + JWT session
- Edge middleware for route protection

⏳ **Next**
- Wire home page to live Drizzle queries (replace mock data)
- Sale dashboard, Clinic dashboard
- Lead → Commission → Payout flow (Server Actions)
- Admin console
- Real geolocation + map view
- i18n (TH base, EN later)
