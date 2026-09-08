const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const CATEGORY_IMAGE_MAP = {
    'معلبات': '/images/categories/canned-foods.webp',
    'سمن وزيت': '/images/categories/cooking-oil-ghee.webp',
    'بقوليات': '/images/categories/legumes-rice-grains.webp',
    'عناية بالاسنان': '/images/categories/dental-oral-care.webp',
    'عناية بالأسنان': '/images/categories/dental-oral-care.webp',
    'عناية بالجسم وشعر': '/images/categories/body-hair-care.webp',
    'عناية بالجسم والشعر': '/images/categories/body-hair-care.webp',
    'محارم': '/images/categories/tissues-wet-wipes.webp',
    'جلي': '/images/categories/dishwashing-liquid.webp',
    'صابون': '/images/categories/liquid-hand-soap.webp',
    'عام': '/images/categories/antiseptics-disinfectants.webp',
    'ملمعات': '/images/categories/glass-surface-cleaners.webp',
    'غسيل': '/images/categories/laundry-detergents.webp',
    'مطهر ومعقم': '/images/categories/antiseptics-disinfectants.webp',
};

const BRAND_IMAGE_MAP = {
    'الريف': '/images/brands/alreef.webp',
    'بوفالو': '/images/brands/bufalo.webp',
    'حليبنا': '/images/brands/halibna.webp',
    'روكافيرا': '/images/brands/rokavera.webp',
    'زوان': '/images/brands/zwan.webp',
    'صن بل': 'https://i.postimg.cc/N0ftBHFq/data-bodour-(43).png',
    'سيلفر فيش': 'https://i.postimg.cc/X7zdwfMd/data-bodour-(44).png',
    'المغربي': 'https://i.postimg.cc/yNQDHBVN/data-bodour-(45).png',
};

async function main() {
    console.log('--- Starting Hawa Database Synchronization ---');

    // 1. Update Main Categories
    console.log('\n1. Updating Main Categories...');
    await prisma.mainCategory.updateMany({
        where: { name: { contains: 'غذائيات' } },
        data: { image: '/images/categories/cooking-oil-ghee.webp', isActive: true, isFeatured: true }
    });
    await prisma.mainCategory.updateMany({
        where: { name: { contains: 'منظفات' } },
        data: { image: '/images/categories/dishwashing-liquid.webp', isActive: true, isFeatured: true }
    });

    // 2. Update Brands with Official Logos
    console.log('\n2. Updating Brands...');
    const brands = await prisma.brand.findMany();
    for (const b of brands) {
        const cleanName = b.name.trim();
        let newImage = null;
        for (const [key, img] of Object.entries(BRAND_IMAGE_MAP)) {
            if (cleanName.includes(key)) {
                newImage = img;
                break;
            }
        }
        if (newImage) {
            await prisma.brand.update({
                where: { id: b.id },
                data: { image: newImage, isActive: true, archivedAt: null, isFeatured: true }
            });
            console.log(`Updated Brand: ${b.name} -> ${newImage}`);
        }
    }

    // 3. Update Categories with Official Category Images
    console.log('\n3. Updating Categories...');
    const categories = await prisma.category.findMany();
    for (const c of categories) {
        const cleanName = c.name.trim();
        let catImage = CATEGORY_IMAGE_MAP[cleanName] || '/images/categories/antiseptics-disinfectants.webp';
        await prisma.category.update({
            where: { id: c.id },
            data: { image: catImage, isFeatured: true }
        });
        console.log(`Updated Category: ${c.name} (${c.slug}) -> ${catImage}`);
    }

    // 4. Read Excel and sync Products
    console.log('\n4. Syncing Products from Excel...');
    const excelPath = 'C:\\Users\\moham\\Downloads\\شركة حوا.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(`Loaded ${rows.length} rows from Excel sheet.`);

    let updatedCount = 0;
    for (const r of rows) {
        const nameAr = r['اسم المنتج بالعربي'] ? String(r['اسم المنتج بالعربي']).trim() : null;
        const nameEn = r['اسم المنتج بالإنجليزي'] ? String(r['اسم المنتج بالإنجليزي']).trim() : null;
        const descAr = r['وصف المنتج بالعربي'] ? String(r['وصف المنتج بالعربي']).trim() : null;
        const descEn = r['وصف المنتج بالإنجليزي'] ? String(r['وصف المنتج بالإنجليزي']).trim() : null;
        const imageUrl = r['رابط صورة المنتج'] ? String(r['رابط صورة المنتج']).trim() : null;
        const price = typeof r['السعر'] === 'number' ? r['السعر'] : 0;
        const brandName = r['اسم الماركة'] ? String(r['اسم الماركة']).trim() : '';

        if (!nameAr || !imageUrl) continue;

        // Find existing product by exact or fuzzy name match
        let product = await prisma.product.findFirst({
            where: {
                OR: [
                    { name: nameAr },
                    { name: { contains: nameAr.slice(0, 20) } },
                    { nameAr: nameAr }
                ]
            }
        });

        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    nameAr,
                    nameEn,
                    description: descAr,
                    descriptionAr: descAr,
                    descriptionEn: descEn,
                    images: imageUrl,
                    price,
                    stock: product.stock > 0 ? product.stock : 50,
                    archivedAt: null,
                }
            });
            updatedCount++;
        }
    }
    console.log(`Successfully matched and updated ${updatedCount} products from Excel.`);

    // 5. Ensure trending products are set for the homepage
    console.log('\n5. Setting trending showcase products...');
    // Mark the first 2 products of each brand as trending so all brands appear in trending and best sellers
    for (const b of brands) {
        const brandProds = await prisma.product.findMany({
            where: { brandId: b.id, archivedAt: null },
            take: 2,
            select: { id: true }
        });
        for (const p of brandProds) {
            await prisma.product.update({
                where: { id: p.id },
                data: { isTrending: true, stock: 100 }
            });
        }
    }

    const totalTrending = await prisma.product.count({ where: { isTrending: true } });
    console.log(`Total trending products now: ${totalTrending}`);

    console.log('\n--- Hawa Database Synchronization Completed Successfully ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
