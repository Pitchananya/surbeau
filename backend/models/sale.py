# backend/models/sale.py

from extensions import db

class SaleProfile(db.Model):
    __tablename__ = "sale_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    bio = db.Column(db.Text)
    bank_account_name = db.Column(db.String(120))
    bank_account_no = db.Column(db.String(50))
    bank_name = db.Column(db.String(80))
    promptpay = db.Column(db.String(50))

    # pending = สมัครรออนุมัติ, approved = ใช้งานได้, blocked = ถูกระงับ
    status = db.Column(db.String(20), default="pending")

    # ความสัมพันธ์กับ lead / commission (ถ้ายังไม่ใช้จะมีหรือไม่มีก็ได้)
    leads = db.relationship("Lead", backref="sale", lazy=True)
    commissions = db.relationship("Commission", backref="sale", lazy=True)

    def __repr__(self):
        return f"<SaleProfile id={self.id} user_id={self.user_id} status={self.status}>"
