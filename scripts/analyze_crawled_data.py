#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
爬虫数据批量分析脚本（支持小红书、淘宝、店铺商品数据）
"""

import argparse
import csv
import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
import os


API_BASE = 'http://localhost:5001/api/v1'
MAX_BATCH_SIZE = 20
MAX_WORKERS = 4


def analyze_batch(texts: List[str], api_base: str = API_BASE) -> List[Dict[str, Any]]:
    """调用 API 批量分析文本"""
    try:
        response = requests.post(
            f'{api_base}/batch_analyze',
            json={'texts': texts},
            timeout=60
        )
        data = response.json()
        if data.get('success'):
            return data['data']
        else:
            print(f"API 错误: {data.get('error')}")
            return [{'error': data.get('error')} for _ in texts]
    except Exception as e:
        print(f"请求错误: {e}")
        return [{'error': str(e)} for _ in texts]


def analyze_reviews(reviews: List[str], max_workers: int = MAX_WORKERS, api_base: str = API_BASE) -> List[Dict[str, Any]]:
    """并行批量分析评价"""
    results = [None] * len(reviews)
    batches = []

    # 分批
    for i in range(0, len(reviews), MAX_BATCH_SIZE):
        batch = reviews[i:i + MAX_BATCH_SIZE]
        batches.append((i, batch))

    print(f"共 {len(reviews)} 条文本，分 {len(batches)} 批处理")

    # 并行处理
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(analyze_batch, batch, api_base): (start_idx, batch)
            for start_idx, batch in batches
        }

        for future in as_completed(futures):
            start_idx, batch = futures[future]
            try:
                batch_results = future.result()
                for i, result in enumerate(batch_results):
                    results[start_idx + i] = result
                print(f"✅ 完成 {min(start_idx + len(batch), len(reviews))}/{len(reviews)}")
            except Exception as e:
                print(f"❌ 批次失败: {e}")
                for i in range(len(batch)):
                    results[start_idx + i] = {'error': str(e)}

    return results


def load_xiaohongshu_csv(file_path: str) -> List[Dict[str, str]]:
    """加载小红书笔记数据"""
    data = []
    encodings = ['gbk', 'gb18030', 'utf-8-sig', 'utf-8']

    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    title = row.get('标题', '').strip()
                    if title:
                        data.append({
                            'text': title,
                            'author': row.get('作者', ''),
                            'likes': row.get('点赞数', ''),
                            'time': row.get('笔记发布时间', ''),
                            'source': '小红书'
                        })
            print(f"✅ 成功加载小红书数据（编码: {enc}）")
            break
        except (UnicodeDecodeError, UnicodeError):
            continue

    return data


def load_taobao_csv(file_path: str) -> List[Dict[str, str]]:
    """加载淘宝评论数据"""
    data = []
    encodings = ['gbk', 'gb18030', 'utf-8-sig', 'utf-8']

    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    content = row.get('评论内容', '').strip()
                    if content:
                        data.append({
                            'text': content,
                            'product': row.get('商品标题', ''),
                            'reviewer': row.get('评论人', ''),
                            'time': row.get('评论时间', ''),
                            'useful': row.get('有用数', ''),
                            'source': '淘宝'
                        })
            print(f"✅ 成功加载淘宝评论数据（编码: {enc}）")
            break
        except (UnicodeDecodeError, UnicodeError):
            continue

    return data


def load_shop_products_csv(file_path: str) -> List[Dict[str, str]]:
    """加载店铺商品数据"""
    data = []
    encodings = ['gbk', 'gb18030', 'utf-8-sig', 'utf-8']

    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    product_name = row.get('商品名称', '').strip()
                    if product_name:
                        data.append({
                            'text': product_name,
                            'shop': row.get('店铺名称', ''),
                            'sales': row.get('销量', ''),
                            'link': row.get('商品链接', ''),
                            'source': '店铺商品'
                        })
            print(f"✅ 成功加载店铺商品数据（编码: {enc}）")
            break
        except (UnicodeDecodeError, UnicodeError):
            continue

    return data


def auto_detect_csv_type(file_path: str) -> str:
    """自动检测 CSV 文件类型"""
    filename = os.path.basename(file_path).lower()

    if '小红书' in filename or 'xiaohongshu' in filename:
        return 'xiaohongshu'
    elif '淘宝' in filename or 'taobao' in filename and '评论' in filename:
        return 'taobao'
    elif '店铺' in filename or 'shop' in filename or '商品' in filename:
        return 'shop'

    # 尝试读取表头判断
    encodings = ['gbk', 'gb18030', 'utf-8-sig', 'utf-8']
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames
                if headers:
                    if '评论内容' in headers:
                        return 'taobao'
                    elif '标题' in headers and '作者' in headers:
                        return 'xiaohongshu'
                    elif '商品名称' in headers and '店铺名称' in headers:
                        return 'shop'
            break
        except:
            continue

    return 'unknown'


def save_results_to_csv(results: List[Dict], output_file: str, original_data: List[Dict]):
    """保存结果到 CSV"""
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)

        # 根据数据源类型确定表头
        if original_data and original_data[0].get('source') == '小红书':
            writer.writerow(['序号', '标题', '作者', '点赞数', '发布时间', '情感', '情感标签', '置信度', '建议'])
            for i, (orig, result) in enumerate(zip(original_data, results), 1):
                emotion = result.get('emotion', {})
                writer.writerow([
                    i,
                    orig['text'],
                    orig.get('author', ''),
                    orig.get('likes', ''),
                    orig.get('time', ''),
                    emotion.get('icon', '') + ' ' + emotion.get('label', ''),
                    emotion.get('key', ''),
                    f"{emotion.get('score', 0) * 100:.1f}%" if emotion.get('score') else '',
                    result.get('suggestion', '')
                ])
        elif original_data and original_data[0].get('source') == '淘宝':
            writer.writerow(['序号', '评论内容', '商品', '评论人', '评论时间', '情感', '情感标签', '置信度', '建议'])
            for i, (orig, result) in enumerate(zip(original_data, results), 1):
                emotion = result.get('emotion', {})
                writer.writerow([
                    i,
                    orig['text'],
                    orig.get('product', ''),
                    orig.get('reviewer', ''),
                    orig.get('time', ''),
                    emotion.get('icon', '') + ' ' + emotion.get('label', ''),
                    emotion.get('key', ''),
                    f"{emotion.get('score', 0) * 100:.1f}%" if emotion.get('score') else '',
                    result.get('suggestion', '')
                ])
        else:
            writer.writerow(['序号', '内容', '来源', '情感', '情感标签', '置信度', '建议'])
            for i, (orig, result) in enumerate(zip(original_data, results), 1):
                emotion = result.get('emotion', {})
                writer.writerow([
                    i,
                    orig['text'],
                    orig.get('source', ''),
                    emotion.get('icon', '') + ' ' + emotion.get('label', ''),
                    emotion.get('key', ''),
                    f"{emotion.get('score', 0) * 100:.1f}%" if emotion.get('score') else '',
                    result.get('suggestion', '')
                ])

    print(f"结果已保存到: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='爬虫数据批量情感分析工具')
    parser.add_argument('--input', '-i', required=True, help='输入 CSV 文件路径')
    parser.add_argument('--output', '-o', help='输出文件路径（默认添加 _analyzed 后缀）')
    parser.add_argument('--type', '-t', choices=['xiaohongshu', 'taobao', 'shop', 'auto'],
                        default='auto', help='CSV 文件类型（默认自动检测）')
    parser.add_argument('--workers', '-w', type=int, default=MAX_WORKERS,
                        help=f'并行工作数（默认 {MAX_WORKERS}）')
    parser.add_argument('--api', '-a', default=API_BASE,
                        help=f'API 地址（默认 {API_BASE}）')
    parser.add_argument('--limit', '-l', type=int, help='限制分析数量（用于测试）')

    args = parser.parse_args()

    # 设置输出文件名
    if not args.output:
        base = args.input.rsplit('.', 1)[0]
        args.output = base + '_analyzed.csv'

    print("=" * 60)
    print("电商评价情感分析工具 - 爬虫数据专用版")
    print("=" * 60)

    # 检测文件类型
    csv_type = args.type if args.type != 'auto' else auto_detect_csv_type(args.input)
    print(f"\n📂 文件类型: {csv_type}")
    print(f"📂 加载文件: {args.input}")

    # 加载数据
    if csv_type == 'xiaohongshu':
        data = load_xiaohongshu_csv(args.input)
    elif csv_type == 'taobao':
        data = load_taobao_csv(args.input)
    elif csv_type == 'shop':
        data = load_shop_products_csv(args.input)
    else:
        print("❌ 无法识别文件类型，请使用 --type 参数指定")
        return

    if not data:
        print("❌ 没有找到有效数据")
        return

    print(f"✅ 加载了 {len(data)} 条数据")

    # 限制数量（用于测试）
    if args.limit and args.limit < len(data):
        data = data[:args.limit]
        print(f"⚠️  限制分析数量为 {args.limit} 条")

    # 提取文本
    texts = [item['text'] for item in data]

    # 分析
    print(f"\n🔄 开始分析（{args.workers} 个并行工作线程）...")
    start_time = time.time()
    results = analyze_reviews(texts, args.workers, args.api)
    elapsed = time.time() - start_time

    print(f"\n✅ 分析完成！耗时: {elapsed:.1f}秒")
    print(f"   平均: {len(texts) / elapsed:.1f} 条/秒")

    # 统计
    positive = sum(1 for r in results if r.get('emotion', {}).get('category') == 'positive')
    negative = len(results) - positive
    print(f"   正面: {positive} ({positive/len(results)*100:.1f}%)")
    print(f"   负面: {negative} ({negative/len(results)*100:.1f}%)")

    # 保存结果
    print(f"\n💾 保存结果...")
    save_results_to_csv(results, args.output, data)

    print(f"\n✨ 完成！")


if __name__ == '__main__':
    main()
