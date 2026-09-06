'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import ResilientImage from '@/app/components/ResilientImage';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    price: number;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null;
}

interface TrendingWeeklyProps {
    products: Product[];
}

const TrendingWeekly = ({ products }: TrendingWeeklyProps) => {
    const { dir, language } = useLanguage();
    const isArabic = dir === 'rtl';
    const [showAll, setShowAll] = useState(false);
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isLockedForGuest = !customer;

    if (!products || products.length === 0) {
        return null;
    }

    const initialCount = 6;
    const visibleProducts = showAll ? products : products.slice(0, initialCount);

    const getFirstImage = (images: string) => {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? parsed[0] : images;
        } catch {
            return images.split(',')[0]?.trim() || images;
        }
    };

    return (
        <section className="container-custom py-2 md:py-4">
            {/* Header */}
            <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                            {isArabic ? 'حركة توريد سريعة' : 'High Volume Demand'}
                        </span>
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {isArabic ? 'المنتجات الأكثر طلباً هذا الأسبوع' : 'Fast-Moving Weekly Products'}
                    </h2>
                </div>

                <Link
                    href="/products"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] transition-colors whitespace-nowrap"
                >
                    <span>{isArabic ? 'كافة المنتجات' : 'View All'}</span>
                    <span className={`text-sm ${isArabic ? 'rotate-180' : ''}`}>→</span>
                </Link>
            </div>

            {/* Product Grid: 1 col on small mobile, 2 cols on tablet, 3 cols on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                <AnimatePresence initial={false}>
                    {visibleProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Link
                                href={`/products/${product.slug}`}
                                className="group flex items-center gap-3 bg-white dark:bg-[#132035] border border-slate-200/80 dark:border-white/10 hover:border-[#8A6305] dark:hover:border-[#8A6305] rounded-xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all duration-200 h-full"
                            >
                                {/* Product Image */}
                                <div className="w-[72px] h-[72px] sm:w-[76px] sm:h-[76px] shrink-0 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-1 flex items-center justify-center">
                                    <ResilientImage
                                        src={getFirstImage(product.images)}
                                        alt={product.name}
                                        sizes="76px"
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Info */}
                                <div className={`flex-1 min-w-0 ${isArabic ? 'text-right' : 'text-left'}`}>
                                    {product.brand && (
                                        <span className="text-[10px] font-bold text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider block truncate mb-0.5">
                                            {product.brand.name}
                                        </span>
                                    )}
                                    <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white truncate leading-snug group-hover:text-[#8A6305] transition-colors mb-1">
                                        {isArabic ? (product.nameAr || product.name) : (product.nameEn || product.name)}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2">
                                        {isLockedForGuest ? (
                                            <span className="text-[10px] sm:text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] flex items-center gap-1">
                                                <span>🔒</span>
                                                <span>{isArabic ? 'أسعار الجملة للتجار' : 'Wholesale (Login)'}</span>
                                            </span>
                                        ) : product.discountPrice ? (
                                            <>
                                                <span className="text-xs sm:text-sm font-black text-[#16A34A] dark:text-[#4ade80]">
                                                    {formatPrice(Number(product.discountPrice))}
                                                </span>
                                                <span className="text-[10px] text-slate-400 line-through">
                                                    {formatPrice(Number(product.price))}
                                                </span>
                                            </>
                                        ) : Number(product.price) > 0 ? (
                                            <span className="text-xs sm:text-sm font-black text-[#0B192C] dark:text-white">
                                                {formatPrice(Number(product.price))}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-[#8A6305] dark:text-[#E5B54A]">
                                                {isArabic ? 'سعر الجملة عند الطلب' : 'Wholesale on Inquiry'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0 text-slate-400 group-hover:text-[#8A6305] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all text-sm pe-1">
                                    <span className={isArabic ? 'rotate-180 inline-block' : 'inline-block'}>→</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More / Less Toggle Button */}
            {products.length > initialCount && (
                <div className="flex justify-center mt-4 sm:mt-5">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-5 py-1.5 bg-[#FAF6EC] hover:bg-[#8A6305] text-[#0B192C] hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-[#8A6305] dark:hover:text-white border border-[#8A6305]/30 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                        {showAll
                            ? (isArabic ? 'عرض أقل' : 'Show Less')
                            : (isArabic ? `عرض المزيد (${products.length - initialCount}+)` : `Show More (${products.length - initialCount}+)`)
                        }
                    </button>
                </div>
            )}
        </section>
    );
};

export default TrendingWeekly;
