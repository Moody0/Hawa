import React from 'react';
import type { HomeBrand, RailBrand } from '@/lib/admin-actions';
import FeaturedCollection from './FeaturedCollection';
import TrendingWeekly from './TrendingWeekly';
import FeaturedCategoriesGrid from './FeaturedCategoriesGrid';
import TestimonialsMasonry from './TestimonialsMasonry';
import ScrollReveal from '../ScrollReveal';
import { getI18n } from '@/lib/i18n';
import HeroCarousel from './HeroCarousel';
import AgenciesSlider from './AgenciesSlider';

interface Banner {
    id: string;
    title: string | null;
    subtitle: string | null;
    titleAr: string | null;
    subtitleAr: string | null;
    image: string;
    buttonText: string | null;
    link: string | null;
    badge: string | null;
    isActive: boolean;
}

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    options?: string | null;
    price: number;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    category: {
        name: string;
    } | null;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null;
}

import type { HighlightCard } from './CategoryHighlightCards';
import type { ReviewItem } from './TestimonialsMasonry';

interface FeaturedCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    brandId: string;
    isFeatured: boolean;
}

interface MainProps {
    banners: Banner[];
    mainBrands: HomeBrand[];
    railBrands: RailBrand[];
    highlightCards: HighlightCard[];
    reviews: ReviewItem[];
    featuredNewArrivals: Product[];
    featuredBestSellers: Product[];
    trendingWeekly: Product[];
    featuredCategories: FeaturedCategory[];
    settings: any;
}

const Main = async ({
    banners,
    mainBrands,
    railBrands,
    highlightCards,
    reviews,
    featuredNewArrivals,
    featuredBestSellers,
    trendingWeekly,
    featuredCategories,
    settings,
}: MainProps) => {
    const { dir, language } = await getI18n();

    return (
        <div className="w-full flex flex-col gap-y-4 sm:gap-y-6 md:gap-y-8 pb-12">
            {/* 1. Hero Carousel - 100% natural, bright photography with NO dark overlay */}
            <HeroCarousel banners={banners} />

            {/* 2. Authorized Commercial Agencies Rail (Clean, high-density trade marks) */}
            <AgenciesSlider brands={railBrands} />

            {/* 4. Best Sellers & New Arrivals (Product Rails with Carton Specs) */}
            <ScrollReveal>
                <FeaturedCollection
                    newArrivals={featuredNewArrivals}
                    bestSellers={featuredBestSellers}
                />
            </ScrollReveal>

            {/* 5. Key Wholesale Categories */}
            <ScrollReveal>
                <FeaturedCategoriesGrid categories={featuredCategories} language={language} dir={dir} />
            </ScrollReveal>

            {/* 6. Fast-Moving Weekly Demand */}
            <ScrollReveal>
                <TrendingWeekly products={trendingWeekly} />
            </ScrollReveal>

            {/* 7. Merchant Endorsements & Store Reviews */}
            <ScrollReveal>
                <TestimonialsMasonry reviews={reviews} products={featuredBestSellers} />
            </ScrollReveal>
        </div>
    );
};

export default Main;
