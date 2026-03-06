---
slug: /docs/Security_Best_Practices
---

# Security Best Practices

Security controls, Railway platform security features, production checklist, and incident response procedures for the Railway deployment.

---

## Application Security (OWASP Top 10)

### API Key Authentication

- All production endpoints require `X-API-Key` header
- Keys stored in Railway environment variables — never committed to Git
- Generate strong keys: `openssl rand -base64 32`

### Input Validation

- All user inputs validated before processing
- Prompt injection detection enabled
- XSS and SQL injection prevention

### Rate Limiting

- IP-based rate limiting via Express + Redis
- Distributed across all workers
- Configurable limits and whitelist IPs

### CORS Protection

- Restricted to specific origins
- Uses Railway domains automatically
- Prevents unauthorized cross-origin requests

### Secure Headers

Implemented via `SecureFlaskConfig`:

| Header | Purpose |
|--------|---------|
| Content Security Policy | Controls resource loading |
| X-Frame-Options | Prevents clickjacking |
| X-Content-Type-Options | Prevents MIME sniffing |
| Strict-Transport-Security | Forces HTTPS |

---

## Railway Security Features

### Environment Isolation

- Each environment (production, staging) is fully isolated
- Separate environment variables per environment
- No cross-environment access

### Private Networking

Use Railway's private domains for service-to-service communication:

| Type | Format | Use Case |
|------|--------|----------|
| Private | `service-name.railway.internal` | Service-to-service (faster, more secure) |
| Public | `service-name.up.railway.app` | External access |

### Secrets Management

- Store secrets in Railway variables, not in code
- Variables are encrypted at rest
- Access controlled per service

### Network Security

| Feature | Details |
|---------|---------|
| HTTPS | Automatic for all services |
| TLS | TLS 1.3 support |
| Certificates | Automatic certificate management |

---

## Production Security Checklist

- [ ] Set strong `AGENT_API_KEY` (use `openssl rand -base64 32`)
- [ ] Set strong `EXPRESS_API_KEY` (must match Express service)
- [ ] Configure `RATE_LIMIT_WHITELIST_IPS` appropriately
- [ ] Set `MAX_CALLS_PER_IP` to reasonable limit (default: 12)
- [ ] Enable LangSmith for monitoring (optional but recommended)
- [ ] Review CORS origins configuration
- [ ] Verify health check is working (`/health`)
- [ ] Test rate limiting (`/stats`)
- [ ] Monitor logs for security events
- [ ] Keep dependencies updated (`pip list --outdated`)

---

## Monitoring Security Events

The Orchestrator logs security events with these patterns:

```bash
# Security log patterns
"prompt_injection_attempt"
"rate_limit_exceeded"
"invalid_api_key"
"invalid_request_source"
"authentication_attempt"
```

View security logs:

```bash
railway logs | grep "🛡️"
railway logs | grep "🔒"
railway logs | grep "⚠️"
```

---

## Incident Response

### 1. Immediate Actions

- Rotate `AGENT_API_KEY` immediately
- Check `/stats` for suspicious IP addresses
- Review recent logs for attack patterns

### 2. Investigation

- Identify attack vector
- Check rate limiting logs
- Review prompt injection detection stats

### 3. Mitigation

- Add malicious IPs to blocklist
- Adjust rate limits if needed
- Update security rules

### 4. Recovery

- Deploy security patches
- Monitor for continued attacks
- Document incident for future reference

---

## Compliance Considerations

| Area | Implementation |
|------|---------------|
| **GDPR** | IP addresses processed for rate limiting (legitimate interest) |
| **Data Retention** | Configure Redis TTL for IP data expiration |
| **Audit Logs** | Enable LangSmith for request/response logging |
| **Access Control** | Use Railway's team features for access management |
