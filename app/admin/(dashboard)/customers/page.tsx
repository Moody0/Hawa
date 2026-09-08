'use client';

import React, { useState, useEffect } from 'react';
import { Store, Phone, MapPin, ShoppingBag, Search, CheckCircle2, Ban, Trash2, RotateCw, ShieldCheck, Check, X, Hourglass } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface AdminCustomer {
    id: string;
    shopName: string;
    ownerName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string | null;
    isActive: boolean;
    createdAt: string;
    ordersCount: number;
    wishlistCount: number;
    totalSpent: number;
}

type TabType = 'pending' | 'active' | 'all';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/customers');
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers || []);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleApprove = async (id: string, shopName: string) => {
        setActionLoadingId(id);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: true }),
            });
            if (res.ok) {
                setCustomers((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, isActive: true } : c))
                );
                toast.success(`تمت الموافقة على حساب (${shopName}) وتفعيله بنجاح!`);
            } else {
                toast.error('فشل تفعيل الحساب');
            }
        } catch {
            toast.error('حدث خطأ في الاتصال');
        } finally {
            setActionLoadingId(null);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        setActionLoadingId(id);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !currentStatus }),
            });
            if (res.ok) {
                setCustomers((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
                );
                toast.success(!currentStatus ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
            }
        } catch {
            toast.error('فشل التحديث');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (id: string, shopName: string, isPending: boolean) => {
        const confirmMsg = isPending
            ? `هل أنت متأكد من رفض وحذف طلب تسجيل (${shopName})؟`
            : `هل أنت متأكد من حذف الحساب التجاري لـ (${shopName}) بشكل نهائي؟`;

        if (!confirm(confirmMsg)) return;
        setActionLoadingId(id);
        try {
            const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCustomers((prev) => prev.filter((c) => c.id !== id));
                toast.success(isPending ? 'تم رفض وحذف الطلب' : 'تم حذف الحساب');
            }
        } catch {
            toast.error('فشل الحذف');
        } finally {
            setActionLoadingId(null);
        }
    };

    const pendingList = customers.filter((c) => !c.isActive);
    const activeList = customers.filter((c) => c.isActive);

    const filtered = customers
        .filter((c) => {
            if (activeTab === 'pending') return !c.isActive;
            if (activeTab === 'active') return c.isActive;
            return true;
        })
        .filter(
            (c) =>
                c.shopName.toLowerCase().includes(search.toLowerCase()) ||
                c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                c.phone.includes(search) ||
                c.city.toLowerCase().includes(search.toLowerCase()) ||
                (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
        );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0B192C] dark:text-white flex items-center gap-2">
                        <Store className="text-[#8A6305]" />
                        <span>إدارة طلبات وحسابات التجار</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
                        مراجعة واعتماد طلبات تسجيل المحلات الجديدة، وتفعيل الحسابات للاطلاع على أسعار الجملة.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCustomers}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="تحديث القائمة"
                    >
                        <RotateCw className="text-xl" />
                    </button>
                    <span className="text-xs font-black px-3.5 py-2 rounded-xl bg-[#FAF6EC] dark:bg-white/5 text-[#8A6305] dark:text-[#8A6305] border border-[#8A6305]/20">
                        {customers.length} إجمالي الحسابات
                    </span>
                </div>
            </div>

            {/* Status Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#132035] border border-slate-200/80 dark:border-white/10 w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'pending'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Hourglass className="text-sm" />
                        <span>بانتظار الموافقة</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                            {pendingList.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'active'
                                ? 'bg-[#0B192C] text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <ShieldCheck className="text-sm text-emerald-400" />
                        <span>الحسابات المفعلة</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'active' ? 'bg-slate-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            {activeList.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'all'
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>الكل</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            {customers.length}
                        </span>
                    </button>
                </div>

                {/* Search input */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="البحث باسم المحل، التاجر، رقم الهاتف، أو المدينة..."
                        className="w-full ps-10 pe-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132035] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                    />
                </div>
            </div>

            {/* Main Content Table / List */}
            <div className="bg-white dark:bg-[#132035] rounded-2xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-xs">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <div className="w-8 h-8 mx-auto border-3 border-[#8A6305] border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-xs font-bold">جاري تحميل قائمة المحلات...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <Store className="text-4xl mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-bold">
                            {activeTab === 'pending'
                                ? 'لا توجد طلبات تسجيل جديدة بانتظار الموافقة حالياً'
                                : 'لم يتم العثور على أي حسابات تجارية تطابق البحث'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs sm:text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200/80 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold">
                                <tr>
                                    <th className="p-3.5 text-start">المحل / المتجر</th>
                                    <th className="p-3.5 text-start">صاحب الطلب</th>
                                    <th className="p-3.5 text-start">الهاتف</th>
                                    <th className="p-3.5 text-start">المحافظة والعنوان</th>
                                    <th className="p-3.5 text-center">الطلبيات</th>
                                    <th className="p-3.5 text-center">الحالة</th>
                                    <th className="p-3.5 text-center">تواصل سريع</th>
                                    <th className="p-3.5 text-center">إجراءات الاعتماد</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium text-slate-800 dark:text-gray-200">
                                {filtered.map((c) => {
                                    const cleanWa = c.phone.replace(/[^0-9]/g, '');
                                    const isProcessing = actionLoadingId === c.id;

                                    return (
                                        <tr 
                                            key={c.id} 
                                            className={`transition-colors ${
                                                !c.isActive 
                                                    ? 'bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/70 dark:hover:bg-amber-950/20' 
                                                    : 'hover:bg-gray-50/50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <td className="p-3.5">
                                                <div className="font-bold text-[#0B192C] dark:text-white">
                                                    {c.shopName}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                                                    تاريخ التسجيل: {new Date(c.createdAt).toLocaleDateString('ar-SY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="font-bold text-slate-900 dark:text-slate-100">{c.ownerName}</span>
                                            </td>
                                            <td className="p-3.5 font-mono text-xs" dir="ltr">
                                                {c.phone}
                                            </td>
                                            <td className="p-3.5 text-xs text-slate-600 dark:text-gray-400 max-w-xs">
                                                <span className="font-bold text-slate-900 dark:text-gray-200">{c.city}</span>
                                                <p className="line-clamp-2 mt-0.5 text-[11px]">{c.address}</p>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 font-bold text-xs">
                                                    {c.ordersCount} طلب
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                {c.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        <ShieldCheck className="text-xs" />
                                                        <span>مفعل ومعتمد</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300">
                                                        <Hourglass className="text-xs animate-spin" />
                                                        <span>بانتظار الموافقة</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <a
                                                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                                                        !c.isActive
                                                            ? `مرحباً السيد ${c.ownerName} صاحب (${c.shopName})، معكم إدارة المبيعات من شركة حوا للتوزيع والتجارة بخصوص طلب تسجيل حسابكم التجاري.`
                                                            : `مرحباً السيد ${c.ownerName} صاحب (${c.shopName})، معكم إدارة المبيعات والتوزيع من شركة حوا.`
                                                    )}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                                                >
                                                    <FaWhatsapp className="text-sm" />
                                                    <span>واتساب</span>
                                                </a>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <div className="inline-flex items-center gap-1.5">
                                                    {!c.isActive ? (
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleApprove(c.id, c.shopName)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                                                            title="موافقة وتفعيل الحساب"
                                                        >
                                                            <Check className="text-sm" />
                                                            <span>موافقة وتفعيل</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => toggleStatus(c.id, c.isActive)}
                                                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                                                            title="تعطيل الحساب مؤقتاً"
                                                        >
                                                            <Ban className="text-lg" />
                                                        </button>
                                                    )}

                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={() => handleDelete(c.id, c.shopName, !c.isActive)}
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                        title={!c.isActive ? 'رفض وحذف الطلب' : 'حذف الحساب'}
                                                    >
                                                        <Trash2 className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
