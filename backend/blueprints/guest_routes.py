# backend/blueprints/guest_routes.py
from flask import Blueprint, jsonify, request, redirect, session
from extensions import db
from models.campaign import Campaign
from models.lead import Lead
from models.clinic import ClinicProfile
from models.sale import SaleProfile
from utils.validators import is_valid_phone, sanitize_string
from utils.pagination import paginate
from math import radians, cos, sin, asin, sqrt

guest_bp = Blueprint("guest", __name__)


# ── helpers ───────────────────────────────────────────────────────────────────
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1),
                                            float(lat2), float(lon2)])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 2 * R * asin(sqrt(a))

TIER_SCORE = {"premier": 100, "verified": 60, "free": 0}


def _campaign_dict(c):
    clinic = c.clinic
    return {
        "id":           c.id,
        "title":        c.title,
        "description":  c.description,
        "normal_price": c.normal_price,
        "promo_price":  c.promo_price,
        "commission_per_success": c.commission_per_success,
        "is_featured":  c.is_featured,
        "clinic_name":  clinic.clinic_name if clinic else None,
        "province":     clinic.province if clinic else None,
        "tier":         (clinic.subscription_tier or "free") if clinic else "free",
        "rating_avg":   float(clinic.rating_avg or 0) if clinic else 0,
    }


# ── CAMPAIGNS ─────────────────────────────────────────────────────────────────
@guest_bp.route("/campaigns", methods=["GET"])
def list_campaigns():
    """GET /guest/campaigns?q=&province=&page=1&limit=12"""
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
    result["items"] = [_campaign_dict(c) for c in result["items"]]
    return jsonify(result)


@guest_bp.route("/campaigns/<int:campaign_id>", methods=["GET"])
def campaign_detail(campaign_id):
    c = Campaign.query.get_or_404(campaign_id)
    clinic = c.clinic
    return jsonify({
        "id":           c.id,
        "title":        c.title,
        "description":  c.description,
        "normal_price": c.normal_price,
        "promo_price":  c.promo_price,
        "commission_per_success": c.commission_per_success,
        "start_date":   c.start_date.isoformat()  if c.start_date  else None,
        "end_date":     c.end_date.isoformat()    if c.end_date    else None,
        "is_active":    c.is_active,
        "clinic": {
            "id":       clinic.id,
            "name":     clinic.clinic_name,
            "province": clinic.province,
            "district": clinic.district,
            "phone":    clinic.phone,
            "tier":     clinic.subscription_tier or "free",
            "rating_avg":   float(clinic.rating_avg or 0),
            "rating_count": clinic.rating_count or 0,
            "lat":  float(clinic.latitude)  if clinic.latitude  else None,
            "lng":  float(clinic.longitude) if clinic.longitude else None,
        } if clinic else None,
    })


# ── CLINICS LIST ──────────────────────────────────────────────────────────────
@guest_bp.route("/clinics", methods=["GET"])
def list_clinics():
    """GET /guest/clinics?province=&tier=&page=1&limit=12"""
    province = request.args.get("province", "").strip()
    tier     = request.args.get("tier", "").strip()

    query = ClinicProfile.query.filter_by(status="approved")
    if province:
        query = query.filter(ClinicProfile.province.ilike(f"%{province}%"))
    if tier in ("free", "verified", "premier"):
        query = query.filter(ClinicProfile.subscription_tier == tier)

    query = query.order_by(
        ClinicProfile.subscription_tier.desc(),
        ClinicProfile.rating_avg.desc()
    )

    result = paginate(query, default_limit=12)
    result["items"] = [{
        "id":           c.id,
        "clinic_name":  c.clinic_name,
        "province":     c.province,
        "district":     c.district,
        "phone":        c.phone,
        "tier":         c.subscription_tier or "free",
        "rating_avg":   float(c.rating_avg or 0),
        "rating_count": c.rating_count or 0,
        "lat":  float(c.latitude)  if c.latitude  else None,
        "lng":  float(c.longitude) if c.longitude else None,
    } for c in result["items"]]
    return jsonify(result)


# ── CLINIC DETAIL ─────────────────────────────────────────────────────────────
@guest_bp.route("/clinics/<int:clinic_id>", methods=["GET"])
def clinic_detail(clinic_id):
    clinic = ClinicProfile.query.get_or_404(clinic_id)
    campaigns = [{
        "id":           c.id,
        "title":        c.title,
        "description":  c.description,
        "normal_price": c.normal_price,
        "promo_price":  c.promo_price,
        "commission_per_success": c.commission_per_success,
    } for c in clinic.campaigns if c.is_active]

    return jsonify({
        "id":             clinic.id,
        "clinic_name":    clinic.clinic_name,
        "license_no":     clinic.license_no,
        "address":        clinic.address,
        "province":       clinic.province,
        "district":       clinic.district,
        "phone":          clinic.phone,
        "line_official":  clinic.line_official,
        "facebook_url":   clinic.facebook_url,
        "instagram_url":  clinic.instagram_url,
        "lat":  float(clinic.latitude)  if clinic.latitude  else None,
        "lng":  float(clinic.longitude) if clinic.longitude else None,
        "tier":         clinic.subscription_tier or "free",
        "rating_avg":   float(clinic.rating_avg or 0),
        "rating_count": clinic.rating_count or 0,
        "campaigns": campaigns,
    })


# ── NEARBY CLINICS (Tiered ranking) ──────────────────────────────────────────
@guest_bp.route("/clinics/nearby", methods=["GET"])
def clinics_nearby():
    """
    GET /guest/clinics/nearby?lat=13.7&lng=100.5&radius=10&tier=all
    Score = Tier(50%) + Distance(20%) + Rating(30%)
    """
    try:
        user_lat = float(request.args.get("lat", 0))
        user_lng = float(request.args.get("lng", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "lat and lng must be numbers"}), 400

    radius   = min(float(request.args.get("radius", 50)), 200)
    province = request.args.get("province", "").strip()
    tier     = request.args.get("tier", "all").strip()
    limit    = min(int(request.args.get("limit", 20)), 50)

    query = ClinicProfile.query.filter_by(status="approved")
    if province:
        query = query.filter(ClinicProfile.province.ilike(f"%{province}%"))

    scored = []
    for clinic in query.all():
        if user_lat and user_lng and clinic.latitude and clinic.longitude:
            dist_km = haversine(user_lat, user_lng,
                                clinic.latitude, clinic.longitude)
        else:
            dist_km = 9999

        if dist_km > radius:
            continue

        sub_tier = clinic.subscription_tier or "free"
        if tier != "all" and sub_tier != tier:
            continue

        tier_s   = TIER_SCORE.get(sub_tier, 0)
        dist_s   = max(0, 100 - dist_km * 10)
        rating_s = float(clinic.rating_avg or 0) * 20
        score    = tier_s * 0.50 + dist_s * 0.20 + rating_s * 0.30

        scored.append({
            "id":           clinic.id,
            "clinic_name":  clinic.clinic_name,
            "province":     clinic.province,
            "district":     clinic.district,
            "phone":        clinic.phone,
            "lat":  float(clinic.latitude)  if clinic.latitude  else None,
            "lng":  float(clinic.longitude) if clinic.longitude else None,
            "tier":         sub_tier,
            "rating_avg":   float(clinic.rating_avg or 0),
            "rating_count": clinic.rating_count or 0,
            "distance_km":  round(dist_km, 2),
            "score":        round(score, 2),
            "campaigns": [{
                "id": c.id, "title": c.title, "promo_price": c.promo_price
            } for c in clinic.campaigns if c.is_active],
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return jsonify(scored[:limit])


# ── REFERRAL LINK ─────────────────────────────────────────────────────────────
@guest_bp.route("/ref/<int:sale_id>/<int:campaign_id>", methods=["GET"])
def referral_link(sale_id, campaign_id):
    sale     = SaleProfile.query.get_or_404(sale_id)
    campaign = Campaign.query.get_or_404(campaign_id)

    if not campaign.is_active:
        return jsonify({"error": "campaign is no longer active"}), 410
    if sale.status != "approved":
        return jsonify({"error": "sale not approved"}), 403

    session["ref_sale_id"]     = sale_id
    session["ref_campaign_id"] = campaign_id
    return redirect(f"/campaign/{campaign_id}?ref={sale_id}", code=302)


# ── LEAD FORM ─────────────────────────────────────────────────────────────────
@guest_bp.route("/lead", methods=["POST"])
def create_lead():
    """
    POST /guest/lead
    body: { campaign_id, sale_id, customer_name, customer_phone, note }
    sale_id ไม่จำเป็นถ้าเข้าผ่าน referral link (ดึงจาก session)
    """
    data = request.get_json(silent=True) or {}

    campaign_id    = data.get("campaign_id") or session.get("ref_campaign_id")
    sale_id        = data.get("sale_id")     or session.get("ref_sale_id")
    customer_name  = sanitize_string(data.get("customer_name", ""))
    customer_phone = sanitize_string(data.get("customer_phone", ""))
    note           = sanitize_string(data.get("note", ""), max_len=500)

    # ── Validation ────────────────────────────────────────────────────────────
    errors = {}
    if not campaign_id:
        errors["campaign_id"] = "required"
    if not sale_id:
        errors["sale_id"] = "required (or enter via referral link)"
    if not customer_name:
        errors["customer_name"] = "required"
    elif len(customer_name) < 2:
        errors["customer_name"] = "too short"
    if not customer_phone:
        errors["customer_phone"] = "required"
    elif not is_valid_phone(customer_phone):
        errors["customer_phone"] = "invalid format"

    if errors:
        return jsonify({"error": "validation failed", "fields": errors}), 400

    campaign = Campaign.query.get(int(campaign_id))
    if not campaign or not campaign.is_active:
        return jsonify({"error": "campaign not found or inactive"}), 404

    sale = SaleProfile.query.get(int(sale_id))
    if not sale or sale.status != "approved":
        return jsonify({"error": "invalid sale"}), 400

    lead = Lead(
        campaign_id=int(campaign_id),
        sale_id=int(sale_id),
        customer_name=customer_name,
        customer_phone=customer_phone,
        note=note,
        status="new",
    )
    db.session.add(lead)
    db.session.commit()

    session.pop("ref_sale_id", None)
    session.pop("ref_campaign_id", None)

    return jsonify({"message": "lead created", "lead_id": lead.id}), 201
