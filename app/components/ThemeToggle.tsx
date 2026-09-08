"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleLabel = isArabic ? "تبديل المظهر (فاتح / داكن)" : "Toggle theme (light / dark)";

    if (!mounted) {
        return (
            <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark border border-text-muted-light/10 text-text-main-light dark:text-text-main-dark"
                aria-label={toggleLabel}
            >
                <Sun className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark border border-text-muted-light/10 text-text-main-light dark:text-text-main-dark hover:scale-110 transition-transform cursor-pointer"
            aria-label={toggleLabel}
        >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
