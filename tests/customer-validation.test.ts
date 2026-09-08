import { describe, it, expect } from 'vitest';
import { 
    validateCustomerLogin, 
    validateCustomerRegistration, 
    validateCustomerProfileUpdate,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH
} from '@/lib/customer-validation';

describe('Customer Validation & Credential Normalization (Tasks 4.5 & 4.6)', () => {
    describe('Credential Handling (Task 4.5)', () => {
        it('never trims passwords during registration or login and preserves leading/trailing spaces', () => {
            const passwordWithSpaces = '  secretP@ss123  ';
            
            const loginResult = validateCustomerLogin({
                phone: '0993443901',
                password: passwordWithSpaces,
            });
            expect(loginResult.isValid).toBe(true);
            expect(loginResult.cleanData?.password).toBe(passwordWithSpaces);

            const regResult = validateCustomerRegistration({
                shopName: 'متجر الأنوار',
                ownerName: 'أحمد محمود',
                phone: '0993443901',
                city: 'دمشق',
                address: 'شارع بغداد',
                password: passwordWithSpaces,
            });
            expect(regResult.isValid).toBe(true);
            expect(regResult.cleanData?.password).toBe(passwordWithSpaces);
        });

        it('supports Unicode and Arabic characters in passwords without corruption', () => {
            const unicodePassword = 'كلمة_سر_قوية_٢٠٢٦!#$';
            
            const loginResult = validateCustomerLogin({
                phone: '0993443901',
                password: unicodePassword,
            });
            expect(loginResult.isValid).toBe(true);
            expect(loginResult.cleanData?.password).toBe(unicodePassword);
        });

        it('enforces boundary lengths (6 to 128 characters) consistently on login and registration', () => {
            // Exactly 6 chars: OK
            expect(validateCustomerLogin({ phone: '0993443901', password: '123456' }).isValid).toBe(true);
            expect(validateCustomerRegistration({ 
                shopName: 'محل', ownerName: 'مالك', phone: '0993443901', city: 'دمشق', address: 'شارع 1', password: '123456' 
            }).isValid).toBe(true);

            // 5 chars: Rejected with field-addressable error
            const shortLogin = validateCustomerLogin({ phone: '0993443901', password: '12345' });
            expect(shortLogin.isValid).toBe(false);
            expect(shortLogin.errors.password).toMatch(/6 خانات على الأقل/);

            const shortReg = validateCustomerRegistration({ 
                shopName: 'محل', ownerName: 'مالك', phone: '0993443901', city: 'دمشق', address: 'شارع 1', password: '12345' 
            });
            expect(shortReg.isValid).toBe(false);
            expect(shortReg.errors.password).toMatch(/6 خانات على الأقل/);

            // Exactly 128 chars: OK
            const exact128 = 'a'.repeat(128);
            expect(validateCustomerLogin({ phone: '0993443901', password: exact128 }).isValid).toBe(true);

            // 129 chars: Rejected
            const tooLong129 = 'a'.repeat(129);
            const longLogin = validateCustomerLogin({ phone: '0993443901', password: tooLong129 });
            expect(longLogin.isValid).toBe(false);
            expect(longLogin.errors.password).toMatch(/128 خانة/);

            // Excessive input (e.g. 5,000 chars DoS attempt): Rejected
            const excessive = 'a'.repeat(5000);
            expect(validateCustomerLogin({ phone: '0993443901', password: excessive }).isValid).toBe(false);
        });
    });

    describe('Customer Payload Validation (Task 4.6)', () => {
        it('returns field-addressable errors for registration with invalid/missing fields', () => {
            const result = validateCustomerRegistration({
                shopName: 'a', // too short
                ownerName: '', // empty
                phone: '12345', // invalid phone
                city: 'd', // too short
                address: 'st', // too short
                password: '123', // too short
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.shopName).toBeDefined();
            expect(result.errors.ownerName).toBeDefined();
            expect(result.errors.phone).toBeDefined();
            expect(result.errors.city).toBeDefined();
            expect(result.errors.address).toBeDefined();
            expect(result.errors.password).toBeDefined();
        });

        it('ensures invalid non-string data never throws an unhandled exception or 500', () => {
            const maliciousPayloads = [
                null,
                undefined,
                12345,
                'a string instead of object',
                [],
                { shopName: 12345, ownerName: {}, city: [], address: true, password: null },
                { phone: { nested: 'object' }, password: ['array'] },
            ];

            for (const payload of maliciousPayloads) {
                expect(() => validateCustomerLogin(payload)).not.toThrow();
                expect(() => validateCustomerRegistration(payload)).not.toThrow();
                expect(() => validateCustomerProfileUpdate(payload)).not.toThrow();

                const regResult = validateCustomerRegistration(payload);
                expect(regResult.isValid).toBe(false);
                expect(Object.keys(regResult.errors).length).toBeGreaterThan(0);
            }
        });

        it('validates profile updates and rejects non-string properties cleanly', () => {
            const typeErrorPayload = {
                shopName: 99999, // not a string - would cause .trim() TypeError
                ownerName: ['invalid'],
            };

            const result = validateCustomerProfileUpdate(typeErrorPayload);
            expect(result.isValid).toBe(false);
            expect(result.errors.shopName).toMatch(/نصاً صالحاً/);
            expect(result.errors.ownerName).toMatch(/نصاً صالحاً/);
        });

        it('accepts valid partial profile updates and bounds string lengths', () => {
            const validUpdate = {
                shopName: 'مؤسسة السلام للمواد الغذائية',
                notes: 'يرجى الاتصال قبل التسليم بنصف ساعة',
            };

            const result = validateCustomerProfileUpdate(validUpdate);
            expect(result.isValid).toBe(true);
            expect(result.cleanData?.shopName).toBe('مؤسسة السلام للمواد الغذائية');
            expect(result.cleanData?.notes).toBe('يرجى الاتصال قبل التسليم بنصف ساعة');
            expect(result.cleanData?.city).toBeUndefined(); // partial update preserved
        });

        it('normalizes various Syrian phone formats correctly', () => {
            const phoneCases = [
                { input: '0993443901', expected: '0993443901' },
                { input: '+963993443901', expected: '0993443901' },
                { input: '00963993443901', expected: '0993443901' },
                { input: '963993443901', expected: '0993443901' },
                { input: '993443901', expected: '0993443901' },
                { input: '٠٩٩٣٤٤٣٩٠١', expected: '0993443901' }, // Arabic-Indic numerals
            ];

            for (const { input, expected } of phoneCases) {
                const res = validateCustomerLogin({ phone: input, password: 'password123' });
                expect(res.isValid).toBe(true);
                expect(res.cleanData?.phone).toBe(expected);
            }
        });
    });
});
