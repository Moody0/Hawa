import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canViewWholesalePrices, projectProductsPrices } from "@/lib/price-visibility";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
    try {
        const trendingProducts = await prisma.product.findMany({
            where: { isTrending: true, archivedAt: null, brand: { isActive: true, archivedAt: null } },
            include: {
                category: true,
            },
        });

        const canViewPrices = await canViewWholesalePrices();
        const projected = projectProductsPrices(trendingProducts, canViewPrices);
        const response = NextResponse.json(projected.map(p => ({
            ...p,
            price: p.price == null ? null : p.price.toString(),
            discountPrice: p.discountPrice == null ? null : p.discountPrice.toString(),
            discountType: p.discountType,
            discountValue: p.discountValue == null ? null : p.discountValue.toString()
        })));
        response.headers.set(
            "Cache-Control",
            canViewPrices ? "private, no-store" : "public, s-maxage=3600, stale-while-revalidate=86400"
        );
        return response;
    } catch (error) {
        console.error("Error fetching trending products:", error);
        return NextResponse.json(
            { error: "Failed to fetch trending products" },
            { status: 500 }
        );
    }
}
