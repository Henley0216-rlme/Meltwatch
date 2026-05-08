# -*- coding: utf-8 -*-
"""
ReviewPulse Backend API
Emotion analysis API with user authentication
"""

import os
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import lru_cache

# Import routes
from routes.auth import auth_bp
from routes.user import user_bp
from routes.crawl import crawl_bp
from routes.analysis import analysis_bp

# Import database
from models.database import init_db

# Import emotion analysis module
from models.emotion import (
    EMOTION_MAP, model, tokenizer,
    load_model, get_cached_device, analyze_local, format_emotion_result, generate_suggestion
)

app = Flask(__name__)
CORS(app)

# Model configuration - re-export from emotion module
MODEL_NAME = os.environ.get('EMOTION_MODEL', 'uer/roberta-base-finetuned-dianping-chinese')


# Initialize model before first request
@app.before_request
def init_model():
    global model
    if model is None:
        try:
            load_model()
        except Exception as e:
            print(f"⚠️ Model loading failed: {e}")


# ==================== API Routes ====================

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({
        "status": "ok",
        "service": "reviewpulse-api",
        "version": "1.0.0",
        "model": MODEL_NAME,
        "device": get_cached_device()
    })


@app.route('/api/v1/analyze', methods=['POST'])
def analyze():
    """Single text sentiment analysis"""
    try:
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({
                "success": False,
                "error": "Missing text parameter"
            }), 400

        text = data['text']

        if not text or len(text.strip()) == 0:
            return jsonify({
                "success": False,
                "error": "Text cannot be empty"
            }), 400

        if len(text) > 1000:
            return jsonify({
                "success": False,
                "error": "Text length cannot exceed 1000 characters"
            }), 400

        # Call local model
        raw_result = analyze_local(text)
        result = format_emotion_result(raw_result)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500


@app.route('/api/v1/batch_analyze', methods=['POST'])
def batch_analyze():
    """Batch text sentiment analysis (max 20)"""
    try:
        data = request.get_json()

        if not data or 'texts' not in data:
            return jsonify({
                "success": False,
                "error": "Missing texts parameter"
            }), 400

        texts = data['texts']

        if not isinstance(texts, list):
            return jsonify({
                "success": False,
                "error": "texts must be an array"
            }), 400

        if len(texts) > 20:
            return jsonify({
                "success": False,
                "error": "Maximum 20 texts supported"
            }), 400

        results = []
        for text in texts:
            try:
                raw_result = analyze_local(text)
                result = format_emotion_result(raw_result)
                results.append(result)
            except Exception as e:
                results.append({
                    "error": str(e),
                    "content": text[:100]
                })

        return jsonify({
            "success": True,
            "data": results
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/v1/models', methods=['GET'])
def list_models():
    """Get available model info"""
    return jsonify({
        "success": True,
        "data": {
            "current": MODEL_NAME,
            "description": "Dianping sentiment analysis model (binary: positive/negative)",
            "labels": ["正面", "负面"],
            "device": get_cached_device(),
            "cuda_available": torch.cuda.is_available()
        }
    })


# ==================== Register Blueprints ====================
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(crawl_bp)
app.register_blueprint(analysis_bp)


if __name__ == '__main__':
    # Initialize database
    init_db()
    print("✅ Database initialized")

    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
