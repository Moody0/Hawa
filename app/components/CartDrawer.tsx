"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdClose, MdShoppingBag, MdDelete, MdArrowForward, MdArrowBack } from 'react-icons/md';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';
import { formatPackaging, formatPackageItems } from '@/lib/packaging';

const CartDrawer = () => {
    const { items, isDrawerOpen, closeDrawer, subtotal, updateQuantity, removeItem } = useCart();
    const { t, dir, language } = useLanguage();
    const { formatPrice } = useCurrency();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isDrawerOpen]);

    if (!mounted) return null;

    const drawerTransform = dir === 'rtl' 
        ? (isDrawerOpen ? 'translate-x-0' : '-translate-x-full') 
        : (isDrawerOpen ? 'translate-x-0' : 'translate-x-full');

    return (
        <>
            {/* Backdrop Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998] transition-opacity duration-300 ${
                    isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <div 
                className={`fixed top-0 bottom-0 z-[9999] w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out transform ${drawerTransform} ${
                    dir === 'rtl' ? 'left-0' : 'right-0'
                } flex flex-col border-s border-gray-100 dark:border-white/10 ${!isDrawerOpen ? 'invisible pointer-events-none' : ''}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-white/10 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                        <MdShoppingBag className="text-xl" />
                        <span>{language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</span>
                        <span className="text-xs font-semibold text-gray-400 ms-1">
                            ({items.reduce((acc, item) => acc + item.quantity, 0)})
                        </span>
                    </h2>
                    <button 
                        onClick={closeDrawer}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 hover:text-black dark:hover:text-white"
                        aria-label="Close drawer"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                            <div className="w-16 h-16 rounded-full bg-[#FAF6EC] dark:bg-[#1A1A14] flex items-center justify-center mb-4 border border-[#8A6305]/20">
                                <MdShoppingBag className="text-3xl text-[#8A6305]" />
                            </div>
                            <p className="text-base font-bold text-[#0B192C] dark:text-white mb-1">
                                {language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                            </p>
                            <p className="text-xs text-[#475569] dark:text-gray-400 mb-6 max-w-xs">
                                {language === 'ar' ? 'استكشف منتجاتنا وأضف ما يعجبك إلى السلة' : 'Explore our collection and add your favorite items.'}
                            </p>
                            <button 
                                onClick={closeDrawer}
                                className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#0F172A] text-white rounded-xl font-bold text-xs transition-all active:scale-95"
                            >
                                {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                            </button>
                        </div>
                    ) : (
                        items.map(item => {
                            const imageSrc = item.image ? item.image.split(',')[0].trim() : '';
                            const itemKey = `${item.id}:${item.selectedOption || ''}`;
                            return (
                                <div key={itemKey} className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl flex gap-3 relative border border-gray-100 dark:border-white/5">
                                    <div 
                                        className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-xl bg-contain bg-center bg-no-repeat shrink-0 border border-gray-100 dark:border-white/5 p-1"
                                        style={{ backgroundImage: `url('${imageSrc}')` }}
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div className="pe-7">
                                            <Link 
                                                href={`/products/${item.slug}`} 
                                                onClick={closeDrawer}
                                                className={`font-semibold text-xs sm:text-sm text-[#0B192C] dark:text-white line-clamp-2 leading-snug block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                                            >
                                                <span className="hover:text-[#8A6305] dark:hover:text-[#8A6305] transition-colors">{item.name}</span>
                                            </Link>
                                            {item.selectedOption && (
                                                <span className="inline-block mt-1 text-[10px] font-bold bg-[#8A6305]/10 text-[#8A6305] border border-[#8A6305]/20 px-2 py-0.5 rounded">
                                                    {item.selectedOption}
                                                </span>
                                            )}

                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-semibold">
                                                <span className="bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-bold">
                                                    📦 {formatPackaging(item.packaging, language)}
                                                </span>
                                                {item.itemsPerPackage && (
                                                    <span>({formatPackageItems(item.itemsPerPackage, language, { mode: 'cart' })})</span>
                                                )}
                                            </div>

                                            {item.price > 0 ? (
                                                <p className="text-[#0B192C] dark:text-white font-extrabold text-xs sm:text-sm mt-1" dir="ltr">
                                                    {formatPrice(item.price)}
                                                </p>
                                            ) : (
                                                <span className="inline-block mt-1 text-[10px] font-bold text-[#8A6305] bg-[#8A6305]/10 border border-[#8A6305]/20 px-1.5 py-0.5 rounded">
                                                    {language === 'ar' ? 'السعر عند الطلب' : 'Price on Inquiry'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-white/10 h-8 px-1">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedOption)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#8A6305] transition-colors text-sm font-bold cursor-pointer"
                                                    aria-label="Decrease quantity"
                                                >-</button>
                                                <span className="px-2 text-center text-xs font-bold text-[#0B192C] dark:text-white select-none whitespace-nowrap">
                                                    {item.quantity} {formatPackaging(item.packaging, language, { short: true })}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedOption)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#8A6305] transition-colors text-sm font-bold cursor-pointer"
                                                    aria-label="Increase quantity"
                                                >+</button>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => removeItem(item.id, item.selectedOption)}
                                            className="absolute top-3 end-3 text-gray-400 hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                                            aria-label="Remove item"
                                        >
                                            <MdDelete className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-zinc-900 shrink-0 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#475569] dark:text-gray-400 font-medium">{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                            {subtotal > 0 ? (
                                <span className="font-extrabold text-[#0B192C] dark:text-white text-base" dir="ltr">{formatPrice(subtotal)}</span>
                            ) : (
                                <span className="font-bold text-[#8A6305] text-xs sm:text-sm">{language === 'ar' ? 'يحدد حسب فواتير الوكالة' : 'Determined by Agency'}</span>
                            )}
                        </div>

                        {/* Wholesale Pricing Reassurance Banner */}
                        {subtotal <= 0 && (
                            <p className="text-[11px] text-[#475569] dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/80 p-2 rounded-lg border border-gray-200/60 dark:border-white/10 text-center">
                                🏷️ {language === 'ar' ? 'الأسعار الرسمية المعتمدة تثبت على الفاتورة الورقية عند التسليم' : 'Official prices confirmed on invoice upon delivery'}
                            </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <Link
                                href="/cart"
                                onClick={closeDrawer}
                                className="w-full py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-[#8A6305]/10 hover:border-[#8A6305] border border-gray-200 dark:border-white/10 text-[#0B192C] dark:text-white text-center rounded-xl font-bold text-xs transition-colors flex items-center justify-center"
                            >
                                {language === 'ar' ? 'عرض السلة' : 'View Cart'}
                            </Link>

                            <Link
                                href="/place-order"
                                onClick={closeDrawer}
                                className="w-full py-3 bg-[#2E7D32] hover:bg-[#256628] text-white text-center rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                            >
                                <span>{language === 'ar' ? 'متابعة الطلب' : 'Proceed'}</span>
                                {dir === 'rtl' ? <MdArrowBack className="text-sm" /> : <MdArrowForward className="text-sm" />}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
