import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { FaWhatsapp } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import ResilientImage from '@/app/components/ResilientImage';
import { Calendar, Clock, ArrowLeft, Store, CheckCircle2, FileText, Truck, Receipt, Share2 } from 'lucide-react';
import Breadcrumb from '@/app/components/Breadcrumb';
import { getSiteSettings } from '@/lib/public-queries';

export const revalidate = 60;

// Detailed seed articles library for offline resilience & rich demo content with local images
const SEED_ARTICLES: Record<string, any> = {
    'retailer-guide-best-fmcg-inventory': {
        id: 'post-1',
        slug: 'retailer-guide-best-fmcg-inventory',
        title: 'دليل أصحاب السوبرماركت لرفع دوران المخزون وتفادي ركود السلع الغذائية',
        category: 'نصائح وإدارة المحلات',
        createdAt: new Date('2026-08-20'),
        readTime: '4 دقائق قراءة',
        image: '/uploads/banners/hawa-food-agencies-banner.jpg',
        excerpt: 'خطوات عملية لاختيار تشكيلة السلع الأساسية عالية الدوران، حساب فترات السحب الأسبوعية، وتقليل تجميد السيولة في التخزين الزائد.',
        keyTakeaway: 'الربحية الحقيقية في تجارة التجزئة الغذائية لا تتحقق فقط من هامش ربح الصنف الواحد، بل من سرعة دوران رأس المال وجدولة استلام الطرود أسبوعياً بما يضمن عدم تجميد السيولة.',
        content: `
إدارة المخزون وتحديد التشكيلة السلعية المناسبة هي الركيزة الأساسية لنجاح أي سوبرماركت أو متجر تجزئة. في قطاع السلع الغذائية والاستهلاكية سريعة الدوران (FMCG)، الربحية تتطلب موازنة دقيقة بين توفر الأصناف الأساسية دائماً وبين تجنب التخزين الفائض.

### 1. التركيز على السلع الأساسية عالية الدوران (Fast-Movers)
احرص دائماً على ألا ينفد مخزون محلك من السلع اليومية الضرورية للمستهلك السوري:
- **زيوت الطبخ والقلي النباتية**: عبوات 1 لتر و2 لتر للاستخدام المنزلي اليومي، وعبوات 5 لتر و16 لتر للمطاعم والاستهلاك الكثيف.
- **المعكرونة والسميد الفاخر**: توفير خيارات متنوعة من المعكرونة الإيطالية (دي سيكو) والعلامات الوطنية المعتمدة (كراون وجود).
- **السكر والرز والبقوليات الجافة**: أصناف العدس الحب والمجروش، الحمص الحب، والفاصولياء العريضة.
- **معلبات التونة واللحوم والصلصات**: ماركات معتمدة ومضمونة الصلاحية مثل زوان وصن بل والريف.

### 2. الشراء بالطرود بأسعار الجملة الرسمية وتجنب الوسطاء
الشراء عبر شركة توزيع معتمدة تمتلك وكالات مباشرة يمنحك ميزات تنافسية ملموسة:
- الحصول على أسعار جملة أولية مطابقة للوائح المصنع دون عمولات إضافية.
- استلام كراتين معبأة ومغلقة بإحكام من المصنع مع تواريخ إنتاج وصلاحية حديثة وموثوقة.
- فواتير شراء نظامية تسهّل ضبط حسابات الأرباح وضريبة المبيعات وتدقيق المشتريات.

### 3. تقليل تكلفة التخزين عبر الجدولة الأسبوعية المنتظمة
بدلاً من تجميد سيولة مالية ضخمة في تخزين كميات هائلة من الطرود لشهور، اعتمد على التوريد الأسبوعي المنتظم عبر شركة حوا للتوزيع:
- اطلب الكمية التي تبيعها خلال 7 إلى 10 أيام.
- حافظ على مساحة متجرك لعرض أصناف جديدة وموسمية.
- اعتمد على سيارات التوزيع لتسليم الطرود حتى باب محلك بمواعيد ثابتة وموثوقة.
        `,
    },
    'dececco-crown-pasta-wholesale-supply': {
        id: 'post-2',
        slug: 'dececco-crown-pasta-wholesale-supply',
        title: 'وصول دفعات جديدة من معكرونة دي سيكو وكراون الأصلية بأسعار الجملة المعتمدة',
        category: 'عروض الوكالات والمنتجات',
        createdAt: new Date('2026-08-15'),
        readTime: '3 دقائق قراءة',
        image: '/images/hawa_hero.jpg',
        excerpt: 'يسر شركة حوا إتاحة كراتين وطرود معكرونة دي سيكو الإيطالية وكراون الفاخرة بجميع المقاسات والأشكال للمحلات والسوبرماركت مع تسليم مباشر لباب المحل.',
        keyTakeaway: 'المعكرونة صنف أساسي لا غنى عنه في كل سلة تسوق؛ وتوفير الماركات الإيطالية والوطنية المعتمدة يرفع ثقة زبائن محلك ومتوسط قيمة المشتريات.',
        content: `
ضمن التزام شركة حوا للتوزيع بتوفير أفضل خيارات المواد الغذائية للأسواق السورية، يسرنا الإعلان عن جاهزية توريد شحنات جديدة من معكرونة دي سيكو (De Cecco) الإيطالية الشهيرة، وتشكيلة منتجات كراون (Crown) الوطنية الفاخرة.

### تشكيلة أصناف المعكرونة المتوفرة في طرود الجملة:
- **سباغيتي فاخرة (Spaghetti No. 12)**: كراتين تحتوي على عبوات 500 غرام مغلفة بإحكام.
- **بيني ريغاتي (Penne Rigate)**: الحجم المثالي لأطباق الباستا والصلصات.
- **فوسيلي وفيتوتشيني ولزانيا**: كراتين طرود مجهزة لأرفف السوبرماركت والمحلات.
- **شعيرية وشوربة الحروف**: أصناف الاستهلاك اليومي العائلي بأسعار جملة تشجيعية.

### ميزات طلب المعكرونة عبر منصة حوا:
- كراتين أصلية محكمة التغليف ضد الرطوبة وعوامل التخزين.
- تسعير جملة فوري ومطابق للوائح الاستيراد والوكالات.
- إمكانية إضافة طرود المعكرونة إلى سلة طلبك بجانب الزيوت والبقوليات لشحنة واحدة متكاملة.
        `,
    },
    'fleet-expansion-scheduled-deliveries': {
        id: 'post-3',
        slug: 'fleet-expansion-scheduled-deliveries',
        title: 'توسيع شبكة سيارات التوزيع لتغطية أسواق جديدة بجداول يومية منتظمة',
        category: 'أخبار التوزيع والشركة',
        createdAt: new Date('2026-08-01'),
        readTime: '3 دقائق قراءة',
        image: '/images/hawa_wholesale_hub.jpg',
        excerpt: 'في إطار التزامنا بتسليم طرود الجملة بسرعة وكفاءة، تم تعزيز شبكة التوزيع وسيارات النقل المجهزة لخدمة المتاجر في المحافظات السورية بمواعيد تسليم دقيقة.',
        keyTakeaway: 'سرعة التسليم وانتظام المواعيد تضمن استمرار رفوف متجرك ممتلئة دائماً دون انقطاع، مما يعزز ولاء زبائنك ومبيعاتك اليومية.',
        content: `
تزامناً مع زيادة حجم الطلبات والتعاقدات مع شبكات السوبرماركت ومحلات التجزئة، أعلنت إدارة العمليات اللوجستية في شركة حوا عن توسيع شبكة خطوط النقل وسيارات التوزيع المجهزة.

### أبرز التحديثات في جدول التوزيع:
- **خط دمشق وريفها**: رحلات يومية صباحية ومسائية لتغطية كافة أسواق العاصمة والريف المحيط.
- **خط حمص وحماة**: تغطية مستمرة للمحلات والمستودعات الفرعية ومراكز المدن والبلدات.
- **خط الساحل (اللاذقية وطرطوس)**: رحلات مجدولة أسبوعياً لتسليم طلبيات طرود الجملة.
- **المحافظات الأخرى (حلب، درعا، السويداء، المنطقة الشرقية)**: شحن منتظم وتنسيق مسبق عبر مكتب المبيعات.

### التزامنا مع التاجر:
- تسليم مباشر لباب المحل وتفريغ الطرود بعناية.
- تسليم فاتورة رسمية موقعة ومطابقة لمحتويات الشحنة.
- إمكانية تتبع مسار الطلب عبر التواصل المباشر مع فريق الدعم عبر واتساب.
        `,
    },
    'market-trends-wholesale-commodities': {
        id: 'post-4',
        slug: 'market-trends-wholesale-commodities',
        title: 'تقرير حركة السلع الأساسية: مؤشرات العرض والطلب على الزيوت والبقوليات والمعلبات',
        category: 'حركة ونبض السوق',
        createdAt: new Date('2026-07-25'),
        readTime: '5 دقائق قراءة',
        image: '/uploads/banners/hawa-canned-seafood-banner.jpg',
        excerpt: 'قراءة تحليلية للمصادر وأسعار طرود الزيوت النباتية، الحبوب الجافة، وتونة الدرجة الأولى، لمساعدة التجار في جدولة مشترياتهم وتفادي نقص الأصناف.',
        keyTakeaway: 'متابعة تغيرات حركة سلاسل الإمداد العالمية والإقليمية تساعد أصحاب المتاجر على شراء الأصناف الاستراتيجية في الوقت المناسب لتحقيق أفضل هامش ربح.',
        content: `
يشهد سوق المواد الغذائية والاستهلاكية في سوريا تقلبات دورية ترتبط بأسعار الصرف العالمية وتكاليف الشحن والطاقة. يقدم فريق الدراسات التجارية في شركة حوا هذا التقرير لمساعدة أصحاب السوبرماركت وتجار التجزئة في اتخاذ قرارات الشراء الصائبة.

### 1. قطاع الزيوت النباتية والمسكوب:
- استقرار نسبي في معروض زيوت دوار الشمس والذرة، مع زيادة الطلب على العبوات الاقتصادية (4 لتر و5 لتر).
- نصيحة للتاجر: حافظ على مخزون تشغيلي يكفي أسبوعين على الأقل لتأمين طلب الزبائن المستمر.

### 2. قطاع البقوليات والحبوب الجافة:
- إقبال متزايد على العدس المجروش والحمص الحب والفول المعبأ في أكياس 25 كغ وطرود الكيلوغرام.
- استقرار نسبي في أصناف الأرز المصري والتايلندي والبسمتي.

### 3. قطاع المعلبات والتونة:
- تفضيل المستهلك للعلامات التجارية الموثوقة المعروفة بنقاء اللحم وزيت الزيتون والماء والملح الخالي من الإضافات.
- تعتبر التونة المعلبة من أعلى الأصناف سرعة في التحول إلى سيولة نقدية.
        `,
    },
    'authenticity-guide-factory-sealed-cases': {
        id: 'post-5',
        slug: 'authenticity-guide-factory-sealed-cases',
        title: 'كيف تُميز طرود المصنع الأصلية وتتجنب البضائع مقلدة المصدر وتواريخ الصلاحية؟',
        category: 'نصائح وإدارة المحلات',
        createdAt: new Date('2026-07-15'),
        readTime: '4 دقائق قراءة',
        image: '/uploads/banners/hawa-detergents-hygiene-banner.jpg',
        excerpt: 'إرشادات فنية للتأكد من أختام كراتين المصنع، باركود الدفعات الأصلية، وأهمية الفواتير الرسمية في حماية نشاط متجرك التجاري.',
        keyTakeaway: 'شراء السلع من مصادر غير معتمدة قد يعرض سمعة محلك للخطر؛ الفواتير المعتمدة وكراتين المصنع الأصلية هي الضمان الحقيقي لاستدامة عملك التجاري.',
        content: `
مع انتشار بعض الأصناف مجهولة المصدر في الأسواق، يقع على عاتق أصحاب المحلات مسؤولية حماية زبائنهم وتجارتهم من خلال التدقيق في مواصفات البضائع المستلمة.

### 1. فحص شريط لاصق وأختام المصنع (Factory Seal Tape)
الكرتونة الأصلية تكون مغلقة بشريط لاصق يحمل شعار الشركة المصنعة أو ختم المصنع الآلي بدون أي آثار لإعادة الفتح أو التلاعب.

### 2. مطابقة الباركود ورقم الطبخة (Batch Number)
- تأكد من وجود باركود واضح ومقروء على كل من الكرتونة الخارجية والعبوة الفردية.
- رقم الطبخة وتاريخ الإنتاج والانتهاء يجب أن يكون مطبوعاً بتقنية الليزر أو الحبر النفاث وليس بملصق ورقي قابل للإزالة.

### 3. الفاتورة النظامية كوثيقة حماية
التعامل مع موزع معتمد مثل شركة حوا يضمن لك استلام فاتورة شراء رسمية تتضمن اسم المادة ورقم الدفعة وتاريخ الاستلام، مما يحميك أمام الجهات الرقابية ويضمن حقوقك التجارية كاملة.
        `,
    }
};

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const params = await props.params;
    let post: any = null;
    
    try {
        post = await prisma.post.findUnique({
            where: { slug: params.slug },
        });
    } catch (e) {
        // fallback to seed
    }

    if (!post) {
        post = SEED_ARTICLES[params.slug];
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
        post = await prisma.post.findUnique({
            where: { slug: params.slug },
        });
    } catch (err) {
        console.warn('Database offline, reading from seed library for slug:', params.slug);
    }

    if (!post) {
        post = SEED_ARTICLES[params.slug];
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
                    {post.content.split('\n\n').map((paragraph: string, idx: number) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;

                        if (trimmed.startsWith('### ')) {
                            return (
                                <div key={idx} className="pt-4 pb-1">
                                    <h3 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#8A6305] shrink-0" />
                                        <span>{trimmed.replace('### ', '')}</span>
                                    </h3>
                                </div>
                            );
                        }

                        if (trimmed.startsWith('- ')) {
                            return (
                                <ul key={idx} className="space-y-2.5 ps-2 my-4">
                                    {trimmed.split('\n').map((li, i) => {
                                        const cleanLi = li.replace(/^- /, '');
                                        return (
                                            <li key={i} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#8A6305] shrink-0 mt-2" />
                                                <span dangerouslySetInnerHTML={{ 
                                                    __html: cleanLi.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#0B192C] dark:text-white font-extrabold">$1</strong>') 
                                                }} />
                                            </li>
                                        );
                                    })}
                                </ul>
                            );
                        }

                        return (
                            <p key={idx} className="leading-relaxed text-slate-700 dark:text-slate-300">
                                {trimmed}
                            </p>
                        );
                    })}
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
