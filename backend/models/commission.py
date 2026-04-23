# backend/models/commission.py

from extensions import db
from datetime import datetime

class Commission(db.Model):
    __tablename__ = "commissions"

    id      = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sale_profiles.id"), nullable=False)
    lead_id = db.Column(db.Integer, db.ForeignKey("leads.id"), nullable=False)

    amount  = db.Column(db.Float, nullable=False)

    status  = db.Column(db.String(20), default="pending")  # pending/approved/paid/cancelled
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    paid_at     = db.Column(db.DateTime, nullable=True)

    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    paid_by     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    def __repr__(self):
        return f"<Commission id={self.id} sale_id={self.sale_id} amount={self.amount}>"
