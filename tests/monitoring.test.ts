import { describe, it, expect, beforeEach } from 'vitest';
import {
    scrubString,
    sanitizeRouteUrl,
    scrubPrivacyData,
    recordWebVital,
    recordApiLatency,
    recordErrorEvent,
    getMonitoringStats,
    resetMonitoringStats,
    ALERT_RULES,
} from '@/lib/monitoring';

describe('Phase 10.5: Privacy-Safe Production Monitoring & Alerting', () => {
    beforeEach(() => {
        resetMonitoringStats();
    });

    describe('Privacy & PII Scrubbing Guarantees', () => {
        it('strips query strings and hash anchors from route paths', () => {
            expect(sanitizeRouteUrl('/products?search=milk&category=dairy')).toBe('/products');
            expect(sanitizeRouteUrl('https://hawatrading.com/cart?token=secret123#checkout')).toBe('/cart');
            expect(sanitizeRouteUrl('/brands/alreef/')).toBe('/brands/alreef');
            expect(sanitizeRouteUrl('')).toBe('/');
        });

        it('redacts Syrian and international phone numbers from strings', () => {
            const raw1 = 'Customer called from 0944123456 regarding order';
            const raw2 = 'International contact: +963944123456';
            expect(scrubString(raw1)).toContain('[REDACTED_PHONE]');
            expect(scrubString(raw1)).not.toContain('0944123456');
            expect(scrubString(raw2)).toContain('[REDACTED_PHONE]');
            expect(scrubString(raw2)).not.toContain('+963944123456');
        });

        it('redacts email addresses and authorization tokens from strings', () => {
            const raw = 'Auth error for admin@hawatrading.com with header Bearer eyJhbGciOi...';
            const scrubbed = scrubString(raw);
            expect(scrubbed).toContain('[REDACTED_EMAIL]');
            expect(scrubbed).toContain('Bearer [REDACTED_TOKEN]');
            expect(scrubbed).not.toContain('admin@hawatrading.com');
        });

        it('deep-scrubs sensitive objects, deleting credentials, queries, and order line details', () => {
            const sensitivePayload = {
                route: '/products?search=cheese',
                user: {
                    shopName: 'Al-Madina Store',
                    ownerName: 'Mohammad',
                    phone: '0955512345',
                    email: 'shop@example.com',
                    password: 'superSecretPassword123',
                },
                order: {
                    items: [{ productId: 'p1', quantity: 50 }],
                    notes: 'Deliver to back entrance',
                },
                safeField: 'CatalogNavigation',
            };

            const cleaned = scrubPrivacyData(sensitivePayload);

            expect(cleaned.safeField).toBe('CatalogNavigation');
            expect(cleaned.user.password).toBe('[REDACTED]');
            expect(cleaned.user.shopName).toBe('[REDACTED]');
            expect(cleaned.user.ownerName).toBe('[REDACTED]');
            expect(cleaned.user.phone).toBe('[REDACTED]');
            expect(cleaned.user.email).toBe('[REDACTED]');
            expect(cleaned.order.items).toBe('[REDACTED]');
            expect(cleaned.order.notes).toBe('[REDACTED]');
        });
    });

    describe('Core Web Vitals Telemetry Aggregation', () => {
        it('records web vitals and calculates p75 percentile accurately', () => {
            const lcpValues = [1200, 1500, 1800, 2100, 2400, 3100, 4200];
            for (const val of lcpValues) {
                recordWebVital({
                    name: 'LCP',
                    value: val,
                    route: '/products?sort=popular',
                    locale: 'ar',
                    deviceClass: 'mobile',
                    authClass: 'guest',
                });
            }

            const stats = getMonitoringStats();
            expect(stats.totalWebVitalEvents).toBe(7);
            expect(stats.vitals.LCP).toBeDefined();
            expect(stats.vitals.LCP.count).toBe(7);
            // p75 of 7 values is at index 5 (3100)
            expect(stats.vitals.LCP.p75).toBe(3100);
            expect(stats.vitals.LCP.targetPassed).toBe(false); // 3100 > 2500
        });

        it('reports good status when vitals pass production targets', () => {
            const goodValues = [800, 950, 1100, 1200, 1400];
            for (const val of goodValues) {
                recordWebVital({
                    name: 'LCP',
                    value: val,
                    route: '/',
                    locale: 'ar',
                    deviceClass: 'desktop',
                    authClass: 'guest',
                });
            }

            const stats = getMonitoringStats();
            expect(stats.vitals.LCP.p75).toBeLessThanOrEqual(2500);
            expect(stats.vitals.LCP.targetPassed).toBe(true);
            expect(stats.vitals.LCP.goodPct).toBe(100);
        });
    });

    describe('API Latency & Error Rate Aggregation', () => {
        it('aggregates API latencies into p50 and p95 percentiles', () => {
            for (let i = 1; i <= 20; i++) {
                recordApiLatency({
                    endpoint: '/api/products',
                    method: 'GET',
                    status: 200,
                    durationMs: i * 10, // 10ms to 200ms
                });
            }

            const stats = getMonitoringStats();
            expect(stats.totalApiEvents).toBe(20);
            const apiStats = stats.apis['GET /api/products'];
            expect(apiStats).toBeDefined();
            expect(apiStats.count).toBe(20);
            expect(apiStats.p50).toBe(110);
            expect(apiStats.p95).toBe(200);
            expect(apiStats.errorRatePct).toBe(0);
        });
    });

    describe('Production Reliability Alerts (Phase 10.5)', () => {
        it('fires alert when unexpected 500 server error rate threshold is reached', () => {
            const rule = ALERT_RULES['500_server_error'];
            expect(rule.threshold).toBe(5);

            for (let i = 0; i < 5; i++) {
                recordErrorEvent({
                    category: '500_server_error',
                    route: '/api/categories',
                    message: `Internal server failure #${i}`,
                    status: 500,
                });
            }

            const stats = getMonitoringStats();
            expect(stats.errorsByCategory['500_server_error']).toBe(5);
            expect(stats.recentAlerts.length).toBeGreaterThanOrEqual(1);
            expect(stats.recentAlerts[0].category).toBe('500_server_error');
            expect(stats.recentAlerts[0].countInWindow).toBe(5);
        });

        it('fires alert when order failures exceed threshold in the window', () => {
            const rule = ALERT_RULES['order_failure'];
            for (let i = 0; i < rule.threshold; i++) {
                recordErrorEvent({
                    category: 'order_failure',
                    route: '/api/orders',
                    message: `Payment gateway / submission fault #${i}`,
                    status: 422,
                });
            }

            const stats = getMonitoringStats();
            const orderAlert = stats.recentAlerts.find((a) => a.category === 'order_failure');
            expect(orderAlert).toBeDefined();
            expect(orderAlert?.threshold).toBe(rule.threshold);
        });

        it('fires alert when inventory stock reservation conflicts spike', () => {
            const rule = ALERT_RULES['stock_conflict'];
            for (let i = 0; i < rule.threshold; i++) {
                recordErrorEvent({
                    category: 'stock_conflict',
                    route: '/api/orders',
                    message: `الكمية المطلوبة من منتج غير متوفرة`,
                    status: 422,
                });
            }

            const stats = getMonitoringStats();
            const conflictAlert = stats.recentAlerts.find((a) => a.category === 'stock_conflict');
            expect(conflictAlert).toBeDefined();
            expect(conflictAlert?.countInWindow).toBe(rule.threshold);
        });

        it('fires alert on authentication abuse and rate limit violations', () => {
            const rule = ALERT_RULES['auth_abuse'];
            for (let i = 0; i < rule.threshold; i++) {
                recordErrorEvent({
                    category: 'auth_abuse',
                    message: `Brute force attempt blocked on /api/customer/auth/login`,
                });
            }

            const stats = getMonitoringStats();
            const authAlert = stats.recentAlerts.find((a) => a.category === 'auth_abuse');
            expect(authAlert).toBeDefined();
            expect(authAlert?.category).toBe('auth_abuse');
        });

        it('fires alert on cache invalidation failures', () => {
            const rule = ALERT_RULES['cache_invalidation_failure'];
            for (let i = 0; i < rule.threshold; i++) {
                recordErrorEvent({
                    category: 'cache_invalidation_failure',
                    route: '/products',
                    message: `Failed to revalidateTag('catalog')`,
                });
            }

            const stats = getMonitoringStats();
            const cacheAlert = stats.recentAlerts.find((a) => a.category === 'cache_invalidation_failure');
            expect(cacheAlert).toBeDefined();
            expect(cacheAlert?.category).toBe('cache_invalidation_failure');
        });
    });
});
