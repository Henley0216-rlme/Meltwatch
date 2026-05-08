# -*- coding: utf-8 -*-
"""
LLM-enhanced Analysis Routes
大模型增强分析路由
"""

from flask import Blueprint, request, jsonify
from services.zhipu_client import (
    get_zhipu_client,
    is_zhipu_enabled,
    ZhipuClient,
)
from functools import wraps

llm_bp = Blueprint("llm", __name__, url_prefix="/api/v1/llm")


def require_zhipu(f):
    """Decorator to require Zhipu AI configuration"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not is_zhipu_enabled():
            return jsonify({
                "success": False,
                "error": "Zhipu AI not configured. Set ZHIPU_API_KEY environment variable."
            }), 503
        client = get_zhipu_client()
        if not client:
            return jsonify({
                "success": False,
                "error": "Failed to initialize Zhipu client"
            }), 500
        return f(client, *args, **kwargs)
    return decorated


@llm_bp.route("/status", methods=["GET"])
def llm_status():
    """Check LLM integration status"""
    enabled = is_zhipu_enabled()
    return jsonify({
        "success": True,
        "data": {
            "enabled": enabled,
            "provider": "Zhipu AI (GLM-4)",
            "model": "glm-4-flash" if enabled else None,
            "message": "Zhipu AI is configured" if enabled else "Set ZHIPU_API_KEY to enable LLM features",
        },
    })


@llm_bp.route("/analyze", methods=["POST"])
@require_zhipu
def llm_analyze(client: ZhipuClient):
    """
    Enhanced sentiment analysis with LLM context understanding
    POST /api/v1/llm/analyze

    Body:
    {
        "text": "评论文本",
        "product_info": "产品信息（可选）",
        "previous_reviews": ["历史评论1", "历史评论2"]（可选）
    }
    """
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"success": False, "error": "Missing text parameter"}), 400

    text = data["text"]
    product_info = data.get("product_info")
    previous_reviews = data.get("previous_reviews")

    if len(text) > 2000:
        return jsonify({"success": False, "error": "Text too long (max 2000 chars)"}), 400

    result = client.analyze_sentiment_with_context(
        text=text,
        product_info=product_info,
        previous_reviews=previous_reviews,
    )

    if result["success"]:
        return jsonify({"success": True, "data": result["data"]})
    return jsonify({"success": False, "error": result["error"]}), 500


@llm_bp.route("/batch_analyze", methods=["POST"])
@require_zhipu
def llm_batch_analyze(client: ZhipuClient):
    """
    Batch analyze with aggregated insights
    POST /api/v1/llm/batch_analyze

    Body:
    {
        "texts": ["评论1", "评论2", ...],
        "batch_size": 10（可选，默认10）
    }
    """
    data = request.get_json()

    if not data or "texts" not in data:
        return jsonify({"success": False, "error": "Missing texts parameter"}), 400

    texts = data["texts"]
    batch_size = data.get("batch_size", 10)

    if not isinstance(texts, list):
        return jsonify({"success": False, "error": "texts must be an array"}), 400

    if len(texts) > 50:
        return jsonify({"success": False, "error": "Maximum 50 texts supported"}), 400

    result = client.batch_analyze_with_insights(texts=texts, batch_size=batch_size)

    if result["success"]:
        return jsonify({"success": True, "data": result["data"]})
    return jsonify({"success": False, "error": result["error"]}), 500


@llm_bp.route("/generate_response", methods=["POST"])
@require_zhipu
def llm_generate_response(client: ZhipuClient):
    """
    Generate suggested response for negative reviews
    POST /api/v1/llm/generate_response

    Body:
    {
        "negative_review": "负面评论文本",
        "tone": "professional/casual/friendly"（可选，默认professional）
    }
    """
    data = request.get_json()

    if not data or "negative_review" not in data:
        return jsonify({"success": False, "error": "Missing negative_review parameter"}), 400

    review = data["negative_review"]
    tone = data.get("tone", "professional")

    if len(review) > 1000:
        return jsonify({"success": False, "error": "Review too long (max 1000 chars)"}), 400

    result = client.generate_response_suggestion(negative_review=review, tone=tone)

    if result["success"]:
        return jsonify({"success": True, "data": result["data"]})
    return jsonify({"success": False, "error": result["error"]}), 500


@llm_bp.route("/chat", methods=["POST"])
@require_zhipu
def llm_chat(client: ZhipuClient):
    """
    General purpose chat with GLM
    POST /api/v1/llm/chat

    Body:
    {
        "messages": [{"role": "user", "content": "..."}],
        "temperature": 0.7（可选）,
        "max_tokens": 2048（可选）
    }
    """
    data = request.get_json()

    if not data or "messages" not in data:
        return jsonify({"success": False, "error": "Missing messages parameter"}), 400

    messages = data["messages"]
    temperature = data.get("temperature")
    max_tokens = data.get("max_tokens")

    if not isinstance(messages, list) or len(messages) == 0:
        return jsonify({"success": False, "error": "messages must be a non-empty array"}), 400

    result = client.chat(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    if result["success"]:
        return jsonify({
            "success": True,
            "data": {
                "content": result["data"]["content"],
                "usage": result["data"].get("usage"),
            },
        })
    return jsonify({"success": False, "error": result["error"]}), 500


@llm_bp.route("/summarize_reviews", methods=["POST"])
@require_zhipu
def llm_summarize_reviews(client: ZhipuClient):
    """
    Generate a summary report from review texts
    POST /api/v1/llm/summarize_reviews

    Body:
    {
        "reviews": ["评论1", "评论2", ...],
        "product_name": "产品名称"（可选）
    }
    """
    data = request.get_json()

    if not data or "reviews" not in data:
        return jsonify({"success": False, "error": "Missing reviews parameter"}), 400

    reviews = data["reviews"]
    product_name = data.get("product_name", "")

    if not isinstance(reviews, list):
        return jsonify({"success": False, "error": "reviews must be an array"}), 400

    if len(reviews) > 100:
        reviews = reviews[:100]

    reviews_text = "\n".join([f"- {r}" for r in reviews])
    product_context = f"关于 {product_name} 的" if product_name else ""

    prompt = f"""请分析以下{product_context}用户评论，生成一份简明的分析报告：

{reviews_text}

请用JSON格式返回：
{{
    "total_count": 总评论数,
    "sentiment_summary": "整体情感概述（50字内）",
    "positive_aspects": ["优点1", "优点2", "优点3"],
    "negative_aspects": ["问题1", "问题2", "问题3"],
    "key_findings": ["关键发现1", "关键发现2"],
    "recommendations": ["建议1", "建议2"]
}}"""

    result = client.chat([
        {"role": "user", "content": prompt}
    ])

    if not result["success"]:
        return jsonify({"success": False, "error": result["error"]}), 500

    try:
        content = result["data"]["content"]
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        parsed = json.loads(content.strip())

        return jsonify({
            "success": True,
            "data": {
                "report": parsed,
                "review_count": len(reviews),
                "product_name": product_name,
            },
        })
    except json.JSONDecodeError:
        return jsonify({
            "success": False,
            "error": "Failed to parse summary",
            "raw": result["data"]["content"],
        }), 500
