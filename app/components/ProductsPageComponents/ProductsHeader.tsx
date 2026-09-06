"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const ProductsHeader = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    return (
        <div className="mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B192C] dark:text-white tracking-tight">
                {isArabic ? "كتالوج المنتجات وتوريد الجملة" : "Wholesale Products Catalog"}
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-1">
                {isArabic
                    ? "استعرض جميع المنتجات والوكالات المتاحة للطلب الفوري المباشر بأسعار الجملة"
                    : "Browse all commercial agencies and products available for wholesale ordering"}
            </p>
        </div>
    );
};

export default ProductsHeader;
