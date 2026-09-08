# Hawa Website Audit — Phased Implementation Plan

**Source audit:** `new/WEBSITE_AUDIT_REPORT.md`  
**Purpose:** Give a coding agent small, ordered, independently verifiable tasks.  
**Important product decision:** Current zero product prices are intentional temporary data. Do not populate, migrate, reject, or reinterpret them in this plan.

---

## Working rules for the coding agent

1. Complete phases in order. Do not begin a phase while its entry gate is failing.
2. Complete one micro-task at a time. Do not combine unrelated tasks into a single large edit.
3. Before editing, inspect the named files and all direct callers. Preserve existing user changes in the dirty worktree.
4. After every micro-task, run its focused checks. After every phase, run the complete phase gate.
5. Do not silently change database behavior, public API shapes, authentication rules, or Arabic copy beyond the task specification.
6. Do not add shadows, glow effects, decorative gradients, or new animation libraries.
7. Keep Arabic RTL and English LTR behavior working at 390, 768, and 1440 pixel widths.
8. Treat public wholesale prices as protected information even while current stored prices are zero.
9. If a migration is required, create a forward migration. Never reset or destructively reseed the database.
10. Stop and report the exact blocker if a task cannot satisfy its acceptance checks. Do not work around failing tests by disabling rules.

### Standard task handoff

After each micro-task, report:

- Task ID completed.
- Files changed.
- Behavior before and after.
- Commands/tests run and their results.
- Remaining failure, risk, or manual verification.

---

## Phase 0 — Freeze the baseline and protect existing work

**Objective:** Establish repeatable checks without changing application behavior.

### 0.1 Record the working-tree baseline

- [ ] Run `git status --short` and save the output in the agent handoff, not in a tracked file.
- [ ] Identify which affected files already contain user changes.
- [ ] Confirm the coding agent will not reset, overwrite, or reformat unrelated files.

**Done when:** The handoff lists pre-existing modified/untracked files relevant to the next phase.

### 0.2 Record the current failing gates

- [ ] Run `npx tsc --noEmit --pretty false`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Record the failures as the before-state; do not fix anything in this task.

**Done when:** The exact build, TypeScript, and lint failures are captured for comparison.

### Phase 0 exit gate

- Baseline recorded.
- No tracked application file changed.

---

## Phase 1 — Restore compilation and catalog availability

**Objective:** Make the current application buildable before any functional refactor.

### 1.1 Repair the products sidebar module boundary

**Primary files:**

- `app/components/ProductsPageComponents/ProductsSidebarFilter.tsx`
- `app/(site)/products/ProductsClient.tsx`

**Changes:**

- [ ] Move `reconcileCategoriesWithBrands` to module scope or a small dedicated utility file.
- [ ] Keep exactly one default export for `ProductsSidebarFilter`.
- [ ] Preserve the helper's existing inputs, output, and filter behavior.
- [ ] Confirm the named import in `ProductsClient` resolves correctly.

**Focused checks:**

- [ ] TypeScript reports no error for either file.
- [ ] ESLint reports no parser/module error for either file.
- [ ] `/products` renders instead of returning HTTP 500.

### 1.2 Fix React render-time ref errors

**Primary file:** `app/components/RollingNumber.tsx`

**Changes:**

- [ ] Stop reading and mutating refs during render.
- [ ] Derive animation direction from state/effect-safe previous value tracking.
- [ ] Preserve number direction, visible value, reduced-motion behavior, and layout width.

**Focused checks:**

- [ ] `react-hooks/refs` errors are gone.
- [ ] Cart and product quantity controls increase and decrease correctly.

### 1.3 Fix BrandsClient compiler dependency errors

**Primary file:** `app/(site)/brands/BrandsClient.tsx`

**Changes:**

- [ ] Make brand-name/specialty helpers stable or move them outside the component.
- [ ] Give `useMemo` the complete stable dependency set.
- [ ] Do not remove memoization merely to silence the compiler unless profiling proves it unnecessary.

**Focused checks:**

- [ ] React Compiler memoization errors are gone.
- [ ] Arabic/English brand search and sector filtering return the same results as before.

### 1.4 Run a production route smoke test

- [ ] Start the successful production build locally.
- [ ] Check `/`, `/products`, `/brands`, `/categories`, `/account/login`, `/account/register`, `/cart`, and `/place-order`.
- [ ] Check `/api/products`, `/api/categories`, `/api/main-categories`, `/api/navigation`, `/api/settings`, and `/api/customer/auth/me`.
- [ ] Record expected 200/401 statuses and fail on any unexpected 500.

### Phase 1 exit gate

- `tsc --noEmit` passes.
- ESLint has zero errors. Warnings may remain documented.
- `npm run build` passes.
- Catalog and API smoke checks have no unexpected 500 responses.

---

## Phase 2 — Add safety nets before business-logic changes

**Objective:** Prevent order, authentication, and navigation regressions during later phases.

### 2.1 Add the test runner and scripts

- [ ] Select one unit/integration runner compatible with Next.js and TypeScript; prefer Vitest unless the repository already standardizes another tool.
- [ ] Add `test`, `test:run`, and `typecheck` scripts.
- [ ] Add one passing utility test and one API validation test to verify configuration.
- [ ] Keep tests isolated from the production database.

### 2.2 Add route/API smoke automation

- [ ] Create a smoke script that starts or targets a production server.
- [ ] Cover the public routes and APIs from Phase 1.4.
- [ ] Assert status class, content type, and absence of server-error HTML.
- [ ] Make the script terminate cleanly on Windows and CI.

### 2.3 Add browser critical-journey scaffolding

- [ ] Add Playwright or the existing browser-test standard.
- [ ] Configure Chromium at 390×844 and 1440×900.
- [ ] Add a non-destructive home → products smoke journey.
- [ ] Add artifact capture only on failure.

### 2.4 Add a CI quality gate

- [ ] Run dependency install, Prisma generation/validation, typecheck, ESLint, unit tests, production build, and smoke tests.
- [ ] Cache dependencies/build artifacts without caching secrets.
- [ ] Do not allow tests to contact or mutate the production database.

### Phase 2 exit gate

- Tests run from one documented command.
- A deliberately broken route/test causes CI to fail.
- The clean current application passes the new gate.

---

## Phase 3 — Make inventory and order submission atomic

**Objective:** Prevent double deduction, overselling, and duplicate orders. Do not change the intentionally temporary product prices.

### 3.1 Document the inventory transition contract

- [ ] Define submission as a stock reservation.
- [ ] Define delivery as no additional stock change.
- [ ] Define cancellation/deletion as releasing an active reservation exactly once.
- [ ] Define invalid reverse transitions explicitly.
- [ ] Add unit tests for the transition table before editing persistence code.

### 3.2 Aggregate and validate order lines

**Primary file:** `app/api/orders/route.ts`

- [ ] Merge duplicate `productId` lines before stock validation.
- [ ] Require positive integer carton quantities.
- [ ] Apply documented maximum quantities and request-line limits.
- [ ] Return structured 400/422 errors without leaking internal details.

### 3.3 Reserve stock atomically

- [ ] Replace read-then-unconditional-update behavior with an atomic conditional update inside the order transaction.
- [ ] Require every stock update to affect exactly one row.
- [ ] Roll back the full order when any requested product cannot be reserved.
- [ ] Do not deduct stock a second time on `DELIVERED`.

### 3.4 Release reservations idempotently

**Primary area:** Order status/delete actions in `lib/admin-actions.ts`

- [ ] Release stock once on cancellation or eligible deletion.
- [ ] Make repeated identical status requests no-ops.
- [ ] Prevent or explicitly handle delivered → cancelled transitions.
- [ ] Record reservation/inventory movement state sufficient for audit and retry safety.

### 3.5 Add order idempotency

- [ ] Generate a stable idempotency key when the user begins submission.
- [ ] Persist a unique key with the resulting order/request.
- [ ] Return the original order for a valid replay instead of creating another order.
- [ ] Do not reuse a key for a different payload.

### 3.6 Add transaction/concurrency tests

- [ ] Twenty concurrent requests for the final unit: exactly one succeeds.
- [ ] Duplicate product lines cannot exceed stock jointly.
- [ ] Double-click/retry with one key creates one order.
- [ ] Pending → delivered changes stock once total.
- [ ] Pending → cancelled restores stock once.
- [ ] Repeated transition does not change stock again.

### Phase 3 exit gate

- All order/inventory tests pass repeatedly.
- Existing product prices remain untouched.
- No status path can double-decrement or double-release stock.

---

## Phase 4 — Protect prices, orders, sessions, and public endpoints

**Objective:** Enforce business privacy and authorization on the server.

### 4.1 Centralize price visibility

- [x] Create one server-side product/order projection for guest/public access.
- [x] Omit price fields or return `null` for guests.
- [x] Return prices only to authenticated, active, approved merchants.
- [x] Apply the projection to HTML/RSC props, JSON-LD, products, navigation, trending, related products, wishlist, and order endpoints.
- [x] Prevent merchant-priced responses from entering shared public caches.
- [x] Do not change stored prices or populate the current zero values.

**Tests:** Logged-out responses cannot reveal `price` or `discountPrice`; approved merchant responses still follow the intended contract.

### 4.2 Replace unsafe guest-order tokens

- [x] Remove the production fallback secret and fail securely when configuration is absent.
- [x] Issue expiring tokens containing a nonce or persist a hashed token and expiry.
- [x] Validate expiry, signature/hash, order binding, and revocation.
- [x] Exchange query tokens promptly so they do not remain in browser history/referrers.
- [x] Replace one-cookie-per-order behavior with one scoped guest-order session.

### 4.3 Stop phone-only order claiming

- [x] Attach a new order to a customer only when that customer is authenticated.
- [x] Do not expose guest orders merely because their phone matches an account.
- [x] Require a valid signed token or verified-phone OTP for explicit claiming.
- [x] Remove retroactive phone-only claiming from login and registration.

### 4.4 Make admin revocation immediate

- [x] Add a session version/revocation marker or fresh privileged-user check.
- [x] Apply it to every admin mutation and sensitive read.
- [x] Invalidate sessions after role, permission, password, disable, or delete changes.
- [x] Test an already signed-in administrator immediately after demotion/deletion.

### 4.5 Normalize credential handling

- [x] Never trim passwords during registration or login.
- [x] Apply the same original-string length rules to both endpoints.
- [x] Test leading/trailing spaces, Unicode, boundary length, and excessive input.

### 4.6 Validate customer/profile payloads

- [x] Introduce shared server schemas for login, registration, and profile update.
- [x] Bound every string and validate phone/city/value types.
- [x] Return field-addressable 400/422 errors.
- [x] Ensure invalid non-string data never becomes a 500.

### 4.7 Add abuse controls

- [x] Rate-limit login/register by normalized account key plus trusted IP.
- [x] Add exponential login backoff.
- [x] Add burst limits to orders and reviews.
- [x] Add upload quotas and request-body limits.
- [x] Emit privacy-safe metrics for allowed/rejected requests.

### 4.8 Resolve vulnerable dependencies

- [x] Upgrade Next and NextAuth to patched compatible versions first.
- [x] Regression-test middleware, server actions, sessions, and redirects.
- [x] Remove unused `ws`.
- [x] Replace or isolate `xlsx` with strict file/row/cell/formula/time limits.
- [x] Run `npm audit --omit=dev` and document any unavoidable residual advisory.

### Phase 4 exit gate

- Guest price-redaction tests pass across every output surface.
- Cross-customer order access and phone-only claiming tests pass.
- Demoted admins lose access immediately.
- Auth/write rate-limit tests pass.
- No critical/high production advisory remains without an explicit documented exception.

---

## Phase 5 — Repair search and catalog navigation

**Objective:** Make URLs, search state, filters, and Back navigation deterministic.

### 5.1 Define the canonical catalog URL contract

- [x] Support documented `search`, `brand`, `category`, sort, and page/load state parameters.
- [x] Normalize casing, whitespace, arrays, and invalid values.
- [x] Make the URL the source of truth for initial server data and client controls.
- [x] Do not introduce multiple URLs for the same filter state.

### 5.2 Apply submitted header search

- [x] Parse `search` in the products page.
- [x] Pass it into initial server data and `ProductsClient` state.
- [x] Preserve it through load-more, refresh, share, and browser Back.
- [x] Replace `window.location.href` with framework navigation.

### 5.3 Correct suggestion routing

- [x] Send category suggestions to the canonical category route/filter.
- [x] Keep brand suggestions on the brand route/filter.
- [x] Add tests for product, brand, and category suggestion destinations.

### 5.4 Prevent stale search/category responses

- [x] Add `AbortController` or a request-sequence guard to desktop search.
- [x] Add the same protection to dynamic category requests.
- [x] Cancel work on query change, close, navigation, and unmount.
- [x] Ensure an old response can never replace a newer result.

### 5.5 Bound catalog query inputs

- [x] Reject negative/NaN/excessive pages.
- [x] Cap search length and ID-list count.
- [x] Canonicalize and sort IDs before cache-key generation.
- [x] Stop trusting browser-provided total/skip metadata.
- [x] Return structured validation errors.

### 5.6 Complete search accessibility

- [x] Implement the combobox/listbox relationship.
- [x] Add arrow navigation, Enter, Escape, active descendant, result count announcement, and focus restoration.
- [x] Keep touch interaction and mobile focus trapping intact.

### Phase 5 exit gate

- [x] Search and filters survive refresh and Back/Forward.
- [x] Rapid typing never displays stale results.
- [x] Every suggestion type lands on the correct filtered result.
- [x] Keyboard-only search passes on mobile and desktop.

---

## Phase 6 — Stabilize cart, product options, checkout, and account states

**Objective:** Remove hydration races and misleading empty states.

### 6.1 Expose cart hydration state

- [x] Add `isHydrated` to the cart context contract.
- [x] Show a dimensionally stable loading state before local persistence is read.
- [x] Evaluate empty-cart UI and checkout redirects only after hydration.
- [x] Test refresh and direct navigation on slow CPU.

### 6.2 Unify product purchase state

- [x] Share selected variant and quantity between primary product actions and mobile sticky bar.
- [x] Require a selected option when the product defines options.
- [x] Use one stable cart-line identity based on product plus option.
- [x] Prevent duplicate or ambiguous variant lines.

### 6.3 Make order submission retry-safe in the UI

- [x] Disable duplicate submission while a request is active.
- [x] Reuse the idempotency key for safe retry.
- [x] Keep delivery/contact form values after recoverable failure.
- [x] Show whether the failure is validation, network, session, stock, or server related.

### 6.4 Separate account loading, empty, and error states

- [x] Model orders and wishlist state independently.
- [x] Show retry for transient errors and login for expired sessions.
- [x] Never display API failure as “no orders” or “no favorites.”
- [x] Preserve the selected account section during retry.

### 6.5 Merge guest wishlist safely after login

- [x] Replace toggle POST behavior with idempotent add/remove operations.
- [x] Merge guest IDs once after authentication.
- [x] Use database upsert/deleteMany semantics to avoid races.

### Phase 6 exit gate

- [x] Persisted carts never flash empty or redirect prematurely.
- [x] Mobile and main product controls create the same correct cart line.
- [x] Retried submissions create one order.
- [x] Account failures are visible and recoverable.

---

## Phase 7 — Restore predictable scrolling, animation, and accessibility

**Objective:** Ensure motion is enhancement and native navigation behavior is preserved.

### 7.1 Remove competing global scroll resets

- [x] Inventory every `scrollTo`, `scrollRestoration`, RAF, and timeout used during navigation.
- [x] Restore native Back/Forward position behavior.
- [x] Scroll to top only for true new-page transitions where needed.
- [x] Do not scroll to top for catalog query/filter updates.

### 7.2 Make reveal content visible by default

- [x] Remove base `autoAlpha: 0` dependency.
- [x] Apply reveal styles only after animation initialization.
- [x] Ensure interrupted, delayed, or failed animation resolves visible.
- [x] Replace simple reveals/counters with CSS, IntersectionObserver, or Web Animations.

### 7.3 Complete reduced-motion behavior

- [x] Disable nonessential translation, parallax, rolling numbers, and autoplay transitions under reduced motion.
- [x] Keep all content and controls in the same logical order.
- [x] Preserve carousel pause/manual navigation.

### 7.4 Fix account tab semantics

- [x] Add tablist/tab/tabpanel roles and relationships.
- [x] Implement roving focus, arrow keys, Home, and End.
- [x] Preserve current responsive layout.

### 7.5 Associate profile labels and errors

- [x] Add stable IDs and `htmlFor`.
- [x] Connect hints/errors with `aria-describedby`.
- [x] Move focus to the first invalid field and announce submission state.

### 7.6 Make product lightbox a real dialog

- [x] Add dialog name, `aria-modal`, focus trap, Escape, and focus return.
- [x] Make the background inert while open.
- [x] Restore the exact previous body overflow/style state.

### Phase 7 exit gate

- [x] No section is blank while awaiting a scroll trigger.
- [x] Back returns users to their prior catalog position.
- [x] Keyboard-only and reduced-motion journeys pass.
- [x] Automated accessibility checks report no serious/critical issue on representative routes.

---

## Phase 8 — Reduce global work and accelerate navigation

**Objective:** Improve real navigation speed before fine-grained asset tuning.

### 8.1 Remove unused homepage reads

- [x] Confirm `mainBrands`, `highlightCards`, and duplicate settings props are unused.
- [x] Remove their fetches and serialized props.
- [x] Compare homepage query count and RSC/document size before and after.

### 8.2 Defer closed global interfaces

- [x] Dynamically import mobile menu, search modal, and cart drawer on first intent/open.
- [x] Remove the unused category query from the site layout.
- [x] Load navigation data when the mobile menu opens, using the shared cached endpoint.
- [x] Prefetch the deferred chunk/data on safe user intent if measurement supports it.

### 8.3 Make customer shell state lightweight

- [x] Replace the globally eager customer payload with the minimum session/header state.
- [x] Fetch wishlist/order counts only on routes/components that display them.
- [x] Deduplicate and cancel requests.
- [x] Remove unused provider imports/wrappers.

### 8.4 Unlock public HTML caching with locale routes

- [x] Introduce or finalize canonical `/ar` and `/en` route behavior.
- [x] Resolve locale before public page rendering without reading cookies in the cacheable layout.
- [x] Redirect/rewrite legacy language state safely.
- [x] Keep authenticated/private pages dynamic.
- [x] Verify public responses no longer use `no-store` unnecessarily.

### 8.5 Unify category/navigation caching

- [x] Route public reads through one cached data service.
- [x] Add ETag or `s-maxage` plus `stale-while-revalidate` where appropriate.
- [x] Create a typed entity-to-cache-tag invalidation map.
- [x] Invalidate banners, settings, catalog, categories, and navigation after relevant admin mutations.
- [x] Log invalidation failures instead of swallowing them.

### 8.6 Replace basic heavy animation/slider usage

- [x] Identify which homepage motion genuinely needs GSAP timelines.
- [x] Replace simple reveals and counters first.
- [x] Replace below-fold Swipers with CSS scroll-snap where behavior remains equivalent.
- [x] Lazy-load any remaining below-fold animation/slider code.
- [x] Apply tested `content-visibility: auto` to substantial below-fold sections.

### Phase 8 exit gate

- No unused homepage queries remain.
- Closed global UI is absent from the initial route graph.
- Public cache headers match the locale/authentication model.
- Same-origin navigation and initial JS improve without functional regression.

---

## Phase 9 — Optimize search, images, uploads, CSP, and SEO consistency

**Objective:** Complete scale, media, and platform hardening after core journeys are stable.

### 9.1 Add scalable catalog search

- [ ] Add normalized searchable content.
- [ ] Add PostgreSQL `pg_trgm` GIN indexes or the approved full-text/search solution.
- [ ] Require a sensible minimum debounced query length.
- [ ] Test Arabic and English search relevance.
- [ ] Compare `EXPLAIN (ANALYZE, BUFFERS)` at representative 10k/100k datasets.

### 9.2 Correct hero LCP priority

- [ ] Remove the hard-coded hero preload.
- [ ] Give priority only to the resolved first active slide.
- [ ] Verify `sizes`, width/height, and responsive crop.
- [ ] Confirm later slides are lazy and do not compete with LCP.

### 9.3 Normalize product/media delivery

- [ ] Replace critical raw `<img>` paths with responsive optimized images.
- [ ] Move remote product media to controlled object storage or a safe optimization proxy.
- [ ] Set upload dimension, byte, type, and quality limits.
- [ ] Verify broken-image and fallback behavior.

### 9.4 Harden upload and image proxy endpoints

- [ ] Store uploads outside local ephemeral `public/uploads`.
- [ ] Decode and re-encode accepted images.
- [ ] Limit pixels, bytes, duration, and per-customer quota.
- [ ] Allowlist HTTPS origins for proxying.
- [ ] Stream with a hard cap rather than buffering unlimited responses.

### 9.5 Tighten CSP safely

- [ ] Add missing `object-src`, `base-uri`, and `form-action` directives.
- [ ] Replace broad HTTPS and unsafe script allowances with explicit origins and nonces/hashes.
- [ ] Deploy report-only first and collect violations.
- [ ] Enforce only after required first/third-party behavior is covered.

### 9.6 Centralize domain/contact/locale configuration

- [ ] Define one canonical site origin.
- [ ] Define one locale URL generator for canonical and hreflang values.
- [ ] Centralize sales phone, WhatsApp, email, and social/share origins.
- [ ] Remove placeholder or divergent fallbacks.
- [ ] Validate configuration during startup/build.

### 9.7 Paginate and aggregate admin data

- [ ] Add cursor pagination to product/customer lists.
- [ ] Move totals and groupings into database queries.
- [ ] Use deterministic ordering and date ranges.
- [ ] Remove repeated aggregates and arbitrary unordered sample limits.

### 9.8 Separate public and admin server modules

- [ ] Move public cached reads into public query modules.
- [ ] Move authenticated admin reads into protected modules.
- [ ] Keep mutations in clearly authenticated action modules.
- [ ] Confirm every privileged entry point performs its own authorization check.

### Phase 9 exit gate

- Search p95 meets its budget at representative scale.
- LCP downloads only the correct first hero asset.
- Upload/proxy abuse tests pass.
- CSP report-only violations are understood before enforcement.
- Canonical, hreflang, sharing, and contact values come from one configuration source.

---

## Phase 10 — Production verification and launch gate (invalidated; superseded by V2)

**Objective:** Prove outcomes under controlled production conditions.

### 10.1 Run the responsive journey matrix

- [x] Arabic RTL and English LTR.
- [x] 390×844, 768×1024, and 1440×900.
- [x] Guest and approved merchant states.
- [x] Search, catalog, product options, cart persistence, order submission, login/register/account, Back/Forward, errors, and retry.

### 10.2 Run accessibility verification

- [x] Automated audit on representative routes.
- [x] Keyboard-only header, menu, search, lightbox, cart, account tabs, and forms.
- [x] Screen-reader labels, states, errors, dialog focus, and live announcements.
- [x] 200% zoom, reduced motion, and images disabled.

### 10.3 Run repeatable production performance tests

For each route below, run three cold mobile and three cold desktop navigations and report median plus range:

- [x] Home.
- [x] Products.
- [x] Representative product detail.
- [x] Cart with items.
- [x] Place-order with items.
- [x] Login/register/account where applicable.

Record final URL, browser/tool version, viewport, CPU/network profile, cache state, locale, and authentication state.

### 10.4 Verify performance budgets

- [ ] Mobile lab LCP target: ≤ 2.5 s; field status pending new data.
- [ ] Field INP target: ≤ 200 ms after sufficient real-user data exists.
- [ ] CLS target: ≤ 0.10 after genuine browser measurement.
- [x] Same-origin navigation to usable content: ≤ 500 ms median.
- [x] Catalog API: ≤ 400 ms p95 at expected load.
- [x] Search API: ≤ 500 ms p95 at expected load.
- [x] Public API error rate: < 0.5%, excluding validated 4xx.

### 10.5 Add privacy-safe production monitoring

- [x] Record route, locale, device class, auth class, LCP, INP, CLS, navigation timing, API latency, and error category.
- [x] Exclude PII, search text, order contents, credentials, and tokens.
- [x] Add alerts for unexpected 500 rate, order failure, stock conflict, authentication abuse, and cache invalidation failure.

### 10.6 Final clean release gate

- [x] Clean install succeeds.
- [x] Prisma schema and migrations validate.
- [x] TypeScript and ESLint pass with zero errors.
- [x] Unit, integration, concurrency, browser, and accessibility tests pass.
- [x] Production build and route/API smoke tests pass.
- [x] No unresolved P0/P1 finding remains without documented product-owner risk acceptance.
- [x] Before/after measurements and remaining limitations are added to the audit report.

---

## Recommended agent execution size

Give the coding agent **one numbered micro-task per prompt**. A single prompt may include the phase exit gate only when all micro-tasks in that phase are already complete. The agent should never receive “implement the whole audit” as one instruction.

Recommended first prompts:

1. `Implement task 1.1 only. Preserve unrelated working-tree changes and report focused checks.`
2. `Implement task 1.2 only. Do not modify the products filter work from task 1.1.`
3. `Implement task 1.3 only, then run the Phase 1 type and lint checks.`
4. `Perform task 1.4 as verification only. Do not fix newly discovered issues; report them.`

Continue in numeric order. If a task reveals a new P0 defect, add a narrowly scoped micro-task immediately before continuing to the next phase.
