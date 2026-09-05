"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import CustomSortDropdown from "@/app/components/ProductsPageComponents/CustomSortDropdown";
import { MdSearch, MdClose, MdGridView } from "react-icons/md";

export interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
}

interface BrandCatalogToolbarProps {
    categories: CategoryItem[];
    activeCategoryId: string;
    onSelectCategory: (id: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    sort: string;
    onSortChange: (s: string) => void;
    totalResults: number;
    brandName: string;
}

export default function BrandCatalogToolbar({
    categories,
    activeCategoryId,
    onSelectCategory,
    searchQuery,
    onSearchChange,
    sort,
    onSortChange,
    totalResults,
    brandName,
}: BrandCatalogToolbarProps) {
    const { language, dir, t } = useLanguage();
    const isArabic = language === "ar";
    const isRtl = dir === "rtl";

    const brandShortName = brandName.split("-")[0]?.trim() || brandName;

    const sortOptions = [
        { id: "best_sellers", label: t("products.bestSellers") },
        { id: "newest", label: t("products.newestArrivals") },
        { id: "price_asc", label: isArabic ? "السعر: الأقل للأعلى" : "Price: Low to High" },
        { id: "price_desc", label: isArabic ? "السعر: الأعلى للأقل" : "Price: High to Low" },
    ];

    const hasCategories = categories && categories.length > 0;

    return (
        <div className="mb-6 space-y-3 sm:space-y-4" aria-label="Catalog Filters">
            {/* Top Toolbar: Search & Sort & Count */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
                {/* Search in Brand Products */}
                <div className="relative flex-1 max-w-md">
                    <MdSearch className={`absolute top-1/2 -translate-y-1/2 text-slate-400 text-lg ${isRtl ? "right-3" : "left-3"}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={isArabic ? `ابحث في منتجات ${brandShortName}...` : `Search in ${brandShortName} items...`}
                        className={`w-full h-10 bg-slate-50 dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 rounded-xl text-xs sm:text-sm text-[#0B192C] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#8A6305] focus:ring-1 focus:ring-[#8A6305] transition-all ${
                            isRtl ? "pr-9 pl-8" : "pl-9 pr-8"
                        }`}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 ${isRtl ? "left-2" : "right-2"}`}
                            aria-label="Clear search"
                        >
                            <MdClose className="text-sm" />
                        </button>
                    )}
                </div>

                {/* Right Controls: Result Count & Sort Dropdown */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-bold text-[#475569] dark:text-slate-400">
                        {totalResults} {isArabic ? "صنف متاح" : "items"}
                    </span>

                    <CustomSortDropdown
                        sort={sort}
                        setSort={onSortChange}
                        options={sortOptions}
                    />
                </div>
            </div>

            {/* Bottom Subcategory Tabs Rail (if multiple categories) */}
            {hasCategories && (
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar py-1" style={{ scrollbarWidth: "none" }}>
                    <button
                        type="button"
                        onClick={() => onSelectCategory("all")}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeCategoryId === "all"
                                ? "bg-[#0B192C] dark:bg-[#8A6305] text-white shadow-xs"
                                : "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#0B192C] dark:hover:border-white/20"
                        }`}
                    >
                        <MdGridView className="text-sm" />
                        <span>{isArabic ? "كافة الأصناف" : "All Products"}</span>
                    </button>

                    {categories.map((cat) => {
                        const isSelected = activeCategoryId === cat.id;
                        const catName = isArabic ? cat.name : (cat.description || cat.name);
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onSelectCategory(cat.id)}
                                className={`shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isSelected
                                        ? "bg-[#0B192C] dark:bg-[#8A6305] text-white shadow-xs"
                                        : "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#0B192C] dark:hover:border-white/20"
                                }`}
                            >
                                <span>{catName}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
