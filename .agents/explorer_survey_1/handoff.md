# Survey Phase Handoff Report — Explorer 1

**Author**: Explorer 1 (`.agents/explorer_survey_1`)  
**Parent Orchestrator**: `ccf29f83-86fe-4180-a559-3a041524307c`  
**Date**: 2026-09-08  
**Working Directory**: `E:\work\hawa\.agents\explorer_survey_1`  
**Project Root**: `E:\work\hawa`  
**Task Scope**: Storefront & Cart Edge Cases, Sentry Client-Side Telemetry, Automated Quality Gate & ESLint Analysis

---

## 1. Observation

### 1.1 Storefront & Cart Minimum Order (`minOrder`) Observations

#### 1.1.1 `ProductCard.tsx` (`app/components/ProductsPageComponents/ProductCard.tsx`)
- **Lines 92–106 (`handleInitialAdd`)**:
  ```typescript
  92:     const handleInitialAdd = (e: React.MouseEvent) => {
  93:         e.preventDefault();
  94:         e.stopPropagation();
  95:         addItem({
  96:             id: product.id,
  97:             name: displayName,
  98:             price: Number(product.discountPrice || product.price),
  99:             image: primaryImage,
  100:             slug: product.slug,
  101:             quantity: 1,
  102:             packaging: formatPackaging(product.packaging, language),
  103:             itemsPerPackage: product.itemsPerPackage || null,
  104:             minOrder: product.minOrder || 1,
  105:         });
  106:     };
  ```
  **Direct Observation**: Line 101 hardcodes `quantity: 1` instead of using `product.minOrder`.
- **Lines 114–122 (`handleDecrease`)**:
  ```typescript
  114:     const handleDecrease = (e: React.MouseEvent) => {
  115:         e.preventDefault();
  116:         e.stopPropagation();
  117:         if (quantityInCart <= 1) {
  118:             removeItem(product.id);
  119:         } else {
  120:             updateQuantity(product.id, quantityInCart - 1);
  121:         }
  122:     };
  ```
  **Direct Observation**: Line 117 only triggers `removeItem` when `quantityInCart <= 1`. If `minOrder > 1` (e.g. 5) and `quantityInCart === 5`, clicking decrease reduces the quantity to 4, dropping below the mandatory `minOrder` threshold.
- **Lines 226–229 (Quantity Stepper Button)**:
  ```typescript
  226:         className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer touch-manipulation"
  227:         aria-label="Decrease quantity"
  228:         title="Decrease quantity"
  ```
  Does not reflect removal intent when quantity is at minimum.

#### 1.1.2 `WholesaleProductRow.tsx` (`app/components/ProductsPageComponents/WholesaleProductRow.tsx`)
- **Lines 65–81 (`handleInitialAdd`)**:
  ```typescript
  65:     const handleInitialAdd = (e: React.MouseEvent) => {
  66:         e.preventDefault();
  67:         e.stopPropagation();
  68:         addItem({
  69:             id: product.id,
  70:             name: displayName,
  71:             price: Number(product.discountPrice || product.price),
  72:             image: primaryImage,
  73:             slug: product.slug,
  74:             quantity: 1,
  75:             description: displayDesc || undefined,
  76:             selectedOption: defaultOption,
  77:             packaging: formatPackaging(product.packaging, language),
  78:             itemsPerPackage: product.itemsPerPackage || null,
  79:             minOrder: product.minOrder || 1,
  80:         });
  81:     };
  ```
  **Direct Observation**: Line 74 hardcodes `quantity: 1` regardless of `product.minOrder`.
- **Lines 89–97 (`handleDecrease`)**:
  ```typescript
  89:     const handleDecrease = (e: React.MouseEvent) => {
  90:         e.preventDefault();
  91:         e.stopPropagation();
  92:         if (quantityInCart <= 1) {
  93:             removeItem(product.id, defaultOption);
  94:         } else {
  95:             updateQuantity(product.id, quantityInCart - 1, defaultOption);
  96:         }
  97:     };
  ```
  **Direct Observation**: Line 92 checks `quantityInCart <= 1`. If `minOrder` is 10, decreasing from 10 yields 9, which breaches minimum order constraint.
- **Line 264 (Title attribute on Minus button)**:
  ```typescript
  264:         title={quantityInCart <= 1 ? (isArabic ? "حذف من الطلب" : "Remove") : undefined}
  ```
  **Direct Observation**: Explicit developer intent was that clicking minus at minimum order removes the item from the order, but the threshold was hardcoded to `1`.

#### 1.1.3 `QuickViewModal.tsx` (`app/components/ProductsPageComponents/QuickViewModal.tsx`)
- **Line 50**:
  ```typescript
  50:     const [quantity, setQuantity] = useState(1);
  ```
  **Direct Observation**: Initialized to `1`. If a user opens quick view for a product with `minOrder = 5` and clicks "Add to Cart" (line 74–86), `quantity: 1` is added to the cart.
- **Line 230**:
  ```typescript
  230:         onClick={() => setQuantity(Math.max(product.minOrder || 1, quantity - 1))}
  ```
  **Direct Observation**: The decrement button enforces `Math.max(product.minOrder || 1, ...)`, which creates an inconsistent jump if `quantity` starts at 1.

#### 1.1.4 `CartItem.tsx` (`app/components/CartPageComponents/CartItem.tsx`)
- **Line 95**:
  ```typescript
  94:         <button
  95:             onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
  96:             disabled={item.quantity <= 1}
  ```
  **Direct Observation**: Line 96 disables decrement only when `item.quantity <= 1`, ignoring `item.minOrder`.

#### 1.1.5 `CartDrawer.tsx` (`app/components/CartDrawer.tsx`)
- **Line 203**:
  ```typescript
  203:         <button 
  204:             onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
  ```
  **Direct Observation**: Decrement does not check `item.minOrder`.

#### 1.1.6 `CartContext.tsx` (`app/context/CartContext.tsx`)
- **Lines 70–88 (`addItem`)**:
  Accepts `newItem.quantity` without enforcing `newItem.minOrder`.
- **Lines 100–109 (`updateQuantity`)**:
  ```typescript
  100:     const updateQuantity = (id: string, quantity: number, selectedOption?: string) => {
  101:         if (quantity < 1) return;
  ```
  **Direct Observation**: Enforces `quantity < 1` instead of `quantity < Math.max(1, item.minOrder || 1)`.

#### 1.1.7 Server-Side Order Verification (`app/api/orders/route.ts`)
- **Lines 226–237**:
  ```typescript
  226:             // Verify all products exist and satisfy minOrder requirements
  227:             for (const item of aggregatedItems) {
  228:                 const dbProduct = productMap.get(item.productId);
  229:                 if (!dbProduct) {
  230:                     throw new Error(`المنتج المطلوب غير متوفر أو تم حذفه (${item.productId})`);
  231:                 }
  232: 
  233:                 const minQty = Math.max(1, dbProduct.minOrder || 1);
  234:                 if (item.quantity < minQty) {
  235:                     throw new Error(`الحد الأدنى للطلب من "${dbProduct.nameAr || dbProduct.name}" هو ${minQty} طرد`);
  236:                 }
  237:             }
  ```
  **Direct Observation**: The backend strictly aborts the order transaction and throws an error if any line item has `quantity < minQty`.

---

### 1.2 Sentry Client-Side Telemetry Observations

1. **Existing Configurations**:
   - `sentry.server.config.ts`: Configured with `tracesSampleRate: 0.1`, `sendDefaultPii: false`, `beforeSend: (event) => scrubSentryEvent(event)`.
   - `sentry.edge.config.ts`: Identical configuration to `sentry.server.config.ts`.
   - `instrumentation.ts`: Registers `sentry.server.config` and `sentry.edge.config` dynamically for Node.js and Edge runtimes.
   - `instrumentation-client.ts`: File exists containing client initialization, but Next.js `@sentry/nextjs` expects `sentry.client.config.ts` in the project root alongside `sentry.server.config.ts` and `sentry.edge.config.ts`.
   - `sentry.client.config.ts`: **Does not exist**.
2. **Privacy Scrubber (`lib/sentry-privacy.ts`)**:
   ```typescript
   1: const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials)$/i;
   2: const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
   3: const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
   4: const TOKEN = /\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi;
   ```
   - Deletes `mutable.user`, `safeRequest.data`, `safeRequest.cookies`, `safeRequest.headers`, `safeRequest.query_string`.
   - Redacts email, phone, and tokens via `sanitizeString`.
   - Strips keys matching `SENSITIVE_KEY`.
   - **Key Gap**: `SENSITIVE_KEY` does not currently include price-specific fields (e.g. `price`, `wholesalePrice`, `discountPrice`, `wholesale`), which could leak guest wholesale price calculations if passed in context/extra.
3. **CSP & Next Config (`next.config.ts`)**:
   - Line 35: `connect-src` includes `https://*.ingest.sentry.io`.
   - Wrapped with `withSentryConfig(analyzedConfig, { ... })`.

---

### 1.3 Automated Quality Gate & ESLint Observations

#### 1.3.1 ESLint Execution
- Command executed: `cmd.exe /c "npx eslint --format json"`
- Output summary: **0 errors, 189 warnings** (across 54 files).
- **Rule Breakdown**:
  | Rule | Warning Count | Primary Locations |
  |---|---|---|
  | `@typescript-eslint/no-unused-vars` | 97 | Admin dashboard clients, unused catch error arguments in `lib/catalog.ts` (7), site content (18), page components |
  | `@typescript-eslint/no-explicit-any` | 58 | `tests/admin-revocation.test.ts` (12), `lib/price-visibility.ts` (5), `lib/admin-actions.ts` (5), `app/components/HomePageComponents/Main.tsx` (3), `app/context/LanguageContext.tsx` (3) |
  | `@next/next/no-img-element` | 16 | Admin modals/clients (`BannersClient`, `BrandsClient`, `CategoriesClient`, `ImageUploadField`, `ReviewModal`, `ProductGallery`) using `<img>` instead of Next `<Image />` or custom component |
  | `react-hooks/exhaustive-deps` | 9 | `DashboardClient.tsx` (4), `ProductsClient.tsx` (1), `BrandShowcaseClient.tsx` (1), `NavigationProgressBar.tsx` (1), `CategorySelector.tsx` (1), `ReviewsClient.tsx` (1) |
  | `jsx-a11y/alt-text` | 7 | `<img>` elements without explicit `alt` text in admin components (`BannerModal`, `BrandsClient`, `CategoriesClient`, `RelatedItemsModal`, `MainCategoriesClient`, `ReviewsClient`, `SiteContentClient`) |
  | Unused disable directives | 2 | `RelatedProducts.tsx:13:1`, `ResilientImage.tsx:1:1` |

- **Top Files by Warning Count**:
  1. `app/admin/(dashboard)/site-content/SiteContentClient.tsx`: 20 warnings (18 unused vars, 1 no-img-element, 1 alt-text)
  2. `tests/admin-revocation.test.ts`: 12 warnings (12 explicit any)
  3. `app/(site)/shipping-returns/ShippingReturnsContent.tsx`: 9 warnings (8 unused vars, 1 explicit any)
  4. `lib/catalog.ts`: 9 warnings (7 unused `error` in catch blocks, 2 explicit any)
  5. `app/(site)/blog/[slug]/page.tsx`: 7 warnings (4 unused vars, 3 explicit any)
  6. `lib/admin-actions.ts`: 6 warnings (1 unused var, 5 explicit any)
  7. `app/admin/(dashboard)/customers/page.tsx`: 5 warnings (5 unused vars)
  8. `app/admin/(dashboard)/orders/OrdersClient.tsx`: 5 warnings (5 unused vars)
  9. `app/admin/(dashboard)/dashboard/DashboardClient.tsx`: 5 warnings (4 missing hook deps, 1 explicit any)
  10. `app/admin/(dashboard)/components/RelatedItemsModal.tsx`: 5 warnings (2 explicit any, 2 no-img-element, 1 alt-text)
  11. `lib/price-visibility.ts`: 5 warnings (5 explicit any)
  12. `app/(site)/about-us/AboutUsClient.tsx`: 5 warnings (5 unused vars)

#### 1.3.2 TypeScript Typecheck (`npm run typecheck`)
- Command: `tsc --noEmit`
- Result: Exited with code 0 (zero type errors).

#### 1.3.3 Vitest Unit & Integration Tests (`npm run test:run`)
- Command: `vitest run`
- Result: **1 failed, 10 passed** (83 passed, 6 failed).
- **Failing Suite**: `tests/admin-revocation.test.ts` (all 6 tests failed).
- **Error Verbatim**:
  ```
  TypeError: prisma.user.findFirst is not a function
   ❯ loadAdminUser lib/admin-auth.ts:44:22
       42| 
       43| async function loadAdminUser(id: string) {
       44|   return prisma.user.findFirst({
         |                      ^
       45|     where: { id, archivedAt: null, disabledAt: null },
       46|     include: liveUserInclude,
  ```
- **Cause**: `tests/admin-revocation.test.ts` lines 10–16 mocks `@/lib/prisma` with only `findUnique: vi.fn()`. When `lib/admin-auth.ts` was upgraded to use `prisma.user.findFirst` for soft deletion checks, the test mock was not updated.

---

## 2. Logic Chain

### 2.1 Logic: Storefront & Cart `minOrder` Defect to Checkout Failure
1. **Fact (Observation 1.1.1, 1.1.2)**: In `ProductCard.tsx:101` and `WholesaleProductRow.tsx:74`, `addItem` is called with `quantity: 1`, irrespective of `product.minOrder`.
2. **Fact (Observation 1.1.7)**: When an order is placed, `app/api/orders/route.ts:234` compares `item.quantity < Math.max(1, dbProduct.minOrder || 1)`. If `quantity < minQty`, the server transaction throws `الحد الأدنى للطلب هو ...` and aborts.
3. **Inference**: Any customer adding a wholesale product with `minOrder > 1` from the main catalog card or wholesale table will add an invalid quantity of 1. At checkout, the order will fail with an unhandled rejection or user-facing error.
4. **Fact (Observation 1.1.1, 1.1.2)**: `handleDecrease` in both components decrements until `quantityInCart <= 1`.
5. **Inference**: Even if a customer sets quantity to `minOrder` (e.g. 5) on product details and later visits a product list, clicking the minus button on the card will decrement from 5 to 4, dropping into the prohibited zone.
6. **Edge Case Analysis**:
   - `minOrder: null` or `minOrder: undefined` -> `Math.max(1, Number(product.minOrder) || 1)` evaluates to `1`. Valid.
   - `minOrder: 0` or `minOrder <= 0` -> `0 || 1` is 1; `Math.max(1, 1)` evaluates to `1`. Valid.
   - `minOrder: 1` -> evaluates to `1`. Valid.
   - `minOrder > 1` (e.g. 10) -> evaluates to `10`. Valid.
   - String `minOrder: "10"` -> `Number("10") || 1` evaluates to `10`. Valid.
7. **Actionable Adjustment Rule**:
   - `handleInitialAdd`: must initialize `quantity: Math.max(1, Number(product.minOrder) || 1)`.
   - `handleDecrease`: if `quantityInCart <= minQuantity`, call `removeItem`; otherwise call `updateQuantity(..., quantityInCart - 1)`.
   - `CartContext.tsx`: normalize `quantity` in `addItem` to be at least `minOrder`, and prevent `updateQuantity` from accepting values below `minOrder`.

### 2.2 Logic: Sentry Client-Side Telemetry Requirement
1. **Fact (Observation 1.2)**: Next.js with `@sentry/nextjs` automatically injects `sentry.client.config.ts` into the browser bundle. Currently, only `sentry.server.config.ts` and `sentry.edge.config.ts` exist.
2. **Fact (Observation 1.2)**: `instrumentation-client.ts` was drafted but is not the canonical file evaluated by Next.js Sentry webpack plugin for client runtime initialization.
3. **Fact (Observation 1.2.2)**: `lib/sentry-privacy.ts` cleans PII, user info, cookies, and tokens. However, the user request explicitly demands: *"Client runtime errors trigger telemetry via Sentry without leaking guest wholesale prices or credentials"*.
4. **Inference**:
   - `sentry.client.config.ts` must be created at the project root.
   - It must import `scrubSentryEvent` from `@/lib/sentry-privacy`.
   - `SENSITIVE_KEY` in `lib/sentry-privacy.ts` must include price keys (`wholesalePrice`, `price`, `discountPrice`, `wholesale`, `costPrice`) to guarantee guest wholesale rates are scrubbed from telemetry payloads.
   - Client DSN must use `process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN`.
   - `sendDefaultPii: false`, `replaysSessionSampleRate: 0`, and `tracesSampleRate: 0.1` must be configured.

### 2.3 Logic: Quality Gate & ESLint Resolution Path
1. **Fact (Observation 1.3.1)**: There are 189 warnings and 0 errors across 54 files.
2. **Fact (Observation 1.3.2)**: `tsc --noEmit` exits with code 0.
3. **Fact (Observation 1.3.3)**: Vitest fails 6 tests solely because `prisma.user.findFirst` is not defined on the Prisma mock in `tests/admin-revocation.test.ts`.
4. **Inference**:
   - Fixing `tests/admin-revocation.test.ts` mock by defining `findFirst: vi.fn()` will immediately restore `npm run test:run` to 100% pass (89/89 tests).
   - Reaching 0 ESLint warnings requires addressing 4 clusters:
     a. Removing/prefixing unused variables (97 instances, mostly prefixing with `_` or removing unused imports).
     b. Replacing or casting `any` in `admin-revocation.test.ts` (12), `lib/price-visibility.ts` (5), `lib/admin-actions.ts` (5), etc. (58 instances).
     c. Replacing raw `<img>` with Next `<Image />` or adding `/* eslint-disable @next/next/no-img-element */` where appropriate (16 instances in admin).
     d. Adding missing dependencies to `useEffect` hooks (9 instances) and adding `alt` attributes to images (7 instances).

---

## 3. Caveats

1. **No Source Code Direct Modification**: In accordance with the Explorer archetype and read-only investigation rules, no project source code files were modified during this investigation. Detailed proposed code implementations are provided below.
2. **PostgreSQL Concurrency Tests**: `npm run test:concurrency` interacts with PostgreSQL. In CI environments, this requires a running test database container (`prisma/seed-test.ts`).
3. **Smoke Test Prerequisite**: `npm run test:smoke` checks `.next/BUILD_ID` and thus requires `npm run build` prior to execution.
4. **Session Replay Exclusion**: Session replay is intentionally set to `0` per the Phase 6 remediation mandate ("no session replay without privacy review").

---

## 4. Conclusion & Proposed Remediation

### 4.1 Track 1: Storefront & Cart Proposed Implementation

#### A. `app/components/ProductsPageComponents/ProductCard.tsx`
```typescript
// Replace lines 92-122 with:
const minQuantity = Math.max(1, Number(product.minOrder) || 1);

const handleInitialAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
        id: product.id,
        name: displayName,
        price: Number(product.discountPrice || product.price),
        image: primaryImage,
        slug: product.slug,
        quantity: minQuantity,
        packaging: formatPackaging(product.packaging, language),
        itemsPerPackage: product.itemsPerPackage || null,
        minOrder: minQuantity,
    });
};

const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
};

const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart <= minQuantity) {
        removeItem(product.id);
    } else {
        updateQuantity(product.id, quantityInCart - 1);
    }
};
```
Also update line 228 to display removal title when `quantityInCart <= minQuantity`:
```typescript
title={quantityInCart <= minQuantity ? (isArabic ? "حذف من الطلب" : "Remove from order") : (isArabic ? "تقليل الكمية" : "Decrease quantity")}
```

#### B. `app/components/ProductsPageComponents/WholesaleProductRow.tsx`
```typescript
// Replace lines 65-97 with:
const minQuantity = Math.max(1, Number(product.minOrder) || 1);

const handleInitialAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
        id: product.id,
        name: displayName,
        price: Number(product.discountPrice || product.price),
        image: primaryImage,
        slug: product.slug,
        quantity: minQuantity,
        description: displayDesc || undefined,
        selectedOption: defaultOption,
        packaging: formatPackaging(product.packaging, language),
        itemsPerPackage: product.itemsPerPackage || null,
        minOrder: minQuantity,
    });
};

const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1, defaultOption);
};

const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart <= minQuantity) {
        removeItem(product.id, defaultOption);
    } else {
        updateQuantity(product.id, quantityInCart - 1, defaultOption);
    }
};
```
Also update line 264:
```typescript
title={quantityInCart <= minQuantity ? (isArabic ? "حذف من الطلب" : "Remove") : undefined}
```

#### C. `app/components/ProductsPageComponents/QuickViewModal.tsx`
```typescript
// Line 50:
const minQuantity = Math.max(1, Number(product.minOrder) || 1);
const [quantity, setQuantity] = useState(minQuantity);

// Add useEffect to sync on product change:
useEffect(() => {
    setQuantity(Math.max(1, Number(product.minOrder) || 1));
}, [product.id, product.minOrder]);
```

#### D. `app/context/CartContext.tsx`
```typescript
// In addItem:
const addItem = (newItem: CartItem) => {
    const cleanOption = (newItem.selectedOption || '').trim() || undefined;
    const itemMinOrder = Math.max(1, Number(newItem.minOrder) || 1);
    const normalizedItem: CartItem = {
        ...newItem,
        selectedOption: cleanOption,
        minOrder: itemMinOrder,
        quantity: Math.max(itemMinOrder, newItem.quantity || 1),
    };
    ...
};

// In updateQuantity:
const updateQuantity = (id: string, quantity: number, selectedOption?: string) => {
    const targetKey = `${id}:${(selectedOption || '').trim()}`;
    setItems(prev => prev.map(item => {
        const matches = selectedOption !== undefined
            ? getItemKey(item) === targetKey
            : item.id === id;
        if (!matches) return item;
        const minQty = Math.max(1, Number(item.minOrder) || 1);
        if (quantity < minQty) return item;
        return { ...item, quantity };
    }));
};
```

#### E. `app/components/CartPageComponents/CartItem.tsx`
```typescript
// Line 95-98:
<button
    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
    disabled={item.quantity <= Math.max(1, Number(item.minOrder) || 1)}
    className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#8A6305] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base cursor-pointer font-bold"
    aria-label="Decrease quantity"
>−</button>
```

---

### 4.2 Track 2: Sentry Client Configuration Proposed Implementation

#### A. Create `sentry.client.config.ts` (Project Root `E:\work\hawa\sentry.client.config.ts`)
```typescript
import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-privacy";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",
  enabled: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend: (event) => scrubSentryEvent(event),
  beforeSendTransaction: (event) => scrubSentryEvent(event),
});
```

#### B. Enhance `lib/sentry-privacy.ts` (Wholesale Price & PII Protection)
Update `SENSITIVE_KEY` in line 1:
```typescript
const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials|price|wholesalePrice|discountPrice|wholesale|costPrice|guestPrice)$/i;
```
This guarantees that wholesale pricing data is systematically scrubbed from any Sentry error payload, breadcrumb, or context.

---

### 4.3 Track 3: Automated Quality Gate & ESLint Proposed Resolution

#### A. Fix Vitest Failure in `tests/admin-revocation.test.ts`
Update lines 10–16:
```typescript
vi.mock('@/lib/prisma', () => {
    const mockFind = vi.fn();
    return {
        prisma: {
            user: {
                findUnique: mockFind,
                findFirst: mockFind,
            },
        },
    };
});
```
This single update resolves all 6 test failures in `admin-revocation.test.ts` and allows `npm run test:run` to pass 100%.

#### B. ESLint 189 Warnings Categorical Remediation Strategy
1. **Unused Variables (97)**:
   - In admin client files (`SiteContentClient.tsx`, `OrdersClient.tsx`, `Customers/page.tsx`, etc.), remove unused Lucide icons and unused destructured variables.
   - In `lib/catalog.ts`, prefix caught errors with `_error` or use `catch` without binding (e.g. `catch { ... }`).
2. **Explicit Any (58)**:
   - In `tests/admin-revocation.test.ts`, replace `(prisma.user.findUnique as any)` with typed mock casts or helper mock utilities.
   - In `lib/price-visibility.ts`, define proper generic interfaces `T extends { price?: ... }` instead of `any`.
   - In `lib/admin-actions.ts`, type query options.
3. **Raw `<img>` Elements (16)**:
   - In admin tables and modals (`ImageUploadField.tsx`, `ReviewModal.tsx`, `BannersClient.tsx`), replace `<img>` with Next.js `<Image unoptimized />` or `<ResilientImage />` with appropriate dimensions.
4. **React Hook Missing Dependencies (9)**:
   - In `DashboardClient.tsx`, wrap dependency functions in `useCallback` or pass dependencies into the array.
5. **Alt Text Accessibility (7)**:
   - Add descriptive `alt` props (e.g. `alt={banner.title || "Banner image"}`) to all flagged image tags.
6. **Unused Directives (2)**:
   - Remove redundant `// eslint-disable-next-line` comments in `RelatedProducts.tsx` and `ResilientImage.tsx`.

---

## 5. Verification Method

### 5.1 Verifying Cart `minOrder` Enforcement
1. **Component Test**:
   - Render `ProductCard` with a product where `minOrder = 5`.
   - Trigger `handleInitialAdd`: assert `items[0].quantity === 5`.
   - Trigger `handleDecrease`: assert `items` does not contain the product (reverted / removed).
   - Render with `minOrder = 0` or `null`: assert `items[0].quantity === 1`.
2. **Order API Integration**:
   - Run `npm run test:run` — ensuring `order-lines.test.ts` and `inventory-transitions.test.ts` pass without minOrder regressions.

### 5.2 Verifying Sentry Telemetry & Privacy
1. **Run Vitest Privacy Test**:
   - `cmd.exe /c "npx vitest run tests/sentry-privacy.test.ts"`
   - Extend test to verify `price`, `wholesalePrice`, and `guestPrice` are completely scrubbed from `event.extra` and `event.request`.
2. **Configuration Existence**:
   - Check `sentry.client.config.ts` exists in root and compiles cleanly under `npm run typecheck`.

### 5.3 Verifying Automated Quality Gate
1. **TypeScript Typecheck**:
   - `cmd.exe /c "npm run typecheck"` -> must exit code 0.
2. **Vitest Unit Suite**:
   - `cmd.exe /c "npm run test:run"` -> must exit code 0 (89/89 tests passing).
3. **Clean Linting**:
   - `cmd.exe /c "npm run lint"` -> must exit code 0 with 0 errors and 0 warnings.
4. **Full Quality Gate**:
   - `cmd.exe /c "npm run quality-gate"` -> executes typecheck, lint, test:run, and smoke test.
