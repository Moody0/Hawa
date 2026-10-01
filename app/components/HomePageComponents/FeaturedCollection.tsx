'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductsPageComponents/ProductCard';

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
    price: number | null;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    isTrending: boolean;
    stock: number;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
    hidePrice?: boolean;
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
    bundles?: Product[];
    bestSellers: Product[];
    settings?: {
        homeFeaturedBadge?: string | null;
        homeFeaturedBadgeAr?: string | null;
        homeFeaturedTitle?: string | null;
        homeFeaturedTitleAr?: string | null;
        homeFeaturedDesc?: string | null;
        homeFeaturedDescAr?: string | null;
    } | null;
}



const FeaturedCollection = ({ newArrivals = [], bundles: _bundles = [], bestSellers = [], settings }: FeaturedCollectionProps) => {
    const { t, dir } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);
    const isArabic = dir === 'rtl';

    const badgeText = isArabic
        ? (settings?.homeFeaturedBadgeAr || t('home.featuredCollectionBadge') || 'مختارات حوا')
        : (settings?.homeFeaturedBadge || t('home.featuredCollectionBadge') || 'Hawa Selections');

    const titleText = isArabic
        ? (settings?.homeFeaturedTitleAr || t('home.featuredCollectionSubtitle') || 'تشكيلة منتجات الجملة الأكثر طلباً')
        : (settings?.homeFeaturedTitle || t('home.featuredCollectionSubtitle') || 'Featured Wholesale & Fast-Moving Essentials');

    const descText = isArabic
        ? (settings?.homeFeaturedDescAr || t('home.featuredCollectionDesc') || 'تشكيلة مختارة من أفضل أصناف الوكالات المعتمدة ومواد الاستهلاك بأسعار الجملة المباشرة')
        : (settings?.homeFeaturedDesc || t('home.featuredCollectionDesc') || 'Curated wholesale selection across leading agencies and essentials at direct trade prices');

    const safeNewArrivals = newArrivals;
    const safeBestSellers = bestSellers;

    const { railRef, progressBarRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    const tabs: TabData[] = useMemo(() => [
        { key: 'best-sellers', labelKey: 'home.featuredTabBestSellers', products: safeBestSellers },
        { key: 'new-arrivals', labelKey: 'home.featuredTabNewArrivals', products: safeNewArrivals },
    ].filter(tab => tab.products.length > 0), [safeBestSellers, safeNewArrivals]);

    const activeProducts = tabs[Math.min(activeTab, Math.max(0, tabs.length - 1))]?.products || [];
    const isNewArrivalTab = tabs[Math.min(activeTab, Math.max(0, tabs.length - 1))]?.key === 'new-arrivals';

    React.useEffect(() => {
        if (railRef.current) {
            railRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
        }
    }, [activeTab, railRef]);

    if (!tabs.length) return null;

    return (
        <section className="container-custom py-12 md:py-16">
            {/* Editorial heading, tabs, and action button */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-3">
                    <div className="text-start">
                        <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-[#8A6305] dark:text-[#E5B54A] mb-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {badgeText}
                        </span>
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight max-w-3xl" data-reveal-heading>
                                {titleText}
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-2" data-reveal-copy>
                            {descText}
                        </p>
                    </div>

                    <Link
                        href="/products"
                        prefetch={false}
                        className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:text-[#E5B54A] shadow-xs transition-all active:scale-95 shrink-0 group"
                    >
                        <span>{isArabic ? 'عرض كافة المنتجات' : 'View All Products'}</span>
                        {isArabic ? (
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        ) : (
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        )}
                    </Link>
                </div>

                {/* Segmented tabs */}
                <div
                    role="tablist" aria-label={isArabic ? "تشكيلات المنتجات" : "Product collections"}
                    className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-2xs relative mt-1"
                >
                    {tabs.map((tab, index) => {
                        const isActive = Math.min(activeTab, tabs.length - 1) === index;
                        return (
                            <button
                                key={tab.key}
                                role="tab"
                                type="button"
                                aria-selected={isActive}
                                id={`featured-tab-${tab.key}`}
                                aria-controls="featured-products-panel"
                                tabIndex={isActive ? 0 : -1}
                                onKeyDown={(event) => {
                                    const step = event.key === "ArrowRight" ? (isArabic ? -1 : 1) : event.key === "ArrowLeft" ? (isArabic ? 1 : -1) : 0;
                                    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : step ? (index + step + tabs.length) % tabs.length : null;
                                    if (next !== null) { event.preventDefault(); setActiveTab(next); document.getElementById(`featured-tab-${tabs[next].key}`)?.focus(); }
                                }}
                                onClick={() => setActiveTab(index)}
                                className={`relative px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer z-10 select-none ${
                                    isActive
                                        ? 'text-[#0B192C] dark:text-white font-black'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="featuredActivePill"
                                        transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                                        className="absolute inset-0 bg-white dark:bg-[#0B192C] rounded-lg shadow-xs -z-10"
                                    />
                                )}
                                <span className="relative z-10">{t(tab.labelKey)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product Rail with Left & Right Side Navigation Buttons */}
            <div id="featured-products-panel" role="tabpanel" aria-labelledby={`featured-tab-${tabs[Math.min(activeTab, tabs.length - 1)].key}`} className="relative group/rail">
                {/* Previous Button (Left/Right depending on RTL) */}
                <button
                    type="button"
                    onClick={scrollBackward}
                    disabled={!canScrollBackward}
                    className="absolute -start-3 sm:-start-4 md:-start-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/15 shadow-md flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:border-[#8A6305] dark:hover:text-[#8A6305] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                    aria-label={isArabic ? 'المنتجات السابقة' : 'Previous products'}
                >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isArabic ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Next Button (Left/Right depending on RTL) */}
                <button
                    type="button"
                    onClick={scrollForward}
                    disabled={!canScrollForward}
                    className="absolute -end-3 sm:-end-4 md:-end-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/15 shadow-md flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:border-[#8A6305] dark:hover:text-[#8A6305] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                    aria-label={isArabic ? 'المنتجات التالية' : 'Next products'}
                >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isArabic ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Scrollable Rail */}
                <div
                    ref={railRef}
                    className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0 scroll-smooth"
                >
                    <motion.div
                        key={tabs[Math.min(activeTab, Math.max(0, tabs.length - 1))]?.key}
                        initial={{ opacity: 0.35 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex snap-x snap-mandatory gap-3 sm:gap-4 pb-2"
                    >
                        {activeProducts.map((product) => (
                            <div
                                key={product.id}
                                data-reveal-item
                                className="w-[195px] sm:w-[220px] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] flex-none snap-start"
                            >
                                <ProductCard
                                    product={product}
                                    variant="compact"
                                    showBadge={isNewArrivalTab}
                                    badge={isNewArrivalTab ? t('home.newArrival') : undefined}
                                />
                            </div>
                        ))}
                        <div className="w-[1px] shrink-0 sm:hidden" />
                    </motion.div>
                </div>

                {/* Minimal Progress Line */}
                <div hidden={activeProducts.length <= 4} className="mt-2 h-0.5 bg-slate-100 dark:bg-white/5 relative overflow-hidden rounded-full w-full">
                    <div
                        ref={progressBarRef}
                        className="absolute top-0 bottom-0 bg-[#8A6305] dark:bg-[#E5B54A] rounded-full transition-transform duration-150"
                        style={{
                            width: '100%',
                            transformOrigin: isArabic ? 'right' : 'left',
                            transform: 'scaleX(0)',
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
