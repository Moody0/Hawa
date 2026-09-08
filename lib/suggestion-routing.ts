/**
 * Suggestion routing destinations helper
 *
 * Ensures consistent canonical URLs for search suggestions across
 * header desktop search, mobile search modal, and catalog autocomplete.
 */

/**
 * Returns canonical destination for category suggestions.
 * Directs to the canonical category route /categories/[slug].
 */
export function getCategorySuggestionUrl(slug: string): string {
    const cleanSlug = slug.trim().toLowerCase();
    return `/categories/${encodeURIComponent(cleanSlug)}`;
}

/**
 * Returns canonical destination for brand suggestions.
 * Directs to the canonical brand filter on catalog /products?brand=[slug].
 */
export function getBrandSuggestionUrl(slug: string): string {
    const cleanSlug = slug.trim().toLowerCase();
    return `/products?brand=${encodeURIComponent(cleanSlug)}`;
}

/**
 * Returns canonical destination for product suggestions.
 * Directs to product detail page /products/[slug].
 */
export function getProductSuggestionUrl(slug: string): string {
    const cleanSlug = slug.trim();
    return `/products/${encodeURIComponent(cleanSlug)}`;
}

/**
 * Returns canonical destination for general search query submissions.
 * Directs to /products?search=[query].
 */
export function getSearchSubmitUrl(query: string): string {
    const cleanQuery = query.trim();
    return `/products?search=${encodeURIComponent(cleanQuery)}`;
}
