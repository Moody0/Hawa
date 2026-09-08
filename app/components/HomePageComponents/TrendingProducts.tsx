'use client';

import React from 'react';
import ProductCard from '../ProductsPageComponents/ProductCard';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useLanguage } from '@/app/context/LanguageContext';
import { useProductRail } from './useProductRail';

interface Product {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    isTrending: boolean;
    stock: number;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null;
}

interface TrendingProductsProps {
    products: Product[];
}

const TrendingProducts = ({ products }: TrendingProductsProps) => {
    const { t, dir, language } = useLanguage();
    const { railRef, progressBarRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="container-custom py-8 md:py-10">
            <div className="w-full">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0B192C] dark:text-white">{t('home.trendingNow')}</h3>
                    <Link className="text-[#8A6305] hover:text-[#725204] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all" href="/products">
                        {t('common.viewAll')} <ChevronRight className={`text-sm ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </Link>
                </div>

                <div className="relative">
                    <div
                        ref={railRef}
                        className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0"
                    >
                    <div className="flex snap-x snap-mandatory gap-4 pb-2 md:gap-5">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="w-[180px] md:w-[calc((100%-40px)/3)] xl:w-[calc((100%-60px)/4)] 2xl:w-[calc((100%-80px)/5)] flex-none snap-start"
                            >
                                <ProductCard product={product} variant="compact" />
                            </div>
                        ))}
                        {/* Spacer to prevent cutoff of the last item on mobile */}
                        <div className="w-[1px] shrink-0 sm:hidden"></div>
                    </div>
                    </div>

                </div>
                
                {/* Bottom Navigation and Progress Bar */}
                <div className="mt-8 flex items-center gap-4 px-2 w-full">
                    {/* Previous Button (White -> Dark Hover) */}
                    <button
                        onClick={scrollBackward}
                        disabled={!canScrollBackward}
                        className="hidden md:flex w-12 h-12 shrink-0 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] disabled:opacity-50 disabled:cursor-not-allowed order-2 transition-all cursor-pointer shadow-2xs"
                        aria-label="Previous slide"
                    >
                        <svg className={`w-5 h-5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </button>
                    
                    {/* Progress Bar */}
                    <div className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-800 relative overflow-hidden rounded-full order-1">
                        <div 
                            ref={progressBarRef}
                            className="absolute top-0 bottom-0 bg-[#8A6305] rounded-full"
                            style={{ 
                                width: '100%',
                                transformOrigin: dir === 'rtl' ? 'right' : 'left',
                                transform: 'scaleX(0)'
                            }}
                        />
                    </div>

                    {/* Next Button (White -> Dark Hover) */}
                    <button
                        onClick={scrollForward}
                        disabled={!canScrollForward}
                        className="hidden md:flex w-12 h-12 shrink-0 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] disabled:opacity-50 disabled:cursor-not-allowed order-3 transition-all cursor-pointer shadow-2xs"
                        aria-label="Next slide"
                    >
                        <svg className={`w-5 h-5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;
