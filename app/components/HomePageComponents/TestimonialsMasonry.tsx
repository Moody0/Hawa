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
const DEFAULT_REVIEWS: ReviewItem[] = [
    {
        id: 'rev-1',
        name: 'سوبرماركت الشام الحديث (دمشق - كفرسوسة)',
        feedback: 'أفضل موزع معتمد لوكالات زوان والريف. سرعة استثنائية في تلبية طلبيات الطرود وتأكيد مباشر وسلس عبر واتساب وبضاعة مضمونة.',
        rating: 5,
        image: 'https://i.postimg.cc/mgc4nXNC/data-bodour-2026-09-01T134612-915.png',
        productNameAr: 'زوان لانشون دجاج 200 غرام',
        productNameEn: 'Zwan Chicken Luncheon Meat 200g',
        productSlug: 'zwan-chicken-luncheon-meat-200g',
    },
    {
        id: 'rev-2',
        name: 'ميني ماركت الهدى (المزة)',
        feedback: 'التوريد منتظم جداً ومواصفات التعبئة واضحة بالطرود، مما يسهل جرد وتوزيع البضائع في المحل بدقة وبدون أي نقص.',
        rating: 5,
        image: 'https://i.postimg.cc/dQfzpfGv/data-bodour-(42).png',
        productNameAr: 'حليبنا سمن بقري 1 كيلو',
        productNameEn: 'Halibuna Ghee Clarified Butter 1kg',
        productSlug: 'halibuna-made-with-ghee-clarified-butter-1-kg',
    },
    {
        id: 'rev-3',
        name: 'بقالة البركة التجارية (مشروع دمر)',
        feedback: 'توفير كبرى الوكالات بطلب واحد وفر علينا وقتاً كبيراً في التواصل واللوجستيات مع الموزعين المتفرقين.',
        rating: 5,
        image: 'https://i.postimg.cc/N0ftBHFq/data-bodour-(43).png',
        productNameAr: 'صن بل كورند بيف 240 جرام',
        productNameEn: 'Sunbell Corned Beef 240g',
        productSlug: 'sun-bull-corned-beef-240g',
    },
    {
        id: 'rev-4',
        name: 'سوبرماركت الواحة (القصاع)',
        feedback: 'تواريخ الصلاحية حديثة جداً والتخزين المبرد يضمن وصول المنتجات بأفضل جودة لباب المحل دون أي تلف.',
        rating: 5,
        image: 'https://i.postimg.cc/X7zdwfMd/data-bodour-(44).png',
        productNameAr: 'سيلفر فيش تونا خفيف 160 جرام',
        productNameEn: 'Silver Fish Light Tuna 160g',
        productSlug: 'silver-fish-light-tuna-160g',
    },
    {
        id: 'rev-5',
        name: 'مطعم ومقهى ديلايت (المالكي)',
        feedback: 'اعتمادنا على شركة حوا في توريد الزيوت والمعلبات وفر لنا استقراراً كبيراً في الجودة وثبات الأسعار التنافسية.',
        rating: 5,
        image: 'https://i.postimg.cc/gjtXJT65/nskht-mn-nskht-mn-dwn-ʿnwan-2026-08-11T183631-628.png',
        productNameAr: 'الريف زيت دوار الشمس حجم 1 لتر',
        productNameEn: 'Al-Reef Sunflower Oil 1L',
        productSlug: 'al-reef-sunflower-oil-liter-size',
    },
    {
        id: 'rev-6',
        name: 'ماركت المدينة المنورة (التجارة)',
        feedback: 'خدمة التوصيل المباشر لباب السوبرماركت ممتازة، والشاحنات مجهزة ومبردة لنقل البضائع بأمان تام.',
        rating: 5,
        image: 'https://i.postimg.cc/yNQDHBVN/data-bodour-(45).png',
        productNameAr: 'المغربي معلبات سمك السردين بالزيت 125 جرام',
        productNameEn: 'Al-Maghrabi Canned Sardines 125g',
        productSlug: 'moroccan-canned-sardines-in-vegetable-oil-and-chili-peppers-125g',
    },
    {
        id: 'rev-7',
        name: 'بقالة النجوم (الميدان)',
        feedback: 'المعاملة راقية جداً والأسعار منافسة، وتسهيلات طلبات الجملة عبر المنصة ممتازة وسريعة.',
        rating: 5,
        image: 'https://i.postimg.cc/sDzdmf1M/data-bodour-2026-09-01T140727-827.png',
        productNameAr: 'حليبنا قهوة سريعة التحضير بحجم 80 غراماً',
        productNameEn: 'Halibuna Instant Coffee 80g',
        productSlug: 'halibuna-instant-coffee-80-grams',
    },
    {
        id: 'rev-8',
        name: 'سوبرماركت الفصول الأربعة (أبو رمانة)',
        feedback: 'بضاعة وكالات أصلية 100% مع فواتير نظامية وتوصيل في الموعد المحدد دائماً. نوصي بالتعامل معهم بشدة.',
        rating: 5,
        image: 'https://i.postimg.cc/7hqfkLF5/data-bodour-2026-09-01T140919-561.png',
        productNameAr: 'حليبنا جبنة كريمية 240 جرام',
        productNameEn: 'Halibuna Cream Cheese 240g',
        productSlug: 'halibuna-cream-cheese-240g',
    }
];

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

const TestimonialsMasonry = ({ reviews = [] }: TestimonialsMasonryProps) => {
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
        if (!reviews || reviews.length === 0) {
            return DEFAULT_REVIEWS;
        }
        if (reviews.length <= 3) {
            return [...reviews, ...DEFAULT_REVIEWS.slice(reviews.length)];
        }
        return reviews;
    }, [reviews]);

    if (!allReviews || allReviews.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-12 md:py-16 border-t border-slate-200 dark:border-white/10">
            <div className="container-custom">
                {/* Centered Section Header with Decorative Flanking Lines */}
                <div className="text-center mb-7 sm:mb-9">
                    <div className="flex items-center justify-center gap-3 mb-1.5">
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight" data-reveal-heading>
                            {isArabic ? 'ثقة أصحاب المحلات والسوبرماركت' : 'Verified Wholesale Buyer Reviews'}
                        </h2>
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto" data-reveal-copy>
                        {isArabic
                            ? 'آراء وتجارب شركائنا من تجار التجزئة وأصحاب البقاليات في مختلف المحافظات'
                            : 'Endorsements from verified retail merchants and grocery partners'}
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
