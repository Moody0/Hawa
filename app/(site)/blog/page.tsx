import React from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BlogClient, { BlogPostItem } from './BlogClient';
import { getSiteSettings } from '@/lib/public-queries';

import { SITE_ORIGIN } from '@/lib/site-config';

export const revalidate = 60; // 1 minute revalidation

export const metadata: Metadata = {
    title: 'المدونة والتقارير التجارية | شركة حوا للتوزيع والتجارة',
    description: 'مركز معلومات وأخبار تجارة الجملة وتوزيع المواد الغذائية في سوريا: إطلاقات الوكالات، لوائح أسعار الطرود، نصائح إدارة المحلات والسوبرماركت، ومؤشرات السوق.',
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'المدونة وأخبار الوكالات | Hawa Distribution & Trading',
        description: 'آخر تقارير السلع والوكالات الغذائية وإرشادات أصحاب المتاجر من شركة حوا للتوزيع والتجارة.',
        url: `${SITE_ORIGIN}/blog`,
        siteName: 'حوا للتوزيع والتجارة | Hawa Distribution & Trading',
        locale: 'ar_SY',
        type: 'website',
        images: [
            {
                url: `${SITE_ORIGIN}/og-image.jpg`,
                secureUrl: `${SITE_ORIGIN}/og-image.jpg`,
                width: 1200,
                height: 630,
                type: 'image/jpeg',
                alt: 'Hawa Distribution Blog & Trade Reports',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'المدونة والتقارير التجارية | شركة حوا للتوزيع والتجارة',
        description: 'آخر تقارير السلع والوكالات الغذائية وإرشادات أصحاب المتاجر من شركة حوا للتوزيع والتجارة.',
        images: [`${SITE_ORIGIN}/og-image.jpg`],
    },
};

// Rich, authentic B2B trade articles with 100% reliable local image assets
const DEFAULT_POSTS: BlogPostItem[] = [
    {
        id: 'post-1',
        title: 'دليل أصحاب السوبرماركت لرفع دوران المخزون وتفادي ركود السلع الغذائية',
        slug: 'retailer-guide-best-fmcg-inventory',
        excerpt: 'خطوات عملية لاختيار تشكيلة السلع الأساسية عالية الدوران، حساب فترات السحب الأسبوعية، وتقليل تجميد السيولة في التخزين الزائد.',
        image: '/uploads/banners/hawa-food-agencies-banner.jpg',
        category: 'نصائح وإدارة المحلات',
        createdAt: new Date('2026-08-20'),
        readTime: '4 دقائق قراءة',
    },
    {
        id: 'post-2',
        title: 'وصول دفعات جديدة من معكرونة دي سيكو وكراون الأصلية بأسعار الجملة المعتمدة',
        slug: 'dececco-crown-pasta-wholesale-supply',
        excerpt: 'يسر شركة حوا إتاحة كراتين وطرود معكرونة دي سيكو الإيطالية وكراون الفاخرة بجميع المقاسات والأشكال للمحلات والسوبرماركت مع تسليم مباشر لباب المحل.',
        image: '/images/hawa_hero.jpg',
        category: 'عروض الوكالات والمنتجات',
        createdAt: new Date('2026-08-15'),
        readTime: '3 دقائق قراءة',
    },
    {
        id: 'post-3',
        title: 'توسيع شبكة سيارات التوزيع لتغطية أسواق جديدة بجداول يومية منتظمة',
        slug: 'fleet-expansion-scheduled-deliveries',
        excerpt: 'في إطار التزامنا بتسليم طرود الجملة بسرعة وكفاءة، تم تعزيز شبكة التوزيع وسيارات النقل المجهزة لخدمة المتاجر في المحافظات السورية بمواعيد تسليم دقيقة.',
        image: '/images/hawa_wholesale_hub.jpg',
        category: 'أخبار التوزيع والشركة',
        createdAt: new Date('2026-08-01'),
        readTime: '3 دقائق قراءة',
    },
    {
        id: 'post-4',
        title: 'تقرير حركة السلع الأساسية: مؤشرات العرض والطلب على الزيوت والبقوليات والمعلبات',
        slug: 'market-trends-wholesale-commodities',
        excerpt: 'قراءة تحليلية للمصادر وأسعار طرود الزيوت النباتية، الحبوب الجافة، وتونة الدرجة الأولى، لمساعدة التجار في جدولة مشترياتهم وتفادي نقص الأصناف.',
        image: '/uploads/banners/hawa-canned-seafood-banner.jpg',
        category: 'حركة ونبض السوق',
        createdAt: new Date('2026-07-25'),
        readTime: '5 دقائق قراءة',
    },
    {
        id: 'post-5',
        title: 'كيف تُميز طرود المصنع الأصلية وتتجنب البضائع مقلدة المصدر وتواريخ الصلاحية؟',
        slug: 'authenticity-guide-factory-sealed-cases',
        excerpt: 'إرشادات فنية للتأكد من أختام كراتين المصنع، باركود الدفعات الأصلية، وأهمية الفواتير الرسمية في حماية نشاط متجرك التجاري.',
        image: '/uploads/banners/hawa-detergents-hygiene-banner.jpg',
        category: 'نصائح وإدارة المحلات',
        createdAt: new Date('2026-07-15'),
        readTime: '4 دقائق قراءة',
    },
];

export default async function BlogPage() {
    let posts: any[] = [];
    try {
        posts = await prisma.post.findMany({
            where: { isPublished: true, archivedAt: null },
            orderBy: { createdAt: 'desc' },
        });
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
        : DEFAULT_POSTS;

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
