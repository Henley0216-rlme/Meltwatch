# -*- coding: utf-8 -*-
"""
爬虫路由
"""

from flask import Blueprint, request, jsonify
from utils.auth import token_required
from utils.crawler import get_scraper, CrawlResult

crawl_bp = Blueprint('crawl', __name__, url_prefix='/api/v1/crawl')


@crawl_bp.route('/scrape', methods=['POST'])
@token_required
def scrape():
    """爬取网页内容"""
    try:
        data = request.get_json()

        if not data or 'urls' not in data:
            return jsonify({
                'success': False,
                'error': '缺少 urls 参数'
            }), 400

        urls = data['urls']
        if not isinstance(urls, list) or len(urls) == 0:
            return jsonify({
                'success': False,
                'error': 'urls 必须是非空数组'
            }), 400

        if len(urls) > 50:
            return jsonify({
                'success': False,
                'error': '最多支持 50 个 URL'
            }), 400

        platform = data.get('platform', '通用')
        delay = data.get('delay', 1.0)

        scraper = get_scraper(platform, delay)

        results = scraper.crawl(urls)

        return jsonify({
            'success': True,
            'data': {
                'total': len(results),
                'results': [
                    {
                        'url': r.url,
                        'title': r.title,
                        'content': r.content,
                        'author': r.author,
                        'rating': r.rating,
                        'timestamp': r.timestamp
                    } for r in results
                ]
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@crawl_bp.route('/platforms', methods=['GET'])
def list_platforms():
    """获取支持的平台列表"""
    from utils.crawler import SCRAPER_REGISTRY

    return jsonify({
        'success': True,
        'data': {
            'platforms': list(SCRAPER_REGISTRY.keys())
        }
    })
