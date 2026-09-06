"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import BrandMasthead from "./BrandMasthead";
import BrandCatalogToolbar, { CategoryItem } from "./BrandCatalogToolbar";
import EditorialProductCard, { Product as BrandProductItem } from "@/app/components/ProductsPageComponents/EditorialProductCard";
import { MdSearchOff, MdRefresh } from "react-icons/md";

interface BrandShowcaseClientProps {
    brand: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        group?: string;
        isFeatured?: boolean;
        mainCategory?: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
        } | null;
    };
    categories: CategoryItem[];
    initialProducts: BrandProductItem[];
    initialTotal: number;
    basePath?: string;
}

export default function BrandShowcaseClient({
    brand,
    categories,
    initialProducts,
    initialTotal,
    basePath = "/brands",
}: BrandShowcaseClientProps) {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const [products, setProducts] = useState<BrandProductItem[]>(initialProducts);
    const [totalProducts, setTotalProducts] = useState(initialTotal);
    const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState("best_sellers");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isInitialMount, setIsInitialMount] = useState(true);
    const observerRef = useRef<HTMLDivElement>(null);

    const hasMore = products.length < totalProducts;

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch Products
    const fetchProducts = useCallback(async (targetPage: number, reset: boolean) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", targetPage.toString());
            params.set("limit", "12");
            params.set("brandIds", brand.id);

            if (activeCategoryId !== "all") {
                params.set("categoryIds", activeCategoryId);
            }

            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            }

            if (sort === "price_asc") params.set("sort", "price_asc");
            else if (sort === "price_desc") params.set("sort", "price_desc");
            else if (sort === "newest") params.set("sort", "newest");
            if (!reset && targetPage > 1) {
                params.set("knownTotal", totalProducts.toString());
                params.set("skipCount", "true");
            }

            const res = await fetch(`/api/products?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (reset) {
                    setProducts(data.products || []);
                } else {
                    setProducts((prev) => {
                        const existingIds = new Set(prev.map((p) => p.id));
                        const uniqueNew = (data.products || []).filter((p: BrandProductItem) => !existingIds.has(p.id));
                        return [...prev, ...uniqueNew];
                    });
                }
                if (data.pagination?.total !== undefined) {
                    setTotalProducts(data.pagination.total);
                }
            }
        } catch (err) {
            console.error("Failed to load brand products", err);
        } finally {
            setLoading(false);
        }
    }, [brand.id, activeCategoryId, debouncedSearch, sort, totalProducts]);

    // React to filter, sort, or search changes
    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }

        setPage(1);
        fetchProducts(1, true);
    }, [activeCategoryId, debouncedSearch, sort, fetchProducts]);

    // React to page changes (infinite scroll)
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, false);
        }
    }, [page, fetchProducts]);

    // IntersectionObserver for Infinite Scroll
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((p) => p + 1);
                }
            },
            { rootMargin: "1000px" } // Early trigger 1000px before end
        );

        const current = observerRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [hasMore, loading]);

    const handleResetFilters = () => {
        setActiveCategoryId("all");
        setSearchQuery("");
        setSort("best_sellers");
    };

    return (
        <main className="flex-1 container-custom py-4 md:py-8">
            {/* Architectural Brand Masthead */}
            <BrandMasthead brand={brand} totalProducts={initialTotal} basePath={basePath} />

            {/* Catalog Command Bar: Search, Category Tabs, Sort */}
            <BrandCatalogToolbar
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sort={sort}
                onSortChange={setSort}
                totalResults={totalProducts}
                brandName={brand.name}
            />

            {/* Empty State */}
            {products.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/5 my-6">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-4">
                        <MdSearchOff className="text-3xl" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white mb-1.5">
                        {isArabic ? "لم يتم العثور على منتجات مطابقة" : "No Products Found"}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] max-w-sm mb-5">
                        {isArabic 
                            ? "جرّب تغيير كلمات البحث أو اختيار قسم مختلف من منتجات العلامة."
                            : "Try adjusting your search terms or picking another category."
                        }
                    </p>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B192C] dark:bg-[#8A6305] text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
                    >
                        <MdRefresh className="text-base" />
                        <span>{isArabic ? "إعادة تعيين الفلاتر" : "Reset Filters"}</span>
                    </button>
                </div>
            )}

            {/* Wholesale Product Grid */}
            {products.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {products.map((product) => (
                        <EditorialProductCard 
                            key={product.id} 
                            product={product} 
                        />
                    ))}
                </div>
            )}

            {/* Infinite Scroll Trigger & Spinner */}
            {hasMore && (
                <div ref={observerRef} className="mt-10 py-6 flex items-center justify-center">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-[#475569] dark:text-slate-400 bg-slate-50 dark:bg-zinc-900 px-4 py-2 rounded-full border border-slate-200/80 dark:border-white/5">
                        <div className="w-4 h-4 border-2 border-[#0B192C] dark:border-[#8A6305] border-t-transparent rounded-full animate-spin" />
                        <span>{isArabic ? "جاري تحميل المزيد من المنتجات..." : "Loading more products..."}</span>
                    </div>
                </div>
            )}
        </main>
    );
}
