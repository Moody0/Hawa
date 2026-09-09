const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDataQuality() {
    console.log("=== FIXING DATA QUALITY & LOCALIZATION ===");

    // 1. Delete/deactivate empty e2e category
    await prisma.mainCategory.deleteMany({
        where: { slug: 'food-and-grocery-e2e' }
    });
    console.log("[FIXED] Removed food-and-grocery-e2e.");

    // 2. Set descriptions (English names) for all Main Categories
    const translations = {
        'pasta-and-foodstuffs': 'Pasta & Foodstuffs',
        'pasta-grains': 'Pasta & Grains',
        'beverages': 'Beverages & Coffee',
        'cold-cuts': 'Cold Cuts & Meats',
        'sauces-condiments': 'Sauces & Condiments',
        'snacks-sweets': 'Snacks & Sweets',
        'frozen-foods': 'Frozen Foods & Seafood',
        'canned-goods': 'Canned Goods & Tuna',
        'baby-care': 'Baby Care',
        'personal-care-hygiene': 'Personal Care & Hygiene',
        'dairy-milk': 'Dairy & Plant Milk',
        'dairy-cooking': 'Dairy & Cooking',
        'healthy-diet': 'Healthy & Diet Foods',
        'breakfast-cereals': 'Breakfast & Cereals',
        'breakfast-food': 'Breakfast Foods',
        'sports-nutrition': 'Sports Nutrition & Protein',
        'healthy-snacks': 'Healthy Snacks & Bars',
        'beverages-plant-milk': 'Plant-Based Milk & Drinks'
    };

    for (const [slug, enName] of Object.entries(translations)) {
        await prisma.mainCategory.updateMany({
            where: { slug },
            data: { description: enName }
        });
    }
    console.log("[FIXED] Main category English translations populated.");

    // 3. Reset and select 12 stunning featured categories that have real photos
    await prisma.category.updateMany({
        data: { isFeatured: false }
    });

    const candidates = await prisma.category.findMany({
        where: {
            image: { not: null, not: '/placeholder.svg' },
            products: {
                some: {
                    images: { not: '/placeholder.svg' },
                    price: { gt: 0 }
                }
            }
        },
        take: 12,
        include: { products: { take: 1 } }
    });

    for (const c of candidates) {
        await prisma.category.update({
            where: { id: c.id },
            data: { isFeatured: true }
        });
        console.log(`[FEATURED] "${c.name}" (${c.image?.substring(0, 40)}...)`);
    }

    // 4. Update the 6 reviews to link to 6 distinct products across categories
    const products = await prisma.product.findMany({
        where: {
            images: { not: '/placeholder.svg' },
            price: { gt: 0 }
        },
        take: 10
    });

    // Find distinct products for each review
    const deCecco = products.find(p => p.name.toLowerCase().includes('de cecco')) || products[0];
    const amGarden = products.find(p => p.name.toLowerCase().includes('american garden') || p.name.toLowerCase().includes('peanut')) || products[1];
    const fish = products.find(p => p.name.toLowerCase().includes('crab') || p.name.toLowerCase().includes('captain') || p.name.toLowerCase().includes('burger')) || products[2];
    const brownie = products.find(p => p.name.toLowerCase().includes('brownie') || p.name.toLowerCase().includes('cake')) || products[3];
    const tat = products.find(p => p.name.toLowerCase().includes('tat') || p.name.toLowerCase().includes('mustard') || p.name.toLowerCase().includes('sauce')) || products[4];
    const alicafe = products.find(p => p.name.toLowerCase().includes('alicafe') || p.name.toLowerCase().includes('coffee')) || products[5];

    await prisma.review.deleteMany({});
    
    const reviewSeeds = [
        {
            name: 'سامر خ. (سوبرماركت النور) - Samer K.',
            feedback: 'تعاملنا مع شركة حوا للتوزيع كان نقطة تحول في توفير معكرونة دي سيكو الإيطالية الأصلية. التوصيل دائماً بالموعد والأسعار منافسة جداً.',
            rating: 5,
            isApproved: true,
            productId: deCecco?.id || products[0]?.id
        },
        {
            name: 'ياسين ش. (مطعم ومقهى ديلايت) - Yaseen S.',
            feedback: 'منتجات صوصات وتتبيلات أميركان غاردن من حوا للتوزيع دايماً متوفرة وبجودة تخزين ممتازة. بضاعة مضمونة ومعاملة راقية.',
            rating: 5,
            isApproved: true,
            productId: amGarden?.id || products[1]?.id
        },
        {
            name: 'عمر م. (مركز التوزيع الحديث) - Omar M.',
            feedback: 'مفرزات كابتن فيشر وأسماك التونة بجودة عالية جداً وتجميد ممتاز. شركة حوا للتوزيع من أفضل موردي الجملة المعتمدين لدينا.',
            rating: 5,
            isApproved: true,
            productId: fish?.id || products[2]?.id
        },
        {
            name: 'طارق ط. (ميني ماركت البركة) - Tarek T.',
            feedback: 'بسكويت وكيك مستر براوني من أكثر المنتجات طلباً، وحوا للتوزيع تؤمن الطلبات بالكميات المطلوبة بدون أي تأخير.',
            rating: 5,
            isApproved: true,
            productId: brownie?.id || products[3]?.id
        },
        {
            name: 'فادي أ. (فندق قصر الشام) - Fadi A.',
            feedback: 'نعتمد على حوا للتوزيع لتزويد مطابخنا بمنتجات تات وصلصات ومعكرونة أوتيما الإيطالية. المواصفات مطابقة لأعلى المعايير العالمية.',
            rating: 5,
            isApproved: true,
            productId: tat?.id || products[4]?.id
        },
        {
            name: 'مروان ب. (مستودعات النجمة) - Marwan B.',
            feedback: 'تنوع الماركات العالمية مثل قهوة علي كافيه وسانينو دورو تحت سقف واحد مع حوا للتوزيع وفر علينا الكثير من وقت التوريد.',
            rating: 5,
            isApproved: true,
            productId: alicafe?.id || products[5]?.id
        }
    ];

    for (const r of reviewSeeds) {
        if (r.productId) {
            await prisma.review.create({ data: r });
        }
    }
    console.log("[FIXED] 6 distinct reviews created with unique products.");

    console.log("=== DATA QUALITY FIXES COMPLETE ===");
}

fixDataQuality()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
