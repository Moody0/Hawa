export const PRIVACY_POLICY_FIELDS = [
    "heroBadge",
    "heroTitle",
    "heroDescription",
    "lastUpdated",
    "section1Badge",
    "section1Title",
    "section1Desc",
    "businessInfoTitle",
    "businessInfoDesc",
    "contactInfoTitle",
    "contactInfoDesc",
    "ordersInfoTitle",
    "ordersInfoDesc",
    "section2Badge",
    "section2Title",
    "section2Desc",
    "usageDeliveryTitle",
    "usageDeliveryDesc",
    "usageVerificationTitle",
    "usageVerificationDesc",
    "usageCommunicationTitle",
    "usageCommunicationDesc",
    "section3Badge",
    "section3Title",
    "section3Desc",
    "noSellingTitle",
    "noSellingDesc",
    "securityMeasuresTitle",
    "securityMeasuresDesc",
    "section4Badge",
    "section4Title",
    "section4Desc",
    "rightsUpdateTitle",
    "rightsUpdateDesc",
    "supportHeading",
    "supportDesc",
    "contactButtonText",
    "contactButtonLink",
] as const;

export type PrivacyPolicyField = (typeof PRIVACY_POLICY_FIELDS)[number];
export type PrivacyPolicyLocaleContent = Record<PrivacyPolicyField, string>;
export type PrivacyPolicyContent = {
    en: PrivacyPolicyLocaleContent;
    ar: PrivacyPolicyLocaleContent;
};

export const DEFAULT_PRIVACY_POLICY_CONTENT: PrivacyPolicyContent = {
    en: {
        heroBadge: "Data Protection & Commercial Privacy",
        heroTitle: "Privacy Policy & Merchant Confidentiality",
        heroDescription: "At Hawa Distribution & Trading, we are dedicated to protecting the privacy and commercial confidentiality of our partner retail stores, supermarkets, and wholesale merchants across Syria.",
        lastUpdated: "Last Updated: September 2026",
        section1Badge: "Data Collection",
        section1Title: "1. Information We Collect",
        section1Desc: "We only collect data strictly necessary to authenticate your wholesale merchant account, process trade orders, and dispatch scheduled deliveries directly to your store door.",
        businessInfoTitle: "Store & Business Information",
        businessInfoDesc: "Store or supermarket trade name, physical store address, and governorate/city to ensure precise logistics route scheduling and direct door unloading.",
        contactInfoTitle: "Direct Contact Details",
        contactInfoDesc: "Name of the business owner or receiving manager, mobile phone number, and WhatsApp number for order confirmation, invoice sharing, and delivery coordination.",
        ordersInfoTitle: "Commercial Orders & Invoices",
        ordersInfoDesc: "Wholesale item selections, carton quantities, printed/electronic invoices, payment terms, and signed delivery confirmations for mutual trade accounting records.",
        section2Badge: "Usage & Operations",
        section2Title: "2. How We Use Merchant Information",
        section2Desc: "Information is used solely for operational and logistics execution directly tied to servicing your retail store and business.",
        usageDeliveryTitle: "Wholesale Order Delivery & Dispatch",
        usageDeliveryDesc: "Preparing cases at central warehouses in Homs and dispatching distribution trucks to your store door according to scheduled weekly runs.",
        usageVerificationTitle: "Trade Account Verification & Pricing",
        usageVerificationDesc: "Authenticating merchant credentials to grant access to authorized wholesale pricing tiers, agency catalogs, and bulk volume discounts.",
        usageCommunicationTitle: "Operational & Logistics Updates",
        usageCommunicationDesc: "Directly notifying you when your order is dispatched, confirming arrival times, and alerting you to new stock from authorized commercial agencies.",
        section3Badge: "Confidentiality & Security",
        section3Title: "3. Commercial Confidentiality & Security",
        section3Desc: "Protecting your trade secrets, order volumes, and market transactions is a cornerstone of our partnership.",
        noSellingTitle: "Strict Non-Disclosure Guarantee",
        noSellingDesc: "We never sell, rent, monetize, or disclose merchant information, purchasing volumes, or commercial activity to any third parties or competitors under any circumstances.",
        securityMeasuresTitle: "Database Security & Access Control",
        securityMeasuresDesc: "All trade records and order archives are stored in encrypted, secured systems. Internal access is strictly restricted to designated logistics dispatch and accounting personnel.",
        section4Badge: "Merchant Rights",
        section4Title: "4. Your Rights & Data Controls",
        section4Desc: "We provide our wholesale partners with complete visibility and autonomy over their registered store information.",
        rightsUpdateTitle: "Review & Update Information",
        rightsUpdateDesc: "You have the right to inspect, update, or modify your store address, authorized recipient numbers, or contact details anytime by contacting our management desk.",
        supportHeading: "Questions regarding your commercial data privacy?",
        supportDesc: "Hawa Distribution management is available to assist you with any questions regarding data confidentiality or account security.",
        contactButtonText: "Contact Management",
        contactButtonLink: "/contact",
    },
    ar: {
        heroBadge: "حماية البيانات والسرية التجارية",
        heroTitle: "سياسة الخصوصية وسرية بيانات التجار",
        heroDescription: "نلتزم في شركة حوا للتوزيع والتجارة بحماية خصوصية بيانات عملائنا من أصحاب المحلات والسوبرماركت ومستودعات الجملة في كافة المحافظات، وضمان أعلى درجات السرية لكافة المعاملات والطلبيات.",
        lastUpdated: "آخر تحديث: سبتمبر 2026",
        section1Badge: "جمع البيانات",
        section1Title: "1. البيانات والمعلومات التي نقوم بجمعها",
        section1Desc: "نجمع فقط المعلومات الضرورية لاعتماد وتوثيق حساب التاجر، وتجهيز طلبيات الجملة، وضمان وصول شاحنات التوزيع لباب المحل بدقة وسرعة.",
        businessInfoTitle: "بيانات النشاط التجاري والمحل",
        businessInfoDesc: "اسم المحل أو السوبرماركت، العنوان الجغرافي للمتجر أو المستودع، والمحافظة/المدينة لجدولة مسارات سيارات الشحن والتسليم المباشر لباب المتجر.",
        contactInfoTitle: "معلومات الاتصال المباشر",
        contactInfoDesc: "اسم التاجر أو الشخص المفوض بالاستلام، رقم الهاتف الجوال، ورقم الواتساب للتنسيق اللوجستي الفوري ومطابقة الفاتورة عند الوصول.",
        ordersInfoTitle: "سجلات الطلبيات والفواتير التجارية",
        ordersInfoDesc: "تفاصيل الأصناف والكميات المطلوبة، الفواتير الورقية والإلكترونية، وحالة السداد وإشعارات الاستلام لتوثيق القيود المحاسبية المشتركة.",
        section2Badge: "الاستخدام والتشغيل",
        section2Title: "2. أوجه استخدام وإدارة البيانات",
        section2Desc: "تُستخدم البيانات للأغراض التشغيلية والتجارية المرتبطة بخدمة متجركم وتأمين احتياجاته من السلع الاستهلاكية والمواد الغذائية دون أي استخدامات غير مرغوبة.",
        usageDeliveryTitle: "تجهيز وتوصيل طلبيات الجملة",
        usageDeliveryDesc: "إعداد الطرود في المستودعات المركزية في حمص وتسيير شاحنات التوزيع لباب متجركم وفق جداول التوريد الأسبوعية المعتمدة.",
        usageVerificationTitle: "اعتماد حسابات الجملة والأسعار الخاصة",
        usageVerificationDesc: "التحقق من صفة المتجر لاعتماد حسابه التجاري وتمكينه من الاطلاع على أسعار الجملة المباشرة وتخفيضات الكميات للوكالات.",
        usageCommunicationTitle: "التواصل اللوجستي وتحديثات الوكالات",
        usageCommunicationDesc: "إشعاركم بتحرك سيارة الشحن لمحافظتكم، وتأكيد وصول الطلبيات، وإعلامكم بتوافر أصناف جديدة أو عروض توريد من الوكالات الحصرية.",
        section3Badge: "السرية والأمان",
        section3Title: "3. السرية التجارية وأمن المعلومات",
        section3Desc: "نضع سرية تعاملات متجركم وحجم مبيعاتكم في قمة أولوياتنا كشريك تجاري موثوق.",
        noSellingTitle: "حظر بيع أو تأجير البيانات قطعياً",
        noSellingDesc: "لا نقوم نهائياً ببيع، تأجير، أو مشاركة أي بيانات تخص متجركم أو حجم طلبياتكم مع أي جهة خارجية أو تجار منافسين تحت أي ظرف.",
        securityMeasuresTitle: "إجراءات حماية قواعد البيانات",
        securityMeasuresDesc: "تُحفظ سجلات الطلبيات والبيانات التجارية في بيئة مشفرة ومؤمنة، مع حصر صلاحيات الوصول على موظفي الحركة اللوجستية والحسابات المعنيين فقط.",
        section4Badge: "حقوق التاجر",
        section4Title: "4. حقوق التاجر والتحكم بالحساب",
        section4Desc: "نمنح شركاءنا التجاريين تحكماً كاملاً في مراجعة وتحديث معلوماتهم المسجلة لدينا.",
        rightsUpdateTitle: "تحديث ومراجعة البيانات المسجلة",
        rightsUpdateDesc: "يحق للتاجر مراجعة وتعديل بيانات الاتصال، وعناوين الفروع، أو طلب تجميد الحساب التجاري في أي وقت بالتواصل المباشر مع إدارة التوزيع.",
        supportHeading: "هل لديك استفسار حول سياسة الخصوصية وسرية بياناتك؟",
        supportDesc: "فريق الإدارة العامة لشركة حوا للتوزيع في خدمتكم للإجابة على أي استفسار يخص التعامل مع بياناتكم وسرية معاملاتكم التجارية.",
        contactButtonText: "تواصل مع الإدارة",
        contactButtonLink: "/contact",
    },
};

function sanitizeString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value.trim() : fallback;
}

export function getPrivacyPolicyContent(
    rawContent: unknown,
    fallbackSettings?: any
): PrivacyPolicyContent {
    const raw = (typeof rawContent === "object" && rawContent !== null ? rawContent : {}) as Partial<PrivacyPolicyContent>;
    const rawEn = (raw.en && typeof raw.en === "object" ? raw.en : {}) as Partial<PrivacyPolicyLocaleContent>;
    const rawAr = (raw.ar && typeof raw.ar === "object" ? raw.ar : {}) as Partial<PrivacyPolicyLocaleContent>;

    const en: PrivacyPolicyLocaleContent = {} as PrivacyPolicyLocaleContent;
    const ar: PrivacyPolicyLocaleContent = {} as PrivacyPolicyLocaleContent;

    for (const field of PRIVACY_POLICY_FIELDS) {
        en[field] = sanitizeString(rawEn[field], DEFAULT_PRIVACY_POLICY_CONTENT.en[field]);
        ar[field] = sanitizeString(rawAr[field], DEFAULT_PRIVACY_POLICY_CONTENT.ar[field]);
    }

    return { en, ar };
}

export function normalizePrivacyPolicyContent(input: unknown): PrivacyPolicyContent | null {
    if (!input || typeof input !== "object") return null;

    const candidate = input as { en?: Record<string, unknown>; ar?: Record<string, unknown> };
    if (!candidate.en || !candidate.ar || typeof candidate.en !== "object" || typeof candidate.ar !== "object") {
        return null;
    }

    const en: Partial<PrivacyPolicyLocaleContent> = {};
    const ar: Partial<PrivacyPolicyLocaleContent> = {};

    for (const field of PRIVACY_POLICY_FIELDS) {
        en[field] = typeof candidate.en[field] === "string"
            ? candidate.en[field].slice(0, 5000)
            : DEFAULT_PRIVACY_POLICY_CONTENT.en[field];

        ar[field] = typeof candidate.ar[field] === "string"
            ? candidate.ar[field].slice(0, 5000)
            : DEFAULT_PRIVACY_POLICY_CONTENT.ar[field];
    }

    return {
        en: en as PrivacyPolicyLocaleContent,
        ar: ar as PrivacyPolicyLocaleContent,
    };
}
