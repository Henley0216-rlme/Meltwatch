#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
爬虫数据批量分析脚本
用于将爬取的电商评价批量导入情感分析

使用方法:
    python scripts/batch_analyze.py --input reviews.csv --output results.csv
"""

import argparse
import csv
import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any


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
    """
    并行批量分析评价
    
    Args:
        reviews: 评价文本列表
        max_workers: 并行工作线程数
        api_base: API 地址
    
    Returns:
        分析结果列表
    """
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


def load_reviews_from_csv(input_file: str, text_column: str = None) -> List[str]:
    """从 CSV 文件加载评价文本"""
    reviews = []
    
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        # 检测是否有表头
        sample = f.read(1024)
        f.seek(0)
        
        has_header = csv.Sniffer().has_header(sample)
        reader = csv.DictReader(f) if has_header else csv.reader(f)
        
        if has_header:
            # 使用指定的列或第一列
            if text_column:
                column = text_column
            else:
                column = list(reader.fieldnames)[-1]  # 默认最后一列
            
            for row in reader:
                text = row.get(column, '').strip()
                if text:
                    reviews.append(text)
        else:
            for row in reader:
                text = row[-1].strip() if row else ''
                if text:
                    reviews.append(text)
    
    return reviews


def save_results_to_csv(results: List[Dict], output_file: str, texts: List[str]):
    """保存结果到 CSV"""
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['序号', '原文', '情感', '情感标签', '置信度', '建议', '原始结果'])
        
        for i, (text, result) in enumerate(zip(texts, results), 1):
            emotion = result.get('emotion', {})
            writer.writerow([
                i,
                text,
                emotion.get('icon', '') + ' ' + emotion.get('label', ''),
                emotion.get('key', ''),
                f"{emotion.get('score', 0) * 100:.1f}%" if emotion.get('score') else '',
                result.get('suggestion', ''),
                json.dumps(result, ensure_ascii=False)
            ])
    
    print(f"结果已保存到: {output_file}")


def save_results_to_json(results: List[Dict], output_file: str, texts: List[str]):
    """保存结果到 JSON"""
    output = []
    for text, result in zip(texts, results):
        output.append({
            'text': text,
            'result': result
        })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"结果已保存到: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='批量情感分析工具')
    parser.add_argument('--input', '-i', required=True, help='输入 CSV 文件路径')
    parser.add_argument('--output', '-o', help='输出文件路径（默认添加 _result 后缀）')
    parser.add_argument('--column', '-c', help='CSV 文本列名（默认最后一列）')
    parser.add_argument('--format', '-f', choices=['csv', 'json', 'both'], default='csv',
                        help='输出格式')
    parser.add_argument('--workers', '-w', type=int, default=MAX_WORKERS,
                        help=f'并行工作数（默认 {MAX_WORKERS}）')
    parser.add_argument('--api', '-a', default=API_BASE,
                        help=f'API 地址（默认 {API_BASE}）')
    
    args = parser.parse_args()
    
    api_base = args.api
    
    # 设置输出文件名
    if not args.output:
        base = args.input.rsplit('.', 1)[0]
        args.output = base + '_result'
    
    print("=" * 50)
    print("电商评价情感分析工具")
    print("=" * 50)
    
    # 加载数据
    print(f"\n📂 加载文件: {args.input}")
    reviews = load_reviews_from_csv(args.input, args.column)
    print(f"✅ 加载了 {len(reviews)} 条评价")
    
    if not reviews:
        print("❌ 没有找到评价文本")
        return
    
    # 分析
    print(f"\n🔄 开始分析（{args.workers} 个并行工作线程）...")
    start_time = time.time()
    results = analyze_reviews(reviews, args.workers, api_base)
    elapsed = time.time() - start_time
    
    print(f"\n✅ 分析完成！耗时: {elapsed:.1f}秒")
    print(f"   平均: {len(reviews) / elapsed:.1f} 条/秒")
    
    # 统计
    positive = sum(1 for r in results if r.get('emotion', {}).get('category') == 'positive')
    negative = len(results) - positive
    print(f"   正面: {positive} ({positive/len(results)*100:.1f}%)")
    print(f"   负面: {negative} ({negative/len(results)*100:.1f}%)")
    
    # 保存结果
    print(f"\n💾 保存结果...")
    if args.format in ['csv', 'both']:
        save_results_to_csv(results, args.output + '.csv', reviews)
    if args.format in ['json', 'both']:
        save_results_to_json(results, args.output + '.json', reviews)


if __name__ == '__main__':
    main()