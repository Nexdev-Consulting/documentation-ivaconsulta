---
slug: /docs/Rate_Limiting_Architecture
---

# Rate Limiting Architecture

The Orchestrator implements distributed rate limiting using an Express + Redis API service. This architecture ensures consistent rate limiting across all Gunicorn workers.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Orchestrator Service (Python/Flask)                            │
│  - Checks IP limits before processing                           │
│  - Records successful calls after processing                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP API
                         │ (EXPRESS_API_URL)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express Redis API Service (Node.js)                            │
│  - POST /api/chatbot/check-limit  (check IP rate limit)         │
│  - POST /api/chatbot/record-call  (record successful call)      │
│  - GET  /api/chatbot/ips          (retrieve all IPs)            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Redis Database                                                  │
│  - Set: chatbot_ips {ip, timestamp, datetime}                    │
│  - Stores all IP tracking data                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Priority Failover System

The Orchestrator uses a three-tier failover for rate limiting:

| Priority | Backend | When Used | Distributed? |
|----------|---------|-----------|-------------|
| 1 (Primary) | **HTTP API** | `EXPRESS_API_URL` is set | Yes — all workers share state |
| 2 (Fallback) | **Direct Redis** | `REDIS_URL` is set, no Express URL | Yes — but may have URL format issues |
| 3 (Last Resort) | **In-Memory** | Neither available | No — per-worker only |

**Recommended for production**: HTTP API (Priority 1).

---

## Rate Limiting Flow

### Check → Process → Record

```
1. Visitor asks chatbot question
2. Orchestrator calls POST /api/chatbot/check-limit with visitor's IP
3. Express API queries Redis for the IP's call history
4. Express API filters calls within the time window (e.g., last 24 hours)
5. Express API returns { allowed: true/false, calls: N, maxCalls: M }
6. If allowed:
   a. Orchestrator forwards question to RAG Agent
   b. Orchestrator returns RAG response to visitor
   c. Orchestrator calls POST /api/chatbot/record-call to log the interaction
7. If blocked:
   a. Orchestrator returns rate limit message to visitor
```

### Sliding Window

The rate limiting uses a sliding window approach rather than fixed windows:

```
Config: Max 12 calls per 24 hours

Day 1, 10:00 AM - Call #1   → Allowed (1/12)
Day 1, 11:00 AM - Call #2   → Allowed (2/12)
...
Day 1, 10:00 PM - Call #12  → Allowed (12/12)
Day 1, 11:00 PM - Call #13  → BLOCKED (12/12 in last 24h)
Day 2, 10:01 AM - Next call → Allowed (11/12, call #1 expired)
```

**Benefits over fixed windows**: Prevents burst abuse at window boundaries, fairer to users, smoother rate limiting.

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_CALLS_PER_IP` | `12` | Maximum calls per IP within the period |
| `RATE_LIMIT_PERIOD_MINUTES` | `1440` (24h) | Sliding window period in minutes |
| `RATE_LIMIT_WHITELIST_IPS` | — | Comma-separated IPs to skip rate limiting |
| `EXPRESS_API_URL` | — | URL of the Express Redis API service |
| `EXPRESS_API_KEY` | — | API key for the Express Redis API |

---

## Setup

### Prerequisites

- Express Redis API service deployed on Railway
- Redis database added to Railway project

### Steps

1. **Deploy Express Redis API** (Railway auto-configures `REDIS_URL` for the Express service)

2. **Generate and set API key for Express service**:

```bash
openssl rand -base64 32
# Set in Railway Dashboard → Express API Service → Variables
# EXPRESS_API_KEY=your-secure-random-api-key-here
```

3. **Configure Orchestrator service**:

```bash
# Railway Dashboard → Orchestrator Service → Variables
EXPRESS_API_URL=https://your-express-api.railway.app
EXPRESS_API_KEY=your-secure-random-api-key-here
```

4. **Verify connection** — check Orchestrator logs for:

```
✅ HTTP rate limiter initialized successfully
```

Test the health endpoint:

```bash
curl https://your-orchestrator.railway.app/health/redis \
  -H "X-API-Key: your-api-key"
```

---

## Monitoring Rate Limits

### Stats Endpoint

```bash
curl https://your-app.railway.app/stats \
  -H "X-API-Key: your-api-key"
```

**Response:**

```json
{
  "backend": "http_api",
  "total_chat_calls": 42,
  "unique_ips": 5,
  "calls_by_ip": {
    "192.168.1.1": {
      "calls": 10,
      "latest_timestamp": 1706200000000
    }
  },
  "note": "Using HTTP_API for distributed rate limiting - stats are accurate across all workers"
}
```

### What to Monitor

| Metric | Where | What to Look For |
|--------|-------|-----------------|
| Backend type | `/stats` response | Should show `http_api` in production |
| Total calls | `/stats` response | Unusual spikes indicate potential abuse |
| Unique IPs | `/stats` response | Track growth over time |
| Rate limit hits | Orchestrator logs | `rate_limit_exceeded` entries |
| Redis connectivity | `/health/redis` | Should return healthy status |
