# backend/models/campaign.py

from extensions import db
from datetime import datetime

class Campaign(db.Model):
    __tablename__ = "campaigns"

    id         = db.Column(db.Integer, primary_key=True)
    clinic_id  = db.Column(db.Integer, db.ForeignKey("clinic_profiles.id"), nullable=False)

    title       = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)

    normal_price = db.Column(db.Float)
    promo_price  = db.Column(db.Float)

    # ค่าคอมที่ให้ sale ต่อเคสที่ success
    commission_per_success = db.Column(db.Float, nullable=False)

    max_slots   = db.Column(db.Integer)       # รับได้กี่เคส (optional)
    start_date  = db.Column(db.Date)
    end_date    = db.Column(db.Date)

    is_active   = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    # ความสัมพันธ์: 1 แคมเปญมีหลาย lead
    leads = db.relationship("Lead", backref="campaign", lazy=True)

    def __repr__(self):
        return f"<Campaign id={self.id} title={self.title}>"
