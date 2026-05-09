# -*- coding: utf-8 -*-
"""
Learning Engine Service
Q&A 存储与洞察提取
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path


class LearningEngine:
    """学习引擎 - 存储 Q&A 并提取洞察"""

    def __init__(self, learned_path: Optional[str] = None):
        if learned_path is None:
            learned_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "knowledge_base",
                "learned"
            )
        self.learned_path = Path(learned_path)
        self.learned_path.mkdir(parents=True, exist_ok=True)

        self.qa_file = self.learned_path / "qa_pairs.json"
        self.insights_file = self.learned_path / "insights.json"

        self._qa_pairs: List[Dict[str, Any]] = []
        self._insights: List[Dict[str, Any]] = []

        self._load_data()

    def _load_data(self):
        """加载已存储的数据"""
        if self.qa_file.exists():
            try:
                with open(self.qa_file, "r", encoding="utf-8") as f:
                    self._qa_pairs = json.load(f)
            except Exception as e:
                print(f"Failed to load Q&A pairs: {e}")
                self._qa_pairs = []
        else:
            self._qa_pairs = []

        if self.insights_file.exists():
            try:
                with open(self.insights_file, "r", encoding="utf-8") as f:
                    self._insights = json.load(f)
            except Exception as e:
                print(f"Failed to load insights: {e}")
                self._insights = []
        else:
            self._insights = []

    def _save_qa_pairs(self):
        """保存 Q&A 对"""
        try:
            with open(self.qa_file, "w", encoding="utf-8") as f:
                json.dump(self._qa_pairs, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Failed to save Q&A pairs: {e}")
            return False

    def _save_insights(self):
        """保存洞察"""
        try:
            with open(self.insights_file, "w", encoding="utf-8") as f:
                json.dump(self._insights, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Failed to save insights: {e}")
            return False

    def store_qa(
        self,
        question: str,
        answer: str,
        question_zh: Optional[str] = None,
        answer_zh: Optional[str] = None,
        skill_id: Optional[str] = None,
        quality: int = 5
    ) -> Dict[str, Any]:
        """
        存储新的 Q&A 对

        Args:
            question: 英文问题
            answer: 英文回答
            question_zh: 中文问题（可选）
            answer_zh: 中文回答（可选）
            skill_id: 关联的技能 ID
            quality: 质量评分 1-5

        Returns:
            {"success": True, "qa_id": str, "insights_extracted": int}
        """
        qa_id = f"qa-{uuid.uuid4().hex[:8]}"

        qa_entry = {
            "id": qa_id,
            "question": question,
            "question_zh": question_zh or question,
            "answer": answer,
            "answer_zh": answer_zh or answer,
            "skill_id": skill_id,
            "quality_score": quality,
            "usage_count": 0,
            "created_at": datetime.now().isoformat(),
            "last_used_at": datetime.now().isoformat(),
            "verified": quality >= 4,
        }

        self._qa_pairs.append(qa_entry)
        self._save_qa_pairs()

        insights_extracted = 0
        if quality >= 4:
            insights_extracted = self._extract_insights(qa_entry)

        return {
            "success": True,
            "qa_id": qa_id,
            "insights_extracted": insights_extracted,
        }

    def _extract_insights(self, qa_entry: Dict[str, Any]) -> int:
        """从高质量 Q&A 中提取洞察"""
        keywords = [
            "发现", "建议", "重要", "关键", "趋势", "问题",
            "insight", "suggest", "important", "key", "trend", "issue"
        ]

        answer = qa_entry.get("answer", "")
        answer_zh = qa_entry.get("answer_zh", "")

        insight_content = answer if len(answer) < 200 else answer[:200]

        if any(kw in answer.lower() for kw in keywords) or any(kw in answer_zh for kw in keywords):
            insight = {
                "id": f"insight-{uuid.uuid4().hex[:8]}",
                "content": insight_content,
                "content_zh": qa_entry.get("answer_zh", ""),
                "source_qa_id": qa_entry["id"],
                "confidence": qa_entry.get("quality_score", 5) / 5.0,
                "extracted_at": datetime.now().isoformat(),
            }

            self._insights.append(insight)
            self._save_insights()
            return 1

        return 0

    def get_similar(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        查找相似的 Q&A

        Args:
            query: 查询文本
            limit: 返回数量

        Returns:
            相似 Q&A 列表
        """
        query_lower = query.lower()
        scored = []

        for qa in self._qa_pairs:
            score = 0.0

            question = qa.get("question", "").lower()
            question_zh = qa.get("question_zh", "").lower()

            if query_lower in question or query_lower in question_zh:
                score = 0.8
            else:
                query_words = set(query_lower.split())
                q_words = set(question.split()) | set(question_zh.split())
                overlap = query_words & q_words
                if overlap:
                    score = len(overlap) / max(len(query_words), 1) * 0.5

            if score > 0.1:
                scored.append((score, qa))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [qa for _, qa in scored[:limit]]

    def increment_usage(self, qa_id: str):
        """增加 Q&A 使用计数"""
        for qa in self._qa_pairs:
            if qa.get("id") == qa_id:
                qa["usage_count"] = qa.get("usage_count", 0) + 1
                qa["last_used_at"] = datetime.now().isoformat()
                self._save_qa_pairs()
                break

    def get_insights(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取洞察列表"""
        sorted_insights = sorted(
            self._insights,
            key=lambda x: x.get("confidence", 0),
            reverse=True
        )
        return sorted_insights[:limit]

    def format_learned_context(self, query: str, language: str = "zh") -> str:
        """
        格式化已学习内容作为上下文

        Returns:
            格式化的字符串，可注入到 LLM 提示词
        """
        similar_qa = self.get_similar(query, limit=3)
        insights = self.get_insights(limit=5)

        if not similar_qa and not insights:
            return ""

        context = "=== 历史学习 ===\n\n"

        if similar_qa:
            context += "相关问答：\n"
            for qa in similar_qa:
                q = qa.get(f"question_{language}"[:2], qa.get("question", ""))
                a = qa.get(f"answer_{language}"[:2], qa.get("answer", ""))
                context += f"Q: {q}\nA: {a}\n\n"

        if insights:
            context += "已提取洞察：\n"
            for insight in insights:
                c = insight.get(f"content_{language}"[:2], insight.get("content", ""))
                context += f"- {c}\n"

        context += "================\n\n"
        return context

    def get_stats(self) -> Dict[str, Any]:
        """获取学习统计"""
        return {
            "total_qa_pairs": len(self._qa_pairs),
            "total_insights": len(self._insights),
            "verified_pairs": sum(1 for qa in self._qa_pairs if qa.get("verified")),
            "high_quality_pairs": sum(1 for qa in self._qa_pairs if qa.get("quality_score", 0) >= 4),
        }


_engine_instance: Optional[LearningEngine] = None


def get_learning_engine() -> LearningEngine:
    """获取学习引擎单例"""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = LearningEngine()
    return _engine_instance


def store_learning(
    question: str,
    answer: str,
    question_zh: Optional[str] = None,
    answer_zh: Optional[str] = None,
    skill_id: Optional[str] = None,
    quality: int = 5
) -> Dict[str, Any]:
    """便捷函数：存储学习内容"""
    try:
        engine = get_learning_engine()
        return engine.store_qa(question, answer, question_zh, answer_zh, skill_id, quality)
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_learned_context(query: str, language: str = "zh") -> str:
    """便捷函数：获取学习上下文"""
    try:
        engine = get_learning_engine()
        return engine.format_learned_context(query, language)
    except Exception:
        return ""
