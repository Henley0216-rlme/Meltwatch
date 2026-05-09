# -*- coding: utf-8 -*-
"""
User Authentication Routes
"""

import jwt
import time
from flask import Blueprint, request, jsonify
from functools import wraps

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

# JWT Secret - in production, load from environment variable
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24 * 7  # 7 days


def get_db():
    """Get user database connection"""
    import sqlite3
    from pathlib import Path
    DB_PATH = Path(__file__).parent / "users.db"
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_user_db():
    """Initialize user database"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            zhipu_api_key TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    """Hash password with salt"""
    import secrets
    import hashlib
    salt = secrets.token_hex(16)
    hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hash_obj.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, hash_value = stored_hash.split('$')
        import hashlib
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return hash_obj.hex() == hash_value
    except:
        return False


def generate_token(user_id: int, email: str) -> str:
    """Generate JWT token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": time.time() + JWT_EXPIRY_HOURS * 3600,
        "iat": time.time()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"success": True, "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"success": False, "error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"success": False, "error": "Invalid token"}


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Missing or invalid authorization header"}), 401

        token = auth_header[7:]
        result = decode_token(token)

        if not result["success"]:
            return jsonify({"success": False, "error": result["error"]}), 401

        request.user_id = result["payload"]["user_id"]
        request.user_email = result["payload"]["email"]

        return f(*args, **kwargs)
    return decorated


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register new user"""
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Missing request body"}), 400

    email = data.get("email", "").strip().lower()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not email or not username or not password:
        return jsonify({"success": False, "error": "Email, username and password are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    if "@" not in email:
        return jsonify({"success": False, "error": "Invalid email format"}), 400

    init_user_db()

    conn = get_db()
    cursor = conn.cursor()

    # Check if email exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "Email already registered"}), 400

    # Create user
    password_hash = hash_password(password)
    cursor.execute(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        (email, username, password_hash)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    token = generate_token(user_id, email)

    return jsonify({
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "username": username
            }
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """User login"""
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Missing request body"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    init_user_db()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, email, username, password_hash FROM users WHERE email = ?",
        (email,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row or not verify_password(password, row["password_hash"]):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    token = generate_token(row["id"], row["email"])

    return jsonify({
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": row["id"],
                "email": row["email"],
                "username": row["username"]
            }
        }
    })


@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_me():
    """Get current user info"""
    init_user_db()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, email, username, zhipu_api_key, created_at FROM users WHERE id = ?",
        (request.user_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "User not found"}), 404

    return jsonify({
        "success": True,
        "data": {
            "id": row["id"],
            "email": row["email"],
            "username": row["username"],
            "zhipu_api_key": row["zhipu_api_key"],
            "created_at": row["created_at"]
        }
    })


@auth_bp.route("/me", methods=["PUT"])
@require_auth
def update_me():
    """Update current user profile"""
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Missing request body"}), 400

    init_user_db()

    conn = get_db()
    cursor = conn.cursor()

    updates = []
    params = []

    if "username" in data and data["username"].strip():
        updates.append("username = ?")
        params.append(data["username"].strip())

    if "password" in data and len(data["password"]) >= 6:
        updates.append("password_hash = ?")
        params.append(hash_password(data["password"]))

    if not updates:
        conn.close()
        return jsonify({"success": False, "error": "No valid updates provided"}), 400

    params.append(request.user_id)
    cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Profile updated"})


@auth_bp.route("/me/api-key", methods=["PUT"])
@require_auth
def update_api_key():
    """Update user's Zhipu API key"""
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Missing request body"}), 400

    api_key = data.get("zhipu_api_key", "").strip()

    init_user_db()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE users SET zhipu_api_key = ? WHERE id = ?",
        (api_key if api_key else None, request.user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "API key updated"})


# Initialize user database on module load
init_user_db()
