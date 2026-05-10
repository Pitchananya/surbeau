from flask import Flask, render_template, jsonify
from config import Config
from extensions import db

from blueprints.auth_routes import auth_bp
from blueprints.guest_routes import guest_bp
from blueprints.sale_routes import sale_bp
from blueprints.clinic_routes import clinic_bp
from blueprints.admin_routes import admin_bp
from blueprints.search_routes import search_bp
from blueprints.review_routes import review_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(guest_bp,  url_prefix="/guest")
    app.register_blueprint(auth_bp,   url_prefix="/auth")
    app.register_blueprint(sale_bp,   url_prefix="/sale")
    app.register_blueprint(clinic_bp, url_prefix="/clinic")
    app.register_blueprint(admin_bp,  url_prefix="/admin")
    app.register_blueprint(search_bp, url_prefix="/search")
    app.register_blueprint(review_bp, url_prefix="/reviews")

    # ── Public API shortcuts (ใช้โดย frontend JS โดยตรง) ─────────────────────
    @app.route("/campaigns")
    def public_campaigns():
        """shortcut → /guest/campaigns"""
        from models.campaign import Campaign
        campaigns = Campaign.query.filter_by(is_active=True).all()
        return jsonify([{
            "id": c.id, "title": c.title, "description": c.description,
            "normal_price": c.normal_price, "promo_price": c.promo_price,
            "commission_per_success": c.commission_per_success,
            "clinic_name": c.clinic.clinic_name if c.clinic else None,
        } for c in campaigns])

    # ── Frontend pages ────────────────────────────────────────────────────────
    @app.route("/")
    def home_page():
        return render_template("home.html")

    @app.route("/for-sale")
    def for_sale_page():
        return render_template("sale_landing.html")

    @app.route("/register-sale")
    def register_sale_page():
        return render_template("register_sale.html")

    @app.route("/login-sale")
    def login_sale_page():
        return render_template("login_sale.html")

    @app.route("/sale/dashboard")
    def sale_dashboard_page():
        return render_template("sale_dashboard.html")

    @app.route("/clinic/add-campaign")
    def clinic_add_campaign_page():
        return render_template("clinic_add_campaign.html")

    @app.route("/campaign/<int:campaign_id>")
    def campaign_detail_page(campaign_id):
        """หน้า detail ของ campaign (รองรับ referral link redirect)"""
        return render_template("campaign_detail.html")

    # ── Error handlers ────────────────────────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"error": "internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)

# standalone 400/500 handlers (ไม่อยู่ใน create_app)
# Note: handlers ข้างในและข้างนอก create_app ทำงานเหมือนกันใน Flask
