"use client";

import React from 'react';
import { CartItem } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { MdPayments, MdRefresh, MdCheckCircle, MdSupportAgent } from 'react-icons/md';
import { getSafeImageUrl } from '@/lib/image-utils';
import { formatPackaging } from '@/lib/packaging';

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    total: number;
    loading: boolean;
}

const OrderSummary = ({ items, subtotal, total, loading }: OrderSummaryProps) => {
    const { t, language } = useLanguage();
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isLockedForGuest = !customer;

    return (
        <div className="sticky top-[150px] space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10">
                <h2 className="text-base font-extrabold mb-6 text-[#0B192C] dark:text-white uppercase tracking-wider">{t('cart.orderSummary')}</h2>
                
                {/* Items List */}
                <div className="space-y-3 mb-6 max-h-[35vh] overflow-y-auto ltr:pr-2 rtl:pl-2 custom-scrollbar">
                    {items.map((item) => {
                        const itemKey = `${item.id}:${item.selectedOption || ''}`;
                        return (
                            <div key={itemKey} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="relative w-12 h-12 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shrink-0">
                                    <img
                                        src={getSafeImageUrl(item.image.split(',')[0])}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-1"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate text-[#0B192C] dark:text-white" title={item.name}>{item.name}</p>
                                    {item.selectedOption && (
                                        <span className="inline-block text-[10px] font-bold text-[#8A6305] bg-[#8A6305]/10 border border-[#8A6305]/20 px-1.5 py-0.5 rounded">
                                            {item.selectedOption}
                                        </span>
                                    )}
                                    <p className="text-xs font-medium text-[#475569] dark:text-gray-400 mt-0.5">
                                        {t('cart.quantity')}: {item.quantity} {formatPackaging(item.packaging, language, { short: true })} • {isLockedForGuest ? (
                                            <span className="text-[#8A6305] font-bold">🔒 {language === 'ar' ? 'للتجار المسجلين' : 'Wholesale (Login)'}</span>
                                        ) : item.price > 0 ? (
                                            <span className="text-[#0B192C] dark:text-white font-extrabold" dir="ltr">{formatPrice(item.price)}</span>
                                        ) : (
                                            <span className="text-[#8A6305] font-bold">{language === 'ar' ? 'السعر عند الطلب' : 'On Inquiry'}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <p className="text-xs text-center py-4 text-gray-400">{t('cart.emptyCart')}</p>
                    )}
                </div>

                {/* Costs breakdown */}
                <div className="flex flex-col gap-3 mb-6 border-t border-b border-gray-200 dark:border-white/10 py-5">
                    <div className="flex justify-between text-[#475569] dark:text-gray-400 text-xs font-medium">
                        <span>{t('cart.subtotal')}</span>
                        {isLockedForGuest ? (
                            <span className="font-bold text-[#8A6305]">🔒 {language === 'ar' ? 'يحدد بعد مراجعة الطلب' : 'Priced upon Review'}</span>
                        ) : subtotal > 0 ? (
                            <span className="font-bold text-[#0B192C] dark:text-white" dir="ltr">{formatPrice(subtotal)}</span>
                        ) : (
                            <span className="font-bold text-[#8A6305]">{language === 'ar' ? 'يحدد حسب الوكالة' : 'Agency Rate'}</span>
                        )}
                    </div>
                    <div className="flex justify-between text-[#475569] dark:text-gray-400 text-xs font-medium">
                        <span>{t('cart.shipping')}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-xs">{t('cart.freeShipping')}</span>
                    </div>
                </div>

                {/* Payment Method Badge */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-xl p-4 mb-6 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('checkout.paymentMethod')}</span>
                        <MdPayments className="text-[#0B192C] dark:text-[#8A6305] text-base" />
                    </div>
                    <p className="text-xs font-extrabold text-[#0B192C] dark:text-white">{t('checkout.cashOnDelivery')}</p>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end mb-6">
                    <span className="text-base font-extrabold text-[#0B192C] dark:text-white uppercase tracking-wider">{t('cart.total')}</span>
                    {isLockedForGuest ? (
                        <span className="text-xs sm:text-sm font-extrabold text-[#8A6305]">🔒 {language === 'ar' ? 'يحدد بعد مراجعة الطلب' : 'Priced upon Review'}</span>
                    ) : total > 0 ? (
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white leading-none" dir="ltr">{formatPrice(total)}</span>
                    ) : (
                        <span className="text-sm sm:text-base font-extrabold text-[#8A6305]">{language === 'ar' ? 'يحدد حسب فواتير الوكالة' : 'Price on Inquiry'}</span>
                    )}
                </div>

                {/* Submit Order Button */}
                <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full bg-[#0B192C] hover:bg-[#8A6305] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-md dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white cursor-pointer"
                >
                    {loading ? (
                        <MdRefresh className="animate-spin text-xl" />
                    ) : (
                        <>
                            <span>{t('checkout.placeOrder')}</span>
                            <MdCheckCircle className="text-base" />
                        </>
                    )}
                </button>
                <p className="text-[10px] text-center text-gray-400 dark:text-slate-400 mt-4 uppercase tracking-widest font-bold">{t('checkout.secureCheckout')}</p>
            </div>

            {/* Assistance Box */}
            <div className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                    <MdSupportAgent className="text-[#0B192C] dark:text-[#8A6305] text-lg" />
                </div>
                <div>
                    <p className="text-xs font-bold text-[#0B192C] dark:text-white mb-0.5">{t('checkout.needAssistance')}</p>
                    <a
                        className="text-xs font-semibold text-[#475569] hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors hover:underline"
                        href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('checkout.speakWithExpert')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
