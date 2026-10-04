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
}

interface HeroCarouselProps {
    banners?: Banner[];
}

// Rich, curated default wholesale slides highlighting Hawa's core capabilities

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

    // Use the configured banner copy as-is. Built-in slides are only for an empty banner list.
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

    const isDragging = useRef<boolean>(false);

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
                    goToNext();
                } else {
                    // Swiped Right
                    goToPrev();
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
            className="group/hero relative w-full overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B192C] focus:outline-hidden touch-pan-y"
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
                @media (prefers-reduced-motion: reduce) {
                    .hero-progress-fill,
                    .hero-progress-fill-paused { animation: none; width: 100%; }
                }
            `}</style>

            <div dir="ltr" className="relative grid h-[clamp(500px,72svh,620px)] grid-cols-1 md:h-auto md:min-h-[500px] lg:h-[520px] lg:min-h-0 lg:grid-cols-[58%_42%] xl:h-[560px] 2xl:h-[600px]">
                {/* Physical left: photography only with smooth crossfade */}
                <div className="absolute inset-0 h-full overflow-hidden bg-slate-100 md:relative md:inset-auto md:h-[330px] lg:h-full dark:bg-slate-900">
                    {slides.map((slide, index) => {
                        const isActive = index === currentIndex;
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
                                <Image
                                    src={slide.image}
                                    alt={isArabic ? (slide.titleAr || 'بنر الصفحة الرئيسية') : (slide.title || 'Hero banner')}
                                    fill
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                    unoptimized={slide.image.startsWith('/uploads/')}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1023px) 100vw, (max-width: 1536px) 58vw, 850px"
                                    className="object-cover object-center w-full h-full pointer-events-none"
                                />
                            </div>
                        );
                    })}

                    {/* A subtle mobile scrim keeps the hero text readable while preserving the photo. */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[38%] bg-gradient-to-t from-[#071522]/45 via-[#071522]/10 to-transparent md:hidden" aria-hidden="true" />

                    {/* Small progress marks keep slide navigation out of the CTA area. */}
                    <div dir={dir} className="absolute bottom-5 start-5 z-30 flex items-center gap-1.5 md:hidden" aria-label={isArabic ? 'التحكم في البنرات' : 'Banner controls'}>
                        <div dir={dir} className="flex items-center gap-1.5" role="tablist" aria-label={isArabic ? 'التنقل بين البنرات' : 'Banner navigation'}>
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
                                        className={`relative h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] ${
                                            isActive ? 'w-7 bg-white/70' : 'w-1.5 bg-white/65 hover:bg-white'
                                        }`}
                                    >
                                        {isActive && (
                                            <span
                                                key={`mobile-prog-${animKey}`}
                                                className={`absolute inset-y-0 start-0 rounded-full bg-[#E5B54A] ${
                                                    isPaused ? 'hero-progress-fill-paused' : 'hero-progress-fill'
                                                }`}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Physical right: clean HTML content panel with smooth crossfade */}
                <div dir={dir} className="absolute inset-x-0 bottom-0 z-20 flex items-end bg-transparent px-6 pb-10 pt-8 md:relative md:inset-auto md:min-h-[270px] md:items-center md:bg-white md:px-10 md:pb-14 md:pt-8 lg:min-h-0 lg:px-10 lg:pb-16 lg:pt-12 xl:px-14 dark:md:bg-[#0B192C]">
                    <div className="relative h-full min-h-[240px] w-full max-w-xl md:min-h-[260px] lg:min-h-[280px]">
                        {slides.map((slide, index) => {
                            const isActive = index === currentIndex;
                            const headline = parseHeadline(isArabic ? slide.titleAr : slide.title, isArabic);
                            const subtitleText = isArabic ? slide.subtitleAr : slide.subtitle;
                            const primaryButtonText = isArabic ? slide.buttonTextAr : slide.buttonText;
                            const secondaryButtonText = isArabic ? slide.secondaryButtonTextAr : slide.secondaryButtonText;
                            const secondaryLink = slide.secondaryLink || '/brands';

                            return (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 flex flex-col items-end justify-end text-start transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none md:items-center md:text-center lg:items-start lg:text-start ${
                                        isActive
                                            ? 'opacity-100 translate-y-0 z-10 pointer-events-auto'
                                            : 'opacity-0 translate-y-2 pointer-events-none z-0'
                                    }`}
                                    aria-hidden={!isActive}
                                >
                                    <h1 className="mx-0 max-w-[min(58vw,22rem)] text-[2rem] font-black leading-[1.08] tracking-tight text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_4px_12px_rgba(0,0,0,0.9)] md:mx-auto md:max-w-none md:text-4xl md:text-[#0B192C] md:[text-shadow:none] lg:mx-0 lg:text-[2.6rem] xl:text-5xl dark:text-white">
                                        <span className="block">{headline.part1}</span>
                                        {headline.part2 && (
                                            <span className="mt-1 block text-white md:text-[#A8750A] dark:md:text-[#E5B54A]">
                                                {headline.part2}
                                            </span>
                                        )}
                                    </h1>

                                    {subtitleText && (
                                        <p className="mx-0 mt-2 line-clamp-3 max-w-[min(62vw,25rem)] text-sm font-semibold leading-[1.55] text-white [text-shadow:0_1px_3px_rgba(0,0,0,1),0_2px_10px_rgba(0,0,0,0.95)] md:mx-auto md:mt-3 md:line-clamp-2 md:max-w-lg md:text-sm md:font-medium md:leading-relaxed md:text-slate-600 md:[text-shadow:none] lg:mx-0 lg:text-base dark:text-slate-300">
                                            {subtitleText}
                                        </p>
                                    )}

                                    <div className="mx-0 mt-4 grid w-fit max-w-full grid-cols-1 justify-items-start gap-2 md:mx-0 md:mt-6 md:w-auto md:max-w-none md:flex md:flex-wrap md:items-center md:justify-center md:gap-2.5 lg:justify-start">
                                            <Link
                                                href={slide.link}
                                                prefetch={false}
                                                tabIndex={isActive ? 0 : -1}
                                                className="group/btn inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg border border-[#B68012] bg-[#B68012] px-5 text-[13px] font-bold leading-tight text-white shadow-lg shadow-black/20 transition-colors hover:bg-[#946809] active:scale-[0.98] md:rounded-lg md:px-6 md:text-sm md:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305] focus-visible:ring-offset-2"
                                            >
                                                <span>{primaryButtonText}</span>
                                                <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:-translate-x-0.5 rtl:group-hover/btn:translate-x-0.5" aria-hidden="true" />
                                            </Link>

                                            {secondaryButtonText && (
                                                <Link
                                                    href={secondaryLink}
                                                    prefetch={false}
                                                    tabIndex={isActive ? 0 : -1}
                                                    target={secondaryLink.startsWith('http') ? '_blank' : undefined}
                                                    rel={secondaryLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/70 bg-[#0B192C]/75 px-4 text-xs font-bold leading-tight text-white transition-colors hover:bg-[#0B192C] active:scale-[0.98] md:rounded-lg md:border-[#0B192C] md:px-6 md:text-sm md:hover:bg-[#152841] dark:md:border-white dark:md:bg-white dark:md:text-[#0B192C] dark:md:hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071522] md:focus-visible:ring-[#8A6305] md:focus-visible:ring-offset-white"
                                                >
                                                    <span>{secondaryButtonText}</span>
                                                    {slide.secondaryIcon === 'whatsapp' ? (
                                                        <FaWhatsapp className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                    ) : (
                                                        <Building2 className="w-4 h-4" aria-hidden="true" />
                                                    )}
                                                </Link>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Circular Floating Left Arrow Button (Physically on left side with arrow pointing left) */}
            <button
                type="button"
                onClick={isArabic ? goToNext : goToPrev}
                aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
                className="absolute left-3 top-[145px] md:top-[165px] lg:top-1/2 -translate-y-1/2 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-xs transition-all duration-200 hover:bg-slate-100 active:scale-95 md:flex cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305] opacity-0 pointer-events-none group-hover/hero:opacity-100 group-hover/hero:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Circular Floating Right Arrow Button (Physically on right side with arrow pointing right) */}
            <button
                type="button"
                onClick={isArabic ? goToPrev : goToNext}
                aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
                className="absolute right-3 top-[145px] md:top-[165px] lg:top-1/2 -translate-y-1/2 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-xs transition-all duration-200 hover:bg-slate-100 active:scale-95 md:flex cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305] opacity-0 pointer-events-none group-hover/hero:opacity-100 group-hover/hero:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Desktop slide progress navigation */}
            <div className="absolute bottom-5 inset-x-0 z-30 hidden items-center justify-center gap-2.5 md:flex" aria-label={isArabic ? 'التحكم في البنرات' : 'Banner controls'}>
                <div className="flex items-center justify-center gap-2" role="tablist" aria-label={isArabic ? 'التنقل بين البنرات' : 'Banner navigation'}>
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
                                className={`relative transition-all duration-300 rounded-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305] ${
                                    isActive
                                        ? 'w-8 md:w-10 h-2 bg-slate-300 dark:bg-white/30 ring-1 ring-slate-400/50 dark:ring-white/40'
                                        : 'w-2 h-2 bg-slate-300 hover:bg-slate-400 dark:bg-white/30 dark:hover:bg-white/50'
                                }`}
                            >
                                {isActive && (
                                    <span
                                        key={`prog-${animKey}`}
                                        className={`absolute inset-y-0 start-0 bg-[#8A6305] dark:bg-[#E5B54A] rounded-full ${
                                            isPaused ? 'hero-progress-fill-paused' : 'hero-progress-fill'
                                        }`}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HeroCarousel;
