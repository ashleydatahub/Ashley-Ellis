"""
Grant admin to a user by username.
Run: python make_admin.py <username>
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db import SessionLocal
from app.models import User


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <username>")
        sys.exit(1)

    username = sys.argv[1]
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"User '{username}' not found.")
            sys.exit(1)
        user.is_admin = True
        db.commit()
        print(f"✓ {username} is now an admin.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
