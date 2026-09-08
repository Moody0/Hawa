# Handoff Report — Milestone 1: Storefront & Cart Edge Cases / Telemetry

**Worker**: Worker 1 (`.agents/worker_m1`)  
**Parent Orchestrator**: `ccf29f83-86fe-4180-a559-3a041524307c`  
**Date**: 2026-09-08  
**Working Directory**: `E:\work\hawa\.agents\worker_m1`  
**Project Root**: `E:\work\hawa`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

### 1.1 Storefront & Cart `minOrder` Defect Observations
1. **`app/components/ProductsPageComponents/ProductCard.tsx`**:
   - `handleInitialAdd` was previously hardcoding `quantity: 1` regardless of `product.minOrder`.
   - `handleDecrease` checked `if (quantityInCart <= 1)`, allowing quantities to drop below `minOrder` when `minOrder > 1`.
   - Stepper minus button title was generic and did not reflect removal when at minimum order threshold.
2. **`app/components/ProductsPageComponents/WholesaleProductRow.tsx`**:
   - `handleInitialAdd` was hardcoding `quantity: 1`.
   - `handleDecrease` checked `if (quantityInCart <= 1)`.
   - Minus button title checked `quantityInCart <= 1` instead of `minQuantity`.
3. **`app/components/ProductsPageComponents/QuickViewModal.tsx`**:
   - Modal state `quantity` initialized to hardcoded `1`.
   - Decrement button lacked disabled state when at `minQuantity` and did not sync when `product.id` changed.
4. **`app/context/CartContext.tsx`**:
   - `addItem` accepted raw quantity without ensuring the line item satisfies `minOrder`.
   - `updateQuantity` only checked `if (quantity < 1) return;`, omitting clamping to `minOrder`.
5. **`app/components/CartPageComponents/CartItem.tsx` & `app/components/CartDrawer.tsx`**:
   - Decrement buttons were disabled only when `item.quantity <= 1`, ignoring `item.minOrder`.

### 1.2 Sentry Client Telemetry & Privacy Observations
1. **Missing Root File**:
   - `sentry.client.config.ts` was missing from the project root while `sentry.server.config.ts` and `sentry.edge.config.ts` existed. Next.js Sentry integration requires `sentry.client.config.ts` for client runtime telemetry.
2. **Privacy Scrubbing Scope (`lib/sentry-privacy.ts`)**:
   - `SENSITIVE_KEY` regex did not include wholesale price keys (`price`, `wholesalePrice`, `guestPrice`, `cost`, `discountPrice`, `wholesale`, `costPrice`), risking leakage of confidential wholesale rates in client/server telemetry context.

---

## 2. Logic Chain

1. **Cart Data Integrity**:
   - Backend order validation (`app/api/orders/route.ts:233-236`) throws an error and rejects transactions if `item.quantity < Math.max(1, dbProduct.minOrder || 1)`.
   - Initializing cart additions from `ProductCard`, `WholesaleProductRow`, `AddToCartButton`, and `QuickViewModal` with `Math.max(1, Number(product.minOrder) || 1)` ensures all initial cart items meet checkout constraints.
   - On the product cards and table rows, decreasing a cart item that is already at `minOrder` removes the item entirely (`removeItem`), providing intuitive quick-stepper UX.
   - In `CartContext.tsx`, central normalization (`normalizeCartItem`) and clamping (`clampCartQuantity`) protect all entry points: `addItem` defaults quantity to at least `minOrder`, and `updateQuantity` clamps positive values below `minOrder` to `minOrder` or removes the item if set to `0` or negative.
   - In `CartItem.tsx` and `CartDrawer.tsx`, the decrease button is disabled and guarded when `item.quantity <= minQuantity`, preventing accidental invalid cart states.
2. **Telemetry & Privacy**:
   - Creating `sentry.client.config.ts` with `tracesSampleRate: 0.1`, `replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 0`, and `beforeSend: (event) => scrubSentryEvent(event)` completes Next.js client error telemetry while adhering to the Phase 6 session replay privacy policy.
   - Extending `SENSITIVE_KEY` in `lib/sentry-privacy.ts` with `price|wholesalePrice|guestPrice|cost|discountPrice|wholesale|costPrice` guarantees that confidential wholesale prices and costs are stripped from telemetry payloads, extra metadata, breadcrumbs, and request details.

---

## 3. Caveats

1. **Session Replay Intentional Exclusion**:
   - `replaysSessionSampleRate: 0` and `replaysOnErrorSampleRate: 0` are intentionally set to zero as mandated by security and privacy requirements.
2. **Pre-existing Database-Dependent Tests**:
   - `tests/admin-revocation.test.ts` failure is an upstream Explorer 1 finding targeted for Milestone 4 (Prisma mock update). Milestone 1 unit tests (`tests/cart-min-order.test.ts` and `tests/sentry-privacy.test.ts`) pass 100%.

---

## 4. Conclusion

Milestone 1 implementation is complete, verified, and strictly follows project specifications:
- **Files Modified/Created**:
  * `sentry.client.config.ts` (created)
  * `lib/sentry-privacy.ts` (modified)
  * `app/components/ProductsPageComponents/ProductCard.tsx` (modified)
  * `app/components/ProductsPageComponents/WholesaleProductRow.tsx` (modified)
  * `app/components/ProductsPageComponents/QuickViewModal.tsx` (modified)
  * `app/context/CartContext.tsx` (modified)
  * `app/components/CartPageComponents/CartItem.tsx` (modified)
  * `app/components/CartDrawer.tsx` (modified)
  * `app/components/ProductsPageComponents/AddToCartButton.tsx` (modified)
  * `tests/cart-min-order.test.ts` (created)
  * `tests/sentry-privacy.test.ts` (modified)
- **TypeScript Verification**:
  * `cmd.exe /c "npm run typecheck"` (`tsc --noEmit`) passes with 0 errors (exit code 0).
- **Unit Test Verification**:
  * `cmd.exe /c "npx vitest run tests/cart-min-order.test.ts tests/sentry-privacy.test.ts"` passes 8/8 tests across 2 test files (exit code 0).

---

## 5. Verification Method

To independently verify Worker 1 changes:

1. **TypeScript Typecheck**:
   ```bash
   cmd.exe /c "npm run typecheck"
   ```
   *Expected output*: `tsc --noEmit` exits with code 0 with 0 errors.

2. **Unit Tests (Cart & Sentry Privacy)**:
   ```bash
   cmd.exe /c "npx vitest run tests/cart-min-order.test.ts tests/sentry-privacy.test.ts"
   ```
   *Expected output*: 2 test files passed, 8 tests passed, 0 failures.

3. **Inspect Modified Files**:
   - Verify `sentry.client.config.ts` exists and initializes Sentry with `scrubSentryEvent`.
   - Verify `lib/sentry-privacy.ts` regex includes wholesale pricing fields.
   - Verify `ProductCard.tsx`, `WholesaleProductRow.tsx`, `QuickViewModal.tsx`, `CartContext.tsx`, and `CartItem.tsx` handle `minOrder`.
