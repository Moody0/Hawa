'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import {
    ShoppingCart,
    User,
    Search,
    Menu,
    X
} from 'lucide-react';
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
            fetch('/api/navigation', { cache: 'no-store' })
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

                    // Threshold logic for smooth bottom navbar toggle:
                    if (currentScrollY <= 40) {
                        // At top of page: always show the bottom categories bar
                        setShowBottomBar(true);
                    } else if (scrollDelta > 6) {
                        // Scrolling down: hide bottom bar smoothly (slides up)
                        setShowBottomBar(false);
                    } else if (scrollDelta < -6) {
                        // Scrolling up: show bottom bar smoothly (slides down)
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
    ];

    return (
        <>
            {/* Stable Spacer prevents layout shift & matches header background to eliminate white gap on fast scroll */}
            <div className="w-full h-16 xl:h-[114px] bg-[#0B192C] border-b border-[#E5B54A]/30" aria-hidden="true" />
            {/* Inner pages need clearance for the curved cradle; the home hero intentionally sits behind it. */}
            {!isHomePage && (
                <div className="h-6 w-full bg-[#F6F7F9] dark:bg-[#09090b] xl:h-8" aria-hidden="true" />
            )}

            <header
                className={`fixed top-0 left-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
                    isScrolled
                        ? 'bg-[#081524] border-b border-[#8A6305]/45'
                        : 'bg-[#0B192C] border-b border-[#E5B54A]/30'
                }`}
            >
                {/* 1. Desktop Header (xl and up) */}
                <div className="hidden xl:block w-full">
                    {/* Primary Row: Logo, Navigation, Actions */}
                    <div className={`relative z-10 w-full transition-colors duration-300 ${isScrolled ? 'bg-[#081524]' : 'bg-[#0B192C]'}`}>
                        <div className="container-custom">
                            <div className="flex h-[72px] items-center justify-between">
                                {/* Start Side: Brand Logo */}
                                <div className="relative flex items-center justify-center shrink-0 h-full">
                                    <Link
                                        href="/"
                                        className="relative flex items-center justify-center group z-10 py-1"
                                        aria-label="شركة حوا للتوزيع والتجارة - الصفحة الرئيسية"
                                    >
                                        <Image
                                            src="/images/logo-header.webp"
                                            alt="Hawa Distribution & Trading - شركة حوا للتوزيع والتجارة"
                                            width={120}
                                            height={65}
                                            priority
                                            className={`h-[60px] w-[120px] object-contain will-change-transform transition-all duration-300 ease-in-out ${
                                                isScrolled ? 'scale-90 translate-y-0' : 'scale-100 translate-y-0.5'
                                            }`}
                                        />
                                    </Link>
                                </div>

                                {/* Center: Navigation Links */}
                                <nav className="flex items-center justify-center gap-7 2xl:gap-9 flex-nowrap" aria-label={isArabic ? 'القائمة الرئيسية' : 'Primary navigation'}>
                                    {navLinks.map((link) => {
                                        const isActive = link.href === '/'
                                            ? pathname === '/'
                                            : pathname.startsWith(link.href);

                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`group/nav relative py-2 text-[14px] 2xl:text-[14.5px] whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B192C] rounded-sm ${
                                                    isActive
                                                        ? 'text-[#E5B54A] font-bold'
                                                        : 'text-white/85 hover:text-[#E5B54A] font-medium'
                                                }`}
                                            >
                                                <span>{isArabic ? link.labelAr : link.labelEn}</span>
                                                <span
                                                    className={`absolute bottom-0 inset-x-0 h-0.5 origin-center rounded-full bg-[#E5B54A] transition-transform duration-200 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'}`}
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* End Side: Actions Group */}
                                <div className="flex items-center gap-3 shrink-0" dir="ltr">
                                    {/* Merchant Account CTA Button */}
                                    <Link
                                        href="/account"
                                        className="min-h-10 inline-flex items-center gap-2 rounded-xl bg-[#8A6305] hover:bg-[#735204] text-white font-bold text-[13px] transition-colors active:scale-[0.98] whitespace-nowrap px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B192C]"
                                    >
                                        <User className="h-4 w-4" aria-hidden="true" />
                                        {customer
                                            ? (isArabic ? 'حسابي' : 'My Account')
                                            : (isArabic ? 'حساب تجاري' : 'Merchant Portal')}
                                    </Link>

                                    {/* Shopping Cart Trigger */}
                                    <button
                                        onClick={openDrawer}
                                        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] cursor-pointer"
                                        aria-label={isArabic ? 'سلة التسوق' : 'Shopping Cart'}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {totalItems > 0 ? (
                                            <span className="absolute -top-0.5 -right-0.5 bg-[#8A6305] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                                {totalItems}
                                            </span>
                                        ) : null}
                                    </button>

                                    {/* Search Modal Trigger */}
                                    <button
                                        onClick={() => {
                                            setHasOpenedSearch(true);
                                            setIsMobileSearchOpen(true);
                                        }}
                                        onMouseEnter={() => setHasOpenedSearch(true)}
                                        onFocus={() => setHasOpenedSearch(true)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A] cursor-pointer"
                                        aria-label={isArabic ? 'بحث' : 'Search'}
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Row: Desktop Categories Sub-Navbar (Smoothly slides up on scroll down, slides down on scroll up) */}
                    <div
                        className={`relative z-0 w-full transition-all duration-300 ease-in-out origin-top ${
                            showBottomBar
                                ? 'max-h-[42px] opacity-100 translate-y-0 overflow-visible'
                                : 'max-h-0 opacity-0 -translate-y-full overflow-hidden pointer-events-none'
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
                <div className="block xl:hidden w-full px-3 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Start Side: Brand Logo with Centered Integrated Curved Cradle */}
                        <div
                            className={`relative ms-3 flex h-full shrink-0 items-center justify-center transition-transform duration-500 ease-in-out sm:ms-2 lg:ms-0 ${
                                isScrolled ? 'translate-x-[13px]' : 'translate-x-0'
                            }`}
                        >
                            <Link
                                href="/"
                                className="relative flex items-center justify-center group py-1 z-10"
                                aria-label="شركة حوا للتوزيع والتجارة - الصفحة الرئيسية"
                            >
                                <Image
                                    src="/images/logo-header.webp"
                                    alt="Hawa Distribution & Trading"
                                    width={100}
                                    height={52}
                                    priority
                                    className={`h-[50px] w-[96px] object-contain will-change-transform transition-transform duration-500 ease-in-out ${
                                        isScrolled ? 'scale-80 translate-y-0' : 'scale-100 translate-y-1'
                                    }`}
                                />
                            </Link>

                            {/* Mobile cradle uses the same bottom-edge anchor as the desktop header. */}
                            <div
                                className={`absolute top-full -mt-px left-1/2 -translate-x-1/2 pointer-events-none origin-top z-0 transition-transform duration-500 ease-in-out ${
                                    isScrolled
                                        ? 'scale-y-0'
                                        : 'scale-y-100'
                                }`}
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 190 24"
                                    className="block h-auto w-[clamp(164px,42vw,190px)] overflow-visible"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {/* A 2px overlap prevents a seam on fractional mobile pixel ratios. */}
                                    <path
                                        d="M -3 -2 H 193 V 0 H 190 C 145 0, 130 22, 95 22 C 60 22, 45 0, 0 0 H -3 Z"
                                        fill={isScrolled ? '#081524' : '#0B192C'}
                                        className="transition-[fill] duration-300 ease-out"
                                    />
                                    {/* The gold contour continues the header border without a doubled edge. */}
                                    <path
                                        d="M -3 0.5 H 0 C 45 0.5, 60 22.5, 95 22.5 C 130 22.5, 145 0.5, 190 0.5 H 193"
                                        stroke={isScrolled ? 'rgba(138, 99, 5, 0.45)' : 'rgba(229, 181, 74, 0.30)'}
                                        strokeWidth="1"
                                        vectorEffect="non-scaling-stroke"
                                        className="transition-[stroke] duration-300 ease-out"
                                        fill="none"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* End Side: Mobile Controls */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Search Trigger */}
                            <button
                                onClick={() => {
                                    setHasOpenedSearch(true);
                                    setIsMobileSearchOpen(true);
                                }}
                                onMouseEnter={() => setHasOpenedSearch(true)}
                                onFocus={() => setHasOpenedSearch(true)}
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A]"
                                aria-label={isArabic ? 'البحث' : 'Search'}
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Cart Trigger */}
                            <button
                                onClick={openDrawer}
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A]"
                                aria-label={isArabic ? 'سلة التسوق' : 'Shopping Cart'}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 ? (
                                    <span className="absolute top-0.5 right-0.5 bg-[#8A6305] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                        {totalItems}
                                    </span>
                                ) : null}
                            </button>

                            {/* Hamburger Menu Toggle */}
                            <button
                                onClick={() => {
                                    setHasOpenedMenu(true);
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                }}
                                onMouseEnter={() => {
                                    setHasOpenedMenu(true);
                                }}
                                onFocus={() => {
                                    setHasOpenedMenu(true);
                                }}
                                className="w-11 h-11 flex items-center justify-center text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B54A]"
                                aria-label={isMobileMenuOpen ? (isArabic ? 'إغلاق القائمة' : 'Close Menu') : (isArabic ? 'فتح القائمة' : 'Open Menu')}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6 text-[#E5B54A]" />
                                ) : (
                                    <Menu className="w-6 h-6" />
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
