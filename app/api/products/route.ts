import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { buildSearchWhereConditions } from "@/lib/search-utils";
import { canViewWholesalePrices, projectProductsPrices } from "@/lib/price-visibility";
import { recordApiLatency } from "@/lib/monitoring";

import { getCachedProducts, setCachedProducts } from "@/lib/products-cache";

export const dynamic = "force-dynamic";

const getCachedProductCount = (where: Prisma.ProductWhereInput, key: string) =>
    unstable_cache(
        async () => prisma.product.count({ where }),
        [`product-count-v3-${key}`],
        { tags: ["catalog", "products"], revalidate: 60 }
    )();

export async function GET(request: Request) {
    const startTime = Date.now();
    try {
        const { searchParams } = new URL(request.url);

        const validationErrors: Array<{ field: string; message: string }> = [];

        // 1. Page parameter validation
        let page = 1;
        const rawPage = searchParams.get("page");
        if (rawPage !== null) {
            const parsedPage = Number(rawPage);
            if (!Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > 1000) {
                validationErrors.push({
                    field: "page",
                    message: "Page must be an integer between 1 and 1000",
                });
            } else {
                page = parsedPage;
            }
        }

        // 2. Limit parameter validation
        let limit = 36;
        const rawLimit = searchParams.get("limit");
        if (rawLimit !== null) {
            const parsedLimit = Number(rawLimit);
            if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
                validationErrors.push({
                    field: "limit",
                    message: "Limit must be an integer between 1 and 50",
                });
            } else {
                limit = parsedLimit;
            }
        }

        // 3. Search parameter validation
        const rawSearch = searchParams.get("search");
        let search = "";
        if (rawSearch !== null) {
            if (rawSearch.length > 100) {
                validationErrors.push({
                    field: "search",
                    message: "Search query must not exceed 100 characters",
                });
            } else {
                search = rawSearch.trim();
            }
        }

        // 4. Category IDs parameter validation & canonicalization
        const categoryIdsParam = searchParams.get("categoryIds");
        let categoryIds: string[] = [];
        if (categoryIdsParam) {
            const splitCatIds = categoryIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
            if (splitCatIds.length > 50) {
                validationErrors.push({
                    field: "categoryIds",
                    message: "Category IDs list must not exceed 50 items",
                });
            } else {
                categoryIds = Array.from(new Set(splitCatIds)).sort();
            }
        }

        // 5. Brand IDs parameter validation & canonicalization
        const brandIdsParam = searchParams.get("brandIds");
        let brandIds: string[] = [];
        if (brandIdsParam) {
            const splitBrandIds = brandIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
            if (splitBrandIds.length > 50) {
                validationErrors.push({
                    field: "brandIds",
                    message: "Brand IDs list must not exceed 50 items",
                });
            } else {
                brandIds = Array.from(new Set(splitBrandIds)).sort();
            }
        }

        // 6. Sort parameter validation
        const sort = searchParams.get("sort");
        if (sort && !["best_sellers", "price_asc", "price_desc", "newest"].includes(sort)) {
            validationErrors.push({
                field: "sort",
                message: "Sort must be one of: best_sellers, price_asc, price_desc, newest",
            });
        }

        if (validationErrors.length > 0) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    code: "VALIDATION_ERROR",
                    details: validationErrors,
                },
                { status: 400 }
            );
        }

        const canViewPrices = await canViewWholesalePrices();

        const mainCategoryIdParam = searchParams.get("mainCategoryId");
        const inStockParam = searchParams.get("inStock");
        const onSaleParam = searchParams.get("onSale");
        const isTrendingParam = searchParams.get("isTrending");

        const canonicalCatKey = categoryIds.length > 0 ? categoryIds.join(",") : "all";
        const canonicalBrandKey = brandIds.length > 0 ? brandIds.join(",") : "all";
        const canonicalSearchKey = search ? encodeURIComponent(search) : "none";
        const countKey = `${canonicalCatKey}_${canonicalBrandKey}_${mainCategoryIdParam || 'all'}_${canonicalSearchKey}_${inStockParam || 'all'}_${onSaleParam || 'all'}_${isTrendingParam || 'all'}`;
        const memCacheKey = `${countKey}_p${page}_l${limit}_s${sort || 'default'}`;

        // Fast memory cache return for public guest traffic
        if (!canViewPrices) {
            const cached = getCachedProducts(memCacheKey);
            if (cached) {
                const response = NextResponse.json({
                    products: cached.products,
                    pagination: {
                        total: cached.total,
                        pages: Math.ceil(cached.total / limit),
                        page,
                        limit,
                    },
                });
                response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
                recordApiLatency({
                    endpoint: '/api/products',
                    method: 'GET',
                    status: 200,
                    durationMs: Date.now() - startTime,
                    authClass: 'guest',
                });
                return response;
            }
        }

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

        if (categoryIds.length > 0) {
            andConditions.push({
                OR: [
                    { categoryId: { in: categoryIds } },
                    { mainCategoryId: { in: categoryIds } },
                    { category: { mainCategoryId: { in: categoryIds } } },
                ],
            });
        }

        if (brandIds.length > 0) {
            where.brandId = { in: brandIds };
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
            const searchConditions = buildSearchWhereConditions(search);
            if (searchConditions.length > 0) {
                andConditions.push({
                    OR: searchConditions,
                });
            }
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

        const totalPromise = getCachedProductCount(where, countKey);

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

        const projectedProducts = projectProductsPrices(products, canViewPrices);

        const formattedProducts = projectedProducts.map(p => ({
            ...p,
            price: p.price !== null && p.price !== undefined ? p.price.toString() : null,
            discountPrice: p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice.toString() : null,
            discountType: p.discountType,
            discountValue: p.discountValue !== null && p.discountValue !== undefined ? p.discountValue.toString() : null,
        }));

        // Populate memory cache for public guest traffic
        if (!canViewPrices) {
            setCachedProducts(memCacheKey, {
                products: formattedProducts,
                total,
            });
        }

        const response = NextResponse.json({
            products: formattedProducts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
        
        // Prevent merchant-priced responses from entering shared public caches
        if (canViewPrices) {
            response.headers.set('Cache-Control', 'private, no-store');
        } else {
            response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
        }

        recordApiLatency({
            endpoint: '/api/products',
            method: 'GET',
            status: 200,
            durationMs: Date.now() - startTime,
            authClass: canViewPrices ? 'merchant' : 'guest',
        });

        return response;
    } catch (error) {
        console.error("Error fetching products:", error);
        recordApiLatency({
            endpoint: '/api/products',
            method: 'GET',
            status: 500,
            durationMs: Date.now() - startTime,
        });
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
