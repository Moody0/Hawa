"use client";

import React from 'react';
import { useCart } from '@/app/context/CartContext';
import { MdAddShoppingCart, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';

interface Product {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: string | number;
    discountPrice?: string | number | null;
    images: string;
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

        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.discountPrice || product.price),
            image: product.images.split(',').map((img: string) => img.trim()).filter(Boolean)[0],
            slug: product.slug,
            quantity: 1,
            description: product.description || undefined
        });

        toast.success(language === 'ar' ? `تمت إضافة ${product.name} إلى السلة` : `Added ${product.name} to cart`);
    };

    if (variant === 'mobile') {
        return (
            <button
                onClick={handleQuickAdd}
                className="lg:hidden absolute bottom-2 ltr:right-2 p-2 rtl:left-2 flex rounded-full bg-white/95 text-[#0B192C] hover:bg-[#2E7D32] hover:text-white transition-colors border border-gray-200"
                aria-label={label}
            >
                <MdAdd className="text-[18px]" />
            </button>
        );
    }

    return (
        <button
            onClick={handleQuickAdd}
            className="hidden lg:flex absolute bottom-4 left-4 right-4 items-center justify-center gap-2 rounded-lg bg-white/95 py-3 text-sm font-bold text-[#0B192C] border border-gray-200/80 transition-all hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#1A1A14] dark:text-white dark:hover:bg-[#2E7D32]"
        >
            <MdAddShoppingCart className="text-[18px]" />
            <span>{label}</span>
        </button>
    );
};

export default AddToCartButton;
