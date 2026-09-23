import { prisma } from "./prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getMainCategoryProductCounts } from "./main-category-product-counts";

export interface CatalogCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    brandId: string;
    brand?: CatalogBrand | null;
}

export interface CatalogProduct {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: string | null;
    discountPrice: string | null;
    images: string;
    brandId: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    brand?: CatalogBrand | null;
}

export interface CatalogBrand {
    id: string;
    name: string;
    nameEn?: string | null;
    slug: string;
    description: string | null;
    image: string | null;
    group: "MAIN" | "DIFFERENT";
    isFeatured?: boolean;
    mainCategory?: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    } | null;
}

const catalogCategorySelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    image: true,
    brandId: true,
    brand: {
        select: {
            id: true,
            name: true,
            nameEn: true,
            slug: true,
            description: true,
            image: true,
            group: true,
        },
    },
};

const catalogBrandSelect = {
    id: true,
    name: true,
    nameEn: true,
    slug: true,
    description: true,
    image: true,
    group: true,
    isFeatured: true,
    _count: {
        select: {
            products: true,
        },
    },
    products: {
        where: {
            NOT: [
                { images: '/placeholder.svg' },
                { images: '' }
            ]
        },
        take: 1,
        select: { images: true }
    },
    mainCategory: {
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
    },
    categories: {
        where: {
            isActive: true,
            archivedAt: null,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            mainCategoryId: true,
        },
    },
};

export const getCatalogBrands = cache(
    async (mainCategoryId?: string) => {
        return unstable_cache(
            async () => {
                try {
                    const where: any = { isActive: true };
                    if (mainCategoryId) {
                        where.OR = [
                            { mainCategoryId },
                            { categories: { some: { mainCategoryId } } },
                            { products: { some: { mainCategoryId } } },
                        ];
                    }
                    const brands = await prisma.brand.findMany({
                        where,
                        orderBy: [
                            { isFeatured: "desc" },
                            { name: "asc" },
                        ],
                        select: catalogBrandSelect,
                    });
                    return brands.map(b => {
                        const prodImg = (b as any).products?.[0]?.images ? (b as any).products[0].images.split(',')[0].trim() : null;
                        return {
                            ...b,
                            image: b.image && b.image !== '/placeholder.svg' ? b.image : (prodImg || '/logo.png')
                        };
                    });
                } catch (error) {
                    console.warn("getCatalogBrands: DB unreachable, returning empty list");
                    return [];
                }
            },
            [`catalog-brands-${mainCategoryId || 'all'}-v3`],
            { tags: ["catalog", "brands"], revalidate: 3600 }
        )();
    }
);

export const getBrandBySlug = cache(async (slug: string) => {
    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }
    const cleanSlug = decodedSlug.trim();
    const slugWithoutHyphens = cleanSlug.replace(/-/g, "");
    const slugWithHyphens = cleanSlug.replace(/\s+/g, "-");

    return unstable_cache(
        async () => {
            try {
                let brand = await prisma.brand.findFirst({
                    where: {
                        isActive: true,
                        OR: [
                            { slug: cleanSlug },
                            { slug },
                            { slug: slugWithoutHyphens },
                            { slug: slugWithHyphens },
                            { slug: { equals: cleanSlug, mode: "insensitive" } },
                            { id: cleanSlug },
                            { name: { equals: cleanSlug, mode: "insensitive" } },
                        ],
                    },
                    select: catalogBrandSelect,
                });

                if (!brand) {
                    brand = await prisma.brand.findFirst({
                        where: {
                            OR: [
                                { slug: cleanSlug },
                                { slug },
                                { slug: slugWithoutHyphens },
                                { slug: slugWithHyphens },
                                { slug: { equals: cleanSlug, mode: "insensitive" } },
                                { id: cleanSlug },
                                { name: { equals: cleanSlug, mode: "insensitive" } },
                            ],
                        },
                        select: catalogBrandSelect,
                    });
                }

                return brand;
            } catch (error) {
                console.error(`Error in getBrandBySlug (${slug}):`, error);
                return null;
            }
        },
        [`catalog-brand-${encodeURIComponent(cleanSlug)}`],
        { tags: ["catalog", "brands"], revalidate: 3600 }
    )();
});

export const getCatalogCategories = cache(async (brandId?: string) => {
    return unstable_cache(
        async () => {
            try {
                return await prisma.category.findMany({
                    where: {
                        isActive: true,
                        archivedAt: null,
                        brand: { isActive: true },
                        ...(brandId ? { brandId } : {}),
                    },
                    orderBy: [
                        { isFeatured: "desc" },
                        { name: "asc" },
                    ],
                    select: catalogCategorySelect,
                });
            } catch (error) {
                console.warn(`getCatalogCategories: DB unreachable (brandId: ${brandId}), returning empty list`);
                return [];
            }
        },
        [`catalog-categories-${brandId || "all"}`],
        { tags: ["catalog", "categories"], revalidate: 3600 }
    )();
});

export const getFooterCategories = cache(async (preferredIds: string[] = []) => {
    try {
        const sanitizedIds = [...new Set(preferredIds.filter(Boolean))];

        if (sanitizedIds.length > 0) {
            const selectedCategories = await prisma.category.findMany({
                where: {
                    id: {
                        in: sanitizedIds,
                    },
                    isActive: true,
                    archivedAt: null,
                    brand: { isActive: true },
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                },
            });

            const orderedSelectedCategories = sanitizedIds
                .map((id) => selectedCategories.find((category) => category.id === id))
                .filter((category): category is NonNullable<typeof category> => Boolean(category));

            if (orderedSelectedCategories.length > 0) {
                return orderedSelectedCategories;
            }
        }

        return await prisma.category.findMany({
            where: {
                isActive: true,
                archivedAt: null,
                brand: { isActive: true },
            },
            take: 4,
            orderBy: [
                { isFeatured: "desc" },
                { name: "asc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
            },
        });
    } catch (error) {
        console.warn("getFooterCategories: DB unreachable, returning fallback categories");
        return [];
    }
});

export const getCategoryBySlug = cache(async (slug: string) => {
    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }
    const cleanSlug = decodedSlug.trim();

    return unstable_cache(
        async () => {
            try {
                let category = await prisma.category.findFirst({
                    where: {
                        isActive: true,
                        archivedAt: null,
                        brand: { isActive: true },
                        OR: [
                            { slug: cleanSlug },
                            { slug },
                            { slug: { equals: cleanSlug, mode: "insensitive" } },
                            { id: cleanSlug },
                            { name: { equals: cleanSlug, mode: "insensitive" } },
                        ],
                    },
                    select: catalogCategorySelect,
                });

                if (!category) {
                    category = await prisma.category.findFirst({
                        where: {
                            isActive: true,
                            archivedAt: null,
                            OR: [
                                { slug: cleanSlug },
                                { slug },
                                { slug: { equals: cleanSlug, mode: "insensitive" } },
                                { id: cleanSlug },
                                { name: { equals: cleanSlug, mode: "insensitive" } },
                            ],
                        },
                        select: catalogCategorySelect,
                    });
                }

                return category;
            } catch (error) {
                console.warn(`getCategoryBySlug: DB unreachable (${slug}), returning null`);
                return null;
            }
        },
        [`catalog-category-${encodeURIComponent(cleanSlug)}`],
        { tags: ["catalog", "categories"], revalidate: 3600 }
    )();
});

export const getCatalogCategoriesByMainCategory = cache(async (mainCategoryId: string) => {
    return unstable_cache(
        async () => {
            try {
                return await prisma.category.findMany({
                    where: {
                        mainCategoryId,
                        isActive: true,
                        archivedAt: null,
                        brand: { isActive: true },
                    },
                    orderBy: [
                        { isFeatured: "desc" },
                        { name: "asc" },
                    ],
                    select: catalogCategorySelect,
                });
            } catch (error) {
                console.warn(`getCatalogCategoriesByMainCategory: DB unreachable (${mainCategoryId}), returning empty list`);
                return [];
            }
        },
        [`catalog-categories-main-${mainCategoryId}`],
        { tags: ["catalog", "categories"], revalidate: 3600 }
    )();
});

export const getCatalogMainCategories = cache(
    unstable_cache(
        async () => {
            try {
                const mainCategories = await prisma.mainCategory.findMany({
                    where: {
                        isActive: true,
                        archivedAt: null,
                    },
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

                return mainCategories.map((mc) => ({
                    id: mc.id,
                    name: mc.name,
                    nameEn: mc.description || mc.name,
                    slug: mc.slug,
                    description: mc.description,
                    image: mc.image,
                    _count: { products: productCounts.get(mc.id) ?? 0 },
                }));
            } catch (error) {
                console.warn("getCatalogMainCategories: DB unreachable, returning empty list");
                return [];
            }
        },
        ["catalog-main-categories-v4"],
        { tags: ["catalog", "main-categories"], revalidate: 3600 }
    )
);

export const getCatalogMainCategoryBySlug = cache(async (slug: string) => {
    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }
    const cleanSlug = decodedSlug.trim();

    return unstable_cache(
        async () => {
            try {
                return await prisma.mainCategory.findFirst({
                    where: {
                        isActive: true,
                        archivedAt: null,
                        OR: [
                            { slug: cleanSlug },
                            { slug },
                            { slug: { equals: cleanSlug, mode: "insensitive" } },
                            { id: cleanSlug },
                            { name: { equals: cleanSlug, mode: "insensitive" } },
                        ],
                    },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        image: true,
                    },
                });
            } catch (error) {
                console.warn(`getCatalogMainCategoryBySlug: DB unreachable (${slug}), returning null`);
                return null;
            }
        },
        [`catalog-main-category-${encodeURIComponent(cleanSlug)}`],
        { tags: ["catalog", "main-categories"], revalidate: 3600 }
    )();
});

export const getCatalogInitialData = cache(
    async (categoryId?: string, brandId?: string, mainCategoryId?: string, search?: string) => {
        const cleanSearch = search ? search.trim().slice(0, 100) : "";
        const cacheKey = `catalog-initial-${categoryId || 'none'}-${brandId || 'none'}-${mainCategoryId || 'none'}-${cleanSearch ? encodeURIComponent(cleanSearch) : 'none'}`;
        return unstable_cache(
            async () => {
                try {
                    const whereClause: {
                        stock: { gt: number };
                        categoryId?: string;
                        brandId?: string;
                        archivedAt: null;
                        brand: { isActive: boolean; archivedAt: null };
                        category: { archivedAt: null; isActive: boolean };
                        AND?: Array<Record<string, unknown>>;
                        OR?: Array<Record<string, unknown>>;
                    } = {
                        stock: { gt: 0 },
                        archivedAt: null,
                        brand: { isActive: true, archivedAt: null },
                        category: { archivedAt: null, isActive: true },
                    };

                    if (categoryId) {
                        whereClause.categoryId = categoryId;
                    }

                    if (brandId) {
                        whereClause.brandId = brandId;
                    }

                    if (mainCategoryId) {
                        whereClause.AND = [
                            {
                                OR: [
                                    { mainCategoryId },
                                    { category: { mainCategoryId } },
                                    { brand: { mainCategoryId } },
                                ],
                            },
                        ];
                    }

                    if (cleanSearch) {
                        whereClause.OR = [
                            { name: { contains: cleanSearch, mode: "insensitive" } },
                            { nameAr: { contains: cleanSearch, mode: "insensitive" } },
                            { nameEn: { contains: cleanSearch, mode: "insensitive" } },
                            { sku: { contains: cleanSearch, mode: "insensitive" } },
                            { description: { contains: cleanSearch, mode: "insensitive" } },
                            { descriptionAr: { contains: cleanSearch, mode: "insensitive" } },
                            { descriptionEn: { contains: cleanSearch, mode: "insensitive" } },
                            { brand: { name: { contains: cleanSearch, mode: "insensitive" } } },
                            { category: { name: { contains: cleanSearch, mode: "insensitive" } } },
                        ];
                    }

                    const categoriesPromise = brandId 
                        ? getCatalogCategories(brandId) 
                        : mainCategoryId
                        ? getCatalogCategoriesByMainCategory(mainCategoryId)
                        : getCatalogMainCategories();

                    const [categories, products, totalProducts] = await Promise.all([
                        categoriesPromise,
                        prisma.product.findMany({
                            where: whereClause,
                            take: 36,
                            orderBy: {
                                createdAt: "desc",
                            },
                            include: {
                                brand: {
                                    select: {
                                        id: true,
                                        name: true,
                                        nameEn: true,
                                        slug: true,
                                        description: true,
                                        image: true,
                                        group: true,
                                    },
                                },
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        }),
                        prisma.product.count({
                            where: whereClause,
                        }),
                    ]);

                    return {
                        categories,
                        products: products.map((product) => ({
                            id: product.id,
                            slug: product.slug,
                            name: product.name,
                            nameAr: product.nameAr,
                            nameEn: product.nameEn,
                            description: product.description,
                            descriptionAr: product.descriptionAr,
                            descriptionEn: product.descriptionEn,
                            price: null,
                            discountPrice: null,
                            discountType: null,
                            discountValue: null,
                            images: product.images,
                            brandId: product.brandId,
                            categoryId: product.categoryId,
                            mainCategoryId: product.mainCategoryId,
                            stock: product.stock,
                            packaging: product.packaging,
                            itemsPerPackage: product.itemsPerPackage,
                            minOrder: product.minOrder,
                            isTrending: product.isTrending,
                            category: product.category ? {
                                id: product.category.id,
                                name: product.category.name,
                                slug: product.category.slug,
                            } : null,
                            brand: product.brand ? {
                                id: product.brand.id,
                                name: product.brand.name,
                                nameEn: product.brand.nameEn,
                                slug: product.brand.slug,
                                description: product.brand.description,
                                image: product.brand.image,
                                group: product.brand.group,
                            } : null,
                        })),
                        totalProducts,
                    };
                } catch (error) {
                    console.warn("getCatalogInitialData: DB unreachable, returning empty catalog");
                    return {
                        categories: [],
                        products: [],
                        totalProducts: 0,
                    };
                }
            },
            [cacheKey],
            { tags: ["catalog", "products"], revalidate: 60 }
        )();
    }
);
