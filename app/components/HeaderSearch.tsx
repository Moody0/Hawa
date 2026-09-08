"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import ResilientImage from './ResilientImage';
import { getPrimaryImage } from '@/lib/image-utils';
import {
    getCategorySuggestionUrl,
    getProductSuggestionUrl,
    getSearchSubmitUrl,
} from '@/lib/suggestion-routing';
import { ArrowRight, Search } from 'lucide-react';

interface HeaderSearchProps {
    onSearchSelect?: () => void;
    onClose?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    locale?: 'en' | 'ar';
}

const foodSuggestionsAr = ['منتجات زوان', 'سمن وزيوت الريف', 'حليبنا بودرة وقهوة', 'تونة صن بل', 'تونة سيلفر فيش', 'شاي وسردين المغربي', 'منظفات بوفالو', 'صابون روكافيرا'];
const foodSuggestionsEn = ['Zwan Products', 'Al-Reef Ghee & Oils', 'Haleebna Milk & Coffee', 'Sunbell Tuna', 'Silver Fish Tuna', 'Al-Maghrabi Sardines & Tea', 'Buffalo Detergents', 'Rocavera Soap'];

const quickCategoriesAr = [
    { id: '1', name: 'معلبات ولحوم زوان', slug: 'canned-goods' },
    { id: '2', name: 'سمن وزيوت الريف', slug: 'ghee-and-oils' },
    { id: '3', name: 'تونة وأسماك معلبة', slug: 'tuna-and-seafood' },
    { id: '4', name: 'منظفات وعناية منزلية', slug: 'detergents-cleaning' }
];

const quickCategoriesEn = [
    { id: '1', name: 'Zwan Canned Meats', slug: 'canned-goods' },
    { id: '2', name: 'Al-Reef Ghee & Oils', slug: 'ghee-and-oils' },
    { id: '3', name: 'Tuna & Canned Seafood', slug: 'tuna-and-seafood' },
    { id: '4', name: 'Detergents & Cleaning', slug: 'detergents-cleaning' }
];

const dynamicItemsAr = [
    "منتجات زوان ولحوم معلبة...",
    "سمن وزيوت الريف...",
    "حليبنا بودرة وزبدة بقرية...",
    "تونة صن بل وسيلفر فيش...",
    "سردين وشاي المغربي...",
    "منظفات بوفالو وصابون روكافيرا..."
];

const dynamicItemsEn = [
    "Zwan Canned Meats & Luncheon...",
    "Al-Reef Ghee & Vegetable Oils...",
    "Haleebna Milk Powder & Coffee...",
    "Sunbell & Silver Fish Tuna...",
    "Al-Maghrabi Sardines & Tea...",
    "Buffalo & Rocavera Cleaning..."
];

const HeaderSearch = ({ onSearchSelect, onClose, placeholder, autoFocus = false, locale }: HeaderSearchProps) => {
    const router = useRouter();
    const { t, dir, language } = useLanguage();
    const { formatPrice } = useCurrency();
    const { customer } = useCustomer();
    const isLockedForGuest = !customer;
    const currentLocale = locale ?? language;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [dynamicText, setDynamicText] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const searchRequestIdRef = useRef(0);

    const isArabic = currentLocale === 'ar';
    const staticPrefix = isArabic ? "ابحث عن: " : "Search: ";
    const searchPlaceholder = placeholder || `${staticPrefix}${dynamicText}`;

    // Typewriter animation only for dynamic suffix text (prefix stays static)
    useEffect(() => {
        if (query) return;
        const items = isArabic ? dynamicItemsAr : dynamicItemsEn;
        let itemIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeoutId: NodeJS.Timeout;

        const tick = () => {
            const currentItem = items[itemIndex];
            
            if (isDeleting) {
                setDynamicText(currentItem.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setDynamicText(currentItem.substring(0, charIndex + 1));
                charIndex++;
            }

            let delta = isDeleting ? 45 : 90;

            if (!isDeleting && charIndex === currentItem.length) {
                delta = 2500; // Pause when item is fully typed
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                itemIndex = (itemIndex + 1) % items.length;
                delta = 450; // Pause before typing next item
            }

            timeoutId = setTimeout(tick, delta);
        };

        // Delay starting typewriter until initial rendering and CPU are idle
        timeoutId = setTimeout(tick, 2500);

        return () => clearTimeout(timeoutId);
    }, [isArabic, query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search with minimum query length and abort controller
    useEffect(() => {
        const trimmed = query.trim();

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (trimmed.length < 2) {
            setResults([]);
            setSuggestions([]);
            setCategories([]);
            setShowResults(false);
            setTotalCount(0);
            setLoading(false);
            setActiveIndex(-1);
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const currentReqId = ++searchRequestIdRef.current;
        setLoading(true);

        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/products?search=${encodeURIComponent(trimmed)}&limit=3&lang=${currentLocale}`,
                    { signal: controller.signal }
                );
                if (res.ok && currentReqId === searchRequestIdRef.current) {
                    const data = await res.json();
                    if (currentReqId !== searchRequestIdRef.current) return;
                    setResults(data.products || []);
                    setTotalCount(data.total || data.products?.length || 0);
                    setShowResults(true);
                    setActiveIndex(-1);

                    setSuggestions(isArabic ? foodSuggestionsAr.slice(0, 4) : foodSuggestionsEn.slice(0, 4));
                    setCategories(isArabic ? quickCategoriesAr : quickCategoriesEn);
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') return;
                console.error("Search failed", error);
            } finally {
                if (!controller.signal.aborted && currentReqId === searchRequestIdRef.current) {
                    setLoading(false);
                }
            }
        }, 250);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query, currentLocale, isArabic]);

    const totalSelectable = suggestions.length + categories.length + results.length;

    const handleClose = () => {
        setShowResults(false);
        setActiveIndex(-1);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (onSearchSelect) onSearchSelect();
        if (onClose) onClose();
    };

    const handleProductClick = () => {
        handleClose();
        setQuery("");
    };

    const handleReset = () => {
        setQuery("");
        setResults([]);
        setSuggestions([]);
        setCategories([]);
        setShowResults(false);
        setTotalCount(0);
        setActiveIndex(-1);
        inputRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanQuery = query.trim();
        if (cleanQuery) {
            handleClose();
            router.push(getSearchSubmitUrl(cleanQuery));
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        handleClose();
        router.push(getSearchSubmitUrl(suggestion));
    };

    const handleViewAll = () => {
        const cleanQuery = query.trim();
        if (cleanQuery) {
            handleClose();
            router.push(getSearchSubmitUrl(cleanQuery));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showResults || totalSelectable === 0) {
            if (e.key === 'Escape') {
                setShowResults(false);
                setActiveIndex(-1);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % totalSelectable);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev <= 0 ? totalSelectable - 1 : prev - 1));
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowResults(false);
            setActiveIndex(-1);
            inputRef.current?.focus();
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0) {
                e.preventDefault();
                if (activeIndex < suggestions.length) {
                    const suggestion = suggestions[activeIndex];
                    handleSuggestionClick(suggestion);
                } else if (activeIndex < suggestions.length + categories.length) {
                    const cat = categories[activeIndex - suggestions.length];
                    handleClose();
                    router.push(getCategorySuggestionUrl(cat.slug));
                } else {
                    const prod = results[activeIndex - suggestions.length - categories.length];
                    handleClose();
                    router.push(getProductSuggestionUrl(prod.slug));
                }
            }
        }
    };

    return (
        <div className="header-search-wrapper w-full relative" ref={searchRef}>
            {/* Screen Reader Announcement Live Region */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {loading
                    ? (isArabic ? "جاري البحث..." : "Searching...")
                    : showResults
                    ? totalCount > 0
                        ? (isArabic ? `تم العثور على ${totalCount} نتيجة` : `${totalCount} results found`)
                        : (isArabic ? "لم يتم العثور على نتائج" : "No results found")
                    : ""}
            </div>

            {/* Search Form */}
            <form
                action="/products"
                method="get"
                role="search"
                onSubmit={handleSubmit}
                className="w-full"
            >
                <input type="hidden" name="options[prefix]" value="last" />
                <div className="search__field relative flex items-center w-full">
                    {/* Search Input */}
                    <input
                        ref={inputRef}
                        id="HeaderSearchInput"
                        autoFocus={autoFocus}
                        aria-label={isArabic ? "ابحث عن منتجات أو وكالات" : "Search products or brands"}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (query.trim().length >= 2) setShowResults(true);
                        }}
                        className="w-full bg-[#EDEDED] dark:bg-white/5 border border-transparent rounded-full text-[15px] font-medium text-[#1a1a1a] dark:text-white placeholder-[#888] dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#8A6305] focus:ring-0 focus:placeholder-gray-400 transition-all h-12 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
                        style={{
                            padding: isArabic ? '0 16px 0 80px' : '0 80px 0 16px',
                            direction: dir,
                        }}
                        placeholder={searchPlaceholder}
                        type="search"
                        name="q"
                        role="combobox"
                        aria-expanded={showResults ? "true" : "false"}
                        aria-autocomplete="list"
                        aria-controls="header-search-results"
                        aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
                        autoComplete="off"
                        spellCheck="false"
                    />

                    {/* Clear Button */}
                    {query && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="absolute flex items-center justify-center text-xs font-bold text-[#555] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors"
                            style={{
                                [isArabic ? 'left' : 'right']: '48px',
                            }}
                            aria-label={isArabic ? "مسح" : "Clear"}
                        >
                            {isArabic ? "مسح" : "Clear"}
                        </button>
                    )}

                    {/* Search Icon */}
                    <button 
                        type="submit"
                        className="absolute flex items-center justify-center text-[22px] text-[#555] dark:text-gray-300 hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors min-w-[36px] min-h-[36px]"
                        style={{
                            [isArabic ? 'left' : 'right']: '12px',
                        }}
                        aria-label={isArabic ? "بحث" : "Search"}
                    >
                        <Search />
                    </button>
                </div>
            </form>

            {/* ========== Predictive Search Results Dropdown ========== */}
            {showResults && (
                <div
                    id="header-search-results"
                    role="listbox"
                    aria-label={isArabic ? "نتائج البحث المقترحة" : "Search suggestions"}
                    className="absolute top-full mt-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-y-auto max-h-[70vh] md:max-h-[unset] md:overflow-visible"
                    style={{
                        width: '100%',
                        direction: dir,
                    }}
                >
                    {loading && results.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg aria-hidden="true" className="animate-spin h-6 w-6 mx-auto text-zinc-900 dark:text-white" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-25" fill="none" strokeWidth="5" cx="33" cy="33" r="30" stroke="currentColor" />
                                <circle fill="none" strokeWidth="5" cx="33" cy="33" r="30" stroke="currentColor" strokeDasharray="50, 138" strokeLinecap="round" />
                            </svg>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row p-6 gap-6 md:gap-0">
                            
                            {/* Suggestions & Categories Section */}
                            <div className="w-full md:w-[260px] shrink-0 md:border-e border-gray-100 dark:border-white/5 md:pe-6 pb-6 md:pb-0 mb-6 md:mb-0 border-b md:border-b-0">
                                
                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[11px] font-bold text-[#888] dark:text-gray-400 uppercase tracking-wide">
                                                {isArabic ? "مرشحات مجربة" : "Suggestions"}
                                            </span>
                                            <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                                        </div>
                                        <ul className="space-y-1">
                                            {suggestions.map((suggestion, i) => {
                                                const isSelected = activeIndex === i;
                                                return (
                                                    <li
                                                        key={i}
                                                        id={`search-item-${i}`}
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className={`text-[13px] rounded-lg px-2 py-1 transition-colors cursor-pointer ${
                                                            isSelected
                                                                ? "bg-[#8A6305]/15 text-[#8A6305] font-bold dark:text-amber-400"
                                                                : "text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white"
                                                        }`}
                                                        style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Categories */}
                                {categories.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[11px] font-bold text-[#888] dark:text-gray-400 uppercase tracking-wide">
                                                {isArabic ? "اهتمامات" : "Categories"}
                                            </span>
                                            <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                                        </div>
                                        <ul className="space-y-1 mb-3">
                                            {categories.map((cat, idx) => {
                                                const itemIndex = suggestions.length + idx;
                                                const isSelected = activeIndex === itemIndex;
                                                return (
                                                    <li key={cat.id}>
                                                        <Link
                                                            id={`search-item-${itemIndex}`}
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            href={getCategorySuggestionUrl(cat.slug)}
                                                            onClick={handleProductClick}
                                                            className={`text-[13px] rounded-lg px-2 py-1 transition-colors block ${
                                                                isSelected
                                                                    ? "bg-[#8A6305]/15 text-[#8A6305] font-bold dark:text-amber-400"
                                                                    : "text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white"
                                                            }`}
                                                            style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                                        >
                                                            {cat.name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        
                                        <button
                                            type="button"
                                            onClick={handleViewAll}
                                            className="flex items-center justify-end md:justify-start gap-2 text-[13px] font-bold text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors mt-2 w-full cursor-pointer"
                                        >
                                            <span>{isArabic ? "عرض المزيد" : "View More"}</span>
                                            <ArrowRight className={`text-base ${isArabic ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Products Section */}
                            <div className="flex-1 md:ps-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-[11px] font-bold text-[#888] dark:text-gray-400 uppercase tracking-wide">
                                        {isArabic ? "منتجات" : "Products"}
                                    </span>
                                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-8">
                                    {results.map((product, idx) => {
                                        const itemIndex = suggestions.length + categories.length + idx;
                                        const isSelected = activeIndex === itemIndex;
                                        return (
                                            <Link
                                                key={product.id}
                                                id={`search-item-${itemIndex}`}
                                                role="option"
                                                aria-selected={isSelected}
                                                href={getProductSuggestionUrl(product.slug)}
                                                onClick={handleProductClick}
                                                className={`flex flex-col items-center group text-center p-2 rounded-xl transition-all ${
                                                    isSelected ? "ring-2 ring-[#8A6305] bg-[#FAF6EC] dark:bg-zinc-800" : ""
                                                }`}
                                            >
                                                <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                                                    <ResilientImage
                                                        src={getPrimaryImage(product.images)}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                                
                                                <span className="text-[10px] text-[#888] dark:text-gray-400 uppercase tracking-[0.1em] mb-1.5 font-medium line-clamp-1">
                                                    {product.brand?.name || 'HAWA'}
                                                </span>
                                                
                                                <h4 dir="ltr" className="text-[13px] font-medium text-[#333] dark:text-gray-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-tight mb-1.5 line-clamp-2 px-2 font-sans tracking-normal">
                                                    {product.name}
                                                </h4>
                                                
                                                <div className="text-[12px] font-extrabold text-zinc-900 dark:text-white" dir="ltr">
                                                    {isLockedForGuest ? (
                                                        <span className="text-[11px] font-bold text-[#8A6305]">
                                                            🔒 {isArabic ? 'أسعار الجملة للتجار' : 'Wholesale (Login)'}
                                                        </span>
                                                    ) : (
                                                        formatPrice(Number(product.discountPrice || product.price))
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {totalCount > 0 && (
                                    <div className="mt-8 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={handleViewAll}
                                            className="flex items-center gap-2 text-sm font-bold text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span>
                                                {isArabic
                                                    ? `عرض كل ${totalCount} العناصر`
                                                    : `View all ${totalCount} items`}
                                            </span>
                                            <ArrowRight className={`text-lg ${isArabic ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HeaderSearch;
