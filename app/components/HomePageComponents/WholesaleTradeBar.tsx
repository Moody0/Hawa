'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
    MdVerifiedUser, 
    MdLocalShipping, 
    MdReceiptLong, 
    MdChat
} from 'react-icons/md';

interface WholesaleTradeBarProps {
    stats?: {
        deliveries?: string | null;
        brands?: string | null;
        products?: string | null;
        clients?: string | null;
    };
}

export default function WholesaleTradeBar({ stats }: WholesaleTradeBarProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar' || dir === 'rtl';

    const items = [
        {
            icon: MdVerifiedUser,
            title: isArabic ? 'وكالات تجارية مباشرة' : 'Direct Agency Concessions',
            desc: isArabic ? 'استيراد وتوزيع حصري لأقوى العلامات الغذائية' : 'Exclusive wholesale concession for leading FMCG brands',
            badge: stats?.brands ? `${stats.brands} ${isArabic ? 'علامة' : 'Brands'}` : (isArabic ? 'معتمد' : 'Verified'),
        },
        {
            icon: MdLocalShipping,
            title: isArabic ? 'أسطول توريد منتظم' : 'Scheduled Fleet Logistics',
            desc: isArabic ? 'تغطية دورية لمحلات السوبرماركت والتجزئة' : 'Scheduled delivery runs across supermarkets & groceries',
            badge: stats?.deliveries ? `${stats.deliveries} ${isArabic ? 'رحلة' : 'Runs'}` : (isArabic ? 'يومي' : 'Daily'),
        },
        {
            icon: MdReceiptLong,
            title: isArabic ? 'أسعار جملة وفواتير نظامية' : 'Wholesale Carton Pricing',
            desc: isArabic ? 'بيع بالطرود مع لوائح تسعير وفواتير معتمدة' : 'Carton-level bulk pricing with official stamped invoices',
            badge: isArabic ? 'نظام طرود' : 'Carton Spec',
        },
        {
            icon: MdChat,
            title: isArabic ? 'استجابة وتجهيز فوري' : 'Direct WhatsApp Orders',
            desc: isArabic ? 'استقبال وتجهيز طلبيات المحلات عبر واتساب' : 'Direct merchant ordering and rapid order fulfillment',
            badge: isArabic ? 'فوري' : 'Instant',
        },
    ];

    return (
        <section className="w-full border-y border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="container-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-slate-200 dark:divide-white/10">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={index} 
                                className="py-5 sm:py-6 px-4 md:px-6 flex items-start gap-4 transition-colors hover:bg-white/60 dark:hover:bg-white/[0.04]"
                            >
                                <div className="shrink-0 text-[#8A6305] text-2xl mt-0.5">
                                    <Icon />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white tracking-tight truncate">
                                            {item.title}
                                        </h3>
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-[#8A6305] dark:text-[#E5B54A] border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed font-normal">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
