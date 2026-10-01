'use client';
import type { WebsiteContent } from '@/lib/website-content';

const toggles: [keyof WebsiteContent, string, string][] = [
    ['homeHeroEnabled', 'Home banners', 'بنرات الرئيسية'], ['homeBrandsEnabled', 'Home partners', 'شركاء الرئيسية'],
    ['homeCategoriesEnabled', 'Home categories', 'أقسام الرئيسية'], ['homeFeaturedEnabled', 'Featured collections', 'تشكيلات المنتجات'],
    ['aboutStoryEnabled', 'About: company story', 'من نحن: قصة الشركة'], ['aboutValuesEnabled', 'About: values', 'من نحن: قيم الشركة'],
    ['aboutContactEnabled', 'About: contact invitation', 'من نحن: دعوة التواصل'],
    ['navHomeEnabled', 'Navigation: Home', 'القائمة: الرئيسية'], ['navAboutEnabled', 'Navigation: About', 'القائمة: من نحن'],
    ['navBrandsEnabled', 'Navigation: Partners', 'القائمة: الشركات'], ['navProductsEnabled', 'Navigation: Products', 'القائمة: المنتجات'],
    ['navShippingEnabled', 'Navigation: Shipping', 'القائمة: الشحن'], ['navBlogEnabled', 'Navigation: Blog', 'القائمة: المدونة'], ['navContactEnabled', 'Navigation: Contact', 'القائمة: التواصل'],
];
const fields: [keyof WebsiteContent, string, string][] = [
    ['homeIntroTitle', 'Home welcome title', 'عنوان ترحيب الرئيسية'], ['homeIntroDescription', 'Home welcome description', 'وصف ترحيب الرئيسية'],
    ['homeBrandsTitle', 'Partners title', 'عنوان الشركاء'], ['homeBrandsDescription', 'Partners description', 'وصف الشركاء'],
    ['businessHours', 'Business hours', 'أوقات العمل'], ['aboutContactTitle', 'About contact title', 'عنوان التواصل في من نحن'],
    ['aboutContactDescription', 'About contact description', 'وصف التواصل في من نحن'], ['aboutContactButton', 'About contact button', 'زر التواصل في من نحن'],
    ['blogTitle', 'Blog title', 'عنوان المدونة'], ['blogDescription', 'Blog introduction', 'مقدمة المدونة'],
];
export default function WebsiteControlsSection({ value, onChange, contacts, onContactChange, isArabic }: {
    value: WebsiteContent; onChange: (value: WebsiteContent) => void;
    contacts: Record<string, string>; onContactChange: (field: string, value: string) => void; isArabic: boolean;
}) {
    const inputClass = 'w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
    const updateContact = (key: string, text: string) => {
        if (key === 'whatsappNumber' && /^https:\/\/wa\.me\/\d+\/?(?:\?.*)?$/.test(contacts.footerWhatsappUrl || '')) {
            onContactChange('footerWhatsappUrl', '');
        }
        onContactChange(key, text);
    };
    return <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-bold mb-2">{isArabic ? 'التحكم العام بالموقع' : 'Website controls'}</h3>
            <p className="text-sm text-slate-500 mb-6">{isArabic ? 'الأقسام التي تعتمد على منتجات أو شركات تختفي تلقائياً عندما تكون فارغة. يظهر الترحيب عند إيقاف البنرات أو عدم وجود بنرات فعالة.' : 'Catalog sections hide automatically when empty. The welcome message appears when banners are disabled or no active banners exist.'}</p>
            <div className="grid gap-4 sm:grid-cols-2">{toggles.map(([key, en, ar]) => <label key={key} className="flex gap-3 items-center p-3 border rounded-lg"><input type="checkbox" checked={Boolean(value[key])} onChange={e => onChange({ ...value, [key]: e.target.checked })} />{isArabic ? ar : en}</label>)}</div>
            <div className="grid gap-5 mt-6">{fields.map(([key, en, ar]) => <fieldset key={key} className="grid gap-3 sm:grid-cols-2"><legend className="font-semibold mb-2">{isArabic ? ar : en}</legend>
                <label className="space-y-1">English<input className={inputClass} value={String(value[key])} onChange={e => onChange({ ...value, [key]: e.target.value })} maxLength={5000} dir="ltr" /></label>
                <label className="space-y-1">العربية<input className={inputClass} value={String(value[`${key}Ar` as keyof WebsiteContent])} onChange={e => onChange({ ...value, [`${key}Ar`]: e.target.value })} maxLength={5000} dir="rtl" /></label>
            </fieldset>)}</div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-bold mb-2">{isArabic ? 'بيانات التواصل الموحدة' : 'Shared contact information'}</h3>
            <p className="text-sm text-slate-500 mb-5">{isArabic ? 'تطبق هذه البيانات على الترويسة والفوتر وحسابات التجار والسلة وصفحة التواصل وبقية روابط الدعم. تترك روابط التواصل الاجتماعي الفارغة مخفية.' : 'These details apply to the header, footer, merchant support, cart, contact page, and other support links. Blank social links stay hidden.'}</p>
            <label className="block mb-5">{isArabic ? 'هاتف الإدارة (اختياري)' : 'Management phone (optional)'}<input type="tel" className={inputClass} value={value.managementPhone} onChange={e => onChange({ ...value, managementPhone: e.target.value })} maxLength={32} dir="ltr" /></label>
            <div className="grid gap-5 sm:grid-cols-2">{[
                ['footerPhone', 'Sales phone', 'هاتف المبيعات'], ['whatsappNumber', 'WhatsApp number', 'رقم واتساب'],
                ['footerEmail', 'Email', 'البريد الإلكتروني'], ['footerAddress', 'Address (English)', 'العنوان بالإنجليزية'],
                ['footerAddressAr', 'Address (Arabic)', 'العنوان بالعربية'], ['footerFacebookUrl', 'Facebook URL', 'رابط فيسبوك'],
                ['footerInstagramUrl', 'Instagram URL', 'رابط إنستغرام'], ['footerLinkedinUrl', 'LinkedIn URL', 'رابط لينكدإن'],
                ['footerWhatsappUrl', 'WhatsApp link override (optional)', 'رابط واتساب مخصص (اختياري)'],
            ].map(([key, en, ar]) => <label key={key} className="text-sm font-semibold space-y-2">{isArabic ? ar : en}<input className={inputClass} value={contacts[key] === '#' ? '' : contacts[key] || ''} onChange={e => updateContact(key, e.target.value)} maxLength={1000} type={key === 'footerEmail' ? 'email' : key.endsWith('Url') ? 'url' : 'text'} dir={key.endsWith('Ar') ? 'rtl' : 'ltr'} /></label>)}</div>
            <div className="mt-6 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 text-sm space-y-2" aria-label={isArabic ? 'معاينة بيانات التواصل' : 'Contact details preview'}>
                <p>{isArabic ? contacts.footerAddressAr : contacts.footerAddress}</p><p dir="ltr">{contacts.footerPhone}</p><p dir="ltr">{contacts.footerEmail}</p>
            </div>
        </section>
    </div>;
}
