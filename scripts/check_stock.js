const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productsWithStock = await prisma.product.count({ where: { stock: { gt: 0 } } });
    const isTrendingCount = await prisma.product.count({ where: { isTrending: true } });
    const isTrendingWithStock = await prisma.product.count({ where: { isTrending: true, stock: { gt: 0 } } });
    const brandCount = await prisma.brand.count();
    console.log({ productsWithStock, isTrendingCount, isTrendingWithStock, brandCount });
}

main().catch(console.error).finally(() => prisma.$disconnect());
