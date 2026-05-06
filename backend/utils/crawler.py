# -*- coding: utf-8 -*-
"""
通用爬虫框架
"""

import re
import time
import random
from urllib.parse import urljoin, urlparse
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime

import requests
from bs4 import BeautifulSoup


@dataclass
class CrawlResult:
    """爬取结果"""
    url: str
    title: str
    content: str
    author: Optional[str] = None
    rating: Optional[float] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class BaseScraper(ABC):
    """爬虫基类"""

    def __init__(self, delay: float = 1.0, timeout: int = 30):
        self.delay = delay
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        })

    def _random_delay(self):
        """随机延迟，避免被封"""
        time.sleep(random.uniform(self.delay * 0.5, self.delay * 1.5))

    def fetch(self, url: str) -> Optional[str]:
        """获取页面内容"""
        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            response.encoding = response.apparent_encoding or 'utf-8'
            return response.text
        except Exception as e:
            print(f"Fetch error: {url} - {e}")
            return None

    @abstractmethod
    def parse(self, html: str, url: str) -> List[CrawlResult]:
        """解析页面，返回结果列表"""
        pass

    def crawl(self, urls: List[str]) -> List[CrawlResult]:
        """爬取多个页面"""
        results = []
        for url in urls:
            html = self.fetch(url)
            if html:
                results.extend(self.parse(html, url))
            self._random_delay()
        return results


class通用爬虫(BaseScraper):
    """通用网页内容爬虫"""

    def parse(self, html: str, url: str) -> List[CrawlResult]:
        soup = BeautifulSoup(html, 'html.parser')

        title = soup.find('title')
        title = title.get_text(strip=True) if title else ''

        for script in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            script.decompose()

        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|article|post')) or soup.body

        if main_content:
            text = main_content.get_text(separator='\n', strip=True)
            text = re.sub(r'\n{3,}', '\n\n', text)
        else:
            text = soup.get_text(separator='\n', strip=True)

        return [CrawlResult(
            url=url,
            title=title,
            content=text[:5000],
            timestamp=datetime.now().isoformat()
        )]


class 大众点评爬虫(BaseScraper):
    """大众点评评论爬虫"""

    def parse(self, html: str, url: str) -> List[CrawlResult]:
        soup = BeautifulSoup(html, 'html.parser')
        results = []

        review_items = soup.find_all('div', class_=re.compile(r'review|comment'))
        for item in review_items:
            content_elem = item.find(class_=re.compile(r'text|content'))
            author_elem = item.find(class_=re.compile(r'author|user'))
            rating_elem = item.find(class_=re.compile(r'score|rating'))
            time_elem = item.find(class_=re.compile(r'time|date'))

            if content_elem:
                results.append(CrawlResult(
                    url=url,
                    title='',
                    content=content_elem.get_text(strip=True),
                    author=author_elem.get_text(strip=True) if author_elem else None,
                    rating=float(rating_elem.get_text(strip=True)) if rating_elem else None,
                    timestamp=time_elem.get_text(strip=True) if time_elem else None
                ))

        return results


class 京东爬虫(BaseScraper):
    """京东商品评论爬虫"""

    def parse(self, html: str, url: str) -> List[CrawlResult]:
        soup = BeautifulSoup(html, 'html.parser')
        results = []

        comments = soup.find_all('div', class_=re.compile(r'comment-item|jd-comment'))
        for comment in comments:
            content_elem = comment.find(class_=re.compile(r'comment-content|text'))
            author_elem = comment.find(class_=re.compile(r'user-info|username'))
            rating_elem = comment.find(class_=re.compile(r'star|score'))

            content = content_elem.get_text(strip=True) if content_elem else ''
            if content:
                results.append(CrawlResult(
                    url=url,
                    title='',
                    content=content,
                    author=author_elem.get_text(strip=True) if author_elem else None,
                    rating=float(rating_elem.get_text(strip=True).replace('星', '')) if rating_elem else None,
                    timestamp=None
                ))

        return results


SCRAPER_REGISTRY = {
    '通用': 通用爬虫,
    '大众点评': 大众点评爬虫,
    '京东': 京东爬虫,
}


def get_scraper(platform: str = '通用', delay: float = 1.0) -> BaseScraper:
    """获取指定平台的爬虫"""
    scraper_class = SCRAPER_REGISTRY.get(platform, 通用爬虫)
    return scraper_class(delay=delay)
