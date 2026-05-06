# -*- coding: utf-8 -*-
"""
ReviewPulse Backend API
Emotion analysis API with user authentication
"""

import os
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from functools import lru_cache

# Import routes
from routes.auth import auth_bp
from routes.user import user_bp
from routes.crawl import crawl_bp

# Import database
from models.database import init_db

app = Flask(__name__)
CORS(app)

# Model configuration
MODEL_NAME = os.environ.get('EMOTION_MODEL', 'uer/roberta-base-finetuned-dianping-chinese')

# Emotion/Sentiment label mapping
EMOTION_MAP = {
    "正面": {"icon": "😊", "label": "满意", "category": "positive", "color": "#4caf50"},
    "负面": {"icon": "😞", "label": "不满", "category": "negative", "color": "#f44336"},
}

# Global model and tokenizer
model = None
tokenizer = None


def load_model():
    """Load local model"""
    global model, tokenizer
    if model is None:
        print(f"🔄 Loading model: {MODEL_NAME}")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        model.eval()
        print("✅ Model loaded successfully")


@lru_cache(maxsize=1)
def get_cached_device():
    """Get optimal device"""
    return "cuda" if torch.cuda.is_available() else "cpu"


def analyze_local(text):
    """
    Analyze sentiment using local model

    Args:
        text: Text to analyze

    Returns:
        dict: Analysis result
    """
    if model is None:
        load_model()

    device = get_cached_device()
    model.to(device)

    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # Inference
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)[0]

    # Get prediction
    pred_idx = torch.argmax(probs).item()
    confidence = probs[pred_idx].item()

    labels = ['负面', '正面']
    label = labels[pred_idx]

    return {
        "sentiment": [
            {"key": "正面", "score": float(probs[1])},
            {"key": "负面", "score": float(probs[0])}
        ],
        "content": text,
        "prediction": label,
        "confidence": confidence
    }


def format_emotion_result(raw_result):
    """Format emotion analysis result"""
    prediction = raw_result['prediction']
    confidence = raw_result['confidence']
    sentiment = raw_result['sentiment']

    mapped = EMOTION_MAP.get(prediction, EMOTION_MAP["正面"])

    all_emotions = []
    for s in sentiment:
        if s['key'] in EMOTION_MAP:
            m = EMOTION_MAP[s['key']]
            all_emotions.append({
                "key": s['key'],
                "label": m['label'],
                "icon": m['icon'],
                "category": m['category'],
                "score": round(s['score'], 4)
            })

    primary_emotion = {
        "key": prediction,
        "label": mapped['label'],
        "icon": mapped['icon'],
        "category": mapped['category'],
        "score": round(confidence, 4)
    }

    return {
        "emotion": primary_emotion,
        "all_emotions": all_emotions,
        "content": raw_result.get('content', ''),
        "suggestion": generate_suggestion(primary_emotion),
        "source": "local"
    }


def generate_suggestion(emotion):
    """Generate suggestion based on emotion"""
    category = emotion['category']
    label = emotion['label']

    suggestions = {
        "positive": {
            "满意": "用户非常满意，建议继续保持并邀请好评"
        },
        "negative": {
            "不满": "用户有不满情绪，建议及时处理并改进"
        }
    }

    return suggestions.get(category, {}).get(label, "建议持续关注用户反馈")


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


if __name__ == '__main__':
    # Initialize database
    init_db()
    print("✅ Database initialized")

    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
