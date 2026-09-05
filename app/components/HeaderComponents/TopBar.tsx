import React from 'react';
import LanguageToggle from '../LanguageToggle';
import CurrencyToggle from '../CurrencyToggle';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '@/app/context/LanguageContext';

interface TopBarProps {
    isVisible: boolean;
}

const TopBar = ({ isVisible }: TopBarProps) => {
    const { dir, language } = useLanguage();
    const isArabic = dir === 'rtl' || language === 'ar';
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    return (
        <div 
            className={`hidden lg:block w-full bg-slate-100 dark:bg-zinc-900 border-b border-gray-200/60 dark:border-white/5 transition-all duration-300 ${
                isVisible ? 'max-h-[36px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 border-transparent overflow-hidden'
            }`}
        >
            <div className="container-custom h-9 flex items-center justify-between">
                {/* Left Column: Slogan & B2B Identity */}
                <div className="flex-1 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                    <p className="text-xs font-bold text-[#0B192C] dark:text-gray-200 truncate">
                        {isArabic 
                            ? 'شركة هوا للتوزيع والتجارة | كل منتجات وكالاتك… بطلب واحد' 
                            : 'Hawa Distribution & Trading | All your agency products... in one single order'}
                    </p>
                </div>
                
                {/* Center Column: Direct Delivery Notice */}
                <div className="hidden xl:flex items-center justify-center text-xs font-semibold text-[#475569] dark:text-gray-400">
                    <span>{isArabic ? '📦 توريد وتوزيع جملة لمحلات البقالة والتجزئة' : '📦 Direct wholesale supply to grocery stores'}</span>
                </div>
                
                {/* Right Column: Switchers and Live WhatsApp Link */}
                <div className="flex-1 flex flex-row items-center justify-end gap-4 text-sm">
                    {/* Switchers */}
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <CurrencyToggle />
                    </div>

                    {/* Socials & WhatsApp Order Link */}
                    <div className="flex items-center gap-3">
                        <a 
                            href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(isArabic ? 'مرحباً شركة هوا، أرغب بالاستفسار عن طلبيات الجملة للمحل.' : 'Hello Hawa Distribution, I would like to inquire about wholesale orders.')}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#25D366] hover:text-[#1ebe5d] transition-colors flex items-center gap-1.5 font-bold text-xs" 
                            aria-label="Order on WhatsApp"
                            title={isArabic ? 'طلب مباشر عبر واتساب' : 'Direct WhatsApp Order'}
                        >
                            <FaWhatsapp className="text-base shrink-0" />
                            <span className="hidden 2xl:inline">{isArabic ? 'طلب واتساب' : 'WhatsApp Order'}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
