# backend/utils/validators.py
"""
Input validation helpers — ใช้งานใน routes ทั้งหมด
"""
import re
from functools import wraps
from flask import request, jsonify


_EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
_PHONE_RE = re.compile(r'^[0-9\+\-\s]{7,20}$')


def is_valid_email(v: str) -> bool:
    return bool(v and _EMAIL_RE.match(v.strip()))


def is_valid_phone(v: str) -> bool:
    return bool(v and _PHONE_RE.match(v.strip()))


def is_positive_number(v) -> bool:
    try:
        return float(v) >= 0
    except (TypeError, ValueError):
        return False


def validate_json(*required_fields):
    """
    Decorator — ตรวจว่า request body เป็น JSON และมี field ที่กำหนด
    ใช้งาน: @validate_json("email", "password")
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json(silent=True)
            if data is None:
                return jsonify({"error": "request body must be JSON"}), 400
            missing = [field for field in required_fields
                       if not data.get(field)]
            if missing:
                return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
            return f(*args, **kwargs)
        return wrapper
    return decorator


def sanitize_string(v: str, max_len: int = 255) -> str:
    """ตัด whitespace + จำกัดความยาว"""
    if not v:
        return ""
    return str(v).strip()[:max_len]
