import { describe, it, expect } from 'vitest';
import { validateOrderForm, OrderFormFields } from '@/lib/order-validation';
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

});
