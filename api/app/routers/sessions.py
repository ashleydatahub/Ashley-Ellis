from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession

from app.auth import current_user, require_admin
from app.db import get_db
from app.models import Session, User
from app.schemas import SessionCreate, SessionNotesUpdate, SessionOut
from app.services import session_service

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def book(
    payload: SessionCreate,
    user: User = Depends(current_user),
    db: DBSession = Depends(get_db),
):
    return session_service.book_session(db, user, payload.slot_id)


@router.get("/mine", response_model=list[SessionOut])
def my_sessions(
    user: User = Depends(current_user),
    db: DBSession = Depends(get_db),
):
    return db.query(Session).filter(Session.mentee_id == user.id).all()


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    user: User = Depends(current_user),
    db: DBSession = Depends(get_db),
):
    from fastapi import HTTPException
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    is_mentee = session.mentee_id == user.id
    is_mentor = session.mentor.user_id == user.id
    if not (is_mentee or is_mentor or user.is_admin):
        raise HTTPException(status_code=403, detail="Not authorized")
    return session


@router.post("/{session_id}/cancel", response_model=SessionOut)
def cancel(
    session_id: int,
    user: User = Depends(current_user),
    db: DBSession = Depends(get_db),
):
    return session_service.cancel_session(db, session_id, user)


@router.post("/{session_id}/complete", response_model=SessionOut)
def complete(
    session_id: int,
    admin: User = Depends(require_admin),
    db: DBSession = Depends(get_db),
):
    return session_service.complete_session(db, session_id, admin)


@router.patch("/{session_id}/notes", response_model=SessionOut)
def update_notes(
    session_id: int,
    payload: SessionNotesUpdate,
    user: User = Depends(current_user),
    db: DBSession = Depends(get_db),
):
    from fastapi import HTTPException
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.mentor.user_id != user.id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Only the guide can add notes")
    session.notes = payload.notes
    db.commit()
    db.refresh(session)
    return session
