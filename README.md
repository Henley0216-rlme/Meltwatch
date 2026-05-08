# Meltwatch

Real-time sentiment monitoring and analytics platform for Chinese e-commerce reviews. Built with local AI models for privacy-first, cost-effective emotion analysis.

![Meltwatch](meltwatch/public/logo.svg)

## Features

- **Three-class Sentiment Analysis** - Positive, negative, and neutral classification
- **Keyword Extraction** - TF-IDF based high-frequency term analysis using jieba
- **Pain Point Detection** - Rule-based identification of 6 problem categories
- **Real-time Monitoring** - Live dashboard for brand sentiment tracking
- **Report Generation** - Exportable HTML analysis reports
- **Multi-platform Support** - Generic, Dianping, JD.com scrapers
- **GPU/CPU Adaptive** - Automatic optimal device selection for inference
- **Free & Open Source** - HuggingFace local models, no API costs

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Flask 3.0 + Python |
| AI Model | HuggingFace `uer/roberta-base-finetuned-dianping-chinese` |
| Database | SQLite (default) / PostgreSQL |
| Deployment | Docker + Nginx |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- 4GB+ RAM recommended for model inference

### Using Docker (Recommended)

```bash
cd docker
docker compose up -d
```

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
python app.py

# Frontend
cd meltwatch
npm install
npm run dev
```

### First Run

On first startup, the model (~400MB) will be downloaded automatically:

```bash
docker compose logs -f backend
```

Wait for `✅ Model loaded successfully` message.

### Access

- Main Dashboard: http://localhost:8080
- Demo Pages: http://localhost:8080/demo/*
- API: http://localhost:5001/api/v1

## API Endpoints

### Emotion Analysis

```bash
# Single text analysis
POST /api/v1/analyze
{"text": "产品质量很好，物流也很快！"}

# Batch analysis (max 20)
POST /api/v1/batch_analyze
{"texts": ["文本1", "文本2", "..."]}
```

### Keywords & Pain Points

```bash
# Keyword extraction
POST /api/v1/keywords
{"texts": ["文本1", "文本2"], "top_n": 20}

# Pain point detection
POST /api/v1/pain_points
{"texts": ["文本1", "文本2"]}
```

### Reports

```bash
POST /api/v1/reports/generate  # Generate report
GET  /api/v1/reports           # List reports
GET  /api/v1/reports/<id>      # Report detail
GET  /api/v1/reports/<id>/download  # Download HTML
DELETE /api/v1/reports/<id>    # Delete report
```

### Authentication

```bash
POST /api/v1/auth/register  # Register
POST /api/v1/auth/login      # Login
GET  /api/v1/auth/me        # Current user
PUT  /api/v1/auth/me        # Update profile
```

### Web Scraping

```bash
POST /api/v1/crawl/scrape
{"urls": ["https://example.com"], "platform": "Generic", "delay": 1.0}

GET /api/v1/crawl/platforms  # Supported platforms
```

### LLM Enhancement (Zhipu AI)

Enable LLM-powered features by setting `ZHIPU_API_KEY` in environment:

```bash
# Get API key at https://open.bigmodel.cn/
ZHIPU_API_KEY=your_api_key_here
```

```bash
# Check LLM status
GET /api/v1/llm/status

# Enhanced sentiment analysis with context understanding
POST /api/v1/llm/analyze
{"text": "评论文本", "product_info": "产品信息"}

# Batch analyze with aggregated insights
POST /api/v1/llm/batch_analyze
{"texts": ["评论1", "评论2", ...], "batch_size": 10}

# Generate response suggestion for negative reviews
POST /api/v1/llm/generate_response
{"negative_review": "负面评论文本", "tone": "professional"}

# Summarize reviews with AI
POST /api/v1/llm/summarize_reviews
{"reviews": ["评论1", "评论2"], "product_name": "产品名称"}
```

## Demo Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/demo` | Data source selection, recent activity |
| Explore | `/demo/explore` | AI-powered search and insights |
| Monitor | `/demo/monitor` | Real-time sentiment dashboard |
| Analytics | `/demo/analytics` | Brand analysis reports |
| Influencer | `/demo/influencer` | Creator authenticity scoring |

## Project Structure

```
meltwatch/
├── meltwatch/              # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # API client, utilities
│   │   ├── pages/          # Page components
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Flask backend
│   ├── app.py              # Main application
│   ├── routes/             # API routes
│   │   ├── analysis.py     # Emotion analysis
│   │   ├── auth.py         # Authentication
│   │   ├── crawl.py        # Web scraping
│   │   ├── llm.py          # LLM enhancement
│   │   └── user.py         # User management
│   ├── models/             # Database models
│   ├── services/           # External services
│   │   └── zhipu_client.py # Zhipu AI client
│   ├── utils/              # Utilities
│   └── requirements.txt
├── docker/                  # Docker deployment
│   ├── docker-compose.yml
│   └── nginx.conf
└── README.md
```

## Environment Variables

Create `.env` from `.env.example`:

```bash
EMOTION_MODEL=uer/roberta-base-finetuned-dianping-chinese
DATABASE_URL=sqlite:///reviewpulse.db
SECRET_KEY=your-secret-key-change-in-production
USE_LOCAL_MODEL=true
FLASK_ENV=production
# Optional: Zhipu AI for LLM enhancement
ZHIPU_API_KEY=your_zhipu_api_key_here
```

## LLM Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Local Model │  │ LLM Analysis │  │ Report Generation │ │
│  │  (Fast)     │  │  (Deep)      │  │                  │ │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Flask)                           │
│  ┌────────────────┐  ┌──────────────────────────────────┐ │
│  │ Local Model    │  │     Zhipu GLM (Optional)          │ │
│  │ (uer/roberta) │  │  • Context-aware analysis         │ │
│  │ • Fast triage │  │  • Batch insights                │ │
│  │ • Real-time   │  │  • Response suggestions           │ │
│  └────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Each

| Scenario | Use | Reason |
|----------|-----|--------|
| High volume, fast response | Local model | No API cost, low latency |
| Complex context needed | Local + LLM | Deep understanding |
| Bulk analysis + report | LLM batch | Aggregated insights |
| Negative review handling | LLM generate_response | Natural language suggestions |

## License

MIT
