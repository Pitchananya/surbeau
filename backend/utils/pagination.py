# backend/utils/pagination.py
"""
Pagination helper — ใช้กับ SQLAlchemy query ทุก list endpoint
"""
from flask import request


def paginate(query, default_limit: int = 20, max_limit: int = 100):
    """
    รับ query parameter:
      ?page=1&limit=20
    คืน dict:
      { items: [...], page, limit, total, pages }
    """
    try:
        page  = max(1, int(request.args.get("page", 1)))
        limit = min(max_limit, max(1, int(request.args.get("limit", default_limit))))
    except (ValueError, TypeError):
        page, limit = 1, default_limit

    total   = query.count()
    items   = query.offset((page - 1) * limit).limit(limit).all()
    pages   = (total + limit - 1) // limit if limit else 1

    return {
        "page":   page,
        "limit":  limit,
        "total":  total,
        "pages":  pages,
        "items":  items,   # caller แปลง items เป็น dict เอง
    }
