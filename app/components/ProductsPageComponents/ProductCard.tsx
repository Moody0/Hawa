"use client";

import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ResilientImage from '@/app/components/ResilientImage';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { Plus, Minus, Eye, Lock } from 'lucide-react';
import { formatPackaging } from '@/lib/packaging';
import RollingNumber from '@/app/components/RollingNumber';
import { motion, AnimatePresence } from 'framer-motion';

const QuickViewModal = dynamic(() => import('./QuickViewModal'), { ssr: false });

export interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    price: string | number | null;
    discountPrice?: string | number | null;
    images: string;
    categoryId?: string;
    stock?: number;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
    hidePrice?: boolean;
    options?: string | null;
    isTrending?: boolean;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group?: string;
    } | null;
}

export interface ProductCardProps {
    product: Product;
    variant?: 'default' | 'compact';
    badge?: string | null;
    showBadge?: boolean;
    isFeaturedSpan?: boolean;
}

const ProductCard = ({ product, badge, showBadge = true }: ProductCardProps) => {
    const { language, dir } = useLanguage();
    const isArabic = language === 'ar';
    const { formatPrice } = useCurrency();
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const { customer } = useCustomer();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isLockedForGuest = !customer;
    const isPriceOnInquiry = Boolean(product.hidePrice || Number(product.price) <= 0);

    const displayName = (language === 'ar' ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const brandName = product.brand?.name || '';

    const cleanDisplayName = useMemo(() => {
        if (!brandName || !displayName) return displayName;
        const brandParts = brandName.split('-').map(s => s.trim()).filter(Boolean);
        for (const part of brandParts) {
            const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`^${escaped}\\s+`, 'i');
            if (regex.test(displayName)) {
                return displayName.replace(regex, '');
            }
        }
        return displayName;
    }, [displayName, brandName]);

    const cartItem = items.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const images = typeof product.images === 'string'
        ? product.images.split(',').map(img => img.trim()).filter(Boolean)
        : Array.isArray(product.images) ? product.images : [];

    const primaryImage = images[0] || '';
    const secondaryImage = images.length > 1 && images[1] !== images[0] ? images[1] : null;

    const handleInitialAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.discountPrice || product.price),
            image: primaryImage,
            slug: product.slug,
            quantity: 1,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantityInCart + 1);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantityInCart <= 1) {
            removeItem(product.id);
        } else {
            updateQuantity(product.id, quantityInCart - 1);
        }
    };

    const displayBadge = product.isTrending ? (language === 'ar' ? 'مميز' : 'Trending') : badge;

    return (
        <>
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative flex flex-col w-full transition-all duration-200"
                data-testid="product-card"
            >
                {/* 1. The Media Tile with Seamless Container */}
                <div className="relative aspect-square w-full bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-white/10 rounded-[10px] overflow-hidden flex items-center justify-center transition-colors group-hover:border-[#8A6305]/40">
                    
                    {/* Badge */}
                    {showBadge && (product.isTrending || badge) && (
                        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
                            <span className={`${product.isTrending ? 'bg-[#8A6305]' : 'bg-emerald-600'} text-white text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                                {displayBadge}
                            </span>
                        </div>
                    )}

                    {/* Quick View Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsQuickViewOpen(true);
                        }}
                        className="absolute z-20 top-2.5 left-2.5 w-8 h-8 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-[#0B192C] hover:text-white dark:hover:bg-white dark:hover:text-slate-900 cursor-pointer"
                        aria-label="Quick View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {/* Product Image (object-contain with clean padding to prevent any clipping) */}
                    <Link href={`/products/${product.slug}`} className="relative w-full h-full p-3 flex items-center justify-center">
                        <div className={`relative w-full h-full transition-opacity duration-200 ${isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'}`}>
                            <ResilientImage
                                src={primaryImage}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="w-full h-full object-contain"
                                loading="lazy"
                            />
                        </div>
                        {secondaryImage && (
                            <div className={`absolute inset-0 p-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                <ResilientImage
                                    src={secondaryImage}
                                    alt={`${product.name} - alternate view`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                        )}
                    </Link>

                    {/* Quick Add Floating Button & Stepper */}
                    <div className="absolute bottom-2.5 left-2.5 z-20">
                        <motion.div
                            layout
                            transition={{
                                layout: { type: "spring", stiffness: 500, damping: 30, mass: 0.8 },
                            }}
                            className={`h-8 sm:h-9 rounded-lg flex items-center border overflow-hidden select-none transition-colors duration-200 ${
                                quantityInCart === 0
                                    ? 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-[#0B192C] dark:text-white hover:border-[#8A6305]'
                                    : 'bg-[#0B192C] dark:bg-zinc-900 border-slate-700/80 dark:border-zinc-700 text-white p-0.5'
                            }`}
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {quantityInCart === 0 ? (
                                    <motion.button
                                        key="quick-add-btn"
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.6 }}
                                        transition={{ duration: 0.15 }}
                                        onClick={handleInitialAdd}
                                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cursor-pointer transition-colors"
                                        title={isArabic ? "إضافة للطلب" : "Add to Order"}
                                        aria-label={isArabic ? "إضافة للطلب" : "Add to Order"}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="quick-stepper-ctrls"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{ duration: 0.18 }}
                                        dir="ltr"
                                        className="flex items-center"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleDecrease}
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer touch-manipulation"
                                            aria-label="Decrease quantity"
                                            title="Decrease quantity"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <RollingNumber
                                            value={quantityInCart}
                                            className="text-xs font-black px-1.5 text-center min-w-[1.2rem]"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleIncrease}
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer touch-manipulation"
                                            aria-label="Increase quantity"
                                            title="Increase quantity"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* 2. Structured Typography & B2B Commercial Metadata */}
                <div className={`flex flex-col pt-2.5 px-0.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    
                    {/* Packaging & Unit Tag Row */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A]">
                            {product.brand?.name || (isArabic ? 'شركة حوا' : 'Hawa Distribution')}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                            {formatPackaging(product.packaging, language)}
                        </span>
                    </div>

                    {/* Product Title Container */}
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white line-clamp-2 leading-snug h-10 flex items-start">
                        <Link href={`/products/${product.slug}`} className="hover:text-[#8A6305] transition-colors">
                            {cleanDisplayName}
                        </Link>
                    </h3>

                    {/* Price & MOQ Row */}
                    <div className="flex items-baseline justify-between gap-2 mt-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                        {/* The Main Price / B2B Locked State */}
                        {isLockedForGuest ? (
                            <Link
                                href="/account/login"
                                className="group/lock inline-flex items-center gap-1.5 py-0.5"
                                title={isArabic ? "سجّل دخول التاجر لعرض سعر الجملة" : "Login to view wholesale price"}
                            >
                                <span className="w-4 h-4 rounded bg-[#FAF6EC] dark:bg-[#8A6305]/20 border border-[#8A6305]/30 flex items-center justify-center shrink-0 group-hover/lock:border-[#8A6305] group-hover/lock:bg-[#8A6305] transition-colors">
                                    <Lock className="w-2.5 h-2.5 text-[#8A6305] group-hover/lock:text-white transition-colors" />
                                </span>
                                <div className="flex items-baseline gap-1 select-none">
                                    <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 blur-[3px] group-hover/lock:blur-[2px] transition-all opacity-60 tracking-wider">
                                        88,500
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 group-hover/lock:text-[#8A6305] transition-colors">
                                        {isArabic ? "سعر الجملة" : "Wholesale"}
                                    </span>
                                </div>
                            </Link>
                        ) : !isPriceOnInquiry ? (
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm sm:text-base font-extrabold text-[#0B192C] dark:text-white">
                                    {formatPrice(Number(product.discountPrice || product.price))}
                                </span>
                                {product.discountPrice && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                        {formatPrice(Number(product.price))}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs font-bold text-[#8A6305]">
                                {isArabic ? "سعر وكالة" : "Inquire"}
                            </span>
                        )}

                        {/* Minimum Order Specification */}
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 shrink-0">
                            {isArabic ? `أدنى طلب: ${product.minOrder || 1} طرد` : `Min: ${product.minOrder || 1} pkg`}
                        </span>
                    </div>
                </div>
            </div>

            {isQuickViewOpen && (
                <QuickViewModal
                    product={product}
                    isOpen={isQuickViewOpen}
                    onClose={() => setIsQuickViewOpen(false)}
                />
            )}
        </>
    );
};

export default ProductCard;
