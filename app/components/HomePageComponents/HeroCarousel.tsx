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
        title: 'Authentic Pasta, Sauces & Canned Goods',
        subtitle: 'Direct from certified international suppliers with bulk wholesale discounts.',
        titleAr: 'معكرونة، صلصات ومعلبات فاخرة',
        subtitleAr: 'توريد مباشر من كبرى الشركات العالمية بأسعار الجملة المعتمدة للمتاجر.',
        image: "/uploads/banners/1787222533353-201908699.webp",
        buttonText: 'Explore Products',
        buttonTextAr: 'تصفح المنتجات',
        link: "/products",
        badge: '100% Authentic',
        badgeAr: 'منتجات أصلية 100%',
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
                {/* Responsive Height: Rich banner with overlay on mobile, split-banner on desktop */}
                <div className="relative overflow-hidden rounded-2xl bg-[#FAF6EC] dark:bg-[#1A1A14] h-[210px] sm:h-[260px] md:h-[400px] lg:h-[480px] shadow-xs">
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={displayBanners.length > 1}
                        speed={1000}
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
                        className="h-full w-full"
                    >
                        {displayBanners.map((banner, index) => (
                            <SwiperSlide key={banner.id} className="h-full w-full">
                                <div className="flex flex-col md:flex-row rtl:md:flex-row-reverse h-full w-full relative">
                                    
                                    {/* Image Container - Full width/height on mobile, left side on desktop */}
                                    <div className="w-full h-full md:w-1/2 relative shrink-0 block overflow-hidden">
                                        <Image
                                            src={banner.image}
                                            alt={getBannerTitle(banner)}
                                            fill
                                            priority={index === 0}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "low"}
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover object-center transition-transform duration-700 md:group-hover:scale-105"
                                        />
                                        
                                        {/* Mobile Visual Overlay: Clean & Bright (only subtle bottom gradient) */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent md:hidden flex flex-col justify-end p-4 pb-6">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="bg-[#8A6305] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm">
                                                    {getBannerBadge(banner)}
                                                </span>
                                            </div>
                                            
                                            <h2 className="text-white text-base sm:text-lg font-bold leading-tight mb-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] line-clamp-2">
                                                {getBannerTitle(banner)}
                                            </h2>

                                            {/* Only the 2 requested buttons on mobile */}
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    href={banner.link || "/products"} 
                                                    className="inline-flex items-center gap-1.5 bg-white text-[#0B192C] hover:bg-[#FAF6EC] px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-md"
                                                >
                                                    <span>{getBannerButtonText(banner)}</span>
                                                    <svg className={`w-3 h-3 ${isArabic ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </Link>

                                                <Link 
                                                    href="/brands" 
                                                    className="inline-flex items-center gap-1.5 bg-black/40 text-white border border-white/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-md"
                                                >
                                                    <span>{isArabic ? 'اكتشف وكالاتنا' : 'Our Agencies'}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Content Container - Hidden on mobile, Right side on desktop */}
                                    <div className="relative z-10 hidden md:flex w-full md:h-full md:w-1/2 flex-col items-center justify-center text-center md:px-10 lg:px-16 bg-[#FAF6EC] dark:bg-[#1A1A14]">
                                        <div className="animate-fadeInUp w-full max-w-[340px] md:max-w-md flex flex-col items-center text-center">
                                            
                                            {/* Badge */}
                                            <div className="mb-3">
                                                <span className="bg-amber-100/80 text-[#8A6305] dark:bg-amber-950/40 dark:text-[#E5B54A] px-3.5 py-1 rounded-full text-xs font-bold tracking-wider">
                                                    {getBannerBadge(banner)}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h2 className="text-[28px] md:text-[34px] lg:text-[40px] font-bold leading-[1.2] mb-3 md:mb-4 text-[#0B192C] dark:text-[#F8FAFC]">
                                                {getBannerTitle(banner)}
                                            </h2>
                                            
                                            {/* Description */}
                                            <p className="text-[13px] md:text-sm lg:text-[15px] text-[#475569] dark:text-[#94A3B8] mb-5 md:mb-7 leading-relaxed font-medium line-clamp-2">
                                                {getBannerSubtitle(banner)}
                                            </p>
                                            
                                            {/* Strictly the 2 buttons requested */}
                                            <div className="flex items-center justify-center gap-3">
                                                <Link
                                                    href={banner.link || "/products"}
                                                    className="px-6 py-2.5 bg-[#8A6305] hover:bg-[#735204] text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
                                                >
                                                    <span>{getBannerButtonText(banner)}</span>
                                                </Link>

                                                <Link
                                                    href="/brands"
                                                    className="px-6 py-2.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#0B192C] dark:text-[#F8FAFC] border border-[#0B192C]/30 dark:border-white/30 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
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

                    {/* Navigation and Pagination Group - Centered on Mobile, Bottom Right on Desktop */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-5 md:right-6 rtl:md:right-auto rtl:md:left-6 z-20 flex items-center pointer-events-none">
                        
                        <button className="swiper-button-prev-hero pointer-events-auto hidden md:flex items-center justify-center text-[#4A4A4A] hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mr-2 rtl:mr-0 rtl:ml-2">
                            <svg className="w-4 h-4 rtl:scale-x-[-1]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </button>

                        <div className="hero-swiper-pagination pointer-events-auto flex items-center justify-center" />

                        <button className="swiper-button-next-hero pointer-events-auto hidden md:flex items-center justify-center text-[#4A4A4A] hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors ml-2 rtl:ml-0 rtl:mr-2">
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
                    width: 36px;
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
