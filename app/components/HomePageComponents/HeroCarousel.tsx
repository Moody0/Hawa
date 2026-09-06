'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Banner {
    id: string;
    title: string | null;
    subtitle: string | null;
    titleAr: string | null;
    subtitleAr: string | null;
    image: string;
    buttonText: string | null;
    buttonTextAr?: string | null;
    link: string | null;
    badge: string | null;
    badgeAr?: string | null;
    isActive: boolean;
}

interface HeroCarouselProps {
    banners?: Banner[];
}

const HeroCarousel = ({ banners }: HeroCarouselProps) => {
    const { dir, language } = useLanguage();
    const isArabic = dir === 'rtl';
    const wrapperRef = React.useRef<HTMLElement>(null);
    
    const DEFAULT_BANNER: Banner = {
        id: 'default',
        title: 'Certified Food Agencies & Supplies',
        subtitle: 'Direct wholesale distribution of Zwan meats, Alreef oils & ghee, and Haleebna dairy.',
        titleAr: 'وكالات المواد الغذائية المعتمدة',
        subtitleAr: 'توزيع مباشر لمنتجات زوان، سمن وزيوت الريف، ومشتقات حليبنا بأسعار الجملة المعتمدة.',
        image: "/uploads/banners/hawa-food-agencies-banner.jpg",
        buttonText: 'Explore Food Catalog',
        buttonTextAr: 'تصفح المواد الغذائية',
        link: "/products?mainCategory=food",
        badge: 'Official Agencies',
        badgeAr: 'وكالات غذائية رسمية',
        isActive: true
    };

    const getBannerTitle = (banner: Banner): string => {
        return isArabic ? (banner.titleAr || banner.title || DEFAULT_BANNER.titleAr!) : (banner.title || banner.titleAr || DEFAULT_BANNER.title!);
    };

    const getBannerSubtitle = (banner: Banner): string => {
        return isArabic ? (banner.subtitleAr || banner.subtitle || DEFAULT_BANNER.subtitleAr!) : (banner.subtitle || banner.subtitleAr || DEFAULT_BANNER.subtitle!);
    };

    const getBannerButtonText = (banner: Banner): string => {
        if (isArabic) {
            return banner.buttonTextAr || banner.buttonText || 'تصفح المنتجات';
        }
        return banner.buttonText || banner.buttonTextAr || 'Explore Products';
    };

    const getBannerBadge = (banner: Banner): string => {
        if (isArabic) {
            return banner.badgeAr || banner.badge || 'منتجات أصلية 100%';
        }
        return banner.badge || banner.badgeAr || '100% Authentic';
    };

    const displayBanners = banners && banners.length > 0 ? banners : [DEFAULT_BANNER];

    return (
        <section ref={wrapperRef} className="container-custom pt-3 md:pt-5 pb-1 md:pb-2 group hero-carousel">
            <div className="w-full relative">
                {/* 
                  Clean Shopify/WordPress B2B Banner:
                  - 100% untouched, bright photography with ZERO dark overlay
                  - Mobile: Top natural banner photo + bottom clean cream card with crisp dark text
                  - Desktop: Side-by-side split layout
                */}
                <div className="relative overflow-hidden rounded-2xl bg-[#FAF6EC] dark:bg-[#1A1A14] border border-slate-200/70 dark:border-white/10 shadow-xs">
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={displayBanners.length > 1}
                        speed={900}
                        autoplay={{
                            delay: 6000,
                            disableOnInteraction: false,
                        }}
                        onAutoplayTimeLeft={(swiper, time, progress) => {
                            if (wrapperRef.current) {
                                wrapperRef.current.style.setProperty('--autoplay-progress', `${(1 - progress) * 100}%`);
                            }
                        }}
                        pagination={{
                            el: '.hero-swiper-pagination',
                            clickable: true,
                            renderBullet: function (index, className) {
                                return '<span class="' + className + '"></span>';
                            },
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next-hero',
                            prevEl: '.swiper-button-prev-hero',
                        }}
                        className="w-full"
                    >
                        {displayBanners.map((banner, index) => (
                            <SwiperSlide key={banner.id} className="w-full h-auto">
                                <div className="flex flex-col md:flex-row rtl:md:flex-row-reverse w-full md:h-[390px] lg:h-[440px]">
                                    
                                    {/* Natural Image Container - Zero Dark Layer */}
                                    <div className="w-full h-[180px] sm:h-[230px] md:h-full md:w-1/2 relative shrink-0 block overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                        <Image
                                            src={banner.image}
                                            alt={getBannerTitle(banner)}
                                            fill
                                            priority={index === 0}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "low"}
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover object-center transition-transform duration-700 md:group-hover:scale-102"
                                        />
                                    </div>

                                    {/* Clean Text Content Container - High Contrast Dark Navy Text on Clean Cream Background */}
                                    <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center text-center p-5 sm:p-6 md:px-10 lg:px-14 bg-[#FAF6EC] dark:bg-[#1A1A14]">
                                        <div className="w-full max-w-md flex flex-col items-center text-center">
                                            
                                            {/* Badge */}
                                            <div className="mb-2 md:mb-3">
                                                <span className="bg-amber-100 text-[#8A6305] dark:bg-amber-950/50 dark:text-[#E5B54A] border border-[#8A6305]/20 px-3 py-0.5 md:py-1 rounded-full text-[11px] md:text-xs font-bold tracking-wide inline-block">
                                                    {getBannerBadge(banner)}
                                                </span>
                                            </div>

                                            {/* Title - Semantic H1 for Homepage */}
                                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-snug mb-2 md:mb-3 text-[#0B192C] dark:text-[#F8FAFC]">
                                                {getBannerTitle(banner)}
                                            </h1>
                                            
                                            {/* Subtitle */}
                                            <p className="text-xs sm:text-sm md:text-[14px] text-[#475569] dark:text-[#94A3B8] mb-4 md:mb-6 leading-relaxed font-medium line-clamp-2 max-w-sm">
                                                {getBannerSubtitle(banner)}
                                            </p>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
                                                <Link
                                                    href={banner.link || "/products"}
                                                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#8A6305] hover:bg-[#735204] text-white rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                                                >
                                                    <span>{getBannerButtonText(banner)}</span>
                                                    <svg className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </Link>

                                                <Link
                                                    href="/brands"
                                                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#0B192C] dark:text-[#F8FAFC] border border-[#0B192C]/30 dark:border-white/30 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                                                >
                                                    <span>{isArabic ? 'اكتشف وكالاتنا' : 'Our Agencies'}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation and Pagination Group */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-4 md:right-6 rtl:md:right-auto rtl:md:left-6 z-20 flex items-center pointer-events-none">
                        
                        <button 
                            className="swiper-button-prev-hero pointer-events-auto hidden md:flex items-center justify-center text-[#4A4A4A] hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mr-2 rtl:mr-0 rtl:ml-2"
                            aria-label={language === 'ar' ? 'الشريحة السابقة' : 'Previous slide'}
                        >
                            <svg className="w-4 h-4 rtl:scale-x-[-1]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </button>

                        <div className="hero-swiper-pagination pointer-events-auto flex items-center justify-center" />

                        <button 
                            className="swiper-button-next-hero pointer-events-auto hidden md:flex items-center justify-center text-[#4A4A4A] hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors ml-2 rtl:ml-0 rtl:mr-2"
                            aria-label={language === 'ar' ? 'الشريحة التالية' : 'Next slide'}
                        >
                            <svg className="w-4 h-4 rtl:scale-x-[-1]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .hero-carousel .swiper-pagination-bullet {
                    width: 6px;
                    height: 6px;
                    background: rgba(138, 99, 5, 0.4);
                    opacity: 1;
                    transition: all 0.3s;
                    border-radius: 99px;
                    margin: 0 3px !important;
                }
                .hero-carousel .swiper-pagination-bullet-active {
                    width: 32px;
                    background: rgba(138, 99, 5, 0.25) !important;
                    position: relative;
                    overflow: hidden;
                }
                .hero-carousel .swiper-pagination-bullet-active::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: var(--autoplay-progress, 0%);
                    background: #8A6305;
                    border-radius: 99px;
                }
                [dir="rtl"] .hero-carousel .swiper-pagination-bullet-active::after {
                    left: auto;
                    right: 0;
                    background: #8A6305;
                }
            `}</style>
        </section>
    );
};

export default HeroCarousel;
