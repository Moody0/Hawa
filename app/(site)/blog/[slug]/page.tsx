import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ResilientImage from '@/app/components/ResilientImage';
import { MdCalendarToday, MdArrowBack, MdShare, MdStorefront } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export const revalidate = 60;

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const params = await props.params;
    const post = await prisma.post.findUnique({
        where: { slug: params.slug },
    });

    if (!post) {
        return { title: 'مقال غير موجود | Hawa Distribution' };
    }

    return {
        title: `${post.title} | شركة هوا للتوزيع والتجارة`,
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
    let post: any = await prisma.post.findUnique({
        where: { slug: params.slug },
    });

    // Fallback for default seed posts if not in DB yet
    if (!post) {
        const seedPosts: Record<string, any> = {
            'retailer-guide-best-fmcg-inventory': {
                title: 'كيف تختار أفضل تشكيلة بضائع لسوبرماركت ناجح؟ نصائح لتجار التجزئة',
                category: 'نصائح لأصحاب المتاجر',
                createdAt: new Date('2026-08-20'),
                image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80',
                content: `
إدارة المخزون وتحديد التشكيلة السلعية المناسبة هي الركيزة الأساسية لنجاح أي سوبرماركت أو متجر تجزئة. في قطاع السلع الغذائية والاستهلاكية سريعة الدوران (FMCG)، الربحية لا تأتي فقط من هامش السعر، بل من سرعة دوران رأس المال وحركة الطرود على الرفوف.

### 1. التركيز على السلع الأساسية عالية الدوران (Fast-Movers)
احرص دائماً على ألا ينفد مخزونك من الأصناف الأساسية:
- زيوت الطبخ والقلي الأصلية بمختلف السعات (1 لتر، 2 لتر، 5 لتر).
- أصناف السكر والأرز المعتمدة بجودة طبخ متسقة.
- معلبات التونة والسردين واللحوم الفاخرة ذات السمعة الموثوقة (مثل زوان وصن بل).

### 2. شراء الطرود بأسعار الجملة المعتمدة
الشراء عبر موزع معتمد يمتلك وكالات حصرية يضمن لك:
- الحصول على أسعار جملة أولية دون هوامش وسيطة زائدة.
- فواتير مطابقة وتاريخ صلاحية حديث ومضمون المصدر.
- التزام سيارات التوزيع بمواعيد تسليم مجدولة تصلك حتى باب المحل.

### 3. تقليل تكلفة التخزين عبر الجدولة المنتظمة
بدلاً من تجميد سيولة مالية ضخمة في تخزين كميات هائلة، اعتمد على التوريد الأسبوعي المنتظم عبر شركة هوا، بحيث تطلب فقط الطرود التي تحتاجها أسبوعياً وتستثمر السيولة المتبقية في توسيع أصناف متجرك.
                `,
            },
            'alreef-agency-new-product-launches': {
                title: 'إطلاق تشكيلة منتجات جديدة من وكالة الريف بأسعار جملة تنافسية',
                category: 'عروض الوكالات',
                createdAt: new Date('2026-08-15'),
                image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=80',
                content: `
ضمن خطتها المستمرة لتلبية متطلبات السوق السوري ودعم المتاجر بأصناف غذائية متميزة، أعلنت شركة هوا للتوزيع والتجارة عن وصول التشكيلة الكاملة من منتجات وكالة الريف المعتمدة.

### مواصفات الطرود والكميات:
- **زيت الريف نقي 1 لتر**: طرد يحتوي على 6 عبوات مطابقة لأعلى معايير النقاء.
- **مكسرات الريف الفاخرة**: كراتين مجهزة خصيصاً للمحلات مع تغليف محكم يحافظ على النكهة والقرمشة.

يمكن لأصحاب المحلات الآن إضافة هذه المنتجات مباشرة عبر سلة الطلبات في الموقع، واستلام الطلبية عبر سيارات التوزيع في كافة المناطق.
                `,
            },
        };

        if (seedPosts[params.slug]) {
            post = seedPosts[params.slug];
        } else {
            notFound();
        }
    }

    if (!post) {
        notFound();
    }

    const dateStr = new Date(post.createdAt).toLocaleDateString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    return (
        <main className="container-custom py-8 md:py-14 max-w-4xl mx-auto">
            {/* Back link */}
            <div className="mb-6">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#475569] dark:text-gray-300 hover:text-[#8A6305] transition-colors"
                >
                    <MdArrowBack className="text-base rtl:rotate-180" />
                    <span>العودة إلى المدونة والمركز الإخباري</span>
                </Link>
            </div>

            {/* Article Header */}
            <header className="mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#8A6305] text-xs font-bold uppercase tracking-wider mb-3">
                    <span>{post.category || 'أخبار الوكالات'}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight mb-4">
                    {post.title}
                </h1>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#475569] dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <MdCalendarToday className="text-sm text-[#8A6305]" />
                        {dateStr}
                    </span>
                    <span>•</span>
                    <span>شركة هوا للتوزيع والتجارة</span>
                </div>
            </header>

            {/* Featured Image */}
            {post.image && (
                <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-lg border border-gray-100 dark:border-white/10">
                    <ResilientImage
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-800 dark:text-gray-200 leading-relaxed space-y-6 text-sm sm:text-base font-normal">
                {post.content.split('\n\n').map((paragraph: string, idx: number) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    if (trimmed.startsWith('### ')) {
                        return (
                            <h3 key={idx} className="text-lg sm:text-xl font-bold text-[#0B192C] dark:text-[#8A6305] mt-6 mb-2">
                                {trimmed.replace('### ', '')}
                            </h3>
                        );
                    }
                    if (trimmed.startsWith('- ')) {
                        return (
                            <ul key={idx} className="list-disc list-inside space-y-1.5 ps-2">
                                {trimmed.split('\n').map((li, i) => (
                                    <li key={i} className="text-slate-700 dark:text-gray-300">
                                        {li.replace('- ', '')}
                                    </li>
                                ))}
                            </ul>
                        );
                    }
                    return (
                        <p key={idx} className="leading-relaxed text-slate-700 dark:text-gray-300">
                            {trimmed}
                        </p>
                    );
                })}
            </div>

            {/* Bottom Sharing & CTA */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF6EC]/50 dark:bg-white/5 p-6 rounded-3xl">
                <div>
                    <h4 className="font-bold text-sm text-[#0B192C] dark:text-white">
                        هل لديك استفسار تجاري حول هذا الموضوع أو عروض الوكالات؟
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        فريق مبيعات وتوزيع شركة هوا جاهز للإجابة وتزويد محلك بأحدث الأسعار.
                    </p>
                </div>

                <a
                    href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`مرحباً شركة هوا، أود الاستفسار بخصوص: ${post.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all shrink-0"
                >
                    <FaWhatsapp className="text-base" />
                    <span>تواصل مع المبيعات عبر واتساب</span>
                </a>
            </div>
        </main>
    );
}
