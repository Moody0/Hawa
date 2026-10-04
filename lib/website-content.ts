export const PARTNER_PRIDE_TITLE_AR = 'نَفْخَرُ بِتَمْثِيلِ وَتَوْزِيعِ أَصْنَافِ شَرِكَةِ بَيْتِنْجَانَة إِخْوَان';

const LEGACY_PARTNER_PRIDE_TITLE_AR = 'نفخر بتمثيل وتوزيع أصناف شركة بيتنجانة إخوان';

export const DEFAULT_WEBSITE_CONTENT = {
    homeHeroEnabled: true, homeBrandsEnabled: true, homeCategoriesEnabled: true, homeFeaturedEnabled: true,
    homeIntroTitle: 'Hawa Distribution & Trading', homeIntroTitleAr: 'حوا للتوزيع والتجارة',
    homeIntroDescription: 'Browse our wholesale catalog or contact our team about supplying your business.',
    homeIntroDescriptionAr: 'تصفح كتالوج الجملة أو تواصل مع فريقنا لتوريد احتياجات متجرك.',
    homeBrandsTitle: 'Our partners', homeBrandsTitleAr: 'شركاؤنا',
    homeBrandsDescription: 'Explore products by brand.', homeBrandsDescriptionAr: 'تصفح المنتجات حسب الشركة.',
    managementPhone: '+963 994 166 000', businessHours: '', businessHoursAr: '',
    homePrideEnabled: true,
    homePrideBadge: 'Official distribution partner', homePrideBadgeAr: 'وكيل توزيع معتمد',
    homePrideTitle: 'Proud to represent and distribute Bitinjana Brothers products',
    homePrideTitleAr: PARTNER_PRIDE_TITLE_AR,
    homePrideDescription: 'Original products delivered straight to your store through the Hawa distribution network.',
    homePrideDescriptionAr: 'أصناف أصلية تصل إلى متجرك مباشرة عبر شبكة توزيع حوا.',
    homePrideButton: 'Browse products', homePrideButtonAr: 'تصفح الأصناف',
    homePrideLink: '/products',
    aboutStoryEnabled: true, aboutValuesEnabled: true, aboutContactEnabled: true,
    aboutContactTitle: 'Talk to our team', aboutContactTitleAr: 'تواصل مع فريقنا',
    aboutContactDescription: 'For wholesale orders, merchant accounts, and business partnerships.',
    aboutContactDescriptionAr: 'لطلبات الجملة وحسابات التجار والشراكات التجارية.',
    aboutContactButton: 'Contact us', aboutContactButtonAr: 'تواصل معنا',
    navHomeEnabled: true, navAboutEnabled: true, navBrandsEnabled: true, navProductsEnabled: true,
    navShippingEnabled: true, navBlogEnabled: true, navContactEnabled: true,
    blogTitle: 'News and articles', blogTitleAr: 'أخبار ومقالات',
    blogDescription: 'Updates from our team and information for wholesale customers.',
    blogDescriptionAr: 'أخبار فريقنا ومعلومات لعملاء الجملة.',
};
export type WebsiteContent = typeof DEFAULT_WEBSITE_CONTENT;

export function getWebsiteContent(raw: unknown): WebsiteContent {
    const result = { ...DEFAULT_WEBSITE_CONTENT };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    for (const key of Object.keys(result) as (keyof WebsiteContent)[]) {
        const value = (raw as Record<string, unknown>)[key];
        if (typeof value === typeof result[key]) Object.assign(result, { [key]: value });
    }
    if (result.homePrideTitleAr === LEGACY_PARTNER_PRIDE_TITLE_AR) {
        result.homePrideTitleAr = PARTNER_PRIDE_TITLE_AR;
    }
    return result;
}

export function publicContactUrl(value: unknown): string {
    if (typeof value !== 'string' || !value.trim() || value.trim() === '#') return '';
    try {
        const url = new URL(value.trim());
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch { return ''; }
}

export function getSiteContacts(settings: Record<string, any> = {}) {
    const content = getWebsiteContent(settings.websiteContent);
    const phone = typeof settings.footerPhone === 'string' ? settings.footerPhone.trim() : '';
    const whatsappPhone = typeof settings.whatsappNumber === 'string' ? settings.whatsappNumber.trim() : phone;
    const whatsappDigits = whatsappPhone.replace(/\D/g, '');
    return {
        content,
        phone, whatsappDigits,
        whatsappUrl: publicContactUrl(settings.footerWhatsappUrl) || (whatsappDigits ? `https://wa.me/${whatsappDigits}` : ''),
        email: typeof settings.footerEmail === 'string' ? settings.footerEmail.trim() : '',
        managementPhone: content.managementPhone,
        address: settings.footerAddress || '', addressAr: settings.footerAddressAr || '',
        hours: content.businessHours, hoursAr: content.businessHoursAr,
        facebook: publicContactUrl(settings.footerFacebookUrl), instagram: publicContactUrl(settings.footerInstagramUrl),
        linkedin: publicContactUrl(settings.footerLinkedinUrl),
    };
}

export function navigationLinkEnabled(href: string, content: WebsiteContent): boolean {
    const keys: Record<string, keyof WebsiteContent> = { '/': 'navHomeEnabled', '/about-us': 'navAboutEnabled', '/brands': 'navBrandsEnabled', '/products': 'navProductsEnabled', '/shipping-returns': 'navShippingEnabled', '/blog': 'navBlogEnabled', '/contact': 'navContactEnabled' };
    return keys[href] ? content[keys[href]] !== false : true;
}

export function whatsappHref(contacts: ReturnType<typeof getSiteContacts>, message?: string): string {
    if (!contacts.whatsappUrl) return '/contact';
    const url = new URL(contacts.whatsappUrl);
    if (message) url.searchParams.set('text', message);
    return url.href;
}
