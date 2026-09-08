"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/app/context/LanguageContext";
import ResilientImage from "@/app/components/ResilientImage";
import { Search, X, Filter, Check, RotateCw, Store, FolderTree, Zap, Tag, CheckCircle2 } from 'lucide-react';

export interface FilterBrandCategory {
    id: string;
    name: string;
    slug: string;
    mainCategoryId?: string | null;
}

export interface FilterBrand {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    mainCategoryId?: string | null;
    mainCategory?: { id: string; name: string; slug: string } | null;
    categories?: FilterBrandCategory[];
    _count?: {
        products: number;
    };
}

export interface FilterCategory {
    id: string;
    name: string;
    slug: string;
    nameEn?: string | null;
    description?: string | null;
    _count?: {
        products: number;
    };
}

export interface FilterState {
    brandIds: string[];
    categoryIds: string[];
    inStock: boolean;
    onSale: boolean;
    isTrending: boolean;
}

export function reconcileCategoriesWithBrands(
    categoryIds: string[],
    brandIds: string[],
    brands: FilterBrand[],
    currentCategories: FilterCategory[]
): string[] {
    if (categoryIds.length === 0 || brandIds.length === 0) {
        return categoryIds;
    }

    const selectedBrands = brands.filter((b) => brandIds.includes(b.id));
    if (selectedBrands.length === 0) {
        return categoryIds;
    }

    const nextCategoryIds: string[] = [];

    for (const catId of categoryIds) {
        let isDirectlyValid = false;
        let mappedId: string | null = null;

        for (const brand of selectedBrands) {
            // 1. Direct Category ID match
            if (brand.categories && brand.categories.some((c) => c.id === catId || c.slug === catId)) {
                isDirectlyValid = true;
                break;
            }

            // 2. MainCategory ID match (brand or its categories belong to this mainCategory)
            if (
                brand.mainCategoryId === catId ||
                brand.mainCategory?.id === catId ||
                brand.mainCategory?.slug === catId ||
                (brand.categories && brand.categories.some((c) => c.mainCategoryId === catId))
            ) {
                isDirectlyValid = true;
                break;
            }

            // 3. Name-based match: if the brand has a category with the same name, map to this brand's category ID
            const activeCat = currentCategories.find((c) => c.id === catId);
            if (activeCat && brand.categories) {
                const targetName = activeCat.name.trim().toLowerCase();
                const matchedBrandCat = brand.categories.find(
                    (c) => c.name.trim().toLowerCase() === targetName
                );
                if (matchedBrandCat) {
                    mappedId = matchedBrandCat.id;
                    break;
                }
            }
        }

        if (isDirectlyValid) {
            nextCategoryIds.push(catId);
        } else if (mappedId) {
            nextCategoryIds.push(mappedId);
        }
    }

    return nextCategoryIds;
}

interface ProductsSidebarFilterProps {
    brands: FilterBrand[];
    categories: FilterCategory[];
    filters: FilterState;
    onFiltersChange: (newFilters: FilterState) => void;
    onResetFilters: () => void;
    totalResults: number;
    isMobileDrawerOpen: boolean;
    onCloseMobileDrawer: () => void;
}

export default function ProductsSidebarFilter({
    brands,
    categories,
    filters,
    onFiltersChange,
    onResetFilters,
    totalResults,
    isMobileDrawerOpen,
    onCloseMobileDrawer,
}: ProductsSidebarFilterProps) {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const [brandSearch, setBrandSearch] = useState("");
    const [mounted, setMounted] = useState(false);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isMobileDrawerOpen) return;

        const previousOverflow = document.body.style.overflow;
        const previousTouchAction = document.body.style.touchAction;

        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        // Auto-focus close button when modal opens
        const focusTimer = setTimeout(() => {
            closeBtnRef.current?.focus();
        }, 50);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCloseMobileDrawer();
                return;
            }

            if (event.key === "Tab" && drawerRef.current) {
                const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (focusables.length > 0) {
                    const first = focusables[0];
                    const last = focusables[focusables.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                        last.focus();
                        event.preventDefault();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        first.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.touchAction = previousTouchAction;
            clearTimeout(focusTimer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMobileDrawerOpen, onCloseMobileDrawer]);

    // Filtered brand list by search term
    const filteredBrands = useMemo(() => {
        if (!brandSearch.trim()) return brands;
        const q = brandSearch.toLowerCase().trim();
        return brands.filter((b) => b.name.toLowerCase().includes(q));
    }, [brands, brandSearch]);

    // Active filters count
    const activeFiltersCount =
        filters.brandIds.length +
        filters.categoryIds.length +
        (filters.inStock ? 1 : 0) +
        (filters.onSale ? 1 : 0) +
        (filters.isTrending ? 1 : 0);

    const handleToggleBrand = (brandId: string) => {
        const isSelected = filters.brandIds.includes(brandId);
        const nextBrandIds = isSelected
            ? filters.brandIds.filter((id) => id !== brandId)
            : [...filters.brandIds, brandId];

        const nextCategoryIds = reconcileCategoriesWithBrands(
            filters.categoryIds,
            nextBrandIds,
            brands,
            categories
        );

        onFiltersChange({
            ...filters,
            brandIds: nextBrandIds,
            categoryIds: nextCategoryIds,
        });
    };

    const handleToggleCategory = (catId: string) => {
        const next = filters.categoryIds.includes(catId)
            ? filters.categoryIds.filter((id) => id !== catId)
            : [...filters.categoryIds, catId];
        onFiltersChange({ ...filters, categoryIds: next });
    };

    const handleToggleInStock = () => {
        onFiltersChange({ ...filters, inStock: !filters.inStock });
    };

    const handleToggleOnSale = () => {
        onFiltersChange({ ...filters, onSale: !filters.onSale });
    };

    const handleToggleTrending = () => {
        onFiltersChange({ ...filters, isTrending: !filters.isTrending });
    };

    // Categories Section component
    const categoriesSection = categories.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <FolderTree className="text-[#8A6305] text-sm" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {isArabic ? "الأقسام والتصنيفات" : "Departments"}
                    </span>
                </div>
                {filters.categoryIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, categoryIds: [] })}
                        className="text-[10px] font-bold text-[#8A6305] hover:underline cursor-pointer"
                    >
                        {isArabic ? "إلغاء التحديد" : "Clear"}
                    </button>
                )}
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1 pe-1 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain lg:max-h-none lg:overflow-visible">
                {categories.map((cat) => {
                    const isChecked = filters.categoryIds.includes(cat.id);
                    const displayName = isArabic ? cat.name : (cat.description || cat.nameEn || cat.name);

                    return (
                        <label
                            key={cat.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                                isChecked
                                    ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white font-bold"
                                    : "hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-zinc-800"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleCategory(cat.id)}
                                    className="sr-only peer"
                                />
                                <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8A6305] peer-focus-visible:ring-offset-1 ${
                                        isChecked
                                            ? "bg-[#8A6305] text-white border-[#8A6305]"
                                            : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                    }`}
                                >
                                    {isChecked && <Check className="text-xs" />}
                                </div>

                                <span className="truncate">{displayName}</span>
                            </div>

                            {cat._count?.products !== undefined && (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 shrink-0">
                                    ({cat._count.products})
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
        </div>
    );

    // Brands Section component
    const brandsSection = brands.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Store className="text-[#8A6305] text-sm" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {isArabic ? "الوكالات والعلامات التجارية" : "Agencies & Brands"}
                    </span>
                </div>
                {filters.brandIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, brandIds: [] })}
                        className="text-[11px] font-bold text-[#8A6305] hover:underline cursor-pointer"
                    >
                        {isArabic ? "إلغاء التحديد" : "Clear"}
                    </button>
                )}
            </div>

            {/* Brand Search Input */}
            {brands.length > 5 && (
                <div className="relative">
                    <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                    <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        aria-label={isArabic ? "البحث في الوكالات" : "Search agencies and brands"}
                        placeholder={isArabic ? "ابحث عن وكالة..." : "Search brands..."}
                        className="w-full ps-8 pe-8 py-2 text-sm sm:text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#8A6305] text-[#0B192C] dark:text-white placeholder:text-slate-400 transition-colors"
                    />
                    {brandSearch && (
                        <button
                            type="button"
                            onClick={() => setBrandSearch("")}
                            className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Brand List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pe-1 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain lg:max-h-none lg:overflow-visible">
                {filteredBrands.map((brand) => {
                    const isChecked = filters.brandIds.includes(brand.id);
                    const count = brand._count?.products;

                    return (
                        <label
                            key={brand.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                                isChecked
                                    ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white font-bold"
                                    : "hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-zinc-800"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleBrand(brand.id)}
                                    className="sr-only peer"
                                />
                                <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8A6305] peer-focus-visible:ring-offset-1 ${
                                        isChecked
                                            ? "bg-[#8A6305] text-white border-[#8A6305]"
                                            : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                    }`}
                                >
                                    {isChecked && <Check className="text-xs" />}
                                </div>

                                {brand.image && (
                                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                                        <ResilientImage
                                            src={brand.image}
                                            alt={brand.name}
                                            className="object-contain p-0.5"
                                            sizes="20px"
                                            showSkeleton={false}
                                        />
                                    </span>
                                )}

                                <span className="truncate">{brand.name}</span>
                            </div>

                            {count !== undefined && (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 shrink-0">
                                    ({count})
                                </span>
                            )}
                        </label>
                    );
                })}

                {filteredBrands.length === 0 && (
                    <p className="text-xs text-slate-400 py-3 text-center">
                        {isArabic ? "لا توجد وكالة بهذا الاسم" : "No brands found"}
                    </p>
                )}
            </div>
        </div>
    );

    // The inner filter content rendered both on desktop sidebar and mobile drawer
    const filterContent = (
        <div className="flex flex-col gap-4 text-[#0B192C] dark:text-gray-100">
            {/* Desktop-only Header / Active Count */}
            <div className="hidden lg:flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF6EC] dark:bg-[#8A6305]/20 flex items-center justify-center text-[#8A6305]">
                        <Filter className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-[#0B192C] dark:text-white">
                        {isArabic ? "تصفية المنتجات" : "Filter Catalog"}
                    </span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-[#8A6305] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>

                {activeFiltersCount > 0 && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                    >
                        <RotateCw className="w-3 h-3" />
                        <span>{isArabic ? "إعادة ضبط" : "Reset"}</span>
                    </button>
                )}
            </div>

            {/* Quick Status Toggles (Wholesale Deals & Stock) */}
            <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isArabic ? "حالة التوفر والعروض" : "Availability & Deals"}
                </span>

                <div className="flex flex-col gap-1.5 pt-1">
                    {/* In Stock */}
                    <button
                        type="button"
                        onClick={handleToggleInStock}
                        aria-pressed={filters.inStock}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer text-start ${
                            filters.inStock
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40"
                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                filters.inStock
                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                    : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                        >
                            {filters.inStock && <Check className="w-3 h-3" />}
                        </div>
                        <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                                filters.inStock ? "text-[#8A6305]" : "text-emerald-500"
                            }`}
                        />
                        <span className="truncate">{isArabic ? "المتوفر في المخزون فقط" : "In Stock Only"}</span>
                    </button>

                    {/* On Sale */}
                    <button
                        type="button"
                        onClick={handleToggleOnSale}
                        aria-pressed={filters.onSale}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer text-start ${
                            filters.onSale
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40"
                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                filters.onSale
                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                    : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                        >
                            {filters.onSale && <Check className="w-3 h-3" />}
                        </div>
                        <Tag
                            className={`w-4 h-4 shrink-0 ${
                                filters.onSale ? "text-[#8A6305]" : "text-amber-500"
                            }`}
                        />
                        <span className="truncate">{isArabic ? "عروض وتخفيضات خاصة" : "On Sale & Offers"}</span>
                    </button>

                    {/* Trending / Best Sellers */}
                    <button
                        type="button"
                        onClick={handleToggleTrending}
                        aria-pressed={filters.isTrending}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer text-start ${
                            filters.isTrending
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40"
                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                filters.isTrending
                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                    : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                        >
                            {filters.isTrending && <Check className="w-3 h-3" />}
                        </div>
                        <Zap
                            className={`w-4 h-4 shrink-0 ${
                                filters.isTrending ? "text-[#8A6305]" : "text-amber-500"
                            }`}
                        />
                        <span className="truncate">{isArabic ? "الأكثر طلباً ورواجاً" : "Trending Products"}</span>
                    </button>
                </div>
            </div>

            {/* Stable filter sections order: Brands then Categories */}
            {brandsSection}
            {categoriesSection}
        </div>
    );

    return (
        <>
            {/* Desktop Sticky Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700">
                    {filterContent}
                </div>
            </aside>

            {/* Mobile Bottom Sheet Modal Portal */}
            {mounted && isMobileDrawerOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] lg:hidden overflow-hidden"
                    style={{ touchAction: "none" }}
                >
                    {/* Backdrop Overlay (tap to close) */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
                        onClick={onCloseMobileDrawer}
                        aria-hidden="true"
                    />

                    {/* Sheet Panel - Firmly anchored to bottom of viewport */}
                    <div
                        ref={drawerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-catalog-filters-title"
                        id="mobile-catalog-filters"
                        className="absolute bottom-0 inset-x-0 bg-white dark:bg-zinc-900 rounded-t-3xl max-h-[88dvh] h-[85dvh] flex flex-col border-t border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden overscroll-contain animate-in slide-in-from-bottom duration-300 pointer-events-auto"
                        style={{ overscrollBehavior: "contain" }}
                    >
                        {/* Top Header & Grab Handle (non-scrolling, touch-none) */}
                        <div className="shrink-0 px-5 pt-3 pb-3 border-b border-slate-100 dark:border-white/10 select-none touch-none bg-white dark:bg-zinc-900">
                            {/* Drawer Grab Bar */}
                            <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-[#FAF6EC] dark:bg-[#8A6305]/20 flex items-center justify-center text-[#8A6305]">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                    <span id="mobile-catalog-filters-title" className="font-bold text-base text-[#0B192C] dark:text-white">
                                        {isArabic ? "تصفية المنتجات" : "Filter Catalog"}
                                    </span>
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-[#8A6305] text-white text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeFiltersCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={onResetFilters}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                        >
                                            <RotateCw className="w-3.5 h-3.5" />
                                            <span>{isArabic ? "إعادة ضبط" : "Reset"}</span>
                                        </button>
                                    )}

                                    <button
                                        ref={closeBtnRef}
                                        type="button"
                                        onClick={onCloseMobileDrawer}
                                        aria-label={isArabic ? "إغلاق التصفية" : "Close filters"}
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Filter Options - Hidden Scrollbars & Overscroll Contained */}
                        <div
                            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
                            style={{
                                touchAction: "pan-y",
                                overscrollBehavior: "contain",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {filterContent}
                        </div>

                        {/* Sticky Apply Button with Safe-Area Inset */}
                        <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={onCloseMobileDrawer}
                                className="w-full py-3.5 bg-[#0B192C] hover:bg-[#132035] dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-2xl text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>
                                    {isArabic
                                        ? `عرض النتائج (${totalResults} منتج)`
                                        : `Apply Filters (${totalResults} results)`}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
