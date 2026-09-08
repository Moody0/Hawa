import React from 'react';
import ResilientImage from '@/app/components/ResilientImage';
import { useLanguage } from '@/app/context/LanguageContext';
import { ShieldCheck, Package, Truck, MessageCircle } from 'lucide-react';

interface BrandHeroHeaderProps {
    brand: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
    };
    totalProducts: number;
}

export default function BrandHeroHeader({ brand, totalProducts }: BrandHeroHeaderProps) {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar';

    const fallbackImage = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800";
    const brandImage = brand.image || fallbackImage;

    // Parse bilingual name formatted as "Al Reef - الريف" or "Alicafe - علي كافيه"
    const nameParts = brand.name.split("-");
    const primaryName = isArabic && nameParts.length > 1
        ? nameParts[1].trim()
        : (nameParts[0]?.trim() || brand.name);

    const secondaryName = nameParts.length > 1
        ? (isArabic ? nameParts[0].trim() : nameParts[1].trim())
        : null;

    const whatsappMessage = encodeURIComponent(
        isArabic
            ? `مرحباً، أود الاستفسار عن قائمة أسعار الجملة وجدول توزيع وكالة (${primaryName}).`
            : `Hello, I would like to inquire about wholesale prices for (${primaryName}).`
    );

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 mb-5">
            <div className={`flex flex-col lg:flex-row items-center lg:items-center justify-between gap-4 sm:gap-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {/* Brand Identity & Metadata */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 w-full lg:w-auto">
                    {/* Brand Logo Container */}
                    <div className="shrink-0 w-20 h-20 sm:w-22 sm:h-22 rounded-xl p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 flex items-center justify-center relative">
                        <ResilientImage
                            src={brandImage}
                            alt={brand.name}
                            showSkeleton={false}
                            className="max-w-full max-h-full object-contain"
                            priority
                        />
                    </div>

                    {/* Brand Titles & Description */}
                    <div className="flex-1 min-w-0 text-center sm:text-start">
                        <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/20 px-2.5 py-0.5 rounded-lg">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>{isArabic ? "وكالة تجارية معتمدة" : "Authorized Agency"}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 px-2.5 py-0.5 rounded-lg">
                                <Package className="w-3.5 h-3.5 text-[#8A6305]" />
                                <span>{totalProducts} {isArabic ? "صنف متاح بالجملة" : "Wholesale Items"}</span>
                            </span>
                        </div>

                        <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-x-2.5 gap-y-1 mb-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-[#0B192C] dark:text-white tracking-tight">
                                {primaryName}
                            </h1>
                            {secondaryName && (
                                <span className="text-sm sm:text-base font-medium text-slate-400 dark:text-zinc-400">
                                    {secondaryName}
                                </span>
                            )}
                        </div>

                        {brand.description && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mt-0.5 font-normal">
                                {brand.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Commercial Actions & Direct Supply Badge */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-center lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                        <Truck className="w-4 h-4 text-[#8A6305] shrink-0" />
                        <span className="font-semibold">{isArabic ? "توزيع وتوريد فوري" : "Direct Warehouse Supply"}</span>
                    </div>

                    <a
                        href={`https://wa.me/963993443901?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#162740] dark:bg-white dark:text-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                        <MessageCircle className="w-4 h-4 text-[#8A6305] dark:text-[#8A6305]" />
                        <span>{isArabic ? "طلب تسعير جملة" : "Wholesale Inquiry"}</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
