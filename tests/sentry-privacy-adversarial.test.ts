import { describe, expect, it } from "vitest";
import { scrubSentryEvent } from "@/lib/sentry-privacy";

interface SentryLikeEvent {
  message?: string;
  user?: Record<string, unknown>;
  request?: {
    url?: string;
    headers?: Record<string, unknown>;
    data?: Record<string, unknown>;
    cookies?: Record<string, unknown>;
    query_string?: string;
    [key: string]: unknown;
  };
  extra?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  breadcrumbs?: Array<{
    category?: string;
    message?: string;
    data?: Record<string, unknown>;
    params?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

describe("Adversarial Sentry Privacy & Telemetry Challenge", () => {
  describe("1. Sentry Client Configuration", () => {
    it("can load sentry.client.config without crashing", async () => {
      await expect(import("../sentry.client.config")).resolves.toBeDefined();
    });
  });

  describe("2. Guest Wholesale Prices Scrubbing", () => {
    const wholesalePayload = {
      price: 120,
      wholesalePrice: 85,
      guestPrice: 90,
      cost: 60,
      discountPrice: 80,
    };

    it("scrubs wholesale prices from extra", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        extra: {
          ...wholesalePayload,
          safeField: "safe-123",
        },
      });

      expect(event.extra).toBeDefined();
      expect(event.extra).not.toHaveProperty("price");
      expect(event.extra).not.toHaveProperty("wholesalePrice");
      expect(event.extra).not.toHaveProperty("guestPrice");
      expect(event.extra).not.toHaveProperty("cost");
      expect(event.extra).not.toHaveProperty("discountPrice");
      expect(event.extra).toEqual({ safeField: "safe-123" });
    });

    it("scrubs wholesale prices from tags", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        tags: {
          ...wholesalePayload,
          component: "ProductCard",
        },
      });

      expect(event.tags).toBeDefined();
      expect(event.tags).not.toHaveProperty("price");
      expect(event.tags).not.toHaveProperty("wholesalePrice");
      expect(event.tags).not.toHaveProperty("guestPrice");
      expect(event.tags).not.toHaveProperty("cost");
      expect(event.tags).not.toHaveProperty("discountPrice");
      expect(event.tags).toEqual({ component: "ProductCard" });
    });

    it("scrubs wholesale prices from breadcrumbs data & direct fields", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        breadcrumbs: [
          {
            category: "cart",
            data: { ...wholesalePayload },
            ...wholesalePayload,
          },
        ],
      });

      expect(event.breadcrumbs).toBeDefined();
      const b = event.breadcrumbs?.[0];
      expect(b).toBeDefined();
      expect(b).not.toHaveProperty("price");
      expect(b).not.toHaveProperty("wholesalePrice");
      expect(b).not.toHaveProperty("guestPrice");
      expect(b).not.toHaveProperty("cost");
      expect(b).not.toHaveProperty("discountPrice");
      expect(b).not.toHaveProperty("data");
    });

    it("scrubs wholesale prices from request headers, data, and query", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        request: {
          url: "https://example.com/api/products?price=120&wholesalePrice=85",
          headers: { ...wholesalePayload },
          data: { ...wholesalePayload },
        },
      });

      expect(event.request).toBeDefined();
      expect(event.request).not.toHaveProperty("headers");
      expect(event.request).not.toHaveProperty("data");
      expect(event.request?.url).toBe("https://example.com/api/products");
    });

    it("demonstrates snake_case price keys bypass (wholesale_price, cost_price, guest_price)", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        extra: {
          wholesale_price: 85,
          cost_price: 60,
          guest_price: 90,
          discount_price: 80,
        },
      });

      // These snake_case keys are NOT caught by SENSITIVE_KEY regex
      expect(event.extra?.wholesale_price).toBe(85);
      expect(event.extra?.guest_price).toBe(90);
      expect(event.extra?.discount_price).toBe(80);
    });
  });

  describe("3. Credentials Scrubbing", () => {
    const credentialsPayload = {
      password: "secret",
      token: "bearer abc",
      sessionToken: "xyz",
      cookie: "session=...",
    };

    it("scrubs password, token, and cookie from extra, but leaks sessionToken", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        extra: {
          ...credentialsPayload,
          safeField: "ok",
        },
      });

      expect(event.extra).toBeDefined();
      expect(event.extra).not.toHaveProperty("password");
      expect(event.extra).not.toHaveProperty("token");
      expect(event.extra).not.toHaveProperty("cookie");
      // VULNERABILITY: sessionToken is NOT in SENSITIVE_KEY and string "xyz" is < 24 chars
      expect(event.extra).toHaveProperty("sessionToken", "xyz");
    });

    it("scrubs credentials payload when nested under 'credentials' key", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        extra: {
          credentials: { ...credentialsPayload },
          safeField: "ok",
        },
      });

      expect(event.extra).toBeDefined();
      expect(event.extra).not.toHaveProperty("credentials");
      expect(event.extra).toEqual({ safeField: "ok" });
    });

    it("scrubs password, token, and cookie from tags, but leaks sessionToken", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        tags: {
          ...credentialsPayload,
          source: "auth-modal",
        },
      });

      expect(event.tags).toBeDefined();
      expect(event.tags).not.toHaveProperty("password");
      expect(event.tags).not.toHaveProperty("token");
      expect(event.tags).not.toHaveProperty("cookie");
      // VULNERABILITY: sessionToken leaks in tags
      expect(event.tags).toHaveProperty("sessionToken", "xyz");
    });

    it("scrubs credentials from breadcrumb data, but leaks sessionToken in breadcrumb root/params", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        breadcrumbs: [
          {
            category: "auth",
            ...credentialsPayload,
            data: { ...credentialsPayload },
          },
        ],
      });

      expect(event.breadcrumbs).toBeDefined();
      const b = event.breadcrumbs?.[0];
      expect(b).toBeDefined();
      expect(b).not.toHaveProperty("password");
      expect(b).not.toHaveProperty("token");
      expect(b).not.toHaveProperty("cookie");
      expect(b).not.toHaveProperty("data");
      // VULNERABILITY: sessionToken leaks in breadcrumbs
      expect(b).toHaveProperty("sessionToken", "xyz");
    });

    it("scrubs credentials from request headers, data, and cookies completely", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        request: {
          url: "https://example.com/api/auth?token=bearer%20abc&sessionToken=xyz",
          headers: {
            authorization: "bearer abc",
            cookie: "session=...",
            "x-session-token": "xyz",
          },
          cookies: { session: "..." },
          data: { ...credentialsPayload },
        },
      });

      expect(event.request).toBeDefined();
      expect(event.request).not.toHaveProperty("headers");
      expect(event.request).not.toHaveProperty("cookies");
      expect(event.request).not.toHaveProperty("data");
      expect(event.request?.url).toBe("https://example.com/api/auth");
    });

    it("demonstrates authToken, accessToken, and refreshToken also leak", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        extra: {
          accessToken: "jwt.access.123",
          refreshToken: "jwt.refresh.456",
          authToken: "auth-789",
          apiKey: "key_live_abc",
        },
      });

      // None of these match SENSITIVE_KEY because it only checks exact ^token$
      expect(event.extra?.accessToken).toBe("jwt.access.123");
      expect(event.extra?.refreshToken).toBe("jwt.refresh.456");
      expect(event.extra?.authToken).toBe("auth-789");
      expect(event.extra?.apiKey).toBe("key_live_abc");
    });
  });

  describe("4. PII Scrubbing", () => {
    const piiPayload = {
      email: "user@example.com",
      phone: "+963 999 123 456",
      address: "Damascus, Syria, Street 10",
    };

    it("scrubs PII fields from extra, tags, and breadcrumbs", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        user: { id: "user-1", email: "user@example.com" },
        extra: { ...piiPayload, safeField: "allowed" },
        tags: { ...piiPayload, role: "customer" },
        breadcrumbs: [
          {
            category: "checkout",
            ...piiPayload,
            data: { ...piiPayload },
          },
        ],
      });

      expect(event).not.toHaveProperty("user");
      expect(event.extra).toBeDefined();
      expect(event.extra).not.toHaveProperty("email");
      expect(event.extra).not.toHaveProperty("phone");
      expect(event.extra).not.toHaveProperty("address");
      expect(event.extra).toEqual({ safeField: "allowed" });

      expect(event.tags).toBeDefined();
      expect(event.tags).not.toHaveProperty("email");
      expect(event.tags).not.toHaveProperty("phone");
      expect(event.tags).not.toHaveProperty("address");
      expect(event.tags).toEqual({ role: "customer" });

      expect(event.breadcrumbs).toBeDefined();
      const b = event.breadcrumbs?.[0];
      expect(b).toBeDefined();
      expect(b).not.toHaveProperty("email");
      expect(b).not.toHaveProperty("phone");
      expect(b).not.toHaveProperty("address");
      expect(b).not.toHaveProperty("data");
    });

    it("scrubs PII embedded inside strings (emails and phone numbers)", () => {
      const event = scrubSentryEvent<SentryLikeEvent>({
        message: "Customer john.doe@example.org reported issue at +1 (555) 234-5678",
      });

      expect(event.message).not.toContain("john.doe@example.org");
      expect(event.message).not.toContain("555");
      expect(event.message).toContain("[redacted-email]");
      expect(event.message).toContain("[redacted-phone]");
    });
  });
});
