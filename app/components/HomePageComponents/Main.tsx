import dynamic from 'next/dynamic';
import type { RailBrand } from '@/lib/public-queries';
import FeaturedCollection from './FeaturedCollection';
import TrendingWeekly from './TrendingWeekly';
import FeaturedCategoriesGrid from './FeaturedCategoriesGrid';
import ScrollReveal from '../ScrollReveal';
import { getI18n } from '@/lib/i18n';
import HeroCarousel from './HeroCarousel';
import CompanyServices from './CompanyServices';

const AgenciesSlider = dynamic(() => import('./AgenciesSlider'), {
    loading: () => <div className="min-h-[140px]" />,
});
const TestimonialsMasonry = dynamic(() => import('./TestimonialsMasonry'), {
    loading: () => <div className="min-h-[400px]" />,
});

interface Banner {
    id: string;
    title: string | null;
    subtitle: string | null;
    titleAr: string | null;
    subtitleAr: string | null;
    image: string;
    buttonText: string | null;
    buttonTextAr?: string | null;
    link: string | null;
    badge: string | null;
    badgeAr?: string | null;
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
    price: number | null;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    category?: {
        name: string;
    } | null | any;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null | any;
    [key: string]: any;
}

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
    railBrands: RailBrand[];
    reviews: ReviewItem[];
    featuredNewArrivals: Product[];
    featuredBestSellers: Product[];
    trendingWeekly: Product[];
    featuredCategories: FeaturedCategory[];
}

const Main = async ({
    banners,
    railBrands,
    reviews,
    featuredNewArrivals,
    featuredBestSellers,
    trendingWeekly,
    featuredCategories,
}: MainProps) => {
    const { dir, language } = await getI18n();

    return (
        <div className="w-full flex flex-col overflow-x-clip">
            {/* 1. Editorial hero */}
            <HeroCarousel banners={banners} />

            {/* 2. Compact agency trust rail */}
            <ScrollReveal
                className="bg-[#FAF7F0] dark:bg-[#101E32]"
                variant="subtle"
            >
                <AgenciesSlider brands={railBrands} />
            </ScrollReveal>

            {/* 3–4. Category discovery followed by commercial proof */}
            <ScrollReveal
                className="bg-white dark:bg-[#0B192C]"
            >
                <FeaturedCategoriesGrid categories={featuredCategories} language={language} dir={dir} />
            </ScrollReveal>

            {/* 5. Best sellers and new arrivals; product cards remain unchanged */}
            <ScrollReveal
                className="bg-slate-50/70 dark:bg-[#0E1B2E]"
            >
                <FeaturedCollection
                    newArrivals={featuredNewArrivals}
                    bestSellers={featuredBestSellers}
                />
            </ScrollReveal>

            {/* 6. Weekly demand; product card design remains unchanged */}
            <ScrollReveal
                className="bg-white dark:bg-[#0B192C]"
            >
                <TrendingWeekly products={trendingWeekly} />
            </ScrollReveal>

            {/* 8. Corporate capabilities */}
            <ScrollReveal
                className="bg-[#FAF7F0] dark:bg-[#101E32]"
            >
                <CompanyServices />
            </ScrollReveal>

            {/* 9. Merchant endorsements */}
            <ScrollReveal
                className="bg-slate-50 dark:bg-[#0E1B2E]"
            >
                <TestimonialsMasonry reviews={reviews} products={featuredBestSellers} />
            </ScrollReveal>
        </div>
    );
};

export default Main;
