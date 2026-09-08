"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollButtonsProps {
    scrollRef: React.RefObject<HTMLDivElement | null>;
    dir: 'ltr' | 'rtl';
}

const ScrollButtons = ({ scrollRef, dir }: ScrollButtonsProps) => {
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.8
                : scrollLeft + clientWidth * 0.8;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="hidden md:flex items-center gap-2">
            <button
                onClick={() => scroll('left')}
                className="size-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
            >
                <ChevronLeft className={`${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
            <button
                onClick={() => scroll('right')}
                className="size-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
            >
                <ChevronRight className={`${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
};

export default ScrollButtons;
