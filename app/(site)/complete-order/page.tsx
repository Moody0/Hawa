"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderSuccessHeader from '@/app/components/CompleteOrderComponents/OrderSuccessHeader';
import OrderBasicInfo from '@/app/components/CompleteOrderComponents/OrderBasicInfo';
import OrderShippingAndPayment from '@/app/components/CompleteOrderComponents/OrderShippingAndPayment';
import OrderItemsSelection from '@/app/components/CompleteOrderComponents/OrderItemsSelection';
import OrderSupportFooter from '@/app/components/CompleteOrderComponents/OrderSupportFooter';
import { RotateCw } from 'lucide-react';

import { useLanguage } from '@/app/context/LanguageContext';
import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp-utils';

interface OrderItem {
    id: string;
    options?: string | null;
    product: {
        images: string;
        name: string;
        nameAr?: string | null;
        packaging?: string | null;
        itemsPerPackage?: number | null;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    shopName?: string | null;
    Name: string;
    phone: string;
    streetAddress: string;
    city: string;
    notes?: string | null;
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
    whatsappNumber?: string;
}

const CompleteOrderContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const orderId = searchParams.get('id');
    const isQuoteRequest = searchParams.get('quote') === '1';
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const token = searchParams.get('token');
                const fetchUrl = token
                    ? `/api/orders/${orderId}?token=${encodeURIComponent(token)}`
                    : `/api/orders/${orderId}`;
                const response = await fetch(fetchUrl);
                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);

                    // Promptly remove token from URL so it does not linger in browser history or referrer headers
                    if (token && typeof window !== "undefined" && window.history.replaceState) {
                        const cleanUrl = new URL(window.location.href);
                        cleanUrl.searchParams.delete("token");
                        window.history.replaceState({}, "", cleanUrl.pathname + cleanUrl.search);
                    }
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router, searchParams]);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center min-h-[60vh]">
                <RotateCw className="animate-spin text-zinc-900 dark:text-white text-4xl" />
            </div>
        );
    }

    if (!order) return null;

    const waMessage = generateWhatsAppOrderMessage({
        id: order.id,
        shopName: order.shopName,
        Name: order.Name,
        phone: order.phone,
        city: order.city,
        streetAddress: order.streetAddress,
        notes: order.notes,
        totalAmount: order.totalAmount,
        isQuoteRequest,
        showPrices: !isQuoteRequest,
        items: order.items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            options: item.options || null,
            product: item.product
        }))
    });

    const targetNumber = order.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const whatsappUrl = buildWhatsAppUrl(targetNumber, waMessage);

    return (
        <div className="flex-grow w-full max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
            <OrderSuccessHeader isQuoteRequest={isQuoteRequest} />

            {/* Prominent WhatsApp Dispatch / Fallback Card */}
            <div className="w-full bg-[#25D366]/10 dark:bg-[#25D366]/15 border border-[#25D366]/30 rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                <div className="flex items-center gap-4 text-center md:ltr:text-left md:rtl:text-right">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shrink-0 text-2xl md:text-3xl shadow-md">
                        <FaWhatsapp />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-extrabold text-zinc-900 dark:text-white">
                            {t('checkout.sendViaWhatsapp')}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                            {language === 'ar'
                                ? 'أرسل تفاصيل الطلب مباشرة إلى مسؤول المبيعات والتوزيع عبر واتساب لتسريع التجهيز'
                                : 'Send order details directly to our sales & distribution team via WhatsApp for fast processing'}
                        </p>
                    </div>
                </div>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold rounded-xl flex items-center justify-center gap-2.5 text-sm md:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
                >
                    <FaWhatsapp className="text-xl" />
                    <span>{t('checkout.resendViaWhatsapp')}</span>
                </a>
            </div>

            <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                <OrderBasicInfo
                    orderId={order.id}
                    totalAmount={order.totalAmount}
                    isQuoteRequest={isQuoteRequest}
                />

                <OrderShippingAndPayment
                    shopName={order.shopName}
                    name={order.Name}
                    streetAddress={order.streetAddress}
                    city={order.city}
                    phone={order.phone}
                    notes={order.notes}
                    isQuoteRequest={isQuoteRequest}
                />

                <OrderItemsSelection
                    items={order.items}
                    showPrices={!isQuoteRequest}
                />
            </div>

            <OrderSupportFooter />
        </div>
    );
};

const Page = () => {
    return (
        <Suspense fallback={
            <div className="flex-grow flex items-center justify-center min-h-[60vh]">
                <RotateCw className="animate-spin text-zinc-900 dark:text-white text-4xl" />
            </div>
        }>
            <CompleteOrderContent />
        </Suspense>
    );
};

export default Page;
