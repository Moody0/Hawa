const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sampleProducts = await prisma.product.findMany({
        take: 10,
        select: { id: true, name: true, images: true, brand: { select: { name: true } } }
    });
    console.log('Sample DB Products:');
    console.dir(sampleProducts, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
