'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import ResilientImage from '@/app/components/ResilientImage';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    price: number | null;
    discountPrice?: number | null;
    images: string;
    categoryId: string;
    stock: number;
    isTrending: boolean;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null;
}

interface TrendingWeeklyProps {
    products: Product[];
}

const FALLBACK_TRENDING_PRODUCTS: Product[] = [
    {
        id: 'tw-1',
        slug: 'alreef-sunflower-oil-1l',
        name: 'الريف زيت دوار الشمس حجم 1 لتر',
        nameAr: 'الريف زيت دوار الشمس حجم 1 لتر',
        nameEn: 'Al Reef Sunflower Oil, 1 Liter',
        description: 'زيت نباتي نقي مكرر عالي الجودة للطبخ والقلي',
        price: 0,
        images: 'https://i.postimg.cc/gjtXJT65/nskht-mn-nskht-mn-dwn-ʿnwan-2026-08-11T183631-628.png',
        categoryId: 'oils',
        stock: 500,
        isTrending: true,
        brand: { id: 'b-alreef', name: 'الريف - Alreef', slug: 'alreef' }
    },
    {
        id: 'tw-2',
        slug: 'moroccan-canned-sardines-vegetable-oil',
        name: 'المغربي معلبات سمك السردين بالزيت والفلفل 125 جرام',
        nameAr: 'المغربي معلبات سمك السردين بالزيت والفلفل 125 جرام',
        nameEn: 'Moroccan Canned Sardines in Vegetable Oil with Chili 125g',
        description: 'سردين مغربي فاخر بالزيت النباتي والفلفل الحار',
        price: 0,
        images: 'https://i.postimg.cc/yNQDHBVN/data-bodour-(45).png',
        categoryId: 'seafood',
        stock: 450,
        isTrending: true,
        brand: { id: 'b-moroccan', name: 'المغربي - Moroccan', slug: 'al-maghrabi' }
    },
    {
        id: 'tw-3',
        slug: 'silver-fish-light-tuna-160g',
        name: 'سيلفر فيش تونا خفيف 160 جرام',
        nameAr: 'سيلفر فيش تونا خفيف 160 جرام',
        nameEn: 'Silver Fish Light Tuna 160g',
        description: 'قطع تونة خفيفة معبأة بأجود أنواع الزيت النباتي',
        price: 0,
        images: 'https://i.postimg.cc/X7zdwfMd/data-bodour-(44).png',
        categoryId: 'seafood',
        stock: 600,
        isTrending: true,
        brand: { id: 'b-silver-fish', name: 'سيلفر فيش - Silver Fish', slug: 'silver-fish' }
    },
    {
        id: 'tw-4',
        slug: 'sun-bull-corned-beef-240g',
        name: 'صن بل كورند بيف 240 جرام',
        nameAr: 'صن بل كورند بيف 240 جرام',
        nameEn: 'Sunbell Corned Beef 240g',
        description: 'لحم بقري معلب عالي الجودة',
        price: 0,
        images: 'https://i.postimg.cc/N0ftBHFq/data-bodour-(43).png',
        categoryId: 'canned-meat',
        stock: 350,
        isTrending: true,
        brand: { id: 'b-sun-bull', name: 'صن بل - Sunbell', slug: 'sunbell' }
    },
    {
        id: 'tw-5',
        slug: 'halibuna-pure-ghee-1kg',
        name: 'حليبنا سمن بقري 1 كيلو',
        nameAr: 'حليبنا سمن بقري 1 كيلو',
        nameEn: 'Halibuna Pure Clarified Cow Butter Ghee 1kg',
        description: 'سمنة بقرية طبيعية 100% بنكهة أصيلة',
        price: 0,
        images: 'https://i.postimg.cc/dQfzpfGv/data-bodour-(42).png',
        categoryId: 'dairy',
        stock: 280,
        isTrending: true,
        brand: { id: 'b-haleebna', name: 'حليبنا - Haleebna', slug: 'haleebna' }
    },
    {
        id: 'tw-6',
        slug: 'zwan-chicken-luncheon-meat-340g',
        name: 'زوان لانشون دجاج 340 غرام',
        nameAr: 'زوان لانشون دجاج 340 غرام',
        nameEn: 'Zwan Chicken Luncheon Meat 340g',
        description: 'لانشون دجاج هولندي أصلي معلب',
        price: 0,
        images: 'https://i.postimg.cc/QtDrHXLZ/data-bodour-2026-09-01T134804-711.png',
        categoryId: 'canned-meat',
        stock: 400,
        isTrending: true,
        brand: { id: 'b-zwan', name: 'زوان - Zwan', slug: 'zwan' }
    },
    {
        id: 'tw-7',
        slug: 'buffalo-dishwashing-liquid-lemon-650ml',
        name: 'بوفالو سائل جلي برائحة الليمون 650 مل',
        nameAr: 'بوفالو سائل جلي برائحة الليمون 650 مل',
        nameEn: 'Buffalo Dishwashing Liquid Lemon 650ml',
        description: 'سائل جلي مركز بقوة إذابة الدهون ورائحة الليمون المنعشة',
        price: 0,
        images: 'https://i.postimg.cc/J0v0wD3P/data-bodour-2026-09-01T142512-585.png',
        categoryId: 'detergents',
        stock: 300,
        isTrending: true,
        brand: { id: 'b-buffalo', name: 'بوفالو - Buffalo', slug: 'buffalo' }
    },
    {
        id: 'tw-8',
        slug: 'rocavira-active-fresh-deodorant-50ml',
        name: 'روكافيرا مزيل عرق رول أون 50 مل',
        nameAr: 'روكافيرا مزيل عرق رول أون 50 مل',
        nameEn: 'Rocavira Active Fresh Roll-on Deodorant 50ml',
        description: 'حماية وانتعاش يدوم 48 ساعة',
        price: 0,
        images: 'https://i.postimg.cc/tTkd177k/data-bodour-(65).png',
        categoryId: 'personal-care',
        stock: 320,
        isTrending: true,
        brand: { id: 'b-rocavira', name: 'روكافيرا - Rocavira', slug: 'rocavera' }
    },
    {
        id: 'tw-9',
        slug: 'alreef-olive-oil-1l',
        name: 'الريف زيت زيتون حجم 1 لتر',
        nameAr: 'الريف زيت زيتون حجم 1 لتر',
        nameEn: 'Al Reef Olive Oil 1L',
        description: 'زيت زيتون بكر ممتاز عالي الجودة',
        price: 0,
        images: 'https://i.postimg.cc/VN4YmbtT/alryf-zyt-zytwn-1ltr.jpg',
        categoryId: 'oils',
        stock: 480,
        isTrending: true,
        brand: { id: 'b-alreef', name: 'الريف - Alreef', slug: 'alreef' }
    }
];

const TrendingWeekly = ({ products = [] }: TrendingWeeklyProps) => {
    const { dir } = useLanguage();
    const isArabic = dir === 'rtl';
    const [showAll, setShowAll] = useState(false);
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isLockedForGuest = !customer;

    const displayProducts = (products && products.length > 0) ? products : FALLBACK_TRENDING_PRODUCTS;
    const initialCount = 8;
    const visibleProducts = showAll ? displayProducts : displayProducts.slice(0, initialCount);

    const getFirstImage = (images: string) => {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? parsed[0] : images;
        } catch {
            return images.split(',')[0]?.trim() || images;
        }
    };

    return (
        <section className="container-custom py-12 md:py-16">
            <div className="text-start mb-6 sm:mb-9">
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-[#8A6305] dark:text-[#E5B54A] mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {isArabic ? 'طلب السوق' : 'Market demand'}
                </span>
                <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] dark:text-white tracking-tight max-w-3xl" data-reveal-heading>
                        {isArabic ? 'المنتجات الأكثر طلباً هذا الأسبوع' : 'Fast-Moving Weekly Products'}
                    </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-2 font-normal" data-reveal-copy>
                    {isArabic
                        ? 'الأصناف الأكثر حركة وسحباً من قبل المحلات والسوبرماركت بأسعار تفضيلية'
                        : 'Highest volume FMCG demands ordered by merchants this week'}
                </p>
            </div>

            {/* Clean Product Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                <AnimatePresence initial={false}>
                    {visibleProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <Link
                                href={`/products/${product.slug}`}
                                className="group relative h-full flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-[#C28E2B]/60 transition-all duration-300"
                            >
                                {/* Top Header: Ranking Badge */}
                                <div className="w-full flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FAF6EC] dark:bg-[#C28E2B]/15 text-[#8A6305] dark:text-[#E5B54A] border border-[#C28E2B]/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C28E2B]" />
                                        <span>{isArabic ? `#${index + 1} الأكثر طلباً` : `#${index + 1} Top Demand`}</span>
                                    </span>
                                </div>

                                {/* Hero Product Image: Floating directly on card canvas (Zero nested grey box) */}
                                <div className="relative w-full h-36 sm:h-44 md:h-48 flex items-center justify-center p-2 my-2 shrink-0">
                                    <ResilientImage
                                        src={getFirstImage(product.images)}
                                        alt={product.name}
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-contain filter group-hover:scale-108 transition-transform duration-300"
                                        loading="lazy"
                                        showSkeleton={false}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className={`w-full flex flex-col ${isArabic ? 'text-right' : 'text-left'} mt-1`}>
                                    {product.brand && (
                                        <span className="text-[10px] sm:text-[11px] font-bold text-[#C28E2B] dark:text-[#E5B54A] uppercase tracking-wider block truncate mb-0.5">
                                            {product.brand.name}
                                        </span>
                                    )}
                                    <h3 className="text-xs sm:text-sm md:text-[15px] font-bold text-[#0B192C] dark:text-white line-clamp-2 leading-snug group-hover:text-[#C28E2B] transition-colors min-h-[2.4rem] sm:min-h-[2.6rem]">
                                        {isArabic ? (product.nameAr || product.name) : (product.nameEn || product.name)}
                                    </h3>
                                    
                                    {/* Pricing / Wholesale Lock (Matching ProductCard blurry price style) */}
                                    <div className="mt-2 flex items-center gap-2">
                                        {isLockedForGuest ? (
                                            <div className="flex items-baseline gap-1.5 group/lock">
                                                <Lock className="w-3.5 h-3.5 text-[#8A6305] dark:text-[#E5B54A] shrink-0 opacity-80" />
                                                <span className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-300 blur-[4px] select-none opacity-60">
                                                    880,000
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {isArabic ? 'ل.س' : 'SYP'}
                                                </span>
                                            </div>
                                        ) : product.discountPrice ? (
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm sm:text-base font-black text-[#16A34A] dark:text-[#4ade80]">
                                                    {formatPrice(Number(product.discountPrice))}
                                                </span>
                                                <span className="text-xs text-slate-400 line-through">
                                                    {formatPrice(Number(product.price || 0))}
                                                </span>
                                            </div>
                                        ) : Boolean(product.price && Number(product.price) > 0) ? (
                                            <span className="text-sm sm:text-base font-black text-[#0B192C] dark:text-white">
                                                {formatPrice(Number(product.price))}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] sm:text-xs font-bold text-[#8A6305] dark:text-[#E5B54A]">
                                                {isArabic ? 'سعر الجملة عند الطلب' : 'Wholesale on Inquiry'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Subtle Action Footer */}
                                <div className="w-full border-t border-slate-100 dark:border-white/5 pt-2.5 mt-3 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-[#C28E2B] transition-colors">
                                    <span>{isArabic ? 'عرض المنتج' : 'View Product'}</span>
                                    <span className={isArabic ? 'text-sm group-hover:-translate-x-1 transition-transform' : 'text-sm group-hover:translate-x-1 transition-transform'}>
                                        {isArabic ? '←' : '→'}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More / Less Toggle Button */}
            {displayProducts.length > initialCount && (
                <div className="flex justify-center mt-6 sm:mt-8">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-6 py-2.5 bg-white hover:bg-[#FAF6EC] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#0B192C] dark:text-white border border-slate-200/90 dark:border-white/10 hover:border-[#C28E2B] rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                        <span>
                            {showAll
                                ? (isArabic ? 'عرض أقل' : 'Show Less')
                                : (isArabic ? `عرض المزيد (${displayProducts.length - initialCount}+)` : `Show More (${displayProducts.length - initialCount}+)`)
                            }
                        </span>
                        <span className="text-xs">{showAll ? '▲' : '▼'}</span>
                    </button>
                </div>
            )}
        </section>
    );
};

export default TrendingWeekly;
