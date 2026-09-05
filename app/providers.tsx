"use client";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CustomerProvider } from "./context/CustomerContext";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import CartDrawer from "./components/CartDrawer";

export function Providers({ 
    children, 
    session, 
    initialExchangeRate = 135,
    initialLanguage = 'ar'
}: { 
    children: React.ReactNode, 
    session?: any, 
    initialExchangeRate?: number,
    initialLanguage?: 'en' | 'ar'
}) {
    const content = (
        <LanguageProvider initialLanguage={initialLanguage}>
            <CustomerProvider>
                <CurrencyProvider initialExchangeRate={initialExchangeRate}>
                    <CartProvider>
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                        {children}
                        <CartDrawer />
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: 'var(--color-surface-light)',
                                    color: 'var(--color-text-main-light)',
                                    border: '1px solid var(--color-background-dark)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#2E7D32',
                                        secondary: 'white',
                                    },
                                    style: {
                                        border: '1px solid rgba(46, 125, 50, 0.2)',
                                    }
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: 'white',
                                    },
                                    style: {
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                    }
                                },
                                className: 'dark:!bg-zinc-900 dark:!text-white dark:!border-white/10 font-sans',
                            }}
                        />
                    </ThemeProvider>
                </CartProvider>
            </CurrencyProvider>
        </CustomerProvider>
    </LanguageProvider>
    );

    if (session) {
        return <SessionProvider session={session}>{content}</SessionProvider>;
    }

    return content;
}
