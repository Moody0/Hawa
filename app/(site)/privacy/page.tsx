import React from "react";
import { Metadata } from "next";
import { getSiteSettings } from "@/lib/public-queries";
import { getPrivacyPolicyContent } from "@/lib/privacy-policy-content";
import PrivacyPageContent from "./PrivacyPageContent";

export const revalidate = 60; // 1 minute ISR revalidation

export async function generateMetadata(): Promise<Metadata> {
    const siteSettings = await getSiteSettings();
    const content = getPrivacyPolicyContent(siteSettings?.privacyPolicyContent, siteSettings);

    const brandName = siteSettings?.footerBrandTitleAr || siteSettings?.footerBrandTitle || "حوا للتوزيع والتجارة";
    const pageTitle = content.ar.heroTitle || "سياسة الخصوصية وسرية البيانات";
    const pageDesc =
        content.ar.heroDescription ||
        "تعرف على سياسة الخصوصية وسرية البيانات لدى شركة حوا للتوزيع والتجارة وكيفية حماية بيانات التجار والمنشآت التجارية الشريكة.";

    return {
        title: `${pageTitle} | ${brandName}`,
        description: pageDesc,
        alternates: {
            canonical: "/privacy",
        },
        openGraph: {
            title: `${pageTitle} | ${brandName}`,
            description: pageDesc,
            url: "/privacy",
            images: [
                {
                    url: "/og-image.jpg",
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
            images: ["/og-image.jpg"],
        },
    };
}

export default async function PrivacyPage() {
    const siteSettings = await getSiteSettings();
    const content = getPrivacyPolicyContent(siteSettings?.privacyPolicyContent, siteSettings);

    return (
        <PrivacyPageContent content={content} />
    );
}
