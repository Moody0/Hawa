import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getMainCategoryProductCounts(
    mainCategoryIds: string[],
    onlyAvailableProducts = false,
): Promise<Map<string, number>> {
    const counts = await Promise.all(mainCategoryIds.map(async (mainCategoryId) => {
        const where: Prisma.ProductWhereInput = {
            archivedAt: null,
            ...(onlyAvailableProducts
                ? {
                    stock: { gt: 0 },
                    brand: { isActive: true, archivedAt: null },
                    category: { isActive: true, archivedAt: null },
                }
                : {}),
            OR: [
                { mainCategoryId },
                { category: { mainCategoryId } },
                { brand: { mainCategoryId } },
            ],
        };

        return [mainCategoryId, await prisma.product.count({ where })] as const;
    }));

    return new Map(counts);
}
