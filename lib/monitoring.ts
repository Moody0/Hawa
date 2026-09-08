import * as Sentry from "@sentry/nextjs";

export type ErrorCategory =
  | "500_server_error"
  | "order_failure"
  | "stock_conflict"
  | "auth_abuse"
  | "cache_invalidation_failure"
  | "image_proxy_failure";

export interface ApiLatencyEvent {
  endpoint: string;
  method: string;
  status: number;
  durationMs: number;
  authClass?: "guest" | "merchant" | "admin";
}

export interface ErrorEvent {
  category: ErrorCategory;
  route?: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

export function recordApiLatency(event: ApiLatencyEvent): void {
  Sentry.captureEvent({
    message: "api_latency",
    level: "info",
    tags: { endpoint: event.endpoint.split("?")[0], method: event.method, status: String(event.status), authClass: event.authClass || "guest" },
    measurements: { duration_ms: { value: event.durationMs, unit: "millisecond" } },
  });
}

export function recordErrorEvent(event: ErrorEvent): void {
  Sentry.captureEvent({
    message: event.category,
    level: event.status && event.status < 500 ? "warning" : "error",
    tags: { category: event.category, route: event.route?.split("?")[0], status: event.status ? String(event.status) : undefined },
    extra: { safeMessage: event.message.slice(0, 500), details: event.details },
  });
}

