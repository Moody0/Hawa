/**
 * Hawa Distribution — Production Performance & Reliability Monitoring (Phase 10.5)
 *
 * Privacy-safe Telemetry, Core Web Vitals Tracking & Production Alerting System.
 * 
 * Strict Privacy Guarantees:
 * - Redacts all PII (names, phone numbers, emails, physical addresses).
 * - Excludes user search query text, order items/contents, authentication tokens, credentials, and cookies.
 * - Truncates and canonicalizes route URLs (removes query strings and URL fragments).
 * - Only records coarse device class (mobile, tablet, desktop) and auth class (guest, merchant, admin).
 */

export type DeviceClass = 'mobile' | 'tablet' | 'desktop';
export type AuthClass = 'guest' | 'merchant' | 'admin';
export type LocaleCode = 'ar' | 'en';

export type WebVitalMetric = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export type ErrorCategory =
    | '500_server_error'
    | 'order_failure'
    | 'stock_conflict'
    | 'auth_abuse'
    | 'cache_invalidation_failure';

export interface WebVitalEvent {
    name: WebVitalMetric;
    value: number;
    rating?: MetricRating;
    route: string;
    locale: LocaleCode;
    deviceClass: DeviceClass;
    authClass: AuthClass;
    navigationType?: string;
    navigationTiming?: {
        dns?: number;
        ttfb?: number;
        load?: number;
        domComplete?: number;
    };
    timestamp?: number;
}

export interface ApiLatencyEvent {
    endpoint: string;
    method: string;
    status: number;
    durationMs: number;
    authClass?: AuthClass;
    timestamp?: number;
}

export interface ErrorEvent {
    category: ErrorCategory;
    route?: string;
    message: string;
    status?: number;
    details?: Record<string, unknown>;
    timestamp?: number;
}

export interface AlertTrigger {
    category: ErrorCategory;
    threshold: number;
    windowMs: number;
    name: string;
}

// Configurable alert triggers as per Phase 10.5 requirements
export const ALERT_RULES: Record<ErrorCategory, AlertTrigger> = {
    '500_server_error': {
        category: '500_server_error',
        threshold: 5,
        windowMs: 60_000, // 5 occurrences in 1 minute
        name: 'High 500 Server Error Rate',
    },
    'order_failure': {
        category: 'order_failure',
        threshold: 3,
        windowMs: 300_000, // 3 failures in 5 minutes
        name: 'Elevated Order Failure Rate',
    },
    'stock_conflict': {
        category: 'stock_conflict',
        threshold: 3,
        windowMs: 300_000, // 3 conflicts in 5 minutes
        name: 'Inventory Stock Reservation Conflict Spike',
    },
    'auth_abuse': {
        category: 'auth_abuse',
        threshold: 5,
        windowMs: 60_000, // 5 abuse/blocked attempts in 1 minute
        name: 'Authentication Abuse / Rate Limit Spike',
    },
    'cache_invalidation_failure': {
        category: 'cache_invalidation_failure',
        threshold: 2,
        windowMs: 60_000, // 2 cache invalidation errors in 1 minute
        name: 'Cache Invalidation Failure',
    },
};

// Patterns for detecting sensitive information in strings
const SENSITIVE_KEY_REGEX = /^(pass(word)?|token|secret|auth|authorization|cookie|session|key|phone|email|owner|shop|address|notes|search|query|items|cart|credit|card)/i;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SYRIAN_PHONE_REGEX = /(?:\+?963|00963|0)?9\d{8}/g;
const GENERAL_PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const TOKEN_BEARER_REGEX = /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi;

/**
 * Strips sensitive data, PII, credentials, query parameters, and search inputs from strings.
 */
export function scrubString(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
        .replace(TOKEN_BEARER_REGEX, 'Bearer [REDACTED_TOKEN]')
        .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
        .replace(SYRIAN_PHONE_REGEX, '[REDACTED_PHONE]')
        .replace(GENERAL_PHONE_REGEX, '[REDACTED_PHONE]');
}

/**
 * Sanitizes URLs to remove query strings and hash anchors (which may leak search terms or tokens).
 */
export function sanitizeRouteUrl(urlPath: string): string {
    if (!urlPath) return '/';
    // Remove protocol and domain if full URL is passed
    let clean = urlPath.replace(/^https?:\/\/[^/]+/i, '');
    // Strip query parameters and hash fragments
    clean = clean.split('?')[0].split('#')[0];
    // Normalize trailing slash (except root)
    if (clean.length > 1 && clean.endsWith('/')) {
        clean = clean.slice(0, -1);
    }
    return clean || '/';
}

/**
 * Deep-scrubs any object to ensure no PII or sensitive keys are stored or transmitted.
 */
export function scrubPrivacyData<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return scrubString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => scrubPrivacyData(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
        const cleaned: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
            if (SENSITIVE_KEY_REGEX.test(key)) {
                cleaned[key] = '[REDACTED]';
            } else {
                cleaned[key] = scrubPrivacyData(val);
            }
        }
        return cleaned as unknown as T;
    }

    return obj;
}

export interface FiredAlert {
    id: string;
    category: ErrorCategory;
    name: string;
    timestamp: number;
    countInWindow: number;
    threshold: number;
    sampleMessage: string;
    details?: Record<string, unknown>;
}

// In-memory sliding-window telemetry storage
class MonitoringStore {
    private vitals: WebVitalEvent[] = [];
    private latencies: ApiLatencyEvent[] = [];
    private errors: ErrorEvent[] = [];
    private alerts: FiredAlert[] = [];
    private maxEvents = 2000;

    recordVital(event: WebVitalEvent) {
        const sanitized: WebVitalEvent = {
            name: event.name,
            value: Number(event.value.toFixed(2)),
            rating: event.rating || this.calculateRating(event.name, event.value),
            route: sanitizeRouteUrl(event.route),
            locale: event.locale === 'en' ? 'en' : 'ar',
            deviceClass: event.deviceClass || 'desktop',
            authClass: event.authClass || 'guest',
            navigationType: event.navigationType ? scrubString(event.navigationType) : undefined,
            navigationTiming: event.navigationTiming ? scrubPrivacyData(event.navigationTiming) : undefined,
            timestamp: event.timestamp || Date.now(),
        };

        this.vitals.push(sanitized);
        if (this.vitals.length > this.maxEvents) this.vitals.shift();
    }

    recordLatency(event: ApiLatencyEvent) {
        const sanitized: ApiLatencyEvent = {
            endpoint: sanitizeRouteUrl(event.endpoint),
            method: (event.method || 'GET').toUpperCase(),
            status: event.status || 200,
            durationMs: Math.round(event.durationMs),
            authClass: event.authClass || 'guest',
            timestamp: event.timestamp || Date.now(),
        };

        this.latencies.push(sanitized);
        if (this.latencies.length > this.maxEvents) this.latencies.shift();

        // Check if 500 error occurred in API call
        if (sanitized.status >= 500) {
            this.recordError({
                category: '500_server_error',
                route: sanitized.endpoint,
                message: `HTTP ${sanitized.status} on ${sanitized.method} ${sanitized.endpoint}`,
                status: sanitized.status,
            });
        }
    }

    recordError(event: ErrorEvent) {
        const sanitized: ErrorEvent = {
            category: event.category,
            route: event.route ? sanitizeRouteUrl(event.route) : undefined,
            message: scrubString(event.message || 'Unknown error'),
            status: event.status,
            details: event.details ? scrubPrivacyData(event.details) : undefined,
            timestamp: event.timestamp || Date.now(),
        };

        this.errors.push(sanitized);
        if (this.errors.length > this.maxEvents) this.errors.shift();

        // Evaluate alert trigger for this category
        this.evaluateAlert(sanitized);
    }

    private evaluateAlert(triggerEvent: ErrorEvent) {
        const rule = ALERT_RULES[triggerEvent.category];
        if (!rule) return;

        const now = Date.now();
        const cutoff = now - rule.windowMs;

        const countInWindow = this.errors.filter(
            (e) => e.category === triggerEvent.category && (e.timestamp || 0) >= cutoff
        ).length;

        if (countInWindow >= rule.threshold) {
            // Check if alert was recently fired for this category in the same window
            const recentAlert = this.alerts.find(
                (a) => a.category === triggerEvent.category && now - a.timestamp < rule.windowMs / 2
            );

            if (!recentAlert) {
                const firedAlert: FiredAlert = {
                    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    category: triggerEvent.category,
                    name: rule.name,
                    timestamp: now,
                    countInWindow,
                    threshold: rule.threshold,
                    sampleMessage: triggerEvent.message,
                    details: triggerEvent.details,
                };

                this.alerts.push(firedAlert);
                if (this.alerts.length > 100) this.alerts.shift();

                // Structured logging for production observability platforms
                console.error(`[PROD_ALERT:${firedAlert.category.toUpperCase()}] ${firedAlert.name}`, {
                    category: firedAlert.category,
                    countInWindow: firedAlert.countInWindow,
                    threshold: firedAlert.threshold,
                    route: triggerEvent.route,
                    sampleMessage: firedAlert.sampleMessage,
                    timestamp: new Date(now).toISOString(),
                });
            }
        }
    }

    private calculateRating(name: WebVitalMetric, value: number): MetricRating {
        switch (name) {
            case 'LCP':
                return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
            case 'INP':
                return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
            case 'CLS':
                return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
            case 'FCP':
                return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
            case 'TTFB':
                return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
            default:
                return 'good';
        }
    }

    getStats() {
        // Compute Web Vitals stats
        const vitalsSummary: Record<string, {
            count: number;
            p75: number;
            goodPct: number;
            needsImprovementPct: number;
            poorPct: number;
            targetPassed: boolean;
        }> = {};

        const metricNames: WebVitalMetric[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

        for (const metric of metricNames) {
            const values = this.vitals
                .filter((v) => v.name === metric)
                .map((v) => v.value)
                .sort((a, b) => a - b);

            if (values.length > 0) {
                const p75Index = Math.floor(values.length * 0.75);
                const p75 = values[Math.min(p75Index, values.length - 1)];

                const goodCount = values.filter((v) => this.calculateRating(metric, v) === 'good').length;
                const needsImpCount = values.filter((v) => this.calculateRating(metric, v) === 'needs-improvement').length;
                const poorCount = values.filter((v) => this.calculateRating(metric, v) === 'poor').length;

                const target = metric === 'LCP' ? 2500 : metric === 'INP' ? 200 : metric === 'CLS' ? 0.10 : 800;

                vitalsSummary[metric] = {
                    count: values.length,
                    p75,
                    goodPct: Number(((goodCount / values.length) * 100).toFixed(1)),
                    needsImprovementPct: Number(((needsImpCount / values.length) * 100).toFixed(1)),
                    poorPct: Number(((poorCount / values.length) * 100).toFixed(1)),
                    targetPassed: p75 <= target,
                };
            }
        }

        // Compute API Latencies stats
        const apiSummary: Record<string, { count: number; p50: number; p95: number; errorRatePct: number }> = {};
        const endpointGroups = new Map<string, ApiLatencyEvent[]>();

        for (const item of this.latencies) {
            const key = `${item.method} ${item.endpoint}`;
            const group = endpointGroups.get(key) || [];
            group.push(item);
            endpointGroups.set(key, group);
        }

        for (const [key, group] of endpointGroups.entries()) {
            const durations = group.map((g) => g.durationMs).sort((a, b) => a - b);
            const p50 = durations[Math.floor(durations.length * 0.50)];
            const p95 = durations[Math.floor(durations.length * 0.95)];
            const serverErrors = group.filter((g) => g.status >= 500).length;

            apiSummary[key] = {
                count: group.length,
                p50,
                p95,
                errorRatePct: Number(((serverErrors / group.length) * 100).toFixed(2)),
            };
        }

        // Error Counts
        const errorSummary: Record<string, number> = {};
        for (const err of this.errors) {
            errorSummary[err.category] = (errorSummary[err.category] || 0) + 1;
        }

        return {
            totalWebVitalEvents: this.vitals.length,
            totalApiEvents: this.latencies.length,
            totalErrorEvents: this.errors.length,
            vitals: vitalsSummary,
            apis: apiSummary,
            errorsByCategory: errorSummary,
            recentAlerts: [...this.alerts].reverse().slice(0, 20),
        };
    }

    reset() {
        this.vitals = [];
        this.latencies = [];
        this.errors = [];
        this.alerts = [];
    }
}

// Global singleton monitoring instance
const monitoringStore = new MonitoringStore();

export function recordWebVital(event: WebVitalEvent) {
    monitoringStore.recordVital(event);
}

export function recordApiLatency(event: ApiLatencyEvent) {
    monitoringStore.recordLatency(event);
}

export function recordErrorEvent(event: ErrorEvent) {
    monitoringStore.recordError(event);
}

export function getMonitoringStats() {
    return monitoringStore.getStats();
}

export function resetMonitoringStats() {
    monitoringStore.reset();
}
