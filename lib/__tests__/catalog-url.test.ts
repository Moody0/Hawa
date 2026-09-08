import assert from "node:assert/strict";
import {
    normalizeSearchQuery,
    normalizeFilterTokens,
    normalizeCatalogSort,
    normalizeCatalogPage,
    parseCatalogUrlParams,
    buildCatalogUrl,
} from "../catalog-url";

console.log("Running catalog-url contract tests...");

// 1. Search normalization
assert.equal(normalizeSearchQuery("  zwan   luncheon  "), "zwan luncheon");
assert.equal(normalizeSearchQuery("\x00test\x1Fsearch"), "testsearch");
assert.equal(normalizeSearchQuery(""), "");
assert.equal(normalizeSearchQuery(null), "");
assert.equal(normalizeSearchQuery(undefined), "");
assert.equal(normalizeSearchQuery("a".repeat(150)).length, 100);

// 2. Token normalization (brands, categories)
assert.deepEqual(normalizeFilterTokens("brand-b,brand-a, brand-b "), ["brand-a", "brand-b"]);
assert.deepEqual(normalizeFilterTokens(["brand-b", "brand-a,brand-c"]), ["brand-a", "brand-b", "brand-c"]);
assert.deepEqual(normalizeFilterTokens(""), []);
assert.deepEqual(normalizeFilterTokens(undefined), []);

// 3. Sort normalization
assert.equal(normalizeCatalogSort("price_asc"), "price_asc");
assert.equal(normalizeCatalogSort("invalid_sort"), "best_sellers");
assert.equal(normalizeCatalogSort(null), "best_sellers");

// 4. Page normalization
assert.equal(normalizeCatalogPage("2"), 2);
assert.equal(normalizeCatalogPage("-5"), 1);
assert.equal(normalizeCatalogPage("abc"), 1);
assert.equal(normalizeCatalogPage(9999), 1000);

// 5. Parse catalog URL params
const parsed = parseCatalogUrlParams({
    search: "  halibna  ",
    brand: "zwan,alreef",
    category: "canned-goods",
    sort: "newest",
    page: "3",
    inStock: "true",
    onSale: "false",
});
assert.equal(parsed.search, "halibna");
assert.deepEqual(parsed.brands, ["alreef", "zwan"]);
assert.deepEqual(parsed.categories, ["canned-goods"]);
assert.equal(parsed.sort, "newest");
assert.equal(parsed.page, 3);
assert.equal(parsed.inStock, true);
assert.equal(parsed.onSale, false);

// 6. Build catalog URL (deterministic ordering, skips defaults)
const url1 = buildCatalogUrl({
    search: "zwan",
    brands: ["zwan", "alreef"],
    categories: ["dairy"],
    sort: "price_asc",
    page: 2,
    inStock: true,
});
// Notice brands should be sorted deterministically: alreef,zwan
assert.equal(
    url1,
    "/products?brand=alreef%2Czwan&category=dairy&inStock=true&page=2&search=zwan&sort=price_asc"
);

// Deterministic: regardless of input brand order, output URL is identical
const url2 = buildCatalogUrl({
    brands: ["alreef", "zwan"],
    search: "zwan",
    sort: "price_asc",
    categories: ["dairy"],
    inStock: true,
    page: 2,
});
assert.equal(url1, url2);

// Default values omitted
const urlDefault = buildCatalogUrl({
    sort: "best_sellers",
    page: 1,
    inStock: false,
    brands: [],
    search: "",
});
assert.equal(urlDefault, "/products");

console.log("All catalog-url contract tests passed successfully!");
