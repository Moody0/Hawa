export const SHIPPING_POLICY_FIELDS = [
    "heroBadge",
    "heroTitle",
    "heroDescription",
    "shippingSectionTitle",
    "shippingSectionDescription",
    "verificationTitle",
    "verificationDescription",
    "timelineTitle",
    "centralRegionLabel",
    "expressTimeline",
    "otherRegionsLabel",
    "standardTimeline",
    "timelineNote",
    "storeDoorTitle",
    "storeDoorDescription",
    "invoiceTitle",
    "invoiceDescription",
    "qualitySectionTitle",
    "qualitySectionDescription",
    "factoryCasesTitle",
    "factoryCasesDescription",
    "damagedCasesTitle",
    "damagedCasesDescription",
    "concealedDefectTitle",
    "concealedDefectDescription",
    "concealedDefectStep1",
    "concealedDefectStep2",
    "storageTitle",
    "storageDescription",
    "supportTitle",
    "supportDescription",
    "whatsappButtonLabel",
    "whatsappMessage",
] as const;

export type ShippingPolicyField = (typeof SHIPPING_POLICY_FIELDS)[number];
export type ShippingPolicyLocaleContent = Record<ShippingPolicyField, string>;
export type ShippingPolicyContent = {
    en: ShippingPolicyLocaleContent;
    ar: ShippingPolicyLocaleContent;
};

export const DEFAULT_SHIPPING_POLICY_CONTENT: ShippingPolicyContent = {
    en: {
        heroBadge: "Wholesale Delivery & Shipping Rules",
        heroTitle: "Shipping Guidelines & Receiving Policy",
        heroDescription: "Clear guidelines regarding wholesale case delivery to your store, carton verification upon receipt, and claims resolution.",
        shippingSectionTitle: "1. Shipping & Store-Door Delivery Rules",
        shippingSectionDescription: "Lead times, order confirmation, and store delivery logistics",
        verificationTitle: "Direct Order Verification",
        verificationDescription: "Our logistics desk confirms carton quantities and recipient contact details by phone before dispatching the delivery vehicle.",
        timelineTitle: "Official Delivery Timelines",
        centralRegionLabel: "Central Region (Homs)",
        expressTimeline: "Within 24 Hours (Daily Runs)",
        otherRegionsLabel: "All Other Governorates",
        standardTimeline: "1 - 3 Business Days",
        timelineNote: "Note: Distribution vehicles serve retailers across all Syrian governorates according to scheduled weekly runs.",
        storeDoorTitle: "Direct Store-Door Unloading",
        storeDoorDescription: "Our delivery team brings your wholesale cartons right to your shop door or ground floor storage room.",
        invoiceTitle: "Inspection & Official Invoice Check",
        invoiceDescription: "Merchants are requested to verify carton counts, check manufacturer seals with the driver, and reconcile the items against the attached printed invoice.",
        qualitySectionTitle: "2. Quality, Claims & Damaged Carton Policy",
        qualitySectionDescription: "Discrepancy handling, damaged carton credits, and merchant protections",
        factoryCasesTitle: "Manufacturer Sealed Wholesale Cases",
        factoryCasesDescription: "All wholesale items are delivered in intact factory cases with original manufacturer seals and certified shelf-life.",
        damagedCasesTitle: "Immediate On-Site Driver Replacement / Credit",
        damagedCasesDescription: "If any case is damaged during transit, you can immediately hand it back to the delivery driver. The invoice amount will be credited on the spot.",
        concealedDefectTitle: "24-Hour Concealed Defect Notification",
        concealedDefectDescription: "If a sealed case contains an internal packaging fault or discrepancy discovered after the driver leaves, follow these steps within 24 hours:",
        concealedDefectStep1: "Photograph the affected case and invoice number.",
        concealedDefectStep2: "Send photos with an invoice copy to Dispatch WhatsApp for prompt resolution.",
        storageTitle: "Safety & Temperature Storage Standards",
        storageDescription: "Our warehouses and trucks maintain controlled temperature environments, with total physical separation between food items and household goods.",
        supportTitle: "Questions regarding delivery schedules to your store?",
        supportDescription: "Our logistics dispatch desk is available to confirm route timings and order status.",
        whatsappButtonLabel: "WhatsApp",
        whatsappMessage: "Hello, I have an inquiry regarding wholesale delivery schedules to my area.",
    },
    ar: {
        heroBadge: "تعليمات التوزيع وسياسة التوريد",
        heroTitle: "شروط الشحن وتعليمات استلام البضائع",
        heroDescription: "دليل إرشادي مبسط يوضح قواعد تسليم طرود الجملة لباب المحل، وإجراءات فحص الكراتين، وسياسة معالجة الملاحظات لشركائنا التجاريين.",
        shippingSectionTitle: "1. قواعد الشحن والتوصيل المباشر",
        shippingSectionDescription: "مواعيد العمل، تأكيد الطلبيات، وآلية التسليم لباب المتجر",
        verificationTitle: "تأكيد الطلبية وجدولتها قبل الانطلاق",
        verificationDescription: "يتواصل منسق الحركة اللوجستية هاتفياً لتأكيد أعداد الكراتين، ونوع البضاعة، وعنوان المحل بدقة قبل تحريك سيارة التوزيع لضمان عدم حدوث أي تأخير أو خطأ.",
        timelineTitle: "مواعيد وفترات التوريد المعتمدة",
        centralRegionLabel: "حمص والمنطقة الوسطى",
        expressTimeline: "توصيل خلال 24 ساعة (رحلات يومية)",
        otherRegionsLabel: "باقي المحافظات السورية",
        standardTimeline: "1 - 3 أيام عمل حسب جدول المحافظة",
        timelineNote: "ملاحظة: شبكة سيارات التوزيع تغطي المتاجر ومحلات الجملة في كافة المحافظات وفق جداول أسبوعية منتظمة.",
        storeDoorTitle: "التسليم المباشر لباب المحل",
        storeDoorDescription: "يتولى سائق ومندوب التوزيع إنزال الطرود وتسليمها مباشرة على عتبة متجركم أو داخل مستودع المحل دون أن يتحمل التاجر أعباء نقل إضافية.",
        invoiceTitle: "المعاينة الفورية ومطابقة الفاتورة",
        invoiceDescription: "يطلب من صاحب المحل أو المستلم مطابقة أعداد الكراتين وسلامة الأختام مع المندوب ومقارنتها بالفاتورة الورقية المرفقة قبل التوقيع على إشعار الاستلام وسداد القيمة.",
        qualitySectionTitle: "2. سياسة الجودة والمطابقة والكراتين التالفة",
        qualitySectionDescription: "إجراءات استبدال الكراتين المتضررة وحماية حق التاجر",
        factoryCasesTitle: "تسليم بكراتين وعبوات المصنع الأصلية",
        factoryCasesDescription: "تسلم كافة بضائع الجملة في كراتين وعبوات المصنع الأصلية المغلقة والمطابقة للمواصفات القياسية وتواريخ الصلاحية المعتمدة.",
        damagedCasesTitle: "الاستبدال الفوري لأي كرتونة متضررة أثناء النقل",
        damagedCasesDescription: "في حال وجود أي كرتونة تعرضت للتلف أو الكسر أثناء الطريق، يحق للتاجر إرجاعها فوراً مع سائق الشحنة، ويتم تعديل الفاتورة أو خصم قيمتها في لحظة الاستلام دون أي تعقيدات.",
        concealedDefectTitle: "مهلة 24 ساعة للإبلاغ عن الملاحظات الخفية",
        concealedDefectDescription: "إذا تبين بعد فتح الكرتونة وجود نقص أو عيب مصنعي داخلي لم يظهر أثناء المعاينة الخارجية، يرجى اتباع الخطوتين التاليتين خلال 24 ساعة من الاستلام:",
        concealedDefectStep1: "تصوير الكرتونة المصابة ورقم الفاتورة.",
        concealedDefectStep2: "إرسال الصور مع صورة الفاتورة إلى واتساب إدارة الحركة لمعالجة الملاحظة.",
        storageTitle: "معايير التخزين والسلامة الغذائية",
        storageDescription: "تخضع مستودعاتنا وشاحناتنا لضوابط عزل دقيقة لدرجات الحرارة، مع فصل كامل بين المواد الغذائية والمنظفات المنزلية للحفاظ على جودة ونكهة السلع.",
        supportTitle: "هل لديك استفسار بخصوص مواعيد الشحن لمتجرك؟",
        supportDescription: "فريق حركة وتنسيق التوزيع جاهز للإجابة وتحديد موعد الرحلة القادمة لمنطقتك.",
        whatsappButtonLabel: "واتساب الحركة",
        whatsappMessage: "مرحباً، أود الاستفسار عن موعد رحلة التوزيع القادمة لمنطقتي.",
    },
};

const LEGACY_SETTINGS_FIELDS: Partial<Record<ShippingPolicyField, { en: string; ar: string }>> = {
    verificationTitle: { en: "verificationTitle", ar: "verificationTitleAr" },
    verificationDescription: { en: "verificationDesc", ar: "verificationDescAr" },
    expressTimeline: { en: "expressShippingTime", ar: "" },
    standardTimeline: { en: "standardShippingTime", ar: "" },
    invoiceTitle: { en: "shippingTitle", ar: "shippingTitleAr" },
    factoryCasesTitle: { en: "finalSaleTitle", ar: "finalSaleTitleAr" },
    storageTitle: { en: "hygieneTitle", ar: "hygieneTitleAr" },
    storageDescription: { en: "hygieneDesc", ar: "hygieneDescAr" },
};

export function getShippingPolicyContent(
    savedContent: unknown,
    legacySettings?: object | null,
): ShippingPolicyContent {
    const content: ShippingPolicyContent = {
        en: { ...DEFAULT_SHIPPING_POLICY_CONTENT.en },
        ar: { ...DEFAULT_SHIPPING_POLICY_CONTENT.ar },
    };

    if (legacySettings) {
        const legacyValues = legacySettings as Record<string, unknown>;
        for (const field of SHIPPING_POLICY_FIELDS) {
            const legacyFields = LEGACY_SETTINGS_FIELDS[field];
            if (!legacyFields) continue;

            for (const locale of ["en", "ar"] as const) {
                const legacyKey = legacyFields[locale];
                const legacyValue = legacyKey ? legacyValues[legacyKey] : null;
                if (typeof legacyValue === "string" && legacyValue.trim()) {
                    content[locale][field] = legacyValue;
                }
            }
        }
    }

    const normalized = normalizeShippingPolicyContent(savedContent);
    if (normalized) {
        content.en = { ...content.en, ...normalized.en };
        content.ar = { ...content.ar, ...normalized.ar };
    }

    return content;
}

export function normalizeShippingPolicyContent(value: unknown): ShippingPolicyContent | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;

    const candidate = value as Record<string, unknown>;
    const output = {} as ShippingPolicyContent;

    for (const locale of ["en", "ar"] as const) {
        const localeContent = candidate[locale];
        if (!localeContent || typeof localeContent !== "object" || Array.isArray(localeContent)) return null;

        const values = localeContent as Record<string, unknown>;
        const normalizedLocale = {} as ShippingPolicyLocaleContent;

        for (const field of SHIPPING_POLICY_FIELDS) {
            const fieldValue = values[field];
            if (typeof fieldValue !== "string" || fieldValue.length > 5000) return null;
            normalizedLocale[field] = fieldValue;
        }

        output[locale] = normalizedLocale;
    }

    return output;
}
