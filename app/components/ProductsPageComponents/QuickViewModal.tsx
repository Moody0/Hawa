"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import ResilientImage from '@/app/components/ResilientImage';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { X, Lock } from 'lucide-react';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';
import RollingNumber from '@/app/components/RollingNumber';

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    price: string | number | null;
    discountPrice?: string | number | null;
    images: string;
    categoryId?: string;
    stock?: number;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    minOrder?: number | null;
    hidePrice?: boolean;
    options?: string | null;
    brand?: {
        name: string;
    } | null;
    [key: string]: any;
}

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
    const [mounted, setMounted] = useState(false);
    const { language, dir } = useLanguage();
    const { formatPrice } = useCurrency();
    const { addItem } = useCart();
    const { customer } = useCustomer();
    const minQuantity = Math.max(1, Number(product.minOrder) || 1);
    const [quantity, setQuantity] = useState(minQuantity);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setQuantity(Math.max(1, Number(product.minOrder) || 1));
    }, [product.id, product.minOrder]);

    // Lock body scroll and listen for Escape key when modal is open
    useEffect(() => {
        if (!isOpen || !mounted) return;

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Prevent layout shift from scrollbar disappearing
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, mounted, onClose]);

    const isLockedForGuest = !customer;

    const parsedOptions = product.options 
        ? product.options.split(',').map(o => o.trim()).filter(Boolean)
        : [];
    const [selectedOption, setSelectedOption] = useState<string>(parsedOptions[0] || "");
    
    if (!isOpen || !mounted) return null;

    const displayName = (language === 'ar' ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';

    const displayDesc = language === 'ar'
        ? (product.descriptionAr || product.description)
        : (product.descriptionEn || product.description);

    const images = typeof product.images === 'string'
        ? product.images.split(',').map(img => img.trim()).filter(Boolean)
        : Array.isArray(product.images) ? product.images : [];

    const primaryImage = images[0] || '';

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.discountPrice || product.price),
            image: primaryImage,
            slug: product.slug,
            quantity: Math.max(minQuantity, quantity),
            description: displayDesc || undefined,
            selectedOption: selectedOption || undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: minQuantity,
        });
        onClose();
    };

    const modalContent = (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={displayName}
        >
            <div 
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden w-full max-w-[840px] max-h-[90vh] shadow-2xl flex flex-col md:flex-row relative border border-slate-200/90 dark:border-white/10"
                onClick={e => e.stopPropagation()}
                dir={dir}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-3.5 end-3.5 z-50 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-slate-600 hover:text-black dark:text-gray-300 dark:hover:text-white border border-slate-200/60 dark:border-white/10 shadow-sm transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Media Column (Product Image) - Prominent and filling container */}
                <div className="w-full h-72 sm:h-80 md:h-auto md:w-1/2 relative bg-gray-50/80 dark:bg-zinc-800/40 min-h-[280px] md:min-h-[460px] flex items-center justify-center p-4 sm:p-6 overflow-hidden order-1 md:order-2 border-b md:border-b-0 border-slate-200/60 dark:border-white/10">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <ResilientImage
                            src={primaryImage}
                            alt={displayName}
                            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
                            priority
                            sizes="(max-width: 768px) 100vw, 420px"
                        />
                    </div>
                </div>

                {/* Details Column - Displayed second on mobile */}
                <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(90vh-280px)] md:max-h-[90vh] order-2 md:order-1">
                    <h2 className={`text-xl md:text-2xl font-bold text-[#0B192C] dark:text-white mb-2 tracking-normal ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        {displayName}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#475569]">
                        {product.brand && (
                            <span>{language === 'ar' ? 'الشركة / الماركة:' : 'Brand:'} <span className="font-bold text-[#0B192C] dark:text-white">{product.brand.name}</span></span>
                        )}
                    </div>

                    {/* Options Selector in Quick View */}
                    {parsedOptions.length > 0 && (
                        <div className="mb-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] block mb-1.5">
                                {language === 'ar' ? 'الخيارات / الحجم:' : 'Select Option:'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {parsedOptions.map((opt, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedOption(opt)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            selectedOption === opt
                                                ? 'bg-[#8A6305] text-white'
                                                : 'bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-gray-300 hover:bg-[#8A6305]/10 hover:text-[#8A6305]'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Wholesale Packaging & Minimum Order Card */}
                    <div className="flex flex-col gap-1.5 mb-4 bg-[#FAF6EC] dark:bg-zinc-800/80 p-3 rounded-xl border border-[#8A6305]/25">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#0B192C] dark:text-white flex items-center gap-1.5">
                                <span>📦</span>
                                <span>{language === 'ar' ? 'نوع التعبئة:' : 'Packaging:'}</span>
                                <span className="text-[#8A6305] font-extrabold">{formatPackaging(product.packaging, language)}</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8A6305]/10 text-[#8A6305] border border-[#8A6305]/20">
                                {language === 'ar' 
                                    ? `أدنى طلب: ${product.minOrder && product.minOrder > 1 ? product.minOrder + ' ' : ''}${formatPackaging(product.packaging, 'ar')}`
                                    : `Min: ${product.minOrder || 1} ${formatPackaging(product.packaging, 'en', { short: true })}`}
                            </span>
                        </div>
                        {product.itemsPerPackage ? (
                            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                {language === 'ar'
                                    ? `محتوى الطرد: ${formatPackageItems(product.itemsPerPackage, 'ar', { mode: 'full' })} داخل الطرد الكامل`
                                    : `Contents: ${formatPackageItems(product.itemsPerPackage, 'en', { mode: 'full' })} per full carton`}
                            </p>
                        ) : null}
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                        {isLockedForGuest ? (
                            <div className="flex items-center">
                                <Link
                                    href="/account/login"
                                    onClick={onClose}
                                    className="group/lock inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 hover:border-[#8A6305] transition-colors"
                                    title={language === 'ar' ? 'سجّل دخول التاجر لعرض سعر الجملة' : 'Login to view wholesale price'}
                                >
                                    <span className="w-5 h-5 rounded-md bg-[#8A6305] text-white flex items-center justify-center shrink-0">
                                        <Lock className="w-3 h-3" />
                                    </span>
                                    <div className="flex items-baseline gap-1.5 select-none">
                                        <span className="text-base font-black text-slate-800 dark:text-slate-200 blur-[3.5px] opacity-60 tracking-wider">
                                            88,500
                                        </span>
                                        <span className="text-xs font-bold text-[#8A6305] dark:text-[#E5B54A]">
                                            {language === 'ar' ? 'سعر الجملة للتجار (سجّل الآن)' : 'Wholesale Rate (Login to view)'}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ) : !product.hidePrice && Number(product.price) > 0 ? (
                            <div className="text-2xl font-black text-[#0B192C] dark:text-white">
                                {product.discountPrice && Number(product.discountPrice) < Number(product.price) ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#0B192C] dark:text-white font-black">{formatPrice(Number(product.discountPrice))}</span>
                                        <span className="text-base text-gray-400 line-through font-normal">{formatPrice(Number(product.price))}</span>
                                    </div>
                                ) : (
                                    <span>{formatPrice(Number(product.price))}</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <span className="inline-flex items-center text-sm font-extrabold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-3 py-1.5 rounded-lg">
                                    🏷️ {language === 'ar' ? 'السعر يحدد حسب الوكالة (عند الطلب)' : 'Price on Inquiry (Agency Rate)'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#0B192C] hover:bg-[#8A6305] text-white py-3 rounded-xl font-bold transition-colors text-xs sm:text-sm cursor-pointer active:scale-[0.98] dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white"
                            >
                                {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                            </button>
                            
                            <div dir="ltr" className="flex items-center justify-between border border-gray-200 dark:border-white/10 rounded-xl px-2 py-1.5 w-32 sm:w-36 bg-gray-50 dark:bg-zinc-800">
                                <button 
                                    onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))} 
                                    disabled={quantity <= minQuantity}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer text-base transition-colors"
                                    aria-label="Decrease quantity"
                                >-</button>
                                <span className="font-bold text-xs sm:text-sm text-[#0B192C] dark:text-white select-none whitespace-nowrap flex items-center gap-1">
                                    <RollingNumber value={quantity} />
                                    <span>{formatPackaging(product.packaging, language, { short: true })}</span>
                                </span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)} 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 font-bold cursor-pointer text-base transition-colors"
                                    aria-label="Increase quantity"
                                >+</button>
                            </div>
                        </div>

                    <Link 
                        href={`/products/${product.slug}`}
                        className="text-xs font-bold text-[#475569] hover:text-[#8A6305] flex items-center gap-1 transition-colors mt-2"
                        onClick={onClose}
                    >
                        {language === 'ar' ? 'عرض كل التفاصيل' : 'View full details'} →
                    </Link>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default QuickViewModal;
