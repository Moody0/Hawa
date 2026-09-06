import type { Metadata } from "next";
import Main from "../components/HomePageComponents/Main";
import {
    getActiveBanners,
    getMainCategoryBrands,
    getHomeRailBrands,
    getCategoryHighlightCardsData,
    getApprovedReviews,
    getBestSellerProducts,
    getNewArrivalProducts,
    getSiteSettings,
    getTrendingWeeklyProducts,
    getFeaturedCategories,
} from "../../lib/admin-actions";

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
        mainBrands,
        railBrands,
        highlightCards,
        reviews,
        featuredBestSellers,
        featuredNewArrivals,
        settings,
        trendingWeekly,
        featuredCategories,
    ] = await Promise.all([
        getActiveBanners(),
        getMainCategoryBrands(),
        getHomeRailBrands(),
        getCategoryHighlightCardsData(),
        getApprovedReviews(),
        getBestSellerProducts(),
        getNewArrivalProducts(),
        getSiteSettings(),
        getTrendingWeeklyProducts(),
        getFeaturedCategories(),
    ]);

    const firstBannerImage = banners?.[0]?.image;

    return (
        <>
            {firstBannerImage && (
                <link rel="preload" as="image" href={firstBannerImage} fetchPriority="high" />
            )}
            <section>
                <Main
                    banners={banners}
                    mainBrands={mainBrands}
                    railBrands={railBrands}
                    highlightCards={highlightCards}
                    reviews={reviews}
                    featuredNewArrivals={featuredNewArrivals}
                    featuredBestSellers={featuredBestSellers}
                    settings={settings}
                    trendingWeekly={trendingWeekly}
                    featuredCategories={featuredCategories}
                />
            </section>
        </>
    );
}
