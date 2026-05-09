# Meltwatch

实时舆情监控与电商评论情感分析平台。基于本地 AI 模型 + 智谱大模型双引擎，为品牌提供快速、深度、智能的消费者洞察。

## 核心特性

| 功能 | 技术 | 说明 |
|------|------|------|
| **情感分析** | RoBERTa + 智谱 GLM-4 | 二分类/三分类 + 深度上下文理解 |
| **关键词提取** | jieba TF-IDF | 高频词提取与情感分布 |
| **痛点检测** | 规则匹配 | 6 大类问题自动识别 |
| **报告生成** | HTML 模板 | 一键导出可视化报告 |
| **网页爬取** | 多平台支持 | 通用/大众点评/京东 |
| **GPU/CPU 自适应** | PyTorch | 自动选择最优推理设备 |

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 后端 | Flask 3.0 + Python |
| 本地模型 | HuggingFace `uer/roberta-base-finetuned-dianping-chinese` |
| 大模型 | 智谱 GLM-4-Flash |
| 数据库 | SQLite (默认) / PostgreSQL |
| 部署 | Docker + Nginx |

## 快速开始

### 前置要求

- Docker 和 Docker Compose
- 4GB+ RAM（模型推理）

### Docker 部署（推荐）

```bash
# 克隆项目
cd docker

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f backend
```

### 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
cp .env.example .env
python app.py

# 前端
cd meltwatch
npm install
npm run dev
```

### 首次运行

首次启动会自动下载模型（约 400MB）：

```bash
docker compose logs -f backend
# 看到 "✅ Model loaded successfully" 即表示就绪
```

### 服务访问

| 页面 | 地址 |
|------|------|
| 首页 | http://localhost:8080 |
| Demo 页面 | http://localhost:8080/demo/* |
| AI 探索 | http://localhost:8080/demo/explore |
| 舆情监测 | http://localhost:8080/demo/monitor |
| 品牌分析 | http://localhost:8080/demo/analytics |
| 网红分析 | http://localhost:8080/demo/influencer |

## AI 分析引擎

### 双引擎架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ 本地模型    │  │  智谱 GLM    │  │   报告生成        │ │
│  │  (快速)     │  │  (深度)      │  │                  │ │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       后端 (Flask)                          │
│  ┌────────────────┐  ┌──────────────────────────────────┐  │
│  │ 本地模型      │  │      智谱 GLM-4-Flash             │  │
│  │ • 快速分类    │  │  • 上下文感知分析                 │  │
│  │ • 实时响应    │  │  • 批量洞察生成                  │  │
│  │ • 零成本      │  │  • 回复建议                       │  │
│  └────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 场景选择指南

| 场景 | 推荐 | 原因 |
|------|------|------|
| 高并发、快速筛选 | 本地模型 | 无 API 成本，低延迟 |
| 复杂上下文理解 | 本地 + 智谱 | 深度语义分析 |
| 批量分析 + 报告 | 智谱 batch | 汇总洞察生成 |
| 负面评论处理 | 智谱 generate_response | 自然语言建议 |

## API 文档

### 基础情感分析

```bash
# 单条分析
POST /api/v1/analyze
{"text": "产品质量很好，物流也很快！"}

# 批量分析（最多 20 条）
POST /api/v1/batch_analyze
{"texts": ["文本1", "文本2"]}
```

### 关键词与痛点

```bash
# 关键词提取
POST /api/v1/keywords
{"texts": ["文本1", "文本2"], "top_n": 20}

# 痛点检测
POST /api/v1/pain_points
{"texts": ["文本1", "文本2"]}
```

### LLM 增强（需配置 ZHIPU_API_KEY）

```bash
# 检查 LLM 状态
GET /api/v1/llm/status

# 深度情感分析（带上下文）
POST /api/v1/llm/analyze
{"text": "夜景模式噪点太多", "product_info": "某品牌手机"}

# 批量分析 + 洞察
POST /api/v1/llm/batch_analyze
{"texts": ["好评", "物流太慢", "质量不错"], "batch_size": 10}

# 生成回复建议
POST /api/v1/llm/generate_response
{"negative_review": "质量太差了", "tone": "professional"}

# 评论摘要
POST /api/v1/llm/summarize_reviews
{"reviews": ["评论1", "评论2"], "product_name": "产品名称"}
```

### 报告管理

```bash
POST /api/v1/reports/generate  # 生成报告
GET  /api/v1/reports           # 报告列表
GET  /api/v1/reports/<id>      # 报告详情
GET  /api/v1/reports/<id>/download  # 下载 HTML
DELETE /api/v1/reports/<id>    # 删除报告
```

### 用户认证

```bash
POST /api/v1/auth/register  # 注册
POST /api/v1/auth/login      # 登录
GET  /api/v1/auth/me        # 当前用户
PUT  /api/v1/auth/me        # 更新资料
```

### 网页爬取

```bash
POST /api/v1/crawl/scrape
{"urls": ["https://example.com"], "platform": "Generic"}

GET /api/v1/crawl/platforms  # 支持的平台
```

## Demo 页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/demo` | 数据源选择、最近活动 |
| 探索 | `/demo/explore` | AI 搜索助手 |
| 监测 | `/demo/monitor` | 实时舆情仪表盘 |
| 分析 | `/demo/analytics` | 品牌分析报告 |
| 网红 | `/demo/influencer` | 创作者真实性评分 |

## 项目结构

```
Meltwatch/
├── meltwatch/                # React 前端
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   ├── contexts/         # React Context
│   │   ├── lib/             # API 客户端
│   │   ├── pages/           # 页面组件
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/               # 静态资源 (PNG 图标)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                  # Flask 后端
│   ├── app.py               # 主应用入口
│   ├── config.py            # 配置
│   ├── db.py                # 数据库
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env                 # 环境变量
│   ├── models/              # 数据模型
│   │   ├── database.py
│   │   └── emotion.py
│   ├── routes/              # API 路由
│   │   ├── analysis.py      # 情感分析
│   │   ├── auth.py          # 用户认证
│   │   ├── crawl.py         # 网页爬取
│   │   ├── llm.py           # LLM 增强
│   │   └── user.py          # 用户管理
│   ├── services/            # 外部服务
│   │   └── zhipu_client.py  # 智谱客户端
│   └── utils/                # 工具函数
│       ├── auth.py           # JWT 认证
│       └── crawler.py        # 爬虫框架
├── docker/                    # Docker 部署配置
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── .env
│   └── start.sh
├── docker-compose.yml        # 根目录 Docker Compose
├── README.md
├── AGENTS.md
└── CHANGELOG.md
```

## 环境变量

在 `backend/.env` 中配置：

```bash
# 数据库
DATABASE_URL=sqlite:///reviewpulse.db

# JWT 密钥
SECRET_KEY=your-secret-key-change-in-production

# 情感分析模型
EMOTION_MODEL=uer/roberta-base-finetuned-dianping-chinese

# 智谱 AI（LLM 增强）
ZHIPU_API_KEY=faf1c88decd0412baf19ca089a40e2ff.O2fYoexoVFY7VtuZ
```

## 获取智谱 API Key

1. 访问 https://open.bigmodel.cn/
2. 注册并登录
3. 在控制台创建 API Key
4. 将 Key 填入环境变量

## 许可证

MIT
