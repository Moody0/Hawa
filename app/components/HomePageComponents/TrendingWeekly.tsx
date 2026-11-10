'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductsPageComponents/ProductCard';

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
    hidePrice?: boolean;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
    brand?: {
        id: string;
        name: string;
        nameEn?: string | null;
        slug: string;
        group?: string;
    } | null;
}

interface TrendingWeeklyProps {
    products: Product[];
    settings?: any;
}

const TrendingWeekly = ({ products = [], settings }: TrendingWeeklyProps) => {
    const { dir } = useLanguage();
    const isArabic = dir === 'rtl';
    const [showAll, setShowAll] = useState(false);

    if (settings?.homeTrendingWeeklyEnabled === false || !products.length) {
        return null;
    }

    const titleText = isArabic
        ? (settings?.homeTrendingWeeklyTitleAr || settings?.homeTrendingWeeklyTitle || 'المنتجات الأكثر طلباً هذا الأسبوع')
        : (settings?.homeTrendingWeeklyTitle || settings?.homeTrendingWeeklyTitleAr || 'Fast-Moving Weekly Products');

    const descText = isArabic
        ? (settings?.homeTrendingWeeklyDescAr || settings?.homeTrendingWeeklyDesc || 'الأصناف الأكثر حركة وسحباً من قبل المحلات والسوبرماركت بأسعار تفضيلية')
        : (settings?.homeTrendingWeeklyDesc || settings?.homeTrendingWeeklyDescAr || 'Highest volume FMCG demands ordered by merchants this week');

    const displayProducts = products;
    const initialCount = 8;
    const visibleProducts = showAll ? displayProducts : displayProducts.slice(0, initialCount);

    return (
        <section className="container-custom py-8 md:py-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div className="text-start">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B192C] dark:text-white tracking-tight max-w-3xl">
                        {titleText}
                    </h2>
                    <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-[65ch] mt-1">
                        {descText}
                    </p>
                </div>

                <Link
                    href="/products"
                    prefetch={false}
                    className="inline-flex h-9 items-center gap-1.5 self-start sm:self-auto px-3.5 rounded-[10px] border border-[#0B192C]/[0.09] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white hover:border-[#C59329]/50 hover:text-[#8A6305] active:translate-y-px transition-colors shrink-0"
                >
                    <span>{isArabic ? 'عرض جميع المنتجات' : 'View All Products'}</span>
                    {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
            </div>

            {/* Unified Product Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        showBadge={false}
                    />
                ))}
            </div>

            {/* Show More / Less Toggle */}
            {displayProducts.length > initialCount && (
                <div className="flex items-center justify-center mt-8">
                    <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="px-5 py-2.5 bg-white hover:bg-[#FAF7F0] dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[#0B192C] dark:text-white border border-[#0B192C]/[0.09] dark:border-white/15 hover:border-[#C59329]/50 rounded-[10px] font-bold text-xs sm:text-sm transition-colors active:translate-y-px cursor-pointer"
                    >
                        {showAll
                            ? (isArabic ? 'عرض أقل' : 'Show Less')
                            : (isArabic ? `عرض المزيد (${displayProducts.length - initialCount}+)` : `Show More (${displayProducts.length - initialCount}+)`)}
                    </button>
                </div>
            )}
        </section>
    );
};

export default TrendingWeekly;
