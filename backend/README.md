# Hawa Laravel backend

Independent Laravel 13 / MySQL backend. Hawa does not use Zad Land's database, credentials, accounts, or uploads. The frontend remains Next.js and retains its existing URLs and interface.

## Local setup

1. Install PHP 8.3 or later with PDO MySQL, GD (WebP), EXIF, mbstring, XML, curl, and zip; install Composer and MySQL 8.4.
2. Create an empty `hawa_backend` database and a user restricted to that database.
3. Copy `.env.example` to `.env`; enter your independent MySQL credentials.
4. Run `composer install`, `php artisan key:generate`, and `php artisan migrate --seed`.
5. Run `php artisan hawa:admin-create` and enter the administrator username and password at the prompts. No password is passed on the command line or stored in source.
6. Start `php artisan serve --host=127.0.0.1 --port=8001` and the frontend using `npm run dev` from Hawa's root.

The seeder initializes only site settings. It does not create administrators, products, customers, orders, or blog posts. Existing Supabase records are not imported.

## Authentication and uploads

The `web` administrator guard and `merchant` customer guard use Laravel sessions in the `hawa_session` cookie. Sanctum validates same-origin CSRF tokens. The browser obtains `/sanctum/csrf-cookie` before mutations; both login flows verify `/auth/me` before redirecting. Logging out one guard preserves the other. Archived, disabled, expired, and password-revoked accounts are checked on subsequent requests.

Set `SANCTUM_STATEFUL_DOMAINS` to the frontend hostname (and port during development). Set `SESSION_SECURE_COOKIE=true` in production. Do not use wildcard stateful domains.

Images are validated and processed in Laravel: JPG/PNG/WebP, maximum 5 MB and 4096 pixels per dimension, EXIF orientation correction, maximum output dimension 2560, WebP encoding, and resource-specific administrator permissions. Set `MEDIA_STORAGE_DIR` to a persistent directory outside application releases. New media is served at `/uploads/`; bundled frontend assets remain in `public`.

## Tests

Create an empty **dedicated** `hawa_backend_test` database and copy `.env.example` to `.env.testing`. Set `APP_ENV=testing`, a test-only `APP_KEY`, and test database credentials. Run `php artisan test`.

Tests refuse to run migrations against a database without the `_test` suffix. They rebuild/truncate the test database, so it must contain no data you need. The concurrency tests run six independent PHP processes against MySQL and verify that stock cannot be oversold and duplicate submissions create only one order.

## API boundary

- Public catalog, navigation, content, settings, contact, reviews, and orders: `/api/...`.
- Customer registration, sessions, profile, wishlist, and orders: `/api/customer/...`.
- Administrator sessions, catalog CRUD/imports, content, settings, customers, users, permissions, messages, reviews, orders, and audit logs: `/api/admin/...`.
- Public responses remove wholesale prices for guests and products marked `hidePrice`. Personalized responses use `private, no-store`.
- Money is stored as MySQL `DECIMAL(10,2)` and calculated in integer cents. The API converts decimals to frontend-compatible numeric values.
- Product row locks reserve stock atomically; idempotency keys protect order creation; cancellation releases reserved stock once. Archived products remain available as references within historical orders.

See the root `VPS_DEPLOYMENT.md` for production setup.
