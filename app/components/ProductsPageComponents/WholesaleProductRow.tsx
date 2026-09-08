"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useCart } from "@/app/context/CartContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { formatPackaging, formatPackageItems } from "@/lib/packaging";
import { Plus, Minus, ShoppingBag, Lock } from 'lucide-react';
import ResilientImage from "@/app/components/ResilientImage";
import RollingNumber from "@/app/components/RollingNumber";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl hover:border-[#8A6305]/50 transition-colors group">
            {/* Product Thumbnail & Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <Link
                    href={`/products/${product.slug}`}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] bg-white dark:bg-zinc-800 p-1.5 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/5 overflow-hidden"
                >
                    <ResilientImage
                        src={primaryImage}
                        alt={displayName}
                        fill
                        sizes="80px"
                        className="object-contain"
                    />
                </Link>

                <div className="min-w-0 flex-1">
                    {/* Brand Pill */}
                    {product.brand && (
                        <span className="inline-block text-[10px] font-bold text-[#8A6305] dark:text-[#E5B54A] uppercase tracking-wider mb-0.5">
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
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {packagingLabel && (
                            <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200/60 dark:border-white/5">
                                {packagingLabel} {itemsPerPackageLabel && `(${itemsPerPackageLabel})`}
                            </span>
                        )}

                        {product.minOrder && product.minOrder > 1 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
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
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                {/* Price Display */}
                <div className="text-start sm:text-end">
                    {isLockedForGuest ? (
                        <Link
                            href="/account/login"
                            className="group/lock flex flex-col items-start sm:items-end"
                            title={isArabic ? "سجّل دخول التاجر لعرض سعر الجملة" : "Login to view wholesale price"}
                        >
                            <div className="flex items-center gap-1.5 select-none">
                                <span className="w-4 h-4 rounded bg-[#FAF6EC] dark:bg-[#8A6305]/20 border border-[#8A6305]/30 flex items-center justify-center shrink-0 group-hover/lock:border-[#8A6305] group-hover/lock:bg-[#8A6305] transition-colors">
                                    <Lock className="w-2.5 h-2.5 text-[#8A6305] group-hover/lock:text-white transition-colors" />
                                </span>
                                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 blur-[3px] group-hover/lock:blur-[2px] transition-all opacity-60 tracking-wider">
                                    88,500
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover/lock:text-[#8A6305] transition-colors mt-0.5">
                                {isArabic ? "سعر الجملة (سجّل)" : "Wholesale (Login)"}
                            </span>
                        </Link>
                    ) : !isPriceOnInquiry ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm sm:text-base font-black text-[#0B192C] dark:text-white">
                                    {formatPrice(Number(product.discountPrice || product.price))}
                                </span>
                                {product.discountPrice && (
                                    <span className="text-xs text-slate-400 line-through">
                                        {formatPrice(Number(product.price))}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                                {isArabic ? "سعر الجملة" : "Wholesale"}
                            </span>
                        </>
                    ) : (
                        <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A]">
                                {isArabic ? "السعر حسب الوكالة" : "Price on Inquiry"}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                                {isArabic ? "طلب تسعير جملة" : "Wholesale Quote"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Quick Add / Stepper / Quote CTA */}
                <div>
                    <motion.div
                        layout
                        transition={{
                            layout: { type: "spring", stiffness: 500, damping: 30, mass: 0.8 },
                        }}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {quantityInCart === 0 ? (
                                !isPriceOnInquiry ? (
                                    <motion.button
                                        key="ws-add"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        type="button"
                                        onClick={handleInitialAdd}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B192C] hover:bg-[#162740] dark:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        <span>{isArabic ? "إضافة" : "Add"}</span>
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        key="ws-quote"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        type="button"
                                        onClick={handleInitialAdd}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B192C] hover:bg-[#162740] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95 dark:bg-zinc-800 dark:border dark:border-white/10"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-[#E5B54A]" />
                                        <span>{isArabic ? "طلب تسعير" : "Quote"}</span>
                                    </motion.button>
                                )
                            ) : (
                                <motion.div
                                    key="ws-stepper"
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.85, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    dir="ltr"
                                    className="h-8 sm:h-9 rounded-xl flex items-stretch justify-between overflow-hidden select-none bg-[#0B192C] dark:bg-zinc-900 text-white border border-slate-700/80 dark:border-zinc-700"
                                >
                                    <button
                                        type="button"
                                        onClick={handleDecrease}
                                        className="w-8 h-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 active:scale-90 transition-colors cursor-pointer"
                                        aria-label="Decrease quantity"
                                        title={quantityInCart <= 1 ? (isArabic ? "حذف من الطلب" : "Remove") : undefined}
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="flex items-center justify-center px-2 select-none">
                                        <RollingNumber value={quantityInCart} className="text-xs font-black text-white" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleIncrease}
                                        className="w-8 h-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 active:scale-90 transition-colors cursor-pointer"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default WholesaleProductRow;
