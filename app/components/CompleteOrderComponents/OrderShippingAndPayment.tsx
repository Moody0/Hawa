"use client";

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdLocalShipping, MdPayments } from 'react-icons/md';

interface OrderShippingAndPaymentProps {
    shopName?: string | null;
    name: string;
    streetAddress: string;
    city: string;
    phone: string;
    notes?: string | null;
}

const OrderShippingAndPayment = ({ shopName, name, streetAddress, city, phone, notes }: OrderShippingAndPaymentProps) => {
    const { t, language } = useLanguage();

    return (
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:ltr:text-left md:rtl:text-right">
            <div className="flex flex-col gap-3 items-center md:items-start">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#0B192C] dark:text-white">
                    <MdLocalShipping className="text-[#0B192C] dark:text-[#8A6305] text-lg" />
                    {t('orderComplete.shippingAddress')}
                </h3>
                <div className="text-[#475569] dark:text-gray-300 text-xs sm:text-sm leading-relaxed w-full space-y-1">
                    {shopName && (
                        <p className="font-extrabold text-sm text-[#0B192C] dark:text-[#8A6305] flex items-center justify-center md:justify-start gap-1.5">
                            <span>🏪</span> {shopName}
                        </p>
                    )}
                    <p className="font-semibold text-[#0B192C] dark:text-white">{name}</p>
                    <p>{streetAddress}</p>
                    <p>{city}</p>
                    <p><span dir="ltr">{phone}</span></p>
                    {notes && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 text-xs">
                            <span className="font-bold text-[#475569] dark:text-gray-400">{t('checkout.notes')}: </span>
                            <span className="text-gray-700 dark:text-gray-300 italic">{notes}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-3 items-center md:items-start">
                <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#0B192C] dark:text-white">
                    <MdPayments className="text-[#0B192C] dark:text-[#8A6305] text-lg" />
                    {t('checkout.paymentMethod')}
                </h3>
                <div className="flex flex-col gap-0.5 w-full">
                    <p className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">{t('checkout.cashOnDelivery')}</p>
                    <p className="text-xs text-gray-400">{language === 'ar' ? 'تسوية نقدية عند الاستلام بموجب فاتورة الوكالة الرسمية' : 'Settlement upon delivery per official agency invoice'}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderShippingAndPayment;
