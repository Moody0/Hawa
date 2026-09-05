import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getCachedProductCount = (where: Prisma.ProductWhereInput, key: string) =>
    unstable_cache(
        async () => prisma.product.count({ where }),
        [`product-count-v3-${key}`],
        { tags: ["catalog", "products"], revalidate: 60 }
    )();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const requestedLimit = parseInt(searchParams.get("limit") || "12");
        const limit = Math.max(1, Math.min(requestedLimit || 12, 12)); // default/cap at 12
        const sort = searchParams.get("sort");
        const categoryIdsParam = searchParams.get("categoryIds");
        const brandIdsParam = searchParams.get("brandIds");
        const mainCategoryIdParam = searchParams.get("mainCategoryId");
        const search = searchParams.get("search");
        const inStockParam = searchParams.get("inStock");
        const onSaleParam = searchParams.get("onSale");
        const isTrendingParam = searchParams.get("isTrending");
        const skipCount = searchParams.get("skipCount") === "true";
        const knownTotalParam = searchParams.get("knownTotal");
        const knownTotal = knownTotalParam !== null ? parseInt(knownTotalParam) : undefined;

        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {
            brand: {
                isActive: true,
            },
        };

        const andConditions: Prisma.ProductWhereInput[] = [];

        if (inStockParam === "true") {
            where.stock = { gt: 0 };
        }

        if (onSaleParam === "true") {
            where.discountPrice = { not: null };
        }

        if (isTrendingParam === "true") {
            where.isTrending = true;
        }

        if (categoryIdsParam) {
            const ids = categoryIdsParam.split(",").filter(Boolean);
            if (ids.length > 0) {
                andConditions.push({
                    OR: [
                        { categoryId: { in: ids } },
                        { mainCategoryId: { in: ids } },
                        { category: { mainCategoryId: { in: ids } } },
                    ],
                });
            }
        }

        if (brandIdsParam) {
            const ids = brandIdsParam.split(",").filter(Boolean);
            if (ids.length > 0) {
                where.brandId = { in: ids };
            }
        }

        if (mainCategoryIdParam) {
            andConditions.push({
                OR: [
                    { mainCategoryId: mainCategoryIdParam },
                    { category: { mainCategoryId: mainCategoryIdParam } },
                ],
            });
        }

        if (search) {
            andConditions.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { nameAr: { contains: search, mode: "insensitive" } },
                    { nameEn: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { descriptionAr: { contains: search, mode: "insensitive" } },
                    { descriptionEn: { contains: search, mode: "insensitive" } },
                    { brand: { name: { contains: search, mode: "insensitive" } } },
                ],
            });
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
        if (sort === "price_asc") {
            orderBy = { price: "asc" };
        } else if (sort === "price_desc") {
            orderBy = { price: "desc" };
        } else if (sort === "newest") {
            orderBy = { createdAt: "desc" };
        }

        const countKey = `${categoryIdsParam || 'all'}_${brandIdsParam || 'all'}_${mainCategoryIdParam || 'all'}_${search || 'none'}_${inStockParam || 'all'}_${onSaleParam || 'all'}_${isTrendingParam || 'all'}`;

        const totalPromise = (skipCount || (page > 1 && knownTotal !== undefined))
            ? Promise.resolve(knownTotal ?? 0)
            : getCachedProductCount(where, countKey);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    nameEn: true,
                    description: true,
                    descriptionAr: true,
                    descriptionEn: true,
                    slug: true,
                    images: true,
                    price: true,
                    discountPrice: true,
                    discountType: true,
                    discountValue: true,
                    stock: true,
                    options: true,
                    isTrending: true,
                    packaging: true,
                    itemsPerPackage: true,
                    minOrder: true,
                    brandId: true,
                    categoryId: true,
                    mainCategoryId: true,
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            group: true,
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }),
            totalPromise,
        ]);

        const response = NextResponse.json({
            products: products.map(p => ({
                ...p,
                price: p.price.toString(),
                discountPrice: p.discountPrice ? p.discountPrice.toString() : null,
                discountType: p.discountType,
                discountValue: p.discountValue ? p.discountValue.toString() : null,
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
        
        // Add public edge cache headers: 60s fresh at CDN, up to 600s stale while revalidating
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
        return response;
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
