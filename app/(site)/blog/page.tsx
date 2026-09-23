import React from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BlogClient, { BlogPostItem } from './BlogClient';
import { getSiteSettings } from '@/lib/public-queries';
import { BLOG_SEED_POSTS } from '@/lib/blog-seed-posts';

export const revalidate = 60; // 1 minute revalidation

export const metadata: Metadata = {
    title: 'المدونة والتقارير التجارية | شركة حوا للتوزيع والتجارة',
    description: 'مركز معلومات وأخبار تجارة الجملة وتوزيع المواد الغذائية في سوريا: إطلاقات الوكالات، لوائح أسعار الطرود، نصائح إدارة المحلات والسوبرماركت، ومؤشرات السوق.',
    openGraph: {
        title: 'المدونة وأخبار الوكالات | Hawa Distribution & Trading',
        description: 'آخر تقارير السلع والوكالات الغذائية وإرشادات أصحاب المتاجر من شركة حوا للتوزيع.',
    },
};

const DEFAULT_POSTS: BlogPostItem[] = BLOG_SEED_POSTS;

export default async function BlogPage() {
    let posts: any[] = [];
    let seedArticlesExist = false;
    try {
        posts = await prisma.post.findMany({
            where: { isPublished: true, archivedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (posts.length === 0) {
            seedArticlesExist = (await prisma.post.count({
                where: { slug: { in: BLOG_SEED_POSTS.map((post) => post.slug) } },
            })) > 0;
        }
    } catch (err) {
        console.warn('Database offline or unreachable during blog fetch, using seed articles');
    }

    const displayPosts: BlogPostItem[] = posts.length > 0 
        ? posts.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            image: p.image || '/images/hawa_hero.jpg',
            category: p.category,
            createdAt: p.createdAt,
        }))
        : seedArticlesExist ? [] : DEFAULT_POSTS;

    const settings = await getSiteSettings();
    const whatsappNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901';

    return (
        <div className="w-full bg-[#FCFBF8] dark:bg-[#070D18] min-h-screen text-[#0B192C] dark:text-slate-100 transition-colors">
            <BlogClient 
                initialPosts={displayPosts} 
                whatsappNumber={whatsappNumber}
            />
        </div>
    );
}
