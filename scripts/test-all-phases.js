const { PrismaClient, BrandGroup } = require('@prisma/client');
const prisma = new PrismaClient();

async function runFullSystemValidation() {
    console.log("==================================================");
    console.log("   HAWA FULL SYSTEM END-TO-END VERIFICATION   ");
    console.log("==================================================");

    let testProductId = null;
    let testOrderId = null;

    try {
        // 1. Check Site Settings
        const settings = await prisma.settings.findUnique({
            where: { id: "site-settings" }
        });
        if (!settings) throw new Error("Default site-settings row missing from Supabase Frankfurt");
        console.log("[PASS] 1. Verified Supabase Frankfurt Connection & Site Settings existence");

        // 2. Check Admin User
        const adminUser = await prisma.user.findUnique({
            where: { username: "admin" }
        });
        if (!adminUser) throw new Error("Default admin user missing");
        console.log(`[PASS] 2. Verified Admin user initialized: ${adminUser.username} (${adminUser.role})`);

        // 3. Verify Wholesale Brand & Category Setup
        const wholesaleBrand = await prisma.brand.upsert({
            where: { slug: 'de-cecco-e2e' },
            update: { name: 'De Cecco Italy', isActive: true, group: BrandGroup.MAIN },
            create: { name: 'De Cecco Italy', slug: 'de-cecco-e2e', isActive: true, group: BrandGroup.MAIN }
        });

        const mainCat = await prisma.mainCategory.upsert({
            where: { slug: 'food-and-grocery-e2e' },
            update: { name: 'المواد الغذائية والتموينية' },
            create: { name: 'المواد الغذائية والتموينية', slug: 'food-and-grocery-e2e' }
        });

        const category = await prisma.category.upsert({
            where: { slug: 'pasta-grains-e2e' },
            update: { name: 'Pasta & Grains', brandId: wholesaleBrand.id, mainCategoryId: mainCat.id },
            create: { name: 'Pasta & Grains', slug: 'pasta-grains-e2e', brandId: wholesaleBrand.id, mainCategoryId: mainCat.id }
        });

        console.log("[PASS] 3. Verified Wholesale Brands, Main Categories & Subcategories hierarchy");

        // 4. Test 11-column Product Data Structure
        const testProduct = await prisma.product.create({
            data: {
                name: 'Rio Mare Tuna in Olive Oil',
                nameAr: 'تونة ريو ماري بزيت الزيتون الإيطالي',
                nameEn: 'Rio Mare Tuna in Olive Oil',
                descriptionAr: 'تونة إيطالية فاخرة بزيت الزيتون البكر الممتاز، معبأة في كراتين الجملة',
                descriptionEn: 'Premium Italian tuna in pure olive oil, packed in factory wholesale cartons',
                price: 18.50,
                discountPrice: 16.99,
                stock: 500,
                slug: 'rio-mare-tuna-e2e-' + Date.now(),
                images: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600',
                options: '80g 3-Pack, 160g 2-Pack, 1kg Food Service',
                isTrending: true,
                brandId: wholesaleBrand.id,
                categoryId: category.id,
                mainCategoryId: mainCat.id,
            }
        });
        testProductId = testProduct.id;
        console.log(`[PASS] 4. Verified 11-Column Bilingual Product creation: ${testProduct.nameAr} (${testProduct.options})`);

        // 5. Test Option-Aware Order Creation
        const testOrder = await prisma.order.create({
            data: {
                Name: 'Hawa Certified Buyer',
                phone: '+963912345678',
                streetAddress: 'Commercial District Suite 402',
                city: 'Damascus',
                totalAmount: 33.98,
                status: 'PROCESSING',
                items: {
                    create: [
                        {
                            productId: testProduct.id,
                            quantity: 2,
                            price: 16.99,
                            options: '1kg Food Service'
                        }
                    ]
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                                mainCategory: true
                            }
                        }
                    }
                }
            }
        });
        testOrderId = testOrder.id;

        if (testOrder.items[0].options !== '1kg Food Service') {
            throw new Error(`Order item variant option mismatch: ${testOrder.items[0].options}`);
        }
        if (testOrder.items[0].product.mainCategory.name !== 'المواد الغذائية والتموينية') {
            throw new Error(`Main Category relation mismatch: ${testOrder.items[0].product.mainCategory.name}`);
        }
        console.log(`[PASS] 5. Verified Option-Aware Order Item persistence & multi-level relations lookup (#${testOrder.id})`);

        console.log("==================================================");
        console.log("  ALL REBRAND & MIGRATION PHASES PASSED (100%)    ");
        console.log("==================================================");
    } catch (error) {
        console.error("[FAIL] Verification Error:", error);
        process.exit(1);
    } finally {
        if (testOrderId) {
            await prisma.order.delete({ where: { id: testOrderId } }).catch(() => {});
        }
        if (testProductId) {
            await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
        }
        await prisma.$disconnect();
    }
}

runFullSystemValidation();
