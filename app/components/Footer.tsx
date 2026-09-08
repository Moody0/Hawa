import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import { Phone, MapPin, Mail } from 'lucide-react';
import { getSiteSettings } from '@/lib/public-queries';
import FooterNewsletter from './FooterNewsletter';

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

    try {
        settings = await getSiteSettings();
    } catch (e) {
        console.warn('Footer: DB offline, using default site settings');
    }

    const brandTitle =
        getLocalizedValue(language, settings?.footerBrandTitle, settings?.footerBrandTitleAr) ||
        (isArabic ? 'شركة حـوا للتوزيع والتجارة' : 'Hawa Distribution & Trading');

    const brandDescription =
        getLocalizedValue(language, settings?.footerBrandDescription, settings?.footerBrandDescriptionAr) ||
        (isArabic
            ? 'شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية من أفضل الشركات والعلامات التجارية المحلية والعالمية.'
            : 'Your trusted partner for wholesale distribution of food and consumer goods from leading local and global brands.');

    const copyright =
        getLocalizedValue(language, settings?.footerCopyright, settings?.footerCopyrightAr) ||
        (isArabic
            ? 'جميع الحقوق محفوظة © 2026 شركة حوا للتوزيع والتجارة'
            : '© 2026 Hawa Distribution & Trading. All rights reserved.');

    // Direct Contacts
    const wholesalePhone = '+963 993 443 901';
    const emailAddress = 'info@hawa-dist.com';
    const whatsappClean = '963993443901';

    // 1. Column 3: Wholesale Services Links (using real platform routes & names)
    const servicesLinks = [
        { label: isArabic ? 'الشحن والتوصيل للمحافظات' : 'Nationwide Freight & Delivery', href: '/shipping-returns' },
        { label: isArabic ? 'نشرة الأسعار والمدونة' : 'Market Rates & Trade Blog', href: '/blog' },
        { label: isArabic ? 'طلب تمثيل وكالة تجارية' : 'Agency Partnership Inquiry', href: '/contact' },
        { label: isArabic ? 'بوابة حسابات التجار' : 'Merchant Accounts Hub', href: '/account/login' },
    ];

    // 2. Column 4: Quick Links (using real platform routes & names)
    const quickLinks = [
        { label: isArabic ? 'الرئيسية' : 'Home', href: '/' },
        { label: isArabic ? 'من نحن' : 'About Us', href: '/about-us' },
        { label: isArabic ? 'الوكالات والعلامات' : 'Official Brands', href: '/brands' },
        { label: isArabic ? 'أقسام المنتجات' : 'Product Categories', href: '/categories' },
        { label: isArabic ? 'كتالوج المنتجات' : 'Full Catalog', href: '/products' },
        { label: isArabic ? 'اتصل بنا' : 'Contact Us', href: '/contact' },
    ];

    // 3. Social Media Links
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
        {
            href: 'https://linkedin.com',
            icon: FaLinkedin,
            label: 'LinkedIn',
        },
    ];

    const renderLink = (label: string, href: string) => {
        const isExt = isExternalUrl(href);
        const Component = isExt ? 'a' : Link;
        const extraProps = isExt ? { target: '_blank', rel: 'noopener noreferrer' } : {};

        return (
            <Component
                href={href}
                {...extraProps}
                className="group flex items-center gap-2 text-xs sm:text-[13px] text-slate-300 hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A6305] group-hover:bg-[#E5B54A] group-hover:scale-125 transition-all shrink-0" />
                <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">{label}</span>
            </Component>
        );
    };

    return (
        <footer className="bg-[#0B192C] text-white border-t border-[#8A6305]/30 pt-12 pb-8 relative overflow-hidden">
            {/* Subtle background ambient gradient */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8A6305]/40 to-transparent pointer-events-none" />

            <div className="container-custom">
                {/* 5-Column Grid with Desktop Vertical Border Separators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-0 mb-12">
                    
                    {/* Column 1: Brand & Identity (lg:col-span-3 lg:pe-6) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 lg:pe-6 lg:border-e lg:border-white/10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#8A6305] rounded-xl w-fit"
                        >
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-[#8A6305]/40 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
                                <Image
                                    src="/logo-bg.webp"
                                    alt={brandTitle}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base sm:text-lg font-black text-white tracking-tight leading-tight group-hover:text-[#E5B54A] transition-colors">
                                    {brandTitle}
                                </span>
                                <span className="text-[10px] font-bold text-[#E5B54A] tracking-wider uppercase mt-0.5">
                                    {isArabic ? 'توزيع وتجارة جملة — سورية' : 'Wholesale Distribution — Syria'}
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-sm">
                            {brandDescription}
                        </p>
                    </div>

                    {/* Column 2: Contact & Working Hours (lg:col-span-3 lg:px-6) */}
                    <div className="lg:col-span-3 flex flex-col gap-3.5 lg:px-6 lg:border-e lg:border-white/10">
                        <h5 className="font-black text-xs sm:text-sm text-[#E5B54A] uppercase tracking-wider flex items-center gap-2">
                            <span>{isArabic ? 'تواصل معنا' : 'Contact Us'}</span>
                        </h5>

                        <div className="flex flex-col gap-3 text-xs sm:text-[13px] text-slate-300">
                            {/* Location */}
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-[#E5B54A] shrink-0 mt-0.5" aria-hidden="true" />
                                <span className="leading-snug">
                                    {isArabic ? 'حمص، المنطقة الصناعية — سورية' : 'Homs Industrial Zone, Syria'}
                                </span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-[#E5B54A] shrink-0" aria-hidden="true" />
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400 font-medium text-xs">
                                        {isArabic ? 'مبيعات الجملة:' : 'Wholesale:'}
                                    </span>
                                    <a
                                        href={`tel:${wholesalePhone.replace(/\s+/g, '')}`}
                                        dir="ltr"
                                        className="font-bold text-white hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                                    >
                                        {wholesalePhone}
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-[#E5B54A] shrink-0" aria-hidden="true" />
                                <a
                                    href={`mailto:${emailAddress}`}
                                    className="font-medium text-white hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                                >
                                    {emailAddress}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Wholesale Services (lg:col-span-2 lg:px-6) */}
                    <div className="lg:col-span-2 flex flex-col gap-3.5 lg:px-6 lg:border-e lg:border-white/10">
                        <h5 className="font-black text-xs sm:text-sm text-[#E5B54A] uppercase tracking-wider">
                            {isArabic ? 'خدماتنا' : 'Our Services'}
                        </h5>
                        <ul className="flex flex-col gap-2.5">
                            {servicesLinks.map((link, idx) => (
                                <li key={idx}>
                                    {renderLink(link.label, link.href)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Quick Links (lg:col-span-2 lg:px-6) */}
                    <div className="lg:col-span-2 flex flex-col gap-3.5 lg:px-6 lg:border-e lg:border-white/10">
                        <h5 className="font-black text-xs sm:text-sm text-[#E5B54A] uppercase tracking-wider">
                            {isArabic ? 'روابط سريعة' : 'Quick Links'}
                        </h5>
                        <ul className="flex flex-col gap-2.5">
                            {quickLinks.map((link, idx) => (
                                <li key={idx}>
                                    {renderLink(link.label, link.href)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 5: Newsletter & Community (lg:col-span-2 lg:ps-6) */}
                    <div className="lg:col-span-2 flex flex-col gap-3.5 lg:ps-6">
                        <h5 className="font-black text-xs sm:text-sm text-[#E5B54A] uppercase tracking-wider">
                            {isArabic ? 'النشرة البريدية' : 'Newsletter'}
                        </h5>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            {isArabic
                                ? 'اشترك ليصلك كل جديد عن المنتجات والعروض والأسعار.'
                                : 'Subscribe to get the latest trade discounts, new arrivals & price lists.'}
                        </p>

                        {/* Interactive Newsletter Subscription */}
                        <FooterNewsletter language={language} />

                        {/* Social Channels */}
                        <div className="flex flex-col gap-2 pt-2">
                            <span className="text-[11px] font-semibold text-slate-400">
                                {isArabic ? 'تابعنا على منصاتنا:' : 'Follow our channels:'}
                            </span>
                            <div className="flex items-center gap-2">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={social.label}
                                            className="w-8 h-8 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-[#8A6305] hover:text-white transition-all duration-200 flex items-center justify-center text-sm border border-white/10 hover:border-[#8A6305] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#8A6305]"
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
                    </div>

                </div>

                {/* Bottom Bar: Terms, Copyright */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
                    {/* Legal Links */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/shipping-returns"
                            className="hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                        >
                            {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
                        </Link>
                        <span className="text-white/20">•</span>
                        <Link
                            href="/shipping-returns"
                            className="hover:text-[#E5B54A] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#E5B54A] rounded-xs"
                        >
                            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
                        </Link>
                    </div>

                    {/* Copyright & Jurisdiction */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center">
                        <p className="text-slate-300">{copyright}</p>
                        <span className="hidden sm:inline text-white/20">•</span>
                        <p className="text-slate-400 text-[11px]">
                            {isArabic
                                ? 'الجمهورية العربية السورية — حمص'
                                : 'Syrian Arab Republic — Homs'}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
