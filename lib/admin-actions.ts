"use server";

import { prisma } from "./prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { BrandGroup, OrderStatus } from "@prisma/client";
import { generateUniqueCategorySlug } from "./category-utils";
import { generateUniqueBrandSlug, getZadLandBrandId } from "./brand-utils";

function revalidateCatalogCache() {
    try {
        revalidatePath('/products');
        revalidatePath('/categories');
        revalidatePath('/brands');
        revalidatePath('/');
    } catch {
        // Safe fallback
    }
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
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const [
            deliveredRevenueAgg,
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
            allOrderItemsForTopSales,
            recentOrders,
            allCityOrders
        ] = await Promise.all([
            // Delivered revenue
            prisma.order.aggregate({
                where: { status: 'DELIVERED' },
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
            // Top selling order items
            prisma.orderItem.findMany({
                where: {
                    order: {
                        status: { not: 'CANCELLED' }
                    }
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            nameAr: true,
                            images: true,
                            stock: true,
                            price: true
                        }
                    }
                },
                take: 300
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
            // City demand aggregation
            prisma.order.findMany({
                where: { status: { not: 'CANCELLED' } },
                select: {
                    city: true,
                    totalAmount: true
                },
                take: 200
            })
        ]);

        const totalRevenueNumber = Number(deliveredRevenueAgg._sum.totalAmount) || 0;
        const avgOrderValue = deliveredOrdersCount > 0 
            ? totalRevenueNumber / deliveredOrdersCount 
            : allOrdersCount > 0 
                ? (await prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }))._sum.totalAmount ? Number((await prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }))._sum.totalAmount) / (allOrdersCount - cancelledOrdersCount || 1) : 0
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

        // Calculate Top 5 best-selling products
        const productSalesMap = new Map<string, {
            id: string;
            name: string;
            nameAr: string | null;
            image: string;
            unitsSold: number;
            revenue: number;
            stock: number;
            price: number;
        }>();

        allOrderItemsForTopSales.forEach(item => {
            if (!item.product) return;
            const existing = productSalesMap.get(item.productId);
            const itemRevenue = Number(item.price) * item.quantity;
            let firstImg = "";
            try {
                if (item.product.images) {
                    const parsed = JSON.parse(item.product.images);
                    firstImg = Array.isArray(parsed) ? parsed[0] : parsed;
                }
            } catch {
                firstImg = item.product.images ? item.product.images.split(',')[0].trim() : "";
            }

            if (existing) {
                existing.unitsSold += item.quantity;
                existing.revenue += itemRevenue;
            } else {
                productSalesMap.set(item.productId, {
                    id: item.product.id,
                    name: item.product.name,
                    nameAr: item.product.nameAr,
                    image: firstImg || "",
                    unitsSold: item.quantity,
                    revenue: itemRevenue,
                    stock: item.product.stock,
                    price: Number(item.product.price)
                });
            }
        });

        const topProducts = Array.from(productSalesMap.values())
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, 5);

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

        // Top delivery cities
        const cityMap = new Map<string, { orderCount: number; totalRevenue: number }>();
        allCityOrders.forEach(o => {
            const rawCity = (o.city || "Unknown").trim();
            if (!rawCity) return;
            const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
            const current = cityMap.get(city) || { orderCount: 0, totalRevenue: 0 };
            current.orderCount += 1;
            current.totalRevenue += Number(o.totalAmount) || 0;
            cityMap.set(city, current);
        });

        const topCities = Array.from(cityMap.entries())
            .map(([city, val]) => ({
                city,
                orderCount: val.orderCount,
                totalRevenue: Number(val.totalRevenue.toFixed(2))
            }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 4);

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
        return { success: true };
    } catch (error) {
        console.error("Failed to delete brand:", error);
        return { success: false, error: "deleteBrandError" };
    }
}

export async function toggleBrandActive(id: string, isActive: boolean) {
    try {
        await prisma.brand.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/");
        revalidatePath("/brands");
        revalidatePath("/admin/brands");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle brand active status:", error);
        return { success: false, error: "Failed to toggle brand active status" };
    }
}

export async function toggleBrandFeatured(id: string, isFeatured: boolean) {
    try {
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
        return { success: true };
    } catch (error) {
        console.error("Failed to delete main category:", error);
        return { success: false, error: "Failed to delete main category" };
    }
}

export async function toggleMainCategoryFeatured(id: string, isFeatured: boolean) {
    try {
        await prisma.mainCategory.update({
            where: { id },
            data: { isFeatured },
        });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle main category featured status:", error);
        return { success: false, error: "Failed to toggle featured status" };
    }
}

export async function toggleMainCategoryActive(id: string, isActive: boolean) {
    try {
        await prisma.mainCategory.update({
            where: { id },
            data: { isActive },
        });

        revalidatePath("/");
        revalidatePath("/admin/main-categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle main category active status:", error);
        return { success: false, error: "Failed to toggle active status" };
    }
}

export async function getAdminProducts() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc'
            },
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
        let slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

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
        await prisma.$transaction(async (tx) => {
            // Get current order and its status
            const order = await tx.order.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!order) throw new Error("Order not found");

            // If changing to DELIVERED and it wasn't already DELIVERED
            if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    });
                }
            }
            
            // If changing FROM DELIVERED to something else (cancellation/return)
            // Revert the stock deduction
            if (order.status === 'DELIVERED' && status !== 'DELIVERED') {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                }
            }

            return await tx.order.update({
                where: { id },
                data: { status }
            });
        });

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
        await prisma.order.delete({
            where: { id }
        });
        revalidatePath('/admin/orders');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}

export async function createCategory(data: CategoryInput) {
    try {
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
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "deleteCategoryError" };
    }
}

export async function toggleCategoryFeatured(id: string, isFeatured: boolean) {
    try {
        await prisma.category.update({
            where: { id },
            data: { isFeatured }
        });

        revalidatePath('/');
        revalidatePath('/admin/categories');
        revalidatePath('/categories');
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle category featured status:", error);
        return { success: false, error: "Failed to toggle category featured status" };
    }
}

export interface RailBrand {
    id: string;
    name: string;
    nameAr: string;
    fullName: string;
    slug: string;
    description?: string | null;
    image: string;
    productCount?: number;
}

export const getHomeRailBrands = unstable_cache(
    async (): Promise<RailBrand[]> => {
        try {
            const brands = await prisma.brand.findMany({
                where: {
                    isActive: true,
                    products: {
                        some: {
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        }
                    }
                },
                orderBy: [
                    { isFeatured: 'desc' },
                    { products: { _count: 'desc' } }
                ],
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    image: true,
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
                    _count: {
                        select: { products: true }
                    }
                }
            });

            return brands.map(b => {
                let en = b.name;
                let ar = b.name;
                if (b.name.includes(' - ')) {
                    const parts = b.name.split(' - ').map(s => s.trim());
                    en = parts[0] || b.name;
                    ar = parts[1] || parts[0] || b.name;
                }
                const productImg = b.products[0]?.images ? b.products[0].images.split(',')[0].trim() : null;
                return {
                    id: b.id,
                    name: en,
                    nameAr: ar,
                    fullName: b.name,
                    slug: b.slug,
                    description: b.description,
                    image: b.image || productImg || '/logo.png',
                    productCount: b._count.products
                };
            }).filter(b => b.image && b.image !== '/placeholder.svg');
        } catch (error) {
            console.error("Failed to fetch rail brands:", error);
            return [];
        }
    },
    ["home-rail-brands-v2"],
    { tags: ["brands", "catalog"], revalidate: 3600 }
);

export async function getHomeRailCategories() {
    try {
        const mainCats = await prisma.mainCategory.findMany({
            where: {
                isActive: true,
                NOT: [
                    { image: null },
                    { image: '/placeholder.svg' },
                    { image: '' }
                ]
            },
            orderBy: { navOrder: 'asc' },
            include: {
                products: {
                    where: {
                        price: { gte: 0 },
                        NOT: [
                            { images: '/placeholder.svg' },
                            { images: '' }
                        ]
                    },
                    take: 1,
                    select: { images: true }
                }
            }
        });
        return mainCats.map(mc => {
            const productImg = mc.products[0]?.images ? mc.products[0].images.split(',')[0].trim() : null;
            return {
                id: mc.id,
                name: mc.description || mc.name,
                nameAr: mc.name,
                slug: mc.slug,
                image: mc.image || productImg || ''
            };
        }).filter(c => c.image && c.image !== '/placeholder.svg');
    } catch (error) {
        console.error("Failed to fetch rail categories:", error);
        return [];
    }
}

export const getCategoryHighlightCardsData = unstable_cache(
    async () => {
        try {
            const topMainCats = await prisma.mainCategory.findMany({
                where: {
                    isActive: true,
                    NOT: [
                        { image: null },
                        { image: '/placeholder.svg' },
                        { image: '' }
                    ],
                    products: {
                        some: {
                            price: { gte: 0 },
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        }
                    }
                },
                take: 4,
                orderBy: [
                    { isFeatured: 'desc' },
                    { navOrder: 'asc' }
                ],
                include: {
                    products: {
                        where: {
                            price: { gte: 0 },
                            NOT: [
                                { images: '/placeholder.svg' },
                                { images: '' }
                            ]
                        },
                        take: 1,
                        orderBy: { isTrending: 'desc' },
                        select: {
                            id: true,
                            name: true,
                            nameAr: true,
                            nameEn: true,
                            price: true,
                            images: true,
                            slug: true
                        }
                    },
                    brands: {
                        take: 2,
                        select: { name: true }
                    }
                }
            });
            return topMainCats.map(mc => {
                const firstProd = mc.products[0];
                const brandNames = mc.brands.map(b => b.name).join(' & ');
                const prodImg = firstProd?.images ? firstProd.images.split(',')[0].trim() : (mc.image || '');
                return {
                    id: mc.id,
                    slug: mc.slug,
                    subheadingAr: mc.name,
                    subheadingEn: mc.description || mc.name,
                    headingAr: brandNames || mc.name,
                    headingEn: brandNames || mc.description || mc.name,
                    productNameAr: firstProd?.nameAr || firstProd?.name || mc.name,
                    productNameEn: firstProd?.nameEn || firstProd?.name || mc.description || mc.name,
                    priceText: firstProd?.price && Number(firstProd.price) > 0 ? `$${Number(firstProd.price).toFixed(2)}` : '',
                    heroImage: mc.image || prodImg,
                    productThumb: prodImg,
                    productSlug: firstProd?.slug || ''
                };
            });
        } catch (error) {
            console.error("Failed to fetch highlight cards data:", error);
            return [];
        }
    },
    ["category-highlight-cards"],
    { tags: ["categories", "catalog"], revalidate: 3600 }
);

export const getApprovedReviews = unstable_cache(
    async () => {
        try {
            const reviews = await prisma.review.findMany({
                where: { isApproved: true },
                take: 6,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            nameAr: true,
                            nameEn: true,
                            images: true,
                            slug: true
                        }
                    }
                }
            });
            if (reviews.length === 0) {
                const sampleProducts = await prisma.product.findMany({
                    take: 3,
                    select: { nameAr: true, nameEn: true, images: true, slug: true }
                });
                return [
                    {
                        id: 'rev-1',
                        name: 'سوبرماركت الشام الحديث',
                        feedback: 'أفضل موزع معتمد لوكالات زوان والريف. سرعة في تلبية طلبيات الطرود وتأكيد مباشر وسلس عبر واتساب.',
                        rating: 5,
                        image: sampleProducts[0]?.images ? sampleProducts[0].images.split(',')[0].trim() : '/logo.png',
                        productNameAr: sampleProducts[0]?.nameAr || 'منتجات زوان الغذائية',
                        productNameEn: sampleProducts[0]?.nameEn || 'Zwan Food Products',
                        productSlug: sampleProducts[0]?.slug || ''
                    },
                    {
                        id: 'rev-2',
                        name: 'ميني ماركت الهدى',
                        feedback: 'التوريد منتظم جداً ومواصفات التعبئة واضحة بالطرود، مما يسهل جرد وتوزيع البضائع في المحل بدقة.',
                        rating: 5,
                        image: sampleProducts[1]?.images ? sampleProducts[1].images.split(',')[0].trim() : '/logo.png',
                        productNameAr: sampleProducts[1]?.nameAr || 'سمن وزيوت الريف',
                        productNameEn: sampleProducts[1]?.nameEn || 'Al-Reef Ghee & Oils',
                        productSlug: sampleProducts[1]?.slug || ''
                    },
                    {
                        id: 'rev-3',
                        name: 'بقالة البركة التجارية',
                        feedback: 'توفير كبرى الوكالات بطلب واحد وفر علينا وقتاً كبيراً في التواصل واللوجستيات مع الموزعين.',
                        rating: 5,
                        image: sampleProducts[2]?.images ? sampleProducts[2].images.split(',')[0].trim() : '/logo.png',
                        productNameAr: sampleProducts[2]?.nameAr || 'منظفات بوفالو وروكافيرا',
                        productNameEn: sampleProducts[2]?.nameEn || 'Buffalo & Rocavera Cleaners',
                        productSlug: sampleProducts[2]?.slug || ''
                    }
                ];
            }

            return reviews.map(r => ({
                id: r.id,
                name: r.name,
                feedback: r.feedback || '',
                rating: r.rating,
                image: r.product?.images ? r.product.images.split(',')[0].trim() : '/placeholder.svg',
                productNameAr: r.product?.nameAr || r.product?.name || '',
                productNameEn: r.product?.nameEn || r.product?.name || '',
                productSlug: r.product?.slug || ''
            }));
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            return [];
        }
    },
    ["approved-reviews"],
    { tags: ["reviews"], revalidate: 3600 }
);

export const getFeaturedCategories = unstable_cache(
    async () => {
        try {
            const categories = await prisma.category.findMany({
                where: {
                    isFeatured: true,
                    brand: { isActive: true },
                },
                take: 12,
                orderBy: { updatedAt: 'desc' },
                include: {
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
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
                    }
                }
            });
            return categories.map(category => {
                const prodImg = category.products[0]?.images ? category.products[0].images.split(',')[0].trim() : '/logo.png';
                return {
                    id: category.id,
                    name: category.name,
                    nameEn: category.description || category.name,
                    description: category.description,
                    image: category.image && category.image !== '/placeholder.svg' ? category.image : prodImg,
                    slug: category.slug,
                    brandId: category.brandId,
                    isFeatured: category.isFeatured,
                    brand: category.brand ? {
                        id: category.brand.id,
                        name: category.brand.name.split('-')[0].trim(),
                        slug: category.brand.slug,
                    } : null,
                    createdAt: category.createdAt.toISOString(),
                    updatedAt: category.updatedAt.toISOString(),
                };
            });
        } catch (error) {
            console.error("Failed to fetch featured categories:", error);
            return [];
        }
    },
    ["featured-categories"],
    { tags: ["categories", "catalog"], revalidate: 3600 }
);

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

export const getOnSaleProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    brand: { isActive: true },
                    discountPrice: {
                        not: null
                    }
                },
                take: 10,
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
            console.error("Failed to fetch on sale products:", error);
            return [];
        }
    },
    ["on-sale-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getMainCategoryBrands = unstable_cache(
    async (): Promise<HomeBrand[]> => {
        try {
            return await prisma.brand.findMany({
                where: {
                    group: BrandGroup.MAIN,
                    isActive: true,
                },
                take: 4,
                orderBy: [
                    { name: 'asc' },
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
            console.error("Failed to fetch main category brands:", error);
            return [];
        }
    },
    ["main-category-brands"],
    { tags: ["brands", "main-categories"], revalidate: 3600 }
);

export const getBestSellerProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    isTrending: true,
                    brand: { isActive: true },
                    stock: { gt: 0 },
                    price: { gte: 0 },
                    NOT: [
                        { images: '/placeholder.svg' },
                        { images: '' }
                    ],
                },
                take: 10,
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
            console.error("Failed to fetch best seller products:", error);
            return [];
        }
    },
    ["bestseller-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getNewArrivalProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    brand: { isActive: true },
                    stock: { gt: 0 },
                    price: { gte: 0 },
                    NOT: [
                        { images: '/placeholder.svg' },
                        { images: '' }
                    ],
                },
                take: 10,
                include: { category: true, brand: true },
                orderBy: { createdAt: 'desc' }
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
            console.error("Failed to fetch new arrival products:", error);
            return [];
        }
    },
    ["new-arrival-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export const getTrendingWeeklyProducts = unstable_cache(
    async () => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    brand: { isActive: true },
                    stock: { gt: 0 },
                    price: { gte: 0 },
                    NOT: [
                        { images: '/placeholder.svg' },
                        { images: '' }
                    ],
                },
                take: 9,
                include: { category: true, brand: true },
                orderBy: [
                    { isTrending: 'desc' },
                    { updatedAt: 'desc' },
                ]
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
            console.error("Failed to fetch trending weekly products:", error);
            return [];
        }
    },
    ["trending-weekly-products"],
    { tags: ["products", "catalog"], revalidate: 3600 }
);

export async function getCategoriesForCleanup() {
    try {
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
        const zadLandBrandId = await getZadLandBrandId();
        
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

        revalidatePath('/');
        revalidatePath('/admin/banners');

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

        revalidatePath('/');
        revalidatePath('/admin/banners');

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
        await prisma.banner.delete({
            where: { id }
        });

        revalidatePath('/');
        revalidatePath('/admin/banners');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete banner:", error);
        return { success: false, error: "Failed to delete banner" };
    }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
    try {
        await prisma.banner.update({
            where: { id },
            data: { isActive }
        });

        revalidatePath('/');
        revalidatePath('/admin/banners');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle banner status:", error);
        return { success: false, error: "Failed to toggle banner status" };
    }
}

export const getActiveBanners = unstable_cache(
    async () => {
        try {
            const banners = await prisma.banner.findMany({
                where: {
                    isActive: true
                },
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
            console.error("Failed to fetch active banners:", error);
            return [];
        }
    },
    ["active-banners-v2"],
    { tags: ["banners"], revalidate: 3600 }
);

export interface PromoCodeInput {
    code: string;
    discountPercentage: number;
    delegateName?: string;
    isActive?: boolean;
}

export async function getPromoCodes() {
    try {
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
        const promoCode = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!promoCode) {
            return { success: false, error: "Invalid promo code" };
        }

        if (!promoCode.isActive) {
            return { success: false, error: "Promo code is inactive" };
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
        return { success: false, error: "Failed to validate promo code" };
    }
}

import bcrypt from "bcryptjs";

export async function getAdminUser() {
    try {
        const user = await prisma.user.findFirst();
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
        const user = await prisma.user.findFirst();
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

export const getSiteSettings = unstable_cache(
    async () => {
        try {
            const settings = await prisma.settings.findUnique({
                where: { id: "site-settings" }
            });
            
            if (!settings) {
                // Return default settings if not found
                return {
                    id: "site-settings",
                    categoriesCtaTitle: "Looking for specific wholesale brands?",
                    categoriesCtaDesc: "Our wholesale team is ready to provide custom pricing and scheduled deliveries for your business.",
                    categoriesCtaTitleAr: "تبحث عن شركات أو منتجات محددة؟",
                    categoriesCtaDescAr: "فريق المبيعات لدينا جاهز لتزويدكم بأفضل أسعار الجملة وجداول التوزيع المنتظمة.",
                    categoriesCtaImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-S_GMsoebb73JIEWcxtvH2G-vVgkfypE8ysWpGMNiiiwyTno8rIbMCpHR-fsa76ZQL49aYswb7bGZh-kgwc6z9lv0VwUSUrStxNWz2qU3RuIb75ShOMAKZMRyrOXZHZjEBgtxfW7r97FEEshOkEd2MqgE6FpGYrmKa8msLtMOQxXBsmhr3ZGGEtL7jpzgMYbgrAXhiHcMfCspdvD5FRNuSbgFY9_xGqcJM9KbgG0MoC4Ie4WkkmCR4FsuavfglcnY13G2ADZxlK8F",
                    footerBrandTitle: "Hawa Distribution",
                    footerBrandTitleAr: "شركة حوا للتوزيع والتجارة",
                    footerBrandDescription: "Your trusted partner in wholesale food and consumer goods distribution from top international brands.",
                    footerBrandDescriptionAr: "شريككم الموثوق لتوزيع البضائع والمواد الغذائية من أفضل الشركات العالمية.",
                    footerCopyright: "© 2026 Hawa Distribution. All rights reserved.",
                    footerCopyrightAr: "© 2026 شركة حوا للتوزيع والتجارة. جميع الحقوق محفوظة.",
                    footerInstagramUrl: "#",
                    footerFacebookUrl: "#",
                    footerWhatsappUrl: "#",
                    whatsappNumber: "+963900000000",
                    footerShopTitle: "Shop",
                    footerShopTitleAr: "المتجر",
                    footerSupportTitle: "Support",
                    footerSupportTitleAr: "الدعم",
                    footerCompanyTitle: "Company",
                    footerCompanyTitleAr: "الشركة",
                    footerSupportLink1Label: "Help Center",
                    footerSupportLink1LabelAr: "مركز المساعدة",
                    footerSupportLink1Url: "#",
                    footerSupportLink2Label: "Shipping & Returns",
                    footerSupportLink2LabelAr: "التوزيع والتسليم",
                    footerSupportLink2Url: "/shipping-returns",
                    footerSupportLink3Label: "Contact Us",
                    footerSupportLink3LabelAr: "اتصل بنا",
                    footerSupportLink3Url: "#",
                    footerCompanyLink1Label: "About Us",
                    footerCompanyLink1LabelAr: "من نحن",
                    footerCompanyLink1Url: "/about-us",
                    footerCompanyLink2Label: "",
                    footerCompanyLink2LabelAr: "",
                    footerCompanyLink2Url: "",
                    footerCompanyLink3Label: "",
                    footerCompanyLink3LabelAr: "",
                    footerCompanyLink3Url: "",
                    footerCategory1Id: null,
                    footerCategory2Id: null,
                    footerCategory3Id: null,
                    footerCategory4Id: null,
                    shippingTitle: "Fast & Reliable Distribution",
                    shippingDesc: "We ensure wholesale goods reach your business in perfect condition.",
                    shippingTitleAr: "توزيع سريع وموثوق",
                    shippingDescAr: "نحن نضمن وصول بضائع الجملة إلى نشاطكم التجاري في أفضل حالة.",
                    verificationTitle: "Verification Process",
                    verificationDesc: "Orders are verified and scheduled immediately with our logistics fleet.",
                    verificationTitleAr: "عملية التحقق",
                    verificationDescAr: "يتم التحقق من الطلبات وجدولتها فوراً مع أسطولنا اللوجستي.",
                    standardShippingTime: "1-3 Business Days",
                    expressShippingTime: "24 Hours",
                    returnsTitle: "Wholesale Support",
                    returnsDesc: "We are committed to full satisfaction and verified shipment handling.",
                    returnsTitleAr: "دعم الجملة",
                    returnsDescAr: "نحن ملتزمون بالجودة والمطابقة التامة للشحنات.",
                    finalSaleTitle: "Wholesale Delivery Terms",
                    finalSaleDesc: "All goods are shipped in factory-sealed cases conforming to international standards.",
                    finalSaleTitleAr: "شروط تسليم الجملة",
                    finalSaleDescAr: "يتم تسليم البضائع في كراتين المصنع الأصلية والمطابقة للمواصفات القياسية.",
                    hygieneTitle: "Safety & Temperature Storage",
                    hygieneDesc: "Our temperature-controlled warehouses ensure optimal quality preservation.",
                    hygieneTitleAr: "بروتوكولات السلامة والتخزين",
                    hygieneDescAr: "تضمن مستودعاتنا وشاحناتنا درجات حرارة وبيئة تخزين مثالية حتى نقطة التسليم.",
                    shippingReturnsImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1GmfD6bueEsJqlHNPjDWHMlhsLZSm2Jmp21TUCLKvobkcd7oAPMMdwzfm8BOHC5XtR0EP6tLI7DT5hhyLxuijsbpX2kQf6iNlqROU-8k-DrqZAUqdc7-0lE4nxuCcLaEb0fEaXVBxc_yXkiUlyhfvaYJ1FfHZtngnoJbeanLgsf7rcxqON6rjkoC4BQv6FhlwLNKZrMbxjCugphq-bo5GCqBoLfmjjZSuH0N5eV-Kz33xFQTD5jSYCTsVYAwOkwhLQsQiPD_lnD9U",
                    
                    aboutHeroTitle: "Our Story",
                    aboutHeroTitleAr: "قصتنا",
                    aboutHeroSubtitle: "Your trusted partner for distributing top quality global goods and food products.",
                    aboutHeroSubtitleAr: "شريككم الموثوق لتوزيع البضائع والمواد الغذائية من أفضل الشركات العالمية.",
                    middleBanner1Image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?w=1200",
                    middleBanner1Link: "/products",
                    middleBanner2Image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200",
                    middleBanner2Link: "/products",
                    middleBanner2Title: "Global Brands",
                    middleBanner2TitleAr: "شركات عالمية",
                    middleBanner2Subtitle: "Discover the best products from around the world.",
                    middleBanner2SubtitleAr: "اكتشف أفضل المنتجات من كبرى الشركات العالمية.",
                    middleBanner2ButtonText: "Explore Catalog",
                    middleBanner2ButtonTextAr: "تصفح الكتالوج",
                    exchangeRate: 135,
                    statDeliveries: "+9000",
                    statBrands: "+100",
                    statProducts: "+500",
                    statClients: "+300",
                    aboutHeroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8qN2iAHz-UZeEQfqOY49U5OCZ5z4ejVm7ILFjFSl9S5xg_6UuBa61qOmrkMPrBa4CuXDzHa9EN3-LNyUxi5IDK5A9TvJWkNuG-tt_RRyvJH8LvynO1daOEkTk47KDtkW3Md2ugZYShZJdxolsjiJUtDdOOz4Q7-6TNrexIvyClP0ADf1TWdbCUk1kBn8bfzhTC1cn8s9jG3yt0tDDht7__J5YKKf690SmKN4WIJX_pc2LOj3x1CnYk5JuqEu0Bzp2vGwsrYLaJWb",
                    
                    aboutNarrativeTitle: "Our Mission for Quality Distribution",
                    aboutNarrativeTitleAr: "مهمتنا في التوزيع الموثوق",
                    aboutNarrativeFounded: "Founded with Trust",
                    aboutNarrativeFoundedAr: "تأسست على الثقة",
                    aboutNarrativeDesc1: "At Hawa Distribution, we bridge the gap between world-renowned international brands and local markets. We believe in providing retailers and businesses with seamless access to authentic, top-tier goods at competitive wholesale prices.",
                    aboutNarrativeDesc1Ar: "في شركة حوا للتوزيع والتجارة، نعمل كجسر موثوق يربط بين كبرى الشركات والعلامات التجارية والأسواق المحلية والمحلات التجارية.",
                    aboutNarrativeDesc2: "With rigorous quality control, modern logistics, and a commitment to reliability, Hawa Distribution has established itself as the trusted partner for food and consumer goods distribution across all governorates.",
                    aboutNarrativeDesc2Ar: "بفضل أسطول التوزيع المنظم والمستودعات المجهزة، أثبتت شركة حوا مكانتها كشريك رائد وموثوق لتوزيع البضائع الغذائية والاستهلاكية في جميع المحافظات.",
                    aboutNarrativeQuote: "Connecting you with the world's finest brands.",
                    aboutNarrativeQuoteAr: "جودة مضمونة وخدمة توزيع موثوقة.",
                    aboutNarrativeImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4yp4c_LJLNPwaV2ay8DZ6xRHD0UF1WqXU8eDtrdDoiVjtq9oNRc9Cn6cnbqsNwOLO-y-99jnkiLnCsGLs2rQqthU8TPqhAh2Msisbst1UyfyrILBR5fRO7KYu90u1FEoeRRjGceGVbB5vz2SJAtjzUrLLtA6BmR8VN5a5Seo4MraBJj7i4Gs4QPEZbURtSN-F7wbJsu4WNj3pEaWlye2SuJvokQhYXJ27gnAoabHg5_0_4DZY49qyKnQuMHHL9atOIILRIMD3FkeZ",
                    
                    aboutValuesTitle: "Our Core Values",
                    aboutValuesTitleAr: "قيمنا الجوهرية",
                    aboutValuesDesc: "We are committed to transparency, sustainability, and ethical practices in everything we do.",
                    aboutValuesDescAr: "نحن ملتزمون بالشفافية والاستدامة والممارسات الأخلاقية في كل ما نقوم به.",
                    
                    aboutValue1Title: "Cruelty-Free",
                    aboutValue1TitleAr: "خالٍ من القسوة",
                    aboutValue1Desc: "We never test on animals. Our products are certified cruelty-free by Leaping Bunny.",
                    aboutValue1DescAr: "نحن لا نختبر أبدًا على الحيوانات. منتجاتنا معتمدة خالية من القسوة من قبل Leaping Bunny.",
                    
                    aboutValue2Title: "100% Vegan",
                    aboutValue2TitleAr: "نباتي 100٪",
                    aboutValue2Desc: "No animal-derived ingredients. Just pure, potent plant power.",
                    aboutValue2DescAr: "لا توجد مكونات مشتقة من الحيوانات. فقط قوة نباتية نقية وفعالة.",
                    
                    aboutValue3Title: "Sustainable",
                    aboutValue3TitleAr: "مستدام",
                    aboutValue3Desc: "Eco-friendly packaging and responsibly sourced ingredients.",
                    aboutValue3DescAr: "تغليف صديق للبيئة ومكونات من مصادر مسؤولة.",
                    
                    updatedAt: new Date(),
                };
            }
            
            return {
                ...settings,
                whatsappNumber: settings.whatsappNumber || "+963900000000",
                exchangeRate: Number(settings.exchangeRate),
                statDeliveries: settings.statDeliveries || "+9000",
                statBrands: settings.statBrands || "+100",
                statProducts: settings.statProducts || "+500",
                statClients: settings.statClients || "+300",
            };
        } catch (error) {
            console.error("Failed to fetch site settings:", error);
            return null;
        }
    },
    ["site-settings-v2"],
    { tags: ["settings"], revalidate: 3600 }
);

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
        await prisma.settings.upsert({
            where: { id: "site-settings" },
            update: data,
            create: {
                id: "site-settings",
                ...data
            }
        });

        revalidatePath('/', 'layout');
        revalidatePath('/categories');
        revalidatePath('/shipping-returns');
        revalidatePath('/about-us');
        revalidatePath('/products');
        revalidatePath('/admin/site-content');
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
        await prisma.product.updateMany({
            where: {
                id: { in: ids }
            },
            data: { isTrending }
        });

        revalidatePath('/');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Failed to bulk toggle trending status:", error);
        return { success: false, error: "Failed to bulk toggle trending status" };
    }
}

export async function bulkRemoveSale(ids: string[]) {
    try {
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

        revalidatePath('/');
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error("Failed to bulk remove sale:", error);
        return { success: false, error: "Failed to bulk remove sale" };
    }
}

export async function bulkDeleteProducts(ids: string[]) {
    try {
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

        revalidatePath('/');
        revalidatePath('/admin/categories');
        revalidatePath('/admin/products');

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

