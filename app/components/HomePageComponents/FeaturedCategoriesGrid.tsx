import React from 'react';
import Link from 'next/link';
import ResilientImage from '@/app/components/ResilientImage';

interface Category {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
    description: string | null;
    image: string | null;
    brandId: string;
    isFeatured: boolean;
    brand?: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

interface FeaturedCategoriesGridProps {
    categories: Category[];
    language?: 'en' | 'ar';
    dir?: 'rtl' | 'ltr';
}

const FeaturedCategoriesGrid = ({ categories, language = 'ar', dir = 'rtl' }: FeaturedCategoriesGridProps) => {
    const isArabic = language === 'ar' || dir === 'rtl';

    if (!categories || categories.length === 0) {
        return null;
    }

    const getDisplayName = (cat: Category) => {
        if (isArabic) {
            return cat.name;
        }
        return cat.description || cat.nameEn || cat.name;
    };

    const getBrandName = (cat: Category) => {
        if (!cat.brand?.name) return null;
        if (isArabic) {
            return cat.brand.name.split('-')[1]?.trim() || cat.brand.name.split('-')[0]?.trim();
        }
        return cat.brand.name.split('-')[0]?.trim();
    };

    return (
        <section className="container-custom py-2 md:py-4">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-4 sm:mb-6 border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-400">
                            {isArabic ? 'كتالوج التوريد بالجملة' : 'Wholesale Product Lines'}
                        </span>
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight">
                        {isArabic ? 'الأقسام والتصنيفات الرئيسية' : 'Key Wholesale Categories'}
                    </h2>
                </div>

                <Link
                    href="/categories"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] transition-colors whitespace-nowrap"
                >
                    <span>{isArabic ? 'عرض كل الأقسام' : 'All Categories'}</span>
                    <span className={`text-sm ${isArabic ? 'rotate-180' : ''}`}>→</span>
                </Link>
            </div>

            {/* Clean Grid: 2-Col Mobile, 3-Col Tablet, 6-Col Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                {categories.map((category) => {
                    const brandName = getBrandName(category);
                    const displayName = getDisplayName(category);

                    return (
                        <Link
                            key={category.id}
                            href={`/categories/${encodeURIComponent(category.slug)}`}
                            className="group flex flex-col p-3 rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-[#8A6305] dark:hover:border-[#8A6305] bg-white dark:bg-[#132035] shadow-2xs hover:shadow-xs transition-all duration-200"
                        >
                            {/* Category Image */}
                            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800/60 mb-2.5 flex items-center justify-center">
                                {category.image && category.image !== '/placeholder.svg' ? (
                                    <ResilientImage
                                        src={category.image}
                                        alt={displayName}
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2">
                                        <span className="text-2xl mb-1">📦</span>
                                        <span className="text-[10px] font-bold">{displayName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col text-center">
                                {brandName && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6305] dark:text-[#E5B54A] block mb-0.5 truncate">
                                        {brandName}
                                    </span>
                                )}
                                <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white leading-snug group-hover:text-[#8A6305] transition-colors line-clamp-1">
                                    {displayName}
                                </h3>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default FeaturedCategoriesGrid;
