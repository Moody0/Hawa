'use client';

import React from 'react';
import ResilientImage from '@/app/components/ResilientImage';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';

export interface ReviewItem {
    id: string;
    name: string;
    feedback: string;
    rating: number;
    image?: string;
    productNameAr?: string;
    productNameEn?: string;
    productSlug?: string;
}

const StarIcons = () => (
    <div className="flex text-[#8A6305] gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                <path d="M8 0.5L10.0784 5.63932L15.6085 6.02786L11.3629 9.59268L12.7023 14.9721L8 12.036L3.29772 14.9721L4.63706 9.59268L0.391548 6.02786L5.92159 5.63932L8 0.5Z" />
            </svg>
        ))}
    </div>
);

import { useProductRail } from '@/app/components/HomePageComponents/useProductRail';

interface Product {
    id: string;
    slug: string;
    name: string;
    images: string;
}

interface TestimonialsMasonryProps {
    reviews?: ReviewItem[];
    products?: Product[];
}

const TestimonialsMasonry = ({ reviews = [], products }: TestimonialsMasonryProps) => {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';
    const { railRef, progressBarRef } = useProductRail(isArabic ? 'rtl' : 'ltr');

    if (!reviews || reviews.length === 0) {
        return null;
    }

    return (
        <section className="w-full bg-white dark:bg-[#0B192C] py-6 md:py-8 border-t border-slate-200 dark:border-white/10">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-6 md:mb-8 border-b border-slate-200 dark:border-white/10 pb-4 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                                {isArabic ? 'تقييمات التجار والمحلات' : 'Merchant Endorsements'}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                            {isArabic ? 'ثقة أصحاب المحلات والسوبرماركت' : 'Verified Wholesale Buyer Reviews'}
                        </h2>
                    </div>
                </div>

                {/* Scroll Wrapper */}
                <div className="relative">
                    <div 
                        ref={railRef}
                        className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0 md:overflow-visible"
                    >
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory gap-4 pb-2 md:gap-5">
                            {reviews.map((review) => {
                                const productUrl = review.productSlug ? `/products/${review.productSlug}` : '/products';
                                const productImg = review.image || '/placeholder.svg';
                                const productName = isArabic 
                                    ? (review.productNameAr || review.productNameEn || 'منتجات شركة هوا') 
                                    : (review.productNameEn || review.productNameAr || 'Hawa Distribution Products');

                                return (
                                    <div 
                                        key={review.id} 
                                        className="w-[280px] shrink-0 snap-start md:w-auto bg-white dark:bg-[#132035] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between transition-all"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-[#0B192C] dark:text-white text-sm sm:text-base">
                                                        {isArabic 
                                                            ? review.name.split('-')[0].trim() 
                                                            : (review.name.split('-')[1]?.trim() || review.name.split('-')[0].trim())}
                                                    </h3>
                                                    <span className="text-[11px] text-[#16A34A] dark:text-[#4ade80] font-semibold mt-0.5 flex items-center gap-1">
                                                        <span>✓</span>
                                                        <span>{isArabic ? 'عميل جملة معتمد' : 'Verified Buyer'}</span>
                                                    </span>
                                                </div>
                                                <StarIcons />
                                            </div>

                                            <p className="text-[#475569] dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                                                "{review.feedback}"
                                            </p>
                                        </div>

                                        <Link 
                                            href={productUrl} 
                                            className="pt-3 border-t border-slate-100 dark:border-white/10 group flex items-center gap-3 hover:text-[#8A6305] transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 p-1 flex items-center justify-center">
                                                <ResilientImage
                                                    src={productImg}
                                                    alt=""
                                                    sizes="40px"
                                                    className="w-full h-full object-contain"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-[#0B192C] dark:text-slate-200 line-clamp-1 flex-1 group-hover:text-[#8A6305] transition-colors">
                                                {productName}
                                            </span>
                                            <span className={`text-[#475569] text-xs ${isArabic ? 'rotate-180' : ''}`}>→</span>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="mt-6 flex items-center gap-4 px-2 w-full md:hidden">
                    <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800 relative overflow-hidden rounded-full">
                        <div 
                            ref={progressBarRef}
                            className="absolute top-0 bottom-0 bg-[#8A6305] dark:bg-[#8A6305] rounded-full" 
                            style={{ 
                                width: '100%', 
                                transformOrigin: isArabic ? 'right center' : 'left center', 
                                transform: `scaleX(0)`, 
                                willChange: 'transform' 
                            }} 
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TestimonialsMasonry;
