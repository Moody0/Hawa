'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useProductRail } from './useProductRail';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface RailCategory {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    image: string;
}

interface CategoriesRailProps {
    categories?: RailCategory[];
}

const CategoriesRail = ({ categories = [] }: CategoriesRailProps) => {
    const { dir, language } = useLanguage();
    const { railRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    const isRtl = dir === 'rtl';

    // Physically bind Left button (on the left edge) to scroll LEFT:
    const handleLeftScroll = isRtl ? scrollForward : scrollBackward;
    const isLeftDisabled = isRtl ? !canScrollForward : !canScrollBackward;

    // Physically bind Right button (on the right edge) to scroll RIGHT:
    const handleRightScroll = isRtl ? scrollBackward : scrollForward;
    const isRightDisabled = isRtl ? !canScrollBackward : !canScrollForward;

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="w-full bg-white dark:bg-[#121212] pt-2 pb-2 md:pt-3 md:pb-3 border-b border-gray-100 dark:border-white/5">
            <div className="container-custom">
                <div className="relative group">
                    <div
                        ref={railRef}
                        className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0"
                    >
                        <div className="flex snap-x snap-mandatory gap-6 md:gap-10 pb-2">
                            {categories.map((category, index) => (
                                <div key={category.id || category.slug}>
                                    <Link
                                        href={`/products?category=${category.slug}`}
                                        className="flex flex-col items-center gap-2 w-[100px] md:w-[120px] flex-none snap-start group/card"
                                    >
                                        <div className="w-[64px] h-[64px] md:w-[84px] md:h-[84px] rounded-full p-0.5 transition-all duration-300 border border-gray-200 dark:border-white/10 group-hover/card:border-[#8A6305] group-hover/card:ring-2 group-hover/card:ring-[#8A6305]/20 shrink-0">
                                            <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50 dark:bg-zinc-900">
                                                <Image
                                                    src={category.image}
                                                    alt={language === 'ar' ? category.nameAr : category.name}
                                                    fill
                                                    quality={60}
                                                    priority={index < 4}
                                                    sizes="(max-width: 768px) 60px, 80px"
                                                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                                />
                                            </div>
                                        </div>
                                        <h3 className="text-[15px] font-medium text-center text-[#0B192C] dark:text-gray-300 group-hover/card:text-[#8A6305] dark:group-hover/card:text-[#8A6305] transition-colors duration-200 flex items-center gap-1">
                                            <span>{language === 'ar' ? category.nameAr : category.name}</span>
                                            <svg 
                                                className={`w-3.5 h-3.5 opacity-0 -translate-x-1.5 group-hover/card:opacity-100 group-hover/card:translate-x-0 text-[#8A6305] transition-all duration-500 ease-out ${dir === 'rtl' ? 'rotate-180' : ''}`} 
                                                viewBox="0 0 20 20" 
                                                fill="none" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                            </svg>
                                        </h3>
                                    </Link>
                                </div>
                            ))}
                            {/* Spacer for mobile */}
                            <div className="w-[1px] shrink-0 sm:hidden"></div>
                        </div>
                    </div>

                    {/* Desktop Navigation Arrows */}
                    <button
                        onClick={handleLeftScroll}
                        disabled={isLeftDisabled}
                        className="hidden md:flex !absolute top-1/2 -translate-y-1/2 -left-5 z-20 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-[#8A6305] hover:text-white hover:border-[#8A6305] dark:hover:bg-[#8A6305] dark:hover:text-white items-center justify-center transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="text-2xl" />
                    </button>
                    
                    <button
                        onClick={handleRightScroll}
                        disabled={isRightDisabled}
                        className="hidden md:flex !absolute top-1/2 -translate-y-1/2 -right-5 z-20 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-[#8A6305] hover:text-white hover:border-[#8A6305] dark:hover:bg-[#8A6305] dark:hover:text-white items-center justify-center transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronRight className="text-2xl" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CategoriesRail;
