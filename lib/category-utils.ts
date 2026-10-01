const CATEGORY_SLUG_FALLBACK = 'category';
function randomSuffix() {
    return Math.random().toString(36).substring(2, 7);
}
export function createCategorySlugBase(name: string) {
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || CATEGORY_SLUG_FALLBACK;
}
