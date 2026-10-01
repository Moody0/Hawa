"use server";
import { BrandGroup, OrderStatus } from './backend-types';
import { laravelJson, laravelRequest } from './laravel-server';
import { revalidatePath } from 'next/cache';
export type CacheEntity = 'catalog' | 'products' | 'categories' | 'main-categories' | 'brands' | 'banners' | 'settings' | 'navigation' | 'reviews';
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
    mainCategoryId?: string | null;
}
interface BrandInput {
    name: string;
    nameEn: string;
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
    nameEn?: string | null;
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
        nameEn: string | null;
        stock: number;
        price: number;
        image: string;
        categoryName: string;
    }[];
    topProducts: {
        id: string;
        name: string;
        nameAr: string | null;
        nameEn: string | null;
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
        orderNumber: number;
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
                nameAr: string | null;
                nameEn: string | null;
                images: string;
            } | null;
        }[];
    }[];
}
interface MainCategoryInput {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    showInNav?: boolean;
    navOrder?: number;
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
export interface PromoCodeInput {
    code: string;
    discountPercentage: number;
    delegateName?: string;
    isActive?: boolean;
}
async function request<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> { const response = await laravelRequest('/api' + path, { method, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }); const data = await response.json(); if (!response.ok)
    throw new Error(data.message || data.error || 'Request failed'); return data; }
async function mutation(path: string, method: string, body?: unknown): Promise<any> { try {
    const result = await request(path, method, body);
    revalidatePath('/', 'layout');
    return { success: true, ...result };
}
catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Request failed' };
} }
export async function createBrand(data: BrandInput) { return mutation('/admin/brands', 'POST', data); }
export async function updateBrand(id: string, data: BrandInput) { return mutation('/admin/brands/' + encodeURIComponent(id), 'PATCH', data); }
export async function deleteBrand(id: string) { return mutation('/admin/brands/' + encodeURIComponent(id), 'DELETE'); }
export async function createMainCategory(data: MainCategoryInput) { return mutation('/admin/main-categories', 'POST', data); }
export async function updateMainCategory(id: string, data: MainCategoryInput) { return mutation('/admin/main-categories/' + encodeURIComponent(id), 'PATCH', data); }
export async function deleteMainCategory(id: string) { return mutation('/admin/main-categories/' + encodeURIComponent(id), 'DELETE'); }
export async function createCategory(data: CategoryInput) { return mutation('/admin/categories', 'POST', data); }
export async function updateCategory(id: string, data: CategoryInput) { return mutation('/admin/categories/' + encodeURIComponent(id), 'PATCH', data); }
export async function deleteCategory(id: string) { return mutation('/admin/categories/' + encodeURIComponent(id), 'DELETE'); }
export async function createProduct(data: ProductInput) { return mutation('/admin/products', 'POST', data); }
export async function updateProduct(id: string, data: ProductInput) { return mutation('/admin/products/' + encodeURIComponent(id), 'PATCH', data); }
export async function deleteProduct(id: string) { return mutation('/admin/products/' + encodeURIComponent(id), 'DELETE'); }
export async function createBanner(data: BannerInput) { return mutation('/admin/banners', 'POST', data); }
export async function updateBanner(id: string, data: BannerInput) { return mutation('/admin/banners/' + encodeURIComponent(id), 'PATCH', data); }
export async function deleteBanner(id: string) { return mutation('/admin/banners/' + encodeURIComponent(id), 'DELETE'); }
export async function createPromoCode(data: PromoCodeInput) { return mutation('/admin/promo-codes', 'POST', data); }
export async function updatePromoCode(id: string, data: PromoCodeInput) { return mutation('/admin/promo-codes/' + encodeURIComponent(id), 'PATCH', data); }
export async function deletePromoCode(id: string) { return mutation('/admin/promo-codes/' + encodeURIComponent(id), 'DELETE'); }
export async function toggleBrandActive(id: string, isActive: boolean) { return mutation(`/admin/brands/${encodeURIComponent(id)}`, 'PATCH', { isActive }); }
export async function toggleBrandFeatured(id: string, isFeatured: boolean) { return mutation(`/admin/brands/${encodeURIComponent(id)}`, 'PATCH', { isFeatured }); }
export async function toggleMainCategoryActive(id: string, isActive: boolean) { return mutation(`/admin/main-categories/${encodeURIComponent(id)}`, 'PATCH', { isActive }); }
export async function toggleMainCategoryFeatured(id: string, isFeatured: boolean) { return mutation(`/admin/main-categories/${encodeURIComponent(id)}`, 'PATCH', { isFeatured }); }
export async function toggleCategoryActive(id: string, isActive: boolean) { return mutation(`/admin/categories/${encodeURIComponent(id)}`, 'PATCH', { isActive }); }
export async function toggleCategoryFeatured(id: string, isFeatured: boolean) { return mutation(`/admin/categories/${encodeURIComponent(id)}`, 'PATCH', { isFeatured }); }
export async function toggleProductTrending(id: string, isTrending: boolean) { return mutation(`/admin/products/${encodeURIComponent(id)}`, 'PATCH', { isTrending }); }
export async function toggleBannerStatus(id: string, isActive: boolean) { return mutation(`/admin/banners/${encodeURIComponent(id)}`, 'PATCH', { isActive }); }
export async function togglePromoCodeStatus(id: string, isActive: boolean) { return mutation(`/admin/promo-codes/${encodeURIComponent(id)}`, 'PATCH', { isActive }); }
export async function getDashboardStats(): Promise<DashboardStats> { return request('/admin/dashboard'); }
export async function getAdminBrands(): Promise<any[]> { try {
    return await request('/admin/brands');
}
catch {
    return (await request('/admin/catalog-lookups')).brands;
} }
export async function getAdminMainCategories(): Promise<any[]> { try {
    return await request('/admin/main-categories');
}
catch {
    return (await request('/admin/catalog-lookups')).mainCategories;
} }
export async function getCatalogFormOptions(): Promise<{
    brands: any[];
    mainCategories: any[];
    categories: any[];
}> { return request('/admin/catalog-lookups'); }
export async function getAdminBanners(): Promise<any[]> { return request('/admin/banners'); }
export async function getPromoCodes(): Promise<any[]> { return request('/admin/promo-codes'); }
export async function getAdminProducts(options?: {
    cursor?: string;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    search?: string;
}): Promise<any[]> { const query = new URLSearchParams(Object.entries(options || {}).map(([k, v]) => [k, String(v)])); if (!query.has('limit'))
    query.set('limit', '1000'); return request('/admin/products?' + query); }
export async function getAdminCategories(page = 1, limit = 100, categoryId?: string): Promise<{
    categories: any[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}> { const result = await request<{
    items: any[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}>('/admin/categories?envelope=true&page=' + page + '&limit=' + limit + (categoryId ? '&categoryId=' + encodeURIComponent(categoryId) : '')); return { categories: result.items, pagination: result.pagination }; }
export async function getAdminOrders(page = 1, limit = 50): Promise<{
    orders: any[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}> { return request('/admin/orders?page=' + page + '&limit=' + limit); }
export async function updateOrderStatus(id: string, status: OrderStatus, cancellationReason?: string) { return mutation(`/admin/orders/${encodeURIComponent(id)}/status`, 'PATCH', { status, cancellationReason }); }
export async function updateOrderPricing(id: string, itemPrices: Array<{
    itemId: string;
    price: number;
}>): Promise<{
    success: boolean;
    error?: string;
    totalAmount: number;
    itemPrices: Array<{
        itemId: string;
        price: number;
    }>;
}> { return mutation(`/admin/orders/${encodeURIComponent(id)}/pricing`, 'PATCH', { itemPrices }); }
export async function deleteOrder(id: string) { return mutation(`/admin/orders/${encodeURIComponent(id)}`, 'DELETE'); }
export async function getCategoriesForCleanup(): Promise<any[]> { return (await getAdminCategories(1, 1000)).categories; }
export async function bulkFixCategoryNames(mapping: {
    id: string;
    newName: string;
}[]) { return mutation('/admin/bulk', 'POST', { action: 'renameCategories', mapping }); }
export async function bulkCreateProducts(rows: ProductImportRow[]) { return mutation('/admin/products/import', 'POST', { rows }); }
export async function validatePromoCode(code: string): Promise<any> { return mutation('/promotions/validate', 'POST', { code }); }
export async function getAdminUser(): Promise<any> { return (await request('/admin/credentials')).user; }
export async function updateAdminCredentials(data: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
}) { return mutation('/admin/credentials', 'PATCH', data); }
export async function updateSiteSettings(data: Record<string, unknown>) { return mutation('/admin/settings', 'PUT', data); }
export async function updatePrivacyPolicyContent(input: unknown) { return mutation('/admin/settings', 'PUT', { privacyPolicyContent: input }); }
export async function bulkToggleTrending(ids: string[], value: boolean) { return mutation('/admin/bulk', 'POST', { action: 'toggleTrending', ids, value }); }
export async function bulkRemoveSale(ids: string[]) { return mutation('/admin/bulk', 'POST', { action: 'removeSale', ids }); }
export async function bulkDeleteProducts(ids: string[]) { return mutation('/admin/bulk', 'POST', { action: 'deleteProducts', ids }); }
export async function bulkDeleteCategories(ids: string[]) { return mutation('/admin/bulk', 'POST', { action: 'deleteCategories', ids }); }
export async function getFeaturedMainBrands(): Promise<HomeBrand[]> { return laravelJson('/api/storefront/getFeaturedMainBrands', []); }
export async function getHomeCollectionSections(): Promise<HomeCollectionSection[]> { return laravelJson('/api/storefront/getHomeCollectionSections', []); }
export async function getTrendingProducts(): Promise<any[]> { return laravelJson('/api/storefront/getTrendingProducts', []); }
