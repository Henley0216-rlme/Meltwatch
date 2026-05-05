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
    
    # 阿里云凭证
    ALIBABA_CLOUD_ACCESS_KEY_ID = os.environ.get('ALIBABA_CLOUD_ACCESS_KEY_ID')
    ALIBABA_CLOUD_ACCESS_KEY_SECRET = os.environ.get('ALIBABA_CLOUD_ACCESS_KEY_SECRET')
    
    # Flask 配置
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # API 配置
    MAX_TEXT_LENGTH = 1000
    MAX_BATCH_SIZE = 20
    
    # 阿里云 NLP 配置
    NLP_SERVICE_NAME = 'DeepEmotionBert'  # 高精度版
    NLP_REGION = 'cn-hangzhou'