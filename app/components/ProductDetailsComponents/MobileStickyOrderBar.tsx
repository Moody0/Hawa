"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from "@/app/context/CartContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Minus, Plus, ShoppingBag, Lock } from 'lucide-react';
import { formatPackaging } from "@/lib/packaging";
import RollingNumber from "@/app/components/RollingNumber";
import toast from 'react-hot-toast';
import { useProductPurchase } from "@/app/context/ProductPurchaseContext";

interface MobileStickyOrderBarProps {
    product: {
        id: string;
        name: string;
        nameAr?: string | null;
        nameEn?: string | null;
        price: number;
        discountPrice?: number | null;
        image: string;
        slug: string;
        options?: string | null;
        description?: string | null;
        descriptionAr?: string | null;
        descriptionEn?: string | null;
        packaging?: string | null;
        itemsPerPackage?: string | number | null;
        minOrder?: number | null;
        hidePrice?: boolean;
    };
    stock?: number;
}

export default function MobileStickyOrderBar({ product, stock }: MobileStickyOrderBarProps) {
    const purchaseContext = useProductPurchase();
    const { addItem } = useCart();
    const { customer } = useCustomer();
    const { language, dir } = useLanguage();
    const { formatPrice } = useCurrency();
    const [localQuantity, setLocalQuantity] = useState(product.minOrder || 1);
    const [isVisible, setIsVisible] = useState(false);

    const isArabic = language === 'ar';
    const isLockedForGuest = !customer;
    const minimumQuantity = product.minOrder || 1;
    const isOutOfStock = typeof stock === 'number' && stock <= 0;

    const parsedOptions = purchaseContext?.parsedOptions ?? (product.options 
        ? product.options.split(',').map(o => o.trim()).filter(Boolean)
        : []);
    const hasOptions = parsedOptions.length > 0;

    const quantity = purchaseContext ? purchaseContext.quantity : localQuantity;
    const selectedOption = purchaseContext ? purchaseContext.selectedOption : (hasOptions ? parsedOptions[0] : "");
    const effectivePrice = purchaseContext ? purchaseContext.effectivePrice : Number(product.discountPrice || product.price);

    useEffect(() => {
        const target = document.getElementById('product-actions-section');
        if (!target) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show sticky bar ONLY when the main in-page buy box is scrolled off screen
                setIsVisible(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    const displayName = (isArabic ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const displayDesc = isArabic
        ? (product.descriptionAr || product.description)
        : (product.descriptionEn || product.description);

    const handleDecrement = () => {
        if (purchaseContext) {
            purchaseContext.handleDecrement();
        } else if (quantity > minimumQuantity) {
            setLocalQuantity(quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (purchaseContext) {
            purchaseContext.handleIncrement();
        } else if (!isOutOfStock) {
            setLocalQuantity(quantity + 1);
        }
    };

    const handleAddToCart = () => {
        if (purchaseContext) {
            purchaseContext.handleAddToCart();
            return;
        }
        if (isOutOfStock) return;
        if (hasOptions && (!selectedOption || !parsedOptions.includes(selectedOption))) {
            toast.error(isArabic ? 'يرجى اختيار المقاس أو الخيار المطلوب أولاً' : 'Please select an option first');
            const target = document.getElementById('product-options-selector') || document.getElementById('product-actions-section');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        addItem({
            id: product.id,
            name: displayName,
            price: effectivePrice,
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            description: displayDesc || undefined,
            selectedOption: hasOptions ? selectedOption.trim() : undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        const optionLabel = hasOptions && selectedOption ? ` (${selectedOption.trim()})` : '';
        toast.success(
            isArabic
                ? `تمت إضافة ${quantity} ${formatPackaging(product.packaging, 'ar')}${optionLabel} إلى الطلبية`
                : `Added ${quantity} ${formatPackaging(product.packaging, 'en')}${optionLabel} to order`
        );
    };

    return (
        <aside 
            aria-label={isArabic ? 'شريط الطلب السريع' : 'Quick order bar'}
            className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-20px_rgba(11,25,44,0.4)] transition-all duration-300 ease-out ${
                isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
            }`}
            dir={dir}
        >
            <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
                {/* Price / Inquiry Info */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] text-[#475569] font-medium truncate">
                            {formatPackaging(product.packaging, language)}
                        </span>
                        {hasOptions && selectedOption && (
                            <span className="text-[10px] font-bold text-[#8A6305] dark:text-[#E5B54A] bg-[#8A6305]/10 px-1.5 py-0.5 rounded truncate max-w-[90px]">
                                {selectedOption}
                            </span>
                        )}
                    </div>
                    {isLockedForGuest ? (
                        <div className="flex items-center gap-1.5 select-none">
                            <span className="w-3.5 h-3.5 rounded bg-[#FAF6EC] dark:bg-[#8A6305]/20 border border-[#8A6305]/30 flex items-center justify-center shrink-0">
                                <Lock className="w-2 h-2 text-[#8A6305]" />
                            </span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 blur-[2.5px] opacity-60">
                                88,500
                            </span>
                            <span className="text-[10px] font-bold text-[#8A6305]">
                                {language === 'ar' ? 'سعر الجملة' : 'Wholesale'}
                            </span>
                        </div>
                    ) : !product.hidePrice && effectivePrice > 0 ? (
                        <span className="text-sm font-extrabold text-[#0B192C] dark:text-white leading-tight">
                            {formatPrice(effectivePrice)}
                        </span>
                    ) : (
                        <span className="text-[11px] font-extrabold text-[#8A6305] leading-tight whitespace-nowrap">
                            {language === 'ar' ? 'السعر يحدد حسب الوكالة' : 'Price on Inquiry'}
                        </span>
                    )}
                </div>

                {/* Stepper (Carton Count) */}
                <div dir="ltr" className="flex items-center h-10 border border-slate-200 dark:border-white/10 rounded-[10px] bg-slate-50 dark:bg-zinc-800/80 px-1 shrink-0">
                    <button
                        onClick={handleDecrement}
                        disabled={quantity <= minimumQuantity || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-gray-200 hover:text-[#8A6305] active:scale-95 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Decrease quantity"
                    >
                        <Minus size={16} />
                    </button>
                    <div className="px-2 flex items-center justify-center select-none">
                        <RollingNumber value={quantity} className="text-xs font-extrabold text-[#0B192C] dark:text-white" />
                    </div>
                    <button
                        onClick={handleIncrement}
                        disabled={isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-gray-200 hover:text-[#8A6305] active:scale-95 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Increase quantity"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Primary CTA */}
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 h-10 bg-[#0B192C] hover:bg-[#8A6305] active:scale-95 text-white rounded-[10px] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer px-2 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white dark:disabled:bg-zinc-700 dark:disabled:text-slate-400"
                >
                    <ShoppingBag className="text-base shrink-0" />
                    <span className="truncate">{isOutOfStock ? (isArabic ? 'غير متوفر' : 'Out of stock') : (isArabic ? 'إضافة للطلبية' : 'Add to Order')}</span>
                </button>
            </div>
        </aside>
    );
}
