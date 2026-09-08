import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-privacy";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend: (event) => scrubSentryEvent(event),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

