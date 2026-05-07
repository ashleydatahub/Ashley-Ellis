# Micro Mentorship — API

FastAPI · SQLAlchemy 2.0 · Alembic · JWT auth · SQLite (dev) / Postgres (prod)

## Prerequisites

Install Xcode command-line tools (one-time, macOS):
```
xcode-select --install
```
Or download Python 3.12+ from https://www.python.org/downloads/

## First-time setup

```bash
cd api

# 1. Create & activate the virtualenv
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and edit env
cp .env.example .env
# → edit .env: set JWT_SECRET to a long random string

# 4. Run migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head

# 5. Seed industry data
python seed_industries.py

# 6. (Optional) Grant yourself admin
python make_admin.py <your_username>
```

## Running the server

```bash
source .venv/bin/activate        # if not already active
uvicorn app.main:app --reload --port 8000
```

Interactive docs: http://localhost:8000/docs

## API surface

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/users/register | — | Create account |
| POST | /api/users/login | — | Get JWT token |
| GET | /api/users/me | user | Current user profile |
| GET | /api/users/me/transactions | user | Balance history |
| GET | /api/industries | — | List industries + saturation |
| POST | /api/industries | admin | Add industry |
| PUT | /api/industries/{id} | admin | Update saturation |
| GET | /api/mentors | — | Browse mentors (filter: ?industry_id=) |
| GET | /api/mentors/{id} | — | Mentor detail |
| POST | /api/mentors | user | Create mentor profile |
| PATCH | /api/mentors/me | user | Update own mentor profile |
| GET | /api/mentors/{id}/slots | — | Available time slots |
| POST | /api/mentors/me/slots | user/guide | Add availability slot |
| POST | /api/mentors/{id}/verify | admin | Verify a mentor |
| POST | /api/sessions | user | Book a session (debits balance) |
| GET | /api/sessions/mine | user | My booked sessions |
| GET | /api/sessions/{id} | user | Session detail |
| POST | /api/sessions/{id}/cancel | user/admin | Cancel + auto-refund |
| POST | /api/sessions/{id}/complete | admin | Mark complete + pay mentor |
| PATCH | /api/sessions/{id}/notes | guide/admin | Add session notes |

## Switching to Postgres (production)

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/micro_mentorship
```
`psycopg2-binary` is already in requirements.txt.
