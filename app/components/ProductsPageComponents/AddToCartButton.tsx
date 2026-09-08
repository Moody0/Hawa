"use client";

import React from 'react';
import { useCart } from '@/app/context/CartContext';
import { ShoppingCart, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: string | number;
    discountPrice?: string | number | null;
    images: string;
    minOrder?: number | null;
}

interface AddToCartButtonProps {
    product: Product;
    label: string;
    language: 'en' | 'ar';
    variant?: 'desktop' | 'mobile';
}

const AddToCartButton = ({ product, label, language, variant = 'desktop' }: AddToCartButtonProps) => {
    const { addItem } = useCart();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const minQuantity = Math.max(1, Number(product.minOrder) || 1);

        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.discountPrice || product.price),
            image: product.images.split(',').map((img: string) => img.trim()).filter(Boolean)[0],
            slug: product.slug,
            quantity: minQuantity,
            minOrder: minQuantity,
            description: product.description || undefined
        });
    };

    if (variant === 'mobile') {
        return (
            <button
                onClick={handleQuickAdd}
                className="lg:hidden absolute bottom-2 ltr:right-2 p-2 rtl:left-2 flex rounded-full bg-white/95 text-[#0B192C] hover:bg-[#0B192C] hover:text-[#E5B54A] transition-colors border border-slate-200 dark:bg-[#132035] dark:text-white dark:hover:bg-[#8A6305]"
                aria-label={label}
            >
                <Plus className="text-[18px]" />
            </button>
        );
    }

    return (
        <button
            onClick={handleQuickAdd}
            className="hidden lg:flex absolute bottom-4 left-4 right-4 items-center justify-center gap-2 rounded-xl bg-[#0B192C] py-2.5 xl:py-3 text-xs xl:text-sm font-bold text-white border border-[#0B192C] transition-all hover:bg-[#8A6305] hover:border-[#8A6305] opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white dark:hover:border-[#8A6305] active:scale-[0.98] cursor-pointer"
        >
            <ShoppingCart className="text-[18px]" />
            <span>{label}</span>
        </button>
    );
};

export default AddToCartButton;
