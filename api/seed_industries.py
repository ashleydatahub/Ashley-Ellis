"""
Idempotent seed for industries.
Run: python seed_industries.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db import SessionLocal
from app.models import Industry

SEED = [
    ("Software · product", 8.7, "talent pool depth · high noise"),
    ("Law · corporate", 7.9, "up-or-out paths crowded"),
    ("Medicine · clinical", 7.2, "training pipeline saturated"),
    ("Music · recording", 6.8, "access easy · breakthrough hard"),
    ("Finance · markets", 8.1, "competition for seats"),
    ("Design · digital", 7.4, "portfolio density"),
    ("Academia · tenure track", 8.9, "fewer lines · more PhDs"),
    ("Media · journalism", 7.0, "outlets shrink · voices multiply"),
    ("Real estate · brokerage", 6.2, "cyclical · local variance"),
    ("Skilled trades", 4.1, "undersupply in many regions"),
]


def main() -> None:
    db = SessionLocal()
    try:
        created = 0
        for name, saturation, note in SEED:
            existing = db.query(Industry).filter(Industry.name == name).first()
            if not existing:
                db.add(
                    Industry(
                        name=name,
                        saturation_tenths=round(saturation * 10),
                        note=note,
                    )
                )
                created += 1
        db.commit()
        print(f"Seeded {created} industries ({len(SEED) - created} already existed).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
