/**
 * Utility functions for formatting and localizing packaging units and items per package.
 */

export interface FormatPackagingOptions {
    short?: boolean;
}

export interface FormatPackageItemsOptions {
    mode?: 'cart' | 'badge' | 'full';
}

/**
 * Normalizes and translates packaging unit strings (e.g., 'طرد', 'Carton', etc.)
 * based on the active language.
 */
export function formatPackaging(
    packaging: string | null | undefined,
    language: string,
    options?: FormatPackagingOptions
): string {
    const isAr = language === 'ar';
    const raw = (packaging || '').trim();

    // Default packaging when empty or null
    if (!raw) {
        if (isAr) return 'طرد';
        return options?.short ? 'ctn' : 'Carton';
    }

    const lower = raw.toLowerCase();

    // Check for carton / parcel (طرد / كرتونة / كرتون / carton / ctn)
    if (
        raw === 'طرد' ||
        raw.includes('طرد') ||
        raw === 'كرتونة' ||
        raw === 'كرتون' ||
        lower === 'carton' ||
        lower === 'ctn'
    ) {
        if (isAr) {
            return raw === 'كرتونة' || raw === 'كرتون' ? raw : 'طرد';
        }
        return options?.short ? 'ctn' : 'Carton';
    }

    // Check for box / صندوق
    if (raw === 'صندوق' || lower === 'box') {
        if (isAr) return 'صندوق';
        return options?.short ? 'box' : 'Box';
    }

    // Check for bag / كيس / شوال
    if (raw === 'كيس' || raw === 'شوال' || lower === 'bag' || lower === 'sack') {
        if (isAr) return raw;
        return options?.short ? 'bag' : 'Bag';
    }

    // Check for piece / قطعة
    if (raw === 'قطعة' || lower === 'piece' || lower === 'pc') {
        if (isAr) return 'قطعة';
        return options?.short ? 'pc' : 'Piece';
    }

    // Check for dozen / درزن
    if (raw === 'درزن' || lower === 'dozen' || lower === 'dzn') {
        if (isAr) return 'درزن';
        return options?.short ? 'dzn' : 'Dozen';
    }

    // If already in English and viewing in English, respect short option if carton
    if (!isAr) {
        if (lower === 'cartons') return options?.short ? 'ctn' : 'Cartons';
        return raw;
    }

    return raw;
}

/**
 * Normalizes and translates itemsPerPackage specifications.
 * Handles pure numbers, factory specifications, and composite strings.
 * 
 * mode:
 * - 'cart': For badges in cart/drawer: returns e.g. "12 pcs" / "12 قطعة", or "Factory Specs" / "حسب مواصفات المصنع"
 * - 'badge': For product card: returns e.g. "12 pcs/ctn" / "12 قطعة/طرد", or "Factory Specs" / "حسب مواصفات المصنع"
 * - 'full': For product details sentence: returns e.g. "Standard factory packing" or "24"
 */
export function formatPackageItems(
    itemsPerPackage: string | number | null | undefined,
    language: string,
    options?: FormatPackageItemsOptions
): string {
    if (!itemsPerPackage) return '';
    const isAr = language === 'ar';
    const str = String(itemsPerPackage).trim();
    if (!str) return '';

    const mode = options?.mode || 'badge';

    // Pure number (e.g. 12, 24)
    if (/^\d+$/.test(str)) {
        if (mode === 'cart') {
            return `${str} ${isAr ? 'قطعة' : 'pcs'}`;
        }
        if (mode === 'badge') {
            return `${str} ${isAr ? 'قطعة/طرد' : 'pcs/ctn'}`;
        }
        return str;
    }

    // Factory specifications (حسب مواصفات المصنع)
    if (str.includes('مواصفات المصنع')) {
        if (isAr) return 'حسب مواصفات المصنع';
        if (mode === 'cart' || mode === 'badge') {
            return 'Factory Specs';
        }
        return 'Standard factory packing';
    }

    // Number + unit already (e.g. "12 قطعة" or "24 pcs")
    const matchNumber = str.match(/^(\d+)\s*(قطعة|قطعه|عبوة|عبوه|pcs|pieces?)/i);
    if (matchNumber) {
        const num = matchNumber[1];
        if (mode === 'cart') {
            return `${num} ${isAr ? 'قطعة' : 'pcs'}`;
        }
        if (mode === 'badge') {
            return `${num} ${isAr ? 'قطعة/طرد' : 'pcs/ctn'}`;
        }
        return num;
    }

    // On demand (حسب الطلب)
    if (str.includes('حسب الطلب')) {
        return isAr ? 'حسب الطلب' : 'On demand';
    }

    return str;
}
