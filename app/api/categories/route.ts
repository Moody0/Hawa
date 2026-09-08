import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get("limit");
        const brandId = searchParams.get("brandId");
        const brandIdsParam = searchParams.get("brandIds");
        const mainCategoryId = searchParams.get("mainCategoryId");
        const mainCategoryIdsParam = searchParams.get("mainCategoryIds");

        const take = limitParam ? parseInt(limitParam) : undefined;

        const where: Prisma.CategoryWhereInput = {
            archivedAt: null,
            brand: { isActive: true, archivedAt: null },
        };

        if (brandIdsParam) {
            const ids = brandIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
            if (ids.length > 0) {
                where.brandId = { in: ids };
            }
        } else if (brandId) {
            where.brandId = brandId;
        }

        if (mainCategoryIdsParam) {
            const ids = mainCategoryIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
            if (ids.length > 0) {
                where.mainCategoryId = { in: ids };
            }
        } else if (mainCategoryId) {
            where.mainCategoryId = mainCategoryId;
        }

        const categories = await prisma.category.findMany({
            ...(take && { take }),
            where,
            orderBy: [
                { isFeatured: "desc" },
                { name: "asc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                brandId: true,
                mainCategoryId: true,
                _count: {
                    select: {
                        products: {
                            where: {
                                stock: { gt: 0 },
                                archivedAt: null,
                                brand: { isActive: true, archivedAt: null },
                            },
                        },
                    },
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        group: true,
                    },
                },
            },
        });

        const response = NextResponse.json(categories);
        response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        return response;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
