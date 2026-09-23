"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { X, User, MapPin, Package, RefreshCw, Trash2, Store, FileText, Save } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { cleanWhatsAppNumber } from "@/lib/whatsapp-utils";
import { formatPackaging } from "@/lib/packaging";
import { formatOrderNumber } from "@/lib/order-number";
import { updateOrderPricing } from "../../../../lib/admin-actions";

interface Order {
    id: string;
    orderNumber: number;
    shopName?: string | null;
    Name: string;
    phone: string;
    streetAddress: string;
    city: string;
    notes?: string | null;
    cancellationReason?: string | null;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: {
        id: string;
        quantity: number;
        price: number;
        options?: string | null;
        product: {
            name: string;
            nameAr?: string | null;
            nameEn?: string | null;
            images: string;
            packaging?: string | null;
            itemsPerPackage?: string | number | null;
        } | null;
    }[];
}

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    canDelete?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    canManage?: boolean;
    onPricingSaved?: (result: { totalAmount: number; itemPrices: Array<{ itemId: string; price: number }> }) => void;
}

export default function OrderDetailsModal({ isOpen, onClose, order, canDelete, onDelete, isDeleting, canManage, onPricingSaved }: OrderDetailsModalProps) {
    const { t, dir, language } = useLanguage();
    const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
    const [isSavingPrices, setIsSavingPrices] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !order) return;
        setPriceDrafts(Object.fromEntries(order.items.map((item) => [
            item.id,
            item.price > 0 ? item.price.toFixed(2) : "",
        ])));
    }, [isOpen, order?.id, order?.items]);

    if (!isOpen || !order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'emerald';
            case 'PROCESSING': return 'blue';
            case 'PENDING': return 'amber';
            case 'CANCELLED': return 'red';
            case 'SHIPPED': return 'blue';
            default: return 'gray';
        }
    };

    const statusColor = getStatusColor(order.status);
    const canEditPrices = Boolean(canManage && (order.status === "PENDING" || order.status === "CONTACTED"));
    const getDraftPrice = (itemId: string, currentPrice: number) => priceDrafts[itemId] ?? (currentPrice > 0 ? currentPrice.toFixed(2) : "");
    const priceInputs = order.items.map((item) => ({ itemId: item.id, price: Number(getDraftPrice(item.id, item.price)) }));
    const hasValidPriceDrafts = order.items.length > 0 && priceInputs.every((item) => Number.isFinite(item.price) && item.price > 0);
    const hasPriceChanges = order.items.some((item) => Number(getDraftPrice(item.id, item.price)) !== item.price);
    const quotePreviewTotal = priceInputs.reduce((sum, item, index) =>
        sum + (Number.isFinite(item.price) && item.price > 0 ? item.price * order.items[index].quantity : 0), 0);
    const productName = (product: NonNullable<Order['items'][number]['product']>) =>
        (language === 'ar' ? product.nameAr : product.nameEn) || product.name;

    const handleSavePrices = async () => {
        if (!hasValidPriceDrafts || isSavingPrices) return;
        setIsSavingPrices(true);
        try {
            const result = await updateOrderPricing(order.id, priceInputs);
            if (!result.success) {
                const message = result.error === "orderPricingLocked"
                    ? (language === "ar" ? "لا يمكن تعديل الأسعار بعد بدء تجهيز الطلب." : "Prices can’t be changed after order preparation begins.")
                    : result.error === "orderNotFound"
                        ? (language === "ar" ? "الطلب غير موجود." : "Order not found.")
                        : (language === "ar" ? "تعذر حفظ الأسعار. تحقق من إدخال سعر لكل منتج." : "Could not save prices. Enter a valid price for every item.");
                toast.error(message);
                return;
            }

            setPriceDrafts(Object.fromEntries(result.itemPrices.map((item) => [item.itemId, item.price.toFixed(2)])));
            onPricingSaved?.({ totalAmount: result.totalAmount, itemPrices: result.itemPrices });
            toast.success(language === "ar" ? "تم حفظ الأسعار وتحديث إجمالي الطلب." : "Prices saved and order total updated.");
        } catch (error) {
            console.error("Failed to save order prices:", error);
            toast.error(language === "ar" ? "تعذر حفظ الأسعار." : "Could not save order prices.");
        } finally {
            setIsSavingPrices(false);
        }
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-text-main/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
                    <div>
                        <h3 id="order-details-title" className="text-xl font-extrabold text-text-main dark:text-white tracking-tight">
                            {t('admin.orderDetails')}
                        </h3>
                        <p className="text-xs text-text-sub dark:text-gray-400 font-medium">
                            {formatOrderNumber(order.orderNumber)} • {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={language === "ar" ? "إغلاق" : "Close"}
                        className="p-2 text-text-sub dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                        <X className="text-[24px]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Status & Total */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-background-light dark:bg-gray-800/50 border border-black/[0.04] dark:border-white/[0.04]">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-sub dark:text-slate-400">{t('admin.currentStatus')}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor === "blue" ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50" :
                                statusColor === "amber" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50" :
                                    statusColor === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" :
                                        statusColor === "red" ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50" :
                                            "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-white/[0.04]"
                                }`}>
                                {t(`admin.${order.status.toLowerCase()}`)}
                            </span>
                        </div>
                        <div className={`space-y-1 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-sub dark:text-slate-400">{t('admin.totalAmount')}</p>
                            {order.totalAmount > 0 ? (
                                <p className="text-2xl font-black text-primary" dir="ltr">${order.totalAmount.toFixed(2)}</p>
                            ) : (
                                <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                    {t('admin.priceOnInquiry')}
                                </span>
                            )}
                            {canEditPrices && hasValidPriceDrafts && (
                                <p className="text-xs font-semibold text-text-sub dark:text-gray-400" dir="ltr">
                                    {language === "ar" ? "الإجمالي بعد التسعير:" : "Quote preview:"} ${quotePreviewTotal.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Customer & Shop Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 flex items-center gap-2">
                                <User className="text-primary text-[18px]" />
                                {t('admin.customerInformation')}
                            </h4>
                            <div className={`space-y-1.5 ${dir === 'rtl' ? 'me-6' : 'ms-6'}`}>
                                {order.shopName && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                            <Store className="text-base" />
                                        </span>
                                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            {order.shopName}
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs font-medium text-text-main dark:text-slate-200">{order.Name}</p>
                                <p className="text-sm text-text-sub dark:text-gray-400 font-mono" dir="ltr">{order.phone}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 flex items-center gap-2">
                                <MapPin className="text-primary text-[18px]" />
                                {t('admin.shippingAddress')}
                            </h4>
                            <div className={`space-y-1 ${dir === 'rtl' ? 'me-6' : 'ms-6'}`}>
                                <p className="text-sm text-text-sub dark:text-gray-400 leading-relaxed">
                                    {order.streetAddress}<br />
                                    {order.city}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Notes */}
                    {order.notes && order.notes.trim() && (
                        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                                <FileText className="text-base" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t('admin.orderNotes')}</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed ps-6 whitespace-pre-wrap">
                                {order.notes}
                            </p>
                        </div>
                    )}

                    {order.status === "CANCELLED" && order.cancellationReason && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                                {language === "ar" ? "سبب إلغاء الطلب المرسل للعميل" : "Cancellation reason shown to customer"}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{order.cancellationReason}</p>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 flex items-center gap-2">
                                <Package className="text-primary text-[18px]" />
                                {t('admin.itemsCount').replace('{count}', order.items.length.toString())}
                            </h4>
                            {canEditPrices && (
                                <p className="text-xs text-text-sub dark:text-gray-400 ps-6">
                                    {language === "ar"
                                        ? "أدخل سعر الوحدة بالدولار لكل منتج واحفظه قبل نقل الطلب إلى قيد التجهيز. سيظهر للعميل بالليرة حسب سعر الصرف المعتمد."
                                        : "Enter each unit price in USD and save before moving the order to Processing. Customers see the converted SYP price."}
                                </p>
                            )}
                        </div>
                        <div className="border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden">
                            <table className="w-full text-start border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-black/[0.04] dark:border-white/[0.04]">
                                        <th className={`p-3 text-[10px] font-bold uppercase tracking-wider text-text-sub dark:text-slate-400 ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.product')}</th>
                                        <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-text-sub dark:text-slate-400 text-center">{t('admin.qty')}</th>
                                        <th className={`p-3 text-[10px] font-bold uppercase tracking-wider text-text-sub dark:text-slate-400 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>{t('admin.price')}</th>
                                        <th className={`p-3 text-[10px] font-bold uppercase tracking-wider text-text-sub dark:text-slate-400 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>{t('admin.total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] dark:divide-gray-700">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shrink-0">
                                                        <img
                                                            src={item.product?.images ? item.product.images.split(',').map((img: string) => img.trim()).filter(Boolean)[0] : '/placeholder.jpg'}
                                                            alt={item.product ? productName(item.product) : t('admin.deletedProduct')}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-text-main dark:text-white line-clamp-1">
                                                            {item.product ? productName(item.product) : t('admin.deletedProduct')}
                                                        </span>
                                                        {item.options && (
                                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                                                {item.options}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="text-xs font-bold text-text-main dark:text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-text-sub dark:text-gray-400">
                                                        {formatPackaging(item.product?.packaging, language)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={`p-3 text-xs font-medium text-text-sub dark:text-gray-400 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>
                                                {canEditPrices ? (
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        max="99999999.99"
                                                        step="0.01"
                                                        inputMode="decimal"
                                                        dir="ltr"
                                                        aria-label={language === "ar"
                                                            ? `سعر الوحدة بالدولار للمنتج ${item.product ? productName(item.product) : t('admin.deletedProduct')}`
                                                            : `Unit price in USD for ${item.product ? productName(item.product) : t('admin.deletedProduct')}`}
                                                        value={getDraftPrice(item.id, item.price)}
                                                        onChange={(event) => setPriceDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                                                        placeholder={language === "ar" ? "السعر بالدولار" : "Unit price (USD)"}
                                                        className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-end text-xs font-bold text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                                    />
                                                ) : Number(item.price) > 0 ? (
                                                    `$${Number(item.price).toFixed(2)}`
                                                ) : (
                                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{t('admin.priceOnInquiry')}</span>
                                                )}
                                            </td>
                                            <td className={`p-3 text-xs font-black text-text-main dark:text-white ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>
                                                {canEditPrices
                                                    ? (Number(getDraftPrice(item.id, item.price)) > 0
                                                        ? `$${(Number(getDraftPrice(item.id, item.price)) * item.quantity).toFixed(2)}`
                                                        : "—")
                                                    : Number(item.price) > 0
                                                        ? `$${(Number(item.price) * item.quantity).toFixed(2)}`
                                                        : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 bg-gray-50/50 dark:bg-black/20 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-wrap items-center gap-3 ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                    {canEditPrices && (
                        <button
                            type="button"
                            onClick={handleSavePrices}
                            disabled={!hasValidPriceDrafts || !hasPriceChanges || isSavingPrices}
                            className="h-10 px-4 rounded-xl font-bold text-xs md:text-sm bg-[#0B192C] hover:bg-[#1e293b] dark:bg-primary text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSavingPrices ? <RefreshCw className="text-base animate-spin" /> : <Save className="text-base" />}
                            <span>{language === "ar" ? "حفظ الأسعار" : "Save Prices"}</span>
                        </button>
                    )}
                    {order.phone && (
                        <a
                            href={`https://wa.me/${cleanWhatsAppNumber(order.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 px-4 rounded-xl font-bold text-xs md:text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2 shadow-xs"
                        >
                            <FaWhatsapp className="text-base md:text-lg" />
                            <span>{t('admin.contactWhatsApp')}</span>
                        </a>
                    )}
                    {canDelete && onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="h-10 px-4 rounded-xl font-bold text-xs md:text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <RefreshCw className="text-[18px] animate-spin" />
                            ) : (
                                <Trash2 className="text-[18px]" />
                            )}
                            {t('admin.deleteOrder')}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-primary hover:bg-primary/90 text-white h-10 px-6 rounded-xl font-bold text-xs md:text-sm transition-all transform hover:-translate-y-0.5"
                    >
                        {t('admin.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
