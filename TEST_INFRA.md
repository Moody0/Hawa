# E2E Test Infra: Hawa B2B Platform Remediation

## Test Philosophy
- Requirement-driven, opaque-box verification. Derived from ORIGINAL_REQUEST.md.
- Verification across 4 tiers: Feature coverage (Tier 1), Boundary & Corner cases (Tier 2), Cross-Feature (Tier 3), Real-World user workflows (Tier 4).

## Feature Inventory Mapping
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 |
|---|---------|-------------|:------:|:------:|:------:|
| F1 | Cart minOrder Initialization & Clamp | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| F2 | Sentry Client Telemetry & Privacy | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| F3 | Server-Driven Admin Pagination | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| F4 | Searchable Comboboxes | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| F5 | Dashboard Query Caching & Invalidation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| F6 | Accessible Confirm Dialog | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F7 | Native confirm() Replacement | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F8 | Unified Mobile Admin Navigation | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F9 | Touch Targets & Accessible Sort Headers | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| F10 | Clean ESLint Release Gate (0 warnings) | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| F11 | Test Suite & Typecheck Release Gate | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |

## Test Architecture
- Unit/concurrency runner: `npm run test:run` (Vitest)
- Typecheck runner: `npm run typecheck`
- Lint runner: `npm run lint`
- E2E Playwright: `npx playwright test`
