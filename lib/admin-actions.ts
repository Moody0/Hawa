"use server";

import { prisma } from "./prisma";
import { requireAdminSession, requireSuperAdminSession } from "./admin-auth";
import { revalidatePath, revalidateTag, updateTag, unstable_cache } from "next/cache";
import { BrandGroup, OrderStatus } from "@prisma/client";
import { generateUniqueCategorySlug } from "./category-utils";
import { generateUniqueBrandSlug, getZadLandBrandId } from "./brand-utils";
import { executeOrderStatusUpdate, executeOrderDeletion, OrderStatusType } from "./inventory-transitions";
import { recordErrorEvent } from "./monitoring";
import { clearProductsApiCache } from "./products-cache";

export type CacheEntity =
    | 'catalog'
    | 'products'
    | 'categories'
    | 'main-categories'
    | 'brands'
    | 'banners'
    | 'settings'
    | 'navigation'
    | 'reviews';

const ENTITY_CACHE_MAP: Record<CacheEntity, { tags: string[]; paths: string[] }> = {
    catalog: {
        tags: ['catalog', 'products', 'categories', 'brands', 'main-categories', 'navigation'],
        paths: ['/', '/products', '/categories', '/brands', '/department', '/departments', '/admin/products', '/admin/categories', '/admin/brands', '/admin/main-categories'],
    },
    products: {
        tags: ['catalog', 'products', 'navigation'],
        paths: ['/', '/products', '/admin/products'],
    },
    categories: {
        tags: ['catalog', 'categories', 'navigation'],
        paths: ['/', '/categories', '/products', '/admin/categories'],
    },
    'main-categories': {
        tags: ['catalog', 'main-categories', 'categories', 'navigation'],
        paths: ['/', '/categories', '/products', '/admin/main-categories'],
    },
    brands: {
        tags: ['catalog', 'brands', 'navigation'],
        paths: ['/', '/brands', '/products', '/admin/brands'],
    },
    banners: {
        tags: ['banners'],
        paths: ['/', '/admin/banners'],
    },
    settings: {
        tags: ['settings'],
        paths: ['/', '/categories', '/shipping-returns', '/about-us', '/products', '/admin/site-content'],
    },
    navigation: {
        tags: ['navigation'],
        paths: ['/', '/admin/main-categories'],
    },
    reviews: {
        tags: ['reviews', 'products'],
        paths: ['/', '/admin/reviews'],
    },
};

function invalidateCacheEntities(entities: CacheEntity[]) {
    const allTags = new Set<string>();
    const allPaths = new Set<string>();

    for (const entity of entities) {
        const config = ENTITY_CACHE_MAP[entity];
        if (config) {
            config.tags.forEach((t) => allTags.add(t));
            config.paths.forEach((p) => allPaths.add(p));
        }
    }

    if (entities.includes('catalog') || entities.includes('products')) {
        clearProductsApiCache();
    }

    for (const path of allPaths) {
        try {
            revalidatePath(path);
        } catch (err: any) {
            console.error(`[CacheInvalidation] Failed to revalidatePath("${path}"):`, err);
            recordErrorEvent({
                category: 'cache_invalidation_failure',
                route: path,
                message: `Failed to revalidatePath: ${err?.message || 'unknown error'}`,
            });
        }
    }

    for (const tag of allTags) {
        try {
            if (typeof updateTag === 'function') {
                updateTag(tag);
            }
        } catch (err: any) {
            console.error(`[CacheInvalidation] Failed updateTag("${tag}"):`, err);
            recordErrorEvent({
                category: 'cache_invalidation_failure',
                message: `Failed updateTag("${tag}"): ${err?.message || 'unknown error'}`,
            });
        }
        try {
            (revalidateTag as any)(tag, 'default');
        } catch (err: any) {
            console.error(`[CacheInvalidation] Failed revalidateTag("${tag}"):`, err);
            recordErrorEvent({
                category: 'cache_invalidation_failure',
                message: `Failed revalidateTag("${tag}"): ${err?.message || 'unknown error'}`,
            });
        }
    }
}

function revalidateCatalogCache() {
    invalidateCacheEntities(['catalog', 'navigation']);
}

interface ProductInput {
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    price: string | number;
    discountPrice?: string | number | null;
    discountType?: string | null;
    discountValue?: string | number | null;
    stock: string | number;
    options?: string | null;
    sku?: string | null;
    images: string;
    brandId: string;
    categoryId: string;
    mainCategoryId?: string | null;
    packaging?: string | null;
    itemsPerPackage?: string | null;
    minOrder?: number | string | null;
    hidePrice?: boolean;
}

interface CategoryInput {
    name: string;
    description?: string;
    image?: string;
    isFeatured?: boolean;
    brandId?: string;
}

interface BrandInput {
    name: string;
    description?: string;
    image?: string;
    group?: BrandGroup | "MAIN" | "DIFFERENT";
    isActive?: boolean;
    isFeatured?: boolean;
    mainCategoryId?: string;
}

type ProductImportRow = Record<string, string | number | boolean | null | undefined>;

export interface HomeCollectionSectionProduct {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number;
    discountPrice: number | null;
    images: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group: BrandGroup;
    } | null;
}

export interface HomeCollectionSection {
    category: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        productCount: number;
    };
    products: HomeCollectionSectionProduct[];
}

export interface HomeBrand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    group: BrandGroup;
    _count: {
        products: number;
        categories: number;
    };
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCategories: number;
    averageOrderValue: number;
    deliveredOrdersCount: number;
    pipeline: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    inventory: {
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
        inStockCount: number;
    };
    lowStockProducts: {
        id: string;
        name: string;
        nameAr: string | null;
        stock: number;
        price: number;
        image: string;
        categoryName: string;
    }[];
    topProducts: {
        id: string;
        name: string;
        nameAr: string | null;
        image: string;
        unitsSold: number;
        revenue: number;
        stock: number;
        price: number;
    }[];
    salesTrend: {
        date: string;
        label: string;
        revenue: number;
        orders: number;
    }[];
    topCities: {
        city: string;
        orderCount: number;
        totalRevenue: number;
    }[];
    recentOrders: {
        id: string;
        Name: string;
        customer: string;
        phone: string;
        streetAddress: string;
        city: string;
        product: string;
        date: string;
        createdAt: string;
        amount: string;
        totalAmount: number;
        status: string;
        statusColor: string;
        items: {
            id: string;
            quantity: number;
            price: number;
            product: {
                name: string;
                images: string;
            } | null;
        }[];
    }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        await requireAdminSession();
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const [
            deliveredRevenueAgg,
            nonCancelledRevenueAgg,
            allOrdersCount,
            pendingOrdersCount,
            processingOrdersCount,
            shippedOrdersCount,
            deliveredOrdersCount,
            cancelledOrdersCount,
            totalProductsCount,
            outOfStockProductsCount,
            lowStockProductsCount,
            totalCategoriesCount,
            criticalStockProducts,
            trendOrders,
            topSellingGroups,
            recentOrders,
            cityGroups
        ] = await Promise.all([
            // Delivered revenue
            prisma.order.aggregate({
                where: { status: 'DELIVERED' },
                _sum: { totalAmount: true }
            }),
            // Non-cancelled revenue for average order calculations
            prisma.order.aggregate({
                where: { status: { not: 'CANCELLED' } },
                _sum: { totalAmount: true }
            }),
            // Status counts
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'PROCESSING' } }),
            prisma.order.count({ where: { status: 'SHIPPED' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.order.count({ where: { status: 'CANCELLED' } }),
            // Product inventory counts
            prisma.product.count(),
            prisma.product.count({ where: { stock: { lte: 0 } } }),
            prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
            prisma.category.count(),
            // Critical stock watchlist
            prisma.product.findMany({
                where: { stock: { lte: 5 } },
                orderBy: { stock: 'asc' },
                take: 5,
                include: {
                    category: {
                        select: { name: true }
                    }
                }
            }),
            // Trend orders over last 14 days
            prisma.order.findMany({
                where: {
                    createdAt: { gte: fourteenDaysAgo },
                    status: { not: 'CANCELLED' }
                },
                select: {
                    createdAt: true,
                    totalAmount: true,
                    status: true
                },
                orderBy: { createdAt: 'asc' }
            }),
            // Top selling order items grouped directly in PostgreSQL
            prisma.orderItem.groupBy({
                by: ['productId'],
                where: {
                    order: {
                        status: { not: 'CANCELLED' }
                    }
                },
                _sum: {
                    quantity: true
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc'
                    }
                },
                take: 5
            }),
            // Recent 6 orders
            prisma.order.findMany({
                take: 6,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            }),
            // City demand aggregation grouped directly in PostgreSQL
            prisma.order.groupBy({
                by: ['city'],
                where: { status: { not: 'CANCELLED' } },
                _count: {
                    id: true
                },
                _sum: {
                    totalAmount: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 5
            })
        ]);

        const totalRevenueNumber = Number(deliveredRevenueAgg._sum.totalAmount) || 0;
        const nonCancelledRevenue = Number(nonCancelledRevenueAgg._sum.totalAmount) || 0;
        const validOrdersCount = Math.max(1, allOrdersCount - cancelledOrdersCount);
        const avgOrderValue = deliveredOrdersCount > 0 
            ? totalRevenueNumber / deliveredOrdersCount 
            : allOrdersCount > 0 
                ? nonCancelledRevenue / validOrdersCount 
                : 0;

        // 14-day daily sales trend map
        const trendMap: { [key: string]: { revenue: number; orders: number } } = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            trendMap[dateKey] = { revenue: 0, orders: 0 };
        }

        trendOrders.forEach(o => {
            const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
            if (trendMap[dateKey]) {
                trendMap[dateKey].orders += 1;
                trendMap[dateKey].revenue += Number(o.totalAmount) || 0;
            }
        });

        const salesTrend = Object.keys(trendMap).map(dateKey => {
            const d = new Date(dateKey + 'T00:00:00');
            return {
                date: dateKey,
                label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: Number(trendMap[dateKey].revenue.toFixed(2)),
                orders: trendMap[dateKey].orders
            };
        });

        // Calculate Top 5 best-selling products from database grouping
        const topProductIds = topSellingGroups.map(g => g.productId);
        const topProductRecords = topProductIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: topProductIds } },
                select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    images: true,
                    stock: true,
                    price: true
                }
            })
            : [];
        const productRecordMap = new Map(topProductRecords.map(p => [p.id, p]));

        const topProducts = topSellingGroups.map(g => {
            const product = productRecordMap.get(g.productId);
            let firstImg = "";
            if (product?.images) {
                try {
                    const parsed = JSON.parse(product.images);
                    firstImg = Array.isArray(parsed) ? parsed[0] : parsed;
                } catch {
                    firstImg = product.images ? product.images.split(',')[0].trim() : "";
                }
            }
            const unitsSold = g._sum.quantity || 0;
            const price = product ? Number(product.price) : 0;
            return {
                id: g.productId,
                name: product?.name || "Unknown",
                nameAr: product?.nameAr || null,
                image: firstImg || "",
                unitsSold,
                revenue: unitsSold * price,
                stock: product?.stock ?? 0,
                price
            };
        });

        // Low stock products watchlist
        const lowStockProducts = criticalStockProducts.map(p => {
            let firstImg = "";
            try {
                if (p.images) {
                    const parsed = JSON.parse(p.images);
                    firstImg = Array.isArray(parsed) ? parsed[0] : parsed;
                }
            } catch {
                firstImg = p.images ? p.images.split(',')[0].trim() : "";
            }

            return {
                id: p.id,
                name: p.name,
                nameAr: p.nameAr,
                stock: p.stock,
                price: Number(p.price),
                image: firstImg || "",
                categoryName: p.category?.name || "Uncategorized"
            };
        });

        // Top delivery cities from database grouping
        const topCities = cityGroups.map(g => {
            const rawCity = (g.city || "Unknown").trim();
            const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
            return {
                city,
                orderCount: g._count.id,
                totalRevenue: Number((Number(g._sum.totalAmount) || 0).toFixed(2))
            };
        });

        return {
            totalRevenue: totalRevenueNumber,
            totalOrders: allOrdersCount,
            totalProducts: totalProductsCount,
            totalCategories: totalCategoriesCount,
            averageOrderValue: Number(avgOrderValue.toFixed(2)),
            deliveredOrdersCount,
            pipeline: {
                pending: pendingOrdersCount,
                processing: processingOrdersCount,
                shipped: shippedOrdersCount,
                delivered: deliveredOrdersCount,
                cancelled: cancelledOrdersCount
            },
            inventory: {
                totalProducts: totalProductsCount,
                lowStockCount: lowStockProductsCount,
                outOfStockCount: outOfStockProductsCount,
                inStockCount: Math.max(0, totalProductsCount - lowStockProductsCount - outOfStockProductsCount)
            },
            lowStockProducts,
            topProducts,
            salesTrend,
            topCities,
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                Name: order.Name,
                customer: order.Name,
                phone: order.phone,
                streetAddress: order.streetAddress,
                city: order.city,
                product: order.items[0]?.product?.name || "Multiple Items",
                date: new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                createdAt: order.createdAt.toISOString(),
                amount: `$${Number(order.totalAmount).toFixed(2)}`,
                totalAmount: Number(order.totalAmount),
                status: order.status,
                statusColor: getStatusColor(order.status),
                items: order.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: Number(item.price),
                    product: item.product ? {
                        name: item.product.name,
                        images: item.product.images
                    } : null
                }))
            }))
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalCategories: 0,
            averageOrderValue: 0,
            deliveredOrdersCount: 0,
            pipeline: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
            inventory: { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, inStockCount: 0 },
            lowStockProducts: [],
            topProducts: [],
            salesTrend: [],
            topCities: [],
            recentOrders: []
        };
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'DELIVERED':
            return 'emerald';
        case 'PROCESSING':
            return 'blue';
        case 'PENDING':
            return 'amber';
        case 'CANCELLED':
            return 'red';
        case 'SHIPPED':
            return 'indigo';
        default:
            return 'gray';
    }
}

export async function getAdminBrands() {
    try {
        await requireAdminSession("canManageBrands");
        const brands = await prisma.brand.findMany({
            orderBy: [
                { isFeatured: "desc" },
                { name: "asc" },
            ],
            include: {
                mainCategory: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        categories: true,
                        products: true,
                    },
                },
            },
        });

        return brands.map((brand) => ({
            ...brand,
            createdAt: brand.createdAt.toISOString(),
            updatedAt: brand.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch brands:", error);
        return [];
    }
}

export async function createBrand(data: BrandInput) {
    try {
        await requireAdminSession("canManageBrands");
        const slug = await generateUniqueBrandSlug(data.name);
        const group = data.group === "MAIN" ? BrandGroup.MAIN : BrandGroup.DIFFERENT;

        const brand = await prisma.brand.create({
            data: {
                name: data.name.trim(),
                slug,
                description: data.description,
                image: data.image,
                group,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                mainCategoryId: data.mainCategoryId || null,
            },
        });

        revalidatePath("/");
        revalidatePath("/brands");
        revalidatePath("/admin/brands");
        revalidateCatalogCache();

        return {
            success: true,
            brand: {
                ...brand,
                createdAt: brand.createdAt.toISOString(),
                updatedAt: brand.updatedAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Failed to create brand:", error);
        return { success: false, error: "Failed to create brand" };
    }
}

export async function updateBrand(id: string, data: BrandInput) {
    try {
        await requireAdminSession("canManageBrands");
        const slug = await generateUniqueBrandSlug(data.name, id);
        const group = data.group === "MAIN" ? BrandGroup.MAIN : BrandGroup.DIFFERENT;

        const brand = await prisma.brand.update({
            where: { id },
            data: {
                name: data.name.trim(),
                slug,
                description: data.description,
                image: data.image,
                group,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                mainCategoryId: data.mainCategoryId || null,
            },
        });

        revalidatePath("/");
        revalidatePath("/brands");
        revalidatePath(`/brands/${brand.slug}`);
        revalidatePath("/admin/brands");
        revalidatePath("/admin/products");
        revalidatePath("/admin/categories");
        revalidateCatalogCache();

        return {
            success: true,
            brand: {
                ...brand,
                createdAt: brand.createdAt.toISOString(),
                updatedAt: brand.updatedAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Failed to update brand:", error);
        return { success: false, error: "Failed to update brand" };
    }
}

export async function deleteBrand(id: string) {
    try {
        await requireAdminSession("canDeleteBrands");
        const [productCount, categoryCount] = await Promise.all([
            prisma.product.count({ where: { brandId: id } }),
            prisma.category.count({ where: { brandId: id } }),
        ]);

        if (productCount > 0 || categoryCount > 0) {
            return { success: false, error: "deleteBrandWithCatalog" };
        }

        await prisma.brand.delete({ where: { id } });

        revalidatePath("/");
        revalidatePath("/brands");
        revalidatePath("/admin/brands");
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to delete brand:", error);
        return { success: false, error: "deleteBrandError" };
    }
}

export async function toggleBrandActive(id: string, isActive: boolean) {
    try {
        await requireAdminSession("canManageBrands");
        await prisma.brand.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/");
        revalidatePath("/brands");
        revalidatePath("/admin/brands");
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle brand active status:", error);
        return { success: false, error: "Failed to toggle brand active status" };
    }
}

export async function toggleBrandFeatured(id: string, isFeatured: boolean) {
    try {
        await requireAdminSession("canManageBrands");
        await prisma.brand.update({
            where: {
                id,
                group: BrandGroup.MAIN,
            },
            data: { isFeatured },
        });

        revalidatePath("/");
        revalidatePath("/brands");
        revalidatePath("/admin/brands");
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle brand featured status:", error);
        return { success: false, error: "Failed to toggle brand featured status" };
    }
}

// ==================== MAIN CATEGORY ACTIONS ====================

interface MainCategoryInput {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    showInNav?: boolean;
    navOrder?: number;
}

export async function getAdminMainCategories() {
    try {
        await requireAdminSession("canManageCategories");
        const mainCategories = await prisma.mainCategory.findMany({
            orderBy: { navOrder: "asc" },
            include: {
                _count: {
                    select: {
                        brands: true,
                        categories: true,
                        products: true,
                    },
                },
            },
        });

        return mainCategories.map((mc) => ({
            ...mc,
            createdAt: mc.createdAt.toISOString(),
            updatedAt: mc.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch main categories:", error);
        return [];
    }
}

function generateMainCategorySlug(name: string, description?: string | null, existingSlug?: string) {
    if (existingSlug && existingSlug !== "-" && existingSlug !== "--" && existingSlug.trim().length > 0) {
        return existingSlug;
    }
    const source = (description && description.trim().length > 0) ? description : name;
    let s = source
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    if (!s) {
        s = `dept-${Date.now().toString(36)}`;
    }
    return s;
}

export async function createMainCategory(data: MainCategoryInput) {
    try {
        await requireAdminSession("canManageCategories");
        let slug = generateMainCategorySlug(data.name, data.description);

        const existing = await prisma.mainCategory.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        const mainCategory = await prisma.mainCategory.create({
            data: {
                name: data.name.trim(),
                slug,
                description: data.description ? data.description.trim() : null,
                image: data.image,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                showInNav: data.showInNav ?? true,
                navOrder: data.navOrder ?? 0,
            },
        });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        revalidateCatalogCache();
        return {
            success: true,
            mainCategory: {
                ...mainCategory,
                createdAt: mainCategory.createdAt.toISOString(),
                updatedAt: mainCategory.updatedAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Failed to create main category:", error);
        return { success: false, error: "Failed to create main category" };
    }
}

export async function updateMainCategory(id: string, data: MainCategoryInput) {
    try {
        await requireAdminSession("canManageCategories");
        const current = await prisma.mainCategory.findUnique({ where: { id } });
        let slug = generateMainCategorySlug(data.name, data.description, current?.slug);

        const conflict = await prisma.mainCategory.findFirst({
            where: { slug, id: { not: id } },
        });
        if (conflict) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        const mainCategory = await prisma.mainCategory.update({
            where: { id },
            data: {
                name: data.name.trim(),
                slug,
                description: data.description ? data.description.trim() : null,
                image: data.image,
                isActive: data.isActive ?? true,
                isFeatured: data.isFeatured ?? false,
                showInNav: data.showInNav ?? true,
                navOrder: data.navOrder ?? 0,
            },
        });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        revalidateCatalogCache();
        return {
            success: true,
            mainCategory: {
                ...mainCategory,
                createdAt: mainCategory.createdAt.toISOString(),
                updatedAt: mainCategory.updatedAt.toISOString(),
            },
        };
    } catch (error) {
        console.error("Failed to update main category:", error);
        return { success: false, error: "Failed to update main category" };
    }
}

export async function deleteMainCategory(id: string) {
    try {
        await requireAdminSession("canDeleteCategories");
        const [brandCount, categoryCount, productCount] = await Promise.all([
            prisma.brand.count({ where: { mainCategoryId: id } }),
            prisma.category.count({ where: { mainCategoryId: id } }),
            prisma.product.count({ where: { mainCategoryId: id } }),
        ]);

        if (brandCount > 0 || categoryCount > 0 || productCount > 0) {
            return { success: false, error: "Cannot delete a main category that has brands, categories, or products assigned to it. Please reassign them first." };
        }

        await prisma.mainCategory.delete({ where: { id } });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to delete main category:", error);
        return { success: false, error: "Failed to delete main category" };
    }
}

export async function toggleMainCategoryFeatured(id: string, isFeatured: boolean) {
    try {
        await requireAdminSession("canManageCategories");
        await prisma.mainCategory.update({
            where: { id },
            data: { isFeatured },
        });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle main category featured status:", error);
        return { success: false, error: "Failed to toggle featured status" };
    }
}

export async function toggleMainCategoryActive(id: string, isActive: boolean) {
    try {
        await requireAdminSession("canManageCategories");
        await prisma.mainCategory.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle main category active status:", error);
        return { success: false, error: "Failed to toggle active status" };
    }
}

export async function getAdminProducts(options?: {
    cursor?: string;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    search?: string;
}) {
    try {
        await requireAdminSession("canManageProducts");
        const limit = options?.limit ? Math.min(Math.max(1, options.limit), 500) : 100;
        const cursor = options?.cursor;

        const where: any = {};
        if (options?.categoryId) where.categoryId = options.categoryId;
        if (options?.brandId) where.brandId = options.brandId;
        if (options?.search) {
            const clean = options.search.trim();
            where.OR = [
                { name: { contains: clean, mode: "insensitive" } },
                { nameAr: { contains: clean, mode: "insensitive" } },
                { sku: { contains: clean, mode: "insensitive" } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: [
                { createdAt: 'desc' },
                { id: 'desc' }
            ],
            include: {
                category: true,
                brand: true,
                mainCategory: true,
            }
        });

        return products.map(product => ({
            id: product.id,
            name: product.name,
            nameAr: product.nameAr || null,
            nameEn: product.nameEn || product.name || null,
            slug: product.slug,
            images: product.images,
            sku: product.sku,
            description: product.description,
            descriptionAr: product.descriptionAr || null,
            descriptionEn: product.descriptionEn || product.description || null,
            price: Number(product.price),
            discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
            discountType: product.discountType,
            discountValue: product.discountValue ? Number(product.discountValue) : null,
            stock: Number(product.stock),
            options: product.options || null,
            brandId: product.brandId,
            categoryId: product.categoryId,
            mainCategoryId: product.mainCategoryId || null,
            brand: product.brand ? {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug,
                group: product.brand.group,
            } : null,
            category: product.category ? {
                id: product.category.id,
                name: product.category.name
            } : null,
            mainCategory: product.mainCategory ? {
                id: product.mainCategory.id,
                name: product.mainCategory.name,
                slug: product.mainCategory.slug,
            } : null,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
            isTrending: product.isTrending,
            packaging: product.packaging || "طرد",
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
            hidePrice: Boolean(product.hidePrice),
        }));
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

export async function getAdminCategories(page = 1, limit = 500) {
    try {
        await requireAdminSession("canManageCategories");
        const skip = (page - 1) * limit;
        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    image: true,
                    brandId: true,
                    isFeatured: true,
                    createdAt: true,
                    updatedAt: true,
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            group: true,
                        }
                    },
                    _count: {
                        select: { products: true }
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    name: 'asc'
                }
            }),
            prisma.category.count()
        ]);
        
        return {
            categories: categories.map(category => ({
                ...category,
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { categories: [], pagination: { total: 0, pages: 0, page: 1, limit: 50 } };
    }
}

export async function getAdminOrders(page = 1, limit = 50) {
    try {
        await requireAdminSession("canManageOrders");
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                select: {
                    id: true,
                    shopName: true,
                    Name: true,
                    phone: true,
                    streetAddress: true,
                    city: true,
                    notes: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            price: true,
                            options: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true,
                                    price: true,
                                    packaging: true,
                                    itemsPerPackage: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.order.count()
        ]);

        return {
            orders: orders.map(order => ({
                id: order.id,
                shopName: order.shopName,
                Name: order.Name,
                phone: order.phone,
                streetAddress: order.streetAddress,
                city: order.city,
                notes: order.notes,
                totalAmount: Number(order.totalAmount),
                status: order.status,
                createdAt: order.createdAt.toISOString(),
                updatedAt: order.updatedAt.toISOString(),
                items: order.items.map(item => ({
                    ...item,
                    price: Number(item.price),
                    product: item.product ? {
                        ...item.product,
                        price: Number(item.product.price),
                    } : null
                }))
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 50 } };
    }
}

export async function createProduct(data: ProductInput) {
    try {
        await requireAdminSession("canManageProducts");
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
            select: { brandId: true, mainCategoryId: true },
        });

        if (!category || category.brandId !== data.brandId) {
            return { success: false, error: "Product category must belong to the selected brand" };
        }

        const primaryName = data.nameEn || data.name || data.nameAr || "product";
        let baseSlug = primaryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        if (!baseSlug || baseSlug.length < 2) {
            baseSlug = 'product';
        }
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

        const product = await prisma.product.create({
            data: {
                name: primaryName,
                nameAr: data.nameAr || null,
                nameEn: data.nameEn || primaryName,
                slug: slug,
                description: data.description || data.descriptionEn || data.descriptionAr || null,
                descriptionAr: data.descriptionAr || null,
                descriptionEn: data.descriptionEn || data.description || null,
                price: parseFloat(data.price as string),
                discountPrice: data.discountPrice ? parseFloat(data.discountPrice as string) : null,
                discountType: data.discountType,
                discountValue: data.discountValue ? parseFloat(data.discountValue as string) : null,
                stock: parseInt(data.stock as string) || 0,
                options: data.options || null,
                sku: data.sku || null,
                images: data.images,
                brandId: data.brandId,
                categoryId: data.categoryId,
                mainCategoryId: data.mainCategoryId || category.mainCategoryId || null,
                packaging: data.packaging || "طرد",
                itemsPerPackage: data.itemsPerPackage || null,
                minOrder: typeof data.minOrder === "number" ? data.minOrder : (parseInt(data.minOrder as string) || 1),
                hidePrice: Boolean(data.hidePrice),
            }
        });

        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        revalidateCatalogCache();

        return {
            success: true,
            product: {
                id: product.id,
                name: product.name,
                nameAr: product.nameAr,
                nameEn: product.nameEn,
                slug: product.slug,
                images: product.images,
                sku: product.sku,
                isTrending: product.isTrending,
                description: product.description,
                descriptionAr: product.descriptionAr,
                descriptionEn: product.descriptionEn,
                price: Number(product.price),
                discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
                discountType: product.discountType,
                discountValue: product.discountValue ? Number(product.discountValue) : null,
                stock: Number(product.stock),
                options: product.options,
                brandId: product.brandId,
                categoryId: product.categoryId,
                mainCategoryId: product.mainCategoryId,
                packaging: product.packaging,
                itemsPerPackage: product.itemsPerPackage,
                minOrder: product.minOrder,
                hidePrice: product.hidePrice,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        console.error("Failed to create product:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(id: string, data: ProductInput & { isTrending?: boolean }) {
    try {
        await requireAdminSession("canManageProducts");
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
            select: { brandId: true, mainCategoryId: true },
        });

        if (!category || category.brandId !== data.brandId) {
            return { success: false, error: "Product category must belong to the selected brand" };
        }

        const primaryName = data.nameEn || data.name || data.nameAr || "product";

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: primaryName,
                nameAr: data.nameAr || null,
                nameEn: data.nameEn || primaryName,
                description: data.description || data.descriptionEn || data.descriptionAr || null,
                descriptionAr: data.descriptionAr || null,
                descriptionEn: data.descriptionEn || data.description || null,
                price: parseFloat(data.price as string),
                discountPrice: data.discountPrice ? parseFloat(data.discountPrice as string) : null,
                discountType: data.discountType,
                discountValue: data.discountValue ? parseFloat(data.discountValue as string) : null,
                stock: parseInt(data.stock as string) || 0,
                options: data.options || null,
                sku: data.sku || null,
                images: data.images,
                brandId: data.brandId,
                categoryId: data.categoryId,
                mainCategoryId: data.mainCategoryId || category.mainCategoryId || null,
                isTrending: data.isTrending,
                packaging: data.packaging !== undefined ? (data.packaging || "طرد") : undefined,
                itemsPerPackage: data.itemsPerPackage !== undefined ? (data.itemsPerPackage || null) : undefined,
                minOrder: data.minOrder !== undefined ? (typeof data.minOrder === "number" ? data.minOrder : (parseInt(data.minOrder as string) || 1)) : undefined,
                hidePrice: data.hidePrice !== undefined ? Boolean(data.hidePrice) : undefined,
            }
        });

        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        revalidateCatalogCache();

        return {
            success: true,
            product: {
                id: product.id,
                name: product.name,
                nameAr: product.nameAr,
                nameEn: product.nameEn,
                slug: product.slug,
                images: product.images,
                sku: product.sku,
                isTrending: product.isTrending,
                description: product.description,
                descriptionAr: product.descriptionAr,
                descriptionEn: product.descriptionEn,
                price: Number(product.price),
                discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
                discountType: product.discountType,
                discountValue: product.discountValue ? Number(product.discountValue) : null,
                stock: Number(product.stock),
                options: product.options,
                brandId: product.brandId,
                categoryId: product.categoryId,
                mainCategoryId: product.mainCategoryId,
                packaging: product.packaging,
                itemsPerPackage: product.itemsPerPackage,
                minOrder: product.minOrder,
                hidePrice: product.hidePrice,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        console.error("Failed to update product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(id: string) {
    try {
        await requireAdminSession("canDeleteProducts");
        await prisma.product.delete({
            where: { id }
        });

        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        revalidateCatalogCache();
        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to delete product:", error);
        if (typeof error === "object" && error !== null && "code" in error && error.code === 'P2003') {
            return { success: false, error: "deleteProductWithOrders" };
        }
        return { success: false, error: "deleteProductError" };
    }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
    try {
        await requireAdminSession("canManageOrders");
        await executeOrderStatusUpdate(id, status as OrderStatusType);

        revalidatePath('/admin/orders');
        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Failed to update order status:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update order status" };
    }
}

export async function deleteOrder(id: string) {
    try {
        await requireAdminSession("canDeleteOrders");
        await executeOrderDeletion(id);

        revalidatePath('/admin/orders');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete order:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete order" };
    }
}

export async function createCategory(data: CategoryInput) {
    try {
        await requireAdminSession("canManageCategories");
        const brandId = data.brandId || await getZadLandBrandId();
        const slug = await generateUniqueCategorySlug(data.name);

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                image: data.image,
                brandId,
                isFeatured: data.isFeatured ?? false,
            }
        });

        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');
        revalidatePath('/');
        revalidatePath('/categories');
        revalidatePath('/products');
        revalidateCatalogCache();

        return {
            success: true,
            category: {
                ...category,
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false, error: "Failed to create category" };
    }
}

export async function updateCategory(id: string, data: CategoryInput) {
    try {
        await requireAdminSession("canManageCategories");
        const brandId = data.brandId || await getZadLandBrandId();
        const slug = await generateUniqueCategorySlug(data.name, id);

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                slug,
                description: data.description,
                image: data.image,
                brandId,
                isFeatured: data.isFeatured,
            }
        });

        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');
        revalidatePath('/');
        revalidatePath('/categories');
        revalidatePath('/products');
        revalidateCatalogCache();

        return {
            success: true,
            category: {
                ...category,
                createdAt: category.createdAt.toISOString(),
                updatedAt: category.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        console.error("Failed to update category:", error);
        return { success: false, error: "Failed to update category" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await requireAdminSession("canDeleteCategories");
        const productsCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productsCount > 0) {
            return { success: false, error: "deleteCategoryWithProducts" };
        }

        await prisma.category.delete({
            where: { id }
        });

        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');
        revalidatePath('/');
        revalidatePath('/categories');
        revalidatePath('/products');
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "deleteCategoryError" };
    }
}

export async function toggleCategoryFeatured(id: string, isFeatured: boolean) {
    try {
        await requireAdminSession("canManageCategories");
        await prisma.category.update({
            where: { id },
            data: { isFeatured }
        });

        revalidatePath('/');
        revalidatePath('/admin/categories');
        revalidatePath('/categories');
        revalidatePath('/products');
        revalidateCatalogCache();
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle category featured status:", error);
        return { success: false, error: "Failed to toggle category featured status" };
    }
}



export async function getFeaturedMainBrands(): Promise<HomeBrand[]> {
    try {
        return await prisma.brand.findMany({
            where: {
                group: BrandGroup.MAIN,
                isActive: true,
                isFeatured: true,
            },
            take: 18,
            orderBy: [
                { updatedAt: "desc" },
                { name: "asc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                group: true,
                _count: {
                    select: {
                        products: true,
                        categories: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("Failed to fetch featured main brands:", error);
        return [];
    }
}

export async function getHomeCollectionSections(): Promise<HomeCollectionSection[]> {
    const productsPerSection = 18;

    try {
        const featuredCategories = await prisma.category.findMany({
            where: {
                isFeatured: true,
                brand: { isActive: true },
            },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
            },
        });

        if (featuredCategories.length === 0) {
            return [];
        }

        const featuredCategoryIds = featuredCategories.map((category) => category.id);
        const inStockCounts = await prisma.product.groupBy({
            by: ["categoryId"],
            where: {
                categoryId: { in: featuredCategoryIds },
                stock: { gt: 0 },
                brand: { isActive: true },
            },
            _count: {
                _all: true,
            },
        });

        const countByCategoryId = new Map(
            inStockCounts.map((item) => [item.categoryId, item._count._all])
        );

        const eligibleCategories = featuredCategories
            .map((category) => ({
                ...category,
                name: category.name.trim(),
                description: category.description?.trim() || null,
                productCount: countByCategoryId.get(category.id) || 0,
            }))
            .filter((category) => category.productCount > 0);

        if (eligibleCategories.length === 0) {
            return [];
        }

        const sections = await Promise.all(
            eligibleCategories.map(async (category) => {
                const products = await prisma.product.findMany({
                    where: {
                        categoryId: category.id,
                        stock: { gt: 0 },
                        brand: { isActive: true },
                    },
                    include: {
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                group: true,
                            },
                        },
                    },
                    take: productsPerSection,
                    orderBy: [
                        { isTrending: "desc" },
                        { createdAt: "desc" },
                    ],
                });

                return {
                    category: {
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                        image: category.image,
                        productCount: category.productCount,
                    },
                    products: products.map((product) => ({
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        description: product.description,
                        price: Number(product.price),
                        discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
                        images: product.images,
                        categoryId: product.categoryId,
                        stock: Number(product.stock),
                        isTrending: product.isTrending,
                        brand: product.brand,
                    })),
                };
            })
        );

        return sections.filter((section) => section.products.length > 0);
    } catch (error) {
        console.error("Failed to fetch home collection sections:", error);
        return [];
    }
}

export async function toggleProductTrending(id: string, isTrending: boolean) {
    try {
        await requireAdminSession("canManageProducts");
        await prisma.product.update({
            where: { id },
            data: { isTrending }
        });

        revalidatePath('/');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle product trending status:", error);
        return { success: false, error: "Failed to toggle product trending status" };
    }
}

export async function getTrendingProducts() {
    try {
        const products = await prisma.product.findMany({
            where: {
                isTrending: true,
                brand: { isActive: true },
            },
            // Removed limit to allow carousel to show all trending products
            include: { category: true, brand: true },
            orderBy: { updatedAt: 'desc' }
        });

        return products.map(product => ({
            ...product,
            price: Number(product.price),
            discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
            discountType: product.discountType,
            discountValue: product.discountValue ? Number(product.discountValue) : null,
            stock: Number(product.stock),
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
            category: product.category ? {
                ...product.category,
                createdAt: product.category.createdAt.toISOString(),
                updatedAt: product.category.updatedAt.toISOString(),
            } : null,
            brand: product.brand ? {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug,
                group: product.brand.group,
            } : null,
        }));
    } catch (error) {
        console.error("Failed to fetch trending products:", error);
        return [];
    }
}



export async function getCategoriesForCleanup() {
    try {
        await requireAdminSession("canManageCategories");
        return await prisma.category.findMany({
            select: { id: true, name: true }
        });
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export async function bulkFixCategoryNames(mapping: { id: string, newName: string }[]) {
    try {
        await requireAdminSession("canManageCategories");
        await Promise.all(mapping.map(item => 
            prisma.category.update({
                where: { id: item.id },
                data: { name: item.newName }
            })
        ));
        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Failed to bulk fix category names:", error);
        return { success: false };
    }
}

export async function bulkCreateProducts(products: ProductImportRow[]) {
    try {
        await requireAdminSession("canManageProducts");
        // getZadLandBrandId call if needed
        await getZadLandBrandId();
        
        // Cache main categories, brands, categories
        const mainCategories = await prisma.mainCategory.findMany();
        const mainCategoryMap = new Map(mainCategories.map(mc => [mc.name.trim().toLowerCase(), mc]));

        const brands = await prisma.brand.findMany();
        const brandMap = new Map(brands.map((brand) => [brand.name.trim().toLowerCase(), brand]));

        const categories = await prisma.category.findMany();
        const categoryMap = new Map(categories.map(c => [`${c.brandId}:${c.name.trim().toLowerCase()}`, c]));

        const results = await Promise.all(products.map(async (p) => {
            // Helper to get case-insensitive row values
            const getVal = (keys: string[]) => {
                for (const key of keys) {
                    if (p[key] !== undefined && p[key] !== null && String(p[key]).trim() !== "") {
                        return String(p[key]).trim();
                    }
                }
                return "";
            };

            const mainCategoryLabel = getVal(["Main Category", "mainCategory", "MainCategory", "main_category", "القسم الرئيسي"]);
            const subCategoryLabel = getVal(["Sub Category", "subCategory", "SubCategory", "Category", "category", "الفئة", "القسم الفرعي"]) || "General";
            const brandLabel = getVal(["Brand Name", "brandName", "Brand", "brand", "الشركة", "الماركة", "العلامة التجارية"]) || "Zad Land";
            const nameAr = getVal(["Name ar", "nameAr", "Name Ar", "Name AR", "الاسم بالعربي", "اسم المنتج بالعربي"]);
            const nameEn = getVal(["Name en", "nameEn", "Name En", "Name EN", "Name", "name", "الاسم بالانجليزي", "اسم المنتج بالانجليزي"]);
            const descriptionAr = getVal(["description ar", "descriptionAr", "Description Ar", "الوصف بالعربي", "وصف المنتج بالعربي"]);
            const descriptionEn = getVal(["description en", "descriptionEn", "Description En", "Description", "description", "الوصف بالانجليزي", "وصف المنتج بالانجليزي"]);
            const priceStr = getVal(["Price", "price", "السعر"]) || "0";
            const quantityStr = getVal(["Quantity", "quantity", "Stock", "stock", "الكمية", "المخزون"]) || "0";
            const optionsStr = getVal(["Options", "options", "Variants", "variants", "الخيارات", "الألوان والأحجام"]);
            const imagesStr = getVal(["Images", "images", "Image", "image", "الصور", "رابط الصورة"]);
            const skuStr = getVal(["SKU", "sku", "رمز المنتج"]);
            const isTrending = getVal(["Is Trending", "isTrending", "مميز"]) === "Yes" || getVal(["Is Trending", "isTrending", "مميز"]) === "true";

            const primaryName = nameEn || nameAr || getVal(["Name", "name"]) || "Product";
            if (!primaryName && !nameAr) {
                throw new Error("Product name is required");
            }

            // 1. Handle Main Category
            let mainCategoryId: string | null = null;
            if (mainCategoryLabel) {
                const mcKey = mainCategoryLabel.toLowerCase();
                let mainCat = mainCategoryMap.get(mcKey);
                if (!mainCat) {
                    const slug = await generateUniqueCategorySlug(mainCategoryLabel);
                    mainCat = await prisma.mainCategory.create({
                        data: {
                            name: mainCategoryLabel,
                            slug: slug,
                            isActive: true,
                        }
                    });
                    mainCategoryMap.set(mcKey, mainCat);
                }
                mainCategoryId = mainCat.id;
            }

            // 2. Handle Brand
            const brandKey = brandLabel.toLowerCase();
            let brand = brandMap.get(brandKey);
            if (!brand) {
                const slug = await generateUniqueBrandSlug(brandLabel);
                brand = await prisma.brand.create({
                    data: {
                        name: brandLabel,
                        slug: slug,
                        group: BrandGroup.DIFFERENT,
                        isActive: true,
                        isFeatured: false,
                        mainCategoryId: mainCategoryId || null,
                    }
                });
                brandMap.set(brandKey, brand);
            }
            const brandId = brand.id;

            // 3. Handle Category (Sub Category)
            const categoryKey = `${brandId}:${subCategoryLabel.toLowerCase()}`;
            let category = categoryMap.get(categoryKey);
            if (!category) {
                const slug = await generateUniqueCategorySlug(subCategoryLabel);
                category = await prisma.category.create({
                    data: {
                        name: subCategoryLabel,
                        slug: slug,
                        brandId: brandId,
                        mainCategoryId: mainCategoryId || brand.mainCategoryId || null,
                    }
                });
                categoryMap.set(categoryKey, category);
            }

            let baseSlug = (nameEn || primaryName).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            if (!baseSlug || baseSlug.length < 2) baseSlug = 'product';
            const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

            return prisma.product.create({
                data: {
                    name: primaryName,
                    nameAr: nameAr || null,
                    nameEn: nameEn || primaryName,
                    slug: slug,
                    description: descriptionEn || descriptionAr || primaryName,
                    descriptionAr: descriptionAr || null,
                    descriptionEn: descriptionEn || null,
                    price: parseFloat(priceStr) || 0,
                    stock: parseInt(quantityStr) || 0,
                    options: optionsStr || null,
                    sku: skuStr || null,
                    images: imagesStr || "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800",
                    brandId: brandId,
                    categoryId: category.id,
                    mainCategoryId: mainCategoryId || category.mainCategoryId || brand.mainCategoryId || null,
                    isTrending: isTrending,
                }
            });
        }));

        revalidatePath('/admin/products');
        revalidatePath('/admin/brands');
        revalidatePath('/admin/categories');
        revalidatePath('/admin/main-categories');
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true, count: results.length };
    } catch (error) {
        console.error("Bulk import failed:", error);
        return { success: false, error: "Failed to import products. Check CSV format." };
    }
}

export interface BannerInput {
    title: string;
    subtitle?: string;
    titleAr: string;
    subtitleAr?: string;
    image: string;
    buttonText?: string;
    buttonTextAr?: string;
    link?: string;
    badge?: string;
    badgeAr?: string;
    isActive?: boolean;
}

export async function getAdminBanners() {
    try {
        await requireAdminSession("canManageBanners");
        const banners = await prisma.banner.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return banners.map(banner => ({
            ...banner,
            createdAt: banner.createdAt.toISOString(),
            updatedAt: banner.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch banners:", error);
        return [];
    }
}

export async function createBanner(data: BannerInput) {
    try {
        await requireAdminSession("canManageBanners");
        const banner = await prisma.banner.create({
            data: {
                title: data.title,
                subtitle: data.subtitle,
                titleAr: data.titleAr,
                subtitleAr: data.subtitleAr,
                image: data.image,
                buttonText: data.buttonText || "Shop Now",
                buttonTextAr: data.buttonTextAr || "تسوق الآن",
                link: data.link || "/products",
                badge: data.badge || "Certified Wholesale",
                badgeAr: data.badgeAr || "توزيع جملة معتمد",
                isActive: data.isActive ?? true,
            }
        });

        invalidateCacheEntities(['banners']);

        return {
            success: true,
            banner: {
                ...banner,
                createdAt: banner.createdAt.toISOString(),
                updatedAt: banner.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        console.error("Failed to create banner:", error);
        return { success: false, error: "Failed to create banner" };
    }
}

export async function updateBanner(id: string, data: BannerInput) {
    try {
        await requireAdminSession("canManageBanners");
        const banner = await prisma.banner.update({
            where: { id },
            data: {
                title: data.title,
                subtitle: data.subtitle,
                titleAr: data.titleAr,
                subtitleAr: data.subtitleAr,
                image: data.image,
                buttonText: data.buttonText,
                buttonTextAr: data.buttonTextAr,
                link: data.link,
                badge: data.badge,
                badgeAr: data.badgeAr,
                isActive: data.isActive,
            }
        });

        invalidateCacheEntities(['banners']);

        return {
            success: true,
            banner: {
                ...banner,
                createdAt: banner.createdAt.toISOString(),
                updatedAt: banner.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        console.error("Failed to update banner:", error);
        return { success: false, error: "Failed to update banner" };
    }
}

export async function deleteBanner(id: string) {
    try {
        await requireAdminSession("canDeleteBanners");
        await prisma.banner.delete({
            where: { id }
        });

        invalidateCacheEntities(['banners']);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete banner:", error);
        return { success: false, error: "Failed to delete banner" };
    }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
    try {
        await requireAdminSession("canManageBanners");
        await prisma.banner.update({
            where: { id },
            data: { isActive }
        });

        invalidateCacheEntities(['banners']);
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle banner status:", error);
        return { success: false, error: "Failed to toggle banner status" };
    }
}



export interface PromoCodeInput {
    code: string;
    discountPercentage: number;
    delegateName?: string;
    isActive?: boolean;
}

export async function getPromoCodes() {
    try {
        await requireAdminSession("canManagePromoCodes");
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const promoCodes = await prisma.promoCode.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                orders: {
                    where: {
                        createdAt: {
                            gte: startOfMonth
                        }
                    },
                    select: {
                        totalAmount: true
                    }
                }
            }
        });

        return promoCodes.map(({ orders, ...code }) => ({
            ...code,
            totalSales: Number(code.totalSales),
            thisMonthSales: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
            createdAt: code.createdAt.toISOString(),
            updatedAt: code.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch promo codes:", error);
        return [];
    }
}

export async function createPromoCode(data: PromoCodeInput) {
    try {
        await requireAdminSession("canManagePromoCodes");
        const existing = await prisma.promoCode.findUnique({
            where: { code: data.code }
        });

        if (existing) {
            return { success: false, error: "Promo code already exists" };
        }

        const promoCode = await prisma.promoCode.create({
            data: {
                code: data.code.toUpperCase(), // Store uppercase
                discountPercentage: data.discountPercentage,
                delegateName: data.delegateName,
                isActive: data.isActive ?? true,
            }
        });

        revalidatePath('/admin/promocodes');
        return { success: true, promoCode };
    } catch (error) {
        console.error("Failed to create promo code:", error);
        return { success: false, error: "Failed to create promo code" };
    }
}

export async function updatePromoCode(id: string, data: PromoCodeInput) {
    try {
        await requireAdminSession("canManagePromoCodes");
        if (data.code) {
            const existing = await prisma.promoCode.findUnique({
                where: { code: data.code }
            });
            if (existing && existing.id !== id) {
                return { success: false, error: "Promo code already exists" };
            }
        }

        const promoCode = await prisma.promoCode.update({
            where: { id },
            data: {
                code: data.code.toUpperCase(),
                discountPercentage: data.discountPercentage,
                delegateName: data.delegateName,
                isActive: data.isActive,
            }
        });

        revalidatePath('/admin/promocodes');
        return { success: true, promoCode };
    } catch (error) {
        console.error("Failed to update promo code:", error);
        return { success: false, error: "Failed to update promo code" };
    }
}

export async function deletePromoCode(id: string) {
    try {
        await requireAdminSession("canDeletePromoCodes");
        await prisma.promoCode.delete({
            where: { id }
        });

        revalidatePath('/admin/promocodes');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete promo code:", error);
        return { success: false, error: "Failed to delete promo code" };
    }
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
    try {
        await requireAdminSession("canManagePromoCodes");
        await prisma.promoCode.update({
            where: { id },
            data: { isActive }
        });

        revalidatePath('/admin/promocodes');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle promo code status:", error);
        return { success: false, error: "Failed to toggle promo code status" };
    }
}

export async function validatePromoCode(code: string) {
    try {
        if (!code || typeof code !== 'string') {
            return { success: false, error: "رمز الخصم غير صالح" };
        }
        const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
        if (!cleanCode) {
            return { success: false, error: "يرجى إدخال رمز الخصم" };
        }
        const promoCode = await prisma.promoCode.findUnique({
            where: { code: cleanCode }
        });

        if (!promoCode) {
            return { success: false, error: "رمز الخصم غير صحيح أو منتهي الصلاحية" };
        }

        if (!promoCode.isActive) {
            return { success: false, error: "رمز الخصم غير مفعّل حالياً" };
        }

        return {
            success: true,
            promoCode: {
                id: promoCode.id,
                code: promoCode.code,
                discountPercentage: promoCode.discountPercentage
            }
        };
    } catch (error) {
        console.error("Failed to validate promo code:", error);
        return { success: false, error: "فشل التحقق من رمز الخصم" };
    }
}

import bcrypt from "bcryptjs";

export async function getAdminUser() {
    try {
        const session = await requireAdminSession();
        const userId = session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    } catch (error) {
        console.error("Failed to fetch admin user:", error);
        return null;
    }
}

export async function updateAdminCredentials(data: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
}) {
    try {
        const session = await requireAdminSession();
        const userId = session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return { success: false, error: "Admin user not found" };
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            return { success: false, error: "Current password is incorrect" };
        }

        // Prepare update data
        const updateData: { username?: string; password?: string } = {};

        if (data.newUsername && data.newUsername !== user.username) {
            updateData.username = data.newUsername;
        }

        if (data.newPassword) {
            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            updateData.password = hashedPassword;
        }

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: "No changes to update" };
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return { success: true, message: "Credentials updated successfully" };
    } catch (error) {
        console.error("Failed to update admin credentials:", error);
        return { success: false, error: "Failed to update credentials" };
    }
}



export async function updateSiteSettings(data: {
    categoriesCtaTitle?: string;
    categoriesCtaDesc?: string;
    categoriesCtaTitleAr?: string;
    categoriesCtaDescAr?: string;
    categoriesCtaImage?: string;
    footerBrandTitle?: string;
    footerBrandTitleAr?: string;
    footerBrandDescription?: string;
    footerBrandDescriptionAr?: string;
    footerCopyright?: string;
    footerCopyrightAr?: string;
    footerInstagramUrl?: string;
    footerFacebookUrl?: string;
    footerWhatsappUrl?: string;
    whatsappNumber?: string;
    footerShopTitle?: string;
    footerShopTitleAr?: string;
    footerSupportTitle?: string;
    footerSupportTitleAr?: string;
    footerCompanyTitle?: string;
    footerCompanyTitleAr?: string;
    footerSupportLink1Label?: string;
    footerSupportLink1LabelAr?: string;
    footerSupportLink1Url?: string;
    footerSupportLink2Label?: string;
    footerSupportLink2LabelAr?: string;
    footerSupportLink2Url?: string;
    footerSupportLink3Label?: string;
    footerSupportLink3LabelAr?: string;
    footerSupportLink3Url?: string;
    footerCompanyLink1Label?: string;
    footerCompanyLink1LabelAr?: string;
    footerCompanyLink1Url?: string;
    footerCompanyLink2Label?: string;
    footerCompanyLink2LabelAr?: string;
    footerCompanyLink2Url?: string;
    footerCompanyLink3Label?: string;
    footerCompanyLink3LabelAr?: string;
    footerCompanyLink3Url?: string;
    footerCategory1Id?: string | null;
    footerCategory2Id?: string | null;
    footerCategory3Id?: string | null;
    footerCategory4Id?: string | null;
    shippingTitle?: string;
    shippingDesc?: string;
    shippingTitleAr?: string;
    shippingDescAr?: string;
    verificationTitle?: string;
    verificationDesc?: string;
    verificationTitleAr?: string;
    verificationDescAr?: string;
    standardShippingTime?: string;
    expressShippingTime?: string;
    returnsTitle?: string;
    returnsDesc?: string;
    returnsTitleAr?: string;
    returnsDescAr?: string;
    finalSaleTitle?: string;
    finalSaleDesc?: string;
    finalSaleTitleAr?: string;
    finalSaleDescAr?: string;
    hygieneTitle?: string;
    hygieneDesc?: string;
    hygieneTitleAr?: string;
    hygieneDescAr?: string;
    shippingReturnsImage?: string;
    aboutHeroTitle?: string;
    aboutHeroTitleAr?: string;
    aboutHeroSubtitle?: string;
    aboutHeroSubtitleAr?: string;
    aboutHeroImage?: string;
    aboutNarrativeTitle?: string;
    aboutNarrativeTitleAr?: string;
    aboutNarrativeFounded?: string;
    aboutNarrativeFoundedAr?: string;
    aboutNarrativeDesc1?: string;
    aboutNarrativeDesc1Ar?: string;
    aboutNarrativeDesc2?: string;
    aboutNarrativeDesc2Ar?: string;
    aboutNarrativeQuote?: string;
    aboutNarrativeQuoteAr?: string;
    aboutNarrativeImage?: string;
    middleBanner1Image?: string;
    middleBanner1Link?: string;
    middleBanner2Image?: string;
    middleBanner2Link?: string;
    middleBanner2Title?: string;
    middleBanner2TitleAr?: string;
    middleBanner2Subtitle?: string;
    middleBanner2SubtitleAr?: string;
    middleBanner2ButtonText?: string;
    middleBanner2ButtonTextAr?: string;
    exchangeRate?: number;
    statDeliveries?: string;
    statBrands?: string;
    statProducts?: string;
    statClients?: string;
}) {
    try {
        await requireSuperAdminSession();
        await prisma.settings.upsert({
            where: { id: "site-settings" },
            update: data,
            create: {
                id: "site-settings",
                ...data
            }
        });

        invalidateCacheEntities(['settings']);
        return { success: true };
    } catch (error) {
        console.error("Failed to update site settings:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to update settings" 
        };
    }
}

export async function bulkToggleTrending(ids: string[], isTrending: boolean) {
    try {
        await requireAdminSession("canManageProducts");
        await prisma.product.updateMany({
            where: {
                id: { in: ids }
            },
            data: { isTrending }
        });

        invalidateCacheEntities(['products', 'navigation']);
        return { success: true };
    } catch (error) {
        console.error("Failed to bulk toggle trending status:", error);
        return { success: false, error: "Failed to bulk toggle trending status" };
    }
}

export async function bulkRemoveSale(ids: string[]) {
    try {
        await requireAdminSession("canManageProducts");
        await prisma.product.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                discountPrice: null,
                discountType: null,
                discountValue: null
            }
        });

        invalidateCacheEntities(['products', 'catalog']);
        return { success: true };
    } catch (error) {
        console.error("Failed to bulk remove sale:", error);
        return { success: false, error: "Failed to bulk remove sale" };
    }
}

export async function bulkDeleteProducts(ids: string[]) {
    try {
        await requireAdminSession("canDeleteProducts");
        // Find which products have orders
        const productsWithOrders = await prisma.product.findMany({
            where: {
                id: { in: ids },
                orderItems: { some: {} }
            },
            select: { id: true, name: true }
        });

        const idsWithOrders = new Set(productsWithOrders.map(p => p.id));
        const idsToDelete = ids.filter(id => !idsWithOrders.has(id));

        if (idsToDelete.length > 0) {
            await prisma.product.deleteMany({
                where: {
                    id: { in: idsToDelete }
                }
            });
        }

        revalidatePath('/');
        revalidatePath('/admin/products');
        revalidatePath('/admin/categories');

        if (idsWithOrders.size > 0) {
            const names = productsWithOrders.map(p => p.name).join(", ");
            return { 
                success: true, 
                partial: true,
                count: idsToDelete.length,
                names
            };
        }

        return { success: true, count: idsToDelete.length };
    } catch (error) {
        console.error("Detailed Bulk Delete Error:", error);
        return { success: false, error: "bulkDeleteProductsError" };
    }
}

export async function bulkDeleteCategories(ids: string[]) {
    try {
        await requireAdminSession("canDeleteCategories");
        // Find which categories have products
        const categoriesWithProducts = await prisma.category.findMany({
            where: {
                id: { in: ids },
                products: { some: {} }
            },
            select: { id: true, name: true }
        });

        const idsWithProducts = new Set(categoriesWithProducts.map(c => c.id));
        const idsToDelete = ids.filter(id => !idsWithProducts.has(id));

        if (idsToDelete.length > 0) {
            await prisma.category.deleteMany({
                where: {
                    id: { in: idsToDelete }
                }
            });
        }

        invalidateCacheEntities(['categories', 'catalog', 'navigation']);

        if (idsWithProducts.size > 0) {
            const names = categoriesWithProducts.map(c => c.name).join(", ");
            return { 
                success: true, 
                partial: true,
                count: idsToDelete.length,
                names
            };
        }

        return { success: true, count: idsToDelete.length };
    } catch (error) {
        console.error("Detailed Bulk Delete Categories Error:", error);
        return { success: false, error: "bulkDeleteCategoriesError" };
    }
}

