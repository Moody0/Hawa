"use client";

import React from 'react';
import { useCart } from '@/app/context/CartContext';
import EmptyCart from '@/app/components/CartPageComponents/EmptyCart';
import CartItemsList from '@/app/components/CartPageComponents/CartItemsList';
import CartSummary from '@/app/components/CartPageComponents/CartSummary';

function CartSkeleton() {
    return (
        <div className="grow w-full bg-[#F6F7F9] dark:bg-[#081524]">
            <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="h-9 w-40 rounded-lg bg-slate-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900 animate-pulse flex items-center gap-4"
                                >
                                    <div className="h-20 w-20 rounded-lg bg-slate-200 dark:bg-zinc-800 shrink-0" />
                                    <div className="flex-1 space-y-2.5">
                                        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-zinc-800" />
                                        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-zinc-800" />
                                        <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-zinc-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4">
                        <div className="h-72 rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900 animate-pulse space-y-4">
                            <div className="h-5 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-24 rounded bg-slate-100 dark:bg-zinc-800/60" />
                            <div className="h-11 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CartPage = () => {
    const { items, removeItem, updateQuantity, subtotal, cartCount, isHydrated } = useCart();

    if (!isHydrated) {
        return <CartSkeleton />;
    }

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="grow w-full bg-[#F6F7F9] dark:bg-[#081524]">
            <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
                <CartItemsList
                    items={items}
                    cartCount={cartCount}
                    removeItem={removeItem}
                    updateQuantity={updateQuantity}
                />
                <div className="lg:col-span-4">
                    <CartSummary
                        subtotal={subtotal}
                        hasUnpricedItems={items.some((item) => Number(item.price) <= 0)}
                    />
                </div>
            </div>
            </div>
        </div>
    );
};

export default CartPage;
