# -*- coding: utf-8 -*-
"""
情绪分析增强路由
包含：三分类情感分析、关键词提取、痛点检测、报告生成
"""

import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, Response

# Import model components from emotion module
from models.emotion import (
    EMOTION_MAP, PAIN_POINT_KEYWORDS, model, tokenizer,
    load_model, get_cached_device, analyze_local, format_emotion_result, generate_suggestion, NEUTRAL_THRESHOLD
)

analysis_bp = Blueprint('analysis', __name__)


def extract_keywords(texts, top_n=20):
    """使用 jieba TF-IDF 提取关键词"""
    try:
        import jieba
        import jieba.analyse
    except ImportError:
        return {"error": "jieba 未安装", "keywords": []}

    all_text = " ".join(texts)

    # TF-IDF 关键词提取
    keywords = jieba.analyse.extract_tags(all_text, topK=top_n, withWeight=True)

    # 计算每个关键词的正/负文本分布
    result = []
    for word, weight in keywords:
        positive_count = 0
        negative_count = 0
        neutral_count = 0

        for text in texts:
            if word in text:
                raw = analyze_local(text)
                pred = raw['prediction']
                if pred == '正面':
                    positive_count += 1
                elif pred == '负面':
                    negative_count += 1
                else:
                    neutral_count += 1

        total = positive_count + negative_count + neutral_count
        result.append({
            "word": word,
            "weight": round(weight, 4),
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "total": total,
            "positive_rate": round(positive_count / total * 100, 1) if total > 0 else 0
        })

    return {"keywords": result}


def detect_pain_points(texts):
    """规则匹配检测痛点"""
    results = {}

    for category, keywords in PAIN_POINT_KEYWORDS.items():
        matches = []
        severity = 0

        for text in texts:
            for keyword in keywords:
                if keyword in text:
                    matches.append(text)
                    severity += 1
                    break  # 一条文本只计一次

        if matches:
            results[category] = {
                "count": len(matches),
                "severity": min(severity / len(texts) * 100, 100),
                "examples": matches[:3]
            }

    # 按严重程度排序
    sorted_results = sorted(
        [{"category": k, **v} for k, v in results.items()],
        key=lambda x: x["severity"],
        reverse=True
    )

    return {"pain_points": sorted_results}


def build_report_html(data):
    """生成 HTML 报告"""
    total = data.get("total_reviews", 0)
    positive = data.get("positive_count", 0)
    negative = data.get("negative_count", 0)
    neutral = data.get("neutral_count", 0)

    positive_rate = (positive / total * 100) if total > 0 else 0
    negative_rate = (negative / total * 100) if total > 0 else 0
    neutral_rate = (neutral / total * 100) if total > 0 else 0

    keywords_html = ""
    if data.get("keywords"):
        for kw in data["keywords"][:15]:
            color = "#10b981" if kw["positive_rate"] > 60 else "#ef4444" if kw["positive_rate"] < 40 else "#718096"
            keywords_html += f'<span style="background:{color}20;color:{color};padding:4px 10px;border-radius:16px;font-size:13px;margin:4px;display:inline-block;">{kw["word"]} ({kw["total"]})</span>'

    pain_points_html = ""
    if data.get("pain_points"):
        for pp in data["pain_points"][:6]:
            severity_color = "#ef4444" if pp["severity"] > 20 else "#f59e0b" if pp["severity"] > 10 else "#10b981"
            pain_points_html += f'''
            <div style="background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:8px;">
                <div style="font-weight:600;margin-bottom:4px;">{pp["category"]} <span style="color:{severity_color};font-weight:700;">{pp["count"]}条</span></div>
                <div style="height:4px;background:#e2e8f0;border-radius:2px;margin-bottom:8px;">
                    <div style="height:100%;width:{pp["severity"]}%;background:{severity_color};border-radius:2px;"></div>
                </div>
            </div>'''

    details_html = ""
    if data.get("details"):
        for i, d in enumerate(data["details"][:20], 1):
            sentiment = d.get("sentiment", "正面")
            icon = "😊" if sentiment == "正面" else "😞" if sentiment == "负面" else "😐"
            color = "#10b981" if sentiment == "正面" else "#ef4444" if sentiment == "负面" else "#718096"
            details_html += f'''
            <tr>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;">{i}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;max-width:300px;overflow:hidden;text-overflow:ellipsis;">{d.get("text", "")[:60]}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:{color};font-weight:600;">{icon} {sentiment}</td>
            </tr>'''

    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReviewPulse 分析报告 - {datetime.now().strftime("%Y-%m-%d")}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px 20px; color: #334155; }}
        h1 {{ color: #0f172a; margin-bottom: 8px; }}
        .meta {{ color: #64748b; font-size: 14px; margin-bottom: 30px; }}
        .stats {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 30px; }}
        .stat-card {{ background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; }}
        .stat-card .number {{ font-size: 28px; font-weight: 800; color: #0f172a; }}
        .stat-card .label {{ font-size: 12px; color: #64748b; margin-top: 4px; }}
        .section {{ margin-bottom: 30px; }}
        .section h2 {{ font-size: 18px; color: #0f172a; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }}
        .keywords {{ display: flex; flex-wrap: wrap; gap: 8px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ background: #f1f5f9; padding: 12px 8px; text-align: left; font-weight: 600; }}
    </style>
</head>
<body>
    <h1>📊 ReviewPulse 用户评价分析报告</h1>
    <p class="meta">生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>

    <div class="stats">
        <div class="stat-card"><div class="number">{total}</div><div class="label">总评价数</div></div>
        <div class="stat-card"><div class="number" style="color:#10b981;">{positive}</div><div class="label">正面 ({positive_rate:.1f}%)</div></div>
        <div class="stat-card"><div class="number" style="color:#718096;">{neutral}</div><div class="label">中性 ({neutral_rate:.1f}%)</div></div>
        <div class="stat-card"><div class="number" style="color:#ef4444;">{negative}</div><div class="label">负面 ({negative_rate:.1f}%)</div></div>
        <div class="stat-card"><div class="number" style="color:#6366f1;">{positive_rate:.1f}%</div><div class="label">好评率</div></div>
    </div>

    <div class="section">
        <h2>🔑 关键词分析</h2>
        <div class="keywords">{keywords_html or '<p style="color:#64748b;">暂无数据</p>'}</div>
    </div>

    <div class="section">
        <h2>⚠️ 痛点检测</h2>
        {pain_points_html or '<p style="color:#64748b;">未检测到明显痛点</p>'}
    </div>

    <div class="section">
        <h2>📝 评价详情</h2>
        <table>
            <thead><tr><th>#</th><th>评价内容</th><th>情感</th></tr></thead>
            <tbody>{details_html or '<tr><td colspan="3" style="text-align:center;padding:20px;color:#64748b;">暂无数据</td></tr>'}</tbody>
        </table>
    </div>
</body>
</html>'''

    return html


# ============ 情感分析 API ============

@analysis_bp.route('/analyze', methods=['POST'])
def analyze():
    """单条文本情绪分析"""
    try:
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({"success": False, "error": "缺少 text 参数"}), 400

        text = data['text']

        if not text or len(text.strip()) == 0:
            return jsonify({"success": False, "error": "文本不能为空"}), 400

        if len(text) > 1000:
            return jsonify({"success": False, "error": "文本长度不能超过1000字"}), 400

        raw_result = analyze_local(text)
        result = format_emotion_result(raw_result)

        return jsonify({"success": True, "data": result})

    except Exception as e:
        return jsonify({"success": False, "error": f"服务器错误: {str(e)}"}), 500


@analysis_bp.route('/batch_analyze', methods=['POST'])
def batch_analyze():
    """批量文本情绪分析（最多20条）"""
    try:
        data = request.get_json()

        if not data or 'texts' not in data:
            return jsonify({"success": False, "error": "缺少 texts 参数"}), 400

        texts = data['texts']

        if not isinstance(texts, list):
            return jsonify({"success": False, "error": "texts 必须是数组"}), 400

        if len(texts) > 20:
            return jsonify({"success": False, "error": "最多支持20条文本"}), 400

        results = []
        for text in texts:
            try:
                raw_result = analyze_local(text)
                result = format_emotion_result(raw_result)
                results.append(result)
            except Exception as e:
                results.append({"error": str(e), "content": text[:100]})

        return jsonify({"success": True, "data": results})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/keywords', methods=['POST'])
def extract_keywords_api():
    """关键词提取"""
    try:
        data = request.get_json()

        if not data or 'texts' not in data:
            return jsonify({"success": False, "error": "缺少 texts 参数"}), 400

        texts = data['texts']
        top_n = data.get('top_n', 20)

        result = extract_keywords(texts, top_n)

        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 500

        return jsonify({"success": True, "data": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/pain_points', methods=['POST'])
def detect_pain_points_api():
    """痛点检测"""
    try:
        data = request.get_json()

        if not data or 'texts' not in data:
            return jsonify({"success": False, "error": "缺少 texts 参数"}), 400

        texts = data['texts']
        result = detect_pain_points(texts)

        return jsonify({"success": True, "data": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/models', methods=['GET'])
def list_models():
    """获取可用模型信息"""
    return jsonify({
        "success": True,
        "data": {
            "current": os.environ.get('EMOTION_MODEL', 'uer/roberta-base-finetuned-dianping-chinese'),
            "description": "大众点评情感分析模型（三分类：正面/负面/中性）",
            "labels": ["正面", "负面", "中性"],
            "neutral_threshold": NEUTRAL_THRESHOLD,
            "device": get_cached_device(),
            "cuda_available": torch.cuda.is_available()
        }
    })
