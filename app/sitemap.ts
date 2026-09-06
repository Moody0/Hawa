import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Revalidate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hawatrading.com';

    try {
        // 1. Static high-priority routes
        const staticRoutes: MetadataRoute.Sitemap = [
            {
                url: `${baseUrl}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${baseUrl}/products`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${baseUrl}/brands`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/categories`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/blog`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            },
            {
                url: `${baseUrl}/about-us`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            },
            {
                url: `${baseUrl}/shipping-returns`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
        ];

        // 2. Fetch all active products
        const products = await prisma.product.findMany({
            where: {
                brand: { isActive: true },
            },
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // 3. Fetch all active Main Categories (Departments)
        const departments = await prisma.mainCategory.findMany({
            where: { isActive: true },
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        const departmentRoutes: MetadataRoute.Sitemap = departments.map((dept) => ({
            url: `${baseUrl}/departments/${dept.slug}`,
            lastModified: dept.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.85,
        }));

        // 4. Fetch all active Brands
        const brands = await prisma.brand.findMany({
            where: { isActive: true },
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
            url: `${baseUrl}/brands/${brand.slug}`,
            lastModified: brand.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // 5. Fetch all active Categories
        const categories = await prisma.category.findMany({
            where: { brand: { isActive: true } },
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
            url: `${baseUrl}/categories/${cat.slug}`,
            lastModified: cat.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.75,
        }));

        // 6. Fetch all published Blog Posts
        const posts = await prisma.post.findMany({
            where: { isPublished: true },
            select: {
                slug: true,
                updatedAt: true,
            },
        });

        const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.7,
        }));

        return [
            ...staticRoutes,
            ...departmentRoutes,
            ...productRoutes,
            ...brandRoutes,
            ...categoryRoutes,
            ...postRoutes,
        ];
    } catch (error) {
        console.error('Failed to generate dynamic sitemap:', error);
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
        ];
    }
}
