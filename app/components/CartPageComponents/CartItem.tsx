"use client";

import React from 'react';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/app/context/CartContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { getSafeImageUrl } from '@/lib/image-utils';

import { useLanguage } from '@/app/context/LanguageContext';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';

interface CartItemProps {
    item: CartItemType;
    removeItem: (id: string, selectedOption?: string) => void;
    updateQuantity: (id: string, quantity: number, selectedOption?: string) => void;
}

const CartItem = ({ item, removeItem, updateQuantity }: CartItemProps) => {
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const { language } = useLanguage();
    const isLockedForGuest = !customer;

    return (
        <div className="flex items-center gap-4 md:gap-6 py-6 transition-all hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
            {/* Remove Button */}
            <button
                onClick={() => removeItem(item.id, item.selectedOption)}
                className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-2 shrink-0 flex items-center justify-center"
                aria-label="Remove item"
            >
                <span className="text-3xl font-light leading-none mb-1">×</span>
            </button>

            {/* Image */}
            <div className="shrink-0">
                <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    <img
                        src={getSafeImageUrl(item.image.split(',')[0])}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Content (Title/Price Left, Controls Right) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between flex-1 min-w-0 gap-4 md:gap-8">
                {/* Product Info */}
                <div className="flex flex-col gap-1.5 min-w-0">
                    <Link href={`/products/${item.slug}`} className="text-sm md:text-base font-bold text-[#0B192C] dark:text-white transition-colors hover:text-[#8A6305] dark:hover:text-[#8A6305] line-clamp-2">
                        {item.name}
                    </Link>
                    {item.selectedOption && (
                        <span className="text-xs font-bold text-[#8A6305] bg-[#8A6305]/10 border border-[#8A6305]/20 px-2 py-0.5 rounded w-fit">
                            {item.selectedOption}
                        </span>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-gray-300 px-2 py-0.5 rounded font-bold text-[11px]">
                            📦 {formatPackaging(item.packaging, language)}
                        </span>
                        {item.itemsPerPackage && (
                            <span className="text-[#475569] dark:text-gray-400 text-xs">
                                ({formatPackageItems(item.itemsPerPackage, language, { mode: 'cart' })})
                            </span>
                        )}
                    </div>
                    {isLockedForGuest ? (
                        <span className="text-[11px] font-bold text-[#8A6305]">
                            🔒 {language === 'ar' ? 'أسعار الجملة للتجار' : 'Wholesale (Login)'}
                        </span>
                    ) : item.price > 0 ? (
                        <p dir="ltr" className="text-xs md:text-sm font-extrabold text-[#0B192C] dark:text-white w-fit">
                            {formatPrice(item.price)}
                        </p>
                    ) : (
                        <span className="text-[11px] font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/20 px-2 py-0.5 rounded w-fit">
                            {language === 'ar' ? 'السعر عند الطلب' : 'Price on Inquiry'}
                        </span>
                    )}
                </div>

                {/* Controls and Total */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    {/* Pill Quantity */}
                    <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl h-10 px-2 w-[130px] bg-gray-50 dark:bg-zinc-800 shrink-0">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#8A6305] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base cursor-pointer font-bold"
                            aria-label="Decrease quantity"
                        >−</button>
                        <span className="flex-1 text-center font-bold text-xs sm:text-sm text-[#0B192C] dark:text-white select-none whitespace-nowrap">
                            {item.quantity} {formatPackaging(item.packaging, language, { short: true })}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOption)}
                            className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#8A6305] transition-colors text-base cursor-pointer font-bold"
                            aria-label="Increase quantity"
                        >+</button>
                    </div>

                    {/* Total */}
                    <div className="text-right rtl:text-left min-w-[90px] shrink-0">
                        {isLockedForGuest ? (
                            <span className="font-bold text-xs text-[#8A6305]">
                                🔒 {language === 'ar' ? 'للتجار المسجلين' : 'Merchants Only'}
                            </span>
                        ) : item.price > 0 ? (
                            <p dir="ltr" className="font-extrabold text-sm md:text-base text-[#0B192C] dark:text-white">
                                {formatPrice(item.price * item.quantity)}
                            </p>
                        ) : (
                            <span className="font-bold text-xs sm:text-sm text-[#8A6305]">
                                {language === 'ar' ? 'يحدد حسب الوكالة' : 'Agency Rate'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
