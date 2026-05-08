# Meltwatch

基于 HuggingFace 本地模型的中文电商评论情绪识别工具，支持三分类情感分析、关键词提取、痛点检测、店铺/商品管理和报告生成。

**技术说明**：使用 `uer/roberta-base-finetuned-dianping-chinese` 模型，支持 Docker 一键部署。

## 功能特性

- 🎯 **三分类情感分析**：正面/负面/中性评论判断
- 🔑 **关键词提取**：基于 jieba TF-IDF 的高频词分析
- ⚠️ **痛点检测**：规则匹配识别六大类问题
- 📊 **智能建议**：根据情绪结果提供分级运营建议
- 🏪 **店铺管理**：数据库支持店铺/商品 CRUD
- 📄 **报告生成**：一键导出 HTML 分析报告
- 🤖 **免费开源**：基于 HuggingFace 本地模型，无需 API 费用
- 🔌 **易于嵌入**：一行代码即可集成到任何网页
- ⚡ **GPU/CPU 自适应**：自动选择最优推理设备

## 快速开始

### 前置要求

1. Docker 和 Docker Compose
2. 推荐 4GB+ RAM（模型推理需要）

### 启动服务

```bash
# 方式一：Docker Compose（推荐）
cd docker
docker compose up -d

# 方式二：本地运行
cd backend
pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 首次运行

首次启动会自动下载模型（约 400MB），请耐心等待：
```bash
docker compose logs -f backend
```

看到 `✅ 模型加载完成` 即表示就绪。

### 访问

- 主控制台：http://localhost:8080/index.html
- 演示页面：http://localhost:8080/widget.html
- API 地址：http://localhost:5001/api/v1

### 导入预设店铺

主控制台 → 数据源 → 导入新店铺 → 预设店铺 → 点击导入

## API 接口

### 情感分析

```bash
POST /api/v1/analyze

{
  "text": "收到货后发现质量很好，物流也很快！"
}

# 响应
{
  "success": true,
  "data": {
    "emotion": {
      "key": "正面",
      "label": "满意",
      "icon": "😊",
      "category": "positive",
      "score": 0.95
    },
    "all_emotions": [...],
    "suggestion": {...}
  }
}
```

### 关键词提取

```bash
POST /api/v1/keywords

{
  "texts": ["文本1", "文本2", "..."],
  "top_n": 20
}
```

### 痛点检测

```bash
POST /api/v1/pain_points

{
  "texts": ["文本1", "文本2", "..."]
}
```

### 批量分析

```bash
POST /api/v1/batch_analyze

{
  "texts": ["文本1", "文本2"]
}
```

### 店铺/商品管理

```bash
GET    /api/v1/shops           # 店铺列表
POST   /api/v1/shops           # 创建店铺
GET    /api/v1/shops/<id>      # 店铺详情
DELETE /api/v1/shops/<id>       # 删除店铺
GET    /api/v1/products        # 商品列表（?shop_id=&keyword=&page=1）
POST   /api/v1/products        # 添加商品
DELETE /api/v1/products/<id>   # 删除商品
```

### 报告管理

```bash
POST   /api/v1/reports/generate  # 生成报告
GET    /api/v1/reports           # 报告列表
GET    /api/v1/reports/<id>      # 报告详情
GET    /api/v1/reports/<id>/download  # 下载 HTML 报告
DELETE /api/v1/reports/<id>      # 删除报告
```

## 嵌入到你的网页

### 方式一：CDN 引入

```html
<script src="https://你的域名/embed.js"></script>
<div id="emotion-widget"></div>
```

### 方式二：下载到本地

```html
<script src="emotion-widget.js"></script>
<script>
  window.EmotionWidgetConfig = {
    apiBase: 'https://你的API域名/api/v1',
    position: 'bottom-right'  // 或 'bottom-left'
  };
</script>
<div id="emotion-widget"></div>
```

## 技术栈

| 模块 | 技术 |
|---|---|
| 后端 | Flask + Python |
| AI 模型 | HuggingFace `uer/roberta-base-finetuned-dianping-chinese` (本地部署) |
| 数据库 | SQLite |
| 前端 | 原生 HTML/CSS/JS + ECharts 5.5.0 |
| 部署 | Docker + Nginx |

## 情绪分类

| 类别 | 说明 |
|---|---|
| 正面 (positive) | 满意、高兴、认可 |
| 中性 (neutral) | 情感不明确，正/负概率接近 |
| 负面 (negative) | 不满、抱怨、差评 |

> 注：模型支持三分类（正面/负面/中性），中性判断阈值为 0.2。

## 开发

### 本地运行

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 前端独立演示

直接用浏览器打开 `frontend/widget.html` 即可（需先启动后端）。

## License

MIT
