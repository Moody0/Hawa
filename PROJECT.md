# Project: Hawa B2B Platform Remediation

## Architecture
- **Framework & Runtime**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM.
- **Storefront Layer**: `app/(site)/...`, `app/components/ProductsPageComponents/...` — public B2B catalog, wholesale price redaction, responsive card/row components, cart state management (`CartContext`).
- **Admin Management Layer**: `app/admin/(dashboard)/...` — admin shell, persistent navigation, RBAC authorization, client dashboards for products, orders, categories, brands, customers, users, banners, reviews, blog.
- **API & Data Access Layer**: `app/api/...`, `lib/admin-actions.ts`, `lib/inventory-transitions.ts`, `lib/admin-validation.ts`. Server-driven pagination with `{ items, total, nextCursor, previousCursor, page, limit }`.
- **Telemetry & Monitoring**: Sentry Next.js integration (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`), PII and wholesale price scrubbing (`lib/sentry-privacy.ts`).
- **Release Verification & Testing**: Vitest/Jest unit & concurrency suites (`npm run test:run`, `npm run test:concurrency`), Playwright E2E suites, TypeScript verification (`npm run typecheck`), ESLint zero-warning gate (`npm run lint`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Cart minOrder Initialization & Clamp | Initialize cart quantity to `product.minOrder` on `ProductCard.tsx` and `WholesaleProductRow.tsx` (and `QuickViewModal.tsx`), and clamp quantity decrement at `minOrder` in `CartContext.tsx` and `CartItem.tsx` | M1 | ORIGINAL_REQUEST R3 / Explorer 1 |
| F2 | Sentry Client Telemetry & Privacy | Add `sentry.client.config.ts` (tracesSampleRate: 0.1, replaysSessionSampleRate: 0) and extend `lib/sentry-privacy.ts` to scrub wholesale prices, auth credentials, tokens, and PII | M1 | ORIGINAL_REQUEST R3 / Explorer 1 |
| F3 | Server-Driven Admin Pagination | Replace in-memory loading (e.g. `getAdminCategories(1, 2000)`, 100-item product limits, 50-order caps) with server pagination `{ items, total, page, limit, totalPages, nextCursor, previousCursor }` with deterministic `(sortField, id)` ordering | M2 | ORIGINAL_REQUEST R2 / Explorer 2 |
| F4 | Searchable Paginated Comboboxes | Replace static HTML `<select>` dropdowns in `AddProductModal.tsx` and `CategoryModal.tsx` with `<SearchableCombobox />` supporting debounced search and async/paginated loading | M2 | ORIGINAL_REQUEST R2 / Explorer 2 |
| F5 | Dashboard Query Consolidation & Caching | Consolidate 18 dashboard queries to 9 using `groupBy`, add 15s caching (`unstable_cache` with tags `['dashboard', 'admin-stats']`), and wire mutation-based cache invalidation | M2 | ORIGINAL_REQUEST R2 / Explorer 2 |
| F6 | Shared Accessible Confirm Dialog | Create `<AccessibleConfirmDialog />` (`app/admin/components/AccessibleConfirmDialog.tsx`) with WAI-ARIA `alertdialog`, initial safe focus on Cancel, tab focus trap, Escape handler, body scroll lock, focus restoration, and async loading state | M3 | ORIGINAL_REQUEST R1 / Explorer 3 |
| F7 | Replace Native confirm() Calls | Replace all 12 occurrences of `window.confirm()` / `confirm()` across all 10 admin client files (`BannersClient`, `CategoriesClient`, `BrandsClient`, `UsersClient`, `MainCategoriesClient`, `ProductsClient`, `OrdersClient`, `ReviewsClient`, `customers/page.tsx`, `blog/page.tsx`) with `<AccessibleConfirmDialog />` | M3 | ORIGINAL_REQUEST R1 / Explorer 3 |
| F8 | Unified Mobile Admin Navigation & Shell | Unify persistent admin shell header in `DashboardLayoutClient.tsx` with responsive hamburger drawer accessible from `/admin/blog` and `/admin/customers`, and fix `overflow-y-auto` scrolling container | M3 | ORIGINAL_REQUEST R1 / Explorer 3 |
| F9 | Touch Targets (44×44 px) & Accessible Sort Headers | Enforce 44×44 px minimum touch targets across admin buttons/inputs, and refactor 16 clickable `<th>` elements with `<AccessibleSortTh />` using native buttons, keyboard triggers, and `aria-sort` | M3 | ORIGINAL_REQUEST R1 / Explorer 3 |
| F10 | Clean ESLint Release Gate (0 warnings) | Resolve all 189 ESLint warnings across 54 files (unused vars, explicit any, unescaped entities, img tags) to achieve clean 0 errors and 0 warnings | M4 | ORIGINAL_REQUEST R4 / Explorer 1 |
| F11 | Fix Unit Test Suite Failure | Fix Prisma mock in `tests/admin-revocation.test.ts` (`findFirst` mock) so `npm run test:run` passes 100% of test suites | M4 | ORIGINAL_REQUEST R4 / Explorer 1 |
| F12 | Automated Release Gate Verification | Verify `npm run typecheck`, `npm run lint`, `npm run test:run`, and release verification scripts exit code 0 | M4 | ORIGINAL_REQUEST R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Security & Data Integrity Edge-Cases (Storefront & Telemetry) | F1, F2 | none | IN_PROGRESS |
| M2 | Admin Data Management & Scalable Pagination | F3, F4, F5 | M1 | PLANNED |
| M3 | Operational Admin UX, Modals & Accessibility Overhaul | F6, F7, F8, F9 | M2 | PLANNED |
| M4 | Automated Quality Gate & Clean Release Verification | F10, F11, F12 | M3 | PLANNED |

## Interface Contracts
### AccessibleConfirmDialog
```typescript
interface AccessibleConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isConfirming?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}
```

### SearchableCombobox
```typescript
interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface SearchableComboboxProps<T extends ComboboxOption = ComboboxOption> {
  value: string;
  onChange: (value: string, item?: T) => void;
  loadOptions: (query: string, page: number) => Promise<{ options: T[]; hasMore: boolean }>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  isClearable?: boolean;
}
```

### Admin Pagination Contract
```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextCursor: string | null;
  previousCursor: string | null;
  hasMore: boolean;
}
```

## Code Layout
- `app/components/ProductsPageComponents/ProductCard.tsx`
- `app/components/ProductsPageComponents/WholesaleProductRow.tsx`
- `app/components/ProductsPageComponents/QuickViewModal.tsx`
- `app/context/CartContext.tsx`
- `app/components/CartComponents/CartItem.tsx`
- `sentry.client.config.ts`
- `lib/sentry-privacy.ts`
- `app/admin/components/AccessibleConfirmDialog.tsx`
- `app/admin/components/AccessibleSortTh.tsx`
- `app/admin/components/SearchableCombobox.tsx`
- `app/admin/(dashboard)/DashboardLayoutClient.tsx`
- `app/admin/(dashboard)/layout.tsx`
- `app/admin/(dashboard)/page.tsx`
- `app/admin/(dashboard)/products/page.tsx` & `ProductsClient.tsx`
- `app/admin/(dashboard)/products/AddProductModal.tsx`
- `app/admin/(dashboard)/categories/page.tsx` & `CategoriesClient.tsx`
- `app/admin/(dashboard)/categories/CategoryModal.tsx`
- `app/admin/(dashboard)/orders/page.tsx` & `OrdersClient.tsx`
- `app/admin/(dashboard)/brands/page.tsx` & `BrandsClient.tsx`
- `app/admin/(dashboard)/users/page.tsx` & `UsersClient.tsx`
- `app/admin/(dashboard)/main-categories/page.tsx` & `MainCategoriesClient.tsx`
- `app/admin/(dashboard)/reviews/page.tsx` & `ReviewsClient.tsx`
- `app/admin/(dashboard)/customers/page.tsx`
- `app/admin/(dashboard)/blog/page.tsx`
- `lib/admin-actions.ts`
- `tests/admin-revocation.test.ts`
