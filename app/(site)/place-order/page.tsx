"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CheckoutSteps from '@/app/components/PlaceOrderComponents/CheckoutSteps';
import ShippingForm, { ShippingFormData, ShippingFormErrors } from '@/app/components/PlaceOrderComponents/ShippingForm';
import OrderSummary from '@/app/components/PlaceOrderComponents/OrderSummary';

import { useLanguage } from '@/app/context/LanguageContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { generateWhatsAppOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp-utils';
import { validateOrderForm, findGovernorate, normalizeSyrianPhone } from '@/lib/order-validation';

const PlaceOrderPage = () => {
    const { items, subtotal, clearCart } = useCart();
    const { customer } = useCustomer();
    const { language } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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

    const total = subtotal;

    // Redirect to cart if empty
    useEffect(() => {
        if (items.length === 0 && !loading && !isSuccess) {
            router.push('/cart');
        }
    }, [items, router, loading, isSuccess]);

    const validateField = useCallback((name: string, value: string, currentForm: ShippingFormData) => {
        const updatedForm = { ...currentForm, [name]: value };
        const validation = validateOrderForm(updatedForm, isAr ? 'ar' : 'en');
        return validation.errors[name as keyof ShippingFormErrors];
    }, [isAr]);

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
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopName: cleanData.shopName,
                    ownerName: cleanData.ownerName,
                    phone: cleanData.phone,
                    streetAddress: cleanData.streetAddress,
                    city: cleanData.city,
                    notes: cleanData.notes || null,
                    customerId: customer?.id || null,
                    totalAmount: parseFloat(total.toFixed(2)),
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
                toast.success(isAr ? "تم تسجيل الطلب بنجاح! جاري التوجيه إلى واتساب..." : "Order placed successfully! Redirecting to WhatsApp...");
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
                    totalAmount: total,
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
                const redirectUrl = data.orderToken
                    ? `/complete-order?id=${data.id}&token=${encodeURIComponent(data.orderToken)}`
                    : `/complete-order?id=${data.id}`;
                router.push(redirectUrl);
            } else {
                const error = await response.json();
                if (error.errors) {
                    setErrors(error.errors);
                }
                toast.error(error.message || (isAr ? "فشل في تسجيل الطلب" : "Failed to place order"));
            }
        } catch (error) {
            console.error("Order error:", error);
            toast.error(isAr ? "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" : "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grow w-full mx-auto container-custom py-4 lg:py-8">
            {!customer && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800/80 border border-[#8A6305]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0B192C] dark:text-white font-bold">
                        <span className="text-base">🔒</span>
                        <span>{isAr ? 'أنت تتصفح كضيف. للحصول على أسعار الجملة الرسمية وتثبيت حساب محلك، يمكنك تسجيل الدخول.' : 'You are currently ordering as a guest. Sign in to your merchant account to lock wholesale rates.'}</span>
                    </div>
                    <Link
                        href="/account/login"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#8A6305] text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                    >
                        <span>{isAr ? 'تسجيل دخول التاجر' : 'Merchant Login'}</span>
                    </Link>
                </div>
            )}
            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <CheckoutSteps />
                    <ShippingForm 
                        formData={formData} 
                        errors={errors}
                        touched={touched}
                        handleInputChange={handleInputChange} 
                        handleBlur={handleBlur}
                    />
                </div>
                <div className="lg:col-span-5">
                    <OrderSummary
                        items={items}
                        subtotal={subtotal}
                        total={total}
                        loading={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default PlaceOrderPage;
