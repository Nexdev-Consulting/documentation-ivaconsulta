# VAT Deep Chatbot and IP Limitation

The VAT Deep chatbot is the on-site chatbot (powered by AI Engine) that answers IVA/VAT-related questions. Its answers are **not** the default AI Engine/OpenAI response — they are replaced by the response from an external RAG/orchestrator API (e.g. `vatdeep-orchestrator.up.railway.app`). The same integration enforces IP-based rate limiting: the WordPress side sends the visitor's IP to an Express + Redis service that decides whether the chatbot is allowed for that IP and records successful calls.

:::info Authoritative source
For the most up-to-date IP limit and integration detail, see **Wordpress IP reccord and call RAG agent snippet.docx**.
:::

---

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌─────────────────────────────────┐
│  WordPress   │───▶│  AI Engine   │───▶│  Code Snippets (PHP)            │
│  (Visitor)   │    │  (Chatbot)   │    │  - Intercepts mwai_ai_reply     │
└──────────────┘    └──────────────┘    │  - Sends IP + message to API    │
                                         └───────────────┬─────────────────┘
                                                         │
                                         ┌───────────────▼─────────────────┐
                                         │  Express API + Redis             │
                                         │  (Rate Limiting + RAG Proxy)     │
                                         │  vatdeep-orchestrator.up.railway │
                                         └─────────────────────────────────┘
```

**Components:**

| Component | Role |
|-----------|------|
| **WordPress** | AI Engine (chatbot UI) + Code Snippets (custom PHP integration) |
| **External service** | Express API + Redis (rate limiting, optional RAG/orchestrator) |

### Communication Flow

1. **Visitor** opens the chatbot on the WordPress site
2. **PHP snippet** (via Code Snippets) captures the request
3. Snippet calls `POST /api/chatbot/check-limit` with the visitor's IP (and required body/headers)
4. **Express API** checks the Redis database and returns `allowed: true` or `allowed: false`
5. **If allowed**: snippet lets the chatbot proceed; when AI Engine is about to send a reply, the snippet calls the RAG/orchestrator API (with message, IP, timestamp), replaces the reply with the API's message, and calls `POST /api/chatbot/record-call` to record the interaction
6. **If blocked**: snippet shows the rate limit message to the visitor and does not allow the chat (no RAG call, no record-call)

Rate limiting rules (per-IP quotas and windows) are defined and stored in the Express + Redis service; WordPress only sends the IP and obeys the API's `allowed` response.

---

## Plugins Involved

| Plugin | Role |
|--------|------|
| **AI Engine** | Provides the chatbot UI and logic; hooks allow interception of queries and replies |
| **Code Snippets** | Holds the PHP snippet that calls the external API for IP checking, RAG response, and call recording |

---

## IP Rate Limiting — Detailed

### What the PHP Snippet Does

1. Intercepts chatbot requests in WordPress
2. Sends the visitor's IP address to the Express + Redis API
3. Checks the rate limit response from the API
4. Allows or blocks the chatbot interaction based on that response
5. Records successful interactions (when allowed) via a second API call

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chatbot/check-limit` | POST | Check if the visitor's IP is within the rate limit |
| `/api/chatbot/record-call` | POST | Record a successful chatbot interaction |
| RAG/orchestrator endpoint | POST | Send the user's question and get the AI response |

---

## Reply Replacement and Data Flow

### When It Fires

AI generates response → `mwai_ai_reply` filter runs → snippet runs → modified reply sent to user.

**Result**: OpenAI's response is discarded and replaced with the external API's response.

### Hook

`mwai_ai_reply` — fires after the AI responds, before the reply is sent to the user.

### Snippet Behaviour

1. **Extracts**: user question, user IP, current timestamp
2. **Sends POST** to the external API (e.g. `https://vatdeep-orchestrator.up.railway.app/...`) with headers (`X-API-Key`, `Content-Type`) and body: `message`, `ip-address`, `timestamp`
3. **API returns** JSON with at least a `message` field (and optionally `timestamp`)
4. **Snippet replaces** `$reply->result` with the API's `message` so the user sees the RAG/orchestrator answer

### Complete Data Flow

```
┌─────────┐      ┌────────────┐      ┌───────────────┐      ┌─────────────────┐
│ Visitor  │─────▶│ AI Engine  │─────▶│ mwai_ai_reply │─────▶│ PHP Snippet     │
│ Question │      │ generates  │      │ filter fires  │      │ (Code Snippets) │
└─────────┘      │ AI reply   │      └───────────────┘      └────────┬────────┘
                  └────────────┘                                      │
                                                                      ▼
                                                     ┌────────────────────────────┐
                                                     │ 1. Check IP limit          │
                                                     │    POST /check-limit       │
                                                     │                            │
                                                     │ 2. If allowed:             │
                                                     │    POST to RAG API         │
                                                     │    Replace $reply->result  │
                                                     │    POST /record-call       │
                                                     │                            │
                                                     │ 3. If blocked:             │
                                                     │    Show rate-limit message  │
                                                     └────────────────────────────┘
```

---

## Benefits of This Design

- **Separation of concerns**: Rate limiting and RAG logic live in the external service, not in WordPress
- **Scalability**: Redis handles high-volume IP tracking
- **Reuse**: Same API can serve multiple WordPress sites
- **Security**: API key authentication protects the rate-limiting and RAG endpoints
- **Maintainability**: Integration logic lives in Code Snippets, so it can be updated without editing theme files

---

## Security Considerations

### API Key

**Current approach**: Store in snippet (e.g. `$api_key = 'YOUR_API_KEY_HERE'`). Code Snippets stores in the database, not in theme files; not exposed to frontend or browser/network.

**Recommended for production**: Define in `wp-config.php` and use in snippet:

```php
// In wp-config.php
define('EXTERNAL_API_KEY', 'your-key-here');

// In the Code Snippet
$api_key = defined('EXTERNAL_API_KEY') ? EXTERNAL_API_KEY : '';
```

### SSL Verification

`'sslverify' => true` — verifies the certificate, prevents man-in-the-middle attacks, ensures connection to the real API.

Use `'sslverify' => false` **only** for local development/testing.

### IP Validation

Validate before sending to the API:

```php
if (filter_var($ip, FILTER_VALIDATE_IP)) {
    $user_ip = $ip;
}
```

This validates IP format, helps prevent injection, and ensures data integrity.

---

## Performance

### Timeout

`'timeout' => 30` — user waits up to 30 seconds; prevents indefinite hanging.

| API Speed | Recommended Timeout |
|-----------|-------------------|
| Fast (< 2s) | 10s |
| Normal (2–5s) | 15–30s |
| Slow (> 5s) | Consider caching or async |

### Debug Logging

| Environment | Setting |
|-------------|---------|
| **Development** | `$debug_logging = true` |
| **Production** | `$debug_logging = false` |

Each `error_log()` writes to disk; large logs can slow the server and fill disk. Use conditional:

```php
$debug_logging = WP_DEBUG;
```

### API Call Optimization

Every question = 1 API call. Optimization ideas:

- Cache responses for common questions
- Batch requests
- Use async for non-urgent data
- Implement rate limiting on the API side

---

## Testing Scenarios

Verify the following scenarios when testing the chatbot integration:

| Scenario | Expected Result |
|----------|----------------|
| Normal question within rate limit | RAG response displayed |
| Question when rate limit exceeded | Rate limit message displayed |
| API is unreachable / times out | Error message displayed (Spanish) |
| Invalid IP address | Graceful handling / fallback |
| Missing API key | Error logged, user sees fallback message |
| SSL verification failure | Connection refused (production) |

---

## User-Facing Error Messages

All error messages are in **Spanish** for end users. To customize: search for `"Lo siento"` in the snippet and replace with your preferred messages.

---

## Configuration Reference

| Line | Setting | Description |
|------|---------|-------------|
| 32 | API endpoint URL | Update to your RAG/orchestrator endpoint |
| 35 | API key | Update to your API key |
| 38 | `$debug_logging` | `true` for dev, `false` for production |

**Code Snippets settings**: Language: PHP; Run: Global All.

---

## Key Technologies

### WordPress APIs

- **Filters** — Hook system for modifying data (`mwai_ai_reply`)
- **HTTP API** — `wp_remote_post`, `wp_remote_retrieve_body`, `wp_remote_retrieve_response_code`, `is_wp_error`

### AI Engine Hooks

| Hook | When It Fires |
|------|---------------|
| `mwai_ai_query` | Before sending to AI |
| `mwai_ai_reply` | After AI responds (used by the snippet) |
| `mwai_chatbot_query` | Chatbot-specific query hook |
| `mwai_chatbot_takeover` | Bypass AI entirely |

### PHP Functions Used

| Function | Purpose |
|----------|---------|
| `json_encode()` / `json_decode()` | JSON serialization |
| `filter_var()` | IP validation |
| `method_exists()` | Object method checking |
| `error_log()` | Debug logging → `wp-content/debug.log` |

---

## Summary

The PHP snippet (via Code Snippets):

1. Intercepts all chatbot replies via the `mwai_ai_reply` filter
2. Extracts user question, IP address, and timestamp
3. Calls the external API with correct headers and body (including IP for rate limiting and RAG)
4. Parses JSON response and uses the `message` field
5. Replaces AI Engine's reply with the API's response
6. Handles errors with Spanish messages and optional debug logging

---

## Files and References

| File | Description |
|------|-------------|
| **Wordpress IP reccord and call RAG agent snippet.docx** | Full flow, diagrams, key concepts, and code context (authoritative source) |
| **FINAL_API_SNIPPET.php** | Canonical snippet code (if present in `docs/`) |
| `wp-content/debug.log` | Debug log when logging is enabled |
