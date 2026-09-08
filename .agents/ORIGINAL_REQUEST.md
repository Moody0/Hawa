# Original User Request

## 2026-09-08T13:05:22Z

Use a very large team of agents to parallelize across independent feature and remediation tracks as fast as possible.

Complete the remaining implementation tasks from E:\work\Hawa\new\WEBSITE_AUDIT_REMEDIATION_PLAN_V2.md for the Hawa B2B wholesale distribution platform, executing work in strict order: security & data integrity edge-cases first, admin correctness second, operational UX/accessibility third, and automated release gates last.

Working directory: E:\work\hawa
Integrity mode: development

## Requirements

### R1. Admin UX, Modals & Accessibility Overhaul (Phase 4)
- Create a shared, accessible confirmation dialog component (<AccessibleConfirmDialog />) with initial focus trap, Escape key handling, and focus restoration.
- Replace all native window.confirm() calls across all 10 admin client files (BannersClient.tsx, CategoriesClient.tsx, BrandsClient.tsx, UsersClient.tsx, MainCategoriesClient.tsx, ProductsClient.tsx, OrdersClient.tsx, ReviewsClient.tsx, customers/page.tsx, blog/page.tsx).
- Provide unified mobile navigation for the admin dashboard header so blog and customer views have access to navigation on mobile screens.
- Ensure all interactive touch targets meet the 44×44 px minimum and table headers feature accessible sorting buttons with aria-sort.

### R2. Admin Data Management & Scalable Pagination (Phase 3)
- Replace client-side memory loading (e.g. getAdminCategories(1, 2000)) with server-driven pagination supporting { items, total, nextCursor, previousCursor }.
- Refactor category and brand dropdowns in admin product modals into searchable, paginated comboboxes.
- Consolidate dashboard aggregate metrics into bounded queries cached for 15 seconds with mutation-based cache invalidation.

### R3. Storefront & Cart Edge Cases (Phase 2 & Phase 6)
- Initialize cart quantities from product.minOrder on ProductCard.tsx and WholesaleProductRow.tsx instead of hard-coded 1.
- Add sentry.client.config.ts to complete client-side error telemetry alongside the existing server and edge configurations.

### R4. Automated Quality Gate & Clean Linting (Phase 7)
- Resolve all 192 ESLint warnings to achieve a completely clean eslint run with zero errors and zero warnings.
- Verify tsc --noEmit, unit/concurrency tests (npm run test:run), and Playwright test suites execute cleanly.

## Acceptance Criteria

### Security & Data Integrity
- [ ] Cart item quantity added from any product card or wholesale row starts at minOrder whenever minOrder > 1.
- [ ] Client runtime errors trigger telemetry via Sentry without leaking guest wholesale prices or credentials.

### Admin Corrections & UX
- [ ] No occurrences of window.confirm() or native confirm() remain in app/admin/.
- [ ] Mobile viewports (390px width) can access all admin navigation routes without clipped headers or inaccessible overflow.
- [ ] Categories, brands, and products lists load via server pagination and don't load bulk 2,000-item arrays into memory.

### Code Quality & Release Gates
- [ ] npm run typecheck exits with code 0.
- [ ] npm run lint exits with code 0 with 0 errors and 0 warnings.
- [ ] npm run test:run passes all test suites.
