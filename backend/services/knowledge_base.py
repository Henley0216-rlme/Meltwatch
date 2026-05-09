# -*- coding: utf-8 -*-
"""
Knowledge Base Service
知识库检索服务
"""

import os
import json
import re
from typing import List, Dict, Any, Optional
from pathlib import Path


class KnowledgeBase:
    """知识库检索服务"""

    def __init__(self, base_path: Optional[str] = None):
        if base_path is None:
            base_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "knowledge_base"
            )
        self.base_path = Path(base_path)
        self.documents_path = self.base_path / "documents"
        self._documents_cache: List[Dict[str, Any]] = []
        self._load_documents()

    def _load_documents(self):
        """加载所有知识文档"""
        self._documents_cache = []

        if not self.documents_path.exists():
            return

        for category_dir in self.documents_path.iterdir():
            if not category_dir.is_dir():
                continue

            category = category_dir.name
            for file_path in category_dir.glob("*.json"):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        doc = json.load(f)
                        doc["_category"] = category
                        doc["_file"] = str(file_path)
                        self._documents_cache.append(doc)
                except Exception as e:
                    print(f"Failed to load {file_path}: {e}")

    def _calculate_relevance(self, query: str, doc: Dict[str, Any]) -> float:
        """计算文档与查询的相关性分数"""
        query_lower = query.lower()
        score = 0.0

        keywords = doc.get("keywords", [])
        if isinstance(keywords, list):
            for kw in keywords:
                if kw.lower() in query_lower:
                    score += 0.3

        tags = doc.get("tags", [])
        if isinstance(tags, list):
            for tag in tags:
                if tag.lower() in query_lower:
                    score += 0.2

        title = doc.get("title", "").lower()
        title_zh = doc.get("title_zh", "").lower()
        if title and title in query_lower:
            score += 0.4
        if title_zh and title_zh in query_lower:
            score += 0.4

        content = doc.get("content", "").lower()
        content_zh = doc.get("content_zh", "")
        if content and query_lower in content:
            score += 0.2
        if content_zh and query_lower in content_zh:
            score += 0.2

        return min(score, 1.0)

    def search(
        self,
        query: str,
        categories: Optional[List[str]] = None,
        limit: int = 5,
        min_score: float = 0.1
    ) -> List[Dict[str, Any]]:
        """
        搜索知识库

        Args:
            query: 查询文本
            categories: 限定类别（可选）
            limit: 返回数量限制
            min_score: 最低相关性分数

        Returns:
            相关文档列表，按相关性排序
        """
        results = []

        for doc in self._documents_cache:
            if categories and doc.get("_category") not in categories:
                continue

            score = self._calculate_relevance(query, doc)
            if score >= min_score:
                results.append({
                    "id": doc.get("id", ""),
                    "title": doc.get("title", ""),
                    "title_zh": doc.get("title_zh", ""),
                    "category": doc.get("_category", ""),
                    "relevance_score": round(score, 3),
                    "excerpt": self._extract_excerpt(doc, query),
                    "source": doc.get("source", ""),
                    "keywords": doc.get("keywords", [])[:5],
                })

        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:limit]

    def _extract_excerpt(self, doc: Dict[str, Any], query: str, max_length: int = 300) -> str:
        """提取与查询相关的文档片段"""
        content = doc.get("content", "") or doc.get("content_zh", "")
        if not content:
            return ""

        query_lower = query.lower()
        content_lower = content.lower()

        idx = content_lower.find(query_lower)
        if idx == -1:
            return content[:max_length] + ("..." if len(content) > max_length else "")

        start = max(0, idx - 50)
        end = min(len(content), idx + len(query) + 200)
        excerpt = content[start:end]

        if start > 0:
            excerpt = "..." + excerpt
        if end < len(content):
            excerpt = excerpt + "..."

        return excerpt

    def get_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取文档"""
        for doc in self._documents_cache:
            if doc.get("id") == doc_id:
                return doc
        return None

    def get_all_categories(self) -> List[str]:
        """获取所有类别"""
        categories = set()
        for doc in self._documents_cache:
            if doc.get("_category"):
                categories.add(doc["_category"])
        return sorted(list(categories))

    def add_document(self, doc: Dict[str, Any], category: str = "general") -> bool:
        """添加新文档到知识库"""
        try:
            category_path = self.documents_path / category
            category_path.mkdir(parents=True, exist_ok=True)

            doc_id = doc.get("id") or doc.get("title", "unknown").replace(" ", "_")
            file_path = category_path / f"{doc_id}.json"

            existing = {}
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    existing = json.load(f)

            existing.update(doc)
            existing["id"] = doc_id
            existing["_category"] = category

            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)

            self._load_documents()
            return True
        except Exception as e:
            print(f"Failed to add document: {e}")
            return False

    def reload(self):
        """重新加载知识库"""
        self._load_documents()


_kb_instance: Optional[KnowledgeBase] = None


def get_knowledge_base() -> KnowledgeBase:
    """获取知识库单例"""
    global _kb_instance
    if _kb_instance is None:
        _kb_instance = KnowledgeBase()
    return _kb_instance


def search_knowledge_base(
    query: str,
    categories: Optional[List[str]] = None,
    limit: int = 5
) -> Dict[str, Any]:
    """
    便捷函数：搜索知识库

    Returns:
        {"success": True, "documents": [...], "total": int}
    """
    try:
        kb = get_knowledge_base()
        documents = kb.search(query, categories, limit)
        return {
            "success": True,
            "documents": documents,
            "total": len(documents),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "documents": [],
            "total": 0,
        }


def format_knowledge_context(documents: List[Dict[str, Any]]) -> str:
    """将文档格式化为 LLM 上下文"""
    if not documents:
        return ""

    context = "=== 知识库参考 ===\n\n"

    for i, doc in enumerate(documents, 1):
        context += f"[文档 {i}: {doc.get('title_zh') or doc.get('title', '未知')}]({doc.get('source', '')}))\n"
        context += f"相关度: {doc.get('relevance_score', 0):.0%}\n"
        context += f"摘要: {doc.get('excerpt', '')}\n\n"

    context += "====================\n\n"
    return context
