# Adversarial Challenge Report — Milestone 1: Sentry Client Telemetry & Privacy Scrubbing

**Challenger**: Challenger 2 (`.agents/challenger_m1_2`)  
**Role**: EMPIRICAL CHALLENGER (critic, specialist)  
**Parent Orchestrator**: `ccf29f83-86fe-4180-a559-3a041524307c`  
**Date**: 2026-09-08  
**Working Directory**: `E:\work\hawa\.agents\challenger_m1_2`  
**Project Root**: `E:\work\hawa`  
**Handoff Type**: Hard  
**Verdict**: **REQUEST_CHANGES**

---

## Challenge Summary

**Overall Risk Assessment**: **HIGH / CRITICAL PRIVACY DEFECT**

While `sentry.client.config.ts` was properly created and wired to `scrubSentryEvent`, and base camelCase wholesale pricing and PII fields are removed, empirical testing revealed a **critical credential leakage defect**: `sessionToken` (explicitly mandated for testing in the challenge scope) completely escapes privacy scrubbing across Sentry `extra`, `tags`, and `breadcrumbs`. In addition, common token/key variants (`accessToken`, `refreshToken`, `authToken`, `apiKey`, `session_token`) and snake_case wholesale pricing fields (`wholesale_price`, `cost_price`, `guest_price`, `discount_price`) bypass scrubbing entirely.

---

## 1. Observation

### 1.1 Sentry Client Configuration (`sentry.client.config.ts`)
- **File path**: `E:\work\hawa\sentry.client.config.ts:1-15`
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
- **Observations**:
  1. `Sentry.init` is correctly invoked on the client side with `sendDefaultPii: false`, `tracesSampleRate: 0.1`, `replaysSessionSampleRate: 0`, and `replaysOnErrorSampleRate: 0`.
  2. `beforeSend: (event) => scrubSentryEvent(event)` and `beforeSendTransaction: (event) => scrubSentryEvent(event)` are properly attached.
  3. Dynamic module import via vitest (`await import("../sentry.client.config")`) resolves without runtime errors.

### 1.2 Regex Definition in `lib/sentry-privacy.ts`
- **File path**: `E:\work\hawa\lib\sentry-privacy.ts:1-4`
  ```typescript
  1: const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials|price|wholesalePrice|guestPrice|cost|discountPrice|wholesale|costPrice)$/i;
  2: const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  3: const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
  4: const TOKEN = /\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi;
  ```
- **Observations**:
  1. `SENSITIVE_KEY` is an anchored regex using `^` and `$`.
  2. The string `"token"` only matches exact key `"token"` (or `"TOKEN"`). It does NOT match `"sessionToken"`, `"accessToken"`, `"refreshToken"`, `"authToken"`, `"csrfToken"`, `"apiKey"`, `"session_token"`, `"access_token"`.
  3. `TOKEN` regex requires `[A-Za-z0-9_-]{24,}` (minimum 24 characters). Short tokens such as `"xyz"` or custom session tokens under 24 characters do not match `TOKEN`.

### 1.3 Empirical Test Execution & Failure Verification
- Executed adversarial test suite:
  ```bash
  cmd.exe /c npx vitest run tests/sentry-privacy-adversarial.test.ts
  ```
- **Direct Test Observation (Assertion Failure when expecting `sessionToken` to be scrubbed)**:
  ```
  FAIL tests/sentry-privacy-adversarial.test.ts > Adversarial Sentry Privacy & Telemetry Challenge > 3. Credentials Scrubbing > scrubs credentials payload from extra
  AssertionError: expected { Object (sessionToken, safeField) } to not have property "sessionToken"
  - Expected: undefined
  + Received: "xyz"
  ```
- **Scrubbing Results by Payload Component**:
  1. **Wholesale Prices**: `{ price: 120, wholesalePrice: 85, guestPrice: 90, cost: 60, discountPrice: 80 }`
     - In `extra`: Successfully scrubbed (keys stripped).
     - In `tags`: Successfully scrubbed (keys stripped).
     - In `breadcrumbs`: Successfully scrubbed (both root keys and `data` object stripped).
     - In `request`: Successfully scrubbed (`headers`, `data`, and URL query string stripped).
     - **Bypass Vector**: Snake_case variants `{ wholesale_price: 85, cost_price: 60, guest_price: 90, discount_price: 80 }` are **NOT scrubbed** and remain intact in telemetry.
  2. **Credentials**: `{ password: "secret", token: "bearer abc", sessionToken: "xyz", cookie: "session=..." }`
     - `password`: Scrubbed.
     - `token`: Scrubbed.
     - `cookie`: Scrubbed.
     - `sessionToken`: **LEAKED in `extra`** (`{ sessionToken: "xyz" }`).
     - `sessionToken`: **LEAKED in `tags`** (`{ sessionToken: "xyz" }`).
     - `sessionToken`: **LEAKED in `breadcrumbs`** (`{ sessionToken: "xyz" }`).
     - **Bypass Vector**: Compound tokens `{ accessToken: "...", refreshToken: "...", authToken: "...", apiKey: "..." }` also **LEAK**.
  3. **PII**: `{ email: "user@example.com", phone: "+963 999 123 456", address: "Damascus, Syria, Street 10" }`
     - Top-level `event.user`: Stripped completely (`delete mutable.user`).
     - `email`, `phone`, `address`: Stripped from `extra`, `tags`, and `breadcrumbs`.
     - In-string emails and phones: Redacted to `[redacted-email]` and `[redacted-phone]`.
     - **Bypass Vector**: Custom address keys `{ shippingAddress: "...", billingAddress: "..." }` are **NOT scrubbed**.

---

## 2. Logic Chain

1. **Mandated Requirement**:
   The user prompt explicitly specified:
   > Test event payloads containing:
   > * guest wholesale prices: `{ price: 120, wholesalePrice: 85, guestPrice: 90, cost: 60, discountPrice: 80 }`
   > * credentials: `{ password: "secret", token: "bearer abc", sessionToken: "xyz", cookie: "session=..." }`
   > * PII: email, phone, address
   > Verify that `scrubSentryEvent` completely scrubs or hashes all these fields from extra, breadcrumbs, tags, and request headers/data.
2. **Analysis of Scrubbing Logic (`lib/sentry-privacy.ts:22-25`)**:
   - `for (const [key, child] of Object.entries(value as Record<string, unknown>))`
   - `if (SENSITIVE_KEY.test(key)) continue;`
   - For `key = "sessionToken"`, `SENSITIVE_KEY.test("sessionToken")` evaluates to `false` because `SENSITIVE_KEY` only matches `token` as an exact word: `/^(...|token|...)$/i`.
   - The value is then passed to `sanitizeString("xyz")`.
   - Inside `sanitizeString`, `"xyz"` does not match `EMAIL`, `PHONE`, or `TOKEN` (`/\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi` requires at least 24 characters).
   - Therefore, `"xyz"` is returned untouched.
3. **Empirical Verification**:
   - Running `scrubSentryEvent({ extra: { sessionToken: "xyz" }, tags: { sessionToken: "xyz" }, breadcrumbs: [{ sessionToken: "xyz" }] })` yields the unmodified property `sessionToken: "xyz"` in all three telemetry sections.
4. **Security & Privacy Impact**:
   - In a production Next.js environment, client runtime exceptions or transaction traces logging session state or authentication context will transmit user session tokens directly to Sentry servers, violating zero-credential leakage requirements and exposing active user sessions to telemetry viewers/integrations.
5. **Conclusion**:
   - The current implementation fails the explicit privacy requirement for credential scrubbing. Changes are required before this can be approved.

---

## 3. Challenges & Attack Vectors

### Challenge 1 [CRITICAL]: `sessionToken` Credential Leakage in Telemetry Payloads
- **Assumption challenged**: That extending `SENSITIVE_KEY` with `"token"` sufficiently protects authentication tokens.
- **Attack scenario**: A client-side error occurs during authentication or checkout where session state is captured in Sentry's `extra`, `tags`, or breadcrumb parameters with key `sessionToken: "xyz"`.
- **Blast radius**: Active session tokens, JWTs, or API credentials under non-exact `token` keys are logged in plain text in Sentry dashboard and stored in third-party telemetry databases.
- **Mitigation**: Update `SENSITIVE_KEY` in `lib/sentry-privacy.ts` to include:
  `sessionToken|session_token|accessToken|access_token|refreshToken|refresh_token|authToken|auth_token|csrfToken|csrf_token|apiKey|api_key`
  or match token patterns flexibly: `/(token|jwt|auth|secret|credential|password|cookie)/i`.

### Challenge 2 [MEDIUM]: Snake_case Pricing and Cost Key Bypass
- **Assumption challenged**: That camelCase keys (`wholesalePrice`, `guestPrice`, `costPrice`, `discountPrice`) cover all wholesale price exposure.
- **Attack scenario**: API payload errors or backend serialization using snake_case (`wholesale_price`, `cost_price`, `guest_price`, `discount_price`) are logged in telemetry.
- **Blast radius**: Confidential wholesale and distributor base prices are exposed to client telemetry.
- **Mitigation**: Add snake_case keys `wholesale_price|guest_price|cost_price|discount_price` or pattern `/(wholesale|guest_price|cost_price|discount_price)/i` to `SENSITIVE_KEY`.

### Challenge 3 [LOW/MEDIUM]: Address Variations Bypass
- **Assumption challenged**: That `address` and `streetAddress` cover all customer physical address data.
- **Attack scenario**: Checkout forms passing `shippingAddress` or `billingAddress` in error payloads.
- **Blast radius**: Customer physical addresses leak into Sentry telemetry.
- **Mitigation**: Add `shippingAddress|billingAddress|customerAddress|shipping_address|billing_address` or `/address/i` to `SENSITIVE_KEY`.

---

## 4. Stress Test Results

| Test Scenario | Target | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| Load `sentry.client.config.ts` | Client initialization | Imports without crashing, wires `scrubSentryEvent` | Successfully loaded with 0 errors | **PASS** |
| Guest wholesale prices in `extra` | `{ price: 120, wholesalePrice: 85, guestPrice: 90, cost: 60, discountPrice: 80 }` | All 5 fields stripped | All 5 fields stripped | **PASS** |
| Guest wholesale prices in `tags` | Wholesale price payload | Stripped from tags | Stripped from tags | **PASS** |
| Guest wholesale prices in `breadcrumbs` | Breadcrumb `data` and direct fields | Stripped from breadcrumbs | Stripped from breadcrumbs | **PASS** |
| Guest wholesale prices in `request` | Request URL query, headers, data | Query parameters and headers stripped | Stripped from request | **PASS** |
| Snake_case pricing keys in `extra` | `{ wholesale_price: 85, cost_price: 60, guest_price: 90 }` | Stripped from extra | **Preserved intact (leaked)** | **FAIL** |
| Credentials in `extra`: `password`, `token`, `cookie` | Credentials payload | Stripped from extra | Stripped from extra | **PASS** |
| Credentials in `extra`: `sessionToken` | `{ sessionToken: "xyz" }` | Stripped or hashed | **Preserved intact as `"xyz"` (leaked)** | **FAIL** |
| Credentials in `tags`: `sessionToken` | `{ sessionToken: "xyz" }` | Stripped or hashed | **Preserved intact as `"xyz"` (leaked)** | **FAIL** |
| Credentials in `breadcrumbs`: `sessionToken` | `{ sessionToken: "xyz" }` | Stripped or hashed | **Preserved intact as `"xyz"` (leaked)** | **FAIL** |
| Compound auth tokens in `extra` | `{ accessToken, refreshToken, authToken, apiKey }` | Stripped from extra | **Preserved intact (leaked)** | **FAIL** |
| Top-level `event.user` | `{ id: "user-1", email: "..." }` | Completely deleted | `event.user` is undefined | **PASS** |
| PII in `extra`, `tags`, `breadcrumbs` | `{ email, phone, address }` | Stripped from objects | Stripped completely | **PASS** |
| Inline PII in strings | `"Customer john.doe@example.org ... +1 (555) 234-5678"` | Redacted in string | Redacted to `[redacted-email]`, `[redacted-phone]` | **PASS** |
| TypeScript type check | `npm run typecheck` | Code 0 | Exit code 0, 0 errors | **PASS** |

---

## 5. Caveats

1. **Review-Only Constraint**:
   - Under Challenger rules ("Review-only — do NOT modify implementation code"), I did not modify `lib/sentry-privacy.ts` directly. The fix must be applied by Worker 1.
2. **Pre-existing Repository Failures**:
   - `tests/admin-revocation.test.ts` fails due to `prisma.user.findFirst` mock defect, already identified as Milestone 4 task F11.
   - `tests/cart-min-order-adversarial.test.ts` contains a syntax error created during peer test execution.

---

## 6. Conclusion & Verdict

**Verdict**: **REQUEST_CHANGES**

### Actionable Required Fixes:
1. **Extend `SENSITIVE_KEY` in `lib/sentry-privacy.ts`**:
   Update `SENSITIVE_KEY` regex to include:
   - `sessionToken`, `session_token`
   - `accessToken`, `access_token`
   - `refreshToken`, `refresh_token`
   - `authToken`, `auth_token`
   - `csrfToken`, `csrf_token`
   - `apiKey`, `api_key`
   - `wholesale_price`, `guest_price`, `cost_price`, `discount_price`
   - `shippingAddress`, `billingAddress`, `customerAddress`
   Or use broader subpattern matching for tokens: `/(^|_|-)(token|secret|password|key|auth)|sessionToken|accessToken|refreshToken/i`.
2. **Re-run Vitest Verification**:
   Execute `cmd.exe /c npx vitest run tests/sentry-privacy.test.ts tests/sentry-privacy-adversarial.test.ts` to confirm 100% pass rate without credential or pricing leakage.

---

## 7. Verification Method

To reproduce and verify these findings independently:

1. **Run Adversarial Telemetry & Privacy Suite**:
   ```bash
   cmd.exe /c npx vitest run tests/sentry-privacy-adversarial.test.ts
   ```
   *Inspect the assertions under "3. Credentials Scrubbing" to observe that `sessionToken: "xyz"` currently survives in `extra`, `tags`, and `breadcrumbs`.*

2. **Run Node Direct Key Check**:
   ```bash
   node -e "const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials|price|wholesalePrice|guestPrice|cost|discountPrice|wholesale|costPrice)$/i; console.log('sessionToken matched:', SENSITIVE_KEY.test('sessionToken'));"
   ```
   *Expected output*: `sessionToken matched: false` (proving the regex defect).

3. **Verify Sentry Client Config Compilation**:
   ```bash
   cmd.exe /c npm run typecheck
   ```
   *Expected output*: `tsc --noEmit` exits with 0 errors.
