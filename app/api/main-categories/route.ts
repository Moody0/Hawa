import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET() {
    try {
        const mainCategories = await prisma.mainCategory.findMany({
            where: { isActive: true },
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
                _count: {
                    select: {
                        products: {
                            where: {
                                stock: { gt: 0 },
                                brand: { isActive: true },
                            },
                        },
                    },
                },
            },
        });

        const formatted = mainCategories.map((mc) => ({
            id: mc.id,
            name: mc.name,
            nameEn: mc.description || mc.name,
            slug: mc.slug,
            description: mc.description,
            image: mc.image,
            _count: mc._count,
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

