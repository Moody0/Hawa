'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Search, X, Building2 } from 'lucide-react';
import { getBrandDisplayName } from '@/lib/brand-display';

interface Brand {
    id: string;
    name: string;
    nameEn?: string | null;
    slug: string;
    description: string | null;
    image: string | null;
    group?: string;
    isFeatured: boolean;
    _count?: {
        products: number;
    };
    mainCategory?: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    } | null;
}

interface BrandsClientProps {
    brands: Brand[];
    basePath?: string;
}

interface BrandMeta {
    sectorLabelAr: string;
    sectorLabelEn: string;
    specialtyAr: string;
    specialtyEn: string;
    sector: 'detergents' | 'food' | 'sweets';
}

const BRAND_SPECIALTIES: Record<string, BrandMeta> = {
    bofalo: {
        sectorLabelAr: 'منظفات وعناية منزلية',
        sectorLabelEn: 'Home Detergents & Care',
        specialtyAr: 'مساحيق غسيل، سوائل جلي، ومعطرات',
        specialtyEn: 'Laundry powders, dishwashing liquids & fresheners',
        sector: 'detergents',
    },
    bufalo: {
        sectorLabelAr: 'منظفات وعناية منزلية',
        sectorLabelEn: 'Home Detergents & Care',
        specialtyAr: 'مساحيق غسيل، سوائل جلي، ومعطرات',
        specialtyEn: 'Laundry powders, dishwashing liquids & fresheners',
        sector: 'detergents',
    },
    buffalo: {
        sectorLabelAr: 'منظفات وعناية منزلية',
        sectorLabelEn: 'Home Detergents & Care',
        specialtyAr: 'مساحيق غسيل، سوائل جلي، ومعطرات',
        specialtyEn: 'Laundry powders, dishwashing liquids & fresheners',
        sector: 'detergents',
    },
    rokafyra: {
        sectorLabelAr: 'عناية شخصية ومنظفات',
        sectorLabelEn: 'Personal Care & Hygiene',
        specialtyAr: 'شامبو، صابون، ومنتجات عناية بالجسم',
        specialtyEn: 'Shampoo, soap & personal care products',
        sector: 'detergents',
    },
    rokavera: {
        sectorLabelAr: 'عناية شخصية ومنظفات',
        sectorLabelEn: 'Personal Care & Hygiene',
        specialtyAr: 'شامبو، صابون، ومنتجات عناية بالجسم',
        specialtyEn: 'Shampoo, soap & personal care products',
        sector: 'detergents',
    },
    rocavera: {
        sectorLabelAr: 'عناية شخصية ومنظفات',
        sectorLabelEn: 'Personal Care & Hygiene',
        specialtyAr: 'شامبو، صابون، ومنتجات عناية بالجسم',
        specialtyEn: 'Shampoo, soap & personal care products',
        sector: 'detergents',
    },
    alryf: {
        sectorLabelAr: 'غذائيات وبقوليات',
        sectorLabelEn: 'Food & Legumes',
        specialtyAr: 'زيوت، سمن، ومعلبات غذائية فاخرة',
        specialtyEn: 'Cooking oils, ghee & premium canned foods',
        sector: 'food',
    },
    alreef: {
        sectorLabelAr: 'غذائيات وبقوليات',
        sectorLabelEn: 'Food & Legumes',
        specialtyAr: 'زيوت، سمن، ومعلبات غذائية فاخرة',
        specialtyEn: 'Cooking oils, ghee & premium canned foods',
        sector: 'food',
    },
    hlybna: {
        sectorLabelAr: 'ألبان وسمن حيواني',
        sectorLabelEn: 'Dairy & Pure Ghee',
        specialtyAr: 'حليب بودرة كامل الدسم وسمن بقري نقي',
        specialtyEn: 'Full cream milk powder & pure cow ghee',
        sector: 'food',
    },
    halibna: {
        sectorLabelAr: 'ألبان وسمن حيواني',
        sectorLabelEn: 'Dairy & Pure Ghee',
        specialtyAr: 'حليب بودرة كامل الدسم وسمن بقري نقي',
        specialtyEn: 'Full cream milk powder & pure cow ghee',
        sector: 'food',
    },
    haleebna: {
        sectorLabelAr: 'ألبان وسمن حيواني',
        sectorLabelEn: 'Dairy & Pure Ghee',
        specialtyAr: 'حليب بودرة كامل الدسم وسمن بقري نقي',
        specialtyEn: 'Full cream milk powder & pure cow ghee',
        sector: 'food',
    },
    zoan: {
        sectorLabelAr: 'لحوم معلبة',
        sectorLabelEn: 'Canned Meats',
        specialtyAr: 'لانشون ولحوم معلبة هولندية أصلية',
        specialtyEn: 'Authentic Dutch luncheon & canned meats',
        sector: 'food',
    },
    zwan: {
        sectorLabelAr: 'لحوم معلبة',
        sectorLabelEn: 'Canned Meats',
        specialtyAr: 'لانشون ولحوم معلبة هولندية أصلية',
        specialtyEn: 'Authentic Dutch luncheon & canned meats',
        sector: 'food',
    },
    'sn-bl': {
        sectorLabelAr: 'تونة ومعلبات بحرية',
        sectorLabelEn: 'Tuna & Seafood',
        specialtyAr: 'تونة فاخرة ولحوم معلبة مختارة',
        specialtyEn: 'Premium canned tuna & corned beef',
        sector: 'food',
    },
    sunbell: {
        sectorLabelAr: 'تونة ومعلبات بحرية',
        sectorLabelEn: 'Tuna & Seafood',
        specialtyAr: 'تونة فاخرة ولحوم معلبة مختارة',
        specialtyEn: 'Premium canned tuna & corned beef',
        sector: 'food',
    },
    'sun-bell': {
        sectorLabelAr: 'تونة ومعلبات بحرية',
        sectorLabelEn: 'Tuna & Seafood',
        specialtyAr: 'تونة فاخرة ولحوم معلبة مختارة',
        specialtyEn: 'Premium canned tuna & corned beef',
        sector: 'food',
    },
    'sylfr-fysh': {
        sectorLabelAr: 'معلبات بحرية',
        sectorLabelEn: 'Canned Seafood',
        specialtyAr: 'تونة وسردين بالزيت النباتي',
        specialtyEn: 'Canned sardines & tuna in vegetable oil',
        sector: 'food',
    },
    'silver-fish': {
        sectorLabelAr: 'معلبات بحرية',
        sectorLabelEn: 'Canned Seafood',
        specialtyAr: 'تونة وسردين بالزيت النباتي',
        specialtyEn: 'Canned sardines & tuna in vegetable oil',
        sector: 'food',
    },
    monda: {
        sectorLabelAr: 'حلويات وشوكولاتة',
        sectorLabelEn: 'Sweets & Chocolates',
        specialtyAr: 'شوكولاتة وسكاكر وحلويات',
        specialtyEn: 'Chocolates & confectionery',
        sector: 'sweets',
    },
    moria: {
        sectorLabelAr: 'حلويات وشوكولاتة',
        sectorLabelEn: 'Sweets & Chocolates',
        specialtyAr: 'شوكولاتة وسكاكر وحلويات',
        specialtyEn: 'Chocolates & confectionery',
        sector: 'sweets',
    },
    marya: {
        sectorLabelAr: 'غذائيات ومعلبات',
        sectorLabelEn: 'Food & Groceries',
        specialtyAr: 'منتجات غذائية واستهلاكية مختارة',
        specialtyEn: 'Selected food & grocery products',
        sector: 'food',
    },
    alhmoy: {
        sectorLabelAr: 'قهوة ومشروبات',
        sectorLabelEn: 'Coffee & Beverages',
        specialtyAr: 'بن وقهوة عربية محمصة فاخرة',
        specialtyEn: 'Premium roasted Arabic coffee',
        sector: 'food',
    },
};

function resolveBrandMeta(brand: Brand): BrandMeta | null {
    const slugKey = brand.slug?.toLowerCase().trim();
    if (slugKey && BRAND_SPECIALTIES[slugKey]) {
        return BRAND_SPECIALTIES[slugKey];
    }
    const enKey = brand.nameEn?.toLowerCase().trim().replace(/\s+/g, '-');
    if (enKey && BRAND_SPECIALTIES[enKey]) {
        return BRAND_SPECIALTIES[enKey];
    }
    return null;
}

function getBrandSpecialty(brand: Brand, isArabic: boolean): string {
    if (brand.description && brand.description.trim()) {
        return brand.description.trim();
    }
    const meta = resolveBrandMeta(brand);
    if (meta) {
        return isArabic ? meta.specialtyAr : meta.specialtyEn;
    }
    return isArabic ? 'منتجات تجارية معتمدة لتوريد الجملة' : 'Authorized Wholesale Commercial Products';
}

function getBrandSectorLabel(brand: Brand, isArabic: boolean): string {
    const meta = resolveBrandMeta(brand);
    if (meta) {
        return isArabic ? meta.sectorLabelAr : meta.sectorLabelEn;
    }
    if (brand.mainCategory?.name) {
        return isArabic
            ? brand.mainCategory.name
            : brand.mainCategory.description || brand.mainCategory.name;
    }
    return isArabic ? 'وكالة تجارية معتمدة' : 'Authorized Agency';
}

function getBrandSector(brand: Brand): string {
    const meta = resolveBrandMeta(brand);
    if (meta) {
        return meta.sector;
    }
    if (brand.mainCategory?.slug?.includes('mnzfat') || brand.mainCategory?.name?.includes('منظفات')) {
        return 'detergents';
    }
    return 'food';
}

export default function BrandsClient({ brands }: BrandsClientProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('all');

    // Sort brands by product count descending so flagship high-volume agencies lead the matrix
    const sortedBrands = useMemo(() => {
        return [...brands].sort((a, b) => {
            const countA = a._count?.products ?? 0;
            const countB = b._count?.products ?? 0;
            if (countB !== countA) return countB - countA;
            return a.name.localeCompare(b.name, 'ar');
        });
    }, [brands]);

    // Filter brands based on search query and sector filter
    const filteredBrands = useMemo(() => {
        return sortedBrands.filter((brand) => {
            const englishName = getBrandDisplayName(brand, 'en').toLowerCase();
            const arabicName = getBrandDisplayName(brand, 'ar').toLowerCase();
            const specialty = getBrandSpecialty(brand, isArabic).toLowerCase();
            const sectorLabel = getBrandSectorLabel(brand, isArabic).toLowerCase();
            const query = searchQuery.trim().toLowerCase();

            const matchesSearch =
                !query ||
                englishName.includes(query) ||
                arabicName.includes(query) ||
                specialty.includes(query) ||
                sectorLabel.includes(query) ||
                (brand.description && brand.description.toLowerCase().includes(query)) ||
                brand.slug.toLowerCase().includes(query);

            const sector = getBrandSector(brand);
            const matchesSector =
                selectedSector === 'all' ||
                selectedSector === sector;

            return matchesSearch && matchesSector;
        });
    }, [sortedBrands, searchQuery, selectedSector, isArabic]);

    const sectors = [
        { id: 'all', labelAr: 'كافة الوكالات', labelEn: 'All Agencies', count: brands.length },
        {
            id: 'detergents',
            labelAr: 'منظفات وعناية',
            labelEn: 'Detergents & Care',
            count: brands.filter((b) => getBrandSector(b) === 'detergents').length,
        },
        {
            id: 'food',
            labelAr: 'غذائيات ومعلبات',
            labelEn: 'Food & Canned Goods',
            count: brands.filter((b) => getBrandSector(b) === 'food').length,
        },
        {
            id: 'sweets',
            labelAr: 'حلويات وشوكولاتة',
            labelEn: 'Sweets & Chocolates',
            count: brands.filter((b) => getBrandSector(b) === 'sweets').length,
        },
    ].filter((s) => s.id === 'all' || s.count > 0);

    const formatProductCountLabel = (count: number) => {
        if (!isArabic) return `${count} items`;
        if (count >= 3 && count <= 10) return `${count} أصناف`;
        return `${count} صنف`;
    };

    return (
        <div className="w-full bg-white dark:bg-[#0B192C] min-h-screen transition-colors pb-16">
            <div className="container-custom py-5 md:py-8">
                {/* 1. Breadcrumb */}
                <Breadcrumb
                    items={[
                        {
                            label: isArabic ? 'الوكالات والعلامات التجارية' : 'Agencies & Brands',
                        },
                    ]}
                />

                {/* 2. Unified Architectural Header & Command Bar (Concept 01) */}
                <div className="mt-1 pb-5 2xl:pb-6 mb-6 2xl:mb-7 border-b border-[#0B192C]/[0.09] dark:border-white/10 flex flex-col xl:flex-row xl:items-end justify-between gap-4 2xl:gap-5">
                    <div>
                        <h1 className="text-2xl sm:text-[26px] 2xl:text-[32px] font-bold text-[#0B192C] dark:text-white leading-[1.2]">
                            {isArabic ? (
                                <>
                                    وكالاتنا{' '}
                                    <span className="text-[#8A6305] dark:text-[#E5B54A]">
                                        والعلامات التجارية المعتمدة
                                    </span>
                                </>
                            ) : (
                                <>
                                    Authorized{' '}
                                    <span className="text-[#8A6305] dark:text-[#E5B54A]">
                                        Commercial Agencies
                                    </span>
                                </>
                            )}
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-[13.5px] font-medium text-[#0B192C]/60 dark:text-slate-300 max-w-2xl">
                            {isArabic
                                ? 'تمثيل وتوزيع مباشر لأقوى العلامات التجارية الغذائية والمنظفات لتزويد المحلات والسوبرماركت بالطرود.'
                                : 'Direct wholesale representation and distribution of leading food and detergent brands for supermarkets and retailers.'}
                        </p>
                    </div>

                    {/* Unified Command Controls: Capsule Search + Capsule Sector Filter Tabs */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                        {/* Capsule Search Input */}
                        <div className="relative flex-1 sm:w-64 md:w-72">
                            <Search
                                className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B192C]/45 dark:text-slate-400 pointer-events-none"
                                aria-hidden="true"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label={isArabic ? 'ابحث عن وكالة أو علامة تجارية' : 'Search agencies or brands'}
                                placeholder={
                                    isArabic
                                        ? 'ابحث عن وكالة أو علامة تجارية...'
                                        : 'Search agencies or brands...'
                                }
                                className="h-11 w-full rounded-full border border-[#0B192C]/15 dark:border-white/15 bg-[#FAF7F0] dark:bg-zinc-900 py-2 ps-10 pe-9 text-xs sm:text-[13px] font-medium text-[#0B192C] dark:text-white placeholder:text-[#0B192C]/45 dark:placeholder:text-slate-400 transition-colors focus:bg-white dark:focus:bg-zinc-800 focus:border-[#0B192C] dark:focus:border-[#C59329] focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[#0B192C]/45 hover:text-[#0B192C] dark:text-slate-400 dark:hover:text-white cursor-pointer"
                                    aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Capsule Sector Tabs */}
                        <div
                            role="tablist"
                            aria-label={isArabic ? 'تصنيف الوكالات حسب القطاع' : 'Filter agencies by sector'}
                            className="inline-flex items-center h-11 p-1 rounded-full bg-[#FAF7F0] dark:bg-zinc-800 border border-[#0B192C]/15 dark:border-white/15 overflow-x-auto scrollbar-hide shrink-0"
                        >
                            {sectors.map((sector) => {
                                const isSelected = selectedSector === sector.id;
                                return (
                                    <button
                                        key={sector.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={isSelected}
                                        onClick={() => setSelectedSector(sector.id)}
                                        className={`h-full px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-[#0B192C] text-white dark:bg-[#C59329] dark:text-[#0B192C]'
                                                : 'text-[#0B192C]/65 dark:text-slate-300 hover:text-[#0B192C] dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{isArabic ? sector.labelAr : sector.labelEn}</span>
                                        <span
                                            className={`text-[11px] font-mono tabular-nums ${
                                                isSelected
                                                    ? 'text-[#E5B54A] dark:text-[#0B192C]'
                                                    : 'text-[#0B192C]/45 dark:text-slate-400'
                                            }`}
                                        >
                                            {sector.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Connected 4-Column Architectural Brand Matrix (2 Columns on Mobile) */}
                {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-s border-[#0B192C]/[0.08] dark:border-white/10 rounded-[18px] overflow-hidden border border-[#0B192C]/[0.09] bg-white dark:bg-zinc-900">
                        {filteredBrands.map((brand) => {
                            const englishName = getBrandDisplayName(brand, 'en');
                            const arabicName = getBrandDisplayName(brand, 'ar');
                            const specialty = getBrandSpecialty(brand, isArabic);
                            const sectorLabel = getBrandSectorLabel(brand, isArabic);
                            const productCount = brand._count?.products;

                            return (
                                <Link
                                    key={brand.id || brand.slug}
                                    href={`/products?brand=${brand.slug}`}
                                    className="group relative flex flex-col justify-between p-4 sm:p-6 border-e border-b border-[#0B192C]/[0.08] dark:border-white/10 bg-white dark:bg-zinc-900 hover:bg-[#FAF7F0] dark:hover:bg-zinc-800/70 transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] min-h-[220px] sm:min-h-[280px]"
                                >
                                    {/* Top Row: Sector Label + SKU Count Pill */}
                                    <div className="w-full flex items-center justify-between gap-2">
                                        <span className="text-[10.5px] sm:text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] truncate">
                                            {sectorLabel}
                                        </span>
                                        {productCount !== undefined && productCount > 0 && (
                                            <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FAF7F0] group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-900 border border-[#0B192C]/10 dark:border-white/10 text-[#0B192C] dark:text-slate-200 font-mono tabular-nums shrink-0 transition-colors">
                                                {formatProductCountLabel(productCount)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Center Stage: Brand Logo */}
                                    <div className="relative mx-auto w-[130px] sm:w-[175px] h-[76px] sm:h-[96px] flex items-center justify-center my-4 sm:my-6 shrink-0">
                                        {brand.image ? (
                                            <ResilientImage
                                                src={brand.image}
                                                alt={isArabic ? arabicName : englishName}
                                                showSkeleton={false}
                                                className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-[#FAF7F0] dark:bg-zinc-800 border border-[#0B192C]/10 flex items-center justify-center text-[#0B192C] dark:text-white font-bold text-xl">
                                                {(isArabic ? arabicName : englishName).charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Meta Stage */}
                                    <div className="w-full pt-3 sm:pt-3.5 border-t border-[#0B192C]/[0.07] dark:border-white/10">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <h2 className="text-[14.5px] sm:text-[17px] font-bold text-[#0B192C] dark:text-white truncate">
                                                {isArabic ? arabicName : englishName}
                                            </h2>
                                            {englishName && arabicName && englishName !== arabicName && (
                                                <span
                                                    dir="ltr"
                                                    className="text-[11px] sm:text-xs font-semibold text-[#0B192C]/45 dark:text-slate-400 font-sans truncate shrink-0"
                                                >
                                                    {isArabic ? englishName : arabicName}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-1.5 flex items-center justify-between gap-2">
                                            <p className="text-[11px] sm:text-[12.5px] text-[#0B192C]/60 dark:text-slate-400 line-clamp-1 font-normal">
                                                {specialty}
                                            </p>
                                            <span className="text-[11px] sm:text-xs font-bold text-[#0B192C] dark:text-white group-hover:text-[#8A6305] dark:group-hover:text-[#E5B54A] whitespace-nowrap shrink-0 transition-colors">
                                                <span className="hidden sm:inline">
                                                    {isArabic ? 'تصفح الأصناف' : 'Browse'}
                                                </span>
                                                <span className="sm:hidden">
                                                    {isArabic ? 'الأصناف' : 'Items'}
                                                </span>{' '}
                                                <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Right-to-Left Sweep Underline */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-[#0F2138] dark:bg-[#E5B54A] scale-x-0 origin-left group-hover:origin-right group-hover:scale-x-100 transition-transform duration-320 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                    />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Clean Empty State */
                    <div className="bg-[#FAF7F0]/60 dark:bg-zinc-900 border border-[#0B192C]/[0.09] dark:border-white/10 rounded-[18px] p-10 sm:p-14 text-center my-6">
                        <Building2 className="w-12 h-12 text-[#0B192C]/25 dark:text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-slate-200 mb-1">
                            {isArabic ? 'لم نتمكن من العثور على وكالات مطابقة' : 'No matching agencies found'}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#0B192C]/60 dark:text-slate-400 max-w-md mx-auto mb-4">
                            {isArabic
                                ? 'يرجى تجربة كلمات بحث أخرى أو إعادة تعيين الفلاتر لعرض كافة الوكالات المعتمدة.'
                                : 'Please try different search keywords or reset the filters to browse all authorized agencies.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedSector('all');
                            }}
                            className="px-5 py-2.5 rounded-full bg-[#0B192C] hover:bg-[#162740] dark:bg-[#C59329] dark:text-[#0B192C] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                        >
                            {isArabic ? 'عرض كافة الوكالات' : 'View All Agencies'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
