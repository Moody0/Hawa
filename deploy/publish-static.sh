#!/usr/bin/env bash
set -euo pipefail
release="$(dirname "$(readlink -f "$0")")/.."
static=/var/www/hawa/shared/next-static
test -d "$release/.next/static"
install -d -o deploy -g www-data -m 755 "$static"
cp -a "$release/.next/static/." "$static/"
chown -R deploy:www-data "$static"
# Nginx must be able to traverse every directory and read CSS, JS and fonts.
find "$static" -type d -exec chmod 755 {} +
find "$static" -type f -exec chmod 644 {} +
