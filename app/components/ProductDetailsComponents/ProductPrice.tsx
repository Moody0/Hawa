"use client";

import React from "react";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useLanguage } from "@/app/context/LanguageContext";

interface ProductPriceProps {
    price: string;
    discountPrice?: string | null;
    hidePrice?: boolean;
}

const ProductPrice = ({ price, discountPrice, hidePrice }: ProductPriceProps) => {
    const { formatPrice } = useCurrency();
    const { language } = useLanguage();

    const numPrice = Number(price);
    const numDiscount = discountPrice ? Number(discountPrice) : null;
    const hasDiscount = numDiscount !== null && numDiscount < numPrice;
    const discountPercentage = hasDiscount && numPrice > 0 ? Math.round((1 - numDiscount / numPrice) * 100) : 0;

    if (hidePrice || numPrice <= 0) {
        return (
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-3.5 py-2 rounded-xl shadow-2xs">
                    <span>🏷️</span>
                    <span>{language === 'ar' ? 'السعر يحدد حسب الوكالة (عند الطلب)' : 'Price on Inquiry (Official Agency Rate)'}</span>
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white leading-none" dir="ltr">
                    {formatPrice(hasDiscount ? numDiscount : numPrice)}
                </span>
                {hasDiscount && (
                    <s className="text-lg text-gray-400 font-medium leading-none" dir="ltr">
                        {formatPrice(numPrice)}
                    </s>
                )}
            </div>

            {hasDiscount && (
                <div>
                    <span className="bg-[#2E7D32] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center leading-none">
                        -{discountPercentage}% {language === 'ar' ? 'خصم' : 'OFF'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProductPrice;
