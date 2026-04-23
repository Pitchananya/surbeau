# backend/models/clinic.py

from extensions import db
from datetime import datetime

class ClinicProfile(db.Model):
    __tablename__ = "clinic_profiles"

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    clinic_name = db.Column(db.String(200), nullable=False)
    license_no  = db.Column(db.String(100))

    address     = db.Column(db.Text)
    province    = db.Column(db.String(100))
    district    = db.Column(db.String(100))

    latitude    = db.Column(db.Numeric(10, 7))
    longitude   = db.Column(db.Numeric(10, 7))

    phone       = db.Column(db.String(30))
    line_official = db.Column(db.String(100))
    facebook_url  = db.Column(db.String(255))
    instagram_url = db.Column(db.String(255))

    subscription_tier = db.Column(db.String(20), default="free")  # free/verified/premier
    rating_avg  = db.Column(db.Numeric(3, 2), default=0.0)
    rating_count = db.Column(db.Integer, default=0)

    status      = db.Column(db.String(20), default="pending")  # pending/approved/rejected
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    # ความสัมพันธ์: 1 คลินิกมีหลายแคมเปญ
    campaigns   = db.relationship("Campaign", backref="clinic", lazy=True)

    def __repr__(self):
        return f"<ClinicProfile id={self.id} name={self.clinic_name}>"
