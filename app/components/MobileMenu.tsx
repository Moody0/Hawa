"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    whatsappHref,
    navigationLinkEnabled,
} from '@/lib/website-content';
import { useSiteContacts } from '@/app/context/SiteContactsContext';
import ManagerContactLinks from './ManagerContactLinks';
import { laravelClientFetch } from '@/lib/laravel-client';
import { useLanguage } from '@/app/context/LanguageContext';
import {
    X,
    Home,
    ShoppingBag,
    Store,
    Truck,
    Info,
    FileText,
    Headphones,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    LayoutGrid,
    ArrowRight,
    ArrowLeft,
} from 'lucide-react';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { getBrandDisplayName } from '@/lib/brand-display';

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
        nameEn?: string | null;
        slug: string;
        group: string;
    } | null;
}

interface NavBrand {
    id: string;
    name: string;
    nameEn?: string | null;
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
    initialCategories?: MobileCategory[];
    navData?: NavMainCategory[];
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    isSearchOpen?: boolean;
    setIsSearchOpen?: (open: boolean) => void;
    hideTriggers?: boolean;
}

const MobileMenu = ({
    navData: incomingNavData,
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen,
}: MobileMenuProps) => {
    const { dir, language } = useLanguage();
    const siteContacts = useSiteContacts();
    const pathname = usePathname();
    const dialogRef = useRef<HTMLDivElement>(null);
    const isRtl = dir === 'rtl' || language === 'ar';

    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isMobileMenuOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsMobileMenuOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

    const [navData, setNavData] = useState<NavMainCategory[]>(incomingNavData || []);
    const [isLoadingNav, setIsLoadingNav] = useState(false);

    useEffect(() => {
        if (incomingNavData && incomingNavData.length > 0) {
            setNavData(incomingNavData);
        }
    }, [incomingNavData]);

    useEffect(() => {
        if (isMobileMenuOpen && navData.length === 0 && !isLoadingNav) {
            setIsLoadingNav(true);
            laravelClientFetch('/api/navigation')
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setNavData(data);
                    }
                })
                .catch((err) => {
                    console.error('Failed to load navigation data in MobileMenu:', err);
                })
                .finally(() => {
                    setIsLoadingNav(false);
                });
        }
    }, [isMobileMenuOpen, navData.length, isLoadingNav]);

    const [activeMainCatSlug, setActiveMainCatSlug] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(isMobileMenuOpen);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsAnimating(true), 20);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setActiveMainCatSlug(null);
                setExpandedSection(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen || !shouldRender) return;
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement as HTMLElement | null;
        document.body.style.overflow = 'hidden';
        const focusable = () =>
            Array.from(
                dialogRef.current?.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled])'
                ) || []
            ).filter((element) => element.offsetParent !== null);
        focusable()[0]?.focus();
        const trapFocus = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            const elements = focusable();
            const first = elements[0],
                last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        window.addEventListener('keydown', trapFocus);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', trapFocus);
            previousFocus?.focus();
        };
    }, [isMobileMenuOpen, shouldRender]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };
        if (isMobileMenuOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobileMenuOpen, setIsMobileMenuOpen]);

    const activeMainCat = navData.find((mc) => mc.slug === activeMainCatSlug);

    if (!shouldRender) return null;

    const mainNavItems = [
        {
            href: '/',
            label: isRtl ? 'الرئيسية' : 'Home',
            icon: Home,
        },
        {
            href: '/products',
            label: isRtl ? 'جميع المنتجات' : 'All Products',
            badge: isRtl ? 'الكتالوج' : 'Catalog',
            icon: ShoppingBag,
        },
        {
            href: '/brands',
            label: isRtl ? 'وكالاتنا الحصرية' : 'Exclusive Brands',
            badge: isRtl ? 'معتمدة' : 'Official',
            icon: Store,
        },
        {
            href: '/shipping-returns',
            label: isRtl ? 'خدمات التوزيع' : 'Distribution Services',
            icon: Truck,
        },
        {
            href: '/about-us',
            label: isRtl ? 'من نحن' : 'About Us',
            icon: Info,
        },
        {
            href: '/blog',
            label: isRtl ? 'المدونة' : 'Blog',
            icon: FileText,
        },
        {
            href: '/contact',
            label: isRtl ? 'تواصل معنا' : 'Contact Us',
            icon: Headphones,
        },
    ].filter((link) => navigationLinkEnabled(link.href, siteContacts.content));

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={isRtl ? 'القائمة الرئيسية' : 'Main menu'}
            className="fixed inset-0 z-[60] lg:hidden overflow-hidden"
            suppressHydrationWarning
        >
            {/* Backdrop with Blur */}
            <div
                className={`fixed inset-0 bg-[#081220]/55 backdrop-blur-xs transition-opacity duration-300 ease-out ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Fullscreen Mobile Menu Drawer */}
            <div
                className={`fixed inset-0 z-[61] w-full bg-[#FAF7F0] flex flex-col transition-transform duration-300 ease-out ${
                    isRtl
                        ? isAnimating
                            ? 'translate-x-0'
                            : '-translate-x-full'
                        : isAnimating
                          ? 'translate-x-0'
                          : 'translate-x-full'
                } overflow-hidden`}
                role="dialog"
                aria-modal="true"
                aria-label={isRtl ? 'قائمة التصفح' : 'Navigation Menu'}
            >
                {/* Top Header inside Drawer */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#0B192C]/[0.07] bg-white shrink-0">
                    <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 group"
                    >
                        <Image
                            src="/logo.png"
                            alt="Hawa Distribution"
                            width={36}
                            height={36}
                            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="flex flex-col text-start">
                            <span className="font-bold text-[#0B192C] text-sm tracking-tight leading-tight">
                                {isRtl ? 'حـوا للتوزيع' : 'HAWA TRADING'}
                            </span>
                            <span className="text-[9.5px] font-bold text-[#8A6305] leading-tight mt-0.5">
                                {isRtl ? 'توريد وتوزيع جملة' : 'Wholesale Distribution'}
                            </span>
                        </div>
                    </Link>

                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#0B192C]/[0.08] flex items-center justify-center text-[#0B192C] hover:border-[#C59329]/50 hover:text-[#8A6305] transition-colors active:scale-95"
                        aria-label={isRtl ? 'إغلاق القائمة' : 'Close Menu'}
                    >
                        <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                </div>

                {/* Sliding Views Container */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Main Menu View */}
                    <div
                        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                            activeMainCatSlug
                                ? isRtl
                                    ? '-translate-x-full'
                                    : '-translate-x-full'
                                : 'translate-x-0'
                        } flex flex-col overflow-y-auto`}
                    >
                        <div className="p-3.5 flex flex-col gap-3">
                            {/* 1. Merchant & Wholesale Portal Card */}
                            <Link
                                href="/account"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="group relative overflow-hidden rounded-[14px] p-3.5 bg-[#0F2138] text-white border border-[#0B192C]/10 transition-transform active:scale-[0.99]"
                            >
                                <div className="flex items-center justify-between gap-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[10px] bg-white/[0.06] border border-[#E5B54A]/25 flex items-center justify-center text-[#E5B54A] shrink-0">
                                            <Store className="w-[18px] h-[18px]" strokeWidth={1.75} />
                                        </div>
                                        <div className="flex flex-col text-start">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-[13.5px] text-white leading-tight">
                                                    {isRtl ? 'بوابة التجار المعتمدة' : 'Official Merchant Portal'}
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-extrabold bg-[#D89E28] text-[#0B192C] uppercase tracking-wider leading-none">
                                                    B2B
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-normal text-white/65 mt-0.5">
                                                {isRtl ? 'دخول لحسابك وعرض أسعار الجملة' : 'Login to view wholesale rates'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-[#E5B54A] group-hover:bg-[#D89E28] group-hover:text-[#0B192C] transition-colors shrink-0">
                                        {isRtl ? (
                                            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" strokeWidth={2} />
                                        )}
                                    </div>
                                </div>
                            </Link>

                            {/* 2. Core Navigation Links — Clean White Card with Bare Icons */}
                            <div className="bg-white rounded-[14px] p-1.5 border border-[#0B192C]/[0.07] space-y-0.5">
                                {mainNavItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive =
                                        item.href === '/'
                                            ? pathname === '/'
                                            : pathname.startsWith(item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-[10px] transition-colors group ${
                                                isActive
                                                    ? 'bg-[#FAF7F0] text-[#8A6305]'
                                                    : 'text-[#0B192C] hover:bg-[#FAF7F0]/60 hover:text-[#8A6305]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <IconComponent
                                                    className={`w-[18px] h-[18px] transition-colors shrink-0 ${
                                                        isActive
                                                            ? 'text-[#8A6305]'
                                                            : 'text-[#94A3B8] group-hover:text-[#8A6305]'
                                                    }`}
                                                    strokeWidth={isActive ? 2.1 : 1.75}
                                                />
                                                <span
                                                    className={`text-[13.5px] leading-snug ${
                                                        isActive
                                                            ? 'font-bold text-[#8A6305]'
                                                            : 'font-bold text-[#0B192C] group-hover:text-[#8A6305]'
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>

                                            {item.badge && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#8A6305] border border-[#C59329]/25">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* 3. Product Departments Section — Separate Individual Cards */}
                            {navData.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <div className="px-1.5 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-[#8A6305]">
                                            {isRtl ? 'أقسام وتصنيفات المنتجات' : 'Product Departments'}
                                        </span>
                                        <span className="text-[10.5px] font-medium text-[#94A3B8]">
                                            {navData.length} {isRtl ? 'أقسام' : 'Depts'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {navData.map((mc) => (
                                            <button
                                                key={mc.id}
                                                onClick={() => setActiveMainCatSlug(mc.slug)}
                                                className="flex items-center justify-between px-3.5 py-3 rounded-[12px] bg-white border border-[#0B192C]/[0.07] text-start hover:border-[#C59329]/45 active:scale-[0.99] transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <LayoutGrid
                                                        className="w-[17px] h-[17px] text-[#8A6305] shrink-0"
                                                        strokeWidth={1.75}
                                                    />
                                                    <span className="text-[13px] font-bold text-[#0B192C] group-hover:text-[#8A6305] transition-colors truncate">
                                                        {mc.name}
                                                    </span>
                                                </div>

                                                <div className="text-[#94A3B8] group-hover:text-[#8A6305] transition-colors shrink-0">
                                                    {isRtl ? (
                                                        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" strokeWidth={2} />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. Direct WhatsApp Sales Row */}
                            <a
                                href={whatsappHref(
                                    siteContacts,
                                    isRtl
                                        ? 'مرحباً، أود الاستفسار عن توريد وتوزيع بضائع لمحلنا.'
                                        : 'Hello, I would like to inquire about wholesale orders.'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-[14px] bg-white border border-[#0B192C]/[0.07] hover:border-[#C59329]/45 active:scale-[0.99] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-[9px] bg-[#0F2138] text-[#E5B54A] flex items-center justify-center shrink-0">
                                        <FaWhatsapp className="text-[16px]" />
                                    </div>
                                    <div className="flex flex-col text-start">
                                        <span className="text-[12.5px] font-bold text-[#0B192C] leading-tight">
                                            {isRtl ? 'طلب مباشر وتجهيز سريع' : 'Direct Wholesale Inquiries'}
                                        </span>
                                        <span className="text-[10.5px] text-[#8A6305] font-medium mt-0.5">
                                            {isRtl
                                                ? 'تواصل مع فريق المبيعات والتوزيع'
                                                : 'Chat with distribution reps'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[#94A3B8] group-hover:text-[#8A6305] transition-colors shrink-0">
                                    {isRtl ? (
                                        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" strokeWidth={2} />
                                    )}
                                </div>
                            </a>
                        </div>

                        {/* 5. Unboxed Manager Contact Links (Matching Original Structure) */}
                        <ManagerContactLinks
                            contacts={siteContacts}
                            isArabic={isRtl}
                            className="mx-4 mb-4 flex-col items-start"
                            linkClassName="text-[#475569] hover:text-[#8A6305]"
                        />

                        {/* 6. Social Links Footer */}
                        <div className="px-4 py-3 border-t border-[#0B192C]/[0.07] bg-white flex items-center justify-between mt-auto shrink-0">
                            <span className="text-[11px] font-semibold text-[#64748B]">
                                {isRtl ? 'تابعنا على:' : 'Follow Us:'}
                            </span>
                            <div className="flex items-center gap-2.5">
                                <a
                                    href={whatsappHref(siteContacts)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF7F0] border border-[#0B192C]/[0.08] text-[#0B192C] hover:border-[#C59329] hover:text-[#8A6305] transition-colors"
                                >
                                    <FaWhatsapp className="text-[13px]" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF7F0] border border-[#0B192C]/[0.08] text-[#0B192C] hover:border-[#C59329] hover:text-[#8A6305] transition-colors"
                                >
                                    <FaInstagram className="text-[13px]" />
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAF7F0] border border-[#0B192C]/[0.08] text-[#0B192C] hover:border-[#C59329] hover:text-[#8A6305] transition-colors"
                                >
                                    <FaFacebook className="text-[13px]" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Menu View (Department Drilldown) */}
                    <div
                        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                            activeMainCatSlug
                                ? 'translate-x-0'
                                : isRtl
                                  ? 'translate-x-full'
                                  : 'translate-x-full'
                        } flex flex-col bg-[#FAF7F0] overflow-y-auto`}
                    >
                        {activeMainCat && (
                            <div className="flex flex-col h-full">
                                {/* Back Navigation Bar */}
                                <div className="px-4 py-2.5 border-b border-[#0B192C]/[0.07] bg-white flex items-center justify-between shrink-0">
                                    <button
                                        onClick={() => {
                                            setActiveMainCatSlug(null);
                                            setExpandedSection(null);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-bold text-[#0B192C] hover:bg-[#FAF7F0] transition-colors"
                                    >
                                        {isRtl ? (
                                            <ArrowRight className="w-4 h-4 text-[#8A6305]" strokeWidth={2} />
                                        ) : (
                                            <ArrowLeft className="w-4 h-4 text-[#8A6305]" strokeWidth={2} />
                                        )}
                                        <span>
                                            {isRtl ? 'العودة للقائمة الرئيسية' : 'Back to Main Menu'}
                                        </span>
                                    </button>

                                    <span className="text-xs font-bold text-[#8A6305] truncate max-w-[140px]">
                                        {activeMainCat.name}
                                    </span>
                                </div>

                                {/* Department Quick View All + Grouped Accordion Sheets */}
                                <div className="p-3.5 flex flex-col gap-3">
                                    <Link
                                        href={`/department/${activeMainCat.slug}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full py-2.5 px-3.5 rounded-[12px] bg-[#0F2138] hover:bg-[#162C46] text-white flex items-center justify-between text-xs font-bold transition-colors"
                                    >
                                        <span>
                                            {isRtl
                                                ? `عرض جميع منتجات ${activeMainCat.name}`
                                                : `View all in ${activeMainCat.name}`}
                                        </span>
                                        {isRtl ? (
                                            <ChevronLeft className="w-4 h-4 text-[#E5B54A]" strokeWidth={2} />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-[#E5B54A]" strokeWidth={2} />
                                        )}
                                    </Link>

                                    {/* Brands Section */}
                                    {activeMainCat.brands && activeMainCat.brands.length > 0 && (
                                        <div className="rounded-[14px] border border-[#0B192C]/[0.07] overflow-hidden bg-white">
                                            <button
                                                onClick={() =>
                                                    setExpandedSection(
                                                        expandedSection === 'brands' ? null : 'brands'
                                                    )
                                                }
                                                className="w-full flex items-center justify-between p-3.5 bg-white font-bold text-xs text-[#0B192C]"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Store className="w-4 h-4 text-[#8A6305]" strokeWidth={1.75} />
                                                    <span>
                                                        {isRtl ? 'الماركات والوكالات' : 'Brands & Agencies'}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#8A6305] border border-[#C59329]/20">
                                                        {activeMainCat.brands.length}
                                                    </span>
                                                </div>
                                                {expandedSection === 'brands' ? (
                                                    <Minus className="w-4 h-4 text-[#8A6305]" strokeWidth={2} />
                                                ) : (
                                                    <Plus className="w-4 h-4 text-[#94A3B8]" strokeWidth={2} />
                                                )}
                                            </button>

                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                    expandedSection === 'brands'
                                                        ? 'max-h-[400px] border-t border-[#0B192C]/[0.06] p-1.5 overflow-y-auto'
                                                        : 'max-h-0'
                                                }`}
                                            >
                                                <div className="grid grid-cols-1 gap-0.5">
                                                    {activeMainCat.brands.map((brand) => (
                                                        <Link
                                                            key={brand.id}
                                                            href={`/products?brand=${brand.slug}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-semibold text-[#0B192C]/85 hover:bg-[#FAF7F0] hover:text-[#8A6305] transition-colors"
                                                        >
                                                            <span>
                                                                {getBrandDisplayName(
                                                                    brand,
                                                                    language === 'ar' ? 'ar' : 'en'
                                                                )}
                                                            </span>
                                                            {isRtl ? (
                                                                <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
                                                            ) : (
                                                                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                                                            )}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Categories Section */}
                                    {activeMainCat.categories &&
                                        activeMainCat.categories.length > 0 && (
                                            <div className="rounded-[14px] border border-[#0B192C]/[0.07] overflow-hidden bg-white">
                                                <button
                                                    onClick={() =>
                                                        setExpandedSection(
                                                            expandedSection === 'categories'
                                                                ? null
                                                                : 'categories'
                                                        )
                                                    }
                                                    className="w-full flex items-center justify-between p-3.5 bg-white font-bold text-xs text-[#0B192C]"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <LayoutGrid
                                                            className="w-4 h-4 text-[#8A6305]"
                                                            strokeWidth={1.75}
                                                        />
                                                        <span>
                                                            {isRtl
                                                                ? 'الأقسام والتصنيفات الفرعية'
                                                                : 'Sub-categories'}
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#8A6305] border border-[#C59329]/20">
                                                            {activeMainCat.categories.length}
                                                        </span>
                                                    </div>
                                                    {expandedSection === 'categories' ? (
                                                        <Minus
                                                            className="w-4 h-4 text-[#8A6305]"
                                                            strokeWidth={2}
                                                        />
                                                    ) : (
                                                        <Plus
                                                            className="w-4 h-4 text-[#94A3B8]"
                                                            strokeWidth={2}
                                                        />
                                                    )}
                                                </button>

                                                <div
                                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                        expandedSection === 'categories'
                                                            ? 'max-h-[400px] border-t border-[#0B192C]/[0.06] p-1.5 overflow-y-auto'
                                                            : 'max-h-0'
                                                    }`}
                                                >
                                                    <div className="grid grid-cols-1 gap-0.5">
                                                        {activeMainCat.categories.map((cat) => (
                                                            <Link
                                                                key={cat.id}
                                                                href={`/categories/${cat.slug}`}
                                                                onClick={() =>
                                                                    setIsMobileMenuOpen(false)
                                                                }
                                                                className="flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-semibold text-[#0B192C]/85 hover:bg-[#FAF7F0] hover:text-[#8A6305] transition-colors"
                                                            >
                                                                <span>{cat.name}</span>
                                                                {isRtl ? (
                                                                    <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
                                                                ) : (
                                                                    <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                                                                )}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
