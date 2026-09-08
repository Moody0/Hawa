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

const FALLBACK_HIGHLIGHT_CARDS: HighlightCard[] = [
    {
        id: 'food',
        slug: 'food-commodities',
        subheadingAr: 'المواد الغذائية والمعلبات',
        subheadingEn: 'Food & Canned Goods',
        headingAr: 'زوان والريف',
        headingEn: 'Zwan & Alreef',
        productNameAr: 'لحوم ولانشون معلب',
        productNameEn: 'Canned Meats & Goods',
        priceText: '',
        heroImage: '/images/categories/canned-foods.webp',
        productThumb: '/images/categories/canned-foods.webp',
    },
    {
        id: 'detergents',
        slug: 'detergents-cleaning',
        subheadingAr: 'المنظفات ومواد العناية',
        subheadingEn: 'Detergents & Care',
        headingAr: 'روكافيرا وبوفالو',
        headingEn: 'Rocavira & Buffalo',
        productNameAr: 'سوائل جلي ومعقمات',
        productNameEn: 'Detergents & Sanitisers',
        priceText: '',
        heroImage: '/images/categories/dishwashing-liquid.webp',
        productThumb: '/images/categories/dishwashing-liquid.webp',
    },
    {
        id: 'dairy-oils',
        slug: 'oils-ghee',
        subheadingAr: 'الزيوت والسمن والألبان',
        subheadingEn: 'Oils, Ghee & Dairy',
        headingAr: 'الريف وحليبنا',
        headingEn: 'Alreef & Haleebna',
        productNameAr: 'سمن بقري وزيوت طعام',
        productNameEn: 'Ghee & Vegetable Oils',
        priceText: '',
        heroImage: '/images/categories/cooking-oil-ghee.webp',
        productThumb: '/images/categories/cooking-oil-ghee.webp',
    },
    {
        id: 'seafood',
        slug: 'seafood-fish',
        subheadingAr: 'الأسماك والبحريات المعلبة',
        subheadingEn: 'Canned Seafood & Tuna',
        headingAr: 'صن بل وسيلفر فيش',
        headingEn: 'Sunbell & Silver Fish',
        productNameAr: 'تونة وسردين فاخر',
        productNameEn: 'Premium Tuna & Sardines',
        priceText: '',
        heroImage: '/images/categories/canned-foods.webp',
        productThumb: '/images/categories/canned-foods.webp',
    },
];

const CategoryHighlightCards = ({ cards = [], language = 'ar' }: CategoryHighlightCardsProps) => {
    const combinedCards = [...cards];
    if (combinedCards.length < 4) {
        for (const fb of FALLBACK_HIGHLIGHT_CARDS) {
            if (!combinedCards.some(c => c.slug === fb.slug || c.id === fb.id)) {
                combinedCards.push(fb);
            }
            if (combinedCards.length >= 4) break;
        }
    }

    const displayCards = combinedCards.length > 0 ? combinedCards : FALLBACK_HIGHLIGHT_CARDS;

    return (
        <section className="container-custom py-4 sm:py-6">
            {/* Centered Section Header with Decorative Flanking Lines */}
            <div className="text-center mb-5 sm:mb-7">
                <div className="flex items-center justify-center gap-3 mb-1.5">
                    <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {language === 'ar' ? 'أقسام التوريد بالجملة' : 'Wholesale Supply Departments'}
                    </h2>
                    <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                    {language === 'ar' ? 'اختر القسم لاستعراض الأصناف والطرود والوكالات المتوفرة' : 'Select a department to view available cartons and brands'}
                </p>
            </div>

            {/* Modern Clean Media Grid (Single container, zero nested mud) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {displayCards.slice(0, 4).map((card) => {
                    const categoryName = language === 'ar' ? card.subheadingAr : card.subheadingEn;
                    const brandsText = language === 'ar' ? card.headingAr : card.headingEn;

                    return (
                        <Link
                            key={card.id || card.slug}
                            href={`/departments/${card.slug}`}
                            className="group relative flex flex-col rounded-2xl bg-[#F4F5F7] dark:bg-zinc-800/60 p-3 sm:p-4 hover:bg-[#ECEEF2] dark:hover:bg-zinc-800 transition-colors duration-200"
                        >
                            {/* Image Container with clean display */}
                            <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50 mb-3 flex items-center justify-center p-2">
                                <ResilientImage
                                    src={card.heroImage}
                                    alt={categoryName}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>

                            {/* Text Info */}
                            <div className="flex flex-col flex-1 justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-[#8A6305] dark:text-[#E5B54A] block mb-0.5">
                                        {brandsText}
                                    </span>
                                    <h3 className="text-xs sm:text-sm font-black text-[#0B192C] dark:text-white line-clamp-1">
                                        {categoryName}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1">
                                    <span>{language === 'ar' ? 'تصفح الكتالوج' : 'Explore'}</span>
                                    <span className={language === 'ar' ? 'rotate-180 inline-block' : 'inline-block'}>→</span>
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default CategoryHighlightCards;
