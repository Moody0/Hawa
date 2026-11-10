"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ResilientImage from "@/app/components/ResilientImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getBrandDisplayName } from "@/lib/brand-display";
import { formatPackaging } from "@/lib/packaging";

import "swiper/css";
import "swiper/css/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RelatedProductsProps {
    products: any[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
    const { language, dir } = useLanguage();
    const isArabic = dir === "rtl" || language === "ar";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swiperRef = useRef<any>(null);

    if (!products || products.length === 0) return null;

    return (
        <section
            className="mt-10 sm:mt-14 lg:mt-16 pt-8 sm:pt-10 border-t border-[#0B192C]/[0.09] dark:border-white/10"
            aria-labelledby="related-products-title"
        >
            {/* Concept 01 Header: Clean Editorial Title + Desktop Capsule Controller */}
            <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
                <div>
                    <h2
                        id="related-products-title"
                        className="text-[20px] sm:text-[24px] font-bold text-[#0B192C] dark:text-white leading-tight"
                    >
                        {isArabic ? "أصناف ذات صلة من نفس القسم" : "Related Products in This Department"}
                    </h2>
                </div>

                {products.length > 2 && (
                    <div className="hidden sm:inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-zinc-900 border border-[#0B192C]/10 dark:border-white/15 shrink-0">
                        <button
                            type="button"
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="w-[34px] h-[34px] rounded-full inline-flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-[#0F2138] hover:text-white dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors cursor-pointer"
                            aria-label={isArabic ? "السابق" : "Previous"}
                        >
                            {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => swiperRef.current?.slideNext()}
                            className="w-[34px] h-[34px] rounded-full inline-flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-[#0F2138] hover:text-white dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors cursor-pointer"
                            aria-label={isArabic ? "التالي" : "Next"}
                        >
                            {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                        <Link
                            href="/products"
                            className="px-3.5 py-1 text-[12.5px] font-bold text-[#0B192C] dark:text-white hover:text-[#8A6305] dark:hover:text-[#E5B54A] border-s border-[#0B192C]/[0.08] dark:border-white/10 transition-colors"
                        >
                            {isArabic ? "كافة الأصناف ←" : "All Products →"}
                        </Link>
                    </div>
                )}
            </div>

            {/* Concept 01: Connected Architectural Track */}
            <div className="relative w-full bg-white dark:bg-zinc-900 border border-[#0B192C]/[0.09] dark:border-white/10 rounded-[18px] overflow-hidden">
                <Swiper
                    key={isArabic ? "rtl" : "ltr"}
                    dir={isArabic ? "rtl" : "ltr"}
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
                    spaceBetween={0}
                    slidesPerView={1.6}
                    breakpoints={{
                        480: { slidesPerView: 2, spaceBetween: 0 },
                        640: { slidesPerView: 2.6, spaceBetween: 0 },
                        768: { slidesPerView: 3, spaceBetween: 0 },
                        1024: { slidesPerView: 4, spaceBetween: 0 },
                    }}
                    className="related-products-swiper"
                >
                    {products.map((related) => {
                        const firstImage =
                            typeof related.images === "string"
                                ? related.images
                                      .split(",")
                                      .map((s: string) => s.trim())
                                      .filter(Boolean)[0] || ""
                                : Array.isArray(related.images)
                                  ? related.images[0] || ""
                                  : "";

                        const brandName = related.brand
                            ? getBrandDisplayName(related.brand, isArabic ? "ar" : "en")
                            : "";

                        const rawName = isArabic
                            ? related.nameAr || related.name || ""
                            : related.nameEn || related.name || related.nameAr || "";

                        const cleanName = (() => {
                            if (!brandName || !rawName) return rawName;
                            const parts = brandName
                                .split("-")
                                .map((s: string) => s.trim())
                                .filter(Boolean);
                            for (const part of parts) {
                                const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                const regex = new RegExp(`^${escaped}\\s+`, "i");
                                if (regex.test(rawName)) {
                                    return rawName.replace(regex, "");
                                }
                            }
                            return rawName;
                        })();

                        const unitLabel = formatPackaging(related.packaging, isArabic ? "ar" : "en");

                        return (
                            <SwiperSlide key={related.id} className="h-auto">
                                <Link
                                    href={`/products/${related.slug}`}
                                    prefetch={false}
                                    className="group/rel relative h-full min-h-[290px] sm:min-h-[320px] p-5 sm:p-6 border-e border-[#0B192C]/[0.08] dark:border-white/10 flex flex-col justify-between bg-white dark:bg-zinc-900 hover:bg-[#FAF7F0] dark:hover:bg-zinc-800/70 transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                >
                                    {/* Product Image Stage (Full-Size Square Container) */}
                                    <div className="relative w-full aspect-square bg-white dark:bg-zinc-800/80 border border-[#0B192C]/[0.07] dark:border-white/10 rounded-[14px] overflow-hidden flex items-center justify-center mb-3.5">
                                        {firstImage ? (
                                            <ResilientImage
                                                src={firstImage}
                                                alt={cleanName}
                                                showSkeleton={false}
                                                className="w-full h-full object-cover transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/rel:scale-[1.04]"
                                            />
                                        ) : null}
                                    </div>

                                    {/* Product Meta & Footer */}
                                    <div className="flex flex-col">
                                        {brandName && (
                                            <span className="text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] mb-1 truncate">
                                                {brandName}
                                            </span>
                                        )}
                                        <h3 className="text-[14.5px] font-bold text-[#0B192C] dark:text-white line-clamp-1 mb-3">
                                            {cleanName}
                                        </h3>
                                        <div className="pt-2.5 border-t border-[#0B192C]/[0.08] dark:border-white/10 flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400">
                                            <span>{isArabic ? `توريد بالـ${unitLabel}` : `Wholesale ${unitLabel}`}</span>
                                            <span className="font-bold text-[#0B192C] dark:text-white group-hover/rel:text-[#8A6305] dark:group-hover/rel:text-[#E5B54A] transition-colors">
                                                {isArabic ? "تصفح ←" : "View →"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Right-to-Left Sweep Underline */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-[#0F2138] dark:bg-[#E5B54A] scale-x-0 origin-left group-hover/rel:origin-right group-hover/rel:scale-x-100 transition-transform duration-320 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                    />
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </section>
    );
};

export default RelatedProducts;
