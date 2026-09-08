'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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
import type { NavMainCategory } from './HeaderComponents/MegaMenu';

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
    const { dir, language: _language } = useLanguage();
    const isArabic = dir === 'rtl';
    const { totalItems, openDrawer } = useCart();
    const { customer } = useCustomer();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [hasOpenedMenu, setHasOpenedMenu] = useState(false);
    const [hasOpenedSearch, setHasOpenedSearch] = useState(false);

    // Scroll Elevation State
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY <= 15) {
                setIsScrolled(false);
                ticking = false;
                return;
            }

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 15);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile drawers and reset scroll state on navigation
    useEffect(() => {
        setIsScrolled(false);
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
            <div className="w-full h-16 xl:h-[72px] bg-[#0B192C] border-b border-white/10" aria-hidden="true" />

            <header
                className={`fixed top-0 left-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-250 ease-out ${
                    isScrolled
                        ? 'bg-[#081524]/95 backdrop-blur-md border-b border-[#8A6305]/45 shadow-lg shadow-black/20'
                        : 'bg-[#0B192C] border-b border-white/10'
                }`}
            >
                {/* 1. Desktop Header (xl and up) */}
                <div className="hidden xl:block w-full">
                    <div className="container-custom">
                        <div className={`flex items-center justify-between transition-[height] duration-250 ease-out ${isScrolled ? 'h-[60px]' : 'h-[72px]'}`}>
                            {/* Start Side: Logo & Trade Badge */}
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href="/"
                                    className="flex items-center group py-1"
                                    aria-label="شركة حوا للتوزيع والتجارة - الصفحة الرئيسية"
                                >
                                    <Image
                                        src="/images/logo-header.webp"
                                        alt="Hawa Distribution & Trading - شركة حوا للتوزيع والتجارة"
                                        width={110}
                                        height={60}
                                        priority
                                        className={`w-auto object-contain transition-[height,transform] duration-250 ease-out group-hover:scale-[1.03] ${isScrolled ? 'h-11' : 'h-[52px]'}`}
                                    />
                                </Link>

                                <div className="h-6 w-[1px] bg-white/15 mx-1 hidden xl:block" aria-hidden="true" />

                                <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#E5B54A]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B54A]" />
                                    <span>{isArabic ? 'بوابة توريد الجملة' : 'B2B Wholesale Portal'}</span>
                                </div>
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

                {/* 2. Mobile & Tablet Header (below xl) */}
                <div className="block xl:hidden w-full px-3 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Start Side: Brand Logo */}
                        <Link
                            href="/"
                            className="flex items-center group py-1"
                            aria-label="شركة حوا للتوزيع والتجارة - الصفحة الرئيسية"
                        >
                            <Image
                                src="/images/logo-header.webp"
                                alt="Hawa Distribution & Trading"
                                width={95}
                                height={50}
                                priority
                                className="h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                            />
                        </Link>

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
                                    fetch('/api/navigation', { priority: 'low' }).catch(() => {});
                                }}
                                onFocus={() => {
                                    setHasOpenedMenu(true);
                                    fetch('/api/navigation', { priority: 'low' }).catch(() => {});
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
                    navData={initialNavData}
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
