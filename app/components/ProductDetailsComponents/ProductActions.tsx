"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from "@/app/context/CartContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Minus, Plus, ShoppingBag, Lock, Store } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { formatPackaging } from "@/lib/packaging";
import RollingNumber from "@/app/components/RollingNumber";
import toast from 'react-hot-toast';
import { useProductPurchase } from "@/app/context/ProductPurchaseContext";

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        nameAr?: string | null;
        nameEn?: string | null;
        price: number;
        discountPrice?: number | null;
        hidePrice?: boolean;
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
    const purchaseContext = useProductPurchase();
    const { addItem } = useCart();
    const { customer } = useCustomer();
    const { language } = useLanguage();
    const { formatPrice } = useCurrency();
    const router = useRouter();

    const isArabic = language === 'ar';
    const isLockedForGuest = !customer;
    const minimumQuantity = product.minOrder || 1;
    const isOutOfStock = typeof stock === 'number' && stock <= 0;

    // Options parsing
    const parsedOptions = purchaseContext?.parsedOptions ?? (product.options 
        ? product.options.split(',').map(o => o.trim()).filter(Boolean)
        : []);
    const hasOptions = parsedOptions.length > 0;

    const [localQuantity, setLocalQuantity] = useState(product.minOrder || 1);
    const [localOption, setLocalOption] = useState<string>(
        hasOptions ? parsedOptions[0] : ""
    );

    const quantity = purchaseContext ? purchaseContext.quantity : localQuantity;
    const setQuantity = purchaseContext ? purchaseContext.setQuantity : setLocalQuantity;
    const selectedOption = purchaseContext ? purchaseContext.selectedOption : localOption;
    const setSelectedOption = purchaseContext ? purchaseContext.setSelectedOption : setLocalOption;

    const displayName = (isArabic ? product.nameAr : product.nameEn) || product.name || product.nameAr || '';
    const displayDesc = isArabic
        ? (product.descriptionAr || product.description)
        : (product.descriptionEn || product.description);

    const effectivePrice = Number(product.discountPrice || product.price);
    const numPrice = Number(product.price);
    const numDiscount = product.discountPrice ? Number(product.discountPrice) : null;
    const hasDiscount = numDiscount !== null && numDiscount < numPrice;
    const discountPercentage = hasDiscount && numPrice > 0 ? Math.round((1 - numDiscount / numPrice) * 100) : 0;

    const handleDecrement = () => {
        if (purchaseContext) {
            purchaseContext.handleDecrement();
        } else if (quantity > minimumQuantity) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (purchaseContext) {
            purchaseContext.handleIncrement();
        } else if (!isOutOfStock) {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCart = () => {
        if (purchaseContext) {
            purchaseContext.handleAddToCart();
            return;
        }
        if (isOutOfStock) return;
        if (hasOptions && (!selectedOption || !parsedOptions.includes(selectedOption))) {
            toast.error(isArabic ? 'يرجى اختيار المقاس أو الخيار المطلوب أولاً' : 'Please select an option first');
            return;
        }
        addItem({
            id: product.id,
            name: displayName,
            price: effectivePrice,
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            description: displayDesc || undefined,
            selectedOption: hasOptions ? selectedOption.trim() : undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        const optionLabel = hasOptions && selectedOption ? ` (${selectedOption.trim()})` : '';
        toast.success(
            isArabic
                ? `تمت إضافة ${quantity} ${formatPackaging(product.packaging, 'ar')}${optionLabel} إلى الطلبية`
                : `Added ${quantity} ${formatPackaging(product.packaging, 'en')}${optionLabel} to order`
        );
    };

    const handleBuyNow = () => {
        if (purchaseContext) {
            purchaseContext.handleBuyNow();
            return;
        }
        if (isOutOfStock) return;
        if (hasOptions && (!selectedOption || !parsedOptions.includes(selectedOption))) {
            toast.error(isArabic ? 'يرجى اختيار المقاس أو الخيار المطلوب أولاً' : 'Please select an option first');
            return;
        }
        addItem({
            id: product.id,
            name: displayName,
            price: effectivePrice,
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            description: displayDesc || undefined,
            selectedOption: hasOptions ? selectedOption.trim() : undefined,
            packaging: formatPackaging(product.packaging, language),
            itemsPerPackage: product.itemsPerPackage || null,
            minOrder: product.minOrder || 1,
        });
        router.push("/place-order");
    };

    // Calculate total individual units if itemsPerPackage is a valid number
    const itemsPerPkgNum = (() => {
        if (!product.itemsPerPackage) return null;
        const num = Number(String(product.itemsPerPackage).trim());
        return !isNaN(num) && num > 0 ? num : null;
    })();
    const totalUnits = itemsPerPkgNum ? quantity * itemsPerPkgNum : null;

    return (
        <section
            id="product-actions-section"
            aria-label={isArabic ? "منطقة الشراء والتسعير التجاري" : "Commercial Buy Box"}
            className="w-full flex flex-col gap-3.5 sm:gap-4 my-1 sm:my-2"
        >
            {/* 1. Price & Wholesale Merchant Access Header */}
            {isLockedForGuest ? (
                <div className="flex flex-col gap-2.5 pb-3.5 border-b border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-[6px] bg-[#FAF6EC] dark:bg-[#8A6305]/20 border border-[#8A6305]/30 flex items-center justify-center shrink-0">
                                <Lock className="w-3 h-3 text-[#8A6305]" />
                            </span>
                            <span className="text-xs font-bold text-[#0B192C] dark:text-white">
                                {isArabic ? "سعر الجملة للأنشطة التجارية" : "Wholesale Commercial Price"}
                            </span>
                            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold ${isOutOfStock ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                {isOutOfStock ? (isArabic ? 'غير متوفر' : 'Out of stock') : (isArabic ? 'متوفر' : 'Available')}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-1 select-none">
                            <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200 blur-[3px] opacity-60 tracking-wider">
                                88,500
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                                {isArabic ? "ل.س" : "SYP"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-0.5">
                        <Link
                            href="/account/login"
                            className="group inline-flex min-h-9 items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-[#0B192C] hover:bg-[#8A6305] text-white font-bold text-xs transition-colors cursor-pointer active:scale-95"
                        >
                            <Store className="w-3.5 h-3.5 text-[#8A6305] group-hover:text-white transition-colors" />
                            <span>{isArabic ? "تسجيل دخول التاجر" : "Merchant Login"}</span>
                        </Link>

                        <Link
                            href="/account/register"
                            className="text-xs font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4"
                        >
                            {isArabic ? "فتح حساب تاجر جديد ←" : "Register Store Account →"}
                        </Link>
                    </div>
                </div>
            ) : product.hidePrice || numPrice <= 0 ? (
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/10">
                    <span className="text-xs font-bold text-[#8A6305] bg-[#FAF6EC] dark:bg-[#8A6305]/15 border border-[#8A6305]/30 px-3 py-1.5 rounded-[8px]">
                        🏷️ {isArabic ? 'السعر يحدد حسب الوكالة' : 'Price on Inquiry'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isOutOfStock ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        <span>{isOutOfStock ? (isArabic ? 'غير متوفر حالياً' : 'Out of stock') : (isArabic ? 'متوفر للتوريد' : 'In Stock')}</span>
                    </span>
                </div>
            ) : (
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/10">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white leading-none" dir="ltr">
                            {formatPrice(effectivePrice)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            / {formatPackaging(product.packaging, language)}
                        </span>
                        {hasDiscount && (
                            <s className="text-sm text-slate-400 font-medium" dir="ltr">
                                {formatPrice(numPrice)}
                            </s>
                        )}
                        {hasDiscount && (
                            <span className="bg-[#8A6305] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-[4px]">
                                -{discountPercentage}%
                            </span>
                        )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-[6px] border ${isOutOfStock ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20'}`}>
                        <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        <span>{isOutOfStock ? (isArabic ? 'غير متوفر حالياً' : 'Out of stock') : (isArabic ? 'متوفر للتوريد' : 'In Stock')}</span>
                    </span>
                </div>
            )}

            {/* 2. Options / Variants Selector (if any) */}
            {parsedOptions.length > 0 && (
                <div id="product-options-selector" className="flex flex-col gap-1.5 pb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {isArabic ? 'الخيارات والأحجام:' : 'Options / Sizes:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {parsedOptions.map((opt, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedOption(opt)}
                                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors cursor-pointer ${
                                    selectedOption === opt
                                        ? 'bg-[#0B192C] text-white border border-[#0B192C] dark:bg-[#8A6305] dark:border-[#8A6305]'
                                        : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* 4. Quantity Stepper & Add to Order Row */}
            <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-gray-300 px-0.5">
                    <span>
                        {isArabic ? 'الكمية المطلوبة بالطرود:' : 'Requested Cartons:'}
                    </span>
                    {totalUnits !== null && (
                        <div className="flex items-center gap-1 text-xs text-[#8A6305] dark:text-[#E5B54A] font-semibold">
                            <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                            <RollingNumber value={totalUnits} className="font-extrabold" />
                            <span>{isArabic ? 'عبوة' : 'units'}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Stepper */}
                    <div dir="ltr" className="flex items-center h-12 border border-slate-200 dark:border-white/10 rounded-[10px] bg-slate-50 dark:bg-zinc-800/80 px-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={quantity <= minimumQuantity || isOutOfStock}
                            className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-[#8A6305] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-slate-600"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={18} />
                        </button>
                        <span className="px-2.5 text-center text-sm font-extrabold text-[#0B192C] dark:text-white select-none whitespace-nowrap flex items-center gap-1">
                            <RollingNumber value={quantity} />
                            <span className="text-xs text-slate-400 font-semibold">{formatPackaging(product.packaging, language, { short: true })}</span>
                        </span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={isOutOfStock}
                            className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-[#8A6305] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Increase quantity"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Add to Order Button */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="flex-1 h-12 bg-[#0B192C] hover:bg-[#8A6305] text-white rounded-[10px] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.99] disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed dark:disabled:bg-zinc-700 dark:disabled:text-slate-400"
                    >
                        <ShoppingBag className="text-lg" />
                        <span>{isOutOfStock ? (isArabic ? 'غير متوفر حالياً' : 'Out of stock') : (isArabic ? 'إضافة للطلبية' : 'Add to Order')}</span>
                    </button>
                </div>
            </div>

            {/* 5. Direct Fast Action: Fast Checkout (Logged In) OR Direct Sales WhatsApp (Guest) */}
            {isLockedForGuest ? (
                <a
                    href={`https://wa.me/963993443901?text=${encodeURIComponent(
                        isArabic
                            ? `مرحباً مدير المبيعات بشركة حوا، أود الاستفسار عن توفر وتسعير جملة لمنتج: ${displayName} (${quantity} ${formatPackaging(product.packaging, 'ar')})`
                            : `Hello Hawa Sales, I would like to inquire about wholesale pricing for: ${displayName}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/25 rounded-[10px] font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                >
                    <FaWhatsapp className="text-base text-emerald-600" />
                    <span>{isArabic ? 'أو استفسر فوراً عن تسعير الجملة عبر واتساب' : 'Inquire via Sales WhatsApp'}</span>
                </a>
            ) : (
                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full h-11 bg-[#8A6305] hover:bg-[#735204] text-white rounded-[10px] font-bold text-xs transition-colors active:scale-[0.99] cursor-pointer disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed dark:bg-[#E5B54A] dark:text-[#0B192C] dark:hover:bg-[#d9a432] dark:disabled:bg-zinc-700 dark:disabled:text-slate-400"
                >
                    {isArabic ? 'متابعة الطلب والدفع السريع ←' : 'Proceed to Checkout →'}
                </button>
            )}
        </section>
    );
};

export default ProductActions;
