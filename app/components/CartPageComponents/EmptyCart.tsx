"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const EmptyCart = () => {
    const { t } = useLanguage();

    return (
        <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 lg:px-40 py-20 text-center">
            <h1 className="text-3xl font-extrabold mb-6 text-[#0B192C] dark:text-white tracking-tight">{t('cart.emptyCart')}</h1>
            <div className="flex justify-center">
                <Link href="/products" className="inline-block bg-[#0B192C] hover:bg-[#0F172A] text-white font-bold py-3.5 px-8 rounded-xl transition-all active:scale-[0.98]">
                    {t('cart.startShopping')}
                </Link>
            </div>
        </div>
    );
};

export default EmptyCart;
