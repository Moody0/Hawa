# BRIEFING — 2026-09-08T13:28:45Z

## Mission
Implement Milestone 1: Storefront & Cart Edge Cases / Telemetry (minOrder handling & Sentry client telemetry).

## 🔒 My Identity
- Archetype: implementer, qa
- Roles: implementer, qa
- Working directory: E:\work\hawa\.agents\worker_m1
- Original parent: ccf29f83-86fe-4180-a559-3a041524307c
- Milestone: Milestone 1 - Storefront & Cart Edge Cases / Telemetry

## 🔒 Key Constraints
- Genuine implementation only; no dummy/facade implementations or hardcoded shortcuts.
- Minimal change principle.
- Strict TypeScript typecheck passing.
- Arabic UI strings/comments not allowed in agent communication/code commentary unless already present in Arabic strings.
- Files to modify/create:
  * app/components/ProductsPageComponents/ProductCard.tsx
  * app/components/ProductsPageComponents/WholesaleProductRow.tsx
  * app/components/ProductsPageComponents/QuickViewModal.tsx
  * app/context/CartContext.tsx
  * app/components/CartPageComponents/CartItem.tsx
  * app/components/CartDrawer.tsx
  * app/components/ProductsPageComponents/AddToCartButton.tsx
  * sentry.client.config.ts (new)
  * lib/sentry-privacy.ts
  * tests/cart-min-order.test.ts (new)
  * tests/sentry-privacy.test.ts

## Current Parent
- Conversation ID: ccf29f83-86fe-4180-a559-3a041524307c
- Updated: 2026-09-08T13:28:45Z

## Task Summary
- **What to build**:
  1. Storefront & Cart minOrder initialization & decrement handling across ProductCard, WholesaleProductRow, QuickViewModal, CartContext, and CartItem (plus CartDrawer & AddToCartButton).
  2. Sentry client-side telemetry in sentry.client.config.ts with scrubSentryEvent integration and extended sensitive key scrubbing in lib/sentry-privacy.ts.
- **Success criteria**:
  - minOrder properly respected in initial add, decrement, modal, cart context, and cart item.
  - Sentry client telemetry initialized cleanly with PII and wholesale price scrubbing.
  - TypeScript typecheck passes with 0 errors.
  - Relevant unit tests pass.
- **Interface contracts**: PROJECT.md, ORIGINAL_REQUEST.md
- **Code layout**: Next.js App Router codebase

## Key Decisions Made
- Exported `normalizeCartItem` and `clampCartQuantity` helpers in `CartContext.tsx` to ensure uniform sanitization and enable direct unit testing.
- Added comprehensive unit tests in `tests/cart-min-order.test.ts` (6 tests) and extended `tests/sentry-privacy.test.ts` (2 tests).
- All 8 unit tests passing and `npm run typecheck` verified clean.

## Change Tracker
- **Files modified**:
  * `app/components/ProductsPageComponents/ProductCard.tsx`: Initial add with minOrder, decrease removal/decrement clamp.
  * `app/components/ProductsPageComponents/WholesaleProductRow.tsx`: Initial add with minOrder, decrease removal/decrement clamp.
  * `app/components/ProductsPageComponents/QuickViewModal.tsx`: Quantity state initialized from minOrder, decrease clamp, disable state.
  * `app/context/CartContext.tsx`: `addItem` normalizes quantity to minOrder, `updateQuantity` clamps to minOrder or removes on 0. Exported helpers.
  * `app/components/CartPageComponents/CartItem.tsx`: Decrement disabled and guarded at minOrder.
  * `app/components/CartDrawer.tsx`: Decrement disabled and guarded at minOrder.
  * `app/components/ProductsPageComponents/AddToCartButton.tsx`: minOrder passed to addItem.
  * `sentry.client.config.ts`: Client-side Sentry initialization with privacy scrubber.
  * `lib/sentry-privacy.ts`: SENSITIVE_KEY extended with wholesale price fields.
  * `tests/sentry-privacy.test.ts`: Added test for wholesale price scrubbing.
  * `tests/cart-min-order.test.ts`: Created new unit test suite for minOrder logic.
- **Build status**: PASS (`tsc --noEmit` code 0)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (8/8 tests pass in cart and sentry suites, typecheck 0 errors)
- **Lint status**: Ready for M4 lint sweep
- **Tests added/modified**: `tests/cart-min-order.test.ts` (new 6 tests), `tests/sentry-privacy.test.ts` (1 added test)

## Artifact Index
- E:\work\hawa\.agents\worker_m1\DISPATCH.md
- E:\work\hawa\.agents\worker_m1\BRIEFING.md
- E:\work\hawa\.agents\worker_m1\progress.md
- E:\work\hawa\.agents\worker_m1\handoff.md
