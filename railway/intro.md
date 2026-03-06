---
slug: /intro
---

# Railway Infrastructure

Complete documentation for the Railway deployment infrastructure powering the IvaConsulta AI platform. This covers the Orchestrator Agent deployment, the Express + Redis rate limiting API, and all associated configuration, security, and operational procedures.

---

## Platform Overview

The IvaConsulta platform runs on Railway with three interconnected services:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Railway Project                                                         │
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │  Orchestrator     │───▶│  Express Redis   │───▶│  Redis Database  │   │
│  │  (Python/Flask)   │    │  API (Node.js)   │    │  (Managed)       │   │
│  │                   │    │                   │    │                   │   │
│  │  - Chat API       │    │  - Rate limiting  │    │  - IP tracking   │   │
│  │  - RAG proxy      │    │  - IP tracking    │    │  - Call history  │   │
│  │  - LangSmith      │    │  - Call recording │    │                   │   │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘   │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────┐                                                    │
│  │  RAG Agent        │                                                   │
│  │  (Python/Flask)   │                                                   │
│  │  - CrewAI + RAG   │                                                   │
│  │  - ChromaDB       │                                                   │
│  └──────────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

| Service | Stack | Role |
|---------|-------|------|
| **Orchestrator Agent** | Python / Flask / Gunicorn | Chat API, RAG proxy, LangSmith observability |
| **Express Redis API** | Node.js / Express / ioredis | Rate limiting, IP tracking, call recording |
| **Redis Database** | Managed Redis | IP tracking data, call timestamps |
| **RAG Agent** | Python / Flask / CrewAI | AI backend with ChromaDB vector search |

---

## Documentation

### Deployment and Configuration

| Document | Description |
|----------|-------------|
| [Deployment Configuration](./docs/Deployment_Configuration.md) | Dockerfile, Gunicorn settings, railway.json, environment variables, environment detection |
| [Express Redis API](./docs/Express_Redis_API.md) | Express server architecture, Redis data model, API endpoints, authentication |

### Rate Limiting and Security

| Document | Description |
|----------|-------------|
| [Rate Limiting Architecture](./docs/Rate_Limiting_Architecture.md) | Distributed rate limiting flow, Express + Redis integration, configuration, monitoring |
| [Security Best Practices](./docs/Security_Best_Practices.md) | OWASP controls, Railway security features, production checklist, incident response |

### Operations

| Document | Description |
|----------|-------------|
| [Troubleshooting and Recovery](./docs/Troubleshooting_and_Recovery.md) | Common issues, debugging, rollback procedures, disaster recovery, performance tuning |

---

## Quick Reference by Use Case

| Use Case | Document |
|----------|----------|
| "I need to deploy the Orchestrator to Railway" | [Deployment Configuration](./docs/Deployment_Configuration.md) |
| "I need to set up the Express + Redis rate limiter" | [Express Redis API](./docs/Express_Redis_API.md) |
| "I want to understand how rate limiting works" | [Rate Limiting Architecture](./docs/Rate_Limiting_Architecture.md) |
| "I need to secure the production deployment" | [Security Best Practices](./docs/Security_Best_Practices.md) |
| "Something is broken and I need to fix it" | [Troubleshooting and Recovery](./docs/Troubleshooting_and_Recovery.md) |

---

## Railway Services Summary

### Orchestrator Agent

- **Deployment**: Docker (Dockerfile) with Gunicorn + gevent workers
- **Health check**: `GET /health`
- **Auth**: `X-API-Key` header required in production
- **Key endpoints**: `/chat`, `/health`, `/stats`, `/health/redis`

### Express Redis API

- **Deployment**: Node.js with auto-deploy from Git
- **Health check**: `GET /`
- **Auth**: `X-API-Key` or `Authorization: Bearer` header
- **Key endpoints**: `/api/chatbot/check-limit`, `/api/chatbot/record-call`, `/api/chatbot/ips`

### Redis Database

- **Type**: Managed Redis instance (provisioned by Railway)
- **Connection**: `REDIS_URL` automatically injected
- **Data**: IP tracking set (`chatbot_ips`) with call timestamps

---

## Common Commands

```bash
# Railway CLI
railway login                    # Login to Railway
railway link                     # Link to project
railway up                       # Deploy
railway logs                     # View logs
railway logs --follow            # Follow logs in real-time
railway variables                # List variables
railway variables set KEY=value  # Set variable
railway status                   # Check status
railway restart                  # Restart service
railway shell                    # SSH into container

# Git Deployment (auto-triggers Railway build)
git add . && git commit -m "message" && git push

# Health Checks
curl https://your-orchestrator.railway.app/health
curl https://your-express-api.railway.app/
curl https://your-orchestrator.railway.app/stats -H "X-API-Key: your-key"
curl https://your-orchestrator.railway.app/health/redis -H "X-API-Key: your-key"
```

---

## Important URLs

| Resource | URL |
|----------|-----|
| Railway Dashboard | [railway.app/dashboard](https://railway.app/dashboard) |
| Railway Status | [status.railway.app](https://status.railway.app/) |
| Railway Docs | [docs.railway.app](https://docs.railway.app/) |
| Railway Discord | [discord.gg/railway](https://discord.gg/railway) |

---

*Last Updated: February 2026*
