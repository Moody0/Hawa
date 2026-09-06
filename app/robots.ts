import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hawatrading.com';

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
