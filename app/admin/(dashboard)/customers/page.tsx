'use client';

import React, { useState, useEffect } from 'react';
import { 
    MdStore, 
    MdPhone, 
    MdLocationOn, 
    MdShoppingBag, 
    MdSearch, 
    MdCheckCircle, 
    MdBlock, 
    MdDelete,
    MdRefresh 
} from 'react-icons/md';
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

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    const toggleStatus = async (id: string, currentStatus: boolean) => {
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
                toast.success('تم تحديث حالة الحساب');
            }
        } catch {
            toast.error('فشل التحديث');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الحساب التجاري؟')) return;
        try {
            const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCustomers((prev) => prev.filter((c) => c.id !== id));
                toast.success('تم حذف الحساب');
            }
        } catch {
            toast.error('فشل الحذف');
        }
    };

    const filtered = customers.filter(
        (c) =>
            c.shopName.toLowerCase().includes(search.toLowerCase()) ||
            c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search) ||
            c.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0B192C] dark:text-white flex items-center gap-2">
                        <MdStore className="text-[#8A6305]" />
                        <span>إدارة الحسابات التجارية والمحلات</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                        قائمة أصحاب المحلات والمتاجر المسجلين، مع إمكانية التواصل الفوري عبر واتساب ومتابعة إحصائياتهم.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCustomers}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="تحديث القائمة"
                    >
                        <MdRefresh className="text-xl" />
                    </button>
                    <span className="text-xs font-black px-3.5 py-2 rounded-xl bg-[#FAF6EC] dark:bg-white/5 text-[#8A6305] dark:text-[#8A6305] border border-[#8A6305]/20">
                        {customers.length} محل مسجل
                    </span>
                </div>
            </div>

            {/* Search filter */}
            <div className="relative max-w-md">
                <MdSearch className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="البحث باسم المحل، التاجر، رقم الهاتف، أو المدينة..."
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132035] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#8A6305] focus:outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#132035] rounded-2xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-xs">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <div className="w-8 h-8 mx-auto border-3 border-[#8A6305] border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-xs font-bold">جاري تحميل قائمة المحلات...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-bold">
                        لم يتم العثور على أي محلات مسجلة تطابق البحث
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
                                    <th className="p-3.5 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium text-slate-800 dark:text-gray-200">
                                {filtered.map((c) => {
                                    const cleanWa = c.phone.replace(/[^0-9]/g, '');
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3.5 font-bold text-[#0B192C] dark:text-white">
                                                {c.shopName}
                                            </td>
                                            <td className="p-3.5">
                                                {c.ownerName}
                                            </td>
                                            <td className="p-3.5 font-mono text-xs" dir="ltr">
                                                {c.phone}
                                            </td>
                                            <td className="p-3.5 text-xs text-slate-600 dark:text-gray-400">
                                                <span className="font-bold text-slate-900 dark:text-gray-200">{c.city}</span>
                                                <br />
                                                <span className="line-clamp-1">{c.address}</span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 font-bold text-xs">
                                                    {c.ordersCount} طلب
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <button
                                                    onClick={() => toggleStatus(c.id, c.isActive)}
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                        c.isActive
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {c.isActive ? 'مفعل' : 'معطل'}
                                                </button>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <a
                                                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                                                        `مرحباً السيد ${c.ownerName} صاحب ${c.shopName}، معكم إدارة المبيعات والتوزيع من شركة هوا.`
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
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                    title="حذف الحساب"
                                                >
                                                    <MdDelete className="text-lg" />
                                                </button>
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
