"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { formatPackaging } from '@/lib/packaging';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export interface PurchaseProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    price: number;
    discountPrice?: number | null;
    hidePrice?: boolean;
    image: string;
    slug: string;
    options?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
}

interface ProductPurchaseContextType {
    product: PurchaseProduct;
    stock?: number;
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    handleIncrement: () => void;
    handleDecrement: () => void;
    selectedOption: string;
    setSelectedOption: (opt: string) => void;
    parsedOptions: string[];
    hasOptions: boolean;
    isValidSelection: boolean;
    isOutOfStock: boolean;
    effectivePrice: number;
    displayName: string;
    displayDesc: string;
    handleAddToCart: () => boolean;
    handleBuyNow: () => boolean;
}

const ProductPurchaseContext = createContext<ProductPurchaseContextType | undefined>(undefined);

export function ProductPurchaseProvider({
    children,
    product,
    stock,
}: {
    children: React.ReactNode;
    product: PurchaseProduct;
    stock?: number;
}) {
    const { addItem } = useCart();
    const { language } = useLanguage();
    const router = useRouter();
    const isArabic = language === 'ar';

    const minimumQuantity = Math.max(1, product.minOrder || 1);
    const [quantity, setQuantity] = useState(minimumQuantity);

    const parsedOptions = useMemo(() => {
        return product.options
            ? product.options.split(',').map((o) => o.trim()).filter(Boolean)
            : [];
    }, [product.options]);

    const hasOptions = parsedOptions.length > 0;
    const [selectedOption, setSelectedOption] = useState<string>(
        hasOptions ? parsedOptions[0] : ''
    );

    const isValidSelection = !hasOptions || Boolean(selectedOption && parsedOptions.includes(selectedOption));
    const isOutOfStock = typeof stock === 'number' && stock <= 0;
    const effectivePrice = Number(product.discountPrice || product.price);

    const displayName = (isArabic ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const displayDesc = isArabic
        ? (product.descriptionAr || product.description || '')
        : (product.descriptionEn || product.description || '');

    const handleIncrement = useCallback(() => {
        if (isOutOfStock) return;
        setQuantity((prev) => prev + 1);
    }, [isOutOfStock]);

    const handleDecrement = useCallback(() => {
        setQuantity((prev) => (prev > minimumQuantity ? prev - 1 : prev));
    }, [minimumQuantity]);

    const ensureValidSelection = useCallback((): boolean => {
        if (isOutOfStock) return false;
        if (hasOptions && (!selectedOption || !parsedOptions.includes(selectedOption))) {
            toast.error(
                isArabic
                    ? 'يرجى اختيار المقاس أو الخيار المطلوب أولاً'
                    : 'Please select an option / variant first'
            );
            const target = document.getElementById('product-options-selector') || document.getElementById('product-actions-section');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }
        return true;
    }, [hasOptions, selectedOption, parsedOptions, isOutOfStock, isArabic]);

    const handleAddToCart = useCallback((): boolean => {
        if (!ensureValidSelection()) return false;

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
            minOrder: minimumQuantity,
        });

        const optionLabel = hasOptions && selectedOption ? ` (${selectedOption.trim()})` : '';
        toast.success(
            isArabic
                ? `تمت إضافة ${quantity} ${formatPackaging(product.packaging, 'ar')}${optionLabel} إلى الطلبية`
                : `Added ${quantity} ${formatPackaging(product.packaging, 'en')}${optionLabel} to order`
        );
        return true;
    }, [ensureValidSelection, addItem, product, displayName, effectivePrice, quantity, displayDesc, hasOptions, selectedOption, language, minimumQuantity, isArabic]);

    const handleBuyNow = useCallback((): boolean => {
        if (!ensureValidSelection()) return false;

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
            minOrder: minimumQuantity,
        });

        router.push('/place-order');
        return true;
    }, [ensureValidSelection, addItem, product, displayName, effectivePrice, quantity, displayDesc, hasOptions, selectedOption, language, minimumQuantity, router]);

    return (
        <ProductPurchaseContext.Provider
            value={{
                product,
                stock,
                quantity,
                setQuantity,
                handleIncrement,
                handleDecrement,
                selectedOption,
                setSelectedOption,
                parsedOptions,
                hasOptions,
                isValidSelection,
                isOutOfStock,
                effectivePrice,
                displayName,
                displayDesc,
                handleAddToCart,
                handleBuyNow,
            }}
        >
            {children}
        </ProductPurchaseContext.Provider>
    );
}

export function useProductPurchase() {
    return useContext(ProductPurchaseContext);
}
