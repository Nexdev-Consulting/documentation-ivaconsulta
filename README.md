# Documentation IvaConsulta

Monorepo for the IVA Consulta documentation site, powered by Docusaurus.  
It surfaces three knowledge bases as separate doc sections:

- `wordpress-site/intro.md` – WordPress deployment + plugin guide.
- `orchestrator/intro.md` – Flask orchestrator API and infrastructure docs.
- `ragtool/intro.md` – CrewAI VAT RAG agent documentation.

## Prerequisites

- Node.js ≥ 20
- npm ≥ 8

Install once:

```bash
npm install
```

## Useful scripts

| Command          | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `npm run start`  | Start local dev server (hot reload at http://localhost:3000). |
| `npm run build`  | Production build, outputs static site to `build/`.            |
| `npm run serve`  | Preview the `build/` directory locally.                       |
| `npm run deploy` | Deploy to GitHub Pages (uses `USE_SSH` or `GIT_USER`).        |

## Project structure

```
docs/                # Classic tutorial sidebar
wordpress-site/      # WordPress guide (standalone docs plugin)
orchestrator/        # Orchestrator guide (standalone docs plugin)
ragtool/             # RagTool guide (standalone docs plugin)
src/pages/           # Custom React pages (homepage, Markdown page)
src/components/      # Homepage feature cards, shared UI
static/img/          # Brand assets (logo-ivaconsulta, favicon-ivaconsulta, etc.)
.github/             # PR template and prepared PR description
```

Each custom doc folder uses its own `@docusaurus/plugin-content-docs` entry.  
Add new markdown files under those folders; routes follow the folder name (e.g. `/ragtool/intro`).

## Pull requests

- PRs should use `.github/pull_request_template.md`.
- Example body lives at `.github/pull_request_description.md` for quick copy/paste.
- Run `npm run build` before opening a PR to catch broken links.

## Authentication

The site uses Auth0 for authentication. **All pages require authentication** - users must sign in before accessing any content (homepage, docs, blog, etc.).

### Local development

1. Copy `.env.example` to `.env`
2. Add your Auth0 credentials:
   ```
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   ```
3. Restart the dev server: `npm run start`

### Netlify deployment

Set these environment variables in Netlify (Site settings → Build & deploy → Environment):
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`

The Auth0 extension for Netlify should populate these automatically.

## Deployment notes

The site is static; any host that serves the `build/` directory works (GitHub Pages, Netlify, Vercel, etc.).  
When using GitHub Pages:

```bash
# SSH
USE_SSH=true npm run deploy

# HTTPS
GIT_USER=<github-username> npm run deploy
```

This builds and pushes the site to the `gh-pages` branch.
