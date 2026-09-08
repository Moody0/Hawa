"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import ProductsBreadcrumbs from "@/app/components/ProductsPageComponents/ProductsBreadcrumbs";
import ProductsHeader from "@/app/components/ProductsPageComponents/ProductsHeader";
import EditorialProductCard from "@/app/components/ProductsPageComponents/EditorialProductCard";
import WholesaleProductRow from "@/app/components/ProductsPageComponents/WholesaleProductRow";
import CustomSortDropdown from "@/app/components/ProductsPageComponents/CustomSortDropdown";
import ProductsSidebarFilter, { FilterState, reconcileCategoriesWithBrands } from "@/app/components/ProductsPageComponents/ProductsSidebarFilter";
import { useLanguage } from "@/app/context/LanguageContext";
import { buildCatalogUrl, parseCatalogUrlParams, normalizeCatalogSort, CatalogSort } from "@/lib/catalog-url";
import { SearchX, Search, X, Grid, List, SlidersHorizontal, RotateCw } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    nameEn?: string | null;
    mainCategoryId?: string | null;
    _count?: {
        products: number;
    };
}

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    price: string | null;
    discountPrice?: string | null;
    discountType?: string | null;
    discountValue?: string | null;
    images: string;
    brandId: string;
    categoryId: string;
    mainCategoryId?: string | null;
    options?: string | null;
    stock: number;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
    isTrending: boolean;
    brand?: Brand | null;
}

interface BrandCategoryInfo {
    id: string;
    name: string;
    slug: string;
    mainCategoryId?: string | null;
}

interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    group: string;
    mainCategoryId?: string | null;
    mainCategory?: { id: string; name: string; slug: string } | null;
    categories?: BrandCategoryInfo[];
    _count?: {
        products: number;
    };
}

interface ProductsClientProps {
    initialCategories: Category[];
    initialBrands?: Brand[];
    initialProducts: Product[];
    initialTotal: number;
    activeCategory?: Category | null;
    activeBrand?: Brand | null;
    activeMainCategory?: { id: string; name: string; slug: string; description?: string | null; image?: string | null } | null;
    initialSearch?: string;
    initialSort?: CatalogSort;
    initialPage?: number;
    initialInStock?: boolean;
    initialOnSale?: boolean;
    initialIsTrending?: boolean;
    initialView?: "grid" | "list";
    initialBrandSlugs?: string[];
    initialCategorySlugs?: string[];
}

const ProductsClient = ({
    initialCategories,
    initialBrands = [],
    initialProducts,
    initialTotal,
    activeCategory = null,
    activeBrand = null,
    activeMainCategory = null,
    initialSearch = "",
    initialSort = "best_sellers",
    initialPage = 1,
    initialInStock = false,
    initialOnSale = false,
    initialIsTrending = false,
    initialView = "grid",
    initialBrandSlugs = [],
    initialCategorySlugs = [],
}: ProductsClientProps) => {
    const { t, language } = useLanguage();
    const isArabic = language === "ar";
    const pathname = usePathname();

    const initialResolvedBrandIds = useMemo(() => {
        // A category page already scopes products to its category. Keeping the
        // derived brand in the client filter creates a URL/effect feedback loop
        // and duplicates the same request, so only honor an explicit brand URL.
        if (activeCategory && (!initialBrandSlugs || initialBrandSlugs.length === 0)) return [];
        if (activeBrand) return [activeBrand.id];
        if (!initialBrandSlugs || initialBrandSlugs.length === 0) return [];
        return initialBrands
            .filter((b) => initialBrandSlugs.includes(b.slug) || initialBrandSlugs.includes(b.id))
            .map((b) => b.id);
    }, [activeCategory, activeBrand, initialBrandSlugs, initialBrands]);

    const initialResolvedCategoryIds = useMemo(() => {
        if (activeCategory) return [activeCategory.id];
        if (!initialCategorySlugs || initialCategorySlugs.length === 0) return [];
        return initialCategories
            .filter((c) => initialCategorySlugs.includes(c.slug) || initialCategorySlugs.includes(c.id))
            .map((c) => c.id);
    }, [activeCategory, initialCategorySlugs, initialCategories]);

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [sort, setSort] = useState<CatalogSort>(initialSort);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(initialTotal);
    const [isInitialRender, setIsInitialRender] = useState(true);

    // View Density: 'grid' vs 'list' (Wholesale view)
    const [viewMode, setViewMode] = useState<"grid" | "list">(initialView);

    // Live catalog search
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

    // Mobile filter drawer state
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Faceted filter state
    const [filters, setFilters] = useState<FilterState>({
        brandIds: initialResolvedBrandIds,
        categoryIds: initialResolvedCategoryIds,
        inStock: initialInStock,
        onSale: initialOnSale,
        isTrending: initialIsTrending,
    });

    // Sync initial props when navigating between different routes (e.g. brand or department pages)
    useEffect(() => {
        setCategories(initialCategories);
        setProducts(initialProducts);
        setTotalProducts(initialTotal);
        setSearchQuery(initialSearch);
        setDebouncedSearch(initialSearch);
        setSort(initialSort);
        setPage(initialPage);
        setViewMode(initialView);
        setFilters({
            brandIds: initialResolvedBrandIds,
            categoryIds: initialResolvedCategoryIds,
            inStock: initialInStock,
            onSale: initialOnSale,
            isTrending: initialIsTrending,
        });
    }, [
        initialCategories,
        initialProducts,
        initialTotal,
        initialResolvedBrandIds,
        initialResolvedCategoryIds,
        initialSearch,
        initialSort,
        initialPage,
        initialInStock,
        initialOnSale,
        initialIsTrending,
        initialView,
    ]);

    const observerRef = useRef<HTMLDivElement>(null);
    const hasMore = products.length < totalProducts;

    // Synchronize client state to canonical URL (deterministic parameter sorting, omits defaults)
    useEffect(() => {
        if (isInitialRender) return;

        const brandSlugs = filters.brandIds.map((id) => {
            const b = initialBrands.find((brand) => brand.id === id);
            return b ? b.slug : id;
        });

        const catSlugs = filters.categoryIds.map((id) => {
            const c = categories.find((cat) => cat.id === id) || initialCategories.find((cat) => cat.id === id);
            return c ? c.slug : id;
        });

        const targetUrl = buildCatalogUrl(
            {
                brands: brandSlugs,
                categories: catSlugs,
                search: debouncedSearch,
                sort,
                page: page > 1 ? page : undefined,
                inStock: filters.inStock,
                onSale: filters.onSale,
                isTrending: filters.isTrending,
                view: viewMode,
            },
            pathname || "/products"
        );

        if (typeof window !== "undefined") {
            const currentUrl = `${window.location.pathname}${window.location.search}`;
            if (currentUrl !== targetUrl) {
                window.history.replaceState(null, "", targetUrl);
            }
        }
    }, [
        filters,
        debouncedSearch,
        sort,
        page,
        viewMode,
        pathname,
        isInitialRender,
        initialBrands,
        categories,
        initialCategories,
    ]);

    // Handle browser Back / Forward (popstate) to restore filter/search state
    useEffect(() => {
        const handlePopState = () => {
            if (typeof window === "undefined") return;
            const parsed = parseCatalogUrlParams(new URLSearchParams(window.location.search));
            setSearchQuery(parsed.search);
            setDebouncedSearch(parsed.search);
            setSort(parsed.sort);
            setPage(parsed.page);
            setViewMode(parsed.view);

            const popBrandIds = initialBrands
                .filter((b) => parsed.brands.includes(b.slug) || parsed.brands.includes(b.id))
                .map((b) => b.id);
            const popCategoryIds = categories
                .filter((c) => parsed.categories.includes(c.slug) || parsed.categories.includes(c.id))
                .map((c) => c.id);

            setFilters({
                brandIds: popBrandIds,
                categoryIds: popCategoryIds,
                inStock: parsed.inStock,
                onSale: parsed.onSale,
                isTrending: parsed.isTrending,
            });
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [initialBrands, categories]);

    const categoryAbortControllerRef = useRef<AbortController | null>(null);
    const categoryRequestIdRef = useRef(0);

    // Dynamically fetch and update categories/departments when brand filters change in sidebar
    useEffect(() => {
        if (isInitialRender || activeCategory) return;

        categoryAbortControllerRef.current?.abort();
        const controller = new AbortController();
        categoryAbortControllerRef.current = controller;
        const currentReqId = ++categoryRequestIdRef.current;

        async function updateDynamicCategories() {
            try {
                let url = "";
                if (filters.brandIds.length > 0) {
                    url = `/api/categories?brandIds=${filters.brandIds.join(",")}`;
                } else if (activeMainCategory) {
                    url = `/api/categories?mainCategoryId=${activeMainCategory.id}`;
                } else if (!activeBrand) {
                    url = `/api/main-categories`;
                }

                if (!url) {
                    if (currentReqId === categoryRequestIdRef.current) {
                        setCategories(initialCategories);
                    }
                    return;
                }

                const res = await fetch(url, { signal: controller.signal });
                if (res.ok && currentReqId === categoryRequestIdRef.current) {
                    const data = await res.json();
                    if (Array.isArray(data) && currentReqId === categoryRequestIdRef.current) {
                        setCategories(data);
                        setFilters((prev) => {
                            if (prev.categoryIds.length === 0) return prev;
                            const validCategoryIds = prev.categoryIds.filter((catId) =>
                                data.some(
                                    (c: Category) =>
                                        c.id === catId ||
                                        c.slug === catId ||
                                        c.mainCategoryId === catId
                                )
                            );
                            if (validCategoryIds.length === prev.categoryIds.length) {
                                return prev;
                            }
                            return { ...prev, categoryIds: validCategoryIds };
                        });
                        return;
                    }
                }
                if (currentReqId === categoryRequestIdRef.current) {
                    setCategories(initialCategories);
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
                console.error("Failed to fetch dynamic categories:", err);
                if (currentReqId === categoryRequestIdRef.current) {
                    setCategories(initialCategories);
                }
            }
        }

        updateDynamicCategories();

        return () => {
            controller.abort();
        };
    }, [filters.brandIds, activeMainCategory, activeBrand, activeCategory, isInitialRender, initialCategories]);

    // Debounce live search by 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Active filters count for chips and badges
    const activeFiltersCount =
        filters.brandIds.length +
        filters.categoryIds.length +
        (filters.inStock ? 1 : 0) +
        (filters.onSale ? 1 : 0) +
        (filters.isTrending ? 1 : 0) +
        (debouncedSearch ? 1 : 0);

    const isFetchingRef = useRef(false);
    const activeRequestRef = useRef<AbortController | null>(null);
    const productRequestIdRef = useRef(0);

    const fetchProducts = useCallback(
        async (reset = false) => {
            if (reset) {
                activeRequestRef.current?.abort();
            } else if (isFetchingRef.current) {
                return;
            }

            const controller = new AbortController();
            activeRequestRef.current = controller;
            isFetchingRef.current = true;
            setLoading(true);
            const currentReqId = ++productRequestIdRef.current;

            try {
                const currentPage = reset ? 1 : page;

                // Priority to filters.categoryIds
                let categoryQuery = "";
                if (filters.categoryIds.length > 0) {
                    categoryQuery = `&categoryIds=${filters.categoryIds.join(",")}`;
                }

                // Brand filter query
                let brandQuery = "";
                if (filters.brandIds.length > 0) {
                    brandQuery = `&brandIds=${filters.brandIds.join(",")}`;
                }

                const mainCategoryQuery = activeMainCategory
                    ? `&mainCategoryId=${activeMainCategory.id}`
                    : "";

                const inStockQuery = filters.inStock ? "&inStock=true" : "";
                const onSaleQuery = filters.onSale ? "&onSale=true" : "";
                const isTrendingQuery = filters.isTrending ? "&isTrending=true" : "";
                const liveSearchQuery = debouncedSearch
                    ? `&search=${encodeURIComponent(debouncedSearch)}`
                    : "";

                let sortQuery = "";
                if (sort === "price_asc") sortQuery = "&sort=price_asc";
                else if (sort === "price_desc") sortQuery = "&sort=price_desc";
                else if (sort === "newest") sortQuery = "&sort=newest";

                const countParams =
                    !reset && currentPage > 1
                        ? `&knownTotal=${totalProducts}&skipCount=true`
                        : "";

                const url = `/api/products?page=${currentPage}&limit=36${categoryQuery}${brandQuery}${mainCategoryQuery}${inStockQuery}${onSaleQuery}${isTrendingQuery}${liveSearchQuery}${sortQuery}${countParams}`;

                const response = await fetch(url, { signal: controller.signal });

                if (response.ok && currentReqId === productRequestIdRef.current) {
                    const data = await response.json();
                    if (currentReqId !== productRequestIdRef.current) return;
                    const incomingProducts: Product[] = data.products || [];
                    if (reset) {
                        setProducts(incomingProducts);
                    } else {
                        setProducts((prev) => {
                            const existingIds = new Set(prev.map((p) => p.id));
                            const uniqueNew = incomingProducts.filter((p) => !existingIds.has(p.id));
                            return [...prev, ...uniqueNew];
                        });
                    }
                    if (data.pagination?.total !== undefined) {
                        setTotalProducts(data.pagination.total);
                    }
                }
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    console.error("Failed to fetch products", error);
                }
            } finally {
                if (activeRequestRef.current === controller) {
                    activeRequestRef.current = null;
                    isFetchingRef.current = false;
                    setLoading(false);
                }
            }
        },
        [
            page,
            filters,
            activeMainCategory,
            debouncedSearch,
            sort,
            totalProducts,
        ]
    );

    useEffect(() => {
        return () => activeRequestRef.current?.abort();
    }, []);

    // Refetch when filters, search, or sort changes
    useEffect(() => {
        if (isInitialRender) {
            setIsInitialRender(false);
            return;
        }

        setPage(1);
        fetchProducts(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, debouncedSearch, sort]);

    // Load next page
    useEffect(() => {
        if (page > 1) {
            fetchProducts(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // IntersectionObserver for Automatic Infinite Scroll
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !isFetchingRef.current) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { rootMargin: "300px" }
        );

        const currentRef = observerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasMore, loading]);

    // Brand chip toggle handler
    const handleQuickToggleBrand = (brandId: string) => {
        const nextBrandIds = filters.brandIds.includes(brandId)
            ? filters.brandIds.filter((id) => id !== brandId)
            : [...filters.brandIds, brandId];

        const nextCategoryIds = reconcileCategoriesWithBrands(
            filters.categoryIds,
            nextBrandIds,
            initialBrands,
            categories
        );

        setFilters((prev) => ({
            ...prev,
            brandIds: nextBrandIds,
            categoryIds: nextCategoryIds,
        }));
    };

    // Category chip toggle handler
    const handleToggleCategory = (catId: string) => {
        const next = filters.categoryIds.includes(catId)
            ? filters.categoryIds.filter((id) => id !== catId)
            : [...filters.categoryIds, catId];
        setFilters((prev) => ({ ...prev, categoryIds: next }));
    };

    const handleResetAllFilters = () => {
        setFilters({
            brandIds: [],
            categoryIds: [],
            inStock: false,
            onSale: false,
            isTrending: false,
        });
        setSearchQuery("");
        setDebouncedSearch("");
    };

    const sortOptions = [
        { id: "best_sellers", label: t("products.bestSellers") },
        { id: "newest", label: t("products.newestArrivals") },
        { id: "price_asc", label: isArabic ? "السعر: الأقل للأعلى" : "Price: Low to High" },
        { id: "price_desc", label: isArabic ? "السعر: الأعلى للأقل" : "Price: High to Low" },
    ];

    const getHeadingTitle = () => {
        if (activeCategory) {
            return isArabic
                ? activeCategory.name
                : activeCategory.description || activeCategory.nameEn || activeCategory.name;
        }
        if (activeMainCategory) {
            return isArabic
                ? activeMainCategory.name
                : activeMainCategory.description || activeMainCategory.name;
        }
        if (singleSelectedBrand) {
            return singleSelectedBrand.name;
        }
        if (filters.brandIds.length > 1) {
            return isArabic
                ? `منتجات الوكالات المحددة (${filters.brandIds.length} وكالات)`
                : `Products of Selected Agencies (${filters.brandIds.length})`;
        }
        return t("products.allProducts");
    };

    // Single selected brand object (only when EXACTLY ONE brand is selected)
    const singleSelectedBrand = useMemo(() => {
        if (filters.brandIds.length === 1) {
            return initialBrands.find((b) => b.id === filters.brandIds[0]) || activeBrand || null;
        }
        return null;
    }, [filters.brandIds, initialBrands, activeBrand]);

    // Total count of products for the selected brand (persists even when filtering by category)
    const brandTotalCount = useMemo(() => {
        if (!singleSelectedBrand) return totalProducts;
        if (typeof singleSelectedBrand._count?.products === "number") {
            return singleSelectedBrand._count.products;
        }
        const categoriesSum = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
        return categoriesSum > 0 ? categoriesSum : totalProducts;
    }, [singleSelectedBrand, categories, totalProducts]);

    // Find brand / category names for active filter chips
    const selectedBrandObjects = useMemo(() => {
        return initialBrands.filter((b) => filters.brandIds.includes(b.id));
    }, [initialBrands, filters.brandIds]);

    const selectedCategoryObjects = useMemo(() => {
        return categories.filter((c) => filters.categoryIds.includes(c.id));
    }, [categories, filters.categoryIds]);

    return (
        <div className="flex-1 bg-[#F6F7F9] dark:bg-[#09090b]">
            <div className="container-custom py-4 md:py-6">
            {/* Breadcrumbs */}
            <ProductsBreadcrumbs
                activeCategory={activeCategory}
                activeBrand={singleSelectedBrand}
                activeMainCategory={activeMainCategory}
            />

            {/* Products Page Header */}
            <ProductsHeader />

            {/* Main Faceted 2-Column Catalog Layout */}
            <div className="flex items-start gap-6 mt-2">
                {/* Faceted Filter Sidebar (Desktop & Mobile Drawer) */}
                <ProductsSidebarFilter
                    brands={initialBrands}
                    categories={categories}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onResetFilters={handleResetAllFilters}
                    totalResults={totalProducts}
                    isMobileDrawerOpen={isMobileDrawerOpen}
                    onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 min-w-0" aria-busy={loading}>
                    {/* Brand Specific Quick Category Tabs */}
                    {singleSelectedBrand && categories.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-hide">
                             <button
                                 type="button"
                                 onClick={() => setFilters((prev) => ({ ...prev, categoryIds: [] }))}
                                 aria-pressed={filters.categoryIds.length === 0}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                                    filters.categoryIds.length === 0
                                        ? "bg-[#0B192C] text-white dark:bg-white dark:text-slate-900"
                                        : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]"
                                }`}
                            >
                                <span>{isArabic ? "كافة أصناف الوكالة" : "All Products"}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    filters.categoryIds.length === 0
                                        ? "bg-[#8A6305] text-white"
                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                                }`}>
                                    {brandTotalCount}
                                </span>
                            </button>

                            {categories.map((cat) => {
                                const isSelected = filters.categoryIds.includes(cat.id);
                                const displayName = isArabic ? cat.name : (cat.description || cat.nameEn || cat.name);
                                const count = cat._count?.products;

                                return (
                                     <button
                                         key={cat.id}
                                         type="button"
                                         onClick={() => handleToggleCategory(cat.id)}
                                         aria-pressed={isSelected}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                                ? "bg-[#0B192C] text-white dark:bg-white dark:text-slate-900"
                                                : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]"
                                        }`}
                                    >
                                        <span>{displayName}</span>
                                        {count !== undefined && (
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                                isSelected
                                                    ? "bg-[#8A6305] text-white"
                                                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                                            }`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Control Bar: Search, View Density, Mobile Filter, and Sort */}
                    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* In-Catalog Live Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={isArabic ? "البحث في كتالوج المنتجات" : "Search the product catalog"}
                                    placeholder={
                                        isArabic
                                            ? "ابحث في الكتالوج بالاسم، الماركة، أو الباركود..."
                                            : "Search catalog by name, brand, or SKU..."
                                    }
                                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 ps-9 pe-8 text-xs text-[#0B192C] placeholder:text-slate-400 transition-colors focus:border-[#8A6305] focus:outline-none focus:ring-0 dark:border-white/15 dark:bg-zinc-800 dark:text-white sm:text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <X className="text-sm" />
                                    </button>
                                )}
                            </div>

                            {/* Right Controls: View Switcher, Mobile Filter Button, Sort Dropdown */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                {/* Mobile Filter Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileDrawerOpen(true)}
                                    aria-expanded={isMobileDrawerOpen}
                                    aria-controls="mobile-catalog-filters"
                                    className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-[#0B192C] dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-[#8A6305] transition-colors cursor-pointer active:scale-95"
                                >
                                    <SlidersHorizontal className="text-sm text-[#8A6305]" />
                                    <span>{isArabic ? "تصفية" : "Filters"}</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-[#8A6305] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                {/* View Mode Toggle (Grid ⊞ vs Wholesale List ☰) */}
                                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("grid")}
                                        title={isArabic ? "عرض الشبكة" : "Grid View"}
                                        className={`p-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                                            viewMode === "grid"
                                                ? "bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        <Grid className="text-base" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("list")}
                                        title={isArabic ? "عرض الجملة المضغوط" : "Wholesale List View"}
                                        className={`p-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                                            viewMode === "list"
                                                ? "bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        <List className="text-base" />
                                    </button>
                                </div>

                                {/* Custom Sort Dropdown */}
                                <CustomSortDropdown
                                    sort={sort}
                                    setSort={(val) => setSort(normalizeCatalogSort(val))}
                                    options={sortOptions}
                                />
                            </div>
                        </div>

                        {/* Active Filter Chips Bar */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                                <span className="text-[11px] font-bold text-slate-400 me-1">
                                    {isArabic ? "الفلاتر النشطة:" : "Active:"}
                                </span>

                                {/* Search Query Chip */}
                                {debouncedSearch && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF6EC] dark:bg-[#8A6305]/20 text-[#0B192C] dark:text-white border border-[#8A6305]/30">
                                        <span>"{debouncedSearch}"</span>
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="hover:text-red-500"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </span>
                                )}

                                {/* Selected Brand Chips */}
                                {selectedBrandObjects.map((b) => (
                                    <span
                                        key={b.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-slate-200 dark:border-white/10"
                                    >
                                        <span>{b.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickToggleBrand(b.id)}
                                            className="hover:text-red-500"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </span>
                                ))}

                                {/* Selected Category Chips */}
                                {selectedCategoryObjects.map((c) => (
                                    <span
                                        key={c.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-slate-200 dark:border-white/10"
                                    >
                                        <span>{isArabic ? c.name : c.description || c.name}</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    categoryIds: prev.categoryIds.filter((id) => id !== c.id),
                                                }))
                                            }
                                            className="hover:text-red-500"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </span>
                                ))}

                                {/* In Stock Chip */}
                                {filters.inStock && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                                        <span>{isArabic ? "متوفر فقط" : "In Stock"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, inStock: false }))}
                                            className="hover:text-red-500"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </span>
                                )}

                                {/* On Sale Chip */}
                                {filters.onSale && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                        <span>{isArabic ? "عروض خاصة" : "On Sale"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, onSale: false }))}
                                            className="hover:text-red-500"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </span>
                                )}

                                {/* Trending Chip */}
                                {filters.isTrending && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                        <span>{isArabic ? "الأكثر طلباً" : "Trending"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, isTrending: false }))}
                                            className="hover:text-red-500"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </span>
                                )}

                                {/* Clear All Button */}
                                <button
                                    type="button"
                                    onClick={handleResetAllFilters}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200/80 dark:border-red-900/40 transition-colors cursor-pointer"
                                >
                                    <RotateCw className="text-xs" />
                                    <span>{isArabic ? "مسح كافة الفلاتر" : "Clear All"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Results Counter & Section Title */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            {!(singleSelectedBrand && !activeCategory && !activeMainCategory) && (
                                <h1 className="text-lg md:text-xl font-bold text-[#0B192C] dark:text-white tracking-tight">
                                    {getHeadingTitle()}
                                </h1>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                {isArabic
                                    ? `عرض ${products.length} من أصل ${totalProducts} صنف بالجملة`
                                    : `Showing ${products.length} of ${totalProducts} wholesale products`}
                            </p>
                        </div>
                        {loading && (
                            <div role="status" className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8A6305] border-t-transparent" />
                                <span className="hidden sm:inline">{isArabic ? "جاري تحديث النتائج" : "Updating results"}</span>
                                <span className="sr-only">{isArabic ? "جاري تحميل المنتجات" : "Loading products"}</span>
                            </div>
                        )}
                    </div>

                    {/* Empty State */}
                    {products.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 my-4">
                            <SearchX className="text-5xl text-slate-300 dark:text-zinc-600 mb-3" />
                            <h3 className="text-base font-bold text-[#0B192C] dark:text-white mb-1">
                                {isArabic ? "لم يتم العثور على أي منتجات مطابقة" : "No products found matching filters"}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                                {isArabic
                                    ? "جرب إزالة بعض الفلاتر المحددة أو تغيير كلمة البحث للعثور على الأصناف المطلوبة."
                                    : "Try clearing some applied filters or adjusting your search term."}
                            </p>
                            {activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleResetAllFilters}
                                    className="px-4 py-2 rounded-xl bg-[#0B192C] dark:bg-white dark:text-slate-900 text-white text-xs font-bold hover:bg-[#162740] transition-colors cursor-pointer"
                                >
                                    {isArabic ? "إعادة ضبط كافة الفلاتر" : "Reset All Filters"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Products Display (Grid vs Wholesale List) */}
                    <h2 className="sr-only">
                        {isArabic ? "قائمة المنتجات وتوريد الطرود" : "Wholesale Products List"}
                    </h2>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                            {products.map((product, index) => (
                                <EditorialProductCard
                                    key={product.id}
                                    product={product}
                                    imagePriority={index < 4}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {products.map((product) => (
                                <WholesaleProductRow key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Automatic Infinite Scroll Trigger & Spinner */}
                    {hasMore && (
                        <div ref={observerRef} className="mt-8 py-6 flex items-center justify-center">
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10">
                                <div className="w-4 h-4 border-2 border-[#8A6305] border-t-transparent rounded-full animate-spin" />
                                <span>
                                    {isArabic
                                        ? "جاري تحميل المزيد من الأصناف..."
                                        : "Loading more products..."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default ProductsClient;
