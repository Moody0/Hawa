"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/app/context/LanguageContext';
import { X, Home, ShoppingBag, Store, Info, FileText, Headphones, ChevronLeft, ChevronRight, Plus, Minus, FolderTree, ArrowRight, ArrowLeft } from 'lucide-react';
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
    const { t, dir, language } = useLanguage();
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
            fetch('/api/navigation')
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

    const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '');

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
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

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
    ];

    return (
        <div className="fixed inset-0 z-[60] lg:hidden overflow-hidden" suppressHydrationWarning>
            {/* Backdrop with Blur */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Fullscreen Mobile Menu Drawer */}
            <div
                className={`fixed inset-0 z-[61] w-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                    isRtl
                        ? (isAnimating ? 'translate-x-0' : '-translate-x-full')
                        : (isAnimating ? 'translate-x-0' : 'translate-x-full')
                } overflow-hidden`}
                role="dialog"
                aria-modal="true"
                aria-label={isRtl ? 'قائمة التصفح' : 'Navigation Menu'}
            >
                {/* Top Header inside Drawer */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-zinc-800/60 shrink-0">
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
                            <span className="font-black text-[#0B192C] dark:text-white text-sm tracking-tight leading-tight">
                                {isRtl ? 'حـوا للتوزيع' : 'HAWA TRADING'}
                            </span>
                            <span className="text-[9px] font-extrabold text-[#8A6305] tracking-wider uppercase">
                                {isRtl ? 'توريد وتوزيع جملة' : 'Wholesale Distribution'}
                            </span>
                        </div>
                    </Link>

                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs active:scale-95"
                        aria-label={isRtl ? 'إغلاق القائمة' : 'Close Menu'}
                    >
                        <X className="text-xl" />
                    </button>
                </div>

                {/* Sliding Views Container */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Main Menu View */}
                    <div
                        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                            activeMainCatSlug
                                ? (isRtl ? '-translate-x-full' : '-translate-x-full')
                                : 'translate-x-0'
                        } flex flex-col overflow-y-auto`}
                    >
                        <div className="p-3.5 flex flex-col gap-3">
                            {/* Merchant & Wholesale Portal Card (Redesigned & Professional) */}
                            <Link
                                href="/account"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#0B192C] via-[#122238] to-[#0B192C] text-white shadow-md border border-[#8A6305]/30 transition-all active:scale-[0.99]"
                            >
                                <div className="absolute top-0 end-0 w-32 h-32 bg-[#8A6305]/10 rounded-full blur-2xl pointer-events-none" />
                                
                                <div className="flex items-center justify-between gap-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#8A6305]/25 border border-[#8A6305]/40 flex items-center justify-center text-[#FAF6EC] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                                            <Store className="text-xl text-[#FAF6EC]" />
                                        </div>
                                        <div className="flex flex-col text-start">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-extrabold text-sm text-white tracking-tight leading-tight">
                                                    {isRtl ? 'بوابة التجار المعتمدة' : 'Official Merchant Portal'}
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#8A6305] text-white uppercase tracking-wider">
                                                    B2B
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-medium text-gray-300 mt-0.5">
                                                {isRtl ? 'دخول لحسابك وعرض أسعار الجملة' : 'Login to view wholesale rates'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 group-hover:bg-[#8A6305] group-hover:text-white transition-colors shrink-0">
                                        {isRtl ? <ChevronLeft className="text-lg" /> : <ChevronRight className="text-lg" />}
                                    </div>
                                </div>
                            </Link>

                            {/* Core Navigation Links */}
                            <div className="bg-gray-50/70 dark:bg-zinc-800/40 rounded-2xl p-1.5 border border-gray-100 dark:border-white/5 space-y-0.5">
                                {mainNavItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#0B192C] dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-700/60 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-all group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <IconComponent className="text-lg text-gray-400 dark:text-gray-400 group-hover:text-[#8A6305] transition-colors shrink-0" />
                                                <span className="text-sm font-bold">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#8A6305]/10 text-[#8A6305] border border-[#8A6305]/20">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Product Departments Section */}
                            {navData.length > 0 && (
                                <div className="mt-1 flex flex-col gap-2">
                                    <div className="px-2 flex items-center justify-between">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A6305] dark:text-[#8A6305]">
                                            {isRtl ? 'أقسام وتصنيفات المنتجات' : 'Product Departments'}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {navData.length} {isRtl ? 'أقسام' : 'Depts'}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50/70 dark:bg-zinc-800/40 rounded-2xl p-1.5 border border-gray-100 dark:border-white/5 divide-y divide-gray-200/50 dark:divide-white/5">
                                        {navData.map((mc) => (
                                            <button
                                                key={mc.id}
                                                onClick={() => setActiveMainCatSlug(mc.slug)}
                                                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-start hover:bg-white dark:hover:bg-zinc-700/60 transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-[#8A6305]/10 dark:bg-[#8A6305]/20 flex items-center justify-center text-[#8A6305] shrink-0">
                                                        <FolderTree className="text-sm" />
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white group-hover:text-[#8A6305] transition-colors">
                                                        {mc.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-[#8A6305] transition-colors">
                                                    <span className="text-[10px] font-medium hidden xs:inline">
                                                        {(mc.brands?.length || 0) + (mc.categories?.length || 0)}
                                                    </span>
                                                    {isRtl ? (
                                                        <ChevronLeft className="text-lg" />
                                                    ) : (
                                                        <ChevronRight className="text-lg" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Direct WhatsApp Sales Banner */}
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                                    isRtl ? 'مرحباً، أود الاستفسار عن توريد وتوزيع بضائع لمحلنا.' : 'Hello, I would like to inquire about wholesale orders.'
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 transition-colors"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center text-base shadow-xs shrink-0">
                                        <FaWhatsapp />
                                    </div>
                                    <div className="flex flex-col text-start">
                                        <span className="text-xs font-bold leading-tight">
                                            {isRtl ? 'طلب مباشر وتجهيز سريع' : 'Direct Wholesale Inquiries'}
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                            {isRtl ? 'تواصل مع فريق المبيعات والتوزيع' : 'Chat with distribution reps'}
                                        </span>
                                    </div>
                                </div>
                                {isRtl ? <ChevronLeft className="text-lg shrink-0" /> : <ChevronRight className="text-lg shrink-0" />}
                            </a>
                        </div>

                        {/* Social Links Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center justify-between mt-auto">
                            <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-400">
                                {isRtl ? 'تابعنا على:' : 'Follow Us:'}
                            </span>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp"
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-emerald-600 bg-white dark:bg-zinc-800 hover:scale-110 transition-transform shadow-2xs"
                                >
                                    <FaWhatsapp className="text-sm" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-pink-600 bg-white dark:bg-zinc-800 hover:scale-110 transition-transform shadow-2xs"
                                >
                                    <FaInstagram className="text-sm" />
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-blue-600 bg-white dark:bg-zinc-800 hover:scale-110 transition-transform shadow-2xs"
                                >
                                    <FaFacebook className="text-sm" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Menu View (Department Drilldown) */}
                    <div
                        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                            activeMainCatSlug ? 'translate-x-0' : (isRtl ? 'translate-x-full' : 'translate-x-full')
                        } flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto`}
                    >
                        {activeMainCat && (
                            <div className="flex flex-col h-full">
                                {/* Back Navigation Bar */}
                                <div className="p-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-zinc-800/60 flex items-center justify-between shrink-0">
                                    <button
                                        onClick={() => {
                                            setActiveMainCatSlug(null);
                                            setExpandedSection(null);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#0B192C] dark:text-white hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        {isRtl ? <ArrowRight className="text-base" /> : <ArrowLeft className="text-base" />}
                                        <span>{isRtl ? 'العودة للقائمة الرئيسية' : 'Back to Main Menu'}</span>
                                    </button>

                                    <span className="text-xs font-extrabold text-[#8A6305] truncate max-w-[140px]">
                                        {activeMainCat.name}
                                    </span>
                                </div>

                                {/* Department Quick View All Card */}
                                <div className="p-3.5 flex flex-col gap-3">
                                    <Link
                                        href={`/department/${activeMainCat.slug}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#0B192C] hover:bg-[#8A6305] text-white flex items-center justify-between text-xs font-bold transition-colors shadow-xs"
                                    >
                                        <span>{isRtl ? `عرض جميع منتجات ${activeMainCat.name}` : `View all in ${activeMainCat.name}`}</span>
                                        {isRtl ? <ChevronLeft className="text-lg" /> : <ChevronRight className="text-lg" />}
                                    </Link>

                                    {/* Brands Section */}
                                    {activeMainCat.brands && activeMainCat.brands.length > 0 && (
                                        <div className="rounded-xl border border-gray-200/70 dark:border-white/10 overflow-hidden bg-gray-50/40 dark:bg-zinc-800/30">
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'brands' ? null : 'brands')}
                                                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-800/80 font-bold text-xs text-[#0B192C] dark:text-white"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Store className="text-base text-[#8A6305]" />
                                                    <span>{isRtl ? 'الماركات والوكالات' : 'Brands & Agencies'}</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300">
                                                        {activeMainCat.brands.length}
                                                    </span>
                                                </div>
                                                {expandedSection === 'brands' ? (
                                                    <Minus className="text-lg text-[#8A6305]" />
                                                ) : (
                                                    <Plus className="text-lg text-gray-400" />
                                                )}
                                            </button>

                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                    expandedSection === 'brands' ? 'max-h-[400px] border-t border-gray-100 dark:border-white/5 p-2 overflow-y-auto' : 'max-h-0'
                                                }`}
                                            >
                                                <div className="grid grid-cols-1 gap-1">
                                                    {activeMainCat.brands.map((brand) => (
                                                        <Link
                                                            key={brand.id}
                                                            href={`/products?brand=${brand.slug}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-700 hover:text-[#8A6305] transition-colors"
                                                        >
                                                            <span>{brand.name}</span>
                                                            {isRtl ? <ChevronLeft className="text-sm text-gray-400" /> : <ChevronRight className="text-sm text-gray-400" />}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Categories Section */}
                                    {activeMainCat.categories && activeMainCat.categories.length > 0 && (
                                        <div className="rounded-xl border border-gray-200/70 dark:border-white/10 overflow-hidden bg-gray-50/40 dark:bg-zinc-800/30">
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                                                className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-800/80 font-bold text-xs text-[#0B192C] dark:text-white"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FolderTree className="text-base text-[#8A6305]" />
                                                    <span>{isRtl ? 'الأقسام والتصنيفات الفرعية' : 'Sub-categories'}</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300">
                                                        {activeMainCat.categories.length}
                                                    </span>
                                                </div>
                                                {expandedSection === 'categories' ? (
                                                    <Minus className="text-lg text-[#8A6305]" />
                                                ) : (
                                                    <Plus className="text-lg text-gray-400" />
                                                )}
                                            </button>

                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                    expandedSection === 'categories' ? 'max-h-[400px] border-t border-gray-100 dark:border-white/5 p-2 overflow-y-auto' : 'max-h-0'
                                                }`}
                                            >
                                                <div className="grid grid-cols-1 gap-1">
                                                    {activeMainCat.categories.map((cat) => (
                                                        <Link
                                                            key={cat.id}
                                                            href={`/categories/${cat.slug}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-700 hover:text-[#8A6305] transition-colors"
                                                        >
                                                            <span>{cat.name}</span>
                                                            {isRtl ? <ChevronLeft className="text-sm text-gray-400" /> : <ChevronRight className="text-sm text-gray-400" />}
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
