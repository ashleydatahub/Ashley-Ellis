from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.auth import current_user, require_admin
from app.db import get_db
from app.models import MentorProfile, User
from app.schemas import MentorOut, MentorProfileCreate, MentorProfileUpdate, SlotCreate, SlotOut
from app.services import mentor_service
from app.models import AvailabilitySlot

router = APIRouter(prefix="/api/mentors", tags=["mentors"])


@router.get("", response_model=list[MentorOut])
def list_mentors(
    industry_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(MentorProfile).filter(MentorProfile.is_active == True)  # noqa: E712
    if industry_id is not None:
        q = q.filter(MentorProfile.industries.any(id=industry_id))
    return q.all()


@router.get("/{mentor_id}", response_model=MentorOut)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    return mentor_service.get_or_404(db, mentor_id)


@router.post("", response_model=MentorOut, status_code=status.HTTP_201_CREATED)
def create_mentor_profile(
    payload: MentorProfileCreate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    return mentor_service.create_profile(db, user, payload)


@router.patch("/me", response_model=MentorOut)
def update_my_mentor_profile(
    payload: MentorProfileUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    return mentor_service.update_profile(db, user, payload)


# ── Availability ──────────────────────────────

@router.get("/{mentor_id}/slots", response_model=list[SlotOut])
def list_slots(mentor_id: int, db: Session = Depends(get_db)):
    mentor = mentor_service.get_or_404(db, mentor_id)
    return [s for s in mentor.availability_slots if not s.is_booked]


@router.post("/me/slots", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def add_slot(
    payload: SlotCreate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException
    if not user.mentor_profile:
        raise HTTPException(status_code=400, detail="You don't have a mentor profile")
    slot = AvailabilitySlot(
        mentor_profile_id=user.mentor_profile.id,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


# ── Admin: verify mentor ──────────────────────

@router.post("/{mentor_id}/verify", response_model=MentorOut)
def verify_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mentor = mentor_service.get_or_404(db, mentor_id)
    mentor.is_verified = True
    db.commit()
    db.refresh(mentor)
    return mentor
