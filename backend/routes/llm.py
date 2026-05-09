# -*- coding: utf-8 -*-
"""
LLM-enhanced Analysis Routes
大模型增强分析路由 - 支持用户自定义API Key
"""

import json
import jwt
import time
from flask import Blueprint, request, jsonify
from services.zhipu_client import (
    get_zhipu_client,
    is_zhipu_enabled,
    ZhipuClient,
)
from services.knowledge_base import search_knowledge_base, format_knowledge_context
from services.skill_engine import match_skill, get_skill_engine
from services.learning_engine import get_learned_context
from functools import wraps

llm_bp = Blueprint("llm", __name__, url_prefix="/api/v1/llm")

JWT_SECRET = "your-secret-key-change-in-production"


def get_user_from_token(token: str):
    """Get user data from JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        return None


def get_user_api_key(user_id: int):
    """Get user's API key from database"""
    try:
        import sqlite3
        from pathlib import Path
        DB_PATH = Path(__file__).parent / "users.db"
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT zhipu_api_key FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return row["zhipu_api_key"] if row else None
    except:
        return None


def require_zhipu_or_user(f):
    """Decorator to require Zhipu AI configuration (system or user)"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user_api_key = None
        user_id = None

        # Try to get user from token
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = get_user_from_token(token)
            if payload:
                user_id = payload.get("user_id")
                user_api_key = get_user_api_key(user_id)

        # If no user API key, use system default
        if not user_api_key:
            if not is_zhipu_enabled():
                return jsonify({
                    "success": False,
                    "error": "Zhipu AI not configured. Please set your API key in account settings."
                }), 503
            client = get_zhipu_client()
            if not client:
                return jsonify({
                    "success": False,
                    "error": "Failed to initialize Zhipu client"
                }), 500
        else:
            # Create client with user's API key
            try:
                client = ZhipuClient(api_key=user_api_key)
            except:
                return jsonify({
                    "success": False,
                    "error": "Invalid API key. Please check your settings."
                }), 500

        return f(client, user_id, *args, **kwargs)
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
@require_zhipu_or_user
def llm_analyze(client: ZhipuClient, user_id: int = None):
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
@require_zhipu_or_user
def llm_batch_analyze(client: ZhipuClient, user_id: int = None):
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
@require_zhipu_or_user
def llm_generate_response(client: ZhipuClient, user_id: int = None):
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
@require_zhipu_or_user
def llm_chat(client: ZhipuClient, user_id: int = None):
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
@require_zhipu_or_user
def llm_summarize_reviews(client: ZhipuClient, user_id: int = None):
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


@llm_bp.route("/chat_with_context", methods=["POST"])
@require_zhipu_or_user
def llm_chat_with_context(client: ZhipuClient, user_id: int = None):
    """
    Chat with knowledge base and skill context injection
    POST /api/v1/llm/chat_with_context

    Body:
    {
        "messages": [{"role": "user", "content": "..."}],
        "inject_knowledge": true,
        "skill_id": "brand-analysis"（可选）,
        "language": "zh"（可选，默认zh）
    }
    """
    data = request.get_json()

    if not data or "messages" not in data:
        return jsonify({"success": False, "error": "Missing messages parameter"}), 400

    messages = data["messages"]
    inject_knowledge = data.get("inject_knowledge", True)
    skill_id = data.get("skill_id")
    language = data.get("language", "zh")

    if not isinstance(messages, list) or len(messages) == 0:
        return jsonify({"success": False, "error": "messages must be a non-empty array"}), 400

    final_messages = list(messages)

    if inject_knowledge and final_messages:
        last_user_message = final_messages[-1].get("content", "")

        skill_result = match_skill(last_user_message, language)
        matched_skill = None
        if skill_result.get("success") and skill_result.get("skill"):
            matched_skill = skill_result["skill"]
            if language == "zh" and matched_skill.get("system_prompt_zh"):
                system_content = matched_skill["system_prompt_zh"]
            else:
                system_content = matched_skill.get("system_prompt", "")
        else:
            engine = get_skill_engine()
            default_system = engine.get_skill_prompt(
                type("Skill", (), {
                    "system_prompt": "你是一位专业的电商运营助手，帮助用户分析品牌舆情、市场趋势和用户反馈。",
                    "system_prompt_zh": "你是一位专业的电商运营助手，帮助用户分析品牌舆情、市场趋势和用户反馈。"
                })(),
                language
            )
            system_content = default_system

        kb_context = ""
        if matched_skill and matched_skill.get("related_knowledge"):
            kb_results = search_knowledge_base(last_user_message, limit=3)
            if kb_results.get("success"):
                kb_context = format_knowledge_context(kb_results.get("documents", []))
        else:
            kb_results = search_knowledge_base(last_user_message, limit=3)
            if kb_results.get("success") and kb_results.get("documents"):
                kb_context = format_knowledge_context(kb_results.get("documents", []))

        learned_context = get_learned_context(last_user_message, language)

        if system_content or kb_context or learned_context:
            full_context = ""
            if system_content:
                full_context += f"{system_content}\n\n"
            if kb_context:
                full_context += f"{kb_context}\n"
            if learned_context:
                full_context += f"{learned_context}\n"

            final_messages = [
                {"role": "system", "content": full_context.strip()},
                *final_messages
            ]

    result = client.chat(
        messages=final_messages,
        temperature=data.get("temperature"),
        max_tokens=data.get("max_tokens"),
    )

    if result["success"]:
        response_data = {
            "content": result["data"]["content"],
            "usage": result["data"].get("usage"),
        }

        if matched_skill:
            response_data["skill"] = {
                "id": matched_skill.get("id"),
                "name": matched_skill.get("name"),
                "name_zh": matched_skill.get("name_zh"),
            }

        if inject_knowledge and last_user_message:
            kb_results = search_knowledge_base(last_user_message, limit=3)
            if kb_results.get("success") and kb_results.get("documents"):
                response_data["knowledge_used"] = [
                    {"id": d["id"], "title": d.get("title_zh") or d.get("title", "")}
                    for d in kb_results["documents"]
                ]

        return jsonify({"success": True, "data": response_data})

    return jsonify({"success": False, "error": result["error"]}), 500
