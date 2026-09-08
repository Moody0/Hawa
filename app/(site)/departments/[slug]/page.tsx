import React, { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductsClient from "../../products/ProductsClient";
import { getCatalogInitialData, getCatalogBrands } from "@/lib/catalog";
import { SITE_ORIGIN, toAbsoluteImageUrl } from "@/lib/site-config";

export const revalidate = 60; // Revalidate every 60 seconds

const getDepartment = cache(async (slug: string) => {
    let decodedSlug = slug;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }
    const cleanSlug = decodedSlug.trim();

    return prisma.mainCategory.findFirst({
        where: {
            OR: [
                { slug: cleanSlug },
                { slug },
                { slug: { equals: cleanSlug, mode: "insensitive" } },
                { id: cleanSlug },
                { name: { equals: cleanSlug, mode: "insensitive" } },
            ],
        },
    });
});

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const department = await getDepartment(params.slug);

    if (!department) return { title: "القسم غير موجود | Hawa Distribution" };

    const title = `${department.name} بالجملة | Hawa Distribution - حوا للتوزيع`;
    const description = department.description || `تصفح منتجات قسم ${department.name} بأسعار الجملة المعتمدة لدى شركة حوا للتوزيع والتجارة.`;
    const imageUrl = toAbsoluteImageUrl(department.image);

    return {
        title,
        description,
        alternates: {
            canonical: `/departments/${department.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${SITE_ORIGIN}/departments/${department.slug}`,
            siteName: 'حوا للتوزيع والتجارة | Hawa Distribution & Trading',
            locale: 'ar_SY',
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageUrl.startsWith('https://') ? imageUrl : undefined,
                    width: 1200,
                    height: 630,
                    alt: department.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function DepartmentPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    
    const department = await getDepartment(params.slug);

    if (!department || !department.isActive) {
        notFound();
    }

    const [{ categories, products, totalProducts }, brands] = await Promise.all([
        getCatalogInitialData(undefined, undefined, department.id),
        getCatalogBrands(),
    ]);

    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <ProductsClient
                key={`department-${department.id}`}
                initialCategories={categories}
                initialBrands={brands}
                initialProducts={products}
                initialTotal={totalProducts}
                activeCategory={null}
                activeBrand={null}
                activeMainCategory={{
                    id: department.id,
                    name: department.name,
                    slug: department.slug,
                    description: department.description,
                    image: department.image,
                }}
            />
        </Suspense>
    );
}
