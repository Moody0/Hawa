import { Prisma } from "@prisma/client";

/**
 * Normalizes Arabic and Latin text for search comparison:
 * - Strips Arabic diacritics / tashkeel
 * - Strips tatweel (ـ)
 * - Normalizes alef forms (أ, إ, آ -> ا)
 * - Normalizes taa marbuta / haa (ة -> ه)
 * - Normalizes alef maqsura / yaa (ى -> ي)
 * - Trims and lowercases English text
 * - Collapses extra whitespace
 */
export function normalizeSearchText(input: string): string {
    if (!input) return "";
    return input
        // Remove Arabic diacritics
        .replace(/[\u064B-\u065F\u0670]/g, "")
        // Remove Arabic tatweel
        .replace(/\u0640/g, "")
        // Normalize alef variants
        .replace(/[إأآا]/g, "ا")
        // Normalize taa marbuta
        .replace(/ة/g, "ه")
        // Normalize alef maqsura / yaa
        .replace(/[ىي]/g, "ي")
        // Lowercase latin
        .toLowerCase()
        // Collapse spaces
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Minimum characters required for debounced catalog search.
 * Searches under this length are skipped to prevent expensive full-table scans.
 */
export const MIN_SEARCH_QUERY_LENGTH = 2;

/**
 * Returns distinct search term variations to match both normalized and original spellings.
 * For example: "أحمد" will produce ["أحمد", "احمد"], "قهوة" will produce ["قهوة", "قهوه"].
 */
export function getSearchVariants(rawQuery: string): string[] {
    const trimmed = rawQuery.trim();
    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) return [];

    const normalized = normalizeSearchText(trimmed);
    const variants = new Set<string>();

    variants.add(trimmed);
    if (normalized) {
        variants.add(normalized);
    }

    // Generate specific Arabic alternates if applicable
    if (trimmed.includes("أ") || trimmed.includes("إ") || trimmed.includes("آ") || trimmed.includes("ا")) {
        variants.add(trimmed.replace(/[إأآا]/g, "ا"));
    }
    if (trimmed.includes("ة") || trimmed.includes("ه")) {
        variants.add(trimmed.replace(/ة/g, "ه"));
        variants.add(trimmed.replace(/ه/g, "ة"));
    }
    if (trimmed.includes("ى") || trimmed.includes("ي")) {
        variants.add(trimmed.replace(/[ىي]/g, "ي"));
        variants.add(trimmed.replace(/[ىي]/g, "ى"));
    }

    return Array.from(variants).filter(v => v.length >= MIN_SEARCH_QUERY_LENGTH);
}

/**
 * Builds Prisma OR conditions for search querying products, brands, categories, and SKU.
 * Optimized for pg_trgm indexed fields.
 */
export function buildSearchWhereConditions(rawQuery: string): Prisma.ProductWhereInput[] {
    const variants = getSearchVariants(rawQuery);
    if (variants.length === 0) return [];

    const conditions: Prisma.ProductWhereInput[] = [];

    for (const term of variants) {
        conditions.push(
            { name: { contains: term, mode: "insensitive" } },
            { nameAr: { contains: term, mode: "insensitive" } },
            { nameEn: { contains: term, mode: "insensitive" } },
            { sku: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { descriptionAr: { contains: term, mode: "insensitive" } },
            { descriptionEn: { contains: term, mode: "insensitive" } },
            { brand: { name: { contains: term, mode: "insensitive" } } },
            { brand: { slug: { contains: term, mode: "insensitive" } } },
            { category: { name: { contains: term, mode: "insensitive" } } },
            { mainCategory: { name: { contains: term, mode: "insensitive" } } }
        );
    }

    return conditions;
}
