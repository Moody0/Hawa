import { cache } from 'react';
import { laravelJson } from './laravel-server';
export function convertArabicToEnglishDigits(str: string): string {
    if (!str) return '';
    return str
        .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
        .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06F0));
}
export function normalizeSyrianPhone(rawPhone: string): string {
    if (!rawPhone) return '';
    // 1. Convert Arabic numerals to standard Latin digits first
    const englishDigits = convertArabicToEnglishDigits(rawPhone);
    // 2. Strip everything except digits
    let digits = englishDigits.replace(/[^0-9]/g, '');

    // Handle international prefixes
    if (digits.startsWith('00963')) {
        digits = '0' + digits.slice(5);
    } else if (digits.startsWith('963')) {
        digits = '0' + digits.slice(3);
    }

    // Handle 9-digit format without leading 0 (e.g. 993443901 -> 0993443901)
    if (digits.length === 9 && digits.startsWith('9')) {
        digits = '0' + digits;
    }

    return digits;
}
export function isValidSyrianPhone(phone: string): boolean {
    const normalized = normalizeSyrianPhone(phone);
    return /^09[0-9]{8}$/.test(normalized);
}
export const getAuthenticatedCustomer=cache(async():Promise<any|null>=>{const result=await laravelJson<{customer:any}>('/api/customer/auth/me',{customer:null});return result.customer;});
