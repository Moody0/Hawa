'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductsPageComponents/ProductCard';

import { useLanguage } from '@/app/context/LanguageContext';
import { useProductRail } from './useProductRail';

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
    isTrending: boolean;
    stock: number;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
    hidePrice?: boolean;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null;
}

interface TabData {
    key: string;
    labelKey: string;
    products: Product[];
}

interface FeaturedCollectionProps {
    newArrivals: Product[];
    bundles?: Product[];
    bestSellers: Product[];
}

const FALLBACK_NEW_ARRIVALS: Product[] = [
    {
        id: 'na-1',
        slug: 'buffalo-avocado-lavender-hand-wash-1500ml',
        name: 'بوفالو صابون سائل يدين باللافندر والأفوكادو 1500 مل',
        nameAr: 'بوفالو صابون سائل يدين باللافندر والأفوكادو 1500 مل',
        nameEn: 'Buffalo Avocado & Lavender Hand Wash Liquid 1500ml',
        description: 'صابون سائل فاخر لليدين مع مرطبات طبيعية',
        descriptionAr: 'صابون سائل فاخر لليدين مع مرطبات طبيعية',
        descriptionEn: 'Luxury liquid hand wash with natural moisturizers',
        price: 0,
        images: '/uploads/products/img-16af596fcf.webp',
        categoryId: 'detergents',
        isTrending: true,
        stock: 120,
        packaging: 'كرتونة',
        itemsPerPackage: '12 عبوة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-buffalo', name: 'بوفالو - Buffalo', slug: 'buffalo' }
    },
    {
        id: 'na-2',
        slug: 'rocavira-mens-refreshing-deodorant-50ml',
        name: 'روكافيرا مزيل عرق رجالي منعش 50 مل',
        nameAr: 'روكافيرا مزيل عرق رجالي منعش 50 مل',
        nameEn: "Rocavira Men's Refreshing Deodorant 50ml",
        description: 'حماية فائقة وانتعاش يدوم 48 ساعة',
        descriptionAr: 'حماية فائقة وانتعاش يدوم 48 ساعة',
        descriptionEn: '48h fresh active protection',
        price: 0,
        images: '/uploads/products/img-0857c4df14.webp',
        categoryId: 'personal-care',
        isTrending: true,
        stock: 200,
        packaging: 'كرتونة',
        itemsPerPackage: '24 عبوة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-rocavira', name: 'روكافيرا - Rocavira', slug: 'rocavira' }
    },
    {
        id: 'na-3',
        slug: 'rocavira-classic-mens-deodorant-50ml',
        name: 'روكافيرا مزيل عرق رجالي كلاسيك 50 مل',
        nameAr: 'روكافيرا مزيل عرق رجالي كلاسيك 50 مل',
        nameEn: "Rocavira Classic Men's Deodorant 50ml",
        description: 'تركيبة كلاسيكية مقاومة للتعرق',
        descriptionAr: 'تركيبة كلاسيكية مقاومة للتعرق',
        descriptionEn: 'Classic antiperspirant formula',
        price: 0,
        images: '/uploads/products/img-11a557fe47.webp',
        categoryId: 'personal-care',
        isTrending: true,
        stock: 180,
        packaging: 'كرتونة',
        itemsPerPackage: '24 عبوة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-rocavira', name: 'روكافيرا - Rocavira', slug: 'rocavira' }
    },
    {
        id: 'na-4',
        slug: 'rocavira-smooth-deodorant-pink-50ml',
        name: 'روكافيرا مزيل عرق نسائي ناعم 50 مل',
        nameAr: 'روكافيرا مزيل عرق نسائي ناعم 50 مل',
        nameEn: 'Rocavira Smooth Deodorant, Pink, 50ml',
        description: 'حماية ناعمة ومنعشة للبشرة الحساسة',
        descriptionAr: 'حماية ناعمة ومنعشة للبشرة الحساسة',
        descriptionEn: 'Smooth gentle care for sensitive skin',
        price: 0,
        images: '/uploads/products/img-10c1fba318.webp',
        categoryId: 'personal-care',
        isTrending: true,
        stock: 150,
        packaging: 'كرتونة',
        itemsPerPackage: '24 عبوة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-rocavira', name: 'روكافيرا - Rocavira', slug: 'rocavira' }
    },
    {
        id: 'na-5',
        slug: 'rocavira-refreshing-deodorant-blue-50ml',
        name: 'روكافيرا مزيل عرق منعش أزرق 50 مل',
        nameAr: 'روكافيرا مزيل عرق منعش أزرق 50 مل',
        nameEn: 'Rocavira Refreshing Deodorant, Blue, 50ml',
        description: 'انتعاش يدوم طوال اليوم',
        descriptionAr: 'انتعاش يدوم طوال اليوم',
        descriptionEn: 'All-day freshness and protection',
        price: 0,
        images: '/uploads/products/img-0c501252d6.webp',
        categoryId: 'personal-care',
        isTrending: true,
        stock: 160,
        packaging: 'كرتونة',
        itemsPerPackage: '24 عبوة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-rocavira', name: 'روكافيرا - Rocavira', slug: 'rocavira' }
    }
];

const FALLBACK_BEST_SELLERS: Product[] = [
    {
        id: 'bs-1',
        slug: 'zwan-chicken-luncheon-meat-200g',
        name: 'زوان لانشون دجاج فاخر 200 غرام',
        nameAr: 'زوان لانشون دجاج فاخر 200 غرام',
        nameEn: 'Zwan Chicken Luncheon Meat 200g',
        description: 'لحم لانشون دجاج هولندي فاخر عالي الجودة',
        descriptionAr: 'لحم لانشون دجاج هولندي فاخر عالي الجودة',
        descriptionEn: 'Premium Dutch chicken luncheon meat',
        price: 0,
        images: '/uploads/categories/cat-328006c06c.webp',
        categoryId: 'canned-meat',
        isTrending: true,
        stock: 500,
        packaging: 'صندوق',
        itemsPerPackage: '24 علبة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-zwan', name: 'زوان - Zwan', slug: 'zwan' }
    },
    {
        id: 'bs-2',
        slug: 'alreef-sunflower-oil-1l',
        name: 'زيت دوار الشمس الريف نقي 1 ليتر',
        nameAr: 'زيت دوار الشمس الريف نقي 1 ليتر',
        nameEn: 'Al Reef Sunflower Oil 1L',
        description: 'زيت دوار شمس مكرر نقي عالي الجودة للطهي والقلي',
        descriptionAr: 'زيت دوار شمس مكرر نقي عالي الجودة للطهي والقلي',
        descriptionEn: 'Pure refined sunflower oil for cooking and frying',
        price: 0,
        images: '/uploads/categories/cat-c4b2e6c6c2.webp',
        categoryId: 'oils',
        isTrending: true,
        stock: 350,
        packaging: 'صندوق',
        itemsPerPackage: '12 لتر',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-alreef', name: 'الريف - Alreef', slug: 'alreef' }
    },
    {
        id: 'bs-3',
        slug: 'halibuna-pure-ghee-800g',
        name: 'سمنة بقرية نقية حليبنا 800 غرام',
        nameAr: 'سمنة بقرية نقية حليبنا 800 غرام',
        nameEn: 'Halibuna Pure Cow Ghee 800g',
        description: 'سمنة بقرية طبيعية 100% بنكهة أصيلة',
        descriptionAr: 'سمنة بقرية طبيعية 100% بنكهة أصيلة',
        descriptionEn: '100% Pure natural cow ghee',
        price: 0,
        images: '/uploads/categories/cat-c4b2e6c6c2.webp',
        categoryId: 'dairy-ghee',
        isTrending: true,
        stock: 220,
        packaging: 'كرتونة',
        itemsPerPackage: '12 عبوة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-haleebna', name: 'حليبنا - Haleebna', slug: 'haleebna' }
    },
    {
        id: 'bs-4',
        slug: 'silver-fish-light-tuna-160g',
        name: 'سيلفر فيش تونة خفيفة بالزيت النباتي 160 غرام',
        nameAr: 'سيلفر فيش تونة خفيفة بالزيت النباتي 160 غرام',
        nameEn: 'Silver Fish Light Tuna in Vegetable Oil 160g',
        description: 'تونة خفيفة ممتازة معبأة بأجود أنواع الزيت النباتي',
        descriptionAr: 'تونة خفيفة ممتازة معبأة بأجود أنواع الزيت النباتي',
        descriptionEn: 'Premium light tuna chunks in vegetable oil',
        price: 0,
        images: '/uploads/categories/cat-f10c952ab5.webp',
        categoryId: 'canned-fish',
        isTrending: true,
        stock: 400,
        packaging: 'صندوق',
        itemsPerPackage: '48 علبة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-silver-fish', name: 'سيلفر فيش - Silver Fish', slug: 'silver-fish' }
    },
    {
        id: 'bs-5',
        slug: 'zwan-chicken-hot-dog-400g',
        name: 'زوان نقانق دجاج هوت دوغ 400 غرام',
        nameAr: 'زوان نقانق دجاج هوت دوغ 400 غرام',
        nameEn: 'Zwan Chicken Hot Dog Sausage 400g',
        description: 'نقانق هوت دوغ هولندية شهية وسريعة التحضير',
        descriptionAr: 'نقانق هوت دوغ هولندية شهية وسريعة التحضير',
        descriptionEn: 'Delicious Dutch chicken hot dog sausages',
        price: 0,
        images: '/uploads/categories/cat-328006c06c.webp',
        categoryId: 'canned-meat',
        isTrending: true,
        stock: 300,
        packaging: 'صندوق',
        itemsPerPackage: '24 علبة',
        minOrder: 1,
        hidePrice: true,
        brand: { id: 'b-zwan', name: 'زوان - Zwan', slug: 'zwan' }
    }
];

const FeaturedCollection = ({ newArrivals = [], bundles: _bundles = [], bestSellers = [] }: FeaturedCollectionProps) => {
    const { t, dir } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);
    const isArabic = dir === 'rtl';

    const safeNewArrivals = (newArrivals && newArrivals.length > 0) ? newArrivals : FALLBACK_NEW_ARRIVALS;
    const safeBestSellers = (bestSellers && bestSellers.length > 0) ? bestSellers : FALLBACK_BEST_SELLERS;

    const { railRef, progressBarRef, canScrollForward, canScrollBackward, scrollForward, scrollBackward } = useProductRail(dir);

    const tabs: TabData[] = useMemo(() => [
        { key: 'best-sellers', labelKey: 'home.featuredTabBestSellers', products: safeBestSellers },
        { key: 'new-arrivals', labelKey: 'home.featuredTabNewArrivals', products: safeNewArrivals },
    ], [safeBestSellers, safeNewArrivals]);

    const activeProducts = tabs[activeTab]?.products || [];
    const isNewArrivalTab = tabs[activeTab]?.key === 'new-arrivals';

    React.useEffect(() => {
        if (railRef.current) {
            railRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
        }
    }, [activeTab, railRef]);

    return (
        <section className="container-custom py-12 md:py-16">
            {/* Editorial heading and product-view tabs */}
            <div className="text-start mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-[#8A6305] dark:text-[#E5B54A] mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {isArabic ? 'مختارات حوا' : 'Hawa selections'}
                </span>
                <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight max-w-3xl" data-reveal-heading>
                        {t('home.featuredCollectionSubtitle') || (isArabic ? 'المواد الغذائية والتموينية الأكثر طلباً' : 'Featured Wholesale Products')}
                    </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-2 mb-4" data-reveal-copy>
                    {isArabic
                        ? 'تشكيلة مختارة من أفضل أصناف الوكالات المعتمدة بأسعار الجملة المباشرة'
                        : 'Curated wholesale selection of leading brand goods at direct trade prices'}
                </p>

                {/* Segmented tabs retain the existing local Framer Motion transition */}
                <div
                    role="tablist"
                    className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-2xs relative"
                >
                    {tabs.map((tab, index) => {
                        const isActive = activeTab === index;
                        return (
                            <button
                                key={tab.key}
                                role="tab"
                                type="button"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(index)}
                                className={`relative px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors duration-150 cursor-pointer z-10 select-none ${
                                    isActive
                                        ? 'text-[#0B192C] dark:text-white font-black'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="featuredActivePill"
                                        transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                                        className="absolute inset-0 bg-white dark:bg-[#0B192C] rounded-lg shadow-xs -z-10"
                                    />
                                )}
                                <span className="relative z-10">{t(tab.labelKey)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product Rail with Left & Right Side Navigation Buttons */}
            <div className="relative group/rail">
                {/* Previous Button (Left/Right depending on RTL) */}
                <button
                    type="button"
                    onClick={scrollBackward}
                    disabled={!canScrollBackward}
                    className="absolute -start-3 sm:-start-4 md:-start-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/15 shadow-md flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:border-[#8A6305] dark:hover:text-[#8A6305] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                    aria-label={isArabic ? 'المنتجات السابقة' : 'Previous products'}
                >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isArabic ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 16.25L6.25 10L12.5 3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Next Button (Left/Right depending on RTL) */}
                <button
                    type="button"
                    onClick={scrollForward}
                    disabled={!canScrollForward}
                    className="absolute -end-3 sm:-end-4 md:-end-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/15 shadow-md flex items-center justify-center text-[#0B192C] dark:text-white hover:border-[#8A6305] hover:text-[#8A6305] dark:hover:border-[#8A6305] dark:hover:text-[#8A6305] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                    aria-label={isArabic ? 'المنتجات التالية' : 'Next products'}
                >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isArabic ? '-scale-x-100' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 3.75L13.75 10L7.5 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Scrollable Rail */}
                <div
                    ref={railRef}
                    className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0 scroll-smooth"
                >
                    <motion.div
                        key={tabs[activeTab]?.key}
                        initial={{ opacity: 0.35 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex snap-x snap-mandatory gap-3 sm:gap-4 pb-2"
                    >
                        {activeProducts.map((product) => (
                            <div
                                key={product.id}
                                data-reveal-item
                                className="w-[195px] sm:w-[220px] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] flex-none snap-start"
                            >
                                <ProductCard
                                    product={product}
                                    variant="compact"
                                    showBadge={isNewArrivalTab}
                                    badge={isNewArrivalTab ? t('home.newArrival') : undefined}
                                />
                            </div>
                        ))}
                        <div className="w-[1px] shrink-0 sm:hidden" />
                    </motion.div>
                </div>

                {/* Minimal Progress Line */}
                <div className="mt-2 h-0.5 bg-slate-100 dark:bg-white/5 relative overflow-hidden rounded-full w-full">
                    <div
                        ref={progressBarRef}
                        className="absolute top-0 bottom-0 bg-[#8A6305] dark:bg-[#E5B54A] rounded-full transition-transform duration-150"
                        style={{
                            width: '100%',
                            transformOrigin: isArabic ? 'right' : 'left',
                            transform: 'scaleX(0)',
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
