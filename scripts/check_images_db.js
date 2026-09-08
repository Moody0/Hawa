const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'سمنة' } },
                { name: { contains: 'زيت' } },
                { name: { contains: 'لانشون' } },
                { name: { contains: 'صابون' } }
            ]
        },
        take: 10,
        select: { id: true, name: true, images: true }
    });
    console.log(products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
