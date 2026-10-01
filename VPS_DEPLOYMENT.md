# Deploy Hawa: Next.js, Laravel, and independent MySQL

This replaces the previous Supabase/Prisma deployment instructions. Deploy Hawa separately from Zad Land. No Supabase records are imported, and the initial database contains only Hawa's site settings and the administrator you create.

The first install can use the prepared ZIP. For subsequent deployments, publish code to the GitHub `main` branch and run Hawa’s release script on the VPS. GitHub provides read-only source access; environment files, the database, and uploaded media stay on the server.

## 1. Upload the ZIP

On your Windows computer, use PowerShell:

```powershell
scp E:\work\Hawa-vps-deploy.zip root@srv2012157:/root/hawa-deploy.zip
```

Connect to the VPS as root. Keep the commands below in the same terminal session. Set the real Hawa domain at the prompt; DNS must point to this VPS.

```bash
read -rp 'Hawa domain, without https://: ' HAWA_DOMAIN
[[ "$HAWA_DOMAIN" =~ ^[a-zA-Z0-9.-]+$ && "$HAWA_DOMAIN" == *.* ]] || { echo 'Enter a valid domain'; exit 1; }
export HAWA_DOMAIN
apt-get update
apt-get install -y nginx mysql-server unzip openssl php8.5-cli php8.5-fpm php8.5-mysql php8.5-gd php8.5-mbstring php8.5-xml php8.5-curl php8.5-zip certbot python3-certbot-nginx
node --version
composer --version
php --version
systemctl enable --now mysql php8.5-fpm
ss -ltnp | grep -E ':3100|:8001' || true
```

Use Node 22 or later and Composer 2. The two checked ports must be free before installing Hawa. This configuration uses **3100 for Next.js** and **127.0.0.1:8001 for Laravel**, alongside the existing Zad Land services. Do not change Zad Land's configuration. If the host's package repository does not provide PHP 8.5, use its already-installed PHP 8.5 packages rather than replacing the PHP installation.

## 2. Extract into Hawa's own release directory

The existing `deploy` user is reused for file ownership, not application accounts or data.

```bash
id deploy
RELEASE="/var/www/hawa/releases/$(date -u +%Y%m%d-%H%M%S)"
export RELEASE
install -d -o deploy -g www-data /var/www/hawa/releases /var/www/hawa/shared /var/lib/hawa/media
install -d -o deploy -g www-data "$RELEASE"
unzip -q /root/hawa-deploy.zip -d "$RELEASE"
chown -R deploy:www-data "$RELEASE"
ln -s "$RELEASE" /var/www/hawa/current
install -d -o deploy -g www-data -m 2770 /var/www/hawa/shared/storage/app/public /var/www/hawa/shared/storage/framework/cache/data /var/www/hawa/shared/storage/framework/sessions /var/www/hawa/shared/storage/framework/views /var/www/hawa/shared/storage/logs
chmod 2770 /var/lib/hawa/media
```

This `current` link is for the first installation. If Hawa is already installed, follow the update procedure at the end instead of replacing a running release before building.

## 3. Create the fresh MySQL database

The commands deliberately fail if `hawa_backend` already exists. Do not drop an existing database to rerun them.

```bash
HAWA_DB_PASS=$(openssl rand -hex 24)
export HAWA_DB_PASS
mysql <<SQL
CREATE DATABASE hawa_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hawa_app'@'localhost' IDENTIFIED BY '$HAWA_DB_PASS';
GRANT ALL PRIVILEGES ON hawa_backend.* TO 'hawa_app'@'localhost';
SQL
```

If your MySQL root account requires a password, run `mysql -p` and enter the SQL there with a separate strong Hawa password. That same password must be entered as `DB_PASSWORD` in the next step.

## 4. Configure independent environments

```bash
cp "$RELEASE/backend/.env.example" /var/www/hawa/shared/backend.env
cp "$RELEASE/deploy/env.production.example" /var/www/hawa/shared/frontend.env
python3 <<'PY'
import os
from pathlib import Path
domain = os.environ['HAWA_DOMAIN']
p = Path('/var/www/hawa/shared/backend.env')
text = p.read_text()
updates = {
    'APP_ENV': 'production', 'APP_DEBUG': 'false',
    'APP_URL': f'https://{domain}', 'FRONTEND_URL': f'https://{domain}',
    'DB_DATABASE': 'hawa_backend', 'DB_USERNAME': 'hawa_app',
    'DB_PASSWORD': os.environ['HAWA_DB_PASS'],
    'SANCTUM_STATEFUL_DOMAINS': domain, 'SESSION_COOKIE': 'hawa_session',
    'MEDIA_STORAGE_DIR': '/var/lib/hawa/media',
}
lines = []
for line in text.splitlines():
    key = line.split('=', 1)[0]
    lines.append(f'{key}={updates[key]}' if key in updates else line)
lines += ['SESSION_SECURE_COOKIE=true', 'LOG_LEVEL=warning']
p.write_text('\n'.join(lines) + '\n')
q = Path('/var/www/hawa/shared/frontend.env')
q.write_text(q.read_text().replace('HAWA_DOMAIN', domain))
PY
unset HAWA_DB_PASS
chown deploy:www-data /var/www/hawa/shared/backend.env /var/www/hawa/shared/frontend.env
chmod 640 /var/www/hawa/shared/backend.env /var/www/hawa/shared/frontend.env
ln -s /var/www/hawa/shared/backend.env "$RELEASE/backend/.env"
ln -s /var/www/hawa/shared/frontend.env "$RELEASE/.env"
mv "$RELEASE/backend/storage" "$RELEASE/backend/storage-bundled"
ln -s /var/www/hawa/shared/storage "$RELEASE/backend/storage"
chmod -R g+rwX "$RELEASE/backend/bootstrap/cache"
```

For two hostnames, include both in `server_name` and comma-separated `SANCTUM_STATEFUL_DOMAINS`, and obtain certificates for both. Prefer redirecting the extra hostname to the canonical domain so sessions do not change between hosts. Keep `SESSION_DOMAIN` empty for host-only cookies.

## 5. Install Laravel and create the administrator

```bash
su - deploy -c "cd '$RELEASE/backend' && composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction"
su - deploy -c "cd '$RELEASE/backend' && php artisan key:generate && php artisan migrate --seed --force"
su - deploy -c "cd '$RELEASE/backend' && php artisan hawa:admin-create"
su - deploy -c "cd '$RELEASE/backend' && php artisan config:cache && php artisan route:cache && php artisan view:cache"
```

Enter your administrator username and a password of at least 12 characters when prompted. This creates one administrator. Customers register through the website and require administrator approval. Populate products and categories through the admin interface or its spreadsheet import.

**Keep `APP_KEY` unchanged in subsequent deployments.** Changing it invalidates sessions and guest order access tokens.

## 6. Build and install Hawa's services

```bash
su - deploy -c "cd '$RELEASE' && npm ci && bash deploy/build-release.sh"
bash "$RELEASE/deploy/publish-static.sh"
install -m 644 "$RELEASE/deploy/hawa-next.service" /etc/systemd/system/hawa-next.service
install -m 644 "$RELEASE/deploy/hawa-fpm.conf" /etc/php/8.5/fpm/pool.d/hawa.conf
php-fpm8.5 -t
systemctl restart php8.5-fpm.service
install -m 644 "$RELEASE/deploy/hawa-next-proxy.conf" /etc/nginx/snippets/hawa-next-proxy.conf
sed "s/HAWA_DOMAIN/$HAWA_DOMAIN/g" "$RELEASE/deploy/nginx-hawa.conf" > /etc/nginx/sites-available/hawa
ln -s /etc/nginx/sites-available/hawa /etc/nginx/sites-enabled/hawa
nginx -t
systemctl daemon-reload
systemctl enable --now hawa-next.service
systemctl reload nginx
certbot --nginx -d "$HAWA_DOMAIN"
systemctl restart php8.5-fpm.service
```

Continue only after `npm run build` and `nginx -t` succeed. PHP-FPM is restarted to clear opcode caches after installing the new PHP source; the Next service has its own name and port.

## 7. Verify

```bash
systemctl status hawa-next.service php8.5-fpm.service --no-pager
curl -fsS http://127.0.0.1:8001/up
curl -I http://127.0.0.1:3100
curl -fsS "https://$HAWA_DOMAIN/api/products"
journalctl -u hawa-next.service -n 60 --no-pager
```

In the browser, verify:

Hawa has its own PHP-FPM pool and socket. Its upload and timeout limits do not change Zad Land's pool. Laravel still enforces its 5 MB image limit.

- `/admin/login` signs in on the first attempt; refreshing keeps the session.
- `/products` initially displays an empty catalog.
- Admin category/brand/product creation populates the storefront.
- Brand and product uploads display correctly and survive a service restart.
- A customer can register, be approved, and sign in on the first attempt.
- Guest prices are hidden; approved customers see prices.
- Orders reserve stock, retries do not duplicate orders, and cancellation restores stock.
- Logout and account disabling revoke access.

## Future updates from GitHub

Hawa’s GitHub repository is public, so the VPS can fetch source read-only over HTTPS. No GitHub token or write-enabled key is stored on the VPS. The deploy script downloads a specific `main` commit, builds a new release directory, runs Laravel migrations, publishes readable CSS/JS assets, and switches the `current` link after both applications are healthy. It restores the previous release if services do not restart or pass health checks. It does not export or replace the database or shared uploads.

The source, product import file, and deployment script must first be committed and pushed to GitHub. Since the live ZIP release does not contain the new Git deploy script yet, bootstrap it once from the public repository after this commit is pushed. Replace `<commit-sha>` with the commit printed by `git rev-parse --short HEAD`:

```bash
curl -fsSL "https://raw.githubusercontent.com/Moody0/Hawa/<commit-sha>/deploy/deploy-from-git.sh" -o /tmp/hawa-deploy-from-git.sh
bash /tmp/hawa-deploy-from-git.sh
rm /tmp/hawa-deploy-from-git.sh
```

That first run fetches the same commit into a release and installs the deploy script there. From then on, each update is a normal reviewed Git commit. After the commit reaches GitHub, connect to the VPS and run:

```bash
bash /var/www/hawa/current/deploy/deploy-from-git.sh
```

To deploy a different branch for a one-off release, set `HAWA_DEPLOY_BRANCH` before running the script:

```bash
HAWA_DEPLOY_BRANCH=branch-name bash /var/www/hawa/current/deploy/deploy-from-git.sh
```

Back up `hawa_backend`, `/var/www/hawa/shared`, and `/var/lib/hawa/media` before schema or media changes. Keep prior releases until the new version has been verified. Keep `APP_KEY`, database credentials, session cookie name, and shared media paths unchanged. Never run `key:generate` during an update. Shared hashed JavaScript assets retain chunks for visitors with an open page. Do not delete the running release’s `.next` directory.

Never run test migrations or concurrency tests against `hawa_backend`; use a separate database ending in `_test`.
