'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
        <section className="container-custom py-8 md:py-12">
            {/* Start-aligned section header, segmented tabs, and rail controls */}
            <div className="mb-5 sm:mb-6">
                <div className="text-start mb-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B192C] dark:text-white tracking-tight max-w-3xl">
                        {titleText}
                    </h2>
                    <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-[65ch] mt-1">
                        {descText}
                    </p>
                </div>

                {/* Single Unified Row: Segmented Tabs on Start, View All + Arrows on End */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div
                        role="tablist"
                        aria-label={isArabic ? "تشكيلات المنتجات" : "Product collections"}
                        className="inline-flex items-center bg-white dark:bg-slate-800/80 p-1 rounded-[10px] border border-[#0B192C]/[0.09] dark:border-white/10"
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
                                    className={`px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-[7px] transition-colors duration-150 cursor-pointer select-none ${
                                        isActive
                                            ? 'bg-[#0F2138] text-white dark:bg-white dark:text-[#0B192C]'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-[#0B192C] dark:hover:text-white'
                                    }`}
                                >
                                    <span>{t(tab.labelKey)}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden md:flex items-center gap-1.5 me-1">
                            <button
                                type="button"
                                onClick={scrollBackward}
                                disabled={!canScrollBackward}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#0B192C]/[0.09] dark:border-white/15 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:border-[#C59329]/50 hover:text-[#8A6305] disabled:opacity-40 disabled:pointer-events-none active:translate-y-px transition-colors cursor-pointer"
                                aria-label={isArabic ? 'المنتجات السابقة' : 'Previous products'}
                            >
                                {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={scrollForward}
                                disabled={!canScrollForward}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#0B192C]/[0.09] dark:border-white/15 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:border-[#C59329]/50 hover:text-[#8A6305] disabled:opacity-40 disabled:pointer-events-none active:translate-y-px transition-colors cursor-pointer"
                                aria-label={isArabic ? 'المنتجات التالية' : 'Next products'}
                            >
                                {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>

                        <Link
                            href="/products"
                            prefetch={false}
                            className="inline-flex h-9 items-center gap-1.5 px-3.5 rounded-[10px] border border-[#0B192C]/[0.09] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white hover:border-[#C59329]/50 hover:text-[#8A6305] active:translate-y-px transition-colors shrink-0"
                        >
                            <span>{isArabic ? 'عرض كافة المنتجات' : 'View All Products'}</span>
                            {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Product Rail */}
            <div id="featured-products-panel" role="tabpanel" aria-labelledby={`featured-tab-${tabs[Math.min(activeTab, tabs.length - 1)].key}`} className="relative">
                <div
                    ref={railRef}
                    className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0 scroll-smooth"
                >
                    <div
                        key={tabs[Math.min(activeTab, Math.max(0, tabs.length - 1))]?.key}
                        className="flex snap-x snap-mandatory gap-3 sm:gap-4 pb-2"
                    >
                        {activeProducts.map((product) => (
                            <div
                                key={product.id}
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
                    </div>
                </div>

                {/* Minimal Progress Line */}
                <div hidden={activeProducts.length <= 4} className="mt-2 h-0.5 bg-slate-200/70 dark:bg-white/5 relative overflow-hidden rounded-full w-full">
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
