"use client";

import React from "react";
import ResilientImage from "@/app/components/ResilientImage";
import { useLanguage } from "@/app/context/LanguageContext";
import Breadcrumb from "@/app/components/Breadcrumb";

interface BrandMastheadProps {
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
    totalProducts?: number;
    basePath?: string;
}

export default function BrandMasthead({ brand, totalProducts, basePath = "/brands" }: BrandMastheadProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === "ar";
    const isRtl = dir === "rtl";

    const fallbackImage = "/placeholder.svg";
    const brandImage = brand.image || fallbackImage;

    // Parse bilingual name formatted as "Alicafe - علي كافيه"
    const nameParts = brand.name.split("-");
    const primaryName = isArabic && nameParts.length > 1
        ? nameParts[1].trim()
        : (nameParts[0]?.trim() || brand.name);

    const secondaryName = nameParts.length > 1
        ? (isArabic ? nameParts[0].trim() : nameParts[1].trim())
        : null;

    const sectorName = brand.mainCategory 
        ? (isArabic ? brand.mainCategory.name : (brand.mainCategory.description || brand.mainCategory.name))
        : null;

    const naturalSubtitle = isArabic
        ? `تسوق قائمة منتجات ${primaryName} بأسعار الجملة المباشرة وتفاصيل التعبئة لكل طرد.`
        : `Explore ${primaryName} products available for wholesale ordering with case packaging specifications.`;

    const displayDescription = brand.description && brand.description.trim().length > 0
        ? brand.description
        : naturalSubtitle;

    const isAgencies = basePath === "/agencies";
    const parentLabel = isAgencies
        ? (isArabic ? "الوكالات المعتمدة" : "Authorized Agencies")
        : (isArabic ? "الوكالات والعلامات التجارية" : "Brands & Agencies");

    return (
        <section className="mb-8" aria-label="Brand Overview">
            {/* Clean Unified Breadcrumb Strip */}
            <Breadcrumb
                items={[
                    {
                        label: parentLabel,
                        href: basePath,
                    },
                    {
                        label: primaryName,
                    },
                ]}
            />

            {/* Architectural Masthead Card */}
            <div className="relative rounded-2xl md:rounded-3xl bg-white dark:bg-[#0C1821] border border-slate-200/80 dark:border-white/10 overflow-hidden">
                {/* Refined Top Accent Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0B192C] via-[#8A6305] to-[#0B192C]" />

                <div className="p-5 sm:p-7 md:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
                        {/* Logo Plinth Tile */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-white/10 p-3.5 flex items-center justify-center shrink-0">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <ResilientImage
                                    src={brandImage}
                                    alt={brand.name}
                                    showSkeleton={false}
                                    className="max-w-full max-h-full object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Brand Details */}
                        <div className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"} text-center sm:text-start`}>
                            {/* Sector / Department & Product Count */}
                            <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2 mb-1.5">
                                {sectorName && (
                                    <p className="text-xs font-bold text-[#8A6305] dark:text-[#8A6305] uppercase tracking-wider">
                                        {sectorName}
                                    </p>
                                )}
                                {totalProducts !== undefined && totalProducts > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10">
                                        <span>📦</span>
                                        <span>{totalProducts} {isArabic ? 'منتج بالجملة' : 'products'}</span>
                                    </span>
                                )}
                            </div>

                            {/* Dual-Language Title Treatment */}
                            <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-x-3 gap-y-1 mb-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                                    {primaryName}
                                </h1>
                                {secondaryName && (
                                    <span className="text-sm sm:text-base md:text-lg font-medium text-slate-400 dark:text-slate-500 tracking-wider">
                                        {secondaryName}
                                    </span>
                                )}
                            </div>

                            {/* Natural, Real Subtitle */}
                            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 leading-relaxed max-w-2xl">
                                {displayDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
