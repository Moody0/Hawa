"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCustomer } from "@/app/context/CustomerContext";
import { useLanguage } from "@/app/context/LanguageContext";

/**
 * Client-Side Performance & Web Vitals Telemetry Reporter (Phase 10.5)
 *
 * Automatically tracks Core Web Vitals (LCP, INP, CLS) and Navigation Timing (TTFB).
 * Reports telemetry strictly without PII, search terms, or credentials.
 */
export function WebQualityMonitor() {
    const pathname = usePathname();
    const { customer } = useCustomer();
    const { language } = useLanguage();
    const reportedMetricsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
            return;
        }

        const deviceClass =
            window.innerWidth < 768
                ? "mobile"
                : window.innerWidth < 1024
                ? "tablet"
                : "desktop";

        const authClass = customer ? "merchant" : "guest";
        const cleanRoute = (pathname || "/").split("?")[0].split("#")[0];
        const routeKey = `${cleanRoute}:${authClass}:${deviceClass}`;

        const queue: Array<{
            name: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
            value: number;
            route: string;
            locale: "ar" | "en";
            deviceClass: "mobile" | "tablet" | "desktop";
            authClass: "guest" | "merchant" | "admin";
            navigationTiming?: { ttfb?: number; load?: number; domComplete?: number };
        }> = [];

        function flushQueue() {
            if (queue.length === 0) return;
            const items = [...queue];
            queue.length = 0;

            const payload = JSON.stringify({ vitals: items });

            if (navigator.sendBeacon) {
                navigator.sendBeacon("/api/monitoring", payload);
            } else {
                fetch("/api/monitoring", {
                    method: "POST",
                    body: payload,
                    headers: { "Content-Type": "application/json" },
                    keepalive: true,
                }).catch(() => {
                    // Fail silently to never impact user experience
                });
            }
        }

        // 1. Navigation Timing (TTFB)
        try {
            const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                const ttfb = Math.max(0, nav.responseStart - nav.requestStart);
                const metricId = `${routeKey}:TTFB`;

                if (!reportedMetricsRef.current.has(metricId)) {
                    reportedMetricsRef.current.add(metricId);
                    queue.push({
                        name: "TTFB",
                        value: ttfb,
                        route: cleanRoute,
                        locale: language === "en" ? "en" : "ar",
                        deviceClass,
                        authClass,
                        navigationTiming: {
                            ttfb: Math.round(ttfb),
                            load: Math.round(nav.loadEventEnd - nav.startTime),
                            domComplete: Math.round(nav.domComplete - nav.startTime),
                        },
                    });
                }
            }
        } catch {}

        // 2. Largest Contentful Paint (LCP)
        let lcpObserver: PerformanceObserver | null = null;
        try {
            lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length > 0) {
                    const lastEntry = entries[entries.length - 1];
                    const lcpValue = Math.round(lastEntry.startTime);
                    const metricId = `${routeKey}:LCP`;

                    if (!reportedMetricsRef.current.has(metricId) || lcpValue > 0) {
                        reportedMetricsRef.current.add(metricId);
                        queue.push({
                            name: "LCP",
                            value: lcpValue,
                            route: cleanRoute,
                            locale: language === "en" ? "en" : "ar",
                            deviceClass,
                            authClass,
                        });
                    }
                }
            });
            lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        } catch {}

        // 3. Cumulative Layout Shift (CLS)
        let clsObserver: PerformanceObserver | null = null;
        let clsScore = 0;
        try {
            clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    const layoutShift = entry as any;
                    if (!layoutShift.hadRecentInput) {
                        clsScore += layoutShift.value;
                    }
                }
            });
            clsObserver.observe({ type: "layout-shift", buffered: true });
        } catch {}

        // 4. Interaction to Next Paint (INP) proxy
        let inpObserver: PerformanceObserver | null = null;
        let maxInteractionDuration = 0;
        try {
            inpObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    const duration = Math.round(entry.duration);
                    if (duration > maxInteractionDuration) {
                        maxInteractionDuration = duration;
                    }
                }
            });
            inpObserver.observe({ type: "event", buffered: true, durationThreshold: 16 } as any);
        } catch {}

        // Flush on visibility change / unload
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                if (clsScore > 0) {
                    queue.push({
                        name: "CLS",
                        value: Number(clsScore.toFixed(3)),
                        route: cleanRoute,
                        locale: language === "en" ? "en" : "ar",
                        deviceClass,
                        authClass,
                    });
                }
                if (maxInteractionDuration > 0) {
                    queue.push({
                        name: "INP",
                        value: maxInteractionDuration,
                        route: cleanRoute,
                        locale: language === "en" ? "en" : "ar",
                        deviceClass,
                        authClass,
                    });
                }
                flushQueue();
            }
        };

        // Initial debounced flush for early metrics (TTFB, initial LCP)
        const timer = setTimeout(flushQueue, 3500);
        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pagehide", handleVisibilityChange);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pagehide", handleVisibilityChange);
            lcpObserver?.disconnect();
            clsObserver?.disconnect();
            inpObserver?.disconnect();
        };
    }, [pathname, customer, language]);

    return null;
}
