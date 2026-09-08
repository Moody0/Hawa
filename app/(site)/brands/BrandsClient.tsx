'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import Breadcrumb from '@/app/components/Breadcrumb';
import { Search, X, Building2 } from 'lucide-react';

interface Brand {
    id: string;
    name: string;
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

const BRAND_LATIN_NAMES: Record<string, string> = {
    'rocavera': 'Rokavera',
    'buffalo': 'Buffalo',
    'alreef': 'Alreef',
    'monda': 'Monda',
    'moria': 'Moria',
    'zwan': 'Zwan',
    'haleebna': 'Haleebna',
    'sunbell': 'Sunbell',
    'silver-fish': 'Silver Fish',
    'al-maghrabi': 'Al-Maghrabi',
    'almaghrabi': 'Al-Maghrabi',
    'americana': 'Americana',
    'tat': 'Tat',
    'de-cecco-italy': 'De Cecco',
    'rio-mare': 'Rio Mare',
};

const BRAND_SPECIALTIES: Record<string, { ar: string; en: string; sector: string }> = {
    'rocavera': { ar: 'منظفات وعناية شخصية', en: 'Hygiene & Personal Care', sector: 'detergents' },
    'buffalo': { ar: 'سوائل جلي ومنظفات منزلية', en: 'Detergents & FMCG', sector: 'detergents' },
    'alreef': { ar: 'زيوت وسمن وبقوليات فاخرة', en: 'Cooking Oils, Ghee & Legumes', sector: 'food' },
    'monda': { ar: 'شوكولاتة وسكاكر وحلويات', en: 'Chocolates & Confectionery', sector: 'sweets' },
    'moria': { ar: 'شوكولاتة وسكاكر وحلويات', en: 'Chocolates & Confectionery', sector: 'sweets' },
    'zwan': { ar: 'لانشون ولحوم معلبة هولندية', en: 'Luncheon & Canned Meats', sector: 'food' },
    'haleebna': { ar: 'سمن بقري نقي وألبان مجففة', en: 'Pure Cow Ghee & Dairy', sector: 'food' },
    'sunbell': { ar: 'تونة ولحوم معلبة فاخرة', en: 'Corned Beef & Seafood', sector: 'food' },
    'silver-fish': { ar: 'تونة وسردين بالزيت النباتي', en: 'Canned Sardines & Tuna', sector: 'food' },
    'al-maghrabi': { ar: 'سردين وبقوليات مختارة', en: 'Canned Sardines & Legumes', sector: 'food' },
    'almaghrabi': { ar: 'سردين وبقوليات مختارة', en: 'Canned Sardines & Legumes', sector: 'food' },
};

function getBrandLatinName(brand: Brand, isArabic: boolean): string {
    const key = brand.slug?.toLowerCase();
    if (key && BRAND_LATIN_NAMES[key]) {
        return BRAND_LATIN_NAMES[key];
    }
    const nameParts = brand.name.split('-');
    if (nameParts.length > 1) {
        return isArabic ? nameParts[0].trim() : nameParts[1].trim();
    }
    if (/[a-zA-Z]/.test(brand.name)) {
        return brand.name;
    }
    if (brand.slug) {
        return brand.slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }
    return brand.name;
}

function getBrandArabicName(brand: Brand, isArabic: boolean): string {
    const nameParts = brand.name.split('-');
    if (nameParts.length > 1) {
        return isArabic ? nameParts[1].trim() : nameParts[0].trim();
    }
    return brand.name;
}

function getBrandSpecialty(brand: Brand, isArabic: boolean): string {
    if (brand.description && brand.description.trim()) {
        return brand.description.trim();
    }
    const key = brand.slug?.toLowerCase();
    if (key && BRAND_SPECIALTIES[key]) {
        return isArabic ? BRAND_SPECIALTIES[key].ar : BRAND_SPECIALTIES[key].en;
    }
    return isArabic ? 'منتجات تجارية معتمدة' : 'Certified Commercial Products';
}

function getBrandSector(brand: Brand): string {
    const key = brand.slug?.toLowerCase();
    if (key && BRAND_SPECIALTIES[key]) {
        return BRAND_SPECIALTIES[key].sector;
    }
    return 'food';
}

export default function BrandsClient({ brands }: BrandsClientProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('all');

    // Filter brands based on search query and sector filter
    const filteredBrands = useMemo(() => {
        return brands.filter((brand) => {
            const latinName = getBrandLatinName(brand, isArabic).toLowerCase();
            const arabicName = getBrandArabicName(brand, isArabic).toLowerCase();
            const specialty = getBrandSpecialty(brand, isArabic).toLowerCase();
            const query = searchQuery.trim().toLowerCase();

            const matchesSearch =
                !query ||
                latinName.includes(query) ||
                arabicName.includes(query) ||
                specialty.includes(query) ||
                (brand.description && brand.description.toLowerCase().includes(query)) ||
                brand.slug.toLowerCase().includes(query);

            const sector = getBrandSector(brand);
            const matchesSector =
                selectedSector === 'all' ||
                (selectedSector === 'main' && (brand.group === 'MAIN' || brand.isFeatured)) ||
                selectedSector === sector;

            return matchesSearch && matchesSector;
        });
    }, [brands, searchQuery, selectedSector, isArabic]);

    const sectors = [
        { id: 'all', labelAr: 'كافة الوكالات', labelEn: 'All Agencies', count: brands.length },
        {
            id: 'main',
            labelAr: 'وكالات رئيسية',
            labelEn: 'Main Agencies',
            count: brands.filter((b) => b.group === 'MAIN' || b.isFeatured).length,
        },
        {
            id: 'food',
            labelAr: 'غذائيات ومعلبات',
            labelEn: 'Food & Canned Goods',
            count: brands.filter((b) => getBrandSector(b) === 'food').length,
        },
        {
            id: 'detergents',
            labelAr: 'منظفات وعناية',
            labelEn: 'Detergents & Care',
            count: brands.filter((b) => getBrandSector(b) === 'detergents').length,
        },
        {
            id: 'sweets',
            labelAr: 'حلويات وشوكولاتة',
            labelEn: 'Sweets & Chocolates',
            count: brands.filter((b) => getBrandSector(b) === 'sweets').length,
        },
    ].filter((s) => s.id === 'all' || s.count > 0);

    return (
        <div className="w-full bg-[#FCFBF8] dark:bg-zinc-950 min-h-screen transition-colors pb-16">
            <div className="container-custom pt-6 pb-12">
                {/* 1. Unified Navigation Div / Breadcrumb */}
                <Breadcrumb
                    items={[
                        {
                            label: isArabic ? 'الوكالات والعلامات التجارية' : 'Agencies & Brands',
                        },
                    ]}
                />

                {/* 2. Section Header with Centered Gold Flanking Lines (Home Page Style) */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
                        <span className="w-8 sm:w-16 h-[1.5px] bg-[#C28E2B] rounded-full shrink-0" aria-hidden="true" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight">
                            {isArabic ? 'وكالاتنا والعلامات التجارية المعتمدة' : 'Authorized Commercial Agencies'}
                        </h1>
                        <span className="w-8 sm:w-16 h-[1.5px] bg-[#C28E2B] rounded-full shrink-0" aria-hidden="true" />
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed mt-1">
                        {isArabic
                            ? 'توزيع مباشر وحصري من كبرى الشركات المحلية والعالمية لكافة المحلات والسوبرماركت بأسعار الجملة المعتمدة'
                            : 'Direct and exclusive wholesale distribution of leading FMCG brands for supermarkets and retailers'}
                    </p>
                </div>

                {/* 3. Interactive Toolbar: Live Search & Sector Filters */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 rounded-2xl p-3 sm:p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    {/* Live Search Input */}
                    <div className="relative w-full md:max-w-md">
                        <Search
                            className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none"
                            aria-hidden="true"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isArabic ? 'ابحث عن وكالة أو علامة تجارية أو صنف...' : 'Search agencies, brands, or categories...'}
                            className="w-full h-10 sm:h-11 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 ps-10 pe-10 focus:border-[#C28E2B] transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
                                aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Filter Sector Pills */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
                        {sectors.map((sector) => {
                            const isSelected = selectedSector === sector.id;
                            return (
                                <button
                                    key={sector.id}
                                    type="button"
                                    onClick={() => setSelectedSector(sector.id)}
                                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-[#0B192C] text-white dark:bg-white dark:text-slate-900 shadow-xs'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-slate-300'
                                    }`}
                                >
                                    <span>{isArabic ? sector.labelAr : sector.labelEn}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isSelected
                                                ? 'bg-[#C28E2B] text-white'
                                                : 'bg-slate-200/80 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
                                        }`}
                                    >
                                        {sector.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Active Results Count Bar */}
                <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C28E2B]" />
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                            {isArabic
                                ? `عرض ${filteredBrands.length} من أصل ${brands.length} وكالة معتمدة`
                                : `Showing ${filteredBrands.length} of ${brands.length} authorized agencies`}
                        </span>
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedSector('all');
                            }}
                            className="text-xs font-bold text-[#C28E2B] hover:text-[#966b15] transition-colors"
                        >
                            {isArabic ? 'إعادة تعيين الفلاتر' : 'Reset filters'}
                        </button>
                    )}
                </div>

                {/* 5. Clean Commercial Brands Grid (Matching AgenciesSlider Homepage Style) */}
                {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
                        {filteredBrands.map((brand) => {
                            const latinName = getBrandLatinName(brand, isArabic);
                            const arabicName = getBrandArabicName(brand, isArabic);
                            const specialty = getBrandSpecialty(brand, isArabic);
                            const productCount = brand._count?.products;

                            return (
                                <Link
                                    key={brand.id || brand.slug}
                                    href={`/products?brand=${brand.slug}`}
                                    className="group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 hover:border-[#C28E2B]/60 transition-all duration-300 text-center min-h-[260px] sm:min-h-[280px]"
                                >
                                    {/* Top Pill / Badge */}
                                    <div className="w-full flex items-center justify-between gap-1 mb-1">
                                        {brand.isFeatured || brand.group === 'MAIN' ? (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6EC] dark:bg-[#8A6305]/15 text-[#8A6305] dark:text-[#E5B54A] border border-[#8A6305]/20">
                                                {isArabic ? 'وكالة معتمدة' : 'Official'}
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        {productCount !== undefined && productCount > 0 && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono">
                                                {productCount} {isArabic ? 'صنف' : 'items'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Brand Logo Stage */}
                                    <div className="relative w-full h-24 sm:h-28 md:h-32 flex items-center justify-center p-2 my-1 shrink-0">
                                        {brand.image ? (
                                            <ResilientImage
                                                src={brand.image}
                                                alt={brand.name}
                                                showSkeleton={false}
                                                className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-white font-bold text-lg">
                                                {brand.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Details */}
                                    <div className="w-full flex flex-col items-center mt-1">
                                        <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#0B192C] dark:text-white group-hover:text-[#C28E2B] transition-colors truncate max-w-full">
                                            {latinName}
                                        </h2>
                                        {arabicName && arabicName !== latinName && (
                                            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate max-w-full">
                                                {arabicName}
                                            </p>
                                        )}
                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-normal">
                                            {specialty}
                                        </p>
                                    </div>

                                    {/* Call to Action Link */}
                                    <div className="w-full flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#C28E2B] group-hover:text-[#966b15] dark:group-hover:text-[#E5B54A] transition-colors mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5">
                                        <span>{isArabic ? 'تصفح الأصناف' : 'Browse Products'}</span>
                                        <span className="text-sm transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                                            {isArabic ? '←' : '→'}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Clean Empty State */
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 rounded-2xl p-10 sm:p-14 text-center my-6">
                        <Building2 className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                            {isArabic ? 'لم نتمكن من العثور على وكالات مطابقة' : 'No matching agencies found'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
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
                            className="px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#162740] dark:bg-white dark:text-slate-900 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                        >
                            {isArabic ? 'عرض كافة الوكالات' : 'View All Agencies'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
