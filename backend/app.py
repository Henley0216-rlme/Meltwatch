# -*- coding: utf-8 -*-
"""
Emotion Widget 后端服务
使用本地开源模型进行情绪/情感分析
"""

import os
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from functools import lru_cache

app = Flask(__name__)
CORS(app)

# 模型配置
MODEL_NAME = os.environ.get('EMOTION_MODEL', 'uer/roberta-base-finetuned-dianping-chinese')

# 情绪/情感标签映射（二分类：正面/负面）
EMOTION_MAP = {
    "正面": {"icon": "😊", "label": "满意", "category": "positive", "color": "#4caf50"},
    "负面": {"icon": "😞", "label": "不满", "category": "negative", "color": "#f44336"},
}

# 全局模型和分词器
model = None
tokenizer = None


def load_model():
    """加载本地模型"""
    global model, tokenizer
    if model is None:
        print(f"🔄 加载模型: {MODEL_NAME}")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        model.eval()
        print("✅ 模型加载完成")


@lru_cache(maxsize=1)
def get_cached_device():
    """获取最佳设备"""
    return "cuda" if torch.cuda.is_available() else "cpu"


def analyze_local(text):
    """
    使用本地模型进行情绪分析
    
    Args:
        text: 待分析的文本
    
    Returns:
        dict: 情绪分析结果
    """
    if model is None:
        load_model()
    
    device = get_cached_device()
    model.to(device)
    
    # 分词
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # 推理
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)[0]
    
    # 获取预测结果
    pred_idx = torch.argmax(probs).item()
    confidence = probs[pred_idx].item()
    
    # 标签映射
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
    """格式化情绪分析结果"""
    prediction = raw_result['prediction']
    confidence = raw_result['confidence']
    sentiment = raw_result['sentiment']
    
    # 获取映射
    mapped = EMOTION_MAP.get(prediction, EMOTION_MAP["正面"])
    
    # 构建所有情绪分布
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
    
    # 主情绪
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
    """根据情绪生成建议"""
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


# 初始化时预加载模型
@app.before_request
def init_model():
    if model is None:
        try:
            load_model()
        except Exception as e:
            print(f"⚠️ 模型加载失败: {e}")


# API 路由
@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "service": "emotion-widget-api",
        "version": "1.0.0",
        "model": MODEL_NAME,
        "device": get_cached_device()
    })


@app.route('/api/v1/analyze', methods=['POST'])
def analyze():
    """单条文本情绪分析"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "success": False,
                "error": "缺少 text 参数"
            }), 400
        
        text = data['text']
        
        if not text or len(text.strip()) == 0:
            return jsonify({
                "success": False,
                "error": "文本不能为空"
            }), 400
        
        if len(text) > 1000:
            return jsonify({
                "success": False,
                "error": "文本长度不能超过1000字"
            }), 400
        
        # 调用本地模型
        raw_result = analyze_local(text)
        result = format_emotion_result(raw_result)
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器错误: {str(e)}"
        }), 500


@app.route('/api/v1/batch_analyze', methods=['POST'])
def batch_analyze():
    """批量文本情绪分析（最多20条）"""
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                "success": False,
                "error": "缺少 texts 参数"
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({
                "success": False,
                "error": "texts 必须是数组"
            }), 400
        
        if len(texts) > 20:
            return jsonify({
                "success": False,
                "error": "最多支持20条文本"
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
    """获取可用模型信息"""
    return jsonify({
        "success": True,
        "data": {
            "current": MODEL_NAME,
            "description": "大众点评情感分析模型（二分类：正面/负面）",
            "labels": ["正面", "负面"],
            "device": get_cached_device(),
            "cuda_available": torch.cuda.is_available()
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)