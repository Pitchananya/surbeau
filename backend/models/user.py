from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id          = db.Column(db.Integer, primary_key=True)
    email       = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name        = db.Column(db.String(120), nullable=False)
    phone       = db.Column(db.String(30))
    role        = db.Column(db.String(20), nullable=False)  # admin/sale/clinic
    status      = db.Column(db.String(20), default='active')

    sale_profile   = db.relationship("SaleProfile", backref="user", uselist=False)
    clinic_profile = db.relationship("ClinicProfile", backref="user", uselist=False)

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)
