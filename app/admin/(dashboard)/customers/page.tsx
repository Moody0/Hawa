'use client';

import React, { useState, useEffect } from 'react';
import { Store, Phone, MapPin, ShoppingBag, Search, CheckCircle2, Ban, Trash2, RotateCw, ShieldCheck, Check, X, Hourglass, Pencil, Save } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminHeader from '../../components/AdminHeader';
import { useAdminSidebar } from '../../context/AdminSidebarContext';
import { useConfirm } from '../../context/ConfirmDialogContext';

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

type EditableCustomer = Pick<AdminCustomer, 'id' | 'shopName' | 'ownerName' | 'phone' | 'city' | 'address' | 'notes' | 'isActive' | 'createdAt'>;

function CustomerEditModal({
    customer,
    onClose,
    onSaved,
}: {
    customer: EditableCustomer;
    onClose: () => void;
    onSaved: (updated: EditableCustomer) => void;
}) {
    const [form, setForm] = useState({
        shopName: customer.shopName,
        ownerName: customer.ownerName,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        notes: customer.notes || '',
        isActive: customer.isActive,
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const firstFieldRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        firstFieldRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSaving) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSaving, onClose]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setFieldErrors({});
        setIsSaving(true);

        try {
            const response = await fetch('/api/admin/customers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: customer.id,
                    ...form,
                    notes: form.notes.trim() || null,
                }),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const nextFieldErrors: Record<string, string> = {};
                for (const [field, messages] of Object.entries(data?.fieldErrors || {})) {
                    if (Array.isArray(messages) && typeof messages[0] === 'string') nextFieldErrors[field] = messages[0];
                }
                setFieldErrors(nextFieldErrors);
                setError(typeof data?.error === 'string'
                    ? data.error
                    : data?.code === 'PHONE_IN_USE'
                        ? 'رقم الهاتف مستخدم لحساب تاجر آخر'
                        : 'تعذر حفظ البيانات. تحقق من الحقول وحاول مجدداً.');
                return;
            }

            onSaved(data.customer as EditableCustomer);
            toast.success('تم تحديث بيانات حساب التاجر');
        } catch {
            setError('تعذر الاتصال بالخادم. حاول مجدداً.');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20';
    const fieldError = (field: string) => fieldErrors[field] ? <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors[field]}</span> : null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
            onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}
        >
            <section role="dialog" aria-modal="true" aria-labelledby="customer-edit-title" dir="rtl" className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#132035] shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#132035] px-5 py-4 sm:px-7">
                    <div>
                        <h2 id="customer-edit-title" className="text-lg font-black text-[#0B192C] dark:text-white">تعديل بيانات حساب التاجر</h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">يمكن تحديث رقم الدخول وبيانات المحل وحالة الحساب.</p>
                    </div>
                    <button type="button" onClick={onClose} disabled={isSaving} aria-label="إغلاق" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-7 sm:py-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            اسم المحل / المتجر
                            <input ref={firstFieldRef} required minLength={2} maxLength={100} value={form.shopName} onChange={(event) => setForm((current) => ({ ...current, shopName: event.target.value }))} className={inputClass} />
                            {fieldError('shopName')}
                        </label>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            رقم حساب التاجر / هاتف تسجيل الدخول
                            <input type="tel" dir="ltr" required maxLength={50} autoComplete="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className={`${inputClass} text-left font-mono`} />
                            <span className="mt-1 block text-[11px] font-normal text-slate-500">هذا هو الرقم الذي يستخدمه التاجر لتسجيل الدخول.</span>
                            {fieldError('phone')}
                        </label>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            اسم صاحب الطلب / المسؤول
                            <input required minLength={2} maxLength={100} value={form.ownerName} onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))} className={inputClass} />
                            {fieldError('ownerName')}
                        </label>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            المحافظة / المنطقة
                            <input required minLength={2} maxLength={50} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className={inputClass} />
                            {fieldError('city')}
                        </label>
                    </div>

                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        العنوان بالتفصيل
                        <input required minLength={4} maxLength={300} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className={inputClass} />
                        {fieldError('address')}
                    </label>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        ملاحظات التوصيل
                        <textarea rows={3} maxLength={500} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={`${inputClass} resize-y`} />
                        {fieldError('notes')}
                    </label>
                    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                        <span>حالة الحساب</span>
                        <select value={form.isActive ? 'active' : 'pending'} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === 'active' }))} className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B192C] px-3 py-2 outline-none">
                            <option value="active">مفعل</option>
                            <option value="pending">بانتظار التفعيل</option>
                        </select>
                    </label>

                    {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-start">
                        <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e293b] disabled:cursor-wait disabled:opacity-60">
                            <Save className="h-4 w-4" />
                            {isSaving ? 'جاري الحفظ...' : 'حفظ بيانات التاجر'}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50">إلغاء</button>
                    </div>
                </form>
            </section>
        </div>
    );
}

type TabType = 'pending' | 'active' | 'all';

export default function AdminCustomersPage() {
    const confirm = useConfirm();
    const { openSidebar } = useAdminSidebar();
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | null>(null);

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

    const handleCustomerSaved = (updated: EditableCustomer) => {
        setCustomers((current) => current.map((customer) => (
            customer.id === updated.id ? { ...customer, ...updated } : customer
        )));
        setEditingCustomer(null);
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

        const ok = await confirm({
            title: isPending ? "رفض طلب التسجيل" : "حذف الحساب التجاري",
            message: confirmMsg,
            confirmText: isPending ? "رفض وحذف" : "حذف الحساب",
            cancelText: "إلغاء",
            variant: "danger",
        });
        if (!ok) return;
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
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
            <AdminHeader title="إدارة طلبات وحسابات التجار" onMenuClick={openSidebar} />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0B192C] dark:text-white flex items-center gap-2">
                        <Store className="text-[#8A6305]" />
                        <span>إدارة طلبات وحسابات التجار</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
                        مراجعة الطلبات وتعديل رقم دخول التاجر وكافة بيانات المحل وإدارة حالة الحساب.
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
                                    <th className="p-3.5 text-start">رقم الحساب / الهاتف</th>
                                    <th className="p-3.5 text-start">المحافظة والعنوان</th>
                                    <th className="p-3.5 text-center">الطلبيات</th>
                                    <th className="p-3.5 text-center">الحالة</th>
                                    <th className="p-3.5 text-center">تواصل سريع</th>
                                    <th className="p-3.5 text-center">إدارة الحساب</th>
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
                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={() => setEditingCustomer(c)}
                                                        className="p-1.5 rounded-lg text-[#8A6305] hover:bg-[#FAF6EC] dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                                                        title="تعديل بيانات الحساب ورقم تسجيل الدخول"
                                                        aria-label={`تعديل حساب ${c.shopName}`}
                                                    >
                                                        <Pencil className="text-lg" />
                                                    </button>

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
            {editingCustomer && (
                <CustomerEditModal
                    customer={editingCustomer}
                    onClose={() => setEditingCustomer(null)}
                    onSaved={handleCustomerSaved}
                />
            )}
        </div>
    );
}
