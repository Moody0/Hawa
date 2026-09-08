"use client";

import AdminHeader from "../../components/AdminHeader";
import { Truck, CreditCard, ChevronDown, Eye, Trash2, RefreshCw, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Store, Clock, CheckCircle2 } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { useConfirm } from "../../context/ConfirmDialogContext";
import Link from "next/link";
import { updateOrderStatus, deleteOrder } from "../../../../lib/admin-actions";
import { cleanWhatsAppNumber } from "../../../../lib/whatsapp-utils";
import { useState, useRef, useEffect } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import { OrderStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { formatPackaging } from "@/lib/packaging";

interface Order {
    id: string;
    shopName?: string | null;
    Name: string;
    phone: string;
    streetAddress: string;
    city: string;
    notes?: string | null;
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
            images: string;
            packaging?: string | null;
            itemsPerPackage?: string | number | null;
        } | null;
    }[];
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
    const { data: session } = useSession() || {};
    const router = useRouter();
    const canManage = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canManageOrders;
    const canDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canDeleteOrders;
    const { t, dir, language } = useLanguage();
    const isArabic = language === 'ar';
    const confirm = useConfirm();

    const { openSidebar } = useAdminSidebar();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [filter, setFilter] = useState<string>("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Calculate stats
    const stats = {
        pending: orders.filter(o => o.status === 'PENDING').length,
        shippedToday: orders.filter(o => {
            const date = new Date(o.createdAt);
            const today = new Date();
            return o.status === 'SHIPPED' &&
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        }).length,
        deliveredMTD: orders.filter(o => {
            const date = new Date(o.createdAt);
            const today = new Date();
            return o.status === 'DELIVERED' &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        }).length,
        totalRevenue: orders
            .filter(o => o.status === 'DELIVERED')
            .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    };

    const filteredOrders = orders.filter(o => {
        if (filter === "ALL") return true;
        return o.status === filter;
    }).sort((a, b) => {
        const { key, direction } = sortConfig;
        
        let comparison = 0;
        
        if (key === 'totalAmount') {
            comparison = Number(a.totalAmount) - Number(b.totalAmount);
        } else if (key === 'createdAt') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (key === 'id' || key === 'Name' || key === 'shopName' || key === 'status') {
            const valA = String(a[key as keyof Order] || '').toLowerCase();
            const valB = String(b[key as keyof Order] || '').toLowerCase();
            comparison = valA.localeCompare(valB);
        }
        
        return direction === 'asc' ? comparison : -comparison;
    });

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ column }: { column: string }) => {
        return (
            <span className={`inline-flex flex-col ms-1 ${sortConfig.key === column ? 'text-primary' : 'text-gray-300'}`}>
                <ArrowUp className={`w-3 h-3 -mb-1 ${sortConfig.key === column && sortConfig.direction === 'asc' ? 'text-primary' : 'text-gray-300'}`} />
                <ArrowDown className={`w-3 h-3 ${sortConfig.key === column && sortConfig.direction === 'desc' ? 'text-primary' : 'text-gray-300'}`} />
            </span>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'emerald';
            case 'PROCESSING': return 'blue';
            case 'PENDING': return 'amber';
            case 'CANCELLED': return 'red';
            case 'SHIPPED': return 'purple';
            default: return 'gray';
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const result = await updateOrderStatus(id, newStatus as OrderStatus);
            if (!result.success) {
                alert(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const handleDeleteOrder = async (id: string) => {
        const orderLabel = id.slice(-6).toUpperCase();
        const ok = await confirm({
            title: isArabic ? "حذف الطلب" : "Delete Order",
            message: t('admin.confirmDeleteOrder').replace('{id}', orderLabel),
            confirmText: isArabic ? "حذف" : "Delete",
            cancelText: isArabic ? "إلغاء" : "Cancel",
            variant: "danger",
        });
        if (!ok) return;
        setDeletingId(id);
        try {
            const result = await deleteOrder(id);
            if (result.success) {
                toast.success(t('admin.orderDeleted'));
                setSelectedOrder(null);
                setIsDetailsModalOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete order");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            toast.error("An error occurred");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader title={t('admin.orders')} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-8">

                    {/* Stats Grid (2-cols on mobile, 4-cols on lg) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
                            <div className="flex justify-between items-center gap-1 mb-2 sm:mb-4">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{t('admin.pendingOrders')}</p>
                                <div className="p-1.5 sm:p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg sm:rounded-xl shrink-0">
                                    <Clock className="text-lg sm:text-2xl" />
                                </div>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-1">{stats.pending}</h3>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
                            <div className="flex justify-between items-center gap-1 mb-2 sm:mb-4">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{t('admin.shippedToday')}</p>
                                <div className="p-1.5 sm:p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-xl shrink-0">
                                    <Truck className="text-lg sm:text-2xl" />
                                </div>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-1">{stats.shippedToday}</h3>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
                            <div className="flex justify-between items-center gap-1 mb-2 sm:mb-4">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{t('admin.deliveredMtd')}</p>
                                <div className="p-1.5 sm:p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg sm:rounded-xl shrink-0">
                                    <CheckCircle2 className="text-lg sm:text-2xl" />
                                </div>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-1">{stats.deliveredMTD}</h3>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all hover:shadow-md flex flex-col justify-between">
                            <div className="flex justify-between items-center gap-1 mb-2 sm:mb-4">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{t('admin.totalRevenue')}</p>
                                <div className="p-1.5 sm:p-2.5 bg-[#0B192C]/10 dark:bg-[#8A6305]/10 text-[#0B192C] dark:text-[#8A6305] rounded-lg sm:rounded-xl shrink-0">
                                    <CreditCard className="text-lg sm:text-2xl" />
                                </div>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-1">
                                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                                    {t('admin.allOrders')} ({filteredOrders.length})
                                </h3>
                                <div className="flex flex-wrap bg-white dark:bg-[#0f172a] rounded-xl p-1 border border-slate-200/80 dark:border-white/10 gap-1 shadow-2xs">
                                    <button
                                        onClick={() => setFilter("ALL")}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            filter === "ALL" 
                                                ? "bg-[#0B192C] text-white shadow-2xs" 
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {t('admin.viewAll')} ({orders.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter("PENDING")}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            filter === "PENDING" 
                                                ? "bg-amber-500 text-white shadow-2xs" 
                                                : "text-slate-600 dark:text-slate-400 hover:text-amber-600"
                                        }`}
                                    >
                                        {t('admin.pending')} ({orders.filter(o => o.status === 'PENDING').length})
                                    </button>
                                    <button
                                        onClick={() => setFilter("PROCESSING")}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            filter === "PROCESSING" 
                                                ? "bg-blue-600 text-white shadow-2xs" 
                                                : "text-slate-600 dark:text-slate-400 hover:text-blue-600"
                                        }`}
                                    >
                                        {t('admin.processing')} ({orders.filter(o => o.status === 'PROCESSING').length})
                                    </button>
                                    <button
                                        onClick={() => setFilter("SHIPPED")}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            filter === "SHIPPED" 
                                                ? "bg-purple-600 text-white shadow-2xs" 
                                                : "text-slate-600 dark:text-slate-400 hover:text-purple-600"
                                        }`}
                                    >
                                        {t('admin.shipped')} ({orders.filter(o => o.status === 'SHIPPED').length})
                                    </button>
                                    <button
                                        onClick={() => setFilter("DELIVERED")}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                            filter === "DELIVERED" 
                                                ? "bg-emerald-600 text-white shadow-2xs" 
                                                : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                                        }`}
                                    >
                                        {t('admin.delivered')} ({orders.filter(o => o.status === 'DELIVERED').length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        <OrderDetailsModal
                            isOpen={isDetailsModalOpen}
                            onClose={() => {
                                setIsDetailsModalOpen(false);
                                setSelectedOrder(null);
                            }}
                            order={selectedOrder}
                            canDelete={canDelete}
                            onDelete={selectedOrder ? () => handleDeleteOrder(selectedOrder.id) : undefined}
                            isDeleting={selectedOrder ? deletingId === selectedOrder.id : false}
                        />

                        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className={`w-full border-collapse ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>
                                    <thead>
                                        <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/90 dark:bg-slate-800/60">
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer select-none group" onClick={() => handleSort('id')}>
                                                <div className="flex items-center">
                                                    {t('admin.orderId')}
                                                    <span className={`flex flex-col ms-1 ${dir === 'rtl' ? 'me-1 ms-0' : 'ms-1'}`}>
                                                        <ArrowUp className={`w-2.5 h-2.5 -mb-0.5 ${sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                        <ArrowDown className={`w-2.5 h-2.5 ${sortConfig.key === 'id' && sortConfig.direction === 'desc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer select-none group" onClick={() => handleSort('shopName')}>
                                                <div className="flex items-center">
                                                    {t('admin.shopName')}
                                                    <span className={`flex flex-col ms-1 ${dir === 'rtl' ? 'me-1 ms-0' : 'ms-1'}`}>
                                                        <ArrowUp className={`w-2.5 h-2.5 -mb-0.5 ${sortConfig.key === 'shopName' && sortConfig.direction === 'asc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                        <ArrowDown className={`w-2.5 h-2.5 ${sortConfig.key === 'shopName' && sortConfig.direction === 'desc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer select-none group" onClick={() => handleSort('Name')}>
                                                <div className="flex items-center">
                                                    {t('admin.customerName')}
                                                    <span className={`flex flex-col ms-1 ${dir === 'rtl' ? 'me-1 ms-0' : 'ms-1'}`}>
                                                        <ArrowUp className={`w-2.5 h-2.5 -mb-0.5 ${sortConfig.key === 'Name' && sortConfig.direction === 'asc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                        <ArrowDown className={`w-2.5 h-2.5 ${sortConfig.key === 'Name' && sortConfig.direction === 'desc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer select-none group" onClick={() => handleSort('createdAt')}>
                                                <div className="flex items-center">
                                                    {t('admin.date')}
                                                    <span className={`flex flex-col ms-1 ${dir === 'rtl' ? 'me-1 ms-0' : 'ms-1'}`}>
                                                        <ArrowUp className={`w-2.5 h-2.5 -mb-0.5 ${sortConfig.key === 'createdAt' && sortConfig.direction === 'asc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                        <ArrowDown className={`w-2.5 h-2.5 ${sortConfig.key === 'createdAt' && sortConfig.direction === 'desc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer select-none group" onClick={() => handleSort('totalAmount')}>
                                                <div className="flex items-center">
                                                    {t('admin.totalAmount')}
                                                    <span className={`flex flex-col ms-1 ${dir === 'rtl' ? 'me-1 ms-0' : 'ms-1'}`}>
                                                        <ArrowUp className={`w-2.5 h-2.5 -mb-0.5 ${sortConfig.key === 'totalAmount' && sortConfig.direction === 'asc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                        <ArrowDown className={`w-2.5 h-2.5 ${sortConfig.key === 'totalAmount' && sortConfig.direction === 'desc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200">{t('admin.products')}</th>
                                            <th className="p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer select-none group" onClick={() => handleSort('status')}>
                                                <div className="flex items-center">
                                                    {t('admin.orderStatus')}
                                                    <span className={`flex flex-col ms-1 ${dir === 'rtl' ? 'me-1 ms-0' : 'ms-1'}`}>
                                                        <ArrowUp className={`w-2.5 h-2.5 -mb-0.5 ${sortConfig.key === 'status' && sortConfig.direction === 'asc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                        <ArrowDown className={`w-2.5 h-2.5 ${sortConfig.key === 'status' && sortConfig.direction === 'desc' ? 'text-[#0B192C] dark:text-[#8A6305]' : 'text-slate-300'}`} />
                                                    </span>
                                                </div>
                                            </th>
                                            <th className={`p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>{t('admin.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] dark:divide-gray-700">
                                        {filteredOrders.map((order) => {
                                            const statusColor = getStatusColor(order.status);
                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]/50 transition-colors">
                                                    <td className="p-4 text-sm font-bold text-text-main dark:text-white">#{order.id.slice(-6).toUpperCase()}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                                                                <Store className="text-base" />
                                                            </span>
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={order.shopName || undefined}>
                                                                {order.shopName || '—'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-medium text-text-main dark:text-white">{order.Name}</span>
                                                            <span className="text-xs text-text-sub dark:text-gray-400 font-mono" dir="ltr">{order.phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-text-sub dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                    <td className="p-4">
                                                        {Number(order.totalAmount) > 0 ? (
                                                            <span className="text-sm font-bold text-text-main dark:text-white">
                                                                ${Number(order.totalAmount).toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                                                {t('admin.priceOnInquiry')}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-xs font-medium text-text-sub bg-background-light dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-black/[0.04] dark:border-white/[0.04] max-w-[160px] truncate block" title={order.items.map(i => `${i.product?.name || t('admin.unknown')} (${i.quantity} ${formatPackaging(i.product?.packaging, language, { short: true })})`).join(', ')}>
                                                            {order.items.map(i => `${i.product?.name || t('admin.unknown')} (${i.quantity} ${formatPackaging(i.product?.packaging, language, { short: true })})`).join(', ') || t('admin.unknown')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="relative w-fit group">
                                                            <select
                                                                value={order.status}
                                                                disabled={updatingId === order.id || !canManage}
                                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                                className={`appearance-none ps-11 pe-12 py-3.5 rounded-2xl text-xs font-bold transition-all outline-none border shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${statusColor === "blue" ? "text-blue-600 bg-blue-50/50 border-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:border-blue-800" :
                                                                    statusColor === "amber" ? "text-amber-600 bg-amber-50/50 border-amber-100 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800" :
                                                                        statusColor === "emerald" ? "text-emerald-600 bg-emerald-50/50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800" :
                                                                            statusColor === "red" ? "text-red-600 bg-red-50/50 border-red-100 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800" :
                                                                                statusColor === "purple" ? "text-purple-600 bg-purple-50/50 border-purple-100 dark:text-purple-300 dark:bg-purple-900/20 dark:border-purple-800" :
                                                                                    "text-gray-600 bg-gray-50/50 border-gray-100 dark:text-gray-300 dark:bg-gray-800 dark:border-white/[0.04]"
                                                                    }`}
                                                            >
                                                                <option value="PENDING" className="bg-white dark:bg-surface-dark text-amber-600">{t('admin.pending')}</option>
                                                                <option value="PROCESSING" className="bg-white dark:bg-surface-dark text-blue-600">{t('admin.processing')}</option>
                                                                <option value="SHIPPED" className="bg-white dark:bg-surface-dark text-purple-600">{t('admin.shipped')}</option>
                                                                <option value="DELIVERED" className="bg-white dark:bg-surface-dark text-emerald-600">{t('admin.delivered')}</option>
                                                                <option value="CANCELLED" className="bg-white dark:bg-surface-dark text-red-600">{t('admin.cancelled')}</option>
                                                            </select>
                                                            
                                                            {/* Status Dot */}
                                                            <div className={`absolute ${dir === 'rtl' ? 'end-5' : 'start-5'} top-1/2 -translate-y-1/2 flex items-center pointer-events-none`}>
                                                                <span className={`size-2.5 rounded-full ${statusColor === "blue" ? "bg-blue-500 animate-pulse" :
                                                                    statusColor === "amber" ? "bg-amber-500" :
                                                                        statusColor === "emerald" ? "bg-emerald-500" :
                                                                            statusColor === "red" ? "bg-red-500" :
                                                                                statusColor === "purple" ? "bg-purple-500" : "bg-gray-500"
                                                                    }`}></span>
                                                            </div>

                                                            {/* Arrow Icon */}
                                                            <div className={`absolute ${dir === 'rtl' ? 'start-3' : 'end-3'} top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-transform group-hover:translate-y-[-40%] duration-200`}>
                                                                {updatingId === order.id ? (
                                                                    <RefreshCw className="text-[18px] text-current opacity-70 animate-spin" />
                                                                ) : (
                                                                    <ChevronDown className="text-[18px] text-current opacity-70" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`p-4 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>
                                                        <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                                                            {order.phone && (
                                                                <a
                                                                    href={`https://wa.me/${cleanWhatsAppNumber(order.phone)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                                                                    title={`${t('admin.contactWhatsApp')} (${order.phone})`}
                                                                >
                                                                    <FaWhatsapp className="text-[18px]" />
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => handleViewDetails(order)}
                                                                className="text-primary hover:text-primary-hover text-xs font-bold transition-colors"
                                                            >
                                                                {t('admin.viewDetails')}
                                                            </button>
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    disabled={deletingId === order.id}
                                                                    className="p-1.5 text-text-sub dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50"
                                                                    title={t('admin.deleteOrder')}
                                                                >
                                                                    {deletingId === order.id ? (
                                                                        <RefreshCw className="text-[18px] animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="text-[18px]" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="p-12 text-center text-text-sub italic">
                                                    {t('admin.noOrdersFound')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] bg-background-light/30 dark:bg-gray-800/30 flex items-center justify-between">
                                <p className="text-xs text-text-sub dark:text-gray-400 font-medium">
                                    {t('admin.showingEntries').replace('{count}', filteredOrders.length.toString()).replace('{total}', orders.length.toString())}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button className="size-8 flex items-center justify-center rounded-lg border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] text-text-sub hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                        <ChevronLeft className={`text-[18px] ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
                                    <button className="size-8 flex items-center justify-center rounded-lg border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] text-text-sub hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                        <ChevronRight className={`text-[18px] ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
