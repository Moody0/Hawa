"use client";

import React from "react";
import Link from "next/link";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { Store, Lock } from 'lucide-react';

interface ProductPriceProps {
    price: string;
    discountPrice?: string | null;
    hidePrice?: boolean;
}

const ProductPrice = ({ price, discountPrice, hidePrice }: ProductPriceProps) => {
    const { formatPrice } = useCurrency();
    const { language } = useLanguage();
    const { customer } = useCustomer();

    const isArabic = language === 'ar';
    const isLockedForGuest = !customer;

    if (isLockedForGuest) {
        return (
            <div className={`p-4 rounded-[10px] bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 mb-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                {/* Header: Lock Badge + Blurred Price Tease */}
                <div className="flex items-center justify-between gap-3 mb-2 pb-2.5 border-b border-slate-200/80 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-[6px] bg-[#FAF6EC] dark:bg-[#8A6305]/20 border border-[#8A6305]/30 flex items-center justify-center shrink-0">
                            <Lock className="w-3 h-3 text-[#8A6305]" />
                        </span>
                        <span className="text-xs font-bold text-[#0B192C] dark:text-white">
                            {isArabic ? "سعر الجملة المعتمد" : "Wholesale Merchant Price"}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-1 select-none">
                        <span className="text-base font-black text-slate-800 dark:text-slate-200 blur-[3px] opacity-60 tracking-wider">
                            88,500
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                            {isArabic ? "ل.س" : "SYP"}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {isArabic
                        ? "لحماية هوامش أرباح التجار المعتمدين، تظهر الأسعار الدقيقة بعد تسجيل الدخول بحساب تاجر."
                        : "To protect verified retailer profit margins, official pricing is visible upon merchant login."}
                </p>

                {/* Direct Action Buttons */}
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/account/login"
                        className="group inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#0B192C] hover:bg-[#8A6305] text-white font-bold text-xs transition-colors active:scale-95"
                    >
                        <Store className="w-3.5 h-3.5 text-[#8A6305] group-hover:text-white transition-colors" />
                        <span>{isArabic ? "تسجيل دخول التاجر" : "Merchant Login"}</span>
                    </Link>

                    <Link
                        href="/account/register"
                        className="text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4 py-1"
                    >
                        {isArabic ? "طلب فتح حساب تاجر جديد ←" : "Register Store Account →"}
                    </Link>
                </div>
            </div>
        );
    }

    const numPrice = Number(price);
    const numDiscount = discountPrice ? Number(discountPrice) : null;
    const hasDiscount = numDiscount !== null && numDiscount < numPrice;
    const discountPercentage = hasDiscount && numPrice > 0 ? Math.round((1 - numDiscount / numPrice) * 100) : 0;

    if (hidePrice || numPrice <= 0) {
        return (
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-3.5 py-2 rounded-[10px]">
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
                    <span className="bg-[#8A6305] text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center leading-none">
                        -{discountPercentage}% {language === 'ar' ? 'خصم' : 'OFF'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProductPrice;
