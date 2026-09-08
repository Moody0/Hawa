'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import ResilientImage from './ResilientImage';
import { Search, X, TrendingUp, Building2, ArrowRight, ArrowLeft, Loader2, Lock } from 'lucide-react';

interface MobileSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProductResult {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    images?: string | null;
    price: number | string;
    discountPrice?: number | string | null;
    packaging?: string | null;
    itemsPerPackage?: number | null;
    options?: string | null;
    brand?: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

const POPULAR_SEARCHES_AR = [
    'زوان لانشون',
    'سمن وزيوت الريف',
    'حليبنا بودرة',
    'تونة سيلفر فيش',
    'صابون روكافيرا',
    'منظفات بوفالو',
    'سردين المغربي',
    'تونة صن بل',
    'مفرزات غذائية',
    'زيوت نباتية',
];

const POPULAR_SEARCHES_EN = [
    'Zwan Luncheon',
    'Al-Reef Ghee & Oils',
    'Haleebna Milk Powder',
    'Silver Fish Tuna',
    'Rocavera Soap',
    'Buffalo Detergents',
    'Al-Maghrabi Sardines',
    'Sunbell Tuna',
    'Frozen Foods',
    'Vegetable Cooking Oils',
];

const FEATURED_AGENCIES = [
    { nameAr: 'زوان', nameEn: 'Zwan', slug: 'zwan' },
    { nameAr: 'الريف', nameEn: 'Alreef', slug: 'alreef' },
    { nameAr: 'حليبنا', nameEn: 'Haleebna', slug: 'haleebna' },
    { nameAr: 'بوفالو', nameEn: 'Buffalo', slug: 'buffalo' },
    { nameAr: 'روكافيرا', nameEn: 'Rokavera', slug: 'rocavera' },
    { nameAr: 'سيلفر فيش', nameEn: 'Silver Fish', slug: 'silver-fish' },
];

const MobileSearchModal = ({ isOpen, onClose }: MobileSearchModalProps) => {
    const router = useRouter();
    const { language, dir } = useLanguage();
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isArabic = language === 'ar' || dir === 'rtl';
    const isGuest = !customer;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductResult[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isAnimating, setIsAnimating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const searchRequestIdRef = useRef<number>(0);

    const popularSearches = isArabic ? POPULAR_SEARCHES_AR : POPULAR_SEARCHES_EN;

    // Smooth open & close animation controller
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const animTimer = setTimeout(() => {
                setIsAnimating(true);
            }, 20);
            return () => clearTimeout(animTimer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 250);
    }, [onClose]);

    // Body scroll lock, escape key, auto-focus
    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.style.overflow = 'hidden';

        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 60);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
                return;
            }

            if (e.key === 'Tab' && dialogRef.current) {
                const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )).filter((element) => element.offsetParent !== null);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (!first || !last) return;
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyDown);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            returnFocusRef.current?.focus();
        };
    }, [isOpen, handleClose]);

    // Live debounced search API call
    useEffect(() => {
        if (!isOpen) return;

        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setTotalCount(0);
            setLoading(false);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const currentReqId = ++searchRequestIdRef.current;

        setLoading(true);
        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/products?search=${encodeURIComponent(trimmed)}&limit=6&lang=${language}`,
                    { signal: controller.signal }
                );
                if (res.ok && currentReqId === searchRequestIdRef.current) {
                    const data = await res.json();
                    if (currentReqId !== searchRequestIdRef.current) return;
                    setResults(data.products || []);
                    setTotalCount(data.pagination?.total || data.total || data.products?.length || 0);
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') return;
                console.error('SearchModal fetch error:', error);
            } finally {
                if (!controller.signal.aborted && currentReqId === searchRequestIdRef.current) {
                    setLoading(false);
                }
            }
        }, 200);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query, isOpen, language]);

    if (!shouldRender) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            handleClose();
            router.push(`/products?search=${encodeURIComponent(trimmed)}`);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setTotalCount(0);
        inputRef.current?.focus();
    };

    const handleSelectTag = (term: string) => {
        setQuery(term);
        inputRef.current?.focus();
    };

    const handleNavigate = (url: string) => {
        handleClose();
        router.push(url);
    };

    const getProductImage = (images?: string | null) => {
        if (!images) return '/placeholder.svg';
        const first = images.split(',')[0].trim();
        return first || '/placeholder.svg';
    };

    const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

    return (
        <div
            className={`fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex flex-col justify-start items-center p-0 sm:p-4 md:p-6 overflow-y-auto transition-opacity duration-250 ease-out ${
                isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={isArabic ? 'نافذة البحث السريع' : 'Quick Search Modal'}
            onClick={handleClose}
        >
            {/* Modal Card with Smooth Slide and Scale Animation */}
            <div
                ref={dialogRef}
                className={`w-full max-w-3xl bg-white dark:bg-[#0E1B2E] rounded-b-3xl sm:rounded-3xl border-b sm:border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden select-none flex flex-col transition-all duration-250 ease-out ${
                    isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-[0.98]'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. Header & Unified Search Bar */}
                <div className="p-4 sm:p-6 border-b border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/40">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305]" />
                            <h2 className="text-sm font-black text-[#0B192C] dark:text-white uppercase tracking-wider">
                                {isArabic ? 'البحث في كتالوج الجملة' : 'Wholesale Catalog Search'}
                            </h2>
                        </div>

                        {/* Close button with ESC indicator */}
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 shadow-2xs">
                                ESC
                            </span>
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label={isArabic ? 'إغلاق نافذة البحث' : 'Close search'}
                                className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Clean Search Input Form (No double borders) */}
                    <form onSubmit={handleSubmit} className="relative w-full">
                        <div className="relative flex items-center w-full rounded-2xl bg-white dark:bg-[#132035] border border-slate-300 dark:border-white/15 focus-within:border-[#8A6305] dark:focus-within:border-[#C28E2B] focus-within:ring-3 focus-within:ring-[#8A6305]/15 transition-all shadow-xs overflow-hidden">
                            {/* Start Search Icon */}
                            <div className="ps-4 pe-2 text-slate-400 dark:text-slate-400 flex items-center justify-center shrink-0">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 text-[#8A6305] animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                            </div>

                            {/* Text Input with Clean Placeholder */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={
                                    isArabic
                                        ? 'ابحث عن منتج، علامة تجارية، أو تصنيف...'
                                        : 'Search products, brands, or categories...'
                                }
                                className="w-full h-12 sm:h-13 bg-transparent text-sm sm:text-base font-semibold text-[#0B192C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden pe-10"
                                autoComplete="off"
                                spellCheck="false"
                            />

                            {/* End Controls: Clear Button */}
                            {query && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    aria-label={isArabic ? 'مسح النص' : 'Clear search text'}
                                    className="absolute end-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-600 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 2. Modal Body / Dynamic Viewports */}
                <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
                    {/* View 1: Empty Query - Suggestions & Exclusive Agencies */}
                    {query.trim().length === 0 && (
                        <div className="flex flex-col gap-6">
                            {/* Popular Searches */}
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#8A6305]" />
                                    <span>{isArabic ? 'عمليات البحث الشائعة' : 'Popular Searches'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {popularSearches.map((term, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectTag(term)}
                                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800/80 hover:bg-[#8A6305]/10 hover:text-[#8A6305] dark:hover:bg-[#8A6305]/20 dark:hover:text-[#E5B54A] text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-white/5 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Search className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span>{term}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Direct Agency Catalog Links */}
                            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-[#8A6305]" />
                                        <span>{isArabic ? 'الوكالات التجارية المعتمدة' : 'Authorized Commercial Agencies'}</span>
                                    </div>
                                    <Link
                                        href="/brands"
                                        onClick={handleClose}
                                        className="text-[11px] font-bold text-[#8A6305] hover:underline"
                                    >
                                        {isArabic ? 'كافة الوكالات' : 'All Agencies'}
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {FEATURED_AGENCIES.map((agency) => (
                                        <button
                                            key={agency.slug}
                                            type="button"
                                            onClick={() => handleNavigate(`/products?brand=${agency.slug}`)}
                                            className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200/80 dark:border-white/10 hover:border-[#8A6305] dark:hover:border-[#8A6305] text-start flex items-center justify-between text-xs font-bold text-[#0B192C] dark:text-white transition-all shadow-2xs group cursor-pointer"
                                        >
                                            <span>{isArabic ? agency.nameAr : agency.nameEn}</span>
                                            <ArrowIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#8A6305] transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View 2: Live Results Found */}
                    {query.trim().length > 0 && results.length > 0 && (
                        <div className="flex flex-col">
                            {/* Products count header */}
                            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <span>
                                    {isArabic
                                        ? `نتائج البحث المتوفرة (${totalCount || results.length})`
                                        : `Matching Products (${totalCount || results.length})`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleNavigate(`/products?search=${encodeURIComponent(query.trim())}`)}
                                    className="text-[11px] font-bold text-[#8A6305] hover:text-[#735204] dark:text-[#E5B54A] flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>{isArabic ? 'عرض كافة النتائج بالكتالوج' : 'View all in catalog'}</span>
                                    <ArrowIcon className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Clean Media-Tile Product List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                                {results.map((product) => {
                                    const displayName = isArabic
                                        ? product.nameAr || product.name
                                        : product.nameEn || product.name;

                                    const brandTitle = product.brand?.name || (isArabic ? 'وكالة معتمدة' : 'Official Brand');
                                    const specTag = product.packaging
                                        ? product.itemsPerPackage
                                            ? `${product.packaging} (${product.itemsPerPackage})`
                                            : product.packaging
                                        : product.options;

                                    const priceNum = Number(product.price);
                                    const discountNum = product.discountPrice ? Number(product.discountPrice) : null;
                                    const hasDiscount = discountNum !== null && discountNum < priceNum;
                                    const activePrice = hasDiscount ? discountNum : priceNum;

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleNavigate(`/products/${product.slug}`)}
                                            className="group bg-white dark:bg-[#132035] border border-slate-200/80 dark:border-white/10 hover:border-[#8A6305] dark:hover:border-[#8A6305] rounded-xl p-3 flex items-center gap-3 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.99]"
                                        >
                                            {/* Square Image Tile */}
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-50 dark:bg-zinc-800 p-1 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 overflow-hidden">
                                                <ResilientImage
                                                    src={getProductImage(product.images)}
                                                    alt={displayName}
                                                    sizes="64px"
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A6305] dark:text-[#E5B54A] mb-0.5 truncate">
                                                    <span>{brandTitle}</span>
                                                    {specTag && (
                                                        <>
                                                            <span className="text-slate-300 dark:text-zinc-600 font-normal">•</span>
                                                            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                                                                {specTag}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white line-clamp-1 group-hover:text-[#8A6305] transition-colors mb-1">
                                                    {displayName}
                                                </h4>

                                                {/* Price / B2B Lock Status */}
                                                <div className="flex items-baseline gap-2">
                                                    {isGuest ? (
                                                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                            <Lock className="w-3 h-3 text-[#8A6305]" />
                                                            <span className="blur-[3px] select-none text-[#0B192C] dark:text-white font-mono">
                                                                125,000 ل.س
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs sm:text-sm font-black text-[#8A6305] dark:text-[#E5B54A]">
                                                                {formatPrice(activePrice)}
                                                            </span>
                                                            {hasDiscount && (
                                                                <span className="text-[10px] text-slate-400 line-through">
                                                                    {formatPrice(priceNum)}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* View All Bottom CTA */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => handleNavigate(`/products?search=${encodeURIComponent(query.trim())}`)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#162740] dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
                                >
                                    <span>
                                        {isArabic
                                            ? `عرض كافة النتائج لكلمة "${query}" (${totalCount || results.length} منتج)`
                                            : `View all results for "${query}" (${totalCount || results.length} items)`}
                                    </span>
                                    <ArrowIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View 3: No Results Empty State */}
                    {query.trim().length > 0 && !loading && results.length === 0 && (
                        <div className="py-6 sm:py-8 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-[#8A6305] mb-3 shadow-2xs">
                                <Search className="w-6 h-6" />
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-[#0B192C] dark:text-white mb-1">
                                {isArabic
                                    ? `لم نتمكن من العثور على منتجات مطابقة لـ "${query}"`
                                    : `No products matching "${query}"`}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
                                {isArabic
                                    ? 'جرب البحث باسم تجاري عام، أو اختر إحدى عمليات البحث الشائعة أدناه.'
                                    : 'Try searching with a brand name or choose from popular suggestions below.'}
                            </p>

                            {/* Suggestion Chips */}
                            <div className="flex flex-wrap justify-center gap-2 max-w-md">
                                {popularSearches.slice(0, 6).map((term, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectTag(term)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-[#8A6305]/10 hover:text-[#8A6305] border border-slate-200/60 dark:border-white/5 transition-all cursor-pointer"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileSearchModal;
