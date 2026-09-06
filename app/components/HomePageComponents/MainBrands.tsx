'use client';

import React from 'react';
import Link from "next/link";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import ResilientImage from "@/app/components/ResilientImage";
import type { HomeBrand } from "@/lib/admin-actions";
import { useProductRail } from './useProductRail';

import { useLanguage } from "@/app/context/LanguageContext";

interface MainBrandsProps {
    brands: HomeBrand[];
}

const fallbackImage = "/logo.png";

export default function MainBrands({ brands }: MainBrandsProps) {
    const { t, dir } = useLanguage();
    const { railRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    if (!brands.length) return null;

    return (
        <section className="container-custom py-4 md:py-8">
            <div className="mb-6 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-main-light dark:text-text-main-dark flex items-center gap-2">
                        {t("brands.mainBrands") || "الماركات العالمية"}
                    </h2>
                </div>
                <Link className="flex items-center gap-1 text-sm font-medium text-primary" href="/brands">
                    {t("common.viewAll")} <MdChevronRight className={`text-sm ${dir === "rtl" ? "rotate-180" : ""}`} />
                </Link>
            </div>

            <div className="relative">
                <div 
                    ref={railRef}
                    className="overflow-x-auto px-2 scrollbar-hide"
                >
                    <div className="flex gap-3 md:gap-4 pb-2">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/products?brand=${brand.slug}`}
                                className="group flex flex-col items-center justify-between w-[140px] min-w-[140px] h-[150px] rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-white/5 md:w-[170px] md:min-w-[170px] md:h-[180px]"
                            >
                                <div className="flex-1 flex items-center justify-center w-full h-[80px] md:h-[100px]">
                                    <ResilientImage
                                        src={brand.image || fallbackImage}
                                        alt={brand.name}
                                        className="w-full h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-col items-center justify-end w-full mt-2">
                                    <p className="text-sm font-bold text-text-main-light transition-colors group-hover-underline-animated dark:text-white truncate w-full text-center">
                                        {brand.name}
                                    </p>
                                    <p className="text-xs font-medium text-[#475569] dark:text-gray-400 mt-1">
                                        {brand._count.products} {t("home.productsLabel") || "منتج"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {canScrollForward && (
                    <button
                        className="hidden md:flex absolute ltr:right-[-20px] rtl:left-[-20px] top-[75px] md:top-[90px] -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 text-text-main border border-gray-200 transition-all hover:bg-[#8A6305] hover:text-white hover:border-[#8A6305] dark:bg-surface-dark dark:border-white/10"
                        aria-label="Next"
                        onClick={scrollForward}
                        type="button"
                    >
                        {dir === 'rtl' ? <MdChevronLeft className="text-2xl" /> : <MdChevronRight className="text-2xl" />}
                    </button>
                )}
                {canScrollBackward && (
                    <button
                        className="hidden md:flex absolute ltr:left-[-20px] rtl:right-[-20px] top-[75px] md:top-[90px] -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/95 text-text-main border border-gray-200 transition-all hover:bg-[#8A6305] hover:text-white hover:border-[#8A6305] dark:bg-surface-dark dark:border-white/10"
                        aria-label="Previous"
                        onClick={scrollBackward}
                        type="button"
                    >
                        {dir === 'rtl' ? <MdChevronRight className="text-2xl" /> : <MdChevronLeft className="text-2xl" />}
                    </button>
                )}
            </div>
        </section>
    );
}


