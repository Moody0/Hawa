"use client";

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdCheckCircle } from 'react-icons/md';

const OrderSuccessHeader = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20 rounded-full flex items-center justify-center mb-5 relative">
                <div className="absolute inset-0 border-2 border-[#2E7D32]/30 rounded-full animate-ping opacity-75"></div>
                <MdCheckCircle className="text-[#2E7D32] text-5xl sm:text-6xl relative z-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B192C] dark:text-white mb-2">{t('orderComplete.thankYou')}</h1>
            <p className="text-[#475569] dark:text-gray-400 text-sm sm:text-base font-medium">{t('orderComplete.orderConfirmed')}</p>
        </div>
    );
};

export default OrderSuccessHeader;
