# Local config

A comprehensive guide for developing, building, and running the IvaConsulta WordPress project locally.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Installed Plugins](#installed-plugins)
- [Installed Themes](#installed-themes)
- [Development Workflow](#development-workflow)
- [Database Configuration](#database-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

**For macOS:**

- **MAMP** (or MAMP PRO) - Local development environment
  - Apache web server
  - MySQL database server
  - PHP 7.4+ (PHP 8.x recommended)

**For Linux:**

- **XAMPP** - Local development environment
  - Apache web server
  - MySQL/MariaDB database server
  - PHP 7.4+ (PHP 8.x recommended)

**Common Requirements:**

- **PHP** - Version 7.4 or higher
- **MySQL/MariaDB** - Version 5.7 or higher
- **Git** - Version control

### System Requirements

- **Memory Limit**: 1024M (configured in `wp-config.php`)
- **Upload Max Filesize**: 1024M
- **Post Max Size**: 1024M
- **Max Execution Time**: 600 seconds
- **Max Input Vars**: 5000

---

## Local Setup

Choose your platform:

- [MAMP Setup (macOS)](#1-mamp-configuration-macos)
- [XAMPP Setup (Linux)](#1-xampp-configuration-linux)

---

### 1. MAMP Configuration (macOS)

#### Virtual Host Setup

The project is configured to run at `http://local.ivaconsulta`. Configure MAMP as follows:

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

#### MAMP Port Configuration

- **Apache Port**: `80` (or `8888` if using default MAMP)
- **MySQL Port**: `3307` (as configured in `wp-config.php`)

### 2. Database Setup (MAMP)

#### Create Database

1. **Start MAMP** services
2. **Open phpMyAdmin**: `http://localhost/phpMyAdmin` (or `http://localhost:8888/phpMyAdmin`)
3. **Create Database**:
   - Database Name: `ivaconsulta`
   - Collation: `utf8mb4_unicode_ci`

#### Database User

Create a MySQL user with the following credentials:

```sql
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY '*HYdWp@IO5hC';
GRANT ALL PRIVILEGES ON ivaconsulta.* TO 'wordpress'@'localhost';
FLUSH PRIVILEGES;
```

**Database Configuration** (from `wp-config.php`):

- **Database Name**: `ivaconsulta`
- **Username**: `wordpress`
- **Password**: `*HYdWp@IO5hC`
- **Host**: `localhost:3307` (MAMP default MySQL port)
- **Table Prefix**: `base001_`

### 3. WordPress Installation (MAMP)

1. **Clone/Download** the project to your local directory:

   ```bash
   cd /Users/macnolo/Sites/localhost/IvaConsulta-wp
   ```

2. **Verify `wp-config.php`** settings match your local environment

3. **Import Database** (if you have a backup):

   ```bash
   # Using MAMP MySQL
   /Applications/MAMP/Library/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta < backup.sql
   ```

4. **Set File Permissions**:

   ```bash
   # Directories
   find . -type d -exec chmod 755 {} \;

   # Files
   find . -type f -exec chmod 644 {} \;

   # wp-config.php (more restrictive)
   chmod 600 wp-config.php
   ```

### 4. Access Your Site (MAMP)

Once MAMP is running and configured:

- **Frontend**: `http://local.ivaconsulta`
- **Admin Panel**: `http://local.ivaconsulta/wp-admin`
- **Custom Login URL**: `http://local.ivaconsulta/ingresar` (if configured)

---

### 1. XAMPP Configuration (Linux)

#### Installation

1. **Download XAMPP** for Linux from: https://www.apachefriends.org/
2. **Install XAMPP**:

   ```bash
   # Make installer executable
   chmod +x xampp-linux-x64-*-installer.run

   # Run installer (requires root)
   sudo ./xampp-linux-x64-*-installer.run
   ```

   Or install via package manager (if available):

   ```bash
   # Ubuntu/Debian
   sudo apt-get install xampp

   # Or download and extract manually
   cd /opt
   sudo tar -xzf xampp-linux-x64-*.tar.gz
   ```

3. **Start XAMPP Services**:

   ```bash
   # Start Apache and MySQL
   sudo /opt/lampp/lampp start

   # Or start individually
   sudo /opt/lampp/lampp startapache
   sudo /opt/lampp/lampp startmysql
   ```

#### Virtual Host Setup

The project is configured to run at `http://local.ivaconsulta`. Configure XAMPP as follows:

1. **Edit Apache Virtual Hosts**:

   ```bash
   sudo nano /opt/lampp/etc/extra/httpd-vhosts.conf
   ```

   Add this configuration:

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

2. **Enable Virtual Hosts** in Apache config:

   ```bash
   sudo nano /opt/lampp/etc/httpd.conf
   ```

   Find and uncomment (remove `#`):

   ```apache
   Include etc/extra/httpd-vhosts.conf
   ```

3. **Edit `/etc/hosts`** file:

   ```bash
   sudo nano /etc/hosts
   ```

   Add this line:

   ```
   127.0.0.1    local.ivaconsulta
   ```

4. **Restart Apache**:

   ```bash
   sudo /opt/lampp/lampp restartapache
   ```

#### XAMPP Port Configuration

- **Apache Port**: `80` (default, may require root/sudo)
- **MySQL Port**: `3306` (default XAMPP port)

**Note**: If using port 3306 instead of 3307, update `wp-config.php`:

```php
define('DB_HOST', 'localhost:3306');
```

### 2. Database Setup (XAMPP)

#### Create Database

1. **Start XAMPP** services:

   ```bash
   sudo /opt/lampp/lampp start
   ```

2. **Open phpMyAdmin**: `http://localhost/phpMyAdmin`
3. **Create Database**:
   - Database Name: `ivaconsulta`
   - Collation: `utf8mb4_unicode_ci`

#### Database User

Create a MySQL user with the following credentials:

```sql
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY '*HYdWp@IO5hC';
GRANT ALL PRIVILEGES ON ivaconsulta.* TO 'wordpress'@'localhost';
FLUSH PRIVILEGES;
```

**Database Configuration** (update `wp-config.php` if needed):

- **Database Name**: `ivaconsulta`
- **Username**: `wordpress`
- **Password**: `*HYdWp@IO5hC`
- **Host**: `localhost:3306` (XAMPP default MySQL port) or `localhost` (if using default port)
- **Table Prefix**: `base001_`

### 3. WordPress Installation (XAMPP)

1. **Clone/Download** the project to XAMPP htdocs directory:

   ```bash
   cd /opt/lampp/htdocs
   git clone <repository-url> IvaConsulta-wp
   # Or copy your project files here
   ```

2. **Verify `wp-config.php`** settings match your local environment:

   - Update `DB_HOST` if using port 3306 instead of 3307
   - Verify database credentials

3. **Import Database** (if you have a backup):

   ```bash
   # Using XAMPP MySQL
   /opt/lampp/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta < backup.sql
   ```

   Or via phpMyAdmin:

   - Go to `http://localhost/phpMyAdmin`
   - Select `ivaconsulta` database
   - Click "Import" tab
   - Choose your backup file and click "Go"

4. **Set File Permissions**:

   ```bash
   cd /opt/lampp/htdocs/IvaConsulta-wp

   # Directories
   find . -type d -exec chmod 755 {} \;

   # Files
   find . -type f -exec chmod 644 {} \;

   # wp-config.php (more restrictive)
   chmod 600 wp-config.php

   # wp-content/uploads (writable for uploads)
   chmod -R 775 wp-content/uploads
   ```

### 4. Access Your Site (XAMPP)

Once XAMPP is running and configured:

- **Frontend**: `http://local.ivaconsulta`
- **Admin Panel**: `http://local.ivaconsulta/wp-admin`
- **Custom Login URL**: `http://local.ivaconsulta/ingresar` (if configured)
- **phpMyAdmin**: `http://localhost/phpMyAdmin`

---

## Installed Plugins

### Core Functionality

1. **Advanced Custom Fields (ACF)**

   - Custom field management for flexible content
   - Location: `wp-content/plugins/advanced-custom-fields/`

2. **Beaver Builder Lite**

   - Alternative page builder
   - Location: `wp-content/plugins/beaver-builder-lite-version/`

3. **Gutenberg**

   - Block editor (WordPress default)
   - Location: `wp-content/plugins/gutenberg/`

4. **Classic Editor**
   - Restores the classic WordPress editor
   - Location: `wp-content/plugins/classic-editor/`

### Security & Performance

6. **All-in-One WP Security & Firewall**

   - Comprehensive security plugin
   - Location: `wp-content/plugins/all-in-one-wp-security-and-firewall/`

7. **Jetpack**

   - Security, performance, and marketing tools
   - Location: `wp-content/plugins/jetpack/`

8. **Jetpack Protect**

   - Malware scanning and protection
   - Location: `wp-content/plugins/jetpack-protect/`

9. **Advanced Google reCAPTCHA**

   - Spam protection
   - Location: `wp-content/plugins/advanced-google-recaptcha/`

10. **Akismet**
    - Anti-spam protection
    - Location: `wp-content/plugins/akismet/`

### SEO & Marketing

12. **Yoast SEO (WordPress SEO)**

    - SEO optimization plugin
    - Location: `wp-content/plugins/wordpress-seo/`

13. **WPForms Lite**

    - Contact form builder
    - Location: `wp-content/plugins/wpforms-lite/`

### Content & Media

15. **Smart Slider 3**

    - Slider and carousel builder
    - Location: `wp-content/plugins/smart-slider-3/`

16. **FileBird**

    - Media library folder organization
    - Location: `wp-content/plugins/filebird/`

17. **Post Views Counter**
    - Track post/page views
    - Location: `wp-content/plugins/post-views-counter/`

### Multilingual

20. **Polylang**

    - Multilingual plugin for WordPress
    - Location: `wp-content/plugins/polylang/`

### Theme Support

22. **Blocksy Companion**

    - Companion plugin for Blocksy theme
    - Location: `wp-content/plugins/blocksy-companion/`

23. **Font Awesome**

    - Icon library integration
    - Location: `wp-content/plugins/font-awesome/`

24. **Gravatar Enhanced**
    - Enhanced Gravatar functionality
    - Location: `wp-content/plugins/gravatar-enhanced/`

### Utilities

25. **All-in-One WP Migration**

    - Site backup and migration tool
    - Location: `wp-content/plugins/all-in-one-wp-migration/`

26. **Permalink Manager**

    - Custom permalink management
    - Location: `wp-content/plugins/permalink-manager/`

27. **Page Optimize**

    - Performance optimization
    - Location: `wp-content/plugins/page-optimize/`

28. **Layout Grid**

    - Grid layout blocks
    - Location: `wp-content/plugins/layout-grid/`

29. **Map Block Gutenberg**

    - Gutenberg map block
    - Location: `wp-content/plugins/map-block-gutenberg/`

30. **Jotform AI Chatbot**
    - AI-powered chatbot integration
    - Location: `wp-content/plugins/jotform-ai-chatbot/`

### Migration Tools

31. **FG Joomla to WordPress Premium**

    - Joomla to WordPress migration tool
    - Location: `wp-content/plugins/fg-joomla-to-wordpress-premium/`

32. **WPCat2Tag Importer**
    - Category to tag importer
    - Location: `wp-content/plugins/wpcat2tag-importer/`

### Must-Use Plugins (MU-Plugins)

Located in `wp-content/mu-plugins/` (automatically loaded):

- **force-upload-limits.php** - Forces upload size limits
- **local-url-replacement.php** - Handles local URL replacements
- **url-debug.php** - URL debugging utility

---

## Installed Themes

### Active Theme

The project uses custom themes. Check which theme is active via WordPress admin or database:

```sql
SELECT option_value FROM base001_options WHERE option_name = 'stylesheet';
```

### Available Themes

1. **Custom Themes** (Tracked in Git):

   - **Fixmate** - `wp-content/themes/fixmate/`
   - **Fewer** - `wp-content/themes/fewer/`

2. **Third-Party Themes** (Not tracked in Git):
   - **Astra** - `wp-content/themes/astra/`
   - **Blocksy** - `wp-content/themes/blocksy/`
   - **Neve** - `wp-content/themes/neve/`
   - **Hello Biz** - `wp-content/themes/hello-biz/`
   - **Twenty Twenty-Three** - `wp-content/themes/twentytwentythree/`
   - **Twenty Twenty-Four** - `wp-content/themes/twentytwentyfour/`
   - **Twenty Twenty-Five** - `wp-content/themes/twentytwentyfive/`

---

## Development Workflow

### Starting Development

#### MAMP (macOS)

1. **Start MAMP Services**:

   ```bash
   # Open MAMP application and click "Start Servers"
   # Or via command line:
   /Applications/MAMP/bin/startApache.sh
   /Applications/MAMP/bin/startMysql.sh
   ```

2. **Verify Services**:

   - Apache: `http://localhost` or `http://localhost:8888`
   - MySQL: Check MAMP status panel

3. **Access Site**:
   - Frontend: `http://local.ivaconsulta`
   - Admin: `http://local.ivaconsulta/wp-admin`

#### XAMPP (Linux)

1. **Start XAMPP Services**:

   ```bash
   # Start both Apache and MySQL
   sudo /opt/lampp/lampp start

   # Or start individually
   sudo /opt/lampp/lampp startapache
   sudo /opt/lampp/lampp startmysql
   ```

2. **Verify Services**:

   ```bash
   # Check service status
   sudo /opt/lampp/lampp status

   # Or check processes
   ps aux | grep -E 'apache|mysql'
   ```

   - Apache: `http://localhost`
   - MySQL: Check with `sudo /opt/lampp/lampp status`

3. **Access Site**:

   - Frontend: `http://local.ivaconsulta`
   - Admin: `http://local.ivaconsulta/wp-admin`
   - phpMyAdmin: `http://localhost/phpMyAdmin`

4. **Stop Services** (when done):

   ```bash
   sudo /opt/lampp/lampp stop
   ```

### Development Best Practices

#### 1. Enable Debug Mode

Debug mode is already enabled in `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Check debug logs at: `wp-content/debug.log`

#### 2. Version Control

**Tracked in Git**:

- Custom themes (`fixmate`, `fewer`)
- Custom plugins (if any)
- Migration scripts
- Configuration documentation

**NOT Tracked** (see `.gitignore`):

- WordPress core files
- Third-party plugins
- Third-party themes
- Uploads and cache
- `wp-config.php` (contains sensitive data)

#### 3. Database Management

**MAMP (macOS) - Backup Before Changes**:

```bash
# Create backup
/Applications/MAMP/Library/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup_$(date +%Y%m%d).sql

# Restore backup
/Applications/MAMP/Library/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta < backup_file.sql
```

**XAMPP (Linux) - Backup Before Changes**:

```bash
# Create backup
/opt/lampp/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup_$(date +%Y%m%d).sql

# Restore backup
/opt/lampp/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta < backup_file.sql
```

#### 4. Plugin Development

If developing custom plugins:

1. Create plugin in `wp-content/plugins/your-plugin-name/`
2. Add main plugin file with header:
   ```php
   <?php
   /**
    * Plugin Name: Your Plugin Name
    * Description: Plugin description
    * Version: 1.0.0
    */
   ```

#### 5. Theme Development

For custom theme development:

1. Work in `wp-content/themes/fixmate/` or `wp-content/themes/fewer/`
2. Use child themes if modifying third-party themes
3. Test changes in staging before production

### Building & Compiling

This WordPress project **does not require a build process**. WordPress is PHP-based and runs directly.

However, some plugins may have build processes:

- **Jetpack**: Uses Composer for dependencies
- **Elementor**: May have frontend assets to compile
- **Custom themes**: May use Sass/SCSS (compile manually if needed)

### File Structure

```
IvaConsulta-wp/
├── wp-admin/              # WordPress admin (not in Git)
├── wp-includes/           # WordPress core (not in Git)
├── wp-content/
│   ├── plugins/           # All plugins
│   ├── themes/            # All themes
│   ├── uploads/           # Media uploads (not in Git)
│   ├── mu-plugins/        # Must-use plugins
│   └── cache/             # Cache files (not in Git)
├── migration/             # Migration scripts
├── wp-config.php          # Configuration (not in Git)
├── .htaccess              # Apache configuration
└── README.md              # Project documentation
```

---

## Database Configuration

### Connection Details

**MAMP (macOS)**:

- **Host**: `localhost:3307`
- **Database**: `ivaconsulta`
- **Username**: `wordpress`
- **Password**: `*HYdWp@IO5hC`
- **Table Prefix**: `base001_`

**XAMPP (Linux)**:

- **Host**: `localhost:3306` or `localhost` (default port)
- **Database**: `ivaconsulta`
- **Username**: `wordpress`
- **Password**: `*HYdWp@IO5hC`
- **Table Prefix**: `base001_`

**Note**: Update `wp-config.php` with the correct port for your environment.

### Useful Database Queries

```sql
-- Check active plugins
SELECT option_value FROM base001_options WHERE option_name = 'active_plugins';

-- Check active theme
SELECT option_value FROM base001_options WHERE option_name = 'stylesheet';

-- Check site URLs
SELECT option_name, option_value FROM base001_options
WHERE option_name IN ('siteurl', 'home');

-- Count posts by status
SELECT post_status, COUNT(*) as count
FROM base001_posts
GROUP BY post_status;

-- List all users
SELECT ID, user_login, user_email, user_registered
FROM base001_users;
```

### Accessing Database

**Via phpMyAdmin**:

**MAMP (macOS)**:

1. Start MAMP
2. Go to: `http://localhost/phpMyAdmin` (or `http://localhost:8888/phpMyAdmin`)
3. Login with: `wordpress` / `*HYdWp@IO5hC`
4. Select database: `ivaconsulta`

**XAMPP (Linux)**:

1. Start XAMPP: `sudo /opt/lampp/lampp start`
2. Go to: `http://localhost/phpMyAdmin`
3. Login with: `wordpress` / `*HYdWp@IO5hC`
4. Select database: `ivaconsulta`

**Via Command Line**:

**MAMP (macOS)**:

```bash
/Applications/MAMP/Library/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta
```

**XAMPP (Linux)**:

```bash
/opt/lampp/bin/mysql -u wordpress -p'*HYdWp@IO5hC' ivaconsulta
```

---

## Troubleshooting

### Common Issues

#### 1. Site Not Loading

**MAMP (macOS) - Check**:

- MAMP services are running
- Virtual host is configured correctly
- `/etc/hosts` file has correct entry
- Apache port matches configuration

**MAMP (macOS) - Solution**:

```bash
# Check Apache status
/Applications/MAMP/bin/checkApacheSyntax.sh

# Check if port is in use
lsof -i :80
```

**XAMPP (Linux) - Check**:

- XAMPP services are running (`sudo /opt/lampp/lampp status`)
- Virtual host is configured correctly in `/opt/lampp/etc/extra/httpd-vhosts.conf`
- Virtual hosts are enabled in `/opt/lampp/etc/httpd.conf`
- `/etc/hosts` file has correct entry
- Apache port matches configuration

**XAMPP (Linux) - Solution**:

```bash
# Check Apache status
sudo /opt/lampp/lampp status

# Check Apache error log
sudo tail -f /opt/lampp/logs/error_log

# Test Apache configuration
sudo /opt/lampp/bin/httpd -t

# Check if port is in use
sudo netstat -tulpn | grep :80
# Or
sudo ss -tulpn | grep :80
```

#### 2. Database Connection Error

**MAMP (macOS) - Check**:

- MySQL is running in MAMP
- Port matches `wp-config.php` (3307)
- Database exists: `ivaconsulta`
- User credentials are correct

**MAMP (macOS) - Solution**:

```bash
# Test MySQL connection
/Applications/MAMP/Library/bin/mysql -u wordpress -p'*HYdWp@IO5hC' -h localhost -P 3307
```

**XAMPP (Linux) - Check**:

- MySQL is running (`sudo /opt/lampp/lampp status`)
- Port matches `wp-config.php` (3306 or 3307)
- Database exists: `ivaconsulta`
- User credentials are correct

**XAMPP (Linux) - Solution**:

```bash
# Test MySQL connection (default port 3306)
/opt/lampp/bin/mysql -u wordpress -p'*HYdWp@IO5hC' -h localhost -P 3306

# Check MySQL error log
sudo tail -f /opt/lampp/logs/mysql_error.log

# Check if MySQL is listening
sudo netstat -tulpn | grep :3306
```

#### 3. Permission Errors

**Solution**:

```bash
# Fix file permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 wp-config.php
```

#### 4. Plugin/Theme Errors

**Check**:

- `wp-content/debug.log` for errors
- PHP error logs:
  - **MAMP**: Check MAMP logs panel or `/Applications/MAMP/logs/php_error.log`
  - **XAMPP**: `/opt/lampp/logs/php_error_log`
- Plugin compatibility with PHP version

**Solution**:

- Disable problematic plugins
- Check plugin requirements
- Update WordPress core and plugins

#### 5. Memory Limit Issues

Already configured in `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '1024M');
@ini_set('memory_limit', '1024M');
```

**MAMP (macOS)**: If issues persist, check MAMP PHP configuration.

**XAMPP (Linux)**: If issues persist, edit PHP configuration:

```bash
# Edit php.ini
sudo nano /opt/lampp/etc/php.ini

# Find and update:
memory_limit = 1024M
upload_max_filesize = 1024M
post_max_size = 1024M
max_execution_time = 600
max_input_vars = 5000

# Restart Apache
sudo /opt/lampp/lampp restartapache
```

#### 6. URL Issues After Migration

The project includes URL replacement tools:

- `wp-content/mu-plugins/local-url-replacement.php`
- `update-urls.php` script

Run URL update if needed:

```bash
php update-urls.php
```

### Debugging

#### Enable WordPress Debug

Already enabled in `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false); // Set to true to display on screen
```

#### Check Logs

- **WordPress Debug Log**: `wp-content/debug.log`

**MAMP (macOS)**:

- **Apache Error Log**: Check MAMP logs panel or `/Applications/MAMP/logs/apache_error.log`
- **PHP Error Log**: Check MAMP logs panel or `/Applications/MAMP/logs/php_error.log`

**XAMPP (Linux)**:

- **Apache Error Log**: `/opt/lampp/logs/error_log`
- **PHP Error Log**: `/opt/lampp/logs/php_error_log`
- **MySQL Error Log**: `/opt/lampp/logs/mysql_error.log`

View logs in real-time:

```bash
# XAMPP - Apache errors
sudo tail -f /opt/lampp/logs/error_log

# XAMPP - PHP errors
sudo tail -f /opt/lampp/logs/php_error_log
```

#### Clear Cache

```bash
# Clear WordPress cache
rm -rf wp-content/cache/*

# Clear plugin-specific cache
rm -rf wp-content/w3tc-config/*
```

---

## Additional Resources

### Documentation Files

- `README.md` - Main project documentation
- `README_AIOS.md` - All-in-One Security notes
- `README_HTACCESS.md` - Apache configuration notes

### Migration Tools

- `migration/` - Migration scripts and tools
- `update-urls.php` - URL update utility
- `update-urls.sql` - SQL queries for URL updates

### Security Notes

- HTTP Authentication can be disabled by uncommenting in `wp-config.php`:
  ```php
  define('AIOS_DISABLE_HTTP_AUTHENTICATION', true);
  ```

---

## Quick Reference

### Start Development

**MAMP (macOS)**:

```bash
# 1. Start MAMP services
/Applications/MAMP/bin/startApache.sh
/Applications/MAMP/bin/startMysql.sh
# 2. Access: http://local.ivaconsulta
# 3. Admin: http://local.ivaconsulta/wp-admin
```

**XAMPP (Linux)**:

```bash
# 1. Start XAMPP services
sudo /opt/lampp/lampp start
# 2. Access: http://local.ivaconsulta
# 3. Admin: http://local.ivaconsulta/wp-admin
```

### Database Backup

**MAMP (macOS)**:

```bash
/Applications/MAMP/Library/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup.sql
```

**XAMPP (Linux)**:

```bash
/opt/lampp/bin/mysqldump -u wordpress -p'*HYdWp@IO5hC' ivaconsulta > backup.sql
```

### Check Active Plugins

```sql
SELECT option_value FROM base001_options WHERE option_name = 'active_plugins';
```

### Clear Cache

```bash
rm -rf wp-content/cache/*
```

---

## Support

For issues or questions:

1. Check `wp-content/debug.log` for errors
2. Review error logs:
   - **MAMP (macOS)**: Check MAMP logs panel
   - **XAMPP (Linux)**: Check `/opt/lampp/logs/` directory
3. Check WordPress documentation: https://wordpress.org/support/
4. Review plugin-specific documentation

---

**Last Updated**: 2025-01-27
**WordPress Version**: Check via `wp-admin` → Dashboard
**PHP Version**: Check via `phpinfo()` or MAMP panel
