"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ResilientImage from '@/app/components/ResilientImage';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCart } from '@/app/context/CartContext';
import { useCustomer } from '@/app/context/CustomerContext';
import toast from 'react-hot-toast';
import { MdClose, MdLock } from 'react-icons/md';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';

interface Product {
    id: string;
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    price: string | number;
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
}

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
    const { language, dir } = useLanguage();
    const { formatPrice } = useCurrency();
    const { addItem } = useCart();
    const { customer } = useCustomer();
    const [quantity, setQuantity] = useState(1);

    const isLockedForGuest = !customer;

    const parsedOptions = product.options 
        ? product.options.split(',').map(o => o.trim()).filter(Boolean)
        : [];
    const [selectedOption, setSelectedOption] = useState<string>(parsedOptions[0] || "");
    
    if (!isOpen) return null;

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
            quantity: quantity,
            description: displayDesc || undefined,
            selectedOption: selectedOption || undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        toast.success(language === 'ar' ? `تمت إضافة ${displayName} إلى السلة` : `Added ${displayName} to cart`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden w-full max-w-[800px] max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative border border-gray-100 dark:border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
                dir={dir}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-3.5 end-3.5 z-50 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white shadow-sm border border-gray-200/60 dark:border-white/10 transition-all hover:scale-105 cursor-pointer"
                    aria-label="Close"
                >
                    <MdClose size={20} />
                </button>

                {/* Right side (Image) - Displayed first on mobile */}
                <div className="w-full h-64 sm:h-72 md:h-auto md:flex-1 relative bg-gray-50 dark:bg-zinc-800/40 min-h-[260px] md:min-h-[400px] overflow-hidden order-1 md:order-2">
                    <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
                        <ResilientImage
                            src={primaryImage}
                            alt={displayName}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Left side (Details) - Displayed second on mobile */}
                <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-center order-2 md:order-1">
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
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-3 py-1.5 rounded-lg hover:bg-[#8A6305] hover:text-white transition-all shadow-2xs"
                                >
                                    <MdLock className="text-base" />
                                    <span>{language === 'ar' ? 'أسعار الجملة بعد تسجيل دخول التجار' : 'Wholesale (Merchant Login)'}</span>
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
                                className="flex-1 bg-[#0B192C] hover:bg-[#8A6305] text-white py-3 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer shadow-md active:scale-[0.98] dark:bg-[#FAF6EC] dark:text-[#0B192C] dark:hover:bg-[#8A6305] dark:hover:text-white"
                            >
                                {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                            </button>
                            
                            <div className="flex items-center justify-between border border-gray-200 dark:border-white/10 rounded-xl px-2 py-1.5 w-32 sm:w-36 bg-gray-50 dark:bg-zinc-800">
                                <button 
                                    onClick={() => setQuantity(Math.max(product.minOrder || 1, quantity - 1))} 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 font-bold cursor-pointer text-base transition-colors"
                                    aria-label="Decrease quantity"
                                >-</button>
                                <span className="font-bold text-xs sm:text-sm text-[#0B192C] dark:text-white select-none whitespace-nowrap">
                                    {quantity} {formatPackaging(product.packaging, language, { short: true })}
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
};

export default QuickViewModal;
