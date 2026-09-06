"use client";

import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ResilientImage from '@/app/components/ResilientImage';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { MdSearch, MdShoppingBag, MdAdd, MdRemove, MdFavorite, MdFavoriteBorder, MdVisibility, MdLock } from 'react-icons/md';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';
import toast from 'react-hot-toast';

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
    price: string | number;
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
    const { formatPrice } = useCurrency();
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const { customer, isFavorite, toggleWishlist } = useCustomer();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isSecondaryLoaded, setIsSecondaryLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isFav = isFavorite(product.id);

    const isLockedForGuest = !customer;
    const isPriceOnInquiry = Boolean(product.hidePrice || Number(product.price) <= 0);

    // Localized title & description
    const displayName = (language === 'ar' ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';

    // Clean redundant brand prefix if title starts with the brand name (e.g. "بوفالو صابون..." -> "صابون...")
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

    const displayDesc = language === 'ar'
        ? (product.descriptionAr || product.description)
        : (product.descriptionEn || product.description);

    // Options parsing
    const parsedOptions = product.options 
        ? product.options.split(',').map(o => o.trim()).filter(Boolean)
        : [];
    const defaultOption = parsedOptions.length > 0 ? parsedOptions[0] : undefined;

    // Check if this item is in cart
    const cartItem = items.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const images = typeof product.images === 'string'
        ? product.images.split(',').map(img => img.trim()).filter(Boolean)
        : Array.isArray(product.images) ? product.images : [];
    
    const primaryImage = images[0] || '';
    const secondaryImage = images.length > 1 && images[1] !== images[0] ? images[1] : null;
    const hasSecondaryImage = !!secondaryImage;

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
            description: displayDesc || undefined,
            selectedOption: defaultOption,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        if (isPriceOnInquiry) {
            toast.success(
                language === 'ar'
                    ? `تمت إضافة ${displayName} لقائمة طلب التسعير`
                    : `Added ${displayName} to quote request`,
                { id: `quote-${product.id}` }
            );
        } else {
            toast.success(
                language === 'ar' ? `تمت إضافة ${displayName} إلى السلة` : `Added ${displayName} to cart`,
                { id: `cart-${product.id}` }
            );
        }
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantityInCart + 1, defaultOption);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantityInCart <= 1) {
            removeItem(product.id, defaultOption);
        } else {
            updateQuantity(product.id, quantityInCart - 1, defaultOption);
        }
    };

    const displayBadge = product.isTrending 
        ? (language === 'ar' ? 'مميز' : 'Trending') 
        : badge;

    return (
        <>
            <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-400 dark:hover:border-white/30 border border-slate-200 dark:border-white/10 p-2.5 sm:p-3.5 w-full h-full"
            >
                
                {/* Badge matching Theme (#8A6305 for trending, #16A34A for new arrival) */}
                {showBadge && (product.isTrending || badge) && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none">
                        <span className={`${product.isTrending ? 'bg-[#8A6305]' : 'bg-[#16A34A]'} text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-xs`}>
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
                    className="absolute z-20 top-3 left-3 sm:top-4 sm:left-4 w-7 h-7 sm:w-8 sm:h-8 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-200 rounded-lg flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#0B192C] hover:text-white dark:hover:bg-white dark:hover:text-slate-900 border border-slate-200 dark:border-white/10"
                    aria-label={language === 'ar' ? 'معاينة سريعة' : 'Quick View'}
                >
                    <MdVisibility className="text-sm sm:text-base" />
                </button>

                {/* Main Product Image with Secondary Image Hover Effect */}
                <div className="relative aspect-square w-full bg-white dark:bg-zinc-800/50 rounded-lg overflow-hidden">
                    <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                        {/* Primary Image */}
                        <div className={`relative w-full h-full transition-all duration-300 ${isHovered && secondaryImage ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                            <ResilientImage
                                src={primaryImage}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>

                        {/* Secondary Hover Image */}
                        {secondaryImage && (
                            <div className={`absolute inset-0 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                                <ResilientImage
                                    src={secondaryImage}
                                    alt={`${product.name} - alternate view`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onLoad={() => setIsSecondaryLoaded(true)}
                                />
                            </div>
                        )}
                    </Link>
                </div>

                {/* Information Area */}
                <div className={`flex flex-col flex-1 mt-2.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    
                    {/* Brand */}
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#475569] dark:text-gray-400 mb-0.5 line-clamp-1">
                        {product.brand?.name || 'Hawa Distribution'}
                    </span>

                    {/* Title */}
                    <h3 
                        className={`text-xs sm:text-sm font-semibold text-[#0B192C] dark:text-white line-clamp-2 leading-snug mb-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                    >
                        <Link href={`/products/${product.slug}`} className="hover:underline">
                            {cleanDisplayName}
                        </Link>
                    </h3>

                    {/* Options Pills (if any) */}
                    {parsedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                            {parsedOptions.slice(0, 3).map((opt, i) => (
                                <span key={i} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 border border-slate-200/60 dark:border-white/10 px-1.5 py-0.5 rounded">
                                    {opt}
                                </span>
                            ))}
                            {parsedOptions.length > 3 && (
                                <span className="text-[9px] font-bold text-gray-400">
                                    +{parsedOptions.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Packaging & Pieces */}
                    <div className="flex items-center flex-wrap gap-1.5 my-1.5 text-[10px] sm:text-[11px]">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 text-[#0F172A] dark:text-zinc-200 px-2 py-0.5 rounded-md font-bold">
                            <span>📦</span> {formatPackaging(product.packaging, language)}
                        </span>
                        {product.itemsPerPackage ? (
                            <span className="text-[#475569] dark:text-gray-400 font-semibold">
                                ({formatPackageItems(product.itemsPerPackage, language, { mode: 'badge' })})
                            </span>
                        ) : null}
                    </div>

                    {/* Price and Minimum Order */}
                    <div className="mt-auto pt-1 flex items-baseline justify-between gap-1 text-[#0B192C] dark:text-white">
                        {isLockedForGuest ? (
                            <Link
                                href="/account/login"
                                className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-2 py-0.5 rounded hover:bg-[#8A6305] hover:text-white transition-all shadow-2xs group/lock"
                                title={language === 'ar' ? 'سجل دخولك كتاجر للاطلاع على أسعار الجملة' : 'Login as merchant to view wholesale prices'}
                            >
                                <MdLock className="text-xs shrink-0" />
                                <span className="truncate">{language === 'ar' ? 'أسعار الجملة للتجار' : 'Wholesale (Login)'}</span>
                            </Link>
                        ) : !isPriceOnInquiry ? (
                            <div className="flex items-baseline gap-1.5 sm:gap-2">
                                {product.discountPrice && Number(product.discountPrice) < Number(product.price) ? (
                                    <>
                                        <span className="text-xs sm:text-base font-black text-[#0B192C] dark:text-white">{formatPrice(Number(product.discountPrice))}</span>
                                        <span className="text-[10px] sm:text-xs text-gray-400 line-through font-normal">{formatPrice(Number(product.price))}</span>
                                    </>
                                ) : (
                                    <span className="text-xs sm:text-base font-black text-[#0B192C] dark:text-white">{formatPrice(Number(product.price))}</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-2 py-0.5 rounded">
                                    {language === 'ar' ? 'السعر يحدد حسب الوكالة' : 'Price on Inquiry'}
                                </span>
                            </div>
                        )}
                        <span className="text-[9px] sm:text-[10px] font-semibold text-[#475569] dark:text-slate-400 shrink-0">
                            {language === 'ar' 
                                ? `أدنى طلب: ${product.minOrder && product.minOrder > 1 ? product.minOrder + ' ' : ''}${formatPackaging(product.packaging, 'ar')}`
                                : `Min: ${product.minOrder || 1} ${formatPackaging(product.packaging, 'en', { short: true })}`}
                        </span>
                    </div>

                    {/* Mobile-Optimized Touch Target Add to Cart / Quantity Controller */}
                    <div className="mt-2.5 relative h-9 sm:h-10 w-full overflow-hidden rounded-lg">
                        {quantityInCart === 0 ? (
                            !isPriceOnInquiry ? (
                                <button
                                    onClick={handleInitialAdd}
                                    className="w-full h-full bg-[#0B192C] hover:bg-[#8A6305] text-white rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 touch-manipulation select-none shadow-xs cursor-pointer dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white"
                                >
                                    <MdShoppingBag className="text-sm sm:text-base shrink-0 text-current" />
                                    <span className="truncate">{language === 'ar' ? 'إضافة للطلب' : 'Add to Cart'}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleInitialAdd}
                                    className="w-full h-full bg-[#FAF6EC] hover:bg-[#8A6305] text-[#0B192C] hover:text-white border border-[#8A6305]/40 rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 touch-manipulation select-none shadow-xs cursor-pointer dark:bg-[#8A6305]/20 dark:text-white dark:hover:bg-[#8A6305]"
                                >
                                    <span className="text-xs">📋</span>
                                    <span className="truncate">{language === 'ar' ? 'طلب تسعير جملة' : 'Request Wholesale Quote'}</span>
                                </button>
                            )
                        ) : (
                            <div className={`w-full h-full rounded-lg font-bold text-xs flex items-center justify-between px-1.5 sm:px-2 transition-all duration-300 animate-scaleUp text-white ${
                                isPriceOnInquiry
                                    ? 'bg-[#8A6305] border border-[#8A6305]'
                                    : 'bg-[#0B192C] dark:bg-[#132035] border border-[#8A6305]/40'
                            }`}>
                                <button
                                    onClick={handleDecrease}
                                    className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors active:scale-90 touch-manipulation cursor-pointer"
                                    aria-label={language === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
                                >
                                    <MdRemove className="text-base" />
                                </button>
                                
                                <span className="text-xs font-extrabold tracking-wide px-1 select-none flex items-center gap-1">
                                    <span>{quantityInCart}</span>
                                    <span className="text-[10px] font-semibold opacity-90">{formatPackaging(product.packaging, language, { short: true })}</span>
                                    {isPriceOnInquiry && (
                                        <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-normal">
                                            {language === 'ar' ? 'تسعير' : 'Quote'}
                                        </span>
                                    )}
                                </span>

                                <button
                                    onClick={handleIncrease}
                                    className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors active:scale-90 touch-manipulation cursor-pointer"
                                    aria-label={language === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                                >
                                    <MdAdd className="text-base" />
                                </button>
                            </div>
                        )}
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
