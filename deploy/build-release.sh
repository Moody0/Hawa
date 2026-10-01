#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")/.."

# Turbopack must not follow Laravel's storage link outside the release directory.
storage="$PWD/backend/storage"
storage_target=""
if [ -L "$storage" ]; then
    storage_target="$(readlink "$storage")"
    if [ "$storage_target" != "/var/www/hawa/shared/storage" ]; then
        echo "Unexpected backend storage link; refusing to alter it." >&2
        exit 1
    fi
    unlink "$storage"
    restore_storage() { ln -s "$storage_target" "$storage"; }
    trap restore_storage EXIT
fi
npm run build
