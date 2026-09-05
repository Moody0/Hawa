"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdExpandMore, MdCheck } from "react-icons/md";
import { useLanguage } from "@/app/context/LanguageContext";

export interface SortOption {
    id: string;
    label: string;
}

interface CustomSortDropdownProps {
    sort: string;
    setSort: (val: string) => void;
    options: SortOption[];
}

const CustomSortDropdown: React.FC<CustomSortDropdownProps> = ({ sort, setSort, options }) => {
    const { t, dir } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === sort) || options[0];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 dark:bg-zinc-800 hover:border-[#8A6305] text-[#0B192C] dark:text-white rounded-full text-xs font-bold border border-gray-200 dark:border-white/10 transition-all active:scale-95"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="hidden sm:inline-block text-gray-400 font-normal">{t("products.sortBy")}:</span>
                <span className="truncate max-w-[130px] sm:max-w-none">{selectedOption.label}</span>
                <MdExpandMore
                    className={`text-base text-gray-500 dark:text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#8A6305]" : ""
                    }`}
                />
            </button>

            {/* Custom Dropdown Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute top-full mt-2 z-40 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-2xl p-1.5 shadow-xl ${
                            dir === "rtl" ? "left-0" : "right-0"
                        }`}
                        role="listbox"
                    >
                        <div className="flex flex-col gap-0.5">
                            {options.map((option) => {
                                const isSelected = option.id === sort;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            setSort(option.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? "bg-[#8A6305] text-white font-extrabold"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-[#8A6305]/10 hover:text-[#8A6305] font-medium"
                                        }`}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {isSelected && (
                                            <MdCheck className="text-base shrink-0 ms-2" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSortDropdown;
