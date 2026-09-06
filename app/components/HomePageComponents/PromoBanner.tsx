import React from 'react';
import Link from 'next/link';

interface PromoBannerProps {
    settings?: {
        middleBanner1Image?: string | null;
        middleBanner1Link?: string | null;
    };
    dir?: 'rtl' | 'ltr';
    language?: 'en' | 'ar';
}

const PromoBanner = ({ settings, dir = 'rtl' }: PromoBannerProps) => {
    const isArabic = dir === 'rtl';
    const bannerLink = settings?.middleBanner1Link || '/products';

    return (
        <section className="container-custom">
            <div className="relative w-full rounded-2xl overflow-hidden py-5 md:py-0 md:h-[140px] flex items-center px-5 sm:px-8 md:px-12 bg-[#FAF6EC] dark:bg-[#1A1A14] border border-[#8A6305]/30 shadow-xs">
                {/* Content Container: Text on top, Button below on mobile; side-by-side on desktop */}
                <div className={`w-full flex flex-col md:flex-row items-center justify-between gap-4 z-10 ${isArabic ? 'md:flex-row' : 'md:flex-row'}`}>
                    {/* 1. Text Content (First on mobile) */}
                    <div className={`flex flex-col text-center md:text-start flex-grow ${isArabic ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#8A6305]"></span>
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8A6305] dark:text-[#8A6305]">
                                {isArabic ? 'عروض التوريد والكميات' : 'Commercial Volume Supply'}
                            </span>
                        </div>
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#0B192C] dark:text-white leading-snug">
                            {isArabic ? 'توريد مباشر بأسعار الجملة المعتمدة' : 'Direct Supply from Certified Global Food Importers'}
                        </h2>
                    </div>

                    {/* 2. CTA Button (Below text on mobile) */}
                    <div className="w-full md:w-auto flex justify-center md:justify-end shrink-0">
                        <Link
                            href={bannerLink}
                            className="w-full md:w-auto text-center px-6 sm:px-8 py-2.5 sm:py-3 bg-[#0B192C] hover:bg-[#8A6305] text-white rounded-full font-bold text-xs sm:text-sm md:text-base transition-all active:scale-95 whitespace-nowrap shadow-md dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white"
                        >
                            {isArabic ? 'استعراض عروض التوريد' : 'Explore Supply Deals'}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;
