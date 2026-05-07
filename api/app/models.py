from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Column,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


# ──────────────────────────────────────────────
# Association tables
# ──────────────────────────────────────────────

mentor_industry = Table(
    "mentor_industry",
    Base.metadata,
    Column("mentor_profile_id", ForeignKey("mentor_profiles.id"), primary_key=True),
    Column("industry_id", ForeignKey("industries.id"), primary_key=True),
)


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class SessionStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class TransactionType(str, enum.Enum):
    credit = "credit"
    debit = "debit"


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    balance_cents: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    mentor_profile: Mapped[MentorProfile | None] = relationship(
        "MentorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="user")


class Industry(Base):
    __tablename__ = "industries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    # 0.0–10.0 stored as integer tenths (e.g. 87 = 8.7) to avoid float drift
    saturation_tenths: Mapped[int] = mapped_column(Integer, default=50)
    note: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    mentors: Mapped[list[MentorProfile]] = relationship(
        "MentorProfile", secondary=mentor_industry, back_populates="industries"
    )


class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    bio: Mapped[str] = mapped_column(Text, default="")
    # price per 15-minute session in cents
    session_price_cents: Mapped[int] = mapped_column(Integer, default=2500)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    pseudonym_only: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User] = relationship("User", back_populates="mentor_profile")
    industries: Mapped[list[Industry]] = relationship(
        "Industry", secondary=mentor_industry, back_populates="mentors"
    )
    availability_slots: Mapped[list[AvailabilitySlot]] = relationship(
        "AvailabilitySlot", back_populates="mentor", cascade="all, delete-orphan"
    )
    sessions: Mapped[list[Session]] = relationship("Session", back_populates="mentor")


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mentor_profile_id: Mapped[int] = mapped_column(
        ForeignKey("mentor_profiles.id"), nullable=False
    )
    starts_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False)

    mentor: Mapped[MentorProfile] = relationship(
        "MentorProfile", back_populates="availability_slots"
    )
    session: Mapped[Session | None] = relationship(
        "Session", back_populates="slot", uselist=False
    )


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mentee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    mentor_profile_id: Mapped[int] = mapped_column(
        ForeignKey("mentor_profiles.id"), nullable=False
    )
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("availability_slots.id"), unique=True, nullable=False
    )
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus), default=SessionStatus.pending
    )
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    mentee: Mapped[User] = relationship("User", foreign_keys=[mentee_id])
    mentor: Mapped[MentorProfile] = relationship("MentorProfile", back_populates="sessions")
    slot: Mapped[AvailabilitySlot] = relationship("AvailabilitySlot", back_populates="session")
    transactions: Mapped[list[Transaction]] = relationship(
        "Transaction", back_populates="session"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False)
    description: Mapped[str] = mapped_column(String(255), default="")
    session_id: Mapped[int | None] = mapped_column(ForeignKey("sessions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User] = relationship("User", back_populates="transactions")
    session: Mapped[Session | None] = relationship("Session", back_populates="transactions")
