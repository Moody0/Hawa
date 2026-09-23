"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    ShieldCheck,
    Database,
    Lock,
    Users,
    Clock,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Building2,
    FileText,
    Truck,
    BadgeCheck,
    Radio,
    ShieldAlert,
    HelpCircle,
    UserCheck,
} from "lucide-react";
import { Settings } from "@prisma/client";
import { PrivacyPolicyContent } from "@/lib/privacy-policy-content";

interface PrivacyPageContentProps {
    siteSettings: Settings | any | null;
    content: PrivacyPolicyContent;
}

export default function PrivacyPageContent({ siteSettings, content }: PrivacyPageContentProps) {
    const { dir, language } = useLanguage();
    const isAr = language === "ar" || dir === "rtl";
    const pageContent = isAr ? content.ar : content.en;

    const phoneValue = siteSettings?.footerPhone || "+963993443901";
    const emailValue = siteSettings?.footerEmail || "info@hawa.sy";
    const addressValue =
        (isAr ? siteSettings?.footerAddressAr : siteSettings?.footerAddress) ||
        (isAr ? "سوريا - دمشق - شارع الثورة" : "Syria - Damascus - Al-Thawra St");

    const cleanPhone = phoneValue.replace(/[^0-9+]/g, "");
    const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
    const buttonLink = pageContent.contactButtonLink?.trim() || "/contact";

    return (
        <div
            className="w-full bg-[#FCFBF8] dark:bg-[#070D18] text-[#0B192C] dark:text-slate-100 transition-colors py-10 md:py-16"
            dir={dir}
        >
            <div className="container-custom max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* Hero Header */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#E5B54A] text-xs font-bold uppercase tracking-wider mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{pageContent.heroBadge}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-4">
                        {pageContent.heroTitle}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-5">
                        {pageContent.heroDescription}
                    </p>

                    {pageContent.lastUpdated && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{pageContent.lastUpdated}</span>
                        </div>
                    )}
                </div>

                {/* Content Cards */}
                <div className="space-y-8">

                    {/* SECTION 1: Information We Collect */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xl shrink-0">
                                <Database className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold tracking-wider text-[#8A6305] dark:text-[#E5B54A] uppercase block">
                                    {pageContent.section1Badge}
                                </span>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {pageContent.section1Title}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {pageContent.section1Desc}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Card 1 */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-[#8A6305] dark:text-[#E5B54A]">
                                    <Building2 className="w-4 h-4" />
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white">
                                        {pageContent.businessInfoTitle}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {pageContent.businessInfoDesc}
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-[#8A6305] dark:text-[#E5B54A]">
                                    <Phone className="w-4 h-4" />
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white">
                                        {pageContent.contactInfoTitle}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {pageContent.contactInfoDesc}
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-[#8A6305] dark:text-[#E5B54A]">
                                    <FileText className="w-4 h-4" />
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white">
                                        {pageContent.ordersInfoTitle}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {pageContent.ordersInfoDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Purposes of Usage & Operations */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xl shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold tracking-wider text-[#8A6305] dark:text-[#E5B54A] uppercase block">
                                    {pageContent.section2Badge}
                                </span>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {pageContent.section2Title}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {pageContent.section2Desc}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="w-6 h-6 rounded-full bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.usageDeliveryTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.usageDeliveryDesc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="w-6 h-6 rounded-full bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.usageVerificationTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.usageVerificationDesc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="w-6 h-6 rounded-full bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.usageCommunicationTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.usageCommunicationDesc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Confidentiality & Protection */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xl shrink-0">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold tracking-wider text-[#8A6305] dark:text-[#E5B54A] uppercase block">
                                    {pageContent.section3Badge}
                                </span>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {pageContent.section3Title}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {pageContent.section3Desc}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
                                <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400">
                                    <ShieldAlert className="w-5 h-5" />
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white">
                                        {pageContent.noSellingTitle}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {pageContent.noSellingDesc}
                                </p>
                            </div>

                            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
                                <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400">
                                    <BadgeCheck className="w-5 h-5" />
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white">
                                        {pageContent.securityMeasuresTitle}
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {pageContent.securityMeasuresDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Merchant Rights & Management Contact */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xl shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold tracking-wider text-[#8A6305] dark:text-[#E5B54A] uppercase block">
                                    {pageContent.section4Badge}
                                </span>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {pageContent.section4Title}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {pageContent.section4Desc}
                                </p>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 mb-6">
                            <div className="flex items-center gap-2 mb-2 text-[#8A6305] dark:text-[#E5B54A]">
                                <UserCheck className="w-4 h-4" />
                                <h3 className="text-sm font-bold text-[#0B192C] dark:text-white">
                                    {pageContent.rightsUpdateTitle}
                                </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {pageContent.rightsUpdateDesc}
                            </p>
                        </div>

                        {/* Contact details strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                            <a
                                href={`tel:${cleanPhone}`}
                                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] transition-colors"
                            >
                                <Phone className="w-4 h-4 text-[#8A6305] dark:text-[#E5B54A] shrink-0" />
                                <div className="truncate">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                                        {isAr ? "الهاتف المباشر" : "Direct Phone"}
                                    </div>
                                    <div dir="ltr" className="text-xs font-bold text-[#0B192C] dark:text-white truncate">
                                        {phoneValue}
                                    </div>
                                </div>
                            </a>

                            <a
                                href={`mailto:${emailValue}`}
                                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] transition-colors"
                            >
                                <Mail className="w-4 h-4 text-[#8A6305] dark:text-[#E5B54A] shrink-0" />
                                <div className="truncate">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                                        {isAr ? "البريد الإلكتروني" : "Email"}
                                    </div>
                                    <div dir="ltr" className="text-xs font-bold text-[#0B192C] dark:text-white truncate">
                                        {emailValue}
                                    </div>
                                </div>
                            </a>

                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                                <MapPin className="w-4 h-4 text-[#8A6305] dark:text-[#E5B54A] shrink-0" />
                                <div className="truncate">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                                        {isAr ? "المقر الرئيسي" : "Headquarters"}
                                    </div>
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                        {addressValue}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Card */}
                    <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-start">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white mb-1">
                                {pageContent.supportHeading}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                {pageContent.supportDesc}
                            </p>
                        </div>

                        <Link
                            href={buttonLink}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8A6305] hover:bg-[#725204] text-white text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0"
                        >
                            <span>{pageContent.contactButtonText}</span>
                            <ArrowIcon className="w-4 h-4" />
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    );
}
