# Meltwatch

实时舆情监控与 AI 智能分析平台。基于本地模型 + 智谱大模型双引擎，为品牌提供消费者洞察、竞品分析和营销决策支持。

## 核心功能

| 模块 | 说明 |
|------|------|
| **AI 探索** | 智能问答助手，融合知识库 + Skill 匹配引擎，支持用户自定义 API Key |
| **舆情监测** | 多平台评论数据采集，实时情感追踪与预警 |
| **品牌分析** | 品牌声量、情感趋势、用户画像分析 |
| **竞品对比** | 竞争对手数据对比与差异化洞察 |
| **网红分析** | 创作者真实性评分与影响力评估 |
| **数据清洗管线** | CSV 评论自动化清洗，生成维度标签集报告 |
| **报告生成** | 一键导出可视化分析报告 |

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (React 18)                        │
│   Vite + TypeScript + Tailwind CSS + React Router          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端 (Flask 3.0)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 本地模型     │  │ 智谱 GLM-4   │  │  Skill 引擎  │    │
│  │ (快速分类)   │  │ (深度理解)   │  │ (模式匹配)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 知识库       │  │ 学习引擎     │  │ 数据清洗    │    │
│  │ (检索增强)   │  │ (Q&A 积累)   │  │ (管线执行)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 后端 | Flask 3.0 + Python 3.10+ |
| 本地模型 | HuggingFace `uer/roberta-base-finetuned-dianping-chinese` |
| 大模型 | 智谱 GLM-4-Flash |
| 知识库 | 关键词匹配检索 + JSON 文档 |
| 数据库 | SQLite (默认) |
| 认证 | JWT (HS256, 7天过期) |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- 智谱 API Key (可选，支持用户自定义)

### 后端启动

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # 编辑填入 ZHIPU_API_KEY
python app.py
```

### 前端启动

```bash
cd meltwatch
npm install
npm run dev
```

### 服务地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 API | http://localhost:5001 |
| 演示首页 | http://localhost:5173/demo |

## Demo 页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/demo` | 数据源管理、最近活动 |
| AI 探索 | `/demo/explore` | 智能问答助手 |
| 舆情监测 | `/demo/monitor` | 实时舆情仪表盘 |
| 品牌分析 | `/demo/analytics` | 品牌深度分析报告 |
| 竞品对比 | `/demo/competitive` | 竞争对手数据对比 |
| 网红分析 | `/demo/influencer` | 创作者影响力评估 |
| 数据报告 | `/demo/report` | 报告管理与导出 |
| 预警中心 | `/demo/alerts` | 舆情预警配置 |
| 账户设置 | `/demo/account` | 用户认证与 API Key |

## AI 双引擎

### 本地模型 (RoBERTa)

- 快速情感分类 (二分类/三分类)
- 零 API 成本
- 低延迟响应

### 智谱 GLM-4

- 深度上下文理解
- 批量分析 + 洞察生成
- 自动回复建议
- 评论摘要报告

### 用户自定义 API Key

用户可在账户设置中填入自己的智谱 API Key，优先使用用户配额，同时享受平台提供的 Skill 和知识库能力。

## Skill 系统

| Skill | 说明 |
|-------|------|
| 品牌分析 | 品牌情感和认知分析 |
| 竞品研究 | 竞争对手研究和对比 |
| 趋势发现 | 新兴趋势和话题识别 |
| 情感分析 | 评论情感倾向分析 |
| 营销建议 | 营销策略建议 |
| 客户洞察 | 用户画像和行为分析 |
| 数据清洗 | CSV 评论数据清洗与维度标签生成 |

## API 文档

### 认证

```bash
POST /api/v1/auth/register   # 注册
POST /api/v1/auth/login      # 登录
GET  /api/v1/auth/me        # 当前用户
PUT  /api/v1/auth/me        # 更新资料
```

### 情感分析

```bash
POST /api/v1/analyze          # 单条分析
POST /api/v1/batch_analyze    # 批量分析 (最多20条)
```

### LLM 增强

```bash
GET  /api/v1/llm/status                    # LLM 状态
POST /api/v1/llm/analyze                   # 深度情感分析
POST /api/v1/llm/batch_analyze             # 批量分析+洞察
POST /api/v1/llm/chat                      # 通用对话
POST /api/v1/llm/chat_with_context         # 知识库+Skill上下文对话
POST /api/v1/llm/generate_response         # 负面评论回复建议
POST /api/v1/llm/summarize_reviews          # 评论摘要报告
POST /api/v1/llm/run_pipeline               # 执行数据清洗管线
GET  /api/v1/llm/pipeline_status           # 管线状态
```

### 知识库

```bash
GET /api/v1/knowledge/search?q=关键词       # 知识检索
GET /api/v1/knowledge/skills               # 技能列表
```

## 项目结构

```
Meltwatch/
├── meltwatch/                      # React 前端
│   └── src/
│       ├── components/             # UI 组件 (Navbar, Layout 等)
│       ├── contexts/               # React Context (LanguageContext)
│       ├── lib/                    # API 客户端 (api.ts)
│       ├── pages/                  # 页面组件
│       │   ├── DemoHome.tsx        # 首页
│       │   ├── DemoExplore.tsx      # AI 探索
│       │   ├── DemoMonitor.tsx      # 舆情监测
│       │   ├── DemoAnalytics.tsx    # 品牌分析
│       │   ├── DemoCompetitive.tsx  # 竞品对比
│       │   ├── DemoInfluencer.tsx   # 网红分析
│       │   ├── DemoReport.tsx       # 报告管理
│       │   ├── DemoAlerts.tsx       # 预警中心
│       │   └── DemoAccount.tsx       # 账户设置
│       ├── App.tsx
│       └── main.tsx
├── backend/                        # Flask 后端
│   ├── app.py                      # 应用入口
│   ├── auth.py                     # 用户认证
│   ├── config.py                   # 配置
│   ├── db.py                       # 数据库
│   ├── requirements.txt
│   ├── routes/
│   │   └── llm.py                  # LLM + 管线路由
│   ├── services/
│   │   ├── zhipu_client.py         # 智谱客户端
│   │   ├── knowledge_base.py       # 知识库服务
│   │   ├── skill_engine.py         # Skill 匹配引擎
│   │   ├── learning_engine.py      # Q&A 学习引擎
│   │   └── run_pipeline.py         # 数据清洗管线
│   ├── utils/
│   │   ├── auth.py                 # JWT 工具
│   │   └── crawler.py              # 爬虫框架
│   └── knowledge_base/              # 知识库文档
│       ├── skills/                  # Skill 定义
│       │   ├── data-cleaning.json
│       │   └── data-cleaning.md
│       ├── documents/               # 知识文档
│       │   ├── marketing/
│       │   ├── business/
│       │   ├── meltwatch/
│       │   └── pipeline/
│       └── learned/                 # 学习成果
│           ├── qa_pairs.json
│           └── insights.json
└── docker/                          # Docker 部署配置
```

## 环境变量

```bash
# backend/.env
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key
ZHIPU_API_KEY=your-api-key      # 可选，系统级 API Key
```

## 数据清洗管线

将评论 CSV 数据转化为结构化维度标签集：

**输入**：CSV 文件（含 `数据来源`、`评论时间`、`评论地点`、`评论正文` 字段）

**输出**：`维度标签集.md`，包含：
1. 数据概览（平台分布、地域分布）
2. 清洗报告（去重、去噪统计）
3. 维度提及率总览
4. 场景 × 维度交叉分析
5. 人群 × 场景交叉洞察
6. 典型评论样本
7. 数据完整度说明

---

MIT License