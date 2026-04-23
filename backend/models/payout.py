# backend/models/payout.py
from extensions import db
from datetime import datetime

class PayoutRequest(db.Model):
    __tablename__ = "payout_requests"

    id          = db.Column(db.Integer, primary_key=True)
    sale_id     = db.Column(db.Integer, db.ForeignKey("sale_profiles.id"), nullable=False)

    amount      = db.Column(db.Float, nullable=False)

    bank_account_name = db.Column(db.String(120))
    bank_account_no   = db.Column(db.String(50))
    bank_name         = db.Column(db.String(80))
    promptpay         = db.Column(db.String(50))
    note              = db.Column(db.Text)

    # pending → approved → rejected
    status      = db.Column(db.String(20), default="pending")

    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at  = db.Column(db.DateTime, nullable=True)
    processed_by  = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    def __repr__(self):
        return f"<PayoutRequest id={self.id} sale_id={self.sale_id} amount={self.amount}>"
