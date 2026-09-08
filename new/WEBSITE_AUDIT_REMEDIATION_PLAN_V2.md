# Hawa Website Remediation and Admin Dashboard Plan

This plan replaces the incomplete Phase 10 launch conclusion. Work proceeds in order: security and data integrity first, admin correctness second, UX/performance third, and genuine production verification last.

The admin investigation found additional issues: inconsistent authorization, fixed seed credentials, no admin-login throttling, an unsafe callback redirect, silently truncated lists, missing mobile navigation on blog/customers pages, inaccessible tables/modals, weak server validation, swallowed errors, and non-durable destructive actions.

## Phase 0 — Establish a truthful baseline

- [ ] Preserve existing user changes and record `git status --short`.
- [ ] Mark fabricated LCP, INP, CLS, WCAG, and launch-pass results in existing reports as invalid—not verified.
- [ ] Remove generated performance conclusions until genuine browser measurements replace them.
- [ ] Create an isolated PostgreSQL test database with migrations and deterministic fixtures.
- [ ] Add four test identities: super administrator, catalog administrator, sales administrator, and content administrator.
- [ ] Capture storefront and authenticated admin baselines at 390×844, 768×1024, and 1440×900.
- [ ] Record runtime console, page, network, image-proxy, and server-stream errors.

Exit gate: tests never use production data, and every current failure has reproducible evidence.

## Phase 1 — Resolve security and authorization blockers

### Storefront security

- [ ] Replace blog `dangerouslySetInnerHTML` rendering with `react-markdown` and `remark-gfm`; do not enable raw HTML.
- [ ] Sanitize existing stored posts during migration and validate future blog input.
- [ ] Centralize public product serialization in one price-projection function.
- [ ] Apply price projection to trending products, root legacy product routes, related products, RSC payloads, metadata, and every public API.
- [ ] Test that a guest cannot recover prices from HTML, JSON, RSC responses, cache entries, or API calls.

### Administrator authentication

- [ ] Remove fixed administrator passwords from all seed/import scripts.
- [ ] Require `ADMIN_SEED_USERNAME` and `ADMIN_SEED_PASSWORD`; refuse to seed production when either is absent.
- [ ] Never print passwords or password hashes.
- [ ] Rotate any deployed account created from historical defaults.
- [ ] Enforce 12–128-character administrator passwords.
- [ ] Replace the in-memory login limiter with a PostgreSQL-backed sliding-window limiter shared across instances.
- [ ] Apply IP and normalized-username throttles to administrator login.
- [ ] Restrict login `callbackUrl` to same-origin paths beginning with `/admin/`; otherwise use `/admin/dashboard`.
- [ ] Use `router.replace()` and `router.refresh()` after login instead of a full-page external-capable redirect.

### Granular RBAC

- [ ] Add a normalized `UserPermission` model backed by a typed `AdminPermission` enum.
- [ ] Define VIEW, MANAGE, and ARCHIVE permissions for products, brands, categories, main categories, banners, orders, customers, reviews, blog, and site content.
- [ ] Add separate `PRODUCTS_IMPORT` and `AUDIT_LOG_VIEW` permissions.
- [ ] Keep administrator/user-management and system-security configuration strictly `SUPER_ADMIN`.
- [ ] Migrate existing permissions conservatively: existing manage/delete fields map to equivalent resource permissions; customer permissions map from existing order permissions; review management maps to view/manage/archive; blog, main-category, and site-content permissions default false for non-super administrators.
- [ ] Enforce permissions independently in sidebar visibility, protected pages, route handlers, server actions, and upload/import endpoints.
- [ ] Require content permissions for every `/api/admin/blog` method.
- [ ] Require customer permissions for viewing PII, approving accounts, disabling accounts, and archiving customers.
- [ ] Return 401 for unauthenticated requests and 403 for authenticated users without permission.
- [ ] Never convert authorization/database failures into empty arrays or zero-valued dashboards.

Exit gate: the complete role matrix passes direct URL, API, and server-action tests.

## Phase 2 — Repair order, inventory, and archival integrity

- [ ] Correct `stockReserved`: true only for active pre-fulfilment states and false for `DELIVERED`, `COMPLETED`, and `CANCELLED`.
- [ ] Atomically claim reservations with a conditional order update before releasing inventory.
- [ ] Add a database uniqueness invariant preventing duplicate release movements for the same order/product/reservation.
- [ ] Set `stockReserved=false` when an order reaches a fulfilled terminal state.
- [ ] Prove simultaneous cancellation/archive requests restore inventory exactly once.
- [ ] Normalize idempotency keys, cap them at 128 characters, and reject malformed keys.
- [ ] Preserve the submitted key outside the error handler; on P2002, query with that value.
- [ ] Return an existing order only when the idempotency key and request hash match; otherwise return 409.
- [ ] Add `archivedAt` to admin-managed records and `disabledAt` to administrators.
- [ ] Archive orders, customers, products, catalog entities, banners, reviews, posts, and users by default.
- [ ] Never hard-delete orders or inventory movements through the dashboard.
- [ ] Require cancellation before archiving an active order.
- [ ] Permit permanent deletion only for unreferenced drafts through a super-admin-only advanced action with typed confirmation.
- [ ] Provide restore actions and exclude archived data from public queries and default admin lists.
- [ ] Add immutable `AdminAuditLog` records for security and administrative mutations.
- [ ] Initialize cart quantities from `minOrder`, including product cards and wholesale rows.
- [ ] Parse the first positive numeric value from packaging strings and store normalized package counts during updates/imports.
- [ ] Disable legacy static order tokens in production by default; allow temporary compatibility only through an explicit absolute cutoff date.

Exit gate: concurrency, idempotency, migration, archive/restore, and audit-log integration tests pass.

## Phase 3 — Make admin data management complete and scalable

- [ ] Replace client-only pagination with protected server-driven pagination for products, orders, customers, categories, reviews, and posts.
- [ ] Use `{ items, total, nextCursor, previousCursor }`, deterministic `(sortField, id)` ordering, and approved sort/filter fields.
- [ ] Debounce admin search by 250 ms, abort obsolete requests, and synchronize filters with the URL.
- [ ] Verify records beyond former hard limits remain reachable.
- [ ] Replace huge dropdowns with searchable, paginated comboboxes.
- [ ] Consolidate and bound dashboard aggregate queries; cache them for 15 seconds and invalidate after mutations.
- [ ] Show explicit loading, empty, permission-denied, and retryable-error states.
- [ ] Add shared Zod schemas for every admin mutation and route request, with stable error codes and field errors.
- [ ] Refactor oversized clients and modals into bounded feature components.
- [ ] Split site-content saving by section with dirty-state and navigation protection.
- [ ] Add bounded, idempotent server-side spreadsheet import preview, progress, and error reporting.
- [ ] Remove vulnerable `xlsx@0.18.5`; use the patched official SheetJS tarball with locked integrity.

Exit gate: seeded datasets larger than every previous limit remain fully searchable and operable.

## Phase 4 — Rebuild the admin UX as a clean operational interface

- [ ] Put the shared admin header and scroll container in the persistent dashboard shell.
- [ ] Ensure blog and customer pages have mobile navigation and independent vertical scrolling.
- [ ] Use restrained solid surfaces, borders, 8–12 px radii, and consistent spacing.
- [ ] Render task-oriented mobile cards while retaining desktop tables and visible primary actions.
- [ ] Use accessible sort buttons and correct `aria-sort`.
- [ ] Replace native `confirm()` with a shared accessible dialog with name, initial focus, trap, Escape, scroll lock, and focus restoration.
- [ ] Use typed confirmation only for permanent deletion.
- [ ] Add visible focus indicators, labels, descriptions, errors, required states, translated strings, correct RTL/LTR behavior, 44×44 touch targets, reduced-motion handling, reversible optimistic updates, and accessible live-region announcements.

Exit gate: super-admin and limited-admin journeys work by keyboard at all target viewports.

## Phase 5 — Finish storefront performance and platform hardening

- [ ] Restore form-control focus rings.
- [ ] Make animated sections visible without JavaScript and reveal immediately under reduced motion or observer failure.
- [ ] Add and verify a `pg_trgm` GIN search index at 10,000 and 100,000 representative products.
- [ ] Verify public caching never contains authenticated price projections.
- [ ] Centralize and validate phone, email, WhatsApp, and site-origin configuration.
- [ ] Make image proxy failures fast and bounded with a local fallback and streaming byte cap.
- [ ] Require an absolute persistent `MEDIA_STORAGE_DIR` in production; serve safe media with immutable caching, ETags, traversal protection, legacy URL compatibility, backup, and orphan cleanup.
- [ ] Remove `unsafe-eval` from production CSP; resolve report-only inline violations before enforcement and rate-limit CSP reports.
- [ ] Migrate `middleware.ts` to Next.js 16 `proxy.ts`.
- [ ] Remove fabricated `.next/BUILD_ID` behavior; tests fail without a valid build.

Exit gate: no blank reveal states, price leaks, CSP errors, broken media, or deprecated proxy warnings.

## Phase 6 — Replace simulated monitoring with production telemetry

- [ ] Integrate Sentry for Next.js client, server, and edge runtimes.
- [ ] Remove process-local monitoring and the public monitoring-statistics GET endpoint.
- [ ] Send Web Vitals through a standards-based integration, labeling field data only after aggregation.
- [ ] Scrub request bodies, credentials, cookies, PII, queries, cart contents, and tokens; use hashed identifiers only when needed.
- [ ] Record structured security, order, stock, cache, image-proxy, and 5xx events.
- [ ] Configure documented alert ownership/escalation, 100% errors, 10% performance initially, and no session replay without privacy review.

Exit gate: test events reach Sentry, privacy tests pass, and alert delivery is confirmed.

## Phase 7 — Build truthful automated release gates

- [ ] Replace simulated performance scripts with real browser/Lighthouse measurements.
- [ ] Report mobile/desktop LCP and CLS from three cold runs as median and range; never label lab interaction latency as field INP.
- [ ] Measure real-link warm navigation and concurrent API p95.
- [ ] Add Axe to representative public/admin routes plus 200% zoom, overflow, focus, reduced motion, dialog, labels, and announcements checks.
- [ ] Fail Playwright on unexpected page, console, 5xx, stream, or essential-image errors; remove conditional skips.
- [ ] Assert real results and state restoration across storefront and admin projects.
- [ ] Add a disposable migrated PostgreSQL service and real concurrency suite to CI; never use production data.
- [ ] Gate on schema validation, typecheck, lint, unit, integration, concurrency, accessibility, E2E, smoke, production build, and dependency audit.
- [ ] Require zero ESLint warnings/errors and zero high/critical production dependency vulnerabilities.
- [ ] Update reports only from generated evidence.

## Interfaces and schema changes

- `UserPermission(userId, permission)` with a unique compound key.
- Typed `AdminPermission` enum covering resource permissions, `PRODUCTS_IMPORT`, and `AUDIT_LOG_VIEW`.
- `AdminAuditLog(id, actorId, action, entityType, entityId, metadata, createdAt)`.
- Persistent administrator login-throttle records keyed by hashed IP and normalized username.
- `archivedAt` on operational/admin-managed entities; `disabledAt` on administrators.
- Unique inventory-release constraint.
- Admin list request: `{ cursor?, limit?, search?, sort?, direction?, filters? }`.
- Admin list response: `{ items, total, nextCursor, previousCursor }`.
- Mutation response: `{ ok: true, data?, auditId? } | { ok: false, code, message?, fieldErrors? }`.
- Upload response: `{ url, key, width, height, bytes, mimeType }`.
- Validated, safely replayed stable order idempotency key.

## Acceptance criteria

- Guest price exposure: no wholesale values in public HTML, JSON, RSC, cache, metadata, or APIs.
- Inventory: 20 concurrent final-unit orders create exactly one reservation.
- Cancellation: 10 simultaneous requests create one release movement and restore stock once.
- Admin RBAC covers every page, API, action, import, upload, archive, and forbidden role.
- Records beyond 100 products and 50 orders/customers remain reachable/searchable.
- Accessibility: zero serious/critical Axe violations plus manual keyboard, zoom, RTL/LTR, and screen-reader checks.
- Performance: mobile LCP median ≤2.5 s; CLS ≤0.10; warm navigation median ≤500 ms; catalog API p95 ≤400 ms; search API p95 ≤500 ms; field INP p75 remains pending until sufficient RUM exists.
- Reliability: no unexpected browser/server errors across the complete journey matrix.
- Security: zero high/critical production advisories, no fixed credentials, and passing telemetry privacy tests.
- Rollout: backup, additive migration, RBAC backfill, credential rotation, media backup, staged CSP enforcement, and rollback documentation.

## Locked decisions

- Zero product prices are intentional, but wholesale prices must remain unavailable to guests.
- Admin permissions are granular; operational records archive by default.
- Sentry is the managed monitoring provider.
- Media remains on a persistent single-server local filesystem outside release directories.
- Phase 0 must create isolated test accounts so authenticated admin rendering becomes mandatory.
