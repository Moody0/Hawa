'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const { dir } = useLanguage();
    const isArabic = dir === 'rtl';

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY || document.documentElement.scrollTop;
                    setIsVisible(scrollY > 280);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    type="button"
                    onClick={scrollToTop}
                    initial={{ opacity: 0, scale: 0.6, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: 16 }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    aria-label={isArabic ? 'العودة إلى أعلى الصفحة' : 'Scroll to top'}
                    title={isArabic ? 'العودة إلى أعلى الصفحة' : 'Scroll to top'}
                    className="fixed bottom-6 start-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#8A6305] hover:bg-[#735204] text-white flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6305] focus-visible:ring-offset-2"
                >
                    <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
