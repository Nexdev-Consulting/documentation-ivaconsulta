## 📝 Description

Adds Auth0 authentication to protect all pages, rebrands the Docusaurus site for IVA projects, adds WordPress/RagTool/Orchestrator doc sections, and introduces repo hygiene improvements.

## 🎯 What does this PR do?

- [x] Feature addition
- [x] Bug fix
- [x] Documentation update
- [ ] Code refactoring
- [ ] Other: \_ \_

## 🔍 Changes Made

### Authentication (Auth0)

- Integrated Auth0 SPA SDK for client-side authentication
- All pages now require authentication before access
- Custom navbar component with Sign In/Sign Out functionality
- Dedicated callback page for Auth0 redirect handling
- Environment variable configuration for Auth0 credentials
- Added `.env.example` and updated `.gitignore`

### Documentation Structure

- Registered standalone docs plugins + navbar links for `wordpress-site`, `ragtool`, and `orchestrator`, including placeholder guides so links resolve
- Created placeholder markdown files for all documentation sections

### Branding & UI

- Updated global branding (logo, favicon) to IVA Consulta assets
- Restructured navbar: renamed "My Site" to "Home", moved Tutorial/Blog to right, removed GitHub link
- Refreshed homepage: removed video tutorial section, updated feature cards to highlight the three IVA projects (WordPress Site, Orchestrator, RagTool)
- Made feature card titles clickable links to their respective documentation
- Fixed CSS bug: changed invalid `text-decoration: bold` to `font-weight: bold`

### Developer Experience

- Added reusable pull-request template
- Updated main README with authentication setup instructions
- Added GitHub workflow for Netlify deployment
- Installed dependencies: `@auth0/auth0-spa-js`, `@auth0/auth0-react`, `dotenv`

## 🧪 Testing

- [x] I have tested this locally
- [x] All tests pass (`npm run build`)
- [x] Authentication flow works locally
- [x] No breaking changes

## 📸 Screenshots (if applicable)

_Authentication flow and UI changes tested in both local and Netlify environments._

## 📋 Checklist

- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Code is commented where necessary
- [x] Documentation updated (README, .env.example, PR template)

## 🚀 Deployment Notes

### Required Environment Variables (Netlify)

Set these in Netlify dashboard (Site settings → Build & deploy → Environment):

- `AUTH0_DOMAIN` - Your Auth0 tenant domain (e.g., `your-tenant.auth0.com`)
- `AUTH0_CLIENT_ID` - Your Auth0 application client ID

### Auth0 Configuration

Ensure your Auth0 application has these settings:

- **Application Type**: Single Page Application
- **Allowed Callback URLs**: `https://your-site.netlify.app/auth/callback, http://localhost:3000/auth/callback`
- **Allowed Logout URLs**: `https://your-site.netlify.app, http://localhost:3000`
- **Allowed Web Origins**: `https://your-site.netlify.app, http://localhost:3000`
- **Grant Types**: Ensure "Refresh Token" is enabled

## 📞 Additional Notes

- Placeholder docs under `ragtool/docs/` and `orchestrator/docs/` should be replaced with finalized content when available
- Auth0 callback debugging logs included (with emoji markers) for troubleshooting
- Local development requires `.env` file with Auth0 credentials (see `.env.example`)
