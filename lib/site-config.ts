/**
 * Centralized Site, Contact, Domain, and Locale Configuration
 * Eliminates divergent origins, placeholder numbers, and inconsistent canonical/hreflang URLs.
 */

// 1. Canonical Origin
const rawSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://hawatrading.com";

export const SITE_ORIGIN = rawSiteUrl.replace(/\/+$/, "");

// 2. Verified Contact Information
export const CONTACT_CONFIG = {
    // Primary sales & wholesale orders WhatsApp
    salesWhatsApp: "+963993443901",
    salesWhatsAppClean: "963993443901",
    whatsappSalesFormatted: "+963993443901",
    
    // Management & partnership line
    managementPhone: "+963994166000",
    managementPhoneClean: "963994166000",

    // Primary sales phone
    salesPhone: "+963993443901",
    salesPhoneClean: "963993443901",

    // Official support email
    email: "info@hawatrading.com",

    // Physical location
    addressAr: "ريف دمشق - جرمانا / دمشق - الجمهورية العربية السورية",
    addressEn: "Damascus / Rural Damascus - Jaramana, Syrian Arab Republic",

    // Official social profiles
    social: {
        facebook: "https://www.facebook.com/hawatrading",
        instagram: "https://www.instagram.com/hawatrading",
        telegram: "https://t.me/hawatrading",
    },
} as const;

/**
 * Returns a clean digits-only phone number suitable for wa.me links
 */
export function cleanDigitsPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, "");
}

/**
 * Generates an official WhatsApp link for sales, quotes, or general inquiry.
 */
export function getWhatsAppChatUrl(phone?: string | null, message?: string): string {
    const rawNumber = phone || CONTACT_CONFIG.salesWhatsApp;
    const cleanNumber = cleanDigitsPhone(rawNumber) || CONTACT_CONFIG.salesWhatsAppClean;
    const baseUrl = `https://wa.me/${cleanNumber}`;

    if (!message) {
        return baseUrl;
    }

    return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Normalizes a pathname to ensure single leading slash and no trailing slash (unless root).
 */
export function normalizePathname(pathname: string): string {
    if (!pathname || pathname === "/") return "";
    const clean = pathname.replace(/\/+/g, "/").replace(/\/+$/, "");
    return clean.startsWith("/") ? clean : `/${clean}`;
}

/**
 * Generates canonical absolute URL for a given path and locale.
 * Per middleware configuration:
 * - Arabic (default) is served at canonical root: '/'
 * - English is served under '/en'
 */
export function getCanonicalUrl(pathname: string = "", locale: string = "ar"): string {
    const cleanPath = normalizePathname(pathname);
    if (locale === "en") {
        return `${SITE_ORIGIN}/en${cleanPath}`;
    }
    return `${SITE_ORIGIN}${cleanPath || "/"}`;
}

/**
 * Generates alternate hreflang URLs (ar, en, and x-default).
 */
export function getAlternateLocaleUrls(pathname: string = ""): {
    canonical: string;
    languages: {
        ar: string;
        en: string;
        "x-default": string;
    };
} {
    const cleanPath = normalizePathname(pathname);
    const arUrl = `${SITE_ORIGIN}${cleanPath || "/"}`;
    const enUrl = `${SITE_ORIGIN}/en${cleanPath}`;

    return {
        canonical: arUrl,
        languages: {
            ar: arUrl,
            en: enUrl,
            "x-default": arUrl,
        },
    };
}

/**
 * Validates critical site configuration at startup/build time.
 */
export function validateSiteConfig(): void {
    try {
        new URL(SITE_ORIGIN);
    } catch {
        throw new Error(`Invalid SITE_ORIGIN configured: "${SITE_ORIGIN}". Must be a valid absolute URL.`);
    }

    if (!/^\d{10,15}$/.test(CONTACT_CONFIG.salesWhatsAppClean)) {
        throw new Error(`Invalid salesWhatsAppClean: "${CONTACT_CONFIG.salesWhatsAppClean}". Must be valid E.164 digits.`);
    }
}

// Run validation during module load
validateSiteConfig();
