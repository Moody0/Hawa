"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CheckoutSteps from '@/app/components/PlaceOrderComponents/CheckoutSteps';
import ShippingForm, { ShippingFormData, ShippingFormErrors, SubmissionFeedback } from '@/app/components/PlaceOrderComponents/ShippingForm';
import OrderSummary from '@/app/components/PlaceOrderComponents/OrderSummary';

import { useLanguage } from '@/app/context/LanguageContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { generateWhatsAppOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp-utils';
import { validateOrderForm, findGovernorate, normalizeSyrianPhone } from '@/lib/order-validation';

function PlaceOrderSkeleton() {
    return (
        <div className="grow w-full bg-[#F6F7F9] dark:bg-[#081524]">
            <div className="mx-auto container-custom py-5 lg:py-8">
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8 animate-pulse">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="h-14 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-900" />
                        <div className="h-[460px] rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-900 p-6 space-y-5">
                            <div className="h-6 w-48 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-10 rounded-lg bg-slate-100 dark:bg-zinc-800/60" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-10 rounded-lg bg-slate-100 dark:bg-zinc-800/60" />
                                <div className="h-10 rounded-lg bg-slate-100 dark:bg-zinc-800/60" />
                            </div>
                            <div className="h-10 rounded-lg bg-slate-100 dark:bg-zinc-800/60" />
                            <div className="h-12 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="h-[380px] rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-900 p-6 space-y-4">
                            <div className="h-6 w-36 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-28 rounded-lg bg-slate-100 dark:bg-zinc-800/60" />
                            <div className="h-16 rounded bg-slate-100 dark:bg-zinc-800/60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PlaceOrderPage = () => {
    const { items, subtotal, clearCart, isHydrated } = useCart();
    const { customer, isLoading: isCustomerLoading } = useCustomer();
    const { language } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submissionFeedback, setSubmissionFeedback] = useState<SubmissionFeedback | null>(null);

    // Stable idempotency key for submission and retries (Phase 3.5 & 6.3)
    const idempotencyKeyRef = useRef<string>('');
    if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    const isAr = language === 'ar';

    const [formData, setFormData] = useState<ShippingFormData>({
        shopName: customer?.shopName || '',
        ownerName: customer?.ownerName || '',
        phone: customer?.phone ? normalizeSyrianPhone(customer.phone) : '',
        streetAddress: customer?.address || '',
        city: customer?.city ? (findGovernorate(customer.city)?.key || 'Homs') : 'Homs',
        notes: customer?.notes || ''
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<ShippingFormErrors>({});

    // Populate and normalize customer data when customer session loads
    useEffect(() => {
        if (customer) {
            setFormData(prev => ({
                ...prev,
                shopName: prev.shopName || customer.shopName || '',
                ownerName: prev.ownerName || customer.ownerName || '',
                phone: prev.phone || (customer.phone ? normalizeSyrianPhone(customer.phone) : ''),
                streetAddress: prev.streetAddress || customer.address || '',
                city: prev.city || (customer.city ? (findGovernorate(customer.city)?.key || 'Homs') : 'Homs'),
                notes: prev.notes || customer.notes || '',
            }));
        }
    }, [customer]);

    const hasConfirmedPricing = Boolean(customer) && items.length > 0 && items.every((item) => Number(item.price) > 0);
    const isQuoteRequest = !hasConfirmedPricing;
    const total = subtotal;

    // Redirect to cart if empty - only after cart hydration completes
    useEffect(() => {
        if (!isHydrated) return;
        if (items.length === 0 && !loading && !isSuccess) {
            router.push('/cart');
        }
    }, [isHydrated, items, router, loading, isSuccess]);

    const validateField = useCallback((name: string, value: string, currentForm: ShippingFormData) => {
        const updatedForm = { ...currentForm, [name]: value };
        const validation = validateOrderForm(updatedForm, isAr ? 'ar' : 'en');
        return validation.errors[name as keyof ShippingFormErrors];
    }, [isAr]);

    if (!isHydrated) {
        return <PlaceOrderSkeleton />;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let cleanedValue = value;
        if (name === 'phone') {
            cleanedValue = normalizeSyrianPhone(value).slice(0, 10);
        }

        const nextFormData = { ...formData, [name]: cleanedValue };
        setFormData(nextFormData);

        // Update live validation if touched
        if (touched[name]) {
            const fieldError = validateField(name, cleanedValue, nextFormData);
            setErrors(prev => ({ ...prev, [name]: fieldError }));
        }
    };

    const handleBlur = (field: keyof ShippingFormData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const fieldError = validateField(field, formData[field] || '', formData);
        setErrors(prev => ({ ...prev, [field]: fieldError }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setSubmissionFeedback(null);

        // 1. Validate all fields
        const validation = validateOrderForm(formData, isAr ? 'ar' : 'en');
        if (!validation.isValid) {
            setErrors(validation.errors);
            // Mark all fields as touched so errors display immediately
            setTouched({
                shopName: true,
                ownerName: true,
                phone: true,
                city: true,
                streetAddress: true,
                notes: true,
            });

            const firstErrorKey = Object.keys(validation.errors)[0] as keyof ShippingFormData;
            const firstErrorMsg = validation.errors[firstErrorKey] || (isAr ? 'يرجى تصحيح الأخطاء قبل إرسال الطلب' : 'Please correct errors before submitting');
            setSubmissionFeedback({
                category: 'validation',
                message: firstErrorMsg,
            });
            toast.error(firstErrorMsg);

            // Smoothly focus first invalid input
            const element = document.getElementById(`field-${firstErrorKey}`);
            if (element) {
                element.focus();
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (items.length === 0) {
            toast.error(isAr ? 'سلة المشتريات فارغة' : 'Your cart is empty');
            return;
        }

        setLoading(true);
        try {
            const cleanData = validation.cleanData;
            const currentIdempotencyKey = idempotencyKeyRef.current;
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': currentIdempotencyKey,
                },
                body: JSON.stringify({
                    idempotencyKey: currentIdempotencyKey,
                    shopName: cleanData.shopName,
                    ownerName: cleanData.ownerName,
                    phone: cleanData.phone,
                    streetAddress: cleanData.streetAddress,
                    city: cleanData.city,
                    notes: cleanData.notes || null,
                    customerId: customer?.id || null,
                    totalAmount: isQuoteRequest ? 0 : parseFloat(total.toFixed(2)),
                    discount: 0,
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
                        price: Number(item.price) || 0,
                        options: item.selectedOption || null
                    }))
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Generate a fresh key for subsequent distinct orders
                idempotencyKeyRef.current = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                setSubmissionFeedback(null);
                toast.success(
                    isQuoteRequest
                        ? (isAr ? "تم إرسال طلب الجملة للمراجعة" : "Wholesale request sent for review")
                        : (isAr ? "تم تسجيل الطلب بنجاح" : "Order placed successfully")
                );
                setIsSuccess(true);

                // Prepare WhatsApp message
                const waMessage = generateWhatsAppOrderMessage({
                    id: data.id,
                    shopName: cleanData.shopName,
                    Name: cleanData.ownerName,
                    phone: cleanData.phone,
                    city: cleanData.city,
                    streetAddress: cleanData.streetAddress,
                    notes: cleanData.notes,
                    totalAmount: isQuoteRequest ? 0 : total,
                    isQuoteRequest,
                    showPrices: !isQuoteRequest,
                    items: items.map(item => ({
                        quantity: item.quantity,
                        price: item.price,
                        options: item.selectedOption || null,
                        product: {
                            name: item.name,
                            nameAr: item.name,
                            packaging: item.packaging || 'طرد',
                            itemsPerPackage: item.itemsPerPackage || null,
                        }
                    }))
                });

                const targetNumber = data.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963993443901';
                const whatsappUrl = buildWhatsAppUrl(targetNumber, waMessage);

                // Open WhatsApp
                try {
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                } catch (err) {
                    console.error("Popup blocker prevented opening WhatsApp:", err);
                }

                clearCart();
                const quoteParam = isQuoteRequest ? '&quote=1' : '';
                const redirectUrl = data.orderToken
                    ? `/complete-order?id=${data.id}&token=${encodeURIComponent(data.orderToken)}${quoteParam}`
                    : `/complete-order?id=${data.id}${quoteParam}`;
                router.push(redirectUrl);
            } else {
                const error = await response.json().catch(() => ({}));
                if (error.errors) {
                    setErrors(error.errors);
                }

                let category: SubmissionFeedback['category'] = 'server';
                let feedbackMsg = error.message || (isAr ? "فشل في تسجيل الطلب، يرجى المحاولة مرة أخرى" : "Failed to place order");

                if (response.status === 401 || response.status === 403) {
                    category = 'session';
                    feedbackMsg = isAr ? "انتهت صلاحية جلسة الحساب أو الحساب غير مصرح له بتأكيد الطلب." : "Session expired or unauthorized.";
                } else if (response.status === 409 || error.error === 'INSUFFICIENT_STOCK' || /المتوفرة|المخزون|الكمية/.test(feedbackMsg)) {
                    category = 'stock';
                } else if (response.status === 400 || error.error === 'VALIDATION_ERROR') {
                    category = 'validation';
                } else if (response.status >= 500) {
                    category = 'server';
                }

                setSubmissionFeedback({
                    category,
                    message: feedbackMsg,
                    details: error.error,
                });
                toast.error(feedbackMsg);
            }
        } catch (error) {
            console.error("Order error:", error);
            const netMsg = isAr
                ? "تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت وإعادة المحاولة."
                : "Network connection failed. Please check your connection and retry.";
            setSubmissionFeedback({
                category: 'network',
                message: netMsg,
            });
            toast.error(netMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grow w-full bg-[#F6F7F9] dark:bg-[#081524]">
            <div className="mx-auto container-custom py-5 lg:py-8">
            {!isCustomerLoading && !customer && (
                <div className="mb-6 flex flex-col items-start justify-between gap-3 border-y border-[#8A6305]/25 bg-white px-4 py-3 sm:flex-row sm:items-center dark:bg-[#101E32]">
                    <p className="text-xs sm:text-sm text-[#334155] dark:text-slate-200">
                        <span className="font-bold text-[#0B192C] dark:text-white">{isAr ? 'الأسعار التجارية متاحة للحسابات المعتمدة.' : 'Trade pricing is available to approved accounts.'}</span>
                        {' '}
                        {isAr ? 'يمكنك المتابعة الآن كطلب توريد للمراجعة.' : 'You can continue now as a wholesale request for review.'}
                    </p>
                    <Link
                        href="/account/login"
                        className="inline-flex min-h-10 shrink-0 items-center border border-[#0B192C] px-4 text-xs font-bold text-[#0B192C] transition-colors hover:bg-[#0B192C] hover:text-white dark:border-white/60 dark:text-white dark:hover:bg-white dark:hover:text-[#0B192C]"
                    >
                        <span>{isAr ? 'تسجيل دخول التاجر' : 'Merchant Login'}</span>
                    </Link>
                </div>
            )}
            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-7">
                    <CheckoutSteps isQuoteRequest={isQuoteRequest} />
                    <ShippingForm 
                        formData={formData} 
                        errors={errors}
                        touched={touched}
                        handleInputChange={handleInputChange} 
                        handleBlur={handleBlur}
                        loading={loading}
                        itemsCount={items.length}
                        isQuoteRequest={isQuoteRequest}
                        submissionFeedback={submissionFeedback}
                    />
                </div>
                <div className="lg:col-span-5">
                    <OrderSummary
                        items={items}
                        subtotal={subtotal}
                        total={total}
                        isQuoteRequest={isQuoteRequest}
                    />
                </div>
            </form>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
