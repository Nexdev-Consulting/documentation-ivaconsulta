---
slug: /docs/Railway_Deployment_Guide
---

# Railway Deployment Guide

The orchestrator is **primarily deployed on Railway** and connects to the RAG Agent also deployed on Railway. This guide covers the full Railway deployment setup.

---

## Environment Variables

Set these environment variables in your Railway Orchestrator service:

```bash
# RAG Agent Communication
RAG_AGENT_URL=https://your-rag-agent.up.railway.app

# API Security (Railway only)
API_KEY=your-secret-api-key-here

# Environment Detection (optional)
FLASK_ENV=PROD

# LangSmith Observability (optional)
LANGSMITH_API_KEY=lsv2_your_api_key_here
LANGSMITH_PROJECT=orchestrator-iva-dev
```

| Variable | Required | Description |
|----------|----------|-------------|
| `RAG_AGENT_URL` | Yes | URL of the RAG agent service on Railway |
| `API_KEY` | Yes (production) | Secret API key for authentication |
| `FLASK_ENV` | No | Set to `PROD` for production |
| `LANGSMITH_API_KEY` | No | LangSmith API key for observability |
| `LANGSMITH_PROJECT` | No | LangSmith project name |

---

## Deployment Files

### Procfile

```
web: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 agents.orchestrator.orchestrator_agent_secure:app
```

### railway.json

Health checks and deployment configuration for the Railway platform.

### nixpacks.toml

Build configuration used by Railway's Nixpacks build system.

### requirements.txt

Python dependencies including Flask, CORS, aiohttp, gunicorn, langsmith, and crewai.

---

## Gunicorn Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| Workers | 2 | Balanced for Railway container resources |
| Timeout | 120s | Allows for RAG agent processing time |
| Bind | `0.0.0.0:$PORT` | Railway dynamically assigns the port |

---

## Health Checks

The `/health` endpoint verifies:

- Orchestrator service is running
- Connection to the RAG agent is active
- Environment configuration is correct

```bash
GET https://your-orchestrator.up.railway.app/health
X-API-Key: your-secret-api-key-here
```

**Response:**

```json
{
  "status": "healthy",
  "environment": "RAILWAY",
  "rag_agent_url": "https://your-rag-agent.up.railway.app",
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

---

## API Security on Railway

All endpoints require API key authentication when the `API_KEY` environment variable is set:

| Endpoint | Auth Required |
|----------|--------------|
| `/health` | Yes |
| `/chat` | Yes |
| `/stats` | Yes |
| `/` (root) | Yes |

Header format: `X-API-Key: your-secret-api-key-here`

The API key is also forwarded to the RAG agent for end-to-end security.

---

## Rate Limiting

| Setting | Default | Environment Variable |
|---------|---------|---------------------|
| Requests per IP | 12 per 24 hours | `MAX_CALLS_PER_IP` |
| Rate limit period | 24 hours | `RATE_LIMIT_PERIOD_HOURS` |
| Whitelisted IPs | localhost | Configurable |

---

## Monitoring

### Platform Logs

View detailed request/response logging in the Railway dashboard.

### Health Monitoring

- Use the `/health` endpoint for uptime monitoring
- Configure Railway's built-in health checks via `railway.json`

### LangSmith Integration

When `LANGSMITH_API_KEY` is set, all requests are traced in the LangSmith dashboard. See [LangSmith Technical Setup](./LangSmith_Technical_Setup.md) for details.

---

## Performance Tuning

- **Workers**: Increase for higher throughput (monitor memory usage)
- **Timeout**: Increase if RAG agent responses are slow
- **Rate Limits**: Adjust per-IP quotas based on usage patterns
- **Caching**: Consider caching common responses to reduce RAG agent load

---

## Google Cloud Platform (Alternative)

For GCP deployment as an alternative to Railway:

- [Google Cloud Quick Start](./Google_Cloud_Quick_Start.md) — Quick reference
- [Google Cloud Deployment Guide](./Google_Cloud_Deployment_Guide.md) — Full deployment instructions
- [Artifact Registry Guide](./Artifact_Registry_Build_and_Run_Guide.md) — Docker image management

```bash
# Quick GCP setup
./scripts/build_and_push.sh
./scripts/setup_gcp_secrets.sh
./scripts/deploy_cloud_run.sh
```
