"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    PrivacyPolicyContent,
    PrivacyPolicyField,
} from "@/lib/privacy-policy-content";
import { ShieldCheck, Database, Lock, Users, HelpCircle, Save } from "lucide-react";

type FieldDefinition = {
    key: PrivacyPolicyField;
    en: string;
    ar: string;
    multiline?: boolean;
};

const GROUPS: {
    en: string;
    ar: string;
    icon: React.ReactNode;
    fields: FieldDefinition[];
}[] = [
    {
        en: "Header & Overview",
        ar: "رأس الصفحة والمقدمة",
        icon: <ShieldCheck className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "heroBadge", en: "Badge Text", ar: "نص الشارة العلوية" },
            { key: "heroTitle", en: "Page Title", ar: "عنوان الصفحة الرئيسي" },
            { key: "heroDescription", en: "Introductory Description", ar: "المقدمة التوضيحية", multiline: true },
            { key: "lastUpdated", en: "Last Updated Text", ar: "تاريخ آخر تحديث" },
        ],
    },
    {
        en: "1. Information We Collect",
        ar: "1. البيانات التي نقوم بجمعها",
        icon: <Database className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "section1Badge", en: "Section Badge", ar: "شارة القسم الأول" },
            { key: "section1Title", en: "Section Heading", ar: "عنوان القسم الأول" },
            { key: "section1Desc", en: "Section Subtitle", ar: "الوصف التوضيحي للقسم", multiline: true },
            { key: "businessInfoTitle", en: "Store Info Heading", ar: "عنوان بيانات المتجر والنشاط" },
            { key: "businessInfoDesc", en: "Store Info Details", ar: "تفاصيل بيانات المتجر والنشاط", multiline: true },
            { key: "contactInfoTitle", en: "Contact Details Heading", ar: "عنوان بيانات الاتصال المباشر" },
            { key: "contactInfoDesc", en: "Contact Details Description", ar: "تفاصيل بيانات الاتصال المباشر", multiline: true },
            { key: "ordersInfoTitle", en: "Orders & Invoices Heading", ar: "عنوان سجلات الطلبيات والفواتير" },
            { key: "ordersInfoDesc", en: "Orders & Invoices Description", ar: "تفاصيل سجلات الطلبيات والفواتير", multiline: true },
        ],
    },
    {
        en: "2. How We Use Data",
        ar: "2. أوجه استخدام وإدارة البيانات",
        icon: <Users className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "section2Badge", en: "Section Badge", ar: "شارة القسم الثاني" },
            { key: "section2Title", en: "Section Heading", ar: "عنوان القسم الثاني" },
            { key: "section2Desc", en: "Section Subtitle", ar: "الوصف التوضيحي للقسم", multiline: true },
            { key: "usageDeliveryTitle", en: "Order Delivery Heading", ar: "عنوان تجهيز وتوصيل الطلبيات" },
            { key: "usageDeliveryDesc", en: "Order Delivery Details", ar: "تفاصيل تجهيز وتوصيل الطلبيات", multiline: true },
            { key: "usageDeliveryNumber", en: "First Step Marker", ar: "رقم الخطوة الأولى" },
            { key: "usageVerificationTitle", en: "Account Verification Heading", ar: "عنوان اعتماد حسابات الجملة" },
            { key: "usageVerificationDesc", en: "Account Verification Details", ar: "تفاصيل اعتماد حسابات الجملة", multiline: true },
            { key: "usageVerificationNumber", en: "Second Step Marker", ar: "رقم الخطوة الثانية" },
            { key: "usageCommunicationTitle", en: "Logistics Communication Heading", ar: "عنوان التواصل اللوجستي وتحديثات الوكالات" },
            { key: "usageCommunicationDesc", en: "Logistics Communication Details", ar: "تفاصيل التواصل اللوجستي والتحديثات", multiline: true },
            { key: "usageCommunicationNumber", en: "Third Step Marker", ar: "رقم الخطوة الثالثة" },
        ],
    },
    {
        en: "3. Commercial Confidentiality & Security",
        ar: "3. السرية التجارية وأمن المعلومات",
        icon: <Lock className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "section3Badge", en: "Section Badge", ar: "شارة القسم الثالث" },
            { key: "section3Title", en: "Section Heading", ar: "عنوان القسم الثالث" },
            { key: "section3Desc", en: "Section Subtitle", ar: "الوصف التوضيحي للقسم", multiline: true },
            { key: "noSellingTitle", en: "Non-Disclosure Heading", ar: "عنوان حظر بيع أو تأجير البيانات" },
            { key: "noSellingDesc", en: "Non-Disclosure Details", ar: "تفاصيل حظر بيع أو مشاركة البيانات", multiline: true },
            { key: "securityMeasuresTitle", en: "System Security Heading", ar: "عنوان أمن الأنظمة وقواعد البيانات" },
            { key: "securityMeasuresDesc", en: "System Security Details", ar: "تفاصيل أمن الأنظمة وقواعد البيانات", multiline: true },
        ],
    },
    {
        en: "4. Merchant Rights & Support",
        ar: "4. حقوق التاجر والدعم المباشر",
        icon: <HelpCircle className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "section4Badge", en: "Section Badge", ar: "شارة القسم الرابع" },
            { key: "section4Title", en: "Section Heading", ar: "عنوان القسم الرابع" },
            { key: "section4Desc", en: "Section Subtitle", ar: "الوصف التوضيحي للقسم", multiline: true },
            { key: "rightsUpdateTitle", en: "Data Control Heading", ar: "عنوان مراجعة وتحديث البيانات" },
            { key: "rightsUpdateDesc", en: "Data Control Details", ar: "تفاصيل مراجعة وتحديث البيانات", multiline: true },
            { key: "supportHeading", en: "Inquiry Card Title", ar: "عنوان بطاقة استفسارات الخصوصية" },
            { key: "supportDesc", en: "Inquiry Card Description", ar: "نص بطاقة استفسارات الخصوصية", multiline: true },
            { key: "contactButtonText", en: "Action Button Text", ar: "نص زر التواصل" },
            { key: "contactButtonLink", en: "Action Button Link", ar: "رابط زر التواصل" },
            { key: "directPhoneLabel", en: "Phone Label", ar: "عنوان الهاتف" },
            { key: "contactPhone", en: "Phone Number", ar: "رقم الهاتف" },
            { key: "emailLabel", en: "Email Label", ar: "عنوان البريد الإلكتروني" },
            { key: "contactEmail", en: "Email Address", ar: "البريد الإلكتروني" },
            { key: "addressLabel", en: "Address Label", ar: "عنوان الموقع" },
            { key: "contactAddress", en: "Address", ar: "العنوان", multiline: true },
        ],
    },
];

export default function PrivacyPolicyEditor({
    value,
    onChange,
    onSave,
    isSaving,
}: {
    value: PrivacyPolicyContent;
    onChange: (nextValue: PrivacyPolicyContent) => void;
    onSave: () => void;
    isSaving: boolean;
}) {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const updateField = (locale: "en" | "ar", field: PrivacyPolicyField, text: string) => {
        onChange({
            ...value,
            [locale]: {
                ...value[locale],
                [field]: text,
            },
        });
    };

    const inputClassName =
        "w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-gray-800/60 text-slate-900 dark:text-white outline-none text-xs sm:text-sm font-medium focus:border-[#8A6305] focus:ring-0 transition-colors";

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Header Informational Banner */}
            <div className="rounded-2xl border border-[#8A6305]/20 bg-[#8A6305]/5 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8A6305]/10 text-[#8A6305] flex items-center justify-center shrink-0 text-xl">
                    <ShieldCheck />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isAr ? "إدارة محتوى صفحة سياسة الخصوصية (/privacy)" : "Privacy Policy Page Content Manager (/privacy)"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {isAr
                            ? "حرر جميع نصوص الصفحة وبيانات التواصل باللغتين العربية والإنجليزية، ثم احفظ التعديلات من هذا القسم."
                            : "Edit every visible text item and contact detail in both Arabic and English, then save directly from this section."}
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSaving ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            <span>{isAr ? "جارٍ الحفظ" : "Saving"}</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            <span>{isAr ? "حفظ سياسة الخصوصية" : "Save Privacy Policy"}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Accordion / Section Cards */}
            <div className="space-y-6">
                {GROUPS.map((group, gIdx) => (
                    <div
                        key={gIdx}
                        className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs"
                    >
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5 mb-5">
                            <div className="p-2.5 rounded-xl bg-[#8A6305]/10">
                                {group.icon}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {isAr ? group.ar : group.en}
                            </h3>
                        </div>

                        <div className="space-y-5">
                            {group.fields.map((field) => (
                                <div key={field.key} className="space-y-3">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {isAr ? field.ar : field.en}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {/* Arabic Field */}
                                        <div dir="rtl">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                العربية (AR)
                                            </label>
                                            {field.multiline ? (
                                                <textarea
                                                    rows={3}
                                                    value={value.ar?.[field.key] ?? ""}
                                                    onChange={(e) => updateField("ar", field.key, e.target.value)}
                                                    className={inputClassName}
                                                    maxLength={5000}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={value.ar?.[field.key] ?? ""}
                                                    onChange={(e) => updateField("ar", field.key, e.target.value)}
                                                    className={inputClassName}
                                                    maxLength={5000}
                                                />
                                            )}
                                        </div>

                                        {/* English Field */}
                                        <div dir="ltr">
                                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                English (EN)
                                            </label>
                                            {field.multiline ? (
                                                <textarea
                                                    rows={3}
                                                    value={value.en?.[field.key] ?? ""}
                                                    onChange={(e) => updateField("en", field.key, e.target.value)}
                                                    className={inputClassName}
                                                    maxLength={5000}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={value.en?.[field.key] ?? ""}
                                                    onChange={(e) => updateField("en", field.key, e.target.value)}
                                                    className={inputClassName}
                                                    maxLength={5000}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
