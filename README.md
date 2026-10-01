# Hawa

Hawa's existing Next.js website and administrator interface use an independent Laravel 13 API and MySQL database named `hawa_backend`.

## Local development

1. Install Node.js 22+, PHP 8.3+ with PDO MySQL, GD/WebP, EXIF and mbstring, Composer 2, and MySQL 8.4.
2. Follow [backend setup](backend/README.md) to create Hawa's database, configure `backend/.env`, run migrations, and create the initial administrator through the secure command.
3. Run `npm ci`, copy `.env.example` to `.env`, and set `LARAVEL_API_URL` to the local Laravel URL.
4. Start Laravel on `127.0.0.1:8001` and run `npm run dev` from this directory.

No Supabase records, Zad Land records, demo products, or customers are seeded. Populate the catalog through the administrator interface or spreadsheet import. Merchant accounts require administrator approval.

## Verification

See [AUDIT_REPORT.md](AUDIT_REPORT.md) for the completed website audit, administrator controls, verification results, and deployment status.

```text
npm run typecheck
npm run test:run
npm run build
cd backend
php artisan test
```

Backend tests require a separate MySQL database ending in `_test` and rebuild its contents. Never run them against the application database. See [backend/README.md](backend/README.md) for test configuration.

The frontend proxies same-origin APIs, Sanctum CSRF requests, and uploaded media to Laravel. Administrators and customers use separate guards inside the Hawa-specific session cookie. Laravel owns validation, authorization, image processing, and order/inventory transactions.

## Deployment

Use [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) and the regenerated `Hawa-vps-deploy.zip`. Dependencies and production builds are generated on Linux. Shared uploads, environment files, and session storage persist outside release directories.
