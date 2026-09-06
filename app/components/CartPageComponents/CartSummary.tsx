"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { MdArrowForward, MdLock } from 'react-icons/md';

interface CartSummaryProps {
    subtotal: number;
}

const CartSummary = ({ subtotal }: CartSummaryProps) => {
    const { t, dir, language } = useLanguage();
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isLockedForGuest = !customer;

    return (
        <div className="sticky top-[150px] space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10">
                <h2 className="text-base font-extrabold mb-6 text-[#0B192C] dark:text-white uppercase tracking-wider">{t('cart.orderSummary')}</h2>
                <div className="flex flex-col gap-3.5 mb-6 border-b border-gray-200 dark:border-white/10 pb-6">
                    <div className="flex justify-between text-[#475569] dark:text-gray-400 text-sm font-medium">
                        <span>{t('cart.subtotal')}</span>
                        {isLockedForGuest ? (
                            <span className="font-bold text-[#8A6305] text-xs">🔒 {language === 'ar' ? 'متاح للتجار المسجلين' : 'Merchants Only'}</span>
                        ) : subtotal > 0 ? (
                            <span className="font-bold text-[#0B192C] dark:text-white" dir="ltr">{formatPrice(subtotal)}</span>
                        ) : (
                            <span className="font-bold text-[#8A6305] text-xs">{language === 'ar' ? 'يحدد حسب الوكالة' : 'Agency Rate'}</span>
                        )}
                    </div>
                    <div className="flex justify-between text-[#475569] dark:text-gray-400 text-sm font-medium">
                        <span>{t('cart.shipping')}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs">{t('cart.freeShipping')}</span>
                    </div>
                </div>
                <div className="flex justify-between items-end mb-6">
                    <span className="text-base font-extrabold text-[#0B192C] dark:text-white uppercase tracking-wider">{t('cart.total')}</span>
                    {isLockedForGuest ? (
                        <span className="text-xs sm:text-sm font-extrabold text-[#8A6305]">🔒 {language === 'ar' ? 'يحدد بعد مراجعة الطلب' : 'Priced upon Review'}</span>
                    ) : subtotal > 0 ? (
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white leading-none" dir="ltr">{formatPrice(subtotal)}</span>
                    ) : (
                        <span className="text-sm sm:text-base font-extrabold text-[#8A6305]">{language === 'ar' ? 'يحدد حسب فواتير الوكالة' : 'Price on Inquiry'}</span>
                    )}
                </div>

                {isLockedForGuest ? (
                    <div className="mb-5 p-3.5 rounded-xl bg-[#FAF6EC] dark:bg-zinc-800/80 border border-[#8A6305]/25 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        🔒 <span className="font-bold text-[#0B192C] dark:text-white">
                            {language === 'ar' ? 'ملاحظة التسعير:' : 'Pricing Notice:'}
                        </span>{' '}
                        {language === 'ar'
                            ? 'يمكنك إتمام الطلب مباشرة كضيف؛ سيتم تسعير الطلبية رسمياً والتواصل معكم من إدارة المبيعات.'
                            : 'You can complete your order as a guest; wholesale prices will be confirmed with you by sales.'}
                    </div>
                ) : subtotal <= 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-[#FAF6EC] dark:bg-zinc-800/80 border border-[#8A6305]/20 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        🏷️ <span className="font-bold text-[#0B192C] dark:text-[#8A6305]">
                            {language === 'ar' ? 'ملاحظة التسعير بالجملة:' : 'Wholesale Pricing Notice:'}
                        </span>{' '}
                        {language === 'ar'
                            ? 'الأسعار الرسمية المعتمدة تثبت على الفاتورة الورقية عند التسليم وفق لائحة أسعار الوكالة اليومية.'
                            : 'Official agency prices will be confirmed on your paper invoice upon delivery.'}
                    </div>
                )}

                <Link href="/place-order" className="w-full bg-[#0B192C] hover:bg-[#8A6305] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm shadow-md dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white">
                    <span>{language === 'ar' ? 'متابعة إتمام الطلب' : t('cart.proceedToCheckout')}</span>
                    <MdArrowForward className={`text-base ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </Link>

            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-gray-200 dark:border-white/10 text-center">
                <p className="text-xs font-medium text-[#475569] dark:text-gray-400">{t('footer.contactUs')}</p>
                <a 
                    className="text-xs font-bold text-[#0B192C] dark:text-[#8A6305] mt-1 inline-block hover:underline" 
                    href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t('footer.helpCenter')}
                </a>
            </div>
        </div>
    );
};

export default CartSummary;
