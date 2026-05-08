from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ──────────────────────────────────────────────
# Auth / User
# ──────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    balance_cents: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Industry
# ──────────────────────────────────────────────

class IndustryOut(BaseModel):
    id: int
    name: str
    saturation: float  # converted from tenths
    note: str

    model_config = {"from_attributes": True}

    @field_validator("saturation", mode="before")
    @classmethod
    def _convert_saturation(cls, v: object) -> float:
        # if we receive the raw ORM saturation_tenths we convert
        if isinstance(v, int):
            return v / 10
        return float(v)


class IndustryCreate(BaseModel):
    name: str = Field(..., max_length=128)
    saturation: float = Field(..., ge=0.0, le=10.0)
    note: str = Field("", max_length=255)


# ──────────────────────────────────────────────
# Mentor
# ──────────────────────────────────────────────

class MentorProfileCreate(BaseModel):
    display_name: str = Field(..., max_length=128)
    bio: str = ""
    session_price_cents: int = Field(2500, ge=500, le=100_000)
    industry_ids: list[int] = []
    pseudonym_only: bool = False


class MentorProfileUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    session_price_cents: int | None = Field(None, ge=500, le=100_000)
    industry_ids: list[int] | None = None
    pseudonym_only: bool | None = None
    is_active: bool | None = None


class MentorOut(BaseModel):
    id: int
    display_name: str
    bio: str
    session_price_cents: int
    is_verified: bool
    is_active: bool
    pseudonym_only: bool
    industries: list[IndustryOut]
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Availability
# ──────────────────────────────────────────────

class SlotCreate(BaseModel):
    starts_at: datetime
    ends_at: datetime


class SlotOut(BaseModel):
    id: int
    mentor_profile_id: int
    starts_at: datetime
    ends_at: datetime
    is_booked: bool

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Sessions
# ──────────────────────────────────────────────

class SessionCreate(BaseModel):
    slot_id: int


class SessionNotesUpdate(BaseModel):
    notes: str


class SessionOut(BaseModel):
    id: int
    mentee_id: int
    mentor_profile_id: int
    slot_id: int
    status: str
    price_cents: int
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Transactions
# ──────────────────────────────────────────────

class TransactionOut(BaseModel):
    id: int
    user_id: int
    amount_cents: int
    type: str
    description: str
    session_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Waitlist
# ──────────────────────────────────────────────

class WaitlistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    email: EmailStr
    role: str = Field("seeker", pattern="^(seeker|guide)$")
    industry: str = Field("", max_length=128)
    intent: str = Field("", max_length=255)
    message: str = Field("", max_length=2000)


class WaitlistOut(BaseModel):
    id: int | None = None
    name: str
    email: str
    role: str
    industry: str
    intent: str
    message: str
    received: bool = True
