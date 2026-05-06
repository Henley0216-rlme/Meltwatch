# -*- coding: utf-8 -*-
"""
User routes - analysis history, subscription, etc.
"""

from flask import Blueprint, request, jsonify
from models.database import User, AnalysisRecord, Subscription, get_session
from utils.auth import token_required
from datetime import datetime

user_bp = Blueprint('user', __name__, url_prefix='/api/v1/user')


@user_bp.route('/history', methods=['GET'])
@token_required
def get_analysis_history():
    """获取用户的分析历史"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        per_page = min(per_page, 100)  # 最多100条

        session = get_session()
        user = session.query(User).filter_by(id=request.user_id).first()

        if not user:
            session.close()
            return jsonify({'success': False, 'error': '用户不存在'}), 404

        # 查询分析记录
        query = session.query(AnalysisRecord).filter_by(user_id=request.user_id)
        total = query.count()
        records = query.order_by(AnalysisRecord.created_at.desc()) \
                      .offset((page - 1) * per_page) \
                      .limit(per_page) \
                      .all()

        session.close()

        return jsonify({
            'success': True,
            'data': {
                'records': [r.to_dict() for r in records],
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@user_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats():
    """获取用户统计信息"""
    try:
        session = get_session()
        user = session.query(User).filter_by(id=request.user_id).first()

        if not user:
            session.close()
            return jsonify({'success': False, 'error': '用户不存在'}), 404

        # 统计
        total_analysis = session.query(AnalysisRecord).filter_by(user_id=request.user_id).count()
        positive_count = session.query(AnalysisRecord).filter_by(
            user_id=request.user_id, sentiment='正面').count()
        negative_count = session.query(AnalysisRecord).filter_by(
            user_id=request.user_id, sentiment='负面').count()

        session.close()

        return jsonify({
            'success': True,
            'data': {
                'total_analysis': total_analysis,
                'positive_count': positive_count,
                'negative_count': negative_count,
                'monthly_limit': user.monthly_limit,
                'analysis_count': user.analysis_count,
                'subscription_tier': user.subscription_tier,
                'is_premium': user.is_premium
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@user_bp.route('/subscription', methods=['GET'])
@token_required
def get_subscription():
    """获取用户订阅信息"""
    try:
        session = get_session()
        user = session.query(User).filter_by(id=request.user_id).first()

        if not user:
            session.close()
            return jsonify({'success': False, 'error': '用户不存在'}), 404

        subscription = session.query(Subscription).filter_by(
            user_id=request.user_id, status='active').first()

        session.close()

        return jsonify({
            'success': True,
            'data': {
                'tier': user.subscription_tier,
                'is_premium': user.is_premium,
                'expires': user.subscription_expires.isoformat() if user.subscription_expires else None,
                'subscription': subscription.to_dict() if subscription else None
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
