'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import 'swiper/css';
import 'swiper/css/navigation';

export interface AgencyBrand {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    group?: string;
    isFeatured?: boolean;
}

interface AgenciesSliderProps {
    brands?: AgencyBrand[];
    title?: string;
    subtitle?: string;
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

const BRAND_SPECIALTIES: Record<string, { ar: string; en: string }> = {
    'rocavera': { ar: 'منظفات وعناية شخصية', en: 'Hygiene & Personal Care' },
    'buffalo': { ar: 'سوائل جلي ومنظفات', en: 'Detergents & FMCG' },
    'alreef': { ar: 'زيوت وسمن وبقوليات', en: 'Cooking Oils, Ghee & Legumes' },
    'monda': { ar: 'شوكولاتة وحلويات', en: 'Chocolates & Confectionery' },
    'moria': { ar: 'شوكولاتة وحلويات', en: 'Chocolates & Confectionery' },
    'zwan': { ar: 'لانشون ولحوم معلبة', en: 'Luncheon & Canned Meats' },
    'haleebna': { ar: 'سمن بقري وألبان مجففة', en: 'Pure Cow Ghee & Dairy' },
    'sunbell': { ar: 'تونة ولحوم معلبة', en: 'Corned Beef & Seafood' },
    'silver-fish': { ar: 'تونة وسردين بالزيت', en: 'Canned Sardines & Tuna' },
    'al-maghrabi': { ar: 'سردين وبقوليات مختارة', en: 'Canned Sardines & Legumes' },
    'almaghrabi': { ar: 'سردين وبقوليات مختارة', en: 'Canned Sardines & Legumes' },
};

export default function AgenciesSlider({ brands = [], title, subtitle }: AgenciesSliderProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    if (!brands || brands.length === 0) return null;

    const getBrandLatinName = (brand: AgencyBrand) => {
        const key = brand.slug?.toLowerCase();
        if (key && BRAND_LATIN_NAMES[key]) {
            return BRAND_LATIN_NAMES[key];
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
    };

    const getBrandSpecialty = (brand: AgencyBrand) => {
        if (brand.description && brand.description.trim()) {
            return brand.description.trim();
        }
        const key = brand.slug?.toLowerCase();
        if (key && BRAND_SPECIALTIES[key]) {
            return isArabic ? BRAND_SPECIALTIES[key].ar : BRAND_SPECIALTIES[key].en;
        }
        return isArabic ? 'منتجات تجارية معتمدة' : 'Certified Agency Products';
    };

    const sectionTitle = title || (isArabic ? 'الوكالات والعلامات التجارية المعتمدة' : 'Authorized Commercial Agencies');
    const sectionSubtitle =
        subtitle ||
        (isArabic
            ? 'توزيع مباشر وحصري من كبرى الشركات المحلية والعالمية لكافة المحلات والسوبرماركت'
            : 'Direct wholesale distribution of leading FMCG brands for supermarkets and retailers');

    return (
        <section className="w-full py-4 md:py-6">
            <div className="container-custom">
                {/* Header with Title and All Brands Link */}
                <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-slate-200 dark:border-white/10 pb-3 sm:pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                                {isArabic ? 'وكالات رسمية معتمدة' : 'Official Brands'}
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight">
                            {sectionTitle}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop Navigation Chevrons */}
                        <div className="hidden md:flex items-center gap-1.5 me-2 border-e border-slate-200 dark:border-white/10 pe-3">
                            <button
                                type="button"
                                className="agency-nav-right w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] transition cursor-pointer shadow-2xs disabled:opacity-30"
                                aria-label={isArabic ? 'الوكالات التالية' : 'Next brands'}
                            >
                                <MdChevronRight className="text-xl" />
                            </button>
                            <button
                                type="button"
                                className="agency-nav-left w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] transition cursor-pointer shadow-2xs disabled:opacity-30"
                                aria-label={isArabic ? 'الوكالات السابقة' : 'Previous brands'}
                            >
                                <MdChevronLeft className="text-xl" />
                            </button>
                        </div>

                        <Link
                            href="/brands"
                            className="text-xs font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                            <span>{isArabic ? 'كافة الوكالات' : 'View All'}</span>
                            <span className={isArabic ? 'rotate-180 inline-block' : 'inline-block'}>→</span>
                        </Link>
                    </div>
                </div>

                {/* Swiper Slider */}
                <div className="relative w-full">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        navigation={{
                            prevEl: isArabic ? '.agency-nav-right' : '.agency-nav-left',
                            nextEl: isArabic ? '.agency-nav-left' : '.agency-nav-right',
                        }}
                        autoplay={{
                            delay: 4500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        observer={true}
                        observeParents={true}
                        watchOverflow={true}
                        loop={brands.length > 5}
                        spaceBetween={12}
                        slidesPerView={2}
                        breakpoints={{
                            640: { slidesPerView: 3, spaceBetween: 14 },
                            1024: { slidesPerView: 4, spaceBetween: 16 },
                            1280: { slidesPerView: 5, spaceBetween: 18 },
                        }}
                        className="agencies-slider-swiper !py-1"
                    >
                        {brands.map((brand) => {
                            const displayName = isArabic ? brand.name : getBrandLatinName(brand);
                            const specialty = getBrandSpecialty(brand);

                            return (
                                <SwiperSlide key={brand.id || brand.slug} className="h-auto">
                                    <Link
                                        href={`/products?brand=${brand.slug}`}
                                        className="group h-[160px] sm:h-[175px] w-full flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#132035] border border-slate-200/80 dark:border-white/10 shadow-2xs hover:border-[#8A6305] dark:hover:border-[#8A6305] hover:shadow-sm transition-all duration-200 text-center"
                                    >
                                        {/* Brand Logo Container */}
                                        <div className="relative w-full h-14 sm:h-16 flex items-center justify-center p-1">
                                            {brand.image ? (
                                                <ResilientImage
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    showSkeleton={false}
                                                    className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-200"
                                                />
                                            ) : (
                                                <span className="text-base font-black text-[#0B192C] dark:text-white">
                                                    {displayName}
                                                </span>
                                            )}
                                        </div>

                                        {/* Brand Typography */}
                                        <div className="w-full flex flex-col items-center">
                                            <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors truncate max-w-full">
                                                {displayName}
                                            </h3>
                                            <p className="text-[11px] text-[#475569] dark:text-slate-400 mt-0.5 line-clamp-1 font-normal">
                                                {specialty}
                                            </p>
                                        </div>

                                        {/* Bottom Action Link */}
                                        <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-[#8A6305] group-hover:text-[#735204] transition-colors">
                                            <span>{isArabic ? 'عرض المنتجات' : 'View Products'}</span>
                                            <span className={isArabic ? 'group-hover:-translate-x-1 transition-transform' : 'group-hover:translate-x-1 transition-transform'}>
                                                {isArabic ? '←' : '→'}
                                            </span>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
