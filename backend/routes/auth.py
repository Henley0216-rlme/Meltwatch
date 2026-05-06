# -*- coding: utf-8 -*-
"""
Authentication routes
"""

from flask import Blueprint, request, jsonify
from models.database import User, init_db, get_session
from utils.auth import generate_token, token_required, validate_email, validate_password

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '请求数据无效'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        username = data.get('username', '').strip()

        # 验证邮箱
        if not validate_email(email):
            return jsonify({'success': False, 'error': '邮箱格式不正确'}), 400

        # 验证密码
        valid, msg = validate_password(password)
        if not valid:
            return jsonify({'success': False, 'error': msg}), 400

        session = get_session()

        # 检查邮箱是否已存在
        existing_user = session.query(User).filter_by(email=email).first()
        if existing_user:
            session.close()
            return jsonify({'success': False, 'error': '该邮箱已被注册'}), 409

        # 创建新用户
        user = User(email=email, username=username or email.split('@')[0])
        user.set_password(password)

        session.add(user)
        session.commit()

        # 生成token
        token = generate_token(user.id)
        user_data = user.to_dict()
        session.close()

        return jsonify({
            'success': True,
            'data': {
                'token': token,
                'user': user_data
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': '请求数据无效'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'success': False, 'error': '邮箱和密码不能为空'}), 400

        session = get_session()

        # 查找用户
        user = session.query(User).filter_by(email=email).first()
        session.close()

        if not user:
            return jsonify({'success': False, 'error': '邮箱或密码错误'}), 401

        if not user.check_password(password):
            return jsonify({'success': False, 'error': '邮箱或密码错误'}), 401

        if not user.is_active:
            return jsonify({'success': False, 'error': '账号已被禁用'}), 403

        # 生成token
        token = generate_token(user.id)

        return jsonify({
            'success': True,
            'data': {
                'token': token,
                'user': user.to_dict()
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """获取当前用户信息"""
    try:
        session = get_session()
        user = session.query(User).filter_by(id=request.user_id).first()
        session.close()

        if not user:
            return jsonify({'success': False, 'error': '用户不存在'}), 404

        return jsonify({
            'success': True,
            'data': user.to_dict()
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/me', methods=['PUT'])
@token_required
def update_profile():
    """更新用户信息"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '请求数据无效'}), 400

        session = get_session()
        user = session.query(User).filter_by(id=request.user_id).first()

        if not user:
            session.close()
            return jsonify({'success': False, 'error': '用户不存在'}), 404

        # 更新可选字段
        if 'username' in data:
            user.username = data['username'].strip()

        if 'password' in data:
            valid, msg = validate_password(data['password'])
            if not valid:
                session.close()
                return jsonify({'success': False, 'error': msg}), 400
            user.set_password(data['password'])

        session.commit()
        user_data = user.to_dict()
        session.close()

        return jsonify({
            'success': True,
            'data': user_data
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
