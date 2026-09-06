"use client";

import React from "react";
import Link from "next/link";
import { MdChevronRight } from "react-icons/md";
import { useLanguage } from "@/app/context/LanguageContext";
import CategoriesGrid from "./CategoriesGrid";
import { getSafeImageUrl } from '@/lib/image-utils';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
}

interface CategoriesContentProps {
    categories: Category[];
    siteSettings: any | null;
}

export default function CategoriesContent({ categories, siteSettings }: CategoriesContentProps) {
    const { t, language } = useLanguage();

    const ctaTitle = language === 'ar'
        ? (siteSettings?.categoriesCtaTitleAr || t('categoriesPage.cantDecide'))
        : (siteSettings?.categoriesCtaTitle || t('categoriesPage.cantDecide'));

    const ctaDesc = language === 'ar'
        ? (siteSettings?.categoriesCtaDescAr || t('categoriesPage.skinQuizDescription'))
        : (siteSettings?.categoriesCtaDesc || t('categoriesPage.skinQuizDescription'));

    const ctaImage = (siteSettings?.categoriesCtaImage && !siteSettings.categoriesCtaImage.includes('aida-public'))
        ? siteSettings.categoriesCtaImage 
        : "/uploads/banners/hawa-food-agencies-banner.jpg";

    return (
        <div className="w-full pb-20">
            <nav className="container-custom pt-8 pb-4">
                <ul className="flex items-center gap-2 text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                    <li><Link className="hover-underline-animated transition-colors" href="/">{t('common.home')}</Link></li>
                    <li><MdChevronRight className="text-[14px] rtl:rotate-180" /></li>
                    <li className="text-text-main-light dark:text-text-main-dark">{t('categoriesPage.allCategories')}</li>
                </ul>
            </nav>

            <section className="container-custom mb-12">
                <div className="border-l-4 border-zinc-900 dark:border-white pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-main-light dark:text-text-main-dark tracking-tight">{t('categoriesPage.title')}</h1>
                    <p className="mt-3 text-lg text-text-muted-light dark:text-text-muted-dark max-w-2xl">
                        {t('categoriesPage.description')}
                    </p>
                </div>
            </section>

            <div className="container-custom">
                <CategoriesGrid categories={categories} />
            </div>

            <section className="container-custom mt-24">
                <div className="rounded-3xl bg-gray-50 dark:bg-zinc-900 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-200 dark:border-white/10">
                    <div className="flex flex-col gap-4 text-center md:text-left rtl:md:text-right">
                        <h2 className="text-3xl font-extrabold text-text-main-light dark:text-text-main-dark">{ctaTitle}</h2>
                        <p className="text-text-muted-light dark:text-text-muted-dark max-w-md">{ctaDesc}</p>
                        <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                            <Link href="/products" className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:bg-black dark:hover:bg-gray-200 transition-all">{t('categoriesPage.viewAllProducts')}</Link>
                            <Link target="_blank" href="https://wa.me/963933254796" className="px-8 py-3 bg-transparent border border-zinc-900 dark:border-white text-zinc-900 dark:text-white rounded-full font-bold text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-all">{t('footer.contactUs')}</Link>
                        </div>
                    </div>
                    <div className="hidden lg:block w-1/3">
                        <div className="relative aspect-square w-full">
                            <img
                                src={getSafeImageUrl(ctaImage)}
                                alt={t('products.productSelection')}
                                className="w-full h-full rounded-2xl shadow-2xl rotate-3 scale-110 rtl:-rotate-3 object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
