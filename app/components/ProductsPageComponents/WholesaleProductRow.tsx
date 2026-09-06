"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useCart } from "@/app/context/CartContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { formatPackaging, formatPackageItems } from "@/lib/packaging";
import { MdAdd, MdRemove, MdShoppingBag, MdLock } from "react-icons/md";
import toast from "react-hot-toast";
import ResilientImage from "@/app/components/ResilientImage";
import { Product } from "./ProductCard";

interface WholesaleProductRowProps {
    product: Product;
}

const WholesaleProductRow: React.FC<WholesaleProductRowProps> = ({ product }) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";
    const { formatPrice } = useCurrency();
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const { customer } = useCustomer();

    const isLockedForGuest = !customer;
    const isPriceOnInquiry = Boolean(product.hidePrice || Number(product.price) <= 0);

    const displayName = (isArabic ? product.nameAr : product.nameEn) || product.name || product.nameAr || "";
    const displayDesc = isArabic
        ? product.descriptionAr || product.description
        : product.descriptionEn || product.description;

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

    const cartItem = items.find((item) => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const parsedOptions = product.options
        ? product.options.split(",").map((o) => o.trim()).filter(Boolean)
        : [];
    const defaultOption = parsedOptions.length > 0 ? parsedOptions[0] : undefined;

    const images = typeof product.images === "string"
        ? product.images.split(",").map((img) => img.trim()).filter(Boolean)
        : Array.isArray(product.images)
        ? product.images
        : [];
    const primaryImage = images[0] || "";

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
                isArabic
                    ? `تمت إضافة ${displayName} لقائمة طلب التسعير`
                    : `Added ${displayName} to quote request`,
                { id: `quote-${product.id}` }
            );
        } else {
            toast.success(
                isArabic ? `تمت إضافة ${displayName} إلى السلة` : `Added ${displayName} to cart`,
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

    const packagingLabel = formatPackaging(product.packaging, language);
    const itemsPerPackageLabel = formatPackageItems(product.itemsPerPackage, language);

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-white/10 rounded-2xl hover:border-[#8A6305]/50 transition-all hover:shadow-xs group">
            {/* Product Thumbnail & Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <Link
                    href={`/products/${product.slug}`}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 dark:bg-zinc-800/80 p-1.5 flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/5 overflow-hidden"
                >
                    <ResilientImage
                        src={primaryImage}
                        alt={displayName}
                        fill
                        sizes="80px"
                        className="object-contain group-hover:scale-105 transition-transform"
                    />
                </Link>

                <div className="min-w-0 flex-1">
                    {/* Brand Pill */}
                    {product.brand && (
                        <span className="inline-block text-[10px] font-bold text-[#8A6305] uppercase tracking-wider mb-0.5">
                            {product.brand.name}
                        </span>
                    )}

                    {/* Title */}
                    <Link
                        href={`/products/${product.slug}`}
                        className="block text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors truncate"
                    >
                        {cleanDisplayName}
                    </Link>

                    {/* Wholesale Packaging & Stock Specification */}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#475569] dark:text-gray-400">
                        {packagingLabel && (
                            <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium text-[10px]">
                                {packagingLabel} {itemsPerPackageLabel && `(${itemsPerPackageLabel})`}
                            </span>
                        )}

                        {product.minOrder && product.minOrder > 1 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                {isArabic ? `أقل طلب: ${product.minOrder}` : `Min: ${product.minOrder}`}
                            </span>
                        )}

                        {product.stock !== undefined && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                {product.stock > 0
                                    ? isArabic ? "متوفر بالمخزون" : "In Stock"
                                    : isArabic ? "غير متوفر" : "Out of Stock"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Price & Action Area */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/5">
                {/* Price Display */}
                <div className="text-start sm:text-end">
                    {isLockedForGuest ? (
                        <div className="flex flex-col items-start sm:items-end">
                            <Link
                                href="/account/login"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-2 py-0.5 rounded-md hover:bg-[#8A6305] hover:text-white transition-all"
                            >
                                <MdLock className="text-xs" />
                                <span>{isArabic ? "أسعار الجملة للتجار" : "Wholesale (Login)"}</span>
                            </Link>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                {isArabic ? "يتطلب حساب تاجر" : "Merchant account required"}
                            </span>
                        </div>
                    ) : !isPriceOnInquiry ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm sm:text-base font-black text-[#0B192C] dark:text-white">
                                    {formatPrice(Number(product.discountPrice || product.price))}
                                </span>
                                {product.discountPrice && (
                                    <span className="text-xs text-gray-400 line-through">
                                        {formatPrice(Number(product.price))}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {isArabic ? "سعر الجملة" : "Wholesale"}
                            </span>
                        </>
                    ) : (
                        <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[11px] font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-2 py-0.5 rounded-md">
                                {isArabic ? "السعر حسب الوكالة" : "Price on Inquiry"}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                {isArabic ? "طلب تسعير جملة" : "Wholesale Quote"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Quick Add / Stepper / Quote CTA */}
                <div>
                    {quantityInCart === 0 ? (
                        !isPriceOnInquiry ? (
                            <button
                                type="button"
                                onClick={handleInitialAdd}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B192C] hover:bg-[#8A6305] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
                            >
                                <MdShoppingBag className="text-sm" />
                                <span>{isArabic ? "إضافة" : "Add"}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleInitialAdd}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF6EC] hover:bg-[#8A6305] text-[#0B192C] hover:text-white border border-[#8A6305]/40 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95 dark:bg-[#8A6305]/20 dark:text-white dark:hover:bg-[#8A6305]"
                            >
                                <span className="text-xs">📋</span>
                                <span>{isArabic ? "طلب تسعير" : "Quote"}</span>
                            </button>
                        )
                    ) : (
                        <div className={`flex items-center gap-2 border rounded-xl px-2 py-1 ${
                            isPriceOnInquiry
                                ? "bg-[#FAF6EC] dark:bg-[#8A6305]/20 border-[#8A6305]/40"
                                : "bg-[#FAF6EC] dark:bg-[#8A6305]/20 border-[#8A6305]/30"
                        }`}>
                            <button
                                type="button"
                                onClick={handleDecrease}
                                className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-800 text-[#0B192C] dark:text-white flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer shadow-xs"
                                aria-label="Decrease quantity"
                            >
                                <MdRemove className="text-xs" />
                            </button>
                            <span className="text-xs font-bold font-mono px-1 text-[#0B192C] dark:text-white">
                                {quantityInCart}
                            </span>
                            <button
                                type="button"
                                onClick={handleIncrease}
                                className="w-6 h-6 rounded-lg bg-[#8A6305] text-white flex items-center justify-center hover:bg-[#705004] transition-colors cursor-pointer shadow-xs"
                                aria-label="Increase quantity"
                            >
                                <MdAdd className="text-xs" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WholesaleProductRow;
