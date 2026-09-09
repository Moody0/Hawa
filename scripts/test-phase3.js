const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPhase3Verification() {
    console.log("=== PHASE 3 AUTOMATED LIVE VERIFICATION ===");
    let createdProductId = null;
    let createdOrderId = null;

    try {
        // 1. Ensure Brand & Category exist
        const brand = await prisma.brand.upsert({
            where: { slug: 'de-cecco-test' },
            update: { name: 'De Cecco Test', isActive: true },
            create: { name: 'De Cecco Test', slug: 'de-cecco-test', isActive: true, group: 'MAIN' }
        });

        const category = await prisma.category.upsert({
            where: { slug: 'pasta-test' },
            update: { name: 'Pasta & Grains Test', brandId: brand.id },
            create: { name: 'Pasta & Grains Test', slug: 'pasta-test', brandId: brand.id }
        });

        // 2. Create Product with bilingual fields and options
        const product = await prisma.product.create({
            data: {
                name: 'De Cecco Penne Rigate No.41',
                nameAr: 'دي سيكو معكرونة بيني ريغاتي رقم 41',
                nameEn: 'De Cecco Penne Rigate No.41',
                descriptionAr: 'معكرونة إيطالية فاخرة مصنوعة من قمح القاسي 100%',
                descriptionEn: 'Premium Italian pasta made from 100% durum wheat semolina',
                price: 4.50,
                discountPrice: 3.99,
                stock: 120,
                slug: 'de-cecco-penne-rigate-test-' + Date.now(),
                images: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?w=600',
                options: '500g, 1kg, 5kg',
                isTrending: true,
                brandId: brand.id,
                categoryId: category.id,
            }
        });
        createdProductId = product.id;
        console.log(`[PASS] Created test product with options: ${product.nameAr} (${product.options})`);

        // 3. Create an Order with selected option variant
        const order = await prisma.order.create({
            data: {
                Name: 'Hawa Test Customer',
                phone: '0987654321',
                streetAddress: 'Mezzeh Highway',
                city: 'Damascus',
                totalAmount: 7.98,
                status: 'PENDING',
                items: {
                    create: [
                        {
                            productId: product.id,
                            quantity: 2,
                            price: 3.99,
                            options: '1kg'
                        }
                    ]
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        createdOrderId = order.id;
        console.log(`[PASS] Created order #${order.id} with OrderItem option: ${order.items[0].options}`);

        // 4. Validate DB Query
        const fetchedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { product: true } } }
        });

        if (!fetchedOrder) throw new Error("Order not found in database");
        if (fetchedOrder.items.length !== 1) throw new Error("Expected 1 order item");
        if (fetchedOrder.items[0].options !== '1kg') throw new Error(`Expected option '1kg', got '${fetchedOrder.items[0].options}'`);
        if (fetchedOrder.items[0].product.nameAr !== 'دي سيكو معكرونة بيني ريغاتي رقم 41') {
            throw new Error(`Bilingual nameAr mismatch: ${fetchedOrder.items[0].product.nameAr}`);
        }

        console.log("[PASS] Successfully validated OrderItem options persistence & bilingual relation lookup!");
        console.log("=== ALL PHASE 3 LIVE DB CHECKS PASSED (100%) ===");
    } catch (error) {
        console.error("[FAIL] Phase 3 verification error:", error);
        process.exit(1);
    } finally {
        // Clean up test records
        if (createdOrderId) {
            await prisma.order.delete({ where: { id: createdOrderId } }).catch(() => {});
        }
        if (createdProductId) {
            await prisma.product.delete({ where: { id: createdProductId } }).catch(() => {});
        }
        await prisma.$disconnect();
    }
}

runPhase3Verification();
