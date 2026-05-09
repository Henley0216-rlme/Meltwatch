# -*- coding: utf-8 -*-
"""
Skill Engine Service
技能匹配与执行引擎
"""

import os
import json
import re
import fnmatch
from typing import List, Dict, Any, Optional
from pathlib import Path


class Skill:
    """技能定义"""

    def __init__(self, skill_data: Dict[str, Any]):
        self.id = skill_data.get("id", "")
        self.name = skill_data.get("name", "")
        self.name_zh = skill_data.get("name_zh", "")
        self.description = skill_data.get("description", "")
        self.description_zh = skill_data.get("description_zh", "")
        self.patterns = skill_data.get("patterns", [])
        self.keywords = skill_data.get("keywords", {})
        self.system_prompt = skill_data.get("system_prompt", "")
        self.system_prompt_zh = skill_data.get("system_prompt_zh", "")
        self.related_knowledge = skill_data.get("related_knowledge", [])
        self.priority = skill_data.get("priority", 5)
        self.enabled = skill_data.get("enabled", True)

    def match(self, query: str, language: str = "zh") -> float:
        """
        计算技能与查询的匹配度

        Args:
            query: 用户查询
            language: 语言 (zh/en)

        Returns:
            匹配分数 0.0 - 1.0
        """
        if not self.enabled:
            return 0.0

        query_lower = query.lower()
        score = 0.0

        for pattern in self.patterns:
            pattern_lower = pattern.lower()
            if "*" in pattern_lower or "?" in pattern_lower:
                if fnmatch.fnmatch(query_lower, pattern_lower):
                    score = max(score, 0.8)
            else:
                if pattern_lower in query_lower:
                    score = max(score, 0.6)

        lang_keywords = self.keywords.get(language, []) or self.keywords.get("en", [])
        for kw in lang_keywords:
            if kw.lower() in query_lower:
                score = max(score, 0.4)

        return min(score, 1.0)


class SkillEngine:
    """技能引擎"""

    DEFAULT_SKILLS = [
        {
            "id": "brand-analysis",
            "name": "Brand Analysis",
            "name_zh": "品牌分析",
            "description": "Analyze brand sentiment and perception",
            "description_zh": "分析品牌情感和认知",
            "patterns": ["*品牌*分析*", "*brand*analysis*", "*品牌*情感*", "*brand*sentiment*"],
            "keywords": {
                "en": ["brand", "brand perception", "brand reputation", "brand awareness"],
                "zh": ["品牌", "品牌形象", "品牌认知", "品牌声誉", "品牌情感"]
            },
            "system_prompt": "You are a brand analysis expert. Provide insights about brand sentiment, perception, and reputation based on user reviews and data.",
            "system_prompt_zh": "你是一位品牌分析专家。根据用户评论和数据分析品牌情感、认知和声誉。",
            "priority": 10,
            "enabled": True,
        },
        {
            "id": "competitor-research",
            "name": "Competitor Research",
            "name_zh": "竞品研究",
            "description": "Research and analyze competitors",
            "description_zh": "研究和分析竞争对手",
            "patterns": ["*竞品*", "*竞争对手*", "*competitor*", "*rival*", "*对比*"],
            "keywords": {
                "en": ["competitor", "competitors", "rival", "comparison", "market share"],
                "zh": ["竞品", "竞争对手", "竞争", "对比", "市场份额"]
            },
            "system_prompt": "You are a competitive intelligence analyst. Research and analyze competitors based on available data.",
            "system_prompt_zh": "你是一位竞品情报分析师。基于可用数据研究和分析竞争对手。",
            "priority": 9,
            "enabled": True,
        },
        {
            "id": "trend-detection",
            "name": "Trend Detection",
            "name_zh": "趋势发现",
            "description": "Identify emerging trends and topics",
            "description_zh": "识别新兴趋势和话题",
            "patterns": ["*趋势*", "*trend*", "*热门*", "*hot topic*", "*话题*"],
            "keywords": {
                "en": ["trend", "trending", "emerging", "hot topic", "viral"],
                "zh": ["趋势", "热门", "热点", "话题", "新兴"]
            },
            "system_prompt": "You are a trend analyst. Identify emerging trends and topics from user discussions.",
            "system_prompt_zh": "你是一位趋势分析师。从用户讨论中识别新兴趋势和话题。",
            "priority": 8,
            "enabled": True,
        },
        {
            "id": "sentiment-analysis",
            "name": "Sentiment Analysis",
            "name_zh": "情感分析",
            "description": "Analyze sentiment from reviews",
            "description_zh": "分析评论中的情感倾向",
            "patterns": ["*情感*", "*sentiment*", "*情绪*", "*感受*", "*用户*评价*"],
            "keywords": {
                "en": ["sentiment", "emotion", "feeling", "opinion", "review"],
                "zh": ["情感", "情绪", "感受", "评价", "用户反馈"]
            },
            "system_prompt": "You are a sentiment analysis expert. Analyze the sentiment and emotions expressed in user reviews.",
            "system_prompt_zh": "你是一位情感分析专家。分析用户评论中表达的情感和情绪。",
            "priority": 7,
            "enabled": True,
        },
        {
            "id": "marketing-advice",
            "name": "Marketing Advice",
            "name_zh": "营销建议",
            "description": "Provide marketing strategy advice",
            "description_zh": "提供营销策略建议",
            "patterns": ["*营销*", "*推广*", "*marketing*", "*推广*", "*获客*"],
            "keywords": {
                "en": ["marketing", "promotion", "campaign", "strategy", "growth"],
                "zh": ["营销", "推广", "策略", "增长", "获客", "广告"]
            },
            "system_prompt": "You are a marketing strategist. Provide actionable marketing advice based on data insights.",
            "system_prompt_zh": "你是一位营销策略专家。基于数据洞察提供可执行的营销建议。",
            "priority": 6,
            "enabled": True,
        },
        {
            "id": "customer-insights",
            "name": "Customer Insights",
            "name_zh": "客户洞察",
            "description": "Extract customer insights from data",
            "description_zh": "从数据中提取客户洞察",
            "patterns": ["*客户*", "*用户*洞察*", "*customer*insight*", "*用户*画像*"],
            "keywords": {
                "en": ["customer", "user", "insight", "persona", "behavior"],
                "zh": ["客户", "用户", "画像", "行为", "习惯"]
            },
            "system_prompt": "You are a customer insight analyst. Extract meaningful insights about customers from data.",
            "system_prompt_zh": "你是一位客户洞察分析师。从数据中提取有价值的客户洞察。",
            "priority": 6,
            "enabled": True,
        },
    ]

    def __init__(self, skills_path: Optional[str] = None):
        if skills_path is None:
            skills_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "knowledge_base",
                "skills"
            )
        self.skills_path = Path(skills_path)
        self._skills: List[Skill] = []
        self._load_skills()

    def _load_skills(self):
        """加载技能定义"""
        self._skills = [Skill(s) for s in self.DEFAULT_SKILLS]

        if not self.skills_path.exists():
            self.skills_path.mkdir(parents=True, exist_ok=True)
            self._save_default_skills()
            return

        for file_path in self.skills_path.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    skill_data = json.load(f)
                    if isinstance(skill_data, list):
                        for s in skill_data:
                            self._skills.append(Skill(s))
                    else:
                        self._skills.append(Skill(skill_data))
            except Exception as e:
                print(f"Failed to load skill from {file_path}: {e}")

    def _save_default_skills(self):
        """保存默认技能定义"""
        default_file = self.skills_path / "default_skills.json"
        try:
            with open(default_file, "w", encoding="utf-8") as f:
                json.dump(self.DEFAULT_SKILLS, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save default skills: {e}")

    def match(self, query: str, language: str = "zh") -> Optional[Skill]:
        """
        匹配最相关的技能

        Args:
            query: 用户查询
            language: 语言

        Returns:
            最佳匹配的技能，如果没有匹配返回 None
        """
        best_match = None
        best_score = 0.0

        for skill in self._skills:
            score = skill.match(query, language)
            if score > best_score:
                best_score = score
                best_match = skill

        if best_score >= 0.2:
            return best_match
        return None

    def get_all_skills(self) -> List[Dict[str, Any]]:
        """获取所有技能列表"""
        return [
            {
                "id": s.id,
                "name": s.name,
                "name_zh": s.name_zh,
                "description": s.description,
                "description_zh": s.description_zh,
                "priority": s.priority,
                "enabled": s.enabled,
            }
            for s in self._skills
        ]

    def get_skill_prompt(self, skill: Skill, language: str = "zh") -> str:
        """获取技能的系统提示"""
        if language == "zh" and skill.system_prompt_zh:
            return skill.system_prompt_zh
        return skill.system_prompt


_engine_instance: Optional[SkillEngine] = None


def get_skill_engine() -> SkillEngine:
    """获取技能引擎单例"""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = SkillEngine()
    return _engine_instance


def match_skill(query: str, language: str = "zh") -> Dict[str, Any]:
    """
    便捷函数：匹配技能

    Returns:
        {"success": True, "skill": {...}, "confidence": float} 或 {"success": False}
    """
    try:
        engine = get_skill_engine()
        skill = engine.match(query, language)

        if skill:
            return {
                "success": True,
                "skill": {
                    "id": skill.id,
                    "name": skill.name,
                    "name_zh": skill.name_zh,
                    "description": skill.description,
                    "description_zh": skill.description_zh,
                    "system_prompt": skill.system_prompt,
                    "system_prompt_zh": skill.system_prompt_zh,
                    "related_knowledge": skill.related_knowledge,
                },
                "matched": True,
            }
        return {
            "success": True,
            "skill": None,
            "matched": False,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "skill": None,
            "matched": False,
        }
