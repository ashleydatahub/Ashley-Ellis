"""
All balance mutations go through adjust_balance.
It updates user.balance_cents and writes a Transaction row atomically.
The caller is responsible for committing the session after calling this.
"""

from sqlalchemy.orm import Session

from app.models import Transaction, TransactionType, User


def adjust_balance(
    db: Session,
    user: User,
    amount_cents: int,
    description: str,
    session_id: int | None = None,
) -> Transaction:
    """
    Positive amount_cents → credit (money in).
    Negative amount_cents → debit (money out).
    Raises ValueError if a debit would result in a negative balance.
    """
    if amount_cents == 0:
        raise ValueError("amount_cents must be non-zero")

    tx_type = TransactionType.credit if amount_cents > 0 else TransactionType.debit

    if tx_type == TransactionType.debit and user.balance_cents + amount_cents < 0:
        raise ValueError(
            f"Insufficient balance: have {user.balance_cents} cents, "
            f"need {abs(amount_cents)} cents"
        )

    user.balance_cents += amount_cents

    tx = Transaction(
        user_id=user.id,
        amount_cents=amount_cents,
        type=tx_type,
        description=description,
        session_id=session_id,
    )
    db.add(tx)
    return tx
