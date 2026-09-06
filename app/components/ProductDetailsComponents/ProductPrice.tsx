"use client";

import React from "react";
import Link from "next/link";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { MdStore, MdLock } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

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
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FAF6EC] via-amber-50/40 to-white dark:from-[#132035] dark:via-[#0B192C] dark:to-[#132035] border border-[#8A6305]/30 mb-4 shadow-xs">
                <div className="flex items-center gap-2 text-sm sm:text-base font-black text-[#0B192C] dark:text-white mb-1.5">
                    <MdLock className="text-base text-[#8A6305]" />
                    <span>{isArabic ? 'أسعار الجملة متاحة للتجار المسجلين فقط' : 'Wholesale prices for verified merchants only'}</span>
                </div>
                <p className="text-xs text-[#475569] dark:text-gray-300 leading-relaxed mb-3">
                    {isArabic
                        ? 'لحماية هوامش أرباح المتاجر، تظهر الأسعار الدقيقة بعد تسجيل دخول التجار. يمكنك تحديد الكمية المطلوبة وتثبيت طلبك مباشرة كضيف وسيتم تأكيد الأسعار الرسمية معك.'
                        : 'To protect retailer profit margins, official prices are visible upon merchant login. You can still order directly as a guest and prices will be confirmed with your order.'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/account/login"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B192C] hover:bg-[#1a2e4c] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white font-extrabold text-xs transition-all shadow-xs active:scale-95"
                    >
                        <MdStore className="text-sm" />
                        <span>{isArabic ? 'تسجيل دخول التاجر' : 'Merchant Login'}</span>
                    </Link>
                    <Link
                        href="/account/register"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/15 text-[#0B192C] dark:text-white border border-gray-200 dark:border-white/10 font-bold text-xs transition-all shadow-xs active:scale-95"
                    >
                        <span>{isArabic ? 'طلب فتح حساب تاجر' : 'Register Store'}</span>
                    </Link>
                    <a
                        href={`https://wa.me/963993443901?text=${encodeURIComponent(isArabic ? 'مرحباً مدير المبيعات بشركة حوا، أود الاستفسار عن أسعار الجملة واعتماد حساب تجاري للمحل.' : 'Hello Hawa Sales Manager, I would like to inquire about wholesale prices.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs"
                    >
                        <FaWhatsapp className="text-sm" />
                        <span>{isArabic ? 'واتساب المبيعات' : 'Sales WhatsApp'}</span>
                    </a>
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
                    <span className="bg-[#8A6305] text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center leading-none shadow-xs">
                        -{discountPercentage}% {language === 'ar' ? 'خصم' : 'OFF'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProductPrice;
