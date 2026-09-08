/**
 * Canonical Catalog URL Contract
 *
 * Provides deterministic parsing, normalization, and URL building
 * for products and catalog views.
 *
 * Ensures:
 * 1. Documented parameters (search, brand, category, sort, page, inStock, onSale, isTrending, view).
 * 2. Normalization: casing, whitespace, array deduplication/sorting, invalid value fallback.
 * 3. Deterministic query string output with sorted keys so identical filter states yield identical URLs.
 */

export const ALLOWED_SORTS = [
    "best_sellers",
    "price_asc",
    "price_desc",
    "newest",
] as const;

export type CatalogSort = (typeof ALLOWED_SORTS)[number];

export interface CatalogUrlParams {
    search?: string;
    brand?: string; // single slug or comma-separated slugs/ids
    category?: string; // single slug or comma-separated slugs/ids
    brandIds?: string[];
    categoryIds?: string[];
    sort?: CatalogSort;
    page?: number;
    inStock?: boolean;
    onSale?: boolean;
    isTrending?: boolean;
    view?: "grid" | "list";
}

export interface ParsedCatalogParams {
    search: string;
    brands: string[];
    categories: string[];
    sort: CatalogSort;
    page: number;
    inStock: boolean;
    onSale: boolean;
    isTrending: boolean;
    view: "grid" | "list";
}

const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE = 1000;
const MAX_FILTER_ITEMS = 20;

/**
 * Normalizes and cleans a search query string:
 * - Trims leading/trailing whitespace
 * - Collapses multiple spaces
 * - Caps length at MAX_SEARCH_LENGTH
 * - Strips control characters
 */
export function normalizeSearchQuery(rawQuery: unknown): string {
    if (typeof rawQuery !== "string") return "";
    const clean = rawQuery
        .replace(/[\u0000-\u001F\u007F]/g, "") // remove control chars
        .replace(/\s+/g, " ") // collapse whitespace
        .trim();
    return clean.slice(0, MAX_SEARCH_LENGTH);
}

/**
 * Normalizes an array of string identifiers/slugs:
 * - Accepts string, string[], or undefined
 * - Trims each item
 * - Deduplicates
 * - Filters out empty strings
 * - Deterministically sorts items
 * - Limits to MAX_FILTER_ITEMS
 */
export function normalizeFilterTokens(raw: unknown): string[] {
    if (!raw) return [];

    let tokens: string[] = [];
    if (Array.isArray(raw)) {
        for (const item of raw) {
            if (typeof item === "string") {
                tokens.push(...item.split(","));
            }
        }
    } else if (typeof raw === "string") {
        tokens = raw.split(",");
    }

    const uniqueTokens = Array.from(
        new Set(
            tokens
                .map((t) => t.trim())
                .filter((t) => t.length > 0 && t.length <= 100)
        )
    );

    uniqueTokens.sort((a, b) => a.localeCompare(b));
    return uniqueTokens.slice(0, MAX_FILTER_ITEMS);
}

/**
 * Normalizes sort parameter to allowed values.
 */
export function normalizeCatalogSort(rawSort: unknown): CatalogSort {
    if (typeof rawSort === "string" && (ALLOWED_SORTS as readonly string[]).includes(rawSort)) {
        return rawSort as CatalogSort;
    }
    return "best_sellers";
}

/**
 * Normalizes page number (bounded between 1 and MAX_PAGE).
 */
export function normalizeCatalogPage(rawPage: unknown): number {
    if (typeof rawPage === "number" && !Number.isNaN(rawPage)) {
        return Math.max(1, Math.min(Math.floor(rawPage), MAX_PAGE));
    }
    if (typeof rawPage === "string") {
        const parsed = parseInt(rawPage.trim(), 10);
        if (!Number.isNaN(parsed)) {
            return Math.max(1, Math.min(parsed, MAX_PAGE));
        }
    }
    return 1;
}

/**
 * Normalizes boolean query flags ('true' -> true).
 */
export function normalizeCatalogBoolean(raw: unknown): boolean {
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
        const lower = raw.trim().toLowerCase();
        return lower === "true" || lower === "1";
    }
    return false;
}

/**
 * Parse raw URLSearchParams or Next.js searchParams into normalized catalog parameters.
 */
export function parseCatalogUrlParams(
    searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): ParsedCatalogParams {
    const getParam = (key: string): string | string[] | undefined => {
        if (searchParams instanceof URLSearchParams) {
            const all = searchParams.getAll(key);
            if (all.length === 0) return undefined;
            if (all.length === 1) return all[0];
            return all;
        }
        return searchParams[key];
    };

    const rawSearch = getParam("search") ?? getParam("q");
    const rawBrand = getParam("brand") ?? getParam("brandIds");
    const rawCategory = getParam("category") ?? getParam("categoryIds");
    const rawSort = getParam("sort");
    const rawPage = getParam("page");
    const rawInStock = getParam("inStock");
    const rawOnSale = getParam("onSale");
    const rawIsTrending = getParam("isTrending");
    const rawView = getParam("view");

    const search = normalizeSearchQuery(rawSearch);
    const brands = normalizeFilterTokens(rawBrand);
    const categories = normalizeFilterTokens(rawCategory);
    const sort = normalizeCatalogSort(rawSort);
    const page = normalizeCatalogPage(rawPage);
    const inStock = normalizeCatalogBoolean(rawInStock);
    const onSale = normalizeCatalogBoolean(rawOnSale);
    const isTrending = normalizeCatalogBoolean(rawIsTrending);
    const view = rawView === "list" ? "list" : "grid";

    return {
        search,
        brands,
        categories,
        sort,
        page,
        inStock,
        onSale,
        isTrending,
        view,
    };
}

/**
 * Builds a canonical catalog URL with sorted query parameters.
 * Omits default/empty values to keep URLs clean and deduplicated.
 */
export function buildCatalogUrl(
    params: Partial<ParsedCatalogParams>,
    basePath = "/products"
): string {
    const query = new URLSearchParams();

    // Deterministic parameter insertion in alphabetical order
    if (params.brands && params.brands.length > 0) {
        const sortedBrands = [...params.brands].sort((a, b) => a.localeCompare(b));
        query.set("brand", sortedBrands.join(","));
    }

    if (params.categories && params.categories.length > 0) {
        const sortedCategories = [...params.categories].sort((a, b) => a.localeCompare(b));
        query.set("category", sortedCategories.join(","));
    }

    if (params.inStock) {
        query.set("inStock", "true");
    }

    if (params.isTrending) {
        query.set("isTrending", "true");
    }

    if (params.onSale) {
        query.set("onSale", "true");
    }

    if (params.page && params.page > 1) {
        query.set("page", params.page.toString());
    }

    if (params.search && params.search.trim()) {
        query.set("search", params.search.trim());
    }

    if (params.sort && params.sort !== "best_sellers" && (ALLOWED_SORTS as readonly string[]).includes(params.sort)) {
        query.set("sort", params.sort);
    }

    if (params.view && params.view === "list") {
        query.set("view", "list");
    }

    const queryString = query.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
}
