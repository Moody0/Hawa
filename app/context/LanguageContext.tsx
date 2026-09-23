"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import ar from '@/app/locales/ar.json';
import en from '@/app/locales/en.json';

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
    initialLanguage = 'ar',
    scope = 'site'
}: {
    children: React.ReactNode;
    initialLanguage?: Language;
    scope?: 'site' | 'admin';
}) {
    // The public storefront stays Arabic; the admin has its own saved preference.
    const [adminLanguage, setAdminLanguage] = useState<Language>(initialLanguage);
    const language: Language = scope === 'admin' ? adminLanguage : 'ar';
    const [mounted, setMounted] = useState(false);
    const translations = language === 'en' ? en : ar;

    useEffect(() => {
        if (scope === 'admin') {
            try {
                setAdminLanguage(localStorage.getItem('admin-language') === 'en' ? 'en' : 'ar');
            } catch (e) {
                console.warn('Could not read admin language preference', e);
            }
        }
        setMounted(true);
    }, [scope]);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        return () => {
            if (scope === 'admin') {
                document.documentElement.lang = 'ar';
                document.documentElement.dir = 'rtl';
            }
        };
    }, [language, scope]);

    const setLanguage = useCallback((lang: Language) => {
        if (scope !== 'admin') return;
        setAdminLanguage(lang);
        try {
            localStorage.setItem('admin-language', lang);
        } catch (e) {
            console.warn('Could not save admin language preference', e);
        }
    }, [scope]);

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
