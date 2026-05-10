# backend/blueprints/sale_routes.py
from flask import Blueprint, jsonify, session, request
from extensions import db
from models.sale import SaleProfile
from models.campaign import Campaign
from models.lead import Lead
from models.commission import Commission
from models.payout import PayoutRequest
from utils.decorators import login_required, role_required
from utils.pagination import paginate
from utils.validators import sanitize_string

sale_bp = Blueprint("sale", __name__)


def _get_sale(user_id):
    return SaleProfile.query.filter_by(user_id=user_id).first()


# ── DASHBOARD SUMMARY ────────────────────────────────────────────────────────
@sale_bp.route("/dashboard/summary", methods=["GET"])
@login_required
@role_required("sale")
def dashboard_summary():
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404

    leads       = Lead.query.filter_by(sale_id=sale.id).all()
    commissions = Commission.query.filter_by(sale_id=sale.id).all()

    return jsonify({
        "sale_id":     sale.id,
        "sale_status": sale.status,
        "leads": {
            "total":    len(leads),
            "new":      sum(1 for l in leads if l.status == "new"),
            "contacted":sum(1 for l in leads if l.status == "contacted"),
            "success":  sum(1 for l in leads if l.status == "success"),
            "failed":   sum(1 for l in leads if l.status == "failed"),
        },
        "commissions": {
            "total":          round(sum(c.amount for c in commissions), 2),
            "pending":        round(sum(c.amount for c in commissions if c.status == "pending"), 2),
            "approved":       round(sum(c.amount for c in commissions if c.status == "approved"), 2),
            "awaiting_payout":round(sum(c.amount for c in commissions if c.status == "awaiting_payout"), 2),
            "paid":           round(sum(c.amount for c in commissions if c.status == "paid"), 2),
        },
    })


# ── CAMPAIGNS LIST ────────────────────────────────────────────────────────────
@sale_bp.route("/campaigns", methods=["GET"])
@login_required
@role_required("sale")
def sale_list_campaigns():
    """GET /sale/campaigns?q=&province=&page=1&limit=12"""
    from models.clinic import ClinicProfile
    q        = request.args.get("q", "").strip()
    province = request.args.get("province", "").strip()

    query = Campaign.query.filter_by(is_active=True)\
        .join(ClinicProfile, Campaign.clinic_id == ClinicProfile.id)\
        .filter(ClinicProfile.status == "approved")

    if q:
        like = f"%{q}%"
        query = query.filter(db.or_(
            Campaign.title.ilike(like),
            ClinicProfile.clinic_name.ilike(like),
        ))
    if province:
        query = query.filter(ClinicProfile.province.ilike(f"%{province}%"))

    query = query.order_by(
        Campaign.is_featured.desc(),
        ClinicProfile.subscription_tier.desc(),
        Campaign.created_at.desc()
    )

    result = paginate(query, default_limit=12)
    result["items"] = [{
        "id":           c.id,
        "title":        c.title,
        "description":  c.description,
        "normal_price": c.normal_price,
        "promo_price":  c.promo_price,
        "commission_per_success": c.commission_per_success,
        "clinic_name":  c.clinic.clinic_name if c.clinic else None,
        "province":     c.clinic.province    if c.clinic else None,
        "tier":         (c.clinic.subscription_tier or "free") if c.clinic else "free",
        "is_featured":  c.is_featured,
    } for c in result["items"]]
    return jsonify(result)


# ── REFERRAL LINK ─────────────────────────────────────────────────────────────
@sale_bp.route("/referral-link/<int:campaign_id>", methods=["GET"])
@login_required
@role_required("sale")
def get_referral_link(campaign_id):
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404
    if sale.status != "approved":
        return jsonify({"error": "sale not approved yet"}), 403

    campaign = Campaign.query.get_or_404(campaign_id)
    if not campaign.is_active:
        return jsonify({"error": "campaign not active"}), 410

    base_url = request.host_url.rstrip("/")
    return jsonify({
        "sale_id":       sale.id,
        "campaign_id":   campaign_id,
        "campaign_title":campaign.title,
        "referral_link": f"{base_url}/guest/ref/{sale.id}/{campaign_id}",
    })


# ── LEADS (paginated) ─────────────────────────────────────────────────────────
@sale_bp.route("/leads", methods=["GET"])
@login_required
@role_required("sale")
def sale_list_leads():
    """GET /sale/leads?status=success&page=1&limit=20"""
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404

    status_filter = request.args.get("status", "").strip()
    query = Lead.query.filter_by(sale_id=sale.id)
    if status_filter in ("new", "contacted", "success", "failed"):
        query = query.filter_by(status=status_filter)
    query = query.order_by(Lead.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "lead_id":        l.id,
        "campaign_id":    l.campaign_id,
        "campaign_title": Campaign.query.get(l.campaign_id).title
                          if Campaign.query.get(l.campaign_id) else None,
        "customer_name":  l.customer_name,
        "customer_phone": l.customer_phone,
        "note":           l.note,
        "status":         l.status,
        "created_at":     l.created_at.isoformat() if l.created_at else None,
    } for l in result["items"]]
    return jsonify(result)


# ── COMMISSIONS (paginated) ───────────────────────────────────────────────────
@sale_bp.route("/commissions", methods=["GET"])
@login_required
@role_required("sale")
def sale_list_commissions():
    """GET /sale/commissions?status=pending&page=1&limit=20"""
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404

    status_filter = request.args.get("status", "").strip()
    query = Commission.query.filter_by(sale_id=sale.id)
    if status_filter in ("pending","approved","awaiting_payout","paid","cancelled"):
        query = query.filter_by(status=status_filter)
    query = query.order_by(Commission.created_at.desc())

    result = paginate(query)
    result["items"] = [{
        "commission_id": c.id,
        "lead_id":       c.lead_id,
        "customer_name": Lead.query.get(c.lead_id).customer_name
                         if Lead.query.get(c.lead_id) else None,
        "amount":        c.amount,
        "status":        c.status,
        "created_at":    c.created_at.isoformat()  if c.created_at  else None,
        "approved_at":   c.approved_at.isoformat() if c.approved_at else None,
        "paid_at":       c.paid_at.isoformat()     if c.paid_at     else None,
    } for c in result["items"]]
    return jsonify(result)


# ── PAYOUT REQUEST ────────────────────────────────────────────────────────────
@sale_bp.route("/payout-request", methods=["POST"])
@login_required
@role_required("sale")
def request_payout():
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404

    # ตรวจว่ามี payout pending อยู่แล้ว
    existing = PayoutRequest.query.filter_by(
        sale_id=sale.id, status="pending"
    ).first()
    if existing:
        return jsonify({
            "error": "you already have a pending payout request",
            "payout_id": existing.id,
        }), 400

    approved_coms = Commission.query.filter_by(
        sale_id=sale.id, status="approved"
    ).all()
    if not approved_coms:
        return jsonify({"error": "no approved commissions to withdraw"}), 400

    total = sum(c.amount for c in approved_coms)
    data  = request.get_json(silent=True) or {}

    pr = PayoutRequest(
        sale_id=sale.id,
        amount=total,
        bank_account_name=sale.bank_account_name,
        bank_account_no=sale.bank_account_no,
        bank_name=sale.bank_name,
        promptpay=sale.promptpay,
        note=sanitize_string(data.get("note", ""), 300),
        status="pending",
    )
    db.session.add(pr)
    for c in approved_coms:
        c.status = "awaiting_payout"
    db.session.commit()

    return jsonify({
        "message":  "payout request created",
        "payout_id": pr.id,
        "amount":    round(total, 2),
    }), 201


# ── PAYOUT HISTORY ────────────────────────────────────────────────────────────
@sale_bp.route("/payout-history", methods=["GET"])
@login_required
@role_required("sale")
def payout_history():
    """GET /sale/payout-history?page=1&limit=10"""
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404

    query = PayoutRequest.query.filter_by(sale_id=sale.id)\
        .order_by(PayoutRequest.created_at.desc())

    result = paginate(query, default_limit=10)
    result["items"] = [{
        "payout_id":    p.id,
        "amount":       p.amount,
        "bank_name":    p.bank_name,
        "bank_account_no": p.bank_account_no,
        "promptpay":    p.promptpay,
        "note":         p.note,
        "status":       p.status,
        "created_at":   p.created_at.isoformat()   if p.created_at   else None,
        "processed_at": p.processed_at.isoformat() if p.processed_at else None,
    } for p in result["items"]]
    return jsonify(result)


# ── PROFILE ───────────────────────────────────────────────────────────────────
@sale_bp.route("/profile", methods=["GET", "PUT"])
@login_required
@role_required("sale")
def sale_profile():
    from models.user import User
    user = User.query.get(session["user_id"])
    sale = _get_sale(session["user_id"])
    if not sale:
        return jsonify({"error": "sale profile not found"}), 404

    if request.method == "GET":
        return jsonify({
            "name":               user.name,
            "email":              user.email,
            "phone":              user.phone,
            "status":             sale.status,
            "bank_account_name":  sale.bank_account_name,
            "bank_account_no":    sale.bank_account_no,
            "bank_name":          sale.bank_name,
            "promptpay":          sale.promptpay,
            "bio":                sale.bio,
        })

    data = request.get_json(silent=True) or {}
    from utils.validators import is_valid_phone
    if data.get("phone") and not is_valid_phone(data["phone"]):
        return jsonify({"error": "invalid phone format"}), 400

    for field in ["bank_account_name","bank_account_no","bank_name","promptpay","bio"]:
        if data.get(field) is not None:
            setattr(sale, field, sanitize_string(data[field]))
    if data.get("phone"):
        user.phone = sanitize_string(data["phone"])
    if data.get("name"):
        user.name = sanitize_string(data["name"])

    db.session.commit()
    return jsonify({"message": "profile updated"})
