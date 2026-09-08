"use client";

import { useState, useRef, useEffect, useId, useMemo } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export interface ComboboxOption {
    value: string;
    label: string;
    subLabel?: string;
}

interface SearchableComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    required?: boolean;
    isArabic?: boolean;
    pageSize?: number;
    className?: string;
    id?: string;
    name?: string;
}

function normalizeArabic(text: string): string {
    return text
        .replace(/[\u064B-\u065F]/g, '') // remove tashkeel/diacritics
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .toLowerCase();
}

export default function SearchableCombobox({
    options,
    value,
    onChange,
    placeholder = "-- Select --",
    searchPlaceholder,
    disabled = false,
    required = false,
    isArabic = false,
    pageSize = 50,
    className = "",
    id,
    name,
}: SearchableComboboxProps) {
    const generatedId = useId();
    const comboboxId = id || `combobox-${generatedId}`;
    const listboxId = `listbox-${comboboxId}`;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [visibleCount, setVisibleCount] = useState(pageSize);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Selected option lookup
    const selectedOption = useMemo(
        () => options.find((opt) => opt.value === value) || null,
        [options, value]
    );

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const normalizedSearch = normalizeArabic(searchTerm.trim());
        return options.filter((opt) => {
            const normalizedLabel = normalizeArabic(opt.label);
            const normalizedSub = opt.subLabel ? normalizeArabic(opt.subLabel) : "";
            return normalizedLabel.includes(normalizedSearch) || normalizedSub.includes(normalizedSearch);
        });
    }, [options, searchTerm]);

    // Paginated slice of filtered options
    const displayedOptions = useMemo(
        () => filteredOptions.slice(0, visibleCount),
        [filteredOptions, visibleCount]
    );

    // Reset pagination and active index when search term changes or dropdown opens
    useEffect(() => {
        setVisibleCount(pageSize);
        setActiveIndex(-1);
    }, [searchTerm, isOpen, pageSize]);

    // Auto-focus search input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Handle clicks outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Scroll active item into view
    useEffect(() => {
        if (isOpen && activeIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[activeIndex] as HTMLElement | undefined;
            if (activeItem) {
                activeItem.scrollIntoView({ block: "nearest" });
            }
        }
    }, [activeIndex, isOpen]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm("");
        triggerRef.current?.focus();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        triggerRef.current?.focus();
    };

    const handleKeyDownTrigger = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const handleKeyDownSearch = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < displayedOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayedOptions.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && displayedOptions[activeIndex]) {
                handleSelect(displayedOptions[activeIndex].value);
            } else if (displayedOptions.length > 0) {
                handleSelect(displayedOptions[0].value);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
            setSearchTerm("");
            triggerRef.current?.focus();
        } else if (e.key === "Tab") {
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    const defaultSearchPlaceholder = isArabic ? "ابحث هنا..." : "Type to filter...";

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Hidden native input for form validation */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={value}
                    required={required}
                />
            )}

            {/* Combobox Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                id={comboboxId}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                aria-required={required}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                onKeyDown={handleKeyDownTrigger}
                className={`w-full min-h-[44px] h-12 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 flex items-center justify-between text-sm font-medium dark:text-white outline-none cursor-pointer text-start ${
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-black/20 dark:hover:border-white/20"
                }`}
            >
                <span className={`truncate ${!selectedOption ? "text-slate-400 dark:text-zinc-500 font-normal" : "text-slate-900 dark:text-zinc-100"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <div className="flex items-center gap-1.5 shrink-0 ms-2">
                    {selectedOption && !required && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleClear(e as unknown as React.MouseEvent);
                                }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title={isArabic ? "مسح الاختيار" : "Clear selection"}
                            aria-label={isArabic ? "مسح الاختيار" : "Clear selection"}
                        >
                            <X className="size-3.5" />
                        </span>
                    )}
                    <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
                    style={{ minWidth: "220px" }}
                >
                    {/* Search Field */}
                    <div className="p-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                        <div className="relative">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDownSearch}
                                placeholder={searchPlaceholder || defaultSearchPlaceholder}
                                className="w-full h-10 ps-9 pe-3 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                aria-autocomplete="list"
                                aria-controls={listboxId}
                                aria-activedescendant={
                                    activeIndex >= 0 && displayedOptions[activeIndex]
                                        ? `${comboboxId}-opt-${displayedOptions[activeIndex].value}`
                                        : undefined
                                }
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                                    aria-label="Clear search"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <ul
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-zinc-800/60"
                    >
                        {displayedOptions.length === 0 ? (
                            <li className="py-6 px-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                                {isArabic ? "لا توجد نتائج مطابقة" : "No matching results"}
                            </li>
                        ) : (
                            displayedOptions.map((opt, idx) => {
                                const isSelected = opt.value === value;
                                const isActive = idx === activeIndex;

                                return (
                                    <li
                                        key={opt.value}
                                        id={`${comboboxId}-opt-${opt.value}`}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(opt.value)}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        className={`min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-xs sm:text-sm cursor-pointer transition-colors ${
                                            isActive
                                                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
                                                : isSelected
                                                ? "bg-slate-50 dark:bg-zinc-800/70 text-slate-900 dark:text-zinc-100 font-semibold"
                                                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                        }`}
                                    >
                                        <div className="flex flex-col min-w-0 pe-2">
                                            <span className="truncate">{opt.label}</span>
                                            {opt.subLabel && (
                                                <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                                    {opt.subLabel}
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check className="size-4 text-[#8A6305] shrink-0" />
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {/* Pagination / "Load more" indicator if results exceed visibleCount */}
                    {filteredOptions.length > visibleCount && (
                        <div className="p-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                            <span>
                                {isArabic
                                    ? `عرض ${visibleCount} من ${filteredOptions.length}`
                                    : `Showing ${visibleCount} of ${filteredOptions.length}`}
                            </span>
                            <button
                                type="button"
                                onClick={() => setVisibleCount((prev) => prev + pageSize)}
                                className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 font-semibold cursor-pointer text-xs"
                            >
                                {isArabic ? "تحميل المزيد" : "Load more"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
