import Link from "next/link";
import React from "react";
import { ChevronRight } from 'lucide-react';
import type { HomeCollectionSection } from "@/lib/admin-actions";
import ProductCard from "../ProductsPageComponents/ProductCard";
import ResilientImage from "@/app/components/ResilientImage";

interface CollectionShowcaseProps {
    sections: HomeCollectionSection[];
    t: (key: string) => string;
    dir: "ltr" | "rtl";
    language: "en" | "ar";
}

const panelThemes = [
    "border-amber-100 bg-gradient-to-br from-[#FDFCF8] via-white to-[#F5ECD7] dark:border-white/10 dark:from-[#24211a] dark:via-[#1e1c17] dark:to-[#171511]",
    "border-stone-200 bg-gradient-to-br from-[#FAFAF8] via-white to-[#F0EBE1] dark:border-white/10 dark:from-[#21201c] dark:via-[#1c1b18] dark:to-[#181714]",
    "border-amber-100 bg-gradient-to-br from-[#FCFBF7] via-white to-[#F3EADA] dark:border-white/10 dark:from-[#222019] dark:via-[#1d1b15] dark:to-[#161510]",
] as const;

const CollectionShowcase = ({ sections, t, dir, language }: CollectionShowcaseProps) => {
    if (!sections.length) {
        return null;
    }

    return (
        <section className="container-custom py-4 md:py-8">
            <div className="flex flex-col gap-8 md:gap-12">
                {sections.map((section, index) => {
                    const theme = panelThemes[index % panelThemes.length];
                    const reverseOnLarge = index % 2 === 1;
                    const desktopGrid = reverseOnLarge
                        ? "lg:grid-cols-[1.28fr_0.72fr]"
                        : "lg:grid-cols-[0.72fr_1.28fr]";
                    const contentAlignment = reverseOnLarge
                        ? "lg:items-end lg:text-right"
                        : "lg:items-start lg:text-left";
                    const contentStackAlignment = reverseOnLarge
                        ? "lg:items-end"
                        : "lg:items-start";

                    return (
                        <article
                            key={section.category.id}
                            className={`overflow-hidden rounded-[2rem] border ${theme} premium-shadow`}
                        >
                            <div className={`grid gap-8 p-5 md:p-8 lg:items-center lg:gap-10 lg:p-10 ${desktopGrid}`}>
                                <div className={`flex flex-col justify-center ${reverseOnLarge ? "lg:order-2" : ""} ${contentAlignment}`}>
                                    <div className={`w-full lg:max-w-[420px] ${reverseOnLarge ? "ltr:lg:ml-auto rtl:lg:mr-auto" : ""}`}>
                                        <div className={`flex items-start justify-between gap-3 sm:items-center lg:flex-col lg:gap-5 ${contentStackAlignment}`}>
                                            <h2 className="flex-1 text-3xl font-extrabold tracking-tight text-text-main-light dark:text-text-main-dark md:text-4xl xl:text-[2.8rem]">
                                                {section.category.name}
                                            </h2>
                                            <div className={`flex flex-col gap-3 ${contentStackAlignment}`}>
                                                <Link
                                                    href={`/categories/${section.category.slug}`}
                                                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold text-white transition-all hover:bg-primary/90 text-sm"
                                                >
                                                    {t("home.shopNow")}
                                                    <ChevronRight className={dir === "rtl" ? "rotate-180" : ""} />
                                                </Link>
                                                <div className={`flex ${dir === "rtl" || reverseOnLarge ? "lg:justify-end" : "lg:justify-start"} justify-center sm:justify-start`}>
                                                    <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-text-muted-light dark:bg-white/10 dark:text-text-muted-dark">
                                                        {section.category.productCount} {t("home.productsLabel")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`relative min-h-[260px] overflow-hidden rounded-[1.9rem] border border-white/80 bg-white/60 shadow-sm lg:min-h-[360px] dark:border-white/10 dark:bg-white/5 ${reverseOnLarge ? "lg:order-1" : ""}`}>
                                    <div className="absolute inset-0">
                                        <ResilientImage
                                            src={section.category.image}
                                            alt={section.category.name}
                                            className="h-full w-full object-fill transition-transform duration-700"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/20 bg-black/40 p-4 backdrop-blur-md md:inset-x-6 md:bottom-6 md:p-5">
                                        <div className="flex items-end justify-between gap-3">
                                            <p className="text-xl font-bold text-white md:text-2xl">
                                                {section.category.name}
                                            </p>
                                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                                                {section.category.productCount} {t("home.productsLabel")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden justify-items-center border-t border-white/70 bg-white/65 p-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:p-6 xl:grid-cols-6 dark:border-white/10 dark:bg-background-dark/20">
                                {section.products.map((product) => (
                                    <ProductCard key={product.id} product={product} variant="compact" />
                                ))}
                            </div>

                            <div className="overflow-x-auto px-4 pb-4 md:hidden scrollbar-hide">
                                <div className="flex gap-4 snap-x snap-mandatory">
                                    {section.products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="w-[189px] min-w-[189px] flex-none snap-start"
                                        >
                                            <ProductCard product={product} variant="compact" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default CollectionShowcase;
