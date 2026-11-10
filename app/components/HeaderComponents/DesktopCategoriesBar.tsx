"use client";

import { whatsappHref } from '@/lib/website-content';
import { useSiteContacts } from '@/app/context/SiteContactsContext';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { NavMainCategory } from '@/lib/navigation';
import { getBrandDisplayName } from '@/lib/brand-display';
import ResilientImage from '@/app/components/ResilientImage';

interface DesktopCategoriesBarProps {
    navData: NavMainCategory[];
    isScrolled: boolean;
    isArabic: boolean;
    isVisible?: boolean;
}

const EASE_APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function DesktopCategoriesBar({
    navData = [],
    isArabic,
    isVisible = true,
}: DesktopCategoriesBarProps) {
    const pathname = usePathname();
    const siteContacts = useSiteContacts();
    const [activeSlug, setActiveSlug] = useState<string | null>(null);
    const [isPinned, setIsPinned] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimeouts = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current);
            openTimeoutRef.current = null;
        }
    }, []);

    const closeMenu = useCallback(() => {
        clearTimeouts();
        setActiveSlug(null);
        setIsPinned(false);
    }, [clearTimeouts]);

    // Automatically close when the navbar disappears on scroll
    useEffect(() => {
        if (!isVisible) {
            closeMenu();
        }
    }, [isVisible, closeMenu]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeMenu]);

    // Close menu when route changes
    useEffect(() => {
        closeMenu();
    }, [pathname, closeMenu]);

    const handleMouseEnter = (slug: string) => {
        clearTimeouts();
        openTimeoutRef.current = setTimeout(() => {
            setActiveSlug(slug);
        }, 55);
    };

    const handleMouseLeave = () => {
        clearTimeouts();
        if (isPinned) return;
        closeTimeoutRef.current = setTimeout(() => {
            setActiveSlug(null);
        }, 190);
    };

    const handleClick = (slug: string) => {
        clearTimeouts();
        if (activeSlug === slug) {
            setActiveSlug(null);
            setIsPinned(false);
        } else {
            setActiveSlug(slug);
            setIsPinned(true);
        }
    };

    const activeDepartment = navData.find((d) => d.slug === activeSlug);

    // Quick-jump categories for Concept 02 sub-navbar track (top 5 featured/popular categories across departments)
    const quickCategories = useMemo(() => {
        const allCats: { id: string; name: string; slug: string; isFeatured?: boolean }[] = [];
        const seen = new Set<string>();
        for (const dept of navData) {
            for (const cat of dept.categories || []) {
                if (!cat.name || cat.name.trim() === '0') continue;
                const key = cat.slug || cat.name.trim().toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    allCats.push(cat);
                }
            }
        }
        return [...allCats]
            .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
            .slice(0, 5);
    }, [navData]);

    // Deduplicate all brands across all departments for the 'all' directory view
    const allUniqueBrands = useMemo(() => {
        const seen = new Set<string>();
        const list = [];
        for (const dept of navData) {
            for (const brand of dept.brands || []) {
                const key = brand.slug?.trim().toLowerCase();
                if (!key || seen.has(key)) continue;
                seen.add(key);
                list.push(brand);
            }
        }
        return list;
    }, [navData]);

    // Deduplicate and filter categories for active department
    const uniqueCategories = useMemo(() => {
        if (!activeDepartment?.categories) return [];
        const seen = new Set<string>();
        const result = [];
        for (const cat of activeDepartment.categories) {
            if (!cat.name || cat.name.trim() === '0') continue;
            const normalized = cat.name.trim().toLowerCase();
            if (!seen.has(normalized)) {
                seen.add(normalized);
                result.push(cat);
            }
        }
        return result;
    }, [activeDepartment]);

    const uniqueBrands = useMemo(() => {
        if (!activeDepartment?.brands) return [];
        const seen = new Set<string>();
        return activeDepartment.brands.filter((brand) => {
            const key = brand.slug?.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [activeDepartment]);

    const featuredProducts = activeDepartment?.trendingProducts?.slice(0, 3) || [];

    const getProductImage = (images: string) => {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) return parsed[0] || '/placeholder.svg';
        } catch {
            // Product image values may also be comma-separated paths.
        }
        return images.split(',')[0]?.trim() || '/placeholder.svg';
    };

    return (
        <div
            className="relative w-full bg-transparent text-white select-none"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={clearTimeouts}
        >
            {/* Concept 02 Sub-Navbar Row (38px on laptops, 46px on 2xl big screens) */}
            <div className="container-custom h-[38px] 2xl:h-[46px] flex items-center justify-between">
                {/* Start Side: Department Triggers (no chevrons) + Quick-Jump Category Links */}
                <nav
                    className="flex items-center gap-4 2xl:gap-6 h-full"
                    aria-label={isArabic ? 'أقسام المنتجات' : 'Product Categories'}
                >
                    {/* Main Department Triggers */}
                    <div className="flex items-center gap-5 2xl:gap-7 h-full">
                        {navData.map((dept) => {
                            const isOpen = activeSlug === dept.slug;
                            const isCurrentRoute = pathname === `/department/${dept.slug}`;
                            const isSelected = isOpen || isCurrentRoute;

                            return (
                                <button
                                    key={dept.id}
                                    type="button"
                                    onClick={() => handleClick(dept.slug)}
                                    onMouseEnter={() => handleMouseEnter(dept.slug)}
                                    className={`group/dept relative py-1 2xl:py-1.5 text-[12.5px] 2xl:text-[13.5px] whitespace-nowrap transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none ${
                                        isSelected
                                            ? 'text-white font-bold'
                                            : 'text-white/80 hover:text-white font-semibold'
                                    }`}
                                    aria-expanded={isOpen}
                                >
                                    <span>{dept.name}</span>
                                    <span
                                        className={`pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                            isSelected
                                                ? 'scale-x-100 origin-right'
                                                : 'scale-x-0 origin-left group-hover/dept:origin-right group-hover/dept:scale-x-100'
                                        }`}
                                        aria-hidden="true"
                                    />
                                </button>
                            );
                        })}

                        {/* All Departments Trigger */}
                        <button
                            type="button"
                            onClick={() => handleClick('all')}
                            onMouseEnter={() => handleMouseEnter('all')}
                            className={`group/dept relative py-1 2xl:py-1.5 text-[12.5px] 2xl:text-[13.5px] whitespace-nowrap transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none ${
                                activeSlug === 'all'
                                    ? 'text-white font-bold'
                                    : 'text-white/80 hover:text-white font-semibold'
                            }`}
                            aria-expanded={activeSlug === 'all'}
                        >
                            <span>{isArabic ? 'دليل كافة الأقسام' : 'All Departments'}</span>
                            <span
                                className={`pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    activeSlug === 'all'
                                        ? 'scale-x-100 origin-right'
                                        : 'scale-x-0 origin-left group-hover/dept:origin-right group-hover/dept:scale-x-100'
                                }`}
                                aria-hidden="true"
                            />
                        </button>
                    </div>

                    {/* Subtle Gold Hairline Separator + Quick-Jump Category Shortcuts */}
                    {quickCategories.length > 0 && (
                        <>
                            <span className="w-px h-3.5 bg-[#E5B54A]/35" aria-hidden="true" />
                            <div className="flex items-center gap-3.5 2xl:gap-5">
                                {quickCategories.map((cat) => {
                                    const isCatActive = pathname === `/category/${cat.slug}`;
                                    return (
                                        <Link
                                            key={cat.id}
                                            href={`/category/${cat.slug}`}
                                            onMouseEnter={closeMenu}
                                            className={`group/quick relative py-1 2xl:py-1.5 text-[11.5px] 2xl:text-[12.5px] whitespace-nowrap transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                isCatActive
                                                    ? 'text-white font-bold'
                                                    : 'text-white/60 hover:text-white font-medium'
                                            }`}
                                        >
                                            <span>{cat.name}</span>
                                            <span
                                                className={`pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                    isCatActive
                                                        ? 'scale-x-100 origin-right'
                                                        : 'scale-x-0 origin-left group-hover/quick:origin-right group-hover/quick:scale-x-100'
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </nav>

                {/* End Side: Logistics Metadata & Gold-Accented Wholesale Quote Link */}
                <div className="flex items-center gap-3.5 text-[12.5px] text-white/60" dir={isArabic ? 'rtl' : 'ltr'}>
                    <span className="font-medium">
                        {isArabic ? 'توريد خلال 48 ساعة' : '48h Wholesale Delivery'}
                    </span>

                    <span className="text-[#E5B54A]/60" aria-hidden="true">·</span>

                    <a
                        href={whatsappHref(
                            siteContacts,
                            isArabic
                                ? 'مرحباً شركة حوا، أرغب بالاستفسار عن طلبيات وتوزيع الجملة.'
                                : 'Hello, I want to inquire about wholesale distribution.'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/wa relative py-1 text-[#E5B54A] hover:text-[#F3CB6E] font-bold transition-colors duration-200"
                    >
                        <span>{isArabic ? 'طلب تسعيرة جملة ↗' : 'Wholesale Quote ↗'}</span>
                        <span
                            className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] rounded-full bg-white scale-x-0 origin-left group-hover/wa:origin-right group-hover/wa:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            aria-hidden="true"
                        />
                    </a>
                </div>
            </div>

            {/* Backdrop Blur Scrim */}
            <AnimatePresence>
                {activeSlug && (
                    <motion.div
                        key="header-curtain-scrim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE_APPLE }}
                        className="fixed inset-0 top-[118px] bg-[#0B192C]/35 backdrop-blur-[6px] z-30"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Apple-Style Curtain Flyout Panel — Zero Nested Containers, Architectural Hairline Grid */}
            <AnimatePresence>
                {activeSlug && (
                    <motion.div
                        key="header-curtain-panel"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28, ease: EASE_APPLE }}
                        className="absolute top-full left-0 right-0 w-full bg-white/98 backdrop-blur-2xl text-[#0B192C] border-b border-[#0B192C]/[0.08] shadow-[0_24px_48px_-16px_rgba(11,25,44,0.14)] z-40 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="container-custom py-8">
                            <AnimatePresence mode="wait">
                                {activeSlug === 'all' ? (
                                    <motion.div
                                        key="curtain-all"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2, ease: EASE_APPLE }}
                                    >
                                        {/* Top Header Bar */}
                                        <div className="flex items-baseline justify-between border-b border-[#0B192C]/[0.08] pb-4 mb-7">
                                            <div className="flex items-baseline gap-3">
                                                <h3 className="text-[18px] font-extrabold text-[#0B192C] tracking-tight">
                                                    {isArabic ? 'دليل الأقسام والتصنيفات' : 'Departments & Categories Directory'}
                                                </h3>
                                                <span className="text-[12.5px] font-medium text-slate-400">
                                                    {navData.length} {isArabic ? 'أقسام رئيسية' : 'Main Departments'} · {allUniqueBrands.length} {isArabic ? 'وكالات حصرية' : 'Agencies'}
                                                </span>
                                            </div>
                                            <Link
                                                href="/products"
                                                onClick={closeMenu}
                                                className="group/all relative py-0.5 text-[13px] font-bold text-[#8A6305] hover:text-[#735204] inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <span>{isArabic ? 'تصفح كتالوج المنتجات الكامل' : 'Browse Full Product Catalog'}</span>
                                                <span className="transition-transform duration-200 group-hover/all:-translate-x-1" aria-hidden="true">
                                                    {isArabic ? '←' : '→'}
                                                </span>
                                            </Link>
                                        </div>

                                        {/* Open 12-Column Architectural Index (Zero Card-in-Card Boxes) */}
                                        <div className="grid grid-cols-12 gap-10">
                                            {navData.map((dept, idx) => {
                                                const deptCats = (dept.categories || []).filter(
                                                    (c) => c.name && c.name.trim() !== '0'
                                                );

                                                return (
                                                    <div
                                                        key={dept.id}
                                                        className={`col-span-4 ${
                                                            idx > 0 ? 'border-s border-[#0B192C]/[0.08] ps-9' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-baseline justify-between mb-4">
                                                            <div className="flex items-baseline gap-2.5">
                                                                <Link
                                                                    href={`/department/${dept.slug}`}
                                                                    onClick={closeMenu}
                                                                    className="text-[16px] font-extrabold text-[#0B192C] hover:text-[#8A6305] transition-colors"
                                                                >
                                                                    {dept.name}
                                                                </Link>
                                                                <span className="text-[11.5px] font-semibold text-slate-400">
                                                                    ({deptCats.length})
                                                                </span>
                                                            </div>
                                                            <Link
                                                                href={`/department/${dept.slug}`}
                                                                onClick={closeMenu}
                                                                className="group/v text-[12px] font-bold text-[#8A6305] hover:text-[#735204] transition-colors inline-flex items-center gap-1"
                                                            >
                                                                <span>{isArabic ? 'عرض القسم' : 'View All'}</span>
                                                                <span className="transition-transform duration-200 group-hover/v:-translate-x-0.5" aria-hidden="true">
                                                                    {isArabic ? '←' : '→'}
                                                                </span>
                                                            </Link>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                                            {deptCats.map((cat) => (
                                                                <Link
                                                                    key={cat.id}
                                                                    href={`/category/${cat.slug}`}
                                                                    onClick={closeMenu}
                                                                    className="group/cat relative py-1 flex items-center justify-between text-[14px] font-semibold text-slate-600 hover:text-[#0B192C] transition-colors"
                                                                >
                                                                    <span className="relative">
                                                                        {cat.name}
                                                                        <span
                                                                            className="pointer-events-none absolute -bottom-0.5 inset-x-0 h-[1.5px] bg-[#0B192C] scale-x-0 origin-left group-hover/cat:origin-right group-hover/cat:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                    <span
                                                                        className="text-[12px] text-[#B68012] opacity-0 translate-x-1 group-hover/cat:opacity-100 group-hover/cat:translate-x-0 transition-all duration-200"
                                                                        aria-hidden="true"
                                                                    >
                                                                        {isArabic ? '←' : '→'}
                                                                    </span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Column 3: Official Agencies Directory (4 cols, no nested pill boxes) */}
                                            <div className="col-span-4 border-s border-[#0B192C]/[0.08] ps-9">
                                                <div className="flex items-baseline justify-between mb-4">
                                                    <h4 className="text-[15px] font-extrabold text-[#0B192C]">
                                                        {isArabic ? 'الوكالات التجارية المعتمدة' : 'Official Agencies'}
                                                    </h4>
                                                    <Link
                                                        href="/brands"
                                                        onClick={closeMenu}
                                                        className="text-[12px] font-bold text-[#8A6305] hover:text-[#735204] transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <span>{isArabic ? 'كل الوكالات' : 'All Brands'}</span>
                                                        <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                                                    {allUniqueBrands.map((brand) => {
                                                        const brandLabel = getBrandDisplayName(brand, isArabic ? 'ar' : 'en');
                                                        return (
                                                            <Link
                                                                key={brand.id}
                                                                href={`/brand/${brand.slug}`}
                                                                onClick={closeMenu}
                                                                className="group/brand flex items-center gap-3 py-1 text-slate-700 hover:text-[#0B192C] transition-colors"
                                                            >
                                                                {brand.image ? (
                                                                    <div className="relative w-11 h-7 shrink-0">
                                                                        <ResilientImage
                                                                            src={brand.image}
                                                                            alt={brandLabel}
                                                                            fill
                                                                            sizes="44px"
                                                                            className="object-contain group-hover/brand:scale-105 transition-transform duration-200"
                                                                        />
                                                                    </div>
                                                                ) : null}
                                                                <span className="relative text-[13.5px] font-bold truncate">
                                                                    {brandLabel}
                                                                    <span
                                                                        className="pointer-events-none absolute -bottom-0.5 inset-x-0 h-[1.5px] bg-[#0B192C] scale-x-0 origin-left group-hover/brand:origin-right group-hover/brand:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : activeDepartment ? (
                                    <motion.div
                                        key={`curtain-dept-${activeDepartment.slug}`}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2, ease: EASE_APPLE }}
                                    >
                                        {/* Curtain Header */}
                                        <div className="flex items-baseline justify-between border-b border-[#0B192C]/[0.08] pb-4 mb-7">
                                            <div className="flex items-baseline gap-3">
                                                <h3 className="text-[18px] font-extrabold text-[#0B192C] tracking-tight">
                                                    {isArabic ? `أقسام وتصنيفات ${activeDepartment.name}` : `${activeDepartment.name} Directory`}
                                                </h3>
                                                <span className="text-[12.5px] font-medium text-slate-400">
                                                    {uniqueCategories.length} {isArabic ? 'تصنيف فرعي' : 'Categories'} · {uniqueBrands.length} {isArabic ? 'وكالات تجارية' : 'Agencies'}
                                                </span>
                                            </div>
                                            <Link
                                                href={`/department/${activeDepartment.slug}`}
                                                onClick={closeMenu}
                                                className="group/all relative py-0.5 text-[13px] font-bold text-[#8A6305] hover:text-[#735204] inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <span>
                                                    {isArabic
                                                        ? `عرض جميع منتجات ${activeDepartment.name}`
                                                        : `View All ${activeDepartment.name}`}
                                                </span>
                                                <span className="transition-transform duration-200 group-hover/all:-translate-x-1" aria-hidden="true">
                                                    {isArabic ? '←' : '→'}
                                                </span>
                                            </Link>
                                        </div>

                                        {/* 12-Column Open Architectural Layout — Zero Nested Card Boxes */}
                                        <div className="grid grid-cols-12 gap-10">
                                            {/* Column 1: Subcategories (4 cols) */}
                                            <div className="col-span-4">
                                                <h4 className="text-[11.5px] font-bold text-slate-400 mb-4">
                                                    {isArabic ? 'التصنيفات الفرعية' : 'Subcategories'}
                                                </h4>
                                                {uniqueCategories.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                                        {uniqueCategories.map((cat) => (
                                                            <Link
                                                                key={cat.id}
                                                                href={`/category/${cat.slug}`}
                                                                onClick={closeMenu}
                                                                className="group/cat flex items-center justify-between py-1 text-[14px] font-semibold text-slate-600 hover:text-[#0B192C] transition-colors duration-150"
                                                            >
                                                                <span className="relative truncate">
                                                                    {cat.name}
                                                                    <span
                                                                        className="pointer-events-none absolute -bottom-0.5 inset-x-0 h-[1.5px] bg-[#0B192C] scale-x-0 origin-left group-hover/cat:origin-right group-hover/cat:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                                <span
                                                                    className="text-[12px] text-[#B68012] opacity-0 translate-x-1 group-hover/cat:opacity-100 group-hover/cat:translate-x-0 transition-all duration-150"
                                                                    aria-hidden="true"
                                                                >
                                                                    {isArabic ? '←' : '→'}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400">
                                                        {isArabic ? 'لا توجد تصنيفات متاحة' : 'No categories available'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Column 2: Agencies / Brands (3 cols, unboxed logos directly on surface) */}
                                            <div className="col-span-3 border-s border-[#0B192C]/[0.08] ps-9">
                                                <h4 className="text-[11.5px] font-bold text-slate-400 mb-4">
                                                    {isArabic ? 'الوكالات والعلامات التجارية' : 'Agencies & Brands'}
                                                </h4>
                                                {uniqueBrands.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                                        {uniqueBrands.map((brand) => {
                                                            const brandLabel = getBrandDisplayName(brand, isArabic ? 'ar' : 'en');
                                                            return (
                                                                <Link
                                                                    key={brand.id}
                                                                    href={`/brand/${brand.slug}`}
                                                                    onClick={closeMenu}
                                                                    className="group/brand flex items-center gap-3 py-0.5 text-slate-700 hover:text-[#0B192C] transition-colors"
                                                                >
                                                                    {brand.image ? (
                                                                        <div className="relative w-12 h-8 shrink-0">
                                                                            <ResilientImage
                                                                                src={brand.image}
                                                                                alt={brandLabel}
                                                                                fill
                                                                                sizes="48px"
                                                                                className="object-contain group-hover/brand:scale-105 transition-transform duration-200"
                                                                            />
                                                                        </div>
                                                                    ) : null}
                                                                    <span className="relative text-[13.5px] font-bold truncate">
                                                                        {brandLabel}
                                                                        <span
                                                                            className="pointer-events-none absolute -bottom-0.5 inset-x-0 h-[1.5px] bg-[#0B192C] scale-x-0 origin-left group-hover/brand:origin-right group-hover/brand:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400">
                                                        {isArabic ? 'لا توجد علامات تجارية' : 'No brands available'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Column 3: Selected Products (5 cols, 3-column horizontal showcase without nested boxes) */}
                                            <div className="col-span-5 border-s border-[#0B192C]/[0.08] ps-9">
                                                <h4 className="text-[11.5px] font-bold text-slate-400 mb-4">
                                                    {isArabic ? 'منتجات مختارة من القسم' : 'Selected Products'}
                                                </h4>
                                                {featuredProducts.length > 0 ? (
                                                    <div className="grid grid-cols-3 gap-6">
                                                        {featuredProducts.map((prod) => {
                                                            const imgUrl = getProductImage(prod.images);
                                                            const prodName = isArabic ? (prod.nameAr || prod.name) : (prod.nameEn || prod.name);
                                                            const brandLabel = prod.brand
                                                                ? getBrandDisplayName(prod.brand, isArabic ? 'ar' : 'en')
                                                                : '';

                                                            return (
                                                                <Link
                                                                    key={prod.id}
                                                                    href={`/product/${prod.slug}`}
                                                                    onClick={closeMenu}
                                                                    className="group/prod flex flex-col gap-2.5"
                                                                >
                                                                    <div className="relative w-full h-24">
                                                                        <ResilientImage
                                                                            src={imgUrl}
                                                                            alt={prodName}
                                                                            fill
                                                                            sizes="140px"
                                                                            className="object-contain object-right rtl:object-right ltr:object-left group-hover/prod:scale-105 transition-transform duration-300"
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        {brandLabel ? (
                                                                            <span className="block text-[11px] font-bold text-[#8A6305] mb-0.5">
                                                                                {brandLabel}
                                                                            </span>
                                                                        ) : null}
                                                                        <h5 className="text-[13px] font-bold text-slate-800 group-hover/prod:text-[#0B192C] line-clamp-2 leading-snug transition-colors">
                                                                            {prodName}
                                                                        </h5>
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-400">
                                                        {isArabic ? 'لا توجد منتجات مميزة حالياً' : 'No featured products'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
