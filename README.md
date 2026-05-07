# Micro Mentorship

Book a 15-minute session with an industry insider. Career change, reality check, or just map the maze.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 · TypeScript · Tailwind CSS |
| API | Python FastAPI · SQLAlchemy 2 · Alembic |
| Database | PostgreSQL 16 (local standalone binary) |

---

## First-time setup

### 1. PostgreSQL

The database binary is already installed at `~/.postgres16/`. Initialise and start it:

```bash
# Initialise (one-time only — already done if you're seeing this)
~/.postgres16/bin/initdb -D ~/.postgres16/data -U postgres --auth=trust

# Start
~/.postgres16/bin/pg_ctl -D ~/.postgres16/data -l ~/.postgres16/postgres.log start

# Create user + database (one-time)
~/.postgres16/bin/psql -U postgres -c "CREATE USER micro_user WITH PASSWORD 'micro_pass';"
~/.postgres16/bin/psql -U postgres -c "CREATE DATABASE micro_mentorship OWNER micro_user ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8' TEMPLATE template0;"
```

### 2. API

```bash
cd api
~/.python312/bin/python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit JWT_SECRET
alembic upgrade head
python seed_industries.py
```

### 3. Web

```bash
cd web
npm install
```

---

## Local startup (every session)

Open three terminal tabs:

**Tab 1 — PostgreSQL**
```bash
~/.postgres16/bin/pg_ctl -D ~/.postgres16/data -l ~/.postgres16/postgres.log start
```

**Tab 2 — API** (port 8000)
```bash
cd api
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Tab 3 — Web** (port 3000)
```bash
cd web
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## Smoke tests

```bash
# API health
curl http://localhost:8000/api/health
# → {"status":"ok"}

# Industries from PostgreSQL
curl http://localhost:8000/api/industries | head -c 200

# Web app
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000
# → 200
```

---

## Admin setup

```bash
# Register a user first via POST /api/users/register, then:
cd api && source .venv/bin/activate
python make_admin.py <username>
```

---

## Project layout

```
micro-mentorship/
├── web/                    ← Next.js TypeScript frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── SignalBand.tsx
│   │   └── IndustryGrid.tsx
│   └── lib/
│       └── api.ts          ← all fetch helpers
├── api/                    ← FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── routers/
│   │   └── services/
│   ├── alembic/
│   ├── seed_industries.py
│   └── make_admin.py
├── .cursor/skills/         ← AI coding conventions
│   ├── nextjs.md
│   ├── fastapi.md
│   └── postgres.md
└── README.md
```

---

## Next steps

- **Auth UI** — register / login pages in `web/app/auth/`
- **Mentor browse page** — `web/app/mentors/page.tsx` fetching `/api/mentors`
- **Booking flow** — slot picker + Stripe payment intent
- **CI/CD** — GitHub Actions: lint, type-check, pytest
- **Deployment** — Vercel (web) + Railway or Fly.io (API + managed Postgres)
