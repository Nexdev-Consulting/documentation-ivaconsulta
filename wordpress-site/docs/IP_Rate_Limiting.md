---
slug: /docs/IP_Rate_Limiting
---

# IP Rate Limiting (WordPress Side)

The WordPress chatbot enforces IP-based rate limiting to control how many times a visitor can use the VAT Deep AI agent for free. The WordPress side sends the visitor's IP to the external API, which checks and enforces the limit using an Express + Redis service.

---

## How It Works

```
┌──────────────┐    ┌──────────────────┐    ┌───────────────────────────┐
│  Visitor on  │───▶│  AI Engine       │───▶│  PHP Snippet              │
│  WordPress   │    │  (chatbot UI)    │    │  (Code Snippets plugin)   │
└──────────────┘    └──────────────────┘    └─────────────┬─────────────┘
                                                          │
                                            ┌─────────────▼─────────────┐
                                            │  1. Extract visitor's IP   │
                                            │  2. POST /check-limit      │
                                            │     → Express + Redis API  │
                                            │  3. If blocked:            │
                                            │     Show rate limit msg    │
                                            │  4. If allowed:            │
                                            │     Forward to RAG API     │
                                            │     Replace AI reply       │
                                            │     POST /record-call      │
                                            └───────────────────────────┘
```

### Flow Summary

| Step | Action | Who |
|------|--------|-----|
| 1 | Visitor asks a question in the chatbot | Visitor |
| 2 | `mwai_ai_reply` filter intercepts the AI response | AI Engine + PHP Snippet |
| 3 | Snippet extracts visitor's IP address | PHP Snippet |
| 4 | Snippet calls `POST /api/chatbot/check-limit` with IP | PHP → Express API |
| 5a | **If allowed**: Snippet calls RAG API, replaces reply, calls `POST /api/chatbot/record-call` | PHP → Orchestrator + Express API |
| 5b | **If blocked**: Snippet shows rate limit message to visitor | PHP Snippet |

---

## Rate Limit Check

The PHP snippet sends the visitor's IP to the Express + Redis API to check if the limit is exceeded.

### API Call

```
POST /api/chatbot/check-limit
X-API-Key: your-api-key
Content-Type: application/json

{
  "ip": "visitor-ip-address",
  "maxCalls": 12,
  "periodMinutes": 1440
}
```

### Responses

**Allowed** — visitor can proceed:

```json
{
  "allowed": true,
  "reason": "Within rate limit: 5/12 calls (after this call)",
  "calls": 4,
  "maxCalls": 12,
  "limitExceeded": false
}
```

**Blocked** — visitor has exceeded the limit:

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

---

## Recording Successful Calls

When a chatbot interaction is **allowed and successfully processed**, the snippet records it:

```
POST /api/chatbot/record-call
X-API-Key: your-api-key
Content-Type: application/json

{
  "ip": "visitor-ip-address",
  "timestamp": 1708099200000
}
```

Calls are only recorded **after** the RAG API returns a successful response. This prevents counting failed or errored interactions.

---

## Rate Limiting Rules

| Setting | Default | Description |
|---------|---------|-------------|
| Maximum calls per IP | 12 | Number of chatbot interactions allowed per visitor |
| Time window | 24 hours (1440 minutes) | Sliding window for counting calls |
| Window type | Sliding | Calls expire individually (not fixed daily reset) |

### Sliding Window Example

```
Day 1, 10:00 AM - Call #1   → Allowed (1/12)
Day 1, 11:00 AM - Call #2   → Allowed (2/12)
...
Day 1, 10:00 PM - Call #12  → Allowed (12/12)
Day 1, 11:00 PM - Call #13  → BLOCKED (12/12 in last 24h)
Day 2, 10:01 AM - Next call → Allowed (11/12, call #1 expired)
```

The sliding window is fairer than a fixed daily reset because calls expire individually.

---

## User-Facing Messages

When a visitor is **rate-limited**, the chatbot shows a contact message in **Spanish** instead of processing the question. The message directs the user to contact IVA Consulta for continued service.

To customize the blocked message, search for `CONTACT_MESSAGE` in the orchestrator code or `"Lo siento"` in the WordPress snippet.

---

## Integration with the Full System

The WordPress IP rate limiting connects to the broader system:

```
WordPress (PHP Snippet)
    │
    ├─ Check limit ──▶ Express Redis API ──▶ Redis Database
    │                    POST /check-limit      (chatbot_ips set)
    │
    ├─ Get RAG response ──▶ Orchestrator ──▶ RAG Agent
    │                        POST /chat          (CrewAI + ChromaDB)
    │
    └─ Record call ──▶ Express Redis API ──▶ Redis Database
                        POST /record-call       (add IP + timestamp)
```

### Two Paths for Rate Limiting

The rate limit is checked in **two places** for defense in depth:

| Layer | Where | What It Does |
|-------|-------|-------------|
| **WordPress** | PHP Snippet (Code Snippets plugin) | Checks limit before calling the Orchestrator; blocks at the frontend |
| **Orchestrator** | Python `/chat` endpoint | Checks limit again before processing; blocks at the backend |

Both layers use the same Express + Redis API, so the rate limit counts are consistent.

---

## PHP Snippet Behavior

The PHP snippet (running via the Code Snippets plugin) handles rate limiting as part of the `mwai_ai_reply` filter:

1. **Extracts** the visitor's IP using WordPress functions
2. **Validates** the IP format with `filter_var($ip, FILTER_VALIDATE_IP)`
3. **Calls** `POST /api/chatbot/check-limit` with the IP
4. **If blocked**: Sets `$reply->result` to the rate limit message and returns early
5. **If allowed**: Calls the RAG/Orchestrator API with the question
6. **On success**: Calls `POST /api/chatbot/record-call` to log the interaction
7. **Replaces** `$reply->result` with the RAG API response

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Rate limit API unreachable | Fails open — allows the request (prevents blocking all visitors if Express API is down) |
| Invalid IP format | Skips rate limit check |
| RAG API error | Shows Spanish error message to visitor |
| Rate limit exceeded | Shows contact message to visitor |

---

## Configuration

The rate limit parameters are configured on the **server side** (Express API and Orchestrator), not in WordPress:

| Setting | Where to Configure | Default |
|---------|-------------------|---------|
| `MAX_CALLS_PER_IP` | Orchestrator env vars | 12 |
| `RATE_LIMIT_PERIOD_MINUTES` | Orchestrator env vars | 1440 (24h) |
| `RATE_LIMIT_WHITELIST_IPS` | Orchestrator env vars | localhost IPs |
| `EXPRESS_API_KEY` | Both Express API and Orchestrator | — |

The WordPress snippet only needs the **Orchestrator API endpoint URL** and **API key** — it delegates rate limiting decisions to the server.

---

## Related Documentation

- [VAT Deep Chatbot](./VAT_Deep_Chatbot.md) — Full chatbot architecture including reply replacement and data flow
- [Orchestrator IP Rate Limiting](/orchestrator/docs/IP_Rate_Limiting) — Server-side implementation details
- [Express Redis API](/railway/docs/Express_Redis_API) — Express server endpoints and Redis data model
- [Rate Limiting Architecture](/railway/docs/Rate_Limiting_Architecture) — System-wide rate limiting design
