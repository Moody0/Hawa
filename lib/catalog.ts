export interface CatalogCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    mainCategoryId?: string | null;
    mainCategory?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    redirectSlugs?: string[];
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
    isFeatured: boolean;
    mainCategory?: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    } | null;
}
import { cache } from 'react';
import { laravelJson } from './laravel-server';
import type { ParsedCatalogParams } from './catalog-url';
export const getCatalogBrands = cache(async (mainCategoryId?: string): Promise<CatalogBrand[]> => laravelJson('/api/brands' + (mainCategoryId ? '?mainCategoryId=' + encodeURIComponent(mainCategoryId) : ''), []));
export const getBrandBySlug = cache(async (slug: string) => { const rows = await getCatalogBrands(); return rows.find(r => r.slug === decodeURIComponent(slug) || r.id === slug || r.name === decodeURIComponent(slug)) || null; });
export const getCatalogCategories = cache(async (brandId?: string): Promise<CatalogCategory[]> => laravelJson('/api/categories' + (brandId ? '?brandId=' + encodeURIComponent(brandId) : ''), []));
export const getFooterCategories = cache(async (preferredIds: string[] = []) => { const rows = await getCatalogCategories(); return preferredIds.length ? preferredIds.flatMap(id => rows.filter(r => r.id === id)).slice(0, 4) : rows.slice(0, 4); });
export const getCategoryBySlug = cache(async (slug: string) => { const decoded = decodeURIComponent(slug); const rows = await getCatalogCategories(); return rows.find(r => r.slug === decoded || r.redirectSlugs?.includes(decoded) || r.id === slug || r.name === decoded) || null; });
export const getCatalogCategoriesByMainCategory = cache(async (id: string): Promise<CatalogCategory[]> => laravelJson('/api/categories?mainCategoryId=' + encodeURIComponent(id), []));
export const getCatalogMainCategories = cache(async (): Promise<any[]> => laravelJson('/api/main-categories', []));
export const getCatalogMainCategoryBySlug = cache(async (slug: string) => { const rows = await getCatalogMainCategories(); return rows.find(r => r.slug === decodeURIComponent(slug) || r.id === slug || r.name === decodeURIComponent(slug)) || null; });
export async function fetchProductBySlug(slug: string): Promise<any | null> { return laravelJson('/api/products/' + encodeURIComponent(slug), null); }
export async function fetchCatalogProducts(options: Record<string, unknown> = {}): Promise<any[]> { const query = new URLSearchParams(Object.entries(options).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])); const data = await laravelJson<{
    products: any[];
}>('/api/products?' + query, { products: [] }); return data.products; }
export const getCatalogInitialData = cache(async (categoryId?: string, brandId?: string, mainCategoryId?: string, search?: string, options: Partial<ParsedCatalogParams> = {}) => {
    const query = new URLSearchParams({ limit: '36', sort: options.sort || 'best_sellers', page: String(options.page || 1) });
    const categoryTokens = options.categories?.length ? options.categories : categoryId ? [categoryId] : [];
    const brandTokens = options.brands?.length ? options.brands : brandId ? [brandId] : [];
    if (categoryTokens.length) query.set('categoryIds', categoryTokens.join(','));
    if (brandTokens.length) query.set('brandIds', brandTokens.join(','));
    if (mainCategoryId || options.mainCategory) query.set('mainCategoryId', mainCategoryId || options.mainCategory!);
    if (search) query.set('search', search);
    if (options.inStock) query.set('inStock', 'true');
    if (options.onSale) query.set('onSale', 'true');
    if (options.isTrending) query.set('isTrending', 'true');
    const [categories, result] = await Promise.all([brandId ? getCatalogCategories(brandId) : mainCategoryId ? getCatalogCategoriesByMainCategory(mainCategoryId) : getCatalogMainCategories(), laravelJson<{
        products: any[];
        pagination: {
            total: number;
            pages: number;
            page: number;
            limit: number;
        };
    }>('/api/products?' + query, { products: [], pagination: { total: 0, pages: 0, page: 1, limit: 36 } })]); return { categories, products: result.products, totalProducts: result.pagination.total, pagination: result.pagination }; });
