import { normalizeSyrianPhone, isValidSyrianPhone } from './order-validation';

export const SYRIAN_CITIES = [
    'حمص',
    'دمشق',
    'ريف دمشق',
    'حلب',
    'حماة',
    'اللاذقية',
    'طرطوس',
    'درعا',
    'السويداء',
    'القنيطرة',
    'دير الزور',
    'الرقة',
    'الحسكة',
    'إدلب',
] as const;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export interface ValidationResult<T> {
    isValid: boolean;
    errors: Record<string, string>;
    cleanData?: T;
}

export interface CustomerLoginPayload {
    phone: string;
    password: string;
}

export interface CustomerRegisterPayload {
    shopName: string;
    ownerName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
    password: string;
}

export interface CustomerProfileUpdatePayload {
    shopName?: string;
    ownerName?: string;
    city?: string;
    address?: string;
    notes?: string | null;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Validates login payload.
 * Password is NEVER trimmed to preserve original credentials with spaces/Unicode.
 */
export function validateCustomerLogin(body: unknown): ValidationResult<CustomerLoginPayload> {
    const errors: Record<string, string> = {};

    if (!isPlainObject(body)) {
        return {
            isValid: false,
            errors: { _general: 'بيانات الطلب غير صالحة' },
        };
    }

    // Phone validation
    if (typeof body.phone !== 'string' && typeof body.phone !== 'number') {
        errors.phone = 'يرجى إدخال رقم الهاتف بشكل صحيح.';
    } else {
        const rawPhone = String(body.phone);
        if (rawPhone.length > 50) {
            errors.phone = 'رقم الهاتف المدخل طويل جداً.';
        } else {
            const cleanPhone = normalizeSyrianPhone(rawPhone);
            if (!isValidSyrianPhone(cleanPhone)) {
                errors.phone = 'يرجى إدخال رقم هاتف محمول سوري صالح مكون من 10 أرقام (09xxxxxxxx).';
            }
        }
    }

    // Password validation - NEVER TRIM
    if (typeof body.password !== 'string') {
        errors.password = 'يرجى إدخال كلمة المرور.';
    } else {
        const passLen = body.password.length;
        if (passLen < PASSWORD_MIN_LENGTH) {
            errors.password = `كلمة المرور يجب أن تتكون من ${PASSWORD_MIN_LENGTH} خانات على الأقل.`;
        } else if (passLen > PASSWORD_MAX_LENGTH) {
            errors.password = `كلمة المرور يجب ألا تتجاوز ${PASSWORD_MAX_LENGTH} خانة.`;
        }
    }

    if (Object.keys(errors).length > 0) {
        return { isValid: false, errors };
    }

    return {
        isValid: true,
        errors: {},
        cleanData: {
            phone: normalizeSyrianPhone(String(body.phone)),
            password: body.password as string, // untouched original password
        },
    };
}

/**
 * Validates registration payload.
 * Bounds every field, validates types, and preserves password without trimming.
 */
export function validateCustomerRegistration(body: unknown): ValidationResult<CustomerRegisterPayload> {
    const errors: Record<string, string> = {};

    if (!isPlainObject(body)) {
        return {
            isValid: false,
            errors: { _general: 'بيانات الطلب غير صالحة' },
        };
    }

    // Shop name
    if (typeof body.shopName !== 'string') {
        errors.shopName = 'اسم المحل التجاري يجب أن يكون نصاً صالحاً.';
    } else {
        const trimmed = body.shopName.trim();
        if (trimmed.length < 2) {
            errors.shopName = 'يرجى إدخال اسم المحل التجاري (حرفين على الأقل).';
        } else if (trimmed.length > 100) {
            errors.shopName = 'اسم المحل التجاري يجب ألا يتجاوز 100 حرف.';
        }
    }

    // Owner name
    if (typeof body.ownerName !== 'string') {
        errors.ownerName = 'اسم صاحب المحل يجب أن يكون نصاً صالحاً.';
    } else {
        const trimmed = body.ownerName.trim();
        if (trimmed.length < 2) {
            errors.ownerName = 'يرجى إدخال اسم صاحب المحل / التاجر (حرفين على الأقل).';
        } else if (trimmed.length > 100) {
            errors.ownerName = 'اسم صاحب المحل يجب ألا يتجاوز 100 حرف.';
        }
    }

    // Phone
    if (typeof body.phone !== 'string' && typeof body.phone !== 'number') {
        errors.phone = 'يرجى إدخال رقم الهاتف بشكل صحيح.';
    } else {
        const rawPhone = String(body.phone);
        if (rawPhone.length > 50) {
            errors.phone = 'رقم الهاتف المدخل طويل جداً.';
        } else {
            const cleanPhone = normalizeSyrianPhone(rawPhone);
            if (!isValidSyrianPhone(cleanPhone)) {
                errors.phone = 'يرجى إدخال رقم هاتف محمول سوري صالح مكون من 10 أرقام (مثال: 0993443901).';
            }
        }
    }

    // City
    if (typeof body.city !== 'string') {
        errors.city = 'يرجى اختيار المحافظة / المدينة.';
    } else {
        const trimmed = body.city.trim();
        if (trimmed.length < 2 || trimmed.length > 50) {
            errors.city = 'يرجى اختيار محافظة / مدينة صالحة.';
        }
    }

    // Address
    if (typeof body.address !== 'string') {
        errors.address = 'يرجى إدخال تفاصيل العنوان.';
    } else {
        const trimmed = body.address.trim();
        if (trimmed.length < 4) {
            errors.address = 'يرجى إدخال تفاصيل العنوان (الحي / الشارع / نقطة علامة - 4 أحرف على الأقل).';
        } else if (trimmed.length > 300) {
            errors.address = 'العنوان يجب ألا يتجاوز 300 حرف.';
        }
    }

    // Notes (optional)
    if (body.notes !== undefined && body.notes !== null) {
        if (typeof body.notes !== 'string') {
            errors.notes = 'الملاحظات يجب أن تكون نصاً صالحاً.';
        } else if (body.notes.trim().length > 500) {
            errors.notes = 'الملاحظات يجب ألا تتجاوز 500 حرف.';
        }
    }

    // Password - NEVER TRIM
    if (typeof body.password !== 'string') {
        errors.password = 'يرجى إدخال كلمة المرور.';
    } else {
        const passLen = body.password.length;
        if (passLen < PASSWORD_MIN_LENGTH) {
            errors.password = `كلمة المرور يجب أن تتكون من ${PASSWORD_MIN_LENGTH} خانات على الأقل.`;
        } else if (passLen > PASSWORD_MAX_LENGTH) {
            errors.password = `كلمة المرور يجب ألا تتجاوز ${PASSWORD_MAX_LENGTH} خانة.`;
        }
    }

    if (Object.keys(errors).length > 0) {
        return { isValid: false, errors };
    }

    return {
        isValid: true,
        errors: {},
        cleanData: {
            shopName: (body.shopName as string).trim(),
            ownerName: (body.ownerName as string).trim(),
            phone: normalizeSyrianPhone(String(body.phone)),
            city: (body.city as string).trim(),
            address: (body.address as string).trim(),
            notes: body.notes ? (body.notes as string).trim() : undefined,
            password: body.password as string, // untouched original password
        },
    };
}

/**
 * Validates profile update payload.
 * Bounds every field and ensures non-string data does not cause 500 errors.
 */
export function validateCustomerProfileUpdate(body: unknown): ValidationResult<CustomerProfileUpdatePayload> {
    const errors: Record<string, string> = {};

    if (!isPlainObject(body)) {
        return {
            isValid: false,
            errors: { _general: 'بيانات التحديث غير صالحة' },
        };
    }

    const cleanData: CustomerProfileUpdatePayload = {};

    if (body.shopName !== undefined) {
        if (typeof body.shopName !== 'string') {
            errors.shopName = 'اسم المحل التجاري يجب أن يكون نصاً صالحاً.';
        } else {
            const trimmed = body.shopName.trim();
            if (trimmed.length < 2) {
                errors.shopName = 'يرجى إدخال اسم المحل التجاري (حرفين على الأقل).';
            } else if (trimmed.length > 100) {
                errors.shopName = 'اسم المحل التجاري يجب ألا يتجاوز 100 حرف.';
            } else {
                cleanData.shopName = trimmed;
            }
        }
    }

    if (body.ownerName !== undefined) {
        if (typeof body.ownerName !== 'string') {
            errors.ownerName = 'اسم صاحب المحل يجب أن يكون نصاً صالحاً.';
        } else {
            const trimmed = body.ownerName.trim();
            if (trimmed.length < 2) {
                errors.ownerName = 'يرجى إدخال اسم صاحب المحل / التاجر (حرفين على الأقل).';
            } else if (trimmed.length > 100) {
                errors.ownerName = 'اسم صاحب المحل يجب ألا يتجاوز 100 حرف.';
            } else {
                cleanData.ownerName = trimmed;
            }
        }
    }

    if (body.city !== undefined) {
        if (typeof body.city !== 'string') {
            errors.city = 'يرجى اختيار المحافظة / المدينة.';
        } else {
            const trimmed = body.city.trim();
            if (trimmed.length < 2 || trimmed.length > 50) {
                errors.city = 'يرجى اختيار محافظة / مدينة صالحة.';
            } else {
                cleanData.city = trimmed;
            }
        }
    }

    if (body.address !== undefined) {
        if (typeof body.address !== 'string') {
            errors.address = 'يرجى إدخال تفاصيل العنوان.';
        } else {
            const trimmed = body.address.trim();
            if (trimmed.length < 4) {
                errors.address = 'يرجى إدخال تفاصيل العنوان (4 أحرف على الأقل).';
            } else if (trimmed.length > 300) {
                errors.address = 'العنوان يجب ألا يتجاوز 300 حرف.';
            } else {
                cleanData.address = trimmed;
            }
        }
    }

    if (body.notes !== undefined) {
        if (body.notes === null || body.notes === '') {
            cleanData.notes = null;
        } else if (typeof body.notes !== 'string') {
            errors.notes = 'الملاحظات يجب أن تكون نصاً صالحاً.';
        } else {
            const trimmed = body.notes.trim();
            if (trimmed.length > 500) {
                errors.notes = 'الملاحظات يجب ألا تتجاوز 500 حرف.';
            } else {
                cleanData.notes = trimmed;
            }
        }
    }

    if (Object.keys(errors).length > 0) {
        return { isValid: false, errors };
    }

    return {
        isValid: true,
        errors: {},
        cleanData,
    };
}
