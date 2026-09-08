import type { Metadata } from "next";
import Main from "../components/HomePageComponents/Main";
import {
    getActiveBanners,
    getHomeRailBrands,
    getApprovedReviews,
    getBestSellerProducts,
    getNewArrivalProducts,
    getTrendingWeeklyProducts,
    getFeaturedCategories,
} from "../../lib/public-queries";

import { SITE_ORIGIN } from "@/lib/site-config";

export const revalidate = 60; // Cache for 60s ISR

export const metadata: Metadata = {
    title: "شركة حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد",
    description: "شركة حوا للتوزيع والتجارة - كل منتجات وكالاتك… بطلب واحد. المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة (زوان، الريف، حليبنا، صن بل، سيلفر فيش، بوفالو، روكافيرا، المغربي). طلب مباشر عبر واتساب.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد",
        description: "المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة. توريد مباشر وطلب فوري عبر واتساب.",
        url: SITE_ORIGIN,
        siteName: "حوا للتوزيع والتجارة | Hawa Distribution & Trading",
        locale: "ar_SY",
        type: "website",
        images: [
            {
                url: `${SITE_ORIGIN}/og-image.jpg`,
                secureUrl: `${SITE_ORIGIN}/og-image.jpg`,
                width: 1080,
                height: 1080,
                type: "image/jpeg",
                alt: "حوا للتوزيع والتجارة | Hawa Distribution & Trading",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد",
        description: "المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة. توريد مباشر وطلب فوري عبر واتساب.",
        images: [`${SITE_ORIGIN}/og-image.jpg`],
    },
};

export default async function Home() {
    const [
        banners,
        railBrands,
        reviews,
        featuredBestSellers,
        featuredNewArrivals,
        trendingWeekly,
        featuredCategories,
    ] = await Promise.all([
        getActiveBanners(),
        getHomeRailBrands(),
        getApprovedReviews(),
        getBestSellerProducts(),
        getNewArrivalProducts(),
        getTrendingWeeklyProducts(),
        getFeaturedCategories(),
    ]);

    return (
        <section>
            <Main
                banners={banners}
                railBrands={railBrands}
                reviews={reviews}
                featuredNewArrivals={featuredNewArrivals}
                featuredBestSellers={featuredBestSellers}
                trendingWeekly={trendingWeekly}
                featuredCategories={featuredCategories}
            />
        </section>
    );
}
