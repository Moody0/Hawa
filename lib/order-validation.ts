/**
 * Pure client-safe validation and normalization utilities for Hawa Distribution
 */

export function convertArabicToEnglishDigits(str: string): string {
    if (!str) return '';
    return str
        .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
        .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06F0));
}

/**
 * Normalizes Syrian mobile phone numbers to the canonical 10-digit format: 09xxxxxxxx
 * Handles variations: +963993..., 00963993..., 963993..., 993..., 0993... and Eastern Arabic numerals
 */
export function normalizeSyrianPhone(rawPhone: string): string {
    if (!rawPhone) return '';
    const converted = convertArabicToEnglishDigits(String(rawPhone).trim());
    // Strip everything except digits
    let digits = converted.replace(/[^0-9]/g, '');

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

/**
 * Validates whether a phone number is a valid 10-digit Syrian mobile number (09xxxxxxxx)
 */
export function isValidSyrianPhone(phone: string): boolean {
    const normalized = normalizeSyrianPhone(phone);
    return /^09[0-9]{8}$/.test(normalized);
}

/**
 * Sanitizes input string to prevent XSS and strip unwanted markup/control characters
 */
export function sanitizeString(val: unknown, maxLen = 200): string {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
        .trim()
        .slice(0, maxLen);
}

export interface SyrianGovernorate {
    key: string;
    ar: string;
    en: string;
}

export const SYRIAN_GOVERNORATES: readonly SyrianGovernorate[] = [
    { key: 'Damascus', ar: 'دمشق', en: 'Damascus' },
    { key: 'Rif Dimashq', ar: 'ريف دمشق', en: 'Rif Dimashq' },
    { key: 'Homs', ar: 'حمص', en: 'Homs' },
    { key: 'Hama', ar: 'حماة', en: 'Hama' },
    { key: 'Aleppo', ar: 'حلب', en: 'Aleppo' },
    { key: 'Latakia', ar: 'اللاذقية', en: 'Latakia' },
    { key: 'Tartus', ar: 'طرطوس', en: 'Tartus' },
    { key: 'Daraa', ar: 'درعا', en: 'Daraa' },
    { key: 'As-Suwayda', ar: 'السويداء', en: 'As-Suwayda' },
    { key: 'Quneitra', ar: 'القنيطرة', en: 'Quneitra' },
    { key: 'Deir ez-Zor', ar: 'دير الزور', en: 'Deir ez-Zor' },
    { key: 'Al-Hasakah', ar: 'الحسكة', en: 'Al-Hasakah' },
    { key: 'Raqqa', ar: 'الرقة', en: 'Raqqa' },
    { key: 'Idlib', ar: 'إدلب', en: 'Idlib' },
] as const;

/**
 * Finds matching Syrian governorate from key, Arabic name, or English name
 */
export function findGovernorate(city: string | null | undefined): SyrianGovernorate | undefined {
    if (!city || typeof city !== 'string') return undefined;
    const clean = city.trim().toLowerCase();
    return SYRIAN_GOVERNORATES.find(
        g => g.key.toLowerCase() === clean ||
             g.ar.toLowerCase() === clean ||
             g.en.toLowerCase() === clean
    );
}

/**
 * Checks whether a given city/governorate is valid
 */
export function isValidGovernorate(city: string | null | undefined): boolean {
    return Boolean(findGovernorate(city));
}

/**
 * Returns the normalized governorate string in either Arabic or English
 */
export function normalizeGovernorate(city: string | null | undefined, lang: 'ar' | 'en' = 'ar'): string {
    const match = findGovernorate(city);
    if (!match) return sanitizeString(city || '', 50);
    return lang === 'en' ? match.en : match.ar;
}

export interface OrderFormFields {
    shopName: string;
    ownerName: string;
    phone: string;
    city: string;
    streetAddress: string;
    notes?: string;
}

export interface OrderValidationErrors {
    shopName?: string;
    ownerName?: string;
    phone?: string;
    city?: string;
    streetAddress?: string;
    notes?: string;
}

/**
 * Complete validator for the Place Order shipping form on both Client and Server
 */
export function validateOrderForm(
    formData: OrderFormFields,
    lang: 'ar' | 'en' = 'ar'
): { isValid: boolean; errors: OrderValidationErrors; cleanData: OrderFormFields } {
    const isAr = lang === 'ar';
    const errors: OrderValidationErrors = {};

    const cleanShop = sanitizeString(formData.shopName || '', 100);
    const cleanOwner = sanitizeString(formData.ownerName || '', 100);
    const cleanPhone = normalizeSyrianPhone(formData.phone || '');
    const cleanCity = sanitizeString(formData.city || '', 50);
    const cleanAddress = sanitizeString(formData.streetAddress || '', 250);
    const cleanNotes = formData.notes ? sanitizeString(formData.notes, 500) : '';

    // Shop Name
    if (!cleanShop) {
        errors.shopName = isAr
            ? 'يرجى إدخال اسم المحل التجاري'
            : 'Please enter store/shop name';
    } else if (cleanShop.length < 2) {
        errors.shopName = isAr
            ? 'اسم المحل يجب أن يتكون من حرفين على الأقل'
            : 'Store name must be at least 2 characters';
    }

    // Owner Name
    if (!cleanOwner) {
        errors.ownerName = isAr
            ? 'يرجى إدخال اسم صاحب الطلب / التاجر'
            : 'Please enter contact / owner name';
    } else if (cleanOwner.length < 2) {
        errors.ownerName = isAr
            ? 'اسم صاحب الطلب يجب أن يتكون من حرفين على الأقل'
            : 'Contact name must be at least 2 characters';
    }

    // Phone
    if (!cleanPhone) {
        errors.phone = isAr
            ? 'يرجى إدخال رقم هاتف محمول سوري (09xxxxxxxx)'
            : 'Please enter a Syrian mobile phone number (09xxxxxxxx)';
    } else if (!isValidSyrianPhone(cleanPhone)) {
        errors.phone = isAr
            ? 'رقم الهاتف غير صالح: يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'
            : 'Invalid phone: must start with 09 and contain 10 digits';
    }

    // City
    if (!cleanCity) {
        errors.city = isAr
            ? 'يرجى اختيار المحافظة / المنطقة'
            : 'Please select city / governorate';
    } else if (!isValidGovernorate(cleanCity)) {
        errors.city = isAr
            ? 'يرجى اختيار محافظة سورية صالحة من القائمة'
            : 'Please select a valid Syrian governorate';
    }

    // Street Address
    if (!cleanAddress) {
        errors.streetAddress = isAr
            ? 'يرجى إدخال العنوان بالتفصيل'
            : 'Please enter detailed street address';
    } else if (cleanAddress.length < 4) {
        errors.streetAddress = isAr
            ? 'يرجى كتابة العنوان بالتفصيل (4 أحرف على الأقل)'
            : 'Address must be at least 4 characters';
    }

    // Notes
    if (cleanNotes && cleanNotes.length > 500) {
        errors.notes = isAr
            ? 'الملاحظات يجب ألا تتجاوز 500 حرف'
            : 'Notes cannot exceed 500 characters';
    }

    const isValid = Object.keys(errors).length === 0;

    return {
        isValid,
        errors,
        cleanData: {
            shopName: cleanShop,
            ownerName: cleanOwner,
            phone: cleanPhone,
            city: normalizeGovernorate(cleanCity, 'ar'),
            streetAddress: cleanAddress,
            notes: cleanNotes,
        },
    };
}
