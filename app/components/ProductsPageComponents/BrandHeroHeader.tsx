"use client";

import React from 'react';
import ResilientImage from '@/app/components/ResilientImage';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdVerified } from 'react-icons/md';

interface BrandHeroHeaderProps {
    brand: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
    };
    totalProducts: number;
}

export default function BrandHeroHeader({ brand, totalProducts }: BrandHeroHeaderProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar';

    const fallbackImage = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800";
    const brandImage = brand.image || fallbackImage;

    // Parse bilingual name formatted as "Alicafe - علي كافيه"
    const nameParts = brand.name.split("-");
    const primaryName = isArabic && nameParts.length > 1
        ? nameParts[1].trim()
        : (nameParts[0]?.trim() || brand.name);

    const secondaryName = nameParts.length > 1
        ? (isArabic ? nameParts[0].trim() : nameParts[1].trim())
        : null;

    return (
        <div className="relative rounded-2xl bg-white dark:bg-[#0C1821] border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 mb-6 shadow-xs overflow-hidden">
            {/* Top Navy/Gold Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0B192C] via-[#8A6305] to-[#0B192C]" />

            <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 relative z-10 ${dir === 'rtl' ? 'sm:text-right' : 'sm:text-left'} text-center`}>
                {/* Brand Logo Plinth */}
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2.5 bg-white dark:bg-zinc-800/90 border border-slate-200/90 dark:border-white/10 shadow-xs flex items-center justify-center relative group">
                    <ResilientImage
                        src={brandImage}
                        alt={brand.name}
                        showSkeleton={false}
                        className="max-w-full max-h-full object-contain"
                        priority
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#8A6305] text-white p-0.5 rounded-full shadow-xs">
                        <MdVerified className="text-xs" />
                    </div>
                </div>

                {/* Brand Meta & Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/20 border border-[#8A6305]/30 px-2.5 py-0.5 rounded-full">
                            <MdVerified className="text-xs shrink-0" />
                            <span>{isArabic ? "وكالة تجارية معتمدة" : "Authorized Agency"}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#475569] dark:text-slate-400 bg-gray-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full">
                            {totalProducts} {isArabic ? "صنف متاح بالجملة" : "Wholesale Items"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-x-3 gap-y-1 mb-2">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                            {primaryName}
                        </h1>
                        {secondaryName && (
                            <span className="text-sm sm:text-base font-semibold text-slate-400 dark:text-slate-500">
                                {secondaryName}
                            </span>
                        )}
                    </div>

                    {brand.description && (
                        <p className="text-xs sm:text-sm text-[#475569] dark:text-gray-300 max-w-2xl leading-relaxed">
                            {brand.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
