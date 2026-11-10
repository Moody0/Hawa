"use client";

import { whatsappHref, contactPhoneDigits, formatContactPhone } from '@/lib/website-content';
import { useSiteContacts } from '@/app/context/SiteContactsContext';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from "@/app/context/CartContext";
import { useCustomer } from "@/app/context/CustomerContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Minus, Plus } from 'lucide-react';
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
    requiresQuote?: boolean;
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
    const siteContacts = useSiteContacts();
    const { formatPrice } = useCurrency();
    const router = useRouter();

    const isArabic = language === 'ar';
    const isLockedForGuest = !customer;
    const minimumQuantity = product.minOrder || 1;
    const isOutOfStock = !product.requiresQuote && typeof stock === 'number' && stock <= 0;

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
            className="w-full flex flex-col gap-5 mt-1"
        >
            {/* 1. Concept 01: Clean Wholesale Price Gate Row (No blurred USD or green dot) */}
            {isLockedForGuest && !product.hidePrice ? (
                <div className="border-y border-[#0B192C]/[0.09] dark:border-white/10 py-4.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-bold text-[#0B192C] dark:text-white">
                            {isArabic ? "تسعير الجملة المعتمد للتجار" : "Official Wholesale Merchant Pricing"}
                        </span>
                        <span className="text-[12.5px] text-slate-600 dark:text-slate-400">
                            {isArabic
                                ? "تظهر أسعار الطرود والخصومات التجارية فور تسجيل دخول التاجر."
                                : "Carton prices and trade discounts appear upon merchant login."}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 shrink-0">
                        <Link
                            href="/account/login"
                            className="inline-flex h-[38px] items-center justify-center gap-1.5 px-4.5 rounded-full bg-[#0B192C] hover:bg-[#162E4D] dark:bg-[#E5B54A] dark:text-[#0B192C] dark:hover:bg-[#D4A134] text-white font-bold text-[12.5px] transition-colors cursor-pointer"
                        >
                            <span>{isArabic ? "تسجيل دخول التاجر" : "Merchant Login"}</span>
                            <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
                        </Link>

                        <Link
                            href="/account/register"
                            className="text-[12.5px] font-bold text-[#8A6305] dark:text-[#E5B54A] hover:underline underline-offset-4"
                        >
                            {isArabic ? "فتح حساب تاجر" : "Open Store Account"}
                        </Link>
                    </div>
                </div>
            ) : product.hidePrice || numPrice <= 0 ? (
                <div className="border-y border-[#0B192C]/[0.09] dark:border-white/10 py-4 flex items-center justify-between gap-4">
                    <span className="text-[13.5px] font-bold text-[#0B192C] dark:text-white">
                        {isArabic ? 'السعر يحدد حسب الوكالة عند الطلب' : 'Official Agency Price on Inquiry'}
                    </span>
                    <span className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400">
                        {product.requiresQuote
                            ? (isArabic ? 'التوفر يؤكد عبر واتساب' : 'Availability confirmed on WhatsApp')
                            : isOutOfStock
                                ? (isArabic ? 'غير متوفر حالياً' : 'Out of stock')
                                : (isArabic ? 'متوفر للتوريد المباشر' : 'Available for Supply')}
                    </span>
                </div>
            ) : (
                <div className="border-y border-[#0B192C]/[0.09] dark:border-white/10 py-4.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl sm:text-3xl font-bold text-[#0B192C] dark:text-white leading-none" dir="ltr">
                            {formatPrice(effectivePrice)}
                        </span>
                        <span className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
                            / {formatPackaging(product.packaging, language)}
                        </span>
                        {hasDiscount && (
                            <s className="text-sm text-slate-400 font-medium" dir="ltr">
                                {formatPrice(numPrice)}
                            </s>
                        )}
                        {hasDiscount && (
                            <span className="bg-[#C59329] text-[#0B192C] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                -{discountPercentage}%
                            </span>
                        )}
                    </div>
                    <span className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400">
                        {product.requiresQuote
                            ? (isArabic ? 'التوفر يؤكد عبر واتساب' : 'Availability confirmed on WhatsApp')
                            : isOutOfStock
                                ? (isArabic ? 'غير متوفر حالياً' : 'Out of stock')
                                : (isArabic ? 'متوفر للتوريد المباشر' : 'In Stock')}
                    </span>
                </div>
            )}

            {/* 2. Options / Variants Selector (if any) */}
            {parsedOptions.length > 0 && (
                <div id="product-options-selector" className="flex flex-col gap-2">
                    <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                        {isArabic ? 'الخيارات والأحجام المتاحة:' : 'Available Options / Sizes:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {parsedOptions.map((opt, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedOption(opt)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                    selectedOption === opt
                                        ? 'bg-[#0B192C] text-white border border-[#0B192C] dark:bg-[#C59329] dark:text-[#0B192C] dark:border-[#C59329]'
                                        : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-gray-300 border border-[#0B192C]/15 dark:border-white/15 hover:border-[#8A6305]'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Concept 01: Capsule Stepper & Signature Gold Capsule CTA */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[12.5px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>
                        {isArabic ? 'الكمية المطلوبة بالطرود' : 'Requested Cartons'}
                    </span>
                    {totalUnits !== null ? (
                        <div className="flex items-center gap-1 text-[#8A6305] dark:text-[#E5B54A] font-bold">
                            <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                            <RollingNumber value={totalUnits} className="font-bold" />
                            <span>{isArabic ? 'عبوة' : 'units'}</span>
                        </div>
                    ) : (
                        <span>
                            {isArabic
                                ? `الحد الأدنى للطلب: ${minimumQuantity} ${formatPackaging(product.packaging, 'ar', { short: true })}`
                                : `Min. Order: ${minimumQuantity} ${formatPackaging(product.packaging, 'en', { short: true })}`}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Capsule Stepper */}
                    <div dir="ltr" className="inline-flex items-center h-[50px] border border-[#0B192C]/15 dark:border-white/15 rounded-full bg-white dark:bg-zinc-900 px-2 gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={quantity <= minimumQuantity || isOutOfStock}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-[#FAF7F0] dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={17} />
                        </button>
                        <span className="px-3 text-center text-[14.5px] font-bold text-[#0B192C] dark:text-white select-none whitespace-nowrap flex items-center gap-1">
                            <RollingNumber value={quantity} />
                            <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{formatPackaging(product.packaging, language, { short: true })}</span>
                        </span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={isOutOfStock}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[#0B192C] dark:text-white hover:bg-[#FAF7F0] dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Increase quantity"
                        >
                            <Plus size={17} />
                        </button>
                    </div>

                    {/* Signature Hawa Gold Capsule Primary CTA */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="group/order flex-1 h-[50px] bg-[#C59329] hover:bg-[#D4A134] text-[#0B192C] rounded-full font-bold text-[14.5px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer active:translate-y-px disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-zinc-800 dark:disabled:text-slate-500"
                    >
                        <span>{isOutOfStock ? (isArabic ? 'غير متوفر حالياً' : 'Out of stock') : (isArabic ? 'إضافة للطلبية' : 'Add to Order')}</span>
                        {!isOutOfStock && (
                            <span
                                className={`inline-block transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    isArabic ? 'group-hover/order:-translate-x-1' : 'group-hover/order:translate-x-1'
                                }`}
                                aria-hidden="true"
                            >
                                {isArabic ? '←' : '→'}
                            </span>
                        )}
                    </button>
                </div>

                {!isLockedForGuest && (
                    <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className="w-full h-11 rounded-full border border-[#0B192C]/15 dark:border-white/15 bg-[#0B192C] hover:bg-[#162E4D] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-40"
                    >
                        {product.requiresQuote
                            ? (isArabic ? 'متابعة طلب الأسعار ←' : 'Continue quote request →')
                            : (isArabic ? 'متابعة الطلب والدفع السريع ←' : 'Proceed to Checkout →')}
                    </button>
                )}
            </div>

            {/* 4. Concept 01: Clean Editorial WhatsApp Inquiry Link + Clickable Phone Numbers */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#0B192C]/[0.09] dark:border-white/10">
                <a
                    href={whatsappHref(
                        siteContacts,
                        isArabic
                            ? `مرحباً مدير المبيعات بشركة حوا، أود الاستفسار عن توفر وتسعير جملة لمنتج: ${displayName} (${quantity} ${formatPackaging(product.packaging, 'ar')})`
                            : `Hello Hawa Sales, I would like to inquire about wholesale pricing for: ${displayName}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/wa inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#0B192C] dark:text-white"
                >
                    <span className="relative pb-1">
                        {isArabic ? 'استفسر عن تسعير الجملة عبر واتساب' : 'Inquire about wholesale pricing on WhatsApp'}
                        <span
                            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-[#B68012] dark:bg-[#E5B54A] scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/wa:scale-x-100 ${
                                isArabic
                                    ? 'origin-left group-hover/wa:origin-right'
                                    : 'origin-right group-hover/wa:origin-left'
                            }`}
                        />
                    </span>
                    <span className="text-[#B68012] dark:text-[#E5B54A] text-[13px]" aria-hidden="true">↗</span>
                </a>

                <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-slate-600 dark:text-slate-400">
                    <a
                        href={`tel:+${contactPhoneDigits(siteContacts.phone)}`}
                        className="inline-flex items-center gap-1.5 hover:text-[#8A6305] dark:hover:text-[#E5B54A] transition-colors cursor-pointer"
                    >
                        <span>{isArabic ? 'المبيعات:' : 'Sales:'}</span>
                        <strong dir="ltr" className="font-bold text-[#0B192C] dark:text-white hover:text-[#8A6305] dark:hover:text-[#E5B54A] underline-offset-4 hover:underline tabular-nums">
                            {formatContactPhone(siteContacts.phone)}
                        </strong>
                    </a>
                    <a
                        href={`tel:+${contactPhoneDigits(siteContacts.managementPhone)}`}
                        className="inline-flex items-center gap-1.5 hover:text-[#8A6305] dark:hover:text-[#E5B54A] transition-colors cursor-pointer"
                    >
                        <span>{isArabic ? 'الإدارة:' : 'Management:'}</span>
                        <strong dir="ltr" className="font-bold text-[#0B192C] dark:text-white hover:text-[#8A6305] dark:hover:text-[#E5B54A] underline-offset-4 hover:underline tabular-nums">
                            {formatContactPhone(siteContacts.managementPhone)}
                        </strong>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ProductActions;
