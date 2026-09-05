'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from '../ProductsPageComponents/ProductCard';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';

import { useLanguage } from '@/app/context/LanguageContext';
import { useProductRail } from './useProductRail';

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    options?: string | null;
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

interface TabData {
    key: string;
    labelKey: string;
    products: Product[];
}

interface FeaturedCollectionProps {
    newArrivals: Product[];
    bundles: Product[];
    bestSellers: Product[];
}

const CARD_WIDTH = 320;
const CARD_GAP = 20;

const FeaturedCollection = ({ newArrivals, bundles, bestSellers }: FeaturedCollectionProps) => {
    const { t, dir } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);

    const { railRef, progressBarRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    const tabs: TabData[] = useMemo(() => [
        { key: 'new-arrivals', labelKey: 'home.featuredTabNewArrivals', products: newArrivals },
        { key: 'best-sellers', labelKey: 'home.featuredTabBestSellers', products: bestSellers },
    ], [newArrivals, bestSellers]);

    const activeProducts = tabs[activeTab]?.products || [];

    React.useEffect(() => {
        if (railRef.current) {
            railRef.current.scrollTo({ left: 0, behavior: 'auto' });
        }
    }, [activeTab]);

    if (!newArrivals.length && !bundles.length && !bestSellers.length) {
        return null;
    }

    return (
        <section className="container-custom">
            <div 
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 border-b border-slate-200 dark:border-white/10 pb-4"
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                            {t('home.featuredCollection')}
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {t('home.featuredCollectionSubtitle') || (dir === 'rtl' ? 'المنتجات المميزة والأكثر طلباً' : 'Featured Wholesale Products')}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="tabs-nav overflow-x-auto scrollbar-hide" role="tablist">
                        <div className="flex md:justify-end gap-2">
                            {tabs.map((tab, index) => (
                                <button
                                    key={tab.key}
                                    role="tab"
                                    aria-selected={activeTab === index}
                                    onClick={() => setActiveTab(index)}
                                    className={`tabs__btn whitespace-nowrap px-4 py-2 text-xs sm:text-sm transition-all border-b-2 font-bold cursor-pointer ${activeTab === index
                                        ? 'border-[#0B192C] dark:border-white text-[#0B192C] dark:text-white'
                                        : 'border-transparent text-[#475569] hover:text-[#0B192C] dark:text-slate-400 dark:hover:text-slate-200 font-semibold'
                                        }`}
                                >
                                    {t(tab.labelKey)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Header Navigation Arrows for Desktop */}
                    <div className="hidden md:flex items-center gap-1.5 ms-2 border-s border-slate-200 dark:border-white/10 ps-3">
                        <button
                            onClick={scrollBackward}
                            disabled={!canScrollBackward}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                            aria-label="Previous slide"
                        >
                            <svg className={`w-4 h-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </button>
                        <button
                            onClick={scrollForward}
                            disabled={!canScrollForward}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                            aria-label="Next slide"
                        >
                            <svg className={`w-4 h-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={railRef}
                    className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0"
                >
                    <div className="flex snap-x snap-mandatory gap-4 pb-2 md:gap-5">
                        {activeProducts.map((product) => (
                            <div
                                key={product.id}
                                className="w-[180px] md:w-[calc((100%-40px)/3)] xl:w-[calc((100%-60px)/4)] 2xl:w-[calc((100%-80px)/5)] flex-none snap-start"
                            >
                                <ProductCard
                                    product={product}
                                    variant="compact"
                                    showBadge={activeTab === 0}
                                    badge={activeTab === 0 ? t('home.newArrival') : undefined}
                                />
                            </div>
                        ))}
                        {/* Spacer to prevent cutoff of the last item on mobile */}
                        <div className="w-[1px] shrink-0 sm:hidden"></div>
                    </div>
                </div>
                
                {/* Sleek Subdued Progress Bar */}
                <div className="mt-3 h-[2px] bg-slate-100 dark:bg-white/5 relative overflow-hidden rounded-full w-full">
                    <div 
                        ref={progressBarRef}
                        className="absolute top-0 bottom-0 bg-[#8A6305] dark:bg-[#8A6305] rounded-full transition-transform duration-150"
                        style={{ 
                            width: '100%',
                            transformOrigin: dir === 'rtl' ? 'right' : 'left',
                            transform: 'scaleX(0)'
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
