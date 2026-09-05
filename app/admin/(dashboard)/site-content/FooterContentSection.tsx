"use client";

import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

interface FooterCategoryOption {
    id: string;
    name: string;
}

interface FooterContentSectionProps {
    footerContent: Record<string, string>;
    categories: FooterCategoryOption[];
    onFieldChange: (field: string, value: string) => void;
    t: (key: string) => string;
}

function SectionTitle({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            {description ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
        </div>
    );
}

function TextField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
            />
        </div>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    rows = 4,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
            />
        </div>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: FooterCategoryOption[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 cursor-pointer"
            >
                <option value="">{label}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
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
    t: (key: string) => string;
}) {
    return (
        <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
            <p className="mb-3 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{title}</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <TextField
                    label={`${t('admin.englishLabel') || 'English Label'}`}
                    value={labelValue}
                    onChange={(value) => onFieldChange(labelKey, value)}
                />
                <div dir="rtl">
                    <TextField
                        label={`${t('admin.arabicLabel') || 'Arabic Label'}`}
                        value={labelArValue}
                        onChange={(value) => onFieldChange(labelArKey, value)}
                    />
                </div>
                <TextField
                    label={t('admin.linkUrl') || 'Link URL'}
                    value={urlValue}
                    onChange={(value) => onFieldChange(urlKey, value)}
                    placeholder="/about-us or https://..."
                />
            </div>
        </div>
    );
}

export default function FooterContentSection({
    footerContent,
    categories,
    onFieldChange,
    t,
}: FooterContentSectionProps) {
    return (
        <div className="space-y-8">
            {/* Branding Section */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    title={t('admin.footerBranding') || 'Footer Branding'}
                    description={t('admin.footerBrandingDescription') || 'Edit brand title, company description, and copyright note in the footer.'}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                            🇬🇧 English Content
                        </span>
                        <TextField
                            label={t('admin.brandName') || 'Brand Name'}
                            value={footerContent.footerBrandTitle}
                            onChange={(value) => onFieldChange('footerBrandTitle', value)}
                        />
                        <TextAreaField
                            label={t('admin.description')}
                            value={footerContent.footerBrandDescription}
                            onChange={(value) => onFieldChange('footerBrandDescription', value)}
                            rows={3}
                        />
                        <TextField
                            label={t('admin.copyrightText') || 'Copyright Text'}
                            value={footerContent.footerCopyright}
                            onChange={(value) => onFieldChange('footerCopyright', value)}
                        />
                    </div>

                    <div className="space-y-4" dir="rtl">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                            🇸🇦 المحتوى العربي
                        </span>
                        <TextField
                            label={t('admin.brandName') || 'اسم العلامة'}
                            value={footerContent.footerBrandTitleAr}
                            onChange={(value) => onFieldChange('footerBrandTitleAr', value)}
                        />
                        <TextAreaField
                            label={t('admin.description') || 'النبذة'}
                            value={footerContent.footerBrandDescriptionAr}
                            onChange={(value) => onFieldChange('footerBrandDescriptionAr', value)}
                            rows={3}
                        />
                        <TextField
                            label={t('admin.copyrightText') || 'حقوق النشر'}
                            value={footerContent.footerCopyrightAr}
                            onChange={(value) => onFieldChange('footerCopyrightAr', value)}
                        />
                    </div>
                </div>
            </div>

            {/* Social Links Section */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    title={t('admin.socialLinks') || 'Social Media Links'}
                    description={t('admin.socialLinksDescription') || 'Configure links to your official social profiles.'}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2.5 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaInstagram className="text-lg text-pink-600" />
                            <span className="text-xs font-bold uppercase">Instagram</span>
                        </div>
                        <TextField
                            label={t('admin.linkUrl') || 'Profile URL'}
                            value={footerContent.footerInstagramUrl}
                            onChange={(value) => onFieldChange('footerInstagramUrl', value)}
                            placeholder="https://instagram.com/hawadistribution"
                        />
                    </div>
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2.5 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaFacebook className="text-lg text-blue-600" />
                            <span className="text-xs font-bold uppercase">Facebook</span>
                        </div>
                        <TextField
                            label={t('admin.linkUrl') || 'Page URL'}
                            value={footerContent.footerFacebookUrl}
                            onChange={(value) => onFieldChange('footerFacebookUrl', value)}
                            placeholder="https://facebook.com/hawadistribution"
                        />
                    </div>
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/40 p-4">
                        <div className="mb-2.5 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaWhatsapp className="text-lg text-emerald-600" />
                            <span className="text-xs font-bold uppercase">WhatsApp Link</span>
                        </div>
                        <TextField
                            label={t('admin.linkUrl') || 'WhatsApp URL'}
                            value={footerContent.footerWhatsappUrl}
                            onChange={(value) => onFieldChange('footerWhatsappUrl', value)}
                            placeholder="https://wa.me/9639..."
                        />
                    </div>
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 md:col-span-3">
                        <div className="mb-2.5 flex items-center gap-2 text-slate-800 dark:text-white">
                            <FaWhatsapp className="text-xl text-emerald-600" />
                            <span className="text-xs font-bold uppercase">{t('admin.wholesaleWhatsAppNumber') || 'Wholesale WhatsApp Order Receiving Number'}</span>
                        </div>
                        <TextField
                            label={t('admin.wholesaleWhatsAppNumberDesc') || 'Orders placed on the website will be directed to this WhatsApp number.'}
                            value={footerContent.whatsappNumber || ''}
                            onChange={(value) => {
                                onFieldChange('whatsappNumber', value);
                                if (!footerContent.footerWhatsappUrl || footerContent.footerWhatsappUrl === '#' || footerContent.footerWhatsappUrl.startsWith('https://wa.me/')) {
                                    const cleaned = value.replace(/[^0-9]/g, '');
                                    onFieldChange('footerWhatsappUrl', `https://wa.me/${cleaned}`);
                                }
                            }}
                            placeholder="+963900000000"
                        />
                    </div>
                </div>
            </div>

            {/* Shop Categories Section */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    title={t('admin.footerShopSection') || 'Shop Categories Column'}
                    description={t('admin.footerShopSectionDescription') || 'Rename the shop column and select up to 4 quick shortcut categories.'}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <TextField
                        label={`${t('admin.englishLabel') || 'English Label'} (${t('admin.title') || 'Heading'})`}
                        value={footerContent.footerShopTitle}
                        onChange={(value) => onFieldChange('footerShopTitle', value)}
                    />
                    <div dir="rtl">
                        <TextField
                            label={`${t('admin.arabicLabel') || 'Arabic Label'} (${t('admin.title') || 'العنوان'})`}
                            value={footerContent.footerShopTitleAr}
                            onChange={(value) => onFieldChange('footerShopTitleAr', value)}
                        />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <SelectField
                        label={`${t('admin.footerCategorySlot') || 'Slot'} 1`}
                        value={footerContent.footerCategory1Id}
                        options={categories}
                        onChange={(value) => onFieldChange('footerCategory1Id', value)}
                    />
                    <SelectField
                        label={`${t('admin.footerCategorySlot') || 'Slot'} 2`}
                        value={footerContent.footerCategory2Id}
                        options={categories}
                        onChange={(value) => onFieldChange('footerCategory2Id', value)}
                    />
                    <SelectField
                        label={`${t('admin.footerCategorySlot') || 'Slot'} 3`}
                        value={footerContent.footerCategory3Id}
                        options={categories}
                        onChange={(value) => onFieldChange('footerCategory3Id', value)}
                    />
                    <SelectField
                        label={`${t('admin.footerCategorySlot') || 'Slot'} 4`}
                        value={footerContent.footerCategory4Id}
                        options={categories}
                        onChange={(value) => onFieldChange('footerCategory4Id', value)}
                    />
                </div>
            </div>

            {/* Support Links Section */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    title={t('admin.footerSupportSection') || 'Customer Support Column'}
                    description={t('admin.footerSupportSectionDescription') || 'Edit heading and quick links for customer support and policies.'}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label={`${t('admin.englishLabel') || 'English Label'} (${t('admin.title') || 'Heading'})`}
                        value={footerContent.footerSupportTitle}
                        onChange={(value) => onFieldChange('footerSupportTitle', value)}
                    />
                    <div dir="rtl">
                        <TextField
                            label={`${t('admin.arabicLabel') || 'Arabic Label'} (${t('admin.title') || 'العنوان'})`}
                            value={footerContent.footerSupportTitleAr}
                            onChange={(value) => onFieldChange('footerSupportTitleAr', value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <LinkEditor
                        title={`${t('admin.footerLinkItem') || 'Link'} 1`}
                        labelValue={footerContent.footerSupportLink1Label}
                        labelArValue={footerContent.footerSupportLink1LabelAr}
                        urlValue={footerContent.footerSupportLink1Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink1Label"
                        labelArKey="footerSupportLink1LabelAr"
                        urlKey="footerSupportLink1Url"
                        t={t}
                    />
                    <LinkEditor
                        title={`${t('admin.footerLinkItem') || 'Link'} 2`}
                        labelValue={footerContent.footerSupportLink2Label}
                        labelArValue={footerContent.footerSupportLink2LabelAr}
                        urlValue={footerContent.footerSupportLink2Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink2Label"
                        labelArKey="footerSupportLink2LabelAr"
                        urlKey="footerSupportLink2Url"
                        t={t}
                    />
                    <LinkEditor
                        title={`${t('admin.footerLinkItem') || 'Link'} 3`}
                        labelValue={footerContent.footerSupportLink3Label}
                        labelArValue={footerContent.footerSupportLink3LabelAr}
                        urlValue={footerContent.footerSupportLink3Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerSupportLink3Label"
                        labelArKey="footerSupportLink3LabelAr"
                        urlKey="footerSupportLink3Url"
                        t={t}
                    />
                </div>
            </div>

            {/* Company Links Section */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] p-6 md:p-8 shadow-xs">
                <SectionTitle
                    title={t('admin.footerCompanySection') || 'Company Information Column'}
                    description={t('admin.footerCompanySectionDescription') || 'Edit company column heading and up to three footer links.'}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <TextField
                        label={`${t('admin.englishLabel') || 'English Label'} (${t('admin.title') || 'Heading'})`}
                        value={footerContent.footerCompanyTitle}
                        onChange={(value) => onFieldChange('footerCompanyTitle', value)}
                    />
                    <div dir="rtl">
                        <TextField
                            label={`${t('admin.arabicLabel') || 'Arabic Label'} (${t('admin.title') || 'العنوان'})`}
                            value={footerContent.footerCompanyTitleAr}
                            onChange={(value) => onFieldChange('footerCompanyTitleAr', value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <LinkEditor
                        title={`${t('admin.footerLinkItem') || 'Link'} 1`}
                        labelValue={footerContent.footerCompanyLink1Label}
                        labelArValue={footerContent.footerCompanyLink1LabelAr}
                        urlValue={footerContent.footerCompanyLink1Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink1Label"
                        labelArKey="footerCompanyLink1LabelAr"
                        urlKey="footerCompanyLink1Url"
                        t={t}
                    />
                    <LinkEditor
                        title={`${t('admin.footerLinkItem') || 'Link'} 2`}
                        labelValue={footerContent.footerCompanyLink2Label}
                        labelArValue={footerContent.footerCompanyLink2LabelAr}
                        urlValue={footerContent.footerCompanyLink2Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink2Label"
                        labelArKey="footerCompanyLink2LabelAr"
                        urlKey="footerCompanyLink2Url"
                        t={t}
                    />
                    <LinkEditor
                        title={`${t('admin.footerLinkItem') || 'Link'} 3`}
                        labelValue={footerContent.footerCompanyLink3Label}
                        labelArValue={footerContent.footerCompanyLink3LabelAr}
                        urlValue={footerContent.footerCompanyLink3Url}
                        onFieldChange={onFieldChange}
                        labelKey="footerCompanyLink3Label"
                        labelArKey="footerCompanyLink3LabelAr"
                        urlKey="footerCompanyLink3Url"
                        t={t}
                    />
                </div>
            </div>
        </div>
    );
}
