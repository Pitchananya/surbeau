# backend/models/review.py
from extensions import db
from datetime import datetime


class ClinicReview(db.Model):
    """
    ลูกค้า (หรือ Sale ในนามลูกค้า) ให้คะแนนและรีวิวคลินิก
    1 Lead สามารถมีรีวิวได้ 1 รายการ
    """
    __tablename__ = "clinic_reviews"

    id          = db.Column(db.Integer, primary_key=True)
    clinic_id   = db.Column(db.Integer, db.ForeignKey("clinic_profiles.id"), nullable=False)
    lead_id     = db.Column(db.Integer, db.ForeignKey("leads.id"), nullable=True)

    # ผู้รีวิว: เก็บชื่อแบบ anonymous หรือดึงจาก lead
    reviewer_name = db.Column(db.String(120), nullable=False)

    rating      = db.Column(db.Integer, nullable=False)   # 1–5
    comment     = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)     # True = มาจาก lead จริง
    is_visible  = db.Column(db.Boolean, default=True)      # Admin สามารถซ่อนได้

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":            self.id,
            "reviewer_name": self.reviewer_name,
            "rating":        self.rating,
            "comment":       self.comment,
            "is_verified":   self.is_verified,
            "created_at":    self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Review clinic={self.clinic_id} rating={self.rating}>"
