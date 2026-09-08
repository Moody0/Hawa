const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const trending = await prisma.product.findMany({
        where: { isTrending: true },
        select: { id: true, name: true, images: true, brand: { select: { name: true } } }
    });
    console.log(trending);
}

main().catch(console.error).finally(() => prisma.$disconnect());
