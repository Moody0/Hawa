import { test } from "vitest";
import assert from "node:assert/strict";
import { normalizeSearchText, getSearchVariants, buildSearchWhereConditions } from "../lib/search-utils.js";

test("normalizeSearchText normalizes Arabic diacritics and letters", () => {
    // Diacritics
    assert.equal(normalizeSearchText("مُنتَجٌ"), "منتج");
    // Alef variants
    assert.equal(normalizeSearchText("أحمد"), "احمد");
    assert.equal(normalizeSearchText("إسلام"), "اسلام");
    assert.equal(normalizeSearchText("آيس كريم"), "ايس كريم");
    // Taa marbuta
    assert.equal(normalizeSearchText("جبنة"), "جبنه");
    // Alef maksura
    assert.equal(normalizeSearchText("حلوى"), "حلوي");
    // Tatweel
    assert.equal(normalizeSearchText("شــــاي"), "شاي");
});

test("normalizeSearchText normalizes English text", () => {
    assert.equal(normalizeSearchText("  CHOCOLATE  MILK  "), "chocolate milk");
});

test("getSearchVariants enforces minimum query length", () => {
    assert.deepEqual(getSearchVariants("a"), []);
    assert.deepEqual(getSearchVariants(" "), []);
    assert.ok(getSearchVariants("شاي").length >= 1);
});

test("getSearchVariants generates Arabic variants for robust matching", () => {
    const variants = getSearchVariants("قهوة");
    assert.ok(variants.includes("قهوة"));
    assert.ok(variants.includes("قهوه"));
});

test("buildSearchWhereConditions returns empty array for short queries", () => {
    const conditions = buildSearchWhereConditions("x");
    assert.equal(conditions.length, 0);
});

test("buildSearchWhereConditions returns Prisma OR conditions for valid search", () => {
    const conditions = buildSearchWhereConditions("شاي");
    assert.ok(conditions.length > 0);
    // Check that name and sku are covered
    assert.ok(conditions.some(c => "name" in c));
    assert.ok(conditions.some(c => "sku" in c));
});
