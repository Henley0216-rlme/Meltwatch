# -*- coding: utf-8 -*-
"""
Database configuration and models
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from werkzeug.security import generate_password_hash, check_password_hash

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///reviewpulse.db')

engine = create_engine(DATABASE_URL, echo=False)
Session = scoped_session(sessionmaker(bind=engine))
Base = declarative_base()


class User(Base):
    """用户模型"""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    username = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 订阅信息
    subscription_tier = Column(String(50), default='free')  # free, starter, pro, enterprise
    subscription_expires = Column(DateTime, nullable=True)

    # 使用量统计
    analysis_count = Column(Integer, default=0)
    monthly_limit = Column(Integer, default=100)  # 免费用户每月100条

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'is_active': self.is_active,
            'is_premium': self.is_premium,
            'subscription_tier': self.subscription_tier,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class AnalysisRecord(Base):
    """分析记录模型"""
    __tablename__ = 'analysis_records'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True, index=True)  # 匿名用户可以为null
    text = Column(Text, nullable=False)
    sentiment = Column(String(50), nullable=False)  # positive, negative
    confidence = Column(Float, nullable=False)
    emotion_label = Column(String(50), nullable=True)
    emotion_icon = Column(String(10), nullable=True)
    source = Column(String(50), default='api')  # api, csv, widget
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text[:100] + '...' if len(self.text) > 100 else self.text,
            'sentiment': self.sentiment,
            'confidence': self.confidence,
            'emotion_label': self.emotion_label,
            'emotion_icon': self.emotion_icon,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Subscription(Base):
    """订阅记录模型"""
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    tier = Column(String(50), nullable=False)  # starter, pro, enterprise
    status = Column(String(50), default='active')  # active, cancelled, expired
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tier': self.tier,
            'status': self.status,
            'current_period_start': self.current_period_start.isoformat() if self.current_period_start else None,
            'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
        }


def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(engine)


def get_session():
    """获取数据库会话"""
    return Session()
