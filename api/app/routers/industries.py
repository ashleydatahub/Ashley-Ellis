from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.db import get_db
from app.models import Industry
from app.schemas import IndustryCreate, IndustryOut

router = APIRouter(prefix="/api/industries", tags=["industries"])


@router.get("", response_model=list[IndustryOut])
def list_industries(db: Session = Depends(get_db)):
    rows = db.query(Industry).order_by(Industry.saturation_tenths.desc()).all()
    return [
        IndustryOut(
            id=r.id,
            name=r.name,
            saturation=r.saturation_tenths / 10,
            note=r.note,
        )
        for r in rows
    ]


@router.post("", response_model=IndustryOut, status_code=status.HTTP_201_CREATED)
def create_industry(
    payload: IndustryCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    industry = Industry(
        name=payload.name,
        saturation_tenths=round(payload.saturation * 10),
        note=payload.note,
    )
    db.add(industry)
    db.commit()
    db.refresh(industry)
    return IndustryOut(
        id=industry.id,
        name=industry.name,
        saturation=industry.saturation_tenths / 10,
        note=industry.note,
    )


@router.put("/{industry_id}", response_model=IndustryOut)
def update_industry(
    industry_id: int,
    payload: IndustryCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    industry = db.get(Industry, industry_id)
    if not industry:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Industry not found")
    industry.name = payload.name
    industry.saturation_tenths = round(payload.saturation * 10)
    industry.note = payload.note
    db.commit()
    db.refresh(industry)
    return IndustryOut(
        id=industry.id,
        name=industry.name,
        saturation=industry.saturation_tenths / 10,
        note=industry.note,
    )
