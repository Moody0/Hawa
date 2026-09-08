"use client";

import React, { useRef } from "react";
import ProductCard from '@/app/components/ProductsPageComponents/ProductCard';
import { useLanguage } from "@/app/context/LanguageContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RelatedProductsProps {
    products: any[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
    const { t, language, dir } = useLanguage();
    const isArabic = dir === 'rtl' || language === 'ar';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swiperRef = useRef<any>(null);

    if (!products || products.length === 0) return null;

    return (
        <section className="mt-8 sm:mt-12 lg:mt-16 pt-7 sm:pt-9 border-t border-slate-200 dark:border-white/10" aria-labelledby="related-products-title">
            {/* Centered Section Header with Decorative Flanking Lines (Home Page Style) */}
            <div className="text-center mb-6 sm:mb-9">
                <div className="flex items-center justify-center gap-3.5 mb-2">
                    <span className="w-10 sm:w-16 h-[1.5px] bg-[#C28E2B] rounded-full shrink-0" aria-hidden="true" />
                    <h2 id="related-products-title" className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {t('products.relatedProducts')}
                    </h2>
                    <span className="w-10 sm:w-16 h-[1.5px] bg-[#C28E2B] rounded-full shrink-0" aria-hidden="true" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-normal">
                    {isArabic 
                        ? 'تشكيلة مختارة من الأصناف المماثلة قد تهمك' 
                        : 'Curated selection of similar products you might like'}
                </p>
            </div>

            {/* Swiper Slider with Left & Right Floating Circular Navigation Buttons in the Middle */}
            <div className="relative w-full px-1 sm:px-3">
                {products.length > 2 && (
                    <>
                        {/* Left Flank Button (<) - Hidden on mobile screens */}
                        <button
                            type="button"
                            onClick={() => {
                                if (isArabic) {
                                    swiperRef.current?.slideNext();
                                } else {
                                    swiperRef.current?.slidePrev();
                                }
                            }}
                            className="hidden md:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-slate-200/90 dark:border-white/15 bg-white dark:bg-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] items-center justify-center text-[#C28E2B] hover:text-[#966b15] hover:bg-[#FAF6EC] dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            aria-label={isArabic ? 'السابق' : 'Previous'}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Right Flank Button (>) - Hidden on mobile screens */}
                        <button
                            type="button"
                            onClick={() => {
                                if (isArabic) {
                                    swiperRef.current?.slidePrev();
                                } else {
                                    swiperRef.current?.slideNext();
                                }
                            }}
                            className="hidden md:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-slate-200/90 dark:border-white/15 bg-white dark:bg-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] items-center justify-center text-[#C28E2B] hover:text-[#966b15] hover:bg-[#FAF6EC] dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            aria-label={isArabic ? 'التالي' : 'Next'}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                <Swiper
                    key={isArabic ? 'rtl' : 'ltr'}
                    dir={isArabic ? 'rtl' : 'ltr'}
                    modules={[Navigation]}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    watchOverflow={true}
                    observer={true}
                    observeParents={true}
                    loop={products.length > 4}
                    spaceBetween={12}
                    slidesPerView={2}
                    breakpoints={{
                        480: { slidesPerView: 2, spaceBetween: 14 },
                        640: { slidesPerView: 3, spaceBetween: 16 },
                        1024: { slidesPerView: 4, spaceBetween: 20 },
                    }}
                    className="related-products-swiper !py-2 !px-1"
                >
                    {products.map((related) => (
                        <SwiperSlide key={related.id} className="h-auto">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <ProductCard product={related as any} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default RelatedProducts;
