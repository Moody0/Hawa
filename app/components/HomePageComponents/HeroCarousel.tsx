'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/app/context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Banner {
    id: string;
    title: string | null;
    subtitle: string | null;
    titleAr: string | null;
    subtitleAr: string | null;
    image: string;
    imageMobile?: string | null;
    buttonText: string | null;
    buttonTextAr?: string | null;
    link: string | null;
    badge: string | null;
    badgeAr?: string | null;
    isActive: boolean;
}

interface SlideItem {
    id: string;
    badge: string;
    badgeAr: string;
    title: string;
    titleAr: string;
    subtitle: string;
    subtitleAr: string;
    buttonText: string;
    buttonTextAr: string;
    link: string;
    secondaryButtonText?: string;
    secondaryButtonTextAr?: string;
    secondaryLink?: string;
    secondaryIcon?: 'agencies' | 'whatsapp';
    image: string;
    imageMobile?: string | null;
}

interface HeroCarouselProps {
    banners?: Banner[];
}

const SLIDE_DURATION = 6000; // 6 seconds per slide

const HeroCarousel = ({ banners }: HeroCarouselProps) => {
    const { dir } = useLanguage();
    const isArabic = dir === 'rtl';

    // Map active banners to slides
    const slides: SlideItem[] = React.useMemo(() => {
        const activeBanners = (banners || []).filter((b) => b.isActive !== false);

        if (activeBanners.length === 0) {
            return [];
        }

        const mapped: SlideItem[] = activeBanners.map((b, idx) => ({
            id: b.id || `banner-${idx}`,
            badge: b.badge || 'Certified Wholesale',
            badgeAr: b.badgeAr || 'توزيع جملة معتمد',
            title: b.title || 'Your Trusted Partner in Wholesale',
            titleAr: b.titleAr || 'شريكك الموثوق في التوزيع والتجارة',
            subtitle: b.subtitle || '',
            subtitleAr: b.subtitleAr || '',
            buttonText: b.buttonText || 'Browse Products',
            buttonTextAr: b.buttonTextAr || 'تصفح المنتجات',
            link: b.link || '/products',
            image: b.image || '/images/hero-showcase-perfect.webp',
            imageMobile: b.imageMobile || null,
        }));

        return mapped;
    }, [banners]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHoverPaused, setIsHoverPaused] = useState(false);
    const [isFocusPaused, setIsFocusPaused] = useState(false);
    const [isDragPaused, setIsDragPaused] = useState(false);
    const [isDocumentHidden, setIsDocumentHidden] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const heroContainerRef = useRef<HTMLDivElement>(null);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const isDragging = useRef<boolean>(false);

    const isPaused = isHoverPaused || isFocusPaused || isDragPaused || isDocumentHidden || reduceMotion;

    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => setReduceMotion(motionQuery.matches);
        const updateVisibility = () => setIsDocumentHidden(document.hidden);

        updateMotionPreference();
        updateVisibility();
        motionQuery.addEventListener('change', updateMotionPreference);
        document.addEventListener('visibilitychange', updateVisibility);

        return () => {
            motionQuery.removeEventListener('change', updateMotionPreference);
            document.removeEventListener('visibilitychange', updateVisibility);
        };
    }, []);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setAnimKey((prev) => prev + 1);
    }, [slides.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        setAnimKey((prev) => prev + 1);
    }, [slides.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setAnimKey((prev) => prev + 1);
    }, []);

    // Auto-advance carousel timer
    useEffect(() => {
        if (isPaused || slides.length <= 1) return;

        const interval = setInterval(() => {
            goToNext();
        }, SLIDE_DURATION);

        return () => clearInterval(interval);
    }, [isPaused, slides.length, goToNext, currentIndex]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
            if (isArabic) goToPrev();
            else goToNext();
        } else if (e.key === 'ArrowLeft') {
            if (isArabic) goToNext();
            else goToPrev();
        }
    };

    // Touch and pointer swipe handlers
    const handleSwipeStart = (clientX: number) => {
        touchStartX.current = clientX;
        touchEndX.current = clientX;
        isDragging.current = true;
        setIsDragPaused(true);
    };

    const handleSwipeMove = (clientX: number) => {
        if (!isDragging.current) return;
        touchEndX.current = clientX;
    };

    const handleSwipeEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        if (touchStartX.current !== null && touchEndX.current !== null) {
            const distance = touchStartX.current - touchEndX.current;
            const threshold = 30;

            if (Math.abs(distance) > threshold) {
                if (distance > 0) {
                    // Swiped Left
                    if (isArabic) goToPrev();
                    else goToNext();
                } else {
                    // Swiped Right
                    if (isArabic) goToNext();
                    else goToPrev();
                }
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
        setIsDragPaused(false);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        handleSwipeStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleSwipeMove(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        handleSwipeEnd();
    };

    if (!slides.length) return null;

    const animClass = isArabic ? 'animate-hero-slide-rtl' : 'animate-hero-slide-ltr';

    return (
        <section
            ref={heroContainerRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={isArabic ? "بنرات العروض والخدمات الرئيسية" : "Hero Showcase Banners"}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHoverPaused(true)}
            onMouseLeave={() => setIsHoverPaused(false)}
            onFocusCapture={() => setIsFocusPaused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setIsFocusPaused(false);
                }
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="group/hero relative w-full h-[420px] sm:h-[450px] md:h-[460px] lg:h-[clamp(330px,28vw,560px)] overflow-hidden bg-slate-950 focus:outline-hidden touch-pan-y select-none"
        >
            <style jsx>{`
                @keyframes heroProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .hero-progress-fill {
                    animation: heroProgress ${SLIDE_DURATION}ms linear forwards;
                }
                .hero-progress-fill-paused {
                    animation: heroProgress ${SLIDE_DURATION}ms linear forwards;
                    animation-play-state: paused;
                }
                @keyframes heroSlideInRTL {
                    0% {
                        opacity: 0;
                        transform: translate3d(55px, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                @keyframes heroSlideInLTR {
                    0% {
                        opacity: 0;
                        transform: translate3d(-55px, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                .animate-hero-slide-rtl {
                    animation-name: heroSlideInRTL;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                    animation-fill-mode: both;
                }
                .animate-hero-slide-ltr {
                    animation-name: heroSlideInLTR;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                    animation-fill-mode: both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .hero-progress-fill,
                    .hero-progress-fill-paused {
                        animation: none;
                        width: 100%;
                    }
                    .animate-hero-slide-rtl,
                    .animate-hero-slide-ltr {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }
                }
            `}</style>

            {/* Slides Track */}
            <div className="relative w-full h-full">
                {slides.map((slide, index) => {
                    const isActive = index === currentIndex;
                    const isGeneratedBanner = slide.image.startsWith('/images/hero-banner-collection/');
                    const headlineText = (isArabic ? slide.titleAr : slide.title) || (isArabic ? 'شريكك الموثوق في التوزيع والتجارة' : 'Your Trusted Partner in Distribution & Trading');
                    const subtitleText = isArabic ? slide.subtitleAr : slide.subtitle;
                    const primaryButtonText = isArabic ? slide.buttonTextAr : slide.buttonText;

                    const secondaryBtnText = isArabic
                        ? (slide.secondaryButtonTextAr || 'طلب جملة عبر واتساب')
                        : (slide.secondaryButtonText || 'Direct WhatsApp Order');
                    const secondaryHref = slide.secondaryLink || 'https://wa.me/963993443901?text=' + encodeURIComponent(isArabic ? 'مرحباً، أود الاستفسار عن توريد بضائع بالجملة' : 'Hello, I would like to inquire about wholesale supply');
                    const isSecExternal = secondaryHref.startsWith('http') || secondaryHref.startsWith('https');

                    return (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                                isActive
                                    ? 'opacity-100 z-10 pointer-events-auto'
                                    : 'opacity-0 z-0 pointer-events-none'
                            }`}
                            aria-hidden={!isActive}
                        >
                            {/* Preserve the full product artwork on wide screens. */}
                            <div className="absolute inset-0 overflow-hidden bg-[#071522]">
                                {isGeneratedBanner && (
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 hidden scale-110 bg-cover bg-center blur-2xl md:block"
                                        style={{ backgroundImage: `url('${slide.image}')` }}
                                    />
                                )}
                                <div className={isGeneratedBanner ? 'absolute inset-0 md:inset-auto md:left-0 md:top-0 md:h-full md:aspect-[2/1] md:max-w-full md:[mask-image:linear-gradient(to_right,black_70%,transparent_100%)]' : 'absolute inset-0'}>
                                <Image
                                    src={slide.image}
                                    alt={isArabic ? (slide.titleAr || 'بنر الصفحة الرئيسية') : (slide.title || 'Hero banner')}
                                    fill
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    unoptimized={slide.image.startsWith('/uploads/')}
                                    sizes="100vw"
                                    className={`${isGeneratedBanner ? 'object-cover md:object-contain md:object-left' : 'object-cover object-center'} w-full h-full pointer-events-none ${slide.imageMobile ? 'hidden md:block' : ''}`}
                                />
                                </div>
                                {slide.imageMobile && (
                                    <Image
                                        src={slide.imageMobile}
                                        alt={isArabic ? (slide.titleAr || 'بنر الصفحة الرئيسية') : (slide.title || 'Hero banner')}
                                        fill
                                        priority={index === 0}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        unoptimized={slide.imageMobile.startsWith('/uploads/')}
                                        sizes="100vw"
                                        className="object-cover object-top w-full h-full pointer-events-none md:hidden"
                                    />
                                )}
                            </div>

                            {/* Directional scrim for legible typography */}
                            <div
                                className={`absolute inset-0 pointer-events-none ${
                                    isArabic
                                        ? 'bg-gradient-to-t from-[#081220]/90 via-[#081220]/45 to-transparent sm:bg-gradient-to-l sm:from-[#081220]/80 sm:via-[#081220]/35 sm:to-transparent'
                                        : 'bg-gradient-to-t from-[#081220]/90 via-[#081220]/45 to-transparent sm:bg-gradient-to-r sm:from-[#081220]/80 sm:via-[#081220]/35 sm:to-transparent'
                                }`}
                                aria-hidden="true"
                            />

                            {/* Content Layer */}
                            <div className="relative z-20 h-full container-custom flex items-end md:items-center pb-16 md:pb-0">
                                {isActive && (
                                    <div
                                        key={`slide-content-${slide.id}-${animKey}`}
                                        className="w-full max-w-[540px] 2xl:max-w-[640px] flex flex-col items-start text-start py-5 sm:py-7 2xl:py-12"
                                    >
                                        {/* Main Headline */}
                                        <h1 className="text-2xl sm:text-3xl lg:text-[38px] xl:text-[44px] 2xl:text-[54px] font-black tracking-[-0.02em] text-white leading-[1.16] sm:leading-[1.12] text-balance">
                                            {headlineText}
                                        </h1>

                                        {/* Subtitle / Description */}
                                        {subtitleText && (
                                            <p className="mt-2.5 sm:mt-3.5 text-sm sm:text-[15px] 2xl:text-[18.5px] text-white/86 font-medium leading-[1.65] max-w-[48ch] line-clamp-2 sm:line-clamp-none text-pretty">
                                                {subtitleText}
                                            </p>
                                        )}

                                        {/* Action Buttons — Concept 01: Signature Gold Capsule + Editorial Underline Link */}
                                        <div className="mt-4 sm:mt-6 2xl:mt-7 flex flex-wrap items-center gap-4 sm:gap-[22px] 2xl:gap-[26px]">
                                            <Link
                                                href={slide.link}
                                                prefetch={false}
                                                tabIndex={isActive ? 0 : -1}
                                                className="group/cta inline-flex h-10 sm:h-11 2xl:h-12 items-center justify-center gap-2.5 rounded-full bg-[#C59329] px-5 sm:px-6 2xl:px-7 text-[13px] sm:text-[13.5px] 2xl:text-[14.5px] font-black text-[#0B192C] transition-colors duration-200 hover:bg-[#D4A134] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                            >
                                                <span>{primaryButtonText}</span>
                                                <span
                                                    className={`inline-block transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                                        isArabic
                                                            ? 'group-hover/cta:-translate-x-1'
                                                            : 'group-hover/cta:translate-x-1'
                                                    }`}
                                                    aria-hidden="true"
                                                >
                                                    {isArabic ? '←' : '→'}
                                                </span>
                                            </Link>

                                            <Link
                                                href={secondaryHref}
                                                prefetch={false}
                                                tabIndex={isActive ? 0 : -1}
                                                target={isSecExternal ? '_blank' : undefined}
                                                rel={isSecExternal ? 'noopener noreferrer' : undefined}
                                                className="group/sec hidden sm:inline-flex items-center gap-2 py-1.5 text-[15px] font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] rounded-sm"
                                            >
                                                <span className="relative pb-1">
                                                    {secondaryBtnText}
                                                    <span
                                                        className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[#E5B54A] scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sec:scale-x-100 ${
                                                            isArabic
                                                                ? 'origin-left group-hover/sec:origin-right'
                                                                : 'origin-right group-hover/sec:origin-left'
                                                        }`}
                                                    />
                                                </span>
                                                <span className="text-[13px] text-[#E5B54A]" aria-hidden="true">↗</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Navigation Arrows (Only shown on medium screens and up) */}
            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={isArabic ? goToNext : goToPrev}
                        aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-black/70 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] opacity-75 hover:opacity-100 group-hover/hero:opacity-100"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={isArabic ? goToPrev : goToNext}
                        aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-black/70 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] opacity-75 hover:opacity-100 group-hover/hero:opacity-100"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </>
            )}

            {/* Bottom Pagination Indicators — Sleek Horizontal Dash Bars */}
            {slides.length > 1 && (
                <div
                    className="absolute bottom-9 md:bottom-6 inset-x-0 z-30 flex items-center justify-center"
                    aria-label={isArabic ? 'التحكم في البنرات' : 'Banner controls'}
                >
                    <div
                        className="flex items-center justify-center gap-2"
                        role="tablist"
                        aria-label={isArabic ? 'التنقل بين البنرات' : 'Banner navigation'}
                    >
                        {slides.map((_, idx) => {
                            const isActive = idx === currentIndex;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-label={isArabic ? `الانتقال إلى البنر ${idx + 1}` : `Go to banner ${idx + 1}`}
                                    onClick={() => goToSlide(idx)}
                                    className={`h-[3.5px] w-7 sm:w-8 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] ${
                                        isActive
                                            ? 'bg-[#E5B54A]'
                                            : 'bg-white/35 hover:bg-white/60'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default HeroCarousel;
