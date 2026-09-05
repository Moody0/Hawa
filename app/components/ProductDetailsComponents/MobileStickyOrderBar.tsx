"use client";

import React, { useState } from 'react';
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { MdRemove, MdAdd, MdShoppingBag } from "react-icons/md";
import toast from 'react-hot-toast';
import { formatPackaging } from "@/lib/packaging";

interface MobileStickyOrderBarProps {
    product: {
        id: string;
        name: string;
        nameAr?: string | null;
        nameEn?: string | null;
        price: number;
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
}

export default function MobileStickyOrderBar({ product }: MobileStickyOrderBarProps) {
    const { addItem } = useCart();
    const { language, dir } = useLanguage();
    const { formatPrice } = useCurrency();
    const [quantity, setQuantity] = useState(product.minOrder || 1);

    const displayName = (language === 'ar' ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const displayDesc = language === 'ar'
        ? (product.descriptionAr || product.description)
        : (product.descriptionEn || product.description);

    const handleDecrement = () => {
        const min = product.minOrder || 1;
        if (quantity > min) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrement = () => {
        setQuantity(quantity + 1);
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.price),
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            description: displayDesc || undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        toast.success(language === 'ar' ? `تمت إضافة ${quantity} ${formatPackaging(product.packaging, 'ar')} إلى السلة` : `Added ${quantity} ${formatPackaging(product.packaging, 'en', { short: false }).toLowerCase()}(s) to cart`);
    };

    return (
        <aside 
            aria-label={language === 'ar' ? 'شريط الطلب السريع' : 'Quick order bar'}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-white/10 px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
            dir={dir}
        >
            <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
                {/* Price / Inquiry Info */}
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#475569] font-medium truncate">
                        {formatPackaging(product.packaging, language)}
                    </span>
                    {!product.hidePrice && Number(product.price) > 0 ? (
                        <span className="text-sm font-extrabold text-[#0B192C] dark:text-white leading-tight">
                            {formatPrice(Number(product.price))}
                        </span>
                    ) : (
                        <span className="text-[11px] font-extrabold text-[#8A6305] leading-tight whitespace-nowrap">
                            {language === 'ar' ? 'السعر يحدد حسب الوكالة' : 'Price on Inquiry'}
                        </span>
                    )}
                </div>

                {/* Stepper (Carton Count) */}
                <div className="flex items-center h-10 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-zinc-800/80 px-1 shrink-0">
                    <button
                        onClick={handleDecrement}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-[#8A6305] active:scale-95 transition-all cursor-pointer"
                        aria-label="Decrease quantity"
                    >
                        <MdRemove size={16} />
                    </button>
                    <span className="px-2 text-center text-xs font-extrabold text-[#0B192C] dark:text-white select-none whitespace-nowrap">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrement}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-[#8A6305] active:scale-95 transition-all cursor-pointer"
                        aria-label="Increase quantity"
                    >
                        <MdAdd size={16} />
                    </button>
                </div>

                {/* Primary CTA */}
                <button
                    onClick={handleAddToCart}
                    className="flex-1 h-10 bg-[#2E7D32] hover:bg-[#256628] active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer px-2"
                >
                    <MdShoppingBag className="text-base shrink-0" />
                    <span className="truncate">{language === 'ar' ? 'إضافة للطلبية' : 'Add to Order'}</span>
                </button>
            </div>
        </aside>
    );
}
