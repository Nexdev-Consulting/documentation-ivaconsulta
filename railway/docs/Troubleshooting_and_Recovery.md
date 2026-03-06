---
slug: /docs/Troubleshooting_and_Recovery
---

# Troubleshooting and Recovery

Common issues, debugging techniques, rollback procedures, disaster recovery, and performance tuning for Railway deployments.

---

## Common Issues

### Deployment Fails

**Check:**
- Railway build logs for errors
- `Dockerfile` syntax
- `requirements.txt` for invalid packages

**Fix:**

```bash
railway logs        # Check logs
docker build -t test .   # Test build locally
```

### Health Check Fails

**Check:**
- Application starts and binds to `$PORT`
- `/health` endpoint responds within 500ms
- `railway.json` health check configuration

**Fix:**
- Verify `gunicorn` starts correctly
- Check that `PORT` env var is used (not hardcoded)

### Rate Limiter Not Working

**Check:**
- `EXPRESS_API_URL` and `EXPRESS_API_KEY` are set in Orchestrator
- Express Redis API service is running
- Redis database is connected

**Fix:**

```bash
curl https://your-orchestrator.railway.app/health/redis \
  -H "X-API-Key: your-api-key"
```

Look for `✅ HTTP rate limiter initialized successfully` in Orchestrator logs.

### Redis Connection Errors

**Symptom:** Express API returns 503 "Redis connection not ready"

**Check:**
- Redis service is running in Railway
- `REDIS_URL` is injected into the Express service
- Network connectivity between services

### API Key Errors (401/403)

**Check:**
- `AGENT_API_KEY` is set in Orchestrator service
- `EXPRESS_API_KEY` matches between Orchestrator and Express services
- Request includes `X-API-Key` header

### LangSmith Not Logging

**Check:**
- `LANGSMITH_API_KEY` is set
- `LANGCHAIN_TRACING_V2=true`
- `/health` endpoint shows `langsmith.enabled: true`

---

## Debugging

### Enable Verbose Logging

```bash
# Set in Railway Dashboard → Service → Variables
FLASK_DEBUG=1
```

### View Logs

```bash
railway logs              # Recent logs
railway logs --follow     # Real-time logs
railway logs | grep "ERROR"
railway logs | grep "🛡️"  # Security events
```

### SSH into Container

```bash
railway shell
```

### Test Locally with Railway Variables

```bash
railway variables > .env
python -m agents.orchestrator.orchestrator_agent_secure
```

### Check Service Connectivity

```bash
# From Railway shell
curl $EXPRESS_API_URL/
curl $RAG_AGENT_URL/health
```

### Health Check Endpoints

```bash
# Application health
curl https://your-app.railway.app/health

# Rate limiter health
curl https://your-app.railway.app/health/redis \
  -H "X-API-Key: your-key"

# Statistics
curl https://your-app.railway.app/stats \
  -H "X-API-Key: your-key"
```

---

## Rollback and Recovery

### Rolling Back a Deployment

**Via Railway Dashboard:**

1. Go to project → Select service → "Deployments" tab
2. Find the last working deployment (marked with a checkmark)
3. Click three dots menu → "Redeploy"

Railway will build and deploy the previous version, run health checks, and route traffic to the working version.

**Via Git Revert:**

```bash
git revert HEAD
git push          # Triggers new deployment with reverted code
```

**Via Railway CLI:**

```bash
railway status                    # List deployments
railway redeploy <deployment-id>  # Redeploy specific version
```

### Complete Service Restart

**Via Dashboard:** Service → Settings → Restart Service

**Via CLI:**

```bash
railway restart
```

### Scale Down and Up (Force Fresh Start)

```bash
railway scale 0    # Scale down
sleep 5
railway scale 1    # Scale back up
```

---

## Disaster Recovery

### Backup Environment Variables

```bash
railway variables > backup-$(date +%Y%m%d).env
```

### Restore Environment Variables

```bash
railway variables set --from-file backup-20260217.env
```

### Configuration Files to Keep in Version Control

- `Dockerfile`
- `railway.json`
- `requirements.txt`
- `.dockerignore`

### Recovery Plan

| Step | Action |
|------|--------|
| 1. Identify | Check Railway logs, review health endpoints |
| 2. Respond | Rollback to last working deployment, or restart |
| 3. Investigate | Review recent changes, check env vars, verify service connectivity |
| 4. Fix | Fix issue locally, test thoroughly, deploy with monitoring |
| 5. Post-mortem | Document what happened, update procedures, add monitoring |

---

## Performance Tuning

### Worker Count

**Formula**: `(2 × CPU cores) + 1`

| Railway Tier | Recommended Workers |
|-------------|-------------------|
| Starter | 2 (current) |
| Higher tier | 4–8 |

### Worker Connections

Current: 100 connections per worker = 200 total.

Increase if you see connection refused errors or slow response times under load:

```
--worker-connections 200
```

### Timeout

Current: 120 seconds.

Increase if RAG agent calls take longer or you see timeout errors:

```
--timeout 180
```

### Monitoring Performance

| Metric | Where to Check |
|--------|---------------|
| Response times | LangSmith dashboard |
| CPU/Memory | Railway dashboard metrics |
| Error rates | Railway logs |
| Rate limit hits | `/stats` endpoint |
| Deployment health | `/health` endpoint |

---

## Reporting Issues

When reporting issues, include:

**Environment Information:**
- Railway project name and service name
- Environment (production/staging)

**Error Details:**
- Error message from logs
- Timestamp
- Steps to reproduce

**Diagnostic Output:**

```bash
railway status > diagnostic.txt
railway logs --tail 100 >> diagnostic.txt
curl https://your-app.railway.app/health >> diagnostic.txt
```

---

## Emergency Contacts

For critical production issues:

1. **Rollback immediately** (see rollback section above)
2. **Check Railway status**: [status.railway.app](https://status.railway.app/)
3. **Review recent Git changes**: `git log --oneline -10`
4. **Contact Railway support** via Discord or email
