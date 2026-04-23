# backend/models/lead.py

from extensions import db
from datetime import datetime

class Lead(db.Model):
    __tablename__ = "leads"

    id            = db.Column(db.Integer, primary_key=True)

    campaign_id   = db.Column(db.Integer, db.ForeignKey("campaigns.id"), nullable=False)
    sale_id       = db.Column(db.Integer, db.ForeignKey("sale_profiles.id"), nullable=False)

    customer_name = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(50), nullable=False)
    note          = db.Column(db.Text)

    status        = db.Column(db.String(20), default="new")  # new/contacted/success/failed
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    status_updated_at = db.Column(db.DateTime, nullable=True)
    status_updated_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    # ความสัมพันธ์ไป Commission (1 lead มีคอม 0–1 รายการ)
    commission = db.relationship("Commission", backref="lead", uselist=False)

    def __repr__(self):
        return f"<Lead id={self.id} name={self.customer_name} status={self.status}>"
