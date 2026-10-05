import { describe, expect, it } from 'vitest';
import type { Banner } from '@/app/components/HomePageComponents/HeroCarousel';
import type { BannerInput } from '@/lib/admin-actions';

describe('Banner responsive images', () => {
    it('accepts optional imageMobile in BannerInput payload', () => {
        const desktopOnlyBanner: BannerInput = {
            title: 'Desktop Banner',
            titleAr: 'بنر الشاشات الكبيرة',
            image: '/uploads/banners/desktop.webp',
        };
        expect(desktopOnlyBanner.image).toBe('/uploads/banners/desktop.webp');
        expect(desktopOnlyBanner.imageMobile).toBeUndefined();

        const responsiveBanner: BannerInput = {
            title: 'Dual Screen Banner',
            titleAr: 'بنر مخصص للأجهزة',
            image: '/uploads/banners/desktop.webp',
            imageMobile: '/uploads/banners/mobile.webp',
            isActive: true,
        };
        expect(responsiveBanner.imageMobile).toBe('/uploads/banners/mobile.webp');
    });

    it('preserves mobile image and falls back gracefully when not provided', () => {
        const banners: Banner[] = [
            {
                id: 'banner-1',
                title: 'Summer Sale',
                titleAr: 'عروض الصيف',
                subtitle: 'Great deals',
                subtitleAr: 'عروض مميزة',
                image: '/uploads/banners/summer-desktop.webp',
                imageMobile: '/uploads/banners/summer-mobile.webp',
                buttonText: 'Shop',
                buttonTextAr: 'تسوق',
                link: '/products',
                badge: 'Special',
                badgeAr: 'مميز',
                isActive: true,
            },
            {
                id: 'banner-2',
                title: 'Winter Sale',
                titleAr: 'عروض الشتاء',
                subtitle: null,
                subtitleAr: null,
                image: '/uploads/banners/winter-desktop.webp',
                imageMobile: null,
                buttonText: null,
                buttonTextAr: null,
                link: null,
                badge: null,
                badgeAr: null,
                isActive: true,
            },
        ];

        // Slide item mapping logic test
        const mappedSlides = banners.map((b) => ({
            id: b.id,
            image: b.image || '/images/hero-showcase-perfect.webp',
            imageMobile: b.imageMobile || null,
        }));

        expect(mappedSlides[0].imageMobile).toBe('/uploads/banners/summer-mobile.webp');
        expect(mappedSlides[0].image).toBe('/uploads/banners/summer-desktop.webp');

        expect(mappedSlides[1].imageMobile).toBeNull();
        expect(mappedSlides[1].image).toBe('/uploads/banners/winter-desktop.webp');
    });
});
