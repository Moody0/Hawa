const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: { id: true, name: true, price: true, stock: true, brand: { select: { name: true, isActive: true, archivedAt: true } } }
    });
    console.log(products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
