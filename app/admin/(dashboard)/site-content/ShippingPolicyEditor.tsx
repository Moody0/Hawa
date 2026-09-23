"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    ShippingPolicyContent,
    ShippingPolicyField,
} from "@/lib/shipping-policy-content";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import { Truck, ExternalLink, Save, ShieldCheck, RotateCcw, PhoneCall, Sparkles } from "lucide-react";

type FieldDefinition = {
    key: ShippingPolicyField;
    en: string;
    ar: string;
    multiline?: boolean;
    dir?: "ltr" | "rtl";
    placeholderEn?: string;
    placeholderAr?: string;
};

const GROUPS: { en: string; ar: string; icon: React.ReactNode; fields: FieldDefinition[] }[] = [
    {
        en: "1. Page Introduction & Hero Header",
        ar: "1. ترويسة الصفحة والبانر الترحيبي",
        icon: <Sparkles className="w-5 h-5 text-[#8A6305] dark:text-[#E5B54A]" />,
        fields: [
            { key: "heroBadge", en: "Badge / Eyebrow Tag", ar: "الشارة الترويجية أعلى العنوان" },
            { key: "heroTitle", en: "Hero Main Title", ar: "العنوان الرئيسي للصفحة" },
            { key: "heroDescription", en: "Hero Subtitle & Introduction", ar: "النبذة التمهيدية تحت العنوان", multiline: true },
        ],
    },
    {
        en: "2. Shipping & Store-Door Delivery Logistics",
        ar: "2. قواعد الشحن والتوصيل المباشر لباب المتجر",
        icon: <Truck className="w-5 h-5 text-[#8A6305] dark:text-[#E5B54A]" />,
        fields: [
            { key: "shippingSectionTitle", en: "Section Heading", ar: "عنوان القسم الأول" },
            { key: "shippingSectionDescription", en: "Section Subtitle / Details", ar: "الوصف الفرعي للقسم", multiline: true },
            { key: "verificationTitle", en: "Rule 1: Order Confirmation Title", ar: "البند 1: عنوان تأكيد الطلبية وجدولتها" },
            { key: "verificationDescription", en: "Rule 1: Order Confirmation Description", ar: "البند 1: تفاصيل تأكيد الطلبية وجدولتها", multiline: true },
            { key: "timelineTitle", en: "Rule 2: Delivery Schedules Heading", ar: "البند 2: عنوان مواعيد وفترات التوريد" },
            { key: "centralRegionLabel", en: "Central Region Label", ar: "اسم المنطقة الأولى (مثلاً: حمص والوسطى)" },
            { key: "expressTimeline", en: "Central Region Delivery Time", ar: "فترة التوصيل للمنطقة الأولى" },
            { key: "otherRegionsLabel", en: "Other Regions Label", ar: "اسم باقي المحافظات" },
            { key: "standardTimeline", en: "Other Regions Delivery Time", ar: "فترة التوصيل لباقي المحافظات" },
            { key: "timelineNote", en: "Delivery Schedule Footer Note", ar: "ملاحظة جدول التوزيع الأسبوعي", multiline: true },
            { key: "storeDoorTitle", en: "Rule 3: Store-Door Delivery Heading", ar: "البند 3: عنوان التسليم لباب المحل" },
            { key: "storeDoorDescription", en: "Rule 3: Store-Door Delivery Description", ar: "البند 3: تفاصيل التسليم لباب المحل", multiline: true },
            { key: "invoiceTitle", en: "Rule 4: Inspection & Invoice Check Heading", ar: "البند 4: عنوان المعاينة الفورية ومطابقة الفاتورة" },
            { key: "invoiceDescription", en: "Rule 4: Inspection & Invoice Description", ar: "البند 4: تفاصيل المعاينة الفورية ومطابقة الفاتورة", multiline: true },
        ],
    },
    {
        en: "3. Quality, Claims & Damaged Cases Policy",
        ar: "3. سياسة الجودة والمطابقة والكراتين التالفة",
        icon: <RotateCcw className="w-5 h-5 text-[#8A6305] dark:text-[#E5B54A]" />,
        fields: [
            { key: "qualitySectionTitle", en: "Section Heading", ar: "عنوان القسم الثاني" },
            { key: "qualitySectionDescription", en: "Section Subtitle / Details", ar: "الوصف الفرعي للقسم", multiline: true },
            { key: "factoryCasesTitle", en: "Rule 1: Factory Sealed Cases Heading", ar: "البند 1: عنوان كراتين المصنع الأصلية" },
            { key: "factoryCasesDescription", en: "Rule 1: Factory Sealed Cases Description", ar: "البند 1: تفاصيل كراتين المصنع الأصلية", multiline: true },
            { key: "damagedCasesTitle", en: "Rule 2: On-Site Driver Replacement Heading", ar: "البند 2: عنوان الاستبدال الفوري مع السائق" },
            { key: "damagedCasesDescription", en: "Rule 2: On-Site Driver Replacement Description", ar: "البند 2: تفاصيل الاستبدال الفوري مع السائق", multiline: true },
            { key: "concealedDefectTitle", en: "Rule 3: 24-Hour Hidden Defect Heading", ar: "البند 3: عنوان مهلة 24 ساعة للملاحظات الخفية" },
            { key: "concealedDefectDescription", en: "Rule 3: Hidden Defect Instructions", ar: "البند 3: تفاصيل وتعليمات الملاحظات الخفية", multiline: true },
            { key: "concealedDefectStep1", en: "Step 1: Photograph Defect & Invoice", ar: "الخطوة الأولى: تصوير الكرتونة ورقم الفاتورة", multiline: true },
            { key: "concealedDefectStep2", en: "Step 2: Send Photos to Dispatch WhatsApp", ar: "الخطوة الثانية: إرسال الصور لواتساب الحركة", multiline: true },
            { key: "storageTitle", en: "Rule 4: Storage & Temperature Standards Heading", ar: "البند 4: عنوان معايير التخزين والسلامة الغذائية" },
            { key: "storageDescription", en: "Rule 4: Storage & Temperature Standards Description", ar: "البند 4: تفاصيل معايير التخزين والسلامة الغذائية", multiline: true },
        ],
    },
    {
        en: "4. Logistics Dispatch & Dedicated Contact Channels",
        ar: "4. شريط التواصل المباشر وإدارة الحركة",
        icon: <PhoneCall className="w-5 h-5 text-[#8A6305] dark:text-[#E5B54A]" />,
        fields: [
            { key: "supportTitle", en: "Support Card Heading", ar: "عنوان شريط الدعم والاستفسارات" },
            { key: "supportDescription", en: "Support Card Description", ar: "نص ووصف شريط الدعم", multiline: true },
            { key: "whatsappButtonLabel", en: "WhatsApp Button Label", ar: "نص زر واتساب" },
            { key: "whatsappMessage", en: "WhatsApp Pre-filled Message", ar: "الرسالة الجاهزة عند الضغط على واتساب", multiline: true },
            { key: "phoneButtonLabel", en: "Phone Call Button Label", ar: "نص زر الاتصال الهاتفي (مثلاً: اتصال مباشر)" },
            { 
                key: "dispatchWhatsapp", 
                en: "Dedicated Dispatch WhatsApp Number (Optional override)", 
                ar: "رقم واتساب مخصص لإدارة الحركة (اختياري - يترك فارغاً لاستخدام واتساب الشركة العام)",
                dir: "ltr",
                placeholderEn: "+963 993 443 901",
                placeholderAr: "+963 993 443 901"
            },
            { 
                key: "dispatchPhone", 
                en: "Dedicated Dispatch Phone Number (Optional override)", 
                ar: "رقم هاتف مخصص لإدارة الحركة والتوريد (اختياري - يترك فارغاً لاستخدام هاتف الشركة العام)",
                dir: "ltr",
                placeholderEn: "+963 993 443 901",
                placeholderAr: "+963 993 443 901"
            },
        ],
    },
];

interface ShippingPolicyEditorProps {
    value: ShippingPolicyContent;
    onChange: (nextValue: ShippingPolicyContent) => void;
    shippingReturnsImage?: string;
    onImageChange?: (url: string) => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export default function ShippingPolicyEditor({
    value,
    onChange,
    shippingReturnsImage,
    onImageChange,
    onSave,
    isSaving = false,
}: ShippingPolicyEditorProps) {
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

    const inputClassName =
        "w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/15";

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Top Action & Instructions Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#8A6305]/25 bg-[#8A6305]/5 p-5 shadow-xs">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#8A6305]/10 text-[#8A6305] dark:text-[#E5B54A] shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {isAr ? "إدارة صفحة الشحن والتوصيل وسياسة التوريد (/shipping-returns)" : "Shipping & Delivery Policy Manager (/shipping-returns)"}
                        </h4>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                            {isAr
                                ? "تحكم كامل بجميع نصوص الشحن وسياسات التوريد بالعربية والإنجليزية، صورة البانر العلوي، وأرقام التواصل المباشر مع إدارة الحركة."
                                : "Full control over all delivery guidelines, lead times, claims resolution rules in English & Arabic, hero banner image, and dispatch contact desk."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    <a
                        href="/shipping-returns"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#132035] text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#8A6305] hover:border-[#8A6305]/40 transition-all shadow-xs"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? "معاينة الصفحة الحية" : "View Live Page"}</span>
                    </a>

                    {onSave && (
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
                                    <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5 text-[#E5B54A]" />
                                    <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Loop through the groups */}
            {GROUPS.map((group, groupIdx) => (
                <section
                    key={group.en}
                    className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs"
                >
                    <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                        <div className="p-2.5 rounded-xl bg-[#8A6305]/10 shrink-0">
                            {group.icon}
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isAr ? group.ar : group.en}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {isAr
                                    ? "عدّل الحقول باللغتين العربية والإنجليزية لضمان دقة العرض لجميع العملاء."
                                    : "Configure English and Arabic strings for consistent bilingual storefront presentation."}
                            </p>
                        </div>
                    </div>

                    {/* Group 1 Special: Hero Background Image */}
                    {groupIdx === 0 && onImageChange && (
                        <div className="mb-8 p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-gray-800/30">
                            <div className="mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    {isAr ? "صورة خلفية البانر العلوي (Hero Banner Image)" : "Hero Banner Background Image"}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isAr
                                        ? "تُعرض هذه الصورة كخلفية بانرية فاخرة في الترويسة العلوية لصفحة الشحن والتوصيل. إذا تُركت فارغة، سيتم عرض تصميم الترويسة الداكن الأنيق تلقائياً."
                                        : "This image serves as the atmospheric background banner on /shipping-returns. If left empty, the clean dark-navy typography hero is shown."}
                                </p>
                            </div>
                            <ImageUploadField
                                value={shippingReturnsImage || ""}
                                onChange={onImageChange}
                                folder="banners"
                                placeholder="/images/hawa_hero.jpg"
                            />
                        </div>
                    )}

                    {/* Group Fields */}
                    <div className="space-y-6">
                        {group.fields.map((field) => (
                            <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01]">
                                {/* English Field */}
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                    <span className="inline-flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400">
                                        <span>🇬🇧</span>
                                        <span>{field.en}</span>
                                    </span>
                                    {field.multiline ? (
                                        <textarea
                                            rows={3}
                                            maxLength={5000}
                                            value={value.en[field.key] || ""}
                                            onChange={(event) => updateField("en", field.key, event.target.value)}
                                            placeholder={field.placeholderEn}
                                            dir={field.dir || "ltr"}
                                            className={`${inputClassName} resize-y font-normal`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            maxLength={5000}
                                            value={value.en[field.key] || ""}
                                            onChange={(event) => updateField("en", field.key, event.target.value)}
                                            placeholder={field.placeholderEn}
                                            dir={field.dir || "ltr"}
                                            className={`${inputClassName} font-normal`}
                                        />
                                    )}
                                </label>

                                {/* Arabic Field */}
                                <label dir="rtl" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                    <span className="inline-flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400">
                                        <span>🇸🇦</span>
                                        <span>{field.ar}</span>
                                    </span>
                                    {field.multiline ? (
                                        <textarea
                                            rows={3}
                                            maxLength={5000}
                                            value={value.ar[field.key] || ""}
                                            onChange={(event) => updateField("ar", field.key, event.target.value)}
                                            placeholder={field.placeholderAr}
                                            dir={field.dir || "rtl"}
                                            className={`${inputClassName} resize-y font-normal`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            maxLength={5000}
                                            value={value.ar[field.key] || ""}
                                            onChange={(event) => updateField("ar", field.key, event.target.value)}
                                            placeholder={field.placeholderAr}
                                            dir={field.dir || "rtl"}
                                            className={`${inputClassName} font-normal`}
                                        />
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {/* Bottom Save Action */}
            {onSave && (
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-sm font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 text-[#E5B54A]" />
                                <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
