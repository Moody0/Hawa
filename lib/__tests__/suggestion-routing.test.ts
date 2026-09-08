import assert from "node:assert/strict";
import {
    getCategorySuggestionUrl,
    getBrandSuggestionUrl,
    getProductSuggestionUrl,
    getSearchSubmitUrl,
} from "../suggestion-routing";

console.log("Running suggestion routing destination tests...");

// 1. Category suggestions route to canonical /categories/[slug]
assert.equal(getCategorySuggestionUrl("canned-goods"), "/categories/canned-goods");
assert.equal(getCategorySuggestionUrl("ghee-and-oils"), "/categories/ghee-and-oils");
assert.equal(getCategorySuggestionUrl("  Detergents-Cleaning "), "/categories/detergents-cleaning");

// Must NOT route category suggestions to ?brand=...
assert.ok(!getCategorySuggestionUrl("canned-goods").includes("brand="));

// 2. Brand suggestions route to /products?brand=[slug]
assert.equal(getBrandSuggestionUrl("zwan"), "/products?brand=zwan");
assert.equal(getBrandSuggestionUrl("alreef"), "/products?brand=alreef");
assert.equal(getBrandSuggestionUrl(" Buffalo "), "/products?brand=buffalo");

// 3. Product suggestions route to /products/[slug]
assert.equal(getProductSuggestionUrl("zwan-beef-luncheon-850g"), "/products/zwan-beef-luncheon-850g");
assert.equal(getProductSuggestionUrl("alreef-corn-oil-5l"), "/products/alreef-corn-oil-5l");

// 4. Search submit routes to /products?search=[query]
assert.equal(getSearchSubmitUrl("zwan luncheon"), "/products?search=zwan%20luncheon");
assert.equal(getSearchSubmitUrl("  سمن الريف  "), "/products?search=%D8%B3%D9%85%D9%86%20%D8%A7%D9%84%D8%B1%D9%8A%D9%81");

console.log("All suggestion routing destination tests passed successfully!");
