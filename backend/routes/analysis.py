# -*- coding: utf-8 -*-
"""
情绪分析增强路由
包含：三分类情感分析、关键词提取、痛点检测、报告生成
"""

import os
import json
import torch
from datetime import datetime
from flask import Blueprint, request, jsonify, Response
from functools import lru_cache

# Import model components from app
from app import (
    app, CORS, EMOTION_MAP, model, tokenizer,
    load_model, get_cached_device, analyze_local
)

analysis_bp = Blueprint('analysis', __name__)

# 中性情感阈值
NEUTRAL_THRESHOLD = 0.2

# 痛点关键词库
PAIN_POINT_KEYWORDS = {
    "产品质量": ["质量差", "质量一般", "质量不好", "质量堪忧", "劣质", "粗糙", "瑕疵", "破损", "坏了", "起球", "脱线", "褪色", "缩水", "变形"],
    "物流问题": ["物流慢", "发货慢", "发货迟", "等太久", "迟迟不发货", "快递慢", "物流慢", "配送慢", "运输慢"],
    "客服问题": ["客服差", "客服不理", "不理人", "态度差", "服务差", "不回消息", "不解决问题"],
    "价格问题": ["价格贵", "太贵了", "不值", "性价比低", "价不符实", "价格高", "偏贵"],
    "描述不符": ["描述不符", "和图片不一样", "图片骗人", "有色差", "货不对板", "实物与图片不符", "差距大"],
    "售后问题": ["售后差", "不退", "不换", "难退货", "退款慢", "处理慢", "推脱", "踢皮球"]
}


def analyze_local_v2(text):
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


def format_emotion_result_v2(raw_result):
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
                raw = analyze_local_v2(text)
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

        raw_result = analyze_local_v2(text)
        result = format_emotion_result_v2(raw_result)

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
                raw_result = analyze_local_v2(text)
                result = format_emotion_result_v2(raw_result)
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


# ============ 报告管理 API ============

@analysis_bp.route('/reports/generate', methods=['POST'])
def generate_report_api():
    """生成报告"""
    try:
        from models.database import db

        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "缺少数据"}), 400

        title = data.get('title', f"分析报告 {datetime.now().strftime('%Y-%m-%d')}")
        details = data.get('details', [])

        # 统计
        total_reviews = len(details)
        positive_count = sum(1 for d in details if d.get('sentiment') == '正面')
        negative_count = sum(1 for d in details if d.get('sentiment') == '负面')
        neutral_count = sum(1 for d in details if d.get('sentiment') == '中性')

        # 生成关键词
        texts = [d.get('text', '') for d in details]
        keywords_result = extract_keywords(texts, 20)
        pain_points_result = detect_pain_points(texts)

        # 构建报告数据
        report_data = {
            "total_reviews": total_reviews,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "keywords": keywords_result.get("keywords", []),
            "pain_points": pain_points_result.get("pain_points", []),
            "details": details
        }

        # 生成 HTML
        html_content = build_report_html(report_data)

        # 保存报告
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO reports (title, total_reviews, positive_count, negative_count, neutral_count, data_json, html_content, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, total_reviews, positive_count, negative_count, neutral_count, json.dumps(report_data, ensure_ascii=False), html_content, datetime.now().isoformat()))
        db.commit()
        report_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "data": {
                "report_id": report_id,
                "title": title,
                "total_reviews": total_reviews,
                "positive_rate": round(positive_count / total_reviews * 100, 1) if total_reviews > 0 else 0
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/reports', methods=['GET'])
def get_reports_api():
    """获取报告列表"""
    try:
        from models.database import db

        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        offset = (page - 1) * page_size

        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) FROM reports")
        total = cursor.fetchone()[0]

        cursor.execute("""
            SELECT id, title, total_reviews, positive_count, negative_count, neutral_count, created_at
            FROM reports
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """, (page_size, offset))

        reports = [dict(row) for row in cursor.fetchall()]

        return jsonify({
            "success": True,
            "data": {
                "items": reports,
                "total": total,
                "page": page,
                "page_size": page_size
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/reports/<int:report_id>', methods=['GET'])
def get_report_api(report_id):
    """获取报告详情"""
    try:
        from models.database import db

        cursor = db.cursor()
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"success": False, "error": "报告不存在"}), 404

        report = dict(row)
        report['data_json'] = json.loads(report.get('data_json', '{}'))

        return jsonify({"success": True, "data": report})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/reports/<int:report_id>/download', methods=['GET'])
def download_report_api(report_id):
    """下载报告 HTML"""
    try:
        from models.database import db

        cursor = db.cursor()
        cursor.execute("SELECT html_content FROM reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"success": False, "error": "报告不存在"}), 404

        return Response(
            row['html_content'],
            mimetype='text/html',
            headers={
                'Content-Disposition': f'attachment; filename=report_{report_id}.html'
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@analysis_bp.route('/reports/<int:report_id>', methods=['DELETE'])
def delete_report_api(report_id):
    """删除报告"""
    try:
        from models.database import db

        cursor = db.cursor()
        cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        db.commit()
        deleted = cursor.rowcount > 0

        if not deleted:
            return jsonify({"success": False, "error": "报告不存在"}), 404

        return jsonify({"success": True, "data": {"deleted": True}})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
