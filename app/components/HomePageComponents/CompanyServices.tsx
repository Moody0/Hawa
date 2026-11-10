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
import type { CompanyServiceItem } from '@/lib/public-defaults';
import { DEFAULT_COMPANY_SERVICES } from '@/lib/public-defaults';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
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

    const services: CompanyServiceItem[] = useMemo(() => {
        if (!settings?.homeServicesItems) return DEFAULT_COMPANY_SERVICES;
        try {
            const parsed = JSON.parse(settings.homeServicesItems);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COMPANY_SERVICES;
        } catch {
            return DEFAULT_COMPANY_SERVICES;
        }
    }, [settings?.homeServicesItems]);

    if (settings?.homeServicesEnabled === false) {
        return null;
    }

    const title = isArabic
        ? (settings?.homeServicesTitleAr || 'خدمات التوزيع والتجارة المتكاملة')
        : (settings?.homeServicesTitle || 'Our Comprehensive Distribution Services');

    const activeServices = services.filter((s) => s.isActive !== false);
    if (activeServices.length === 0) {
        return null;
    }

    // Select the flagship service (Distribution / Featured) and the remaining companion pillars
    const flagshipService =
        activeServices.find(
            (s) =>
                s.isFeatured ||
                s.id === 'srv-distribution' ||
                s.icon === 'Truck' ||
                (s.titleAr && s.titleAr.includes('توزيع'))
        ) || activeServices[0];

    const companionServices = activeServices.filter((s) => s.id !== flagshipService.id);

    const FlagshipIcon = SERVICE_ICONS[flagshipService.icon] || Truck;
    const flagshipRawTitle = (
        isArabic
            ? flagshipService.titleAr || flagshipService.title
            : flagshipService.title || flagshipService.titleAr
    ).trim();
    const flagshipWords = flagshipRawTitle.split(/\s+/);
    const flagshipLead = flagshipWords.length > 1 ? flagshipWords.slice(0, -1).join(' ') : flagshipRawTitle;
    const flagshipAccent = flagshipWords.length > 1 ? flagshipWords[flagshipWords.length - 1] : '';

    const flagshipDesc = isArabic
        ? flagshipService.descAr || flagshipService.desc
        : flagshipService.desc || flagshipService.descAr;

    const totalFormatted = String(activeServices.length).padStart(2, '0');

    const renderFlagshipCard = () => {
        const inner = (
            <article className="group relative h-full overflow-hidden rounded-[18px] sm:rounded-[22px] border border-[#E5B54A]/25 bg-gradient-to-br from-[#0F2138] to-[#0B192C] p-5 sm:p-8 text-white flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5">
                {/* Subtle Architectural Watermark */}
                <FlagshipIcon
                    strokeWidth={1}
                    className="pointer-events-none absolute -bottom-5 -end-5 h-44 w-44 sm:h-52 sm:w-52 text-white opacity-[0.05] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    aria-hidden="true"
                />

                {/* Top Row: Icon & Tabular Index */}
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <FlagshipIcon
                        strokeWidth={1.8}
                        className="h-6 w-6 sm:h-8 sm:w-8 text-[#E5B54A] shrink-0"
                        aria-hidden="true"
                    />
                    <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.08em] text-[#E5B54A]/75 tabular-nums">
                        01 / {totalFormatted}
                    </span>
                </div>

                {/* Main Copy & Bottom Architectural Line */}
                <div className="relative z-10 mt-5 sm:mt-8">
                    <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-2 sm:mb-3">
                        <span className="relative inline-block">
                            {flagshipLead}{' '}
                            {flagshipAccent && <span className="text-[#E5B54A]">{flagshipAccent}</span>}
                            <span
                                className="pointer-events-none absolute -bottom-1 inset-x-0 h-[2px] bg-[#E5B54A] origin-left scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-right group-hover:scale-x-100"
                                aria-hidden="true"
                            />
                        </span>
                    </h3>

                    <p className="text-xs sm:text-[14.5px] leading-[1.65] sm:leading-[1.7] text-white/80 max-w-[40ch]">
                        {flagshipDesc}
                    </p>

                    <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-[11.5px] sm:text-[12.5px] font-bold text-white/85">
                        <span>
                            {isArabic
                                ? 'تغطية ميدانية مجدولة لمختلف المحافظات'
                                : 'Scheduled field coverage across regions'}
                        </span>
                        <span
                            className={`text-[#E5B54A] transition-transform duration-300 ${
                                isArabic ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                            }`}
                            aria-hidden="true"
                        >
                            {isArabic ? '←' : '→'}
                        </span>
                    </div>
                </div>
            </article>
        );

        return flagshipService.link ? (
            <Link href={flagshipService.link} className="block h-full">
                {inner}
            </Link>
        ) : (
            <div className="h-full">{inner}</div>
        );
    };

    return (
        <section className="w-full py-7 md:py-11">
            <div className="container-custom">
                {/* Editorial Section Header */}
                <div className="pb-4 mb-5 sm:mb-6 border-b border-[#0B192C]/[0.09] dark:border-white/10">
                    <h2 className="text-[20px] sm:text-[28px] font-black text-[#0B192C] dark:text-white leading-[1.2] tracking-[-0.01em]">
                        {title}
                    </h2>
                </div>

                {/* Apple Bento Asymmetric Layout: Flagship Royal Navy Stage + 2x2 Companion Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1.85fr] gap-2.5 sm:gap-4 items-stretch">
                    {/* Start Column: Flagship Royal Navy Stage */}
                    {renderFlagshipCard()}

                    {/* End Column: 2x2 Companion Matrix */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                        {companionServices.map((item) => {
                            const Icon = SERVICE_ICONS[item.icon] || ShieldCheck;
                            const itemTitle = isArabic ? item.titleAr || item.title : item.title || item.titleAr;
                            const itemDesc = isArabic ? item.descAr || item.desc : item.desc || item.descAr;

                            const cardInner = (
                                <article className="group h-full rounded-[14px] sm:rounded-[20px] bg-white dark:bg-[#0F2138] p-3.5 sm:p-6 border border-[#0B192C]/[0.085] dark:border-white/10 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#C59329]/45">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                                            <h3 className="text-[13.5px] sm:text-[17.5px] font-black text-[#0B192C] dark:text-white leading-snug">
                                                <span className="relative inline-block">
                                                    {itemTitle}
                                                    <span
                                                        className="pointer-events-none absolute -bottom-1 inset-x-0 h-[2px] bg-[#C59329] origin-left scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-right group-hover:scale-x-100"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </h3>
                                            <Icon
                                                strokeWidth={1.8}
                                                className="w-4 h-4 sm:w-[22px] sm:h-[22px] text-[#8A6305] dark:text-[#E5B54A] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <p className="text-[11px] sm:text-[13.5px] text-[#475569] dark:text-slate-300 leading-[1.5] sm:leading-[1.65]">
                                            {itemDesc}
                                        </p>
                                    </div>
                                </article>
                            );

                            return item.link ? (
                                <Link key={item.id} href={item.link} className="block h-full">
                                    {cardInner}
                                </Link>
                            ) : (
                                <div key={item.id} className="h-full">
                                    {cardInner}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
