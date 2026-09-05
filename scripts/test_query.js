const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mainCats = await prisma.mainCategory.findMany();
    console.log("Main categories:", JSON.stringify(mainCats, null, 2));

    const trending = await prisma.product.findMany({
        where: { isTrending: true }
    });
    console.log("Trending count in DB:", trending.length);

    const pricedGtZero = await prisma.product.count({ where: { price: { gt: 0 } } });
    const pricedZero = await prisma.product.count({ where: { price: 0 } });
    console.log("Products with price > 0:", pricedGtZero);
    console.log("Products with price = 0:", pricedZero);
}

main().finally(() => prisma.$disconnect());
