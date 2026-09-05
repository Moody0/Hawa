import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ResilientImage from '@/app/components/ResilientImage';
import { MdAccessTime, MdCalendarToday, MdArrowForward } from 'react-icons/md';

export const revalidate = 60; // 1 minute revalidation

export const metadata: Metadata = {
    title: 'المدونة وأخبار الوكالات والتوزيع | Hawa Distribution & Trading',
    description: 'أخبار شركة هوا للتوزيع، إطلاق المنتجات الجديدة، عروض الوكالات، نصائح لأصحاب المحلات والسوبرماركت، وأحدث مستجدات سوق الجملة في سوريا.',
    openGraph: {
        title: 'المدونة وأخبار الوكالات | شركة هوا للتوزيع والتجارة',
        description: 'آخر أخبار السلع والوكالات ونصائح تجار التجزئة من شركة هوا للتوزيع.',
    },
};

// Default high-value B2B wholesale articles if database is still fresh
const DEFAULT_POSTS = [
    {
        id: 'post-1',
        title: 'كيف تختار أفضل تشكيلة بضائع لسوبرماركت ناجح؟ نصائح لتجار التجزئة',
        slug: 'retailer-guide-best-fmcg-inventory',
        excerpt: 'دليل عملي لأصحاب المحلات لزيادة دوران المخزون، وتجنب ركود البضائع، واختيار الأصناف الأعلى طلباً من الوكالات المعتمدة.',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
        category: 'نصائح لأصحاب المتاجر',
        createdAt: new Date('2026-08-20'),
    },
    {
        id: 'post-2',
        title: 'إطلاق تشكيلة منتجات جديدة من وكالة الريف بأسعار جملة تنافسية',
        slug: 'alreef-agency-new-product-launches',
        excerpt: 'يسر شركة هوا الإعلان عن توريد دفعات جديدة من زيوت ومكسرات الريف الأصلية بكافة الأحجام والعبوات المجهزة للمحلات.',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
        category: 'عروض الوكالات',
        createdAt: new Date('2026-08-15'),
    },
    {
        id: 'post-3',
        title: 'توسيع أسطول سيارات التوزيع لتغطية مناطق وأسواق جديدة بجداول يومية منتظمة',
        slug: 'fleet-expansion-scheduled-deliveries',
        excerpt: 'في إطار التزامنا بتسليم طرود الجملة بسرعة وكفاءة، تم تعزيز أسطول النقل المبرد والمجهز لخدمة المحلات في كافة المحافظات.',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
        category: 'أخبار الشركة',
        createdAt: new Date('2026-08-01'),
    },
    {
        id: 'post-4',
        title: 'حركة سوق المواد الغذائية والاستهلاكية: مؤشرات الطلب للأشهر القادمة',
        slug: 'market-trends-wholesale-commodities',
        excerpt: 'قراءة تحليلية لحركة العرض والطلب على السلع الأساسية (زيوت، أرز، سكر، معلبات) وكيف تؤمّن احتياجات متجرك مسبقاً.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
        category: 'أخبار السوق',
        createdAt: new Date('2026-07-25'),
    },
];

export default async function BlogPage() {
    let posts: any[] = [];
    try {
        posts = await prisma.post.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
        });
    } catch (err) {
        console.error('Error fetching blog posts:', err);
    }

    const displayPosts = posts.length > 0 ? posts : DEFAULT_POSTS;

    return (
        <main className="container-custom py-10 md:py-16">
            {/* Header Banner */}
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/25 text-[#8A6305] dark:text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-3">
                    <span>📰 المدونة ومركز الأخبار</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-4">
                    أخبار الوكالات ونبض سوق التوزيع
                </h1>
                <p className="text-xs sm:text-sm text-[#475569] dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    منصتك لمتابعة إطلاقات المنتجات الجديدة، عروض الجملة الحصرية، وأفضل النصائح المهنية لنمو أرباح متجرك وتجارتك.
                </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayPosts.map((post) => {
                    const dateStr = new Date(post.createdAt).toLocaleDateString('ar-SY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    });

                    return (
                        <article
                            key={post.id}
                            className="group bg-white dark:bg-[#132035] rounded-3xl overflow-hidden border border-gray-200/80 dark:border-white/10 hover:border-[#8A6305]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                {/* Image Container */}
                                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-white/5">
                                    {post.image ? (
                                        <ResilientImage
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#FAF6EC] to-gray-200">
                                            📰
                                        </div>
                                    )}

                                    {/* Category pill */}
                                    <div className="absolute top-3.5 right-3.5 z-10">
                                        <span className="bg-[#0B192C]/90 backdrop-blur-md text-[#8A6305] text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/15 shadow-sm">
                                            {post.category || 'أخبار الشركة'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-gray-400 mb-2.5">
                                        <MdCalendarToday className="text-sm text-[#8A6305]" />
                                        <span>{dateStr}</span>
                                    </div>

                                    <h2 className="text-lg font-black text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors line-clamp-2 leading-snug mb-3">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    {post.excerpt && (
                                        <p className="text-xs sm:text-sm text-[#475569] dark:text-gray-300 line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-6 pt-0">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6EC] hover:bg-[#0B192C] text-[#0B192C] hover:text-white dark:bg-white/5 dark:text-white dark:hover:bg-[#8A6305] dark:hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-[#8A6305]/20"
                                >
                                    <span>قراءة المقال كاملاً</span>
                                    <MdArrowForward className="text-base rtl:rotate-180" />
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </main>
    );
}
