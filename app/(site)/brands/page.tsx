import { getCatalogBrands } from "@/lib/catalog";
import BrandsClient from "./BrandsClient";

export const metadata = {
    title: "وكالاتنا والعلامات التجارية المعتمدة | Partner Brands - Hawa Distribution",
    description: "استكشف قائمة الوكالات والعلامات التجارية الموزعة حصرياً وبأسعار الجملة عبر شركة هوا للتوزيع والتجارة (زوان، الريف، حليبنا، صن بل، سيلفر فيش، بوفالو، روكافيرا، المغربي).",
    alternates: {
        canonical: "/brands",
    },
    openGraph: {
        title: "وكالاتنا والعلامات التجارية المعتمدة | Hawa Distribution - هوا للتوزيع",
        description: "استكشف الوكالات والعلامات التجارية المعتمدة لدى شركة هوا للتوزيع والتجارة.",
        url: "/brands",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Hawa Distribution Partner Brands",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "وكالاتنا والعلامات التجارية المعتمدة | Hawa Distribution - هوا للتوزيع",
        description: "استكشف الوكالات والعلامات التجارية المعتمدة لدى شركة هوا للتوزيع والتجارة.",
        images: ["/og-image.jpg"],
    },
};

export default async function BrandsPage() {
    const brands = await getCatalogBrands();

    return <BrandsClient brands={brands} />;
}
