---
slug: /docs/IP_Rate_Limiting
---

# IP Rate Limiting (HTTP API)

The Orchestrator implements IP-based rate limiting using a separate Express + Redis API service. This eliminates the need for direct Redis connections from the Python orchestrator and provides a clean separation of concerns.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Python Orchestrator (orchestrator_agent_secure.py)             │
│                                                                  │
│  /chat Endpoint Flow:                                           │
│  1. Extract client IP                                           │
│  2. Check whitelist → whitelisted IPs bypass all limits         │
│  3. EARLY CHECK: count_ip_calls_from_redis()                    │
│     └─ GET /api/chatbot/ips (retrieve all IPs from Redis)       │
│     └─ Filter entries for client IP                             │
│     └─ Count calls within period (e.g., last 24 hours)          │
│  4. check_ip_limit_via_redis_api()                              │
│  5. If BLOCKED → return 429 + contact message                   │
│     If ALLOWED → continue                                       │
│  6. Process RAG Agent call                                      │
│  7. RECORD CALL: record_call_via_redis_api()                    │
│     └─ POST /api/chatbot/record-call (record IP + timestamp)    │
└────────────────────────────────────┬────────────────────────────┘
                                     │ HTTP API
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express API (Node.js) + Redis Database                         │
│  • GET  /api/chatbot/ips          (retrieve all IPs)            │
│  • POST /api/chatbot/record-call  (record IP + timestamp)       │
│  • Redis Set: chatbot_ips {ip, timestamp, datetime}             │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Two-phase approach** | Check first (read-only), then record after success — prevents recording blocked or failed requests |
| **Early blocking** | Rate-limited IPs are blocked BEFORE processing the question — saves RAG agent resources |
| **HTTP API over direct Redis** | Express/ioredis handles Railway's Redis URL format; no Python Redis client needed |
| **Separation of concerns** | Redis logic centralized in Express service; orchestrator only makes HTTP calls |

---

## Two-Phase Rate Limiting Flow

### Phase 1: Early Rate Limit Check (Before Processing)

Runs before the question is sent to the RAG agent. This is a **read-only check** that prevents wasting resources on blocked requests.

```
1. Extract client IP from request data or headers
2. Check whitelist → whitelisted IPs bypass all rate limiting
3. Call check_ip_limit_via_redis_api(client_ip, max_calls, period_minutes)
   └─ Internally calls count_ip_calls_from_redis() via GET /api/chatbot/ips
   └─ Filters entries for client IP, counts calls within time window
4. If blocked → return 429 with CONTACT_MESSAGE
5. If allowed → continue to Phase 2
```

### Phase 2: Record Call (After Successful Processing)

Runs **only after** the RAG agent successfully processes the question.

```
1. Process RAG agent call → get response
2. Parse timestamp from response
3. Call record_call_via_redis_api(client_ip, timestamp_ms)
   └─ POST /api/chatbot/record-call with IP + timestamp
4. Return response to client
```

---

## Core Functions

### `count_ip_calls_from_redis()`

Counts the number of calls made by an IP address by querying the Express API.

```python
call_count, ip_entries = await count_ip_calls_from_redis(client_ip, period_minutes)
```

**How it works:**
1. Sends `GET` to `/api/chatbot/ips`
2. Retrieves all IP tracking entries from Redis
3. Filters entries for the specified client IP
4. Counts calls within the specified period (e.g., last 24 hours)

### `check_ip_limit_via_redis_api()`

Checks if an IP has exceeded the rate limit **without recording the call** (read-only).

```python
is_allowed, reason, metadata = await check_ip_limit_via_redis_api(
    client_ip="192.168.1.1",
    max_calls=12,
    period_minutes=1440
)
# Returns: (False, "Rate limit exceeded: 12/12 calls...", {...})
```

**How it works:**
1. Calls `count_ip_calls_from_redis()` to get current call count
2. Compares count against `max_calls` limit
3. If exceeded, calculates time until limit resets
4. Returns `(is_allowed, reason, metadata)`

### `record_call_via_redis_api()`

Records a call for an IP via Express API — called **only after successful processing**.

```python
success = await record_call_via_redis_api(
    client_ip="192.168.1.1",
    timestamp=1708099200000
)
# Returns: True if successful
```

**How it works:**
1. Sends `POST` to `/api/chatbot/record-call`
2. Includes IP address and timestamp in payload
3. Express API stores entry in Redis set

---

## Setup

### Step 1: Deploy Express Redis API

Push the Express API to Railway. Railway auto-configures `REDIS_URL` for the Express service when Redis is in the same project.

### Step 2: Set API Key in Express Service

```bash
# Generate a secure key
openssl rand -base64 32

# Railway Dashboard → Express API Service → Variables
EXPRESS_API_KEY=your-secure-random-api-key-here
```

### Step 3: Configure Orchestrator

```bash
# Railway Dashboard → Orchestrator Service → Variables
EXPRESS_API_URL=https://your-express-api.railway.app
EXPRESS_API_KEY=your-secure-random-api-key-here  # Must match Express service
```

**The API key must be identical in both services.**

### Step 4: Verify Connection

Check orchestrator logs after deploying:

```
✅ HTTP rate limiter initialized successfully
   Using Express API: https://your-express-api.railway.app
   Express API status: Express API is running
   API authentication: ✅ Valid
```

If authentication fails:

```
❌ Express API connection failed: Authentication failed: 401 Unauthorized - Check EXPRESS_API_KEY
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPRESS_API_URL` | Yes | — | Base URL of Express Redis API |
| `EXPRESS_API_KEY` | Yes | — | API key (must match Express service) |
| `MAX_CALLS_PER_IP` | No | `12` | Maximum calls per IP per period |
| `RATE_LIMIT_PERIOD_MINUTES` | No | `1440` (24h) | Rate limit sliding window in minutes |
| `RATE_LIMIT_WHITELIST_IPS` | No | — | Comma-separated whitelisted IPs |

### Example Configuration

```bash
# Production (Railway) — Orchestrator Service
EXPRESS_API_URL=https://express-redis-api.railway.app
EXPRESS_API_KEY=Kx9Jm2Pq8Rl4Tn7Vy3Bw6Hs5Np1Zc0
MAX_CALLS_PER_IP=12
RATE_LIMIT_PERIOD_MINUTES=1440

# Production (Railway) — Express API Service
EXPRESS_API_KEY=Kx9Jm2Pq8Rl4Tn7Vy3Bw6Hs5Np1Zc0  # Same key

# Development
EXPRESS_API_URL=http://localhost:3000
EXPRESS_API_KEY=test-api-key-local
```

---

## Failover Strategy

The orchestrator uses a priority failover system:

| Priority | Backend | When Used | Distributed? |
|----------|---------|-----------|-------------|
| 1 (Primary) | **HTTP API** | `EXPRESS_API_URL` is set | Yes — all workers share state |
| 2 (Fallback) | **Direct Redis** | `REDIS_URL` is set, no Express URL | Yes — but may have URL format issues |
| 3 (Last Resort) | **In-Memory** | Neither available | No — per-worker only |

### Example Logs

**HTTP API success:**

```
🔄 Attempting to connect to Express Redis API...
✅ HTTP rate limiter initialized successfully
   Using Express API: https://express-api.railway.app
```

**Fallback to Direct Redis:**

```
🔄 Attempting to connect to Express Redis API...
⚠️  Express API not available, trying direct Redis...
✅ Redis rate limiter initialized successfully on attempt 1
```

**Fallback to In-Memory:**

```
⚠️  Using in-memory rate limiting (per-worker, not distributed)
   Set EXPRESS_API_URL or REDIS_URL to enable distributed rate limiting
```

---

## Monitoring

### Log Patterns

**Successful rate check:**

```
📊 Chat endpoint call count: 42 (Backend: HTTP_API, Worker PID: 12345)
   IP: 1.2.3.4 (calls: 10/12)
   ℹ️  Using HTTP_API for distributed rate limiting - counts are accurate across all workers
```

**Rate limit exceeded:**

```
🛡️  HTTP_API rate limit blocked IP 1.2.3.4: Rate limit exceeded: 12/12 calls. Limit resets in 2h 30m.
```

### Health and Stats Endpoints

```bash
# Check rate limiter health
curl https://your-orchestrator.railway.app/health/redis \
  -H "X-API-Key: your-api-key"

# Check statistics
curl https://your-orchestrator.railway.app/stats \
  -H "X-API-Key: your-api-key"
```

**Stats response:**

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
  }
}
```

---

## Troubleshooting

### Express API Connection Failed

**Symptom:** `❌ Express API connection failed: Failed to connect...`

**Fix:** Verify `EXPRESS_API_URL` is correct and accessible. Check Express API service is running. Test health endpoint manually.

### API Returned Status 503

**Cause:** Redis not connected in Express service, or service overloaded.

**Fix:** Check Express API logs for Redis connection errors. Verify Redis service is running in Railway. Check `REDIS_URL` is set in Express service.

### Rate Limiting Not Working

**Symptom:** IPs not being tracked, stats show 0 IPs.

**Fix:** Check `EXPRESS_API_URL` is set correctly. Verify Express API is receiving requests (check logs). Test Express API endpoints manually with curl.

### In-Memory Rate Limiting Warning

**Symptom:** `⚠️ Using in-memory rate limiting (per-worker, not distributed)`

**Fix:** Set `EXPRESS_API_URL` in orchestrator environment and redeploy.

---

## Migration from Direct Redis

| Aspect | Before (Direct Redis) | After (HTTP API) |
|--------|----------------------|------------------|
| Config | `REDIS_URL=redis://...` | `EXPRESS_API_URL=https://...` |
| Dependency | Python `redis-py` library | HTTP calls only |
| URL format | Issues with Railway Redis URLs | Express/ioredis handles it |
| Maintenance | Redis logic in Python code | Centralized in Express service |

### Migration Steps

1. Deploy Express API (if not already deployed)
2. Set `EXPRESS_API_URL` in orchestrator
3. Remove `REDIS_URL` (optional — kept as fallback)
4. Redeploy orchestrator
5. Verify logs show HTTP API connection

---

## Performance

| Backend | Typical Latency | Notes |
|---------|----------------|-------|
| In-Memory | < 1ms | Not distributed across workers |
| Direct Redis | 2–5ms | May have URL format issues on Railway |
| HTTP API | 30–50ms | Best reliability and maintainability |

**Optimization tips:** Express API can implement caching, HTTP client uses connection pooling, all HTTP requests are async, and quick fallback if API is slow/unavailable.

---

## Best Practices

1. **Use HTTP API first** — set `EXPRESS_API_URL` as primary method
2. **Keep Redis as fallback** — keep `REDIS_URL` for redundancy
3. **Monitor both services** — watch logs for both orchestrator and Express API
4. **Test failover** — verify behavior when Express API is down
5. **Use fail-open** — keep `fail_open=True` for high availability
6. **Implement health checks** — use `/health/redis` endpoint
