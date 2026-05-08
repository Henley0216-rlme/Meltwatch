# Meltwatch Project Specification

## Project Overview

Real-time sentiment monitoring and analytics platform for Chinese e-commerce reviews. Built with local AI models for privacy-first, cost-effective emotion analysis.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Flask 3.0 + Python |
| AI Model | HuggingFace `uer/roberta-base-finetuned-dianping-chinese` |
| Database | SQLite (default) / PostgreSQL |
| Deployment | Docker + Nginx |

## Directory Structure

```
Meltwatch/
├── meltwatch/                # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── ui/           # Base UI components
│   │   │   └── visuals/      # Visual components
│   │   ├── contexts/          # React contexts
│   │   ├── lib/              # API client, utilities
│   │   ├── pages/            # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/               # Static assets (PNG icons)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/                  # Flask backend
│   ├── app.py                # Main application
│   ├── config.py             # Configuration
│   ├── db.py                 # Database
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env                  # Environment variables
│   ├── models/               # Database models
│   │   ├── database.py
│   │   └── emotion.py
│   ├── routes/               # API routes
│   │   ├── analysis.py        # Emotion analysis, keywords, pain points
│   │   ├── auth.py           # Authentication
│   │   ├── crawl.py          # Web scraping
│   │   ├── llm.py            # LLM enhancement
│   │   └── user.py           # User management
│   ├── services/             # External services
│   │   └── zhipu_client.py  # Zhipu AI client
│   └── utils/                # Utilities
│       ├── auth.py           # JWT, token validation
│       └── crawler.py        # Web scraper framework
├── docker/                    # Docker deployment
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── .env
│   └── start.sh
├── docker-compose.yml          # Root compose file
├── .gitignore
├── README.md
├── AGENTS.md                  # This file
└── CHANGELOG.md
```

## Development Standards

### Code Style
- 2 spaces for indentation
- Follow PEP 8 (Python) / ESLint (TypeScript)
- Chinese comments for complex logic, English for public APIs

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection | `sqlite:///reviewpulse.db` |
| `SECRET_KEY` | JWT signing key | `your-secret-key-change-in-production` |
| `EMOTION_MODEL` | Sentiment model | `uer/roberta-base-finetuned-dianping-chinese` |
| `USE_LOCAL_MODEL` | Use local model | `true` |
| `FLASK_ENV` | Flask environment | `production` |
| `ZHIPU_API_KEY` | Zhipu AI API key | (optional) |

### API Design

Base URL: `/api/v1`

#### Emotion Analysis
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Single text analysis |
| `/batch_analyze` | POST | Batch analysis (max 20) |
| `/keywords` | POST | Keyword extraction |
| `/pain_points` | POST | Pain point detection |
| `/models` | GET | Model info |

#### Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reports/generate` | POST | Generate report |
| `/reports` | GET | List reports |
| `/reports/<id>` | GET | Report detail |
| `/reports/<id>/download` | GET | Download HTML |
| `/reports/<id>` | DELETE | Delete report |

#### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register |
| `/auth/login` | POST | Login |
| `/auth/me` | GET | Current user |
| `/auth/me` | PUT | Update profile |

#### User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/history` | GET | Analysis history |
| `/user/stats` | GET | User statistics |
| `/user/subscription` | GET | Subscription info |

#### Web Scraping
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/crawl/scrape` | POST | Scrape pages |
| `/crawl/platforms` | GET | Supported platforms |

#### LLM Enhancement (Zhipu AI)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/llm/status` | GET | Check LLM status |
| `/llm/analyze` | POST | Enhanced analysis with context |
| `/llm/batch_analyze` | POST | Batch with insights |
| `/llm/generate_response` | POST | Generate reply suggestions |
| `/llm/summarize_reviews` | POST | AI-powered summary |
| `/llm/chat` | POST | General chat |

### Emotion Classification

| Model Output | Display | Icon | Category |
|-------------|---------|------|----------|
| 正面 | 满意 | 😊 | positive |
| 中性 | 一般 | 😐 | neutral |
| 负面 | 不满 | 😞 | negative |

Neutral threshold: 0.2 (when positive/negative probability gap < 0.2)

### Pain Point Categories

1. 产品质量 (Product Quality)
2. 物流问题 (Logistics)
3. 客服问题 (Customer Service)
4. 价格问题 (Pricing)
5. 描述不符 (Description Mismatch)
6. 售后问题 (After-sales)

## Deployment

```bash
# Development
cd docker
docker compose up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Frontend Demo Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/demo` | Data source selection, activity |
| Explore | `/demo/explore` | AI search assistant |
| Monitor | `/demo/monitor` | Real-time sentiment dashboard |
| Analytics | `/demo/analytics` | Brand analysis reports |
| Influencer | `/demo/influencer` | Creator authenticity |

## Key Files Reference

| File | Description |
|------|-------------|
| [meltwatch/src/main.tsx](meltwatch/src/main.tsx) | Frontend entry point |
| [meltwatch/src/App.tsx](meltwatch/src/App.tsx) | App routes and layout |
| [meltwatch/src/lib/api.ts](meltwatch/src/lib/api.ts) | API client with all endpoints |
| [backend/app.py](backend/app.py) | Backend entry point |
| [backend/routes/analysis.py](backend/routes/analysis.py) | Emotion analysis routes |
| [backend/routes/llm.py](backend/routes/llm.py) | LLM enhancement routes |
| [backend/services/zhipu_client.py](backend/services/zhipu_client.py) | Zhipu AI client |
| [docker/docker-compose.yml](docker/docker-compose.yml) | Docker deployment config |
