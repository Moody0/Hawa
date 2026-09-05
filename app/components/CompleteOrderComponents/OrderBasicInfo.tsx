"use client";

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';

interface OrderBasicInfoProps {
    orderId: string;
    totalAmount: number;
}

const OrderBasicInfo = ({ orderId, totalAmount }: OrderBasicInfoProps) => {
    const { t, language } = useLanguage();
    const { formatPrice } = useCurrency();

    return (
        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:ltr:text-left md:rtl:text-right bg-gray-50/50 dark:bg-zinc-800/40">
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('orderComplete.orderNumber')}</span>
                <p className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-[#8A6305] truncate"><span dir="ltr">#{orderId.slice(-8).toUpperCase()}</span></p>
            </div>
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('cart.total')}</span>
                <p className="text-base sm:text-lg font-extrabold text-[#2E7D32]">
                    {Number(totalAmount) > 0 ? (
                        <span dir="ltr">{formatPrice(Number(totalAmount))}</span>
                    ) : (
                        <span className="text-sm font-bold text-[#8A6305]">{language === 'ar' ? 'السعر يحدد حسب الوكالة' : 'Price on Inquiry'}</span>
                    )}
                </p>
            </div>
            <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{language === 'ar' ? 'التوصيل المتوقع' : 'Est. Delivery'}</span>
                <p className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white">{language === 'ar' ? '24 - 48 ساعة' : '24-48 hours'}</p>
            </div>
        </div>
    );
};

export default OrderBasicInfo;
