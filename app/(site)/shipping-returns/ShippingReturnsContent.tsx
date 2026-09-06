"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { MdLocalShipping, MdAssignmentReturn, MdVerifiedUser, MdCheckCircle, MdLock } from "react-icons/md";
import { Settings } from "@prisma/client";
import ResilientImage from "@/app/components/ResilientImage";

interface ShippingReturnsContentProps {
    siteSettings: any | null;
}

export default function ShippingReturnsContent({ siteSettings }: ShippingReturnsContentProps) {
    const { t, dir, language } = useLanguage();

    const getTranslatedArray = (key: string): string[] => {
        const content = t(key);
        return Array.isArray(content) ? content : [];
    };

    // Helper to get content from siteSettings or fallback to translation
    const getContent = (fieldEn: keyof Settings, fieldAr: keyof Settings, translationKey: string) => {
        if (!siteSettings) return t(translationKey);
        
        const value = language === 'ar' ? siteSettings[fieldAr] : siteSettings[fieldEn];
        return (value as string) || t(translationKey);
    };

    return (
        <div className="flex-1 bg-white dark:bg-background-dark" dir={dir}>
            <header className="container-custom text-center py-12 md:py-20">
                <h1 className="text-4xl md:text-6xl font-display italic mb-6">
                    {t('shippingReturnsPage.title')}
                </h1>
                <p className="text-base md:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed px-4">
                    {t('shippingReturnsPage.description')}
                </p>
            </header>
            <div className="container-custom pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* Left Column: Shipping */}
                    <section className="space-y-10 md:space-y-12">
                        <div className={`flex gap-2 items-center ${dir === 'rtl' ? 'space-x-reverse' : ''} space-x-5`}>
                            <span className="bg-primary/10 text-primary p-3.5 rounded-full flex-shrink-0">
                                <MdLocalShipping className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl md:text-3xl font-display font-medium">
                                {t('shippingReturnsPage.shipping.title')}
                            </h2>
                        </div>
                        <div className="space-y-8">
                            {/* 1. Verification Section */}
                            <div className={`${dir === 'rtl' ? 'border-r-2 pr-6 pl-0' : 'border-l-2 pl-6'} border-primary/20 py-2`}>
                                <h3 className="text-xl font-display font-semibold mb-3">
                                    {getContent('verificationTitle', 'verificationTitleAr', 'shippingReturnsPage.shipping.verification.title')}
                                </h3>
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                                    {getContent('verificationDesc', 'verificationDescAr', 'shippingReturnsPage.shipping.verification.description')}
                                </p>
                            </div>

                            {/* 2. Shipping Times */}
                            <div className={`${dir === 'rtl' ? 'border-r-2 pr-6 pl-0' : 'border-l-2 pl-6'} border-primary/20 py-2`}>
                                <h3 className="text-xl font-display font-semibold mb-3">
                                    {t('shippingReturnsPage.shipping.timelines.title')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                                    <div className="bg-white dark:bg-stone-900/40 p-4 rounded-lg shadow-sm border border-primary/5">
                                        <span className="block font-bold text-primary text-xs uppercase tracking-widest mb-1">
                                            {t('shippingReturnsPage.shipping.timelines.standard')}
                                        </span>
                                        <p className="text-lg">
                                            {siteSettings?.standardShippingTime || t('shippingReturnsPage.shipping.timelines.standardTime')}
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-stone-900/40 p-4 rounded-lg shadow-sm border border-primary/5">
                                        <span className="block font-bold text-primary text-xs uppercase tracking-widest mb-1">
                                            {t('shippingReturnsPage.shipping.timelines.express')}
                                        </span>
                                        <p className="text-lg">
                                            {siteSettings?.expressShippingTime || t('shippingReturnsPage.shipping.timelines.expressTime')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Shipping Review Section */}
                            <div className={`${dir === 'rtl' ? 'border-r-2 pr-6 pl-0' : 'border-l-2 pl-6'} border-primary/20 py-2`}>
                                <h3 className="text-xl font-display font-semibold mb-3">
                                    {getContent('shippingTitle', 'shippingTitleAr', 'shippingReturnsPage.shipping.review.title')}
                                </h3>
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                                    {getContent('shippingDesc', 'shippingDescAr', 'shippingReturnsPage.shipping.review.description')}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Image */}
                        <div className="relative rounded-xl overflow-hidden aspect-[16/9] group">
                            <ResilientImage 
                                alt="Shipping packaging" 
                                className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" 
                                src={siteSettings?.shippingReturnsImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuC1GmfD6bueEsJqlHNPjDWHMlhsLZSm2Jmp21TUCLKvobkcd7oAPMMdwzfm8BOHC5XtR0EP6tLI7DT5hhyLxuijsbpX2kQf6iNlqROU-8k-DrqZAUqdc7-0lE4nxuCcLaEb0fEaXVBxc_yXkiUlyhfvaYJ1FfHZtngnoJbeanLgsf7rcxqON6rjkoC4BQv6FhlwLNKZrMbxjCugphq-bo5GCqBoLfmjjZSuH0N5eV-Kz33xFQTD5jSYCTsVYAwOkwhLQsQiPD_lnD9U"} 
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none"></div>
                        </div>
                    </section>

                    {/* Right Column: Returns */}
                    <section className="space-y-10 md:space-y-12">
                        <div className={`flex gap-2 items-center ${dir === 'rtl' ? 'space-x-reverse' : ''} space-x-5`}>
                            <span className="bg-primary/10 text-primary p-3.5 rounded-full flex-shrink-0">
                                <MdAssignmentReturn className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl md:text-3xl font-display font-medium">
                                {t('shippingReturnsPage.returns.title')}
                            </h2>
                        </div>

                        {/* Final Sale Section */}
                        <div className="bg-primary text-white p-6 md:p-8 rounded-xl shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-display font-bold mb-3">
                                    {getContent('finalSaleTitle', 'finalSaleTitleAr', 'shippingReturnsPage.returns.finalSale.title')}
                                </h3>
                                <p className="text-white/90 text-sm leading-relaxed max-w-md">
                                    {getContent('finalSaleDesc', 'finalSaleDescAr', 'shippingReturnsPage.returns.finalSale.description')}
                                </p>
                            </div>
                            <MdLock className={`absolute ${dir === 'rtl' ? '-left-4' : '-right-4'} -bottom-4 text-white/10 text-8xl md:text-9xl`} />
                        </div>

                        <div className="space-y-8">
                            {/* Hygiene Section */}
                            <div>
                                <h3 className={`text-xl font-display font-semibold mb-4 flex items-center ${dir === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                                    <MdVerifiedUser className="text-primary/60 ml-2 text-2xl flex-shrink-0" />
                                    <span>{getContent('hygieneTitle', 'hygieneTitleAr', 'shippingReturnsPage.returns.hygiene.title')}</span>
                                </h3>
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                                    {getContent('hygieneDesc', 'hygieneDescAr', 'shippingReturnsPage.returns.hygiene.description')}
                                </p>
                            </div>

                            {/* Returns/Damaged Section */}
                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl">
                                <h3 className="text-xl font-display font-semibold mb-4">
                                    {getContent('returnsTitle', 'returnsTitleAr', 'shippingReturnsPage.returns.damaged.title')}
                                </h3>
                                <p className="text-stone-600 dark:text-stone-400 mb-5 leading-relaxed">
                                    {getContent('returnsDesc', 'returnsDescAr', 'shippingReturnsPage.returns.damaged.description')}
                                </p>
                                <ul className="space-y-4 text-sm">
                                    {getTranslatedArray('shippingReturnsPage.returns.damaged.steps').map((step, index) => (
                                        <li key={index} className={`flex items-start ${dir === 'rtl' ? 'space-x-reverse' : ''} space-x-3`}>
                                            <MdCheckCircle className="text-primary text-lg mt-0.5 flex-shrink-0" />
                                            <span className="leading-tight">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Support Section */}
                        <div className="pt-8 border-t border-primary/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-display font-bold text-lg mb-1">
                                        {t('shippingReturnsPage.support.title')}
                                    </h4>
                                    <p className="text-sm text-stone-500">
                                        {t('shippingReturnsPage.support.description')}
                                    </p>
                                </div>
                                <a className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-center text-sm font-bold transition-all" target="_blank" href="https://wa.me/963933254796">
                                    {t('shippingReturnsPage.support.cta')}
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
