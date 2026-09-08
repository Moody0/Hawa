"use client";

import React from 'react';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/app/context/CartContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { getSafeImageUrl } from '@/lib/image-utils';
import ResilientImage from '@/app/components/ResilientImage';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';
import RollingNumber from '@/app/components/RollingNumber';
import { Trash2 } from 'lucide-react';

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
    const minQuantity = Math.max(1, Number(item.minOrder) || 1);

    return (
        <div className="flex items-center gap-3 py-5 sm:gap-5">
            {/* Remove Button */}
            <button
                onClick={() => removeItem(item.id, item.selectedOption)}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label={language === 'ar' ? `حذف ${item.name} من السلة` : `Remove ${item.name} from cart`}
            >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Image */}
            <div className="shrink-0">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-zinc-800 sm:h-24 sm:w-24">
                    <ResilientImage
                        src={getSafeImageUrl(item.image.split(',')[0])}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-contain"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Content (Title/Price Left, Controls Right) */}
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
                {/* Product Info */}
                <div className="flex flex-col gap-1.5 min-w-0">
                    <Link href={`/products/${item.slug}`} className="text-sm md:text-base font-bold text-[#0B192C] dark:text-white transition-colors hover:text-[#8A6305] dark:hover:text-[#8A6305] line-clamp-2">
                        {item.name}
                    </Link>
                    {item.selectedOption && (
                        <span className="w-fit text-xs font-bold text-[#8A6305]">
                            {item.selectedOption}
                        </span>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[11px] text-slate-700 dark:text-gray-300">
                            {formatPackaging(item.packaging, language)}
                        </span>
                        {item.itemsPerPackage && (
                            <span className="text-[#475569] dark:text-gray-400 text-xs">
                                ({formatPackageItems(item.itemsPerPackage, language, { mode: 'cart' })})
                            </span>
                        )}
                    </div>
                    {isLockedForGuest ? (
                        <span className="text-[11px] font-bold text-[#8A6305]">
                            {language === 'ar' ? 'السعر يؤكد بعد مراجعة الطلب' : 'Price confirmed after request review'}
                        </span>
                    ) : item.price > 0 ? (
                        <p dir="ltr" className="text-xs md:text-sm font-extrabold text-[#0B192C] dark:text-white w-fit">
                            {formatPrice(item.price)}
                        </p>
                    ) : (
                        <span className="w-fit text-[11px] font-bold text-[#8A6305]">
                            {language === 'ar' ? 'السعر عند الطلب' : 'Price on Inquiry'}
                        </span>
                    )}
                </div>

                {/* Controls and Total */}
                <div className="mt-1 flex w-full shrink-0 items-center justify-between gap-4 md:mt-0 md:w-auto md:justify-end">
                    {/* Pill Quantity */}
                    <div dir="ltr" className="flex h-10 w-[126px] shrink-0 items-center rounded-lg border border-slate-300 bg-white px-2 dark:border-white/15 dark:bg-zinc-800">
                        <button
                            onClick={() => {
                                if (item.quantity <= minQuantity) return;
                                updateQuantity(item.id, item.quantity - 1, item.selectedOption);
                            }}
                            disabled={item.quantity <= minQuantity}
                            className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#8A6305] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base cursor-pointer font-bold"
                            aria-label="Decrease quantity"
                        >−</button>
                        <span className="flex-1 text-center font-bold text-xs sm:text-sm text-[#0B192C] dark:text-white select-none whitespace-nowrap flex items-center justify-center gap-1">
                            <RollingNumber value={item.quantity} />
                            <span>{formatPackaging(item.packaging, language, { short: true })}</span>
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
                                {language === 'ar' ? 'بعد المراجعة' : 'After review'}
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
