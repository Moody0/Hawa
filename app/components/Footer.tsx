import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { MdPhone, MdLocationOn } from 'react-icons/md';
import { getFooterCategories } from '@/lib/catalog';
import { getSiteSettings } from '@/lib/admin-actions';

interface FooterProps {
    t: (key: string) => string;
    language: string;
}

function isExternalUrl(url: string) {
    return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

function getLocalizedValue(language: string, englishValue?: string | null, arabicValue?: string | null) {
    if (language === 'ar') {
        return arabicValue || englishValue || '';
    }
    return englishValue || arabicValue || '';
}

const Footer = async ({ t: _t, language }: FooterProps) => {
    const isArabic = language === 'ar';
    let settings = null;
    let customCategories: { id: string; name: string; slug: string; description?: string | null }[] = [];

    try {
        settings = await getSiteSettings();
    } catch (e) {
        console.warn('Footer: DB offline, using default site settings');
    }

    try {
        customCategories = await getFooterCategories([
            settings?.footerCategory1Id || '',
            settings?.footerCategory2Id || '',
            settings?.footerCategory3Id || '',
            settings?.footerCategory4Id || '',
        ]);
    } catch (e) {
        console.warn('Footer: DB offline, using default footer categories');
    }

    const brandTitle =
        getLocalizedValue(language, settings?.footerBrandTitle, settings?.footerBrandTitleAr) ||
        (isArabic ? 'شركة حـوا للتوزيع والتجارة' : 'Hawa Distribution & Trading');

    const brandDescription =
        getLocalizedValue(language, settings?.footerBrandDescription, settings?.footerBrandDescriptionAr) ||
        (isArabic
            ? 'الموزع المعتمد لكبرى شركات ومصانع الأغذية والاستهلاك في سورية. نوفر طلبيات المحلات والسوبرماركت وتجار التجزئة بأسعار الجملة الرسمية وتوصيل منتظم لكافة المحافظات.'
            : 'Certified wholesale distributor for leading food and FMCG manufacturers across Syria. Direct factory carton supply for supermarkets and grocery retailers with scheduled delivery.');

    const copyright =
        getLocalizedValue(language, settings?.footerCopyright, settings?.footerCopyrightAr) ||
        (isArabic
            ? '© 2026 شركة حوا للتوزيع والتجارة. جميع الحقوق محفوظة.'
            : '© 2026 Hawa Distribution & Trading. All rights reserved.');

    const shopTitle =
        getLocalizedValue(language, settings?.footerShopTitle, settings?.footerShopTitleAr) ||
        (isArabic ? 'أقسام السلع بالجملة' : 'Wholesale Categories');

    const supportTitle =
        getLocalizedValue(language, settings?.footerSupportTitle, settings?.footerSupportTitleAr) ||
        (isArabic ? 'اللوجستيات والتوريد' : 'Logistics & Supply');

    const companyTitle =
        getLocalizedValue(language, settings?.footerCompanyTitle, settings?.footerCompanyTitleAr) ||
        (isArabic ? 'بوابة التاجر والشركة' : 'Merchant & Company');

    // WhatsApp numbers & Contacts
    const wholesalePhone = '+963 993 443 901';
    const managementPhone = '+963 994 166 000';
    const whatsappClean = '963993443901';

    // Wholesale Category Links (combining custom if valid, otherwise curated top wholesale lines)
    const defaultWholesaleCategories = [
        { label: isArabic ? 'جميع منتجات الجملة' : 'All Wholesale Products', href: '/products' },
        { label: isArabic ? 'الزيوت والمسليات النباتية' : 'Cooking Oils & Ghee', href: '/categories/alreef-smn-wzyt' },
        { label: isArabic ? 'المعلبات والكونسروة الفاخرة' : 'Canned Goods & Preserves', href: '/categories/sunbell-malbat' },
        { label: isArabic ? 'البقوليات والحبوب الجافة' : 'Legumes & Dry Grains', href: '/categories/alreef-bqwlyat' },
        { label: isArabic ? 'الألبان والمواد التموينية' : 'Dairy & Staple Groceries', href: '/categories/haleebna-aam' },
        { label: isArabic ? 'المنظفات ومواد العناية' : 'Detergents & Hygiene Care', href: '/departments/detergents' },
    ];

    const renderedCategories = customCategories.length > 0
        ? [
            { label: isArabic ? 'جميع منتجات الجملة' : 'All Wholesale Products', href: '/products' },
            ...customCategories.map((c) => ({
                label: isArabic ? c.name : (c.description || c.name),
                href: `/categories/${c.slug}`,
            })),
        ]
        : defaultWholesaleCategories;

    // Logistics & Operations Links
    const rawSupportLinks = [
        {
            label: getLocalizedValue(language, settings?.footerSupportLink1Label, settings?.footerSupportLink1LabelAr),
            url: settings?.footerSupportLink1Url || '',
        },
        {
            label: getLocalizedValue(language, settings?.footerSupportLink2Label, settings?.footerSupportLink2LabelAr),
            url: settings?.footerSupportLink2Url || '',
        },
        {
            label: getLocalizedValue(language, settings?.footerSupportLink3Label, settings?.footerSupportLink3LabelAr),
            url: settings?.footerSupportLink3Url || '',
        },
    ].filter((l) => l.label && l.url && l.url !== '#');

    const defaultSupportLinks = [
        { label: isArabic ? 'الوكالات والعلامات المعتمدة' : 'Official Trade Brands', href: '/brands' },
        { label: isArabic ? 'سياسة الشحن ومواعيد التوريد' : 'Shipping & Delivery Schedule', href: '/shipping-returns' },
        { label: isArabic ? 'نشرة الأسعار وتقارير السوق' : 'Trade Journal & Market Rates', href: '/blog' },
        { label: isArabic ? 'شروط استلام وتدقيق الكراتين' : 'Inspection & Acceptance Policy', href: '/shipping-returns' },
        { label: isArabic ? 'فريق المبيعات والتواصل المباشر' : 'Contact Sales Team', href: '/contact' },
    ];

    const renderedSupportLinks = rawSupportLinks.length > 0
        ? rawSupportLinks.map((l) => ({ label: l.label, href: l.url }))
        : defaultSupportLinks;

    // Company & Merchant Portal Links
    const rawCompanyLinks = [
        {
            label: getLocalizedValue(language, settings?.footerCompanyLink1Label, settings?.footerCompanyLink1LabelAr),
            url: settings?.footerCompanyLink1Url || '',
        },
        {
            label: getLocalizedValue(language, settings?.footerCompanyLink2Label, settings?.footerCompanyLink2LabelAr),
            url: settings?.footerCompanyLink2Url || '',
        },
        {
            label: getLocalizedValue(language, settings?.footerCompanyLink3Label, settings?.footerCompanyLink3LabelAr),
            url: settings?.footerCompanyLink3Url || '',
        },
    ].filter((l) => l.label && l.url && l.url !== '#');

    const defaultCompanyLinks = [
        { label: isArabic ? 'من نحن ورؤيتنا للتوزيع' : 'About Hawa Trading', href: '/about-us' },
        { label: isArabic ? 'تسجيل / دخول حساب تاجر' : 'Merchant Account Login', href: '/account/login' },
        { label: isArabic ? 'طلب تمثيل وكالة تجارية' : 'Agency Partnership Inquiry', href: '/contact' },
        { label: isArabic ? 'المستودعات ومراكز الإمداد' : 'Central Warehouses Hub', href: '/contact' },
        { label: isArabic ? 'واتساب مبيعات الجملة المباشر' : 'WhatsApp Wholesale Desk', href: `https://wa.me/${whatsappClean}` },
    ];

    const renderedCompanyLinks = rawCompanyLinks.length > 0
        ? rawCompanyLinks.map((l) => ({ label: l.label, href: l.url }))
        : defaultCompanyLinks;

    // Social Links
    const socialLinks = [
        {
            href: `https://wa.me/${whatsappClean}?text=${encodeURIComponent(isArabic ? 'مرحباً شركة حوا للتوزيع، أود الاستفسار عن بضائع الجملة.' : 'Hello Hawa Distribution, I would like to inquire about wholesale goods.')}`,
            icon: FaWhatsapp,
            label: 'WhatsApp',
        },
        {
            href: settings?.footerFacebookUrl && settings.footerFacebookUrl !== '#' ? settings.footerFacebookUrl : 'https://facebook.com',
            icon: FaFacebook,
            label: 'Facebook',
        },
        {
            href: settings?.footerInstagramUrl && settings.footerInstagramUrl !== '#' ? settings.footerInstagramUrl : 'https://instagram.com',
            icon: FaInstagram,
            label: 'Instagram',
        },
    ];

    const renderLink = (label: string, href: string) => {
        if (isExternalUrl(href)) {
            return (
                <a
                    className="text-slate-300 hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E5B54A] rounded-xs"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {label}
                </a>
            );
        }

        return (
            <Link
                className="text-slate-300 hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E5B54A] rounded-xs"
                href={href}
            >
                {label}
            </Link>
        );
    };

    return (
        <footer className="bg-[#0B192C] text-white border-t border-[#E5B54A]/30 pt-12 pb-8">
            <div className="container-custom">
                {/* Main Footer Grid: 4 Balanced Columns (4 + 3 + 3 + 2 = 12 cols) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
                    {/* Brand & Identity Column (lg:col-span-4) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E5B54A] rounded-lg w-fit"
                        >
                            <Image
                                src="/logo-bg.webp"
                                alt={brandTitle}
                                width={54}
                                height={54}
                                className="h-12 w-12 rounded-xl object-contain shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight group-hover:text-[#E5B54A] transition-colors">
                                    {brandTitle}
                                </span>
                                <span className="text-[10px] font-extrabold text-[#E5B54A] tracking-wider uppercase mt-0.5">
                                    {isArabic ? 'توريد وتوزيع جملة — حمص، سورية' : 'Wholesale Distribution & Trading — Syria'}
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                            {brandDescription}
                        </p>

                        {/* Direct Contacts */}
                        <div className="flex flex-col gap-2.5 pt-1 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                                <MdPhone className="text-[#E5B54A] text-sm shrink-0" aria-hidden="true" />
                                <span className="font-semibold text-slate-300">
                                    {isArabic ? 'مبيعات الجملة:' : 'Wholesale Sales:'}
                                </span>
                                <a
                                    href={`tel:${wholesalePhone.replace(/\s+/g, '')}`}
                                    dir="ltr"
                                    className="font-bold text-white hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs ms-1"
                                >
                                    {wholesalePhone}
                                </a>
                            </div>

                            <div className="flex items-center gap-2">
                                <MdPhone className="text-[#E5B54A] text-sm shrink-0" aria-hidden="true" />
                                <span className="font-semibold text-slate-300">
                                    {isArabic ? 'الإدارة العامة:' : 'Management:'}
                                </span>
                                <a
                                    href={`tel:${managementPhone.replace(/\s+/g, '')}`}
                                    dir="ltr"
                                    className="font-bold text-white hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs ms-1"
                                >
                                    {managementPhone}
                                </a>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400">
                                <MdLocationOn className="text-[#E5B54A] text-sm shrink-0" aria-hidden="true" />
                                <span className="font-semibold text-slate-300">
                                    {isArabic ? 'المستودع الرئيسي:' : 'Central Hub:'}
                                </span>
                                <span className="text-slate-400 font-medium ms-1">
                                    {isArabic ? 'حمص، المنطقة الصناعية' : 'Homs Industrial Zone'}
                                </span>
                            </div>
                        </div>

                        {/* Social & Messaging Channels */}
                        <div className="flex items-center gap-2 pt-1">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        className="w-8 h-8 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-[#E5B54A] hover:text-[#0B192C] transition-all flex items-center justify-center text-sm border border-white/10 hover:border-[#E5B54A] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E5B54A]"
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                    >
                                        <Icon aria-hidden="true" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Column 2: Wholesale Commodity Categories (lg:col-span-3) */}
                    <div className="lg:col-span-3 flex flex-col gap-3.5">
                        <h5 className="font-extrabold text-xs text-[#E5B54A] uppercase tracking-wider">
                            {shopTitle}
                        </h5>
                        <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-medium">
                            {renderedCategories.map((cat, idx) => (
                                <li key={idx}>
                                    {renderLink(cat.label, cat.href)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Logistics & Supply Network (lg:col-span-3) */}
                    <div className="lg:col-span-3 flex flex-col gap-3.5">
                        <h5 className="font-extrabold text-xs text-[#E5B54A] uppercase tracking-wider">
                            {supportTitle}
                        </h5>
                        <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-medium">
                            {renderedSupportLinks.map((link, idx) => (
                                <li key={idx}>
                                    {renderLink(link.label, link.href)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Merchant Portal & Relations (lg:col-span-2) */}
                    <div className="lg:col-span-2 flex flex-col gap-3.5">
                        <h5 className="font-extrabold text-xs text-[#E5B54A] uppercase tracking-wider">
                            {companyTitle}
                        </h5>
                        <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-medium">
                            {renderedCompanyLinks.map((link, idx) => (
                                <li key={idx}>
                                    {renderLink(link.label, link.href)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 3. Bottom Utility & Copyright Bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-start">
                        <p>{copyright}</p>
                        <span className="hidden sm:inline text-white/20">•</span>
                        <p className="text-slate-400">
                            {isArabic
                                ? 'الجمهورية العربية السورية — حمص، تغطية شاملة لكافة المحافظات'
                                : 'Syrian Arab Republic — Homs, Serving All Governorates'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs">
                        <Link
                            href="/shipping-returns"
                            className="hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                        >
                            {isArabic ? 'سياسة التوريد' : 'Supply Terms'}
                        </Link>
                        <span className="text-white/20">|</span>
                        <Link
                            href="/brands"
                            className="hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                        >
                            {isArabic ? 'الوكالات المعتمدة' : 'Brands'}
                        </Link>
                        <span className="text-white/20">|</span>
                        <Link
                            href="/contact"
                            className="hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                        >
                            {isArabic ? 'اتصل بنا' : 'Contact'}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
