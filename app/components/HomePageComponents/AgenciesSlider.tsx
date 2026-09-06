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
    'rocavera': { ar: 'منظفات ومستحضرات عناية شخصية', en: 'Hygiene & Personal Care' },
    'buffalo': { ar: 'سوائل جلي ومنظفات استهلاكية', en: 'Detergents & Consumer FMCG' },
    'alreef': { ar: 'زيوت وسمن وبقوليات أساسية', en: 'Cooking Oils, Ghee & Legumes' },
    'monda': { ar: 'منتجات شوكولاتة وحلويات', en: 'Chocolates & Confectionery' },
    'moria': { ar: 'منتجات شوكولاتة وحلويات', en: 'Chocolates & Confectionery' },
    'zwan': { ar: 'لانشون ولحوم معلبة فاخرة', en: 'Premium Luncheon & Canned Meats' },
    'haleebna': { ar: 'سمن بقري نقي وألبان مجففة', en: 'Pure Cow Ghee & Dairy' },
    'sunbell': { ar: 'تونة ولحوم معلبة ممتازة', en: 'Corned Beef & Seafood' },
    'silver-fish': { ar: 'تونة خفيفة وسردين بالزيت', en: 'Canned Sardines & Tuna' },
    'al-maghrabi': { ar: 'سردين بالزيت وبقوليات مختارة', en: 'Canned Sardines & Legumes' },
    'almaghrabi': { ar: 'سردين بالزيت وبقوليات مختارة', en: 'Canned Sardines & Legumes' },
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

    const sectionTitle = title || (isArabic ? 'علامات تجارية تثق بنا' : 'Brands That Trust Us');
    const sectionSubtitle =
        subtitle ||
        (isArabic
            ? 'نفخر بتمثيل وتوزيع مجموعة من أفضل العلامات التجارية المحلية والعالمية'
            : 'Proud to represent and distribute a selection of the finest local and global brands');

    return (
        <section className="w-full py-6 md:py-8 bg-[#FCFCFD] dark:bg-[#0B192C]">
            {/* Inline CSS to guarantee multi-column layout prior to Swiper JS initialization */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .agencies-slider-swiper:not(.swiper-initialized) .swiper-wrapper {
                    display: flex !important;
                    gap: 16px !important;
                    overflow: hidden !important;
                    width: 100% !important;
                }
                .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                    flex: 0 0 calc((100% - 16px) / 2) !important;
                    max-width: calc((100% - 16px) / 2) !important;
                    width: calc((100% - 16px) / 2) !important;
                    display: block !important;
                }
                @media (min-width: 640px) {
                    .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                        flex: 0 0 calc((100% - 32px) / 3) !important;
                        max-width: calc((100% - 32px) / 3) !important;
                        width: calc((100% - 32px) / 3) !important;
                    }
                }
                @media (min-width: 1024px) {
                    .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                        flex: 0 0 calc((100% - 60px) / 4) !important;
                        max-width: calc((100% - 60px) / 4) !important;
                        width: calc((100% - 60px) / 4) !important;
                    }
                }
                @media (min-width: 1280px) {
                    .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                        flex: 0 0 calc((100% - 80px) / 5) !important;
                        max-width: calc((100% - 80px) / 5) !important;
                        width: calc((100% - 80px) / 5) !important;
                    }
                }
            `}} />
            <div className="container-custom">
                {/* Centered Ornamental Section Header with Golden Accent Lines */}
                <div className="text-center mb-5 md:mb-6">
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
                        <span className="w-8 sm:w-12 h-[2px] bg-[#8A6305] rounded-full" />
                        <h2 className="text-xl sm:text-2xl md:text-[28px] font-black text-[#0B192C] dark:text-white tracking-tight">
                            {sectionTitle}
                        </h2>
                        <span className="w-8 sm:w-12 h-[2px] bg-[#8A6305] rounded-full" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 max-w-xl mx-auto font-normal">
                        {sectionSubtitle}
                    </p>
                </div>

                {/* Swiper Slider with Floating Side Navigation Chevrons */}
                <div className="relative w-full px-1 sm:px-2">
                    {/* Floating Circular Prev Button (Left) */}
                    <button
                        type="button"
                        className="agency-nav-left absolute -left-2 sm:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#8A6305] hover:text-[#735204] hover:bg-amber-50/50 dark:hover:bg-white/5 hover:border-[#8A6305]/60 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Previous"
                    >
                        <MdChevronLeft className="text-xl sm:text-2xl" />
                    </button>

                    {/* Floating Circular Next Button (Right) */}
                    <button
                        type="button"
                        className="agency-nav-right absolute -right-2 sm:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#8A6305] hover:text-[#735204] hover:bg-amber-50/50 dark:hover:bg-white/5 hover:border-[#8A6305]/60 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Next"
                    >
                        <MdChevronRight className="text-xl sm:text-2xl" />
                    </button>

                    <Swiper
                        modules={[Autoplay, Navigation]}
                        navigation={{
                            prevEl: isArabic ? '.agency-nav-right' : '.agency-nav-left',
                            nextEl: isArabic ? '.agency-nav-left' : '.agency-nav-right',
                        }}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        observer={true}
                        observeParents={true}
                        resizeObserver={true}
                        watchOverflow={true}
                        loop={brands.length > 5}
                        spaceBetween={16}
                        slidesPerView={2}
                        breakpoints={{
                            640: { slidesPerView: 3, spaceBetween: 16 },
                            1024: { slidesPerView: 4, spaceBetween: 20 },
                            1280: { slidesPerView: 5, spaceBetween: 20 },
                        }}
                        className="agencies-slider-swiper !py-3 !px-1"
                    >
                        {brands.map((brand) => {
                            const displayName = isArabic ? brand.name : getBrandLatinName(brand);
                            const specialty = getBrandSpecialty(brand);

                            return (
                                <SwiperSlide key={brand.id || brand.slug} className="h-auto">
                                    <Link
                                        href={`/products?brand=${brand.slug}`}
                                        className="group h-[185px] sm:h-[195px] w-full flex flex-col items-center justify-between p-4 sm:p-4.5 rounded-xl bg-white dark:bg-[#132035] border border-slate-100 dark:border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 text-center"
                                    >
                                        {/* Brand Logo Container */}
                                        <div className="relative w-full h-16 sm:h-20 flex items-center justify-center p-1">
                                            {brand.image ? (
                                                <ResilientImage
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    showSkeleton={false}
                                                    className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <span className="text-lg font-black text-[#0B192C] dark:text-white">
                                                    {displayName}
                                                </span>
                                            )}
                                        </div>

                                        {/* Brand Typography (Name & Specialty) */}
                                        <div className="w-full flex flex-col items-center">
                                            <h3 className="text-sm sm:text-base font-bold text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors truncate max-w-full">
                                                {displayName}
                                            </h3>
                                            <p className="text-xs text-[#475569] dark:text-slate-400 mt-0.5 line-clamp-1 font-normal">
                                                {specialty}
                                            </p>
                                        </div>

                                        {/* Bottom Action Link */}
                                        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#8A6305] group-hover:text-[#735204] transition-colors mt-1">
                                            <span>{isArabic ? 'عرض المنتجات' : 'View Products'}</span>
                                            <span
                                                className={`text-sm transition-transform duration-200 ${
                                                    isArabic
                                                        ? 'group-hover:-translate-x-1'
                                                        : 'group-hover:translate-x-1'
                                                }`}
                                            >
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

            {/* Critical CSS for SSR / Pre-Hydration: prevents layout shift before Swiper JS initializes */}
            <style jsx global>{`
                .agencies-slider-swiper:not(.swiper-initialized) .swiper-wrapper {
                    display: flex !important;
                    gap: 16px !important;
                    overflow: hidden !important;
                }
                .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                    width: calc((100% - 16px) / 2) !important;
                    flex-shrink: 0 !important;
                }
                @media (min-width: 640px) {
                    .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                        width: calc((100% - 32px) / 3) !important;
                    }
                }
                @media (min-width: 1024px) {
                    .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                        width: calc((100% - 60px) / 4) !important;
                    }
                }
                @media (min-width: 1280px) {
                    .agencies-slider-swiper:not(.swiper-initialized) .swiper-slide {
                        width: calc((100% - 80px) / 5) !important;
                    }
                }
            `}</style>
        </section>
    );
}
