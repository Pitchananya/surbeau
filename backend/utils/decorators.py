# backend/utils/decorators.py

from functools import wraps
from flask import session, jsonify

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "login required"}), 401
        return f(*args, **kwargs)
    return wrapper


def role_required(*roles):
    """
    ใช้แบบ: @role_required("clinic", "admin")
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            role = session.get("role")
            if role is None:
                return jsonify({"error": "login required"}), 401
            if role not in roles:
                return jsonify({"error": "forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
