import crypto from 'crypto';
import { recordErrorEvent } from './monitoring';

interface RateLimitRecord {
    timestamps: number[];
}

interface LoginFailureRecord {
    failures: number;
    lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const loginFailureMap = new Map<string, LoginFailureRecord>();

// Security metrics storage for monitoring
interface SecurityMetric {
    timestamp: number;
    action: string;
    clientHash: string;
    status: 'allowed' | 'blocked' | 'failed' | 'success';
    reason?: string;
}

const securityMetricsLog: SecurityMetric[] = [];
const MAX_METRICS_LOG = 1000;

/**
 * Extracts client IP from headers.
 * Uses x-forwarded-for first (leftmost client), x-real-ip, or fallback.
 */
export function getClientIp(req: Request): string {
    const xForwardedFor = req.headers.get('x-forwarded-for');
    if (xForwardedFor) {
        const firstIp = xForwardedFor.split(',')[0].trim();
        if (firstIp) return firstIp;
    }
    const xRealIp = req.headers.get('x-real-ip');
    if (xRealIp?.trim()) return xRealIp.trim();

    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    if (cfConnectingIp?.trim()) return cfConnectingIp.trim();

    return '127.0.0.1';
}

/**
 * Creates a privacy-safe truncated hash of an IP address.
 */
export function anonymizeIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 10);
}

/**
 * Emits and logs privacy-safe security metrics without leaking PII or credentials.
 */
export function recordSecurityMetric(event: {
    action: string;
    ip: string;
    status: 'allowed' | 'blocked' | 'failed' | 'success';
    reason?: string;
}): void {
    const clientHash = anonymizeIp(event.ip);
    const metric: SecurityMetric = {
        timestamp: Date.now(),
        action: event.action,
        clientHash,
        status: event.status,
        reason: event.reason,
    };

    if (securityMetricsLog.length >= MAX_METRICS_LOG) {
        securityMetricsLog.shift();
    }
    securityMetricsLog.push(metric);

    // If blocked or authentication violation occurs, notify production monitoring
    if (event.status === 'blocked' || event.reason === 'too_many_failures') {
        recordErrorEvent({
            category: 'auth_abuse',
            message: `Security block triggered: ${event.action} (${event.reason || 'rate_limited'})`,
            details: { action: event.action, reason: event.reason, clientHash },
        });
    }

    if (process.env.NODE_ENV !== 'test') {
        console.log(`[SECURITY_METRIC] action=${metric.action} client=${metric.clientHash} status=${metric.status} reason=${metric.reason || 'none'}`);
    }
}

export function getSecurityMetrics(): readonly SecurityMetric[] {
    return securityMetricsLog;
}

/**
 * Sliding-window rate limiter.
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    // In test environment, bypass rate limits unless specifically testing rate limits
    if (process.env.NODE_ENV === 'test' && !key.startsWith('test_')) {
        return {
            allowed: true,
            remaining: limit,
            retryAfterSeconds: 0,
        };
    }

    const now = Date.now();
    const record = rateLimitMap.get(key) || { timestamps: [] };

    // Filter out timestamps outside the current window
    const windowStart = now - windowMs;
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
        const oldest = record.timestamps[0];
        const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
        rateLimitMap.set(key, record);
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds,
        };
    }

    record.timestamps.push(now);
    rateLimitMap.set(key, record);

    return {
        allowed: true,
        remaining: limit - record.timestamps.length,
        retryAfterSeconds: 0,
    };
}

/**
 * Checks exponential backoff lockout for failed login attempts.
 * Backoff schedule:
 * 5 failures: 30s
 * 6 failures: 60s
 * 7 failures: 120s
 * 8 failures: 300s
 * 9+ failures: 900s (15 min)
 */
export function checkLoginBackoff(
    ip: string,
    accountKey: string
): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const key = `login_fail:${ip}:${accountKey}`;
    const record = loginFailureMap.get(key);

    if (!record || record.lockedUntil <= now) {
        return { allowed: true, retryAfterSeconds: 0 };
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((record.lockedUntil - now) / 1000));
    return { allowed: false, retryAfterSeconds };
}

/**
 * Records a failed login attempt and calculates exponential lockout if threshold is exceeded.
 */
export function recordLoginFailure(
    ip: string,
    accountKey: string
): { failures: number; lockedUntil: number; retryAfterSeconds: number } {
    const now = Date.now();
    const key = `login_fail:${ip}:${accountKey}`;
    const record = loginFailureMap.get(key) || { failures: 0, lockedUntil: 0 };

    record.failures += 1;

    let lockoutMs = 0;
    if (record.failures === 5) {
        lockoutMs = 30 * 1000; // 30s
    } else if (record.failures === 6) {
        lockoutMs = 60 * 1000; // 1 min
    } else if (record.failures === 7) {
        lockoutMs = 120 * 1000; // 2 min
    } else if (record.failures === 8) {
        lockoutMs = 300 * 1000; // 5 min
    } else if (record.failures >= 9) {
        lockoutMs = 900 * 1000; // 15 min
    }

    if (lockoutMs > 0) {
        record.lockedUntil = now + lockoutMs;
    }

    loginFailureMap.set(key, record);

    const retryAfterSeconds = lockoutMs > 0 ? Math.ceil(lockoutMs / 1000) : 0;
    return {
        failures: record.failures,
        lockedUntil: record.lockedUntil,
        retryAfterSeconds,
    };
}

/**
 * Resets failed login attempts upon a successful login.
 */
export function recordLoginSuccess(ip: string, accountKey: string): void {
    const key = `login_fail:${ip}:${accountKey}`;
    loginFailureMap.delete(key);
}

/**
 * Validates request body Content-Length header against max allowed bytes.
 * Returns true if allowed, false if payload is too large.
 */
export function checkRequestBodyLimit(req: Request, maxBytes: number): boolean {
    const contentLength = req.headers.get('content-length');
    if (!contentLength) return true;
    const parsed = parseInt(contentLength, 10);
    if (isNaN(parsed)) return true;
    return parsed <= maxBytes;
}

/**
 * Clears all rate limit state (for test isolation).
 */
export function resetAllRateLimits(): void {
    rateLimitMap.clear();
    loginFailureMap.clear();
    securityMetricsLog.length = 0;
}
