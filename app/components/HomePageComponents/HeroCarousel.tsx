'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/app/context/LanguageContext';
import { ShoppingCart, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

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

function parseHeadline(title: string, isArabic: boolean): { part1: string; part2: string } {
    if (!title) {
        return {
            part1: isArabic ? "شريكك الموثوق" : "Your Trusted Partner",
            part2: isArabic ? "في التوزيع والتجارة" : "In Distribution & Trading",
        };
    }

    if (title.includes('\n')) {
        const [p1, ...rest] = title.split('\n');
        return { part1: p1.trim(), part2: rest.join(' ').trim() };
    }

    if (title.includes('…')) {
        const [p1, ...rest] = title.split('…');
        return { part1: p1.trim(), part2: rest.join(' ').trim() };
    }

    if (title.includes('...')) {
        const [p1, ...rest] = title.split('...');
        return { part1: p1.trim(), part2: rest.join(' ').trim() };
    }

    if (title.includes(' - ')) {
        const [p1, ...rest] = title.split(' - ');
        return { part1: p1.trim(), part2: rest.join(' ').trim() };
    }

    const words = title.trim().split(/\s+/);
    if (isArabic) {
        if (words.length >= 4) {
            const splitWordIdx = words.findIndex((w, i) => i > 0 && ['في', 'بطلب', 'لباب', 'مع', 'لكبرى', 'للمحلات'].includes(w));
            if (splitWordIdx > 0 && splitWordIdx < words.length) {
                return {
                    part1: words.slice(0, splitWordIdx).join(' '),
                    part2: words.slice(splitWordIdx).join(' '),
                };
            }
            const mid = Math.ceil(words.length / 2);
            return {
                part1: words.slice(0, mid).join(' '),
                part2: words.slice(mid).join(' '),
            };
        }
        return { part1: title, part2: '' };
    }

    if (words.length >= 4) {
        const mid = Math.ceil(words.length / 2);
        return {
            part1: words.slice(0, mid).join(' '),
            part2: words.slice(mid).join(' '),
        };
    }

    return { part1: title, part2: '' };
}

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
            className="group/hero relative w-full h-[460px] sm:h-[500px] md:h-[520px] lg:h-[540px] xl:h-[580px] overflow-hidden bg-slate-950 focus:outline-hidden touch-pan-y select-none"
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
                    const headline = parseHeadline(isArabic ? slide.titleAr : slide.title, isArabic);
                    const subtitleText = isArabic ? slide.subtitleAr : slide.subtitle;
                    const primaryButtonText = isArabic ? slide.buttonTextAr : slide.buttonText;
                    const badgeText = isArabic ? (slide.badgeAr || 'توزيع جملة معتمد') : (slide.badge || 'Certified Wholesale');

                    const secondaryBtnText = isArabic
                        ? (slide.secondaryButtonTextAr || 'طلب جملة عبر واتساب')
                        : (slide.secondaryButtonText || 'Direct WhatsApp Order');
                    const secondaryHref = slide.secondaryLink || 'https://wa.me/963993443901?text=' + encodeURIComponent(isArabic ? 'مرحباً، أود الاستفسار عن توريد بضائع بالجملة' : 'Hello, I would like to inquire about wholesale supply');
                    const isSecExternal = secondaryHref.startsWith('http') || secondaryHref.startsWith('https');

                    return (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                                isActive
                                    ? 'opacity-100 z-10 pointer-events-auto'
                                    : 'opacity-0 z-0 pointer-events-none'
                            }`}
                            aria-hidden={!isActive}
                        >
                            {/* Full-bleed background image with natural unzoomed scale */}
                            <div className="absolute inset-0 overflow-hidden">
                                <Image
                                    src={slide.image}
                                    alt={isArabic ? (slide.titleAr || 'بنر الصفحة الرئيسية') : (slide.title || 'Hero banner')}
                                    fill
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    unoptimized={slide.image.startsWith('/uploads/')}
                                    sizes="100vw"
                                    className={`object-cover object-center w-full h-full pointer-events-none ${slide.imageMobile ? 'hidden md:block' : ''}`}
                                />
                                {slide.imageMobile && (
                                    <Image
                                        src={slide.imageMobile}
                                        alt={isArabic ? (slide.titleAr || 'بنر الصفحة الرئيسية') : (slide.title || 'Hero banner')}
                                        fill
                                        priority={index === 0}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        unoptimized={slide.imageMobile.startsWith('/uploads/')}
                                        sizes="100vw"
                                        className="object-cover object-center w-full h-full pointer-events-none md:hidden"
                                    />
                                )}
                            </div>

                            {/* Soft directional gradient overlay: vertical on mobile, horizontal on desktop */}
                            <div
                                className={`absolute inset-0 pointer-events-none ${
                                    isArabic
                                        ? 'bg-gradient-to-t from-black/85 via-black/45 via-45% to-transparent sm:bg-gradient-to-l sm:from-black/60 sm:via-black/25 sm:to-transparent'
                                        : 'bg-gradient-to-t from-black/85 via-black/45 via-45% to-transparent sm:bg-gradient-to-r sm:from-black/60 sm:via-black/25 sm:to-transparent'
                                }`}
                                aria-hidden="true"
                            />

                            {/* Content Layer (Gordon Food Service / B2B style) */}
                            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end sm:items-center pb-14 sm:pb-0">
                                {isActive && (
                                    <div
                                        key={`slide-content-${slide.id}-${animKey}`}
                                        className="w-full max-w-2xl lg:max-w-3xl flex flex-col items-start text-start py-6 sm:py-8 md:py-12"
                                    >
                                        {/* 1. Eyebrow Badge */}
                                        <div
                                            style={reduceMotion ? undefined : { animationDuration: '700ms', animationDelay: '80ms' }}
                                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md mb-3 sm:mb-5 shadow-xs ${animClass}`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                                            <span>{badgeText}</span>
                                        </div>

                                        {/* 2. Main Headline */}
                                        <h1
                                            style={reduceMotion ? undefined : { animationDuration: '800ms', animationDelay: '200ms' }}
                                            className={`text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white leading-[1.2] sm:leading-[1.15] drop-shadow-md [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] ${animClass}`}
                                        >
                                            <span className="block">{headline.part1}</span>
                                            {headline.part2 && (
                                                <span className="mt-1 sm:mt-1.5 block text-[#E5B54A]">
                                                    {headline.part2}
                                                </span>
                                            )}
                                        </h1>

                                        {/* 3. Subtitle / Description */}
                                        {subtitleText && (
                                            <p
                                                style={reduceMotion ? undefined : { animationDuration: '800ms', animationDelay: '320ms' }}
                                                className={`mt-3 sm:mt-5 text-xs sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none text-pretty drop-shadow-xs [text-shadow:0_1px_6px_rgba(0,0,0,0.8)] ${animClass}`}
                                            >
                                                {subtitleText}
                                            </p>
                                        )}

                                        {/* 4. Action Buttons */}
                                        <div
                                            style={reduceMotion ? undefined : { animationDuration: '850ms', animationDelay: '440ms' }}
                                            className={`mt-5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 ${animClass}`}
                                        >
                                            <Link
                                                href={slide.link}
                                                prefetch={false}
                                                tabIndex={isActive ? 0 : -1}
                                                className="group/btn inline-flex min-h-11 sm:min-h-12 items-center justify-center gap-2.5 rounded-xl border border-[#B68012] bg-[#B68012] px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-base font-bold text-white shadow-lg shadow-black/40 transition-all duration-200 hover:bg-[#9E6F0C] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                            >
                                                <span>{primaryButtonText}</span>
                                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:-translate-x-1 rtl:group-hover/btn:translate-x-1" aria-hidden="true" />
                                            </Link>

                                            <Link
                                                href={secondaryHref}
                                                prefetch={false}
                                                tabIndex={isActive ? 0 : -1}
                                                target={isSecExternal ? '_blank' : undefined}
                                                rel={isSecExternal ? 'noopener noreferrer' : undefined}
                                                className="hidden sm:inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-white/30 bg-white/10 px-5 sm:px-6 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                                            >
                                                {slide.secondaryIcon === 'agencies' ? (
                                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                                                ) : (
                                                    <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" aria-hidden="true" />
                                                )}
                                                <span>{secondaryBtnText}</span>
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

            {/* Bottom Pagination & Progress Indicators */}
            {slides.length > 1 && (
                <div
                    className="absolute bottom-5 sm:bottom-6 inset-x-0 z-30 flex items-center justify-center gap-2"
                    aria-label={isArabic ? 'التحكم في البنرات' : 'Banner controls'}
                >
                    <div
                        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15"
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
                                    className={`relative transition-all duration-300 rounded-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] ${
                                        isActive
                                            ? 'w-8 sm:w-10 h-2 bg-white/25'
                                            : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                                    }`}
                                >
                                    {isActive && (
                                        <span
                                            key={`prog-${animKey}`}
                                            className={`absolute inset-y-0 start-0 bg-[#E5B54A] rounded-full ${
                                                isPaused ? 'hero-progress-fill-paused' : 'hero-progress-fill'
                                            }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default HeroCarousel;
