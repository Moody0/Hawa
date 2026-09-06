"use client";

import React from "react";
import ProductCard from '@/app/components/ProductsPageComponents/ProductCard';
import { useLanguage } from "@/app/context/LanguageContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RelatedProductsProps {
    products: any[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
    const { t, language } = useLanguage();

    if (products.length === 0) return null;

    return (
        <section className="mt-12 lg:mt-20 pt-10 border-t border-gray-200 dark:border-white/10">
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 text-[#0B192C] dark:text-white uppercase tracking-wider text-center ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'}`}>
                {t('products.relatedProducts')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {products.map(related => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <ProductCard key={related.id} product={related as any} />
                ))}
            </div>
        </section>
    );
};

export default RelatedProducts;
