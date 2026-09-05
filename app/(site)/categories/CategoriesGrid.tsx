"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MdExpandMore } from "react-icons/md";
import { useLanguage } from "@/app/context/LanguageContext";
import { getSafeImageUrl } from '@/lib/image-utils';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
}

interface CategoriesGridProps {
    categories: Category[];
}

const CategoriesGrid = ({ categories }: CategoriesGridProps) => {
    const { t } = useLanguage();
    const [displayLimit, setDisplayLimit] = useState(6);
    const defaultImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800';

    const visibleCategories = categories.slice(0, displayLimit);
    const hasMore = categories.length > displayLimit;

    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + 6);
    };

    return (
        <section className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {visibleCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="group flex flex-col gap-5 p-2 rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#8A6305]/15 hover:border-[#8A6305] transition-all animate-in fade-in zoom-in-95 duration-500"
                    >
                        <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-background-light dark:bg-background-dark">
                            <img
                                src={getSafeImageUrl(category.image || defaultImage)}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                        <div className="px-4 pb-4">
                            <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark transition-colors group-hover:text-[#8A6305]">
                                <span className="group-hover-underline-animated">{category.name}</span>
                            </h3>
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1 font-medium">{category.description || t('categoriesPage.premiumCollection')}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {hasMore && (
                <div className="mt-16 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="group relative px-10 py-4 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-text-main-light dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] transition-all duration-300 flex items-center gap-2 active:scale-95"
                    >
                        {t('categoriesPage.loadMoreCategories')}
                        <MdExpandMore className="text-[18px] group-hover:translate-y-1 transition-transform text-[#8A6305]" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default CategoriesGrid;

