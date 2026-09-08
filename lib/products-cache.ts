/**
 * Shared In-Memory Products & Catalog Cache
 *
 * Provides ultra-low-latency in-memory response caching for public catalog
 * and search queries, automatically invalidated on admin updates.
 */

export interface CachedProductsData {
    products: any[];
    total: number;
    timestamp: number;
}

const productsMemoryCache = new Map<string, CachedProductsData>();
const CACHE_TTL_MS = 60_000; // 60 seconds

export function getCachedProducts(key: string): CachedProductsData | null {
    const cached = productsMemoryCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp >= CACHE_TTL_MS) {
        productsMemoryCache.delete(key);
        return null;
    }
    return cached;
}

export function setCachedProducts(key: string, data: { products: any[]; total: number }) {
    if (productsMemoryCache.size > 500) {
        productsMemoryCache.clear();
    }
    productsMemoryCache.set(key, {
        products: data.products,
        total: data.total,
        timestamp: Date.now(),
    });
}

export function clearProductsApiCache() {
    productsMemoryCache.clear();
}
