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

export const revalidate = 60; // Cache for 60s ISR

export const metadata: Metadata = {
    title: "شركة حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد",
    description: "شركة حوا للتوزيع والتجارة - كل منتجات وكالاتك… بطلب واحد. المنصة الرائدة لتوريد كبرى الوكالات والعلامات التجارية للمحلات والسوبرماركت بالجملة (زوان، الريف، حليبنا، صن بل، سيلفر فيش، بوفالو، روكافيرا، المغربي). طلب مباشر عبر واتساب.",
    openGraph: {
        title: "شركة حوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد",
        description: "كل منتجات وكالاتك بطلب واحد - توريد جملة مباشر لمحلات البقالة والتجزئة عبر واتساب.",
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
