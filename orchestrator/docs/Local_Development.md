# Local Development

Guide for setting up and running the Orchestrator Agent locally for development and testing.

---

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# For development with enhanced tooling
pip install -r requirements-dev.txt
```

---

## Environment Variables

Create a `.env` file in the project root:

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

| Variable | Value (Local) | Description |
|----------|--------------|-------------|
| `RAG_AGENT_URL` | `http://localhost:8001` | Local RAG agent URL |
| `FLASK_ENV` | `DEV` | Disables API key requirement |
| `LANGSMITH_API_KEY` | Optional | LangSmith API key for tracing |
| `LANGSMITH_PROJECT` | Optional | LangSmith project name |
| `LANGSMITH_ENABLED` | `true` | Enable/disable LangSmith |

---

## Running Locally

```bash
python agents/orchestrator/orchestrator_agent_secure.py
```

Or use the start script:

```bash
./start.sh
```

Server starts at: `http://localhost:8003`

**No API key is required** in local development mode (`FLASK_ENV=DEV`).

---

## Environment Detection

The orchestrator auto-detects the environment:

| Environment | Detection | RAG URL |
|-------------|-----------|---------|
| **Local** | `FLASK_ENV=DEV` or no Railway vars | `localhost:8001` |
| **Railway** | Railway environment variables present | Production RAG URL |

---

## Testing

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

### Test Categories

| Marker | Description |
|--------|-------------|
| `unit` | Isolated unit tests |
| `integration` | Live Flask app testing with health endpoint validation |
| `compliance` | EU AI Act compliance validation |
| `security` | Security-focused tests |

### Coverage Requirements

Minimum **70% code coverage** required for pull requests.

---

## Code Quality Tools

### Pre-commit Hooks

```bash
pre-commit install
```

Automatically runs on every commit:

| Tool | Purpose |
|------|---------|
| **Black** | Code formatting (88-character lines) |
| **isort** | Import sorting (Black profile) |
| **flake8** | Comprehensive linting with complexity checks |
| **Bandit** | Security scanning |
| **MyPy** | Static type checking |
| **EU AI Act** | Compliance checks |

### Manual Commands

```bash
# Format code
black agents/ scripts/

# Sort imports
isort agents/

# Lint code
flake8 agents/ scripts/

# Type checking
mypy agents/

# Security scan
bandit -r agents/
```

---

## Code Standards

| Standard | Requirement |
|----------|-------------|
| Code Style | Black formatting (88-character lines) |
| Import Organization | isort with Black profile |
| Type Hints | Required for all function parameters and returns |
| Testing | Minimum 70% code coverage |
| Security | All security scans must pass |
| EU AI Act | Prohibited practices validation required |

---

## Contributing

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
# Make your changes (pre-commit hooks run automatically)
# Run tests locally
pytest

# Check compliance
pre-commit run --all-files
```

5. **Submit Pull Request** — ensure all CI checks pass, include compliance verification, update documentation

### Pull Request Requirements

- All CI/CD pipeline checks pass
- Code coverage maintains minimum threshold
- Security scans show no high-risk vulnerabilities
- EU AI Act compliance validation passes
- Documentation updated for new features
- Tests included for new functionality

### Issue Reporting

When reporting issues, include:

- Environment details (Python version, OS)
- Error messages and stack traces
- Steps to reproduce
- Expected vs actual behavior
- Compliance impact if relevant

### Security Reporting

For security vulnerabilities:

1. **Do not** create public GitHub issues
2. Contact maintainers privately
3. Include detailed vulnerability description
4. Provide steps to reproduce if possible
