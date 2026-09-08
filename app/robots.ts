import { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_ORIGIN;

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/products',
                    '/products/*',
                    '/departments/*',
                    '/department/*',
                    '/categories',
                    '/categories/*',
                    '/brands',
                    '/brands/*',
                    '/blog',
                    '/blog/*',
                    '/about-us',
                    '/shipping-returns',
                ],
                disallow: [
                    '/admin/',
                    '/admin/*',
                    '/api/',
                    '/api/*',
                    '/account/',
                    '/account/*',
                    '/cart',
                    '/place-order',
                    '/complete-order',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
