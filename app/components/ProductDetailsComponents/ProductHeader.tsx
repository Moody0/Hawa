"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

interface ProductHeaderProps {
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    brandName?: string;
    categoryName?: string;
}

const ProductHeader = ({ name, nameAr, nameEn, brandName, categoryName }: ProductHeaderProps) => {
    const { language } = useLanguage();

    const displayName = language === 'ar'
        ? (nameAr || name)
        : (nameEn || name || nameAr);

    return (
        <div className="mb-3">
            {/* Title */}
            <h1 
                className={`text-[#0B192C] dark:text-white text-2xl sm:text-3xl font-extrabold leading-tight mb-3 tracking-tight ${language === 'ar' ? 'text-right' : 'text-left'}`}
            >
                {displayName}
            </h1>

            {/* Brand and Category Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs font-semibold">
                {brandName && (
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full text-[#0B192C] dark:text-gray-200 w-fit">
                        <span className="text-[#475569] font-normal">{language === 'ar' ? 'البراند:' : 'Brand:'}</span>
                        <span>{brandName}</span>
                    </div>
                )}
                {categoryName && (
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full text-[#0B192C] dark:text-gray-200 w-fit">
                        <span className="text-[#475569] font-normal">{language === 'ar' ? 'القسم:' : 'Category:'}</span>
                        <span>{categoryName}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductHeader;
