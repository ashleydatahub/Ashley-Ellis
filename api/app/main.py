from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import Base, engine
from app.routers import industries, mentors, sessions, users

# Create all tables (Alembic handles this in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Micro Mentorship API",
    description="Fifteen minutes. Real signal.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(industries.router)
app.include_router(mentors.router)
app.include_router(sessions.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
