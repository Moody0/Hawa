'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import { 
    MdSearch, 
    MdCalendarToday, 
    MdAccessTime, 
    MdArrowForward, 
    MdTrendingUp,
    MdLocalShipping,
    MdStorefront,
    MdVerified,
    MdOutlineArticle,
    MdFilterList
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

export interface BlogPostItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    image: string | null;
    category: string | null;
    createdAt: Date | string;
    readTime?: string;
    isFeatured?: boolean;
}

interface BlogClientProps {
    initialPosts: BlogPostItem[];
    whatsappNumber?: string;
}

export default function BlogClient({ initialPosts, whatsappNumber = '+963993443901' }: BlogClientProps) {
    const { language, dir } = useLanguage();
    const isAr = language === 'ar' || dir === 'rtl';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = useMemo(() => [
        { key: 'all', labelAr: 'جميع المقالات', labelEn: 'All Articles' },
        { key: 'agencies', labelAr: 'عروض الوكالات والمنتجات', labelEn: 'Agencies & Products', matchKeywords: ['وكالة', 'منتج', 'عروض', 'وكالات', 'agency', 'product', 'ريف', 'سيكو'] },
        { key: 'retail', labelAr: 'نصائح وإدارة المحلات', labelEn: 'Store Management', matchKeywords: ['نصائح', 'متاجر', 'سوبرماركت', 'تجزئة', 'retail', 'store', 'shop', 'مخزون'] },
        { key: 'market', labelAr: 'حركة ونبض السوق', labelEn: 'Market Trends', matchKeywords: ['سوق', 'أسعار', 'طلب', 'مؤشرات', 'market', 'price', 'trends', 'سلع'] },
        { key: 'company', labelAr: 'أخبار التوزيع والشركة', labelEn: 'Distribution & Logistics', matchKeywords: ['شركة', 'توزيع', 'سيارات', 'شحن', 'مستودع', 'company', 'distribution', 'logistics'] },
    ], []);

    // Filter posts
    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const matchesSearch = !searchQuery.trim() || 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            if (selectedCategory === 'all') return true;

            const targetCategory = categories.find(c => c.key === selectedCategory);
            if (!targetCategory || !targetCategory.matchKeywords) return true;

            const postCat = (post.category || '').toLowerCase();
            const postTitle = post.title.toLowerCase();
            return targetCategory.matchKeywords.some(kw => postCat.includes(kw) || postTitle.includes(kw));
        });
    }, [initialPosts, searchQuery, selectedCategory, categories]);

    const leadPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
    const secondaryPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

    const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

    const calculateReadTime = (post: BlogPostItem) => {
        if (post.readTime) return post.readTime;
        const wordCount = (post.title + ' ' + (post.excerpt || '')).split(/\s+/).length;
        const minutes = Math.max(3, Math.ceil(wordCount / 40) + 2);
        return isAr ? `${minutes} دقائق قراءة` : `${minutes} min read`;
    };

    const formatDate = (dateInput: Date | string) => {
        const d = new Date(dateInput);
        return d.toLocaleDateString(isAr ? 'ar-SY' : 'en-US', {
            year: 'numeric',
            month: isAr ? 'long' : 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="w-full pb-20">
            {/* Top Trade Dateline / Masthead */}
            <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
                <div className="container-custom py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-[#0B192C] dark:text-slate-200">
                            {isAr ? 'النشرة التجارية المعتمدة' : 'Official Trade Journal'}
                        </span>
                        <span>•</span>
                        <span>{isAr ? 'مركز معلومات سوق الجملة والسلع الغذائية' : 'Wholesale FMCG & Food Supply Insights'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="font-mono">
                            {new Date().toLocaleDateString(isAr ? 'ar-SY' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Header / Hero Banner */}
            <section className="container-custom pt-10 pb-8 md:pt-14 md:pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-white/10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A6305]/10 border border-[#8A6305]/20 text-[#8A6305] dark:text-[#E5B54A] text-xs font-black uppercase tracking-widest mb-3">
                            <MdOutlineArticle className="text-sm" />
                            <span>{isAr ? 'المدونة والتقارير الميدانية' : 'Editorial & Trade Bulletins'}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B192C] dark:text-white tracking-tight leading-tight">
                            {isAr ? 'أخبار الوكالات ونبض سوق الجملة' : 'Trade Intelligence & Agency News'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed font-normal">
                            {isAr 
                                ? 'تحليلات حركة السلع الغذائية، إطلاقات الوكالات المعتمدة، ودليل عملي لأصحاب المحلات لرفع دوران المخزون وضبط المشتريات.'
                                : 'FMCG commodity dynamics, official brand launches, and actionable guides for grocery and supermarket managers.'}
                        </p>
                    </div>

                    {/* Quick Search */}
                    <div className="w-full md:w-80 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isAr ? 'ابحث في المقالات والتقارير...' : 'Search articles and reports...'}
                            className="w-full py-2.5 ps-10 pe-4 bg-white dark:bg-[#132035] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A6305] focus:border-transparent text-[#0B192C] dark:text-white placeholder:text-slate-400 shadow-xs"
                        />
                        <MdSearch className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                            >
                                {isAr ? 'مسح' : 'Clear'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 border-b border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 me-2">
                        <MdFilterList className="text-base text-[#8A6305]" />
                        <span className="font-bold text-[#0B192C] dark:text-slate-300">{isAr ? 'التصنيف:' : 'Filter:'}</span>
                    </div>
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.key;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    isSelected
                                        ? 'bg-[#0B192C] text-white dark:bg-[#8A6305] dark:text-white shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                                }`}
                            >
                                {isAr ? cat.labelAr : cat.labelEn}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Main Content Area */}
            <div className="container-custom">
                {filteredPosts.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20 px-4 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200/80 dark:border-white/10 max-w-xl mx-auto my-8">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-[#8A6305] dark:text-[#E5B54A] flex items-center justify-center text-2xl mx-auto mb-4 border border-[#8A6305]/20">
                            <MdOutlineArticle />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white mb-2">
                            {isAr ? 'لم يتم العثور على مقالات مطابقة' : 'No matching articles found'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            {isAr 
                                ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً لعرض التقارير.'
                                : 'Try adjusting your search terms or filter selection to view reports.'}
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            className="px-5 py-2.5 rounded-xl bg-[#0B192C] dark:bg-[#8A6305] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                            {isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 1. Lead Story Spotlight (Editorial Feature) */}
                        {leadPost && (
                            <section className="mb-12">
                                <div className="text-xs font-black uppercase tracking-widest text-[#8A6305] dark:text-[#E5B54A] mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                                    <span>{isAr ? 'تقرير رئيسي مميز' : 'Lead Story Spotlight'}</span>
                                </div>

                                <Link 
                                    href={`/blog/${leadPost.slug}`}
                                    className="group block bg-white dark:bg-[#132035] rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden hover:border-[#8A6305]/40 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                        {/* Image Frame */}
                                        <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-[260px] lg:min-h-[380px]">
                                            <ResilientImage
                                                src={leadPost.image || '/images/hawa_wholesale_hub.jpg'}
                                                alt={leadPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 1024px) 100vw, 60vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                                            
                                            {/* Category Overlay */}
                                            <div className="absolute top-4 start-4 z-10">
                                                <span className="bg-[#0B192C]/90 backdrop-blur-md text-[#E5B54A] text-xs font-extrabold px-3 py-1 rounded-full border border-white/15 shadow-sm">
                                                    {leadPost.category || (isAr ? 'عروض الوكالات' : 'Agency News')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Narrative Content */}
                                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <MdCalendarToday className="text-sm text-[#8A6305]" />
                                                        <span>{formatDate(leadPost.createdAt)}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <MdAccessTime className="text-sm text-[#8A6305]" />
                                                        <span>{calculateReadTime(leadPost)}</span>
                                                    </span>
                                                </div>

                                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors leading-tight mb-4">
                                                    {leadPost.title}
                                                </h2>

                                                {leadPost.excerpt && (
                                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-4 mb-6">
                                                        {leadPost.excerpt}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#8A6305] dark:text-[#E5B54A]">
                                                <span className="inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                                                    <span>{isAr ? 'قراءة التحليل كاملاً' : 'Read Full Analysis'}</span>
                                                    <MdArrowForward className="text-base rtl:rotate-180" />
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-normal">
                                                    {isAr ? 'شركة حوا للتوزيع' : 'Hawa Distribution'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </section>
                        )}

                        {/* 2. Secondary Editorial Grid */}
                        {secondaryPosts.length > 0 && (
                            <section className="mb-14">
                                <div className="text-xs font-black uppercase tracking-widest text-[#8A6305] dark:text-[#E5B54A] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                                    <span>{isAr ? 'أحدث التقارير والمستجدات' : 'Latest Reports & Bulletins'}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {secondaryPosts.map((post) => {
                                        return (
                                            <Link
                                                key={post.id}
                                                href={`/blog/${post.slug}`}
                                                className="group bg-white dark:bg-[#132035] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 hover:border-[#8A6305]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                                            >
                                                <div>
                                                    {/* Media Aspect Container */}
                                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <ResilientImage
                                                            src={post.image || '/images/hawa_hero.jpg'}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                        
                                                        {/* Category Pill */}
                                                        <div className="absolute top-3.5 start-3.5 z-10">
                                                            <span className="bg-[#0B192C]/85 backdrop-blur-md text-[#E5B54A] text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-white/15 shadow-xs">
                                                                {post.category || (isAr ? 'أخبار الوكالات' : 'Agency News')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="p-5 sm:p-6">
                                                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <MdCalendarToday className="text-xs text-[#8A6305]" />
                                                                <span>{formatDate(post.createdAt)}</span>
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <MdAccessTime className="text-xs text-[#8A6305]" />
                                                                <span>{calculateReadTime(post)}</span>
                                                            </span>
                                                        </div>

                                                        <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors leading-snug mb-2.5 line-clamp-2">
                                                            {post.title}
                                                        </h3>

                                                        {post.excerpt && (
                                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-normal">
                                                                {post.excerpt}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Action Footprint */}
                                                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-4 pt-3.5">
                                                    <span className="text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                                        <span>{isAr ? 'متابعة القراءة' : 'Read Article'}</span>
                                                        <MdArrowForward className="text-sm rtl:rotate-180" />
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        {isAr ? 'جملة وتجزئة' : 'B2B Trade'}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* 3. Trade Bulletin & Quick Supply Desk Strip */}
                <section className="bg-[#FAF6EC] dark:bg-white/[0.03] rounded-3xl p-6 sm:p-8 border border-[#8A6305]/20 mt-8 mb-12">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 text-xs font-black text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-2">
                                <MdVerified className="text-base" />
                                <span>{isAr ? 'مكتب التنسيق ومبيعات الجملة' : 'Wholesale Sales Desk'}</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-[#0B192C] dark:text-white leading-snug">
                                {isAr 
                                    ? 'هل تود توريد منتجات وكالتك أو الاستفسار عن لوائح أسعار الطرود؟'
                                    : 'Looking to distribute your agency products or request wholesale price lists?'}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                                {isAr 
                                    ? 'تواصل مباشرة مع فريق إدارة المبيعات والتوريد في شركة حوا للحصول على كشوف الأسعار وجداول التوصيل لمحافظتك.'
                                    : 'Connect directly with Hawa Distribution sales team for current carton prices and scheduled delivery runs.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <a
                                href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(isAr ? 'مرحباً شركة حوا، أود الاستفسار بخصوص لوائح أسعار الجملة وعروض الوكالات' : 'Hello Hawa Distribution, I would like to inquire about wholesale price lists')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                            >
                                <FaWhatsapp className="text-base" />
                                <span>{isAr ? 'استفسار عبر واتساب' : 'WhatsApp Desk'}</span>
                            </a>
                            <Link
                                href="/products"
                                className="px-5 py-3 rounded-2xl bg-[#0B192C] hover:bg-[#132035] text-white dark:bg-white/10 dark:hover:bg-white/15 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                            >
                                <MdStorefront className="text-base text-[#E5B54A]" />
                                <span>{isAr ? 'تصفح كتالوج البضائع' : 'Browse Catalog'}</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
