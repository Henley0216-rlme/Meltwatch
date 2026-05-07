# -*- coding: utf-8 -*-
"""
SQLite 数据库模块
店铺、商品、报告管理
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.environ.get('DB_PATH', '/app/db/reviewpulse.db')


def get_db():
    """获取数据库连接"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """初始化数据库"""
    conn = get_db()
    cursor = conn.cursor()

    # 店铺表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            platform TEXT DEFAULT '淘宝',
            color TEXT DEFAULT '#6366f1',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 商品表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            link TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
        )
    """)

    # 报告表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            total_reviews INTEGER DEFAULT 0,
            positive_count INTEGER DEFAULT 0,
            negative_count INTEGER DEFAULT 0,
            neutral_count INTEGER DEFAULT 0,
            data_json TEXT DEFAULT '{}',
            html_content TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def create_shop(name, platform='淘宝', color='#6366f1'):
    """创建店铺"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO shops (name, platform, color) VALUES (?, ?, ?)",
        (name, platform, color)
    )
    shop_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return shop_id


def get_shops():
    """获取所有店铺（带商品计数）"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.*, COUNT(p.id) as product_count
        FROM shops s
        LEFT JOIN products p ON s.id = p.shop_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
    """)
    shops = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return shops


def get_shop(shop_id):
    """获取单个店铺"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shops WHERE id = ?", (shop_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def delete_shop(shop_id):
    """删除店铺（级联删除商品）"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM shops WHERE id = ?", (shop_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def import_products_for_shop(shop_id, products_data):
    """批量导入商品"""
    conn = get_db()
    cursor = conn.cursor()
    imported = 0
    for name in products_data:
        if name.strip():
            cursor.execute(
                "INSERT INTO products (shop_id, name) VALUES (?, ?)",
                (shop_id, name.strip())
            )
            imported += 1
    conn.commit()
    conn.close()
    return imported


def get_products(shop_id=None, keyword=None, page=1, page_size=20):
    """获取商品列表"""
    conn = get_db()
    cursor = conn.cursor()

    where = []
    params = []
    if shop_id:
        where.append("p.shop_id = ?")
        params.append(shop_id)
    if keyword:
        where.append("p.name LIKE ?")
        params.append(f"%{keyword}%")

    where_clause = " AND ".join(where) if where else "1=1"

    # 获取总数
    cursor.execute(
        f"SELECT COUNT(*) FROM products p WHERE {where_clause}",
        params
    )
    total = cursor.fetchone()[0]

    # 获取分页数据
    offset = (page - 1) * page_size
    cursor.execute(f"""
        SELECT p.*, s.name as shop_name, s.color as shop_color
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE {where_clause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    """, params + [page_size, offset])

    products = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


def get_product(product_id):
    """获取单个商品"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.*, s.name as shop_name, s.color as shop_color
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE p.id = ?
    """, (product_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def add_product(shop_id, name, link=''):
    """添加商品"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO products (shop_id, name, link) VALUES (?, ?, ?)",
        (shop_id, name, link)
    )
    product_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return product_id


def delete_product(product_id):
    """删除商品"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def create_report(title, total_reviews, positive_count, negative_count, neutral_count, data_json, html_content):
    """创建报告"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reports (title, total_reviews, positive_count, negative_count, neutral_count, data_json, html_content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (title, total_reviews, positive_count, negative_count, neutral_count, data_json, html_content))
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return report_id


def get_reports(page=1, page_size=20):
    """获取报告列表"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM reports")
    total = cursor.fetchone()[0]

    offset = (page - 1) * page_size
    cursor.execute("""
        SELECT id, title, total_reviews, positive_count, negative_count, neutral_count, created_at
        FROM reports
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    """, (page_size, offset))

    reports = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {
        "items": reports,
        "total": total,
        "page": page,
        "page_size": page_size
    }


def get_report(report_id):
    """获取报告详情"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_report_html(report_id):
    """获取报告 HTML 内容"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT html_content FROM reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    return row['html_content'] if row else None


def delete_report(report_id):
    """删除报告"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# 预设店铺数据
PRESET_SHOPS = {
    "雅鹿正品男女服饰折扣店": {
        "platform": "淘宝",
        "color": "#e74c3c",
        "products": [
            "雅鹿夏季女裤子妈妈冰丝透气弹力宽松直筒哈伦裤中老年薄款休闲裤",
            "雅鹿纯棉女裤子春秋阔腿裤弹力透气松紧休闲裤妈妈夏季直筒裤长裤",
            "雅鹿新款女裤子弹力阔腿裤天丝麻中老年妈妈宽松直筒薄款高腰长裤",
            "雅鹿夏季薄款女裤冰丝弹力妈妈中老年哈伦裤纯棉宽松小个子休闲裤",
            "雅鹿高档纯棉中老年女裤大码高腰弹力棉妈妈裤春秋款遮肉休闲裤女",
            "雅鹿春夏款女裤子冰丝透气弹力宽松直筒中老年妈妈小个子休闲裤女",
            "雅鹿女裤子亚麻小个子九分裤阔腿裤夏季薄款宽松中老年妈妈休闲裤",
            "雅鹿牛仔裤男弹力商务休闲裤宽松直筒秋冬季2026新款中年男长裤子",
            "雅鹿中年女裤子秋冬款弹力松紧腰小个子妈妈高腰宽松直筒休闲裤女",
            "雅鹿男士棉衣冬季加绒加厚保暖棉服外套商务休闲爸爸装冬装"
        ]
    },
    "探路者官方旗舰店": {
        "platform": "天猫",
        "color": "#27ae60",
        "products": [
            "探路者冲锋衣男户外防水透气防风外套",
            "探路者防晒衣女户外轻薄透气皮肤衣",
            "探路者登山鞋男防水防滑户外徒步鞋",
            "探路者户外背包大容量登山包",
            "探路者帐篷户外露营防雨双人大帐篷"
        ]
    }
}


def get_preset_shops():
    """获取预设店铺列表"""
    return list(PRESET_SHOPS.keys())


def import_preset_shop(shop_name):
    """导入预设店铺"""
    if shop_name not in PRESET_SHOPS:
        return None

    preset = PRESET_SHOPS[shop_name]
    shop_id = create_shop(shop_name, preset['platform'], preset['color'])
    imported = import_products_for_shop(shop_id, preset['products'])

    return {
        "shop_id": shop_id,
        "shop_name": shop_name,
        "products_imported": imported
    }


# 初始化数据库
init_db()
