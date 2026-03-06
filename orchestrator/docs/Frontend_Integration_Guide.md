---
slug: /docs/Frontend_Integration_Guide
---

# Frontend Integration Guide

The Orchestrator provides a RESTful API that can be integrated with **any application** — web, mobile, desktop, or other services. This guide covers integration examples for common platforms and frameworks.

---

## Supported Integration Types

| Platform | Supported |
|----------|-----------|
| Web Applications | React, Vue, Angular, vanilla JavaScript |
| Mobile Applications | React Native, Flutter, native iOS/Android |
| Desktop Applications | Electron, Tauri, native apps |
| Chat Platforms | Jotform ChatBot, AI Engine, custom chat widgets |
| CMS Platforms | WordPress, Drupal, Joomla |
| No-Code Platforms | Zapier, Make.com, Bubble |
| Backend Services | Node.js, Python, Java, .NET, Go |
| Microservices | Docker containers, serverless functions |

---

## Integration Checklist

1. **Get API Key** — Obtain from Railway environment variables
2. **Configure Endpoint** — Use the production Railway URL or `localhost:8003` for development
3. **Set Headers** — Include `Content-Type: application/json` and `X-API-Key: your-key`
4. **Handle Errors** — Implement proper error handling for API responses
5. **Rate Limiting** — Be aware of limits (default: 12 requests per IP per 24 hours)
6. **CORS** — Ensure your domain is allowed in CORS configuration if needed

---

## Jotform ChatBot Integration (WordPress)

The orchestrator is integrated with Jotform ChatBot on WordPress sites. The ChatBot sends user messages to the orchestrator API and displays the AI responses.

**Configuration:**

| Setting | Value |
|---------|-------|
| API Endpoint | `https://your-orchestrator.up.railway.app/chat` |
| Method | POST |
| Content-Type | `application/json` |
| X-API-Key | `your-secret-api-key-here` |
| Body | `{"message": "user question"}` |

---

## JavaScript / TypeScript

```javascript
async function callOrchestrator(message) {
  const response = await fetch(
    "https://your-orchestrator.up.railway.app/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "your-secret-api-key-here",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

const aiResponse = await callOrchestrator("Hello, can you explain SAP BTP?");
console.log(aiResponse);
```

---

## Python

```python
import requests

def call_orchestrator(message, api_key, base_url="https://your-orchestrator.up.railway.app"):
    url = f"{base_url}/chat"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    payload = {"message": message}

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    return response.json()["response"]

api_key = "your-secret-api-key-here"
response = call_orchestrator("Hello, can you explain SAP BTP?", api_key)
print(response)
```

---

## cURL

```bash
curl -X POST https://your-orchestrator.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{"message": "Hello, can you explain SAP BTP?"}'
```

---

## Node.js / Express

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

---

## React

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

---

## Error Handling

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
    throw error;
  }
}
```

---

## API Response Format

**Success:**

```json
{
  "response": "AI generated response text",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

**Error:**

```json
{
  "error": "Error message description"
}
```

---

## Best Practices

1. **Store API Keys Securely** — Never commit API keys to version control
2. **Use Environment Variables** — Store API keys in environment variables or secure vaults
3. **Implement Retry Logic** — Add exponential backoff for transient failures
4. **Cache Responses** — Cache responses when appropriate to reduce API calls
5. **Monitor Usage** — Track API usage to stay within rate limits
6. **Handle Timeouts** — Set appropriate timeout values for API calls
7. **Validate Input** — Validate user input before sending to the API
