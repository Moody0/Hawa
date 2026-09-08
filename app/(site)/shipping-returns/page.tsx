import React from "react";
import { getSiteSettings } from "@/lib/public-queries";
import ShippingReturnsContent from "./ShippingReturnsContent";
import { Metadata } from "next";

export const revalidate = 60; // 1 minute ISR revalidation

export const metadata: Metadata = {
    title: "الشحن والتوصيل وسياسة التوريد | Shipping & Delivery Terms - Hawa Distribution",
    description: "تعرف على شروط الشحن والتوريد المباشر لكافة المحافظات والمناطق وسياسة الاستلام المعتمدة لدى شركة حوا للتوزيع والتجارة.",
    alternates: {
        canonical: "/shipping-returns",
    },
    openGraph: {
        title: "الشحن والتوصيل وسياسة التوريد | Hawa Distribution - حوا للتوزيع",
        description: "تعرف على شروط الشحن والتوريد المباشر وسياسة الاستلام المعتمدة لدى شركة حوا للتوزيع والتجارة.",
        url: "/shipping-returns",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Hawa Distribution Shipping & Delivery",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "الشحن والتوصيل وسياسة التوريد | Hawa Distribution - حوا للتوزيع",
        description: "تعرف على شروط الشحن والتوريد المباشر وسياسة الاستلام المعتمدة لدى شركة حوا للتوزيع والتجارة.",
        images: ["/og-image.jpg"],
    },
};

export default async function ShippingReturnsPage() {
    const siteSettings = await getSiteSettings();

    return (
        <ShippingReturnsContent siteSettings={siteSettings} />
    );
}
