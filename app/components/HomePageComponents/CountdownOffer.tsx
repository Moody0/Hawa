'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { MdChevronRight } from 'react-icons/md';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownOffer = () => {
    const { dir, language } = useLanguage();
    const isArabic = language === 'ar';
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 16, hours: 23, minutes: 58, seconds: 45 });

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 16);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <section className="container-custom">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#0F172A] to-[#0B192C] border border-[#8A6305]/30 p-5 sm:p-7 lg:p-8 shadow-sm">
                {/* Ambient Background Glow */}
                <div className="absolute top-0 end-0 w-80 h-80 bg-[#8A6305]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 start-0 w-60 h-60 bg-[#2E7D32]/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

                <div className={`relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${dir === 'rtl' ? 'lg:flex-row' : 'lg:flex-row'}`}>
                    
                    {/* Left/Right Content: Live Deal Description */}
                    <div className={`flex flex-col ${isArabic ? 'text-right' : 'text-left'} max-w-xl`}>
                        {/* Main Heading */}
                        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-snug tracking-tight mb-1.5">
                            {isArabic 
                                ? 'خصومات حصرية تصل إلى 25% على شحنات الجملة' 
                                : 'Save Up to 25% on Certified Bulk Food Shipments'}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm text-gray-300 dark:text-gray-300 leading-relaxed">
                            {isArabic
                                ? 'أسعار تفضيلية مخصصة للهايبرماركت، الموزعين، والمطاعم مع ضمان جودة التخزين والشحن المباشر.'
                                : 'Direct factory pricing for distributors, supermarkets, and catering with guaranteed quality.'}
                        </p>
                    </div>

                    {/* Right/Left Action & Timer Block */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-5 shrink-0 self-stretch lg:self-auto justify-between lg:justify-end">
                        
                        {/* Compact Integrated Countdown */}
                        <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-black/35 backdrop-blur-md border border-[#8A6305]/25 rounded-2xl px-4 py-2.5">
                            {/* Days */}
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[42px]">
                                <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#8A6305] tabular-nums leading-tight">
                                    {formatNumber(timeLeft.days)}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                                    {isArabic ? 'يوم' : 'Days'}
                                </span>
                            </div>

                            <span className="text-[#8A6305] font-extrabold text-xs -mt-2.5">:</span>

                            {/* Hours */}
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[42px]">
                                <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#8A6305] tabular-nums leading-tight">
                                    {formatNumber(timeLeft.hours)}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                                    {isArabic ? 'ساعة' : 'Hrs'}
                                </span>
                            </div>

                            <span className="text-[#8A6305] font-extrabold text-xs -mt-2.5">:</span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[42px]">
                                <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#8A6305] tabular-nums leading-tight">
                                    {formatNumber(timeLeft.minutes)}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                                    {isArabic ? 'دقيقة' : 'Min'}
                                </span>
                            </div>

                            <span className="text-[#8A6305] font-extrabold text-xs -mt-2.5">:</span>

                            {/* Seconds */}
                            <div className="flex flex-col items-center min-w-[38px] sm:min-w-[42px]">
                                <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#8A6305] tabular-nums leading-tight">
                                    {formatNumber(timeLeft.seconds)}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                                    {isArabic ? 'ثانية' : 'Sec'}
                                </span>
                            </div>
                        </div>

                        {/* Primary CTA Button */}
                        <Link
                            href="/products"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#8A6305] hover:bg-[#725204] text-white font-bold text-xs sm:text-sm md:text-base transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md whitespace-nowrap group cursor-pointer"
                        >
                            <span>{isArabic ? 'استكشف عروض التوريد' : 'Explore Bulk Deals'}</span>
                            <MdChevronRight className={`text-lg transition-transform group-hover:translate-x-0.5 ${isArabic ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CountdownOffer;
