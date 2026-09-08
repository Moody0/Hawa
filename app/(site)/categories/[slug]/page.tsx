import { Metadata } from "next";
import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import ProductsClient from "../../products/ProductsClient";
import { getCatalogInitialData, getCategoryBySlug, getCatalogBrands } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Revalidate cache every 60 seconds

async function getMainCategory(slug: string) {
    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }
    const cleanSlug = decodedSlug.trim();

    try {
        return await prisma.mainCategory.findFirst({
            where: {
                isActive: true,
                OR: [
                    { slug: cleanSlug },
                    { slug },
                    { slug: { equals: cleanSlug, mode: "insensitive" } },
                    { id: cleanSlug },
                    { name: { equals: cleanSlug, mode: "insensitive" } },
                ],
            },
        });
    } catch (e) {
        console.error("Error fetching main category in CategoryPage:", e);
        return null;
    }
}

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const params = await props.params;
    const category = await getCategoryBySlug(params.slug);

    if (category) {
        const title = `${category.name} | Hawa Distribution - حوا للتوزيع`;
        const description = category.description 
            ? `${category.name} (${category.description}). تسوق منتجات القسم بأسعار الجملة المعتمدة لدى شركة حوا للتوزيع والتجارة.`
            : `تصفح تشكيلة ${category.name} بأسعار الجملة المعتمدة لدى شركة حوا للتوزيع والتجارة.`;
        const image = category.image || '/og-image.jpg';

        return {
            title,
            description,
            alternates: {
                canonical: `/categories/${category.slug}`,
            },
            openGraph: {
                title,
                description,
                type: 'website',
                url: `/categories/${category.slug}`,
                images: [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: category.name,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [image],
            },
        };
    }

    const mainCategory = await getMainCategory(params.slug);
    if (mainCategory) {
        const title = `${mainCategory.name} بالجملة | Hawa Distribution - حوا للتوزيع`;
        const description = mainCategory.description || `تصفح منتجات قسم ${mainCategory.name} بأسعار الجملة المعتمدة لدى شركة حوا للتوزيع والتجارة.`;
        const image = mainCategory.image || '/og-image.jpg';

        return {
            title,
            description,
            alternates: {
                canonical: `/categories/${mainCategory.slug}`,
            },
            openGraph: {
                title,
                description,
                type: 'website',
                url: `/categories/${mainCategory.slug}`,
                images: [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: mainCategory.name,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [image],
            },
        };
    }

    return {
        title: "قسم غير موجود | Hawa Distribution",
    };
}

export default async function CategoryPage(
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    const activeCategory = await getCategoryBySlug(params.slug);

    if (activeCategory) {
        // Keep old category URLs working while using one canonical catalog
        // route. Rendering the client catalog directly here used to create a
        // URL-sync/fetch feedback loop on legacy links.
        redirect(`/products?category=${encodeURIComponent(activeCategory.slug)}`);
    }

    const mainCategory = await getMainCategory(params.slug);
    if (mainCategory) {
        const [{ categories, products, totalProducts }, brands] = await Promise.all([
            getCatalogInitialData(undefined, undefined, mainCategory.id),
            getCatalogBrands(),
        ]);

        return (
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                <ProductsClient
                    key={`department-${mainCategory.id}`}
                    initialCategories={categories}
                    initialBrands={brands}
                    initialProducts={products}
                    initialTotal={totalProducts}
                    activeCategory={null}
                    activeBrand={null}
                    activeMainCategory={{
                        id: mainCategory.id,
                        name: mainCategory.name,
                        slug: mainCategory.slug,
                        description: mainCategory.description,
                        image: mainCategory.image,
                    }}
                />
            </Suspense>
        );
    }

    notFound();
}
