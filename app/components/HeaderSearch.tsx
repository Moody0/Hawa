"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useCustomer } from '@/app/context/CustomerContext';
import ResilientImage from './ResilientImage';
import { getPrimaryImage } from '@/lib/image-utils';
import { MdArrowForward, MdSearch } from 'react-icons/md';

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
    const [dynamicText, setDynamicText] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length > 0) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=3&lang=${currentLocale}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data.products || []);
                        setTotalCount(data.total || data.products?.length || 0);
                        setShowResults(true);

                        setSuggestions(isArabic ? foodSuggestionsAr.slice(0, 4) : foodSuggestionsEn.slice(0, 4));
                        setCategories(isArabic ? quickCategoriesAr : quickCategoriesEn);
                    }
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setSuggestions([]);
                setCategories([]);
                setShowResults(false);
                setTotalCount(0);
            }
        }, 250);
        return () => clearTimeout(timeoutId);
    }, [query, currentLocale, isArabic]);

    const handleProductClick = () => {
        setShowResults(false);
        setQuery("");
        if (onSearchSelect) onSearchSelect();
        if (onClose) onClose();
    };

    const handleReset = () => {
        setQuery("");
        setResults([]);
        setSuggestions([]);
        setCategories([]);
        setShowResults(false);
        setTotalCount(0);
        inputRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
    };

    const handleViewAll = () => {
        if (query.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
        }
    };

    return (
        <div className="header-search-wrapper w-full relative" ref={searchRef}>
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
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (query.trim().length > 0) setShowResults(true);
                        }}
                        className="w-full bg-[#EDEDED] dark:bg-white/5 border border-transparent rounded-full text-[15px] font-medium text-[#1a1a1a] dark:text-white placeholder-[#888] dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/15 focus:placeholder-gray-400 transition-all h-12 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
                        style={{
                            padding: isArabic ? '0 16px 0 80px' : '0 80px 0 16px',
                            direction: dir,
                        }}
                        placeholder={searchPlaceholder}
                        type="search"
                        name="q"
                        role="combobox"
                        aria-expanded={showResults ? "true" : "false"}
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
                        <MdSearch />
                    </button>
                </div>
            </form>

            {/* ========== Predictive Search Results Dropdown ========== */}
            {showResults && (
                <div
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
                                        <ul className="space-y-2.5">
                                            {suggestions.map((suggestion, i) => (
                                                <li
                                                    key={i}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="text-[13px] text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                                                    style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
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
                                        <ul className="space-y-2.5 mb-3">
                                            {categories.map((cat) => (
                                                <li key={cat.id}>
                                                    <Link
                                                        href={`/products?brand=${cat.slug}`}
                                                        onClick={handleProductClick}
                                                        className="text-[13px] text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors block"
                                                        style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <button
                                            onClick={handleViewAll}
                                            className="flex items-center justify-end md:justify-start gap-2 text-[13px] font-bold text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors mt-2 w-full"
                                        >
                                            <span>{isArabic ? "عرض المزيد" : "View More"}</span>
                                            <MdArrowForward className={`text-base ${isArabic ? 'rotate-180' : ''}`} />
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
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            onClick={handleProductClick}
                                            className="flex flex-col items-center group text-center"
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
                                    ))}
                                </div>

                                {totalCount > 0 && (
                                    <div className="mt-8 flex justify-center">
                                        <button
                                            onClick={handleViewAll}
                                            className="flex items-center gap-2 text-sm font-bold text-[#444] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            <span>
                                                {isArabic
                                                    ? `عرض كل ${totalCount} العناصر`
                                                    : `View all ${totalCount} items`}
                                            </span>
                                            <MdArrowForward className={`text-lg ${isArabic ? 'rotate-180' : ''}`} />
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
