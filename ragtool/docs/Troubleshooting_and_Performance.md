---
slug: /docs/Troubleshooting_and_Performance
---

# Troubleshooting and Performance

Common issues, debugging techniques, health check interpretation, and performance optimization for the VAT Deep RAG Agent.

---

## Common Issues

### 1. Server Returns 503 "Still Initializing"

**Cause**: Agents are still loading in the background thread.

**Solution**: Wait 30–60 seconds and retry. Check the `/health` endpoint for initialization status:

```bash
curl https://your-app.railway.app/health | jq '.initialization_status'
```

### 2. 401 Unauthorized Error

**Cause**: Missing or invalid API key.

**Solution**:
- Ensure `X-API-Key` header is set in the request
- Verify the key matches the `API_KEY` environment variable
- Check if running in production (API key is required)

```bash
curl -H "X-API-Key: your-key" https://your-app.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### 3. Compliance Violation Error

**Cause**: Message violates EU AI Act compliance rules.

**Solution**: Review the message content. The guardrails block requests involving:
- Prohibited AI applications
- Manipulation or deception
- Social scoring
- Biometric identification without consent

### 4. RAG Tool Initialization Failed

**Cause**: Missing data files or ChromaDB issues.

**Solution**:
1. Verify data files exist in the `RAG_DATA_PATH` directory
2. Check file permissions
3. Ensure ChromaDB dependencies are installed
4. Review logs for the specific error

```bash
ls -la ./data/raw/
ls -la ./data/raw_sap/
```

### 5. LangSmith Not Logging

**Cause**: Missing or invalid LangSmith configuration.

**Solution**:
- Set `LANGSMITH_API_KEY` environment variable
- Verify project name in `LANGSMITH_PROJECT`
- Check `/health` endpoint for `langsmith.enabled: true`

### 6. Rate Limit Exceeded (429)

**Cause**: Too many requests from the same IP.

**Solution**:
- Wait before retrying
- Implement exponential backoff in your client
- Contact support for rate limit increase

### 7. "Could not load documents"

**Cause**: PDF files missing from data directory.

**Solution**:

```bash
python3 files_manager_runner.py list      # Check processed files
python3 files_manager_runner.py process   # Process PDFs
```

### 8. "No existing FAISS vector database found"

**Cause**: First-time setup or database corruption.

**Solution**:

```bash
python3 files_manager_runner.py process   # Create database
python3 files_manager_runner.py --reset   # Reset if corrupted
```

### 9. OpenAI API Errors

**Cause**: Invalid API key or insufficient credits.

**Solution**:

```bash
python3 -m agents.config --validate       # Verify configuration
```

### 10. Railway Deployment Issues

**Cause**: Missing environment variables or configuration.

**Solution**:
- Ensure all environment variables are set in the Railway dashboard
- Check Railway logs for detailed error messages
- Verify `railway.json` is present and valid

---

## Debug Mode

For local debugging, the server provides detailed console output:

```bash
python3 agents/crewai/crew_agent_server_with_guard_rails.py
```

Watch for these log indicators:

| Icon | Meaning |
|------|---------|
| `🚀` | Server startup and configuration |
| `🔄` | Background initialization progress |
| `📝` | Incoming requests and messages |
| `🛡️` | Compliance check results |
| `🤖` | Agent execution details |
| `📊` | LLM usage summaries |
| `✅` | Success indicators |
| `❌` | Error details |

---

## Health Check Interpretation

```json
{
  "status": "healthy",
  "initialization_complete": true,
  "initialization_status": "ready",
  "rag_enabled": true,
  "rag_status": "RAG Tool: Available (ChromaDB)",
  "llm_model": "Model: gpt-4o-mini (OpenAI)",
  "langsmith": {
    "enabled": true,
    "client_available": true
  }
}
```

### Status Values

| Value | Meaning |
|-------|---------|
| `healthy` | All systems operational |
| `initializing` | Startup in progress |
| `unhealthy` | Initialization failed |

### Initialization Stages

| Value | Meaning |
|-------|---------|
| `starting` | Just started |
| `initializing_langsmith` | Loading monitoring |
| `initializing_llm` | Loading language model |
| `initializing_rag` | Loading knowledge base |
| `initializing_crew` | Building agents |
| `ready` | Fully operational |
| `failed` | Error — check `initialization_error` field |

### Key Fields to Monitor

| Field | Expected Value | Action if Wrong |
|-------|---------------|----------------|
| `status` | `healthy` | Check logs, restart service |
| `initialization_complete` | `true` | Wait or check `initialization_error` |
| `rag_enabled` | `true` | Check data files and ChromaDB |
| `langsmith.enabled` | `true` | Check `LANGSMITH_API_KEY` |
| `langsmith.client_available` | `true` | Verify LangSmith connectivity |

---

## Quick Fixes

```bash
# Reset everything and start fresh
python3 files_manager_runner.py --reset

# Validate configuration
python3 -m agents.config --validate

# Process PDFs manually
python3 files_manager_runner.py process

# Check agent role and data path
echo "AGENT_ROLE: ${AGENT_ROLE:-vat_agent}"
echo "RAG_DATA_PATH: ${RAG_DATA_PATH:-./data/raw}"

# Check system info
python3 -m agents.config --info
```

---

## Performance Optimization

### Response Times

| Scenario | Typical Time |
|----------|-------------|
| Health check | < 50ms |
| Chat endpoint (cold) | 2–5 seconds |
| Chat endpoint (warm) | 1–3 seconds |

### Factors Affecting Performance

| Factor | Impact |
|--------|--------|
| RAG document retrieval time | ChromaDB query speed depends on collection size |
| LLM generation speed | GPT-4o-mini is optimized for speed |
| Network latency | Affects Railway ↔ OpenAI communication |
| ChromaDB query performance | Scales with vector collection size |

### Cost Optimization

Monitor costs via the LangSmith dashboard:

| Strategy | Description |
|----------|-------------|
| **Token usage** | Track input/output tokens per request |
| **Model selection** | GPT-4o-mini is optimized for cost/performance balance |
| **Response length** | IVA Consulta responses limited to 600 characters |
| **Caching** | ChromaDB caches frequently accessed documents |

### Scaling Considerations

For high-traffic deployments:

| Strategy | Description |
|----------|-------------|
| **Horizontal scaling** | Deploy multiple instances behind a load balancer |
| **Rate limiting** | Adjust limits based on capacity |
| **Response caching** | Cache responses for common queries |
| **Dedicated database** | Consider a dedicated ChromaDB instance |
| **Alerting** | Set up alerts for high latency/errors in LangSmith |

---

## Logging

### Console Logging

The server provides structured console logging covering:
- Server startup and configuration
- Background initialization progress
- Incoming requests and messages
- Compliance check results
- Agent execution details
- LLM usage summaries

### Health Check Monitoring

Configure your deployment platform to poll the `/health` endpoint:

```bash
curl https://your-app.railway.app/health
```

Monitor: `status`, `initialization_complete`, `rag_enabled`, and `langsmith.enabled`.

### LangSmith Dashboard

View comprehensive metrics at [smith.langchain.com](https://smith.langchain.com):

| Section | What It Shows |
|---------|--------------|
| **Runs** | Individual agent executions with full traces |
| **Datasets** | Test datasets and evaluation results |
| **Monitoring** | Real-time metrics and alerts |
| **Costs** | OpenAI API usage and costs |
| **Feedback** | User feedback and quality metrics |
