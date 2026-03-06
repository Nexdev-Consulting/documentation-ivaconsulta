---
slug: /docs/Express_Redis_API
---

# Express Redis API

A Node.js Express server that provides rate limiting functionality using Redis as a database. It tracks IP addresses and their API call timestamps to enforce rate limits for the chatbot service.

**Key Purpose**: Enable free testing of the VAT Deep AI agent by limiting how many times an IP address can call the chatbot API within a specific time period.

---

## Architecture

```
Client Request → Express Server → Authentication → Redis Database → Response
```

| Component | Role |
|-----------|------|
| **Express Server** (`server.js`) | HTTP request handling, API key validation, CORS, routing |
| **Redis API** (`redis-api.js`) | Business logic for IP tracking and rate limit enforcement |
| **Redis Database** | Stores IP tracking data (managed by Railway) |

---

## Redis Data Model

### Storage Structure

Redis stores IP tracking data in a **Set** called `chatbot_ips`. Each entry contains:

```json
{
  "ip": "192.168.1.1",
  "timestamp": 1708099200000,
  "datetime": "2024-02-16T12:00:00.000Z"
}
```

**Why a Set?** Sets automatically handle duplicates, provide fast lookups, and each IP call is stored as a separate entry (allowing multiple timestamps per IP).

### Redis Operations

| Operation | Command | Purpose |
|-----------|---------|---------|
| Get all entries | `SMEMBERS` | Retrieve all IP tracking data |
| Add new entry | `SADD` | Record a new API call |

### Redis Connection

The API connects to Redis via `ioredis` with two methods:

| Method | When Used |
|--------|-----------|
| `REDIS_URL` (preferred) | Single connection string — Railway provides this automatically |
| Individual params | Fallback: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |

---

## API Endpoints

### 1. Health Check

```
GET /
```

**Auth**: None required

```json
{
  "status": "ok",
  "message": "Express Redis API is running",
  "version": "2.0.0",
  "endpoints": {
    "health": "/",
    "checkLimit": "/api/chatbot/check-limit",
    "recordCall": "/api/chatbot/record-call",
    "getAllIps": "/api/chatbot/ips",
    "addIps": "/api/chatbot/ips"
  }
}
```

### 2. Check Rate Limit

```
POST /api/chatbot/check-limit
```

**Auth**: Required

**Request:**

```json
{
  "ip": "192.168.1.1",
  "maxCalls": 12,
  "periodMinutes": 1440
}
```

**Response (Allowed):**

```json
{
  "allowed": true,
  "reason": "Within rate limit: 5/12 calls (after this call)",
  "calls": 4,
  "maxCalls": 12,
  "limitExceeded": false
}
```

**Response (Blocked):**

```json
{
  "allowed": false,
  "reason": "Rate limit exceeded: 12/12 calls in last 1440 minutes. Limit resets in approximately 18h 30m.",
  "calls": 12,
  "maxCalls": 12,
  "limitExceeded": true,
  "resetTime": 1708165800000,
  "timeUntilResetMs": 66600000
}
```

**How it works**: Retrieves all entries for the IP from Redis → filters within the time window → counts calls → compares against maximum → returns allowed/blocked.

### 3. Record API Call

```
POST /api/chatbot/record-call
```

**Auth**: Required

**Request:**

```json
{
  "ip": "192.168.1.1",
  "timestamp": 1708099200000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Call recorded successfully",
  "entry": {
    "ip": "192.168.1.1",
    "timestamp": 1708099200000,
    "datetime": "2024-02-16T12:00:00.000Z"
  }
}
```

### 4. Get All IPs

```
GET /api/chatbot/ips
```

**Auth**: Required

```json
{
  "success": true,
  "count": 3,
  "ips": [
    {
      "ip": "192.168.1.1",
      "timestamp": 1708099200000,
      "datetime": "2024-02-16T12:00:00.000Z"
    }
  ]
}
```

### 5. Add IPs (Bulk)

```
POST /api/chatbot/ips
```

**Auth**: Required

**Request:**

```json
{
  "ips": [
    { "ip": "192.168.1.1", "timestamp": 1708099200000, "datetime": "2024-02-16T12:00:00.000Z" },
    { "ip": "192.168.1.2", "timestamp": 1708095600000, "datetime": "2024-02-16T11:00:00.000Z" }
  ]
}
```

Useful for testing or bulk operations.

---

## Authentication

All `/api/*` endpoints require an API key via one of:

| Method | Header |
|--------|--------|
| Recommended | `X-API-Key: your-api-key-here` |
| Alternative | `Authorization: Bearer your-api-key-here` |

The key is validated against the `EXPRESS_API_KEY` environment variable.

**Error Responses:**

| Code | Reason | Message |
|------|--------|---------|
| 401 | No API key provided | `API key required. Provide X-API-Key header or Authorization: Bearer <key>` |
| 403 | Invalid API key | `Invalid API key` |

---

## Error Handling

| Code | Cause | Response |
|------|-------|----------|
| 400 | Invalid request data | `{"error": "ips must be an array"}` |
| 401 | Missing API key | `{"error": "Unauthorized", "message": "..."}` |
| 403 | Invalid API key | `{"error": "Forbidden", "message": "..."}` |
| 500 | Server error | `{"error": "Failed to retrieve IPs from Redis", "type": "RedisError"}` |
| 503 | Redis not connected | `{"error": "Redis connection not ready", "status": "connecting"}` |

---

## Railway Deployment

### Services

| Service | Type | Purpose |
|---------|------|---------|
| **Express API** | Node.js application | HTTP API for rate limiting |
| **Redis** | Managed database | IP tracking data storage |

### Environment Variables (Express API)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPRESS_API_KEY` | Yes | API key for endpoint authentication |
| `PORT` | Auto | Railway assigns dynamically |
| `REDIS_URL` | Auto | Injected by Railway when Redis is in the same project |

**Fallback Redis variables** (if `REDIS_URL` not available):

| Variable | Default |
|----------|---------|
| `REDIS_HOST` | `redis-dev.railway.internal` |
| `REDIS_PORT` | `6379` |
| `REDIS_PASSWORD` | — |

### Deployment Process

1. Push code to Git → Railway detects the push
2. Railway runs `npm install` → starts server with `node server.js`
3. Railway monitors `/` endpoint for health
4. New version goes live, old version stopped

### Networking

| Feature | Details |
|---------|---------|
| Internal network | Services communicate via internal hostnames (e.g., `redis-dev.railway.internal`) |
| Public domain | Railway provides HTTPS URL (e.g., `https://expressapi-production.up.railway.app`) |
| HTTPS | Automatic — no SSL certificate setup needed |
| Service discovery | `REDIS_URL` auto-injected; `PORT` dynamically assigned |

---

## Testing

```bash
# Health check
curl https://your-api.railway.app/

# Check rate limit
curl -X POST https://your-api.railway.app/api/chatbot/check-limit \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.1"}'

# Record a call
curl -X POST https://your-api.railway.app/api/chatbot/record-call \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.1"}'

# Get all tracked IPs
curl https://your-api.railway.app/api/chatbot/ips \
  -H "X-API-Key: your-api-key"
```
