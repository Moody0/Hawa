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
    initialLanguage = 'ar'
}: {
    children: React.ReactNode;
    initialLanguage?: Language;
}) {
    const [language] = useState<Language>(initialLanguage);
    const [mounted, setMounted] = useState(false);
    const translations = language === 'en' ? en : ar;

    // Sync language on client mount if user had a saved preference that differs from server render
    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('language') as Language;
        const currentDocLang = (document.documentElement.lang || 'ar') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'ar') && savedLang !== currentDocLang) {
            document.cookie = `language=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
            window.location.reload();
        }
    }, []);

    // Sync document language & direction when language changes
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        try {
            localStorage.setItem('language', lang);
            document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
        } catch (e) {
            console.warn('Could not persist language immediately', e);
        }

        if (typeof window !== 'undefined') {
            // Smoothly fade out pointer interactions during reload without premature layout/direction jumps
            try {
                document.body.style.pointerEvents = 'none';
                document.body.style.transition = 'opacity 0.15s ease-out';
                document.body.style.opacity = '0.7';
            } catch {}
            // Reload page so all server and client components render atomically in the new language and direction
            window.location.reload();
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
