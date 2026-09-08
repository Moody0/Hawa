"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

export function WebQualityMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    // Initial production performance sampling is intentionally 10%. These are
    // RUM samples, not a field pass/fail claim until aggregated at p75.
    if (process.env.NODE_ENV !== "production" || Math.random() >= 0.1) return;
    const route = (pathname || "/").split("?")[0];
    const report = (metric: Metric) => {
      Sentry.captureEvent({
        message: "web_vital",
        level: "info",
        tags: {
          metric: metric.name,
          rating: metric.rating,
          route,
          evidence: "rum_sample_pending_aggregation",
          navigationType: metric.navigationType,
        },
        measurements: {
          web_vital: { value: metric.value, unit: metric.name === "CLS" ? "none" : "millisecond" },
        },
      });
    };
    onCLS(report);
    onINP(report);
    onLCP(report);
  }, [pathname]);

  return null;
}

