# backend/blueprints/review_routes.py
from flask import Blueprint, request, jsonify, session
from extensions import db
from models.review import ClinicReview
from models.clinic import ClinicProfile
from models.lead import Lead
from utils.pagination import paginate

review_bp = Blueprint("review", __name__)


# ─── Public: ดูรีวิวของคลินิก ─────────────────────────────────────────────────
@review_bp.route("/clinic/<int:clinic_id>/reviews", methods=["GET"])
def get_reviews(clinic_id):
    """
    GET /reviews/clinic/<id>/reviews?page=1&limit=10
    """
    ClinicProfile.query.get_or_404(clinic_id)
    query = ClinicReview.query.filter_by(
        clinic_id=clinic_id, is_visible=True
    ).order_by(ClinicReview.created_at.desc())

    result = paginate(query)
    result["items"] = [r.to_dict() for r in result["items"]]
    return jsonify(result)


# ─── Public: สร้างรีวิว (ต้องมี lead_id ยืนยันว่าเคยใช้บริการ) ──────────────
@review_bp.route("/clinic/<int:clinic_id>/reviews", methods=["POST"])
def create_review(clinic_id):
    """
    body: { lead_id, reviewer_name, rating (1-5), comment }
    ถ้าไม่มี lead_id → is_verified = False
    """
    ClinicProfile.query.get_or_404(clinic_id)
    data = request.get_json() or {}

    reviewer_name = (data.get("reviewer_name") or "").strip()
    rating        = data.get("rating")
    comment       = (data.get("comment") or "").strip()
    lead_id       = data.get("lead_id")

    # Validation
    if not reviewer_name:
        return jsonify({"error": "reviewer_name is required"}), 400
    if not rating or int(rating) not in range(1, 6):
        return jsonify({"error": "rating must be 1–5"}), 400

    is_verified = False
    if lead_id:
        lead = Lead.query.get(lead_id)
        # ตรวจว่า lead นี้เป็นของคลินิกนี้จริงและสถานะ success
        if lead and lead.campaign and lead.campaign.clinic_id == clinic_id \
                and lead.status == "success":
            # ตรวจว่ายังไม่เคยรีวิว lead นี้
            existing = ClinicReview.query.filter_by(lead_id=lead_id).first()
            if existing:
                return jsonify({"error": "this lead has already been reviewed"}), 400
            is_verified = True

    review = ClinicReview(
        clinic_id=clinic_id,
        lead_id=lead_id if is_verified else None,
        reviewer_name=reviewer_name,
        rating=int(rating),
        comment=comment,
        is_verified=is_verified,
    )
    db.session.add(review)

    # อัปเดต rating_avg ของคลินิก
    _update_clinic_rating(clinic_id)
    db.session.commit()

    return jsonify({"message": "review created", "review_id": review.id,
                    "is_verified": is_verified}), 201


# ─── Admin: ซ่อน/แสดงรีวิว ────────────────────────────────────────────────────
@review_bp.route("/<int:review_id>/visibility", methods=["POST"])
def toggle_review_visibility(review_id):
    if session.get("role") != "admin":
        return jsonify({"error": "forbidden"}), 403
    r = ClinicReview.query.get_or_404(review_id)
    r.is_visible = not r.is_visible
    _update_clinic_rating(r.clinic_id)
    db.session.commit()
    return jsonify({"review_id": review_id, "is_visible": r.is_visible})


# ─── Helper ───────────────────────────────────────────────────────────────────
def _update_clinic_rating(clinic_id: int):
    """คำนวณ rating_avg และ rating_count ใหม่จากรีวิวที่ visible"""
    reviews = ClinicReview.query.filter_by(
        clinic_id=clinic_id, is_visible=True
    ).all()
    clinic = ClinicProfile.query.get(clinic_id)
    if clinic:
        if reviews:
            clinic.rating_avg   = round(sum(r.rating for r in reviews) / len(reviews), 2)
            clinic.rating_count = len(reviews)
        else:
            clinic.rating_avg   = 0
            clinic.rating_count = 0
