import crypto from 'crypto';

function getOrderTokenSecret(): string {
    return process.env.CUSTOMER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'hawa-order-access-token-secret-key';
}

/**
 * Creates an HMAC signed access token for an order.
 * This allows guests who just placed an order to view their order confirmation
 * without exposing an IDOR vulnerability where arbitrary orders can be viewed by unauthorized users.
 */
export function signOrderAccessToken(orderId: string): string {
    const secret = getOrderTokenSecret();
    return crypto.createHmac('sha256', secret).update(`hawa_order:${orderId}`).digest('hex');
}

/**
 * Validates whether the given token grants access to view the specified order.
 */
export function verifyOrderAccessToken(orderId: string, token: string | null | undefined): boolean {
    if (!orderId || !token || typeof token !== 'string') return false;
    try {
        const expected = signOrderAccessToken(orderId);
        const expectedBuf = Buffer.from(expected);
        const tokenBuf = Buffer.from(token);
        if (expectedBuf.length !== tokenBuf.length) return false;
        return crypto.timingSafeEqual(expectedBuf, tokenBuf);
    } catch {
        return false;
    }
}
