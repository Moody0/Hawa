import React from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, ArrowRight, Phone, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import type { WebsiteContent } from '@/lib/website-content';

interface PartnerPrideBannerProps {
    language: string;
    dir: 'ltr' | 'rtl';
    content?: Partial<WebsiteContent>;
    salesPhone?: string;
    managementPhone?: string;
    whatsappUrl?: string;
}

export default function PartnerPrideBanner({
    language,
    dir,
    content,
    salesPhone = '+963 993 443 901',
    managementPhone = '+963 994 166 000',
    whatsappUrl,
}: PartnerPrideBannerProps) {
    const isArabic = language === 'ar' || dir === 'rtl';

    const badge = isArabic
        ? (content?.homePrideBadgeAr || 'وكيل وتوزيع معتمد • شريك استراتيجي')
        : (content?.homePrideBadge || 'Authorized Distribution Partner • Strategic Ally');

    const title = isArabic
        ? (content?.homePrideTitleAr || 'نفخر بتمثيل وتوزيع أصناف شركة بيتنجانة إخوان')
        : (content?.homePrideTitle || 'Proud to Represent and Distribute Bitinjana Brothers Products');

    const description = isArabic
        ? (content?.homePrideDescriptionAr || 'توفير وتوزيع مباشر لكافة منتجات وسلع شركة بيتنجانة إخوان الأصلية، بأعلى معايير الجودة وبأسعار الجملة الرسمية مباشرة لباب متجرك عبر أسطول توزيعنا.')
        : (content?.homePrideDescription || 'Direct wholesale supply and scheduled store deliveries of authentic Bitinjana Brothers goods across all distribution channels at verified trade rates.');

    const buttonText = isArabic
        ? (content?.homePrideButtonAr || 'تصفح الأصناف والمنتجات')
        : (content?.homePrideButton || 'Browse Wholesale Products');

    const buttonLink = content?.homePrideLink || '/products';

    const cleanSalesPhone = salesPhone.replace(/\s+/g, '');
    const cleanGmPhone = managementPhone.replace(/\s+/g, '');

    return (
        <section aria-label={title} className="w-full py-4 sm:py-6">
            <div className="container-custom">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071324] via-[#0B192C] to-[#122642] p-6 sm:p-9 md:p-12 border border-[#8A6305]/35 shadow-2xl">
                    {/* Ambient Glow & Decorative Geometric Flourishes */}
                    <div 
                        aria-hidden="true" 
                        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#8A6305]/20 blur-3xl" 
                    />
                    <div 
                        aria-hidden="true" 
                        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#E5B54A]/10 blur-3xl" 
                    />
                    <div 
                        aria-hidden="true" 
                        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E5B54A]/40 to-transparent" 
                    />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        {/* Text Content */}
                        <div className="max-w-3xl space-y-4">
                            {/* Eyebrow Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8A6305]/30 to-[#8A6305]/10 px-3.5 py-1 text-xs font-black text-[#E5B54A] border border-[#8A6305]/40 shadow-xs">
                                <Sparkles className="h-3.5 w-3.5 text-[#E5B54A] shrink-0 animate-pulse" />
                                <span>{badge}</span>
                            </div>

                            {/* Main Statement Title */}
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-snug">
                                {title}
                            </h2>

                            {/* Narrative Subtitle */}
                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                                {description}
                            </p>

                            {/* Quick Trust Badges */}
                            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                                <div className="inline-flex items-center gap-1.5 font-bold">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                    <span>{isArabic ? 'منتجات أصلية 100%' : '100% Authentic'}</span>
                                </div>
                                <span className="text-white/20">•</span>
                                <div className="inline-flex items-center gap-1.5 font-bold">
                                    <Award className="h-4 w-4 text-[#E5B54A] shrink-0" />
                                    <span>{isArabic ? 'أسعار الجملة الرسمية' : 'Official Wholesale Prices'}</span>
                                </div>
                                <span className="text-white/20">•</span>
                                <div className="inline-flex items-center gap-1.5 font-bold">
                                    <span className="text-emerald-400 font-mono">🚚</span>
                                    <span>{isArabic ? 'توصيل لباب المحل' : 'Door-to-door Freight'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Hub & Direct Contact Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[280px]">
                            {/* Primary Explore Catalog Button */}
                            <Link
                                href={buttonLink}
                                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#8A6305] to-[#B3830E] hover:from-[#9E7307] hover:to-[#C69212] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#8A6305]/25 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
                            >
                                <span>{buttonText}</span>
                                {isArabic ? (
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                ) : (
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                )}
                            </Link>

                            {/* Direct Line: Sales Manager */}
                            <div className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 p-3 transition-colors">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0">
                                            <FaWhatsapp />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {isArabic ? 'مدير المبيعات التجارية' : 'Commercial Sales Manager'}
                                            </span>
                                            <a 
                                                href={`tel:${cleanSalesPhone}`}
                                                dir="ltr"
                                                className="text-xs font-black text-white hover:text-[#E5B54A] font-mono transition-colors"
                                            >
                                                {salesPhone}
                                            </a>
                                        </div>
                                    </div>
                                    <a
                                        href={whatsappUrl || `https://wa.me/${cleanSalesPhone.replace(/\+/g, '')}?text=${encodeURIComponent(isArabic ? 'مرحباً، أود الاستفسار عن أصناف شركة بيتنجانة إخوان وأسعار الجملة.' : 'Hello, I would like to inquire about Bitinjana Brothers products.')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-8 w-8 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center text-sm shadow-xs transition-transform active:scale-95 shrink-0"
                                        title={isArabic ? 'محادثة واتساب مباشرة' : 'Direct WhatsApp'}
                                    >
                                        <FaWhatsapp />
                                    </a>
                                </div>
                            </div>

                            {/* Direct Line: General Manager */}
                            <div className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 p-3 transition-colors">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-[#8A6305]/25 text-[#E5B54A] flex items-center justify-center text-sm shrink-0">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {isArabic ? 'إدارة الشركة والتوكيلات' : 'General Management'}
                                            </span>
                                            <a 
                                                href={`tel:${cleanGmPhone}`}
                                                dir="ltr"
                                                className="text-xs font-black text-white hover:text-[#E5B54A] font-mono transition-colors"
                                            >
                                                {managementPhone}
                                            </a>
                                        </div>
                                    </div>
                                    <a
                                        href={`tel:${cleanGmPhone}`}
                                        className="h-8 w-8 rounded-lg bg-[#0B192C] hover:bg-[#162D4D] border border-white/20 text-[#E5B54A] flex items-center justify-center text-xs shadow-xs transition-transform active:scale-95 shrink-0"
                                        title={isArabic ? 'اتصال مباشر بالإدارة' : 'Call Management'}
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
