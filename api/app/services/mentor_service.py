from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Industry, MentorProfile, User
from app.schemas import MentorProfileCreate, MentorProfileUpdate


def get_or_404(db: Session, mentor_id: int) -> MentorProfile:
    m = db.get(MentorProfile, mentor_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    return m


def resolve_industries(db: Session, industry_ids: list[int]) -> list[Industry]:
    industries = db.query(Industry).filter(Industry.id.in_(industry_ids)).all()
    if len(industries) != len(industry_ids):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="One or more industry IDs not found",
        )
    return industries


def create_profile(db: Session, user: User, payload: MentorProfileCreate) -> MentorProfile:
    if user.mentor_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Mentor profile already exists for this user",
        )
    industries = resolve_industries(db, payload.industry_ids)
    profile = MentorProfile(
        user_id=user.id,
        display_name=payload.display_name,
        bio=payload.bio,
        session_price_cents=payload.session_price_cents,
        pseudonym_only=payload.pseudonym_only,
        industries=industries,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_profile(
    db: Session, user: User, payload: MentorProfileUpdate
) -> MentorProfile:
    profile = user.mentor_profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No mentor profile")

    if payload.display_name is not None:
        profile.display_name = payload.display_name
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.session_price_cents is not None:
        profile.session_price_cents = payload.session_price_cents
    if payload.pseudonym_only is not None:
        profile.pseudonym_only = payload.pseudonym_only
    if payload.is_active is not None:
        profile.is_active = payload.is_active
    if payload.industry_ids is not None:
        profile.industries = resolve_industries(db, payload.industry_ids)

    db.commit()
    db.refresh(profile)
    return profile
