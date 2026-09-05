"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useCart } from "@/app/context/CartContext";
import ResilientImage from "@/app/components/ResilientImage";
import { MdSearch } from "react-icons/md";
import toast from "react-hot-toast";

interface Brand {
    id: string;
    name: string;
    slug: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface TopProduct {
    id: string;
    name: string;
    slug: string;
}

interface TrendingProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    slug: string;
    images: string;
    price: number;
    discountPrice: number | null;
    brand?: { name: string } | null;
}

export interface NavMainCategory {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
    image?: string | null;
    brands: Brand[];
    categories: Category[];
    topProducts: TopProduct[];
    trendingProducts: TrendingProduct[];
}

interface MegaMenuProps {
    data: NavMainCategory;
    onClose: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

// ─── Mini Product Card (matches ProductCard.tsx design exactly) ───────────────
function MiniProductCard({ product, onClose }: { product: TrendingProduct; onClose: () => void }) {
    const { formatPrice } = useCurrency();
    const { addItem } = useCart();
    const { language, dir } = useLanguage();

    const displayName = (language === "ar" ? product.nameAr : product.nameEn) || product.name || product.nameAr || "";

    const getImages = (images: string) => {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? parsed : [images];
        } catch {
            return images.split(",").map(i => i.trim()).filter(Boolean);
        }
    };

    const imgs = getImages(product.images);
    const primaryImage = imgs[0] || "";
    const secondaryImage = imgs.length > 1 && imgs[1] !== imgs[0] ? imgs[1] : null;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.discountPrice || product.price),
            image: primaryImage,
            slug: product.slug,
            quantity: 1,
        });
        toast.success(language === "ar" ? `تمت إضافة ${displayName} إلى السلة` : `Added ${displayName} to cart`);
    };

    return (
        <div className="group relative flex flex-col bg-[#F7F7F5] dark:bg-surface-dark rounded-[10px] overflow-hidden transition-transform duration-300 w-[177px] shrink-0">

            {/* Quick View Icon */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="absolute z-20 top-3 left-3 w-8 h-8 bg-white text-black hover:bg-[#8A6305] hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 border border-gray-100"
                aria-label="Quick View"
            >
                <MdSearch size={18} />
            </button>

            {/* Image Area — 177×177px */}
            <div className="relative w-[177px] h-[177px] shrink-0 overflow-hidden">
                <Link href={`/products/${product.slug}`} onClick={onClose} className="absolute inset-0 block w-full h-full" aria-label={displayName}>
                    {/* Primary Image */}
                    <div className={`absolute inset-0 transition-opacity duration-500 z-10 ${secondaryImage ? "group-hover:opacity-0" : ""}`}>
                        <ResilientImage
                            src={primaryImage}
                            alt={displayName}
                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                            loading="lazy"
                        />
                    </div>
                    {/* Secondary Image */}
                    {secondaryImage && (
                        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-0">
                            <ResilientImage
                                src={secondaryImage}
                                alt={displayName}
                                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                loading="lazy"
                            />
                        </div>
                    )}
                </Link>

                {/* Add to Cart — slides up on hover */}
                <div className="absolute inset-x-2 bottom-3 z-20 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#0B192C] hover:bg-[#8A6305] text-white h-[36px] rounded-full text-[12px] font-bold transition-all duration-300 flex items-center justify-center cursor-pointer"
                    >
                        {language === "ar" ? "اضافة للعربة" : "Add to Cart"}
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className={`flex flex-col p-2.5 pt-2 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                {/* Brand */}
                {product.brand && (
                    <p className="text-[#475569] dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 truncate">
                        {product.brand.name}
                    </p>
                )}
                {/* Title */}
                <h3
                    className={`text-[#0B192C] dark:text-white text-[12px] font-semibold leading-tight mb-1 line-clamp-2 ${dir === "rtl" ? "text-right" : "text-left"}`}
                >
                    <Link href={`/products/${product.slug}`} onClick={onClose}>
                        {displayName}
                    </Link>
                </h3>
                {/* Price */}
                <div className="flex items-center gap-1.5 mt-auto">
                    {product.discountPrice ? (
                        <>
                            <span className="text-[13px] font-bold text-[#0B192C] dark:text-white">
                                {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-[11px] text-[#475569] line-through font-normal">
                                {formatPrice(product.price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-[13px] font-bold text-[#0B192C] dark:text-white">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Mega Menu ────────────────────────────────────────────────────────────────
export default function MegaMenu({ data, onClose, onMouseEnter, onMouseLeave }: MegaMenuProps) {
    const { dir, language } = useLanguage();
    const visibleTrending = data.trendingProducts.slice(0, 3);

    return (
        <div
            className="absolute top-full left-0 right-0 z-40"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div
                className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden origin-top animate-mega-menu-enter"
            >
                <div className="container-custom py-8">
                    <div
                        className={`grid gap-8 ${dir === "rtl" ? "text-right" : "text-left"}`}
                        style={{ gridTemplateColumns: "1fr 1fr 1fr 2fr" }}
                    >
                        {/* Column 1: Brands */}
                        <div>
                            <h3 className="text-[15px] font-bold text-[#0B192C] dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
                                {language === "ar" ? "الماركات" : "Brands"}
                            </h3>
                            <ul className="flex flex-col gap-2">
                                {data.brands.length > 0 ? data.brands.map((brand) => {
                                    const formatBrandName = (name: string) => {
                                        if (!name.includes('-')) return name.trim();
                                        const parts = name.split('-').map(s => s.trim());
                                        if (parts.length >= 2) {
                                             const arabicPart = parts.find(p => /[\u0600-\u06FF]/.test(p));
                                             const englishPart = parts.find(p => !/[\u0600-\u06FF]/.test(p));
                                             if (language === 'ar' && arabicPart) return arabicPart;
                                             if (language !== 'ar' && englishPart) return englishPart;
                                         }
                                         return name;
                                     };

                                     return (
                                         <li key={brand.id}>
                                             <Link 
                                                 href={`/brands/${brand.slug}`} 
                                                 onClick={onClose}
                                                 className="text-[15px] font-medium text-[#475569] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-[#8A6305] leading-relaxed inline hover-underline-animated"
                                             >
                                                 {formatBrandName(brand.name)}
                                             </Link>
                                         </li>
                                     );
                                 }) : (
                                     <li className="text-[15px] font-medium text-[#475569]/50 dark:text-gray-500">
                                         {language === "ar" ? "لا توجد ماركات" : "No brands yet"}
                                     </li>
                                 )}
                             </ul>
                         </div>

                         {/* Column 2: Categories */}
                         <div>
                             <h3 className="text-[15px] font-bold text-[#0B192C] dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
                                 {language === "ar" ? "الأقسام" : "Categories"}
                             </h3>
                             <ul className="flex flex-col gap-2">
                                 {data.categories.length > 0 ? data.categories.map((cat) => (
                                     <li key={cat.id}>
                                         <Link 
                                             href={`/department/${data.slug}?category=${cat.slug}`} 
                                             onClick={onClose}
                                             className="text-[15px] font-medium text-[#475569] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-[#8A6305] leading-relaxed inline hover-underline-animated"
                                         >
                                             {cat.name}
                                         </Link>
                                     </li>
                                 )) : (
                                     <li className="text-[15px] font-medium text-[#475569]/50 dark:text-gray-500">
                                         {language === "ar" ? "لا توجد أقسام" : "No categories yet"}
                                     </li>
                                 )}
                             </ul>
                         </div>

                         {/* Column 3: Top Products */}
                         <div>
                             <h3 className="text-[15px] font-bold text-[#0B192C] dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
                                 {language === "ar" ? "المنتجات" : "Products"}
                             </h3>
                             <ul className="flex flex-col gap-2">
                                 {data.topProducts.length > 0 ? data.topProducts.map((product) => (
                                     <li key={product.id}>
                                         <Link 
                                             href={`/products/${product.slug}`} 
                                             onClick={onClose}
                                             className="text-[15px] font-medium text-[#475569] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-[#8A6305] leading-relaxed line-clamp-1 inline hover-underline-animated"
                                         >
                                             {product.name}
                                         </Link>
                                     </li>
                                 )) : (
                                     <li className="text-[15px] font-medium text-[#475569]/50 dark:text-gray-500">
                                         {language === "ar" ? "لا توجد منتجات" : "No products yet"}
                                     </li>
                                 )}
                                 {data.topProducts.length > 0 && (
                                     <li className="mt-2">
                                         <Link 
                                             href={`/department/${data.slug}`} 
                                             onClick={onClose}
                                             className="text-[15px] font-bold text-[#0B192C] dark:text-white hover:text-[#8A6305] inline hover-underline-animated"
                                         >
                                             {language === "ar" ? "عرض كل المنتجات ←" : "View All →"}
                                         </Link>
                                     </li>
                                 )}
                             </ul>
                         </div>

                        {/* Column 4: Best Sellers — mini product cards */}
                        <div>
                            <h3 className="text-[15px] font-bold text-[#0B192C] dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
                                {language === "ar" ? "الأكثر مبيعاً" : "Best Sellers"}
                            </h3>
                            {visibleTrending.length > 0 ? (
                                <div className="flex flex-row gap-3">
                                    {visibleTrending.map((product) => (
                                        <MiniProductCard
                                            key={product.id}
                                            product={product}
                                            onClose={onClose}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[15px] font-medium text-[#475569]/50 dark:text-gray-500">
                                    {language === "ar" ? "لا توجد منتجات رائجة" : "No trending products"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
