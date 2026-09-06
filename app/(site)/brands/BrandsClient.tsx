"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ResilientImage from "@/app/components/ResilientImage";
import { MdStar } from "react-icons/md";

interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isFeatured: boolean;
    _count?: {
        products: number;
    };
}

interface BrandsClientProps {
    brands: Brand[];
    basePath?: string;
}

const fallbackImage = "/placeholder.svg";

export default function BrandsClient({ brands, basePath = "/brands" }: BrandsClientProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar';

    const featuredBrands = brands.filter((brand) => brand.isFeatured);
    const showFeaturedSection = featuredBrands.length > 0 && featuredBrands.length < brands.length;

    const renderBrandCard = (brand: Brand, isHighlight = false) => {
        // Separate English and Arabic if name is formatted as "DE CECCO - دي سيكو"
        const nameParts = brand.name.split('-');
        const displayName = isArabic && nameParts.length > 1
            ? nameParts[1].trim()
            : (nameParts[0]?.trim() || brand.name);

        const subName = nameParts.length > 1
            ? (isArabic ? nameParts[0].trim() : nameParts[1].trim())
            : null;

        return (
            <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className={`group flex min-h-[170px] flex-col justify-between rounded-2xl border transition-all duration-300 hover:-translate-y-1 p-3 sm:p-4 ${
                    isHighlight
                        ? "border-[#8A6305]/30 bg-gradient-to-b from-[#FAF6EC]/60 to-white shadow-xs hover:border-[#8A6305] hover:shadow-md dark:border-[#8A6305]/20 dark:from-[#8A6305]/5 dark:to-white/5"
                        : "border-slate-200/80 bg-white hover:border-[#0B192C] hover:shadow-md dark:border-white/10 dark:bg-white/5"
                }`}
            >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-white dark:bg-white/5 p-3 flex items-center justify-center border border-slate-100 dark:border-white/5">
                    <ResilientImage
                        src={brand.image || fallbackImage}
                        alt={brand.name}
                        showSkeleton={false}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    {brand.isFeatured && (
                        <span className="absolute top-2 end-2 size-5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300 flex items-center justify-center shadow-xs">
                            <MdStar className="text-xs" />
                        </span>
                    )}
                </div>
                <div className="pt-3 text-center flex flex-col items-center">
                    <p className="line-clamp-1 text-xs sm:text-sm font-bold text-slate-900 transition-colors group-hover:text-[#8A6305] dark:text-white dark:group-hover:text-[#8A6305]">
                        {displayName}
                    </p>
                    {subName && (
                        <p className="line-clamp-1 text-[10px] sm:text-xs font-semibold text-[#475569] dark:text-slate-500 mt-0.5">
                            {subName}
                        </p>
                    )}
                    {brand._count?.products !== undefined && brand._count.products > 0 && (
                        <span className="inline-block text-[10px] font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/10 border border-[#8A6305]/20 rounded px-1.5 py-0.5 mt-1">
                            {brand._count.products} {isArabic ? 'منتج بالجملة' : 'products'}
                        </span>
                    )}
                </div>
            </Link>
        );
    };

    return (
        <div className="container-custom py-6 md:py-10">
            {/* Breadcrumbs Navigation */}
            <nav className="relative z-20 flex items-center flex-wrap gap-y-2 text-[11px] md:text-[12px] font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider mb-6" aria-label="Breadcrumb">
                <Link 
                    href="/" 
                    className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors"
                >
                    {isArabic ? 'الرئيسية' : 'HOME'}
                </Link>
                <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>
                <span className="text-[#8A6305] dark:text-[#8A6305]">
                    {isArabic ? 'الوكالات والعلامات التجارية' : 'AGENCIES & BRANDS'}
                </span>
            </nav>

            {/* Header Area */}
            <div className="mb-8 md:mb-10 border-b border-slate-200/80 pb-6 dark:border-white/10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8A6305] dark:text-[#8A6305] block mb-1">
                        {isArabic ? 'الوكالات الرسمية والشركاء المعتمدون للتوزيع بالجملة' : 'OFFICIAL WHOLESALE AGENCIES'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                        {isArabic ? 'وكالاتنا الحصرية' : 'Our Exclusive Agencies'}
                    </h1>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#475569] dark:text-slate-400">
                    {brands.length} {isArabic ? 'وكالة معتمدة' : 'Agencies Available'}
                </span>
            </div>

            {/* Featured Brands (only shown if a subset is featured) */}
            {showFeaturedSection && (
                <section className="mb-10 md:mb-12">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="size-2.5 rounded-full bg-[#8A6305]" />
                        <h2 className="text-lg sm:text-xl font-bold text-[#0B192C] dark:text-white">
                            {isArabic ? 'الوكالات المميزة' : 'Featured Agencies'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {featuredBrands.map((brand) => renderBrandCard(brand, true))}
                    </div>
                </section>
            )}

            {/* All Brands Directory */}
            <section>
                <div className="mb-4 flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-[#0B192C] dark:bg-white/40" />
                    <h2 className="text-lg sm:text-xl font-bold text-[#0B192C] dark:text-white">
                        {isArabic ? 'كافة الوكالات المعتمدة' : 'All Authorized Agencies'}
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {brands.map((brand) => renderBrandCard(brand))}
                </div>
            </section>
        </div>
    );
}
