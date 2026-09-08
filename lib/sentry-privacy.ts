const SENSITIVE_KEY = /^(body|data|cookie|cookies|authorization|password|passcode|secret|token|phone|email|name|ownerName|shopName|address|streetAddress|query|search|cart|items|credentials)$/i;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const TOKEN = /\b(?:bearer\s+)?[A-Za-z0-9_-]{24,}\b/gi;

function sanitizeString(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      value = `${url.origin}${url.pathname}`;
    } catch {}
  }
  return value.replace(EMAIL, "[redacted-email]").replace(PHONE, "[redacted-phone]").replace(TOKEN, "[redacted-token]").slice(0, 2000);
}

export function scrubTelemetryValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[truncated]";
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => scrubTelemetryValue(item, depth + 1));
  if (!value || typeof value !== "object") return value;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(key)) continue;
    result[key] = scrubTelemetryValue(child, depth + 1);
  }
  return result;
}

export function scrubSentryEvent<T extends object>(event: T): T {
  const sanitized = scrubTelemetryValue(event) as T;
  const mutable = sanitized as Record<string, unknown>;
  delete mutable.user;
  const request = mutable.request;
  if (request && typeof request === "object") {
    const safeRequest = request as Record<string, unknown>;
    delete safeRequest.data;
    delete safeRequest.cookies;
    delete safeRequest.headers;
    delete safeRequest.query_string;
    if (typeof safeRequest.url === "string") safeRequest.url = sanitizeString(safeRequest.url);
  }
  return sanitized;
}
