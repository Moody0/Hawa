'use client';
import { laravelClientFetch } from '@/lib/laravel-client';
import { useSiteContacts } from '@/app/context/SiteContactsContext';
import { navigationLinkEnabled } from '@/lib/website-content';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import {
    ShoppingCart,
    Search,
    Menu,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useCustomer } from '@/app/context/CustomerContext';
import dynamic from 'next/dynamic';

const MobileMenu = dynamic(() => import('./MobileMenu'), {
    ssr: false,
});

const MobileSearchModal = dynamic(() => import('./MobileSearchModal'), {
    ssr: false,
});
import type { NavMainCategory } from '@/lib/navigation';
import DesktopCategoriesBar from './HeaderComponents/DesktopCategoriesBar';

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

const Header = ({ initialCategories = [], initialNavData = [] }: HeaderProps) => {
    const pathname = usePathname();
    const contacts = useSiteContacts();
    const isHomePage = pathname === '/';
    const { dir, language: _language } = useLanguage();
    const isArabic = dir === 'rtl';
    const { totalItems, openDrawer } = useCart();
    const { customer } = useCustomer();
    const [navData, setNavData] = useState<NavMainCategory[]>(initialNavData);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [hasOpenedMenu, setHasOpenedMenu] = useState(false);
    const [hasOpenedSearch, setHasOpenedSearch] = useState(false);

    // Sync incoming navData and fallback fetch if needed
    useEffect(() => {
        if (initialNavData && initialNavData.length > 0) {
            setNavData(initialNavData);
        }
    }, [initialNavData]);

    useEffect(() => {
        if (navData.length === 0) {
            laravelClientFetch('/api/navigation', { cache: 'no-store' })
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setNavData(data);
                    }
                })
                .catch(() => {});
        }
    }, [navData.length]);

    // Scroll Elevation & Dynamic Bottom Bar Visibility State
    const [isScrolled, setIsScrolled] = useState(false);
    const [showBottomBar, setShowBottomBar] = useState(true);
    const lastScrollYRef = useRef(0);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const prevScrollY = lastScrollYRef.current;
                    const scrollDelta = currentScrollY - prevScrollY;

                    setIsScrolled(currentScrollY > 20);

                    if (currentScrollY <= 40) {
                        setShowBottomBar(true);
                    } else if (scrollDelta > 6) {
                        setShowBottomBar(false);
                    } else if (scrollDelta < -6) {
                        setShowBottomBar(true);
                    }

                    lastScrollYRef.current = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        lastScrollYRef.current = window.scrollY;

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile drawers and reset scroll state on navigation
    useEffect(() => {
        setIsScrolled(false);
        setShowBottomBar(true);
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
    }, [pathname]);

    // Primary nav links
    const navLinks = [
        { href: '/', labelAr: 'الرئيسية', labelEn: 'Home' },
        { href: '/about-us', labelAr: 'من نحن', labelEn: 'About Us' },
        { href: '/brands', labelAr: 'وكالاتنا', labelEn: 'Agencies' },
        { href: '/products', labelAr: 'المنتجات', labelEn: 'Products' },
        { href: '/shipping-returns', labelAr: 'خدمات التوزيع', labelEn: 'Distribution' },
        { href: '/blog', labelAr: 'المدونة', labelEn: 'Blog' },
        { href: '/contact', labelAr: 'تواصل معنا', labelEn: 'Contact Us' },
    ].filter(link => navigationLinkEnabled(link.href, contacts.content));

    return (
        <>
            {/* Stable Spacer matches Header height (62px on mobile, 60px+38px=98px on laptops, 72px+46px=118px on 2xl big screens) */}
            <div className="w-full h-[62px] xl:h-[98px] 2xl:h-[118px] bg-[#0F2138]" aria-hidden="true" />

            <header
                className={`fixed top-0 left-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isScrolled
                        ? 'bg-[#0B1829]/95 backdrop-blur-2xl backdrop-saturate-[180%] border-b border-[#E5B54A]/20 shadow-[0_14px_34px_-12px_rgba(8,18,32,0.55)]'
                        : 'bg-[#0F2138]/95 backdrop-blur-2xl backdrop-saturate-[180%] border-b border-white/[0.08] xl:border-[#E5B54A]/18'
                }`}
            >
                {/* 1. Desktop Header — Concept 02: Monolithic Royal Navy & Gold Touch (xl and up) */}
                <div className="hidden xl:block w-full">
                    <div className="container-custom">
                        {/* Row 1: 60px on laptops, 72px on 2xl big monitors */}
                        <div className="flex h-[60px] 2xl:h-[72px] items-center justify-between border-b border-white/[0.08]">
                            {/* Start Side: Brand Logo */}
                            <div className="relative flex items-center justify-center shrink-0 h-full">
                                <Link
                                    href="/"
                                    className="relative flex items-center justify-center group z-10 py-1.5 focus-visible:outline-none"
                                    aria-label="شركة حوا للتوزيع والتجارة - الصفحة الرئيسية"
                                >
                                    <Image
                                        src="/images/logo-header.webp"
                                        alt="Hawa Distribution & Trading - شركة حوا للتوزيع والتجارة"
                                        width={140}
                                        height={68}
                                        priority
                                        className="h-[44px] 2xl:h-[54px] w-auto object-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                                    />
                                </Link>
                            </div>

                            {/* Center: Navigation Links with White Active Underline & Right-to-Left Hover/Unhover Sweep */}
                            <nav
                                className="flex items-center justify-center gap-6 2xl:gap-9 flex-nowrap"
                                aria-label={isArabic ? 'القائمة الرئيسية' : 'Primary navigation'}
                            >
                                {navLinks.map((link) => {
                                    const isActive = link.href === '/'
                                        ? pathname === '/'
                                        : pathname.startsWith(link.href);

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`group/nav relative py-1.5 2xl:py-2 text-[13.5px] 2xl:text-[14.5px] whitespace-nowrap transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none ${
                                                isActive
                                                    ? 'text-white font-bold'
                                                    : 'text-white/75 hover:text-white font-semibold'
                                            }`}
                                        >
                                            <span>{isArabic ? link.labelAr : link.labelEn}</span>
                                            {/* White underline: solid when active; sweeps Right -> Left on hover AND Right -> Left on unhover */}
                                            <span
                                                className={`pointer-events-none absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                    isActive
                                                        ? 'scale-x-100 origin-right'
                                                        : 'scale-x-0 origin-left group-hover/nav:origin-right group-hover/nav:scale-x-100'
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* End Side: Refined Gold CTA Pill & Clean Actions */}
                            <div className="flex items-center gap-2 2xl:gap-2.5 shrink-0" dir="ltr">
                                {/* Brand Gold Capsule CTA */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                                >
                                    <Link
                                        href="/account"
                                        className="h-8 2xl:h-9 inline-flex items-center justify-center rounded-full bg-[#D89E28] hover:bg-[#E5B54A] text-[#0B192C] font-bold text-[12px] 2xl:text-[13px] transition-colors duration-200 whitespace-nowrap px-4 2xl:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A]"
                                    >
                                        {customer
                                            ? (isArabic ? 'حسابي' : 'My Account')
                                            : (isArabic ? 'حساب تجاري' : 'Merchant Portal')}
                                    </Link>
                                </motion.div>

                                {/* Shopping Cart Trigger */}
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={openDrawer}
                                    className="relative w-8 h-8 2xl:w-9 2xl:h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.09] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] cursor-pointer"
                                    aria-label={isArabic ? 'سلة التسوق' : 'Shopping Cart'}
                                >
                                    <ShoppingCart className="w-[16px] h-[16px] 2xl:w-[18px] 2xl:h-[18px]" />
                                    {totalItems > 0 ? (
                                        <span className="absolute -top-0.5 -right-0.5 bg-[#D89E28] text-[#0B192C] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                                            {totalItems}
                                        </span>
                                    ) : null}
                                </motion.button>

                                {/* Search Modal Trigger */}
                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => {
                                        setHasOpenedSearch(true);
                                        setIsMobileSearchOpen(true);
                                    }}
                                    onMouseEnter={() => setHasOpenedSearch(true)}
                                    onFocus={() => setHasOpenedSearch(true)}
                                    className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.09] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] cursor-pointer"
                                    aria-label={isArabic ? 'بحث' : 'Search'}
                                >
                                    <Search className="w-[16px] h-[16px] 2xl:w-[18px] 2xl:h-[18px]" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Desktop Categories Sub-Navbar (38px on laptops, 46px on 2xl) */}
                    <div
                        className={`relative z-0 w-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top ${
                            showBottomBar
                                ? 'max-h-[38px] 2xl:max-h-[46px] opacity-100 translate-y-0 overflow-visible'
                                : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden pointer-events-none'
                        }`}
                    >
                        <DesktopCategoriesBar
                            navData={navData}
                            isScrolled={isScrolled}
                            isArabic={isArabic}
                            isVisible={showBottomBar}
                        />
                    </div>
                </div>

                {/* 2. Mobile & Tablet Header (below xl) */}
                <div className="block xl:hidden w-full px-4 sm:px-6">
                    <div
                        className={`flex items-center justify-between transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isScrolled ? 'h-[54px]' : 'h-[62px]'
                        }`}
                    >
                        {/* Start Side: Flush-Aligned Brand Emblem + Lockup (Zero sideways drift on scroll) */}
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 group focus-visible:outline-none"
                            aria-label="شركة حوا للتوزيع والتجارة - الصفحة الرئيسية"
                        >
                            <div
                                className={`relative overflow-hidden flex items-center justify-center shrink-0 transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    isScrolled ? 'w-[44px] h-[38px]' : 'w-[50px] h-[44px]'
                                }`}
                            >
                                <Image
                                    src="/images/logo-header.webp"
                                    alt="Hawa Distribution & Trading"
                                    width={114}
                                    height={58}
                                    priority
                                    className={`max-w-none object-contain transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                        isScrolled ? 'w-[76px] h-[38px]' : 'w-[86px] h-[44px]'
                                    }`}
                                />
                            </div>
                            <span className="h-5 w-px bg-white/12 shrink-0" aria-hidden="true" />
                            <div className="flex flex-col text-start">
                                <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
                                    {isArabic ? 'حوا للتوزيع' : 'Hawa Trading'}
                                </span>
                                <span className="text-[9.5px] font-semibold text-[#E5B54A] leading-tight mt-0.5">
                                    {isArabic ? 'توريد وتوزيع جملة' : 'Wholesale Supply'}
                                </span>
                            </div>
                        </Link>

                        {/* End Side: Refined Mobile Controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                onClick={() => {
                                    setHasOpenedSearch(true);
                                    setIsMobileSearchOpen(true);
                                }}
                                onMouseEnter={() => setHasOpenedSearch(true)}
                                onFocus={() => setHasOpenedSearch(true)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer focus-visible:outline-none"
                                aria-label={isArabic ? 'البحث' : 'Search'}
                            >
                                <Search className="w-[18px] h-[18px]" strokeWidth={1.85} />
                            </button>

                            <button
                                onClick={openDrawer}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all relative cursor-pointer focus-visible:outline-none"
                                aria-label={isArabic ? 'سلة التسوق' : 'Shopping Cart'}
                            >
                                <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.85} />
                                {totalItems > 0 ? (
                                    <span className="absolute top-0.5 right-0.5 bg-[#D89E28] text-[#0B192C] text-[9.5px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full">
                                        {totalItems}
                                    </span>
                                ) : null}
                            </button>

                            <button
                                onClick={() => {
                                    setHasOpenedMenu(true);
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                }}
                                onMouseEnter={() => setHasOpenedMenu(true)}
                                onFocus={() => setHasOpenedMenu(true)}
                                className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/[0.12] flex items-center justify-center text-[#E5B54A] hover:bg-white/[0.12] active:scale-95 transition-all cursor-pointer focus-visible:outline-none ms-0.5"
                                aria-label={isMobileMenuOpen ? (isArabic ? 'إغلاق القائمة' : 'Close Menu') : (isArabic ? 'فتح القائمة' : 'Open Menu')}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-[18px] h-[18px] text-[#E5B54A]" strokeWidth={2} />
                                ) : (
                                    <Menu className="w-[18px] h-[18px]" strokeWidth={2} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer (deferred on demand) */}
            {hasOpenedMenu && (
                <MobileMenu
                    initialCategories={initialCategories}
                    navData={navData}
                    isOpen={isMobileMenuOpen}
                    setIsOpen={setIsMobileMenuOpen}
                    isSearchOpen={isMobileSearchOpen}
                    setIsSearchOpen={setIsMobileSearchOpen}
                    hideTriggers={true}
                />
            )}

            {/* Dedicated Search Modal (deferred on demand) */}
            {hasOpenedSearch && (
                <MobileSearchModal
                    isOpen={isMobileSearchOpen}
                    onClose={() => setIsMobileSearchOpen(false)}
                />
            )}
        </>
    );
};

export default Header;
