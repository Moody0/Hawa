"use client";

import React, { useState } from 'react';
import { useCart } from "@/app/context/CartContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { MdRemove, MdAdd, MdShoppingBag } from "react-icons/md";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { formatPackaging, formatPackageItems } from "@/lib/packaging";

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        nameAr?: string | null;
        nameEn?: string | null;
        price: number;
        image: string;
        slug: string;
        options?: string | null;
        description?: string | null;
        descriptionAr?: string | null;
        descriptionEn?: string | null;
        packaging?: string | null;
        itemsPerPackage?: string | number | null;
        minOrder?: number | null;
    };
    stock?: number;
}

const ProductActions = ({ product, stock }: ProductActionsProps) => {
    const { addItem } = useCart();
    const { language } = useLanguage();
    const router = useRouter();
    const [quantity, setQuantity] = useState(product.minOrder || 1);

    // Options parsing
    const parsedOptions = product.options 
        ? product.options.split(',').map(o => o.trim()).filter(Boolean)
        : [];
    const [selectedOption, setSelectedOption] = useState<string>(
        parsedOptions.length > 0 ? parsedOptions[0] : ""
    );

    const displayName = (language === 'ar' ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const displayDesc = language === 'ar'
        ? (product.descriptionAr || product.description)
        : (product.descriptionEn || product.description);

    const handleDecrement = () => {
        const min = product.minOrder || 1;
        if (quantity > min) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrement = () => {
        setQuantity(quantity + 1);
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.price),
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            description: displayDesc || undefined,
            selectedOption: selectedOption || undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        toast.success(language === 'ar' ? `تمت إضافة ${displayName} إلى السلة` : `Added ${displayName} to cart`);
    };

    const handleBuyNow = () => {
        addItem({
            id: product.id,
            name: displayName,
            price: Number(product.price),
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            description: displayDesc || undefined,
            selectedOption: selectedOption || undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        router.push("/place-order");
    };

    const displayStock = stock !== undefined ? stock : 1;

    return (
        <div className="flex flex-col gap-4 my-2">
            {/* Options / Variants Selector */}
            {parsedOptions.length > 0 && (
                <div className="w-full bg-gray-50/80 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0B192C] dark:text-white">
                            {language === 'ar' ? 'الخيارات والأحجام:' : 'Options / Sizes:'}
                        </span>
                        {selectedOption && (
                            <span className="text-xs font-bold text-[#8A6305]">
                                {selectedOption}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {parsedOptions.map((opt, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedOption(opt)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedOption === opt
                                        ? 'bg-[#8A6305] text-white ring-2 ring-[#8A6305]/20'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#8A6305]'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Wholesale Packaging & Availability Badge */}
            <div className="w-full rounded-2xl bg-[#FAF6EC] dark:bg-zinc-800/60 border border-[#8A6305]/25 dark:border-white/10 p-4 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white">
                        <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#2E7D32]"></span>
                        <span>
                            {language === 'ar' ? 'متوفر للتوريد المباشر بالجملة' : 'In Stock for Wholesale Supply'}
                        </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] dark:bg-[#2E7D32]/20 dark:text-[#4ade80]">
                        {language === 'ar' ? 'بيع بالجملة' : 'Wholesale B2B'}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#8A6305]/15 dark:border-white/5 text-xs">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[#475569] dark:text-gray-400 font-medium">{language === 'ar' ? 'نوع التعبئة:' : 'Packaging Unit:'}</span>
                        <span className="font-bold text-[#0B192C] dark:text-white flex items-center gap-1">
                            <span>📦</span> {formatPackaging(product.packaging, language)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[#475569] dark:text-gray-400 font-medium">{language === 'ar' ? 'الحد الأدنى للطلب:' : 'Minimum Order:'}</span>
                        <span className="font-bold text-[#2E7D32] dark:text-[#4ade80]">
                            {product.minOrder || 1} {formatPackaging(product.packaging, language)}
                        </span>
                    </div>
                    {product.itemsPerPackage ? (
                        <div className="col-span-2 flex items-center gap-1 text-[11px] text-[#475569] dark:text-gray-300 font-semibold pt-1">
                            <span>🧴</span>
                            <span>
                                {language === 'ar'
                                    ? `محتوى الطرد: ${formatPackageItems(product.itemsPerPackage, 'ar', { mode: 'full' })} داخل الطرد الكامل`
                                    : `Package Contents: ${formatPackageItems(product.itemsPerPackage, 'en', { mode: 'full' })} per full carton`}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Quantity and Add to Cart Row */}
            <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#475569] dark:text-gray-300 px-0.5">
                    <span>{language === 'ar' ? 'عدد الطرود المطلوبة:' : 'Requested Cartons:'}</span>
                    {(() => {
                        if (!product.itemsPerPackage) return null;
                        const str = String(product.itemsPerPackage).trim();
                        const num = Number(str);
                        if (!isNaN(num) && num > 0) {
                            return (
                                <span className="text-[#8A6305] dark:text-[#8A6305] font-semibold">
                                    {quantity * num} {language === 'ar' ? 'قطعة إجمالاً' : 'Total Pieces'}
                                </span>
                            );
                        }
                        return null;
                    })()}
                </div>
                <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center h-12 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-zinc-800/50 px-2 shrink-0">
                        <button
                            onClick={handleDecrement}
                            className="w-8 h-8 flex items-center justify-center text-[#475569] dark:text-gray-300 hover:text-[#8A6305] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                        >
                            <MdRemove size={18} />
                        </button>
                        <span className="px-2 text-center text-sm font-extrabold text-[#0B192C] dark:text-white select-none whitespace-nowrap">
                            {quantity} {formatPackaging(product.packaging, language, { short: true })}
                        </span>
                        <button
                            onClick={handleIncrement}
                            className="w-8 h-8 flex items-center justify-center text-[#475569] dark:text-gray-300 hover:text-[#8A6305] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                        >
                            <MdAdd size={18} />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-12 bg-[#0B192C] hover:bg-[#0F172A] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                    >
                        <MdShoppingBag className="text-lg" />
                        <span>{language === 'ar' ? 'إضافة للطلبية' : 'Add to Cart'}</span>
                    </button>
                </div>
            </div>

            {/* Buy Now Button */}
            <button
                onClick={handleBuyNow}
                className="w-full h-12 bg-[#2E7D32] hover:bg-[#236327] text-white rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer"
            >
                {language === 'ar' ? 'شراء وتثبيت الطلب' : 'Buy Now'}
            </button>
        </div>
    );
};

export default ProductActions;
