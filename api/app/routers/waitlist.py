import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import WaitlistEntry, WaitlistRole
from app.schemas import WaitlistCreate, WaitlistOut

# Vercel surfaces stdout in the function logs; INFO-level lines are fine.
logger = logging.getLogger("waitlist")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])


@router.post("", response_model=WaitlistOut, status_code=status.HTTP_201_CREATED)
def join_waitlist(payload: WaitlistCreate, db: Session = Depends(get_db)):
    """
    Accept a waitlist signup. Persists to Postgres when a database is
    available; otherwise logs the entry to stdout so submissions are still
    captured in Vercel's function logs.
    """
    role_enum = WaitlistRole(payload.role)
    log_line = (
        f"WAITLIST role={payload.role} name={payload.name!r} "
        f"email={payload.email} industry={payload.industry!r} "
        f"intent={payload.intent!r} message={payload.message!r}"
    )

    try:
        entry = WaitlistEntry(
            name=payload.name,
            email=payload.email,
            role=role_enum,
            industry=payload.industry,
            intent=payload.intent,
            message=payload.message,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        logger.info(f"{log_line} stored=true id={entry.id}")
        return WaitlistOut(
            id=entry.id,
            name=entry.name,
            email=entry.email,
            role=entry.role.value,
            industry=entry.industry,
            intent=entry.intent,
            message=entry.message,
            received=True,
        )
    except SQLAlchemyError as e:
        # No DB connection or table missing — still record the lead in logs
        logger.warning(f"{log_line} stored=false error={type(e).__name__}")
        return WaitlistOut(
            id=None,
            name=payload.name,
            email=payload.email,
            role=payload.role,
            industry=payload.industry,
            intent=payload.intent,
            message=payload.message,
            received=True,
        )
