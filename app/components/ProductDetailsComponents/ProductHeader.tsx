"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { getBrandDisplayName } from "@/lib/brand-display";

interface ProductHeaderProps {
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    brand?: {
        id?: string;
        name: string;
        nameEn?: string | null;
        slug: string;
    } | null;
    category?: {
        id?: string;
        name: string;
        slug: string;
    } | null;
    brandName?: string;
    categoryName?: string;
}

const ProductHeader = ({
    name,
    nameAr,
    nameEn,
    brand,
    category,
    brandName: fallbackBrandName,
    categoryName: fallbackCategoryName,
}: ProductHeaderProps) => {
    const { language, dir } = useLanguage();
    const isArabic = language === "ar";

    const brandName = brand ? getBrandDisplayName(brand, isArabic ? "ar" : "en") : fallbackBrandName || "";
    const categoryName = category?.name || fallbackCategoryName || "";
    const brandSlug = brand?.slug;
    const categorySlug = category?.slug;

    const rawDisplayName = isArabic
        ? (nameAr || name)
        : (nameEn || name || nameAr || "");

    // Clean redundant brand prefix if title starts with the brand name
    const cleanDisplayName = useMemo(() => {
        if (!brandName || !rawDisplayName) return rawDisplayName;
        const brandParts = brandName.split("-").map((s) => s.trim()).filter(Boolean);
        for (const part of brandParts) {
            const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`^${escaped}\\s+`, "i");
            if (regex.test(rawDisplayName)) {
                return rawDisplayName.replace(regex, "");
            }
        }
        return rawDisplayName;
    }, [rawDisplayName, brandName]);

    return (
        <div className={`mb-3 sm:mb-4 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            {/* Concept 01: Clean Typographic Agency & Category Eyebrow (No Icon Pills) */}
            {(brandName || categoryName) && (
                <div className="flex flex-wrap items-center gap-2.5 text-[13px] mb-2.5">
                    {brandName && (
                        brandSlug ? (
                            <Link
                                href={`/products?brand=${brandSlug}`}
                                className="font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4 transition-colors"
                            >
                                {isArabic ? `وكالة ${brandName} المعتمدة` : `${brandName} Official Agency`}
                            </Link>
                        ) : (
                            <span className="font-bold text-[#8A6305] dark:text-[#E5B54A]">
                                {isArabic ? `وكالة ${brandName} المعتمدة` : `${brandName} Official Agency`}
                            </span>
                        )
                    )}

                    {brandName && categoryName && (
                        <span className="text-slate-300 dark:text-slate-600 select-none" aria-hidden="true">·</span>
                    )}

                    {categoryName && (
                        categorySlug ? (
                            <Link
                                href={`/categories/${categorySlug}`}
                                className="font-medium text-slate-600 dark:text-slate-300 hover:text-[#0B192C] dark:hover:text-white hover:underline underline-offset-4 transition-colors"
                            >
                                {categoryName}
                            </Link>
                        ) : (
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                                {categoryName}
                            </span>
                        )
                    )}
                </div>
            )}

            {/* Main Clean Product Title */}
            <h1 className="text-[#0B192C] dark:text-white text-[24px] sm:text-[30px] lg:text-[34px] font-bold leading-[1.22] text-balance">
                {cleanDisplayName}
            </h1>
        </div>
    );
};

export default ProductHeader;
