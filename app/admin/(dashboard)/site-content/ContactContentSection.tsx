"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    ContactPageContent,
    ContactPageField,
} from "@/lib/contact-page-content";
import { Phone, Store, MapPin, Clock, Send, MessageSquare } from "lucide-react";

type FieldDefinition = {
    key: ContactPageField;
    en: string;
    ar: string;
    multiline?: boolean;
    isPhone?: boolean;
};

type GroupDefinition = {
    en: string;
    ar: string;
    icon: React.ReactNode;
    fields: FieldDefinition[];
};

const GROUPS: GroupDefinition[] = [
    {
        en: "Page Header",
        ar: "رأس الصفحة والعنوان",
        icon: <MessageSquare className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "heroTitle", en: "Page Title", ar: "عنوان الصفحة الرئيسي" },
            { key: "heroDescription", en: "Page Subtitle & Introduction", ar: "الوصف التقديمي للصفحة", multiline: true },
        ],
    },
    {
        en: "Commercial Sales Manager Card",
        ar: "بطاقة مدير المبيعات التجارية",
        icon: <Phone className="text-xl text-emerald-600" />,
        fields: [
            { key: "salesTag", en: "Card Tag / Badge", ar: "شارة البطاقة العلوية" },
            { key: "salesTitle", en: "Position Title", ar: "المسمى الوظيفي" },
            { key: "salesDesc", en: "Role Description", ar: "وصف مهام التواصل", multiline: true },
            { key: "salesPhone", en: "Phone Number", ar: "رقم الاتصال الهاتفي", isPhone: true },
            { key: "salesWhatsapp", en: "WhatsApp Number", ar: "رقم الواتساب", isPhone: true },
            { key: "salesCallBtn", en: "Call Button Label", ar: "نص زر الاتصال" },
            { key: "salesWhatsappBtn", en: "WhatsApp Button Label", ar: "نص زر الواتساب" },
            { key: "salesWhatsappMsg", en: "Default WhatsApp Message", ar: "رسالة الواتساب الجاهزة", multiline: true },
        ],
    },
    {
        en: "Company General Manager Card",
        ar: "بطاقة مدير الشركة والإدارة العامة",
        icon: <Store className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "gmTag", en: "Card Tag / Badge", ar: "شارة البطاقة العلوية" },
            { key: "gmTitle", en: "Position Title", ar: "المسمى الوظيفي" },
            { key: "gmDesc", en: "Role Description", ar: "وصف مهام التواصل والشراكات", multiline: true },
            { key: "gmPhone", en: "Phone Number", ar: "رقم الاتصال الهاتفي", isPhone: true },
            { key: "gmWhatsapp", en: "WhatsApp Number", ar: "رقم الواتساب", isPhone: true },
            { key: "gmCallBtn", en: "Call Button Label", ar: "نص زر الاتصال" },
            { key: "gmWhatsappBtn", en: "WhatsApp Button Label", ar: "نص زر الواتساب" },
            { key: "gmWhatsappMsg", en: "Default WhatsApp Message", ar: "رسالة الواتساب الجاهزة", multiline: true },
        ],
    },
    {
        en: "Warehouses & Working Hours",
        ar: "المستودعات الرئيسية وأوقات العمل",
        icon: <MapPin className="text-xl text-blue-600" />,
        fields: [
            { key: "warehouseTitle", en: "Warehouse Card Heading", ar: "عنوان بطاقة المستودعات والمكاتب" },
            { key: "warehouseDesc", en: "Warehouse Address & Details", ar: "تفاصيل وعنوان المستودعات", multiline: true },
            { key: "hoursTitle", en: "Working Hours Heading", ar: "عنوان بطاقة أوقات العمل" },
            { key: "hoursDesc", en: "Working Hours Details", ar: "تفاصيل أوقات العمل والطلبيات", multiline: true },
        ],
    },
    {
        en: "Customer Inquiry Form (Admin Messages Inbox)",
        ar: "نموذج استفسارات العملاء (صندوق رسائل لوحة الإدارة)",
        icon: <Send className="text-xl text-[#8A6305]" />,
        fields: [
            { key: "formTitle", en: "Form Heading", ar: "عنوان النموذج" },
            { key: "formDesc", en: "Form Subtitle", ar: "الوصف التوضيحي للنموذج", multiline: true },
            { key: "formNameLabel", en: "Name Field Label", ar: "تسمية حقل الاسم" },
            { key: "formNamePlaceholder", en: "Name Field Placeholder", ar: "النص التوضيحي لحقل الاسم" },
            { key: "formShopLabel", en: "Shop Name Field Label", ar: "تسمية حقل اسم المحل أو الشركة" },
            { key: "formShopPlaceholder", en: "Shop Name Placeholder", ar: "النص التوضيحي لحقل اسم المحل" },
            { key: "formPhoneLabel", en: "Phone Field Label", ar: "تسمية حقل الهاتف" },
            { key: "formPhonePlaceholder", en: "Phone Field Placeholder", ar: "النص التوضيحي لحقل الهاتف" },
            { key: "formCityLabel", en: "City Field Label", ar: "تسمية حقل المحافظة أو المدينة" },
            { key: "formCityPlaceholder", en: "City Field Placeholder", ar: "النص التوضيحي لحقل المحافظة" },
            { key: "formMessageLabel", en: "Message Field Label", ar: "تسمية حقل نص الاستفسار" },
            { key: "formMessagePlaceholder", en: "Message Field Placeholder", ar: "النص التوضيحي لحقل الرسالة", multiline: true },
            { key: "formSubmitBtn", en: "Submit Button Text", ar: "نص زر الإرسال" },
        ],
    },
];

export default function ContactContentSection({
    value,
    onChange,
}: {
    value: ContactPageContent;
    onChange: (nextValue: ContactPageContent) => void;
}) {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const updateField = (locale: "en" | "ar", field: ContactPageField, text: string) => {
        onChange({
            ...value,
            [locale]: {
                ...value[locale],
                [field]: text,
            },
        });
    };

    const inputClassName = "w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm focus:border-[#8A6305] transition-colors";

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Info Banner */}
            <div className="rounded-2xl border border-[#8A6305]/20 bg-[#8A6305]/5 px-5 py-4 text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between gap-4">
                <p>
                    {isAr
                        ? "تحكم كامل بمحتوى صفحة (تواصل معنا) بكافة عناصرها باللغتين العربية والإنجليزية: العناوين، أرقام الهواتف والواتساب، البطاقات التعريفية، وأسماء حقول النموذج المباشر. اضغط على حفظ التغييرات بالأعلى لتطبيق التعديلات فوراً."
                        : "Full control over all content on the (/contact) page in both Arabic and English: titles, phone and WhatsApp numbers, contact cards, and direct form fields. Click Save Changes at the top to publish your updates."}
                </p>
            </div>

            {GROUPS.map((group) => (
                <section
                    key={group.en}
                    className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                            {group.icon}
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                {isAr ? group.ar : group.en}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isAr ? group.en : group.ar}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {group.fields.map((field) => (
                            <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* English Field */}
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <span className="inline-flex items-center gap-2 mb-1">
                                        <span aria-hidden="true">🇬🇧</span>
                                        <span>{field.en}</span>
                                    </span>
                                    {field.multiline ? (
                                        <textarea
                                            rows={field.key === "heroDescription" || field.key === "salesDesc" || field.key === "gmDesc" || field.key === "hoursDesc" ? 3 : 2}
                                            maxLength={5000}
                                            value={value.en[field.key] || ""}
                                            onChange={(event) => updateField("en", field.key, event.target.value)}
                                            className={`${inputClassName} resize-y`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            dir={field.isPhone ? "ltr" : undefined}
                                            maxLength={5000}
                                            value={value.en[field.key] || ""}
                                            onChange={(event) => updateField("en", field.key, event.target.value)}
                                            className={`${inputClassName} ${field.isPhone ? "font-mono" : ""}`}
                                        />
                                    )}
                                </label>

                                {/* Arabic Field */}
                                <label dir="rtl" className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <span className="inline-flex items-center gap-2 mb-1">
                                        <span aria-hidden="true">🇸🇦</span>
                                        <span>{field.ar}</span>
                                    </span>
                                    {field.multiline ? (
                                        <textarea
                                            rows={field.key === "heroDescription" || field.key === "salesDesc" || field.key === "gmDesc" || field.key === "hoursDesc" ? 3 : 2}
                                            maxLength={5000}
                                            value={value.ar[field.key] || ""}
                                            onChange={(event) => updateField("ar", field.key, event.target.value)}
                                            className={`${inputClassName} resize-y`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            dir={field.isPhone ? "ltr" : undefined}
                                            maxLength={5000}
                                            value={value.ar[field.key] || ""}
                                            onChange={(event) => updateField("ar", field.key, event.target.value)}
                                            className={`${inputClassName} ${field.isPhone ? "font-mono" : ""}`}
                                        />
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
