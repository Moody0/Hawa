'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Breadcrumb, { BreadcrumbItem } from '@/app/components/Breadcrumb';

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
    activeMainCategory = null,
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

    const items: BreadcrumbItem[] = [];

    if (activeBrand && activeCategory) {
        items.push({
            label: isArabic ? 'الوكالات والعلامات التجارية' : 'Brands',
            href: '/brands',
        });
        items.push({
            label: activeBrand.name,
            href: `/brands/${activeBrand.slug}`,
        });
        items.push({
            label: categoryName,
        });
    } else if (activeBrand) {
        items.push({
            label: isArabic ? 'الوكالات والعلامات التجارية' : 'Brands',
            href: '/brands',
        });
        items.push({
            label: activeBrand.name,
        });
    } else if (activeMainCategory) {
        items.push({
            label: isArabic ? 'الأقسام الرئيسية' : 'Departments',
            href: '/products',
        });
        items.push({
            label: mainCategoryName,
        });
    } else if (activeCategory) {
        items.push({
            label: isArabic ? 'جميع المنتجات' : 'All Products',
            href: '/products',
        });
        items.push({
            label: categoryName,
        });
    } else {
        items.push({
            label: isArabic ? 'جميع المنتجات' : 'All Products',
        });
    }

    return <Breadcrumb items={items} />;
};

export default ProductsBreadcrumbs;
