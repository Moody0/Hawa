import React from 'react';
import Link from 'next/link';
import ResilientImage from '@/app/components/ResilientImage';

export interface HighlightCard {
    id: string;
    slug: string;
    subheadingAr: string;
    subheadingEn: string;
    headingAr: string;
    headingEn: string;
    productNameAr: string;
    productNameEn: string;
    priceText: string;
    heroImage: string;
    productThumb: string;
    productSlug?: string;
}

interface CategoryHighlightCardsProps {
    cards?: HighlightCard[];
    language?: 'en' | 'ar';
}

const CategoryHighlightCards = ({ cards = [], language = 'ar' }: CategoryHighlightCardsProps) => {
    if (!cards || cards.length === 0) {
        return null;
    }

    return (
        <section className="container-custom">
            {/* Section Title */}
            <div className="flex justify-center mb-6 md:mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl md:text-2xl lg:text-[28px] font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                    {language === 'ar' ? 'أقسام التوريد بالجملة' : 'Wholesale Supply Departments'}
                </h2>
            </div>

            <div className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
                {cards.map((card) => {
                    const categoryName = language === 'ar' ? card.subheadingAr : card.subheadingEn;
                    const heroImage = card.heroImage || '/placeholder.svg';

                    return (
                        <div
                            key={card.id || card.slug}
                            className="flex-none w-[170px] sm:w-[190px] md:flex-1 min-w-0 snap-start"
                        >
                            <Link
                                href={`/departments/${card.slug}`}
                                className="group relative flex flex-col h-full bg-[#FAF9F5] dark:bg-[#1E1E16] rounded-2xl overflow-hidden border border-[#8A6305]/15 hover:border-[#8A6305]/50 transition-all duration-300 hover:shadow-md p-2.5 sm:p-3.5"
                            >
                                {/* Image Container (Structured with inner rounded frame) */}
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-white/5 mb-2.5 flex items-center justify-center">
                                    <ResilientImage
                                        src={heroImage}
                                        alt={categoryName}
                                        showSkeleton={false}
                                        sizes="(max-width: 768px) 190px, 300px"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Text Content */}
                                <div className="flex flex-col flex-1 justify-between px-1 pb-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="text-[13px] sm:text-[14px] md:text-[16px] font-bold text-[#0B192C] dark:text-white leading-tight group-hover:text-[#8A6305] transition-colors truncate">
                                                {categoryName}
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-[#8A6305] dark:text-[#E5B54A] font-bold mt-0.5">
                                                {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                                            </p>
                                        </div>

                                        {/* Outline Icon */}
                                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-all duration-300 group-hover:border-[#8A6305] group-hover:bg-[#8A6305] group-hover:text-white shadow-2xs">
                                            <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default CategoryHighlightCards;
