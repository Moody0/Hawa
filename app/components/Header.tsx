'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { MdOutlineShoppingBag, MdMenu, MdClose, MdKeyboardArrowDown, MdPerson } from 'react-icons/md';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import HeaderSearch from './HeaderSearch';
import MobileMenu from './MobileMenu';
import CurrencyToggle from './CurrencyToggle';
import LanguageToggle from './LanguageToggle';
import MegaMenu, { type NavMainCategory } from './HeaderComponents/MegaMenu';
import TopBar from './HeaderComponents/TopBar';

interface HeaderCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
}

interface HeaderProps {
    initialCategories?: HeaderCategory[];
    initialNavData?: NavMainCategory[];
    dir: 'ltr' | 'rtl';
    language: 'en' | 'ar';
}

const Header = ({ initialCategories = [], initialNavData = [], dir }: HeaderProps) => {
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const { totalItems, openDrawer } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [manualToggle, setManualToggle] = useState(false);
    const isNavVisible = !isScrolled || manualToggle;
    const isScrolledRef = useRef(false);

    // Mega menu state
    const navData = initialNavData;
    const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Adaptive Visible Items & More Dropdown
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1536) {
                setVisibleCount(8);
            } else if (width >= 1280) {
                setVisibleCount(6);
            } else if (width >= 1080) {
                setVisibleCount(5);
            } else {
                setVisibleCount(4);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMoreEnter = () => {
        if (moreTimeoutRef.current) {
            clearTimeout(moreTimeoutRef.current);
            moreTimeoutRef.current = null;
        }
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveMegaMenu(null);
        setIsMoreOpen(true);
    };

    const handleMoreLeave = () => {
        moreTimeoutRef.current = setTimeout(() => {
            setIsMoreOpen(false);
        }, 120);
    };

    React.useEffect(() => {
        let ticking = false;

        const updateScroll = () => {
            const currentScrollY = window.scrollY;
            
            // If we are at the very top, always show navbar
            if (currentScrollY <= 10) {
                if (isScrolledRef.current) {
                    isScrolledRef.current = false;
                    setIsScrolled(false);
                    setManualToggle(false);
                }
                ticking = false;
                return;
            }

            // Collapse the header immediately upon scrolling past 10px
            if (currentScrollY > 10) {
                if (!isScrolledRef.current) {
                    isScrolledRef.current = true;
                    setIsScrolled(true);
                }
            }

            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        // Initialize state on mount
        updateScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavEnter = (slug: string) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (moreTimeoutRef.current) {
            clearTimeout(moreTimeoutRef.current);
            moreTimeoutRef.current = null;
        }
        setIsMoreOpen(false);
        setActiveMegaMenu(slug);
    };

    const handleNavLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setActiveMegaMenu(null);
        }, 120);
    };

    const handleMegaMenuClose = () => {
        setActiveMegaMenu(null);
    };

    const activeNavData = navData.find((mc) => mc.slug === activeMegaMenu);

    const visibleNavItems = navData.slice(0, visibleCount);
    const overflowNavItems = navData.slice(visibleCount);

    return (
        <>
            {/* Spacer to prevent layout shift when header collapses */}
            <div className="w-full h-[116px] sm:h-[120px] lg:h-[158px]" aria-hidden="true" />

            <header className="fixed top-0 left-0 z-50 w-full bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-white/10 transition-all duration-300">
                {/* Disappearing Top Bar */}
                <TopBar isVisible={!isScrolled} />
                
                <div className="container-custom">
                    {/* Main Header Row */}
                    <div className="py-3 lg:py-[11px] h-auto lg:h-[70px] flex flex-col lg:flex-row lg:items-center relative">
                        {/* Desktop Version (lg and up) */}
                        <div className="hidden lg:flex items-center justify-between gap-6 w-full">
                            {/* Left: Logo and Menu Toggle Group */}
                            <div className="flex items-center shrink-0">
                                <button
                                    onClick={() => setManualToggle(prev => !prev)}
                                    className={`flex items-center justify-center transition-all duration-500 ease-in-out h-10 overflow-hidden text-zinc-900 dark:text-white ${isScrolled ? 'w-10 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                                        }`}
                                >
                                    <div className="w-5 h-5 flex flex-col items-center justify-center gap-[4px]">
                                        <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${isNavVisible && isScrolled ? 'translate-y-[6px] rotate-45' : ''
                                            }`} />
                                        <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${isNavVisible && isScrolled ? 'opacity-0 scale-0' : ''
                                            }`} />
                                        <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${isNavVisible && isScrolled ? '-translate-y-[6px] -rotate-45' : ''
                                            }`} />
                                    </div>
                                </button>

                                <div className={`transition-all duration-500 ease-in-out ${isScrolled ? 'ms-2' : 'ms-0'}`}>
                                    <Link href="/" className="flex items-center gap-3 group">
                                        <Image
                                            src="/logo.png"
                                            alt="Hawa Distribution & Trading - شركة هوا للتوزيع والتجارة"
                                            width={64}
                                            height={64}
                                            priority
                                            className="h-[50px] xl:h-[56px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="flex flex-col text-start">
                                            <span className="font-black text-[#0B192C] dark:text-white text-base xl:text-lg tracking-tight leading-tight">
                                                {isArabic ? 'هـوا للتوزيع' : 'HAWA TRADING'}
                                            </span>
                                            <span className="text-[10px] font-extrabold text-[#8A6305] dark:text-[#8A6305] tracking-wider uppercase">
                                                {isArabic ? 'توريد وتوزيع جملة' : 'Wholesale Distribution'}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Center: Search */}
                            <div className="flex-1 max-w-2xl xl:max-w-3xl px-2 xl:px-4">
                                <HeaderSearch />
                            </div>

                            {/* Right: Commercial Account & Cart */}
                            <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
                                <Link
                                    href="/account"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF6EC] hover:bg-[#0B192C] text-[#0B192C] hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-[#8A6305] border border-[#8A6305]/30 font-bold text-xs transition-all active:scale-95 shadow-xs"
                                >
                                    <MdPerson className="text-base text-[#8A6305]" />
                                    <span>{isArabic ? 'حساب تجاري' : 'Merchant Portal'}</span>
                                </Link>

                                <button
                                    onClick={openDrawer}
                                    className="w-10 h-10 xl:w-11 xl:h-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-xl text-zinc-900 dark:text-white hover:bg-[#0B192C] hover:text-white dark:hover:bg-white dark:hover:text-black transition-all relative"
                                    aria-label="Open Shopping Cart"
                                >
                                    <MdOutlineShoppingBag />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[10px] font-extrabold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
                                            {totalItems}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile & Tablet Version (below lg) */}
                        <div className="flex lg:hidden flex-col gap-3">
                            {/* Top Row: Menu, Logo, Controls, Cart Drawer Trigger */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className="w-11 h-11 flex items-center justify-center text-zinc-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        aria-label="Toggle Menu"
                                    >
                                        {isMobileMenuOpen ? (
                                             <MdClose className="text-2xl" />
                                        ) : (
                                            <MdMenu className="text-2xl" />
                                        )}
                                    </button>
                                    <Link href="/" className="flex items-center gap-2 group">
                                        <Image
                                            src="/logo.png"
                                            alt="Hawa Distribution & Trading - شركة هوا للتوزيع والتجارة"
                                            width={48}
                                            height={48}
                                            priority
                                            className="h-[40px] sm:h-[44px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="flex flex-col text-start">
                                            <span className="font-black text-[#0B192C] dark:text-white text-sm leading-tight">
                                                {isArabic ? 'هـوا للتوزيع' : 'HAWA TRADING'}
                                            </span>
                                            <span className="text-[9px] font-extrabold text-[#8A6305] leading-none">
                                                {isArabic ? 'توريد جملة' : 'Wholesale'}
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2">
                                    <LanguageToggle />
                                    <CurrencyToggle />
                                    <Link
                                        href="/account"
                                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-lg text-[#0B192C] dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                        aria-label="Merchant Account"
                                        title={isArabic ? 'حساب تجاري' : 'Merchant Portal'}
                                    >
                                        <MdPerson className="text-xl text-[#8A6305]" />
                                    </Link>
                                    <button
                                        onClick={openDrawer}
                                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-lg text-zinc-900 dark:text-white relative"
                                        aria-label="Open Shopping Cart"
                                    >
                                        <MdOutlineShoppingBag />
                                        {totalItems > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">
                                                {totalItems}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Row: Search Bar */}
                            <div className="w-full">
                                <HeaderSearch autoFocus={false} />
                            </div>
                        </div>

                        {/* Mobile Overlays Wrapper */}
                        <MobileMenu
                            initialCategories={initialCategories}
                            navData={navData}
                            isOpen={isMobileMenuOpen}
                            setIsOpen={setIsMobileMenuOpen}
                            isSearchOpen={isMobileSearchOpen}
                            setIsSearchOpen={setIsMobileSearchOpen}
                            hideTriggers={true}
                        />
                    </div>
                </div>

                {/* Navigation Links Row - Desktop only (lg and up) */}
                <nav
                    className={`hidden lg:grid bg-[#F8F8F8] dark:bg-[#1C1C14] border-t border-b border-gray-200/60 dark:border-white/5 transition-all duration-300 ease-in-out relative ${
                        !isNavVisible ? 'grid-rows-[0fr] opacity-0 border-t-0 border-b-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'
                    }`}
                >
                    <div className={`relative min-h-0 ${isNavVisible ? 'overflow-visible' : 'overflow-hidden'}`}>
                        <div className="container-custom relative flex items-center justify-center h-[48px]">
                            {/* Primary Navigation Links matching brief */}
                            <div className="flex items-center justify-center gap-4 xl:gap-7 flex-nowrap">
                                <Link
                                    href="/"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'الرئيسية' : 'Home'}
                                </Link>

                                <Link
                                    href="/about-us"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'من نحن' : 'About Us'}
                                </Link>

                                <Link
                                    href="/agencies"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'وكالاتنا' : 'Our Agencies'}
                                </Link>

                                <Link
                                    href="/products"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'المنتجات' : 'Products'}
                                </Link>

                                <Link
                                    href="/services"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'خدمات التوزيع' : 'Distribution Services'}
                                </Link>

                                <Link
                                    href="/blog"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'المدونة' : 'Blog'}
                                </Link>

                                <Link
                                    href="/contact"
                                    className="text-[13px] xl:text-[14px] font-bold text-[#0B192C] dark:text-gray-200 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors whitespace-nowrap py-1"
                                >
                                    {isArabic ? 'تواصل معنا' : 'Contact Us'}
                                </Link>

                                {/* Optional Departments Mega Menu Trigger if navData exists */}
                                {navData && navData.length > 0 && (
                                    <div
                                        className="relative shrink-0 group"
                                        onMouseEnter={handleMoreEnter}
                                        onMouseLeave={handleMoreLeave}
                                    >
                                        <button
                                            type="button"
                                            className="text-[13px] xl:text-[14px] font-bold text-[#8A6305] dark:text-[#8A6305] flex items-center gap-1 py-1"
                                        >
                                            <span>{isArabic ? 'أقسام المنتجات' : 'Departments'}</span>
                                            <MdKeyboardArrowDown className="text-base" />
                                        </button>

                                        {/* Floating More Dropdown Menu */}
                                        {isMoreOpen && (
                                            <div
                                                className="absolute top-full ltr:right-0 rtl:left-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-white/10 p-2 z-50 animate-mega-menu-enter"
                                            >
                                                <div className="flex flex-col gap-0.5 max-h-[340px] overflow-y-auto scrollbar-hide py-1">
                                                    {navData.map((mc) => {
                                                        const name = language === 'ar' ? mc.name : (mc.nameEn || mc.name);
                                                        return (
                                                             <Link
                                                                key={mc.id}
                                                                href={`/departments/${mc.slug}`}
                                                                onClick={() => setIsMoreOpen(false)}
                                                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-800 dark:text-white/90 hover:bg-[#8A6305]/10 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-all"
                                                            >
                                                                <span className="truncate">{name}</span>
                                                                {mc.categories?.length > 0 && (
                                                                    <span className="text-[11px] text-[#475569] font-normal shrink-0 ms-3">
                                                                        {mc.categories.length} {language === 'ar' ? 'فئات' : 'cats'}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mega Menu Dropdown */}
                    {activeMegaMenu && activeNavData && (
                        <MegaMenu
                            key={activeMegaMenu}
                            data={activeNavData}
                            onClose={handleMegaMenuClose}
                            onMouseEnter={() => {
                                if (closeTimeoutRef.current) {
                                    clearTimeout(closeTimeoutRef.current);
                                    closeTimeoutRef.current = null;
                                }
                            }}
                            onMouseLeave={handleNavLeave}
                        />
                    )}
                </nav>
            </header>
        </>
    );
};

export default Header;
