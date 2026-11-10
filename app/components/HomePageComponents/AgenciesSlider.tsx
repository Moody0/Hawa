'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getBrandDisplayName } from '@/lib/brand-display';

import 'swiper/css';
import 'swiper/css/navigation';

export interface AgencyBrand {
    id: string;
    name: string;
    nameEn?: string | null;
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

    const activeBrands = brands;
    if (!activeBrands.length) return null;

    const isDefaultPartnerTitle =
        !title ||
        title.trim() === 'شركاؤنا' ||
        title.trim() === 'علامات تجارية تثق بنا' ||
        title.trim() === 'Our partners';

    const isDefaultPartnerSubtitle =
        !subtitle ||
        subtitle.trim() === 'تصفح المنتجات حسب الشركة.' ||
        subtitle.trim() === 'Explore products by brand.';

    const sectionSubtitle = !isDefaultPartnerSubtitle
        ? subtitle
        : isArabic
          ? 'وكالات وعلامات تجارية رائدة نعتز بتمثيلها وتوزيع منتجاتها في الأسواق.'
          : 'Leading brands and official agencies we proudly represent and distribute.';

    return (
        <section className="w-full pt-4 pb-8 md:pt-7 md:pb-12 bg-transparent">
            <div className="container-custom">
                {/* Centered Proud Partner Header */}
                <div className="relative flex flex-col items-center text-center mb-5 sm:mb-7">
                    <div className="max-w-2xl mx-auto px-2">
                        <h2 className="text-[22px] sm:text-[26px] 2xl:text-[34px] font-black text-[#0B192C] dark:text-white leading-[1.2] tracking-[-0.015em]">
                            {isArabic ? (
                                isDefaultPartnerTitle ? (
                                    <>
                                        نعتز بشركائنا{' '}
                                        <span className="text-[#8A6305] dark:text-[#E5B54A]">بالنجاح والتوزيع</span>
                                    </>
                                ) : (
                                    title
                                )
                            ) : isDefaultPartnerTitle ? (
                                <>
                                    Proud of Our Partners{' '}
                                    <span className="text-[#8A6305] dark:text-[#E5B54A]">in Distribution</span>
                                </>
                            ) : (
                                title
                            )}
                        </h2>
                        <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[15px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                            {sectionSubtitle}
                        </p>
                    </div>

                    {/* Desktop Capsule Controller — Anchored to End without shifting centered title */}
                    <div className="hidden sm:inline-flex lg:absolute lg:end-0 lg:bottom-0 mt-4 lg:mt-0 items-center gap-1 p-1 rounded-full bg-white dark:bg-zinc-900 border border-[#0B192C]/10 dark:border-white/15 shrink-0">
                        <button
                            type="button"
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="w-[34px] h-[34px] rounded-full inline-flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-[#0F2138] hover:text-white dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer"
                            aria-label={isArabic ? 'السابق' : 'Previous'}
                        >
                            {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => swiperRef.current?.slideNext()}
                            className="w-[34px] h-[34px] rounded-full inline-flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-[#0F2138] hover:text-white dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer"
                            aria-label={isArabic ? 'التالي' : 'Next'}
                        >
                            {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                        <Link
                            href="/brands"
                            className="px-3.5 py-1 text-[12.5px] font-extrabold text-[#0B192C] dark:text-white hover:text-[#8A6305] dark:hover:text-[#E5B54A] border-s border-[#0B192C]/[0.08] dark:border-white/10 transition-colors"
                        >
                            {isArabic ? 'كل الوكالات ←' : 'All Brands →'}
                        </Link>
                    </div>
                </div>

                {/* Separate Cards on Mobile, Connected Architectural Track on Desktop (sm+) */}
                <div
                    className="relative w-full sm:bg-white sm:dark:bg-zinc-900 sm:border sm:border-[#0B192C]/[0.09] sm:dark:border-white/10 sm:rounded-[18px] sm:overflow-hidden"
                    onFocusCapture={() => swiperRef.current?.autoplay?.stop()}
                    onBlurCapture={(event) => {
                        if (
                            !event.currentTarget.contains(event.relatedTarget as Node | null) &&
                            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                        ) {
                            swiperRef.current?.autoplay?.start();
                        }
                    }}
                >
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        onBeforeInit={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        autoplay={{
                            delay: 4200,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        observer={true}
                        observeParents={true}
                        watchOverflow={true}
                        loop={activeBrands.length > 5}
                        spaceBetween={10}
                        slidesPerView={2.15}
                        breakpoints={{
                            480: { slidesPerView: 2.4, spaceBetween: 12 },
                            640: { slidesPerView: 3.2, spaceBetween: 0 },
                            768: { slidesPerView: 4, spaceBetween: 0 },
                            1024: { slidesPerView: 5, spaceBetween: 0 },
                            1280: { slidesPerView: 6, spaceBetween: 0 },
                        }}
                        className="agencies-slider-swiper"
                    >
                        {activeBrands.map((brand) => {
                            const arName = getBrandDisplayName(brand, 'ar');
                            const enName = getBrandDisplayName(brand, 'en');
                            const primaryName = isArabic ? arName : enName;
                            const secondaryName = isArabic
                                ? (enName !== arName ? enName : '')
                                : (arName !== enName ? arName : '');

                            return (
                                <SwiperSlide key={brand.id || brand.slug} className="h-auto">
                                    <Link
                                        href={`/products?brand=${brand.slug}`}
                                        prefetch={false}
                                        className="group/slot relative h-[138px] sm:h-[152px] 2xl:h-[176px] w-full px-4 py-3.5 sm:px-5 sm:py-4 2xl:px-6 2xl:py-5 max-sm:rounded-[14px] max-sm:border max-sm:border-[#0B192C]/[0.09] max-sm:dark:border-white/10 max-sm:overflow-hidden sm:border-e sm:border-[#0B192C]/[0.08] sm:dark:border-white/10 flex flex-col justify-between bg-white dark:bg-zinc-900 hover:bg-[#FAF8F3] dark:hover:bg-zinc-800/70 transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                    >
                                        {/* Subtle Top Hover Action */}
                                        <div className="flex items-center justify-end h-4">
                                            <span className="text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] opacity-0 translate-x-1 group-hover/slot:opacity-100 group-hover/slot:translate-x-0 transition-all duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]">
                                                {isArabic ? 'تصفح ←' : 'Browse →'}
                                            </span>
                                        </div>

                                        {/* Center Brand Logo Stage */}
                                        <div className="relative mx-auto w-[110px] sm:w-[126px] 2xl:w-[148px] h-[56px] sm:h-[66px] 2xl:h-[78px] flex items-center justify-center shrink-0">
                                            {brand.image ? (
                                                <ResilientImage
                                                    src={brand.image}
                                                    alt={primaryName}
                                                    showSkeleton={false}
                                                    className="object-contain object-center transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/slot:scale-[1.06]"
                                                />
                                            ) : (
                                                <span className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-white text-center">
                                                    {primaryName}
                                                </span>
                                            )}
                                        </div>

                                        {/* Bottom Brand Identity Row */}
                                        <div className="flex items-baseline justify-between gap-2 pt-1">
                                            <span className="text-[13.5px] sm:text-[15px] font-extrabold text-[#0B192C] dark:text-white truncate">
                                                {primaryName}
                                            </span>
                                            {secondaryName ? (
                                                <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-slate-400 group-hover/slot:text-[#8A6305] dark:group-hover/slot:text-[#E5B54A] transition-colors truncate">
                                                    {secondaryName}
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Bottom Right-to-Left Sweep Underline */}
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-[#0F2138] dark:bg-[#E5B54A] scale-x-0 origin-left group-hover/slot:origin-right group-hover/slot:scale-x-100 transition-transform duration-320 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                        />
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
