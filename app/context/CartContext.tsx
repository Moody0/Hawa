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
    addItem: (item: CartItem) => void;
    removeItem: (id: string, selectedOption?: string) => void;
    updateQuantity: (id: string, quantity: number, selectedOption?: string) => void;
    clearCart: () => void;
    cartCount: number;
    totalItems: number;
    subtotal: number;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const getItemKey = (item: { id: string; selectedOption?: string }) => 
        `${item.id}:${item.selectedOption || ''}`;

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from local storage", error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (newItem: CartItem) => {
        setItems(prev => {
            const targetKey = getItemKey(newItem);
            const existing = prev.find(item => getItemKey(item) === targetKey);
            if (existing) {
                return prev.map(item =>
                    getItemKey(item) === targetKey
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prev, newItem];
        });
    };

    const removeItem = (id: string, selectedOption?: string) => {
        const targetKey = `${id}:${selectedOption || ''}`;
        setItems(prev => prev.filter(item => {
            if (selectedOption !== undefined) {
                return getItemKey(item) !== targetKey;
            }
            return item.id !== id;
        }));
    };

    const updateQuantity = (id: string, quantity: number, selectedOption?: string) => {
        if (quantity < 1) return;
        const targetKey = `${id}:${selectedOption || ''}`;
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

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, totalItems: cartCount, subtotal, isDrawerOpen, openDrawer, closeDrawer, toggleDrawer }}>
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
