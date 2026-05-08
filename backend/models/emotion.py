# -*- coding: utf-8 -*-
"""
情绪分析核心模块
包含模型加载、情感分析等核心功能
"""

import os
import torch
from functools import lru_cache
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 模型配置
MODEL_NAME = os.environ.get('EMOTION_MODEL', 'uer/roberta-base-finetuned-dianping-chinese')

# 中性情感阈值
NEUTRAL_THRESHOLD = 0.2

# 情绪/情感标签映射（三分类）
EMOTION_MAP = {
    "正面": {"icon": "😊", "label": "满意", "category": "positive", "color": "#4caf50"},
    "负面": {"icon": "😞", "label": "不满", "category": "negative", "color": "#f44336"},
    "中性": {"icon": "😐", "label": "一般", "category": "neutral", "color": "#718096"},
}

# 痛点关键词库
PAIN_POINT_KEYWORDS = {
    "产品质量": ["质量差", "质量一般", "质量不好", "质量堪忧", "劣质", "粗糙", "瑕疵", "破损", "坏了", "起球", "脱线", "褪色", "缩水", "变形"],
    "物流问题": ["物流慢", "发货慢", "发货迟", "等太久", "迟迟不发货", "快递慢", "物流慢", "配送慢", "运输慢"],
    "客服问题": ["客服差", "客服不理", "不理人", "态度差", "服务差", "不回消息", "不解决问题"],
    "价格问题": ["价格贵", "太贵了", "不值", "性价比低", "价不符实", "价格高", "偏贵"],
    "描述不符": ["描述不符", "和图片不一样", "图片骗人", "有色差", "货不对板", "实物与图片不符", "差距大"],
    "售后问题": ["售后差", "不退", "不换", "难退货", "退款慢", "处理慢", "推脱", "踢皮球"]
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
    使用本地模型进行情绪分析（三分类）

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
    pos_prob = probs[1].item()
    neg_prob = probs[0].item()

    # 三分类判断
    gap = abs(pos_prob - neg_prob)
    if gap < NEUTRAL_THRESHOLD:
        prediction = '中性'
        confidence = 1 - gap
    elif pos_prob > neg_prob:
        prediction = '正面'
        confidence = pos_prob
    else:
        prediction = '负面'
        confidence = neg_prob

    # 构建情感分布
    if prediction == '中性':
        sentiment = [
            {"key": "正面", "score": pos_prob},
            {"key": "负面", "score": neg_prob},
            {"key": "中性", "score": 1 - gap}
        ]
    else:
        sentiment = [
            {"key": "正面", "score": pos_prob},
            {"key": "负面", "score": neg_prob}
        ]

    return {
        "sentiment": sentiment,
        "content": text,
        "prediction": prediction,
        "confidence": confidence
    }


def format_emotion_result(raw_result):
    """格式化情绪分析结果"""
    prediction = raw_result['prediction']
    confidence = raw_result['confidence']
    sentiment = raw_result['sentiment']

    # 获取映射
    mapped = EMOTION_MAP.get(prediction, EMOTION_MAP.get("中性", EMOTION_MAP["正面"]))

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

    result = {
        "emotion": primary_emotion,
        "all_emotions": all_emotions,
        "content": raw_result.get('content', ''),
        "suggestion": generate_suggestion(primary_emotion),
        "source": "local"
    }

    return result


def generate_suggestion(emotion):
    """根据情绪生成结构化建议"""
    category = emotion['category']
    label = emotion['label']
    score = emotion['score']

    # 根据置信度确定建议等级
    if score >= 0.9:
        level = "strong"
    elif score >= 0.7:
        level = "moderate"
    elif score >= 0.5:
        level = "high"
    else:
        level = "critical"

    suggestions = {
        "positive": {
            "满意": {
                "text": "用户非常满意，建议继续保持并邀请好评",
                "actions": ["保持当前服务质量", "邀请用户发表好评", "感谢用户反馈"],
                "level": level
            }
        },
        "negative": {
            "不满": {
                "text": "用户有不满情绪，建议及时处理并改进",
                "actions": ["尽快联系用户了解情况", "提供解决方案或补偿", "分析问题根源并改进"],
                "level": "critical" if score >= 0.8 else "high"
            }
        },
        "neutral": {
            "一般": {
                "text": "用户情感中性，建议进一步了解用户需求",
                "actions": ["主动询问用户体验", "引导用户提出建议", "关注后续反馈变化"],
                "level": "moderate"
            }
        }
    }

    suggestion = suggestions.get(category, {}).get(label, {
        "text": "建议持续关注用户反馈",
        "actions": ["持续监控评价变化", "定期分析用户反馈"],
        "level": "moderate"
    })

    return {
        "text": suggestion["text"],
        "actions": suggestion["actions"],
        "confidence": score,
        "level": suggestion["level"]
    }
