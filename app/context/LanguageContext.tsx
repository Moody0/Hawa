"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import ar from '@/app/locales/ar.json';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => any;
    dir: 'ltr' | 'rtl';
    isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLanguage: _initialLanguage = 'ar'
}: {
    children: React.ReactNode;
    initialLanguage?: Language;
}) {
    // Arabic is the single supported language. Keep the prop for backwards
    // compatibility, but do not allow stale client preferences to override it.
    const language: Language = 'ar';
    const [mounted, setMounted] = useState(false);
    const translations = ar;

    // Normalize preferences created by older bilingual builds without reloading.
    // Reloading here could create a visible loop for users with an old `en` value.
    useEffect(() => {
        setMounted(true);
        try {
            localStorage.setItem('language', 'ar');
            document.cookie = 'language=ar; path=/; max-age=31536000; SameSite=Lax';
        } catch (e) {
            console.warn('Could not normalize language preference', e);
        }
        document.documentElement.lang = language;
        document.documentElement.dir = 'rtl';
    }, [language]);

    // Keep the public API stable for existing components, but always persist Arabic.
    const setLanguage = useCallback((_lang: Language) => {
        try {
            localStorage.setItem('language', 'ar');
            document.cookie = 'language=ar; path=/; max-age=31536000; SameSite=Lax';
        } catch (e) {
            console.warn('Could not persist language immediately', e);
        }

        if (typeof window !== 'undefined') {
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
        }
    }, []);

    // Translation function with fallback
    const t = useCallback((key: string): any => {
        if (!translations) return key;

        const keys = key.split('.');
        let result: any = translations;

        for (const k of keys) {
            if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
                if (k in result) {
                    result = result[k];
                } else {
                    const foundKey = Object.keys(result).find(
                        existingKey => existingKey.toLowerCase() === k.toLowerCase()
                    );
                    if (foundKey) {
                        result = result[foundKey];
                    } else {
                        return key;
                    }
                }
            } else {
                return key;
            }
        }

        return typeof result === 'string' ? result : key;
    }, [translations]);

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            dir,
            isLoaded: mounted
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
