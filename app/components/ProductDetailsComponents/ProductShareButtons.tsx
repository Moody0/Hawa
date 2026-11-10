'use client';

import React, { useState } from 'react';
import { FaWhatsapp, FaFacebook, FaTelegram } from 'react-icons/fa';
import { Link2, Check } from 'lucide-react';
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
        return `https://hawatrading.com/products/${productSlug}`;
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
        <div className="flex items-center justify-between mt-4 pt-3 gap-3">
            <span className="text-[12.5px] font-bold text-slate-600 dark:text-slate-400">
                {isArabic ? 'مشاركة المنتج:' : 'Share Product:'}
            </span>

            <div className="flex items-center gap-2">
                {/* WhatsApp */}
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#0B192C]/12 dark:border-white/15 bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white hover:bg-[#0B192C] hover:text-[#E5B54A] hover:border-[#0B192C] dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors"
                    title={isArabic ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                    aria-label="Share on WhatsApp"
                >
                    <FaWhatsapp className="text-[15px]" />
                </a>

                {/* Telegram */}
                <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#0B192C]/12 dark:border-white/15 bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white hover:bg-[#0B192C] hover:text-[#E5B54A] hover:border-[#0B192C] dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors"
                    title={isArabic ? 'مشاركة عبر تيلغرام' : 'Share via Telegram'}
                    aria-label="Share on Telegram"
                >
                    <FaTelegram className="text-[15px]" />
                </a>

                {/* Facebook */}
                <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#0B192C]/12 dark:border-white/15 bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white hover:bg-[#0B192C] hover:text-[#E5B54A] hover:border-[#0B192C] dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors"
                    title={isArabic ? 'مشاركة عبر فيسبوك' : 'Share via Facebook'}
                    aria-label="Share on Facebook"
                >
                    <FaFacebook className="text-[15px]" />
                </a>

                {/* Copy Link Button */}
                <button
                    type="button"
                    onClick={handleCopy}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#0B192C]/12 dark:border-white/15 bg-white dark:bg-zinc-900 text-[#0B192C] dark:text-white hover:bg-[#0B192C] hover:text-[#E5B54A] hover:border-[#0B192C] dark:hover:bg-[#E5B54A] dark:hover:text-[#0B192C] transition-colors cursor-pointer"
                    title={isArabic ? 'نسخ الرابط' : 'Copy link'}
                    aria-label="Copy Link"
                >
                    {copied ? <Check className="w-4 h-4 text-[#8A6305] dark:text-[#E5B54A]" /> : <Link2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
