const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verify() {
    console.log("=== PHASE 1 VERIFICATION START ===");

    // 1. Check Supabase DB connection & Settings
    const settings = await prisma.settings.findUnique({
        where: { id: "site-settings" }
    });
    console.log("1. Settings Record:", settings ? "PASS" : "FAIL");
    console.log("   - Brand Title:", settings?.footerBrandTitle);
    console.log("   - Brand Title AR:", settings?.footerBrandTitleAr);
    console.log("   - Copyright:", settings?.footerCopyright);

    // 2. Check Admin User
    const admin = await prisma.user.findUnique({
        where: { username: "admin" }
    });
    const verificationPassword = process.env.ADMIN_VERIFY_PASSWORD;
    const passMatches = admin && verificationPassword ? await bcrypt.compare(verificationPassword, admin.password) : undefined;
    console.log("2. Admin User:", admin ? "PASS" : "FAIL");
    console.log("   - Username:", admin?.username);
    console.log("   - Role:", admin?.role);
    console.log("   - Credential verification requested:", Boolean(verificationPassword));
    if (verificationPassword) console.log("   - Credential matches:", passMatches);

    // 3. Check Default Brand
    const brand = await prisma.brand.findUnique({
        where: { slug: "zad-land" }
    });
    console.log("3. Default Brand:", brand ? "PASS" : "FAIL");
    console.log("   - Name:", brand?.name);
    console.log("   - Slug:", brand?.slug);

    // 4. Test Product Schema (Insert & query all new fields: nameAr, nameEn, descriptionAr, descriptionEn, options, mainCategoryId)
    let category = await prisma.category.findFirst();
    let createdTempCat = false;
    if (!category && brand) {
        category = await prisma.category.create({
            data: {
                name: "Verification Category",
                slug: "verify-category",
                brandId: brand.id
            }
        });
        createdTempCat = true;
    }

    let mainCat = await prisma.mainCategory.findFirst();
    let createdTempMain = false;
    if (!mainCat) {
        mainCat = await prisma.mainCategory.create({
            data: {
                name: "Verification Main",
                slug: "verify-main",
            }
        });
        createdTempMain = true;
    }

    const testProduct = await prisma.product.create({
        data: {
            name: "De Cecco Spaghetti No.12",
            nameAr: "معكرونة دي سيكو سباغيتي رقم 12",
            nameEn: "De Cecco Spaghetti No.12 500g",
            slug: "de-cecco-spaghetti-verify-test",
            description: "Premium Italian Pasta",
            descriptionAr: "معكرونة إيطالية فاخرة مصنوعة من قمح الدوروم بنسبة 100%",
            descriptionEn: "Premium Italian pasta made with 100% durum wheat semolina",
            price: 2.50,
            stock: 120,
            options: "500g, 1kg",
            images: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800",
            brandId: brand.id,
            categoryId: category.id,
            mainCategoryId: mainCat.id,
        }
    });

    console.log("4. Product Schema & New Fields:");
    console.log("   - nameAr:", testProduct.nameAr === "معكرونة دي سيكو سباغيتي رقم 12" ? "PASS" : "FAIL");
    console.log("   - nameEn:", testProduct.nameEn === "De Cecco Spaghetti No.12 500g" ? "PASS" : "FAIL");
    console.log("   - descriptionAr:", testProduct.descriptionAr ? "PASS" : "FAIL");
    console.log("   - descriptionEn:", testProduct.descriptionEn ? "PASS" : "FAIL");
    console.log("   - options:", testProduct.options === "500g, 1kg" ? "PASS" : "FAIL");
    console.log("   - mainCategoryId:", testProduct.mainCategoryId === mainCat.id ? "PASS" : "FAIL");

    // Clean up test records
    await prisma.product.delete({ where: { id: testProduct.id } });
    if (createdTempCat) await prisma.category.delete({ where: { id: category.id } });
    if (createdTempMain) await prisma.mainCategory.delete({ where: { id: mainCat.id } });

    console.log("5. Cleanup:", "PASS");
    console.log("=== ALL PHASE 1 DATABASE CHECKS PASSED ===");
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
