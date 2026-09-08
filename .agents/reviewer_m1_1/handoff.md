# Handoff Report — Reviewer 1 (Milestone 1: Storefront & Cart Edge Cases / Telemetry)

**Reviewer**: Reviewer 1 (`.agents/reviewer_m1_1`)  
**Parent Orchestrator**: `ccf29f83-86fe-4180-a559-3a041524307c`  
**Date**: 2026-09-08  
**Working Directory**: `E:\work\hawa\.agents\reviewer_m1_1`  
**Project Root**: `E:\work\hawa`  
**Handoff Type**: Hard (Review Complete)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Typecheck & Verification Commands Directly Executed
1. **TypeScript Compilation**:
   - Command: `cmd.exe /c "npm run typecheck"`
   - Output:
     ```
     > hawa-distribution@0.1.0 typecheck
     > tsc --noEmit
     ```
     Exit code: `0` (clean, zero TypeScript errors).

2. **Worker 1 Test Suite Verification**:
   - Command: `cmd.exe /c "npx vitest run tests/cart-min-order.test.ts tests/sentry-privacy.test.ts"`
   - Output:
     ```
     Test Files  2 passed (2)
          Tests  8 passed (8)
     ```
     Exit code: `0` (all 8 tests passing).

3. **Adversarial Test Suite Verification**:
   - Command: `cmd.exe /c "npx vitest run tests/sentry-privacy-adversarial.test.ts"`
   - Output:
     ```
     FAIL tests/sentry-privacy-adversarial.test.ts > Adversarial Sentry Privacy & Telemetry Challenge > 3. Credentials Scrubbing > scrubs credentials payload from extra
     AssertionError: expected { Object (sessionToken, safeField) } to not have property "sessionToken"
     - Expected: undefined
     + Received: "xyz"
     at tests/sentry-privacy-adversarial.test.ts:108:31

     FAIL tests/sentry-privacy-adversarial.test.ts > Adversarial Sentry Privacy & Telemetry Challenge > 3. Credentials Scrubbing > scrubs credentials from tags
     AssertionError: expected { sessionToken: 'xyz', …(1) } to not have property "sessionToken"
     - Expected: undefined
     + Received: "xyz"
     at tests/sentry-privacy-adversarial.test.ts:135:30

     FAIL tests/sentry-privacy-adversarial.test.ts > Adversarial Sentry Privacy & Telemetry Challenge > 3. Credentials Scrubbing > scrubs credentials from breadcrumbs
     AssertionError: expected { category: 'auth', …(1) } to not have property "sessionToken"
     - Expected: undefined
     + Received: "xyz"
     at tests/sentry-privacy-adversarial.test.ts:154:21

     Test Files  1 failed (1)
          Tests  3 failed | 8 passed (11)
     ```
     Exit code: `1` (3 failures).

---

### 1.2 Code Inspection Observations

1. **`lib/sentry-privacy.ts` (Line 1)**:
   ```typescript
   const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials|price|wholesalePrice|guestPrice|cost|discountPrice|wholesale|costPrice)$/i;
   ```
   The regular expression uses exact whole-word matching (`^(...)$`). It matches exact word `token`, but fails to match compound token names such as `sessionToken`, `authToken`, `accessToken`, `refreshToken`, `apiKey`, `secretKey`, as well as snake_case pricing variants such as `wholesale_price`, `cost_price`, `discount_price`, `guest_price`.
   Furthermore, `sanitizeString` (Line 4):
   ```typescript
   const TOKEN = /\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi;
   ```
   Only replaces string tokens having 24+ characters. Non-exact token keys containing values shorter than 24 characters (e.g. `sessionToken: "xyz"`) pass through completely unredacted.

2. **`sentry.client.config.ts` (Lines 1–15)**:
   ```typescript
   import * as Sentry from "@sentry/nextjs";
   import { scrubSentryEvent } from "@/lib/sentry-privacy";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "",
     environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",
     enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
     sendDefaultPii: false,
     tracesSampleRate: 0.1,
     replaysSessionSampleRate: 0,
     replaysOnErrorSampleRate: 0,
     beforeSend: (event) => scrubSentryEvent(event),
     beforeSendTransaction: (event) => scrubSentryEvent(event),
   });
   ```
   Correctly imports and initializes `@sentry/nextjs` with zero session replay sampling rates, 0.1 trace sampling rate, and attaches `scrubSentryEvent` to both `beforeSend` and `beforeSendTransaction`.

3. **`app/context/CartContext.tsx` (Lines 38–53, 87–127)**:
   ```typescript
   export function normalizeCartItem(newItem: CartItem): CartItem {
       const cleanOption = (newItem.selectedOption || '').trim() || undefined;
       const itemMinOrder = Math.max(1, Number(newItem.minOrder) || 1);
       const initialQty = Math.max(itemMinOrder, Number(newItem.quantity) || itemMinOrder);
       return {
           ...newItem,
           selectedOption: cleanOption,
           minOrder: itemMinOrder,
           quantity: initialQty,
       };
   }

   export function clampCartQuantity(quantity: number, minOrder?: number | null): number {
       const minQty = Math.max(1, Number(minOrder) || 1);
       return quantity < minQty ? minQty : quantity;
   }
   ```
   `addItem` calls `normalizeCartItem(newItem)`, guaranteeing any item entered into the cart satisfies `itemMinOrder`.
   `updateQuantity` checks `if (quantity <= 0) { removeItem(id, selectedOption); return; }` and clamps positive updates using `clampCartQuantity(quantity, item.minOrder)`.
   *Minor Observation*: On mount (Line 63-78), `localStorage.getItem('cart')` parses cached items and sets them directly into state (`setItems(parsed)`) without invoking `normalizeCartItem`.

4. **`app/components/ProductsPageComponents/ProductCard.tsx` (Lines 92–124, 225–247)**:
   `minQuantity = Math.max(1, Number(product.minOrder) || 1)`.
   `handleInitialAdd` sends `quantity: minQuantity, minOrder: minQuantity`.
   `handleDecrease` checks `if (quantityInCart <= minQuantity) removeItem(product.id); else updateQuantity(product.id, quantityInCart - 1);`.
   Aria-labels and button titles correctly display "Remove from cart" / "حذف من السلة" when at `minQuantity`.

5. **`app/components/ProductsPageComponents/WholesaleProductRow.tsx` (Lines 65–99, 261–281)**:
   `minQuantity = Math.max(1, Number(product.minOrder) || 1)`.
   `handleInitialAdd` sends `quantity: minQuantity, minOrder: minQuantity`.
   `handleDecrease` checks `if (quantityInCart <= minQuantity) removeItem(product.id, defaultOption); else updateQuantity(product.id, quantityInCart - 1, defaultOption);`.
   Aria-labels and button titles correctly reflect removal when at or below `minQuantity`.

6. **`app/components/ProductsPageComponents/QuickViewModal.tsx` (Lines 50–56, 78–93, 233–250)**:
   `minQuantity = Math.max(1, Number(product.minOrder) || 1)`.
   `quantity` state initialized to `minQuantity`, and synced via `useEffect([product.id, product.minOrder])`.
   Decrease button is disabled when `quantity <= minQuantity`.
   `handleAddToCart` sends `Math.max(minQuantity, quantity)`.

7. **`app/components/CartPageComponents/CartItem.tsx` & `app/components/CartDrawer.tsx`**:
   Decrease buttons are disabled and guarded with `item.quantity <= Math.max(1, Number(item.minOrder) || 1)`. Removal is exclusively handled via the dedicated trash button.

---

## 2. Logic Chain

1. **Cart MinOrder Correctness**:
   - In backend order processing (`app/api/orders/route.ts:233-236`), every order line is validated against `Math.max(1, dbProduct.minOrder || 1)`.
   - In storefront components (`ProductCard.tsx:92`, `WholesaleProductRow.tsx:65`, `QuickViewModal.tsx:50`, `AddToCartButton.tsx:33`), `minQuantity` is consistently computed as `Math.max(1, Number(product.minOrder) || 1)`.
   - For all boundary cases (`minOrder` = `undefined`, `null`, `0`, `1`, negative, empty string, or non-numeric string), `Math.max(1, Number(minOrder) || 1)` evaluates cleanly to `1`.
   - When `minOrder > 1` (e.g. `5`), initial addition starts at `5`. Stepper decrements on cards/rows cleanly remove the item at threshold `5`, while cart drawer/page disable the minus button at threshold `5`.
   - In `CartContext.tsx`, `normalizeCartItem` enforces `Math.max(itemMinOrder, quantity)` and `updateQuantity` clamps with `clampCartQuantity`, providing full defense-in-depth across the application.
   - Conclusion on Cart: **Meets all Acceptance Criteria and R3 requirements**.

2. **Telemetry & Privacy Defect Chain**:
   - The user request and Project Acceptance Criteria mandate:
     *"Client runtime errors trigger telemetry via Sentry without leaking guest wholesale prices or credentials."*
     *"extend lib/sentry-privacy.ts to scrub wholesale prices, auth credentials, tokens, and PII."*
   - Worker 1 extended `lib/sentry-privacy.ts` with wholesale price keys: `price|wholesalePrice|guestPrice|cost|discountPrice|wholesale|costPrice`. This successfully scrubs wholesale and cost prices.
   - However, the regex for sensitive keys is anchored with `^...$` and only includes exact literal `token`:
     `const SENSITIVE_KEY = /^(...|token|credentials|...)$/i;`
   - Common authentication token identifiers like `sessionToken`, `authToken`, `accessToken`, `refreshToken`, `apiKey`, `secretKey` do not match `^token$`.
   - String value sanitization (`sanitizeString`) only replaces tokens of length 24 or greater (`TOKEN = /\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi`).
   - Consequently, when telemetry payloads or breadcrumbs contain fields like `sessionToken: "xyz"` or `authToken: "..."`, the keys and short values survive unscrubbed.
   - The repository's adversarial test suite (`tests/sentry-privacy-adversarial.test.ts`) tests this exact scenario across `extra`, `tags`, and `breadcrumbs`, and fails on all three assertions.
   - Running full test suites (`npm run test:run`) will fail as long as these 3 tests in `tests/sentry-privacy-adversarial.test.ts` fail.
   - Conclusion on Telemetry: **Must request changes to patch compound token scrubbing in `lib/sentry-privacy.ts`**.

---

## 3. Caveats

1. **Adversarial Test Origin**:
   `tests/sentry-privacy-adversarial.test.ts` was introduced during this milestone by peer verification agents (Challenger 2). Because it lives in `tests/`, it is picked up by `vitest run` and forms an active release gate for quality gate compliance.
2. **Pre-existing Revocation Mock Failure**:
   `tests/admin-revocation.test.ts` fails due to an outdated Prisma mock (`findFirst`), which is already scoped for Milestone 4 (F11) in `PROJECT.md`. This was not caused by Milestone 1 changes.
3. **No Caveats on Cart Logic**:
   Storefront and cart components were verified across all permutations. No edge case leaks were identified in cart quantity initialization or clamping.

---

## 4. Quality & Adversarial Review Findings

### Review Summary
**Verdict**: **REQUEST_CHANGES**

---

### Findings

#### [Major] Finding 1: Compound Token & Credential Keys Leaking in Sentry Telemetry
- **What**: Telemetry privacy filter (`SENSITIVE_KEY`) in `lib/sentry-privacy.ts` does not match compound authentication token keys (such as `sessionToken`, `authToken`, `accessToken`, `refreshToken`, `apiKey`, `secretKey`) or snake_case price variants (e.g. `wholesale_price`, `cost_price`).
- **Where**: `lib/sentry-privacy.ts:1`
- **Why**: `SENSITIVE_KEY` is an exact-match regex `/^(...)$/i` containing only literal `token`. When an error, tag, extra field, or breadcrumb contains `sessionToken`, the field is not scrubbed. This leaks session credentials in telemetry and causes 3 test failures in `tests/sentry-privacy-adversarial.test.ts`.
- **Suggestion**: Update `SENSITIVE_KEY` in `lib/sentry-privacy.ts` to include compound tokens and snake_case variants:
  ```typescript
  const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|sessionToken|authToken|accessToken|refreshToken|apiKey|secretKey|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials|price|wholesalePrice|wholesale_price|guestPrice|guest_price|cost|costPrice|cost_price|discountPrice|discount_price|wholesale)$/i;
  ```
  Or match token/secret patterns: `.*(token|secret|password|credential|wholesale|cost|price).*` with appropriate boundaries.

#### [Minor] Finding 2: Unnormalized LocalStorage Cart Rehydration
- **What**: Stale cached cart items in client `localStorage` are rehydrated directly into cart state without passing through `normalizeCartItem`.
- **Where**: `app/context/CartContext.tsx:70`
- **Why**: If a returning visitor has a cart stored before the minOrder enforcement where `quantity < minOrder`, the item displays with the stale quantity until an adjustment is made.
- **Suggestion**: On line 70, map rehydrated items through `normalizeCartItem`:
  ```typescript
  setItems(parsed.map(normalizeCartItem));
  ```

---

### Integrity Verification (Zero Tolerance)
- Hardcoded test results / expected outputs embedded in source: **NONE** (functions implement real mathematical formulas and recursive sanitization).
- Dummy or facade implementations: **NONE** (all UI components, context providers, and Sentry hooks are fully functional).
- Shortcuts bypassing tasks: **NONE**.
- Fabricated verification outputs: **NONE**.

---

### Verified Claims Matrix

| Claim | Method | Result | Notes |
|-------|--------|--------|-------|
| `minOrder > 1` starts cart item at `minOrder` | Inspected `ProductCard`, `WholesaleProductRow`, `QuickViewModal`, `AddToCartButton`, `CartContext` | **PASS** | Evaluates `Math.max(1, Number(minOrder) || 1)` |
| `minOrder` in `[undefined, null, 0, 1, -1, ""]` defaults to 1 | Unit tests & static analysis | **PASS** | Cleanly evaluates to 1 |
| Decrement clamp at `minOrder` | Code inspection & `tests/cart-min-order.test.ts` | **PASS** | Cards remove item at minOrder; drawer/cart disable minus |
| `sentry.client.config.ts` exists & configured | File view & import test | **PASS** | Initializes `@sentry/nextjs` with privacy hooks |
| Wholesale prices scrubbed from Sentry | `tests/sentry-privacy.test.ts` | **PASS** | `price`, `wholesalePrice`, `guestPrice`, `cost`, etc. stripped |
| Compound auth tokens scrubbed from Sentry | `tests/sentry-privacy-adversarial.test.ts` | **FAIL** | `sessionToken` not scrubbed by `SENSITIVE_KEY` regex |
| `npm run typecheck` passes | `cmd.exe /c "npm run typecheck"` | **PASS** | Exit code 0, 0 errors |
| Base unit tests pass | `cmd.exe /c "npx vitest run tests/cart-min-order.test.ts tests/sentry-privacy.test.ts"` | **PASS** | 8/8 tests pass |

---

## 5. Verification Method

To independently verify this review and reproduce the findings:

1. **Verify TypeScript typecheck**:
   ```bash
   cmd.exe /c "npm run typecheck"
   ```
   *Result*: Code 0.

2. **Verify base unit tests pass**:
   ```bash
   cmd.exe /c "npx vitest run tests/cart-min-order.test.ts tests/sentry-privacy.test.ts"
   ```
   *Result*: 8 passed across 2 test files.

3. **Reproduce the telemetry privacy failure on compound token scrubbing**:
   ```bash
   cmd.exe /c "npx vitest run tests/sentry-privacy-adversarial.test.ts"
   ```
   *Expected Failure*: 3 tests fail with `AssertionError: expected { ... } to not have property "sessionToken"`.

4. **Inspect `lib/sentry-privacy.ts:1`**:
   Verify that `SENSITIVE_KEY` does not contain `sessionToken` or match compound token keys.
