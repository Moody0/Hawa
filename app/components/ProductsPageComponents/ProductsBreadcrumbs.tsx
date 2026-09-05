"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

interface ProductsBreadcrumbsProps {
    activeCategory?: {
        name: string;
        slug?: string;
        description?: string | null;
        nameEn?: string | null;
    } | null;
    activeBrand?: {
        name: string;
        slug?: string;
    } | null;
    activeMainCategory?: {
        name: string;
        slug?: string;
        description?: string | null;
    } | null;
}

const ProductsBreadcrumbs = ({ 
    activeCategory = null, 
    activeBrand = null, 
    activeMainCategory = null 
}: ProductsBreadcrumbsProps) => {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const getCategoryName = () => {
        if (!activeCategory) return '';
        if (isArabic) return activeCategory.name;
        return activeCategory.description || activeCategory.nameEn || activeCategory.name;
    };

    const getMainCategoryName = () => {
        if (!activeMainCategory) return '';
        if (isArabic) return activeMainCategory.name;
        return activeMainCategory.description || activeMainCategory.name;
    };

    const categoryName = getCategoryName();
    const mainCategoryName = getMainCategoryName();

    return (
        <nav className="relative z-20 flex items-center flex-wrap gap-y-2 text-[11px] md:text-[12px] font-bold text-[#475569] dark:text-gray-400 uppercase tracking-wider mb-6" aria-label="Breadcrumb">
            <Link 
                href="/" 
                className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors"
            >
                {isArabic ? 'الرئيسية' : 'Home'}
            </Link>
            
            <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>

            {/* If inside both Brand & Category: Home > Brands > Brand > Category */}
            {activeBrand && activeCategory ? (
                <>
                    <Link 
                        href="/brands" 
                        className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors"
                    >
                        {isArabic ? 'العلامات التجارية' : 'Brands'}
                    </Link>
                    <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>
                    <Link 
                        href={`/brands/${activeBrand.slug}`} 
                        className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors truncate max-w-[160px] md:max-w-none"
                    >
                        {activeBrand.name}
                    </Link>
                    <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>
                    <span className="text-[#8A6305] dark:text-[#8A6305] truncate max-w-[200px] md:max-w-none">
                        {categoryName}
                    </span>
                </>
            ) : activeBrand ? (
                <>
                    <Link 
                        href="/brands" 
                        className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors"
                    >
                        {isArabic ? 'العلامات التجارية' : 'Brands'}
                    </Link>
                    <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>
                    <span className="text-[#8A6305] dark:text-[#8A6305] truncate max-w-[200px] md:max-w-none">
                        {activeBrand.name}
                    </span>
                </>
            ) : activeMainCategory ? (
                <>
                    <Link 
                        href="/products" 
                        className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors"
                    >
                        {isArabic ? 'الأقسام الرئيسية' : 'Departments'}
                    </Link>
                    <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>
                    <span className="text-[#8A6305] dark:text-[#8A6305] truncate max-w-[200px] md:max-w-none">
                        {mainCategoryName}
                    </span>
                </>
            ) : activeCategory ? (
                <>
                    <Link 
                        href="/products" 
                        className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/80 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation transition-colors"
                    >
                        {isArabic ? 'جميع المنتجات' : 'All Products'}
                    </Link>
                    <span className="mx-2 md:mx-3 text-gray-300 dark:text-white/20 select-none">/</span>
                    <span className="text-[#8A6305] dark:text-[#8A6305] truncate max-w-[200px] md:max-w-none">
                        {categoryName}
                    </span>
                </>
            ) : (
                <span className="text-[#0B192C] dark:text-white font-bold truncate max-w-[150px] md:max-w-none">
                    {isArabic ? 'جميع المنتجات' : 'All Products'}
                </span>
            )}
        </nav>
    );
};

export default ProductsBreadcrumbs;
