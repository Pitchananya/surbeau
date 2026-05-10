# backend/blueprints/admin_routes.py
from flask import Blueprint, request, jsonify, session
from extensions import db
from models.user import User
from models.sale import SaleProfile
from models.clinic import ClinicProfile
from models.campaign import Campaign
from models.lead import Lead
from models.commission import Commission
from models.payout import PayoutRequest
from utils.decorators import login_required, role_required
from utils.pagination import paginate
from datetime import datetime

admin_bp = Blueprint("admin", __name__)


# ── DASHBOARD ─────────────────────────────────────────────────────────────────
@admin_bp.route("/dashboard/summary", methods=["GET"])
@login_required
@role_required("admin")
def admin_summary():
    total_com_pending = float(
        db.session.query(db.func.sum(Commission.amount))
        .filter_by(status="pending").scalar() or 0)
    total_com_paid = float(
        db.session.query(db.func.sum(Commission.amount))
        .filter_by(status="paid").scalar() or 0)

    return jsonify({
        "users": {
            "total":  User.query.count(),
            "sale":   User.query.filter_by(role="sale").count(),
            "clinic": User.query.filter_by(role="clinic").count(),
            "admin":  User.query.filter_by(role="admin").count(),
        },
        "pending_approvals": {
            "sales":   SaleProfile.query.filter_by(status="pending").count(),
            "clinics": ClinicProfile.query.filter_by(status="pending").count(),
        },
        "campaigns_active":  Campaign.query.filter_by(is_active=True).count(),
        "leads_total":       Lead.query.count(),
        "leads_today":       Lead.query.filter(
            db.func.date(Lead.created_at) == db.func.date(datetime.utcnow())
        ).count(),
        "leads_success":     Lead.query.filter_by(status="success").count(),
        "commissions": {
            "pending":  round(total_com_pending, 2),
            "paid":     round(total_com_paid, 2),
        },
        "payout_requests_pending": PayoutRequest.query.filter_by(status="pending").count(),
    })


# ── USERS ─────────────────────────────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
@login_required
@role_required("admin")
def list_users():
    role   = request.args.get("role", "").strip()
    status = request.args.get("status", "").strip()
    query  = User.query
    if role in ("admin","sale","clinic"): query = query.filter_by(role=role)
    if status: query = query.filter_by(status=status)
    query = query.order_by(User.id.desc())

    result = paginate(query)
    result["items"] = [{
        "id": u.id, "email": u.email, "name": u.name,
        "phone": u.phone, "role": u.role, "status": u.status,
    } for u in result["items"]]
    return jsonify(result)


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@login_required
@role_required("admin")
def get_user(user_id):
    u = User.query.get_or_404(user_id)
    data = {
        "id": u.id, "email": u.email, "name": u.name,
        "phone": u.phone, "role": u.role, "status": u.status,
    }
    if u.role == "sale" and u.sale_profile:
        sp = u.sale_profile
        data["sale_profile"] = {
            "sale_id": sp.id, "status": sp.status,
            "bank_name": sp.bank_name, "bank_account_no": sp.bank_account_no,
            "promptpay": sp.promptpay,
            "total_leads": Lead.query.filter_by(sale_id=sp.id).count(),
            "success_leads": Lead.query.filter_by(sale_id=sp.id, status="success").count(),
            "total_commission": float(
                db.session.query(db.func.sum(Commission.amount))
                .filter_by(sale_id=sp.id).scalar() or 0),
        }
    if u.role == "clinic" and u.clinic_profile:
        cp = u.clinic_profile
        data["clinic_profile"] = {
            "clinic_id": cp.id, "clinic_name": cp.clinic_name,
            "province": cp.province, "status": cp.status,
            "tier": cp.subscription_tier or "free",
            "rating_avg": float(cp.rating_avg or 0),
        }
    return jsonify(data)


@admin_bp.route("/users/<int:user_id>/block", methods=["POST"])
@login_required
@role_required("admin")
def block_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == "admin":
        return jsonify({"error": "cannot block admin"}), 400
    user.status = "blocked"
    db.session.commit()
    return jsonify({"message": f"user {user_id} blocked"})


@admin_bp.route("/users/<int:user_id>/unblock", methods=["POST"])
@login_required
@role_required("admin")
def unblock_user(user_id):
    user = User.query.get_or_404(user_id)
    user.status = "active"
    db.session.commit()
    return jsonify({"message": f"user {user_id} unblocked"})


# ── SALES ─────────────────────────────────────────────────────────────────────
@admin_bp.route("/sales", methods=["GET"])
@login_required
@role_required("admin")
def list_sales():
    status = request.args.get("status", "pending").strip()
    query  = SaleProfile.query
    if status: query = query.filter_by(status=status)
    query = query.order_by(SaleProfile.id.desc())

    result = paginate(query)
    result["items"] = [{
        "sale_id":        sp.id,
        "user_id":        sp.user_id,
        "name":           sp.user.name  if sp.user else None,
        "email":          sp.user.email if sp.user else None,
        "phone":          sp.user.phone if sp.user else None,
        "status":         sp.status,
        "bank_name":      sp.bank_name,
        "bank_account_no":sp.bank_account_no,
        "promptpay":      sp.promptpay,
    } for sp in result["items"]]
    return jsonify(result)


@admin_bp.route("/sales/<int:sale_id>/approve", methods=["POST"])
@login_required
@role_required("admin")
def approve_sale(sale_id):
    sale = SaleProfile.query.get_or_404(sale_id)
    sale.status = "approved"
    db.session.commit()
    return jsonify({"message": f"sale {sale_id} approved"})


@admin_bp.route("/sales/<int:sale_id>/reject", methods=["POST"])
@login_required
@role_required("admin")
def reject_sale(sale_id):
    sale = SaleProfile.query.get_or_404(sale_id)
    sale.status = "rejected"
    db.session.commit()
    return jsonify({"message": f"sale {sale_id} rejected"})


# ── CLINICS ───────────────────────────────────────────────────────────────────
@admin_bp.route("/clinics", methods=["GET"])
@login_required
@role_required("admin")
def list_clinics():
    status = request.args.get("status", "pending").strip()
    tier   = request.args.get("tier", "").strip()
    query  = ClinicProfile.query
    if status: query = query.filter_by(status=status)
    if tier in ("free","verified","premier"):
        query = query.filter_by(subscription_tier=tier)
    query = query.order_by(ClinicProfile.id.desc())

    result = paginate(query)
    result["items"] = [{
        "clinic_id":   c.id,
        "user_id":     c.user_id,
        "clinic_name": c.clinic_name,
        "email":       c.user.email if c.user else None,
        "province":    c.province,
        "phone":       c.phone,
        "license_no":  c.license_no,
        "status":      c.status,
        "tier":        c.subscription_tier or "free",
        "rating_avg":  float(c.rating_avg or 0),
    } for c in result["items"]]
    return jsonify(result)


@admin_bp.route("/clinics/<int:clinic_id>/approve", methods=["POST"])
@login_required
@role_required("admin")
def approve_clinic(clinic_id):
    clinic = ClinicProfile.query.get_or_404(clinic_id)
    clinic.status = "approved"
    db.session.commit()
    return jsonify({"message": f"clinic {clinic_id} approved"})


@admin_bp.route("/clinics/<int:clinic_id>/reject", methods=["POST"])
@login_required
@role_required("admin")
def reject_clinic(clinic_id):
    clinic = ClinicProfile.query.get_or_404(clinic_id)
    clinic.status = "rejected"
    db.session.commit()
    return jsonify({"message": f"clinic {clinic_id} rejected"})


@admin_bp.route("/clinics/<int:clinic_id>/tier", methods=["POST"])
@login_required
@role_required("admin")
def set_clinic_tier(clinic_id):
    data = request.get_json(silent=True) or {}
    tier = data.get("tier", "free")
    if tier not in ("free","verified","premier"):
        return jsonify({"error": "tier must be free, verified, or premier"}), 400
    clinic = ClinicProfile.query.get_or_404(clinic_id)
    clinic.subscription_tier = tier
    db.session.commit()
    return jsonify({"clinic_id": clinic_id, "tier": tier})


# ── COMMISSIONS ───────────────────────────────────────────────────────────────
@admin_bp.route("/commissions", methods=["GET"])
@login_required
@role_required("admin")
def list_commissions():
    status = request.args.get("status", "pending").strip()
    query  = Commission.query
    if status: query = query.filter_by(status=status)
    query = query.order_by(Commission.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "commission_id":  c.id,
        "sale_name":      c.sale.user.name      if c.sale and c.sale.user else None,
        "sale_email":     c.sale.user.email     if c.sale and c.sale.user else None,
        "customer_name":  c.lead.customer_name  if c.lead else None,
        "amount":         c.amount,
        "status":         c.status,
        "bank_name":      c.sale.bank_name      if c.sale else None,
        "bank_account_no":c.sale.bank_account_no if c.sale else None,
        "promptpay":      c.sale.promptpay      if c.sale else None,
        "created_at":     c.created_at.isoformat()  if c.created_at  else None,
        "approved_at":    c.approved_at.isoformat() if c.approved_at else None,
        "paid_at":        c.paid_at.isoformat()     if c.paid_at     else None,
    } for c in result["items"]]
    return jsonify(result)


@admin_bp.route("/commissions/<int:commission_id>/approve", methods=["POST"])
@login_required
@role_required("admin")
def approve_commission(commission_id):
    c = Commission.query.get_or_404(commission_id)
    if c.status != "pending":
        return jsonify({"error": "can only approve pending commissions"}), 400
    c.status      = "approved"
    c.approved_at = datetime.utcnow()
    c.approved_by = session["user_id"]
    db.session.commit()
    return jsonify({"message": "commission approved"})


@admin_bp.route("/commissions/<int:commission_id>/pay", methods=["POST"])
@login_required
@role_required("admin")
def mark_commission_paid(commission_id):
    c = Commission.query.get_or_404(commission_id)
    c.status  = "paid"
    c.paid_at = datetime.utcnow()
    c.paid_by = session["user_id"]
    db.session.commit()
    return jsonify({"message": "commission marked paid"})


# ── PAYOUT REQUESTS ───────────────────────────────────────────────────────────
@admin_bp.route("/payout-requests", methods=["GET"])
@login_required
@role_required("admin")
def list_payout_requests():
    status = request.args.get("status", "pending").strip()
    query  = PayoutRequest.query
    if status: query = query.filter_by(status=status)
    query = query.order_by(PayoutRequest.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "payout_id":     pr.id,
        "sale_name":     pr.sale.user.name  if pr.sale and pr.sale.user else None,
        "sale_email":    pr.sale.user.email if pr.sale and pr.sale.user else None,
        "amount":        pr.amount,
        "bank_name":     pr.bank_name,
        "bank_account_no": pr.bank_account_no,
        "promptpay":     pr.promptpay,
        "note":          pr.note,
        "status":        pr.status,
        "created_at":    pr.created_at.isoformat()   if pr.created_at   else None,
        "processed_at":  pr.processed_at.isoformat() if pr.processed_at else None,
    } for pr in result["items"]]
    return jsonify(result)


@admin_bp.route("/payout-requests/<int:payout_id>/approve", methods=["POST"])
@login_required
@role_required("admin")
def approve_payout(payout_id):
    pr = PayoutRequest.query.get_or_404(payout_id)
    if pr.status != "pending":
        return jsonify({"error": "can only approve pending requests"}), 400
    pr.status       = "approved"
    pr.processed_at = datetime.utcnow()
    pr.processed_by = session["user_id"]
    # mark awaiting_payout → paid
    coms = Commission.query.filter_by(
        sale_id=pr.sale_id, status="awaiting_payout"
    ).all()
    for c in coms:
        c.status  = "paid"
        c.paid_at = datetime.utcnow()
        c.paid_by = session["user_id"]
    db.session.commit()
    return jsonify({"message": "payout approved, commissions marked paid",
                    "commissions_paid": len(coms)})


@admin_bp.route("/payout-requests/<int:payout_id>/reject", methods=["POST"])
@login_required
@role_required("admin")
def reject_payout(payout_id):
    pr = PayoutRequest.query.get_or_404(payout_id)
    if pr.status != "pending":
        return jsonify({"error": "can only reject pending requests"}), 400
    pr.status       = "rejected"
    pr.processed_at = datetime.utcnow()
    pr.processed_by = session["user_id"]
    # คืน commission กลับเป็น approved
    coms = Commission.query.filter_by(
        sale_id=pr.sale_id, status="awaiting_payout"
    ).all()
    for c in coms:
        c.status = "approved"
    db.session.commit()
    return jsonify({"message": "payout rejected, commissions restored to approved",
                    "commissions_restored": len(coms)})


# ── CAMPAIGNS ─────────────────────────────────────────────────────────────────
@admin_bp.route("/campaigns", methods=["GET"])
@login_required
@role_required("admin")
def admin_list_campaigns():
    is_active = request.args.get("is_active", "").strip()
    query = Campaign.query
    if is_active == "true":  query = query.filter_by(is_active=True)
    elif is_active == "false": query = query.filter_by(is_active=False)
    query = query.order_by(Campaign.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "id":           c.id,
        "title":        c.title,
        "clinic_name":  c.clinic.clinic_name if c.clinic else None,
        "promo_price":  c.promo_price,
        "commission_per_success": c.commission_per_success,
        "is_active":    c.is_active,
        "is_featured":  c.is_featured,
        "lead_count":   Lead.query.filter_by(campaign_id=c.id).count(),
        "created_at":   c.created_at.isoformat() if c.created_at else None,
    } for c in result["items"]]
    return jsonify(result)


@admin_bp.route("/campaigns/<int:campaign_id>/feature", methods=["POST"])
@login_required
@role_required("admin")
def feature_campaign(campaign_id):
    c = Campaign.query.get_or_404(campaign_id)
    c.is_featured = not c.is_featured
    db.session.commit()
    return jsonify({"campaign_id": campaign_id, "is_featured": c.is_featured})


# ── LEADS ─────────────────────────────────────────────────────────────────────
@admin_bp.route("/leads", methods=["GET"])
@login_required
@role_required("admin")
def admin_list_leads():
    """GET /admin/leads?status=new&page=1&limit=20"""
    status = request.args.get("status", "").strip()
    query  = Lead.query
    if status in ("new","contacted","success","failed"):
        query = query.filter_by(status=status)
    query = query.order_by(Lead.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "lead_id":        l.id,
        "customer_name":  l.customer_name,
        "customer_phone": l.customer_phone,
        "campaign_title": l.campaign.title if l.campaign else None,
        "clinic_name":    l.campaign.clinic.clinic_name
                          if l.campaign and l.campaign.clinic else None,
        "sale_name":      l.sale.user.name if l.sale and l.sale.user else None,
        "status":         l.status,
        "created_at":     l.created_at.isoformat() if l.created_at else None,
    } for l in result["items"]]
    return jsonify(result)


# ── REVIEWS ───────────────────────────────────────────────────────────────────
@admin_bp.route("/reviews", methods=["GET"])
@login_required
@role_required("admin")
def list_reviews():
    from models.review import ClinicReview
    is_visible = request.args.get("is_visible", "").strip()
    query = ClinicReview.query
    if is_visible == "true":  query = query.filter_by(is_visible=True)
    elif is_visible == "false": query = query.filter_by(is_visible=False)
    query = query.order_by(ClinicReview.created_at.desc())

    result = paginate(query)
    result["items"] = [r.to_dict() for r in result["items"]]
    return jsonify(result)


# ── SEED ──────────────────────────────────────────────────────────────────────
@admin_bp.route("/seed-admin", methods=["POST"])
def seed_admin():
    if User.query.filter_by(role="admin").first():
        return jsonify({"message": "admin already exists"}), 400
    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "admin@surbeau.com")
    password = data.get("password", "admin1234")
    admin    = User(email=email, name="Admin", role="admin", status="active")
    admin.set_password(password)
    db.session.add(admin)
    db.session.commit()
    return jsonify({"message": "admin created", "email": email}), 201
