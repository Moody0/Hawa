const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- BANNERS ---");
    const banners = await prisma.banner.findMany();
    console.log("Count:", banners.length);
    banners.forEach(b => console.log(`[Banner] id=${b.id} title="${b.title}" subtitle="${b.subtitle}" image="${b.image}" isActive=${b.isActive}`));

    console.log("\n--- MAIN CATEGORIES ---");
    const mainCats = await prisma.mainCategory.findMany();
    console.log("Count:", mainCats.length);
    mainCats.forEach(mc => console.log(`[MainCat] id=${mc.id} name="${mc.name}" slug="${mc.slug}" image="${mc.image}" isActive=${mc.isActive}`));

    console.log("\n--- FEATURED CATEGORIES ---");
    const featuredCats = await prisma.category.findMany({
        where: { isFeatured: true }
    });
    console.log("Count:", featuredCats.length);
    featuredCats.forEach(c => console.log(`[Category] id=${c.id} name="${c.name}" slug="${c.slug}" image="${c.image}" isFeatured=${c.isFeatured}`));

    console.log("\n--- SAMPLE PRODUCTS ---");
    const prods = await prisma.product.findMany({
        take: 10,
        select: { id: true, name: true, nameAr: true, images: true, isTrending: true }
    });
    prods.forEach(p => console.log(`[Product] id=${p.id} name="${p.name}" nameAr="${p.nameAr}" isTrending=${p.isTrending} images="${p.images?.slice(0, 50)}"`));

    console.log("\n--- SEARCH 'زيت دوار الشمس' ---");
    const oilProds = await prisma.product.findMany({
        where: { name: { contains: 'زيت دوار الشمس' } },
        select: { id: true, name: true, images: true }
    });
    oilProds.forEach(p => console.log(`[OilProd] name="${p.name}" images="${p.images}"`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
