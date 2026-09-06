"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CheckoutSteps from '@/app/components/PlaceOrderComponents/CheckoutSteps';
import ShippingForm from '@/app/components/PlaceOrderComponents/ShippingForm';
import OrderSummary from '@/app/components/PlaceOrderComponents/OrderSummary';
import { validatePromoCode } from '@/lib/admin-actions';

import { useLanguage } from '@/app/context/LanguageContext';
import { useCustomer } from '@/app/context/CustomerContext';
import { generateWhatsAppOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp-utils';

const PlaceOrderPage = () => {
    const { items, subtotal, clearCart } = useCart();
    const { customer } = useCustomer();
    const { t, language } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        shopName: customer?.shopName || '',
        ownerName: customer?.ownerName || '',
        phone: customer?.phone || '',
        streetAddress: customer?.address || '',
        city: customer?.city || '',
        notes: customer?.notes || ''
    });

    useEffect(() => {
        if (customer) {
            setFormData(prev => ({
                ...prev,
                shopName: prev.shopName || customer.shopName || '',
                ownerName: prev.ownerName || customer.ownerName || '',
                phone: prev.phone || customer.phone || '',
                streetAddress: prev.streetAddress || customer.address || '',
                city: prev.city || customer.city || '',
                notes: prev.notes || customer.notes || '',
            }));
        }
    }, [customer]);

    const [promoDetails, setPromoDetails] = useState<{ id: string, percentage: number } | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Recalculate discount if subtotal changes (though subtotal shouldn't change here usually)
    useEffect(() => {
        if (promoDetails) {
            setDiscountAmount((subtotal * promoDetails.percentage) / 100);
        } else {
            setDiscountAmount(0);
        }
    }, [subtotal, promoDetails]);

    const total = Math.max(0, subtotal - discountAmount);

    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (items.length === 0 && !loading && !isSuccess) {
            router.push('/cart');
        }
    }, [items, router, loading, isSuccess]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Prevent non-numeric input for phone
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateSyrianPhone = (phone: string) => {
        // Syrian mobile numbers are 10 digits and start with 09
        const syrianPhoneRegex = /^09\d{8}$/;
        return syrianPhoneRegex.test(phone);
    };

    const handleApplyPromo = async (code: string) => {
        const result = await validatePromoCode(code);
        if (result.success && result.promoCode) {
            setPromoDetails({
                id: result.promoCode.id,
                percentage: result.promoCode.discountPercentage
            });
            return { success: true, message: `Applied ${result.promoCode.discountPercentage}% discount!` };
        }
        setPromoDetails(null);
        return { success: false, message: result.error };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.shopName.trim() || !formData.ownerName.trim() || !formData.phone.trim() || !formData.streetAddress.trim() || !formData.city.trim()) {
            toast.error(language === 'ar' ? "يرجى تعبئة جميع الحقول المطلوبة (اسم المحل، الاسم، الهاتف، المحافظة، العنوان)" : "Please fill in all required fields");
            return;
        }

        // Validate Syrian Phone Number
        if (!validateSyrianPhone(formData.phone)) {
            toast.error(language === 'ar' ? "يرجى إدخال رقم موبايل سوري صالح (09xxxxxxxx)" : "Please enter a valid Syrian mobile number (09xxxxxxxx)");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopName: formData.shopName.trim(),
                    ownerName: formData.ownerName.trim(),
                    phone: formData.phone.trim(),
                    streetAddress: formData.streetAddress.trim(),
                    city: formData.city.trim(),
                    notes: formData.notes.trim() || null,
                    customerId: customer?.id || null,
                    totalAmount: parseFloat(total.toFixed(2)),
                    promoCodeId: promoDetails?.id,
                    discount: parseFloat(discountAmount.toFixed(2)),
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        options: item.selectedOption || null
                    }))
                })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(language === 'ar' ? "تم تسجيل الطلب بنجاح! جاري التوجيه إلى واتساب..." : "Order placed successfully! Redirecting to WhatsApp...");
                setIsSuccess(true);

                // Prepare WhatsApp message
                const waMessage = generateWhatsAppOrderMessage({
                    id: data.id,
                    shopName: formData.shopName,
                    Name: formData.ownerName,
                    phone: formData.phone,
                    city: formData.city,
                    streetAddress: formData.streetAddress,
                    notes: formData.notes,
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
                router.push(`/complete-order?id=${data.id}`);
            } else {
                const error = await response.json();
                toast.error(error.message || (language === 'ar' ? "فشل في تسجيل الطلب" : "Failed to place order"));
            }
        } catch (error) {
            console.error("Order error:", error);
            toast.error(language === 'ar' ? "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" : "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="grow w-full mx-auto container-custom py-4 lg:py-8">
            {!customer && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800/80 border border-[#8A6305]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0B192C] dark:text-white font-bold">
                        <span className="text-base">🔒</span>
                        <span>{language === 'ar' ? 'أنت تتصفح كضيف. للحصول على أسعار الجملة الرسمية وتثبيت حساب محلك، يمكنك تسجيل الدخول.' : 'You are currently ordering as a guest. Sign in to your merchant account to lock wholesale rates.'}</span>
                    </div>
                    <Link
                        href="/account/login"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B192C] hover:bg-[#8A6305] text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                    >
                        <span>{language === 'ar' ? 'تسجيل دخول التاجر' : 'Merchant Login'}</span>
                    </Link>
                </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <CheckoutSteps />
                    <ShippingForm formData={formData} handleInputChange={handleInputChange} />
                </div>
                <div className="lg:col-span-5">
                    <OrderSummary
                        items={items}
                        subtotal={subtotal}
                        total={total}
                        loading={loading}
                        discount={discountAmount}
                        onApplyPromo={handleApplyPromo}
                    />
                </div>
            </form>
        </main>
    );
};

export default PlaceOrderPage;
