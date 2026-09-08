"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { ShieldCheck, Layers } from "lucide-react";

interface ProductHeaderProps {
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    brand?: {
        id?: string;
        name: string;
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

    const brandName = brand?.name || fallbackBrandName || "";
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
        <div className={`mb-2 sm:mb-3 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            {/* Eyebrow Agency & Department Strip */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {brandName && (
                    brandSlug ? (
                        <Link
                            href={`/products?brand=${brandSlug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/20 px-2.5 py-1 rounded-lg hover:bg-[#8A6305] hover:text-white dark:hover:bg-[#8A6305] dark:hover:text-white transition-colors"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{brandName}</span>
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/20 px-2.5 py-1 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{brandName}</span>
                        </span>
                    )
                )}

                {categoryName && (
                    categorySlug ? (
                        <Link
                            href={`/categories/${categorySlug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 px-2.5 py-1 rounded-lg hover:border-slate-400 transition-colors"
                        >
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{categoryName}</span>
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 px-2.5 py-1 rounded-lg">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{categoryName}</span>
                        </span>
                    )
                )}
            </div>

            {/* Main Clean Product Title */}
            <h1 className="text-[#0B192C] dark:text-white text-[1.35rem] sm:text-2xl lg:text-[1.7rem] xl:text-3xl font-extrabold leading-snug tracking-tight text-balance">
                {cleanDisplayName}
            </h1>
        </div>
    );
};

export default ProductHeader;
