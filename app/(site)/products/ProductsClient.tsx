"use client";
import { laravelClientFetch } from '@/lib/laravel-client';


import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProductsBreadcrumbs from "@/app/components/ProductsPageComponents/ProductsBreadcrumbs";
import EditorialProductCard from "@/app/components/ProductsPageComponents/EditorialProductCard";
import WholesaleProductRow from "@/app/components/ProductsPageComponents/WholesaleProductRow";
import CustomSortDropdown from "@/app/components/ProductsPageComponents/CustomSortDropdown";
import ProductsSidebarFilter, { FilterState, reconcileCategoriesWithBrands } from "@/app/components/ProductsPageComponents/ProductsSidebarFilter";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { getBrandDisplayName } from "@/lib/brand-display";
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
    redirectSlugs?: string[];
    type?: 'category' | 'main-category';
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
    nameEn?: string | null;
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

const EMPTY_TOKENS: string[] = [];
const EMPTY_BRANDS: Brand[] = [];

const ProductsClient = ({
    initialCategories,
    initialBrands = EMPTY_BRANDS,
    initialProducts,
    initialTotal,
    activeCategory: initialActiveCategory = null,
    activeBrand = null,
    activeMainCategory: initialMainCategory = null,
    initialSearch = "",
    initialSort = "best_sellers",
    initialPage = 1,
    initialInStock = false,
    initialOnSale = false,
    initialIsTrending = false,
    initialView = "grid",
    initialBrandSlugs = EMPTY_TOKENS,
    initialCategorySlugs = EMPTY_TOKENS,
}: ProductsClientProps) => {
    const { t, language } = useLanguage();
    const { customer } = useCustomer();
    const isArabic = language === "ar";
    const pathname = usePathname();
    const router = useRouter();

    const initialResolvedBrandIds = useMemo(() => {
        // A category page already scopes products to its category. Keeping the
        // derived brand in the client filter creates a URL/effect feedback loop
        // and duplicates the same request, so only honor an explicit brand URL.
        if (initialActiveCategory && initialBrandSlugs.length === 0) return [];
        if (activeBrand) return [activeBrand.id];
        if (!initialBrandSlugs || initialBrandSlugs.length === 0) return [];
        return [...new Set(initialBrandSlugs.map((token) => initialBrands.find((brand) => brand.slug === token || brand.id === token)?.id || token))];
    }, [initialActiveCategory, activeBrand, initialBrandSlugs, initialBrands]);

    const initialResolvedCategoryIds = useMemo(() => {
        if (initialActiveCategory) return [initialActiveCategory.id];
        if (!initialCategorySlugs || initialCategorySlugs.length === 0) return [];
        return [...new Set(initialCategorySlugs.map((token) => initialCategories.find((category) => category.slug === token || category.id === token || category.redirectSlugs?.includes(token))?.id || token))];
    }, [initialActiveCategory, initialCategorySlugs, initialCategories]);

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [sort, setSort] = useState<CatalogSort>(initialSort);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(initialTotal);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [activeMainCategory, setActiveMainCategory] = useState(initialMainCategory);
    const [fetchError, setFetchError] = useState<{ reset: boolean; page: number } | null>(null);
    const [hasNextPage, setHasNextPage] = useState(initialPage * 36 < initialTotal);
    const [filterResetKey, setFilterResetKey] = useState(0);
    const requestedResetPageRef = useRef<number | null>(initialPage);
    const categoryLookupRef = useRef(new Map(initialCategories.map((category) => [category.id, category])));

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
    const activeCategory = filters.categoryIds.includes(initialActiveCategory?.id || '') ? initialActiveCategory : null;

    const initialPropsSyncRef = useRef(true);
    // Sync server navigation without replaying the initial filters on mount.
    useEffect(() => {
        initialCategories.forEach((category) => categoryLookupRef.current.set(category.id, category));
        if (initialActiveCategory) categoryLookupRef.current.set(initialActiveCategory.id, initialActiveCategory);
        if (initialPropsSyncRef.current) {
            initialPropsSyncRef.current = false;
            return;
        }
        requestedResetPageRef.current = initialPage;
        setCategories(initialCategories);
        setProducts(initialProducts);
        setTotalProducts(initialTotal);
        setSearchQuery(initialSearch);
        setDebouncedSearch(initialSearch);
        setSort(initialSort);
        setPage(initialPage);
        setViewMode(initialView);
        setActiveMainCategory(initialMainCategory);
        setFetchError(null);
        setHasNextPage(initialPage * 36 < initialTotal);
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
        initialMainCategory,
        initialActiveCategory,
    ]);

    const observerRef = useRef<HTMLDivElement>(null);
    const hasMore = products.length > 0 && hasNextPage;

    // Synchronize client state to canonical URL (deterministic parameter sorting, omits defaults)
    useEffect(() => {
        if (isInitialRender) return;

        const brandSlugs = filters.brandIds.map((id) => {
            const b = initialBrands.find((brand) => brand.id === id);
            return b ? b.slug : id;
        });

        const catSlugs = filters.categoryIds.map((id) => {
            const c = categoryLookupRef.current.get(id);
            return c ? c.slug : id;
        });

        const targetUrl = buildCatalogUrl(
            {
                brands: brandSlugs,
                categories: catSlugs,
                mainCategory: activeMainCategory?.slug,
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
        activeMainCategory,
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
            requestedResetPageRef.current = parsed.page;
            setViewMode(parsed.view);
            const mainCategory = [...categoryLookupRef.current.values()].find((c) => c.type === 'main-category' && (c.slug === parsed.mainCategory || c.id === parsed.mainCategory));
            setActiveMainCategory(parsed.mainCategory ? mainCategory || (initialMainCategory?.slug === parsed.mainCategory || initialMainCategory?.id === parsed.mainCategory ? initialMainCategory : { id: parsed.mainCategory, slug: parsed.mainCategory, name: parsed.mainCategory }) : null);

            const popBrandIds = [...new Set(parsed.brands.map((token) => initialBrands.find((brand) => brand.slug === token || brand.id === token)?.id || token))];
            const knownCategories = [...categoryLookupRef.current.values()];
            const popCategoryIds = [...new Set(parsed.categories.map((token) => knownCategories.find((category) => category.slug === token || category.id === token || category.redirectSlugs?.includes(token))?.id || token))];

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
    }, [initialBrands, initialMainCategory]);

    const categoryAbortControllerRef = useRef<AbortController | null>(null);
    const categoryRequestIdRef = useRef(0);

    // Dynamically fetch and update categories/departments when brand filters change in sidebar
    useEffect(() => {
        if (isInitialRender) return;

        categoryAbortControllerRef.current?.abort();
        const controller = new AbortController();
        categoryAbortControllerRef.current = controller;
        const currentReqId = ++categoryRequestIdRef.current;

        async function updateDynamicCategories() {
            try {
                let url = "";
                if (filters.brandIds.length > 0) {
                    const query = new URLSearchParams({ brandIds: filters.brandIds.join(',') });
                    if (activeMainCategory) query.set('mainCategoryId', activeMainCategory.id);
                    url = `/api/categories?${query}`;
                } else if (activeMainCategory) {
                    url = `/api/categories?${new URLSearchParams({ mainCategoryId: activeMainCategory.id })}`;
                } else if (activeCategory) {
                    url = `/api/categories`;
                } else {
                    url = `/api/main-categories`;
                }

                if (!url) {
                    if (currentReqId === categoryRequestIdRef.current) {
                        setCategories(initialCategories);
                    }
                    return;
                }

                const res = await laravelClientFetch(url, { signal: controller.signal });
                if (res.ok && currentReqId === categoryRequestIdRef.current) {
                    const data = await res.json();
                    if (Array.isArray(data) && currentReqId === categoryRequestIdRef.current) {
                        data.forEach((category: Category) => categoryLookupRef.current.set(category.id, category));
                        setCategories(data);
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
        (debouncedSearch ? 1 : 0) +
        (activeMainCategory ? 1 : 0);

    const isFetchingRef = useRef(false);
    const activeRequestRef = useRef<AbortController | null>(null);
    const productRequestIdRef = useRef(0);

    const fetchProducts = useCallback(
        async (reset = false, requestedPage = reset ? 1 : page + 1) => {
            if (reset) {
                activeRequestRef.current?.abort();
            } else if (isFetchingRef.current) {
                return;
            }

            const controller = new AbortController();
            activeRequestRef.current = controller;
            isFetchingRef.current = true;
            setLoading(true);
            setFetchError(null);
            if (reset) {
                setProducts([]);
                setTotalProducts(0);
                setHasNextPage(false);
            }
            const currentReqId = ++productRequestIdRef.current;

            try {
                const currentPage = requestedPage;

                const query = new URLSearchParams({ page: String(currentPage), limit: '36', sort });
                if (filters.categoryIds.length) query.set('categoryIds', filters.categoryIds.join(','));
                if (filters.brandIds.length) query.set('brandIds', filters.brandIds.join(','));
                if (activeMainCategory) query.set('mainCategoryId', activeMainCategory.id);
                if (filters.inStock) query.set('inStock', 'true');
                if (filters.onSale) query.set('onSale', 'true');
                if (filters.isTrending) query.set('isTrending', 'true');
                if (debouncedSearch) query.set('search', debouncedSearch);
                if (!reset && currentPage > 1) {
                    query.set('knownTotal', String(totalProducts));
                    query.set('skipCount', 'true');
                }
                const url = `/api/products?${query}`;

                const response = await laravelClientFetch(url, { signal: controller.signal });

                if (!response.ok) throw new Error(`Product request failed (${response.status})`);
                if (currentReqId === productRequestIdRef.current) {
                    const data = await response.json();
                    if (controller.signal.aborted || currentReqId !== productRequestIdRef.current) return;
                    if (!Array.isArray(data.products) || typeof data.pagination?.total !== 'number') throw new Error('Invalid product response');
                    const incomingProducts: Product[] = data.products;
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
                    setPage(currentPage);
                    setHasNextPage(incomingProducts.length > 0 && currentPage * 36 < data.pagination.total);
                }
            } catch (error) {
                if (!(error instanceof Error && error.name === "AbortError") && currentReqId === productRequestIdRef.current) {
                    console.error("Failed to fetch products", error);
                    setFetchError({ reset, page: requestedPage });
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

    // Refresh every filter snapshot; only a successful request advances pagination.
    useEffect(() => {
        const requestedPage = requestedResetPageRef.current || 1;
        requestedResetPageRef.current = null;
        setIsInitialRender(false);
        setPage(requestedPage);
        fetchProducts(true, requestedPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, debouncedSearch, sort, activeMainCategory]);

    // IntersectionObserver for Automatic Infinite Scroll
    useEffect(() => {
        if (!hasMore || loading || fetchError) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !isFetchingRef.current) {
                    fetchProducts(false, page + 1);
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
    }, [hasMore, loading, fetchError, fetchProducts, page]);

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
        requestedResetPageRef.current = 1;
        setFilterResetKey((value) => value + 1);
        setFilters({
            brandIds: [],
            categoryIds: [],
            inStock: false,
            onSale: false,
            isTrending: false,
        });
        setSearchQuery("");
        setDebouncedSearch("");
        setActiveMainCategory(null);
        setSort('best_sellers');
        setPage(1);
        if (pathname !== '/products') router.push('/products', { scroll: false });
    };

    const sortOptions = [
        { id: "best_sellers", label: t("products.bestSellers") },
        { id: "newest", label: t("products.newestArrivals") },
        { id: "price_asc", label: isArabic ? "السعر: الأقل للأعلى" : "Price: Low to High" },
        { id: "price_desc", label: isArabic ? "السعر: الأعلى للأقل" : "Price: High to Low" },
    ];

    const getHeadingTitle = () => {
        if (selectedCategoryObjects.length === 1) {
            const category = selectedCategoryObjects[0];
            return isArabic
                ? category.name
                : category.nameEn || category.description || category.name;
        }
        if (selectedCategoryObjects.length > 1) {
            return isArabic ? `منتجات الأقسام المحددة (${selectedCategoryObjects.length})` : `Products in selected categories (${selectedCategoryObjects.length})`;
        }
        if (activeMainCategory) {
            return isArabic
                ? activeMainCategory.name
                : activeMainCategory.description || activeMainCategory.name;
        }
        if (singleSelectedBrand) {
            return getBrandDisplayName(singleSelectedBrand, isArabic ? "ar" : "en");
        }
        if (filters.brandIds.length > 1) {
            return isArabic
                ? `منتجات الوكالات المحددة (${filters.brandIds.length} وكالات)`
                : `Products of Selected Agencies (${filters.brandIds.length})`;
        }
        return t("products.allProducts");
    };

    // Scoped brands list: when on a department page, filter out brands that don't belong to it
    const displayBrands = useMemo(() => {
        if (!activeMainCategory) return initialBrands;
        return initialBrands.filter((b) =>
            !b.mainCategoryId ||
            b.mainCategoryId === activeMainCategory.id ||
            b.mainCategory?.id === activeMainCategory.id ||
            (b.categories && b.categories.some((c) => c.mainCategoryId === activeMainCategory.id))
        );
    }, [initialBrands, activeMainCategory]);

    // Single selected brand object (only when EXACTLY ONE brand is selected)
    const singleSelectedBrand = useMemo(() => {
        if (filters.brandIds.length === 1) {
            return displayBrands.find((b) => b.id === filters.brandIds[0]) || (activeBrand?.id === filters.brandIds[0] ? activeBrand : null);
        }
        return null;
    }, [filters.brandIds, displayBrands, activeBrand]);

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
        return filters.brandIds.map((id) => initialBrands.find((brand) => brand.id === id) || { id, name: id });
    }, [initialBrands, filters.brandIds]);

    const selectedCategoryObjects = useMemo<Category[]>(() => {
        return filters.categoryIds.flatMap((id) => {
            const category = categoryLookupRef.current.get(id);
            return category ? [category] : [{ id, name: id, slug: id, description: null, image: null }];
        });
    }, [categories, filters.categoryIds]);

    const isDefaultCatalogHeading =
        selectedCategoryObjects.length === 0 &&
        !activeMainCategory &&
        filters.brandIds.length === 0;

    return (
        <div className="flex-1 bg-white dark:bg-[#0B192C]">
            <div className="container-custom py-5 md:py-8">
                {/* Breadcrumbs */}
                <ProductsBreadcrumbs
                    activeCategory={selectedCategoryObjects.length === 1 && selectedCategoryObjects[0].type !== 'main-category' ? selectedCategoryObjects[0] : null}
                    activeBrand={singleSelectedBrand}
                    activeMainCategory={activeMainCategory || (selectedCategoryObjects.length === 1 && selectedCategoryObjects[0].type === 'main-category' ? selectedCategoryObjects[0] : null)}
                />

                {/* Unified Architectural Header & Command Bar */}
                <div className="mt-1 pb-5 2xl:pb-6 mb-6 2xl:mb-7 border-b border-[#0B192C]/[0.09] dark:border-white/10 flex flex-col xl:flex-row xl:items-end justify-between gap-4 2xl:gap-5">
                    <div>
                        <h1 className="text-2xl sm:text-[26px] 2xl:text-[32px] font-bold text-[#0B192C] dark:text-white leading-[1.2]">
                            {isDefaultCatalogHeading ? (
                                isArabic ? (
                                    <>
                                        كتالوج المنتجات{" "}
                                        <span className="text-[#8A6305] dark:text-[#E5B54A]">
                                            وتوريد الجملة
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Product Catalog &{" "}
                                        <span className="text-[#8A6305] dark:text-[#E5B54A]">
                                            Wholesale Supply
                                        </span>
                                    </>
                                )
                            ) : (
                                getHeadingTitle()
                            )}
                        </h1>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                            <p className="text-xs sm:text-[13.5px] font-medium text-[#0B192C]/60 dark:text-slate-300">
                                {isArabic
                                    ? `استعرض ${totalProducts} صنفاً معتمداً من وكالاتنا التجارية متاحة للطلب المباشر بالطرود.`
                                    : `Browse ${totalProducts} authorized agency products available for direct wholesale carton ordering.`}
                            </p>
                            {loading && (
                                <div role="status" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A6305] dark:text-[#E5B54A]">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8A6305] dark:border-[#E5B54A] border-t-transparent" />
                                    <span>{isArabic ? "جاري التحديث..." : "Updating..."}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unified Command Controls: Capsule Search + 4Cols/1Col Swapper + Sort */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                        {/* Capsule Search Input */}
                        <div className="relative flex-1 sm:w-72 md:w-80">
                            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[#0B192C]/45 dark:text-slate-400 w-4 h-4 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label={isArabic ? "البحث في كتالوج المنتجات" : "Search the product catalog"}
                                placeholder={
                                    isArabic
                                        ? "ابحث بالاسم، الوكالة، أو الباركود..."
                                        : "Search by name, agency, or SKU..."
                                }
                                className="h-11 w-full rounded-full border border-[#0B192C]/15 dark:border-white/15 bg-[#FAF7F0] dark:bg-zinc-900 py-2 ps-10 pe-9 text-xs sm:text-[13px] font-medium text-[#0B192C] dark:text-white placeholder:text-[#0B192C]/45 dark:placeholder:text-slate-400 transition-colors focus:bg-white dark:focus:bg-zinc-800 focus:border-[#0B192C] dark:focus:border-[#C59329] focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[#0B192C]/45 hover:text-[#0B192C] dark:text-slate-400 dark:hover:text-white cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                            {/* Mobile Filter Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setIsMobileDrawerOpen(true)}
                                aria-expanded={isMobileDrawerOpen}
                                aria-controls="mobile-catalog-filters"
                                className="lg:hidden inline-flex items-center gap-1.5 h-11 px-4 bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white rounded-full text-xs font-bold border border-[#0B192C]/15 dark:border-white/15 hover:border-[#0B192C] transition-colors cursor-pointer"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A6305] dark:text-[#E5B54A]" />
                                <span>{isArabic ? "تصفية" : "Filters"}</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-[#0B192C] dark:bg-[#C59329] text-white dark:text-[#0B192C] text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* 4-Cols / 1-Col View Mode Swapper */}
                            <div
                                role="group"
                                aria-label={isArabic ? "طريقة عرض الكتالوج" : "Catalog view mode"}
                                className="inline-flex items-center h-11 p-1 rounded-full bg-[#FAF7F0] dark:bg-zinc-800 border border-[#0B192C]/15 dark:border-white/15 shrink-0"
                            >
                                <button
                                    type="button"
                                    onClick={() => setViewMode("grid")}
                                    aria-pressed={viewMode === "grid"}
                                    title={isArabic ? "عرض شبكي 4 أعمدة" : "4-Column Grid View"}
                                    className={`h-full px-3 rounded-full text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                        viewMode === "grid"
                                            ? "bg-[#0B192C] text-white dark:bg-[#C59329] dark:text-[#0B192C]"
                                            : "text-[#0B192C]/65 dark:text-slate-300 hover:text-[#0B192C] dark:hover:text-white"
                                    }`}
                                >
                                    <Grid className="w-3.5 h-3.5" />
                                    <span className="hidden xs:inline">{isArabic ? "4 أعمدة" : "4 Cols"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    aria-pressed={viewMode === "list"}
                                    title={isArabic ? "عرض قائمة جملة (عمود واحد)" : "1-Column Wholesale List"}
                                    className={`h-full px-3 rounded-full text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                        viewMode === "list"
                                            ? "bg-[#0B192C] text-white dark:bg-[#C59329] dark:text-[#0B192C]"
                                            : "text-[#0B192C]/65 dark:text-slate-300 hover:text-[#0B192C] dark:hover:text-white"
                                    }`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    <span className="hidden xs:inline">{isArabic ? "عمود واحد" : "1 Col"}</span>
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
                </div>

                {/* Main Faceted 2-Column Catalog Layout */}
                <div className="flex items-start gap-7">
                    {/* Faceted Filter Sidebar (Desktop & Mobile Drawer) */}
                    <ProductsSidebarFilter
                        brands={displayBrands}
                        categories={categories}
                        filters={filters}
                        onFiltersChange={setFilters}
                        onResetFilters={handleResetAllFilters}
                        resetKey={filterResetKey}
                        totalResults={totalProducts}
                        isMobileDrawerOpen={isMobileDrawerOpen}
                        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0" aria-busy={loading}>
                        {/* Brand Specific Quick Category Tabs */}
                        {singleSelectedBrand && categories.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                                <button
                                    type="button"
                                    onClick={() => setFilters((prev) => ({ ...prev, categoryIds: [] }))}
                                    aria-pressed={filters.categoryIds.length === 0}
                                    className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                                        filters.categoryIds.length === 0
                                            ? "bg-[#0B192C] text-white dark:bg-[#C59329] dark:text-[#0B192C]"
                                            : "bg-[#FAF7F0] dark:bg-zinc-900 text-[#0B192C]/75 dark:text-slate-300 border border-[#0B192C]/10 dark:border-white/10 hover:border-[#0B192C]"
                                    }`}
                                >
                                    <span>{isArabic ? "كافة أصناف الوكالة" : "All Products"}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                                        filters.categoryIds.length === 0
                                            ? "bg-white/20 text-white dark:bg-[#0B192C]/20 dark:text-[#0B192C]"
                                            : "bg-[#0B192C]/[0.07] dark:bg-zinc-800 text-[#0B192C]/70 dark:text-zinc-400"
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
                                            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                isSelected
                                                    ? "bg-[#0B192C] text-white dark:bg-[#C59329] dark:text-[#0B192C]"
                                                    : "bg-[#FAF7F0] dark:bg-zinc-900 text-[#0B192C]/75 dark:text-slate-300 border border-[#0B192C]/10 dark:border-white/10 hover:border-[#0B192C]"
                                            }`}
                                        >
                                            <span>{displayName}</span>
                                            {count !== undefined && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                                                    isSelected
                                                        ? "bg-white/20 text-white dark:bg-[#0B192C]/20 dark:text-[#0B192C]"
                                                        : "bg-[#0B192C]/[0.07] dark:bg-zinc-800 text-[#0B192C]/70 dark:text-zinc-400"
                                                }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Active Filter Chips Bar */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3.5 border-b border-[#0B192C]/[0.08] dark:border-white/10">
                                <span className="text-[11px] font-bold text-[#0B192C]/55 dark:text-slate-400 me-1">
                                    {isArabic ? "الفلاتر النشطة:" : "Active:"}
                                </span>

                                {debouncedSearch && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/15 dark:border-white/15">
                                        <span>"{debouncedSearch}"</span>
                                        <button
                                            type="button"
                                            onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                                            className="hover:text-red-500 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {activeMainCategory && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0B192C]/15 bg-[#FAF7F0] px-3 py-1 text-[11px] font-semibold text-[#0B192C] dark:border-white/15 dark:bg-zinc-800 dark:text-white">
                                        <span>{activeMainCategory.name}</span>
                                        <button type="button" onClick={() => {
                                            setActiveMainCategory(null);
                                            if (pathname !== '/products') router.push('/products', { scroll: false });
                                        }} aria-label={isArabic ? 'إزالة فلتر القسم' : 'Remove department filter'} className="hover:text-red-500 cursor-pointer">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedBrandObjects.map((b) => (
                                    <span
                                        key={b.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/15 dark:border-white/15"
                                    >
                                        <span>{b.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickToggleBrand(b.id)}
                                            className="hover:text-red-500 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {selectedCategoryObjects.map((c) => (
                                    <span
                                        key={c.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/15 dark:border-white/15"
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
                                            className="hover:text-red-500 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}

                                {filters.inStock && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/15 dark:border-white/15">
                                        <span>{isArabic ? "متوفر فقط" : "In Stock"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, inStock: false }))}
                                            className="hover:text-red-500 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.onSale && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/15 dark:border-white/15">
                                        <span>{isArabic ? "عروض خاصة" : "On Sale"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, onSale: false }))}
                                            className="hover:text-red-500 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.isTrending && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/15 dark:border-white/15">
                                        <span>{isArabic ? "الأكثر طلباً" : "Trending"}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilters((prev) => ({ ...prev, isTrending: false }))}
                                            className="hover:text-red-500 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={handleResetAllFilters}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] hover:text-[#0B192C] dark:hover:text-white px-2.5 py-1 transition-colors cursor-pointer"
                                >
                                    <RotateCw className="w-3 h-3" />
                                    <span>{isArabic ? "مسح الكل" : "Clear All"}</span>
                                </button>
                            </div>
                        )}

                        {/* Single Unified Wholesale Merchant Pricing Strip (Replaces 36 repetitive lock banners) */}
                        {!customer && (
                            <div className="mb-5 px-4 sm:px-5 py-3.5 rounded-[14px] bg-[#FAF7F0] dark:bg-white/[0.04] border border-[#0B192C]/[0.09] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="text-xs sm:text-[13px] font-medium text-[#0B192C]/75 dark:text-slate-200 leading-relaxed">
                                    <strong className="font-bold text-[#0B192C] dark:text-white me-1">
                                        {isArabic ? "تسعير الجملة المعتمد للتجار:" : "Authorized Wholesale Pricing:"}
                                    </strong>
                                    {isArabic
                                        ? "تظهر أسعار الطرود والخصومات التجارية تلقائياً على كافة الأصناف بعد تسجيل دخول التاجر."
                                        : "Carton prices and trade discounts appear automatically across all products once signed in."}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Link
                                        href="/account/register"
                                        className="text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline whitespace-nowrap"
                                    >
                                        {isArabic ? "فتح حساب تاجر" : "Register Trade Account"}
                                    </Link>
                                    <Link
                                        href="/account/login"
                                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#0B192C] dark:bg-[#C59329] text-white dark:text-[#0B192C] text-xs font-bold hover:bg-[#162942] dark:hover:bg-[#d4a338] transition-colors whitespace-nowrap"
                                    >
                                        <span>{isArabic ? "تسجيل دخول التاجر" : "Merchant Login"}</span>
                                        <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {fetchError && !loading && (
                            <div role="alert" className="my-4 rounded-2xl border border-red-200 bg-white p-6 text-center dark:border-red-900 dark:bg-zinc-900">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {isArabic ? 'تعذر تحميل المنتجات. يرجى المحاولة مجدداً.' : 'Products could not be loaded. Please try again.'}
                                </p>
                                <button type="button" onClick={() => fetchProducts(fetchError.reset, fetchError.page)} className="mt-3 rounded-full bg-[#0B192C] px-5 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                                </button>
                            </div>
                        )}

                        {products.length === 0 && loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 border-t border-s border-[#0B192C]/[0.08] rounded-[18px] overflow-hidden" aria-hidden="true">
                                {Array.from({ length: 8 }, (_, index) => (
                                    <div key={index} className="aspect-[3/4] animate-pulse bg-[#FAF7F0] dark:bg-zinc-800 border-e border-b border-[#0B192C]/[0.08]" />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {products.length === 0 && !loading && !fetchError && (
                            <div className="flex flex-col items-center justify-center py-16 text-center rounded-[18px] bg-[#FAF7F0]/60 dark:bg-zinc-900 border border-[#0B192C]/[0.09] dark:border-white/10 my-4">
                                <SearchX className="w-12 h-12 text-[#0B192C]/25 dark:text-zinc-600 mb-3" />
                                <h3 className="text-base font-bold text-[#0B192C] dark:text-white mb-1">
                                    {isArabic ? "لم يتم العثور على أي منتجات مطابقة" : "No products found matching filters"}
                                </h3>
                                <p className="text-xs text-[#0B192C]/55 dark:text-slate-400 max-w-sm mb-4">
                                    {isArabic
                                        ? "جرب إزالة بعض الفلاتر المحددة أو تغيير كلمة البحث للعثور على الأصناف المطلوبة."
                                        : "Try clearing some applied filters or adjusting your search term."}
                                </p>
                                {activeFiltersCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleResetAllFilters}
                                        className="px-5 py-2.5 rounded-full bg-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] text-white text-xs font-bold hover:bg-[#162740] transition-colors cursor-pointer"
                                    >
                                        {isArabic ? "إعادة ضبط كافة الفلاتر" : "Reset All Filters"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Products Display (Connected 4-Column Grid vs Connected 1-Column Wholesale List) */}
                        <h2 className="sr-only">
                            {isArabic ? "قائمة المنتجات وتوريد الطرود" : "Wholesale Products List"}
                        </h2>
                        {products.length > 0 && (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 border-t border-s border-[#0B192C]/[0.08] dark:border-white/10 rounded-[18px] overflow-hidden border border-[#0B192C]/[0.09] bg-white dark:bg-zinc-900">
                                    {products.map((product, index) => (
                                        <EditorialProductCard
                                            key={product.id}
                                            product={product}
                                            imagePriority={index < 4}
                                            inConnectedGrid={true}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col border border-[#0B192C]/[0.09] dark:border-white/10 rounded-[18px] overflow-hidden bg-white dark:bg-zinc-900">
                                    {products.map((product) => (
                                        <WholesaleProductRow key={product.id} product={product} />
                                    ))}
                                </div>
                            )
                        )}

                        {/* Automatic Infinite Scroll Trigger & Spinner */}
                        {hasMore && !fetchError && (
                            <div ref={observerRef} className="mt-8 py-6 flex items-center justify-center">
                                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0B192C]/65 dark:text-gray-400 bg-[#FAF7F0] dark:bg-zinc-900 px-4 py-2 rounded-full border border-[#0B192C]/10 dark:border-white/10">
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
