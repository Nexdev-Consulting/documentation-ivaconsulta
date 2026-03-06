---
slug: /intro
---

# Orchestrator Agent

A Flask-based orchestrator service that provides a RESTful API for connecting any application to CrewAI RAG agents. Deployed on Railway and integrated with WordPress sites via AI Engine and Jotform ChatBot. Features comprehensive LangSmith observability, EU AI Act compliance, and seamless communication between frontend applications and AI services.

**Quick Test:**

```bash
curl -X POST -s 'https://orchestrator-dev.up.railway.app/chat' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: your-api-key' \
  -d '{"message":"Hello, can you explain SAP BTP"}'
```

---

## Architecture

```
[WordPress Site] → [AI Engine / Jotform ChatBot] → [Orchestrator (Railway)] → [RAG Agent (Railway)]
   Website              Chat Interface                 HTTP Proxy                AI Backend
                                                              ↓
                                                  [LangSmith Observability]
```

### Current Production Setup

| Component | Details |
|-----------|---------|
| **Orchestrator Agent** | Deployed on Railway |
| **RAG Agent** | Deployed on Railway |
| **Frontend Integration** | AI Engine chatbot + Jotform ChatBot on WordPress |
| **Observability** | LangSmith tracking all operations |

### Communication Flow

1. **User** interacts with the chatbot on the WordPress site
2. **ChatBot** sends user messages via HTTP POST to the Orchestrator
3. **Orchestrator** (Railway) receives requests and forwards to the RAG Agent
4. **RAG Agent** (Railway) processes with CrewAI and returns AI responses
5. **Orchestrator** returns formatted responses to the ChatBot
6. **ChatBot** displays response to the user
7. **LangSmith** tracks all operations for observability, debugging, and compliance

---

## Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [API Integration Guide](./docs/API_Integration_Guide.md) | Complete guide for integrating the Orchestrator API with any application or platform |
| [Frontend Integration Guide](./docs/Frontend_Integration_Guide.md) | Jotform ChatBot, JavaScript, Python, React, Node.js integration examples |
| [LangSmith Technical Setup](./docs/LangSmith_Technical_Setup.md) | Set up observability, tracing, and monitoring for your deployments |

### Deployment

| Document | Description |
|----------|-------------|
| [Railway Deployment Guide](./docs/Railway_Deployment_Guide.md) | Primary deployment platform — Docker-based, Gunicorn, health checks, env vars |
| [Google Cloud Deployment Guide](./docs/Google_Cloud_Deployment_Guide.md) | Complete GCP deployment with Secret Manager integration |
| [Google Cloud Quick Start](./docs/Google_Cloud_Quick_Start.md) | Quick reference for GCP deployment |
| [Artifact Registry Build and Run Guide](./docs/Artifact_Registry_Build_and_Run_Guide.md) | Docker image building and management for GCP |

### Development

| Document | Description |
|----------|-------------|
| [Local Development](./docs/Local_Development.md) | Setup, environment variables, testing, code quality tools |
| [CI/CD Pipeline](./docs/CI_CD_Pipeline.md) | Automated security scanning, testing, compliance validation, deployment |

### Architecture and Compliance

| Document | Description |
|----------|-------------|
| [Technical Solution: AI Agents](./docs/Technical_Solution_AI_Agents.md) | Complete technical architecture, agent design patterns, multi-agent coordination |
| [EU AI Act & GDPR Risk Analysis](./docs/EU_AI_Act_GDPR_Risk_Analysis.md) | Risk assessment, compliance requirements, data protection |

---

## Quick Reference by Use Case

| Use Case | Document |
|----------|----------|
| "I want to integrate the API into my application" | [API Integration Guide](./docs/API_Integration_Guide.md) |
| "I need to deploy to production" | [Railway Deployment Guide](./docs/Railway_Deployment_Guide.md) or [Google Cloud Deployment Guide](./docs/Google_Cloud_Deployment_Guide.md) |
| "I want to monitor and debug my deployment" | [LangSmith Technical Setup](./docs/LangSmith_Technical_Setup.md) |
| "I want to understand the architecture" | [Technical Solution: AI Agents](./docs/Technical_Solution_AI_Agents.md) |
| "I need compliance documentation" | [EU AI Act & GDPR Risk Analysis](./docs/EU_AI_Act_GDPR_Risk_Analysis.md) |
| "I want to build and manage Docker images" | [Artifact Registry Build and Run Guide](./docs/Artifact_Registry_Build_and_Run_Guide.md) |
| "I want to set up local development" | [Local Development](./docs/Local_Development.md) |
| "I need frontend integration examples" | [Frontend Integration Guide](./docs/Frontend_Integration_Guide.md) |

---

## API Endpoints

### Base URL

- **Production (Railway)**: `https://your-orchestrator.up.railway.app`
- **Local Development**: `http://localhost:8003`

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health status of orchestrator and RAG agent connection |
| `/chat` | POST | Send messages to the AI agent and receive responses |
| `/stats` | GET | Usage statistics and metrics |

All endpoints require API key authentication in production via `X-API-Key` header.

### Chat Request/Response

**Request:**

```bash
POST /chat
Content-Type: application/json
X-API-Key: your-secret-api-key-here

{"message": "Your question here"}
```

**Success Response:**

```json
{
  "response": "AI generated response",
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "error": "Error message description"
}
```

### Authentication

| Environment | API Key Required |
|-------------|-----------------|
| **Local Development** | No (for testing convenience) |
| **Railway Production** | Yes — all endpoints (`/health`, `/chat`, `/stats`, `/`) |

- Set via `API_KEY` environment variable in Railway
- Header format: `X-API-Key: your-secret-api-key-here`

### Rate Limits

| Setting | Default | Environment Variable |
|---------|---------|---------------------|
| Requests per IP | 12 per 24 hours | `MAX_CALLS_PER_IP` |
| Rate limit period | 24 hours | `RATE_LIMIT_PERIOD_HOURS` |
| Whitelisted IPs | localhost | Configurable |

---

## Project Structure

### Core Application

```
agents/
└── orchestrator/
    └── orchestrator_agent_secure.py    # Main Flask app with security and LangSmith

scripts/
├── install_requirements.sh             # Dependency installation
└── run_agent.sh                        # Application startup
```

### Development and Testing

```
tests/
├── __init__.py
└── test_orchestrator_agent.py          # Comprehensive test suite

requirements-dev.txt                    # Development dependencies
pytest.ini                              # Testing configuration
.pre-commit-config.yaml                 # Code quality automation
```

### CI/CD and Deployment

```
.github/workflows/
└── ci.yml                              # CI/CD pipeline

Procfile                                # Railway deployment
railway.json                            # Railway health checks
railway.env.example                     # Environment variable template
nixpacks.toml                           # Build configuration
```

### Key Dependencies

**Production** (`requirements.txt`):

| Package | Purpose |
|---------|---------|
| Flask | Web framework for HTTP API |
| Flask-CORS | Cross-origin resource sharing |
| Flask-Limiter | Rate limiting for API protection |
| aiohttp | Async HTTP client for RAG agent communication |
| python-dotenv | Environment variable management |
| gunicorn | WSGI HTTP server for production |
| langsmith | Observability and tracing |
| dspy-ai | AI framework for agent operations |
| crewai | Multi-agent orchestration framework |

**Development** (`requirements-dev.txt`):

| Category | Packages |
|----------|----------|
| Testing | pytest, pytest-cov, pytest-mock, pytest-asyncio |
| Code Quality | black, isort, flake8, mypy, pylint |
| Security | bandit, safety, semgrep |
| Documentation | sphinx, sphinx-rtd-theme |
| Development | pre-commit, tox, watchdog |

---

## Features

### Environment Detection

- **Local**: Auto-detects development environment, uses `localhost:8001`
- **Railway**: Auto-detects Railway environment variables, uses production RAG URL

### CORS Support

Enables cross-origin requests from any frontend application. Configured for WordPress/Jotform ChatBot integration.

### EU AI Act Compliance

| Area | Implementation |
|------|---------------|
| **Prohibited Practices** | Automated scanning in CI/CD — biometric ID, social scoring, manipulation detection |
| **Transparency** | AI disclosure in all interactions, system capability docs, decision explanation, audit trails |
| **Risk Classification** | Automated risk assessment, high-risk system identification, fundamental rights impact assessment |
| **Data Protection** | GDPR integration, privacy by design, data minimization, consent management |

### Security

- API key authentication (header-based `X-API-Key`)
- API key forwarded to RAG agent for end-to-end security
- Regular audits: weekly security scans, monthly dependency reviews, quarterly compliance updates

---

## Documentation Structure

```
docs/
├── API_Integration_Guide.md                  # API integration and examples
├── Frontend_Integration_Guide.md             # Frontend integration examples
├── Railway_Deployment_Guide.md               # Railway deployment guide
├── Google_Cloud_Deployment_Guide.md          # Complete GCP deployment guide
├── Google_Cloud_Quick_Start.md               # GCP quick reference
├── Artifact_Registry_Build_and_Run_Guide.md  # Docker image management
├── Local_Development.md                      # Local dev setup and tools
├── CI_CD_Pipeline.md                         # CI/CD pipeline details
├── LangSmith_Technical_Setup.md              # Observability setup
├── Technical_Solution_AI_Agents.md           # Architecture documentation
└── EU_AI_Act_GDPR_Risk_Analysis.md           # Compliance documentation
```

---

## External Resources

- [Railway Documentation](https://docs.railway.com/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [LangSmith Documentation](https://docs.smith.langchain.com/)

---

*Last Updated: February 2026 — Maintained by the OrchestratorAgent Team*
