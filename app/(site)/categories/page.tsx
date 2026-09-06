import React from "react";
import CategoriesContent from "./CategoriesContent";
import { getSiteSettings } from "@/lib/admin-actions";
import { getCatalogCategories } from "@/lib/catalog";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
    title: "فئات وأقسام المنتجات والوكالات | Categories - Hawa Distribution",
    description: "استعرض كافة فئات المنتجات الغذائية والاستهلاكية والمنظفات بالجملة: معلبات، سمن وزيت، بقوليات، عناية شخصية، ومنظفات ومطهرات معتمدة لدى شركة حوا للتوزيع والتجارة.",
    alternates: {
        canonical: "/categories",
    },
    openGraph: {
        title: "فئات وأقسام المنتجات | Hawa Distribution - حوا للتوزيع",
        description: "استعرض كافة فئات المواد الغذائية والاستهلاكية والمنظفات بالجملة لدى شركة حوا للتوزيع والتجارة.",
        url: "/categories",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Hawa Distribution Categories",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "فئات وأقسام المنتجات | Hawa Distribution - حوا للتوزيع",
        description: "استعرض كافة فئات المواد الغذائية والاستهلاكية والمنظفات بالجملة لدى شركة حوا للتوزيع والتجارة.",
        images: ["/og-image.jpg"],
    },
};

async function getAllCategories() {
    try {
        return await getCatalogCategories();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export default async function CategoriesPage() {
    const [categories, siteSettings] = await Promise.all([
        getAllCategories(),
        getSiteSettings()
    ]);

    return (
        <CategoriesContent categories={categories} siteSettings={siteSettings} />
    );
}
