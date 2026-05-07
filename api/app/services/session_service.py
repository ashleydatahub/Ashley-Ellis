from fastapi import HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.models import AvailabilitySlot, Session, SessionStatus, User
from app.services.payment_service import adjust_balance


def book_session(
    db: DBSession,
    mentee: User,
    slot_id: int,
) -> Session:
    slot = db.get(AvailabilitySlot, slot_id)
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    if slot.is_booked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Slot is already booked"
        )

    mentor_profile = slot.mentor
    price = mentor_profile.session_price_cents

    if mentee.id == mentor_profile.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book your own session"
        )

    # Debit mentee
    adjust_balance(
        db,
        mentee,
        -price,
        description=f"Session booked with {mentor_profile.display_name}",
    )

    slot.is_booked = True

    session = Session(
        mentee_id=mentee.id,
        mentor_profile_id=mentor_profile.id,
        slot_id=slot.id,
        status=SessionStatus.confirmed,
        price_cents=price,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return session


def complete_session(db: DBSession, session_id: int, admin: User) -> Session:
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.status != SessionStatus.confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete a session in status '{session.status}'",
        )

    mentor_user = session.mentor.user
    # Credit mentor (platform could take a cut here)
    adjust_balance(
        db,
        mentor_user,
        session.price_cents,
        description=f"Session #{session.id} completed payout",
        session_id=session.id,
    )

    session.status = SessionStatus.completed
    db.commit()
    db.refresh(session)
    return session


def cancel_session(db: DBSession, session_id: int, requesting_user: User) -> Session:
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    is_mentee = session.mentee_id == requesting_user.id
    is_mentor = session.mentor.user_id == requesting_user.id
    if not (is_mentee or is_mentor or requesting_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if session.status not in (SessionStatus.pending, SessionStatus.confirmed):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session cannot be cancelled",
        )

    # Refund mentee
    mentee = db.get(User, session.mentee_id)
    adjust_balance(
        db,
        mentee,
        session.price_cents,
        description=f"Refund for cancelled session #{session.id}",
        session_id=session.id,
    )

    session.slot.is_booked = False
    session.status = SessionStatus.cancelled
    db.commit()
    db.refresh(session)
    return session
