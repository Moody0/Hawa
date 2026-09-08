'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Truck, Store, FolderTree, Users } from 'lucide-react';

interface CompanyStatsProps {
    stats?: {
        deliveries?: string | null;
        brands?: string | null;
        products?: string | null;
        clients?: string | null;
    };
}

export default function CompanyStats({ stats }: CompanyStatsProps) {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const statItems = [
        {
            value: stats?.deliveries || '+9000',
            label: isArabic ? 'عملية توزيع ناجحة' : 'Successful Deliveries',
            sublabel: isArabic ? 'تغطية واسعة لشبكات التجزئة والمحلات' : 'Extensive Retail Coverage',
            icon: Truck,
            iconColor: 'text-[#8A6305] dark:text-[#8A6305]',
        },
        {
            value: stats?.brands || '+100',
            label: isArabic ? 'علامة تجارية معتمدة' : 'Authorized Brands',
            sublabel: isArabic ? 'وكالات تجارية عالمية ومحلية' : 'Global & Regional Agencies',
            icon: Store,
            iconColor: 'text-[#0B192C] dark:text-sky-400',
        },
        {
            value: stats?.products || '+500',
            label: isArabic ? 'منتج غذائي واستهلاكي' : 'Diverse Products',
            sublabel: isArabic ? 'بأعلى مواصفات الجودة والأصالة' : 'Highest Certified Standards',
            icon: FolderTree,
            iconColor: 'text-[#8A6305] dark:text-[#E5B54A]',
        },
        {
            value: stats?.clients || '+300',
            label: isArabic ? 'عميل وموزع معتمد' : 'Retail Partners',
            sublabel: isArabic ? 'محلات وسوبرماركت ومتاجر جملة' : 'Supermarkets & Wholesale Shops',
            icon: Users,
            iconColor: 'text-[#8A6305] dark:text-[#8A6305]',
        },
    ];

    return (
        <section className="w-full py-8 md:py-14 bg-gradient-to-b from-[#FAF6EC]/60 via-white to-[#FAF6EC]/40 dark:from-[#0B192C]/40 dark:via-[#132035]/60 dark:to-[#0B192C]/40 border-y border-amber-900/10 dark:border-white/5">
            <div className="container-custom">
                {/* Header title */}
                <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/25 text-[#8A6305] dark:text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#8A6305] animate-pulse" />
                        <span>{isArabic ? 'أرقام تتحدث عن ثقة السوق' : 'Numbers Behind Market Trust'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {isArabic ? 'قوة شبكتنا وخبرتنا في التوزيع' : 'The Strength of Our Distribution Network'}
                    </h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {statItems.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative bg-white dark:bg-[#132035] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-white/10 hover:border-[#8A6305]/50 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                            >
                                {/* Decorative corner accent */}
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#8A6305]/10 to-transparent rounded-bl-3xl pointer-events-none transition-transform group-hover:scale-110" />

                                {/* Icon badge */}
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FAF6EC] dark:bg-white/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Icon className={`text-2xl sm:text-3xl ${stat.iconColor}`} />
                                </div>

                                {/* Stat counter number */}
                                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight mb-1 font-mono">
                                    <span className="text-[#8A6305] dark:text-[#8A6305]">{stat.value}</span>
                                </div>

                                {/* Label */}
                                <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-gray-100 mb-1 leading-snug">
                                    {stat.label}
                                </h3>

                                {/* Subtitle */}
                                <p className="text-[10px] sm:text-xs text-[#475569] dark:text-gray-400 line-clamp-2">
                                    {stat.sublabel}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
