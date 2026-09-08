"use client";

import React from 'react';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/app/context/CartContext';
import CartItem from './CartItem';
import { useLanguage } from '@/app/context/LanguageContext';
import { ArrowLeft } from 'lucide-react';

interface CartItemsListProps {
    items: CartItemType[];
    cartCount: number;
    removeItem: (id: string, selectedOption?: string) => void;
    updateQuantity: (id: string, quantity: number, selectedOption?: string) => void;
}

const CartItemsList = ({ items, cartCount, removeItem, updateQuantity }: CartItemsListProps) => {
    const { t, dir } = useLanguage();

    return (
        <div className="flex flex-col gap-5 lg:col-span-8">
            <div className="flex flex-col gap-1 border-b border-slate-300 pb-4 dark:border-white/10">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B192C] dark:text-white">{t('cart.yourCart')}</h1>
                <p className="text-xs font-medium text-[#475569] dark:text-gray-400">
                    {cartCount} {t('orderComplete.items')} · {dir === 'rtl' ? 'راجع الكميات قبل متابعة طلب التوريد' : 'Review quantities before continuing your supply request'}
                </p>
            </div>
            <div className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900 sm:px-5">
                {items.map(item => {
                    const itemKey = `${item.id}:${item.selectedOption || ''}`;
                    return (
                        <CartItem
                            key={itemKey}
                            item={item}
                            removeItem={removeItem}
                            updateQuantity={updateQuantity}
                        />
                    );
                })}
            </div>
            <div>
                <Link href="/products" className="relative inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#475569] hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors">
                    <ArrowLeft className={`text-base ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    {t('cart.continueShopping')}
                </Link>
            </div>
        </div>
    );
};

export default CartItemsList;
