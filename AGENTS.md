# Emotion Widget 项目规范

## 项目概述

电商用户评价情绪识别工具，嵌入商家网页，实时分析文本情绪。

## 技术栈

| 模块 | 技术 |
|---|---|
| 后端 | Flask + Python |
| AI 模型 | HuggingFace `uer/roberta-base-finetuned-dianping-chinese` (本地部署) |
| 前端 | 原生 HTML + CSS + JavaScript |
| 部署 | Docker + Docker Compose |

## 目录结构

```
emotion-widget/
├── backend/           # Flask 后端服务
│   ├── app.py         # 主应用
│   ├── config.py      # 配置文件
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # 前端 Widget
│   ├── widget.html    # 独立页面（演示用）
│   └── embed.js       # 可嵌入代码
├── docker/
│   ├── docker-compose.yml
│   └── nginx.conf
├── .env.example       # 环境变量示例
└── README.md
```

## 开发规范

### 代码风格
- 使用 2 空格缩进
- 遵循 PEP 8（Python）/ ESLint（JavaScript）

### 环境变量
可选设置以下环境变量：
- `DATABASE_URL` - 数据库连接 (默认 SQLite)
- `SECRET_KEY` - JWT 密钥 (默认开发密钥，生产需修改)
- `EMOTION_MODEL` - 情感分析模型 (默认 `uer/roberta-base-finetuned-dianping-chinese`)

### API 设计
- `POST /api/v1/analyze` - 单条文本情绪分析
- `POST /api/v1/batch_analyze` - 批量分析（最多20条）
- `GET /api/v1/health` - 健康检查

### 情绪分类映射

| 模型输出 | 前端显示 | 图标 | 类别 |
|---|---|---|---|
| 正面 | 满意 | 😊 | positive |
| 负面 | 不满 | 😞 | negative |

### 部署
```bash
cd docker
docker-compose up -d
```

### 前端嵌入
```html
<script src="https://your-domain.com/embed.js"></script>
<div id="emotion-widget"></div>
```