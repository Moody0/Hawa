import React from "react";
import { getSiteSettings } from "@/lib/public-queries";
import ShippingReturnsContent from "./ShippingReturnsContent";
import { Metadata } from "next";
import { getShippingPolicyContent } from "@/lib/shipping-policy-content";

export const revalidate = 60; // 1 minute ISR revalidation

export async function generateMetadata(): Promise<Metadata> {
    const siteSettings = await getSiteSettings();
    const content = getShippingPolicyContent(siteSettings?.shippingPolicyContent, siteSettings);

    const brandName = siteSettings?.footerBrandTitleAr || siteSettings?.footerBrandTitle || "حوا للتوزيع والتجارة";
    const pageTitle = content.ar.heroTitle || "الشحن والتوصيل وسياسة التوريد";
    const pageDesc = content.ar.heroDescription || "تعرف على شروط الشحن والتوريد المباشر لكافة المحافظات والمناطق وسياسة الاستلام المعتمدة لدى شركة حوا للتوزيع والتجارة.";
    const imageUrl = siteSettings?.shippingReturnsImage || "/og-image.jpg";

    return {
        title: `${pageTitle} | ${brandName}`,
        description: pageDesc,
        alternates: {
            canonical: "/shipping-returns",
        },
        openGraph: {
            title: `${pageTitle} | ${brandName}`,
            description: pageDesc,
            url: "/shipping-returns",
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${pageTitle} | ${brandName}`,
            description: pageDesc,
            images: [imageUrl],
        },
    };
}

export default async function ShippingReturnsPage() {
    const siteSettings = await getSiteSettings();
    const content = getShippingPolicyContent(siteSettings?.shippingPolicyContent, siteSettings);

    return (
        <ShippingReturnsContent siteSettings={siteSettings} content={content} />
    );
}
