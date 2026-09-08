const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mainCategories = await prisma.mainCategory.findMany({
        include: { _count: { select: { categories: true, products: true, brands: true } } }
    });
    console.log('--- Current Main Categories ---');
    console.dir(mainCategories, { depth: null });

    const brands = await prisma.brand.findMany({
        include: { _count: { select: { products: true, categories: true } } }
    });
    console.log('--- Current Brands ---');
    console.dir(brands.map(b => ({ id: b.id, name: b.name, slug: b.slug, image: b.image, productsCount: b._count.products })), { depth: null });

    const categories = await prisma.category.findMany({
        include: { _count: { select: { products: true } } }
    });
    console.log('--- Current Categories ---');
    console.dir(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, mainCatId: c.mainCategoryId, productsCount: c._count.products })), { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
