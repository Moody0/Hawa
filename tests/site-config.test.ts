import { test } from "vitest";
import assert from "node:assert/strict";
import {
    SITE_ORIGIN,
    CONTACT_CONFIG,
    getCanonicalUrl,
    getAlternateLocaleUrls,
    getWhatsAppChatUrl,
    validateSiteConfig,
} from "../lib/site-config";

test("SITE_ORIGIN has no trailing slash and is valid URL", () => {
    assert.ok(SITE_ORIGIN.startsWith("http"));
    assert.ok(!SITE_ORIGIN.endsWith("/"));
    assert.doesNotThrow(() => new URL(SITE_ORIGIN));
});

test("CONTACT_CONFIG contains verified Syrian numbers and no placeholder zeros", () => {
    assert.ok(CONTACT_CONFIG.salesWhatsAppClean.startsWith("9639"));
    assert.notEqual(CONTACT_CONFIG.salesWhatsAppClean, "963900000000");
    assert.ok(CONTACT_CONFIG.managementPhoneClean.startsWith("9639"));
});

test("getCanonicalUrl produces canonical Arabic and English URLs", () => {
    assert.equal(getCanonicalUrl("/products", "ar"), `${SITE_ORIGIN}/products`);
    assert.equal(getCanonicalUrl("/products", "en"), `${SITE_ORIGIN}/en/products`);
    assert.equal(getCanonicalUrl("", "ar"), `${SITE_ORIGIN}/`);
    assert.equal(getCanonicalUrl("", "en"), `${SITE_ORIGIN}/en`);
});

test("getAlternateLocaleUrls generates correct hreflang mapping", () => {
    const alternates = getAlternateLocaleUrls("/brands/zwan");
    assert.equal(alternates.canonical, `${SITE_ORIGIN}/brands/zwan`);
    assert.equal(alternates.languages.ar, `${SITE_ORIGIN}/brands/zwan`);
    assert.equal(alternates.languages.en, `${SITE_ORIGIN}/en/brands/zwan`);
    assert.equal(alternates.languages["x-default"], `${SITE_ORIGIN}/brands/zwan`);
});

test("getWhatsAppChatUrl builds valid wa.me link with encoded message", () => {
    const url = getWhatsAppChatUrl(null, "طلب تجاري");
    assert.ok(url.startsWith("https://wa.me/963993443901?text="));
    assert.ok(url.includes(encodeURIComponent("طلب تجاري")));
});

test("validateSiteConfig passes without throwing", () => {
    assert.doesNotThrow(() => validateSiteConfig());
});
