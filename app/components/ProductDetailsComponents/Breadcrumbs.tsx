'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import Breadcrumb, { BreadcrumbItem } from '@/app/components/Breadcrumb';

interface BreadcrumbsProps {
    productName: string;
    categoryName?: string;
    categorySlug?: string;
}

const Breadcrumbs = ({ productName, categoryName, categorySlug }: BreadcrumbsProps) => {
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const items: BreadcrumbItem[] = [
        {
            label: isArabic ? 'جميع المنتجات' : 'All Products',
            href: '/products',
        },
    ];

    if (categoryName && categorySlug) {
        items.push({
            label: categoryName,
            href: `/categories/${categorySlug}`,
        });
    }

    items.push({
        label: productName,
    });

    return <Breadcrumb items={items} className="!mb-0" />;
};

export default Breadcrumbs;
