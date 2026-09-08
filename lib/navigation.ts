import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface NavBrand {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
}

export interface NavCategory {
    id: string;
    name: string;
    slug: string;
}

export interface NavTopProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    slug: string;
}

export interface NavTrendingProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    slug: string;
    images: string;
    price: number | null;
    discountPrice: number | null;
    brand?: { name: string } | null;
}

export interface NavMainCategory {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
    image?: string | null;
    brands: NavBrand[];
    categories: NavCategory[];
    topProducts: NavTopProduct[];
    trendingProducts: NavTrendingProduct[];
}

async function fetchNavigationData(): Promise<NavMainCategory[]> {
    try {
        const mainCategories = await prisma.mainCategory.findMany({
            where: { isActive: true, showInNav: true, archivedAt: null },
            orderBy: { navOrder: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                brands: {
                    where: { isActive: true, archivedAt: null },
                    orderBy: { name: "asc" },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                    },
                },
                categories: {
                    where: { archivedAt: null, brand: { archivedAt: null, isActive: true } },
                    orderBy: { name: "asc" },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                image: true,
                                isActive: true,
                            },
                        },
                    },
                    take: 30,
                },
                products: {
                    where: { archivedAt: null, brand: { archivedAt: null, isActive: true }, category: { archivedAt: null } },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        nameAr: true,
                        nameEn: true,
                        slug: true,
                        images: true,
                        isTrending: true,
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                image: true,
                                isActive: true,
                            },
                        },
                    },
                    take: 40,
                },
            },
        });

        return mainCategories.map((mc) => {
            const brandMap = new Map<string, NavBrand>();

            // 1. Direct brands (assigned to this MainCategory)
            for (const b of mc.brands) {
                brandMap.set(b.id, b);
            }

            // 2. Brands linked through categories in this MainCategory
            for (const cat of mc.categories) {
                if (cat.brand && cat.brand.isActive && !brandMap.has(cat.brand.id)) {
                    brandMap.set(cat.brand.id, {
                        id: cat.brand.id,
                        name: cat.brand.name,
                        slug: cat.brand.slug,
                        image: cat.brand.image,
                    });
                }
            }

            // 3. Brands linked through products in this MainCategory
            for (const prod of mc.products) {
                if (prod.brand && prod.brand.isActive && !brandMap.has(prod.brand.id)) {
                    brandMap.set(prod.brand.id, {
                        id: prod.brand.id,
                        name: prod.brand.name,
                        slug: prod.brand.slug,
                        image: prod.brand.image,
                    });
                }
            }

            const aggregatedBrands = Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));

            // Separate trending products (max 3) from top products
            const formatProduct = (p: typeof mc.products[0]) => ({
                id: p.id,
                name: p.name,
                nameAr: p.nameAr || null,
                nameEn: p.nameEn || null,
                slug: p.slug,
                images: p.images,
                price: null,
                discountPrice: null,
                brand: p.brand ? { name: p.brand.name } : null,
            });

            const trendingProducts = mc.products
                .filter((p) => p.isTrending)
                .slice(0, 3)
                .map(formatProduct);

            // If we don't have 3 trending, fill with latest products
            const topProducts = mc.products
                .filter((p) => !trendingProducts.some((tp) => tp.id === p.id))
                .slice(0, 8)
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    nameAr: p.nameAr,
                    nameEn: p.nameEn,
                    slug: p.slug,
                }));

            if (trendingProducts.length < 3) {
                const remaining = mc.products
                    .filter((p) => !trendingProducts.some((tp) => tp.id === p.id))
                    .slice(0, 3 - trendingProducts.length)
                    .map(formatProduct);
                trendingProducts.push(...remaining);
            }

            return {
                id: mc.id,
                name: mc.name,
                nameEn: mc.description || mc.name,
                slug: mc.slug,
                image: mc.image,
                brands: aggregatedBrands,
                categories: mc.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
                topProducts,
                trendingProducts: trendingProducts.slice(0, 3),
            };
        });
    } catch (error) {
        console.error("Error in getNavigationData:", error);
        return [];
    }
}

export const getNavigationData = unstable_cache(
    fetchNavigationData,
    ["navigation-data"],
    { tags: ["navigation"], revalidate: 3600 }
);
