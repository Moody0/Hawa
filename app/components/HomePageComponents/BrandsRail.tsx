'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import { MdChevronRight } from 'react-icons/md';
import type { RailBrand } from '@/lib/admin-actions';

interface BrandsRailProps {
    brands?: RailBrand[];
}

// Specialization subtitles matching exact brand category mapping
const BRAND_SUBTITLES: Record<string, { ar: string; en: string }> = {
    'sanino-doro': { ar: 'سانينو دورو', en: 'Sanino D\'Oro' },
    'captain-fisher': { ar: 'مفرزات كابتن فيشر', en: 'Captain Fisher Frozen' },
    'de-cecco-italy': { ar: 'دي سيكو ايطالي', en: 'De Cecco Italian' },
    'rio-mare': { ar: 'ريو ماري ايطالي', en: 'Rio Mare Italian' },
    'americana': { ar: 'امريكانا مفرزات', en: 'Americana Quality' },
    'ottima': { ar: 'اوتيما معكرونة إيطالي', en: 'Ottima Italian Pasta' },
    'mr-brownie': { ar: 'مستر براوني', en: 'Mr. Brownie Cakes' },
    'tat': { ar: 'تات تركي', en: 'Tat Turkish Goods' },
    'american-garden': { ar: 'صوصات أميركان جاردن', en: 'American Garden Sauces' },
    'alicafe': { ar: 'قهوة علي كافيه', en: 'Ali Cafe Coffee' },
    'hygiene': { ar: 'هايجين', en: 'Hygiene Care' },
    'milaf': { ar: 'مشروب ميلاف', en: 'Milaf Beverages' },
    'sante': { ar: 'سانتي', en: 'Sante Healthy' },
    'go-on': { ar: 'غو ان', en: 'Go On Protein' },
    'nabil': { ar: 'نبيل مفرزات', en: 'Nabil Frozen Foods' },
    'master-chef': { ar: 'ماستر شيف', en: 'Master Chef' },
    'pepsi': { ar: 'بيبسي', en: 'Pepsi Beverages' },
    'uludag': { ar: 'اولداغ تركي', en: 'Uludag Drinks' },
    'lovege': { ar: 'حليب لوفيج', en: 'Lovege Plant Milk' },
    'gourmet': { ar: 'غورمت', en: 'Gourmet Foods' },
    'boom-boom': { ar: 'بوم بوم طاقة', en: 'Boom Boom Energy' },
};

export default function BrandsRail({ brands = [] }: BrandsRailProps) {
    const { dir, language } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    if (!brands || brands.length === 0) {
        return null;
    }

    const getBrandLabel = (brand: RailBrand) => {
        if (brand.slug && BRAND_SUBTITLES[brand.slug]) {
            return isArabic ? BRAND_SUBTITLES[brand.slug].ar : BRAND_SUBTITLES[brand.slug].en;
        }

        const nameParts = (brand.name || '').split('-');
        if (isArabic && nameParts.length > 1) {
            return nameParts[1].trim();
        }
        return nameParts[0]?.trim() || brand.name;
    };

    // On wide desktop: Display 16 premier brands in 2 balanced rows of 8
    const desktopBrands = brands.slice(0, 16);

    const renderBrandCard = (brand: RailBrand, isCompact = false) => {
        const brandLabel = getBrandLabel(brand);

        return (
            <Link
                key={brand.id || brand.slug}
                href={`/agencies/${brand.slug}`}
                className={`group flex flex-col items-center justify-between bg-white dark:bg-[#1A1A14] border border-[#8A6305]/20 dark:border-white/10 hover:border-[#8A6305] hover:shadow-md hover:-translate-y-0.5 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    isCompact ? 'p-2 min-h-[92px] w-full snap-start' : 'p-2.5 sm:p-3 min-h-[105px] sm:min-h-[115px]'
                }`}
            >
                {/* Brand Logo Container with High Visual Impact */}
                <div className={`relative w-full flex items-center justify-center overflow-hidden ${
                    isCompact ? 'h-[38px]' : 'h-[44px] sm:h-[50px] md:h-[54px]'
                }`}>
                    <ResilientImage
                        src={brand.image}
                        alt=""
                        showSkeleton={false}
                        sizes="(max-width: 768px) 140px, 160px"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-108"
                    />
                </div>

                {/* Brand Subtitle / Category Label */}
                <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-[#0B192C] dark:text-gray-200 text-center line-clamp-1 group-hover:text-[#8A6305] dark:group-hover:text-[#8A6305] transition-colors mt-1 leading-snug">
                    {brandLabel}
                </span>
            </Link>
        );
    };

    return (
        <section className="w-full bg-white dark:bg-[#121212] pt-4 pb-6 md:pt-6 md:pb-8 border-b border-gray-100 dark:border-white/5">
            <div className="container-custom">
                {/* Ornamental Section Header: ─────── 🌾 الشركات العالمية 🌾 ─────── */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-5 sm:mb-6 md:mb-7">
                    {/* Left Ornamental Line */}
                    <div className="h-[1.5px] flex-1 max-w-[60px] sm:max-w-[120px] md:max-w-[200px] bg-gradient-to-r from-transparent via-[#8A6305]/30 to-[#8A6305] dark:to-[#8A6305]" />

                    {/* Wheat / Olive Leaf Left */}
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#8A6305] dark:text-[#8A6305] shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2C11.5 4 10.5 6 9 7.5C10.5 9 11.5 11 12 13C12.5 11 13.5 9 15 7.5C13.5 6 12.5 4 12 2Z" opacity="0.9" />
                        <path d="M7 6C6.5 8 5.5 10 4 11.5C5.5 13 6.5 15 7 17C7.5 15 8.5 13 10 11.5C8.5 10 7.5 8 7 6Z" />
                        <path d="M17 6C16.5 8 15.5 10 14 11.5C15.5 13 16.5 15 17 17C17.5 15 18.5 13 20 11.5C18.5 10 17.5 8 17 6Z" />
                        <path d="M12 11V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>

                    {/* Section Title */}
                    <h2 className="text-base sm:text-2xl md:text-[28px] font-extrabold text-[#0B192C] dark:text-white tracking-tight whitespace-nowrap px-1">
                        {isArabic ? 'الشركات العالمية' : 'Global Partner Brands'}
                    </h2>

                    {/* Wheat / Olive Leaf Right */}
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#8A6305] dark:text-[#8A6305] shrink-0 scale-x-[-1]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2C11.5 4 10.5 6 9 7.5C10.5 9 11.5 11 12 13C12.5 11 13.5 9 15 7.5C13.5 6 12.5 4 12 2Z" opacity="0.9" />
                        <path d="M7 6C6.5 8 5.5 10 4 11.5C5.5 13 6.5 15 7 17C7.5 15 8.5 13 10 11.5C8.5 10 7.5 8 7 6Z" />
                        <path d="M17 6C16.5 8 15.5 10 14 11.5C15.5 13 16.5 15 17 17C17.5 15 18.5 13 20 11.5C18.5 10 17.5 8 17 6Z" />
                        <path d="M12 11V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>

                    {/* Right Ornamental Line */}
                    <div className="h-[1.5px] flex-1 max-w-[60px] sm:max-w-[120px] md:max-w-[200px] bg-gradient-to-l from-transparent via-[#8A6305]/30 to-[#8A6305] dark:to-[#8A6305]" />
                </div>

                {/* 1. Mobile Experience (< md): Compact 2-Row Horizontal Swipe (Zero Scroll Fatigue) */}
                <div className="md:hidden">
                    <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide py-1">
                        <div className="grid grid-rows-2 grid-flow-col auto-cols-[125px] sm:auto-cols-[140px] gap-2.5 snap-x">
                            {brands.map((brand) => renderBrandCard(brand, true))}
                        </div>
                    </div>
                </div>

                {/* 2. Desktop & Tablet Experience (>= md): Symmetrical 8-Column Grid (2 Balanced Rows of 8) */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-3.5">
                        {desktopBrands.map((brand) => renderBrandCard(brand, false))}
                    </div>

                    {/* Subtle "Explore All Brands" Action Pill */}
                    {brands.length > 16 && (
                        <div className="mt-5 flex justify-center">
                            <Link
                                href="/agencies"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-[#0B192C] dark:text-[#8A6305] hover:text-[#8A6305] bg-[#FAF6EC] dark:bg-white/5 border border-[#8A6305]/20 hover:border-[#8A6305]/50 transition-all duration-200 shadow-2xs hover:shadow-xs group"
                            >
                                <span>{isArabic ? `تصفح كافة الشركات والعلامات (${brands.length}+)` : `View All Partner Brands (${brands.length}+)`}</span>
                                <MdChevronRight className={`text-base transition-transform group-hover:translate-x-0.5 ${isArabic ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
