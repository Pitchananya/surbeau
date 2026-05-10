# backend/blueprints/auth_routes.py
from flask import Blueprint, request, jsonify, session
from extensions import db
from models.user import User
from models.sale import SaleProfile
from utils.validators import is_valid_email, is_valid_phone, sanitize_string

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register-sale", methods=["POST"])
def register_sale():
    data     = request.get_json(silent=True) or {}
    email    = sanitize_string(data.get("email", "")).lower()
    password = data.get("password", "")
    name     = sanitize_string(data.get("name", ""))
    phone    = sanitize_string(data.get("phone", ""))

    # ── Validation ────────────────────────────────────────────────────────────
    errors = {}
    if not email:
        errors["email"] = "required"
    elif not is_valid_email(email):
        errors["email"] = "invalid format"

    if not password:
        errors["password"] = "required"
    elif len(password) < 6:
        errors["password"] = "minimum 6 characters"

    if not name:
        errors["name"] = "required"

    if phone and not is_valid_phone(phone):
        errors["phone"] = "invalid format"

    if errors:
        return jsonify({"error": "validation failed", "fields": errors}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409

    user = User(email=email, name=name, phone=phone or None,
                role="sale", status="active")
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    sale_profile = SaleProfile(user_id=user.id, status="pending")
    db.session.add(sale_profile)
    db.session.commit()

    return jsonify({"message": "registered, pending admin approval",
                    "user_id": user.id}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = sanitize_string(data.get("email", "")).lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid email or password"}), 401

    if user.status == "blocked":
        return jsonify({"error": "account has been blocked"}), 403

    if user.status != "active":
        return jsonify({"error": "account is not active"}), 403

    session["user_id"] = user.id
    session["role"]    = user.role

    return jsonify({
        "message": "login ok",
        "user_id": user.id,
        "role":    user.role,
        "name":    user.name,
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "logged out"})


@auth_bp.route("/whoami", methods=["GET"])
def whoami():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"authenticated": False}), 200

    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"authenticated": False}), 200

    extra = {}
    if user.role == "sale" and user.sale_profile:
        extra["sale_status"] = user.sale_profile.status
    if user.role == "clinic" and user.clinic_profile:
        extra["clinic_status"] = user.clinic_profile.status
        extra["clinic_id"]     = user.clinic_profile.id

    return jsonify({
        "authenticated": True,
        "user_id": user_id,
        "role":    user.role,
        "name":    user.name,
        "email":   user.email,
        **extra,
    })


@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    if "user_id" not in session:
        return jsonify({"error": "login required"}), 401

    data   = request.get_json(silent=True) or {}
    old_pw = data.get("old_password", "")
    new_pw = data.get("new_password", "")

    if not old_pw or not new_pw:
        return jsonify({"error": "old_password and new_password required"}), 400

    if len(new_pw) < 6:
        return jsonify({"error": "new password must be at least 6 characters"}), 400

    user = User.query.get(session["user_id"])
    if not user.check_password(old_pw):
        return jsonify({"error": "old password is incorrect"}), 400

    user.set_password(new_pw)
    db.session.commit()
    return jsonify({"message": "password changed"})
