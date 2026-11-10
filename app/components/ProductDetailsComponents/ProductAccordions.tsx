"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatPackaging } from "@/lib/packaging";

interface ProductAccordionsProps {
    description?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    options?: string | null;
    productName?: string | null;
    brandName?: string | null;
    categoryName?: string | null;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
}

const ProductAccordions = ({
    description,
    descriptionAr,
    descriptionEn,
    options,
    productName,
    brandName,
    categoryName,
    packaging,
    itemsPerPackage,
}: ProductAccordionsProps) => {
    const { language } = useLanguage();
    const isRTL = language === "ar";

    const activeDescription = (
        isRTL
            ? descriptionAr || description
            : descriptionEn || description || descriptionAr
    )?.trim();

    // Extract size/volume from product title or options if present (e.g., 400 مل, 800 غ, 1 كغ)
    const sizeMatch = (productName || activeDescription || "").match(
        /(\d+(?:[.,]\d+)?\s*(?:مل|لتر|كغ|غ|غرام|جم|ml|L|kg|g|oz))/i
    );
    const extractedSize = sizeMatch ? sizeMatch[1] : options || null;

    const packagingLabel = formatPackaging(packaging, language);
    const itemsLabel = itemsPerPackage
        ? isRTL
            ? `${itemsPerPackage} عبوة داخل الـ${packagingLabel}`
            : `${itemsPerPackage} units per ${packagingLabel}`
        : isRTL
          ? `${packagingLabel} تجاري معتمد`
          : `Official wholesale ${packagingLabel}`;

    return (
        <div className="w-full">
            {/* Concept 01: 2x2 Architectural Specification Ledger */}
            <div className="grid grid-cols-2 border-b border-[#0B192C]/[0.09] dark:border-white/10">
                <div className="py-3.5 pe-4 border-b border-[#0B192C]/[0.09] dark:border-white/10 flex flex-col gap-1">
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                        {isRTL ? "العلامة التجارية" : "Brand / Agency"}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#0B192C] dark:text-white">
                        {brandName || (isRTL ? "وكالة حوا المعتمدة" : "Official Hawa Agency")}
                    </span>
                </div>

                <div className="py-3.5 ps-4 border-b border-s border-[#0B192C]/[0.09] dark:border-white/10 flex flex-col gap-1">
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                        {isRTL ? "القسم التجاري" : "Department"}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#0B192C] dark:text-white">
                        {categoryName || (isRTL ? "توريد الجملة" : "Wholesale Catalog")}
                    </span>
                </div>

                <div className="py-3.5 pe-4 flex flex-col gap-1">
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                        {isRTL ? "الحجم / الخيار" : "Net Size / Option"}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#0B192C] dark:text-white">
                        {extractedSize || (isRTL ? "عبوة قياسية أصلية" : "Standard Original Pack")}
                    </span>
                </div>

                <div className="py-3.5 ps-4 border-s border-[#0B192C]/[0.09] dark:border-white/10 flex flex-col gap-1">
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                        {isRTL ? "وحدة التوريد بالجملة" : "Wholesale Supply Unit"}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#0B192C] dark:text-white">
                        {itemsLabel}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductAccordions;
