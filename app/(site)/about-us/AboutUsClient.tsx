"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import ResilientImage from "@/app/components/ResilientImage";
import { 
    MdStorefront, 
    MdLocalShipping, 
    MdInventory, 
    MdReceiptLong, 
    MdVerified, 
    MdLocationOn, 
    MdSupportAgent, 
    MdCheckCircle, 
    MdArrowForward, 
    MdShoppingBag,
    MdSecurity,
    MdCategory,
    MdPhone
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { SYRIAN_GOVERNORATES } from "@/lib/order-validation";

interface AboutUsSettings {
    aboutHeroTitle: string | null;
    aboutHeroTitleAr: string | null;
    aboutHeroSubtitle: string | null;
    aboutHeroSubtitleAr: string | null;
    aboutHeroImage: string | null;
    
    aboutNarrativeTitle: string | null;
    aboutNarrativeTitleAr: string | null;
    aboutNarrativeFounded: string | null;
    aboutNarrativeFoundedAr: string | null;
    aboutNarrativeDesc1: string | null;
    aboutNarrativeDesc1Ar: string | null;
    aboutNarrativeDesc2: string | null;
    aboutNarrativeDesc2Ar: string | null;
    aboutNarrativeQuote: string | null;
    aboutNarrativeQuoteAr: string | null;
    aboutNarrativeImage: string | null;

    aboutValuesTitle: string | null;
    aboutValuesTitleAr: string | null;
    aboutValuesDesc: string | null;
    aboutValuesDescAr: string | null;
    
    aboutValue1Title: string | null;
    aboutValue1TitleAr: string | null;
    aboutValue1Desc: string | null;
    aboutValue1DescAr: string | null;
    
    aboutValue2Title: string | null;
    aboutValue2TitleAr: string | null;
    aboutValue2Desc: string | null;
    aboutValue2DescAr: string | null;
    
    aboutValue3Title: string | null;
    aboutValue3TitleAr: string | null;
    aboutValue3Desc: string | null;
    aboutValue3DescAr: string | null;

    statDeliveries?: string | null;
    statBrands?: string | null;
    statProducts?: string | null;
    statClients?: string | null;
    whatsappNumber?: string | null;
}

export default function AboutUsClient({ settings }: { settings: AboutUsSettings | null }) {
    const { t, dir, language } = useLanguage();
    const isAr = language === 'ar' || dir === 'rtl';

    const getContent = (en: string | null | undefined, ar: string | null | undefined) => {
        if (isAr) return ar || en || "";
        return en || ar || "";
    };

    const heroImage = settings?.aboutHeroImage && !settings.aboutHeroImage.includes('aida-public')
        ? settings.aboutHeroImage 
        : "/images/hawa_wholesale_hub.jpg";
    const narrativeImage = settings?.aboutNarrativeImage && !settings.aboutNarrativeImage.includes('aida-public')
        ? settings.aboutNarrativeImage 
        : "/images/hawa_hero.jpg";
    const waNumber = (settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+963993443901").replace(/[^0-9]/g, '');

    const coreCategories = [
        {
            ar: 'المعكرونة والسميد',
            en: 'Pasta & Semolina',
            descAr: 'دي سيكو، كراون، جود، طحين فاخر',
            descEn: 'De Cecco, Crown, Good, Premium Flour',
            icon: '🍝'
        },
        {
            ar: 'البقوليات والحبوب الجافة',
            en: 'Pulses & Legumes',
            descAr: 'عدس حب ومجروش، حمص، فاصولياء، أرز',
            descEn: 'Lentils, Chickpeas, Beans, Rice',
            icon: '🌾'
        },
        {
            ar: 'الزيوت النباتية والسمنة',
            en: 'Oils & Pure Ghee',
            descAr: 'زيت دوار الشمس، زيت نباتي، سمنة الذهب والنهري',
            descEn: 'Sunflower Oil, Vegetable Oil, Pure Ghee',
            icon: '🌻'
        },
        {
            ar: 'المعلبات والكونسروة والصلصات',
            en: 'Canned & Jarred Foods',
            descAr: 'تونة وسردين، معجون طماطم، حبوب معلبة',
            descEn: 'Tuna, Sardines, Tomato Paste, Canned Pulses',
            icon: '🥫'
        },
        {
            ar: 'البسكويت والمقرمشات والحلويات',
            en: 'Biscuits & Snacks',
            descAr: 'ويفر، بسكويت الشاي، شوكولا، كيك معبأ',
            descEn: 'Wafers, Tea Biscuits, Chocolates',
            icon: '🍪'
        },
        {
            ar: 'المنظفات والمواد الاستهلاكية',
            en: 'Hygiene & Detergents',
            descAr: 'سوائل جلي، مساحيق غسيل، مطهرات منزلية',
            descEn: 'Dishwashing liquids, Laundry, Cleaners',
            icon: '🧼'
        },
    ];

    const distributionPillars = [
        {
            icon: MdVerified,
            titleAr: 'وكالات وتوريد أصلي من المصنع',
            titleEn: 'Direct Factory & Agency Sourcing',
            descAr: 'شراكات توريد حصرية ومباشرة مع كبرى الشركات والمصانع لضمان كراتين وطرود المصنع الأصلية بأفضل أسعار الجملة الرسمية.',
            descEn: 'Direct trade partnerships with top food manufacturing brands ensuring factory-sealed cases at official wholesale rates.',
            badgeAr: 'أصلي 100%',
            badgeEn: '100% Authentic'
        },
        {
            icon: MdLocalShipping,
            titleAr: 'خطوط توزيع وسيارات مجهزة',
            titleEn: 'Scheduled Distribution & Delivery',
            descAr: 'سيارات وشاحنات توزيع مجهزة تنطلق يومياً لخدمة كافة المناطق والمحافظات بمواعيد تسليم منتظمة ودقيقة لباب المحل.',
            descEn: 'Dedicated delivery vehicles operating regular scheduled routes directly to your storefront across all governorates.',
            badgeAr: 'توصيل لباب المحل',
            badgeEn: 'Store-Door Delivery'
        },
        {
            icon: MdInventory,
            titleAr: 'مستودعات مركزية ومعايير سلامة',
            titleEn: 'Central Warehouses & Food Safety',
            descAr: 'مستودعات تخزين جاف ومكيف مجهزة وفق أعلى معايير سلامة الغذاء ونظام تدوير المخزون لضمان الطزاجة والصلاحية الدائمة.',
            descEn: 'Temperature-controlled warehousing adhering to strict hygiene and FIFO inventory rotation standards for optimal freshness.',
            badgeAr: 'تخزين قياسي',
            badgeEn: 'Hygienic Storage'
        },
        {
            icon: MdReceiptLong,
            titleAr: 'فواتير نظامية وأسعار جملة معتمدة',
            titleEn: 'Official Invoicing & Trade Terms',
            descAr: 'فواتير شراء موثقة ومعتمدة لضبط حركة مشتريات المحل وأرشيف الفواتير، مع خيارات دفع مرنة عند الاستلام وبدون وسطاء.',
            descEn: 'Transparent wholesale invoicing, documented purchase records, and flexible cash-on-delivery terms without middlemen.',
            badgeAr: 'فواتير رسمية',
            badgeEn: 'Official Invoices'
        }
    ];

    return (
        <div className="flex-1 bg-[#F8FAFC] dark:bg-[#0B192C]" dir={dir}>
            {/* 1. Hero Section: The Thesis */}
            <section className="relative overflow-hidden bg-[#0B192C] text-white py-16 md:py-24 border-b border-[#8A6305]/20">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: `url('${heroImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/80 to-[#0B192C]/50" />

                <div className="container-custom relative z-10">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        {/* Eyebrow / Trade Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6EC] text-[#8A6305] border border-[#8A6305]/30 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305] animate-pulse" />
                            <span>{isAr ? 'شركة حوا للتوزيع والتجارة • توريد وتوزيع جملة معتمد' : 'Hawa Distribution & Trading • Certified Wholesale'}</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6 text-white">
                            {getContent(settings?.aboutHeroTitle, settings?.aboutHeroTitleAr) || (isAr ? 'شريككم الموثوق لتوزيع السلع الغذائية والاستهلاكية بالجملة' : 'Your Trusted Partner in Wholesale Food & FMCG Distribution')}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-slate-300 text-sm sm:text-lg md:text-xl font-normal leading-relaxed max-w-3xl mb-10">
                            {getContent(settings?.aboutHeroSubtitle, settings?.aboutHeroSubtitleAr) || (isAr 
                                ? 'نعمل كشريان إمداد رئيسي يربط كبرى المصانع والشركات المنتجة للمواد الغذائية بأصحاب السوبرماركت، البقالات، وتجار الجملة في كافة المحافظات السورية بأسعار الوكالة الأصلية وبفواتير رسمية.'
                                : 'The direct supply line bridging leading food and consumer goods manufacturers with supermarkets, grocery stores, and wholesalers across Syria at official trade prices.')}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/products"
                                className="px-8 py-3.5 rounded-xl bg-[#8A6305] hover:bg-[#9E7309] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                <MdShoppingBag className="text-lg" />
                                <span>{isAr ? 'تصفح كتالوج المنتجات' : 'Explore Product Catalog'}</span>
                            </Link>

                            <Link
                                href="/account/register"
                                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
                            >
                                <MdStorefront className="text-lg text-[#E5B54A]" />
                                <span>{isAr ? 'تسجيل حساب تاجر جديد' : 'Register Merchant Account'}</span>
                            </Link>

                            <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(isAr ? 'مرحباً شركة حوا للتوزيع، أود الاستفسار عن عروض وأسعار الجملة وجداول التوزيع.' : 'Hello Hawa Distribution, I would like to inquire about wholesale trade offers and distribution schedules.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
                            >
                                <FaWhatsapp className="text-lg" />
                                <span>{isAr ? 'مبيعات الجملة واتساب' : 'WhatsApp Sales Desk'}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Vital Metrics Matrix */}
            <section className="relative -mt-8 z-20 container-custom">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white dark:bg-[#132035] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            {isAr ? 'الشحنات والطلبيات المنجزة' : 'Delivered Wholesale Orders'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-4xl font-black text-[#0B192C] dark:text-white font-mono" dir="ltr">
                                {settings?.statDeliveries || "+9,000"}
                            </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                            {isAr ? '✓ تسليم مباشر لباب المحل' : '✓ Direct Storefront Delivery'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#132035] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            {isAr ? 'الشركات والوكالات المعتمدة' : 'Agency Brand Partners'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-4xl font-black text-[#8A6305] dark:text-[#E5B54A] font-mono" dir="ltr">
                                {settings?.statBrands || "+100"}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {isAr ? 'شراكات توريد أصلية' : 'Direct Authorized Contracts'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#132035] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            {isAr ? 'أصناف السلع والمواد الغذائية' : 'Active Wholesale SKUs'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-4xl font-black text-[#0B192C] dark:text-white font-mono" dir="ltr">
                                {settings?.statProducts || "+500"}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {isAr ? 'جاهزة للشحن والتوزيع' : 'In-Stock for Immediate Dispatch'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#132035] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            {isAr ? 'التغطية الجغرافية' : 'Syrian Governorates'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-4xl font-black text-[#0B192C] dark:text-white font-mono" dir="ltr">
                                14
                            </span>
                            <span className="text-xs font-bold text-slate-400">{isAr ? 'محافظة' : 'Governorates'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {isAr ? 'شبكة توزيع تغطي المحافظات' : 'Full National Distribution Reach'}
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Narrative Section: Who We Are & What We Actually Do */}
            <section className="container-custom py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Visual Asset Column */}
                    <div className="lg:col-span-6 order-2 lg:order-1">
                        <div className="relative group">
                            <div className="absolute -inset-3 bg-gradient-to-r from-[#8A6305]/20 to-[#0B192C]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-lg bg-slate-100 dark:bg-slate-800">
                                <ResilientImage
                                    alt="Hawa Wholesale Hub & Cases"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    src={narrativeImage}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-4 start-4 end-4 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-white">
                                    <p className="text-xs font-bold text-[#E5B54A] uppercase tracking-wider mb-0.5">
                                        {isAr ? 'مستودعات شركة حوا المركزية' : 'Hawa Central Warehousing'}
                                    </p>
                                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                                        {isAr ? 'طرود معبأة وكراتين معتمدة مطابقة لمواصفات المصنع جاهزة للتحميل اليومي' : 'Factory-sealed cases and standard master cartons ready for daily dispatch.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editorial Story Column */}
                    <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#8A6305] dark:text-[#E5B54A] text-xs font-black uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8A6305]" />
                                <span>{getContent(settings?.aboutNarrativeFounded, settings?.aboutNarrativeFoundedAr) || (isAr ? 'ريادة في توزيع الجملة' : 'Direct Trade Leadership')}</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B192C] dark:text-white leading-tight">
                                {getContent(settings?.aboutNarrativeTitle, settings?.aboutNarrativeTitleAr) || (isAr ? 'توريد موثوق، جودة قياسية، وشبكة توزيع متكاملة' : 'Direct Sourcing, Certified Quality & Full Distribution Reach')}
                            </h2>
                        </div>

                        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            <p>
                                {getContent(settings?.aboutNarrativeDesc1, settings?.aboutNarrativeDesc1Ar) || (isAr 
                                    ? 'تأسست شركة حوا للتوزيع والتجارة لتكون الشريك الاستراتيجي الموثوق لتجارة الجملة والتجزئة. نعمل كهمزة وصل مباشرة بين كبرى المصانع والشركات المنتجة للمواد الغذائية والسلع الاستهلاكية، وبين أصحاب السوبرماركت، الميني ماركت، والبقالات.'
                                    : 'Hawa Distribution & Trading was founded as the trusted strategic supply partner for food retailers and wholesalers. We bridge leading FMCG manufacturers directly with storefronts.')}
                            </p>
                            <p>
                                {getContent(settings?.aboutNarrativeDesc2, settings?.aboutNarrativeDesc2Ar) || (isAr 
                                    ? 'من خلال مستودعاتنا المركزية المجهزة وشبكة التوزيع المنظمة، نضمن وصول السلع في أفضل حالة وبكراتين المصنع الأصلية، مع توفير كشوف أسعار جملة شفافة ومنافسة، وفواتير نظامية معتمدة تدعم استقرار ونمو أعمال شركائنا.'
                                    : 'Through temperature-controlled warehouses and organized distribution network, we ensure all products reach your business in pristine factory condition with documented trade invoicing.')}
                            </p>
                        </div>

                        {/* Quote Block */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/60 border border-[#8A6305]/20 flex items-start gap-3.5">
                            <MdSecurity className="text-2xl text-[#8A6305] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white leading-snug">
                                    "{getContent(settings?.aboutNarrativeQuote, settings?.aboutNarrativeQuoteAr) || (isAr ? 'بضائع أصلية، كروتة المصنع المعتمدة، وتوصيل منتظم لباب المحل.' : 'Authentic goods, official carton pricing, and reliable direct delivery.')}"
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                    {isAr ? 'إدارة المبيعات والتوزيع – شركة حوا للتوزيع والتجارة' : 'Sales & Distribution Management – Hawa Co.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. The 4 Pillars of Hawa Distribution */}
            <section className="bg-slate-100/70 dark:bg-[#0E1A29] py-16 md:py-24 border-y border-slate-200/80 dark:border-white/10">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center mb-14">
                        <span className="text-xs font-black text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-widest">
                            {getContent(settings?.aboutValuesTitle, settings?.aboutValuesTitleAr) || (isAr ? 'ركائز العمل والتوريد المعتمد' : 'Our Trade Pillars')}
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight mt-2 mb-3">
                            {isAr ? 'لماذا يعتمد التجار وأصحاب السوبرماركت على شركة حوا؟' : 'Why Merchants & Supermarkets Choose Hawa'}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            {getContent(settings?.aboutValuesDesc, settings?.aboutValuesDescAr) || (isAr ? 'نلتزم بأعلى معايير المصداقية، شفافية الأسعار، واستمرارية سلاسل التوريد لقطاع التجزئة والجملة.' : 'Dedicated to authenticity, transparent trade terms, and consistent supply chains.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {distributionPillars.map((pillar, idx) => {
                            const Icon = pillar.icon;
                            return (
                                <div 
                                    key={idx}
                                    className="bg-white dark:bg-[#132035] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all hover:border-[#8A6305]/40 flex flex-col justify-between gap-4 group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#8A6305] dark:text-[#E5B54A] border border-[#8A6305]/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                <Icon />
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-[#0B192C] dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                                {isAr ? pillar.badgeAr : pillar.badgeEn}
                                            </span>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-white mb-2">
                                            {isAr ? pillar.titleAr : pillar.titleEn}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                            {isAr ? pillar.descAr : pillar.descEn}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 5. Product Categories We Distribute */}
            <section className="container-custom py-16 md:py-24">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <span className="text-xs font-black text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-widest">
                        {isAr ? 'الأقسام والسلع الأساسية' : 'Wholesale Product Range'}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight mt-2 mb-3">
                        {isAr ? 'تشكيلة متكاملة من المواد الغذائية والاستهلاكية' : 'Comprehensive Food & FMCG Catalog'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {isAr ? 'نوفر كافة احتياجات متجرك من الطرود والكراتين بطلب واحد وبفاتورة موحدة' : 'Everything your retail store needs in factory-sealed cases on one invoice.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {coreCategories.map((cat, i) => (
                        <div 
                            key={i}
                            className="bg-white dark:bg-[#132035] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-start gap-4 hover:border-[#8A6305]/30 transition-colors"
                        >
                            <span className="text-3xl p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 shrink-0">
                                {cat.icon}
                            </span>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-[#0B192C] dark:text-white mb-1">
                                    {isAr ? cat.ar : cat.en}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {isAr ? cat.descAr : cat.descEn}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Syrian Governorates Fleet Network */}
            <section className="bg-white dark:bg-[#132035] py-16 md:py-20 border-t border-slate-200/80 dark:border-white/10">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80 dark:border-white/10">
                        <div>
                            <span className="text-xs font-black text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-widest">
                                {isAr ? 'شبكة التوزيع الميدانية' : 'National Distribution Reach'}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight mt-1.5">
                                {isAr ? 'شبكة توزيع وخطوط توريد تغطي كافة المحافظات السورية' : 'Distribution Network Across All 14 Governorates'}
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            {isAr 
                                ? 'رحلات وجداول توزيع دورية تضمن وصول طلبيتك إلى باب متجرك في الموعد المحدد'
                                : 'Scheduled delivery routes delivering wholesale orders directly to your storefront.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                        {SYRIAN_GOVERNORATES.map((gov) => {
                            const isHQ = gov.key === 'Homs';
                            return (
                                <div 
                                    key={gov.key}
                                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all ${
                                        isHQ 
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-[#8A6305] text-[#8A6305] dark:text-[#E5B54A] shadow-xs'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1 mb-1 text-base">
                                        <MdLocationOn className={isHQ ? 'text-[#8A6305]' : 'text-slate-400'} />
                                    </div>
                                    <p className="font-extrabold">{isAr ? gov.ar : gov.en}</p>
                                    <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                                        {isHQ ? (isAr ? 'المركز الرئيسي' : 'Headquarters') : (isAr ? 'توزيع دوري' : 'Active Route')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 7. Direct Wholesale CTA Banner */}
            <section className="container-custom py-14 md:py-20">
                <div className="bg-[#0B192C] rounded-3xl p-8 sm:p-12 text-white border border-[#8A6305]/30 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A6305]/30 border border-[#8A6305]/50 text-xs font-bold text-[#E5B54A] mb-4">
                            <span>{isAr ? 'انضم لشبكة تجار حوا' : 'Join Hawa Merchant Network'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-white leading-tight">
                            {isAr ? 'جاهز لتجهيز محلك التجاري بأفضل أسعار الجملة؟' : 'Ready to Stock Your Store at Verified Wholesale Rates?'}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
                            {isAr 
                                ? 'سجل حساب محلك التجاري للاطلاع على كشوف أسعار الجملة المعتمدة، أو تواصل مباشرة مع مندوب المبيعات والتوزيع لتنسيق طلبيتك الأولى وجدولتها مع سيارة التوزيع.'
                                : 'Register your store account for verified trade prices or connect with our sales dispatch team to schedule your first delivery.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(isAr ? 'مرحباً شركة حوا للتوزيع، أود فتح حساب تجاري وتزويدي بأسعار طرود المواد الغذائية المتاحة.' : 'Hello Hawa Distribution, I want to set up a merchant account and get current carton prices.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                <FaWhatsapp className="text-lg" />
                                <span>{isAr ? 'تواصل مع مسؤول المبيعات عبر واتساب' : 'Chat with Sales on WhatsApp'}</span>
                            </a>

                            <Link
                                href="/account/register"
                                className="px-6 py-3.5 rounded-xl bg-[#8A6305] hover:bg-[#9E7309] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>{isAr ? 'تسجيل حساب تاجر رسمي' : 'Register Merchant Account'}</span>
                                <MdArrowForward className={`text-base ${isAr ? 'rotate-180' : ''}`} />
                            </Link>

                            <Link
                                href="/products"
                                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all"
                            >
                                <span>{isAr ? 'تصفح الكتالوج' : 'Browse Catalog'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
