"use client";

import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ResilientImage from '@/app/components/ResilientImage';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { Plus, Minus, Eye } from 'lucide-react';
import { formatPackaging } from '@/lib/packaging';
import RollingNumber from '@/app/components/RollingNumber';
import { getBrandDisplayName } from '@/lib/brand-display';

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
        nameEn?: string | null;
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
    imagePriority?: boolean;
    inConnectedGrid?: boolean;
}

const ProductCard = ({
    product,
    badge,
    showBadge = true,
    imagePriority = false,
    inConnectedGrid = false,
}: ProductCardProps) => {
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
    const brandName = product.brand ? getBrandDisplayName(product.brand, isArabic ? 'ar' : 'en') : '';

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

    const minQuantity = Math.max(1, Number(product.minOrder) || 1);
    const shortUnit = formatPackaging(product.packaging, language, { short: true });

    const handleInitialAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.discountPrice || product.price),
            image: primaryImage,
            slug: product.slug,
            quantity: minQuantity,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: minQuantity,
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
        if (quantityInCart <= minQuantity) {
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
                className={`group relative flex flex-col justify-between w-full bg-white dark:bg-zinc-900 hover:bg-[#FAF7F0]/60 dark:hover:bg-zinc-800/70 transition-colors duration-220 ${
                    inConnectedGrid
                        ? 'p-3.5 sm:p-5 border-e border-b border-[#0B192C]/[0.08] dark:border-white/10'
                        : 'p-3 sm:p-4 rounded-[14px] border border-[#0B192C]/[0.09] dark:border-white/10 overflow-hidden'
                }`}
                data-testid="product-card"
            >
                <div>
                    {/* 1. Seamless Product Image Stage (No nested inner border box) */}
                    <div className="relative aspect-square w-full bg-white dark:bg-zinc-800/80 rounded-[10px] overflow-hidden flex items-center justify-center mb-3">
                        {/* Badge */}
                        {showBadge && (product.isTrending || badge) && (
                            <div className="absolute top-2 right-2 z-20 pointer-events-none">
                                <span className="bg-[#0B192C] text-[#E5B54A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {displayBadge}
                                </span>
                            </div>
                        )}

                        {/* Quick View Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsQuickViewOpen(true);
                            }}
                            className="absolute z-20 top-2 left-2 w-8 h-8 bg-white/90 dark:bg-zinc-900/90 border border-[#0B192C]/10 dark:border-white/10 text-[#0B192C] dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-[#0B192C] hover:text-[#E5B54A] cursor-pointer"
                            aria-label="Quick View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        {/* Full-Size Product Image */}
                        <Link href={`/products/${product.slug}`} className="relative w-full h-full p-0 flex items-center justify-center">
                            <div className={`relative w-full h-full transition-opacity duration-200 ${isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'}`}>
                                <ResilientImage
                                    src={primaryImage}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="w-full h-full object-cover transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                                    loading={imagePriority ? 'eager' : 'lazy'}
                                    priority={imagePriority}
                                />
                            </div>
                            {secondaryImage && isHovered && (
                                <div className="absolute inset-0 p-0 transition-opacity duration-200">
                                    <ResilientImage
                                        src={secondaryImage}
                                        alt={`${product.name} - alternate view`}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* 2. Brand + Mobile Min-Order Meta & Product Title */}
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] truncate">
                                {brandName || (isArabic ? 'شركة حوا' : 'Hawa Distribution')}
                            </span>

                            {/* On mobile (< sm), show min order cleanly opposite the brand so it never truncates next to the CTA */}
                            <span className="sm:hidden text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                                {isArabic ? `أدنى طلب: ${minQuantity} ${shortUnit}` : `Min: ${minQuantity} ${shortUnit}`}
                            </span>
                        </div>

                        <h3 className="text-[13px] sm:text-[14px] font-bold text-[#0B192C] dark:text-white line-clamp-2 leading-[1.4] h-[37px] sm:h-[39px] mb-2.5 sm:mb-3">
                            <Link href={`/products/${product.slug}`} className="hover:text-[#8A6305] dark:hover:text-[#E5B54A] transition-colors">
                                {cleanDisplayName}
                            </Link>
                        </h3>
                    </div>
                </div>

                {/* 3. Bottom Action & Meta Row — Full-Width CTA on Mobile, Balanced Row on Desktop */}
                <div className="pt-2.5 sm:pt-3 border-t border-[#0B192C]/[0.07] dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {/* Desktop Meta / Merchant Price */}
                    <div className={`${!isLockedForGuest && !isPriceOnInquiry ? 'block' : 'hidden sm:block'} min-w-0`}>
                        {!isLockedForGuest && !isPriceOnInquiry ? (
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[13.5px] sm:text-[15px] font-bold text-[#0B192C] dark:text-white" dir="ltr">
                                    {formatPrice(Number(product.discountPrice || product.price))}
                                </span>
                                {product.discountPrice && (
                                    <span className="text-[10px] text-slate-400 line-through" dir="ltr">
                                        {formatPrice(Number(product.price))}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400 truncate block">
                                {isArabic ? `أدنى طلب: ${minQuantity} ${shortUnit}` : `Min: ${minQuantity} ${shortUnit}`}
                            </span>
                        )}
                    </div>

                    {/* Single Persistent Morphing Pill (Zero Unmount Blink or Width Jump) */}
                    <div
                        className={`relative w-full sm:w-[112px] h-8 rounded-full overflow-hidden border transition-[background-color,border-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 ${
                            quantityInCart === 0
                                ? 'border-[#0B192C]/15 dark:border-white/15 bg-[#FAF7F0]/75 sm:bg-white dark:bg-zinc-800 hover:bg-[#C59329] hover:border-[#C59329]'
                                : 'border-[#0F2138] dark:border-[#C59329] bg-[#0F2138] dark:bg-[#C59329]'
                        }`}
                    >
                        {/* Layer 1: Add to Order Button */}
                        <button
                            type="button"
                            onClick={handleInitialAdd}
                            tabIndex={quantityInCart === 0 ? 0 : -1}
                            aria-hidden={quantityInCart > 0}
                            className={`group/add absolute inset-0 w-full h-full px-3 rounded-full text-[#0B192C] dark:text-white hover:text-[#0B192C] text-[11.5px] sm:text-[12px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.95] ${
                                quantityInCart === 0
                                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                                    : 'opacity-0 -translate-y-full scale-95 pointer-events-none'
                            }`}
                            aria-label={isArabic ? "أضف للطلبية" : "Add to Order"}
                        >
                            <Plus
                                className="w-3.5 h-3.5 text-[#8A6305] group-hover/add:text-[#0B192C] transition-transform duration-250 ease-out group-hover/add:rotate-90"
                                strokeWidth={2.4}
                            />
                            <span>{isArabic ? "أضف للطلبية" : "Add"}</span>
                        </button>

                        {/* Layer 2: Quantity Stepper */}
                        <div
                            dir="ltr"
                            aria-hidden={quantityInCart === 0}
                            className={`absolute inset-0 w-full h-full px-1 text-white dark:text-[#0B192C] inline-flex items-center justify-between transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                quantityInCart > 0
                                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                                    : 'opacity-0 translate-y-full scale-95 pointer-events-none'
                            }`}
                        >
                            <button
                                type="button"
                                tabIndex={quantityInCart > 0 ? 0 : -1}
                                onClick={handleDecrease}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/15 dark:hover:bg-black/10 active:scale-85 transition-[background-color,transform] duration-150 cursor-pointer"
                                aria-label={quantityInCart <= minQuantity ? (isArabic ? 'حذف من السلة' : 'Remove from cart') : (isArabic ? 'تقليل الكمية' : 'Decrease quantity')}
                            >
                                <Minus className="w-3.5 h-3.5 text-[#E5B54A] dark:text-[#0B192C]" strokeWidth={2.2} />
                            </button>
                            <RollingNumber
                                value={Math.max(minQuantity, quantityInCart)}
                                className="text-xs font-bold px-1 text-center min-w-[1.4rem] tabular-nums"
                            />
                            <button
                                type="button"
                                tabIndex={quantityInCart > 0 ? 0 : -1}
                                onClick={handleIncrease}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/15 dark:hover:bg-black/10 active:scale-85 transition-[background-color,transform] duration-150 cursor-pointer"
                                aria-label={isArabic ? 'زيادة الكمية' : 'Increase quantity'}
                            >
                                <Plus className="w-3.5 h-3.5 text-[#E5B54A] dark:text-[#0B192C]" strokeWidth={2.2} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Right-to-Left Sweep Underline */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-[#0F2138] dark:bg-[#E5B54A] scale-x-0 origin-left group-hover:origin-right group-hover:scale-x-100 transition-transform duration-320 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
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
