import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMainCategoryProductCounts } from "@/lib/main-category-product-counts";

export const revalidate = 3600;

export async function GET() {
    try {
        const mainCategories = await prisma.mainCategory.findMany({
            where: { isActive: true, archivedAt: null },
            orderBy: [
                { navOrder: "asc" },
                { name: "asc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
            },
        });

        const productCounts = await getMainCategoryProductCounts(
            mainCategories.map((mainCategory) => mainCategory.id),
            true,
        );

        const formatted = mainCategories.map((mc) => ({
            id: mc.id,
            name: mc.name,
            nameEn: mc.description || mc.name,
            slug: mc.slug,
            description: mc.description,
            image: mc.image,
            _count: { products: productCounts.get(mc.id) ?? 0 },
        }));

        const response = NextResponse.json(formatted);
        response.headers.set(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400"
        );
        return response;
    } catch (error) {
        console.error("Error fetching main categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch main categories" },
            { status: 500 }
        );
    }
}
