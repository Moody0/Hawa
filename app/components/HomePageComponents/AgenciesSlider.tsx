'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    'rokavera': 'Rokavera',
    'buffalo': 'Buffalo',
    'alreef': 'Alreef',
    'monda': 'Monda',
    'moria': 'Moria',
    'zwan': 'Zwan',
    'rona': 'Rona',
    'haleebna': 'Haleebna',
    'sunbell': 'Sunbell',
    'silver-fish': 'Silver Fish',
    'silverfish': 'Silver Fish',
    'al-maghrabi': 'Al-Maghrabi',
    'almaghrabi': 'Al-Maghrabi',
    'americana': 'Americana',
    'tat': 'Tat',
    'de-cecco-italy': 'De Cecco',
    'rio-mare': 'Rio Mare',
};

const BRAND_SPECIALTIES: Record<string, { ar: string; en: string }> = {
    'rocavera': { ar: 'منتجات غذائية متنوعة', en: 'Diverse Food Products' },
    'rokavera': { ar: 'منتجات غذائية متنوعة', en: 'Diverse Food Products' },
    'buffalo': { ar: 'منتجات استهلاكية', en: 'Consumer Products' },
    'alreef': { ar: 'منتجات غذائية ومكسرات', en: 'Food Products & Nuts' },
    'monda': { ar: 'منتجات شوكولاتة وحلويات', en: 'Chocolates & Confectionery' },
    'moria': { ar: 'منتجات شوكولاتة وحلويات', en: 'Chocolates & Confectionery' },
    'zwan': { ar: 'منتجات متنوعة', en: 'Diverse Products' },
    'rona': { ar: 'منتجات متنوعة', en: 'Diverse Products' },
    'haleebna': { ar: 'سمن بقري وألبان مجففة', en: 'Pure Ghee & Dairy' },
    'sunbell': { ar: 'معلبات تونة وسردين', en: 'Canned Tuna & Sardines' },
    'silver-fish': { ar: 'معلبات أسماك وسردين', en: 'Canned Sardines & Seafood' },
    'silverfish': { ar: 'معلبات أسماك وسردين', en: 'Canned Sardines & Seafood' },
    'al-maghrabi': { ar: 'سردين وبقوليات مختارة', en: 'Canned Sardines & Legumes' },
    'almaghrabi': { ar: 'سردين وبقوليات مختارة', en: 'Canned Sardines & Legumes' },
};

const FALLBACK_BRANDS: AgencyBrand[] = [
    {
        id: 'fb-rokavera',
        name: 'روكافيرا',
        slug: 'rokavera',
        image: '/uploads/brands/1787218720317-533737981.webp',
        description: 'منتجات غذائية متنوعة',
    },
    {
        id: 'fb-buffalo',
        name: 'بوفالو',
        slug: 'buffalo',
        image: '/uploads/brands/1787218780732-876013491.webp',
        description: 'منتجات استهلاكية',
    },
    {
        id: 'fb-alreef',
        name: 'الريف',
        slug: 'alreef',
        image: '/uploads/brands/1787218788676-939433594.webp',
        description: 'منتجات غذائية ومكسرات',
    },
    {
        id: 'fb-monda',
        name: 'موندا',
        slug: 'monda',
        image: '/uploads/brands/1787218827141-37442807.webp',
        description: 'منتجات شوكولاتة وحلويات',
    },
    {
        id: 'fb-zwan',
        name: 'زوان',
        slug: 'zwan',
        image: '/uploads/brands/1787218834786-329403477.webp',
        description: 'منتجات متنوعة',
    },
    {
        id: 'fb-haleebna',
        name: 'حليبنا',
        slug: 'haleebna',
        image: '/uploads/brands/1787218842962-605908044.webp',
        description: 'سمن بقري وألبان مجففة',
    },
    {
        id: 'fb-sunbell',
        name: 'صن بل',
        slug: 'sunbell',
        image: '/uploads/brands/1787218851081-615253174.webp',
        description: 'معلبات تونة وسردين',
    },
    {
        id: 'fb-silver-fish',
        name: 'سيلفر فيش',
        slug: 'silver-fish',
        image: '/uploads/brands/1787218858040-140800254.webp',
        description: 'معلبات أسماك وسردين',
    },
];

export default function AgenciesSlider({ brands = [], title, subtitle }: AgenciesSliderProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';
    const swiperRef = React.useRef<SwiperType | null>(null);

    React.useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncAutoplay = () => {
            const swiper = swiperRef.current;
            if (!swiper?.autoplay) return;
            if (document.hidden || motionQuery.matches) swiper.autoplay.stop();
            else swiper.autoplay.start();
        };

        document.addEventListener('visibilitychange', syncAutoplay);
        motionQuery.addEventListener('change', syncAutoplay);
        syncAutoplay();

        return () => {
            document.removeEventListener('visibilitychange', syncAutoplay);
            motionQuery.removeEventListener('change', syncAutoplay);
        };
    }, []);

    const activeBrands = (brands && brands.length > 0) ? brands : FALLBACK_BRANDS;

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
        return isArabic ? 'منتجات غذائية متنوعة' : 'Diverse Products';
    };

    const sectionTitle = title || (isArabic ? 'علامات تجارية تثق بنا' : 'Brands That Trust Us');
    const sectionSubtitle =
        subtitle ||
        (isArabic
            ? 'نفخر بتمثيل وتوزيع مجموعة من أفضل العلامات التجارية المحلية والعالمية'
            : 'We are proud to represent and distribute a curated portfolio of top local and international brands');

    return (
        <section className="w-full py-8 md:py-11 bg-transparent">
            <div className="container-custom">
                {/* Section Header with Centered Gold Flanking Lines matching screenshot */}
                <div className="text-center mb-5 sm:mb-7">
                    <div className="flex items-center justify-center gap-3.5 mb-2">
                        <span className="w-10 sm:w-16 h-[1.5px] bg-[#C28E2B] rounded-full shrink-0" aria-hidden="true" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight" data-reveal-heading>
                            {sectionTitle}
                        </h2>
                        <span className="w-10 sm:w-16 h-[1.5px] bg-[#C28E2B] rounded-full shrink-0" aria-hidden="true" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-normal" data-reveal-copy>
                        {sectionSubtitle}
                    </p>
                </div>

                {/* Swiper Slider with Left & Right Floating Circular Navigation Buttons */}
                <div
                    className="relative w-full px-2 sm:px-4"
                    onFocusCapture={() => swiperRef.current?.autoplay?.stop()}
                    onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            swiperRef.current?.autoplay?.start();
                        }
                    }}
                >
                    {/* Left Flank Button (<) */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isArabic) {
                                swiperRef.current?.slideNext();
                            } else {
                                swiperRef.current?.slidePrev();
                            }
                        }}
                        className="absolute -left-2 sm:-left-4 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200/90 dark:border-white/15 bg-white dark:bg-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#C28E2B] hover:text-[#966b15] hover:bg-[#FAF6EC] dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label={isArabic ? 'السابق' : 'Previous'}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Right Flank Button (>) */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isArabic) {
                                swiperRef.current?.slidePrev();
                            } else {
                                swiperRef.current?.slideNext();
                            }
                        }}
                        className="absolute -right-2 sm:-right-4 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200/90 dark:border-white/15 bg-white dark:bg-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#C28E2B] hover:text-[#966b15] hover:bg-[#FAF6EC] dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label={isArabic ? 'التالي' : 'Next'}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <Swiper
                        modules={[Autoplay, Navigation]}
                        onBeforeInit={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        autoplay={{
                            delay: 4500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        observer={true}
                        observeParents={true}
                        watchOverflow={true}
                        loop={activeBrands.length > 5}
                        spaceBetween={14}
                        slidesPerView={2}
                        breakpoints={{
                            480: { slidesPerView: 2, spaceBetween: 14 },
                            640: { slidesPerView: 3, spaceBetween: 16 },
                            768: { slidesPerView: 4, spaceBetween: 18 },
                            1024: { slidesPerView: 4, spaceBetween: 20 },
                            1280: { slidesPerView: 5, spaceBetween: 20 },
                        }}
                        className="agencies-slider-swiper !py-2 !px-1"
                    >
                        {activeBrands.map((brand) => {
                            const latinName = getBrandLatinName(brand);
                            const specialty = getBrandSpecialty(brand);

                            return (
                                <SwiperSlide key={brand.id || brand.slug} className="h-auto">
                                    <Link
                                        href={`/products?brand=${brand.slug}`}
                                        className="group h-[190px] sm:h-[210px] w-full flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 shadow-[0_8px_28px_-24px_rgba(11,25,44,0.45)] hover:border-[#C28E2B]/50 hover:-translate-y-1 transition-all duration-300 text-center"
                                    >
                                        {/* Brand Logo Container (Top - Hero Size) */}
                                        <div className="relative w-full h-20 sm:h-24 md:h-28 flex items-center justify-center p-1.5 shrink-0">
                                            {brand.image ? (
                                                <ResilientImage
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    showSkeleton={false}
                                                    className="object-contain filter group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <span className="text-xl font-black text-[#0B192C] dark:text-white">
                                                    {brand.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Brand Details (Middle: Latin Name & Category) */}
                                        <div className="w-full flex flex-col items-center mt-1">
                                            <h3 className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white group-hover:text-[#C28E2B] transition-colors truncate max-w-full">
                                                {latinName}
                                            </h3>
                                            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-normal">
                                                {specialty}
                                            </p>
                                        </div>

                                        {/* Call to Action Link (Bottom: Golden Link with Arrow) */}
                                        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#C28E2B] group-hover:text-[#966b15] transition-colors mt-2 pb-0.5">
                                            <span>{isArabic ? 'عرض المنتجات' : 'View Products'}</span>
                                            <span className={isArabic ? 'text-sm group-hover:-translate-x-1 transition-transform' : 'text-sm group-hover:translate-x-1 transition-transform'}>
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
