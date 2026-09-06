'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '@/app/context/CustomerContext';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import ResilientImage from '@/app/components/ResilientImage';
import toast from 'react-hot-toast';
import { 
    MdStore, 
    MdPerson, 
    MdPhone, 
    MdLocationOn, 
    MdShoppingBag, 
    MdFavorite, 
    MdRepeat, 
    MdTimeline, 
    MdEdit, 
    MdLogout, 
    MdCheckCircle, 
    MdSchedule, 
    MdLocalShipping,
    MdWhatsapp
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

interface OrderItemProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    slug: string;
    images: string;
    price: number;
    discountPrice?: number | null;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
    hidePrice?: boolean;
    brand?: { name: string; slug: string } | null;
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    options?: string | null;
    product: OrderItemProduct;
}

interface CustomerOrder {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    streetAddress: string;
    city: string;
    notes?: string | null;
    items: OrderItem[];
}

export default function MerchantPortalPage() {
    const router = useRouter();
    const { customer, isLoading, logout, updateProfile } = useCustomer();
    const { addItem, openDrawer } = useCart();
    const { language } = useLanguage();
    const isArabic = language === 'ar';

    const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'track'>('orders');
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        shopName: '',
        ownerName: '',
        city: '',
        address: '',
        notes: '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963900000000';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    // Redirect guest to login
    useEffect(() => {
        if (!isLoading && !customer) {
            router.push('/account/login');
        } else if (customer) {
            setProfileForm({
                shopName: customer.shopName || '',
                ownerName: customer.ownerName || '',
                city: customer.city || '',
                address: customer.address || '',
                notes: customer.notes || '',
            });
        }
    }, [isLoading, customer, router]);

    // Fetch Orders
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch('/api/customer/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Error fetching customer orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Fetch Wishlist
    const fetchWishlist = async () => {
        setWishlistLoading(true);
        try {
            const res = await fetch('/api/customer/wishlist');
            if (res.ok) {
                const data = await res.json();
                setWishlistProducts(data.products || []);
            }
        } catch (err) {
            console.error('Error fetching wishlist products:', err);
        } finally {
            setWishlistLoading(false);
        }
    };

    useEffect(() => {
        if (customer) {
            fetchOrders();
            fetchWishlist();
        }
    }, [customer]);

    // Re-order handler: adds all items of past order into cart
    const handleReorder = (order: CustomerOrder) => {
        let addedCount = 0;
        order.items.forEach((item) => {
            if (item.product) {
                const primaryImage = item.product.images?.split(',')[0]?.trim() || '';
                addItem({
                    id: item.product.id,
                    name: (isArabic ? item.product.nameAr : item.product.name) || item.product.name,
                    price: Number(item.price || 0),
                    image: primaryImage,
                    quantity: item.quantity,
                    slug: item.product.slug,
                    packaging: item.product.packaging || 'طرد',
                    itemsPerPackage: item.product.itemsPerPackage || null,
                });
                addedCount++;
            }
        });

        toast.success(
            isArabic 
                ? `تمت إضافة ${addedCount} أصناف من الطلبية السابقة إلى السلة بنجاح!` 
                : `Added ${addedCount} items from previous order to cart!`
        );
        openDrawer();
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        const res = await updateProfile(profileForm);
        setIsSavingProfile(false);
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PENDING':
                return {
                    label: isArabic ? 'جديد (بانتظار التأكيد)' : 'Pending',
                    bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
                    icon: MdSchedule,
                };
            case 'CONTACTED':
                return {
                    label: isArabic ? 'تم التواصل' : 'Contacted',
                    bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-sky-300 border-blue-300',
                    icon: MdPhone,
                };
            case 'PROCESSING':
                return {
                    label: isArabic ? 'قيد التجهيز بالمستودع' : 'Processing in Warehouse',
                    bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300',
                    icon: MdSchedule,
                };
            case 'SHIPPED':
            case 'DELIVERED':
                return {
                    label: isArabic ? 'مع سيارة التوزيع' : 'Out for Delivery',
                    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
                    icon: MdLocalShipping,
                };
            case 'COMPLETED':
                return {
                    label: isArabic ? 'مكتمل ومسلّم' : 'Completed',
                    bg: 'bg-green-100 text-green-900 dark:bg-green-950/60 dark:text-green-300 border-green-400',
                    icon: MdCheckCircle,
                };
            case 'CANCELLED':
                return {
                    label: isArabic ? 'ملغي' : 'Cancelled',
                    bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300',
                    icon: MdSchedule,
                };
            default:
                return {
                    label: status,
                    bg: 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200 border-gray-300',
                    icon: MdSchedule,
                };
        }
    };

    if (isLoading || !customer) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#8A6305] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container-custom py-8 md:py-12">
            {/* Top Merchant Identity Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#13233a] to-[#0F172A] text-white p-6 sm:p-8 md:p-10 mb-8 shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#8A6305]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                            <MdStore className="text-3xl sm:text-4xl text-[#8A6305]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-[#8A6305] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {isArabic ? 'حساب تجاري معتمد' : 'Verified Merchant'}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                                {customer.shopName}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2 mt-1">
                                <span>👤 {customer.ownerName}</span>
                                <span>•</span>
                                <span>📞 {customer.phone}</span>
                                <span>•</span>
                                <span>📍 {customer.city}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <a
                            href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(
                                isArabic
                                    ? `مرحباً شركة حوا، معكم ${customer.ownerName} من ${customer.shopName} (${customer.city}). أود الاستفسار عن طلبيتي.`
                                    : `Hello Hawa Distribution, this is ${customer.ownerName} from ${customer.shopName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                        >
                            <FaWhatsapp className="text-base" />
                            <span>{isArabic ? 'واتساب المبيعات' : 'Sales WhatsApp'}</span>
                        </a>

                        <button
                            onClick={logout}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
                        >
                            <MdLogout className="text-base" />
                            <span>{isArabic ? 'خروج' : 'Logout'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 mb-8 overflow-x-auto scrollbar-hide pb-2">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                        activeTab === 'orders'
                            ? 'bg-[#0B192C] text-white dark:bg-[#8A6305] dark:text-white shadow-md'
                            : 'bg-gray-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                >
                    <MdShoppingBag className="text-base" />
                    <span>{isArabic ? 'طلباتي السابقة' : 'Past Orders'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-black">
                        {orders.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                        activeTab === 'wishlist'
                            ? 'bg-[#0B192C] text-white dark:bg-[#8A6305] dark:text-white shadow-md'
                            : 'bg-gray-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                >
                    <MdFavorite className="text-base text-rose-500" />
                    <span>{isArabic ? 'المفضلة' : 'Saved Favorites'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-black">
                        {wishlistProducts.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                        activeTab === 'profile'
                            ? 'bg-[#0B192C] text-white dark:bg-[#8A6305] dark:text-white shadow-md'
                            : 'bg-gray-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                >
                    <MdEdit className="text-base" />
                    <span>{isArabic ? 'بيانات المحل' : 'Store Details'}</span>
                </button>
            </div>

            {/* TAB CONTENT: Past Orders */}
            {activeTab === 'orders' && (
                <div>
                    {ordersLoading ? (
                        <div className="py-16 text-center text-slate-400">
                            <div className="w-8 h-8 mx-auto border-3 border-[#8A6305] border-t-transparent rounded-full animate-spin mb-3" />
                            <span>{isArabic ? 'جاري جلب الطلبات...' : 'Loading orders...'}</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white dark:bg-[#132035] p-10 rounded-3xl border border-gray-100 dark:border-white/10 text-center max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF6EC] dark:bg-white/5 flex items-center justify-center mb-4">
                                <MdShoppingBag className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0B192C] dark:text-white mb-1">
                                {isArabic ? 'لا توجد طلبات سابقة بعد' : 'No previous orders yet'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">
                                {isArabic ? 'تصفح منتجات الوكالات وأضف طرود الجملة التي يحتاجها محلك.' : 'Explore agency products and add cartons your store needs.'}
                            </p>
                            <Link
                                href="/products"
                                className="px-6 py-3 rounded-xl bg-[#0B192C] text-white dark:bg-[#8A6305] dark:text-white font-bold text-xs inline-flex items-center gap-2"
                            >
                                <span>{isArabic ? 'تصفح المنتجات' : 'Browse Products'}</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const badge = getStatusBadge(order.status);
                                const StatusIcon = badge.icon;
                                const dateStr = new Date(order.createdAt).toLocaleDateString(
                                    isArabic ? 'ar-SY' : 'en-US',
                                    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                );

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white dark:bg-[#132035] rounded-3xl p-5 sm:p-7 border border-gray-200/80 dark:border-white/10 shadow-xs hover:border-[#8A6305]/40 transition-all"
                                    >
                                        {/* Order Card Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5 gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-gray-400">
                                                        #{order.id.slice(-8).toUpperCase()}
                                                    </span>
                                                    <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${badge.bg}`}>
                                                        <StatusIcon className="text-xs" />
                                                        <span>{badge.label}</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                                    📅 {dateStr} • 📍 {order.city} - {order.streetAddress}
                                                </p>
                                            </div>

                                            {/* Re-order button */}
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="px-4 py-2.5 rounded-xl bg-[#FAF6EC] hover:bg-[#0B192C] text-[#0B192C] hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-[#8A6305] dark:hover:text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-[#8A6305]/30 cursor-pointer shrink-0"
                                            >
                                                <MdRepeat className="text-base text-[#8A6305]" />
                                                <span>{isArabic ? 'إعادة طلب نفس المنتجات' : 'Re-order Items'}</span>
                                            </button>
                                        </div>

                                        {/* Items breakdown */}
                                        <div className="py-4 divide-y divide-gray-100 dark:divide-white/5">
                                            {order.items.map((item) => {
                                                const p = item.product;
                                                const primaryImage = p?.images?.split(',')[0]?.trim() || '';
                                                const displayName = (isArabic ? p?.nameAr : p?.name) || p?.name || 'منتج';
                                                return (
                                                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 p-1 shrink-0 overflow-hidden border border-gray-100 dark:border-white/5">
                                                                {primaryImage ? (
                                                                    <ResilientImage
                                                                        src={primaryImage}
                                                                        alt={displayName}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">📦</div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                                    {displayName}
                                                                </h4>
                                                                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                                                    {p?.brand?.name} • 📦 {p?.packaging || 'طرد'}
                                                                    {p?.itemsPerPackage ? ` (${p.itemsPerPackage} قطعة)` : ''}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-end shrink-0">
                                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-black text-[#0B192C] dark:text-white">
                                                                {item.quantity} {p?.packaging || 'طرد'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Order Footer */}
                                        {order.notes && (
                                            <div className="pt-2 text-xs text-slate-500 dark:text-gray-400 italic">
                                                📝 {isArabic ? 'ملاحظات:' : 'Notes:'} {order.notes}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: Wishlist */}
            {activeTab === 'wishlist' && (
                <div>
                    {wishlistLoading ? (
                        <div className="py-16 text-center text-slate-400">
                            <div className="w-8 h-8 mx-auto border-3 border-[#8A6305] border-t-transparent rounded-full animate-spin mb-3" />
                            <span>{isArabic ? 'جاري جلب المفضلة...' : 'Loading saved items...'}</span>
                        </div>
                    ) : wishlistProducts.length === 0 ? (
                        <div className="bg-white dark:bg-[#132035] p-10 rounded-3xl border border-gray-100 dark:border-white/10 text-center max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4">
                                <MdFavorite className="text-3xl text-rose-400" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0B192C] dark:text-white mb-1">
                                {isArabic ? 'المفضلة فارغة' : 'Your wishlist is empty'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">
                                {isArabic ? 'اضغط على زر القلب ❤️ على أي منتج لحفظه والوصول إليه بسرعة لاحقاً.' : 'Click the heart icon on any product to save it for quick re-ordering.'}
                            </p>
                            <Link
                                href="/products"
                                className="px-6 py-3 rounded-xl bg-[#0B192C] text-white dark:bg-[#8A6305] dark:text-white font-bold text-xs inline-flex items-center gap-2"
                            >
                                <span>{isArabic ? 'تصفح المنتجات' : 'Browse Products'}</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {wishlistProducts.map((product) => {
                                const primaryImg = product.images?.split(',')[0]?.trim() || '';
                                const displayName = (isArabic ? product.nameAr : product.name) || product.name;
                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white dark:bg-[#132035] rounded-2xl p-4 border border-gray-200/80 dark:border-white/10 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="w-full aspect-square rounded-xl bg-gray-50 dark:bg-white/5 p-2 mb-3 overflow-hidden">
                                                <ResilientImage
                                                    src={primaryImg}
                                                    alt={displayName}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {product.brand?.name || 'Hawa'}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-[#0B192C] dark:text-white line-clamp-2 mb-1">
                                                {displayName}
                                            </h4>
                                            <span className="inline-block text-[10px] font-bold text-slate-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md mb-3">
                                                📦 {product.packaging || 'طرد'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                addItem({
                                                    id: product.id,
                                                    name: displayName,
                                                    price: Number(product.price || 0),
                                                    image: primaryImg,
                                                    quantity: 1,
                                                    slug: product.slug,
                                                    packaging: product.packaging || 'طرد',
                                                });
                                                toast.success(isArabic ? `تمت إضافة ${displayName} إلى السلة` : `Added to cart`);
                                                openDrawer();
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                        >
                                            <MdShoppingBag className="text-sm" />
                                            <span>{isArabic ? 'إضافة للسلة' : 'Add to Cart'}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: Store Profile Edit */}
            {activeTab === 'profile' && (
                <div className="max-w-2xl bg-white dark:bg-[#132035] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-white/10">
                    <h3 className="text-lg font-black text-[#0B192C] dark:text-white mb-1">
                        {isArabic ? 'تعديل بيانات المحل التجاري' : 'Edit Store Details'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-6">
                        {isArabic ? 'هذه البيانات تُستخدم تلقائياً عند إتمام أي طلبية جديدة.' : 'These details are automatically populated when placing orders.'}
                    </p>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'اسم المحل / المتجر' : 'Store Name'}
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.shopName}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, shopName: e.target.value }))}
                                className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'اسم صاحب الطلب / المسؤول' : 'Owner / Manager Name'}
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.ownerName}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                                className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'المحافظة / المنطقة' : 'Governorate / City'}
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.city}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                                className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'العنوان بالتفصيل' : 'Detailed Address'}
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.address}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                                className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0B192C] dark:text-gray-200 mb-1">
                                {isArabic ? 'ملاحظات التوصيل الافتراضية' : 'Default Delivery Notes'}
                            </label>
                            <textarea
                                rows={2}
                                value={profileForm.notes}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, notes: e.target.value }))}
                                className="block w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="px-6 py-3 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] text-white dark:text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                        >
                            {isSavingProfile ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ التعديلات' : 'Save Changes')}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
