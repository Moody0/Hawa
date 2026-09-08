'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Truck } from 'lucide-react';

const AnnouncementBar = () => {
    const { t } = useLanguage();

    return (
        <div className="w-full bg-primary text-white text-center py-2 px-4 text-xs md:text-sm font-medium z-[60] relative">
            <div className="flex items-center justify-center gap-2 font-bold tracking-wide">
                <Truck className="text-base shrink-0" />
                <span>{t('announcement.freeShipping')}</span>
                <Truck className="text-base shrink-0 hidden sm:inline-block" />
            </div>
        </div>
    );
};

export default AnnouncementBar;
