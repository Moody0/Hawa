"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    slug: string;
    description?: string;
    selectedOption?: string;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
}

interface CartContextType {
    items: CartItem[];
    isHydrated: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: string, selectedOption?: string) => void;
    updateQuantity: (id: string, quantity: number, selectedOption?: string) => void;
    clearCart: () => void;
    cartCount: number;
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const getItemKey = (item: { id: string; selectedOption?: string | null }) => 
        `${item.id}:${(item.selectedOption || '').trim()}`;

    // Load from local storage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to parse cart from local storage", error);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addItem = (newItem: CartItem) => {
        const cleanOption = (newItem.selectedOption || '').trim() || undefined;
        const normalizedItem: CartItem = {
            ...newItem,
            selectedOption: cleanOption,
        };
        setItems(prev => {
            const targetKey = getItemKey(normalizedItem);
            const existing = prev.find(item => getItemKey(item) === targetKey);
            if (existing) {
                return prev.map(item =>
                    getItemKey(item) === targetKey
                        ? { ...item, quantity: item.quantity + normalizedItem.quantity }
                        : item
                );
            }
            return [...prev, normalizedItem];
        });
    };

    const removeItem = (id: string, selectedOption?: string) => {
        const targetKey = `${id}:${(selectedOption || '').trim()}`;
        setItems(prev => prev.filter(item => {
            if (selectedOption !== undefined) {
                return getItemKey(item) !== targetKey;
            }
            return item.id !== id;
        }));
    };

    const updateQuantity = (id: string, quantity: number, selectedOption?: string) => {
        if (quantity < 1) return;
        const targetKey = `${id}:${(selectedOption || '').trim()}`;
        setItems(prev => prev.map(item => {
            if (selectedOption !== undefined) {
                return getItemKey(item) === targetKey ? { ...item, quantity } : item;
            }
            return item.id === id ? { ...item, quantity } : item;
        }));
    };

    const clearCart = () => {
        setItems([]);
    };

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = items.length;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            items, 
            isHydrated,
            addItem, 
            removeItem, 
            updateQuantity, 
            clearCart, 
            cartCount, 
            totalItems: cartCount, 
            totalQuantity,
            subtotal, 
            isDrawerOpen, 
            openDrawer, 
            closeDrawer, 
            toggleDrawer 
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
