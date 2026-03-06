---
slug: /intro
---

# VAT Deep RAG Agent

A CrewAI-powered agent that provides expert VAT and indirect taxation consultation using RAG (Retrieval Augmented Generation) with processed VAT documentation. Deployed on Railway, it serves as the AI backend called by the Orchestrator Agent and can also be accessed directly via HTTPS.

The server is implemented in `agents/crewai/crew_agent_server_with_guard_rails.py` and includes comprehensive security, monitoring, and compliance features.

**Quick Test:**

```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuál es el IVA en España?", "context_country": "Spain"}'
```

---

## Features

- **Expert VAT Knowledge**: Specialized in Spanish and European indirect taxation
- **RAG-Powered**: Uses processed VAT documentation from `data/raw` and `data/raw_sap`
- **Multi-Agent Support**: VAT Agent (`iva_consulta_agent`) and SAP Agent (`sap_consultant`)
- **Concise Responses**: Automatically limits responses to 600 characters maximum
- **Spain Default**: Uses Spain as default country unless another jurisdiction is specified
- **Multi-language**: Handles questions in Spanish and English
- **EU AI Act Compliance**: Built-in guardrails for compliance validation
- **LangSmith Integration**: Comprehensive monitoring, tracing, and cost tracking
- **API Key Authentication**: Secure API access in production environments
- **Background Initialization**: Server starts immediately while agents initialize in background
- **ChromaDB Vector Database**: Efficient document retrieval and ranking

---

## Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [Architecture](./docs/Architecture.md) | System components, request flow, background initialization, agent/task configuration |
| [Configuration Guide](./docs/Configuration_Guide.md) | Complete environment and configuration setup |
| [Files Management](./docs/Files_Management.md) | PDF document processing, reset, and management |

### API

| Document | Description |
|----------|-------------|
| [IVA Consulta API](./docs/IVA_CONSULTA_API.md) | VAT agent API documentation |
| [Guardrails API](./docs/GUARDRAILS_IVA_CONSULTA_API.md) | API with EU AI Act compliance details |

### Deployment and Operations

| Document | Description |
|----------|-------------|
| [Deployment Guide](./docs/Deployment_Guide.md) | Railway deployment, environment variables, checklist, startup behavior |
| [Troubleshooting and Performance](./docs/Troubleshooting_and_Performance.md) | Common issues, debugging, health check interpretation, performance optimization |

### Monitoring and Compliance

| Document | Description |
|----------|-------------|
| [LangSmith Integration](./docs/Langsmith_Integration.md) | Monitoring, debugging, and performance analysis setup |
| [Documentation Consolidation Summary](./docs/DOCUMENTATION_CONSOLIDATION_SUMMARY.md) | Recent documentation updates |

### Contributing

| Document | Description |
|----------|-------------|
| [Contributing Guide](./CONTRIBUTING.md) | Contributing guidelines |

---

## Quick Reference by Use Case

| Use Case | Document |
|----------|----------|
| "I want to understand the system architecture" | [Architecture](./docs/Architecture.md) |
| "I need to configure the agent" | [Configuration Guide](./docs/Configuration_Guide.md) |
| "I need to process PDF documents" | [Files Management](./docs/Files_Management.md) |
| "I want to integrate the API" | [IVA Consulta API](./docs/IVA_CONSULTA_API.md) |
| "I need to deploy to production" | [Deployment Guide](./docs/Deployment_Guide.md) |
| "I want to set up monitoring" | [LangSmith Integration](./docs/Langsmith_Integration.md) |
| "I'm debugging an issue" | [Troubleshooting and Performance](./docs/Troubleshooting_and_Performance.md) |

---

## API Endpoints

### Base URL

- **Production (Railway)**: `https://your-railway-app.railway.app`
- **Local Development**: `http://localhost:8001`

### Endpoints

| Endpoint | Method | Auth Required (Production) | Description |
|----------|--------|---------------------------|-------------|
| `/health` | GET | No | Server health status and initialization state |
| `/chat` | POST | Yes | Interact with the AI agent |
| `/` | GET | Yes | Server information and available endpoints |

### Chat Endpoint

**Request:**

```bash
POST /chat
Content-Type: application/json
X-API-Key: your-api-key-here

{
  "message": "¿Cuál es el IVA en España para servicios digitales?",
  "agent_type": "iva_consulta_agent",
  "context_country": "Spain"
}
```

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `message` | Yes | — | The user's question |
| `agent_type` | No | Based on `AGENT_ROLE` | `iva_consulta_agent` (VAT) or `sap_consultant` (SAP) |
| `context_country` | No | `Spain` | Country context for the query |

**Success Response:**

```json
{
  "response": "En España, los servicios digitales están sujetos al IVA general del 21%...",
  "agent_type": "iva_consulta_agent",
  "timestamp": "2025-02-17T10:30:00.000Z"
}
```

### Error Responses

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | `{"response": "...", "agent_type": "...", "timestamp": "..."}` |
| 400 | Bad request | Missing message or invalid parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 429 | Rate limit exceeded | Too many requests from same IP |
| 500 | Internal server error | Compliance violation or processing error |
| 503 | Service unavailable | Server still initializing |

### Rate Limits

| Limit | Value |
|-------|-------|
| Chat endpoint | 15 requests per minute |
| Overall | 100 requests per hour, 20 requests per minute |

---

## Project Structure

```
RagTool/
├── agents/
│   ├── crewai/
│   │   ├── crew_agent_server_with_guard_rails.py  # Main server
│   │   ├── crew_entities.py                       # Agent and crew definitions
│   │   ├── agents.yaml                            # Agent configuration
│   │   └── tasks.yaml                             # Task configuration
│   ├── guardrails/                                # EU AI Act compliance
│   │   ├── compliance_guardrails.py               # Compliance implementation
│   │   └── test_guardrails.py                     # Compliance tests
│   ├── langsmith_integration.py                   # LangSmith monitoring
│   ├── flask_security_integration.py              # API key auth + rate limiting
│   └── rag/                                       # RAG tool (CustomRagTool)
├── data/
│   ├── raw/                  # VAT agent documents (default)
│   ├── raw_sap/              # SAP agent documents
│   └── processed/            # Processing metadata
├── db/                       # ChromaDB / FAISS vector database storage
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
├── tests/                    # Test files
├── files_manager_runner.py   # PDF processing CLI
├── requirements.txt          # Production dependencies
├── requirements-dev.txt      # Development dependencies
├── railway.json              # Railway deployment configuration
├── env.example               # Environment variables template
└── start_guardrails_server.sh
```

### Key Dependencies

| Package | Purpose |
|---------|---------|
| **crewai** | AI agent framework for intelligent conversations |
| **crewai-tools** | RAG tool for document processing and vector search |
| **flask** | Web framework for HTTP API |
| **flask-cors** | CORS support for web requests |
| **faiss-cpu** | FAISS vector database for document embeddings |
| **openai** | OpenAI API integration for LLM and embeddings |
| **langsmith** | Monitoring and tracing |
| **python-dotenv** | Environment variable management |
| **pypdf** | PDF document processing |

---

## Quick Start

```bash
# 1. Setup
cp env.example .env
# Edit .env: set OPENAI_API_KEY, AGENT_ROLE=vat_agent

# 2. Install dependencies
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3. Process PDFs
python3 files_manager_runner.py process

# 4. Start server
python agents/crewai/crew_agent_server_with_guard_rails.py

# 5. Test
curl http://localhost:8001/health
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the VAT rate in Spain?", "context_country": "Spain"}'
```

---

## Integration Examples

### Orchestrator Agent Calling VAT Agent (Python)

```python
import requests

response = requests.post(
    "https://your-railway-app.railway.app/chat",
    headers={
        "Content-Type": "application/json",
        "X-API-Key": "your_api_key_here"
    },
    json={
        "message": "What is the VAT rate for digital services in Spain?",
        "context_country": "Spain"
    }
)

agent_response = response.json()["response"]
```

### External Client (JavaScript)

```javascript
async function askIVAQuestion(question, country = "Spain") {
  const response = await fetch(
    "https://your-railway-app.railway.app/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "your-api-key-here",
      },
      body: JSON.stringify({
        message: question,
        agent_type: "iva_consulta_agent",
        context_country: country,
      }),
    }
  );
  const data = await response.json();
  return data.response;
}

const answer = await askIVAQuestion("¿Cuál es el IVA en España?");
```

---

## Environment Variables (Summary)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for LLM and embeddings |
| `AGENT_ROLE` | No | `vat_agent` | `vat_agent` or `sap_agent` |
| `API_KEY` | Production | — | API key for authentication |
| `RAG_DATA_PATH` | No | `./data/raw` | Path to RAG documents |
| `LANGSMITH_API_KEY` | No | — | LangSmith monitoring |
| `PORT` | No | `8001` | Server port |

For complete configuration, see [Configuration Guide](./docs/Configuration_Guide.md).

---

*For technical support, see [Troubleshooting and Performance](./docs/Troubleshooting_and_Performance.md) or contact the development team.*
