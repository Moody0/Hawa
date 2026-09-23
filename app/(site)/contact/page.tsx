import React from "react";
import { Metadata } from "next";
import { getSiteSettings } from "@/lib/public-queries";
import { getContactPageContent } from "@/lib/contact-page-content";
import ContactPageContent from "./ContactPageContent";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "تواصل معنا | Contact Us - Hawa Distribution & Trading",
    description: "تواصل مع فريق شركة حوا للتوزيع والتجارة لطلبيات الجملة، الشراكات التجارية، وجدولة تسليم البضائع لكافة المحافظات السورية.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "تواصل معنا | Hawa Distribution - حوا للتوزيع والتجارة",
        description: "تواصل مع فريق شركة حوا للتوزيع والتجارة لطلبيات الجملة، الشراكات التجارية، وجدولة تسليم البضائع لكافة المحافظات السورية.",
        url: "/contact",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Hawa Distribution Contact Us",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "تواصل معنا | Hawa Distribution - حوا للتوزيع والتجارة",
        description: "تواصل مع فريق شركة حوا للتوزيع والتجارة لطلبيات الجملة، الشراكات التجارية، وجدولة تسليم البضائع لكافة المحافظات السورية.",
        images: ["/og-image.jpg"],
    },
};

export default async function ContactPage() {
    const siteSettings = await getSiteSettings();
    const content = getContactPageContent(siteSettings?.contactPageContent, siteSettings);

    return (
        <ContactPageContent siteSettings={siteSettings} content={content} />
    );
}
