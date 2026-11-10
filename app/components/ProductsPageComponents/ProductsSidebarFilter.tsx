"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/app/context/LanguageContext";
import ResilientImage from "@/app/components/ResilientImage";
import { getBrandDisplayName } from "@/lib/brand-display";
import { Search, X, Check, RotateCw } from 'lucide-react';

export interface FilterBrandCategory {
    id: string;
    name: string;
    nameEn?: string | null;
    slug: string;
    mainCategoryId?: string | null;
}

export interface FilterBrand {
    id: string;
    name: string;
    nameEn?: string | null;
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
    resetKey?: number;
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
    resetKey = 0,
    totalResults,
    isMobileDrawerOpen,
    onCloseMobileDrawer,
}: ProductsSidebarFilterProps) {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const [brandSearch, setBrandSearch] = useState("");
    useEffect(() => { setBrandSearch(''); }, [resetKey]);
    const [mounted, setMounted] = useState(false);
    const handleReset = () => {
        setBrandSearch('');
        onResetFilters();
    };
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
        return brands.filter((b) => b.name.toLowerCase().includes(q) || b.nameEn?.toLowerCase().includes(q));
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

    // Categories Section component — Concept 01 Clean Architectural Filter Group
    const categoriesSection = categories.length > 0 && (
        <section className="space-y-3 border-t border-[#0B192C]/[0.09] dark:border-white/10 pt-5">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#0B192C] dark:text-white">
                    {isArabic ? "الأقسام والتصنيفات" : "Departments"}
                </span>
                {filters.categoryIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, categoryIds: [] })}
                        className="text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4 cursor-pointer"
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
                            className={`flex items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 text-[13px] cursor-pointer select-none transition-colors ${
                                isChecked
                                    ? "bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white font-bold"
                                    : "hover:bg-[#FAF7F0]/70 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300"
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
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8A6305] ${
                                        isChecked
                                            ? "bg-[#0B192C] text-[#E5B54A] border-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] dark:border-[#C59329]"
                                            : "border-[#0B192C]/25 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                    }`}
                                >
                                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>

                                <span className="truncate">{displayName}</span>
                            </div>

                            {cat._count?.products !== undefined && (
                                <span className="shrink-0 rounded-full bg-[#FAF7F0] dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                                    {cat._count.products}
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
        </section>
    );

    // Brands Section component — Concept 01 Clean Agency Filter Group
    const brandsSection = brands.length > 0 && (
        <section className="space-y-3 border-t border-[#0B192C]/[0.09] dark:border-white/10 pt-5">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#0B192C] dark:text-white">
                    {isArabic ? "الوكالات التجارية المعتمدة" : "Official Agencies"}
                </span>
                {filters.brandIds.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, brandIds: [] })}
                        className="text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4 cursor-pointer"
                    >
                        {isArabic ? "إلغاء التحديد" : "Clear"}
                    </button>
                )}
            </div>

            {/* Brand Search Capsule Input */}
            {brands.length > 5 && (
                <div className="relative">
                    <Search className="absolute start-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        aria-label={isArabic ? "البحث في الوكالات" : "Search agencies and brands"}
                        placeholder={isArabic ? "ابحث عن وكالة..." : "Search agencies..."}
                        className="h-9.5 w-full rounded-full border border-[#0B192C]/15 bg-[#FAF7F0] ps-9 pe-8 text-xs text-[#0B192C] outline-none transition-colors placeholder:text-slate-400 focus:border-[#8A6305] focus:bg-white dark:border-white/15 dark:bg-zinc-800 dark:text-white"
                    />
                    {brandSearch && (
                        <button
                            type="button"
                            onClick={() => setBrandSearch("")}
                            className="absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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
                            className={`flex items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 text-[13px] cursor-pointer select-none transition-colors ${
                                isChecked
                                    ? "bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white font-bold"
                                    : "hover:bg-[#FAF7F0]/70 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300"
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
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#8A6305] ${
                                        isChecked
                                            ? "bg-[#0B192C] text-[#E5B54A] border-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] dark:border-[#C59329]"
                                            : "border-[#0B192C]/25 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                    }`}
                                >
                                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>

                                {brand.image && (
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-[#0B192C]/[0.08] bg-white">
                                        <ResilientImage
                                            src={brand.image}
                                            alt={getBrandDisplayName(brand, language === 'ar' ? 'ar' : 'en')}
                                            className="object-contain p-0.5"
                                            sizes="24px"
                                            showSkeleton={false}
                                        />
                                    </span>
                                )}

                                <span className="truncate">{getBrandDisplayName(brand, language === 'ar' ? 'ar' : 'en')}</span>
                            </div>

                            {count !== undefined && (
                                <span className="shrink-0 rounded-full bg-[#FAF7F0] dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                                    {count}
                                </span>
                            )}
                        </label>
                    );
                })}

                {filteredBrands.length === 0 && (
                    <p className="text-xs text-slate-400 py-3 text-center">
                        {isArabic ? "لا توجد وكالة بهذا الاسم" : "No agencies found"}
                    </p>
                )}
            </div>
        </section>
    );

    // The inner filter content rendered both on desktop sidebar and mobile drawer
    const filterContent = (
        <div className="flex flex-col gap-5 text-[#0B192C] dark:text-gray-100">
            {/* Desktop Header / Active Count */}
            <div className="hidden lg:flex items-center justify-between pb-3.5 border-b border-[#0B192C]/[0.09] dark:border-white/10">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] text-[#0B192C] dark:text-white">
                        {isArabic ? "تصفية الكتالوج" : "Filter Catalog"}
                    </span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-[#0B192C] text-[#E5B54A] text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>

                {activeFiltersCount > 0 && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCw className="w-3 h-3" />
                        <span>{isArabic ? "إعادة ضبط" : "Reset"}</span>
                    </button>
                )}
            </div>

            {/* 1. Availability & Offers (Clean Checkboxes without Emoji/Colored Icons) */}
            <section className="space-y-2.5">
                <span className="block text-[13px] font-bold text-[#0B192C] dark:text-white">
                    {isArabic ? "حالة التوفر والعروض" : "Availability & Deals"}
                </span>

                <div className="flex flex-col gap-1">
                    {/* In Stock */}
                    <button
                        type="button"
                        onClick={handleToggleInStock}
                        aria-pressed={filters.inStock}
                        className={`flex items-center justify-between gap-2.5 rounded-[10px] px-2.5 py-2 text-start text-[13px] transition-colors cursor-pointer ${
                            filters.inStock
                                ? "bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white font-bold"
                                : "hover:bg-[#FAF7F0]/70 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300 font-medium"
                        }`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                                    filters.inStock
                                        ? "bg-[#0B192C] text-[#E5B54A] border-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] dark:border-[#C59329]"
                                        : "border-[#0B192C]/25 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                }`}
                            >
                                {filters.inStock && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{isArabic ? "المتوفر في المخزون فقط" : "In Stock Only"}</span>
                        </div>
                    </button>

                    {/* On Sale */}
                    <button
                        type="button"
                        onClick={handleToggleOnSale}
                        aria-pressed={filters.onSale}
                        className={`flex items-center justify-between gap-2.5 rounded-[10px] px-2.5 py-2 text-start text-[13px] transition-colors cursor-pointer ${
                            filters.onSale
                                ? "bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white font-bold"
                                : "hover:bg-[#FAF7F0]/70 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300 font-medium"
                        }`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                                    filters.onSale
                                        ? "bg-[#0B192C] text-[#E5B54A] border-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] dark:border-[#C59329]"
                                        : "border-[#0B192C]/25 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                }`}
                            >
                                {filters.onSale && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{isArabic ? "عروض وتخفيضات خاصة" : "On Sale & Offers"}</span>
                        </div>
                    </button>

                    {/* Trending / Best Sellers */}
                    <button
                        type="button"
                        onClick={handleToggleTrending}
                        aria-pressed={filters.isTrending}
                        className={`flex items-center justify-between gap-2.5 rounded-[10px] px-2.5 py-2 text-start text-[13px] transition-colors cursor-pointer ${
                            filters.isTrending
                                ? "bg-[#FAF7F0] dark:bg-zinc-800 text-[#0B192C] dark:text-white font-bold"
                                : "hover:bg-[#FAF7F0]/70 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-slate-300 font-medium"
                        }`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                                    filters.isTrending
                                        ? "bg-[#0B192C] text-[#E5B54A] border-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] dark:border-[#C59329]"
                                        : "border-[#0B192C]/25 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                }`}
                            >
                                {filters.isTrending && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{isArabic ? "الأكثر طلباً ورواجاً" : "Trending Products"}</span>
                        </div>
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
            {/* Desktop Sticky Sidebar — Concept 01 Unboxed Architectural Sidebar */}
            <aside className="hidden lg:block w-[270px] shrink-0">
                <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto border-e border-[#0B192C]/[0.09] dark:border-white/10 pe-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700">
                    {filterContent}
                </div>
            </aside>

            {/* Mobile Bottom Sheet Modal Portal */}
            {mounted && isMobileDrawerOpen && createPortal(
                <div className="fixed inset-0 z-[100] lg:hidden overflow-hidden">
                    {/* Backdrop Overlay */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
                        onClick={onCloseMobileDrawer}
                        aria-hidden="true"
                    />

                    {/* Sheet Panel */}
                    <div
                        ref={drawerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-catalog-filters-title"
                        id="mobile-catalog-filters"
                        className="absolute inset-x-0 bottom-0 flex h-[min(88dvh,760px)] max-h-[calc(100dvh-0.75rem)] flex-col overflow-hidden overscroll-contain rounded-t-3xl border-t border-[#0B192C]/10 bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 pointer-events-auto dark:border-white/10 dark:bg-zinc-950 sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-xl sm:rounded-3xl sm:border"
                        style={{ overscrollBehavior: "contain" }}
                    >
                        {/* Top Header & Grab Handle */}
                        <div className="shrink-0 border-b border-[#0B192C]/[0.08] bg-white px-5 pb-3.5 pt-3 select-none touch-none dark:border-white/10 dark:bg-zinc-900">
                            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700" />

                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <span id="mobile-catalog-filters-title" className="block truncate text-base font-bold text-[#0B192C] dark:text-white">
                                        {isArabic ? "تصفية الكتالوج" : "Filter Catalog"}
                                    </span>
                                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
                                        {activeFiltersCount > 0
                                            ? (isArabic ? `${activeFiltersCount} فلاتر نشطة` : `${activeFiltersCount} active filters`)
                                            : (isArabic ? "اختر الوكالة أو القسم" : "Select agency or department")}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    {activeFiltersCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] hover:bg-[#FAF7F0] dark:hover:bg-zinc-800 cursor-pointer"
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
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0B192C]/10 bg-[#FAF7F0] text-[#0B192C] transition-colors hover:bg-slate-200 dark:border-white/10 dark:bg-zinc-800 dark:text-white cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Filter Options */}
                        <div
                            className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
                            style={{
                                touchAction: "pan-y",
                                overscrollBehavior: "contain",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {filterContent}
                        </div>

                        {/* Sticky Apply Button */}
                        <div className="shrink-0 border-t border-[#0B192C]/[0.08] bg-white/95 px-5 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/95">
                            <button
                                type="button"
                                onClick={onCloseMobileDrawer}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C59329] hover:bg-[#D4A134] px-6 text-sm font-bold text-[#0B192C] transition-colors cursor-pointer"
                            >
                                <span>
                                    {isArabic
                                        ? `عرض النتائج (${totalResults} صنف)`
                                        : `Show ${totalResults} products`}
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
