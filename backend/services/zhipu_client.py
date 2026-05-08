# -*- coding: utf-8 -*-
"""
Zhipu AI (GLM) Client for sentiment analysis enhancement
智谱 AI 大模型集成
"""

import os
import json
import requests
from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class ZhipuConfig:
    """Zhipu AI configuration"""
    api_key: str
    base_url: str = "https://open.bigmodel.cn/api/paas/v4"
    model: str = "glm-4-flash"  # 免费额度充足
    temperature: float = 0.7
    max_tokens: int = 2048


class ZhipuClient:
    """Zhipu AI GLM client"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("ZHIPU_API_KEY", "")
        if not self.api_key:
            raise ValueError("ZHIPU_API_KEY is required")
        self.config = ZhipuConfig(api_key=self.api_key)

    def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Send chat request to GLM

        Args:
            messages: [{"role": "user", "content": "..."}]
            temperature: 0-1, lower = more focused
            max_tokens: max response length

        Returns:
            {"success": bool, "data": {"content": str, "usage": dict}, "error": str}
        """
        if not self.api_key:
            return {"success": False, "error": "ZHIPU_API_KEY not configured"}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.config.model,
            "messages": messages,
            "temperature": temperature or self.config.temperature,
            "max_tokens": max_tokens or self.config.max_tokens,
        }

        try:
            response = requests.post(
                f"{self.config.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60,
            )
            response.raise_for_status()
            result = response.json()

            return {
                "success": True,
                "data": {
                    "content": result["choices"][0]["message"]["content"],
                    "usage": result.get("usage", {}),
                    "model": result.get("model", self.config.model),
                },
            }
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Request timeout"}
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": str(e)}
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            return {"success": False, "error": f"Invalid response: {str(e)}"}

    def analyze_sentiment_with_context(
        self,
        text: str,
        product_info: Optional[str] = None,
        previous_reviews: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Enhanced sentiment analysis with LLM context understanding
        带上下文的深度情感分析

        Args:
            text: 评论文本
            product_info: 产品信息（可选）
            previous_reviews: 历史评论（可选）

        Returns:
            结构化情感分析结果
        """
        context = ""
        if product_info:
            context += f"产品信息：{product_info}\n"
        if previous_reviews:
            context += f"近期评论摘要：{'；'.join(previous_reviews[:5])}\n"

        system_prompt = """你是一位专业的中文电商评论情感分析师。
请分析用户评论，返回结构化的JSON结果。

分析维度：
1. 情感分类：positive（正面）、negative（负面）、neutral（中性）
2. 情感强度：0.0-1.0（0为极度负面，1为极度正面）
3. 关键主题：评论涉及的主要方面（如：物流、产品质量、服务态度等）
4. 核心观点：用一句话概括用户的核心观点
5. 建议动作：根据评论类型给出运营建议

请直接返回JSON，不要包含任何解释："""

        user_prompt = f"""{context}待分析评论：
"{text}"

请返回JSON格式：
{{
    "sentiment": "positive/negative/neutral",
    "intensity": 0.0-1.0,
    "aspects": ["主题1", "主题2"],
    "summary": "一句话概括",
    "suggestion": "建议动作",
    "keywords": ["关键词1", "关键词2"]
}}"""

        result = self.chat([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ])

        if not result["success"]:
            return {"success": False, "error": result["error"]}

        try:
            content = result["data"]["content"]
            # 尝试解析 JSON
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            parsed = json.loads(content.strip())
            return {
                "success": True,
                "data": {
                    "original_text": text,
                    "analysis": parsed,
                    "model": result["data"]["model"],
                },
            }
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Failed to parse LLM response",
                "raw_response": content,
            }

    def batch_analyze_with_insights(
        self,
        texts: List[str],
        batch_size: int = 10,
    ) -> Dict[str, Any]:
        """
        Batch analyze with aggregated insights
        批量分析并生成汇总洞察
        """
        # 分批处理
        all_analyses = []
        for i in range(0, min(len(texts), 50), batch_size):
            batch = texts[i : i + batch_size]

            for text in batch:
                result = self.analyze_sentiment_with_context(text)
                if result["success"]:
                    all_analyses.append(result["data"]["analysis"])

        if not all_analyses:
            return {"success": False, "error": "No successful analyses"}

        # 生成汇总
        positive_count = sum(1 for a in all_analyses if a["sentiment"] == "positive")
        negative_count = sum(1 for a in all_analyses if a["sentiment"] == "negative")
        neutral_count = sum(1 for a in all_analyses if a["sentiment"] == "neutral")

        # 汇总关键词
        all_keywords = []
        for a in all_analyses:
            all_keywords.extend(a.get("keywords", []))
        keyword_counts = {}
        for kw in all_keywords:
            keyword_counts[kw] = keyword_counts.get(kw, 0) + 1
        top_keywords = sorted(keyword_counts.items(), key=lambda x: -x[1])[:10]

        # 请求 LLM 生成洞察报告
        report_prompt = f"""作为电商运营专家，请根据以下评论分析结果，生成简明的运营洞察报告。

分析统计：
- 总评论数：{len(all_analyses)}
- 正面评论：{positive_count}条 ({positive_count/len(all_analyses)*100:.1f}%)
- 负面评论：{negative_count}条 ({negative_count/len(all_analyses)*100:.1f}%)
- 中性评论：{neutral_count}条 ({neutral_count/len(all_analyses)*100:.1f}%)

高频关键词：{', '.join([f'{k}({v}次)' for k, v in top_keywords])}

请生成：
1. 整体评价摘要（100字内）
2. 主要优点（2-3条）
3. 主要问题（2-3条）
4. 改进建议（2-3条）"""

        report_result = self.chat([
            {"role": "user", "content": report_prompt}
        ])

        return {
            "success": True,
            "data": {
                "statistics": {
                    "total": len(all_analyses),
                    "positive": positive_count,
                    "negative": negative_count,
                    "neutral": neutral_count,
                    "positive_rate": positive_count / len(all_analyses) * 100,
                },
                "top_keywords": [{"word": k, "count": v} for k, v in top_keywords],
                "detailed_analyses": all_analyses,
                "insight_report": report_result["data"]["content"] if report_result["success"] else None,
            },
        }

    def generate_response_suggestion(
        self,
        negative_review: str,
        tone: str = "professional",
    ) -> Dict[str, Any]:
        """
        Generate suggested response for negative reviews
        为负面评论生成回复建议
        """
        prompt = f"""用户发表了以下负面评论：
"{negative_review}"

请以{tone}的语气，生成一条回复建议：
1. 先表达歉意或理解
2. 承认问题
3. 说明将如何改进或解决
4. 邀请用户联系客服

保持简洁，50字以内。"""

        result = self.chat([{"role": "user", "content": prompt}])

        if result["success"]:
            return {
                "success": True,
                "data": {
                    "original_review": negative_review,
                    "suggested_response": result["data"]["content"],
                },
            }
        return result


# Global client instance
_client: Optional[ZhipuClient] = None


def get_zhipu_client() -> Optional[ZhipuClient]:
    """Get or create Zhipu client singleton"""
    global _client
    if _client is None:
        api_key = os.environ.get("ZHIPU_API_KEY", "")
        if api_key:
            _client = ZhipuClient(api_key)
    return _client


def is_zhipu_enabled() -> bool:
    """Check if Zhipu AI is configured"""
    return bool(os.environ.get("ZHIPU_API_KEY", ""))
