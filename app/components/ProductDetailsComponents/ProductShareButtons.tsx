'use client';

import React, { useState } from 'react';
import { FaWhatsapp, FaFacebook, FaTelegram, FaLink, FaCheck } from 'react-icons/fa';
import { useLanguage } from '@/app/context/LanguageContext';
import toast from 'react-hot-toast';

interface ProductShareButtonsProps {
    productName: string;
    productSlug: string;
}

export default function ProductShareButtons({
    productName,
    productSlug,
}: ProductShareButtonsProps) {
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const [copied, setCopied] = useState(false);

    const getProductUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/products/${productSlug}`;
        }
        return `https://zadland.com/products/${productSlug}`;
    };

    const handleCopy = async () => {
        const url = getProductUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success(isArabic ? 'تم نسخ رابط المنتج!' : 'Product link copied!');
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error(isArabic ? 'تعذر نسخ الرابط' : 'Failed to copy link');
        }
    };

    const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${productSlug}` : `https://hawatrading.com/products/${productSlug}`;
    const shareMessage = isArabic
        ? `شاهد ${productName} لدى شركة حوا للتوزيع والتجارة - أسعار الجملة المعتمدة:\n${productUrl}`
        : `Check out ${productName} on Hawa Distribution Wholesale:\n${productUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productName)}`;

    return (
        <div className="flex items-center justify-start mt-6 pt-6 border-t border-gray-200 dark:border-white/10 gap-2.5">
            <span className="text-xs font-bold tracking-widest uppercase text-[#475569] dark:text-gray-400 mr-1">
                {isArabic ? 'مشاركة المنتج:' : 'Share Product:'}
            </span>

            {/* WhatsApp */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] dark:hover:text-white transition-all shadow-2xs"
                title={isArabic ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                aria-label="Share on WhatsApp"
            >
                <FaWhatsapp className="text-base" />
            </a>

            {/* Telegram */}
            <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 hover:bg-[#0088cc] hover:text-white dark:hover:bg-[#0088cc] dark:hover:text-white transition-all shadow-2xs"
                title={isArabic ? 'مشاركة عبر تيلغرام' : 'Share via Telegram'}
                aria-label="Share on Telegram"
            >
                <FaTelegram className="text-base" />
            </a>

            {/* Facebook */}
            <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-[#1877F2] hover:text-white dark:hover:bg-[#1877F2] dark:hover:text-white transition-all shadow-2xs"
                title={isArabic ? 'مشاركة عبر فيسبوك' : 'Share via Facebook'}
                aria-label="Share on Facebook"
            >
                <FaFacebook className="text-base" />
            </a>

            {/* Copy Link Button */}
            <button
                type="button"
                onClick={handleCopy}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-[#8A6305] hover:text-white dark:hover:bg-[#8A6305] dark:hover:text-white transition-all shadow-2xs cursor-pointer"
                title={isArabic ? 'نسخ الرابط' : 'Copy link'}
                aria-label="Copy Link"
            >
                {copied ? <FaCheck className="text-sm text-green-500" /> : <FaLink className="text-sm" />}
            </button>
        </div>
    );
}
