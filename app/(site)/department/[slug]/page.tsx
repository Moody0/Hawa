import React, { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductsClient from "../../products/ProductsClient";
import { getCatalogInitialData, getCatalogBrands } from "@/lib/catalog";

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

    const title = `${department.name} | Hawa Distribution - حوا للتوزيع`;
    const description = department.description || `تصفح منتجات قسم ${department.name} بأسعار الجملة المعتمدة لدى شركة حوا للتوزيع والتجارة.`;
    const image = department.image || '/og-image.jpg';

    return {
        title,
        description,
        alternates: {
            canonical: `/department/${department.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `/department/${department.slug}`,
            images: [
                {
                    url: image,
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
            images: [image],
        },
    };
}

export default async function DepartmentPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    
    // 1. Fetch the main category (department)
    const department = await getDepartment(params.slug);

    if (!department || !department.isActive) {
        notFound();
    }

    // 2. Fetch the catalog data and brands specifically for this department
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

