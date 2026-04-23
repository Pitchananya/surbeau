# backend/blueprints/clinic_routes.py
from flask import Blueprint, request, jsonify, session
from extensions import db
from backend.models.user import User
from backend.models.clinic import ClinicProfile
from backend.models.campaign import Campaign
from backend.models.lead import Lead
from backend.models.commission import Commission
from backend.utils.decorators import login_required, role_required
from backend.utils.pagination import paginate
from backend.utils.validators import (is_valid_email, is_valid_phone,
                                       is_positive_number, sanitize_string)
from datetime import datetime, date

clinic_bp = Blueprint("clinic", __name__)


def _get_clinic(user_id):
    return ClinicProfile.query.filter_by(user_id=user_id).first()


# ── REGISTER ──────────────────────────────────────────────────────────────────
@clinic_bp.route("/register", methods=["POST"])
def register_clinic():
    data = request.get_json(silent=True) or {}

    email       = sanitize_string(data.get("email", "")).lower()
    password    = data.get("password", "")
    name        = sanitize_string(data.get("name", ""))
    phone       = sanitize_string(data.get("phone", ""))
    clinic_name = sanitize_string(data.get("clinic_name", ""))
    province    = sanitize_string(data.get("province", ""))

    errors = {}
    if not email:              errors["email"] = "required"
    elif not is_valid_email(email): errors["email"] = "invalid format"
    if not password:           errors["password"] = "required"
    elif len(password) < 6:    errors["password"] = "min 6 characters"
    if not name:               errors["name"] = "required"
    if not clinic_name:        errors["clinic_name"] = "required"
    if phone and not is_valid_phone(phone): errors["phone"] = "invalid format"

    if errors:
        return jsonify({"error": "validation failed", "fields": errors}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409

    user = User(email=email, name=name, phone=phone or None,
                role="clinic", status="active")
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    clinic = ClinicProfile(
        user_id=user.id,
        clinic_name=clinic_name,
        province=province,
        district=sanitize_string(data.get("district", "")),
        address=sanitize_string(data.get("address", ""), 500),
        license_no=sanitize_string(data.get("license_no", "")),
        line_official=sanitize_string(data.get("line_official", "")),
        facebook_url=sanitize_string(data.get("facebook_url", "")),
        instagram_url=sanitize_string(data.get("instagram_url", "")),
        status="pending",
    )
    db.session.add(clinic)
    db.session.commit()
    return jsonify({"message": "clinic registered, pending admin approval",
                    "clinic_id": clinic.id}), 201


# ── PROFILE ───────────────────────────────────────────────────────────────────
@clinic_bp.route("/profile", methods=["GET", "PUT"])
@login_required
@role_required("clinic")
def clinic_profile():
    clinic = _get_clinic(session["user_id"])
    if not clinic:
        return jsonify({"error": "clinic profile not found"}), 404

    if request.method == "GET":
        return jsonify({
            "id":            clinic.id,
            "clinic_name":   clinic.clinic_name,
            "license_no":    clinic.license_no,
            "address":       clinic.address,
            "province":      clinic.province,
            "district":      clinic.district,
            "phone":         clinic.phone,
            "line_official": clinic.line_official,
            "facebook_url":  clinic.facebook_url,
            "instagram_url": clinic.instagram_url,
            "lat":  float(clinic.latitude)  if clinic.latitude  else None,
            "lng":  float(clinic.longitude) if clinic.longitude else None,
            "status": clinic.status,
            "tier":   clinic.subscription_tier or "free",
        })

    data = request.get_json(silent=True) or {}
    if data.get("phone") and not is_valid_phone(data["phone"]):
        return jsonify({"error": "invalid phone format"}), 400

    for field in ["clinic_name","address","province","district",
                  "phone","line_official","facebook_url","instagram_url","license_no"]:
        if data.get(field) is not None:
            setattr(clinic, field, sanitize_string(data[field]))
    if data.get("lat"): clinic.latitude  = data["lat"]
    if data.get("lng"): clinic.longitude = data["lng"]
    db.session.commit()
    return jsonify({"message": "profile updated"})


# ── CAMPAIGNS ─────────────────────────────────────────────────────────────────
@clinic_bp.route("/campaigns", methods=["GET"])
@login_required
@role_required("clinic")
def list_own_campaigns():
    clinic = _get_clinic(session["user_id"])
    if not clinic:
        return jsonify({"error": "clinic not found"}), 404

    query = Campaign.query.filter_by(clinic_id=clinic.id)\
        .order_by(Campaign.created_at.desc())
    result = paginate(query)
    result["items"] = [{
        "id":           c.id,
        "title":        c.title,
        "description":  c.description,
        "normal_price": c.normal_price,
        "promo_price":  c.promo_price,
        "commission_per_success": c.commission_per_success,
        "is_active":    c.is_active,
        "is_featured":  c.is_featured,
        "start_date":   c.start_date.isoformat() if c.start_date else None,
        "end_date":     c.end_date.isoformat()   if c.end_date   else None,
        "created_at":   c.created_at.isoformat() if c.created_at else None,
        "lead_count":   Lead.query.filter_by(campaign_id=c.id).count(),
        "success_count":Lead.query.filter_by(campaign_id=c.id, status="success").count(),
    } for c in result["items"]]
    return jsonify(result)


@clinic_bp.route("/campaign/create", methods=["POST"])
@login_required
@role_required("clinic")
def create_campaign():
    clinic = _get_clinic(session["user_id"])
    if not clinic:
        return jsonify({"error": "clinic not found"}), 404
    if clinic.status != "approved":
        return jsonify({"error": "clinic not approved yet"}), 403

    data = request.get_json(silent=True) or {}

    title      = sanitize_string(data.get("title", ""))
    commission = data.get("commission_per_success", 0)

    errors = {}
    if not title:              errors["title"] = "required"
    if not is_positive_number(commission):
        errors["commission_per_success"] = "must be a positive number"
    if data.get("normal_price") and not is_positive_number(data["normal_price"]):
        errors["normal_price"] = "must be a positive number"
    if data.get("promo_price") and not is_positive_number(data["promo_price"]):
        errors["promo_price"] = "must be a positive number"

    if errors:
        return jsonify({"error": "validation failed", "fields": errors}), 400

    start_d = end_d = None
    if data.get("start_date"):
        try: start_d = date.fromisoformat(data["start_date"])
        except ValueError: pass
    if data.get("end_date"):
        try: end_d = date.fromisoformat(data["end_date"])
        except ValueError: pass

    campaign = Campaign(
        clinic_id=clinic.id,
        title=title,
        description=sanitize_string(data.get("description", ""), 1000),
        normal_price=float(data["normal_price"]) if data.get("normal_price") else None,
        promo_price=float(data["promo_price"]) if data.get("promo_price") else None,
        commission_per_success=float(commission),
        max_slots=data.get("max_slots"),
        start_date=start_d or date.today(),
        end_date=end_d,
        is_active=True,
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify({"message": "campaign created", "campaign_id": campaign.id}), 201


@clinic_bp.route("/campaign/<int:campaign_id>", methods=["PUT"])
@login_required
@role_required("clinic")
def update_campaign(campaign_id):
    clinic   = _get_clinic(session["user_id"])
    campaign = Campaign.query.get_or_404(campaign_id)
    if campaign.clinic_id != clinic.id:
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json(silent=True) or {}
    for field in ["title","description","normal_price","promo_price",
                  "commission_per_success","max_slots","is_active","is_featured"]:
        if data.get(field) is not None:
            setattr(campaign, field, data[field])
    db.session.commit()
    return jsonify({"message": "campaign updated"})


@clinic_bp.route("/campaign/<int:campaign_id>/toggle", methods=["POST"])
@login_required
@role_required("clinic")
def toggle_campaign(campaign_id):
    clinic   = _get_clinic(session["user_id"])
    campaign = Campaign.query.get_or_404(campaign_id)
    if campaign.clinic_id != clinic.id:
        return jsonify({"error": "forbidden"}), 403
    campaign.is_active = not campaign.is_active
    db.session.commit()
    return jsonify({"campaign_id": campaign_id, "is_active": campaign.is_active})


# ── LEADS ─────────────────────────────────────────────────────────────────────
@clinic_bp.route("/leads", methods=["GET"])
@login_required
@role_required("clinic")
def list_leads():
    """GET /clinic/leads?status=new&campaign_id=1&page=1&limit=20"""
    clinic = _get_clinic(session["user_id"])
    campaign_ids = [c.id for c in clinic.campaigns]

    status_filter   = request.args.get("status", "").strip()
    campaign_filter = request.args.get("campaign_id", type=int)

    query = Lead.query.filter(Lead.campaign_id.in_(campaign_ids))
    if status_filter in ("new","contacted","success","failed"):
        query = query.filter_by(status=status_filter)
    if campaign_filter in campaign_ids:
        query = query.filter_by(campaign_id=campaign_filter)
    query = query.order_by(Lead.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "lead_id":        l.id,
        "customer_name":  l.customer_name,
        "customer_phone": l.customer_phone,
        "note":           l.note,
        "campaign_id":    l.campaign_id,
        "campaign_title": Campaign.query.get(l.campaign_id).title
                          if Campaign.query.get(l.campaign_id) else None,
        "status":         l.status,
        "created_at":     l.created_at.isoformat() if l.created_at else None,
    } for l in result["items"]]
    return jsonify(result)


@clinic_bp.route("/lead/<int:lead_id>/status", methods=["PUT"])
@login_required
@role_required("clinic")
def update_lead_status(lead_id):
    valid_statuses = ("new","contacted","success","failed")
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "")

    if new_status not in valid_statuses:
        return jsonify({"error": f"status must be one of {valid_statuses}"}), 400

    lead     = Lead.query.get_or_404(lead_id)
    clinic   = _get_clinic(session["user_id"])
    campaign = Campaign.query.get_or_404(lead.campaign_id)

    if campaign.clinic_id != clinic.id:
        return jsonify({"error": "forbidden"}), 403

    # ป้องกัน revert จาก success
    if lead.status == "success" and new_status != "success":
        return jsonify({"error": "cannot change status once marked success"}), 400

    lead.status            = new_status
    lead.status_updated_at = datetime.utcnow()
    lead.status_updated_by = session["user_id"]

    commission_created = False
    if new_status == "success":
        existing = Commission.query.filter_by(lead_id=lead.id).first()
        if not existing:
            com = Commission(
                sale_id=lead.sale_id,
                lead_id=lead.id,
                amount=campaign.commission_per_success or 0,
                status="pending",
            )
            db.session.add(com)
            commission_created = True

    db.session.commit()
    return jsonify({
        "message":           "lead status updated",
        "commission_created": commission_created,
    })


# ── DASHBOARD ─────────────────────────────────────────────────────────────────
@clinic_bp.route("/dashboard/summary", methods=["GET"])
@login_required
@role_required("clinic")
def clinic_dashboard():
    clinic = _get_clinic(session["user_id"])
    if not clinic:
        return jsonify({"error": "clinic not found"}), 404

    campaign_ids = [c.id for c in clinic.campaigns]
    all_leads    = Lead.query.filter(Lead.campaign_id.in_(campaign_ids)).all()
    total_com    = db.session.query(db.func.sum(Commission.amount))\
        .join(Lead).filter(Lead.campaign_id.in_(campaign_ids)).scalar() or 0

    # conversion rate
    success = sum(1 for l in all_leads if l.status == "success")
    conv    = round(success / len(all_leads) * 100, 1) if all_leads else 0

    return jsonify({
        "clinic_name":       clinic.clinic_name,
        "status":            clinic.status,
        "tier":              clinic.subscription_tier or "free",
        "campaigns_total":   len(clinic.campaigns),
        "campaigns_active":  sum(1 for c in clinic.campaigns if c.is_active),
        "leads_total":       len(all_leads),
        "leads_new":         sum(1 for l in all_leads if l.status == "new"),
        "leads_contacted":   sum(1 for l in all_leads if l.status == "contacted"),
        "leads_success":     success,
        "leads_failed":      sum(1 for l in all_leads if l.status == "failed"),
        "conversion_rate":   conv,
        "commission_total_due": round(float(total_com), 2),
    })


# ── SEED (dev only) ───────────────────────────────────────────────────────────
@clinic_bp.route("/seed-campaign", methods=["POST"])
def seed_campaign():
    user = User.query.filter_by(email="demo_clinic@example.com").first()
    if not user:
        user = User(email="demo_clinic@example.com", name="Demo Clinic Owner",
                    role="clinic", status="active")
        user.set_password("123456")
        db.session.add(user)
        db.session.commit()

    clinic = ClinicProfile.query.filter_by(user_id=user.id).first()
    if not clinic:
        clinic = ClinicProfile(
            user_id=user.id, clinic_name="Demo Beauty Clinic",
            province="กรุงเทพมหานคร", district="ปทุมวัน",
            phone="0800000000", status="approved",
            subscription_tier="premier",
            latitude=13.7492, longitude=100.5347,
        )
        db.session.add(clinic)
        db.session.commit()

    campaign = Campaign(
        clinic_id=clinic.id, title="โปรโบท็อกซ์หน้าผาก",
        description="ลดริ้วรอยหน้าผาก", normal_price=9990,
        promo_price=4990, commission_per_success=500,
        start_date=date.today(), is_active=True,
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify({"message": "seeded", "campaign_id": campaign.id})
