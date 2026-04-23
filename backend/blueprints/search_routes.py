# backend/blueprints/search_routes.py
"""
Search & Filter API
  GET /search?q=โบท็อกซ์&province=กรุงเทพ&category=botox
             &min_price=1000&max_price=9999&tier=premier
             &sort=price_asc|price_desc|rating|newest
             &page=1&limit=12
"""
from flask import Blueprint, request, jsonify
from extensions import db
from backend.models.campaign import Campaign
from backend.models.clinic import ClinicProfile
from backend.utils.pagination import paginate

search_bp = Blueprint("search", __name__)

# mapping category slug → คำที่ใช้ search ในชื่อแคมเปญ
CATEGORY_MAP = {
    "botox":      ["โบท็อกซ์", "botox", "filler", "ฟิลเลอร์"],
    "laser":      ["เลเซอร์", "laser", "หน้าใส"],
    "nose":       ["จมูก", "rhinoplasty", "nose"],
    "eye":        ["ตา", "ตา 2 ชั้น", "eye"],
    "acne":       ["สิว", "acne", "หลุมสิว"],
    "slimming":   ["สลายไขมัน", "slimming", "สัดส่วน", "ลดน้ำหนัก"],
    "treatment":  ["ทรีตเมนต์", "treatment", "ผิวหน้า"],
    "dental":     ["ทันตกรรม", "dental", "ฟัน", "จัดฟัน"],
    "lifting":    ["ยกกระชับ", "lifting", "facelift", "v-line"],
    "skin":       ["ผิว", "skin", "whitening", "ขาว", "กระ"],
}


@search_bp.route("", methods=["GET"])
def search():
    q         = request.args.get("q", "").strip()
    province  = request.args.get("province", "").strip()
    category  = request.args.get("category", "").strip().lower()
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    tier      = request.args.get("tier", "").strip()
    sort      = request.args.get("sort", "newest")

    query = Campaign.query.filter_by(is_active=True)\
        .join(ClinicProfile, Campaign.clinic_id == ClinicProfile.id)\
        .filter(ClinicProfile.status == "approved")

    # ── keyword search ────────────────────────────────────────────────────────
    if q:
        like = f"%{q}%"
        query = query.filter(
            db.or_(
                Campaign.title.ilike(like),
                Campaign.description.ilike(like),
                ClinicProfile.clinic_name.ilike(like),
            )
        )

    # ── category ──────────────────────────────────────────────────────────────
    if category and category in CATEGORY_MAP:
        keywords = CATEGORY_MAP[category]
        cond = db.or_(*[Campaign.title.ilike(f"%{kw}%") for kw in keywords])
        query = query.filter(cond)

    # ── province ──────────────────────────────────────────────────────────────
    if province:
        query = query.filter(ClinicProfile.province.ilike(f"%{province}%"))

    # ── tier filter ───────────────────────────────────────────────────────────
    if tier in ("free", "verified", "premier"):
        query = query.filter(ClinicProfile.subscription_tier == tier)

    # ── price range ───────────────────────────────────────────────────────────
    if min_price is not None:
        query = query.filter(Campaign.promo_price >= min_price)
    if max_price is not None:
        query = query.filter(Campaign.promo_price <= max_price)

    # ── sort ──────────────────────────────────────────────────────────────────
    if sort == "price_asc":
        query = query.order_by(Campaign.promo_price.asc())
    elif sort == "price_desc":
        query = query.order_by(Campaign.promo_price.desc())
    elif sort == "rating":
        query = query.order_by(ClinicProfile.rating_avg.desc())
    elif sort == "featured":
        query = query.order_by(Campaign.is_featured.desc(), Campaign.created_at.desc())
    else:  # newest
        query = query.order_by(Campaign.created_at.desc())

    # ── paginate ──────────────────────────────────────────────────────────────
    result = paginate(query, default_limit=12, max_limit=50)

    items = []
    for c in result["items"]:
        clinic = c.clinic
        items.append({
            "id":           c.id,
            "title":        c.title,
            "description":  c.description,
            "normal_price": c.normal_price,
            "promo_price":  c.promo_price,
            "commission":   c.commission_per_success,
            "is_featured":  c.is_featured,
            "clinic": {
                "id":         clinic.id,
                "name":       clinic.clinic_name,
                "province":   clinic.province,
                "district":   clinic.district,
                "tier":       clinic.subscription_tier or "free",
                "rating_avg": float(clinic.rating_avg or 0),
                "rating_count": clinic.rating_count or 0,
            } if clinic else None,
        })

    result["items"] = items
    result["query"] = {
        "q": q, "province": province, "category": category,
        "min_price": min_price, "max_price": max_price,
        "tier": tier, "sort": sort,
    }
    return jsonify(result)


# ── Autocomplete สำหรับ search bar ────────────────────────────────────────────
@search_bp.route("/suggest", methods=["GET"])
def suggest():
    """
    GET /search/suggest?q=โบ
    คืน list suggestions สูงสุด 8 รายการ
    """
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify([])

    like = f"%{q}%"
    campaigns = Campaign.query.filter(
        Campaign.title.ilike(like), Campaign.is_active == True
    ).limit(5).all()

    clinics = ClinicProfile.query.filter(
        ClinicProfile.clinic_name.ilike(like),
        ClinicProfile.status == "approved"
    ).limit(3).all()

    suggestions = []
    for c in campaigns:
        suggestions.append({"type": "campaign", "id": c.id, "text": c.title})
    for cl in clinics:
        suggestions.append({"type": "clinic", "id": cl.id, "text": cl.clinic_name})

    return jsonify(suggestions)
