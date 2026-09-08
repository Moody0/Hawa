import assert from "node:assert/strict";

/**
 * Validates catalog query inputs according to API contract rules.
 * Extracted pure validator function to test boundary conditions without requiring a live DB.
 */
export function validateCatalogQueryParams(searchParams: URLSearchParams): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
    data: {
        page: number;
        limit: number;
        search: string;
        categoryIds: string[];
        brandIds: string[];
        sort?: string;
    };
} {
    const errors: Array<{ field: string; message: string }> = [];

    // 1. Page
    let page = 1;
    const rawPage = searchParams.get("page");
    if (rawPage !== null) {
        const parsed = Number(rawPage);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
            errors.push({
                field: "page",
                message: "Page must be an integer between 1 and 1000",
            });
        } else {
            page = parsed;
        }
    }

    // 2. Limit
    let limit = 12;
    const rawLimit = searchParams.get("limit");
    if (rawLimit !== null) {
        const parsed = Number(rawLimit);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
            errors.push({
                field: "limit",
                message: "Limit must be an integer between 1 and 50",
            });
        } else {
            limit = parsed;
        }
    }

    // 3. Search
    const rawSearch = searchParams.get("search");
    let search = "";
    if (rawSearch !== null) {
        if (rawSearch.length > 100) {
            errors.push({
                field: "search",
                message: "Search query must not exceed 100 characters",
            });
        } else {
            search = rawSearch.trim();
        }
    }

    // 4. Category IDs
    const categoryIdsParam = searchParams.get("categoryIds");
    let categoryIds: string[] = [];
    if (categoryIdsParam) {
        const split = categoryIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
        if (split.length > 50) {
            errors.push({
                field: "categoryIds",
                message: "Category IDs list must not exceed 50 items",
            });
        } else {
            categoryIds = Array.from(new Set(split)).sort();
        }
    }

    // 5. Brand IDs
    const brandIdsParam = searchParams.get("brandIds");
    let brandIds: string[] = [];
    if (brandIdsParam) {
        const split = brandIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
        if (split.length > 50) {
            errors.push({
                field: "brandIds",
                message: "Brand IDs list must not exceed 50 items",
            });
        } else {
            brandIds = Array.from(new Set(split)).sort();
        }
    }

    // 6. Sort
    const sort = searchParams.get("sort");
    if (sort && !["best_sellers", "price_asc", "price_desc", "newest"].includes(sort)) {
        errors.push({
            field: "sort",
            message: "Sort must be one of: best_sellers, price_asc, price_desc, newest",
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        data: {
            page,
            limit,
            search,
            categoryIds,
            brandIds,
            sort: sort || undefined,
        },
    };
}

console.log("Running catalog query input boundary tests...");

// 1. Negative, zero, NaN, and excessive pages
const r1 = validateCatalogQueryParams(new URLSearchParams({ page: "-1" }));
assert.equal(r1.isValid, false);
assert.equal(r1.errors[0].field, "page");

const r2 = validateCatalogQueryParams(new URLSearchParams({ page: "0" }));
assert.equal(r2.isValid, false);

const r3 = validateCatalogQueryParams(new URLSearchParams({ page: "abc" }));
assert.equal(r3.isValid, false);

const r4 = validateCatalogQueryParams(new URLSearchParams({ page: "9999" }));
assert.equal(r4.isValid, false);

const r5 = validateCatalogQueryParams(new URLSearchParams({ page: "1.5" }));
assert.equal(r5.isValid, false);

// Valid page
const rValidPage = validateCatalogQueryParams(new URLSearchParams({ page: "5" }));
assert.equal(rValidPage.isValid, true);
assert.equal(rValidPage.data.page, 5);

// 2. Limit boundary tests
const rLimit0 = validateCatalogQueryParams(new URLSearchParams({ limit: "0" }));
assert.equal(rLimit0.isValid, false);
assert.equal(rLimit0.errors[0].field, "limit");

const rLimitExcess = validateCatalogQueryParams(new URLSearchParams({ limit: "51" }));
assert.equal(rLimitExcess.isValid, false);

const rLimitValid = validateCatalogQueryParams(new URLSearchParams({ limit: "24" }));
assert.equal(rLimitValid.isValid, true);
assert.equal(rLimitValid.data.limit, 24);

// 3. Search query length capping
const rSearchLong = validateCatalogQueryParams(new URLSearchParams({ search: "a".repeat(101) }));
assert.equal(rSearchLong.isValid, false);
assert.equal(rSearchLong.errors[0].field, "search");

const rSearchValid = validateCatalogQueryParams(new URLSearchParams({ search: "zwan luncheon" }));
assert.equal(rSearchValid.isValid, true);
assert.equal(rSearchValid.data.search, "zwan luncheon");

// 4. Excessive ID list
const ids51 = Array.from({ length: 51 }, (_, i) => `id-${i}`).join(",");
const rCatExcess = validateCatalogQueryParams(new URLSearchParams({ categoryIds: ids51 }));
assert.equal(rCatExcess.isValid, false);
assert.equal(rCatExcess.errors[0].field, "categoryIds");

const rBrandExcess = validateCatalogQueryParams(new URLSearchParams({ brandIds: ids51 }));
assert.equal(rBrandExcess.isValid, false);
assert.equal(rBrandExcess.errors[0].field, "brandIds");

// 5. Canonicalization and deduplication of IDs
const rCatDedupe = validateCatalogQueryParams(new URLSearchParams({ categoryIds: "cat-b, cat-a ,cat-b" }));
assert.equal(rCatDedupe.isValid, true);
assert.deepEqual(rCatDedupe.data.categoryIds, ["cat-a", "cat-b"]);

// 6. Invalid sort
const rSortInvalid = validateCatalogQueryParams(new URLSearchParams({ sort: "random_field" }));
assert.equal(rSortInvalid.isValid, false);
assert.equal(rSortInvalid.errors[0].field, "sort");

const rSortValid = validateCatalogQueryParams(new URLSearchParams({ sort: "price_asc" }));
assert.equal(rSortValid.isValid, true);
assert.equal(rSortValid.data.sort, "price_asc");

console.log("All catalog query input boundary tests passed successfully!");
