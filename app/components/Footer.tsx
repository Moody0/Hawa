import Link from 'next/link';
import React from 'react';
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
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
        return arabicValue || englishValue || "";
    }

    return englishValue || arabicValue || "";
}

const Footer = async ({ t, language }: FooterProps) => {
    let settings = null;
    let footerCategories: { id: string; name: string; slug: string; description?: string | null }[] = [];
    
    try {
        settings = await getSiteSettings();
    } catch (e) {
        console.error("Footer: Failed to load site settings:", e);
    }

    try {
        footerCategories = await getFooterCategories([
            settings?.footerCategory1Id || "",
            settings?.footerCategory2Id || "",
            settings?.footerCategory3Id || "",
            settings?.footerCategory4Id || "",
        ]);
    } catch (e) {
        console.error("Footer: Failed to load footer categories:", e);
    }

    const brandTitle = getLocalizedValue(language, settings?.footerBrandTitle, settings?.footerBrandTitleAr) || t('header.brandName');
    const brandDescription = getLocalizedValue(language, settings?.footerBrandDescription, settings?.footerBrandDescriptionAr) || t('footer.brandDescription');
    const copyright = getLocalizedValue(language, settings?.footerCopyright, settings?.footerCopyrightAr) || t('footer.copyright');
    const shopTitle = getLocalizedValue(language, settings?.footerShopTitle, settings?.footerShopTitleAr) || t('footer.shop');
    const supportTitle = getLocalizedValue(language, settings?.footerSupportTitle, settings?.footerSupportTitleAr) || t('footer.support');
    const companyTitle = getLocalizedValue(language, settings?.footerCompanyTitle, settings?.footerCompanyTitleAr) || t('footer.company');

    const supportLinks = [
        {
            label: getLocalizedValue(language, settings?.footerSupportLink1Label, settings?.footerSupportLink1LabelAr),
            url: settings?.footerSupportLink1Url || "",
        },
        {
            label: getLocalizedValue(language, settings?.footerSupportLink2Label, settings?.footerSupportLink2LabelAr),
            url: settings?.footerSupportLink2Url || "",
        },
        {
            label: getLocalizedValue(language, settings?.footerSupportLink3Label, settings?.footerSupportLink3LabelAr),
            url: settings?.footerSupportLink3Url || "",
        },
    ].filter((link) => link.label && link.url);

    const companyLinks = [
        {
            label: getLocalizedValue(language, settings?.footerCompanyLink1Label, settings?.footerCompanyLink1LabelAr),
            url: settings?.footerCompanyLink1Url || "",
        },
        {
            label: getLocalizedValue(language, settings?.footerCompanyLink2Label, settings?.footerCompanyLink2LabelAr),
            url: settings?.footerCompanyLink2Url || "",
        },
        {
            label: getLocalizedValue(language, settings?.footerCompanyLink3Label, settings?.footerCompanyLink3LabelAr),
            url: settings?.footerCompanyLink3Url || "",
        },
    ].filter((link) => link.label && link.url);

    const socialLinks = [
        {
            href: settings?.footerInstagramUrl || "#",
            icon: FaInstagram,
            label: "Instagram",
        },
        {
            href: settings?.footerFacebookUrl || "#",
            icon: FaFacebook,
            label: "Facebook",
        },
        {
            href: settings?.footerWhatsappUrl || "#",
            icon: FaWhatsapp,
            label: "WhatsApp",
        },
    ].filter((link) => link.href);

    const renderNavLink = (label: string, href: string) => {
        if (isExternalUrl(href)) {
            return (
                <a className="hover:text-[#8A6305] transition-colors" href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                </a>
            );
        }

        return (
            <Link className="hover:text-[#8A6305] transition-colors" href={href}>
                {label}
            </Link>
        );
    };

    return (
        <footer className="bg-[#0B192C] text-white border-t-2 border-[#8A6305]/40 pt-14 pb-8">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Link href="/" className="inline-block mb-1">
                            <h4 className="text-2xl font-extrabold text-[#8A6305] tracking-tight">
                                {brandTitle}
                            </h4>
                        </Link>
                        <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
                            {brandDescription}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[#8A6305] hover:text-white transition-all flex items-center justify-center text-sm border border-white/10 hover:border-[#8A6305]"
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                    >
                                        <Icon />
                                    </a>
                                );
                            })}
                        </div>

                        {/* Direct Contacts */}
                        <div className="pt-2 flex flex-col gap-1.5 text-xs text-gray-300">
                            <div className="flex items-center gap-2">
                                <span className="text-[#8A6305] font-bold">{language === 'ar' ? 'مبيعات الجملة:' : 'Wholesale Sales:'}</span>
                                <a href="tel:+963993443901" dir="ltr" className="hover:text-white transition-colors font-semibold">+963 993 443 901</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#8A6305] font-bold">{language === 'ar' ? 'الإدارة العامة:' : 'General Management:'}</span>
                                <a href="tel:+963994166000" dir="ltr" className="hover:text-white transition-colors font-semibold">+963 994 166 000</a>
                            </div>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="flex flex-col gap-4">
                        <h5 className="font-bold text-sm text-[#8A6305] uppercase tracking-wider">{shopTitle}</h5>
                        <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-medium text-gray-300">
                            {footerCategories.length > 0 ? (
                                footerCategories.map((category) => (
                                    <li key={category.id}>
                                        <Link className="hover:text-[#8A6305] transition-colors" href={`/categories/${category.slug}`}>
                                            {language === 'ar' ? category.name : (category.description || category.name)}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <Link className="hover:text-[#8A6305] transition-colors" href="/products">
                                        {t('products.allProducts')}
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="flex flex-col gap-4">
                        <h5 className="font-bold text-sm text-[#8A6305] uppercase tracking-wider">{supportTitle}</h5>
                        <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-medium text-gray-300">
                            {supportLinks.map((link) => (
                                <li key={`${link.label}-${link.url}`}>
                                    {renderNavLink(link.label, link.url)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="flex flex-col gap-4">
                        <h5 className="font-bold text-sm text-[#8A6305] uppercase tracking-wider">{companyTitle}</h5>
                        <ul className="flex flex-col gap-2.5 text-xs sm:text-sm font-medium text-gray-300">
                            {companyLinks.map((link) => (
                                <li key={`${link.label}-${link.url}`}>
                                    {renderNavLink(link.label, link.url)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Line */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
                    <p>{copyright}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
