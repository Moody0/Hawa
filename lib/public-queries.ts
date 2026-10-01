import 'server-only';
import { DEFAULT_SITE_SETTINGS, type RailBrand, type PublicTestimonialItem, type PublicFeaturedCategory, type HomeBrand } from './public-defaults';
export * from './public-defaults';
import { laravelJson } from './laravel-server';
export async function getHomeRailBrands(): Promise<RailBrand[]> { return laravelJson<RailBrand[]>('/api/storefront/getHomeRailBrands', []); }
export async function getHomeRailCategories(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getHomeRailCategories', []); }
export async function getCategoryHighlightCardsData(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getCategoryHighlightCardsData', []); }
export async function getApprovedReviews(): Promise<PublicTestimonialItem[]> { return laravelJson<PublicTestimonialItem[]>('/api/storefront/getApprovedReviews', []); }
export async function getFeaturedCategories(): Promise<PublicFeaturedCategory[]> {
    return laravelJson<PublicFeaturedCategory[]>('/api/storefront/getFeaturedCategories', []);
}
export async function getOnSaleProducts(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getOnSaleProducts', []); }
export async function getMainCategoryBrands(): Promise<HomeBrand[]> { return laravelJson<HomeBrand[]>('/api/storefront/getMainCategoryBrands', []); }
export async function getBestSellerProducts(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getBestSellerProducts', []); }
export async function getNewArrivalProducts(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getNewArrivalProducts', []); }
export async function getTrendingWeeklyProducts(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getTrendingWeeklyProducts', []); }
export async function getActiveBanners(): Promise<any[]> { return laravelJson<any[]>('/api/storefront/getActiveBanners', []); }
export async function getSiteSettings() { const settings = await laravelJson<Record<string, any>>('/api/settings', {}); return { ...DEFAULT_SITE_SETTINGS, ...settings }; }
