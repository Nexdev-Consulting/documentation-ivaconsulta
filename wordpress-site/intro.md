---
slug: /intro
---

# IvaConsulta WordPress Site

A consolidated WordPress site created by merging two Joomla websites (main site + ecommerce) into a single installation. Focused on IVA/tax consultation and related services (EU VAT, Intrastat, B2B invoicing, etc.), with an integrated AI chatbot powered by an external RAG/orchestrator agent.

## Documentation

| Document | Description |
|----------|-------------|
| [Local Setup Guide](./docs/Local_Setup_Guide.md) | MAMP (macOS) and XAMPP (Linux) installation, database setup, development workflow, troubleshooting |
| [VAT Deep Chatbot](./docs/VAT_Deep_Chatbot.md) | Chatbot architecture, IP rate limiting, reply replacement, security, and performance |

---

## Site Overview

### Project Context

IvaConsulta is a single WordPress site consolidating two former Joomla websites (main site + ecommerce). It serves IVA/tax consultation content and integrates an AI-powered chatbot that connects to an external RAG/orchestrator API.

### Content and Structure

- **Migrated content**: 287+ EasyBlog articles as WordPress posts (HTML to Gutenberg blocks), SP Page Builder / Joomla content as WordPress pages
- **Taxonomy**: Categories and tags (IVA, EU VAT, Intrastat, B2B invoicing, etc.) preserved and linked
- **Multilingual**: Spanish and other languages via Polylang
- **Ecommerce**: Product/catalog content from the second Joomla site merged into the same installation

### Project Structure (High Level)

```
ivaconsulta/                  # project root
├── wp-admin/                 # WordPress admin
├── wp-includes/              # WordPress core
├── wp-content/               # Themes, plugins, uploads
│   ├── plugins/              # All plugins
│   ├── themes/               # All themes
│   │   ├── fixmate/          # Custom theme (Git-tracked)
│   │   └── fewer/            # Custom theme (Git-tracked)
│   ├── uploads/              # Media uploads
│   ├── mu-plugins/           # Must-use plugins
│   └── cache/                # Cache files
├── migration/                # Joomla → WordPress migration scripts
├── wp-config.php             # Database and environment config
└── README.md                 # Local setup and DB access
```

### Access

| Item | Value |
|------|-------|
| **Frontend** | `http://local.ivaconsulta` |
| **Admin Panel** | `http://local.ivaconsulta/wp-admin` |
| **Custom Login URL** | `http://local.ivaconsulta/ingresar` |

### Database

| Item | Value |
|------|-------|
| **Database Name** | `ivaconsulta` |
| **User** | `wordpress` |
| **Password** | `*HYdWp@IO5hC` |
| **Host** | `localhost` (port varies by platform) |
| **Table Prefix** | `base001_` |

For full local development setup instructions, see the [Local Setup Guide](./docs/Local_Setup_Guide.md).

---

## Plugins in Use

Installed in `wp-content/plugins/`. Some plugins may be inactive; the list reflects what is present in the plugins directory.

### Chatbot and IP Limitation (Core Integration)

These two plugins are central to the VAT Deep chatbot feature — see [VAT Deep Chatbot](./docs/VAT_Deep_Chatbot.md) for the full architecture.

| Plugin | Purpose |
|--------|---------|
| **AI Engine** | Provides the chatbot UI and logic; replies are intercepted and replaced by the external RAG/orchestrator API |
| **Code Snippets** | Holds the PHP that calls the external API (IP check, record call, and reply replacement) |

### Core Functionality

| Plugin | Purpose |
|--------|---------|
| **Advanced Custom Fields (ACF)** | Custom field management for flexible content |
| **Beaver Builder Lite** | Alternative page builder |
| **Gutenberg** | Block editor (WordPress default) |
| **Classic Editor** | Restores the classic WordPress editor |

### Security and Performance

| Plugin | Purpose |
|--------|---------|
| **All-in-One WP Security & Firewall** | Comprehensive security plugin |
| **Jetpack** | Security, performance, and marketing tools |
| **Jetpack Protect** | Malware scanning and protection |
| **Advanced Google reCAPTCHA** | Spam protection |
| **Akismet** | Anti-spam protection |

### SEO and Marketing

| Plugin | Purpose |
|--------|---------|
| **Yoast SEO** | SEO optimization |
| **WPForms Lite** | Contact form builder |

### Content and Media

| Plugin | Purpose |
|--------|---------|
| **Smart Slider 3** | Slider and carousel builder |
| **FileBird** | Media library folder organization |
| **Post Views Counter** | Track post/page views |

### Multilingual

| Plugin | Purpose |
|--------|---------|
| **Polylang** | Multilingual plugin for WordPress |

### Theme Support

| Plugin | Purpose |
|--------|---------|
| **Blocksy Companion** | Companion plugin for Blocksy theme |
| **Font Awesome** | Icon library integration |
| **Gravatar Enhanced** | Enhanced Gravatar functionality |

### Utilities

| Plugin | Purpose |
|--------|---------|
| **All-in-One WP Migration** | Site backup and migration tool |
| **Permalink Manager** | Custom permalink management |
| **Page Optimize** | Performance optimization |
| **Layout Grid** | Grid layout blocks |
| **Map Block Gutenberg** | Gutenberg map block |
| **Jotform AI Chatbot** | AI-powered chatbot integration |

### Migration Tools

| Plugin | Purpose |
|--------|---------|
| **FG Joomla to WordPress Premium** | Joomla to WordPress migration tool |
| **WPCat2Tag Importer** | Category to tag importer |

### Must-Use Plugins (MU-Plugins)

Located in `wp-content/mu-plugins/` (automatically loaded):

| Plugin | Purpose |
|--------|---------|
| **force-upload-limits.php** | Forces upload size limits |
| **local-url-replacement.php** | Handles local URL replacements |
| **url-debug.php** | URL debugging utility |

---

## Installed Themes

### Available Themes

**Custom Themes** (Git-tracked):

- **Fixmate** — `wp-content/themes/fixmate/`
- **Fewer** — `wp-content/themes/fewer/`

**Third-Party Themes** (not tracked in Git):

- Astra, Blocksy, Neve, Hello Biz, Twenty Twenty-Three, Twenty Twenty-Four, Twenty Twenty-Five

Check the active theme:

```sql
SELECT option_value FROM base001_options WHERE option_name = 'stylesheet';
```

---

## Quick Reference

| Action | MAMP (macOS) | XAMPP (Linux) |
|--------|-------------|---------------|
| **Start services** | Open MAMP → Start Servers | `sudo /opt/lampp/lampp start` |
| **Frontend** | `http://local.ivaconsulta` | `http://local.ivaconsulta` |
| **Admin** | `http://local.ivaconsulta/wp-admin` | `http://local.ivaconsulta/wp-admin` |
| **phpMyAdmin** | `http://localhost:8888/phpMyAdmin` | `http://localhost/phpMyAdmin` |
| **DB backup** | `/Applications/MAMP/Library/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup.sql` | `/opt/lampp/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup.sql` |
| **Clear cache** | `rm -rf wp-content/cache/*` | `rm -rf wp-content/cache/*` |

```sql
-- Check active plugins
SELECT option_value FROM base001_options WHERE option_name = 'active_plugins';

-- Count posts by status
SELECT post_status, COUNT(*) as count FROM base001_posts GROUP BY post_status;
```

---

*Consolidated from README.md, UPWORK_PROJECT_DESCRIPTION.md, and the Word document "Wordpress IP reccord and call RAG agent snippet.docx".*
