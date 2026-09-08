import { describe, it, expect } from 'vitest';
import { validateOrderForm, OrderFormFields } from '@/lib/order-validation';
import { 
    signOrderAccessToken, 
    verifyOrderAccessToken,
    addOrderToGuestSession,
    isOrderAuthorizedInGuestSession,
    parseGuestOrderSession
} from '@/lib/order-token';

describe('API Validation Tests', () => {
    describe('Order Form Payload Validation', () => {
        it('accepts valid order submission payload in Arabic', () => {
            const validPayload: OrderFormFields = {
                shopName: 'سوبرماركت الأمل',
                ownerName: 'محمد أحمد',
                phone: '0993443901',
                city: 'دمشق',
                streetAddress: 'شارع الثورة، بناء 14',
                notes: 'التسليم صباحاً',
            };

            const result = validateOrderForm(validPayload, 'ar');
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
            expect(result.cleanData.shopName).toBe('سوبرماركت الأمل');
            expect(result.cleanData.phone).toBe('0993443901');
            expect(result.cleanData.city).toBe('دمشق');
        });

        it('rejects order payload with missing or invalid fields and returns structured field errors', () => {
            const invalidPayload: OrderFormFields = {
                shopName: '',
                ownerName: '',
                phone: '123',
                city: 'InvalidCity',
                streetAddress: '',
            };

            const result = validateOrderForm(invalidPayload, 'ar');
            expect(result.isValid).toBe(false);
            expect(result.errors.shopName).toBeDefined();
            expect(result.errors.ownerName).toBeDefined();
            expect(result.errors.phone).toBeDefined();
            expect(result.errors.city).toBeDefined();
            expect(result.errors.streetAddress).toBeDefined();
        });

        it('normalizes Eastern Arabic numerals and governorate casing in payload', () => {
            const payload: OrderFormFields = {
                shopName: 'متجر النور',
                ownerName: 'أحمد علي',
                phone: '٠٩٩٣٤٤٣٩٠١',
                city: 'aleppo',
                streetAddress: 'حي الشهباء',
            };

            const result = validateOrderForm(payload, 'ar');
            expect(result.isValid).toBe(true);
            expect(result.cleanData.phone).toBe('0993443901');
            expect(result.cleanData.city).toBe('حلب');
        });
    });

    describe('Order Access Token Security', () => {
        it('generates nonce-backed expiring tokens and verifies valid order access', () => {
            const orderId = 'order_test_12345';
            const token = signOrderAccessToken(orderId);

            expect(typeof token).toBe('string');
            expect(token.includes('.')).toBe(true);

            expect(verifyOrderAccessToken(orderId, token)).toBe(true);
        });

        it('generates distinct tokens for subsequent calls due to random nonces', () => {
            const orderId = 'order_test_12345';
            const token1 = signOrderAccessToken(orderId);
            const token2 = signOrderAccessToken(orderId);

            expect(token1).not.toBe(token2);
            expect(verifyOrderAccessToken(orderId, token1)).toBe(true);
            expect(verifyOrderAccessToken(orderId, token2)).toBe(true);
        });

        it('rejects expired order tokens', () => {
            const orderId = 'order_test_12345';
            // Generate token with negative duration (already expired)
            const expiredToken = signOrderAccessToken(orderId, -1);
            expect(verifyOrderAccessToken(orderId, expiredToken)).toBe(false);
        });

        it('rejects tampered or mismatched tokens', () => {
            const orderId = 'order_test_12345';
            const token = signOrderAccessToken(orderId);

            expect(verifyOrderAccessToken('order_other_67890', token)).toBe(false);
            expect(verifyOrderAccessToken(orderId, 'tampered-token-value')).toBe(false);
            expect(verifyOrderAccessToken(orderId, null)).toBe(false);
            expect(verifyOrderAccessToken('', token)).toBe(false);
        });

        it('manages scoped guest order session cookies correctly', () => {
            const order1 = 'order_abc_1';
            const token1 = signOrderAccessToken(order1);
            const order2 = 'order_def_2';
            const token2 = signOrderAccessToken(order2);

            let sessionCookie: string | undefined = undefined;
            sessionCookie = addOrderToGuestSession(sessionCookie, order1, token1);

            expect(isOrderAuthorizedInGuestSession(sessionCookie, order1)).toBe(true);
            expect(isOrderAuthorizedInGuestSession(sessionCookie, order2)).toBe(false);

            sessionCookie = addOrderToGuestSession(sessionCookie, order2, token2);
            expect(isOrderAuthorizedInGuestSession(sessionCookie, order1)).toBe(true);
            expect(isOrderAuthorizedInGuestSession(sessionCookie, order2)).toBe(true);

            const sessionMap = parseGuestOrderSession(sessionCookie);
            expect(sessionMap[order1]).toBe(token1);
            expect(sessionMap[order2]).toBe(token2);
        });
    });

    describe('Database Isolation Safety', () => {
        it('guarantees test environment is isolated from production database URL', () => {
            const dbUrl = process.env.DATABASE_URL;
            expect(dbUrl).toBeDefined();
            expect(dbUrl).not.toContain('supabase.com');
            expect(dbUrl).not.toContain('neon.tech');
            expect(process.env.NODE_ENV).toBe('test');
        });
    });
});
