"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
}

interface FeaturedCategoriesGridProps {
    categories: Category[];
    language?: 'en' | 'ar';
    dir?: 'rtl' | 'ltr';
}

const STATS_DATA = [
    {
        value: '500+',
        valueEn: '500+',
        amount: 500,
        suffixAr: '+',
        suffixEn: '+',
        labelAr: 'صنف متوفر بالمستودعات',
        labelEn: 'Wholesale SKUs',
    },
    {
        value: '8+',
        valueEn: '8+',
        amount: 8,
        suffixAr: '+',
        suffixEn: '+',
        labelAr: 'وكالات تجارية حصرية',
        labelEn: 'Exclusive Agencies',
    },
    {
        value: '48 ساعة',
        valueEn: '48h',
        amount: 48,
        suffixAr: ' ساعة',
        suffixEn: 'h',
        labelAr: 'أقصى مدة للتفريغ والتسليم',
        labelEn: 'Max Delivery SLA',
    },
    {
        value: '1,500+',
        valueEn: '1.5K+',
        amount: 1500,
        suffixAr: '+',
        suffixEn: '+',
        labelAr: 'متجر وبقالية معتمدة',
        labelEn: 'Active Retail Stores',
    },
];

const FeaturedCategoriesGrid = ({ categories = [], language = 'ar', dir = 'rtl' }: FeaturedCategoriesGridProps) => {
    const isArabic = language === 'ar' || dir === 'rtl';
    const sectionRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

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

    // تنظيف التكرارات وتوحيد المسميات
    const normalizedMap = new Map<string, Category>();
    categories.forEach((cat) => {
        if (!cat.name || cat.name.trim() === 'عام') return;
        const normalizedKey = cat.name.replace(/^ال/, '').replace(/\s+/g, '').trim();
        if (!normalizedMap.has(normalizedKey)) {
            normalizedMap.set(normalizedKey, cat);
        }
    });
    const cleanCategories = Array.from(normalizedMap.values());

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
        updateScrollState();
        const el = scrollContainerRef.current;
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
            {/* 1. Editorial, start-aligned section heading */}
            <div className="text-start mb-6 md:mb-8">
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-[#8A6305] dark:text-[#E5B54A] mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {isArabic ? 'تسوق حسب القسم' : 'Shop by category'}
                </span>
                <div>
                    <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-black text-[#0B192C] dark:text-white tracking-tight max-w-5xl" data-reveal-heading>
                        {isArabic
                            ? 'تصفح تشكيلة واسعة من الأصناف والمجموعات'
                            : 'Browse Key Wholesale Categories'}
                    </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-2" data-reveal-copy>
                    {isArabic
                        ? 'توفير شامل لكافة احتياجات السوبرماركت ومحلات البقالة بطلب واحد'
                        : 'Comprehensive supply for supermarkets and grocery stores in one order'}
                </p>
            </div>

            {/* 2. Lightweight commercial proof metrics */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8 md:grid-cols-4 md:gap-x-8 md:gap-y-0 md:mb-10">
                {STATS_DATA.map((stat, index) => (
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
                            data-suffix={isArabic ? stat.suffixAr : stat.suffixEn}
                        >
                            {isArabic ? stat.value : stat.valueEn}
                        </span>
                        <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight">
                            {isArabic ? stat.labelAr : stat.labelEn}
                        </span>
                    </div>
                ))}
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

                        return (
                            <Link
                                key={category.id}
                                href={`/products?category=${encodeURIComponent(category.slug)}`}
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

        </section>
    );
};

export default FeaturedCategoriesGrid;
