import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";
import { getCatalogInitialData, getCatalogBrands } from "@/lib/catalog";
import { findCategoryByIdentifier } from "@/lib/category-utils";

import { Metadata } from "next";

export const revalidate = 60; // Revalidate cache every 60 seconds

export const metadata: Metadata = {
    title: "كتالوج المنتجات وعروض الوكالات | Products Catalog - Hawa Distribution",
    description: "تصفح كافة منتجات الوكالات والعلامات التجارية المعتمدة من مواد غذائية ومنظفات بأسعار الجملة لدى شركة هوا للتوزيع والتجارة.",
    alternates: {
        canonical: "/products",
    },
    openGraph: {
        title: "كتالوج المنتجات وعروض الوكالات | Hawa Distribution - هوا للتوزيع",
        description: "تصفح كافة منتجات الوكالات والعلامات التجارية المعتمدة بأسعار الجملة لدى شركة هوا للتوزيع والتجارة.",
        url: "/products",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Hawa Distribution Product Catalog",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "كتالوج المنتجات وعروض الوكالات | Hawa Distribution - هوا للتوزيع",
        description: "تصفح كافة منتجات الوكالات والعلامات التجارية المعتمدة بأسعار الجملة لدى شركة هوا للتوزيع والتجارة.",
        images: ["/og-image.jpg"],
    },
};

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const category = typeof params.category === "string" ? params.category : null;

    if (category) {
        const resolvedCategory = await findCategoryByIdentifier(category);
        redirect(resolvedCategory ? `/categories/${resolvedCategory.slug}` : "/products");
    }

    const [{ categories, products, totalProducts }, brands] = await Promise.all([
        getCatalogInitialData(),
        getCatalogBrands(),
    ]);

    return (
        <Suspense fallback={<CatalogLoadingFallback />}>
            <ProductsClient
                key="all-products"
                initialCategories={categories}
                initialBrands={brands}
                initialProducts={products}
                initialTotal={totalProducts}
                activeCategory={null}
            />
        </Suspense>
    );
}

function CatalogLoadingFallback() {
    return (
        <div className="flex-1 container-custom py-4 md:py-6" aria-busy="true">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-16 h-3.5 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                <span className="text-gray-300 dark:text-zinc-700">/</span>
                <div className="w-24 h-3.5 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-2 mb-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 w-28 shrink-0 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200/50 dark:border-white/5 animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/10 p-3 sm:p-4 flex flex-col gap-3">
                        <div className="w-full aspect-square rounded-xl bg-gray-100 dark:bg-zinc-800 overflow-hidden relative">
                            <div className="image-shimmer absolute inset-0" />
                        </div>
                        <div className="w-20 h-3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-full h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-28 h-5 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse mt-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}
