'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import {
    Headphones,
    ShieldCheck,
    Megaphone,
    Warehouse,
    Truck
} from 'lucide-react';

export default function CompanyServices() {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const services = [
        {
            icon: Headphones,
            title: isArabic ? 'دعم العملاء' : 'Customer Support',
            desc: isArabic ? 'فريق متخصص للرد على استفساراتكم ومساعدتكم وتسهيل طلبيات الجملة دورياً.' : 'Dedicated wholesale support team ready to assist your store orders.',
            tag: isArabic ? 'استجابة سريعة' : 'Fast Response',
            accent: 'border-blue-500/20 text-[#0B192C] dark:text-sky-400',
        },
        {
            icon: ShieldCheck,
            title: isArabic ? 'الجودة والموثوقية' : 'Quality & Reliability',
            desc: isArabic ? 'منتجات أصلية 100% مطابقة لأعلى المعايير والمواصفات القياسية مباشرة من مصادرها.' : '100% authentic wholesale products conforming to global industry standards.',
            tag: isArabic ? 'أصالة مضمونة' : 'Guaranteed Authentic',
            accent: 'border-[#8A6305]/25 text-[#8A6305] dark:text-[#E5B54A]',
        },
        {
            icon: Megaphone,
            title: isArabic ? 'التسويق التجاري' : 'Trade Marketing',
            desc: isArabic ? 'دعم العلامات التجارية بالإعلان والانتشار والمبيعات وتعزيز حضورها في نقاط البيع.' : 'Commercial advertising, retail expansion, and point-of-sale acceleration.',
            tag: isArabic ? 'بناء حضور' : 'Market Presence',
            accent: 'border-amber-500/20 text-[#8A6305] dark:text-[#8A6305]',
        },
        {
            icon: Warehouse,
            title: isArabic ? 'إدارة المخزون' : 'Inventory Management',
            desc: isArabic ? 'أنظمة متطورة لإدارة المستودعات والتخزين وفق اشتراطات الحرارة والسلامة الغذائية.' : 'Temperature-controlled logistics warehouses and advanced inventory tracking.',
            tag: isArabic ? 'تخزين معياري' : 'Safe Storage',
            accent: 'border-purple-500/20 text-purple-700 dark:text-purple-400',
        },
        {
            icon: Truck,
            title: isArabic ? 'توزيع احترافي' : 'Professional Distribution',
            desc: isArabic ? 'شبكة توزيع واسعة وسيارات مجهزة تغطي مختلف المناطق والأسواق بدقة ومواعيد منتظمة.' : 'Equipped delivery vehicles covering stores with scheduled, dependable delivery.',
            tag: isArabic ? 'سيارات مجهزة' : 'Equipped Delivery',
            accent: 'border-amber-600/20 text-[#8A6305] dark:text-[#8A6305]',
        },
    ];
    const featuredService = services[4];
    const supportingServices = services.slice(0, 4);
    const FeaturedIcon = featuredService.icon;

    return (
        <section className="w-full py-12 md:py-16">
            <div className="container-custom">
                <div className="text-center mb-7 md:mb-10">
                    <div className="flex items-center justify-center gap-3 mb-1.5">
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight" data-reveal-heading>
                            {isArabic ? 'خدمات التوزيع والتجارة المتكاملة' : 'Our Comprehensive Distribution Services'}
                        </h2>
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 max-w-xl mx-auto" data-reveal-copy>
                        {isArabic
                            ? 'نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل'
                            : 'Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands'}
                    </p>
                </div>

                <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.05fr_1.95fr]">
                    <div
                        data-reveal-item
                        className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[#8A6305]/35 bg-[#0B192C] p-5 sm:p-7 text-white shadow-[0_20px_55px_-38px_rgba(11,25,44,0.8)]"
                    >
                        <div className="absolute -top-14 -end-14 h-44 w-44 rounded-full bg-[#8A6305]/20 blur-3xl" aria-hidden="true" />
                        <div className="relative flex h-full flex-col justify-between">
                            <div>
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5B54A]/20 bg-[#E5B54A]/10 text-[#E5B54A]">
                                    <FeaturedIcon className="h-6 w-6" aria-hidden="true" />
                                </span>
                                <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-[#E5B54A]">
                                    {featuredService.tag}
                                </span>
                                <h3 className="mt-3 text-xl sm:text-2xl font-black text-white">
                                    {featuredService.title}
                                </h3>
                                <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-300">
                                    {featuredService.desc}
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-bold text-[#E5B54A]">
                                <span>{isArabic ? 'خدمة توزيع معتمدة' : 'Verified distribution service'}</span>
                                <span className={isArabic ? 'rotate-180' : ''}>→</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                    {supportingServices.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                data-reveal-item
                                className="group relative bg-white/85 dark:bg-[#132035] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200/70 dark:border-white/10 hover:border-[#8A6305] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2.5 sm:mb-4 gap-1">
                                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-white/10 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                            <Icon className={`text-xl sm:text-2xl ${item.accent}`} />
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 truncate">
                                            {item.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-[13px] sm:text-base font-bold text-[#0B192C] dark:text-white mb-1 sm:mb-2 group-hover:text-[#8A6305] transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-[11px] sm:text-xs text-[#475569] dark:text-gray-300 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-gray-200/50 dark:border-white/5 flex items-center text-[10px] sm:text-[11px] font-bold text-[#8A6305] dark:text-[#8A6305]">
                                    <span>{isArabic ? 'خدمة معتمدة' : 'Verified Service'}</span>
                                    <span className={`ms-1 inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isArabic ? 'rotate-180' : ''}`}>→</span>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>
        </section>
    );
}
