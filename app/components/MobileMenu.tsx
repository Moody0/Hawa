"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import {
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
    MdAdd
} from 'react-icons/md';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

interface MobileCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    brandId?: string;
    brand?: {
        id: string;
        name: string;
        slug: string;
        group: string;
    } | null;
}

interface NavBrand {
    id: string;
    name: string;
    slug: string;
}

interface NavCategory {
    id: string;
    name: string;
    slug: string;
}

interface NavMainCategory {
    id: string;
    name: string;
    slug: string;
    brands: NavBrand[];
    categories: NavCategory[];
}

interface MobileMenuProps {
    initialCategories: MobileCategory[];
    navData?: NavMainCategory[];
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    isSearchOpen?: boolean;
    setIsSearchOpen?: (open: boolean) => void;
    hideTriggers?: boolean;
}

const MobileMenu = ({
    initialCategories,
    navData: incomingNavData,
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen,
    hideTriggers = false
}: MobileMenuProps) => {
    const { t, dir, language } = useLanguage();

    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isMobileMenuOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsMobileMenuOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

    const navData = incomingNavData || [];
    const [activeMainCatSlug, setActiveMainCatSlug] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(isMobileMenuOpen);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const activeMainCat = navData.find((mc) => mc.slug === activeMainCatSlug);

    if (!shouldRender) return null;

    return (
        <div className={`fixed top-[140px] left-0 right-0 bottom-0 z-[40] md:hidden transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} suppressHydrationWarning>
            <div
                className={`absolute top-0 inset-x-0 bottom-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar Content (Slides in from the left matching the hamburger button position) */}
            <div className={`absolute top-0 left-0 right-0 bottom-0 w-full bg-white dark:bg-surface-dark shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isAnimating ? 'translate-x-0' : '-translate-x-full'} overflow-hidden`}>

                {/* Navigation Container (Sliding Views) */}
                <div className="flex-1 relative overflow-hidden">

                    {/* Main Menu View */}
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeMainCatSlug ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className="flex flex-col h-full overflow-y-auto px-2 pt-4">

                            {/* Commercial Account Mobile CTA */}
                            <div className="p-3 mb-2">
                                <Link
                                    href="/account"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-3 px-4 rounded-xl bg-[#0B192C] hover:bg-[#0F172A] text-white flex items-center justify-center gap-2 font-black text-sm shadow-md transition-colors"
                                >
                                    <span className="text-[#8A6305]">👤</span>
                                    <span>{language === 'ar' ? 'حساب تجاري (بوابة التجار)' : 'Merchant Portal (Login/Register)'}</span>
                                </Link>
                            </div>

                            {/* Core Navigation Links */}
                            <div className="flex flex-col border-b border-gray-100 dark:border-white/10 pb-2 mb-2">
                                <Link
                                    href="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                                </Link>
                                <Link
                                    href="/about-us"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'من نحن' : 'About Us'}
                                </Link>
                                <Link
                                    href="/brands"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'وكالاتنا' : 'Our Agencies'}
                                </Link>
                                <Link
                                    href="/products"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'المنتجات' : 'Products'}
                                </Link>
                                <Link
                                    href="/services"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'خدمات التوزيع' : 'Distribution Services'}
                                </Link>
                                <Link
                                    href="/blog"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'المدونة' : 'Blog'}
                                </Link>
                                <Link
                                    href="/contact"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 px-4 font-bold text-sm text-[#0B192C] dark:text-white hover:text-[#8A6305] transition-colors"
                                >
                                    {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                                </Link>
                            </div>

                            {/* Dynamic Main Categories Header */}
                            {navData.length > 0 && (
                                <div className="px-4 pt-2 pb-1 text-xs font-black uppercase tracking-wider text-[#8A6305] dark:text-[#8A6305]">
                                    {language === 'ar' ? 'أقسام المنتجات' : 'Product Departments'}
                                </div>
                            )}

                            {/* Dynamic Main Categories */}
                            {navData.map((mc) => (
                                <div key={mc.id} className="border-b border-gray-50/50 dark:border-white/5">
                                    <button
                                        onClick={() => setActiveMainCatSlug(mc.slug)}
                                        className="w-full flex items-center justify-between py-3 px-4"
                                    >
                                        <span className="text-[15px] font-semibold text-[#0B192C] dark:text-gray-200">
                                            {language === 'ar' ? mc.name : (mc.name || mc.name)}
                                        </span>
                                        <MdKeyboardArrowRight className="text-2xl text-[rgb(46,46,46)] dark:text-white rtl:rotate-180" />
                                    </button>
                                </div>
                            ))}

                            {/* Social Footer */}
                            <div className="p-8 flex items-center justify-start gap-6 mt-auto">
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <FaWhatsapp className="text-xl" />
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <FaInstagram className="text-xl" />
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <FaFacebook className="text-xl" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Sub Menu View (Main Category Detail) */}
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeMainCatSlug ? 'translate-x-0' : 'translate-x-full'}`}>
                        {activeMainCat && (
                            <div className="flex flex-col h-full bg-white dark:bg-surface-dark">
                                {/* Back Button Header */}
                                <div className="border-b border-gray-100 dark:border-white/10 px-4 py-4 flex items-center justify-between">
                                    <button
                                        onClick={() => { setActiveMainCatSlug(null); setExpandedSection(null); }}
                                        className="flex items-center gap-2 text-[rgb(46,46,46)] dark:text-white hover:text-black transition-colors"
                                    >
                                        <MdKeyboardArrowLeft className="text-2xl rtl:rotate-180" />
                                        <span className="text-[16px] font-medium">{activeMainCat.name}</span>
                                    </button>
                                    <Link
                                        href={`/department/${activeMainCat.slug}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-[13px] font-semibold text-[#0B192C] dark:text-white hover:text-[#8A6305] underline"
                                    >
                                        {language === 'ar' ? 'عرض الكل' : 'View All'}
                                    </Link>
                                </div>

                                {/* Accordion Sections */}
                                <div className="flex-1 overflow-y-auto px-2">
                                    <div className="flex flex-col pt-2">

                                        {/* Brands Section */}
                                        {activeMainCat.brands.length > 0 && (
                                             <div className="border-b border-gray-100/60 dark:border-white/5">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'brands' ? null : 'brands')}
                                                    className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <span className="text-[15px] font-bold text-[#0B192C] dark:text-white uppercase tracking-wider">
                                                        {language === 'ar' ? 'الماركات' : 'Brands'}
                                                    </span>
                                                    <MdAdd className={`text-2xl text-[#475569] dark:text-white transition-transform duration-300 ${expandedSection === 'brands' ? 'rotate-45 text-[#0B192C] dark:text-white' : ''}`} />
                                                </button>
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'brands' ? 'max-h-[500px] border-t border-gray-100/50 dark:border-white/5 bg-gray-50/45 dark:bg-white/5' : 'max-h-0'}`}>
                                                    <div className="py-2 px-6 flex flex-col gap-1">
                                                        {activeMainCat.brands.map((brand) => (
                                                            <Link
                                                                key={brand.id}
                                                                href={`/brands/${brand.slug}`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="flex items-center py-3 text-[15px] font-medium text-[#475569] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-white border-b border-gray-100/50 dark:border-white/5 last:border-b-0 transition-colors"
                                                            >
                                                                {brand.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Categories Section */}
                                        {activeMainCat.categories.length > 0 && (
                                            <div className="border-b border-gray-100/60 dark:border-white/5">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                                                    className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <span className="text-[15px] font-bold text-[#0B192C] dark:text-white uppercase tracking-wider">
                                                        {language === 'ar' ? 'الأقسام' : 'Categories'}
                                                    </span>
                                                    <MdAdd className={`text-2xl text-[#475569] dark:text-white transition-transform duration-300 ${expandedSection === 'categories' ? 'rotate-45 text-[#0B192C] dark:text-white' : ''}`} />
                                                </button>
                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'categories' ? 'max-h-[500px] border-t border-gray-100/50 dark:border-white/5 bg-gray-50/45 dark:bg-white/5' : 'max-h-0'}`}>
                                                    <div className="py-2 px-6 flex flex-col gap-1">
                                                        {activeMainCat.categories.map((cat) => (
                                                            <Link
                                                                key={cat.id}
                                                                href={`/categories/${cat.slug}`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="flex items-center py-3 text-[15px] font-medium text-[#475569] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-white border-b border-gray-100/50 dark:border-white/5 last:border-b-0 transition-colors"
                                                            >
                                                                {cat.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MobileMenu;
