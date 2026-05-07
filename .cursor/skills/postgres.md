---
name: postgres
description: Local PostgreSQL setup for this project. Use when managing the database, running queries, or troubleshooting connections.
---

# Local PostgreSQL conventions

- PostgreSQL 16 binary lives at `~/.postgres16/bin/`.
- Data directory: `~/.postgres16/data/`.
- Log file: `~/.postgres16/postgres.log`.

## Start / stop

```bash
~/.postgres16/bin/pg_ctl -D ~/.postgres16/data -l ~/.postgres16/postgres.log start
~/.postgres16/bin/pg_ctl -D ~/.postgres16/data stop
~/.postgres16/bin/pg_ctl -D ~/.postgres16/data status
```

## Connect

```bash
~/.postgres16/bin/psql -U micro_user -d micro_mentorship
```

## Credentials

| Key | Value |
|-----|-------|
| POSTGRES_USER | micro_user |
| POSTGRES_PASSWORD | micro_pass |
| POSTGRES_DB | micro_mentorship |
| DATABASE_URL | postgresql://micro_user:micro_pass@localhost:5432/micro_mentorship |

- No Docker. No Homebrew required. Standalone binary install.
- Always use `DATABASE_URL` env var in the API — never hardcode credentials.
