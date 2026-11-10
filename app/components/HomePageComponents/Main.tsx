import Link from 'next/link';
import { getWebsiteContent } from '@/lib/website-content';
import dynamic from 'next/dynamic';
import type { RailBrand } from '@/lib/public-queries';
import FeaturedCollection from './FeaturedCollection';
import TrendingWeekly from './TrendingWeekly';
import FeaturedCategoriesGrid from './FeaturedCategoriesGrid';
import { getI18n } from '@/lib/i18n';
import HeroCarousel from './HeroCarousel';
import CompanyServices from './CompanyServices';
import PartnerPrideBanner from './PartnerPrideBanner';
import { getSiteContacts } from '@/lib/website-content';

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
    imageMobile?: string | null;
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
    brandId?: string;
    isFeatured?: boolean;
    href?: string;
    type?: 'category' | 'main-category';
}

interface MainProps {
    banners: Banner[];
    railBrands: RailBrand[];
    reviews: ReviewItem[];
    featuredNewArrivals: Product[];
    featuredBestSellers: Product[];
    trendingWeekly: Product[];
    featuredCategories: FeaturedCategory[];
    siteSettings?: any;
}

const Main = async ({
    banners,
    railBrands,
    reviews,
    featuredNewArrivals,
    featuredBestSellers,
    trendingWeekly,
    featuredCategories,
    siteSettings,
}: MainProps) => {
    const { dir, language } = await getI18n();

    const content = getWebsiteContent(siteSettings?.websiteContent);
    const ar = language === "ar";
    const siteContacts = getSiteContacts(siteSettings || {});

    return (
        <div className="w-full flex flex-col overflow-x-clip">
            {/* 1. Editorial hero */}
            {content.homeHeroEnabled && banners.length ? <HeroCarousel banners={banners} /> : <header className="container-custom py-14 sm:py-20">
                <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white max-w-3xl">{ar ? content.homeIntroTitleAr : content.homeIntroTitle}</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{ar ? content.homeIntroDescriptionAr : content.homeIntroDescription}</p>
                <Link href="/contact" className="inline-flex mt-6 rounded-lg bg-heading hover:bg-[#16304d] px-6 py-3 text-white font-semibold">{ar ? 'تواصل معنا' : 'Contact us'}</Link>
            </header>}

            {/* 2. Partner distributor callout + agency trust rail */}
            <div className="relative z-20 max-md:-mt-6 max-md:rounded-t-[26px] max-md:pt-1 bg-[#FAF7F0] dark:bg-[#101E32] border-b border-slate-200/80 dark:border-white/10">
                {content.homePrideEnabled !== false && (
                    <PartnerPrideBanner
                        language={language}
                        dir={dir}
                        content={content}
                        salesPhone={siteContacts.phone}
                        managementPhone={siteContacts.managementPhone}
                        whatsappUrl={siteContacts.whatsappUrl}
                    />
                )}
                {content.homeBrandsEnabled && (
                    <AgenciesSlider
                        brands={railBrands}
                        title={ar ? content.homeBrandsTitleAr : content.homeBrandsTitle}
                        subtitle={ar ? content.homeBrandsDescriptionAr : content.homeBrandsDescription}
                    />
                )}
            </div>

            {/* 3. Category discovery */}
            {content.homeCategoriesEnabled && (
                <div className="bg-white dark:bg-[#0B192C] border-b border-slate-200/80 dark:border-white/10">
                    <FeaturedCategoriesGrid
                        categories={featuredCategories}
                        language={language}
                        dir={dir}
                        settings={siteSettings}
                    />
                </div>
            )}

            {/* 4. Best sellers and new arrivals */}
            {content.homeFeaturedEnabled && (
                <div className="bg-[#FAF7F0] dark:bg-[#0E1B2E] border-b border-slate-200/80 dark:border-white/10">
                    <FeaturedCollection
                        newArrivals={featuredNewArrivals}
                        bestSellers={featuredBestSellers}
                        settings={siteSettings}
                    />
                </div>
            )}

            {/* 5. Weekly demand */}
            {siteSettings?.homeTrendingWeeklyEnabled !== false && (
                <div className="bg-white dark:bg-[#0B192C] border-b border-slate-200/80 dark:border-white/10">
                    <TrendingWeekly products={trendingWeekly} settings={siteSettings} />
                </div>
            )}

            {/* 6. Corporate capabilities */}
            <div className="bg-[#FAF7F0] dark:bg-[#101E32] border-b border-slate-200/80 dark:border-white/10">
                <CompanyServices settings={siteSettings} />
            </div>

            {/* 7. Merchant endorsements */}
            {siteSettings?.homeTestimonialsEnabled !== false && (
                <div className="bg-white dark:bg-[#0E1B2E]">
                    <TestimonialsMasonry reviews={reviews} products={featuredBestSellers} settings={siteSettings} />
                </div>
            )}

        </div>
    );
};

export default Main;
