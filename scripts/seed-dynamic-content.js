const { PrismaClient, ReviewStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDynamicContent() {
    console.log("=== SEEDING DYNAMIC DATABASE CONTENT ===");

    // 1. Update Main Categories with real product images if image is missing
    const mainCats = await prisma.mainCategory.findMany({
        include: { products: { take: 1, select: { images: true } } }
    });

    for (const mc of mainCats) {
        const prodImg = mc.products[0]?.images ? mc.products[0].images.split(',')[0].trim() : null;
        if (!mc.image && prodImg && prodImg !== '/placeholder.svg') {
            await prisma.mainCategory.update({
                where: { id: mc.id },
                data: { image: prodImg }
            });
            console.log(`[UPDATED] MainCategory "${mc.name}" image set to: ${prodImg.substring(0, 40)}...`);
        }
    }

    // 2. Mark top 12 categories with products as isFeatured
    const topCategories = await prisma.category.findMany({
        where: { products: { some: {} } },
        take: 12,
        include: { products: { take: 1, select: { images: true } } }
    });

    for (const cat of topCategories) {
        const prodImg = cat.products[0]?.images ? cat.products[0].images.split(',')[0].trim() : null;
        await prisma.category.update({
            where: { id: cat.id },
            data: {
                isFeatured: true,
                image: cat.image || prodImg || '/placeholder.svg'
            }
        });
        console.log(`[FEATURED] Category "${cat.name}" marked as featured`);
    }

    // 3. Seed Banners in Database
    const existingBanners = await prisma.banner.count();
    if (existingBanners === 0) {
        await prisma.banner.createMany({
            data: [
                {
                    title: 'Wholesale Global Food Brands',
                    titleAr: 'توزيع بضائع من كبرى الشركات العالمية',
                    subtitle: 'Your trusted partner for top-tier international food distribution with reliable logistics.',
                    subtitleAr: 'شريككم المعتمد لأجود المنتجات والمواد الغذائية مع أسرع خدمات الشحن والتوزيع.',
                    image: 'https://i.postimg.cc/fR4nH169/images-2026-08-17T103915-290.jpg',
                    buttonText: 'تصفح المنتجات',
                    link: '/products',
                    badge: 'توزيع جملة معتمد',
                    isActive: true,
                },
                {
                    title: 'Authentic Pasta, Sauces & Canned Goods',
                    titleAr: 'أجود أنواع المعكرونة والصلصات والمعلبات الإيطالية',
                    subtitle: 'Direct from certified international suppliers with bulk wholesale discounts.',
                    subtitleAr: 'مستوردة وموزعة مباشرة من المصانع العالمية مع أفضل خصومات الجملة.',
                    image: 'https://i.postimg.cc/tg0PpNVy/images-2026-08-17T184324-360.jpg',
                    buttonText: 'تسوق الآن',
                    link: '/products?category=pasta-grains',
                    badge: 'منتجات أصلية 100%',
                    isActive: true,
                },
                {
                    title: 'Captain Fisher & Americana Frozen Foods',
                    titleAr: 'مفرزات كابتن فيشر ولحوم أمريكانا الفاخرة',
                    subtitle: 'Temperature-controlled storage ensuring maximum freshness and peak quality.',
                    subtitleAr: 'تخزين مبرد وفق أعلى معايير السلامة يضمن بقاء المنتجات في أفضل جودة.',
                    image: 'https://i.postimg.cc/85zP3G4K/images-2026-08-17T194212-321.jpg',
                    buttonText: 'استكشف المفرزات',
                    link: '/products?category=frozen-foods',
                    badge: 'جودة مضمونة',
                    isActive: true,
                }
            ]
        });
        console.log("[PASS] 3 wholesale banners created in Database.");
    }

    // 4. Seed Reviews in Database linked to actual products
    const existingReviews = await prisma.review.count();
    if (existingReviews === 0) {
        const sampleProducts = await prisma.product.findMany({ take: 6 });
        const reviewData = [
            {
                name: 'سامر خ. (سوبرماركت النور) - Samer K.',
                feedback: 'تعاملنا مع شركة حوا للتوزيع كان نقطة تحول في توفير معكرونة دي سيكو وتونة ريو ماري الإيطالية الأصلية. التوصيل دائماً بالموعد والأسعار منافسة جداً.',
                rating: 5,
                isApproved: true,
                productId: sampleProducts[0]?.id || '',
            },
            {
                name: 'ياسين ش. (مطعم ومقهى ديلايت) - Yaseen S.',
                feedback: 'منتجات صصوصات أميركان غاردن وقهوة علي كافيه من حوا للتوزيع دايماً متوفرة وبجودة التخزين الممتازة. بضاعة مضمونة ومعاملة راقية.',
                rating: 5,
                isApproved: true,
                productId: sampleProducts[1]?.id || '',
            },
            {
                name: 'عمر م. (مركز التوزيع الحديث) - Omar M.',
                feedback: 'مفرزات كابتن فيشر وأسماك التونة بجودة عالية جداً وتجميد ممتاز. شركة حوا للتوزيع من أفضل موردي الجملة المعتمدين لدينا.',
                rating: 5,
                isApproved: true,
                productId: sampleProducts[2]?.id || '',
            },
            {
                name: 'طارق ط. (ميني ماركت البركة) - Tarek T.',
                feedback: 'حليب وألبان ندى بالإضافة إلى بسكويت مستر براوني من أكثر المنتجات طلباً، وحوا للتوزيع تؤمن الطلبات بالكميات المطلوبة بدون أي تأخير.',
                rating: 5,
                isApproved: true,
                productId: sampleProducts[3]?.id || '',
            },
            {
                name: 'فادي أ. (فندق قصر الشام) - Fadi A.',
                feedback: 'نعتمد على حوا للتوزيع لتزويد مطابخنا بمنتجات تات وصلصات ومعكرونة أوتيما الإيطالية. المواصفات مطابقة لأعلى المعايير العالمية.',
                rating: 5,
                isApproved: true,
                productId: sampleProducts[4]?.id || '',
            },
            {
                name: 'مروان ب. (مستودعات النجمة) - Marwan B.',
                feedback: 'تنوع الماركات العالمية مثل سانينو دورو وهايجين تحت سقف واحد مع حوا للتوزيع وفر علينا الكثير من وقت البحث والتوريد.',
                rating: 5,
                isApproved: true,
                productId: sampleProducts[5]?.id || '',
            }
        ];

        for (const r of reviewData) {
            if (r.productId) {
                await prisma.review.create({ data: r });
            }
        }
        console.log("[PASS] 6 approved wholesale reviews created in Database.");
    }

    console.log("=== DYNAMIC CONTENT SEEDING COMPLETE ===");
}

seedDynamicContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
