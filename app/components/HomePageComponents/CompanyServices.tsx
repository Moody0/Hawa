'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
    MdHeadsetMic, 
    MdVerified, 
    MdCampaign, 
    MdWarehouse, 
    MdLocalShipping 
} from 'react-icons/md';

export default function CompanyServices() {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const services = [
        {
            icon: MdHeadsetMic,
            title: isArabic ? 'دعم العملاء' : 'Customer Support',
            desc: isArabic ? 'فريق متخصص للرد على استفساراتكم ومساعدتكم وتسهيل طلبيات الجملة دورياً.' : 'Dedicated wholesale support team ready to assist your store orders.',
            tag: isArabic ? 'استجابة سريعة' : 'Fast Response',
            accent: 'border-blue-500/20 text-[#0B192C] dark:text-sky-400',
        },
        {
            icon: MdVerified,
            title: isArabic ? 'الجودة والموثوقية' : 'Quality & Reliability',
            desc: isArabic ? 'منتجات أصلية 100% مطابقة لأعلى المعايير والمواصفات القياسية مباشرة من مصادرها.' : '100% authentic wholesale products conforming to global industry standards.',
            tag: isArabic ? 'أصالة مضمونة' : 'Guaranteed Authentic',
            accent: 'border-[#8A6305]/25 text-[#8A6305] dark:text-[#E5B54A]',
        },
        {
            icon: MdCampaign,
            title: isArabic ? 'التسويق التجاري' : 'Trade Marketing',
            desc: isArabic ? 'دعم العلامات التجارية بالإعلان والانتشار والمبيعات وتعزيز حضورها في نقاط البيع.' : 'Commercial advertising, retail expansion, and point-of-sale acceleration.',
            tag: isArabic ? 'بناء حضور' : 'Market Presence',
            accent: 'border-amber-500/20 text-[#8A6305] dark:text-[#8A6305]',
        },
        {
            icon: MdWarehouse,
            title: isArabic ? 'إدارة المخزون' : 'Inventory Management',
            desc: isArabic ? 'أنظمة متطورة لإدارة المستودعات والتخزين وفق اشتراطات الحرارة والسلامة الغذائية.' : 'Temperature-controlled logistics warehouses and advanced inventory tracking.',
            tag: isArabic ? 'تخزين معياري' : 'Safe Storage',
            accent: 'border-purple-500/20 text-purple-700 dark:text-purple-400',
        },
        {
            icon: MdLocalShipping,
            title: isArabic ? 'توزيع احترافي' : 'Professional Distribution',
            desc: isArabic ? 'شبكة توزيع واسعة وأسطول نقل مجهز يغطي مختلف المناطق والأسواق بدقة ومواعيد منتظمة.' : 'Equipped transport fleet covering stores with scheduled, dependable delivery.',
            tag: isArabic ? 'أسطول مجهز' : 'Scheduled Logistics',
            accent: 'border-amber-600/20 text-[#8A6305] dark:text-[#8A6305]',
        },
    ];

    return (
        <section className="w-full py-10 md:py-16 bg-white dark:bg-[#0B192C]/30">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-2.5">
                            <span>{isArabic ? 'حلول متكاملة للأعمال' : 'Integrated B2B Solutions'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight">
                            {isArabic ? 'خدمات التوزيع والتجارة المتكاملة' : 'Our Comprehensive Distribution Services'}
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-gray-300 max-w-md">
                        {isArabic 
                            ? 'نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل.'
                            : 'Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands.'}
                    </p>
                </div>

                {/* 5 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
                    {services.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-[#FAF6EC]/50 dark:bg-[#132035] rounded-2xl p-5 border border-gray-200/70 dark:border-white/10 hover:border-[#8A6305] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon className={`text-2xl ${item.accent}`} />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                                            {item.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-[#0B192C] dark:text-white mb-2 group-hover:text-[#8A6305] transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-xs text-[#475569] dark:text-gray-300 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-white/5 flex items-center text-[11px] font-bold text-[#8A6305] dark:text-[#8A6305]">
                                    <span>{isArabic ? 'خدمة معتمدة' : 'Verified Service'}</span>
                                    <span className="ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
