import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";
import { getCatalogInitialData, getCatalogBrands, getBrandBySlug } from "@/lib/catalog";
import { findCategoryByIdentifier } from "@/lib/category-utils";
import { parseCatalogUrlParams, buildCatalogUrl } from "@/lib/catalog-url";
import { SITE_ORIGIN, toAbsoluteImageUrl } from "@/lib/site-config";

import { Metadata } from "next";

export const revalidate = 60; // Revalidate cache every 60 seconds

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const rawParams = await searchParams;
    const parsed = parseCatalogUrlParams(rawParams);
    const canonicalUrl = buildCatalogUrl(parsed, "/products");

    if (parsed.search) {
        const title = `نتائج البحث عن "${parsed.search}" بالجملة | Hawa Distribution - حوا للتوزيع`;
        const description = `تصفح نتائج البحث عن "${parsed.search}" في كتالوج منتجات شركة حوا للتوزيع والتجارة بأسعار الجملة المعتمدة.`;
        return {
            title,
            description,
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title,
                description,
                url: `${SITE_ORIGIN}${canonicalUrl}`,
                siteName: "حوا للتوزيع والتجارة | Hawa Distribution & Trading",
                locale: "ar_SY",
                type: "website",
                images: [
                    {
                        url: `${SITE_ORIGIN}/og-image.jpg`,
                        secureUrl: `${SITE_ORIGIN}/og-image.jpg`,
                        width: 1080,
                        height: 1080,
                        type: "image/jpeg",
                        alt: `Search results for ${parsed.search}`,
                    },
                ],
            },
            twitter: {
                card: "summary",
                title,
                description,
                images: [`${SITE_ORIGIN}/og-image.jpg`],
            },
        };
    }

    if (parsed.brands.length === 1) {
        const brand = await getBrandBySlug(parsed.brands[0]);
        if (brand) {
            const title = `منتجات وكالة ${brand.name} بالجملة | Hawa Distribution - حوا للتوزيع`;
            const description = brand.description || `تصفح كتالوج منتجات وكالة ${brand.name} بأسعار الجملة المعتمدة لدى شركة حوا للتوزيع والتجارة.`;
            const imageUrl = toAbsoluteImageUrl(brand.image);
            return {
                title,
                description,
                alternates: {
                    canonical: canonicalUrl,
                },
                openGraph: {
                    title,
                    description,
                    url: `${SITE_ORIGIN}${canonicalUrl}`,
                    siteName: "حوا للتوزيع والتجارة | Hawa Distribution & Trading",
                    locale: "ar_SY",
                    type: "website",
                    images: [
                        {
                            url: imageUrl,
                            secureUrl: imageUrl.startsWith("https://") ? imageUrl : undefined,
                            width: 1200,
                            height: 630,
                            alt: brand.name,
                        },
                    ],
                },
                twitter: {
                    card: "summary_large_image",
                    title,
                    description,
                    images: [imageUrl],
                },
            };
        }
    }

    return {
        title: "كتالوج المنتجات وعروض الوكالات | Products Catalog - Hawa Distribution",
        description: "تصفح كافة منتجات الوكالات والعلامات التجارية المعتمدة من مواد غذائية ومنظفات بأسعار الجملة لدى شركة حوا للتوزيع والتجارة.",
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: "كتالوج المنتجات وعروض الوكالات | Hawa Distribution - حوا للتوزيع",
            description: "تصفح كافة منتجات الوكالات والعلامات التجارية المعتمدة بأسعار الجملة لدى شركة حوا للتوزيع والتجارة.",
            url: `${SITE_ORIGIN}${canonicalUrl}`,
            siteName: "حوا للتوزيع والتجارة | Hawa Distribution & Trading",
            locale: "ar_SY",
            type: "website",
            images: [
                {
                    url: `${SITE_ORIGIN}/og-image.jpg`,
                    secureUrl: `${SITE_ORIGIN}/og-image.jpg`,
                    width: 1080,
                    height: 1080,
                    type: "image/jpeg",
                    alt: "Hawa Distribution Product Catalog",
                },
            ],
        },
        twitter: {
            card: "summary",
            title: "كتالوج المنتجات وعروض الوكالات | Hawa Distribution - حوا للتوزيع",
            description: "تصفح كافة منتجات الوكالات والعلامات التجارية المعتمدة بأسعار الجملة لدى شركة حوا للتوزيع والتجارة.",
            images: [`${SITE_ORIGIN}/og-image.jpg`],
        },
    };
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const rawParams = await searchParams;
    const parsed = parseCatalogUrlParams(rawParams);

    // If a single category is requested with no other query, redirect to canonical /categories/[slug]
    if (parsed.categories.length === 1 && parsed.brands.length === 0 && !parsed.search) {
        const resolvedCategory = await findCategoryByIdentifier(parsed.categories[0]);
        if (resolvedCategory) {
            redirect(`/categories/${resolvedCategory.slug}`);
        }
    }

    const firstBrandSlug = parsed.brands.length === 1 ? parsed.brands[0] : null;
    const activeBrand = firstBrandSlug ? await getBrandBySlug(firstBrandSlug) : null;

    const [{ categories, products, totalProducts }, brands] = await Promise.all([
        getCatalogInitialData(undefined, activeBrand?.id, undefined, parsed.search),
        getCatalogBrands(),
    ]);

    return (
        <Suspense fallback={<CatalogLoadingFallback />}>
            <ProductsClient
                key={activeBrand ? `brand-${activeBrand.id}` : parsed.search ? `search-${parsed.search}` : "all-products"}
                initialCategories={categories}
                initialBrands={brands}
                initialProducts={products}
                initialTotal={totalProducts}
                activeCategory={null}
                activeBrand={activeBrand}
                initialSearch={parsed.search}
                initialSort={parsed.sort}
                initialPage={parsed.page}
                initialInStock={parsed.inStock}
                initialOnSale={parsed.onSale}
                initialIsTrending={parsed.isTrending}
                initialView={parsed.view}
                initialBrandSlugs={parsed.brands}
                initialCategorySlugs={parsed.categories}
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
