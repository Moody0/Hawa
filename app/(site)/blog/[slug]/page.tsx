import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { FaWhatsapp } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import { BLOG_SEED_ARTICLES } from '@/lib/blog-seed-posts';
import ResilientImage from '@/app/components/ResilientImage';
import { Calendar, Clock, ArrowLeft, Store, CheckCircle2, FileText, Truck, Receipt, Share2 } from 'lucide-react';
import Breadcrumb from '@/app/components/Breadcrumb';
import { getSiteSettings } from '@/lib/public-queries';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 60;

// Detailed seed articles library for offline resilience & rich demo content with local images
const SEED_ARTICLES = BLOG_SEED_ARTICLES;

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const params = await props.params;
    let post: any = null;
    
    try {
        const savedPost = await prisma.post.findUnique({ where: { slug: params.slug } });
        if (savedPost) {
            post = savedPost.isPublished && !savedPost.archivedAt ? savedPost : null;
        } else {
            post = SEED_ARTICLES[params.slug];
        }
    } catch (e) {
        // Keep demo articles available only when the database cannot be reached.
        post = SEED_ARTICLES[params.slug];
    }

    if (post && SEED_ARTICLES[params.slug]) {
        post = { ...SEED_ARTICLES[params.slug], ...post };
    }

    if (!post) {
        return { title: 'مقال غير موجود | Hawa Distribution' };
    }

    return {
        title: `${post.title} | شركة حوا للتوزيع والتجارة`,
        description: post.excerpt || post.title,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            images: post.image ? [{ url: post.image }] : [],
        },
    };
}

export default async function BlogPostPage(
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    let post: any = null;
    
    try {
        const savedPost = await prisma.post.findUnique({ where: { slug: params.slug } });
        if (savedPost) {
            post = savedPost.isPublished && !savedPost.archivedAt ? savedPost : null;
        } else {
            post = SEED_ARTICLES[params.slug];
        }
    } catch (err) {
        console.warn('Database offline, reading from seed library for slug:', params.slug);
        post = SEED_ARTICLES[params.slug];
    }

    if (post && SEED_ARTICLES[params.slug]) {
        post = { ...SEED_ARTICLES[params.slug], ...post };
    }

    if (!post) {
        notFound();
    }

    const dateStr = new Date(post.createdAt).toLocaleDateString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const settings = await getSiteSettings();
    const whatsappNumber = (settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '');

    // Get 2 other related articles
    const otherSlugs = Object.keys(SEED_ARTICLES).filter(s => s !== params.slug).slice(0, 2);
    const relatedArticles = otherSlugs.map(s => SEED_ARTICLES[s]);

    const readTime = post.readTime || '4 دقائق قراءة';

    return (
        <div className="w-full bg-[#FCFBF8] dark:bg-[#070D18] min-h-screen text-[#0B192C] dark:text-slate-100 transition-colors py-10 md:py-16">
            <article className="container-custom max-w-4xl mx-auto">
                {/* Unified Breadcrumbs */}
                <Breadcrumb
                    items={[
                        {
                            label: 'المدونة والتقارير',
                            href: '/blog',
                        },
                        {
                            label: post.title,
                        },
                    ]}
                />

                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft className="text-base rtl:rotate-180" />
                        <span>العودة إلى قائمة التقارير والمقالات</span>
                    </Link>
                </div>

                {/* Article Header */}
                <header className="mb-8 pb-8 border-b border-slate-200/80 dark:border-white/10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#E5B54A] text-xs font-black uppercase tracking-wider mb-4">
                        <FileText className="text-sm" />
                        <span>{post.category || 'أخبار الوكالات'}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-5">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="text-sm text-[#8A6305]" />
                                <span>{dateStr}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium">
                                <Clock className="text-sm text-[#8A6305]" />
                                <span>{readTime}</span>
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                إدارة التوزيع والتجارة – شركة حوا
                            </span>
                        </div>

                        {/* Quick WhatsApp Share Action */}
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - شركة حوا للتوزيع: https://hawa.sy/blog/${post.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold transition-all text-xs"
                        >
                            <Share2 className="text-sm text-[#8A6305]" />
                            <span>مشاركة المقال</span>
                        </a>
                    </div>
                </header>

                {/* Featured Hero Media */}
                {post.image && (
                    <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-lg border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                        <ResilientImage
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 1024px) 100vw, 850px"
                        />
                    </div>
                )}

                {/* Key Takeaway Callout Box */}
                {post.keyTakeaway && (
                    <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-amber-50/80 dark:bg-white/[0.04] border border-[#8A6305]/30 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[#8A6305] text-white flex items-center justify-center shrink-0 text-lg shadow-xs mt-0.5">
                            <CheckCircle2 />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-1">
                                خلاصة التقرير لمتجرك
                            </h4>
                            <p className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-slate-200 leading-relaxed">
                                {post.keyTakeaway}
                            </p>
                        </div>
                    </div>
                )}

                {/* Article Content / Structured Prose */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-normal space-y-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                        {String(post.content || '')}
                    </ReactMarkdown>
                </div>

                {/* Trade Inquiry WhatsApp & Catalog Strip */}
                <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-white/10">
                    <div className="bg-[#FAF6EC] dark:bg-white/[0.03] rounded-3xl p-6 sm:p-8 border border-[#8A6305]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#8A6305] dark:text-[#E5B54A] block mb-1">
                                خدمة مبيعات وتوريد الجملة
                            </span>
                            <h4 className="font-black text-base sm:text-lg text-[#0B192C] dark:text-white">
                                هل لديك استفسار تجاري حول هذا الصنف أو جداول التوصيل؟
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                مندوب المبيعات المختص بمحافظتك جاهز لتزويدك بالأسعار الفورية وتجهيز طلبيتك.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`مرحباً شركة حوا للتوزيع، أود الاستفسار بخصوص المقال: ${post.title}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs flex items-center gap-2 shadow-xs active:scale-95 transition-all"
                            >
                                <FaWhatsapp className="text-base" />
                                <span>استفسر عبر واتساب</span>
                            </a>
                            <Link
                                href="/products"
                                className="px-5 py-3 rounded-2xl bg-[#0B192C] hover:bg-[#132035] text-white dark:bg-white/10 dark:hover:bg-white/15 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
                            >
                                <Store className="text-base text-[#E5B54A]" />
                                <span>تصفح البضائع</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Related Articles Strip */}
                {relatedArticles.length > 0 && (
                    <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-white/10">
                        <div className="text-xs font-black uppercase tracking-widest text-[#8A6305] dark:text-[#E5B54A] mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                            <span>تقارير ومقالات ذات صلة</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedArticles.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/blog/${item.slug}`}
                                    className="group bg-white dark:bg-[#132035] rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]/40 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                                            <span className="text-[#8A6305] font-bold">{item.category}</span>
                                            <span>•</span>
                                            <span>{item.readTime}</span>
                                        </div>
                                        <h4 className="text-sm sm:text-base font-bold text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors leading-snug line-clamp-2 mb-2">
                                            {item.title}
                                        </h4>
                                        {item.excerpt && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {item.excerpt}
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] flex items-center gap-1 group-hover:gap-2 transition-all">
                                        <span>قراءة المقال</span>
                                        <ArrowLeft className="text-sm rtl:rotate-0 rotate-180" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
