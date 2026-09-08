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

        document.body.style.overflow = "hidden";

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
        <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900 lg:rounded-none lg:border-0 lg:border-t lg:border-slate-100 lg:bg-transparent lg:p-0 lg:pt-2 lg:shadow-none lg:dark:border-white/10 lg:dark:bg-transparent">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <FolderTree className="h-4 w-4 text-[#8A6305]" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 lg:text-[11px] lg:uppercase lg:tracking-wider lg:text-slate-700 lg:dark:text-slate-300">
                        {isArabic ? "الأقسام والتصنيفات" : "Departments"}
                    </span>
                </div>
                {filters.categoryIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, categoryIds: [] })}
                        className="min-h-8 shrink-0 rounded-lg px-2 text-xs font-bold text-[#8A6305] transition-colors hover:bg-[#FAF6EC] lg:min-h-0 lg:p-0 lg:text-[10px] lg:hover:bg-transparent lg:hover:underline cursor-pointer"
                    >
                        {isArabic ? "إلغاء التحديد" : "Clear"}
                    </button>
                )}
            </div>

            <div className="space-y-1">
                {categories.map((cat) => {
                    const isChecked = filters.categoryIds.includes(cat.id);
                    const displayName = isArabic ? cat.name : (cat.description || cat.nameEn || cat.name);

                    return (
                        <label
                            key={cat.id}
                            className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-sm cursor-pointer select-none transition-colors lg:min-h-0 lg:text-xs ${
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
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8A6305] peer-focus-visible:ring-offset-1 lg:h-4 lg:w-4 lg:rounded ${
                                        isChecked
                                            ? "bg-[#8A6305] text-white border-[#8A6305]"
                                            : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                    }`}
                                >
                                    {isChecked && <Check className="h-3.5 w-3.5 lg:h-3 lg:w-3" />}
                                </div>

                                <span className="truncate">{displayName}</span>
                            </div>

                            {cat._count?.products !== undefined && (
                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:bg-zinc-800 dark:text-slate-400 lg:bg-transparent lg:px-0 lg:py-0 lg:text-[10px] lg:font-mono">
                                    {cat._count.products}
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
        </section>
    );

    // Brands Section component
    const brandsSection = brands.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900 lg:rounded-none lg:border-0 lg:border-t lg:border-slate-100 lg:bg-transparent lg:p-0 lg:pt-2 lg:shadow-none lg:dark:border-white/10 lg:dark:bg-transparent">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-[#8A6305]" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 lg:text-[11px] lg:uppercase lg:tracking-wider lg:text-slate-700 lg:dark:text-slate-300">
                        {isArabic ? "الوكالات والعلامات التجارية" : "Agencies & Brands"}
                    </span>
                </div>
                {filters.brandIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, brandIds: [] })}
                        className="min-h-8 shrink-0 rounded-lg px-2 text-xs font-bold text-[#8A6305] transition-colors hover:bg-[#FAF6EC] lg:min-h-0 lg:p-0 lg:text-[11px] lg:hover:bg-transparent lg:hover:underline cursor-pointer"
                    >
                        {isArabic ? "إلغاء التحديد" : "Clear"}
                    </button>
                )}
            </div>

            {/* Brand Search Input */}
            {brands.length > 5 && (
                <div className="relative">
                    <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        aria-label={isArabic ? "البحث في الوكالات" : "Search agencies and brands"}
                        placeholder={isArabic ? "ابحث عن وكالة..." : "Search brands..."}
                        className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-9 py-2 text-sm text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/10 dark:border-white/10 dark:bg-zinc-800/80 dark:text-white lg:min-h-0 lg:text-xs"
                    />
                    {brandSearch && (
                        <button
                            type="button"
                            onClick={() => setBrandSearch("")}
                            className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 dark:hover:bg-zinc-700 dark:hover:text-white cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Brand List */}
            <div className="space-y-1">
                {filteredBrands.map((brand) => {
                    const isChecked = filters.brandIds.includes(brand.id);
                    const count = brand._count?.products;

                    return (
                        <label
                            key={brand.id}
                            className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-sm cursor-pointer select-none transition-colors lg:min-h-0 lg:text-xs ${
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
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8A6305] peer-focus-visible:ring-offset-1 lg:h-4 lg:w-4 lg:rounded ${
                                        isChecked
                                            ? "bg-[#8A6305] text-white border-[#8A6305]"
                                            : "border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                    }`}
                                >
                                    {isChecked && <Check className="h-3.5 w-3.5 lg:h-3 lg:w-3" />}
                                </div>

                                {brand.image && (
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white lg:h-5 lg:w-5">
                                        <ResilientImage
                                            src={brand.image}
                                            alt={brand.name}
                                            className="object-contain p-0.5"
                                            sizes="(max-width: 1023px) 28px, 20px"
                                            showSkeleton={false}
                                        />
                                    </span>
                                )}

                                <span className="truncate">{brand.name}</span>
                            </div>

                            {count !== undefined && (
                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:bg-zinc-800 dark:text-slate-400 lg:bg-transparent lg:px-0 lg:py-0 lg:text-[10px] lg:font-mono">
                                    {count}
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
        </section>
    );

    // The inner filter content rendered both on desktop sidebar and mobile drawer
    const filterContent = (
        <div className="flex flex-col gap-3 text-[#0B192C] dark:text-gray-100 lg:gap-4">
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
            <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 lg:text-[11px] lg:uppercase lg:tracking-wider lg:text-slate-500 lg:dark:text-slate-400">
                    {isArabic ? "حالة التوفر والعروض" : "Availability & Deals"}
                </span>

                <div className="flex flex-col gap-2 lg:gap-1.5 lg:pt-1">
                    {/* In Stock */}
                    <button
                        type="button"
                        onClick={handleToggleInStock}
                        aria-pressed={filters.inStock}
                        className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-start text-sm font-bold transition-colors cursor-pointer lg:min-h-0 lg:text-xs ${
                            filters.inStock
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40"
                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors lg:h-4 lg:w-4 lg:rounded ${
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
                        className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-start text-sm font-bold transition-colors cursor-pointer lg:min-h-0 lg:text-xs ${
                            filters.onSale
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40"
                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors lg:h-4 lg:w-4 lg:rounded ${
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
                        className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-start text-sm font-bold transition-colors cursor-pointer lg:min-h-0 lg:text-xs ${
                            filters.isTrending
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40"
                                : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors lg:h-4 lg:w-4 lg:rounded ${
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
            </section>

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
                        className="absolute inset-x-0 bottom-0 flex h-[min(88dvh,760px)] max-h-[calc(100dvh-0.75rem)] flex-col overflow-hidden overscroll-contain rounded-t-3xl border-t border-slate-200 bg-slate-50 shadow-2xl animate-in slide-in-from-bottom duration-300 pointer-events-auto dark:border-white/10 dark:bg-zinc-950 sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-xl sm:rounded-3xl sm:border"
                        style={{ overscrollBehavior: "contain" }}
                    >
                        {/* Top Header & Grab Handle (non-scrolling, touch-none) */}
                        <div className="shrink-0 border-b border-slate-100 bg-white px-4 pb-3 pt-2.5 select-none touch-none dark:border-white/10 dark:bg-zinc-900">
                            {/* Drawer Grab Bar */}
                            <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700" />

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF6EC] text-[#8A6305] dark:bg-[#8A6305]/20">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                    <span id="mobile-catalog-filters-title" className="block truncate text-base font-bold text-[#0B192C] dark:text-white">
                                        {isArabic ? "تصفية المنتجات" : "Filter Catalog"}
                                    </span>
                                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
                                            {activeFiltersCount > 0
                                                ? (isArabic ? `${activeFiltersCount} محدد` : `${activeFiltersCount} selected`)
                                                : (isArabic ? "اختر ما يناسبك" : "Choose what fits")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    {activeFiltersCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={onResetFilters}
                                            className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer"
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
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-95 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-white cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Filter Options - Hidden Scrollbars & Overscroll Contained */}
                        <div
                            className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain sm:px-4"
                            style={{
                                touchAction: "pan-y",
                                overscrollBehavior: "contain",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {filterContent}
                        </div>

                        {/* Sticky Apply Button with Safe-Area Inset */}
                        <div className="shrink-0 border-t border-slate-200/80 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/95 sm:px-4">
                            <button
                                type="button"
                                onClick={onCloseMobileDrawer}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#132035] active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer"
                            >
                                <span>
                                    {isArabic
                                        ? `عرض النتائج (${totalResults} منتج)`
                                        : `Show ${totalResults} results`}
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
