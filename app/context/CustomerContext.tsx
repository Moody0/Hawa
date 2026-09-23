'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
    login: (phone: string, password: string) => Promise<{ success: boolean; isPending?: boolean; error?: string; shopName?: string; phone?: string }>;
    register: (formData: {
        shopName: string;
        ownerName: string;
        phone: string;
        city: string;
        address: string;
        password: string;
        notes?: string;
    }) => Promise<{ success: boolean; pendingApproval?: boolean; message?: string; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<CustomerData>) => Promise<{ success: boolean; error?: string }>;
    refetchCustomer: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const abortRef = useRef<AbortController | null>(null);

    // Fetch authenticated customer session
    const fetchSession = useCallback(async () => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch('/api/customer/auth/me', {
                signal: controller.signal,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.customer) {
                    setCustomer(data.customer);
                } else {
                    setCustomer(null);
                }
            } else {
                setCustomer(null);
            }
        } catch (err: unknown) {
            if ((err as Error)?.name !== 'AbortError') {
                setCustomer(null);
            }
        } finally {
            if (abortRef.current === controller) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchSession();
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [fetchSession]);

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
            } else if (res.status === 403 && data.error === 'ACCOUNT_PENDING') {
                return { 
                    success: false, 
                    isPending: true, 
                    error: data.message || 'حسابك التجاري قيد المراجعة والتدقيق',
                    shopName: data.shopName,
                    phone: data.phone
                };
            } else {
                return { success: false, error: data.error || (isArabic ? 'فشل تسجيل الدخول' : 'Login failed') };
            }
        } catch (err: unknown) {
            return { success: false, error: (err as Error)?.message || (isArabic ? 'حدث خطأ في الاتصال' : 'Network error') };
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
                // If pending approval, we don't set customer session yet
                if (data.pendingApproval) {
                    return { 
                        success: true, 
                        pendingApproval: true, 
                        message: data.message 
                    };
                }
                setCustomer(data.customer);
                await fetchSession();
                toast.success(isArabic ? 'تم إنشاء حسابك التجاري بنجاح!' : 'Merchant account created!');
                return { success: true };
            } else {
                return { success: false, error: data.error || (isArabic ? 'فشل إنشاء الحساب' : 'Registration failed') };
            }
        } catch (err: unknown) {
            return { success: false, error: (err as Error)?.message || (isArabic ? 'حدث خطأ في الاتصال' : 'Network error') };
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
        } catch (err: unknown) {
            return { success: false, error: (err as Error)?.message };
        }
    };

    return (
        <CustomerContext.Provider
            value={{
                customer,
                isLoading,
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
