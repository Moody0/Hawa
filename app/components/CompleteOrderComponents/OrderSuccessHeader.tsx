"use client";

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { CheckCircle2 } from 'lucide-react';

interface OrderSuccessHeaderProps {
    isQuoteRequest?: boolean;
}

const OrderSuccessHeader = ({ isQuoteRequest = false }: OrderSuccessHeaderProps) => {
    const { t, language } = useLanguage();

    return (
        <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 sm:h-20 sm:w-20">
                <CheckCircle2 className="h-9 w-9 text-emerald-600 sm:h-11 sm:w-11" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B192C] dark:text-white mb-2">
                {isQuoteRequest
                    ? (language === 'ar' ? 'تم استلام طلب التوريد' : 'Supply request received')
                    : t('orderComplete.thankYou')}
            </h1>
            <p className="text-[#475569] dark:text-gray-400 text-sm sm:text-base font-medium">
                {isQuoteRequest
                    ? (language === 'ar'
                        ? 'سيتواصل معك فريق المبيعات خلال ساعات العمل لتأكيد التفاصيل'
                        : 'Our sales team will contact you during business hours to confirm the details')
                    : t('orderComplete.orderConfirmed')}
            </p>
        </div>
    );
};

export default OrderSuccessHeader;
