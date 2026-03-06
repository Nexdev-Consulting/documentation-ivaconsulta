# Local Setup Guide

A comprehensive guide for developing, building, and running the IvaConsulta WordPress project locally.

---

## Prerequisites

### Required Software

**For macOS:**

- **MAMP** (or MAMP PRO) — Local development environment
  - Apache web server
  - MySQL database server
  - PHP 7.4+ (PHP 8.x recommended)

**For Linux:**

- **XAMPP** — Local development environment
  - Apache web server
  - MySQL/MariaDB database server
  - PHP 7.4+ (PHP 8.x recommended)

**Common Requirements:**

- **PHP** — Version 7.4 or higher
- **MySQL/MariaDB** — Version 5.7 or higher
- **Git** — Version control

### System Requirements

| Setting | Value |
|---------|-------|
| Memory Limit | 1024M (configured in `wp-config.php`) |
| Upload Max Filesize | 1024M |
| Post Max Size | 1024M |
| Max Execution Time | 600 seconds |
| Max Input Vars | 5000 |

---

## MAMP Setup (macOS)

### 1. MAMP Configuration

#### Virtual Host Setup

The project is configured to run at `http://local.ivaconsulta`.

1. **Open MAMP PRO** (or edit Apache `httpd.conf` manually)
2. **Add Virtual Host**:
   - Host Name: `local.ivaconsulta`
   - Document Root: `/Users/macnolo/Sites/localhost/IvaConsulta-wp`
   - Port: `80` (or your preferred port)

3. **Edit `/etc/hosts`** file:

```bash
sudo nano /etc/hosts
```

Add this line:

```
127.0.0.1    local.ivaconsulta
```

#### Port Configuration

- **Apache Port**: `80` (or `8888` if using default MAMP)
- **MySQL Port**: `3307` (as configured in `wp-config.php`)

### 2. Database Setup (MAMP)

#### Create Database

1. Start MAMP services
2. Open phpMyAdmin: `http://localhost/phpMyAdmin` (or `http://localhost:8888/phpMyAdmin`)
3. Create Database:
   - Database Name: `ivaconsulta`
   - Collation: `utf8mb4_unicode_ci`

#### Database User

```sql
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY '*HYdWp@IO5hC';
GRANT ALL PRIVILEGES ON ivaconsulta.* TO 'wordpress'@'localhost';
FLUSH PRIVILEGES;
```

**Database Configuration** (from `wp-config.php`):

| Setting | Value |
|---------|-------|
| Database Name | `ivaconsulta` |
| Username | `wordpress` |
| Password | `*HYdWp@IO5hC` |
| Host | `localhost:3307` |
| Table Prefix | `base001_` |

### 3. WordPress Installation (MAMP)

1. **Clone/Download** the project:

```bash
cd /Users/macnolo/Sites/localhost/IvaConsulta-wp
```

2. **Verify `wp-config.php`** settings match your local environment

3. **Import Database** (if you have a backup):

```bash
/Applications/MAMP/Library/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta < backup.sql
```

4. **Set File Permissions**:

```bash
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 wp-config.php
```

### 4. Access Your Site (MAMP)

| Item | URL |
|------|-----|
| Frontend | `http://local.ivaconsulta` |
| Admin Panel | `http://local.ivaconsulta/wp-admin` |
| Custom Login | `http://local.ivaconsulta/ingresar` |

---

## XAMPP Setup (Linux)

### 1. XAMPP Configuration

#### Installation

```bash
chmod +x xampp-linux-x64-*-installer.run
sudo ./xampp-linux-x64-*-installer.run
```

Start services:

```bash
sudo /opt/lampp/lampp start
```

#### Virtual Host Setup

1. **Edit Apache Virtual Hosts**:

```bash
sudo nano /opt/lampp/etc/extra/httpd-vhosts.conf
```

Add:

```apache
<VirtualHost *:80>
    ServerName local.ivaconsulta
    DocumentRoot /opt/lampp/htdocs/IvaConsulta-wp
    <Directory /opt/lampp/htdocs/IvaConsulta-wp>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

2. **Enable Virtual Hosts** in `/opt/lampp/etc/httpd.conf` — uncomment:

```apache
Include etc/extra/httpd-vhosts.conf
```

3. **Edit `/etc/hosts`**:

```
127.0.0.1    local.ivaconsulta
```

4. **Restart Apache**:

```bash
sudo /opt/lampp/lampp restartapache
```

#### Port Configuration

- **Apache Port**: `80`
- **MySQL Port**: `3306`

If using port 3306 instead of 3307, update `wp-config.php`:

```php
define('DB_HOST', 'localhost:3306');
```

### 2. Database Setup (XAMPP)

1. Start XAMPP: `sudo /opt/lampp/lampp start`
2. Open phpMyAdmin: `http://localhost/phpMyAdmin`
3. Create Database:
   - Database Name: `ivaconsulta`
   - Collation: `utf8mb4_unicode_ci`

```sql
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY '*HYdWp@IO5hC';
GRANT ALL PRIVILEGES ON ivaconsulta.* TO 'wordpress'@'localhost';
FLUSH PRIVILEGES;
```

**Database Configuration**:

| Setting | Value |
|---------|-------|
| Database Name | `ivaconsulta` |
| Username | `wordpress` |
| Password | `*HYdWp@IO5hC` |
| Host | `localhost:3306` or `localhost` |
| Table Prefix | `base001_` |

### 3. WordPress Installation (XAMPP)

1. **Clone to XAMPP htdocs**:

```bash
cd /opt/lampp/htdocs
git clone <repository-url> IvaConsulta-wp
```

2. **Update `wp-config.php`** if using port 3306

3. **Import Database**:

```bash
/opt/lampp/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta < backup.sql
```

4. **Set File Permissions**:

```bash
cd /opt/lampp/htdocs/IvaConsulta-wp
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 wp-config.php
chmod -R 775 wp-content/uploads
```

### 4. Access Your Site (XAMPP)

| Item | URL |
|------|-----|
| Frontend | `http://local.ivaconsulta` |
| Admin Panel | `http://local.ivaconsulta/wp-admin` |
| Custom Login | `http://local.ivaconsulta/ingresar` |
| phpMyAdmin | `http://localhost/phpMyAdmin` |

---

## Development Workflow

### Starting Development

**MAMP (macOS):**

```bash
/Applications/MAMP/bin/startApache.sh
/Applications/MAMP/bin/startMysql.sh
```

**XAMPP (Linux):**

```bash
sudo /opt/lampp/lampp start
```

### Debug Mode

Already enabled in `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Logs at: `wp-content/debug.log`

### Version Control

**Tracked in Git:**
- Custom themes (`fixmate`, `fewer`)
- Custom plugins (if any)
- Migration scripts
- Configuration documentation

**NOT Tracked** (see `.gitignore`):
- WordPress core files
- Third-party plugins and themes
- Uploads and cache
- `wp-config.php` (contains sensitive data)

### Database Backup

**MAMP (macOS):**

```bash
/Applications/MAMP/Library/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup_$(date +%Y%m%d).sql
```

**XAMPP (Linux):**

```bash
/opt/lampp/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup_$(date +%Y%m%d).sql
```

### Building and Compiling

This WordPress project **does not require a build process** — WordPress is PHP-based and runs directly.

Some plugins may have build processes:
- **Jetpack**: Uses Composer for dependencies
- **Custom themes**: May use Sass/SCSS (compile manually if needed)

---

## Troubleshooting

### Site Not Loading

**MAMP (macOS):**

```bash
/Applications/MAMP/bin/checkApacheSyntax.sh
lsof -i :80
```

**XAMPP (Linux):**

```bash
sudo /opt/lampp/lampp status
sudo /opt/lampp/bin/httpd -t
sudo tail -f /opt/lampp/logs/error_log
```

### Database Connection Error

**MAMP (macOS):**

```bash
/Applications/MAMP/Library/bin/mysql -u wordpress -p'*HYdWp@IO5hC' -h localhost -P 3307
```

**XAMPP (Linux):**

```bash
/opt/lampp/bin/mysql -u wordpress -p'*HYdWp@IO5hC' -h localhost -P 3306
```

### Permission Errors

```bash
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 wp-config.php
```

### Memory Limit Issues

Already configured in `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '1024M');
@ini_set('memory_limit', '1024M');
```

**XAMPP (Linux)** — if issues persist, edit `/opt/lampp/etc/php.ini`:

```ini
memory_limit = 1024M
upload_max_filesize = 1024M
post_max_size = 1024M
max_execution_time = 600
max_input_vars = 5000
```

Then restart Apache: `sudo /opt/lampp/lampp restartapache`

### URL Issues After Migration

The project includes URL replacement tools:
- `wp-content/mu-plugins/local-url-replacement.php`
- `update-urls.php` script

```bash
php update-urls.php
```

### Checking Logs

| Log | MAMP (macOS) | XAMPP (Linux) |
|-----|-------------|---------------|
| WordPress Debug | `wp-content/debug.log` | `wp-content/debug.log` |
| Apache Error | `/Applications/MAMP/logs/apache_error.log` | `/opt/lampp/logs/error_log` |
| PHP Error | `/Applications/MAMP/logs/php_error.log` | `/opt/lampp/logs/php_error_log` |
| MySQL Error | — | `/opt/lampp/logs/mysql_error.log` |

### Clear Cache

```bash
rm -rf wp-content/cache/*
rm -rf wp-content/w3tc-config/*
```

---

## Additional Resources

| Resource | Description |
|----------|-------------|
| `README.md` | Main project documentation |
| `README_AIOS.md` | All-in-One Security notes |
| `README_HTACCESS.md` | Apache configuration notes |
| `migration/` | Migration scripts and tools |
| `update-urls.php` | URL update utility |
| `update-urls.sql` | SQL queries for URL updates |

### Security Notes

HTTP Authentication can be disabled by uncommenting in `wp-config.php`:

```php
define('AIOS_DISABLE_HTTP_AUTHENTICATION', true);
```
