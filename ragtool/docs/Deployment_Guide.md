---
slug: /docs/Deployment_Guide
---

# Deployment Guide

The RAG Agent is primarily deployed on Railway. It can be called via HTTPS by the Orchestrator Agent or any external client.

---

## Prerequisites

1. **Railway Account** — Sign up at [railway.app](https://railway.app)
2. **GitHub Repository** — Code should be in a GitHub repository
3. **OpenAI API Key** — Required for the AI functionality

---

## Railway Deployment

### Method 1: Deploy from GitHub (Recommended)

1. **Connect Repository to Railway**:
   - Go to [railway.app](https://railway.app) and log in
   - Click "New Project" → "Deploy from GitHub repo"
   - Choose your RagTool repository

2. **Configure Environment Variables** in the Railway dashboard "Variables" tab:

```bash
# LLM Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Agent Configuration (default: VAT agent)
AGENT_ROLE=vat_agent
RAG_DATA_PATH=./data/raw

# LangSmith Monitoring (optional but recommended)
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=rag-ivaconsulta-dev
LANGCHAIN_TRACING_V2=true

# Production Security
API_KEY=your_secure_api_key_here
```

3. **Deploy** — Railway automatically detects `railway.json` and starts deployment.

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway variables set OPENAI_API_KEY=your_openai_api_key_here
railway up
```

---

## Railway Configuration

The project includes a `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

| Setting | Value | Purpose |
|---------|-------|---------|
| Health check path | `/health` | Verifies service is running |
| Health check timeout | 30s | Time to wait for health response |
| Restart policy | `ON_FAILURE` | Auto-restart on crash |

---

## Environment Variables

### Required

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM and embeddings | — |
| `API_KEY` | API key for production authentication | — (required in production) |

### Agent Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_ROLE` | `vat_agent` or `sap_agent` | `vat_agent` |
| `RAG_DATA_PATH` | Path to RAG documents | `./data/raw` (vat) or `./data/raw_sap` (sap) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_MODEL` | OpenAI model | `gpt-4o-mini` |
| `LLM_MAX_TOKENS` | Maximum tokens for responses | `1024` |
| `EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-small` |
| `PORT` | Server port | `8001` |
| `CONFIG_SET` | Alternative config (e.g., `GEMINI_2.5_FLASH`) | — |

### LangSmith (Optional but Recommended)

| Variable | Description |
|----------|-------------|
| `LANGSMITH_API_KEY` | LangSmith API key |
| `LANGSMITH_PROJECT` | Project name (e.g., `rag-ivaconsulta-dev`) |
| `LANGSMITH_ENDPOINT` | API endpoint (default: `https://api.smith.langchain.com`) |
| `LANGCHAIN_TRACING_V2` | Set to `true` to enable tracing |

### Railway Auto-Set Variables

| Variable | Description |
|----------|-------------|
| `RAILWAY_PROJECT_NAME` | Railway project name |
| `RAILWAY_ENVIRONMENT_NAME` | Railway environment name |
| `RAILWAY_SERVICE_NAME` | Railway service name |
| `RAILWAY_PUBLIC_DOMAIN` | Public domain (e.g., `your-app.railway.app`) |
| `RAILWAY_PRIVATE_DOMAIN` | Private domain (e.g., `your-app.railway.internal`) |

---

## Environment Detection

The application automatically detects whether it's running on Railway or locally by checking `RAILWAY_PROJECT_NAME`, `RAILWAY_ENVIRONMENT_NAME`, and `RAILWAY_SERVICE_NAME`.

| Feature | Local | Railway |
|---------|-------|---------|
| PDF processing | Manual confirmation required | Automated, no confirmation |
| Logging | Verbose, detailed | Production-optimized |
| Database reset | Manual | Automatic on deployment |
| Configuration validation | Interactive | Environment-specific |
| API key | Not required | Required |

---

## Startup Behavior

The server uses background initialization for fast startup:

| Phase | What Happens |
|-------|-------------|
| **Immediate** | Flask server starts, responds to `/health` |
| **Background** | Agents initialize in separate thread |
| **During init** | `/chat` returns 503 with initialization status |
| **Ready** | `/health` shows `initialization_complete: true` |

### Initialization Stages

| Stage | Status |
|-------|--------|
| Server started | `starting` |
| Setting up monitoring | `initializing_langsmith` |
| Loading language model | `initializing_llm` |
| Loading knowledge base | `initializing_rag` |
| Building agents | `initializing_crew` |
| Fully operational | `ready` |
| Error occurred | `failed` |

Typical initialization time: **30–60 seconds**.

---

## Deployment Checklist

- [ ] **Environment variables** — All required variables configured in Railway
- [ ] **API key** — Strong, randomly generated API key set
- [ ] **LangSmith** — Configured for monitoring and cost tracking
- [ ] **Health checks** — Railway configured to use `/health` endpoint
- [ ] **CORS origins** — Railway domains properly configured
- [ ] **Data files** — RAG data files present in the correct directory
- [ ] **Port** — Let Railway set `PORT` automatically
- [ ] **Agent role** — `AGENT_ROLE` set to desired agent (`vat_agent` or `sap_agent`)

---

## Local Development Setup

### Quick Setup

```bash
# Clone and install
git clone <your-repository-url>
cd RagTool
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Configure
cp env.example .env
# Edit .env: set OPENAI_API_KEY, AGENT_ROLE=vat_agent

# Process PDFs and start
python3 files_manager_runner.py process
python agents/crewai/crew_agent_server_with_guard_rails.py
```

Server starts at `http://localhost:8001`. No API key required in local mode.

### PDF Management

```bash
python3 files_manager_runner.py process     # Process PDFs
python3 files_manager_runner.py add-file path/to/new.pdf  # Add new PDF
python3 files_manager_runner.py --reset     # Reset and reprocess
python3 files_manager_runner.py list        # List processed files
```

See [Files Management](./Files_Management.md) for details.

### Testing

```bash
# Health check
curl http://localhost:8001/health

# Chat (no API key in local mode)
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es el IVA en España?"}'

# With country context
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the VAT rate for digital services?", "agent_type": "iva_consulta_agent", "context_country": "France"}'

# Test with API key (simulating production)
export SECURITY_TEST_MODE=true
export API_KEY=your-test-api-key
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-test-api-key" \
  -d '{"message": "¿Cuál es el IVA en España?"}'
```

### Running Test Suites

```bash
python3 test_iva_consulta.py               # IVA Consulta tests
python3 tests/test_sap_crew.py             # SAP crew tests
python3 tests/test_crewai_compatibility.py # CrewAI compatibility tests
```
