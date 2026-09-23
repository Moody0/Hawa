'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import {
    Headphones,
    ShieldCheck,
    Megaphone,
    Warehouse,
    Truck,
    Clock,
    Package,
    Award,
    Sparkles,
    CheckCircle2,
    BarChart3,
    Store,
    Globe,
    Users,
    ShoppingBag,
    Shield,
    HeartHandshake,
    Zap,
    MapPin,
    Building2,
} from 'lucide-react';
import type { CompanyServiceItem } from '@/lib/public-queries';
import { DEFAULT_COMPANY_SERVICES } from '@/lib/public-queries';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Truck,
    Headphones,
    ShieldCheck,
    Megaphone,
    Warehouse,
    Package,
    Clock,
    Award,
    Sparkles,
    CheckCircle2,
    BarChart3,
    Store,
    Globe,
    Users,
    ShoppingBag,
    Shield,
    HeartHandshake,
    Zap,
    MapPin,
    Building2,
};

const getAccentClass = (accent?: string) => {
    switch (accent) {
        case 'blue':
            return 'border-blue-500/20 text-[#0B192C] dark:text-sky-400';
        case 'purple':
            return 'border-purple-500/20 text-purple-700 dark:text-purple-400';
        case 'amber':
            return 'border-amber-500/20 text-[#8A6305] dark:text-[#8A6305]';
        case 'emerald':
            return 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
        case 'rose':
            return 'border-rose-500/20 text-rose-600 dark:text-rose-400';
        case 'gold':
        default:
            return 'border-[#8A6305]/25 text-[#8A6305] dark:text-[#E5B54A]';
    }
};

interface CompanyServicesProps {
    settings?: {
        homeServicesEnabled?: boolean | null;
        homeServicesTitle?: string | null;
        homeServicesTitleAr?: string | null;
        homeServicesDesc?: string | null;
        homeServicesDescAr?: string | null;
        homeServicesItems?: string | null;
        [key: string]: any;
    };
}

export default function CompanyServices({ settings }: CompanyServicesProps) {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    // If section disabled by admin, return null
    if (settings?.homeServicesEnabled === false) {
        return null;
    }

    const title = isArabic
        ? (settings?.homeServicesTitleAr || 'خدمات التوزيع والتجارة المتكاملة')
        : (settings?.homeServicesTitle || 'Our Comprehensive Distribution Services');

    const desc = isArabic
        ? (settings?.homeServicesDescAr || 'نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل')
        : (settings?.homeServicesDesc || 'Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands');

    const services: CompanyServiceItem[] = useMemo(() => {
        if (!settings?.homeServicesItems) return DEFAULT_COMPANY_SERVICES;
        try {
            const parsed = JSON.parse(settings.homeServicesItems);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COMPANY_SERVICES;
        } catch {
            return DEFAULT_COMPANY_SERVICES;
        }
    }, [settings?.homeServicesItems]);

    const activeServices = services.filter((s) => s.isActive !== false);
    if (activeServices.length === 0) {
        return null;
    }

    const featuredService = activeServices.find((s) => s.isFeatured) || activeServices[0];
    const supportingServices = activeServices.filter((s) => s.id !== featuredService.id);
    const FeaturedIcon = SERVICE_ICONS[featuredService.icon] || Truck;

    return (
        <section className="w-full py-12 md:py-16">
            <div className="container-custom">
                <div className="text-center mb-7 md:mb-10">
                    <div className="flex items-center justify-center gap-3 mb-1.5">
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight" data-reveal-heading>
                            {title}
                        </h2>
                        <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                    </div>
                    {desc && (
                        <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 max-w-xl mx-auto" data-reveal-copy>
                            {desc}
                        </p>
                    )}
                </div>

                <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.05fr_1.95fr]">
                    {/* Featured Hero Card */}
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
                                {(featuredService.tagAr || featuredService.tag) && (
                                    <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-[#E5B54A]">
                                        {isArabic ? featuredService.tagAr || featuredService.tag : featuredService.tag || featuredService.tagAr}
                                    </span>
                                )}
                                <h3 className="mt-3 text-xl sm:text-2xl font-black text-white">
                                    {isArabic ? featuredService.titleAr || featuredService.title : featuredService.title || featuredService.titleAr}
                                </h3>
                                <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-300">
                                    {isArabic ? featuredService.descAr || featuredService.desc : featuredService.desc || featuredService.descAr}
                                </p>
                            </div>

                            {featuredService.link ? (
                                <Link
                                    href={featuredService.link}
                                    className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-bold text-[#E5B54A] hover:text-white transition-colors"
                                >
                                    <span>
                                        {isArabic
                                            ? featuredService.footerTextAr || featuredService.footerText || 'خدمة توزيع معتمدة'
                                            : featuredService.footerText || featuredService.footerTextAr || 'Verified distribution service'}
                                    </span>
                                    <span className={isArabic ? 'rotate-180' : ''}>→</span>
                                </Link>
                            ) : (
                                <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-bold text-[#E5B54A]">
                                    <span>
                                        {isArabic
                                            ? featuredService.footerTextAr || featuredService.footerText || 'خدمة توزيع معتمدة'
                                            : featuredService.footerText || featuredService.footerTextAr || 'Verified distribution service'}
                                    </span>
                                    <span className={isArabic ? 'rotate-180' : ''}>→</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Supporting Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                        {supportingServices.map((item) => {
                            const Icon = SERVICE_ICONS[item.icon] || Headphones;
                            const cardContent = (
                                <div
                                    data-reveal-item
                                    className="group relative bg-white/85 dark:bg-[#132035] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200/70 dark:border-white/10 hover:border-[#8A6305] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2.5 sm:mb-4 gap-1">
                                            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-white/10 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                                <Icon className={`text-xl sm:text-2xl ${getAccentClass(item.accent)}`} />
                                            </div>
                                            {(item.tagAr || item.tag) && (
                                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 truncate">
                                                    {isArabic ? item.tagAr || item.tag : item.tag || item.tagAr}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-[13px] sm:text-base font-bold text-[#0B192C] dark:text-white mb-1 sm:mb-2 group-hover:text-[#8A6305] transition-colors">
                                            {isArabic ? item.titleAr || item.title : item.title || item.titleAr}
                                        </h3>

                                        <p className="text-[11px] sm:text-xs text-[#475569] dark:text-gray-300 leading-relaxed font-medium">
                                            {isArabic ? item.descAr || item.desc : item.desc || item.descAr}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-gray-200/50 dark:border-white/5 flex items-center text-[10px] sm:text-[11px] font-bold text-[#8A6305] dark:text-[#8A6305]">
                                        <span>
                                            {isArabic
                                                ? item.footerTextAr || item.footerText || 'خدمة معتمدة'
                                                : item.footerText || item.footerTextAr || 'Verified Service'}
                                        </span>
                                        <span className={`ms-1 inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isArabic ? 'rotate-180' : ''}`}>
                                            →
                                        </span>
                                    </div>
                                </div>
                            );

                            return item.link ? (
                                <Link key={item.id} href={item.link} className="block h-full">
                                    {cardContent}
                                </Link>
                            ) : (
                                <div key={item.id} className="h-full">
                                    {cardContent}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
