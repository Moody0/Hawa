"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

interface BreadcrumbsProps {
    productName: string;
    categoryName?: string;
    categorySlug?: string;
}

const Breadcrumbs = ({ productName, categoryName, categorySlug }: BreadcrumbsProps) => {
    const { language } = useLanguage();

    return (
        <nav className="relative z-20 flex items-center flex-wrap gap-y-2 text-[11px] md:text-[12px] font-bold text-[#475569] uppercase tracking-[0.1em] mb-6" aria-label="Breadcrumb">
            <Link 
                href="/" 
                className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/60 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation hover-underline-animated transition-colors"
            >
                {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            
            <span className="mx-2 md:mx-4 text-gray-300 select-none">|</span>
            
            <Link 
                href="/products" 
                className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/60 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation hover-underline-animated transition-colors"
            >
                {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
            </Link>

            {categoryName && categorySlug && (
                <>
                    <span className="mx-2 md:mx-4 text-gray-300 select-none">|</span>
                    <Link 
                        href={`/categories/${categorySlug}`} 
                        className="inline-flex items-center py-1.5 px-1 -my-1.5 text-[#0B192C] dark:text-white/60 hover:text-[#8A6305] dark:hover:text-[#8A6305] cursor-pointer touch-manipulation hover-underline-animated transition-colors"
                    >
                        {categoryName}
                    </Link>
                </>
            )}

            <span className="mx-2 md:mx-4 text-gray-300 select-none">|</span>
            
            <span className="text-[#0B192C] dark:text-white truncate max-w-[150px] md:max-w-none">
                {productName}
            </span>
        </nav>
    );
};

export default Breadcrumbs;
