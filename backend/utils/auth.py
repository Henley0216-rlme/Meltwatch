# -*- coding: utf-8 -*-
"""
Authentication utilities
"""

import os
import jwt
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days


def generate_token(user_id):
    """生成JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def decode_token(token):
    """解析JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """装饰器：验证JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 从请求头获取token
        auth_header = request.headers.get('Authorization')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return jsonify({'success': False, 'error': '缺少认证令牌'}), 401

        user_id = decode_token(token)
        if not user_id:
            return jsonify({'success': False, 'error': '令牌无效或已过期'}), 401

        # 将user_id添加到请求上下文
        request.user_id = user_id
        return f(*args, **kwargs)

    return decorated


def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """验证密码强度"""
    if len(password) < 6:
        return False, "密码长度至少6位"
    return True, ""
