"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ProductsBreadcrumbs from "@/app/components/ProductsPageComponents/ProductsBreadcrumbs";
import BrandHeroHeader from "@/app/components/ProductsPageComponents/BrandHeroHeader";
import ProductsHeader from "@/app/components/ProductsPageComponents/ProductsHeader";
import EditorialProductCard from "@/app/components/ProductsPageComponents/EditorialProductCard";
import WholesaleProductRow from "@/app/components/ProductsPageComponents/WholesaleProductRow";
import CustomSortDropdown from "@/app/components/ProductsPageComponents/CustomSortDropdown";
import ProductsSidebarFilter, { FilterState } from "@/app/components/ProductsPageComponents/ProductsSidebarFilter";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    MdSearchOff,
    MdSearch,
    MdClose,
    MdGridView,
    MdViewList,
    MdTune,
    MdRefresh,
} from "react-icons/md";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    nameEn?: string | null;
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
    price: string;
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

interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    group: string;
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
}

const ProductsClient = ({
    initialCategories,
    initialBrands = [],
    initialProducts,
    initialTotal,
    activeCategory = null,
    activeBrand = null,
    activeMainCategory = null,
}: ProductsClientProps) => {
    const { t, language } = useLanguage();
    const isArabic = language === "ar";

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [sort, setSort] = useState("best_sellers");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(initialTotal);
    const [isInitialRender, setIsInitialRender] = useState(true);

    // View Density: 'grid' vs 'list' (Wholesale view)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Live catalog search
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Mobile filter drawer state
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Faceted filter state
    const [filters, setFilters] = useState<FilterState>({
        brandIds: activeBrand ? [activeBrand.id] : [],
        categoryIds: activeCategory ? [activeCategory.id] : [],
        inStock: false,
        onSale: false,
        isTrending: false,
    });

    const observerRef = useRef<HTMLDivElement>(null);
    const hasMore = products.length < totalProducts;

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

    const fetchProducts = useCallback(
        async (reset = false) => {
            setLoading(true);

            try {
                const currentPage = reset ? 1 : page;

                // Priority to filters.categoryIds, fallback to activeCategory
                let categoryQuery = "";
                if (filters.categoryIds.length > 0) {
                    categoryQuery = `&categoryIds=${filters.categoryIds.join(",")}`;
                } else if (activeCategory) {
                    categoryQuery = `&categoryIds=${activeCategory.id}`;
                }

                // Priority to filters.brandIds, fallback to activeBrand
                let brandQuery = "";
                if (filters.brandIds.length > 0) {
                    brandQuery = `&brandIds=${filters.brandIds.join(",")}`;
                } else if (activeBrand) {
                    brandQuery = `&brandIds=${activeBrand.id}`;
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

                const url = `/api/products?page=${currentPage}&limit=12${categoryQuery}${brandQuery}${mainCategoryQuery}${inStockQuery}${onSaleQuery}${isTrendingQuery}${liveSearchQuery}${sortQuery}${countParams}`;

                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    if (reset) {
                        setProducts(data.products);
                    } else {
                        setProducts((prev) => [...prev, ...data.products]);
                    }
                    if (data.pagination?.total !== undefined) {
                        setTotalProducts(data.pagination.total);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        },
        [
            page,
            filters,
            activeCategory,
            activeBrand,
            activeMainCategory,
            debouncedSearch,
            sort,
            totalProducts,
        ]
    );

    // Refetch when filters, search, or sort changes
    useEffect(() => {
        if (isInitialRender) {
            setIsInitialRender(false);
            if (sort !== "best_sellers" || debouncedSearch || activeFiltersCount > 0) {
                setPage(1);
                fetchProducts(true);
            }
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
                if (entries[0].isIntersecting) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { rootMargin: "1000px" }
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
        const next = filters.brandIds.includes(brandId)
            ? filters.brandIds.filter((id) => id !== brandId)
            : [...filters.brandIds, brandId];
        setFilters((prev) => ({ ...prev, brandIds: next }));
    };

    const handleResetAllFilters = () => {
        setFilters({
            brandIds: activeBrand ? [activeBrand.id] : [],
            categoryIds: activeCategory ? [activeCategory.id] : [],
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
        if (activeBrand) {
            return activeBrand.name;
        }
        return t("products.allProducts");
    };

    // Find brand / category names for active filter chips
    const selectedBrandObjects = useMemo(() => {
        return initialBrands.filter((b) => filters.brandIds.includes(b.id));
    }, [initialBrands, filters.brandIds]);

    const selectedCategoryObjects = useMemo(() => {
        return initialCategories.filter((c) => filters.categoryIds.includes(c.id));
    }, [initialCategories, filters.categoryIds]);

    return (
        <div className="flex-1 container-custom py-4 md:py-6">
            {/* Breadcrumbs */}
            <ProductsBreadcrumbs
                activeCategory={activeCategory}
                activeBrand={activeBrand}
                activeMainCategory={activeMainCategory}
            />

            {/* Brand Hero or Page Header */}
            {activeBrand ? (
                <BrandHeroHeader brand={activeBrand} totalProducts={totalProducts} />
            ) : (
                <ProductsHeader />
            )}

            {/* Main Faceted 2-Column Catalog Layout */}
            <div className="flex items-start gap-6 mt-2">
                {/* Faceted Filter Sidebar (Desktop & Mobile Drawer) */}
                <ProductsSidebarFilter
                    brands={initialBrands}
                    categories={initialCategories}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onResetFilters={handleResetAllFilters}
                    totalResults={totalProducts}
                    isMobileDrawerOpen={isMobileDrawerOpen}
                    onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Control Bar: Search, View Density, Mobile Filter, and Sort */}
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-3 sm:p-4 mb-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* In-Catalog Live Search */}
                            <div className="relative flex-1 max-w-md">
                                <MdSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={
                                        isArabic
                                            ? "ابحث في الكتالوج بالاسم، الماركة، أو الباركود..."
                                            : "Search catalog by name, brand, or SKU..."
                                    }
                                    className="w-full ps-9 pe-8 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#8A6305] text-[#0B192C] dark:text-white placeholder:text-gray-400"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                    >
                                        <MdClose className="text-sm" />
                                    </button>
                                )}
                            </div>

                            {/* Right Controls: View Switcher, Mobile Filter Button, Sort Dropdown */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                {/* Mobile Filter Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileDrawerOpen(true)}
                                    className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-[#0B192C] dark:text-white rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 hover:border-[#8A6305] transition-all cursor-pointer active:scale-95"
                                >
                                    <MdTune className="text-sm text-[#8A6305]" />
                                    <span>{isArabic ? "تصفية" : "Filters"}</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-[#8A6305] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                {/* View Mode Toggle (Grid ⊞ vs Wholesale List ☰) */}
                                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-gray-200 dark:border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("grid")}
                                        title={isArabic ? "عرض الشبكة" : "Grid View"}
                                        className={`p-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                                            viewMode === "grid"
                                                ? "bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white shadow-xs"
                                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        <MdGridView className="text-base" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("list")}
                                        title={isArabic ? "عرض الجملة المضغوط" : "Wholesale List View"}
                                        className={`p-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                                            viewMode === "list"
                                                ? "bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white shadow-xs"
                                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        <MdViewList className="text-base" />
                                    </button>
                                </div>

                                {/* Custom Sort Dropdown */}
                                <CustomSortDropdown
                                    sort={sort}
                                    setSort={setSort}
                                    options={sortOptions}
                                />
                            </div>
                        </div>

                        {/* Active Filter Chips Bar */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-gray-100 dark:border-white/5">
                                <span className="text-[11px] font-bold text-gray-400 me-1">
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
                                            <MdClose className="text-xs" />
                                        </button>
                                    </span>
                                )}

                                {/* Selected Brand Chips */}
                                {selectedBrandObjects.map((b) => (
                                    <span
                                        key={b.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-gray-200 dark:border-white/10"
                                    >
                                        <span>{b.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickToggleBrand(b.id)}
                                            className="hover:text-red-500"
                                        >
                                            <MdClose className="text-xs" />
                                        </button>
                                    </span>
                                ))}

                                {/* Selected Category Chips */}
                                {selectedCategoryObjects.map((c) => (
                                    <span
                                        key={c.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 text-[#0B192C] dark:text-white border border-gray-200 dark:border-white/10"
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
                                            <MdClose className="text-xs" />
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
                                            <MdClose className="text-xs" />
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
                                            <MdClose className="text-xs" />
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
                                            <MdClose className="text-xs" />
                                        </button>
                                    </span>
                                )}

                                {/* Clear All Button */}
                                <button
                                    type="button"
                                    onClick={handleResetAllFilters}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A6305] hover:text-[#705004] ms-auto cursor-pointer"
                                >
                                    <MdRefresh className="text-xs" />
                                    <span>{isArabic ? "مسح الكل" : "Clear All"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Results Counter & Section Title */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            {!(activeBrand && !activeCategory && !activeMainCategory) && (
                                <h1 className="text-lg md:text-xl font-bold text-[#0B192C] dark:text-white tracking-tight">
                                    {getHeadingTitle()}
                                </h1>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                {isArabic
                                    ? `عرض ${products.length} من أصل ${totalProducts} صنف بالجملة`
                                    : `Showing ${products.length} of ${totalProducts} wholesale products`}
                            </p>
                        </div>
                    </div>

                    {/* Empty State */}
                    {products.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-white/10 my-4 shadow-xs">
                            <MdSearchOff className="text-5xl text-gray-300 dark:text-gray-600 mb-3" />
                            <h3 className="text-base font-bold text-[#0B192C] dark:text-white mb-1">
                                {isArabic ? "لم يتم العثور على أي منتجات مطابقة" : "No products found matching filters"}
                            </h3>
                            <p className="text-xs text-[#475569] dark:text-gray-400 max-w-sm mb-4">
                                {isArabic
                                    ? "جرب إزالة بعض الفلاتر المحددة أو تغيير كلمة البحث للعثور على الأصناف المطلوبة."
                                    : "Try clearing some applied filters or adjusting your search term."}
                            </p>
                            {activeFiltersCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleResetAllFilters}
                                    className="px-4 py-2 rounded-xl bg-[#0B192C] dark:bg-[#8A6305] text-white text-xs font-bold shadow-xs hover:bg-[#8A6305] transition-colors"
                                >
                                    {isArabic ? "إعادة ضبط كافة الفلاتر" : "Reset All Filters"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Products Display (Grid vs Wholesale List) */}
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                            {products.map((product) => (
                                <EditorialProductCard key={product.id} product={product} />
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
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 shadow-xs">
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
    );
};

export default ProductsClient;
