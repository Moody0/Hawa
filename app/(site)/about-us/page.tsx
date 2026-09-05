import { getSiteSettings } from "@/lib/admin-actions";
import AboutUsClient from "./AboutUsClient";
import { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
    title: "من نحن | About Hawa - شركة هوا للتوزيع والتجارة",
    description: "تعرف على شركة هوا للتوزيع والتجارة - المنصة الرائدة لعرض وتوزيع منتجات الوكالات للمحلات والتجار بالجملة. شراكات تجارية موثوقة وشبكة توزيع متكاملة.",
    alternates: {
        canonical: "/about-us",
    },
    openGraph: {
        title: "من نحن | شركة هوا للتوزيع والتجارة",
        description: "تعرف على شركة هوا للتوزيع والتجارة - المنصة الرائدة لتوزيع منتجات الوكالات للمحلات والتجار.",
        url: "/about-us",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "About Hawa Distribution",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "من نحن | شركة هوا للتوزيع والتجارة",
        description: "تعرف على شركة هوا للتوزيع والتجارة - المنصة الرائدة لتوزيع منتجات الوكالات للمحلات والتجار.",
        images: ["/og-image.jpg"],
    },
};

export default async function AboutUsPage() {
    const settings = await getSiteSettings();

    return <AboutUsClient settings={settings} />;
}
