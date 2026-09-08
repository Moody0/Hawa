"use client";

import Link from "next/link";
import React, { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { Grid, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryItem {
    id: string;
    name: string;
    nameEn?: string | null;
    slug: string;
    description: string | null;
    image: string | null;
}

interface CategorySelectorProps {
    categories: CategoryItem[];
    activeCategory?: { id: string; name: string; slug: string } | null;
    activeMainCategory?: { id: string; name: string; slug: string } | null;
    activeBrand?: { id: string; name: string; slug: string; image?: string | null } | null;
}

const CategorySelector = ({ 
    categories, 
    activeCategory = null, 
    activeMainCategory = null, 
    activeBrand = null 
}: CategorySelectorProps) => {
    const { t, dir, language } = useLanguage();
    const isArabic = language === 'ar';
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const isRtl = dir === 'rtl';
    const isAllActive = !activeCategory && !activeMainCategory;

    const allHref = activeBrand ? `/brands/${activeBrand.slug}` : "/products";
    const brandShortName = activeBrand ? activeBrand.name.split('-')[0].trim() : '';
    const allLabel = activeBrand 
        ? (isArabic ? `كافة منتجات ${brandShortName}` : `All ${brandShortName}`)
        : t("products.allProducts");

    const getCategoryHref = (cat: CategoryItem) => {
        if (activeBrand) {
            return `/categories/${cat.slug}`;
        }
        return `/departments/${cat.slug}`;
    };

    const updateArrowVisibility = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            
            const isScrollable = scrollWidth > clientWidth;
            if (!isScrollable) {
                setShowLeftArrow(false);
                setShowRightArrow(false);
                return;
            }

            const maxScroll = scrollWidth - clientWidth;
            const currentScroll = Math.abs(scrollLeft);

            if (isRtl) {
                setShowLeftArrow(currentScroll < maxScroll - 5);
                setShowRightArrow(currentScroll > 5);
            } else {
                setShowLeftArrow(currentScroll > 5);
                setShowRightArrow(currentScroll < maxScroll - 5);
            }
        }
    };

    useEffect(() => {
        updateArrowVisibility();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', updateArrowVisibility);
            window.addEventListener('resize', updateArrowVisibility);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', updateArrowVisibility);
            }
            window.removeEventListener('resize', updateArrowVisibility);
        };
    }, [categories, isRtl]);

    useEffect(() => {
        const activeSlug = activeMainCategory?.slug || activeCategory?.slug;
        if (activeSlug && scrollContainerRef.current) {
            const activeEl = document.getElementById(`category-item-${activeSlug}`);
            if (activeEl) {
                setTimeout(() => {
                    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }, 100);
            }
        }
    }, [activeCategory, activeMainCategory]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const distance = 300;
            const multiplier = direction === 'left' ? -1 : 1;
            scrollContainerRef.current.scrollBy({
                left: multiplier * distance * (isRtl ? -1 : 1),
                behavior: 'smooth'
            });
        }
    };

    // If on a brand page and brand has 0 subcategories, hide rail after hooks run
    if (activeBrand && (!categories || categories.length === 0)) {
        return null;
    }

    return (
        <div className="relative mb-6 group">
            {/* Scroll Left Arrow (Desktop) */}
            {showLeftArrow && (
                <button
                    type="button"
                    onClick={() => handleScroll('left')}
                    aria-label="Scroll left"
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-[#8A6305] hover:text-white hover:border-[#8A6305] dark:hover:bg-[#8A6305] dark:hover:text-white items-center justify-center transition-colors cursor-pointer z-20"
                >
                    <ChevronLeft className="text-xl" />
                </button>
            )}

            {/* Clean Pill-Style Category Filter Strip (No Placeholders) */}
            <div 
                ref={scrollContainerRef}
                className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar py-1 px-0.5 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* All Products Tab */}
                <Link
                    href={allHref}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 active:scale-95 whitespace-nowrap ${
                        isAllActive
                            ? 'bg-[#0B192C] dark:bg-[#8A6305] text-white font-bold'
                            : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-[#475569] dark:text-gray-300 hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:text-[#8A6305] hover:bg-[#FAF6EC]/60 dark:hover:bg-white/5'
                    }`}
                >
                    <Grid className={`text-base ${isAllActive ? 'text-[#8A6305] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{allLabel}</span>
                </Link>

                {/* Subcategory Pill Tabs */}
                {categories.map((category) => {
                    const isActive = activeMainCategory?.slug === category.slug || activeCategory?.slug === category.slug;
                    const displayName = isArabic ? category.name : (category.description || category.nameEn || category.name);
                    
                    return (
                        <Link
                            key={category.id}
                            id={`category-item-${category.slug}`}
                            href={getCategoryHref(category)}
                            className={`shrink-0 inline-flex items-center px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 active:scale-95 whitespace-nowrap ${
                                isActive
                                    ? 'bg-[#0B192C] dark:bg-[#8A6305] text-white font-bold'
                                    : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-[#475569] dark:text-gray-300 hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:text-[#8A6305] hover:bg-[#FAF6EC]/60 dark:hover:bg-white/5'
                            }`}
                        >
                            <span>{displayName}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Scroll Right Arrow (Desktop) */}
            {showRightArrow && (
                <button
                    type="button"
                    onClick={() => handleScroll('right')}
                    aria-label="Scroll right"
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-[#8A6305] hover:text-white hover:border-[#8A6305] dark:hover:bg-[#8A6305] dark:hover:text-white items-center justify-center transition-colors cursor-pointer z-20"
                >
                    <ChevronRight className="text-xl" />
                </button>
            )}
        </div>
    );
};

export default CategorySelector;
