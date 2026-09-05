import { getCatalogBrands } from "@/lib/catalog";
import BrandsClient from "../brands/BrandsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الوكالات المعتمدة والتوزيع الحصري | Authorized Agencies - Hawa Distribution",
    description: "استكشف قائمة كبرى الوكالات والعلامات التجارية الموزعة حصرياً وبأسعار الجملة عبر شركة هوا للتوزيع والتجارة (زوان، الريف، حليبنا، صن بل، سيلفر فيش، بوفالو، روكافيرا، المغربي).",
    alternates: {
        canonical: "/agencies",
    },
    openGraph: {
        title: "الوكالات المعتمدة والتوزيع الحصري | Hawa Distribution - هوا للتوزيع",
        description: "استكشف الوكالات والعلامات التجارية المعتمدة لدى شركة هوا للتوزيع والتجارة.",
        url: "/agencies",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Hawa Distribution Partner Agencies",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "الوكالات المعتمدة والتوزيع الحصري | Hawa Distribution - هوا للتوزيع",
        description: "استكشف الوكالات والعلامات التجارية المعتمدة لدى شركة هوا للتوزيع والتجارة.",
        images: ["/og-image.jpg"],
    },
};

export default async function AgenciesPage() {
    const brands = await getCatalogBrands();

    return <BrandsClient brands={brands} basePath="/agencies" />;
}
