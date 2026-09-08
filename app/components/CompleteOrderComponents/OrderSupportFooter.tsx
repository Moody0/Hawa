"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';

const OrderSupportFooter = () => {
    const { t } = useLanguage();

    return (
        <>
            <div className="w-full mt-8">
                <Link
                    href="/products"
                    className="w-full bg-[#0B192C] hover:bg-[#0F172A] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                >
                    <span>{t('cart.continueShopping')}</span>
                    <ShoppingBag className="text-base text-[#8A6305]" />
                </Link>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2 text-center">
                <p className="text-xs text-[#475569]">
                    {t('checkout.needAssistance')}{' '}
                    <a
                        className="text-[#0B192C] dark:text-[#8A6305] font-bold hover:underline"
                        href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('footer.contactUs')}
                    </a>
                </p>
            </div>
        </>
    );
};

export default OrderSupportFooter;
