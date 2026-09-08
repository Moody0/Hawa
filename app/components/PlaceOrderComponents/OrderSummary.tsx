"use client";

import React from 'react';
import { CartItem } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { CreditCard, Headset, Truck } from 'lucide-react';
import { getSafeImageUrl } from '@/lib/image-utils';
import { formatPackaging } from '@/lib/packaging';
import ResilientImage from '@/app/components/ResilientImage';

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    total: number;
    isQuoteRequest: boolean;
}

const OrderSummary = ({ items, subtotal, total, isQuoteRequest }: OrderSummaryProps) => {
    const { t, language } = useLanguage();
    const { formatPrice } = useCurrency();
    const isAr = language === 'ar';

    return (
        <aside className="space-y-4 lg:sticky lg:top-24" aria-label={isAr ? 'ملخص الطلب' : 'Order summary'}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 dark:border-white/10 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-[#0B192C] dark:text-white">
                        {isQuoteRequest
                            ? (isAr ? 'ملخص طلب التوريد' : 'Supply Request Summary')
                            : t('cart.orderSummary')}
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {items.length} {isAr ? 'منتج' : items.length === 1 ? 'item' : 'items'}
                    </span>
                </div>

                <div className="max-h-[34vh] divide-y divide-slate-200 overflow-y-auto border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
                    {items.map((item) => {
                        const itemKey = `${item.id}:${item.selectedOption || ''}`;
                        return (
                            <div key={itemKey} className="flex items-center gap-3 py-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-800">
                                    <ResilientImage
                                        src={getSafeImageUrl(item.image.split(',')[0])}
                                        alt={item.name}
                                        sizes="48px"
                                        className="object-contain p-1"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold text-[#0B192C] dark:text-white" title={item.name}>
                                        {item.name}
                                    </p>
                                    {item.selectedOption && (
                                        <span className="mt-0.5 inline-block text-[10px] font-bold text-[#8A6305]">
                                            {item.selectedOption}
                                        </span>
                                    )}
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                        {t('cart.quantity')}: {item.quantity} {formatPackaging(item.packaging, language, { short: true })}
                                    </p>
                                </div>
                                <div className="shrink-0 text-end">
                                    {isQuoteRequest ? (
                                        <span className="text-[10px] font-bold text-[#8A6305]">
                                            {isAr ? 'بعد المراجعة' : 'On review'}
                                        </span>
                                    ) : item.price > 0 ? (
                                        <span className="text-xs font-extrabold text-[#0B192C] dark:text-white" dir="ltr">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-[#8A6305]">
                                            {isAr ? 'عند الطلب' : 'On inquiry'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <p className="py-5 text-center text-xs text-slate-500">{t('cart.emptyCart')}</p>
                    )}
                </div>

                <dl className="space-y-3 border-b border-slate-200 py-4 text-xs dark:border-white/10">
                    <div className="flex items-center justify-between gap-4">
                        <dt className="font-medium text-slate-600 dark:text-slate-400">{t('cart.subtotal')}</dt>
                        <dd className="text-end font-bold text-[#0B192C] dark:text-white">
                            {isQuoteRequest
                                ? (isAr ? 'يحدد بعد المراجعة' : 'Confirmed after review')
                                : subtotal > 0
                                    ? <span dir="ltr">{formatPrice(subtotal)}</span>
                                    : (isAr ? 'يحدد حسب الوكالة' : 'Agency rate')}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <dt className="font-medium text-slate-600 dark:text-slate-400">{t('cart.shipping')}</dt>
                        <dd className="text-end font-bold text-[#8A6305]">
                            {isAr ? 'يؤكد حسب المنطقة والطلب' : 'Confirmed by area and order'}
                        </dd>
                    </div>
                </dl>

                <div className="grid grid-cols-1 divide-y divide-slate-200 py-1 dark:divide-white/10 xl:grid-cols-2 xl:divide-x xl:divide-y-0 xl:rtl:divide-x-reverse">
                    <div className="flex items-start gap-2.5 py-3 xl:pe-3">
                        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6305]" aria-hidden="true" />
                        <div>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{isAr ? 'التوصيل' : 'Delivery'}</p>
                            <p className="mt-0.5 text-xs font-bold text-[#0B192C] dark:text-white">
                                {isAr ? 'يُجدول بعد المراجعة' : 'Scheduled after review'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5 py-3 xl:ps-3">
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6305]" aria-hidden="true" />
                        <div>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                {isQuoteRequest ? (isAr ? 'ترتيبات الدفع' : 'Payment terms') : t('checkout.paymentMethod')}
                            </p>
                            <p className="mt-0.5 text-xs font-bold text-[#0B192C] dark:text-white">
                                {isQuoteRequest ? (isAr ? 'تؤكد مع قسم المبيعات' : 'Confirmed with sales') : t('checkout.cashOnDelivery')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
                    <span className="text-sm font-extrabold text-[#0B192C] dark:text-white">
                        {isQuoteRequest ? (isAr ? 'القيمة النهائية' : 'Final value') : t('cart.total')}
                    </span>
                    {isQuoteRequest ? (
                        <span className="text-end text-sm font-extrabold text-[#8A6305]">
                            {isAr ? 'تُحدد بعد مراجعة الطلب' : 'Confirmed after order review'}
                        </span>
                    ) : (
                        <span className="text-2xl font-extrabold leading-none text-[#0B192C] dark:text-white" dir="ltr">
                            {formatPrice(total)}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#0B192C] dark:border-white/10 dark:text-[#E5B54A]">
                    <Headset className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-bold text-[#0B192C] dark:text-white">{t('checkout.needAssistance')}</p>
                    <a
                        className="mt-0.5 text-xs font-medium text-slate-600 transition-colors hover:text-[#8A6305] hover:underline dark:text-slate-300"
                        href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('checkout.speakWithExpert')}
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default OrderSummary;
