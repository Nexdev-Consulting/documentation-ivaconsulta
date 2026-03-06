# Architecture

The VAT Deep RAG Agent is a multi-component system built on Flask, CrewAI, and ChromaDB. This document covers the system architecture, request flow, background initialization, and agent configuration.

---

## System Components

```
┌───────────────────────────────────────────────────────────────────┐
│                        Flask Server                                │
│  crew_agent_server_with_guard_rails.py                            │
│  - HTTP API endpoints (/health, /chat, /)                         │
│  - Request routing and validation                                  │
│  - Background initialization                                       │
│  - Rate limiting and CORS                                          │
└──────────────────────────┬────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌───────────────┐  ┌──────────────────┐
│  Security    │  │  Compliance   │  │  Monitoring       │
│  Layer       │  │  Layer        │  │  (LangSmith)      │
│              │  │               │  │                    │
│  API key     │  │  EU AI Act    │  │  Request tracing   │
│  Rate limit  │  │  validation   │  │  Cost tracking     │
│  Failed      │  │  Content      │  │  Performance       │
│  attempt     │  │  filtering    │  │  metrics           │
│  tracking    │  │  Risk assess  │  │  Error logging     │
└──────────────┘  └───────────────┘  └──────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                      CrewAI Agents                                 │
│  crew_entities.py                                                  │
│  - IVAConsultaCrew: VAT and indirect taxation specialist           │
│  - SapCrew: SAP consulting specialist                              │
│  - Agent orchestration and task execution                          │
└──────────────────────────┬────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐
│  RAG System          │  │  LLM Integration     │
│  (CustomRagTool)     │  │  (CustomLlm)         │
│                      │  │                      │
│  ChromaDB vector DB  │  │  OpenAI GPT-4o-mini  │
│  Document retrieval  │  │  Fallback model      │
│  Context             │  │  Token optimization  │
│  augmentation        │  │                      │
└──────────────────────┘  └──────────────────────┘
```

### Component Summary

| Component | File | Role |
|-----------|------|------|
| **Flask Server** | `crew_agent_server_with_guard_rails.py` | HTTP API, routing, validation, background init |
| **CrewAI Agents** | `crew_entities.py` | IVAConsultaCrew + SapCrew, orchestration, task execution |
| **RAG System** | `CustomRagTool` | ChromaDB vector DB, document retrieval, context augmentation |
| **LLM Integration** | `CustomLlm` | OpenAI GPT-4o-mini, fallback support, token optimization |
| **Compliance Layer** | `compliance_guardrails.py` | EU AI Act validation, content filtering, risk assessment |
| **Security Layer** | `flask_security_integration.py` | API key auth, rate limiting, failed attempt tracking |
| **Monitoring** | `langsmith_integration.py` | Request tracing, cost tracking, performance metrics, error logging |

---

## Request Flow

```
 1. Client Request → Flask Server
 2. API Key Validation (production only)
 3. Rate Limit Check
 4. EU AI Act Compliance Check
 5. Agent Selection (based on agent_type or AGENT_ROLE)
 6. RAG Tool: Document Retrieval from ChromaDB
 7. LLM: Response Generation (GPT-4o-mini)
 8. Response Truncation (600 chars for IVA Consulta)
 9. LangSmith Logging
10. Response to Client
```

### Detailed Flow

1. **Client sends POST to `/chat`** with message, optional agent_type, optional context_country
2. **Security layer** validates the API key (skipped in local development)
3. **Rate limiter** checks per-IP request limits (15/min for chat, 100/hour overall)
4. **Compliance guardrails** validate the message against EU AI Act rules — blocks prohibited content
5. **Agent selection** picks `IVAConsultaCrew` or `SapCrew` based on `agent_type` parameter or `AGENT_ROLE` env var
6. **RAG tool** queries ChromaDB for relevant documents from `data/raw` (VAT) or `data/raw_sap` (SAP)
7. **LLM** (GPT-4o-mini) generates a response using retrieved context
8. **Truncation** ensures IVA Consulta responses stay within 600 characters
9. **LangSmith** logs the full execution trace, tokens, cost, and timing
10. **Response** returned to client as JSON with `response`, `agent_type`, and `timestamp`

---

## Background Initialization

The server uses a background initialization pattern for fast startup, critical for Railway/Cloud Run health checks.

```python
# Main thread: Start Flask server immediately
app.run(host="0.0.0.0", port=8001)

# Background thread: Initialize agents
# 1. Initialize LangSmith
# 2. Initialize LLM (with tracing)
# 3. Initialize RAG Tool (load ChromaDB)
# 4. Initialize Crew (based on AGENT_ROLE)
# 5. Mark as ready
```

### Initialization Stages

| Stage | Status Value | Description |
|-------|-------------|-------------|
| 1 | `starting` | Server just started |
| 2 | `initializing_langsmith` | Setting up monitoring |
| 3 | `initializing_llm` | Loading language model |
| 4 | `initializing_rag` | Loading RAG knowledge base (ChromaDB) |
| 5 | `initializing_crew` | Building CrewAI agents |
| 6 | `ready` | Fully initialized and ready |
| — | `failed` | Initialization failed (check `initialization_error`) |

### Benefits

- **Health checks work immediately** — Railway/Cloud Run deployment succeeds
- **Non-blocking startup** — agents initialize without blocking the server
- **Graceful degradation** — `/chat` returns 503 during initialization
- **Status tracking** — `/health` shows initialization progress in real-time

---

## Agent Configuration

### Agent Definition (`agents/crewai/agents.yaml`)

```yaml
iva_consulta_agent:
  role: IVA Consulta VAT Specialist
  goal: Provide expert VAT and indirect taxation consultation services
  backstory: |
    You are a specialized VAT consultant from IVA Consulta, expert in 
    Spanish and European indirect taxation. You use the RAG knowledge 
    base containing processed VAT documentation to provide accurate, 
    up-to-date information about VAT rules, procedures, and compliance 
    requirements. You always consider Spain as the default country unless 
    specifically asked about another jurisdiction.
```

### Task Definition (`agents/crewai/tasks.yaml`)

```yaml
vat_consultation_task:
  description: |
    Provide expert VAT and indirect taxation consultation based on the 
    user's question. Search the RAG knowledge base for relevant VAT 
    documentation and regulations. If no specific country is mentioned, 
    assume Spain as the default jurisdiction.
  expected_output: |
    A concise and professional response about VAT and indirect taxation 
    (maximum 600 characters). The response should include specific VAT 
    rules, compliance requirements, or procedures relevant to the user's 
    question.
```

### Agent Roles

| `AGENT_ROLE` | Agent | Data Path | Description |
|-------------|-------|-----------|-------------|
| `vat_agent` (default) | `IVAConsultaCrew` | `./data/raw` | VAT and indirect taxation specialist |
| `sap_agent` | `SapCrew` | `./data/raw_sap` | SAP consulting specialist |

The server builds **only the crew corresponding to `AGENT_ROLE`**, not all crews. This reduces memory usage and startup time.

---

## Security Architecture

### API Key Authentication

| Environment | Behavior |
|-------------|----------|
| **Local Development** | API key not required (detected via localhost/127.0.0.1) |
| **Production** | API key required in `X-API-Key` header or `Authorization: Bearer` header |
| **Security Test Mode** | Set `SECURITY_TEST_MODE=true` to require API key locally |

### EU AI Act Compliance Guardrails

All incoming messages are validated before processing:

| Check | Description |
|-------|-------------|
| **Prohibited Content Detection** | Identifies and blocks prohibited AI applications |
| **High-Risk Assessment** | Flags high-risk use cases requiring additional safeguards |
| **Transparency Requirements** | Ensures proper disclosure and transparency |
| **Data Protection** | Validates privacy and data protection compliance |

Compliance violations return an error response with specific violation details.

### Security Features

- **Rate limiting** — configurable per-IP and global limits
- **CORS protection** — restricts origins to configured domains
- **Failed attempt tracking** — records and monitors authentication failures
- **Input validation** — validates all incoming requests
- **Error sanitization** — prevents information leakage in error messages

---

## Monitoring via LangSmith

| Metric | Description |
|--------|-------------|
| **Cost Tracking** | Monitor OpenAI API costs per request |
| **Token Usage** | Track input/output tokens for optimization |
| **Performance Metrics** | Measure response times and latency |
| **Error Tracking** | Log and analyze errors and failures |
| **Agent Tracing** | Full execution traces for debugging |
| **Compliance Logging** | Track compliance violations and patterns |

Access the monitoring dashboard at [smith.langchain.com](https://smith.langchain.com).

For detailed setup, see [LangSmith Integration](./Langsmith_Integration.md).
