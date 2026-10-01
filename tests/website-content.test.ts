import { expect, it } from 'vitest';
import { getSiteContacts, getWebsiteContent, whatsappHref, publicContactUrl, navigationLinkEnabled } from '@/lib/website-content';
it('shares changed contacts and hides unconfigured social destinations', () => {
    const contacts = getSiteContacts({ footerPhone: '+963 911 111 111', whatsappNumber: '+963 922 222 222', footerEmail: 'team@example.com', footerFacebookUrl: '#', footerInstagramUrl: '', websiteContent: { managementPhone: '+963 933 333 333' } });
    expect(contacts.phone).toBe('+963 911 111 111');
    expect(contacts.email).toBe('team@example.com');
    expect(contacts.facebook).toBe('');
    expect(contacts.instagram).toBe('');
    expect(contacts.managementPhone).toBe('+963 933 333 333');
    expect(new URL(whatsappHref(contacts, 'Merchant support')).pathname).toBe('/963922222222');
    expect(whatsappHref(getSiteContacts())).toBe('/contact');
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
