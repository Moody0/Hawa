import { describe, it, expect, beforeEach } from 'vitest';
import { 
    getClientIp, 
    anonymizeIp, 
    recordSecurityMetric, 
    getSecurityMetrics, 
    checkRateLimit, 
    checkLoginBackoff, 
    recordLoginFailure, 
    recordLoginSuccess, 
    checkRequestBodyLimit, 
    resetAllRateLimits 
} from '@/lib/rate-limit';

describe('Abuse Controls & Rate Limiting (Task 4.7)', () => {
    beforeEach(() => {
        resetAllRateLimits();
    });

    describe('Client IP & Privacy-safe Metrics', () => {
        it('extracts client IP from x-forwarded-for header (leftmost IP)', () => {
            const req = new Request('http://localhost/api/test', {
                headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' },
            });
            expect(getClientIp(req)).toBe('203.0.113.195');
        });

        it('falls back to x-real-ip or 127.0.0.1 when x-forwarded-for is missing', () => {
            const req1 = new Request('http://localhost/api/test', {
                headers: { 'x-real-ip': '198.51.100.22' },
            });
            expect(getClientIp(req1)).toBe('198.51.100.22');

            const req2 = new Request('http://localhost/api/test');
            expect(getClientIp(req2)).toBe('127.0.0.1');
        });

        it('anonymizes IP address using one-way cryptographic hash', () => {
            const ip = '203.0.113.195';
            const hashed = anonymizeIp(ip);
            expect(hashed).toHaveLength(10);
            expect(hashed).not.toContain('203');
            expect(anonymizeIp(ip)).toBe(hashed); // deterministic
        });

        it('records privacy-safe security metrics without PII', () => {
            recordSecurityMetric({
                action: 'customer_login',
                ip: '203.0.113.195',
                status: 'failed',
                reason: 'invalid_credentials',
            });

            const metrics = getSecurityMetrics();
            expect(metrics.length).toBeGreaterThan(0);
            const last = metrics[metrics.length - 1];
            expect(last.action).toBe('customer_login');
            expect(last.status).toBe('failed');
            expect(last.clientHash).toBe(anonymizeIp('203.0.113.195'));
            expect((last as any).ip).toBeUndefined(); // no raw IP
        });
    });

    describe('Sliding Window Rate Limiter', () => {
        it('allows requests within limit and blocks subsequent requests with retry-after', () => {
            const key = 'test_action:client1';
            const limit = 3;
            const windowMs = 5000;

            expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
            expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
            expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);

            // 4th attempt should be blocked
            const blocked = checkRateLimit(key, limit, windowMs);
            expect(blocked.allowed).toBe(false);
            expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
            expect(blocked.remaining).toBe(0);
        });
    });

    describe('Exponential Login Backoff', () => {
        it('allows attempts under failure threshold and activates exponential backoff lockout after repeated failures', () => {
            const ip = '198.51.100.5';
            const account = '0993443901';

            // First 4 failures do not trigger lockout
            for (let i = 1; i <= 4; i++) {
                const res = recordLoginFailure(ip, account);
                expect(res.failures).toBe(i);
                expect(res.retryAfterSeconds).toBe(0);
                expect(checkLoginBackoff(ip, account).allowed).toBe(true);
            }

            // 5th failure triggers 30s lockout
            const fifth = recordLoginFailure(ip, account);
            expect(fifth.failures).toBe(5);
            expect(fifth.retryAfterSeconds).toBe(30);
            expect(checkLoginBackoff(ip, account).allowed).toBe(false);

            // 6th failure increases lockout to 60s
            const sixth = recordLoginFailure(ip, account);
            expect(sixth.failures).toBe(6);
            expect(sixth.retryAfterSeconds).toBe(60);

            // Successful login resets backoff completely
            recordLoginSuccess(ip, account);
            expect(checkLoginBackoff(ip, account).allowed).toBe(true);
        });
    });

    describe('Request Body Size Limits', () => {
        it('validates content-length against max allowed bytes', () => {
            const smallReq = new Request('http://localhost/api/test', {
                headers: { 'content-length': '1024' }, // 1KB
            });
            expect(checkRequestBodyLimit(smallReq, 50 * 1024)).toBe(true);

            const largeReq = new Request('http://localhost/api/test', {
                headers: { 'content-length': '2000000' }, // ~2MB
            });
            expect(checkRequestBodyLimit(largeReq, 50 * 1024)).toBe(false);
        });
    });
});
