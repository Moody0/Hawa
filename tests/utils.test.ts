import { describe, it, expect } from 'vitest';
import {
    convertArabicToEnglishDigits,
    normalizeSyrianPhone,
    isValidSyrianPhone,
    findGovernorate,
    isValidGovernorate,
    sanitizeString,
} from '@/lib/order-validation';

describe('Utility tests: lib/order-validation', () => {
    it('converts Eastern Arabic numerals to standard ASCII digits', () => {
        expect(convertArabicToEnglishDigits('٠٩٩٣٤٤٣٩٠١')).toBe('0993443901');
        expect(convertArabicToEnglishDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890');
        expect(convertArabicToEnglishDigits('')).toBe('');
    });

    it('normalizes various Syrian phone number inputs to canonical 10-digit format', () => {
        expect(normalizeSyrianPhone('+963993443901')).toBe('0993443901');
        expect(normalizeSyrianPhone('00963 993 443 901')).toBe('0993443901');
        expect(normalizeSyrianPhone('993443901')).toBe('0993443901');
        expect(normalizeSyrianPhone('٠٩٩٣٤٤٣٩٠١')).toBe('0993443901');
        expect(normalizeSyrianPhone('0993443901')).toBe('0993443901');
    });

    it('accurately validates 10-digit Syrian mobile phone numbers', () => {
        expect(isValidSyrianPhone('0993443901')).toBe(true);
        expect(isValidSyrianPhone('+963944123456')).toBe(true);
        expect(isValidSyrianPhone('011234567')).toBe(false); // Landline
        expect(isValidSyrianPhone('12345')).toBe(false);
        expect(isValidSyrianPhone('')).toBe(false);
    });

    it('validates Syrian governorates by key, Arabic, and English names', () => {
        expect(isValidGovernorate('Damascus')).toBe(true);
        expect(isValidGovernorate('دمشق')).toBe(true);
        expect(isValidGovernorate('damascus')).toBe(true);
        expect(isValidGovernorate('حلب')).toBe(true);
        expect(isValidGovernorate('Aleppo')).toBe(true);
        expect(isValidGovernorate('New York')).toBe(false);
        expect(isValidGovernorate('')).toBe(false);

        const gov = findGovernorate('حمص');
        expect(gov).toBeDefined();
        expect(gov?.en).toBe('Homs');
    });

    it('sanitizes strings against HTML markup and control characters', () => {
        expect(sanitizeString('<p>Store Name</p>')).toBe('Store Name');
        expect(sanitizeString('<b>Bold Shop</b>')).toBe('Bold Shop');
        expect(sanitizeString(null)).toBe('');
        expect(sanitizeString('   Clean Text   ')).toBe('Clean Text');
    });
});
