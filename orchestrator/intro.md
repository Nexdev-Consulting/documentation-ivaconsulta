# RAG Agent Orchestrator

A Flask-based orchestrator service that provides a RESTful API for connecting any application to CrewAI RAG agents. Currently deployed on Railway and integrated with Jotform ChatBot on WordPress sites. Features comprehensive LangSmith observability, EU AI Act compliance, and seamless communication between frontend applications and AI services.

**Quick Test:**

```bash
curl -X POST -s 'https://orchestrator-dev.up.railway.app/chat' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: your-api-key' \
  -d '{"message":"Hello, can you explain SAP BTP"}'
```

## 🏗️ Architecture

```
[WordPress Site] → [Jotform ChatBot] → [Orchestrator (Railway)] → [RAG Agent (Railway)]
   Website              Chat Interface      HTTP Proxy                AI Backend
                                                      ↓
                                          [LangSmith Observability]
```

### Current Production Setup

- **Orchestrator Agent**: Deployed on Railway
- **RAG Agent**: Deployed on Railway
- **Frontend Integration**: Jotform ChatBot embedded in WordPress sites
- **Observability**: LangSmith tracking all operations

### Communication Flow

1. **User** interacts with Jotform ChatBot on WordPress site
2. **Jotform ChatBot** sends user messages via HTTP POST to Orchestrator
3. **Orchestrator** (Railway) receives requests and forwards to RAG Agent
4. **RAG Agent** (Railway) processes with CrewAI and returns AI responses
5. **Orchestrator** returns formatted responses to Jotform ChatBot
6. **Jotform ChatBot** displays response to user on WordPress site
7. **LangSmith** tracks all operations for observability, debugging, and compliance

## 🚀 Deployment

The orchestrator is **primarily deployed on Railway** and connects to the RAG Agent also deployed on Railway. Google Cloud Platform is available as an alternative deployment option.

### Railway Deployment (Primary)

#### Environment Variables

Set these environment variables in your Railway Orchestrator service:

```bash
# RAG Agent Communication
RAG_AGENT_URL=https://your-rag-agent.up.railway.app

# API Security (Railway only)
API_KEY=your-secret-api-key-here

# Environment Detection (optional)
FLASK_ENV=PROD

# LangSmith Observability (optional)
LANGSMITH_API_KEY=lsv2_your_api_key_here
LANGSMITH_PROJECT=orchestrator-iva-dev
```

#### Railway Deployment Files

- **Procfile**: `web: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 agents.orchestrator.orchestrator_agent_secure:app`
- **railway.json**: Health checks and deployment configuration
- **requirements.txt**: Python dependencies with Flask, CORS, and aiohttp

### Google Cloud Platform Deployment

For Google Cloud deployment, see the comprehensive guides in the `docs/` folder:

- **[Google Cloud Quick Start](./docs/Google_Cloud_Quick_Start.md)** - Quick reference for GCP deployment
- **[Google Cloud Deployment Guide](./docs/Google_Cloud_Deployment_Guide.md)** - Detailed deployment instructions
- **[Artifact Registry Guide](./docs/Artifact_Registry_Build_and_Run_Guide.md)** - Docker image management

#### Quick GCP Setup

```bash
# Build and push Docker image
./scripts/build_and_push.sh

# Set up secrets
./scripts/setup_gcp_secrets.sh

# Deploy to Cloud Run
./scripts/deploy_cloud_run.sh
```

## 📁 Project Structure

### Core Application

```
agents/
└── orchestrator/
    └── orchestrator_agent_secure.py    # Main Flask application with security and LangSmith integration

scripts/
├── install_requirements.sh  # Dependency installation script
└── run_agent.sh            # Application startup script
```

### Development & Testing

```
tests/
├── __init__.py              # Test package initialization
└── test_orchestrator_agent.py  # Comprehensive test suite

requirements-dev.txt         # Development dependencies
pytest.ini                  # Testing configuration
.pre-commit-config.yaml     # Code quality automation
```

### CI/CD & Deployment

```
.github/workflows/
└── ci.yml                  # Comprehensive CI/CD pipeline

Procfile                    # Railway deployment configuration
railway.json               # Railway health checks and settings
railway.env.example        # Environment variable template
nixpacks.toml              # Build configuration
```

### Configuration Files

```
.gitignore                  # Git ignore patterns
README.md                   # Project documentation (this file)
requirements.txt           # Production dependencies
.env.example               # Environment variable template
```

### Documentation

```
docs/
├── API_Integration_Guide.md              # Complete API integration guide
├── LangSmith_Technical_Setup.md          # LangSmith observability guide
├── Google_Cloud_Quick_Start.md           # GCP quick reference
├── Google_Cloud_Deployment_Guide.md      # Detailed GCP deployment
├── Artifact_Registry_Build_and_Run_Guide.md  # Docker image management
├── Technical_Solution_AI_Agents.md       # Technical architecture
└── EU_AI_Act_GDPR_Risk_Analysis.md      # Compliance analysis
```

### Key Dependencies

#### Production (`requirements.txt`)

- **Flask**: Web framework for HTTP API
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-Limiter**: Rate limiting for API protection
- **aiohttp**: Async HTTP client for RAG agent communication
- **python-dotenv**: Environment variable management
- **gunicorn**: WSGI HTTP server for production
- **langsmith**: Observability and tracing for AI operations
- **dspy-ai**: AI framework for agent operations
- **crewai**: Multi-agent orchestration framework

#### Development (`requirements-dev.txt`)

- **Testing**: pytest, pytest-cov, pytest-mock, pytest-asyncio
- **Code Quality**: black, isort, flake8, mypy, pylint
- **Security**: bandit, safety, semgrep
- **Documentation**: sphinx, sphinx-rtd-theme
- **Development**: pre-commit, tox, watchdog

## 📡 API Endpoints

### Base URL

- **Production (Railway)**: `https://your-orchestrator.up.railway.app`
- **Local Development**: `http://localhost:8003`

### Health Check

Check the health status of the orchestrator and its connection to the RAG agent.

**Endpoint:**

```bash
GET https://your-orchestrator.up.railway.app/health
X-API-Key: your-secret-api-key-here
```

**Response:**

```json
{
  "status": "healthy",
  "environment": "RAILWAY",
  "rag_agent_url": "https://your-rag-agent.up.railway.app",
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

**Note:** All endpoints, including the health check, require API key authentication in production.

### Chat Endpoint

Send messages to the AI agent and receive responses.

**Endpoint:**

```bash
POST https://your-orchestrator.up.railway.app/chat
Content-Type: application/json
X-API-Key: your-secret-api-key-here
```

**Request Body:**

```json
{
  "message": "Your question here"
}
```

**Success Response:**

```json
{
  "response": "AI generated response",
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "error": "Error message description"
}
```

### Stats Endpoint

Get usage statistics and metrics (requires API key authentication).

**Endpoint:**

```bash
GET https://your-orchestrator.up.railway.app/stats
X-API-Key: your-secret-api-key-here
```

**Response:**

```json
{
  "total_requests": 1234,
  "successful_requests": 1200,
  "failed_requests": 34,
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

## 🛠️ Local Development

### Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# For development with enhanced tooling
pip install -r requirements-dev.txt
```

### Environment Variables

Create a `.env` file:

```bash
# RAG Agent Communication
RAG_AGENT_URL=http://localhost:8001

# Environment Detection
FLASK_ENV=DEV

# LangSmith Observability (optional)
LANGSMITH_API_KEY=lsv2_your_api_key_here
LANGSMITH_PROJECT=orchestrator-iva-dev
LANGSMITH_ENABLED=true
```

### Run Locally

```bash
python agents/orchestrator/orchestrator_agent_secure.py
```

Or use the start script:

```bash
./start.sh
```

Server starts at: `http://localhost:8003`

### Development Tools

#### Pre-commit Hooks

Set up pre-commit hooks for code quality:

```bash
pre-commit install
```

This automatically runs:

- **Black** code formatting
- **isort** import sorting
- **flake8** linting
- **Bandit** security scanning
- **MyPy** type checking
- **EU AI Act compliance** checks

#### Testing

Run the comprehensive test suite:

```bash
# Run all tests with coverage
pytest

# Run specific test categories
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m compliance    # EU AI Act compliance tests
pytest -m security      # Security tests

# Generate detailed coverage report
pytest --cov=agents --cov-report=html
```

#### Code Quality

```bash
# Format code
black agents/ scripts/

# Sort imports (run locally - currently disabled in CI)
isort agents/

# Lint code
flake8 agents/ scripts/

# Type checking
mypy agents/

# Security scan
bandit -r agents/
```

## 🔧 Features

### Environment Detection

- **Local**: Auto-detects development environment, uses `localhost:8001`
- **Railway**: Auto-detects Railway environment variables, uses production RAG URL

### Error Handling

- Production-friendly error messages
- Comprehensive logging for debugging
- Health check integration with RAG agent

### CORS Support

- Enables cross-origin requests from any frontend application
- Supports all necessary HTTP methods and headers
- Configured for WordPress/Jotform ChatBot integration

### API Security

- **Local Development**: No API key required for easy development
- **Railway Production**: API key authentication enforced when `API_KEY` environment variable is set
- **Header-based Auth**: Uses `X-API-Key` header for secure communication
- **RAG Agent Forwarding**: API key is forwarded to RAG agent for end-to-end security

### 🛡️ EU AI Act Compliance

This orchestrator implements comprehensive EU AI Act compliance measures:

#### Prohibited Practices Prevention

- **Automated scanning** for prohibited AI practices in CI/CD
- **Biometric identification** restrictions
- **Social scoring** prevention
- **Manipulation detection** safeguards

#### Transparency Requirements

- **AI disclosure** in all interactions
- **System capability** documentation
- **Decision explanation** mechanisms
- **Audit trail** maintenance

#### Risk Classification

- **Automated risk assessment** based on system capabilities
- **High-risk system** identification and safeguards
- **Fundamental rights** impact assessment
- **Continuous monitoring** for compliance

#### Data Protection

- **GDPR integration** with EU AI Act requirements
- **Privacy by design** implementation
- **Data minimization** principles
- **Consent management** frameworks

## 🌐 Frontend Integration

### Jotform ChatBot Integration (WordPress)

The orchestrator is currently integrated with Jotform ChatBot on WordPress sites. The ChatBot sends user messages to the orchestrator API and displays the AI responses.

**Jotform ChatBot Configuration:**

- **API Endpoint**: `https://your-orchestrator.up.railway.app/chat`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-Key: your-secret-api-key-here`
- **Body**: `{"message": "user question"}`

### Generic API Usage

The orchestrator provides a RESTful API that can be integrated with **any application** (web, mobile, desktop, or other services).

#### JavaScript/TypeScript Example

```javascript
async function callOrchestrator(message) {
  const response = await fetch(
    "https://your-orchestrator.up.railway.app/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "your-secret-api-key-here", // Required for Railway deployment
      },
      body: JSON.stringify({
        message: message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response; // AI response
}

// Usage
const aiResponse = await callOrchestrator("Hello, can you explain SAP BTP?");
console.log(aiResponse);
```

#### Python Example

```python
import requests

def call_orchestrator(message, api_key, base_url="https://your-orchestrator.up.railway.app"):
    """Call the orchestrator API with a message."""
    url = f"{base_url}/chat"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    payload = {"message": message}

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    return response.json()["response"]

# Usage
api_key = "your-secret-api-key-here"
response = call_orchestrator("Hello, can you explain SAP BTP?", api_key)
print(response)
```

#### cURL Example

```bash
curl -X POST https://your-orchestrator.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{"message": "Hello, can you explain SAP BTP?"}'
```

#### Node.js/Express Example

```javascript
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/ask-ai", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      "https://your-orchestrator.up.railway.app/chat",
      { message: userMessage },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.ORCHESTRATOR_API_KEY,
        },
      }
    );

    res.json({ response: response.data.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

#### React Example

```jsx
import React, { useState } from "react";

function ChatComponent() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://your-orchestrator.up.railway.app/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.REACT_APP_API_KEY,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      {response && <div>{response}</div>}
    </div>
  );
}
```

### API Response Format

All endpoints return JSON responses:

**Success Response:**

```json
{
  "response": "AI generated response text",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "error": "Error message description"
}
```

### Authentication

**All endpoints require API key authentication in production:**

- **Local Development**: No API key required (for testing convenience)
- **Railway Production**: API key authentication **required** for all endpoints via `X-API-Key` header
  - `/health` - Requires API key
  - `/chat` - Requires API key
  - `/stats` - Requires API key
  - `/` (root) - Requires API key
- **API Key**: Set via `API_KEY` environment variable in Railway
- **Header Format**: `X-API-Key: your-secret-api-key-here`

## 🔌 Integration Guide

### Supported Integration Types

The orchestrator API can be integrated with:

- ✅ **Web Applications** (React, Vue, Angular, vanilla JavaScript)
- ✅ **Mobile Applications** (React Native, Flutter, native iOS/Android)
- ✅ **Desktop Applications** (Electron, Tauri, native apps)
- ✅ **Chat Platforms** (Jotform ChatBot, custom chat widgets)
- ✅ **CMS Platforms** (WordPress, Drupal, Joomla)
- ✅ **No-Code Platforms** (Zapier, Make.com, Bubble)
- ✅ **Backend Services** (Node.js, Python, Java, .NET, Go)
- ✅ **Microservices** (Docker containers, serverless functions)

### Integration Checklist

When integrating the orchestrator API:

1. ✅ **Get API Key**: Obtain your API key from Railway environment variables
2. ✅ **Configure Endpoint**: Use the production Railway URL or localhost for development
3. ✅ **Set Headers**: Include `Content-Type: application/json` and `X-API-Key: your-key`
4. ✅ **Handle Errors**: Implement proper error handling for API responses
5. ✅ **Rate Limiting**: Be aware of rate limits (configurable via environment variables)
6. ✅ **CORS**: Ensure your domain is allowed in CORS configuration if needed

### Rate Limits

- **Default**: 12 requests per IP per 24 hours (configurable)
- **Whitelist**: Localhost and specific IPs can be whitelisted
- **Configuration**: Set via `MAX_CALLS_PER_IP` and `RATE_LIMIT_PERIOD_HOURS` environment variables

### Error Handling

Always implement proper error handling:

```javascript
async function callOrchestrator(message) {
  try {
    const response = await fetch(
      "https://your-orchestrator.up.railway.app/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "your-api-key",
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Orchestrator API error:", error);
    // Handle error appropriately (show user message, retry, etc.)
    throw error;
  }
}
```

### Best Practices

1. **Store API Keys Securely**: Never commit API keys to version control
2. **Use Environment Variables**: Store API keys in environment variables or secure vaults
3. **Implement Retry Logic**: Add exponential backoff for transient failures
4. **Cache Responses**: Cache responses when appropriate to reduce API calls
5. **Monitor Usage**: Track API usage to stay within rate limits
6. **Handle Timeouts**: Set appropriate timeout values for API calls
7. **Validate Input**: Validate user input before sending to the API

## 🔄 CI/CD Pipeline

### Comprehensive Automation

The project features a modern, enterprise-grade CI/CD pipeline with multiple validation stages:

#### 🛡️ Security & Dependency Scanning

- **Safety**: Python dependency vulnerability scanning
- **Bandit**: Static security analysis for Python code
- **Semgrep**: Advanced static analysis for security patterns
- **Automated reporting** with GitHub Actions summaries

#### 📋 Code Quality & Linting

- **Black**: Consistent code formatting (88-character line length)
- **isort**: Import organization and sorting
- **flake8**: Comprehensive Python linting with complexity checks
- **MyPy**: Static type checking for improved code reliability
- **Pylint**: Additional code quality analysis

#### 🧪 Testing & Coverage

- **Multi-version testing**: Python 3.10, 3.11, and 3.12 compatibility
- **pytest**: Comprehensive test framework with fixtures and mocking
- **Coverage reporting**: Integrated with Codecov for coverage tracking
- **Integration tests**: Live Flask app testing with health endpoint validation
- **Test categorization**: Unit, integration, security, and compliance test markers

#### ⚖️ EU AI Act Compliance Validation

- **Prohibited practices scanning**: Automated detection of EU AI Act violations
- **High-risk system identification**: Pattern-based risk assessment
- **Transparency requirement validation**: AI disclosure and explainability checks
- **Compliance reporting**: Detailed compliance status in CI summaries

#### 🚀 Deployment Validation

- **Procfile validation**: Railway deployment configuration checking
- **Environment variable verification**: Required configuration validation
- **Docker-style build simulation**: Dependency installation testing
- **CORS functionality testing**: Cross-origin request validation

#### 📊 Build Reporting

- **Comprehensive summaries**: Detailed job status reporting
- **Artifact collection**: Security reports, coverage data, and linting results
- **Parallel execution**: Optimized pipeline performance
- **Failure analysis**: Clear identification of issues and recommended fixes

### Pipeline Triggers

- **Pull Requests**: Full pipeline on `main` and `develop` branches
- **Push Events**: Continuous validation on branch updates
- **Manual Dispatch**: On-demand pipeline execution
- **Draft PR Filtering**: Skips pipeline for incomplete work

### Development Integration

- **Pre-commit hooks**: Local validation before commits
- **Branch protection**: Ensures CI passes before merging
- **Gitflow compatibility**: Supports feature, release, and hotfix workflows
- **Caching**: Optimized dependency caching for faster builds

## 📊 Monitoring & Observability

### LangSmith Integration

The orchestrator includes comprehensive LangSmith observability for:

- **Request Tracing**: Track each request from frontend → orchestrator → RAG agent
- **Performance Monitoring**: Response times, error rates, and throughput
- **Cost Tracking**: Monitor LLM API usage and costs
- **Token Usage**: Track token consumption across all operations
- **Debug Information**: Detailed logs and execution traces
- **EU AI Act Compliance**: Enhanced monitoring for regulatory requirements

**Setup**: See [LangSmith Technical Setup Guide](./docs/LangSmith_Technical_Setup.md) for complete integration instructions.

### Health Monitoring

- **Health Endpoint**: Monitor service status and RAG agent connectivity
- **Platform Logs**: View detailed request/response logging (Railway/GCP)
- **Error Tracking**: Production error handling with user-friendly messages
- **LangSmith Dashboard**: Real-time observability and debugging

### CI/CD Monitoring

- **Build status tracking**: Real-time pipeline status monitoring
- **Security alert integration**: Automated vulnerability notifications
- **Coverage trending**: Code coverage tracking over time
- **Compliance dashboards**: EU AI Act compliance status monitoring

### Performance Metrics

- **Response time tracking**: API endpoint performance monitoring via LangSmith
- **Resource utilization**: Memory and CPU usage analysis
- **Error rate monitoring**: Application reliability metrics
- **User interaction analytics**: API usage patterns and trends
- **Cost analysis**: LLM usage and cost tracking in LangSmith

## 🤝 Contributing

### Getting Started

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/OrchestratorAgent.git
   cd OrchestratorAgent
   ```

2. **Set Up Development Environment**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements-dev.txt
   pre-commit install
   ```

3. **Create Feature Branch** (following Gitflow)

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Development Workflow**

   ```bash
   # Make your changes
   # Pre-commit hooks will automatically run

   # Run tests locally
   pytest

   # Check compliance
   pre-commit run --all-files
   ```

5. **Submit Pull Request**
   - Ensure all CI checks pass
   - Include compliance verification
   - Update documentation if needed

### Code Standards

- **Code Style**: Black formatting (88-character lines)
- **Import Organization**: isort with Black profile
- **Type Hints**: Required for all function parameters and returns
- **Testing**: Minimum 70% code coverage required
- **Security**: All security scans must pass
- **EU AI Act Compliance**: Prohibited practices validation required

### Pull Request Requirements

- ✅ All CI/CD pipeline checks pass
- ✅ Code coverage maintains minimum threshold
- ✅ Security scans show no high-risk vulnerabilities
- ✅ EU AI Act compliance validation passes
- ✅ Documentation updated for new features
- ✅ Tests included for new functionality

### Issue Reporting

When reporting issues, please include:

- **Environment details** (Python version, OS)
- **Error messages** and stack traces
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Compliance impact** if relevant

## 🔒 Security & Compliance

### Security Reporting

For security vulnerabilities, please:

1. **Do not** create public GitHub issues
2. Contact maintainers privately
3. Include detailed vulnerability description
4. Provide steps to reproduce if possible

### EU AI Act Compliance

This project maintains strict EU AI Act compliance:

- **Prohibited practices** are automatically detected and blocked
- **High-risk system patterns** trigger additional safeguards
- **Transparency requirements** are built into the system
- **Data protection** follows GDPR and AI Act guidelines

### Regular Audits

- **Weekly**: Automated security scans
- **Monthly**: Dependency vulnerability reviews
- **Quarterly**: Compliance framework updates
- **Annually**: Full security and compliance audit

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[API Integration Guide](./docs/API_Integration_Guide.md)** - Complete guide for integrating with any application
- **[LangSmith Technical Setup](./docs/LangSmith_Technical_Setup.md)** - Complete guide for LangSmith observability integration
- **[Google Cloud Quick Start](./docs/Google_Cloud_Quick_Start.md)** - Quick reference for GCP deployment
- **[Google Cloud Deployment Guide](./docs/Google_Cloud_Deployment_Guide.md)** - Detailed GCP deployment instructions
- **[Artifact Registry Guide](./docs/Artifact_Registry_Build_and_Run_Guide.md)** - Docker image build and management
- **[Technical Solution](./docs/Technical_Solution_AI_Agents.md)** - Technical architecture and agent design
- **[EU AI Act & GDPR Risk Analysis](./docs/EU_AI_Act_GDPR_Risk_Analysis.md)** - Compliance and risk assessment

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with compliance frameworks from EU AI Act and GDPR
- Ethical AI principles based on UN and UNESCO guidelines
- Security best practices from OWASP and industry standards
- Testing patterns from Python community best practices
- Observability powered by LangSmith
