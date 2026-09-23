"use client";

import React from "react";
import { FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { Phone, MapPin, Mail, Globe, ShieldCheck, Building2, Bell } from "lucide-react";

interface FooterCategoryOption {
    id: string;
    name: string;
}

interface FooterContentSectionProps {
    footerContent: Record<string, string>;
    categories?: FooterCategoryOption[];
    onFieldChange: (field: string, value: string) => void;
    t: (key: string) => string;
}

function SectionTitle({
    title,
    description,
    icon,
}: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex items-start gap-3">
            {icon ? (
                <div className="p-2.5 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:bg-[#8A6305]/20 dark:text-[#E5B54A] shrink-0 mt-0.5">
                    {icon}
                </div>
            ) : null}
            <div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
                {description ? (
                    <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">{description}</p>
                ) : null}
            </div>
        </div>
    );
}

function TextField({
    label,
    value,
    onChange,
    placeholder,
    dir,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    dir?: "ltr" | "rtl";
}) {
    return (
        <div className="space-y-1.5" dir={dir}>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/15"
            />
        </div>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    rows = 3,
    placeholder,
    dir,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
    dir?: "ltr" | "rtl";
}) {
    return (
        <div className="space-y-1.5" dir={dir}>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>
            <textarea
                rows={rows}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full resize-none rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/15"
            />
        </div>
    );
}

function LinkEditor({
    title,
    labelValue,
    labelArValue,
    urlValue,
    onFieldChange,
    labelKey,
    labelArKey,
    urlKey,
    defaultUrl,
    t,
}: {
    title: string;
    labelValue: string;
    labelArValue: string;
    urlValue: string;
    onFieldChange: (field: string, value: string) => void;
    labelKey: string;
    labelArKey: string;
    urlKey: string;
    defaultUrl?: string;
    t: (key: string) => string;
}) {
    return (
        <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4 transition-colors hover:border-slate-300 dark:hover:border-white/20">
            <p className="mb-3 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>{title}</span>
                {urlValue ? (
                    <span className="text-[11px] font-mono text-slate-400 font-normal truncate max-w-[200px]" dir="ltr">
                        {urlValue}
                    </span>
                ) : null}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <TextField
                    label={`${t('admin.englishLabel') || 'English Label'}`}
                    value={labelValue}
                    onChange={(value) => onFieldChange(labelKey, value)}
                />
                <TextField
                    label={`${t('admin.arabicLabel') || 'Arabic Label'}`}
                    value={labelArValue}
                    onChange={(value) => onFieldChange(labelArKey, value)}
                    dir="rtl"
                />
                <TextField
                    label={t('admin.linkUrl') || 'Target URL / Path'}
                    value={urlValue}
                    onChange={(value) => onFieldChange(urlKey, value)}
                    placeholder={defaultUrl || "/page-path or https://..."}
                    dir="ltr"
                />
            </div>
        </div>
    );
}

export default function FooterContentSection({
    footerContent,
    onFieldChange,
    t,
}: FooterContentSectionProps) {
    return (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* 1. Brand & Identity (Column 1) */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    icon={<Building2 className="w-5 h-5" />}
                    title={t('admin.footerBranding') || '1. Brand & Identity (Column 1)'}
                    description={t('admin.footerBrandingDescription') || 'Configure brand logo text, subtitle/tagline, description paragraph, and the bottom copyright declaration.'}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                            🇬🇧 English Identity
                        </span>
                        <TextField
                            label={t('admin.brandName') || 'Brand Name'}
                            value={footerContent.footerBrandTitle}
                            onChange={(value) => onFieldChange('footerBrandTitle', value)}
                            placeholder="Hawa Distribution"
                        />
                        <TextField
                            label="Brand Tagline / Subtitle"
                            value={footerContent.footerBrandTagline}
                            onChange={(value) => onFieldChange('footerBrandTagline', value)}
                            placeholder="Wholesale Distribution — Syria"
                        />
                        <TextAreaField
                            label={t('admin.description') || 'Company Overview'}
                            value={footerContent.footerBrandDescription}
                            onChange={(value) => onFieldChange('footerBrandDescription', value)}
                            rows={3}
                            placeholder="Your trusted partner in wholesale food and consumer goods distribution..."
                        />
                        <TextField
                            label={t('admin.copyrightText') || 'Copyright Statement'}
                            value={footerContent.footerCopyright}
                            onChange={(value) => onFieldChange('footerCopyright', value)}
                            placeholder="© 2026 Hawa Distribution & Trading. All rights reserved."
                        />
                    </div>

                    <div className="space-y-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                            🇸🇦 الهوية باللغة العربية
                        </span>
                        <TextField
                            label={t('admin.brandName') || 'اسم الشركة'}
                            value={footerContent.footerBrandTitleAr}
                            onChange={(value) => onFieldChange('footerBrandTitleAr', value)}
                            placeholder="حوا للتوزيع والتجارة"
                            dir="rtl"
                        />
                        <TextField
                            label="الوصف المختصر تحت الشعار"
                            value={footerContent.footerBrandTaglineAr}
                            onChange={(value) => onFieldChange('footerBrandTaglineAr', value)}
                            placeholder="توزيع وتجارة جملة — سورية"
                            dir="rtl"
                        />
                        <TextAreaField
                            label={t('admin.description') || 'النبذة التعريفية'}
                            value={footerContent.footerBrandDescriptionAr}
                            onChange={(value) => onFieldChange('footerBrandDescriptionAr', value)}
                            rows={3}
                            placeholder="شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية..."
                            dir="rtl"
                        />
                        <TextField
                            label={t('admin.copyrightText') || 'حقوق النشر والملكية'}
                            value={footerContent.footerCopyrightAr}
                            onChange={(value) => onFieldChange('footerCopyrightAr', value)}
                            placeholder="© 2026 حوا للتوزيع والتجارة. جميع الحقوق محفوظة."
                            dir="rtl"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Direct Contact & Head Office Details (Column 2) */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    icon={<MapPin className="w-5 h-5" />}
                    title="2. Direct Contact & Office Details (Column 2)"
                    description="Configure physical depot address, wholesale inquiry phone numbers, and official sales email."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label="Column Heading (English)"
                        value={footerContent.footerContactTitle}
                        onChange={(value) => onFieldChange('footerContactTitle', value)}
                        placeholder="Contact Us"
                    />
                    <TextField
                        label="عنوان العمود (عربي)"
                        value={footerContent.footerContactTitleAr}
                        onChange={(value) => onFieldChange('footerContactTitleAr', value)}
                        placeholder="تواصل معنا"
                        dir="rtl"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label="Depot / Industrial Zone Address (English)"
                        value={footerContent.footerAddress}
                        onChange={(value) => onFieldChange('footerAddress', value)}
                        placeholder="Homs Industrial Zone, Syria"
                    />
                    <TextField
                        label="العنوان والمقر الرئيسي (عربي)"
                        value={footerContent.footerAddressAr}
                        onChange={(value) => onFieldChange('footerAddressAr', value)}
                        placeholder="حمص، المنطقة الصناعية — سورية"
                        dir="rtl"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <Phone className="w-4 h-4 text-[#8A6305]" />
                            <span className="text-xs font-bold uppercase">Wholesale Phone</span>
                        </div>
                        <TextField
                            label="Direct Line"
                            value={footerContent.footerPhone}
                            onChange={(value) => onFieldChange('footerPhone', value)}
                            placeholder="+963 993 443 901"
                            dir="ltr"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <Mail className="w-4 h-4 text-[#8A6305]" />
                            <span className="text-xs font-bold uppercase">Official Email</span>
                        </div>
                        <TextField
                            label="Sales & Inquiries Email"
                            value={footerContent.footerEmail}
                            onChange={(value) => onFieldChange('footerEmail', value)}
                            placeholder="info@hawa-dist.com"
                            dir="ltr"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold uppercase">Order WhatsApp Number</span>
                        </div>
                        <TextField
                            label="Target WhatsApp Number"
                            value={footerContent.whatsappNumber}
                            onChange={(value) => {
                                onFieldChange('whatsappNumber', value);
                                if (!footerContent.footerWhatsappUrl || footerContent.footerWhatsappUrl === '#' || footerContent.footerWhatsappUrl.startsWith('https://wa.me/')) {
                                    const cleaned = value.replace(/[^0-9]/g, '');
                                    onFieldChange('footerWhatsappUrl', `https://wa.me/${cleaned}`);
                                }
                            }}
                            placeholder="+963 993 443 901"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Column 3: Wholesale Services Links */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    icon={<Globe className="w-5 h-5" />}
                    title="3. Wholesale Services Column (Column 3)"
                    description="Edit column header and the 4 primary links for logistics, trade blog, and trade inquiries."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label="Column Heading (English)"
                        value={footerContent.footerSupportTitle}
                        onChange={(value) => onFieldChange('footerSupportTitle', value)}
                        placeholder="Our Services"
                    />
                    <TextField
                        label="عنوان العمود (عربي)"
                        value={footerContent.footerSupportTitleAr}
                        onChange={(value) => onFieldChange('footerSupportTitleAr', value)}
                        placeholder="خدماتنا"
                        dir="rtl"
                    />
                </div>

                <div className="space-y-3">
                    <LinkEditor
                        title="Service Link 1"
                        labelValue={footerContent.footerSupportLink1Label}
                        labelArValue={footerContent.footerSupportLink1LabelAr}
                        urlValue={footerContent.footerSupportLink1Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink1Label"
                        labelArKey="footerSupportLink1LabelAr"
                        urlKey="footerSupportLink1Url"
                        defaultUrl="/shipping-returns"
                        t={t}
                    />
                    <LinkEditor
                        title="Service Link 2"
                        labelValue={footerContent.footerSupportLink2Label}
                        labelArValue={footerContent.footerSupportLink2LabelAr}
                        urlValue={footerContent.footerSupportLink2Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink2Label"
                        labelArKey="footerSupportLink2LabelAr"
                        urlKey="footerSupportLink2Url"
                        defaultUrl="/blog"
                        t={t}
                    />
                    <LinkEditor
                        title="Service Link 3"
                        labelValue={footerContent.footerSupportLink3Label}
                        labelArValue={footerContent.footerSupportLink3LabelAr}
                        urlValue={footerContent.footerSupportLink3Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink3Label"
                        labelArKey="footerSupportLink3LabelAr"
                        urlKey="footerSupportLink3Url"
                        defaultUrl="/contact"
                        t={t}
                    />
                    <LinkEditor
                        title="Service Link 4"
                        labelValue={footerContent.footerSupportLink4Label}
                        labelArValue={footerContent.footerSupportLink4LabelAr}
                        urlValue={footerContent.footerSupportLink4Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink4Label"
                        labelArKey="footerSupportLink4LabelAr"
                        urlKey="footerSupportLink4Url"
                        defaultUrl="/account/login"
                        t={t}
                    />
                </div>
            </div>

            {/* 4. Column 4: Quick Links / Navigation */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    icon={<Globe className="w-5 h-5" />}
                    title="4. Quick Links / Navigation (Column 4)"
                    description="Configure the primary store navigation links shown in the footer."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label="Column Heading (English)"
                        value={footerContent.footerCompanyTitle}
                        onChange={(value) => onFieldChange('footerCompanyTitle', value)}
                        placeholder="Quick Links"
                    />
                    <TextField
                        label="عنوان العمود (عربي)"
                        value={footerContent.footerCompanyTitleAr}
                        onChange={(value) => onFieldChange('footerCompanyTitleAr', value)}
                        placeholder="روابط سريعة"
                        dir="rtl"
                    />
                </div>

                <div className="space-y-3">
                    <LinkEditor
                        title="Quick Link 1"
                        labelValue={footerContent.footerCompanyLink1Label}
                        labelArValue={footerContent.footerCompanyLink1LabelAr}
                        urlValue={footerContent.footerCompanyLink1Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink1Label"
                        labelArKey="footerCompanyLink1LabelAr"
                        urlKey="footerCompanyLink1Url"
                        defaultUrl="/"
                        t={t}
                    />
                    <LinkEditor
                        title="Quick Link 2"
                        labelValue={footerContent.footerCompanyLink2Label}
                        labelArValue={footerContent.footerCompanyLink2LabelAr}
                        urlValue={footerContent.footerCompanyLink2Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink2Label"
                        labelArKey="footerCompanyLink2LabelAr"
                        urlKey="footerCompanyLink2Url"
                        defaultUrl="/about-us"
                        t={t}
                    />
                    <LinkEditor
                        title="Quick Link 3"
                        labelValue={footerContent.footerCompanyLink3Label}
                        labelArValue={footerContent.footerCompanyLink3LabelAr}
                        urlValue={footerContent.footerCompanyLink3Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink3Label"
                        labelArKey="footerCompanyLink3LabelAr"
                        urlKey="footerCompanyLink3Url"
                        defaultUrl="/brands"
                        t={t}
                    />
                    <LinkEditor
                        title="Quick Link 4"
                        labelValue={footerContent.footerCompanyLink4Label}
                        labelArValue={footerContent.footerCompanyLink4LabelAr}
                        urlValue={footerContent.footerCompanyLink4Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink4Label"
                        labelArKey="footerCompanyLink4LabelAr"
                        urlKey="footerCompanyLink4Url"
                        defaultUrl="/categories"
                        t={t}
                    />
                </div>
            </div>

            {/* 5. Column 5: Newsletter & Social Channels */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    icon={<Bell className="w-5 h-5" />}
                    title="5. Newsletter & Social Channels (Column 5)"
                    description="Customize newsletter titles, promotional description, and all official social media profile URLs."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <div className="space-y-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                            🇬🇧 English Newsletter
                        </span>
                        <TextField
                            label="Newsletter Title"
                            value={footerContent.footerNewsletterTitle}
                            onChange={(value) => onFieldChange('footerNewsletterTitle', value)}
                            placeholder="Newsletter"
                        />
                        <TextAreaField
                            label="Newsletter Description"
                            value={footerContent.footerNewsletterDesc}
                            onChange={(value) => onFieldChange('footerNewsletterDesc', value)}
                            rows={2}
                            placeholder="Subscribe to get the latest trade discounts, new arrivals & price lists."
                        />
                    </div>

                    <div className="space-y-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                            🇸🇦 النشرة البريدية بالعربي
                        </span>
                        <TextField
                            label="عنوان النشرة"
                            value={footerContent.footerNewsletterTitleAr}
                            onChange={(value) => onFieldChange('footerNewsletterTitleAr', value)}
                            placeholder="النشرة البريدية"
                            dir="rtl"
                        />
                        <TextAreaField
                            label="نص ووصف النشرة"
                            value={footerContent.footerNewsletterDescAr}
                            onChange={(value) => onFieldChange('footerNewsletterDescAr', value)}
                            rows={2}
                            placeholder="اشترك ليصلك كل جديد عن المنتجات والعروض والأسعار."
                            dir="rtl"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaWhatsapp className="text-lg text-emerald-600" />
                            <span className="text-xs font-bold uppercase">WhatsApp Link</span>
                        </div>
                        <TextField
                            label="URL"
                            value={footerContent.footerWhatsappUrl}
                            onChange={(value) => onFieldChange('footerWhatsappUrl', value)}
                            placeholder="https://wa.me/9639..."
                            dir="ltr"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaFacebook className="text-lg text-blue-600" />
                            <span className="text-xs font-bold uppercase">Facebook</span>
                        </div>
                        <TextField
                            label="URL"
                            value={footerContent.footerFacebookUrl}
                            onChange={(value) => onFieldChange('footerFacebookUrl', value)}
                            placeholder="https://facebook.com/..."
                            dir="ltr"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaInstagram className="text-lg text-pink-600" />
                            <span className="text-xs font-bold uppercase">Instagram</span>
                        </div>
                        <TextField
                            label="URL"
                            value={footerContent.footerInstagramUrl}
                            onChange={(value) => onFieldChange('footerInstagramUrl', value)}
                            placeholder="https://instagram.com/..."
                            dir="ltr"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaLinkedin className="text-lg text-sky-600" />
                            <span className="text-xs font-bold uppercase">LinkedIn</span>
                        </div>
                        <TextField
                            label="URL"
                            value={footerContent.footerLinkedinUrl}
                            onChange={(value) => onFieldChange('footerLinkedinUrl', value)}
                            placeholder="https://linkedin.com/company/..."
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* 6. Bottom Legal & Jurisdiction Bar */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    icon={<ShieldCheck className="w-5 h-5" />}
                    title="6. Legal Policies & Regional Jurisdiction (Bottom Bar)"
                    description="Configure links for Terms & Conditions and Privacy Policy, plus the official legal location statement."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label="Terms & Conditions Page URL"
                        value={footerContent.footerTermsUrl}
                        onChange={(value) => onFieldChange('footerTermsUrl', value)}
                        placeholder="/shipping-returns"
                        dir="ltr"
                    />
                    <TextField
                        label="Privacy Policy Page URL"
                        value={footerContent.footerPrivacyUrl}
                        onChange={(value) => onFieldChange('footerPrivacyUrl', value)}
                        placeholder="/shipping-returns"
                        dir="ltr"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <TextField
                        label="Jurisdiction / Region Note (English)"
                        value={footerContent.footerJurisdiction}
                        onChange={(value) => onFieldChange('footerJurisdiction', value)}
                        placeholder="Syrian Arab Republic — Homs"
                    />
                    <TextField
                        label="الصفة والمنطقة القانونية (عربي)"
                        value={footerContent.footerJurisdictionAr}
                        onChange={(value) => onFieldChange('footerJurisdictionAr', value)}
                        placeholder="الجمهورية العربية السورية — حمص"
                        dir="rtl"
                    />
                </div>
            </div>
        </div>
    );
}
