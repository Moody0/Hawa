"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ResilientImage from '@/app/components/ResilientImage';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getCategoryBundleImage } from '@/lib/category-images';

interface Category {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
    image: string | null;
    href?: string;
    type?: 'category' | 'main-category';
}

interface StatItem {
    amount: number;
    suffixAr: string;
    suffixEn: string;
    labelAr: string;
    labelEn: string;
}

interface FeaturedCategoriesGridProps {
    categories: Category[];
    language?: 'en' | 'ar';
    dir?: 'rtl' | 'ltr';
    settings?: {
        homeCategoriesBadge?: string | null;
        homeCategoriesBadgeAr?: string | null;
        homeCategoriesTitle?: string | null;
        homeCategoriesTitleAr?: string | null;
        homeCategoriesDesc?: string | null;
        homeCategoriesDescAr?: string | null;
        homeCategoriesStats?: string | null;
    } | null;
}

const DEFAULT_STATS_DATA: StatItem[] = [
    {
        amount: 500,
        suffixAr: '+',
        suffixEn: '+',
        labelAr: 'صنف متوفر بالمستودعات',
        labelEn: 'Wholesale SKUs',
    },
    {
        amount: 8,
        suffixAr: '+',
        suffixEn: '+',
        labelAr: 'وكالات تجارية حصرية',
        labelEn: 'Exclusive Agencies',
    },
    {
        amount: 48,
        suffixAr: ' ساعة',
        suffixEn: 'h',
        labelAr: 'أقصى مدة للتفريغ والتسليم',
        labelEn: 'Max Delivery SLA',
    },
    {
        amount: 1500,
        suffixAr: '+',
        suffixEn: '+',
        labelAr: 'متجر وبقالية معتمدة',
        labelEn: 'Active Retail Stores',
    },
];

const FeaturedCategoriesGrid = ({ categories = [], language = 'ar', dir = 'rtl', settings }: FeaturedCategoriesGridProps) => {
    const isArabic = language === 'ar' || dir === 'rtl';
    const sectionRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const statsList: StatItem[] = useMemo(() => {
        if (settings?.homeCategoriesStats) {
            try {
                const parsed = JSON.parse(settings.homeCategoriesStats);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map((item: any) => ({
                        amount: Number(item.amount || 0),
                        suffixAr: item.suffixAr ?? '+',
                        suffixEn: item.suffixEn ?? '+',
                        labelAr: item.labelAr || '',
                        labelEn: item.labelEn || item.labelAr || '',
                    }));
                }
            } catch {
                // fallback to DEFAULT_STATS_DATA
            }
        }
        return DEFAULT_STATS_DATA;
    }, [settings?.homeCategoriesStats]);

    const badgeText = isArabic
        ? (settings?.homeCategoriesBadgeAr || 'تسوق حسب القسم')
        : (settings?.homeCategoriesBadge || 'Shop by category');

    const titleText = isArabic
        ? (settings?.homeCategoriesTitleAr || 'تصفح تشكيلة واسعة من الأصناف والمجموعات')
        : (settings?.homeCategoriesTitle || 'Browse Key Wholesale Categories');

    const descText = isArabic
        ? (settings?.homeCategoriesDescAr || 'توفير شامل لكافة احتياجات السوبرماركت ومحلات البقالة بطلب واحد')
        : (settings?.homeCategoriesDesc || 'Comprehensive supply for supermarkets and grocery stores in one order');

    useEffect(() => {
        if (!sectionRef.current) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const numberElements = sectionRef.current.querySelectorAll<HTMLElement>('[data-stat-number]');

        if (prefersReduced || typeof IntersectionObserver === 'undefined') {
            numberElements.forEach((el) => {
                const amount = Number(el.dataset.amount || 0);
                const suffix = el.dataset.suffix || '';
                el.textContent = `${amount.toLocaleString('en-US')}${suffix}`;
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement;
                        observer.unobserve(el);

                        const amount = Number(el.dataset.amount || 0);
                        const suffix = el.dataset.suffix || '';
                        const duration = 1000;
                        const startTime = performance.now();

                        const animate = (currentTime: number) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            // Ease out cubic
                            const easeOut = 1 - Math.pow(1 - progress, 3);
                            const currentVal = Math.round(easeOut * amount);
                            el.textContent = `${currentVal.toLocaleString('en-US')}${suffix}`;

                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            }
                        };

                        requestAnimationFrame(animate);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
        );

        numberElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [isArabic]);

    // تنظيف التصنيفات وتوحيد المفاهيم المتكررة (مثل تكرار معلبات من عدة وكالات أو عناية بالجسم والشعر)
    const cleanCategories = useMemo(() => {
        const seenConcepts = new Map<string, Category>();

        const normalizeKey = (name: string) => {
            return name
                .replace(/وال/g, 'و')
                .replace(/^ال/g, '')
                .replace(/[\s\-_]+/g, '')
                .toLowerCase()
                .trim();
        };

        for (const cat of categories) {
            if (!cat || !cat.id || !cat.name || cat.name.trim() === 'عام') continue;

            const key = normalizeKey(cat.name);
            if (!seenConcepts.has(key)) {
                seenConcepts.set(key, cat);
            } else {
                // Prioritize main department over sub-category for the same concept
                const existing = seenConcepts.get(key)!;
                if (existing.type !== 'main-category' && cat.type === 'main-category') {
                    seenConcepts.set(key, cat);
                }
            }
        }

        return Array.from(seenConcepts.values());
    }, [categories]);

    const updateScrollState = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;

        if (maxScroll <= 2) {
            setCanScrollPrev(false);
            setCanScrollNext(false);
            return;
        }

        const absScroll = Math.abs(scrollLeft);

        // At the start (prev direction has nowhere to go)
        const atStart = absScroll <= 5;
        // At the end (next direction has nowhere to go)
        const atEnd = absScroll >= maxScroll - 5;

        setCanScrollPrev(!atStart);
        setCanScrollNext(!atEnd);
    }, [setCanScrollNext, setCanScrollPrev]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            // Ensure carousel always starts at the initial beginning (0 in RTL)
            el.scrollLeft = 0;
        }
        updateScrollState();
        if (!el) return;

        const handleScrollEvent = () => {
            updateScrollState();
        };

        el.addEventListener('scroll', handleScrollEvent, { passive: true });
        window.addEventListener('resize', handleScrollEvent);

        const timer = setTimeout(updateScrollState, 300);

        return () => {
            el.removeEventListener('scroll', handleScrollEvent);
            window.removeEventListener('resize', handleScrollEvent);
            clearTimeout(timer);
        };
    }, [updateScrollState, cleanCategories.length]);

    const handleScroll = (direction: 'next' | 'prev') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 340;
        const multiplier = isArabic ? (direction === 'next' ? -1 : 1) : (direction === 'next' ? 1 : -1);
        scrollContainerRef.current.scrollBy({
            left: scrollAmount * multiplier,
            behavior: 'smooth',
        });
        setTimeout(updateScrollState, 350);
    };

    return (
        <section ref={sectionRef} className="container-custom py-12 md:py-16">
            {/* 1. Editorial, start-aligned section heading & View All button */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 md:mb-8">
                <div className="text-start">
                    <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-[#8A6305] dark:text-[#E5B54A] mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {badgeText}
                    </span>
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-black text-[#0B192C] dark:text-white tracking-tight max-w-5xl" data-reveal-heading>
                            {titleText}
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-2" data-reveal-copy>
                        {descText}
                    </p>
                </div>

                <Link
                    href="/categories"
                    prefetch={false}
                    className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:text-[#E5B54A] shadow-xs transition-all active:scale-95 shrink-0 group"
                >
                    <span>{isArabic ? 'عرض جميع الأقسام' : 'View All Categories'}</span>
                    {isArabic ? (
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    ) : (
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                </Link>
            </div>

            {/* 2. Lightweight commercial proof metrics */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8 md:grid-cols-4 md:gap-x-8 md:gap-y-0 md:mb-10">
                {statsList.map((stat, index) => {
                    const suffix = isArabic ? stat.suffixAr : stat.suffixEn;
                    const formatted = `${stat.amount.toLocaleString('en-US')}${suffix}`;
                    const label = isArabic ? stat.labelAr : stat.labelEn;

                    return (
                        <div
                            key={index}
                            data-reveal-item
                            className="flex min-h-[72px] flex-col justify-center border-s-[3px] border-[#B68012] ps-4 text-start sm:min-h-20"
                        >
                            <span
                                className="text-2xl sm:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight leading-none mb-1.5 inline-flex items-baseline"
                                dir={isArabic ? 'rtl' : 'ltr'}
                                data-stat-number
                                data-amount={stat.amount}
                                data-suffix={suffix}
                            >
                                {formatted}
                            </span>
                            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight">
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 3. Category discovery rail */}
            <div className="relative group/rail">
                {/* زر التنقل السابق - يختفي عند بداية الشريط */}
                {canScrollPrev && (
                    <button
                        onClick={() => handleScroll('prev')}
                        className="hidden md:flex absolute -start-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 items-center justify-center text-slate-700 dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] transition-colors cursor-pointer active:scale-95"
                        aria-label="Previous"
                    >
                        {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                )}

                {/* الحاوية المنزلقة للكروت */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1 pb-2 -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {cleanCategories.map((category) => {
                        const catImage = getCategoryBundleImage(category.name, category.slug, category.image);
                        const catHref = category.href || `/products?category=${encodeURIComponent(category.slug)}`;

                        return (
                            <Link
                                key={category.id}
                                href={catHref}
                                prefetch={false}
                                data-reveal-item
                                className="group flex-none w-[calc((100vw-3.5rem)/2)] min-w-[145px] max-w-[210px] md:w-[210px] snap-start flex flex-col rounded-xl bg-[#F1F2F4] dark:bg-zinc-800/70 border border-transparent hover:border-slate-300 dark:hover:border-zinc-600 overflow-hidden transition-colors duration-200"
                            >
                                {/* الصورة داخل حاوية متناسقة مع احتواء كامل ونظيف وبدون زووم */}
                                <div className="relative w-full aspect-square bg-[#F1F2F4] dark:bg-zinc-800/70 overflow-hidden flex items-center justify-center p-3 sm:p-4">
                                    {catImage && catImage !== '/placeholder.svg' ? (
                                        <ResilientImage
                                            src={catImage}
                                            alt={category.name}
                                            fill
                                            sizes="(max-width: 768px) 175px, 220px"
                                            className="w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="text-4xl">📦</span>
                                    )}
                                </div>

                                {/* اسم القسم بالأسفل بنفس خلفية الحاوية العلوية */}
                                <div className="min-h-12 px-3 py-2.5 text-start bg-[#F1F2F4] dark:bg-zinc-800/70">
                                    <h3 className="text-xs sm:text-sm md:text-base font-black text-[#0B192C] dark:text-white line-clamp-1 leading-snug text-start">
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* زر التنقل التالي - يختفي عند نهاية الشريط */}
                {canScrollNext && (
                    <button
                        onClick={() => handleScroll('next')}
                        className="hidden md:flex absolute -end-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 items-center justify-center text-slate-700 dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] transition-colors cursor-pointer active:scale-95"
                        aria-label="Next"
                    >
                        {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {/* Mobile View All Categories CTA */}
            <div className="flex justify-center mt-5 sm:hidden">
                <Link
                    href="/categories"
                    prefetch={false}
                    className="w-full text-center inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-zinc-800 text-xs font-bold text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] shadow-xs transition-all active:scale-95 group"
                >
                    <span>{isArabic ? 'عرض جميع الأقسام' : 'View All Categories'}</span>
                    {isArabic ? (
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    ) : (
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                </Link>
            </div>

        </section>
    );
};

export default FeaturedCategoriesGrid;
