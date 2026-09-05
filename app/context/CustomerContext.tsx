'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from './LanguageContext';

export interface CustomerData {
    id: string;
    shopName: string;
    ownerName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string | null;
    createdAt?: string;
}

interface CustomerContextType {
    customer: CustomerData | null;
    isLoading: boolean;
    wishlistIds: string[];
    isFavorite: (productId: string) => boolean;
    toggleWishlist: (productId: string, productName?: string) => Promise<boolean>;
    login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (formData: {
        shopName: string;
        ownerName: string;
        phone: string;
        city: string;
        address: string;
        password: string;
        notes?: string;
    }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<CustomerData>) => Promise<{ success: boolean; error?: string }>;
    refetchCustomer: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const LOCAL_WISHLIST_KEY = 'hawa_local_wishlist';

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    // Load local wishlist if guest
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_WISHLIST_KEY);
            if (saved) {
                setWishlistIds(JSON.parse(saved));
            }
        } catch {}
    }, []);

    // Fetch authenticated customer
    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch('/api/customer/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.customer) {
                    setCustomer(data.customer);
                    if (Array.isArray(data.wishlistIds)) {
                        setWishlistIds(data.wishlistIds);
                        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(data.wishlistIds));
                    }
                } else {
                    setCustomer(null);
                }
            } else {
                setCustomer(null);
            }
        } catch {
            setCustomer(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const isFavorite = useCallback(
        (productId: string) => wishlistIds.includes(productId),
        [wishlistIds]
    );

    const toggleWishlist = async (productId: string, productName?: string): Promise<boolean> => {
        const currentlyFav = wishlistIds.includes(productId);
        const nextFav = !currentlyFav;

        // Optimistic update
        const updatedIds = nextFav
            ? [...wishlistIds, productId]
            : wishlistIds.filter((id) => id !== productId);

        setWishlistIds(updatedIds);
        try {
            localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(updatedIds));
        } catch {}

        if (customer) {
            try {
                const res = await fetch('/api/customer/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId }),
                });
                if (!res.ok) {
                    // Revert if failed
                    setWishlistIds(wishlistIds);
                }
            } catch {
                setWishlistIds(wishlistIds);
            }
        }

        if (nextFav) {
            toast.success(
                isArabic
                    ? `تم حفظ ${productName || 'المنتج'} في المفضلة ❤️`
                    : `Saved ${productName || 'product'} to favorites ❤️`,
                { duration: 2500 }
            );
        } else {
            toast(
                isArabic
                    ? `تمت إزالة ${productName || 'المنتج'} من المفضلة`
                    : `Removed ${productName || 'product'} from favorites`,
                { icon: '🤍', duration: 2000 }
            );
        }

        return nextFav;
    };

    const login = async (phone: string, password: string) => {
        try {
            const res = await fetch('/api/customer/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setCustomer(data.customer);
                await fetchSession();
                toast.success(isArabic ? 'أهلاً بك مجدداً!' : 'Welcome back!');
                return { success: true };
            } else {
                return { success: false, error: data.error || 'فشل تسجيل الدخول' };
            }
        } catch (err: any) {
            return { success: false, error: err.message || 'حدث خطأ في الاتصال' };
        }
    };

    const register = async (formData: {
        shopName: string;
        ownerName: string;
        phone: string;
        city: string;
        address: string;
        password: string;
        notes?: string;
    }) => {
        try {
            const res = await fetch('/api/customer/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setCustomer(data.customer);
                await fetchSession();
                toast.success(isArabic ? 'تم إنشاء حسابك التجاري بنجاح!' : 'Merchant account created!');
                return { success: true };
            } else {
                return { success: false, error: data.error || 'فشل إنشاء الحساب' };
            }
        } catch (err: any) {
            return { success: false, error: err.message || 'حدث خطأ في الاتصال' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/customer/auth/logout', { method: 'POST' });
        } catch {}
        setCustomer(null);
        toast(isArabic ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    };

    const updateProfile = async (data: Partial<CustomerData>) => {
        try {
            const res = await fetch('/api/customer/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const resData = await res.json();
            if (res.ok && resData.success) {
                setCustomer(resData.customer);
                toast.success(isArabic ? 'تم تحديث بيانات المحل' : 'Profile updated');
                return { success: true };
            }
            return { success: false, error: resData.error };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    return (
        <CustomerContext.Provider
            value={{
                customer,
                isLoading,
                wishlistIds,
                isFavorite,
                toggleWishlist,
                login,
                register,
                logout,
                updateProfile,
                refetchCustomer: fetchSession,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    const ctx = useContext(CustomerContext);
    if (!ctx) {
        throw new Error('useCustomer must be used within a CustomerProvider');
    }
    return ctx;
}
