'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    isActive?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    const { dir, language } = useLanguage();
    const isRtl = dir === 'rtl' || language === 'ar';
    const SeparatorIcon = isRtl ? ChevronLeft : ChevronRight;

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-5 sm:mb-6 ${className}`}
        >
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-[#8A6305] dark:hover:text-[#C28E2B] transition-colors py-1 cursor-pointer select-none"
            >
                <Home className="w-3.5 h-3.5" />
                <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <React.Fragment key={index}>
                        <SeparatorIcon className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 shrink-0 select-none" aria-hidden="true" />
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-slate-600 dark:text-slate-300 hover:text-[#8A6305] dark:hover:text-[#C28E2B] transition-colors py-1 cursor-pointer truncate max-w-[160px] sm:max-w-none"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className="font-bold text-[#0B192C] dark:text-white truncate max-w-[200px] sm:max-w-none"
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
