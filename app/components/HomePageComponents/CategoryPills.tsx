'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useProductRail } from './useProductRail';

import { Utensils, Fish, Snowflake, Coffee, Croissant, Sandwich } from 'lucide-react';

const CATEGORIES = [
    {
        id: 'pasta-grains',
        nameAr: 'المعكرونة والحبوب',
        nameEn: 'Pasta & Grains',
        slug: 'pasta-grains',
        icon: Utensils
    },
    {
        id: 'canned-fish',
        nameAr: 'التونة والأسماك المعلبة',
        nameEn: 'Canned Fish & Tuna',
        slug: 'canned-fish',
        icon: Fish
    },
    {
        id: 'sauces-condiments',
        nameAr: 'الصلصات والتوابل',
        nameEn: 'Sauces & Condiments',
        slug: 'sauces-condiments',
        icon: Sandwich
    },
    {
        id: 'frozen-foods',
        nameAr: 'المفرزات والبحريات',
        nameEn: 'Frozen Foods',
        slug: 'frozen-foods',
        icon: Snowflake
    },
    {
        id: 'coffee-hot-drinks',
        nameAr: 'القهوة والمشروبات',
        nameEn: 'Coffee & Beverages',
        slug: 'coffee-hot-drinks',
        icon: Coffee
    },
    {
        id: 'biscuits-sweets',
        nameAr: 'البسكويت والحلويات',
        nameEn: 'Biscuits & Sweets',
        slug: 'biscuits-sweets',
        icon: Croissant
    }
];

const CategoryPills = () => {
    const { dir, language } = useLanguage();
    const { railRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    return (
        <section className="container-custom py-10 md:py-16">
            <div className="flex flex-col items-center text-center mb-8 md:mb-12 max-w-3xl mx-auto px-4">
                <h2 className="text-2xl md:text-4xl font-bold text-[rgb(46,46,46)] dark:text-white leading-tight">
                    {language === 'ar'
                        ? 'شركتكم الموثوقة لتوزيع البضائع من أفضل الشركات العالمية'
                        : 'Your trusted partner for distributing goods from leading global brands'}
                </h2>
            </div>

            <div className="relative group/pills">
                {/* Previous Button */}
                <button
                    onClick={scrollBackward}
                    disabled={!canScrollBackward}
                    className="absolute top-1/2 -translate-y-1/2 -left-4 z-10 hidden md:flex w-10 h-10 shrink-0 rounded-full bg-white items-center justify-center text-[#000000] shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all hover:bg-[#f1f1f1] disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Previous categories"
                >
                    <svg className={`w-5 h-5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>

                <div
                    ref={railRef}
                    className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                    <div className={`flex items-center gap-3 w-max mx-auto md:justify-center min-w-full ${dir === 'rtl' ? 'flex-row' : 'flex-row'}`}>
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-gray-200 hover:border-primary/40 hover:bg-gray-50 text-[rgb(46,46,46)] rounded-full px-5 py-2.5 transition-all duration-300 shadow-xs"
                            >
                                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-primary">
                                    <category.icon size={20} />
                                </div>
                                <span className="font-semibold text-xs md:text-sm whitespace-nowrap">
                                    {language === 'ar' ? category.nameAr : category.nameEn}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={scrollForward}
                    disabled={!canScrollForward}
                    className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 hidden md:flex w-10 h-10 shrink-0 rounded-full bg-white items-center justify-center text-[#000000] shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all hover:bg-[#f1f1f1] disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Next categories"
                >
                    <svg className={`w-5 h-5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default CategoryPills;
