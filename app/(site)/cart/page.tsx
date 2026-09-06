"use client";

import React from 'react';
import { useCart } from '@/app/context/CartContext';
import EmptyCart from '@/app/components/CartPageComponents/EmptyCart';
import CartItemsList from '@/app/components/CartPageComponents/CartItemsList';
import CartSummary from '@/app/components/CartPageComponents/CartSummary';

const CartPage = () => {
    const { items, removeItem, updateQuantity, subtotal, cartCount } = useCart();

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="grow w-full mx-auto container-custom py-4 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <CartItemsList
                    items={items}
                    cartCount={cartCount}
                    removeItem={removeItem}
                    updateQuantity={updateQuantity}
                />
                <div className="lg:col-span-4">
                    <CartSummary subtotal={subtotal} />
                </div>
            </div>
        </div>
    );
};

export default CartPage;
