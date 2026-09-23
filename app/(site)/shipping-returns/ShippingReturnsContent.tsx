"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { Truck, CheckCircle2, Phone, RotateCcw } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { Settings } from "@prisma/client";
import { ShippingPolicyContent } from "@/lib/shipping-policy-content";

interface ShippingReturnsContentProps {
    siteSettings: Settings | any | null;
    content: ShippingPolicyContent;
}

export default function ShippingReturnsContent({ siteSettings, content }: ShippingReturnsContentProps) {
    const { dir, language } = useLanguage();
    const pageContent = language === 'ar' || dir === 'rtl' ? content.ar : content.en;

    // Phone / WhatsApp setup with dedicated dispatch overrides
    const defaultWa = '+963993443901';
    const rawWa = pageContent.dispatchWhatsapp?.trim() || siteSettings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWa;
    const cleanWaNumber = rawWa.replace(/[^0-9]/g, '');
    const rawPhone = pageContent.dispatchPhone?.trim() || siteSettings?.footerPhone || defaultWa;
    const cleanPhoneNumber = rawPhone.replace(/[^0-9+]/g, '');
    const phoneLabel = pageContent.phoneButtonLabel || (language === 'ar' || dir === 'rtl' ? 'اتصال مباشر' : 'Direct Call');
    const heroImage = siteSettings?.shippingReturnsImage?.trim();

    return (
        <div className="w-full bg-[#FCFBF8] dark:bg-[#070D18] text-[#0B192C] dark:text-slate-100 transition-colors py-10 md:py-16" dir={dir}>
            <div className="container-custom max-w-4xl mx-auto">
                
                {/* Header: Clean & Informative or Hero Banner if Image is set */}
                {heroImage ? (
                    <div className="relative rounded-3xl overflow-hidden mb-12 bg-[#0B192C] text-white p-8 sm:p-12 text-center border border-[#8A6305]/30 shadow-md">
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
                            style={{ backgroundImage: `url('${heroImage}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/85 to-[#0B192C]/65" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A6305]/20 border border-[#8A6305]/40 text-[#E5B54A] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                                <Truck className="text-sm" />
                                <span>{pageContent.heroBadge}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                                {pageContent.heroTitle}
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                                {pageContent.heroDescription}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#E5B54A] text-xs font-bold uppercase tracking-wider mb-3">
                            <Truck className="text-sm" />
                            <span>{pageContent.heroBadge}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-3">
                            {pageContent.heroTitle}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                            {pageContent.heroDescription}
                        </p>
                    </div>
                )}

                <div className="space-y-8">
                    
                    {/* Section 1: قواعد الشحن والتسليم */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xl shrink-0">
                                <Truck />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {pageContent.shippingSectionTitle}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {pageContent.shippingSectionDescription}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Rule 1: التأكيد */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.verificationTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.verificationDescription}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 2: مواعيد التسليم */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-2">
                                        {pageContent.timelineTitle}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                                            <span className="block text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-0.5">
                                                {pageContent.centralRegionLabel}
                                            </span>
                                            <span className="text-sm font-black text-[#0B192C] dark:text-white">
                                                {pageContent.expressTimeline}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                                            <span className="block text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-0.5">
                                                {pageContent.otherRegionsLabel}
                                            </span>
                                            <span className="text-sm font-black text-[#0B192C] dark:text-white">
                                                {pageContent.standardTimeline}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {pageContent.timelineNote}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 3: التوصيل لباب المحل */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.storeDoorTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.storeDoorDescription}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 4: المعاينة ومطابقة الفاتورة */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.invoiceTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.invoiceDescription}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 2: سياسة الجودة والمطابقة والاستبدال */}
                    <div className="bg-white dark:bg-[#132035] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                                <RotateCcw />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white">
                                    {pageContent.qualitySectionTitle}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {pageContent.qualitySectionDescription}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Rule 1: كراتين مصنع أصلية */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.factoryCasesTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.factoryCasesDescription}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 2: استبدال فوري مع المندوب */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.damagedCasesTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.damagedCasesDescription}
                                    </p>
                                </div>
                            </div>

                            {/* Rule 3: مهلة 24 ساعة */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.concealedDefectTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                                        {pageContent.concealedDefectDescription}
                                    </p>
                                    <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl p-3.5 border border-slate-200/60 dark:border-white/5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-500 text-sm shrink-0" />
                                            <span>{pageContent.concealedDefectStep1}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-500 text-sm shrink-0" />
                                            <span>{pageContent.concealedDefectStep2}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rule 4: التخزين والسلامة */}
                            <div className="flex items-start gap-3.5">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#0B192C] dark:text-white mb-1">
                                        {pageContent.storageTitle}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {pageContent.storageDescription}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 3: شريط الاستفسارات والدعم السريع */}
                    <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-[#0B192C] dark:text-white mb-0.5">
                                {pageContent.supportTitle}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {pageContent.supportDescription}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0">
                            <a
                                href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(pageContent.whatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs"
                            >
                                <FaWhatsapp className="text-sm" />
                                <span>{pageContent.whatsappButtonLabel}</span>
                            </a>
                            <a
                                href={`tel:${cleanPhoneNumber}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#132035] border border-slate-200 dark:border-white/10 text-[#0B192C] dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-bold transition-all shadow-xs"
                            >
                                <Phone className="text-sm text-[#8A6305] dark:text-[#E5B54A]" />
                                <span>{phoneLabel}</span>
                                <span dir="ltr" className="text-slate-500 dark:text-slate-400 font-normal">({rawPhone})</span>
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
