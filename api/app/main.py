from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import industries, mentors, sessions, users, waitlist

app = FastAPI(
    title="Micro Mentorship API",
    description="Fifteen minutes. Real signal.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    # Also allow every preview/production deployment URL on this team
    # so the form keeps working as URLs change.
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(industries.router)
app.include_router(mentors.router)
app.include_router(sessions.router)
app.include_router(waitlist.router)


@app.get("/")
def root():
    return {
        "service": "Micro Mentorship API",
        "status": "ok",
        "docs": "/docs",
        "health": "/api/health",
        "website": "https://web-eight-chi-19.vercel.app",
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
