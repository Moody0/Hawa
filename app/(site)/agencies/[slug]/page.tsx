import { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandShowcaseClient from "@/app/components/BrandPageComponents/BrandShowcaseClient";
import { getBrandBySlug, getCatalogInitialData } from "@/lib/catalog";

export const revalidate = 60; // Revalidate cache every 60 seconds

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const params = await props.params;
    const brand = await getBrandBySlug(params.slug);

    if (!brand) {
        return {
            title: "الوكالة غير موجودة | Hawa Distribution",
        };
    }

    const title = `وكالة ${brand.name} بالجملة | Hawa Distribution - هوا للتوزيع`;
    const description = brand.description || `تصفح كتالوج منتجات وكالة ${brand.name} بأسعار الجملة المعتمدة لدى شركة هوا للتوزيع والتجارة.`;
    const image = brand.image || '/og-image.jpg';

    return {
        title,
        description,
        alternates: {
            canonical: `/agencies/${brand.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `/agencies/${brand.slug}`,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: brand.name,
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

export default async function AgencyDetailPage(
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    const brand = await getBrandBySlug(params.slug);

    if (!brand) {
        notFound();
    }

    const { categories, products, totalProducts } = await getCatalogInitialData(undefined, brand.id);

    return (
        <BrandShowcaseClient
            key={brand.slug}
            brand={brand}
            categories={categories}
            initialProducts={products}
            initialTotal={totalProducts}
            basePath="/agencies"
        />
    );
}
