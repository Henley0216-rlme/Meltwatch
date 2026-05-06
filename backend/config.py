# -*- coding: utf-8 -*-
"""
配置文件
"""

import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()


class Config:
    """基础配置"""

    # Flask 配置
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    # API 配置
    MAX_TEXT_LENGTH = 1000
    MAX_BATCH_SIZE = 20

    # 数据库配置
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///reviewpulse.db')

    # 情感分析模型配置
    EMOTION_MODEL = os.environ.get('EMOTION_MODEL', 'uer/roberta-base-finetuned-dianping-chinese')