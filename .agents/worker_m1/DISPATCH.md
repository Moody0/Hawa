## 2026-09-08T13:18:47Z
You are Worker 1 for Milestone 1: Storefront & Cart Edge Cases / Telemetry.
Your working directory is: E:\work\hawa\.agents\worker_m1
Your parent orchestrator is: ccf29f83-86fe-4180-a559-3a041524307c
Project root: E:\work\hawa

MANDATORY FIRST STEP: Read the authoritative user request at:
E:\work\hawa\.agents\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
E:\work\hawa\PROJECT.md
And carefully read the comprehensive technical findings and implementation plan in:
E:\work\hawa\.agents\explorer_survey_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SCOPE OF IMPLEMENTATION (Milestone 1):
1. F1: Storefront & Cart minOrder Initialization & Decrement Handling:
   - File: app/components/ProductsPageComponents/ProductCard.tsx
     * In handleInitialAdd: initialize quantity with Math.max(1, Number(product.minOrder) || 1) instead of hardcoded 1.
     * In handleDecrease: when quantityInCart <= minOrder, call removeItem(product.id). Otherwise call updateQuantity(product.id, quantityInCart - 1).
     * Update quantity stepper decrease button title / aria-label to indicate removal when at minOrder.
   - File: app/components/ProductsPageComponents/WholesaleProductRow.tsx
     * In handleInitialAdd: initialize quantity with Math.max(1, Number(product.minOrder) || 1) instead of hardcoded 1.
     * In handleDecrease: when quantityInCart <= minOrder, call removeItem(product.id, defaultOption). Otherwise call updateQuantity(product.id, quantityInCart - 1, defaultOption).
     * Update minus button title to reflect removal when at minOrder.
   - File: app/components/ProductsPageComponents/QuickViewModal.tsx
     * In initial state: initialize quantity to Math.max(1, Number(product.minOrder) || 1) instead of hardcoded 1.
     * In handleDecrement: do not allow decrementing below Math.max(1, Number(product.minOrder) || 1).
   - File: app/context/CartContext.tsx
     * In addItem: ensure item quantity defaults to Math.max(1, Number(item.minOrder) || 1).
     * In updateQuantity: if newQuantity is less than minOrder and newQuantity > 0, clamp to minOrder or remove if explicit 0.
   - File: app/components/CartComponents/CartItem.tsx
     * In decrease handler: if quantity <= minOrder, remove or prevent dropping below minOrder.

2. F2: Sentry Client-Side Telemetry:
   - Create root file: sentry.client.config.ts
     * Use @sentry/nextjs: Sentry.init({ ... })
     * DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || ''
     * tracesSampleRate: 0.1
     * replaysSessionSampleRate: 0
     * replaysOnErrorSampleRate: 0
     * beforeSend: integrate scrubSentryEvent from lib/sentry-privacy.ts
     * environment: process.env.NODE_ENV || 'production'
     * enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN)
   - File: lib/sentry-privacy.ts
     * Extend SENSITIVE_KEY regex / list to scrub wholesale price keys: price, wholesalePrice, guestPrice, cost, discountPrice.
     * Ensure guest wholesale prices, credentials, auth tokens, cookies, and PII are never leaked.

VERIFICATION REQUIRED:
- Run `npm run typecheck` to ensure no TypeScript compilation errors.
- Run tests for cart/sentry where applicable.
- Ensure all modified files adhere strictly to project conventions.

OUTPUT REQUIREMENTS:
- Update progress.md in your working directory as you proceed.
- Write your complete handoff report to E:\work\hawa\.agents\worker_m1\handoff.md with all files modified, diff summary, test command runs, and outputs.
- Send a message back to your parent orchestrator when complete.
