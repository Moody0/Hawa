"use client";

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { getSafeImageUrl } from '@/lib/image-utils';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';
import ResilientImage from '@/app/components/ResilientImage';

interface OrderItem {
    id: string;
    options?: string | null;
    product: {
        images: string;
        name: string;
        nameAr?: string | null;
        packaging?: string | null;
        itemsPerPackage?: number | string | null;
    };
    quantity: number;
    price?: number;
}

interface OrderItemsSelectionProps {
    items: OrderItem[];
    showPrices?: boolean;
}

const OrderItemsSelection = ({ items, showPrices = true }: OrderItemsSelectionProps) => {
    const { language, dir } = useLanguage();
    const { formatPrice } = useCurrency();
    const isArabic = language === 'ar';

    return (
        <div className="bg-gray-50/60 dark:bg-zinc-800/40 p-4 sm:p-6 border-t border-gray-200 dark:border-white/10" dir={dir}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white uppercase tracking-wider">
                    {isArabic ? 'تفاصيل المنتجات والطرود المطلوبة' : 'Ordered Wholesale Items'}
                </h3>
                <span className="text-xs font-semibold text-[#475569] dark:text-gray-400">
                    {items.reduce((acc, i) => acc + i.quantity, 0)} {isArabic ? 'طرد إجمالي' : 'Total Cartons'}
                </span>
            </div>

            <div className="divide-y divide-gray-200/70 dark:divide-white/10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                {items.map((item) => {
                    const primaryImage = item.product.images
                        ? item.product.images.split(',').map((img: string) => img.trim()).filter(Boolean)[0]
                        : '';
                    const title = (isArabic ? item.product.nameAr : item.product.name) || item.product.name;
                    const packagingUnit = formatPackaging(item.product.packaging, language);

                    return (
                        <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 dark:bg-zinc-800 rounded-lg p-1 shrink-0 border border-gray-200/60 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                    <ResilientImage
                                        src={getSafeImageUrl(primaryImage)}
                                        alt={title}
                                        className="w-full h-full object-contain"
                                        sizes="56px"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white truncate">
                                        {title}
                                    </p>
                                    <div className="flex items-center flex-wrap gap-2 text-[11px] text-[#475569] dark:text-gray-400 mt-0.5">
                                        <span className="font-semibold text-[#0B192C] dark:text-[#8A6305]">
                                            {item.quantity} {packagingUnit}
                                        </span>
                                        {item.options && (
                                            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                {item.options}
                                            </span>
                                        )}
                                        {item.product.itemsPerPackage && (
                                            <span className="text-gray-400">
                                                ({formatPackageItems(item.product.itemsPerPackage, language, { mode: 'badge' })})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-end shrink-0">
                                {showPrices && item.price !== undefined && item.price > 0 ? (
                                    <p className="text-xs sm:text-sm font-extrabold text-[#0B192C] dark:text-white" dir="ltr">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-bold text-[#8A6305] bg-[#8A6305]/10 px-2 py-0.5 rounded border border-[#8A6305]/20 whitespace-nowrap">
                                        {isArabic ? 'السعر بعد المراجعة' : 'Price after review'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderItemsSelection;
