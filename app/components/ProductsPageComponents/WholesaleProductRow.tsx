"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useCart } from "@/app/context/CartContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { formatPackaging, formatPackageItems } from "@/lib/packaging";
import { getBrandDisplayName } from "@/lib/brand-display";
import { Plus, Minus } from "lucide-react";
import ResilientImage from "@/app/components/ResilientImage";
import RollingNumber from "@/app/components/RollingNumber";
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

    const brandName = product.brand ? getBrandDisplayName(product.brand, isArabic ? "ar" : "en") : "";
    const cleanDisplayName = useMemo(() => {
        if (!brandName || !displayName) return displayName;
        const brandParts = brandName.split("-").map((s) => s.trim()).filter(Boolean);
        for (const part of brandParts) {
            const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`^${escaped}\\s+`, "i");
            if (regex.test(displayName)) {
                return displayName.replace(regex, "");
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

    const images =
        typeof product.images === "string"
            ? product.images.split(",").map((img) => img.trim()).filter(Boolean)
            : Array.isArray(product.images)
              ? product.images
              : [];
    const primaryImage = images[0] || "";

    const minQuantity = Math.max(1, Number(product.minOrder) || 1);

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
            description: displayDesc || undefined,
            selectedOption: defaultOption,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: minQuantity,
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
        if (quantityInCart <= minQuantity) {
            removeItem(product.id, defaultOption);
        } else {
            updateQuantity(product.id, quantityInCart - 1, defaultOption);
        }
    };

    const packagingLabel = formatPackaging(product.packaging, language);
    const itemsPerPackageLabel = formatPackageItems(product.itemsPerPackage, language);

    return (
        <div className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-zinc-900 hover:bg-[#FAF7F0] dark:hover:bg-zinc-800/70 border-b border-[#0B192C]/[0.08] dark:border-white/10 last:border-b-0 transition-colors duration-220">
            {/* Product Full-Size Studio Thumbnail & Details */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <Link
                    href={`/products/${product.slug}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[12px] bg-[#FAF7F0] dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900 p-0 flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                >
                    <ResilientImage
                        src={primaryImage}
                        alt={displayName}
                        fill
                        sizes="96px"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                </Link>

                <div className="min-w-0 flex-1">
                    {brandName && (
                        <div className="text-[11.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] mb-1">
                            {brandName}
                        </div>
                    )}

                    <Link
                        href={`/products/${product.slug}`}
                        className="block text-[14.5px] sm:text-[15.5px] font-bold text-[#0B192C] dark:text-white hover:text-[#8A6305] dark:hover:text-[#E5B54A] transition-colors truncate"
                    >
                        {cleanDisplayName}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                        {packagingLabel && (
                            <span>
                                {isArabic ? `وحدة التوريد: ${packagingLabel}` : `Unit: ${packagingLabel}`}
                                {itemsPerPackageLabel ? ` (${itemsPerPackageLabel})` : ""}
                            </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span>
                            {isArabic ? `أدنى طلب: ${minQuantity} ${packagingLabel}` : `Min: ${minQuantity} ${packagingLabel}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Price & Capsule Action */}
            <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#0B192C]/[0.08] dark:border-white/10">
                {!isLockedForGuest && !isPriceOnInquiry && (
                    <div className="text-start sm:text-end">
                        <div className="flex items-baseline gap-1.5" dir="ltr">
                            <span className="text-base sm:text-lg font-bold text-[#0B192C] dark:text-white">
                                {formatPrice(Number(product.discountPrice || product.price))}
                            </span>
                            {product.discountPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                    {formatPrice(Number(product.price))}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isArabic ? `لكل ${packagingLabel}` : `per ${packagingLabel}`}
                        </span>
                    </div>
                )}

                {quantityInCart === 0 ? (
                    <button
                        type="button"
                        onClick={handleInitialAdd}
                        className="h-9 px-4 rounded-full border border-[#0B192C]/15 dark:border-white/15 bg-white dark:bg-zinc-800 text-[#0B192C] dark:text-white group-hover:bg-[#C59329] group-hover:border-[#C59329] group-hover:text-[#0B192C] text-[12.5px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <span>+</span>
                        <span>{isArabic ? "أضف للطلبية" : "Add to Order"}</span>
                    </button>
                ) : (
                    <div
                        dir="ltr"
                        className="h-9 rounded-full bg-[#0B192C] dark:bg-[#C59329] text-white dark:text-[#0B192C] px-2 inline-flex items-center gap-1.5"
                    >
                        <button
                            type="button"
                            onClick={handleDecrease}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 dark:hover:bg-black/10 transition-colors cursor-pointer"
                            aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <RollingNumber value={quantityInCart} className="text-xs font-bold px-2" />
                        <button
                            type="button"
                            onClick={handleIncrease}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 dark:hover:bg-black/10 transition-colors cursor-pointer"
                            aria-label={isArabic ? "زيادة الكمية" : "Increase quantity"}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesaleProductRow;
