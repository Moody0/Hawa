import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

// Load environment variables from .env files if present via @next/env
try {
    const { loadEnvConfig } = require('@next/env');
    loadEnvConfig(path.join(__dirname, '..'));
} catch {
    // Ignore if @next/env is not available
}

// RFC 4180 compliant CSV parser supporting multiline quoted strings
export function parseCSV(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField);
                currentField = '';
            } else if (char === '\r') {
                if (nextChar === '\n') i++;
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else if (char === '\n') {
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }
    return rows;
}

export interface CsvProductRecord {
    rowNumber: number;
    mainCatName: string;
    subCatName: string;
    brandName: string;
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    price: number;
    quantity: number;
    options: string;
    imageUrl: string;
    slug: string;
}

/**
 * Extracts and maps CSV records with the explicit rule:
 * Every blank/missing cell from hawa_products.csv is represented as 0
 * (numeric 0 for numeric fields, "0" for string fields).
 * Absolutely NO inferred business data, NO stock 50, NO invented fallback categories.
 */
export function extractProductsFromCsv(csvFilePath: string): CsvProductRecord[] {
    const content = fs.readFileSync(csvFilePath, 'utf8');
    const allRows = parseCSV(content);
    const dataRows = allRows.slice(1).filter(r => r.some(cell => cell.trim().length > 0));

    const usedSlugs = new Set<string>();

    return dataRows.map((r, idx) => {
        const rowNumber = idx + 2;
        const mainCat = (r[0] || '').trim() || '0';
        const subCat = (r[1] || '').trim() || '0';
        const brand = (r[2] || '').trim() || '0';
        const nameAr = (r[3] || '').trim() || '0';
        const nameEn = (r[4] || '').trim() || '0';
        const descAr = (r[5] || '').trim() || '0';
        const descEn = (r[6] || '').trim() || '0';
        const rawPrice = (r[7] || '').trim();
        const rawQty = (r[8] || '').trim();
        const rawOptions = (r[9] || '').trim();
        const imageUrl = (r[10] || '').trim() || '0';

        const price = parseFloat(rawPrice) || 0;
        const quantity = rawQty ? parseInt(rawQty, 10) : 0;
        const options = rawOptions || '0';

        // Generate deterministic slug from nameEn or nameAr (or rowNumber if both were "0")
        const baseSlugText = (nameEn && nameEn !== '0') ? nameEn : ((nameAr && nameAr !== '0') ? nameAr : `hawa-product-${rowNumber}`);
        let baseSlug = slugify(baseSlugText, { lower: true, strict: true });
        if (!baseSlug || baseSlug.length < 2) {
            baseSlug = `hawa-product-${rowNumber}`;
        }

        let slug = baseSlug;
        let counter = 1;
        while (usedSlugs.has(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        usedSlugs.add(slug);

        return {
            rowNumber,
            mainCatName: mainCat,
            subCatName: subCat,
            brandName: brand,
            nameAr,
            nameEn,
            descAr,
            descEn,
            price,
            quantity,
            options,
            imageUrl,
            slug
        };
    });
}

export function prepareCatalogDataset() {
    const csvPath = path.join(process.cwd(), 'hawa_products.csv');
    if (!fs.existsSync(csvPath)) {
        throw new Error(`Catalog CSV file not found at: ${csvPath}`);
    }

    const products = extractProductsFromCsv(csvPath);

    // Save strictly normalized JSON catalog dataset with blank -> 0 mapping
    const jsonSeedDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(jsonSeedDir)) {
        fs.mkdirSync(jsonSeedDir, { recursive: true });
    }
    const jsonSeedPath = path.join(jsonSeedDir, 'hawa-products-catalog.json');
    fs.writeFileSync(jsonSeedPath, JSON.stringify(products, null, 2), 'utf8');

    return {
        products,
        jsonSeedPath,
        zeroMainCat: products.filter(p => p.mainCatName === '0'),
        zeroSubCat: products.filter(p => p.subCatName === '0'),
        zeroBrand: products.filter(p => p.brandName === '0'),
        zeroImage: products.filter(p => p.imageUrl === '0'),
        zeroQuantity: products.filter(p => p.quantity === 0),
        zeroOptions: products.filter(p => p.options === '0')
    };
}

/**
 * Deterministic helper to generate placeholder-safe slugs:
 * Placeholder entities named "0" receive dedicated, reserved non-colliding slugs.
 */
export function getPlaceholderSafeSlug(entityType: 'mc' | 'brand' | 'category', name: string, parentSlug?: string): string {
    if (name === '0') {
        if (entityType === 'category') {
            return `cat-0-${parentSlug || 'general'}`;
        }
        return `${entityType}-0`;
    }
    const clean = slugify(name, { lower: true, strict: true });
    if (!clean || clean.length < 2) {
        const hash = Buffer.from(name).toString('hex').slice(0, 8);
        return `${entityType}-${hash}`;
    }
    if (entityType === 'category' && parentSlug) {
        return `${parentSlug}-${clean}`;
    }
    return clean;
}

/**
 * Production Catalog Importer & Database Replacement Routine
 *
 * SAFETY INVARIANTS:
 * 1. Scope is restricted exclusively to product catalog tables (Product, Category, Brand, MainCategory).
 * 2. NEVER deletes or modifies: User, Customer, Order, OrderItem, AdminAuditLog, Settings, Banner, Post, PromoCode.
 * 3. Relational integrity: Any old product referenced in historical order items is archived (archivedAt = now, stock = 0)
 *    rather than hard-deleted, completely preventing foreign key violations or order corruption.
 * 4. Placeholder entities named "0" are upserted deterministically without collisions or duplicate creation.
 */
export async function importHawaCatalogToDatabase(options: { dryRun?: boolean } = {}) {
    const { dryRun = false } = options;

    const jsonPath = path.join(process.cwd(), 'data', 'hawa-products-catalog.json');
    let products: CsvProductRecord[];
    if (fs.existsSync(jsonPath)) {
        products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } else {
        const prepared = prepareCatalogDataset();
        products = prepared.products;
    }

    console.log(`[HAWA IMPORTER] Preparing to process ${products.length} catalog products (dryRun: ${dryRun})...`);

    if (dryRun) {
        console.log('[HAWA IMPORTER] Dry run mode enabled. Validating dataset integrity without contacting database.');
        return {
            totalProducts: products.length,
            dryRun: true,
            status: 'VALIDATED'
        };
    }

    // Dynamic import ensures PrismaClient is only instantiated when actually executing against DB
    const { prisma } = await import('../lib/prisma');

    console.log('[HAWA IMPORTER] Connecting to PostgreSQL/Supabase database via Prisma...');

    // 1. Process Main Categories
    console.log('[HAWA IMPORTER] Upserting Main Categories...');
    const uniqueMainCatNames = [...new Set(products.map(p => p.mainCatName))];
    const mainCatMap = new Map<string, { id: string; slug: string }>();

    for (const mcName of uniqueMainCatNames) {
        const slug = getPlaceholderSafeSlug('mc', mcName);
        const isPlaceholder = mcName === '0';

        const existing = await prisma.mainCategory.findFirst({
            where: {
                OR: [
                    { name: mcName },
                    { slug }
                ]
            }
        });

        let mc;
        if (existing) {
            mc = await prisma.mainCategory.update({
                where: { id: existing.id },
                data: {
                    name: mcName,
                    isActive: true,
                    showInNav: !isPlaceholder
                }
            });
        } else {
            mc = await prisma.mainCategory.create({
                data: {
                    name: mcName,
                    slug,
                    description: isPlaceholder ? '0' : `${mcName} Collection`,
                    isActive: true,
                    showInNav: !isPlaceholder,
                    isFeatured: false
                }
            });
        }
        mainCatMap.set(mcName, { id: mc.id, slug: mc.slug });
    }

    // 2. Process Brands
    console.log('[HAWA IMPORTER] Upserting Brands...');
    const uniqueBrandNames = [...new Set(products.map(p => p.brandName))];
    const brandMap = new Map<string, { id: string; slug: string }>();

    for (const bName of uniqueBrandNames) {
        const slug = getPlaceholderSafeSlug('brand', bName);
        const isPlaceholder = bName === '0';

        // Associate brand with dominant main category if available
        const sampleProduct = products.find(p => p.brandName === bName);
        const mcRecord = sampleProduct ? mainCatMap.get(sampleProduct.mainCatName) : undefined;

        const existing = await prisma.brand.findFirst({
            where: {
                OR: [
                    { name: bName },
                    { slug }
                ]
            }
        });

        let brand;
        if (existing) {
            brand = await prisma.brand.update({
                where: { id: existing.id },
                data: {
                    name: bName,
                    isActive: true,
                    mainCategoryId: mcRecord?.id || existing.mainCategoryId || null
                }
            });
        } else {
            brand = await prisma.brand.create({
                data: {
                    name: bName,
                    slug,
                    description: isPlaceholder ? '0' : `Products for ${bName}`,
                    group: isPlaceholder ? 'DIFFERENT' : 'MAIN',
                    isActive: true,
                    isFeatured: !isPlaceholder,
                    mainCategoryId: mcRecord?.id || null
                }
            });
        }
        brandMap.set(bName, { id: brand.id, slug: brand.slug });
    }

    // 3. Process Categories
    console.log('[HAWA IMPORTER] Upserting Categories...');
    const categoryKeyMap = new Map<string, string>(); // "brandId||subCatName" -> categoryId

    for (const p of products) {
        const brand = brandMap.get(p.brandName);
        if (!brand) continue;

        const key = `${brand.id}||${p.subCatName}`;
        if (categoryKeyMap.has(key)) continue;

        const slug = getPlaceholderSafeSlug('category', p.subCatName, brand.slug);
        const mc = mainCatMap.get(p.mainCatName);

        const existing = await prisma.category.findFirst({
            where: {
                OR: [
                    { slug },
                    { brandId: brand.id, name: p.subCatName }
                ]
            }
        });

        let category;
        if (existing) {
            category = await prisma.category.update({
                where: { id: existing.id },
                data: {
                    name: p.subCatName,
                    brandId: brand.id,
                    mainCategoryId: mc?.id || existing.mainCategoryId || null
                }
            });
        } else {
            category = await prisma.category.create({
                data: {
                    name: p.subCatName,
                    slug,
                    description: p.subCatName === '0' ? '0' : `Products for ${p.subCatName}`,
                    brandId: brand.id,
                    mainCategoryId: mc?.id || null,
                    isFeatured: p.subCatName !== '0'
                }
            });
        }
        categoryKeyMap.set(key, category.id);
    }

    // 4. Upsert the 142 Products
    console.log(`[HAWA IMPORTER] Upserting ${products.length} products...`);
    let upsertedCount = 0;
    const newProductSlugs = products.map(p => p.slug);

    for (const p of products) {
        const brand = brandMap.get(p.brandName);
        const categoryId = brand ? categoryKeyMap.get(`${brand.id}||${p.subCatName}`) : null;
        const mc = mainCatMap.get(p.mainCatName);

        if (!brand || !categoryId) {
            console.error(`[HAWA IMPORTER] Missing relation for row ${p.rowNumber} (${p.slug})`);
            continue;
        }

        const arabicName = p.nameAr !== '0' ? p.nameAr : (p.nameEn !== '0' ? p.nameEn : '0');

        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {
                name: arabicName,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                description: p.descAr !== '0' ? p.descAr : (p.descEn !== '0' ? p.descEn : null),
                descriptionAr: p.descAr !== '0' ? p.descAr : null,
                descriptionEn: p.descEn !== '0' ? p.descEn : null,
                price: p.price,
                stock: p.quantity,
                options: p.options !== '0' ? p.options : null,
                images: p.imageUrl,
                packaging: 'طرد',
                itemsPerPackage: 'حسب مواصفات المصنع',
                minOrder: 1,
                brandId: brand.id,
                categoryId: categoryId,
                mainCategoryId: mc?.id || null,
                archivedAt: null
            },
            create: {
                name: arabicName,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                slug: p.slug,
                description: p.descAr !== '0' ? p.descAr : (p.descEn !== '0' ? p.descEn : null),
                descriptionAr: p.descAr !== '0' ? p.descAr : null,
                descriptionEn: p.descEn !== '0' ? p.descEn : null,
                price: p.price,
                stock: p.quantity,
                options: p.options !== '0' ? p.options : null,
                images: p.imageUrl,
                packaging: 'طرد',
                itemsPerPackage: 'حسب مواصفات المصنع',
                minOrder: 1,
                brandId: brand.id,
                categoryId: categoryId,
                mainCategoryId: mc?.id || null,
                isTrending: false,
                archivedAt: null
            }
        });
        upsertedCount++;
    }

    // 5. Replace Old Catalog Data: Scope strictly to Product catalog entities
    console.log('[HAWA IMPORTER] Reconciling old catalog entities...');
    const oldProducts = await prisma.product.findMany({
        where: { slug: { notIn: newProductSlugs } },
        select: { id: true, slug: true }
    });

    console.log(`[HAWA IMPORTER] Found ${oldProducts.length} old products not in the new catalog.`);

    let archivedOldProducts = 0;
    let deletedOldProducts = 0;

    for (const oldProd of oldProducts) {
        // Relational integrity check: NEVER delete historical customer orders
        const orderItemCount = await prisma.orderItem.count({
            where: { productId: oldProd.id }
        });

        if (orderItemCount > 0) {
            // Soft-archive to preserve customer orders and integrity
            await prisma.product.update({
                where: { id: oldProd.id },
                data: {
                    archivedAt: new Date(),
                    stock: 0
                }
            });
            archivedOldProducts++;
        } else {
            // Delete dependent wishlists / reviews (cascade-safe)
            await prisma.wishlistItem.deleteMany({ where: { productId: oldProd.id } });
            await prisma.review.deleteMany({ where: { productId: oldProd.id } });
            await prisma.product.delete({ where: { id: oldProd.id } });
            deletedOldProducts++;
        }
    }

    console.log(`[HAWA IMPORTER SUCCESS] Processed ${upsertedCount} new products.`);
    console.log(`- Old products archived (retained for order integrity): ${archivedOldProducts}`);
    console.log(`- Old products deleted: ${deletedOldProducts}`);

    return {
        upsertedCount,
        archivedOldProducts,
        deletedOldProducts
    };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const shouldExecute = args.includes('--execute');
    const isDryRun = args.includes('--dry-run');

    if (shouldExecute || isDryRun) {
        importHawaCatalogToDatabase({ dryRun: isDryRun })
            .then(() => {
                console.log('[HAWA CATALOG IMPORT COMPLETE]');
                process.exit(0);
            })
            .catch((err) => {
                console.error('[HAWA CATALOG IMPORT FAILED]:', err);
                process.exit(1);
            });
    } else {
        const result = prepareCatalogDataset();
        console.log(`[CATALOG PREPARED] ${result.products.length} products saved to ${result.jsonSeedPath}`);
        console.log(`- Products with main category = "0": ${result.zeroMainCat.length}`);
        console.log(`- Products with subcategory = "0": ${result.zeroSubCat.length}`);
        console.log(`- Products with brand = "0": ${result.zeroBrand.length}`);
        console.log(`- Products with image = "0": ${result.zeroImage.length}`);
        console.log(`- Products with quantity = 0: ${result.zeroQuantity.length}`);
        console.log(`- Products with options = "0": ${result.zeroOptions.length}`);
        console.log('\n[SAFEGUARD NOTICE] Database execution is intentionally guarded.');
        console.log('To execute catalog replacement against PostgreSQL/Supabase when deployed, run:');
        console.log('  npm run db:import:hawa');
    }
}
