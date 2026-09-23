export const CONTACT_PAGE_FIELDS = [
    "heroTitle",
    "heroDescription",
    "salesTag",
    "salesTitle",
    "salesDesc",
    "salesPhone",
    "salesWhatsapp",
    "salesWhatsappBtn",
    "salesCallBtn",
    "salesWhatsappMsg",
    "gmTag",
    "gmTitle",
    "gmDesc",
    "gmPhone",
    "gmWhatsapp",
    "gmCallBtn",
    "gmWhatsappBtn",
    "gmWhatsappMsg",
    "warehouseTitle",
    "warehouseDesc",
    "hoursTitle",
    "hoursDesc",
    "formTitle",
    "formDesc",
    "formNameLabel",
    "formNamePlaceholder",
    "formShopLabel",
    "formShopPlaceholder",
    "formPhoneLabel",
    "formPhonePlaceholder",
    "formCityLabel",
    "formCityPlaceholder",
    "formMessageLabel",
    "formMessagePlaceholder",
    "formSubmitBtn",
    "formTargetWhatsapp",
] as const;

export type ContactPageField = (typeof CONTACT_PAGE_FIELDS)[number];
export type ContactPageLocaleContent = Record<ContactPageField, string>;
export type ContactPageContent = {
    en: ContactPageLocaleContent;
    ar: ContactPageLocaleContent;
};

export const DEFAULT_CONTACT_PAGE_CONTENT: ContactPageContent = {
    en: {
        heroTitle: "We're Glad to Connect & Serve Your Store",
        heroDescription: "Hawa Distribution & Trading team is at your service for wholesale pricing inquiries, agency partnerships, and scheduled order delivery.",
        salesTag: "Wholesale & Sales Management",
        salesTitle: "Commercial Sales Manager",
        salesDesc: "For store and supermarket orders, new merchant account approval, and scheduled agency deliveries.",
        salesPhone: "+963 993 443 901",
        salesWhatsapp: "+963 993 443 901",
        salesWhatsappBtn: "WhatsApp Chat",
        salesCallBtn: "Phone Call",
        salesWhatsappMsg: "Hello Sales Manager at Hawa Distribution, I would like to inquire regarding wholesale orders and merchant registration.",
        gmTag: "General Management & Strategic Partnerships",
        gmTitle: "Company General Manager",
        gmDesc: "For new commercial agency representations, major exclusive supply agreements, and corporate contracts.",
        gmPhone: "+963 994 166 000",
        gmWhatsapp: "+963 994 166 000",
        gmCallBtn: "Phone Call",
        gmWhatsappBtn: "Management WhatsApp",
        gmWhatsappMsg: "Hello Management at Hawa Distribution, I would like to inquire regarding commercial partnership / agency representation.",
        warehouseTitle: "Central Warehouses & Offices",
        warehouseDesc: "Syrian Arab Republic – Homs – Industrial Zone / Central Distribution Hub.",
        hoursTitle: "Business Hours & Order Intake",
        hoursDesc: "Saturday – Thursday: 8:00 AM – 6:00 PM\n(Online & WhatsApp orders available 24/7, confirmed during early morning shifts).",
        formTitle: "Send an Inquiry or Message",
        formDesc: "Enter your inquiry or order details and our team will review and reply to you directly.",
        formNameLabel: "Full Name *",
        formNamePlaceholder: "e.g. John Doe",
        formShopLabel: "Shop or Business Name",
        formShopPlaceholder: "e.g. Al-Amana Supermarket",
        formPhoneLabel: "Mobile / WhatsApp Number *",
        formPhonePlaceholder: "09xxxxxxxx",
        formCityLabel: "Governorate / City",
        formCityPlaceholder: "Homs",
        formMessageLabel: "Inquiry or Order Details",
        formMessagePlaceholder: "Specify the brands or products you would like to inquire about wholesale prices or delivery schedules...",
        formSubmitBtn: "Send Message",
        formTargetWhatsapp: "+963 993 443 901",
    },
    ar: {
        heroTitle: "يسعدنا تواصلكم وخدمة متجركم",
        heroDescription: "فريق شركة حوا للتوزيع والتجارة في خدمتكم للإجابة على استفسارات أسعار الجملة، الشراكات مع الوكالات، وجدولة تسليم الطرود.",
        salesTag: "إدارة المبيعات وطلبيات الجملة",
        salesTitle: "مدير المبيعات التجارية",
        salesDesc: "لطلبيات المحلات والسوبرماركت، اعتماد حسابات التجار الجدد، وجدولة تسليم بضائع الوكالات.",
        salesPhone: "+963 993 443 901",
        salesWhatsapp: "+963 993 443 901",
        salesWhatsappBtn: "محادثة واتساب",
        salesCallBtn: "اتصال هاتفي",
        salesWhatsappMsg: "مرحباً أستاذ مدير المبيعات بشركة حوا للتوزيع، أود الاستفسار عن طلبيات الجملة واعتماد حساب تجاري.",
        gmTag: "الإدارة العامة والشراكات الاستراتيجية",
        gmTitle: "مدير الشركة",
        gmDesc: "لتمثيل الوكالات التجارية الجديدة، عقود التوريد الحصرية الكبرى، والتعاقدات المؤسساتية.",
        gmPhone: "+963 994 166 000",
        gmWhatsapp: "+963 994 166 000",
        gmCallBtn: "اتصال هاتفي",
        gmWhatsappBtn: "واتساب الإدارة",
        gmWhatsappMsg: "مرحباً إدارة شركة حوا للتوزيع، أود الاستفسار بخصوص شراكة تجارية / تمثيل وكالة.",
        warehouseTitle: "المستودعات الرئيسية والمكاتب",
        warehouseDesc: "الجمهورية العربية السورية – حمص – المنطقة الصناعية / مستودعات التوزيع المركزية.",
        hoursTitle: "أوقات العمل واستقبال الطلبات",
        hoursDesc: "السبت – الخميس: 8:00 صباحاً – 6:00 مساءً\n(الطلبات عبر الموقع والواتساب متاحة 24/7 وسيتم تأكيدها أول ساعات الدوام).",
        formTitle: "أرسل رسالة أو استفساراً",
        formDesc: "اكتب تفاصيل طلبك أو استفسارك وسيتم إرسالها إلى إدارتنا لمتابعتها والتواصل معكم مباشرة.",
        formNameLabel: "الاسم الكريم *",
        formNamePlaceholder: "محمد أحمد",
        formShopLabel: "اسم المحل أو الشركة",
        formShopPlaceholder: "سوبرماركت الأمانة",
        formPhoneLabel: "رقم الموبايل / واتساب *",
        formPhonePlaceholder: "09xxxxxxxx",
        formCityLabel: "المحافظة / المدينة",
        formCityPlaceholder: "حمص",
        formMessageLabel: "نص الاستفسار أو الطلب",
        formMessagePlaceholder: "اكتب الأصناف أو الوكالات التي ترغب بالاستفسار عن أسعار جملتها أو جدول توزيعها...",
        formSubmitBtn: "إرسال الرسالة",
        formTargetWhatsapp: "+963 993 443 901",
    },
};

function sanitizeString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value.trim() : fallback;
}

export function getContactPageContent(
    rawContent: unknown,
    fallbackSettings?: any
): ContactPageContent {
    const raw = (typeof rawContent === "object" && rawContent !== null ? rawContent : {}) as Partial<ContactPageContent>;
    const rawEn = (raw.en && typeof raw.en === "object" ? raw.en : {}) as Partial<ContactPageLocaleContent>;
    const rawAr = (raw.ar && typeof raw.ar === "object" ? raw.ar : {}) as Partial<ContactPageLocaleContent>;

    const defaultSalesWa = fallbackSettings?.whatsappNumber || DEFAULT_CONTACT_PAGE_CONTENT.ar.salesWhatsapp;

    const en: ContactPageLocaleContent = {} as ContactPageLocaleContent;
    const ar: ContactPageLocaleContent = {} as ContactPageLocaleContent;

    for (const field of CONTACT_PAGE_FIELDS) {
        const defaultEnVal = field === "salesWhatsapp" || field === "formTargetWhatsapp"
            ? (defaultSalesWa || DEFAULT_CONTACT_PAGE_CONTENT.en[field])
            : DEFAULT_CONTACT_PAGE_CONTENT.en[field];

        const defaultArVal = field === "salesWhatsapp" || field === "formTargetWhatsapp"
            ? (defaultSalesWa || DEFAULT_CONTACT_PAGE_CONTENT.ar[field])
            : DEFAULT_CONTACT_PAGE_CONTENT.ar[field];

        en[field] = sanitizeString(rawEn[field], defaultEnVal);
        ar[field] = sanitizeString(rawAr[field], defaultArVal);
    }

    return { en, ar };
}

export function normalizeContactPageContent(input: unknown): ContactPageContent | null {
    if (!input || typeof input !== "object") return null;

    const candidate = input as { en?: Record<string, unknown>; ar?: Record<string, unknown> };
    if (!candidate.en || !candidate.ar || typeof candidate.en !== "object" || typeof candidate.ar !== "object") {
        return null;
    }

    const en: Partial<ContactPageLocaleContent> = {};
    const ar: Partial<ContactPageLocaleContent> = {};

    for (const field of CONTACT_PAGE_FIELDS) {
        en[field] = typeof candidate.en[field] === "string"
            ? candidate.en[field].slice(0, 5000)
            : DEFAULT_CONTACT_PAGE_CONTENT.en[field];

        ar[field] = typeof candidate.ar[field] === "string"
            ? candidate.ar[field].slice(0, 5000)
            : DEFAULT_CONTACT_PAGE_CONTENT.ar[field];
    }

    return {
        en: en as ContactPageLocaleContent,
        ar: ar as ContactPageLocaleContent,
    };
}
