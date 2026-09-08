import crypto from 'crypto';

export const GUEST_ORDER_SESSION_COOKIE = 'hawa_guest_orders';

function getOrderTokenSecret(): string {
    const secret = process.env.ORDER_TOKEN_SECRET || process.env.CUSTOMER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('CRITICAL SECURITY ERROR: ORDER_TOKEN_SECRET, CUSTOMER_AUTH_SECRET, or NEXTAUTH_SECRET must be configured in production environment.');
        }
        return 'hawa-dev-order-token-fallback-secret-for-tests-only';
    }
    return secret;
}

export interface OrderTokenPayload {
    orderId: string;
    nonce: string;
    exp: number; // UNIX timestamp seconds
}

/**
 * Creates an expiring HMAC signed access token containing a random nonce for an order.
 * By default expires in 48 hours.
 */
export function signOrderAccessToken(orderId: string, expiresInHours = 48): string {
    if (!orderId) throw new Error('orderId is required to sign order token');
    const secret = getOrderTokenSecret();
    const nonce = crypto.randomBytes(16).toString('hex');
    const exp = Math.floor(Date.now() / 1000) + (expiresInHours * 3600);
    const payload: OrderTokenPayload = { orderId, nonce, exp };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('base64url');
    return `${base64Payload}.${signature}`;
}

/**
 * Validates whether the given token grants access to view the specified order.
 * Enforces order binding, signature integrity, and expiration.
 * Also supports legacy 64-character tokens for backwards compatibility.
 */
export function verifyOrderAccessToken(orderId: string, token: string | null | undefined): boolean {
    if (!orderId || !token || typeof token !== 'string') return false;
    const secret = getOrderTokenSecret();

    // Check modern expiring format: <base64urlPayload>.<signature>
    if (token.includes('.')) {
        try {
            const parts = token.split('.');
            if (parts.length !== 2) return false;
            const [base64Payload, signature] = parts;

            const expectedSig = crypto.createHmac('sha256', secret).update(base64Payload).digest('base64url');
            const expectedBuf = Buffer.from(expectedSig);
            const sigBuf = Buffer.from(signature);
            if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
                return false;
            }

            const payload: OrderTokenPayload = JSON.parse(
                Buffer.from(base64Payload, 'base64url').toString('utf-8')
            );

            if (payload.orderId !== orderId) return false;
            if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
                return false; // Expired
            }

            return true;
        } catch {
            return false;
        }
    }

    // Backwards compatibility with legacy static 64-hex tokens
    if (token.length === 64) {
        try {
            const legacyExpected = crypto.createHmac('sha256', secret).update(`hawa_order:${orderId}`).digest('hex');
            const expectedBuf = Buffer.from(legacyExpected);
            const tokenBuf = Buffer.from(token);
            if (expectedBuf.length !== tokenBuf.length) return false;
            return crypto.timingSafeEqual(expectedBuf, tokenBuf);
        } catch {
            return false;
        }
    }

    return false;
}

/**
 * Helper to manage the single scoped guest order session cookie (hawa_guest_orders).
 * Stores a map of orderId -> token, HMAC-signed to prevent tampering.
 */
export interface GuestOrderSessionPayload {
    orders: Record<string, string>; // orderId -> token
    exp: number;
}

export function signGuestOrderSession(orders: Record<string, string>, expiresInDays = 7): string {
    const secret = getOrderTokenSecret();
    const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 86400);
    const payload: GuestOrderSessionPayload = { orders, exp };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('base64url');
    return `${base64Payload}.${signature}`;
}

export function parseGuestOrderSession(cookieValue: string | null | undefined): Record<string, string> {
    if (!cookieValue || typeof cookieValue !== 'string') return {};
    try {
        const parts = cookieValue.split('.');
        if (parts.length !== 2) return {};
        const [base64Payload, signature] = parts;
        const secret = getOrderTokenSecret();
        const expectedSig = crypto.createHmac('sha256', secret).update(base64Payload).digest('base64url');
        const expectedBuf = Buffer.from(expectedSig);
        const sigBuf = Buffer.from(signature);
        if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
            return {};
        }

        const payload: GuestOrderSessionPayload = JSON.parse(
            Buffer.from(base64Payload, 'base64url').toString('utf-8')
        );

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return {};
        }

        return payload.orders || {};
    } catch {
        return {};
    }
}

export function addOrderToGuestSession(
    currentCookieValue: string | null | undefined,
    orderId: string,
    token: string
): string {
    const orders = parseGuestOrderSession(currentCookieValue);
    orders[orderId] = token;
    return signGuestOrderSession(orders);
}

export function isOrderAuthorizedInGuestSession(
    currentCookieValue: string | null | undefined,
    orderId: string
): boolean {
    const orders = parseGuestOrderSession(currentCookieValue);
    const token = orders[orderId];
    if (!token) return false;
    return verifyOrderAccessToken(orderId, token);
}
