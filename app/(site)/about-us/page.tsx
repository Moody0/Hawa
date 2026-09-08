import { getSiteSettings } from "@/lib/public-queries";
import AboutUsClient from "./AboutUsClient";
import { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
    title: "من نحن | About Hawa - شركة حوا للتوزيع والتجارة",
    description: "تعرف على شركة حوا للتوزيع والتجارة - المنصة الرائدة لعرض وتوزيع منتجات الوكالات للمحلات والتجار بالجملة. شراكات تجارية موثوقة وشبكة توزيع متكاملة.",
    alternates: {
        canonical: "/about-us",
    },
    openGraph: {
        title: "من نحن | شركة حوا للتوزيع والتجارة",
        description: "تعرف على شركة حوا للتوزيع والتجارة - المنصة الرائدة لتوزيع منتجات الوكالات للمحلات والتجار.",
        url: "/about-us",
        images: [
            {
                url: "/og-image.jpg",
                width: 1080,
                height: 1080,
                alt: "Hawa Distribution - About Us",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "من نحن | شركة حوا للتوزيع والتجارة",
        description: "تعرف على شركة حوا للتوزيع والتجارة - المنصة الرائدة لتوزيع منتجات الوكالات للمحلات والتجار.",
        images: ["/og-image.jpg"],
    },
};

export default async function AboutUsPage() {
    const settings = await getSiteSettings();

    return <AboutUsClient settings={settings} />;
}
