"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutGrid, 
    FolderTree, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Truck
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import type { NavMainCategory } from '@/lib/navigation';

interface DesktopCategoriesBarProps {
    navData: NavMainCategory[];
    isScrolled: boolean;
    isArabic: boolean;
    isVisible?: boolean;
}

export default function DesktopCategoriesBar({
    navData = [],
    isScrolled,
    isArabic,
    isVisible = true,
}: DesktopCategoriesBarProps) {
    const pathname = usePathname();
    const [activeSlug, setActiveSlug] = useState<string | null>(null);
    const [renderedSlug, setRenderedSlug] = useState<string | null>(null);
    const [isPinned, setIsPinned] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keep renderedSlug during the 250ms close transition so content does not vanish mid-fade
    useEffect(() => {
        if (activeSlug) {
            setRenderedSlug(activeSlug);
        } else {
            const timer = setTimeout(() => {
                setRenderedSlug(null);
            }, 260);
            return () => clearTimeout(timer);
        }
    }, [activeSlug]);

    const closeMenu = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current);
            openTimeoutRef.current = null;
        }
        setActiveSlug(null);
        setIsPinned(false);
    }, []);

    // Automatically close when the navbar disappears on scroll
    useEffect(() => {
        if (!isVisible) {
            closeMenu();
        }
    }, [isVisible, closeMenu]);

    const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901').replace(/[^0-9]/g, '');

    const clearTimeouts = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current);
            openTimeoutRef.current = null;
        }
    };

    const handleMouseEnter = (slug: string) => {
        clearTimeouts();
        // Gentle debounce to avoid accidental flickering when hovering across items
        openTimeoutRef.current = setTimeout(() => {
            setActiveSlug(slug);
        }, 75);
    };

    const handleMouseLeave = () => {
        clearTimeouts();
        if (isPinned) return;
        closeTimeoutRef.current = setTimeout(() => {
            setActiveSlug(null);
        }, 220);
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

    const activeDepartment = navData.find((d) => d.slug === renderedSlug);

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

    return (
        <div 
            className="relative w-full bg-[#071322] border-t border-white/10 text-white select-none transition-colors duration-200"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={clearTimeouts}
        >
            <div className="container-custom h-[42px] flex items-center justify-between">
                {/* Start Side: Category Tabs */}
                <nav 
                    className="flex items-center gap-1.5 sm:gap-2 h-full" 
                    aria-label={isArabic ? 'أقسام المنتجات' : 'Product Categories'}
                >
                    {/* All Categories Button */}
                    <button
                        type="button"
                        onClick={() => handleClick('all')}
                        onMouseEnter={() => handleMouseEnter('all')}
                        className={`h-[34px] px-3 rounded-lg text-[13px] font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                            activeSlug === 'all'
                                ? 'bg-[#8A6305] text-white shadow-xs'
                                : 'bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10'
                        }`}
                        aria-expanded={activeSlug === 'all'}
                    >
                        <LayoutGrid className="w-4 h-4 text-[#E5B54A]" />
                        <span>{isArabic ? 'جميع الأقسام' : 'All Departments'}</span>
                        <ChevronDown 
                            className={`w-3.5 h-3.5 text-white/70 transition-transform duration-250 ${
                                activeSlug === 'all' ? 'rotate-180 text-white' : ''
                            }`} 
                        />
                    </button>

                    {/* Vertical Divider */}
                    <div className="h-4 w-px bg-white/15 mx-1" aria-hidden="true" />

                    {/* Department Tabs */}
                    {navData.map((dept) => {
                        const isOpen = activeSlug === dept.slug;
                        const isCurrentRoute = pathname === `/department/${dept.slug}`;

                        return (
                            <button
                                key={dept.id}
                                type="button"
                                onClick={() => handleClick(dept.slug)}
                                onMouseEnter={() => handleMouseEnter(dept.slug)}
                                className={`h-[34px] px-3 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                                    isOpen
                                        ? 'bg-[#8A6305]/25 text-[#E5B54A] border border-[#8A6305]/40 shadow-2xs'
                                        : isCurrentRoute
                                            ? 'text-[#E5B54A] bg-white/5'
                                            : 'text-white/85 hover:text-white hover:bg-white/5'
                                }`}
                                aria-expanded={isOpen}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isOpen || isCurrentRoute ? 'bg-[#E5B54A]' : 'bg-white/40'}`} />
                                <span>{dept.name}</span>
                                <ChevronDown 
                                    className={`w-3.5 h-3.5 text-white/60 transition-transform duration-250 ${
                                        isOpen ? 'rotate-180 text-[#E5B54A]' : ''
                                    }`} 
                                />
                            </button>
                        );
                    })}
                </nav>

                {/* End Side: Logistics & Wholesale Quick Info */}
                <div className="flex items-center gap-4 text-xs font-semibold text-white/75" dir={isArabic ? 'rtl' : 'ltr'}>
                    <Link
                        href="/shipping-returns"
                        className="inline-flex items-center gap-1.5 hover:text-[#E5B54A] transition-colors py-1 group"
                    >
                        <Truck className="w-3.5 h-3.5 text-[#E5B54A] group-hover:scale-110 transition-transform" />
                        <span>{isArabic ? 'خدمات التوزيع والشحن' : 'Wholesale Distribution'}</span>
                    </Link>

                    <span className="text-white/20">|</span>

                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                            isArabic ? 'مرحباً شركة حوا، أرغب بالاستفسار عن طلبيات وتوزيع الجملة.' : 'Hello, I want to inquire about wholesale distribution.'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors py-1 font-bold"
                    >
                        <FaWhatsapp className="text-sm" />
                        <span>{isArabic ? 'طلب مباشر عبر واتساب' : 'Direct WhatsApp Sales'}</span>
                    </a>
                </div>
            </div>

            {/* Backdrop Overlay with smooth fade */}
            <div 
                className={`fixed inset-0 top-[114px] bg-black/45 backdrop-blur-xs z-30 transition-opacity duration-250 ease-out ${
                    activeSlug 
                        ? 'opacity-100 visible pointer-events-auto' 
                        : 'opacity-0 invisible pointer-events-none'
                }`}
                onClick={closeMenu}
                aria-hidden="true"
            />

            {/* Minimalist Mega Menu Flyout Panel */}
            <div 
                className={`absolute top-full inset-x-0 bg-[#071322]/98 backdrop-blur-2xl border-b border-[#8A6305]/35 shadow-2xl z-40 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeSlug
                        ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                        : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                }`}
                onMouseEnter={clearTimeouts}
                onMouseLeave={handleMouseLeave}
            >
                <div className="container-custom py-6">
                    {/* CASE A: Specific Department Categories */}
                    {activeDepartment && (
                        <div className="flex flex-col">
                            {/* Department Header Bar */}
                            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/10">
                                <div className="flex items-center gap-2.5">
                                    <FolderTree className="w-4 h-4 text-[#E5B54A]" />
                                    <h3 className="text-base font-extrabold text-white tracking-tight">
                                        {isArabic ? `أقسام وتصنيفات ${activeDepartment.name}` : `${activeDepartment.name} Categories`}
                                    </h3>
                                    {uniqueCategories.length > 0 && (
                                        <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-white/5">
                                            {uniqueCategories.length} {isArabic ? 'تصنيف' : 'categories'}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    href={`/department/${activeDepartment.slug}`}
                                    onClick={closeMenu}
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#E5B54A] hover:text-[#f5d482] transition-colors group"
                                >
                                    <span>
                                        {isArabic ? `عرض جميع منتجات ${activeDepartment.name}` : `View all in ${activeDepartment.name}`}
                                    </span>
                                    {isArabic ? (
                                        <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    )}
                                </Link>
                            </div>

                            {/* Clean Categories Grid (No nested cards/boxes) */}
                            {uniqueCategories.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-2">
                                    {uniqueCategories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/categories/${encodeURIComponent(cat.slug)}`}
                                            onClick={closeMenu}
                                            className="group/item flex items-center gap-2 py-2 px-3 rounded-lg text-[13.5px] font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#8A6305]/60 group-hover/item:bg-[#E5B54A] group-hover/item:scale-125 transition-all shrink-0" />
                                            <span className="truncate group-hover/item:text-[#E5B54A] transition-colors">
                                                {cat.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <p className="text-sm text-slate-400">
                                        {isArabic ? `تصفح منتجات قسم ${activeDepartment.name} مباشرة:` : `Browse products in ${activeDepartment.name} directly:`}
                                    </p>
                                    <Link
                                        href={`/department/${activeDepartment.slug}`}
                                        onClick={closeMenu}
                                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8A6305] hover:bg-[#735204] text-white text-xs font-bold transition-all shadow-sm"
                                    >
                                        <span>{isArabic ? `عرض منتجات ${activeDepartment.name}` : `View ${activeDepartment.name} Products`}</span>
                                        {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CASE B: All Departments Overview */}
                    {renderedSlug === 'all' && (
                        <div className="flex flex-col">
                            {/* Directory Header */}
                            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/10">
                                <div className="flex items-center gap-2.5">
                                    <LayoutGrid className="w-4 h-4 text-[#E5B54A]" />
                                    <h3 className="text-base font-extrabold text-white tracking-tight">
                                        {isArabic ? 'دليل الأقسام والتصنيفات' : 'Departments & Categories Directory'}
                                    </h3>
                                </div>

                                <Link
                                    href="/categories"
                                    onClick={closeMenu}
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#E5B54A] hover:text-[#f5d482] transition-colors group"
                                >
                                    <span>{isArabic ? 'عرض صفحة الأقسام الكاملة' : 'View Full Categories Page'}</span>
                                    {isArabic ? (
                                        <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    )}
                                </Link>
                            </div>

                            {/* Clean Side-by-Side Department Columns (No nested boxes) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {navData.map((dept) => {
                                    const seen = new Set<string>();
                                    const deptCats = (dept.categories || []).filter((c) => {
                                        if (!c.name || c.name.trim() === '0') return false;
                                        const norm = c.name.trim().toLowerCase();
                                        if (seen.has(norm)) return false;
                                        seen.add(norm);
                                        return true;
                                    });

                                    return (
                                        <div key={dept.id} className="flex flex-col">
                                            {/* Department Header */}
                                            <Link
                                                href={`/department/${dept.slug}`}
                                                onClick={closeMenu}
                                                className="group flex items-center justify-between pb-2 mb-2 border-b border-white/10 hover:border-[#8A6305]/50 transition-colors"
                                            >
                                                <span className="text-sm font-black text-white group-hover:text-[#E5B54A] transition-colors">
                                                    {dept.name}
                                                </span>
                                                {isArabic ? (
                                                    <ChevronLeft className="w-3.5 h-3.5 text-white/40 group-hover:text-[#E5B54A] group-hover:-translate-x-0.5 transition-all" />
                                                ) : (
                                                    <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#E5B54A] group-hover:translate-x-0.5 transition-all" />
                                                )}
                                            </Link>

                                            {/* Subcategories list */}
                                            {deptCats.length > 0 ? (
                                                <ul className="flex flex-col gap-1">
                                                    {deptCats.slice(0, 8).map((cat) => (
                                                        <li key={cat.id}>
                                                            <Link
                                                                href={`/categories/${encodeURIComponent(cat.slug)}`}
                                                                onClick={closeMenu}
                                                                className="text-[13px] font-medium text-slate-300 hover:text-[#E5B54A] transition-colors block py-1 px-1.5 rounded hover:bg-white/5"
                                                            >
                                                                {cat.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-slate-400 py-1.5">
                                                    {isArabic ? 'منتجات مباشرة ضمن هذا القسم' : 'Direct products under this department'}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
