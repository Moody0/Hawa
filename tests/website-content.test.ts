import { expect, it } from 'vitest';
import { contactPhoneDigits, formatContactPhone, getSiteContacts, getWebsiteContent, whatsappHref, publicContactUrl, navigationLinkEnabled, updateSharedContact } from '@/lib/website-content';
import { getContactPageContent } from '@/lib/contact-page-content';
it('shares changed contacts and hides unconfigured social destinations', () => {
    const contacts = getSiteContacts({ footerPhone: '+963 911 111 111', whatsappNumber: '+963 922 222 222', footerEmail: 'team@example.com', footerFacebookUrl: '#', footerInstagramUrl: '', websiteContent: { managementPhone: '+963 933 333 333' } });
    expect(contacts.phone).toBe('+963 911 111 111');
    expect(contacts.email).toBe('team@example.com');
    expect(contacts.facebook).toBe('');
    expect(contacts.instagram).toBe('');
    expect(contacts.managementPhone).toBe('+963 933 333 333');
    expect(new URL(whatsappHref(contacts, 'Merchant support')).pathname).toBe('/963922222222');
    expect(whatsappHref(getSiteContacts())).toBe('https://wa.me/963993443901');
});

it('keeps both manager numbers visible when saved contact values are blank', () => {
    const contacts = getSiteContacts({ footerPhone: ' ', whatsappNumber: '', websiteContent: { managementPhone: ' ' } });
    expect(formatContactPhone(contacts.phone)).toBe('0993443901');
    expect(formatContactPhone(contacts.managementPhone)).toBe('0994166000');
    expect(contacts.whatsappDigits).toBe('963993443901');
});

it('uses admin changes for both contact page languages and normalizes local numbers for links', () => {
    const settings = { footerPhone: '0991111111', websiteContent: { managementPhone: '٠٩٩٢٢٢٢٢٢٢' } };
    const content = getContactPageContent({}, settings);
    for (const locale of [content.en, content.ar]) {
        expect(locale.salesPhone).toBe('0991111111');
        expect(locale.salesWhatsapp).toBe('963991111111');
        expect(formatContactPhone(locale.gmPhone)).toBe('0992222222');
        expect(contactPhoneDigits(locale.gmWhatsapp)).toBe('963992222222');
    }
});

it('updates WhatsApp with a changed sales number when it follows the shared sales contact', () => {
    const saved = { footerPhone: '+963 993 443 901', whatsappNumber: '0993443901', footerWhatsappUrl: 'https://wa.me/963993443901' };
    const next = updateSharedContact(saved, 'footerPhone', '0991111111');
    expect(next.whatsappNumber).toBe('0991111111');
    expect(next.footerWhatsappUrl).toBe('');
    expect(whatsappHref(getSiteContacts(next))).toBe('https://wa.me/963991111111');
});

it('preserves an independently configured WhatsApp contact when a manager number changes', () => {
    const saved = { footerPhone: '0993443901', whatsappNumber: '0991111111', footerWhatsappUrl: 'https://wa.me/963992222222' };
    const next = updateSharedContact(saved, 'footerPhone', '0993333333');
    expect(next.whatsappNumber).toBe(saved.whatsappNumber);
    expect(next.footerWhatsappUrl).toBe(saved.footerWhatsappUrl);
});
it('hides only the configured navigation link while keeping other pages available', () => {
    const content = getWebsiteContent({ navBlogEnabled: false, blogTitleAr: 'أخبار الشركة' });
    expect(navigationLinkEnabled('/blog', content)).toBe(false);
    expect(navigationLinkEnabled('/products', content)).toBe(true);
    expect(navigationLinkEnabled('/unknown', content)).toBe(true);
    expect(getSiteContacts({ websiteContent: content }).content.blogTitleAr).toBe('أخبار الشركة');
});
it('honours a custom WhatsApp destination and editable section toggles', () => {
    const contacts = getSiteContacts({ footerWhatsappUrl: 'https://wa.me/963944444444' });
    expect(new URL(whatsappHref(contacts, 'Hello')).searchParams.get('text')).toBe('Hello');
    expect(getWebsiteContent({ homeFeaturedEnabled: false }).homeFeaturedEnabled).toBe(false);
    expect(getWebsiteContent({ homeFeaturedEnabled: 'false' }).homeFeaturedEnabled).toBe(true);
    expect(publicContactUrl('javascript:alert(1)')).toBe('');
});
