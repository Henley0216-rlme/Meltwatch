# Routes package
from routes.auth import auth_bp
from routes.user import user_bp
from routes.crawl import crawl_bp
from routes.analysis import analysis_bp

__all__ = ['auth_bp', 'user_bp', 'crawl_bp', 'analysis_bp']
