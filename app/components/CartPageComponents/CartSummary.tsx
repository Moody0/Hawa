"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { ArrowRight, Headset, LockKeyhole, Truck } from 'lucide-react';

interface CartSummaryProps {
    subtotal: number;
    hasUnpricedItems?: boolean;
}

const CartSummary = ({ subtotal, hasUnpricedItems = false }: CartSummaryProps) => {
    const { t, dir, language } = useLanguage();
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isAr = language === 'ar';
    const isQuoteRequest = !customer || hasUnpricedItems || subtotal <= 0;

    return (
        <aside className="space-y-4 lg:sticky lg:top-24" aria-label={isAr ? 'ملخص السلة' : 'Cart summary'}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 dark:border-white/10 dark:bg-zinc-900">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-base font-extrabold text-[#0B192C] dark:text-white">
                        {isQuoteRequest ? (isAr ? 'ملخص طلب التوريد' : 'Supply Request Summary') : t('cart.orderSummary')}
                    </h2>
                    {isQuoteRequest && (
                        <span className="text-[10px] font-bold text-[#8A6305]">
                            {isAr ? 'للمراجعة' : 'For review'}
                        </span>
                    )}
                </div>

                <dl className="space-y-4 border-y border-slate-200 py-5 text-sm dark:border-white/10">
                    <div className="flex items-center justify-between gap-4">
                        <dt className="font-medium text-slate-600 dark:text-slate-400">{t('cart.subtotal')}</dt>
                        <dd className="text-end font-bold text-[#0B192C] dark:text-white">
                            {isQuoteRequest
                                ? (isAr ? 'يحدد بعد المراجعة' : 'Confirmed after review')
                                : <span dir="ltr">{formatPrice(subtotal)}</span>}
                        </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                            <Truck className="h-4 w-4" aria-hidden="true" />
                            {t('cart.shipping')}
                        </dt>
                        <dd className="max-w-[55%] text-end text-xs font-bold leading-relaxed text-[#8A6305]">
                            {isAr ? 'يؤكد حسب المنطقة والطلب' : 'Confirmed by area and order'}
                        </dd>
                    </div>
                </dl>

                <div className="flex items-end justify-between gap-4 py-5">
                    <span className="text-sm font-extrabold text-[#0B192C] dark:text-white">
                        {isQuoteRequest ? (isAr ? 'القيمة النهائية' : 'Final value') : t('cart.total')}
                    </span>
                    {isQuoteRequest ? (
                        <span className="text-end text-sm font-extrabold text-[#8A6305]">
                            {isAr ? 'بعد مراجعة الطلب' : 'After order review'}
                        </span>
                    ) : (
                        <span className="text-2xl font-extrabold leading-none text-[#0B192C] dark:text-white" dir="ltr">
                            {formatPrice(subtotal)}
                        </span>
                    )}
                </div>

                <div className="mb-5 border-s-2 border-[#8A6305] bg-[#F8FAFC] px-3.5 py-3 text-xs leading-relaxed text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    {isQuoteRequest ? (
                        <>
                            <span className="font-bold text-[#0B192C] dark:text-white">
                                {isAr ? 'هذه ليست دفعة نهائية.' : 'This is not a final charge.'}
                            </span>{' '}
                            {isAr
                                ? 'أكمل بيانات المحل وسيتواصل معك فريق المبيعات لتأكيد السعر والتوصيل والدفع.'
                                : 'Complete your store details and sales will confirm pricing, delivery, and payment.'}
                        </>
                    ) : (
                        isAr
                            ? 'راجع الكميات، ثم أكمل بيانات التوصيل لتأكيد الطلب.'
                            : 'Review quantities, then complete delivery details to confirm the order.'
                    )}
                </div>

                <Link
                    href="/place-order"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-5 text-sm font-bold text-white transition-colors hover:bg-[#8A6305] active:scale-[0.98] dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white"
                >
                    <span>
                        {isQuoteRequest
                            ? (isAr ? 'متابعة بيانات طلب التوريد' : 'Continue Supply Request')
                            : (isAr ? 'متابعة إتمام الطلب' : t('cart.proceedToCheckout'))}
                    </span>
                    <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} aria-hidden="true" />
                </Link>

                {!customer && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isAr ? 'لديك حساب معتمد؟' : 'Have an approved account?'}</span>
                        <Link href="/account/login" className="font-bold text-[#0B192C] underline underline-offset-2 hover:text-[#8A6305] dark:text-white">
                            {isAr ? 'سجل الدخول' : 'Sign in'}
                        </Link>
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
                <Headset className="h-4 w-4 shrink-0 text-[#8A6305]" aria-hidden="true" />
                <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('footer.contactUs')}</p>
                    <a
                        className="mt-0.5 inline-block text-xs font-bold text-[#0B192C] hover:text-[#8A6305] hover:underline dark:text-white"
                        href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('footer.helpCenter')}
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default CartSummary;
