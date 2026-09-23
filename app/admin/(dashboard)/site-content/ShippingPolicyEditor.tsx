"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import {
    ShippingPolicyContent,
    ShippingPolicyField,
} from "@/lib/shipping-policy-content";

type FieldDefinition = {
    key: ShippingPolicyField;
    en: string;
    ar: string;
    multiline?: boolean;
};

const GROUPS: { en: string; ar: string; fields: FieldDefinition[] }[] = [
    {
        en: "Page introduction",
        ar: "مقدمة الصفحة",
        fields: [
            { key: "heroBadge", en: "Badge", ar: "الشارة" },
            { key: "heroTitle", en: "Page title", ar: "عنوان الصفحة" },
            { key: "heroDescription", en: "Introduction", ar: "المقدمة", multiline: true },
        ],
    },
    {
        en: "Shipping and delivery",
        ar: "الشحن والتوصيل",
        fields: [
            { key: "shippingSectionTitle", en: "Section title", ar: "عنوان القسم" },
            { key: "shippingSectionDescription", en: "Section subtitle", ar: "الوصف الفرعي للقسم", multiline: true },
            { key: "verificationTitle", en: "Order confirmation heading", ar: "عنوان تأكيد الطلبية" },
            { key: "verificationDescription", en: "Order confirmation details", ar: "تفاصيل تأكيد الطلبية", multiline: true },
            { key: "timelineTitle", en: "Delivery schedules heading", ar: "عنوان مواعيد التوصيل" },
            { key: "centralRegionLabel", en: "Central region label", ar: "اسم المنطقة الوسطى" },
            { key: "expressTimeline", en: "Central region delivery time", ar: "مدة التوصيل للمنطقة الوسطى" },
            { key: "otherRegionsLabel", en: "Other regions label", ar: "اسم باقي المحافظات" },
            { key: "standardTimeline", en: "Other regions delivery time", ar: "مدة التوصيل لباقي المحافظات" },
            { key: "timelineNote", en: "Delivery schedule note", ar: "ملاحظة جدول التوصيل", multiline: true },
            { key: "storeDoorTitle", en: "Store-door delivery heading", ar: "عنوان التسليم لباب المحل" },
            { key: "storeDoorDescription", en: "Store-door delivery details", ar: "تفاصيل التسليم لباب المحل", multiline: true },
            { key: "invoiceTitle", en: "Inspection and invoice heading", ar: "عنوان المعاينة والفاتورة" },
            { key: "invoiceDescription", en: "Inspection and invoice details", ar: "تفاصيل المعاينة والفاتورة", multiline: true },
        ],
    },
    {
        en: "Quality and claims",
        ar: "الجودة والملاحظات",
        fields: [
            { key: "qualitySectionTitle", en: "Section title", ar: "عنوان القسم" },
            { key: "qualitySectionDescription", en: "Section subtitle", ar: "الوصف الفرعي للقسم", multiline: true },
            { key: "factoryCasesTitle", en: "Factory cases heading", ar: "عنوان كراتين المصنع" },
            { key: "factoryCasesDescription", en: "Factory cases details", ar: "تفاصيل كراتين المصنع", multiline: true },
            { key: "damagedCasesTitle", en: "Damaged cases heading", ar: "عنوان الكراتين المتضررة" },
            { key: "damagedCasesDescription", en: "Damaged cases details", ar: "تفاصيل الكراتين المتضررة", multiline: true },
            { key: "concealedDefectTitle", en: "Hidden defect heading", ar: "عنوان الملاحظات الخفية" },
            { key: "concealedDefectDescription", en: "Hidden defect instructions", ar: "تعليمات الملاحظات الخفية", multiline: true },
            { key: "concealedDefectStep1", en: "Hidden defect step 1", ar: "الخطوة الأولى للملاحظات الخفية", multiline: true },
            { key: "concealedDefectStep2", en: "Hidden defect step 2", ar: "الخطوة الثانية للملاحظات الخفية", multiline: true },
            { key: "storageTitle", en: "Storage and safety heading", ar: "عنوان التخزين والسلامة" },
            { key: "storageDescription", en: "Storage and safety details", ar: "تفاصيل التخزين والسلامة", multiline: true },
        ],
    },
    {
        en: "Contact and support",
        ar: "التواصل والدعم",
        fields: [
            { key: "supportTitle", en: "Support heading", ar: "عنوان الدعم" },
            { key: "supportDescription", en: "Support details", ar: "تفاصيل الدعم", multiline: true },
            { key: "whatsappButtonLabel", en: "WhatsApp button label", ar: "نص زر واتساب" },
            { key: "whatsappMessage", en: "WhatsApp prefilled message", ar: "رسالة واتساب الجاهزة", multiline: true },
        ],
    },
];

export default function ShippingPolicyEditor({
    value,
    onChange,
}: {
    value: ShippingPolicyContent;
    onChange: (nextValue: ShippingPolicyContent) => void;
}) {
    const { language } = useLanguage();
    const isAr = language === "ar";

    const updateField = (locale: "en" | "ar", field: ShippingPolicyField, text: string) => {
        onChange({
            ...value,
            [locale]: {
                ...value[locale],
                [field]: text,
            },
        });
    };

    const inputClassName = "w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm";

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="rounded-2xl border border-[#8A6305]/20 bg-[#8A6305]/5 px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
                {isAr
                    ? "عدّل النصوص الإنجليزية والعربية للصفحة كاملة. رقم التواصل يُدار من تبويب التذييل. اضغط حفظ التغييرات لنشر التعديلات."
                    : "Edit all English and Arabic text shown on the shipping policy page. The contact number is managed in the Footer tab. Select Save Changes to publish."}
            </div>

            {GROUPS.map((group) => (
                <section key={group.en} className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
                        {isAr ? group.ar : group.en}
                    </h3>
                    <div className="space-y-5">
                        {group.fields.map((field) => (
                            <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <span className="inline-flex items-center gap-2">
                                        <span aria-hidden="true">🇬🇧</span>
                                        {field.en}
                                    </span>
                                    {field.multiline ? (
                                        <textarea
                                            rows={3}
                                            maxLength={5000}
                                            value={value.en[field.key]}
                                            onChange={(event) => updateField("en", field.key, event.target.value)}
                                            className={`${inputClassName} resize-y`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            maxLength={5000}
                                            value={value.en[field.key]}
                                            onChange={(event) => updateField("en", field.key, event.target.value)}
                                            className={inputClassName}
                                        />
                                    )}
                                </label>
                                <label dir="rtl" className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <span className="inline-flex items-center gap-2">
                                        <span aria-hidden="true">🇸🇦</span>
                                        {field.ar}
                                    </span>
                                    {field.multiline ? (
                                        <textarea
                                            rows={3}
                                            maxLength={5000}
                                            value={value.ar[field.key]}
                                            onChange={(event) => updateField("ar", field.key, event.target.value)}
                                            className={`${inputClassName} resize-y`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            maxLength={5000}
                                            value={value.ar[field.key]}
                                            onChange={(event) => updateField("ar", field.key, event.target.value)}
                                            className={inputClassName}
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
