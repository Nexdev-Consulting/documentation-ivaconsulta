---
slug: /docs/Deployment_Configuration
---

# Deployment Configuration

Complete deployment setup for the Orchestrator Agent on Railway, including Docker configuration, Gunicorn settings, environment variables, and environment detection.

---

## Deployment Method

**Primary method: Docker**

Railway uses the `Dockerfile` to build and deploy the application. Deployment is fully automated through Railway's CI/CD pipeline — it detects changes in your connected Git repository and triggers builds automatically.

---

## Configuration Files

### Dockerfile (Active)

```dockerfile
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_HOME=/app
WORKDIR ${APP_HOME}

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements-dev.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r requirements-dev.txt

COPY . .

EXPOSE ${PORT:-8080}

CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --worker-class gevent \
    --worker-connections 100 --timeout 120 \
    agents.orchestrator.orchestrator_agent_secure:app
```

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 500,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `healthcheckPath` | `/health` | Endpoint Railway checks to verify service health |
| `healthcheckTimeout` | 500ms | Timeout for health check responses |
| `restartPolicyType` | `ON_FAILURE` | Restart only on failure (not on success/exit) |
| `restartPolicyMaxRetries` | 3 | Max restart attempts before marking as failed |

### Other Files

| File | Status | Purpose |
|------|--------|---------|
| `.dockerignore` | Active | Excludes unnecessary files from Docker image |
| `Procfile` | Inactive | Kept for reference (Dockerfile CMD used instead) |
| `start.sh` | Inactive | Kept for reference |
| `Dockerfile.backup` | Backup | Previous Docker configuration |

---

## Gunicorn Configuration

```
gunicorn agents.orchestrator.orchestrator_agent_secure:app \
    -k gevent \                    # Worker class: gevent for async I/O
    -w 2 \                         # Number of workers
    --worker-connections 100 \     # Max concurrent connections per worker
    --timeout 120 \                # Request timeout in seconds
    --bind 0.0.0.0:${PORT:-8080}   # Bind to Railway's PORT
```

### Why Gevent?

| Benefit | Explanation |
|---------|-------------|
| Better for I/O-bound operations | The app makes HTTP calls to the RAG agent and Redis |
| Higher concurrency | ~100 concurrent connections per worker |
| Lower memory footprint | Greenlets are lighter than threads |
| Perfect for async operations | Redis calls, HTTP requests, database queries |

---

## Environment Variables

### Railway-Provided (Automatic)

| Variable | Description |
|----------|-------------|
| `RAILWAY_PROJECT_NAME` | Your project name |
| `RAILWAY_ENVIRONMENT_NAME` | Environment (production, staging, etc.) |
| `RAILWAY_SERVICE_NAME` | Service name |
| `RAILWAY_PUBLIC_DOMAIN` | Public domain for the service |
| `RAILWAY_PRIVATE_DOMAIN` | Private domain for internal communication |
| `PORT` | Dynamically assigned port |

### Required (Set Manually)

| Variable | Description |
|----------|-------------|
| `AGENT_API_KEY` | API key for Orchestrator endpoints (use `openssl rand -base64 32` to generate) |
| `RAG_AGENT_URL` | URL of the RAG Agent service (use Railway internal domain for speed) |
| `EXPRESS_API_URL` | URL of the Express Redis API service |
| `EXPRESS_API_KEY` | API key for the Express Redis API (must match the Express service key) |

### Optional (With Defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_CALLS_PER_IP` | `12` | Maximum calls per IP per rate limit period |
| `RATE_LIMIT_PERIOD_MINUTES` | `1440` (24h) | Rate limit period in minutes |
| `RATE_LIMIT_WHITELIST_IPS` | — | Comma-separated whitelisted IPs |
| `FLASK_ENV` | — | Set to `PROD` for production |

### Optional Monitoring

| Variable | Description |
|----------|-------------|
| `LANGSMITH_API_KEY` | LangSmith API key for observability |
| `LANGSMITH_PROJECT` | LangSmith project name |
| `LANGCHAIN_TRACING_V2` | Set to `true` to enable LangSmith tracing |

### Setting Variables

**Via Railway Dashboard:**

1. Go to your project → Select service → "Variables" tab
2. Click "New Variable" → Add name and value → "Add"
3. Redeploy for changes to take effect

**Via Railway CLI:**

```bash
railway variables set AGENT_API_KEY=your-key-here
railway variables set --from-file .env
railway variables list
```

### Best Practices

- Never commit secrets to Git — use Railway's variable management
- Use Railway's internal domains for service-to-service communication
- Set different values per environment (production vs staging)
- Use Railway's variable references for shared values across services

---

## Environment Detection

The orchestrator auto-detects whether it's running on Railway or locally:

```python
def is_running_locally() -> bool:
    railway_project_name = os.getenv("RAILWAY_PROJECT_NAME")
    railway_env = os.getenv("RAILWAY_ENVIRONMENT_NAME")
    railway_service = os.getenv("RAILWAY_SERVICE_NAME")
    if not railway_project_name or not railway_env or not railway_service:
        return True
    return False
```

| Behavior | Local | Railway |
|----------|-------|---------|
| Rate limiting | Lenient | Strict |
| URLs | `localhost` | Railway domains |
| API key | Not required | Required |

---

## Deployment Process

1. **Code changes** — Commit and push to Git
2. **Automatic build** — Railway detects the push, runs Docker build
3. **Health check** — Railway monitors `/health` endpoint
4. **Live** — New version serves traffic, old version stopped

```bash
git add .
git commit -m "your changes"
git push    # Triggers Railway deployment
```

### Docker Testing Locally

```bash
docker build -t orchestrator-test .
docker run -p 8080:8080 --env-file .env orchestrator-test
```
