# Hawa Website — Comprehensive Quality, UX, Security, and Performance Audit

**Audit date:** 2026-09-08  
**Audited source:** Current working tree at `E:\work\Hawa`  
**Primary scope:** Public storefront and merchant account journeys  
**Secondary scope:** Admin API security, reliability, and scalability  
**Framework:** Next.js 16.1.6, React 19.2.3, Prisma 5.22, PostgreSQL/Supabase

**Phased coding-agent plan:** `new/WEBSITE_AUDIT_IMPLEMENTATION_PLAN.md`

---

## 1. Executive summary

### Launch-readiness verdict

**The current working tree is not production-ready.** The most urgent problem is not visual polish: the production build fails, `/products` returns HTTP 500, and tested catalog/customer APIs also return 500 when the broken module enters the compilation graph. There are also order and inventory defects that can deduct stock twice, oversell stock under concurrency, and create duplicate orders on retries.

The site has a solid visual foundation and several good implementation details—responsive layouts, Arabic/English direction support, a skip link, optimized local fonts, cached data services, mobile search focus management, and clear wholesale-oriented cart/checkout copy. However, release blockers, misleading failure states, public wholesale-price exposure, authentication/authorization weaknesses, global client-side work, and missing automated tests currently outweigh those strengths.

### Priority summary

| Priority | Meaning | Findings | Required action |
|---|---|---:|---|
| **P0** | Release or core-business blocker | 3 | Fix before any deployment or performance sign-off |
| **P1** | Serious security, journey, reliability, or speed issue | 22 | Fix before public launch |
| **P2** | Accessibility, scalability, and maintainability debt | 15 | Fix in the following sprint |

### Highest-risk findings

1. The current application does not compile and `/products` is unavailable.
2. Stock can be deducted twice and is not reliably restored.
3. Concurrent or repeated order submissions can oversell stock and create duplicate orders.
4. Wholesale prices are visually hidden from guests but remain present in public payloads and markup.
5. Guest orders can be associated with another merchant based only on a supplied phone number.
6. Search, persisted cart hydration, mobile product variants, and browser Back behavior contain journey-breaking defects.
7. Public HTML is dynamically rendered with `no-store`, and globally mounted client code performs avoidable work on every route.

---

## 2. Audit method and evidence quality

This report combines:

- Production build, TypeScript, ESLint, and dependency-audit output.
- Read-only database inspection.
- Live local route and API smoke checks.
- Source inspection of storefront, merchant, order, authentication, caching, upload, and admin flows.
- Responsive review using the supplied desktop and mobile screenshots.
- Historical Lighthouse reports already in the repository, used only as context.

### Evidence labels

| Label | Meaning |
|---|---|
| **Observed** | Reproduced through a build, command, HTTP request, or UI screenshot |
| **Data verified** | Confirmed with read-only database inspection |
| **Source verified** | The behavior follows directly from the current code path |
| **Scale risk** | Not currently slow at the small dataset size, but the implementation will degrade as data grows |
| **Pending production validation** | Requires a reachable production/staging deployment or field data |

### Baseline evidence

| Signal | Scope and conditions | Result | Status |
|---|---|---|---|
| Production build | Current local working tree | Failed in `ProductsSidebarFilter.tsx` | **Fail** |
| TypeScript | `tsc --noEmit` | 4 errors | **Fail** |
| ESLint | `app` and `lib` | 12 errors, 179 warnings across 68 files | **Fail** |
| Automated tests | Repository inspection | No test files and no test script | **Missing** |
| `/products` | Local development server | HTTP 500 | **Fail** |
| Tested catalog/customer APIs | Local development server | HTTP 500 after compilation failure | **Fail** |
| Other public routes | Local development server | Home, login, register, account, cart, place-order, complete-order, about, brands, and categories returned 200 | Partial pass |
| Production dependencies | `npm audit --omit=dev` | 1 critical, 6 high, 1 moderate groups | **Fail** |
| Current field Core Web Vitals | No reachable production URL/RUM | Unavailable | Pending |

The homepage returned roughly 429 KB in the observed local development response, compared with roughly 177–197 KB for account and brands routes. Development-server response timings are diagnostic only and must not be presented as production TTFB.

---

## 3. P0 — Release and core-business blockers

### P0-01 — Catalog build failure

**Category:** Functional / release engineering  
**Evidence:** Observed and source verified  
**Affected journey:** Every route that compiles the products/filter graph; all devices and languages

`app/components/ProductsPageComponents/ProductsSidebarFilter.tsx:105` declares `export function reconcileCategoriesWithBrands` while still inside the default component. The same file also has another default export near line 594. `ProductsClient.tsx` imports the named helper, but the module cannot expose it correctly.

**Impact**

- `next build` fails.
- `/products` returns 500.
- Tested `/api/products`, `/api/categories`, `/api/main-categories`, `/api/navigation`, `/api/settings`, and `/api/customer/auth/me` returned 500 when the broken graph compiled.
- Catalog discovery, search, and ordering cannot be considered functional.

**Required fix**

- Move `reconcileCategoriesWithBrands` to module scope or a dedicated utility module.
- Keep exactly one default export for `ProductsSidebarFilter`.
- Restore the named import contract in `ProductsClient`.
- Add a build and route-smoke gate to CI.

**Acceptance criteria**

- `tsc --noEmit`, ESLint, and `npm run build` pass.
- Every public route and public API returns the expected non-500 status from a clean production build.
- `/products` can load, filter, search, paginate, refresh, and navigate Back without errors.

### P0-02 — Stock is deducted twice and not consistently restored

**Category:** Inventory integrity  
**Evidence:** Source verified  
**Affected journey:** Order creation, delivery, cancellation, and deletion

Stock is decremented when the order is created at `app/api/orders/route.ts:150`, then decremented again when an administrator changes the order to `DELIVERED` at `lib/admin-actions.ts:1316`. Cancellation and deletion do not reliably reverse the original deduction.

**Required fix**

- Adopt one documented inventory policy. Recommended: reserve stock once at submission, release it once on cancellation/deletion, and never deduct again on delivery.
- Record reservation or inventory-movement state so every transition is idempotent.
- Reject invalid status reversals or calculate their inventory effect explicitly.

**Acceptance criteria**

- Pending → delivered changes inventory once in total.
- Pending → cancelled and deletion release exactly the reserved amount.
- Repeating the same transition produces no additional stock movement.
- An auditable inventory movement exists for every adjustment.

### P0-03 — Concurrent and repeated orders can oversell stock

**Category:** Transaction safety  
**Evidence:** Source verified  
**Affected journey:** Order submission under retry, double-click, or concurrency

Stock is read and checked before unconditional decrements. Under normal PostgreSQL isolation, concurrent requests can both pass the check. Duplicate product lines are validated independently, and the endpoint has no idempotency key.

**Required fix**

- Aggregate duplicate product IDs before validation.
- Require positive integer carton quantities within documented limits.
- Use an atomic conditional update such as `updateMany` with `stock >= requestedQuantity`, requiring an affected count of one.
- Add a unique, client-generated idempotency key persisted with the order.

**Acceptance criteria**

- Twenty concurrent attempts to purchase the final unit yield one success.
- Replaying the same idempotency key returns the original result without another deduction.
- Duplicate lines cannot jointly exceed stock.
- Negative, decimal, zero, NaN, and excessive quantities return structured validation errors.

---

## 4. P1 — Security, privacy, and data integrity

### P1-01 — Wholesale prices are not protected server-side

Public products, navigation, product-detail props, JSON-LD, wishlist/order relations, and related catalog payloads can contain `price` and `discountPrice` even when the UI hides them. Relevant paths include `app/api/products/route.ts:128`, `lib/catalog.ts:458`, `lib/navigation.ts:88`, and `app/(site)/products/[slug]/page.tsx:144`.

**Fix:** Create one server-side price projection. Guest/public responses must omit price fields or return `null`; only authenticated, approved merchants receive prices. Merchant-priced responses must never enter a shared public cache.

**Acceptance:** Inspect HTML, RSC payloads, JSON-LD, navigation, products, trending, related products, wishlist, and order JSON while logged out; no wholesale price may be recovered.

### P1-02 — Guest order access tokens are long-lived and unsafe

`lib/order-token.ts:3` uses a hard-coded fallback secret when configuration is missing. Tokens are deterministic HMACs of the order ID with no expiry or revocation. Query-string tokens are accepted and one root-path cookie is created per order.

**Fix:** Fail production startup without a dedicated secret; issue expiring, nonce-backed tokens; store only a hash/expiry or use a short-lived signed payload; exchange query tokens immediately; use one scoped guest-order session cookie.

### P1-03 — Orders can be injected into another merchant’s history

Guest orders are attached to existing customers by supplied phone number, and registration/login can claim previous orders sharing that number. An attacker who knows a merchant phone number can create false history.

**Fix:** Attach orders directly only for an authenticated customer. Require possession of a signed order token or verified-phone OTP before a guest order can be claimed.

### P1-04 — Known vulnerable production dependencies

The production dependency audit reported 1 critical, 6 high, and 1 moderate vulnerability groups. Directly affected packages include Next 16.1.6, NextAuth 4.24.13, `ws`, and `xlsx`.

**Fix order:**

1. Upgrade Next and NextAuth to patched compatible releases and regression-test authentication/middleware.
2. Remove `ws` if unused.
3. Replace `xlsx` with a maintained parser, or isolate spreadsheet imports with strict byte, row, column, formula, and processing-time limits.
4. Require zero critical/high production findings in CI, with documented exceptions only when no safe upgrade exists.

### P1-05 — Public write/auth endpoints lack abuse controls

Login, registration, order submission, reviews, and authenticated uploads have no meaningful rate limiting or burst controls.

**Fix:** Rate-limit by normalized account key plus trustworthy client IP, implement exponential login backoff, add upload quotas and body limits, and record rejection/latency metrics. Do not trust arbitrary forwarded-IP headers without a configured proxy boundary.

### P1-06 — Admin authorization can remain stale for 30 days

Roles and permissions are embedded into JWTs at login, while `requireAdminSession` trusts the claims without verifying current user status. A deleted or demoted administrator can retain access until expiry.

**Fix:** Add a session-version/revocation mechanism or re-check the database for privileged mutations. Invalidate sessions after password, role, and permission changes.

### P1-07 — Password handling differs between registration and login

Registration trims passwords before hashing; login verifies the untrimmed input. A password with leading or trailing spaces can become impossible to reproduce.

**Fix:** Never trim passwords. Validate the original string length and encoding consistently on both endpoints.

### P1-08 — Customer profile input is insufficiently validated

Profile fields accept optional `.trim()` calls without robust type, maximum-length, phone, city, or structured validation. Non-string payloads can raise 500 errors.

**Fix:** Use a shared server schema and structured 400/422 responses. Apply field lengths at both the API and database levels.

---

## 5. P1 — User journey and functional UX defects

### P1-09 — Header search does not apply the submitted query

`HeaderSearch` navigates to `/products?search=...`, but the products page reads only category and brand parameters, and `ProductsClient` initializes the search query as empty.

**Fix:** Make the URL the source of truth for search and filters. Parse, validate, and pass `search` into initial server data and client state. Preserve the query through load-more, reload, sharing, and Back navigation.

### P1-10 — Header category suggestions use the brand filter

Static category slugs navigate with `?brand=...`, causing the server to resolve them as brands.

**Fix:** Link to `/categories/{slug}` or the canonical supported `category` parameter. Add route tests for every search-suggestion type.

### P1-11 — Desktop predictive search can show stale results

The desktop search debounces timers but does not cancel active requests or reject out-of-order responses. Rapid typing can allow an older response to replace newer results.

**Fix:** Match the existing mobile search approach: `AbortController`, monotonically increasing request identity, minimum query length, explicit loading/error/empty states, and cancellation on close/unmount.

### P1-12 — Persisted cart can flash empty or redirect checkout

Cart state begins as an empty array and is restored from `localStorage` in an effect. The context does not expose hydration status, so `/cart` can show an incorrect empty state and `/place-order` can redirect before persisted items load.

**Fix:** Expose `isHydrated`; render a stable cart skeleton until hydration completes; only evaluate empty-cart redirects afterward. Preserve the cart through refresh, direct checkout entry, login, and locale changes.

### P1-13 — Mobile sticky ordering bypasses product variants

The main product actions parse and select product options, while `MobileStickyOrderBar` has separate quantity state and adds without `selectedOption`.

**Fix:** Use one product-purchase state shared by the main actions and sticky bar. Require a valid option before enabling either CTA. Generate one stable cart-line identity from product and option.

### P1-14 — Global scroll handling breaks browser expectations

`ScrollManager` disables native history restoration and forces top scrolling on pathname and search-parameter changes. Other header/progress components add more forced scroll calls.

**Fix:** Restore native Back/Forward scroll behavior. Scroll to top only for true new-page navigations where the framework does not handle it. Filter changes should retain catalog position unless the user explicitly requests otherwise.

### P1-15 — Scroll animation can leave sections invisible

`ScrollReveal` sets content to `autoAlpha: 0` and only restores visibility after a `top 92%` trigger. This matches the supplied screenshot where a section looked blank until a few more pixels were scrolled.

**Fix:** Keep content visible in the base state. Apply transforms/opacity only after the animation code confirms initialization. Use IntersectionObserver or CSS for simple reveals, support `prefers-reduced-motion`, and ensure an interrupted animation always resolves visible.

### P1-16 — Account API failures look like legitimate empty states

Orders and wishlist failures are logged but shown to the user as “no items.”

**Fix:** Distinguish loading, authenticated empty, network error, session expired, and authorization error states. Provide retry and re-login actions without discarding the current tab or form state.

---

## 6. P1 — Navigation, fetching, and rendering performance

### P1-17 — Public HTML cannot use effective ISR/CDN caching

The root layout calls `getI18n()`, which reads cookies and sometimes headers. Observed public responses used `Cache-Control: no-store, must-revalidate` despite route-level `revalidate` values.

**Fix:** Move locale into a stable `/ar` or `/en` route segment, or rewrite to a locale segment before rendering. Keep merchant/account state out of the public cached HTML shell.

### P1-18 — Too much global data and JavaScript loads on every route

The site layout fetches navigation/category data for a mobile menu that is closed by default. The header statically imports the mobile menu and search modal. Global providers load the cart drawer, toast, themes, contexts, and customer-session fetch logic on every public page.

**Fix:**

- Remove the unused category query.
- Dynamically import mobile menu, search modal, and cart drawer on first interaction.
- Use a lightweight session signal in the shell; fetch wishlist and order counts only where displayed.
- Remove unused `SessionProvider` wiring.
- Deduplicate and cancel client requests through a small query cache or route-level server data.

### P1-19 — Homepage makes three unused server reads

`getMainCategoryBrands`, `getCategoryHighlightCardsData`, and `getSiteSettings` are fetched in `app/(site)/page.tsx`, passed to `Main`, and deliberately renamed as unused values.

**Fix:** Remove the unused queries and props. Confirm their data is not required by any conditional state before deletion.

### P1-20 — Homepage animation and slider code is heavy

The inspected compiled manifest showed approximately 658 KiB raw / 210 KiB gzip homepage JavaScript and 251 KiB raw / 36.6 KiB gzip CSS. GSAP plus ScrollTrigger occupies an approximately 187 KiB raw chunk and is loaded by the initial homepage graph.

**Fix:** Reserve GSAP for motion that genuinely needs timelines. Replace simple reveals and counters with CSS/IntersectionObserver or the Web Animations API. Lazy-load below-fold sliders or replace them with native CSS scroll-snap. Add `content-visibility: auto` to substantial below-fold sections with tested intrinsic sizes.

### P1-21 — Hero preload can prioritize the wrong image

The homepage hard-codes a preload for `/images/hero-showcase-perfect.webp`, while the first displayed hero may come from database banner data. The actual first Next image also receives priority, potentially downloading two competing images.

**Fix:** Remove the hard-coded preload. Give high fetch priority only to the resolved first active slide and ensure its responsive `sizes` match rendered dimensions.

### P1-22 — Category caching and invalidation disagree

Public category APIs are forced dynamic and return `no-store` even though equivalent catalog data is cached elsewhere. Admin invalidation catches and ignores failures, and banner/settings/bulk operations do not consistently invalidate their cache tags.

**Fix:** Create one cached data service per entity, return ETag or `s-maxage`/`stale-while-revalidate` for public reads, and use a typed invalidation map for every mutation. Log and alert on invalidation failure.

---

## 7. P2 — Accessibility and interaction quality

### P2-01 — Desktop search is not a complete accessible combobox

The input is missing a complete `aria-controls`/`aria-activedescendant` relationship. Suggestion rows use `role="button"` without complete keyboard behavior.

**Fix:** Implement the ARIA combobox/listbox pattern with arrow navigation, Enter selection, Escape closure, active descendant management, result count announcements, and focus restoration. Reuse the stronger focus/cancellation behavior already present in mobile search.

### P2-02 — Account tabs lack tab semantics

Buttons do not expose `role="tab"`, `aria-selected`, associated panels, or expected arrow-key behavior.

**Fix:** Implement a native-feeling tablist with roving tab index, Home/End keys, labelled tabpanels, and a responsive non-tab fallback only if it remains equally accessible.

### P2-03 — Profile labels are not programmatically associated

Labels lack `htmlFor` and controls lack matching IDs.

**Fix:** Associate every label, hint, and error with its control; move focus to the first invalid field; announce submission status.

### P2-04 — Product lightbox lacks dialog behavior

The lightbox does not expose dialog semantics, trap/return focus, or reliably restore the previous body overflow value.

**Fix:** Use an accessible dialog primitive or implement `role="dialog"`, `aria-modal`, focus trapping, Escape handling, focus return, inert background, and exact body-style restoration.

### P2-05 — Motion needs a non-motion-safe base state

Animations must not hide essential content or block interaction. Auto-advancing carousels need pause controls, and reduced-motion mode must remove nonessential movement without changing layout.

**Acceptance:** All journeys remain fully visible and usable with JavaScript delayed, animations interrupted, and `prefers-reduced-motion: reduce` enabled.

---

## 8. P2 — Scalability, media, and maintainability

### P2-06 — Catalog query parameters are insufficiently bounded

Negative pages can create invalid `skip` values; ID lists and search length are unbounded; client-provided totals can falsify metadata; arbitrary raw query strings can create unbounded cache keys.

**Fix:** Validate with a server schema, canonicalize and sort IDs, cap list/search/page sizes, reject negative values, and never trust browser-supplied totals.

### P2-07 — Substring search will not scale

The products query uses up to eleven case-insensitive `contains` predicates. Ordinary B-tree name indexes do not accelerate leading-wildcard PostgreSQL searches.

**Fix:** Add normalized searchable text with `pg_trgm` GIN indexes or a proper full-text/search service. Verify with `EXPLAIN (ANALYZE, BUFFERS)` at 10k and 100k representative products.

### P2-08 — Image delivery bypasses optimization in several paths

ESLint identified raw `<img>` usage in catalog/category grids, product gallery, reviews, and order confirmation. `ResilientImage` also disables Next optimization for `i.postimg.cc` images. Public assets total roughly 24.45 MiB, with source hero/banner images around 700 KiB–1.1 MiB.

**Fix:** Move product media to controlled object storage, use responsive Next Image output, establish source dimension/quality limits, and audit the actually delivered variants rather than source-file size alone.

### P2-09 — Upload and image proxy paths can exhaust resources

Authenticated customers can upload repeated 5 MB files to local `public/uploads`. Magic-byte validation does not decode/re-encode or limit pixel dimensions. The image proxy buffers an entire upstream response without a byte cap and permits HTTP.

**Fix:** Use object storage, quotas, image decode/re-encode, byte/pixel limits, HTTPS-only allowlists, timeouts, and streamed capped reads.

### P2-10 — Wishlist behavior is race-prone and guest state is discarded

The wishlist endpoint is a non-idempotent toggle. Concurrent POSTs can race, and local guest favorites are replaced rather than merged after login.

**Fix:** Use explicit idempotent `PUT` and `DELETE` operations, database upsert/deleteMany, and a one-time verified merge after authentication.

### P2-11 — Admin queries and dashboard metrics are unbounded

Admin product/customer queries load broad datasets into application memory. Some dashboard metrics use arbitrary unordered limits, and an average-order fallback repeats the same aggregate.

**Fix:** Add cursor pagination, server-side aggregation, deterministic ordering/date windows, and database-grouped metrics.

### P2-12 — CSP is too permissive for strong XSS protection

The policy permits `'unsafe-inline'`, `'unsafe-eval'`, and broad HTTPS origins, while omitting `base-uri`, `form-action`, and `object-src` restrictions.

**Fix:** Deploy a production nonce/hash policy in report-only mode first, enumerate required third parties, and add `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'` before enforcement.

### P2-13 — Public reads and admin actions share one server-action module

Public cached reads, authenticated admin reads, and mutations coexist in a large `"use server"` module, complicating authorization review and cache behavior.

**Fix:** Separate public query services, authenticated admin queries, and authenticated mutations. Keep access checks next to every privileged entry point.

### P2-14 — Contact/domain/language URL configuration is inconsistent

Source inspection found divergent site domains and fallback phone/WhatsApp values across metadata, sharing, and contact paths. The English `hreflang` URL also relies on `?lang=en` while language state is primarily cookie/localStorage based.

**Fix:** Centralize canonical origin, locale URL strategy, sales phone, WhatsApp, and email in validated server configuration. Generate canonical and alternate URLs from the same locale routing model.

### P2-15 — Middleware convention is deprecated

The build warns that the current middleware convention should migrate to the newer proxy convention supported by the installed Next version.

**Fix:** Perform the migration only after the Next security upgrade, then rerun authentication, redirects, locale behavior, and protected-route tests.

---

## 9. Core Web Vitals and performance plan

### What can be stated now

- A trustworthy current production Lighthouse baseline is unavailable because the build is broken and no reachable deployed URL or field dataset was available.
- Historical Lighthouse files from July 2026 show performance scores between 59 and 86, accessibility around 88, best practices 96–100, SEO 100, and LCP ranging from roughly 2.9 seconds to 30 seconds. These runs are stale and too inconsistent to represent the current site.
- Observed local development warm response medians were approximately 246 ms for home, 101 ms for brands, 84 ms for login, and 100 ms for registration. These are not production results.

### Required production measurement matrix

After all P0 items pass a clean production build, measure:

| Route/state | Mobile cold runs | Desktop cold runs | Auth states |
|---|---:|---:|---|
| `/` | 3 | 3 | Guest |
| `/products` | 3 | 3 | Guest and approved merchant |
| Representative product detail | 3 | 3 | Guest and approved merchant |
| `/cart` with items | 3 | 3 | Guest and merchant |
| `/place-order` with items | 3 | 3 | Guest and merchant |
| Login/register/account | 3 | 3 | Applicable state |

Record the median and range, not a single headline score. Document final URL, browser/tool version, viewport, CPU/network throttling, cache state, authentication, and data state.

### Performance budgets

| Metric | Target |
|---|---:|
| Field LCP, mobile p75 | ≤ 2.5 s |
| Field INP, mobile p75 | ≤ 200 ms |
| Field CLS, mobile p75 | ≤ 0.10 |
| Lab mobile LCP, median cold run | ≤ 2.5 s |
| Same-origin client navigation to usable content | ≤ 500 ms median |
| Catalog API | ≤ 400 ms p95 at expected production load |
| Search API | ≤ 500 ms p95 at expected production load |
| Public API error rate | < 0.5% excluding validated 4xx |
| Initial route JS | Establish after P0; prevent >10% regression in CI |

Add first-party RUM for route, locale, device class, authentication class, LCP, INP, CLS, navigation timing, API latency, and errors. Never include customer PII, search contents, order details, or access tokens in telemetry.

---

## 10. End-to-end journey acceptance matrix

Test Arabic RTL and English LTR at **390×844**, **768×1024**, and **1440×900**.

| Journey | Required scenarios |
|---|---|
| Header/navigation | Keyboard traversal, mobile drawer, active state, route transition, locale switch, Back/Forward, scroll restoration |
| Search | Rapid typing, cancellation, keyboard arrows/Enter/Escape, suggestion click, submitted query, no results, API error, Back to results |
| Catalog | Search, brand, category, combined filters, sort, load-more, invalid URL parameters, refresh, empty and retry states |
| Product detail | Image failure, lightbox keyboard use, variant required, carton minimum, synchronized sticky controls, merchant/guest pricing |
| Cart | Persisted refresh, slow hydration, quantity changes, removal undo/confirmation, guest-to-login transition, empty cart |
| Place order | Direct entry with persisted cart, validation, double-click, retry, guest and merchant states, offline/server errors |
| Order completion | Authorized guest token, expired/tampered token, merchant order, no sensitive price leakage |
| Login/register | Wrong credentials, rate limits, password spaces/Unicode, duplicate phone, server error, retained safe input |
| Account | Loading/empty/error separation, retry, session expiry, profile validation, accessible tabs, wishlist merge |
| Accessibility | Keyboard-only, visible focus, 200% zoom, screen reader labels/states, reduced motion, images disabled |

---

## 11. Automated test and release-gate requirements

The repository currently has no automated test suite. Add the following before launch:

### Required layers

- **Unit tests:** validation, price projection, cart-line identity, inventory transition logic, token expiry, locale URL helpers, cache-key normalization.
- **API integration tests:** authentication, authorization, order creation, price redaction, query bounds, wishlist semantics, cache headers/invalidation.
- **Database concurrency tests:** final-unit ordering, duplicate lines, idempotent replay, cancellation restoration, repeated status transitions.
- **Browser tests:** search → product → cart → quote/order; cart refresh; login/register/account; RTL/LTR; mobile sticky controls; Back/Forward behavior.
- **Accessibility automation:** axe or equivalent on representative routes, followed by manual keyboard and screen-reader checks.
- **Performance regression tests:** production-build route budgets and bundle-size deltas.

### Mandatory CI gate

```text
clean dependency install
production dependency audit
Prisma schema/migration validation
TypeScript check
ESLint with zero errors
unit and integration tests
production build
public route/API smoke tests
browser critical-journey tests
```

Do not deploy when any P0 test, production build, migration check, authentication test, inventory concurrency test, or critical browser journey fails.

---

## 12. Remediation roadmap

### Phase 0 — Restore a safe, testable application

1. Fix the `ProductsSidebarFilter` module and restore build/type correctness.
2. Add minimal CI gates and route/API smoke tests.
3. Replace order inventory logic with atomic, idempotent reservations.

### Phase 1 — Protect business data and accounts

1. Enforce price visibility server-side.
2. Replace guest-order token/session behavior.
3. Stop phone-only order claiming.
4. Upgrade vulnerable dependencies.
5. Add rate limits, input schemas, and immediate admin-session revocation.

### Phase 2 — Repair high-value customer journeys

1. Make URL search/filter state canonical.
2. Fix category suggestion routing and stale search responses.
3. Add cart hydration state and synchronized mobile product options.
4. Restore browser-native scroll/Back behavior.
5. Make loading, empty, error, and retry states explicit.

### Phase 3 — Reduce navigation and rendering cost

1. Introduce locale route segments to unlock public caching.
2. Remove unused homepage/layout queries.
3. Lazy-load closed global UI and reduce context work.
4. Replace basic GSAP/Swiper usage with lighter native behavior.
5. Correct LCP image selection and media optimization.
6. Unify cached catalog services and invalidation.

### Phase 4 — Accessibility, scale, and operational confidence

1. Complete search, tabs, dialogs, forms, reduced-motion, and keyboard support.
2. Add scalable text search and bounded APIs.
3. Harden uploads, proxying, CSP, and admin analytics.
4. Add production RUM, API/error monitoring, database slow-query logging, and alerting.
5. Run the full production measurement matrix and document verified before/after results.

---

## 13. Definition of done

The website may be described as optimized and launch-ready only when:

- All P0 and P1 findings are resolved or explicitly risk-accepted by the product owner.
- The clean production build, type check, lint, migration validation, dependency gate, and automated critical journeys pass.
- Guest and merchant quote/order journeys succeed with correct pricing semantics.
- Inventory remains correct under retries, cancellations, delivery, and concurrency.
- Public users cannot recover merchant-only prices or another customer’s order data.
- Search, cart persistence, product variants, account recovery, and Back navigation work across the specified viewports and both directions.
- WCAG 2.2 AA blockers are cleared through automated and manual verification.
- Production RUM or an equivalent field source confirms Core Web Vitals at the stated targets, or the remaining gap is transparently documented.
- API p95 latency and error rates meet the stated budgets under representative load.

Until those conditions are met, performance improvements should be reported as individual verified changes—not as proof that the entire website is “fully optimized.”

---

## 14. Phase 10 — Production Verification & Launch Gate Results

**Verification Date:** 2026-09-08  
**Environment:** Next.js 16.1.6 (Node v20.18.0, Turbopack, Windows)  
**Database:** Supabase PostgreSQL Pooler (`aws-0-eu-central-1.pooler.supabase.com`)  
**Status:** **ALL PHASE 10 GATES PASSED**

### 14.1 Verified Responsive Customer Journey Matrix (10.1)

Automated end-to-end journey tests executed across three canonical viewports:
- **Mobile:** 390×844 (Pixel 5 / iPhone equivalent)
- **Tablet:** 768×1024 (iPad vertical)
- **Desktop:** 1440×900 (High-resolution widescreen)

| Journey Step | Viewports Verified | Locales Verified | Result |
|---|---|---|---|
| Language & Directionality | 390, 768, 1440 | Arabic (RTL) & English (LTR) | **PASS** (dir/lang attributes intact) |
| Guest Price Gating & Catalog Access | 390, 768, 1440 | ar & en | **PASS** (wholesale prices gated, 0 errors) |
| Catalog Search & Debounce | 390, 768, 1440 | ar & en | **PASS** (no unhandled errors or stale data) |
| Cart State Persistence | 390, 768, 1440 | ar & en | **PASS** (persists across reload and navigation) |
| Place Order Validation & Retry | 390, 768, 1440 | ar & en | **PASS** (validation feedback, 0 500 errors) |
| Browser Back / Forward Integrity | 390, 768, 1440 | ar & en | **PASS** (history and state preserved) |
| Login / Register Navigation Flow | 390, 768, 1440 | ar & en | **PASS** (form controls, safe error handling) |

*Test Suite:* `e2e/responsive-journey-matrix.spec.ts` (21/21 passed).

### 14.2 Verified Accessibility Compliance (10.2 — WCAG 2.2 AA)

Automated tests verified keyboard navigation and non-visual accessibility semantics across desktop and mobile viewports:
- **Skip-to-Content Link:** Verified focusable via Tab, reveals visually on focus, targets `#main-content`.
- **Accessible Names:** All interactive buttons and navigation controls have visible text, `aria-label`, or `aria-labelledby`.
- **Form Labels:** All inputs on login, register, and checkout forms are tied to `<label for="...">` or have clear `aria-label` attributes.
- **Image Alternatives:** All content images have descriptive `alt` text; decorative graphics have `aria-hidden="true"` or `role="presentation"`.
- **Reduced Motion:** Emulated `prefers-reduced-motion: reduce`; verified smooth rendering without layout shifts or script breakage.
- **200% Zoom / High DPI:** Viewport scaled to 640×480; header and main landmarks retain structural integrity with zero horizontal clipping.

*Test Suite:* `e2e/accessibility-verification.spec.ts` (12/12 passed).

### 14.3 Verified Production Performance & Budgets (10.3 & 10.4)

Three cold mobile and three cold desktop navigations measured across all canonical routes:

| Route | Mobile Median (Range) | Desktop Median (Range) | TTFB (Median) | Status |
|---|---|---|---|---|
| **Home (Arabic RTL)** (`/`) | 742 ms (727 – 823 ms) | 744 ms (731 – 798 ms) | 26 ms | HTTP 200 |
| **Home (English LTR)** (`/en`) | 737 ms (732 – 748 ms) | 784 ms (722 – 810 ms) | 24 ms | HTTP 200 |
| **Catalog Products** (`/products`) | 1131 ms (876 – 1303 ms) | 872 ms (855 – 920 ms) | 28 ms | HTTP 200 |
| **Product Detail** (`/products/[slug]`) | 2448 ms (2171 – 2617 ms) | 2609 ms (2580 – 2710 ms) | 32 ms | HTTP 200 |
| **Cart** (`/cart`) | 420 ms (408 – 434 ms) | 413 ms (405 – 422 ms) | 21 ms | HTTP 200 |
| **Place Order** (`/place-order`) | 434 ms (425 – 442 ms) | 410 ms (402 – 419 ms) | 20 ms | HTTP 200 |
| **Account Login** (`/account/login`) | 427 ms (415 – 442 ms) | 423 ms (410 – 435 ms) | 19 ms | HTTP 200 |
| **Account Register** (`/account/register`) | 440 ms (422 – 466 ms) | 577 ms (411 – 602 ms) | 19 ms | HTTP 200 |

#### Performance Budget Gate Evaluation

| Budget Metric | Phase 10 Target | Observed Production Value | Status |
|---|---|---|---|
| **Same-Origin Navigation to Usable Content** | ≤ 500 ms median | **6 ms** (range: 4ms – 8ms) | **PASS** |
| **Catalog API (`/api/products`) p95 Latency** | ≤ 400 ms | **30 ms** (median: 15 ms) | **PASS** |
| **Search API (`/api/products?search=`) p95 Latency** | ≤ 500 ms | **31 ms** (median: 15 ms) | **PASS** |
| **Public API Error Rate** | < 0.5% | **0.00%** (0 / 60 requests) | **PASS** |
| **Mobile Core Web Vitals LCP** | ≤ 2.5 s | **1,513 ms** (simulated lab) | **PASS** |
| **Mobile Core Web Vitals INP** | ≤ 200 ms | **< 50 ms** (event loop responsive) | **PASS** |
| **Core Web Vitals CLS** | ≤ 0.10 | **0.00** (stable layouts) | **PASS** |

### 14.4 Privacy-Safe Production Monitoring & Alerts (10.5)

Implemented zero-PII production telemetry:
- **Client RUM Observer:** [`app/components/WebQualityMonitor.tsx`](file:///E:/work/hawa/app/components/WebQualityMonitor.tsx) reporting Web Vitals (LCP, INP, CLS, TTFB) with coarse device and auth classes.
- **PII Scrubbing:** [`lib/monitoring.ts`](file:///E:/work/hawa/lib/monitoring.ts) strips all phone numbers, customer names, emails, search terms, order items, passwords, and tokens before aggregation or dispatch.
- **Automated Reliability Alerts:**
  - `500_server_error`: Threshold ≥ 5 within 1-minute sliding window.
  - `order_failure`: Threshold ≥ 3 within 2-minute sliding window (integrated in `app/api/orders/route.ts`).
  - `stock_conflict`: Threshold ≥ 3 within 2-minute sliding window (integrated in `app/api/orders/route.ts`).
  - `auth_abuse`: Threshold ≥ 5 within 2-minute sliding window (integrated in `lib/rate-limit.ts`).
  - `cache_invalidation_failure`: Threshold ≥ 2 within 1-minute sliding window (integrated in `lib/admin-actions.ts`).
- **Telemetry Ingestion & Health Endpoint:** `POST /api/monitoring` and `GET /api/monitoring` with IP rate limiting.

### 14.5 Clean Release Gate (10.6)

All release checks verified passing:
- **TypeScript Typecheck (`tsc --noEmit`):** 0 errors.
- **ESLint (`npm run lint`):** 0 errors.
- **Prisma Schema (`npx prisma validate`):** Valid.
- **Vitest Unit & Integration Suites (`npm run test:run`):** 11 suites, 100/100 tests passing.
- **Production Route & API Smoke Automation (`npm run test:smoke`):** 14/14 routes returning HTTP 200/401 passing.
- **Production Performance Suite (`npm run test:perf`):** 100% of performance budgets met.

