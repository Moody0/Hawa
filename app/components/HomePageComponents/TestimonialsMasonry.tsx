'use client';

import React from 'react';
import ResilientImage from '@/app/components/ResilientImage';
import { useLanguage } from '@/app/context/LanguageContext';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

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

const StarIcons = ({ count = 5 }: { count?: number }) => (
    <div className="flex text-[#C28E2B] gap-1 shrink-0" aria-label={`${count} out of 5 stars`}>
        {[...Array(count)].map((_, i) => (
            <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                <path d="M8 0.5L10.0784 5.63932L15.6085 6.02786L11.3629 9.59268L12.7023 14.9721L8 12.036L3.29772 14.9721L4.63706 9.59268L0.391548 6.02786L5.92159 5.63932L8 0.5Z" />
            </svg>
        ))}
    </div>
);

// Real products from Hawa's catalog with genuine slugs and direct image URLs

interface Product {
    id: string;
    slug: string;
    name: string;
    images: string;
}

interface TestimonialsMasonryProps {
    reviews?: ReviewItem[];
    products?: Product[];
    settings?: any;
}

const TestimonialsMasonry = ({ reviews = [], settings }: TestimonialsMasonryProps) => {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';
    const swiperRef = React.useRef<SwiperType | null>(null);

    React.useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncAutoplay = () => {
            const swiper = swiperRef.current;
            if (!swiper?.autoplay) return;
            if (document.hidden || motionQuery.matches) swiper.autoplay.stop();
            else swiper.autoplay.start();
        };
        document.addEventListener('visibilitychange', syncAutoplay);
        motionQuery.addEventListener('change', syncAutoplay);
        return () => {
            document.removeEventListener('visibilitychange', syncAutoplay);
            motionQuery.removeEventListener('change', syncAutoplay);
        };
    }, []);

    const allReviews = React.useMemo(() => {
        if (settings?.homeTestimonialsItems) {
            try {
                const parsed = JSON.parse(settings.homeTestimonialsItems);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed as ReviewItem[];
                }
            } catch {}
        }
        return reviews;
    }, [reviews, settings?.homeTestimonialsItems]);

    if (settings?.homeTestimonialsEnabled === false || !allReviews || allReviews.length === 0) {
        return null;
    }

    const titleText = isArabic
        ? (settings?.homeTestimonialsTitleAr || settings?.homeTestimonialsTitle || 'ثقة أصحاب المحلات والسوبرماركت')
        : (settings?.homeTestimonialsTitle || settings?.homeTestimonialsTitleAr || 'Verified Wholesale Buyer Reviews');

    const descText = isArabic
        ? (settings?.homeTestimonialsDescAr || settings?.homeTestimonialsDesc || 'آراء وتجارب شركائنا من تجار التجزئة وأصحاب البقاليات في مختلف المحافظات')
        : (settings?.homeTestimonialsDesc || settings?.homeTestimonialsDescAr || 'Endorsements from verified retail merchants and grocery partners');

    return (
        <section className="w-full py-12 md:py-16 border-t border-slate-200 dark:border-white/10">
            <div className="container-custom">
                {/* Centered Section Header with Decorative Flanking Lines */}
                <div className="text-center mb-7 sm:mb-9">
                    <div className="flex items-center justify-center gap-3 mb-1.5">
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight" data-reveal-heading>
                            {titleText}
                        </h2>
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto" data-reveal-copy>
                        {descText}
                    </p>
                </div>

                {/* Swiper Auto-Scroll Slider with Left & Right Side Navigation Buttons */}
                <div
                    className="relative w-full group/rail"
                    data-reveal-item
                    onFocusCapture={() => swiperRef.current?.autoplay?.stop()}
                    onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            swiperRef.current?.autoplay?.start();
                        }
                    }}
                >
                    {/* Previous Button on side flank - hidden on mobile screens */}
                    <button
                        type="button"
                        className="review-nav-prev absolute -start-3 sm:-start-4 md:-start-5 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:border-[#8A6305] dark:hover:text-[#8A6305] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                        aria-label={isArabic ? 'التقييمات السابقة' : 'Previous reviews'}
                    >
                        {isArabic ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>

                    {/* Next Button on side flank - hidden on mobile screens */}
                    <button
                        type="button"
                        className="review-nav-next absolute -end-3 sm:-end-4 md:-end-5 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:border-[#8A6305] dark:hover:text-[#8A6305] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                        aria-label={isArabic ? 'التقييمات التالية' : 'Next reviews'}
                    >
                        {isArabic ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>

                    <Swiper
                        modules={[Autoplay, Navigation]}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) swiper.autoplay.stop();
                        }}
                        navigation={{
                            prevEl: '.review-nav-prev',
                            nextEl: '.review-nav-next',
                        }}
                        autoplay={{
                            delay: 4500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        observer={true}
                        observeParents={true}
                        watchOverflow={true}
                        loop={allReviews.length > 3}
                        spaceBetween={14}
                        slidesPerView={1.15}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 16 },
                            1024: { slidesPerView: 3, spaceBetween: 20 },
                            1280: { slidesPerView: 3, spaceBetween: 20 },
                        }}
                        className="reviews-slider-swiper !py-2"
                    >
                        {allReviews.map((review) => {
                            const productUrl = review.productSlug ? `/products/${review.productSlug}` : '/products';
                            const productImg = review.image || '/placeholder.svg';
                            const productName = isArabic
                                ? (review.productNameAr || review.productNameEn || 'منتجات شركة حوا')
                                : (review.productNameEn || review.productNameAr || 'Hawa Distribution Products');

                            return (
                                <SwiperSlide key={review.id} className="h-auto">
                                    <div 
                                        className="h-full w-full bg-white dark:bg-[#132035] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:border-[#C28E2B]/60 shadow-2xs"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <h3 className="font-bold text-[#0B192C] dark:text-white text-sm sm:text-base line-clamp-1">
                                                        {isArabic 
                                                            ? review.name.split('-')[0].trim() 
                                                            : (review.name.split('-')[1]?.trim() || review.name.split('-')[0].trim())}
                                                    </h3>
                                                    <span className="text-[11px] text-[#16A34A] dark:text-[#4ade80] font-semibold mt-1 flex items-center gap-1">
                                                        <span>✓</span>
                                                        <span>{isArabic ? 'عميل جملة معتمد' : 'Verified Buyer'}</span>
                                                    </span>
                                                </div>
                                                <StarIcons count={review.rating || 5} />
                                            </div>

                                            <p className="text-[#475569] dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 min-h-[56px] line-clamp-3">
                                                "{review.feedback}"
                                            </p>
                                        </div>

                                        <Link 
                                            href={productUrl} 
                                            className="pt-3.5 border-t border-slate-100 dark:border-white/10 group flex items-center gap-3 hover:text-[#C28E2B] transition-colors mt-auto"
                                        >
                                            {/* Product image container - fully filled by object-cover image */}
                                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-white/10 shadow-2xs">
                                                <ResilientImage
                                                    src={productImg}
                                                    alt={productName}
                                                    sizes="56px"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-[#0B192C] dark:text-slate-200 line-clamp-1 flex-1 group-hover:text-[#C28E2B] transition-colors">
                                                {productName}
                                            </span>
                                            <span className={`text-[#475569] group-hover:text-[#C28E2B] text-xs transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 ${isArabic ? 'rotate-180' : ''}`}>→</span>
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsMasonry;
