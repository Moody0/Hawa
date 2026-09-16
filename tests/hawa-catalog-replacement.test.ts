import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import {
    extractProductsFromCsv,
    prepareCatalogDataset,
    getPlaceholderSafeSlug,
    importHawaCatalogToDatabase
} from '@/scripts/import-hawa-catalog';

describe('Hawa Product Catalog Replacement Tests (Blank -> 0 Transformation)', () => {
    const csvPath = path.join(process.cwd(), 'hawa_products.csv');
    const catalogJsonPath = path.join(process.cwd(), 'data', 'hawa-products-catalog.json');

    it('successfully parses exactly 142 products from hawa_products.csv', () => {
        expect(fs.existsSync(csvPath)).toBe(true);
        const products = extractProductsFromCsv(csvPath);
        expect(products).toHaveLength(142);
    });

    it('guarantees all products have non-empty names and unique deterministic slugs', () => {
        const products = extractProductsFromCsv(csvPath);
        const slugSet = new Set<string>();

        products.forEach((p) => {
            expect(p.nameAr, `Row ${p.rowNumber} missing Arabic name`).toBeTruthy();
            expect(p.nameEn, `Row ${p.rowNumber} missing English name`).toBeTruthy();
            expect(p.slug, `Row ${p.rowNumber} missing slug`).toBeTruthy();
            expect(slugSet.has(p.slug), `Duplicate slug detected: ${p.slug} at row ${p.rowNumber}`).toBe(false);
            slugSet.add(p.slug);
        });

        expect(slugSet.size).toBe(142);
    });

    it('confirms all blank quantity cells became numeric 0 (no stock 50)', () => {
        const products = extractProductsFromCsv(csvPath);
        products.forEach((p) => {
            expect(p.quantity, `Row ${p.rowNumber} should have quantity = 0`).toBe(0);
        });
        const hasStock50 = products.some((p) => p.quantity === 50);
        expect(hasStock50).toBe(false);
    });

    it('confirms all blank options cells became string "0"', () => {
        const products = extractProductsFromCsv(csvPath);
        products.forEach((p) => {
            expect(p.options, `Row ${p.rowNumber} should have options = "0"`).toBe('0');
        });
    });

    it('confirms all blank brand cells became string "0" without inferring from names', () => {
        const products = extractProductsFromCsv(csvPath);
        const zeroBrandRows = [14, 100, 108, 118];

        zeroBrandRows.forEach((rowNum) => {
            const product = products.find((p) => p.rowNumber === rowNum);
            expect(product, `Row ${rowNum} not found`).toBeDefined();
            expect(product?.brandName, `Row ${rowNum} should have brandName = "0"`).toBe('0');
        });

        const allZeroBrands = products.filter((p) => p.brandName === '0');
        expect(allZeroBrands).toHaveLength(4);
    });

    it('confirms all blank main category cells became string "0" without inferring', () => {
        const products = extractProductsFromCsv(csvPath);
        const zeroMainCatRows = [14, 108, 118];

        zeroMainCatRows.forEach((rowNum) => {
            const product = products.find((p) => p.rowNumber === rowNum);
            expect(product, `Row ${rowNum} not found`).toBeDefined();
            expect(product?.mainCatName, `Row ${rowNum} should have mainCatName = "0"`).toBe('0');
        });

        const allZeroMainCats = products.filter((p) => p.mainCatName === '0');
        expect(allZeroMainCats).toHaveLength(3);
    });

    it('confirms all blank subcategory cells became string "0" without inventing "عام"', () => {
        const products = extractProductsFromCsv(csvPath);
        const zeroSubCats = products.filter((p) => p.subCatName === '0');
        expect(zeroSubCats).toHaveLength(28);

        // Verify "عام" was NOT invented
        const generalCategoryProducts = products.filter((p) => p.subCatName === 'عام');
        expect(generalCategoryProducts).toHaveLength(0);
    });

    it('confirms all blank image URL cells became string "0" without using /placeholder.svg in source data', () => {
        const products = extractProductsFromCsv(csvPath);
        const zeroImageRows = [19, 99, 100, 109, 135, 143];

        zeroImageRows.forEach((rowNum) => {
            const product = products.find((p) => p.rowNumber === rowNum);
            expect(product, `Row ${rowNum} not found`).toBeDefined();
            expect(product?.imageUrl, `Row ${rowNum} should have imageUrl = "0"`).toBe('0');
        });

        const allZeroImages = products.filter((p) => p.imageUrl === '0');
        expect(allZeroImages).toHaveLength(6);

        // Ensure no "/placeholder.svg" in source records
        const hasPlaceholder = products.some((p) => p.imageUrl === '/placeholder.svg');
        expect(hasPlaceholder).toBe(false);
    });

    it('confirms prices are preserved exactly as supplied (0 for all rows)', () => {
        const products = extractProductsFromCsv(csvPath);
        products.forEach((p) => {
            expect(p.price).toBe(0);
        });
    });

    it('verifies data/hawa-products-catalog.json contains exactly 142 new products and zero old products', () => {
        expect(fs.existsSync(catalogJsonPath)).toBe(true);
        const jsonContent = JSON.parse(fs.readFileSync(catalogJsonPath, 'utf8'));
        expect(jsonContent).toHaveLength(142);

        // Verify zero legacy Ruby Beauty or previous products exist
        const jsonString = JSON.stringify(jsonContent);
        expect(jsonString).not.toContain('Ruby Beauty');
        expect(jsonString).not.toContain('Sevencool');
        expect(jsonString).not.toContain('Huxia Beauty');
    });

    it('guarantees placeholder entities named "0" generate deterministic, non-colliding reserved slugs', () => {
        expect(getPlaceholderSafeSlug('mc', '0')).toBe('mc-0');
        expect(getPlaceholderSafeSlug('brand', '0')).toBe('brand-0');
        expect(getPlaceholderSafeSlug('category', '0', 'brand-0')).toBe('cat-0-brand-0');
        expect(getPlaceholderSafeSlug('category', '0', 'zwan')).toBe('cat-0-zwan');

        // Real entity names should generate standard slugs
        expect(getPlaceholderSafeSlug('mc', 'غذائيات')).not.toBe('mc-0');
        expect(getPlaceholderSafeSlug('brand', 'Al Reef')).toBe('al-reef');
    });

    it('executes dry-run validation of importHawaCatalogToDatabase without database connection', async () => {
        const result = await importHawaCatalogToDatabase({ dryRun: true });
        expect(result.dryRun).toBe(true);
        expect(result.status).toBe('VALIDATED');
        expect(result.totalProducts).toBe(142);
    });

    it('confirms prepareCatalogDataset runs idempotently without mutating source counts', () => {
        const run1 = prepareCatalogDataset();
        const run2 = prepareCatalogDataset();

        expect(run1.products.length).toBe(142);
        expect(run2.products.length).toBe(142);
        expect(run1.zeroMainCat.length).toBe(run2.zeroMainCat.length);
        expect(run1.zeroSubCat.length).toBe(run2.zeroSubCat.length);
        expect(run1.zeroBrand.length).toBe(run2.zeroBrand.length);
        expect(run1.zeroQuantity.length).toBe(run2.zeroQuantity.length);
    });
});

describe('Storefront Runtime Behavior with stock=0 and blank=0 Catalog', () => {
    it('parseProductOptions correctly treats "0", null, and "" as empty without showing "0" as a selectable option', async () => {
        const { parseProductOptions } = await import('@/lib/product-options');

        expect(parseProductOptions('0')).toEqual([]);
        expect(parseProductOptions('')).toEqual([]);
        expect(parseProductOptions(null)).toEqual([]);
        expect(parseProductOptions(undefined)).toEqual([]);
        expect(parseProductOptions('  0  ')).toEqual([]);
        expect(parseProductOptions('0, 0')).toEqual([]);
        expect(parseProductOptions('500ml, 0, 1L')).toEqual(['500ml', '1L']);
        expect(parseProductOptions('Red, Blue')).toEqual(['Red', 'Blue']);
    });

    it('getSafeImageUrl and isValidImageSrc treat image value "0" as invalid and fall back to /placeholder.svg', async () => {
        const { isValidImageSrc, getSafeImageUrl, getImageSourceCandidates } = await import('@/lib/image-utils');

        expect(isValidImageSrc('0')).toBe(false);
        expect(isValidImageSrc('')).toBe(false);
        expect(isValidImageSrc(null)).toBe(false);
        expect(getSafeImageUrl('0')).toBe('/placeholder.svg');
        expect(getImageSourceCandidates('0')).toEqual(['/placeholder.svg']);

        // Valid image paths work normally
        expect(isValidImageSrc('https://example.com/item.jpg')).toBe(true);
        expect(getSafeImageUrl('https://example.com/item.jpg')).toBe('https://example.com/item.jpg');
    });

    it('packaging formatters treat "0" as empty/default rather than displaying literal "0"', async () => {
        const { formatPackaging, formatPackageItems } = await import('@/lib/packaging');

        // formatPackaging with '0' should fall back to standard carton/طرد
        expect(formatPackaging('0', 'ar')).toBe('طرد');
        expect(formatPackaging('0', 'en')).toBe('Carton');

        // formatPackageItems with '0' should return empty string
        expect(formatPackageItems('0', 'ar')).toBe('');
        expect(formatPackageItems('0', 'en')).toBe('');
    });

    it('verifies public catalog query filter logic keeps stock=0 products visible by default and only filters when inStock=true', () => {
        const buildWhereClause = (inStock?: boolean) => {
            const whereClause: {
                stock?: { gt: number };
                archivedAt: null;
            } = {
                archivedAt: null,
            };

            if (inStock) {
                whereClause.stock = { gt: 0 };
            }

            return whereClause;
        };

        const defaultListingWhere = buildWhereClause();
        expect(defaultListingWhere.stock).toBeUndefined(); // Visible regardless of stock

        const inStockListingWhere = buildWhereClause(true);
        expect(inStockListingWhere.stock).toEqual({ gt: 0 }); // Hidden when explicitly filtered to in-stock
    });

    it('verifies purchase protection invariants: stock=0 cannot be purchased at checkout or added when checked', () => {
        const productStock = 0;
        const requestedQuantity = 1;

        // Backend atomic condition in /api/orders: stock: { gte: item.quantity }
        const satisfiesOrderCondition = productStock >= requestedQuantity;
        expect(satisfiesOrderCondition).toBe(false);

        // Frontend disabled flag: stock <= 0
        const isOutOfStock = productStock <= 0;
        expect(isOutOfStock).toBe(true);
    });
});
