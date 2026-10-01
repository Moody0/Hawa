#!/usr/bin/env bash
set -euo pipefail

BASE=/var/www/hawa
SHARED="$BASE/shared"
RELEASES="$BASE/releases"
CURRENT="$BASE/current"
REPO="$SHARED/hawa.git"
REMOTE=https://github.com/Moody0/Hawa.git
BRANCH="${HAWA_DEPLOY_BRANCH:-main}"

if [ "$(id -u)" -ne 0 ]; then
    echo "Run this deploy script as root." >&2
    exit 1
fi
git check-ref-format --branch "$BRANCH" >/dev/null
for command in git tar composer npm php curl flock; do
    command -v "$command" >/dev/null || { echo "Missing required command: $command" >&2; exit 1; }
done
test -L "$CURRENT" || { echo "Hawa's current release link is missing." >&2; exit 1; }
PREVIOUS="$(readlink -f "$CURRENT")"
case "$PREVIOUS" in "$RELEASES"/*) ;; *) echo "Current release points outside Hawa's releases." >&2; exit 1 ;; esac

exec 9>/run/lock/hawa-git-deploy.lock
flock -n 9 || { echo "Another Hawa deployment is running." >&2; exit 1; }
install -d -o deploy -g www-data "$SHARED" "$RELEASES"
if [ ! -d "$REPO/objects" ]; then
    install -d -o deploy -g www-data "$REPO"
    runuser -u deploy -- git --git-dir="$REPO" init --bare --quiet
    runuser -u deploy -- git --git-dir="$REPO" remote add origin "$REMOTE"
fi
runuser -u deploy -- git --git-dir="$REPO" fetch --quiet --prune origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH"
COMMIT="$(git --git-dir="$REPO" rev-parse --verify "refs/remotes/origin/$BRANCH^{commit}")"

RELEASE="$RELEASES/$(date -u +%Y%m%d-%H%M%S)-${COMMIT:0:8}"
if [ -e "$RELEASE" ]; then
    echo "Release path already exists; stopping." >&2
    exit 1
fi
install -d -o deploy -g www-data "$RELEASE"
git --git-dir="$REPO" archive "$COMMIT" | tar -x -C "$RELEASE"
chown -R deploy:www-data "$RELEASE"
test -f "$RELEASE/backend/app/Console/Commands/ImportCatalog.php"
test -f "$RELEASE/backend/database/imports/hawa-products.json"

ln -s /var/www/hawa/shared/backend.env "$RELEASE/backend/.env"
ln -s /var/www/hawa/shared/frontend.env "$RELEASE/.env"
mv "$RELEASE/backend/storage" "$RELEASE/backend/storage-bundled"
ln -s /var/www/hawa/shared/storage "$RELEASE/backend/storage"
chmod -R g+rwX "$RELEASE/backend/bootstrap/cache"

su - deploy -c "cd '$RELEASE/backend' && composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction && php artisan migrate --seed --force && php artisan config:cache && php artisan route:cache && php artisan view:cache"
su - deploy -c "cd '$RELEASE' && npm ci && bash deploy/build-release.sh"
bash "$RELEASE/deploy/publish-static.sh"

NEXT_LINK="$BASE/current.next.$$"
ln -s "$RELEASE" "$NEXT_LINK"
mv -Tf "$NEXT_LINK" "$CURRENT"
if ! systemctl restart php8.5-fpm.service hawa-next.service; then
    ln -s "$PREVIOUS" "$NEXT_LINK"
    mv -Tf "$NEXT_LINK" "$CURRENT"
    systemctl restart php8.5-fpm.service hawa-next.service || true
    echo "Service restart failed. Restored the previous release." >&2
    exit 1
fi

READY=0
for _ in $(seq 1 45); do
    if curl -fsS http://127.0.0.1:8001/up >/dev/null && curl -fsSI http://127.0.0.1:3100 >/dev/null; then
        READY=1
        break
    fi
    sleep 1
done
if [ "$READY" -ne 1 ]; then
    ln -s "$PREVIOUS" "$NEXT_LINK"
    mv -Tf "$NEXT_LINK" "$CURRENT"
    systemctl restart php8.5-fpm.service hawa-next.service || true
    echo "Health checks failed. Restored the previous release." >&2
    exit 1
fi

echo "Hawa deployed commit ${COMMIT:0:8} to $RELEASE"
systemctl status hawa-next.service --no-pager
