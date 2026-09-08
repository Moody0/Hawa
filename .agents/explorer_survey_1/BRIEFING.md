# BRIEFING — 2026-09-08T13:16:30Z

## Mission
Investigate Storefront & Cart edge cases (minOrder), Sentry client-side telemetry implementation requirements, and Automated Quality Gate / ESLint warning breakdown.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis, survey
- Working directory: E:\work\hawa\.agents\explorer_survey_1
- Original parent: ccf29f83-86fe-4180-a559-3a041524307c
- Milestone: Survey Phase (Explorer 1)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code changes directly
- Output language: Always English
- .agents/ holds only agent metadata (plans, progress, handoffs)
- All findings backed by exact file paths, line numbers, and evidence

## Current Parent
- Conversation ID: ccf29f83-86fe-4180-a559-3a041524307c
- Updated: 2026-09-08T13:16:30Z

## Investigation State
- **Explored paths**:
  - `app/components/ProductsPageComponents/ProductCard.tsx`
  - `app/components/ProductsPageComponents/WholesaleProductRow.tsx`
  - `app/components/ProductsPageComponents/QuickViewModal.tsx`
  - `app/components/CartPageComponents/CartItem.tsx`
  - `app/components/CartDrawer.tsx`
  - `app/context/CartContext.tsx`
  - `app/context/ProductPurchaseContext.tsx`
  - `app/api/orders/route.ts`
  - `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`
  - `lib/sentry-privacy.ts`, `lib/monitoring.ts`, `next.config.ts`, `tests/sentry-privacy.test.ts`
  - `package.json`, `eslint.config.mjs`, `tests/admin-revocation.test.ts`
- **Key findings**:
  - `ProductCard.tsx:101` and `WholesaleProductRow.tsx:74` hardcode `quantity: 1` during `handleInitialAdd`, ignoring `minOrder`.
  - Decrement handlers `ProductCard.tsx:117` and `WholesaleProductRow.tsx:92` check `quantityInCart <= 1`, allowing quantities to drop below `minOrder` into invalid order states that fail server-side validation (`app/api/orders/route.ts:234`).
  - Edge cases (`minOrder` null, undefined, 0, <= 0) must be handled by `Math.max(1, Number(product.minOrder) || 1)`.
  - Sentry client configuration (`sentry.client.config.ts`) is missing; Next.js requires it at project root with `@sentry/nextjs`. Must integrate `scrubSentryEvent` from `lib/sentry-privacy.ts` and ensure wholesale prices and PII are redacted.
  - ESLint has exactly 189 warnings (0 errors) across 6 rules: 97 `@typescript-eslint/no-unused-vars`, 58 `@typescript-eslint/no-explicit-any`, 16 `@next/next/no-img-element`, 9 `react-hooks/exhaustive-deps`, 7 `jsx-a11y/alt-text`, 2 directives.
  - `typecheck` exits cleanly (code 0).
  - `test:run` fails 1 suite (`tests/admin-revocation.test.ts`) because mock is missing `prisma.user.findFirst`.
- **Unexplored areas**: None within Explorer 1 scope.

## Key Decisions Made
- Fully documented all 3 survey scopes with exact line numbers and proposed code diffs.
- Prepared comprehensive 5-component handoff report.

## Artifact Index
- E:\work\hawa\.agents\explorer_survey_1\progress.md — liveness and progress tracking
- E:\work\hawa\.agents\explorer_survey_1\handoff.md — 5-component handoff report
- E:\work\hawa\.agents\explorer_survey_1\eslint-report.json — raw ESLint JSON output
