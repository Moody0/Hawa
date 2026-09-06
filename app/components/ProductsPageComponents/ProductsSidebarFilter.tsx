"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    MdSearch,
    MdClose,
    MdFilterList,
    MdCheck,
    MdRefresh,
    MdStorefront,
    MdCategory,
    MdBolt,
    MdLocalOffer,
    MdCheckCircle,
} from "react-icons/md";

export interface FilterBrand {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
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

const ProductsSidebarFilter: React.FC<ProductsSidebarFilterProps> = ({
    brands,
    categories,
    filters,
    onFiltersChange,
    onResetFilters,
    totalResults,
    isMobileDrawerOpen,
    onCloseMobileDrawer,
}) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const [brandSearch, setBrandSearch] = useState("");

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
        const next = filters.brandIds.includes(brandId)
            ? filters.brandIds.filter((id) => id !== brandId)
            : [...filters.brandIds, brandId];
        onFiltersChange({ ...filters, brandIds: next });
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

    // The inner filter content rendered both on desktop sidebar and mobile drawer
    const filterContent = (
        <div className="flex flex-col gap-5 text-[#0B192C] dark:text-gray-100">
            {/* Header / Active Count */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF6EC] dark:bg-[#8A6305]/20 flex items-center justify-center text-[#8A6305]">
                        <MdFilterList className="text-lg" />
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                    >
                        <MdRefresh className="text-sm" />
                        <span>{isArabic ? "إعادة ضبط" : "Reset"}</span>
                    </button>
                )}
            </div>

            {/* Quick Status Toggles (Wholesale Deals & Stock) */}
            <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "حالة التوفر والعروض" : "Availability & Deals"}
                </span>

                <div className="flex flex-col gap-1.5 pt-1">
                    {/* In Stock */}
                    <button
                        type="button"
                        onClick={handleToggleInStock}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-98 text-start ${
                            filters.inStock
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40 shadow-xs"
                                : "bg-white dark:bg-zinc-900 text-[#475569] dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                filters.inStock
                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                    : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                        >
                            {filters.inStock && <MdCheck className="text-xs" />}
                        </div>
                        <MdCheckCircle
                            className={`text-base shrink-0 ${
                                filters.inStock ? "text-[#8A6305]" : "text-emerald-500"
                            }`}
                        />
                        <span className="truncate">{isArabic ? "المتوفر في المخزون فقط" : "In Stock Only"}</span>
                    </button>

                    {/* On Sale */}
                    <button
                        type="button"
                        onClick={handleToggleOnSale}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-98 text-start ${
                            filters.onSale
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40 shadow-xs"
                                : "bg-white dark:bg-zinc-900 text-[#475569] dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                filters.onSale
                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                    : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                        >
                            {filters.onSale && <MdCheck className="text-xs" />}
                        </div>
                        <MdLocalOffer
                            className={`text-base shrink-0 ${
                                filters.onSale ? "text-[#8A6305]" : "text-amber-500"
                            }`}
                        />
                        <span className="truncate">{isArabic ? "عروض وتخفيضات خاصة" : "On Sale & Offers"}</span>
                    </button>

                    {/* Trending / Best Sellers */}
                    <button
                        type="button"
                        onClick={handleToggleTrending}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-98 text-start ${
                            filters.isTrending
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white border-[#8A6305]/40 shadow-xs"
                                : "bg-white dark:bg-zinc-900 text-[#475569] dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:border-[#8A6305]"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                filters.isTrending
                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                    : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                        >
                            {filters.isTrending && <MdCheck className="text-xs" />}
                        </div>
                        <MdBolt
                            className={`text-base shrink-0 ${
                                filters.isTrending ? "text-[#8A6305]" : "text-amber-500"
                            }`}
                        />
                        <span className="truncate">{isArabic ? "الأكثر طلباً ورواجاً" : "Trending Products"}</span>
                    </button>
                </div>
            </div>

            {/* Brands Section (The Core FMCG wholesale filter) */}
            {brands.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <MdStorefront className="text-[#8A6305] text-sm" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                {isArabic ? "الوكالات والعلامات التجارية" : "Agencies & Brands"}
                            </span>
                        </div>
                        {filters.brandIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onFiltersChange({ ...filters, brandIds: [] })}
                                className="text-[10px] font-bold text-[#8A6305] hover:underline"
                            >
                                {isArabic ? "إلغاء التحديد" : "Clear"}
                            </button>
                        )}
                    </div>

                    {/* Brand Search Input */}
                    {brands.length > 5 && (
                        <div className="relative">
                            <MdSearch className="absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                placeholder={isArabic ? "ابحث عن وكالة..." : "Search brands..."}
                                className="w-full ps-8 pe-2.5 py-1.5 text-xs bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-[#8A6305] text-[#0B192C] dark:text-white placeholder:text-gray-400"
                            />
                            {brandSearch && (
                                <button
                                    type="button"
                                    onClick={() => setBrandSearch("")}
                                    className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                >
                                    <MdClose className="text-xs" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Brand List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pe-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
                        {filteredBrands.map((brand) => {
                            const isChecked = filters.brandIds.includes(brand.id);
                            const count = brand._count?.products;

                            return (
                                <label
                                    key={brand.id}
                                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                                        isChecked
                                            ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white font-bold"
                                            : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-[#475569] dark:text-gray-300"
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
                                                    : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                            }`}
                                        >
                                            {isChecked && <MdCheck className="text-xs" />}
                                        </div>

                                        {brand.image && (
                                            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                                                <img
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    className="w-full h-full object-contain p-0.5"
                                                    loading="lazy"
                                                />
                                            </span>
                                        )}

                                        <span className="truncate">{brand.name}</span>
                                    </div>

                                    {count !== undefined && (
                                        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-400 shrink-0">
                                            ({count})
                                        </span>
                                    )}
                                </label>
                            );
                        })}

                        {filteredBrands.length === 0 && (
                            <p className="text-xs text-gray-400 py-3 text-center">
                                {isArabic ? "لا توجد وكالة بهذا الاسم" : "No brands found"}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Departments / Categories Section */}
            {categories.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <MdCategory className="text-[#8A6305] text-sm" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                {isArabic ? "الأقسام والتصنيفات" : "Departments"}
                            </span>
                        </div>
                        {filters.categoryIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onFiltersChange({ ...filters, categoryIds: [] })}
                                className="text-[10px] font-bold text-[#8A6305] hover:underline"
                            >
                                {isArabic ? "إلغاء التحديد" : "Clear"}
                            </button>
                        )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pe-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
                        {categories.map((cat) => {
                            const isChecked = filters.categoryIds.includes(cat.id);
                            const displayName = isArabic ? cat.name : (cat.description || cat.nameEn || cat.name);

                            return (
                                <label
                                    key={cat.id}
                                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                                        isChecked
                                            ? "bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#0B192C] dark:text-white font-bold"
                                            : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-[#475569] dark:text-gray-300"
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
                                                    : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                            }`}
                                        >
                                            {isChecked && <MdCheck className="text-xs" />}
                                        </div>

                                        <span className="truncate">{displayName}</span>
                                    </div>

                                    {cat._count?.products !== undefined && (
                                        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-400 shrink-0">
                                            ({cat._count.products})
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sticky Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-24 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 shadow-xs">
                    {filterContent}
                </div>
            </aside>

            {/* Mobile Bottom Sheet / Modal Drawer */}
            {isMobileDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    {/* Backdrop tap to close */}
                    <div
                        className="flex-1"
                        onClick={onCloseMobileDrawer}
                        aria-hidden="true"
                    />

                    {/* Sheet panel */}
                    <div className="bg-white dark:bg-zinc-900 rounded-t-3xl p-5 max-h-[85vh] flex flex-col shadow-2xl border-t border-gray-200 dark:border-white/10 animate-in slide-in-from-bottom duration-300">
                        {/* Drawer Grab Bar */}
                        <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

                        {/* Top close bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-4">
                            <span className="font-bold text-base text-[#0B192C] dark:text-white">
                                {isArabic ? "تصفية المنتجات" : "Filter Catalog"}
                            </span>
                            <button
                                type="button"
                                onClick={onCloseMobileDrawer}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white"
                            >
                                <MdClose className="text-lg" />
                            </button>
                        </div>

                        {/* Scrollable Filter Options */}
                        <div className="flex-1 overflow-y-auto pe-1">
                            {filterContent}
                        </div>

                        {/* Apply Button */}
                        <div className="pt-4 mt-2 border-t border-gray-100 dark:border-white/10">
                            <button
                                type="button"
                                onClick={onCloseMobileDrawer}
                                className="w-full py-3 bg-[#0B192C] dark:bg-[#8A6305] text-white font-bold rounded-xl text-sm shadow-md active:scale-98 transition-transform"
                            >
                                {isArabic
                                    ? `عرض النتائج (${totalResults} منتج)`
                                    : `Apply Filters (${totalResults} results)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductsSidebarFilter;
