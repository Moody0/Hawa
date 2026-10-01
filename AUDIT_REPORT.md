# Hawa website audit

Completed locally on 1 October 2026. These changes have not been deployed to hawasy.com.

## What was fixed

- Login and logout wait for existing session requests and verify the resulting session before redirecting. Background refresh cannot overwrite newer authentication state. Transient connection failures do not immediately sign out a verified account.
- Administrator and merchant sessions retain separate guards. Disabled accounts and permissions are enforced by Laravel. CSRF renewal is limited to one retry; ambiguous order failures are not automatically retried.
- Registration accepts pasted international phone numbers, validates a detailed address, preserves password spaces consistently, and explains merchant approval. Pending accounts remain signed out until an administrator approves them.
- Fake fallback products, partner brands, prices, customer reviews, and business statistics were removed. Empty product collections and tabs stay hidden; short product rails have no redundant controls. Edited custom testimonials and statistics are preserved by the migration.
- The About page uses a simpler layout. Its copy, images, values, and section visibility are editable.
- Shared phone numbers, email, address, social links, WhatsApp override, and opening hours apply across customer pages. Empty social links stay hidden. Orders no longer open WhatsApp automatically after submission.
- Homepage section switches, navigation link switches, partner headings, blog introduction, and About contact invitation are editable. Blog filters use actual published post categories and reading times use actual content.
- Mobile navigation has dialog semantics, focus trapping, Escape dismissal, and focus restoration. Login recovery dialogs also restore focus.
- Footer privacy links point to the privacy page. Inactive banner editors and unused statistics controls were removed. The categories invitation and both About images use the shared Laravel image uploader.
- Next.js and affected dependency versions were updated. Release builds temporarily detach the expected persistent Laravel storage symlink and restore it even if the build fails.

## Administrator controls

| Content | Administrator location |
| --- | --- |
| Shared contacts, social links, hours, page and navigation visibility | Site Content → Website & Shared Contacts |
| About copy, hero and story images, values | Site Content → About |
| About section visibility and contact invitation | Site Content → Website & Shared Contacts |
| Footer copy, links and preview | Site Content → Footer |
| Shipping, privacy and contact page copy | Their tabs in Site Content |
| Homepage product collections, categories, services and testimonials | Their tabs in Site Content |
| Categories page invitation and image | Site Content → Categories invitation |
| Homepage banner records, images and order | Banners |
| Blog posts, publication state and categories | Blog |
| Merchant approval | Customers |
| Administrator permissions and revocation | Users |

The customer website remains Arabic as designed. The administrator interface supports Arabic and English. Navigation switches hide menu entries; they do not revoke access to the corresponding public page.

## Verification

- Frontend type checking: passed.
- Frontend tests: 160 passed across 19 files.
- Production build: passed using Next.js 16.3.8.
- Backend tests: 27 passed, 242 assertions, against a dedicated disposable MySQL database.
- Browser integration: nine core checks and eight extended UI checks passed with no captured application page errors. These covered first-attempt administrator/customer login, refresh, logout, pending approval, independent sessions, revocation, permissions, catalog changes, image conversion, shared settings and navigation.
- Responsive checks: eight customer pages at 375, 768 and 1440 pixel widths; no horizontal document overflow.
- Order tests covered totals, discount application, inventory options, stock reservation, concurrent requests, duplicate submission prevention, cancellation and protected guest access.
- npm audit and Composer audit: no known vulnerability advisories reported at verification time.
- Targeted ESLint check: no errors; existing warning-level cleanup remains. A full warning-free lint or a Lighthouse score is not claimed.

Browser mutations used isolated local test accounts and data, not production customer records. The live site's protected administration and real orders were not modified during this audit. Passing checks reduce known risks; they cannot guarantee that every possible browser, dataset or hosting issue has been eliminated.

## Deployment

The replacement deployment package contains source files and a SHA-256 manifest, with environment examples only. It excludes local credentials, test fixtures, dependency directories, generated builds, and runtime uploads.

Follow the **Updates and backups** section of [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for the existing VPS installation. Apply the included migration, preserve the application key and shared session/media paths, build the new release before switching, and verify both first-attempt login flows on HTTPS afterward.


## Workbook import and quotation requests — 1 October 2026

Prepared the 142 real products from `منتجات شركة حوا.xlsx` with zero price and stock, as requested. Trimmed brand names to seven brands, preserved two departments, descriptions and 136 image URLs, and used placeholders for six missing image URLs. Fixed the importer aliases for this workbook. The explicit import command validates transactionally and prevents importing the same source twice. No production data was imported from this workstation.

Zero-price products remain visible and support quote requests without stock reservations, stock decrements, discounts or confirmed totals. Guest prices remain redacted at the API and masked in the UI. Authenticated users see pricing on inquiry. The quotation flag persists on the order and survives refresh. Positive priced orders retain the existing inventory rules.

Verification: 160 frontend tests passed; TypeScript and production build passed; the affected backend suite passed 25 tests with 200 assertions. Additional backend suites had passed in the preceding full run. Browser checks used the isolated MySQL test database and the real 142-row import: guest masking, zero-stock controls, quote submission, completion refresh, WhatsApp action, first customer login and signed-in inquiry display passed without application errors.

Deployment now publishes shared static assets with readable directory/file permissions to prevent the earlier Nginx CSS/JavaScript 403 failures. See `CATALOG_IMPORT.md` for the explicit VPS import command.
