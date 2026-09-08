import { describe, expect, it } from "vitest";
import { scrubSentryEvent } from "@/lib/sentry-privacy";

describe("Sentry privacy scrubbing", () => {
  it("removes credentials, PII, request bodies, cookies, and URL queries", () => {
    const event = scrubSentryEvent({
      message: "Order failed for person@example.com at +963 999 123 456",
      user: { id: "customer-1", name: "Person" },
      request: {
        url: "https://example.test/products?search=private",
        headers: { authorization: "Bearer private-token-value-123456789" },
        cookies: { session: "secret" },
        data: { phone: "+963999123456", cart: ["private item"] },
      },
      extra: { password: "secret", address: "Private street", safeCode: "STOCK_CONFLICT" },
    });
    expect(event.user).toBeUndefined();
    expect(event.request).toEqual({ url: "https://example.test/products" });
    expect(event.extra).toEqual({ safeCode: "STOCK_CONFLICT" });
    expect(String(event.message)).not.toContain("example.com");
    expect(String(event.message)).not.toContain("+963");
  });
});
