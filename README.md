# Emotion Widget - 用户评价情绪识别工具

基于阿里云 NLP 的电商用户评价情绪识别工具，可嵌入商家网页使用。

## 功能特性

- 🎯 **6种情绪识别**：高兴、愤怒、悲伤、惊讶、恐惧、厌恶
- 🤖 **免费开源**：基于 HuggingFace 本地模型，无需付费
- 📊 **智能建议**：根据情绪结果提供运营建议
- 🔌 **易于嵌入**：一行代码即可集成到任何网页
- ⚡ **GPU/CPU 自适应**：自动选择最优推理设备

## 快速开始

### 前置要求

1. Docker 和 Docker Compose
2. 推荐 4GB+ RAM（模型推理需要）

### 1. 启动服务

```bash
cd docker
docker-compose up -d
```

### 2. 首次运行

首次启动会自动下载模型（约 400MB），请耐心等待：
```bash
docker-compose logs -f backend
```

看到 `✅ 模型加载完成` 即表示就绪。

### 3. 访问

- 演示页面：http://localhost:8080/widget.html
- API 地址：http://localhost:5000/api/v1

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

## API 接口

### 情绪分析

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
      "key": "高兴",
      "label": "开心",
      "icon": "😊",
      "category": "positive",
      "score": 0.95
    },
    "all_emotions": [...],
    "suggestion": "用户非常满意，建议继续保持..."
  }
}
```

### 批量分析

```bash
POST /api/v1/batch_analyze

{
  "texts": ["文本1", "文本2"]
}
```

## 开发

### 本地运行

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入阿里云凭证
python app.py
```

### 前端独立演示

直接用浏览器打开 `frontend/widget.html` 即可（需先启动后端）。

## 技术栈

| 模块 | 技术 |
|---|---|
| 后端 | Flask + Python |
| AI 模型 | HuggingFace `robot4/emotion` (本地部署) |
| 前端 | 原生 HTML/CSS/JS |
| 部署 | Docker + Nginx |

## 情绪分类

| 类别 | 情绪 |
|---|---|
| 正面 (positive) | 高兴、喜好、认可、感谢 |
| 中性 (neutral) | 惊讶、一般 |
| 负面 (negative) | 悲伤、厌恶、恐惧、愤怒、抱怨 |
| 紧急 (critical) | 投诉 |

## License

MIT
