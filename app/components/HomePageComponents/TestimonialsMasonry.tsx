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
        let raw: ReviewItem[] = reviews;
        if (settings?.homeTestimonialsItems) {
            try {
                const parsed = JSON.parse(settings.homeTestimonialsItems);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    raw = parsed as ReviewItem[];
                }
            } catch {}
        }
        return (raw || []).filter((r) => {
            const text = (r.feedback || '').trim().toLowerCase();
            if (!text || text.length < 6) return false;
            if (['تيست', 'تست', 'test', 'testing', 'تجربة'].includes(text)) return false;
            return true;
        });
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
        <section className="w-full py-8 md:py-12">
            <div className="container-custom">
                {/* Start-aligned Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                    <div className="text-start">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B192C] dark:text-white tracking-tight">
                            {titleText}
                        </h2>
                        <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-[65ch]">
                            {descText}
                        </p>
                    </div>
                    {allReviews.length > 3 && (
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                className="review-nav-prev inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/90 dark:border-white/15 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-50 active:translate-y-px transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                aria-label={isArabic ? 'التقييمات السابقة' : 'Previous reviews'}
                            >
                                {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            </button>
                            <button
                                type="button"
                                className="review-nav-next inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200/90 dark:border-white/15 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-50 active:translate-y-px transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                aria-label={isArabic ? 'التقييمات التالية' : 'Next reviews'}
                            >
                                {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Reviews Rail */}
                <div
                    className="relative w-full"
                    onFocusCapture={() => swiperRef.current?.autoplay?.stop()}
                    onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            swiperRef.current?.autoplay?.start();
                        }
                    }}
                >
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
                        spaceBetween={16}
                        slidesPerView={1.15}
                        breakpoints={{
                            640: { slidesPerView: 2, spaceBetween: 16 },
                            1024: { slidesPerView: 3, spaceBetween: 20 },
                            1280: { slidesPerView: 3, spaceBetween: 20 },
                        }}
                        className="reviews-slider-swiper"
                    >
                        {allReviews.map((review) => {
                            const productUrl = review.productSlug ? `/products/${review.productSlug}` : '/products';
                            const productImg = review.image || '/placeholder.svg';
                            const productName = isArabic
                                ? (review.productNameAr || review.productNameEn || 'منتجات شركة حوا')
                                : (review.productNameEn || review.productNameAr || 'Hawa Distribution Products');

                            return (
                                <SwiperSlide key={review.id} className="h-auto">
                                    <div className="h-full w-full bg-[#FAF7F0] dark:bg-[#132035] border border-slate-200/90 dark:border-white/10 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                <h3 className="font-bold text-[#0B192C] dark:text-white text-sm sm:text-base line-clamp-1">
                                                    {isArabic
                                                        ? review.name.split('-')[0].trim()
                                                        : (review.name.split('-')[1]?.trim() || review.name.split('-')[0].trim())}
                                                </h3>
                                                <StarIcons count={review.rating || 5} />
                                            </div>

                                            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-5 line-clamp-3">
                                                {review.feedback}
                                            </p>
                                        </div>

                                        <Link
                                            href={productUrl}
                                            className="pt-3.5 border-t border-slate-200/70 dark:border-white/10 group flex items-center gap-3 hover:text-[#8A6305] transition-colors mt-auto"
                                        >
                                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-white/10">
                                                <ResilientImage
                                                    src={productImg}
                                                    alt={productName}
                                                    sizes="44px"
                                                    className="w-full h-full object-contain p-1"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-[#0B192C] dark:text-slate-200 line-clamp-1 flex-1 group-hover:text-[#8A6305] transition-colors">
                                                {productName}
                                            </span>
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
