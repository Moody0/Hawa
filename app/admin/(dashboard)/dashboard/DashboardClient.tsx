"use client";

import AdminHeader from "../../components/AdminHeader";
import Link from "next/link";
import Image from "next/image";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { useState, useMemo } from "react";
import OrderDetailsModal from "../orders/OrderDetailsModal";
import { useLanguage } from "@/app/context/LanguageContext";
import { DashboardStats } from "@/lib/admin-actions";
import { DollarSign, ShoppingBag, Package, ChevronRight, ChevronLeft, TrendingUp, Plus, Store, Truck, AlertTriangle, MapPin, CheckCircle2, Inbox, GalleryHorizontal } from 'lucide-react';

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
    const { openSidebar } = useAdminSidebar();
    const { t, dir, language } = useLanguage();
    const [selectedOrder, setSelectedOrder] = useState<DashboardStats['recentOrders'][0] | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');
    const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

    const isArabic = language === 'ar';

    const handleViewDetails = (order: DashboardStats['recentOrders'][0]) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    // Calculate total orders for pipeline percentage
    const totalOrdersCount = stats.totalOrders || 1;
    const fulfillmentRate = stats.totalOrders > 0 
        ? Math.round((stats.pipeline.delivered / stats.totalOrders) * 100) 
        : 0;

    // Peak trend day calculation
    const peakDay = useMemo(() => {
        if (!stats.salesTrend || stats.salesTrend.length === 0) return null;
        return [...stats.salesTrend].sort((a, b) => 
            chartMode === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders
        )[0];
    }, [stats.salesTrend, chartMode]);

    // SVG Chart Geometry Calculations
    const chartData = stats.salesTrend || [];
    const chartWidth = 800;
    const chartHeight = 240;
    const chartPadding = { top: 25, right: 30, bottom: 40, left: 55 };

    const hasSalesData = useMemo(() => {
        return chartData.some(d => d.revenue > 0 || d.orders > 0);
    }, [chartData]);

    const maxChartValue = useMemo(() => {
        if (chartData.length === 0) return 100;
        const max = Math.max(...chartData.map(d => chartMode === 'revenue' ? d.revenue : d.orders));
        return max > 0 ? max * 1.15 : 100;
    }, [chartData, chartMode]);

    const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
    const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const stepX = chartData.length > 1 ? usableWidth / (chartData.length - 1) : usableWidth;

    const chartPoints = useMemo(() => {
        if (chartData.length === 0) return [];

        return chartData.map((d, index) => {
            const val = chartMode === 'revenue' ? d.revenue : d.orders;
            const x = chartPadding.left + index * stepX;
            const y = chartPadding.top + usableHeight - (val / maxChartValue) * usableHeight;
            return { x, y, data: d, val };
        });
    }, [chartData, chartMode, maxChartValue, chartWidth, chartHeight, chartPadding, usableHeight, stepX]);

    // Generate smooth SVG path
    const svgPathD = useMemo(() => {
        if (chartPoints.length === 0) return "";
        if (chartPoints.length === 1) return `M ${chartPoints[0].x} ${chartPoints[0].y}`;
        
        let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
        for (let i = 0; i < chartPoints.length - 1; i++) {
            const p0 = chartPoints[i];
            const p1 = chartPoints[i + 1];
            const cpX = (p0.x + p1.x) / 2;
            d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return d;
    }, [chartPoints]);

    const svgAreaD = useMemo(() => {
        if (chartPoints.length === 0) return "";
        const baselineY = chartHeight - chartPadding.bottom;
        const first = chartPoints[0];
        const last = chartPoints[chartPoints.length - 1];
        return `${svgPathD} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
    }, [svgPathD, chartPoints, chartHeight, chartPadding]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70 dark:bg-[#0b1120]">
            <AdminHeader title={t('admin.overview')} onMenuClick={openSidebar} />

            {/* Scrollable Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1500px] mx-auto flex flex-col gap-6 sm:gap-8">
                    
                    {/* Header & Quick Action Hub */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                {t("admin.dashboardTitle")}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t("admin.dashboardSubtitle")}
                            </p>
                        </div>

                        {/* Global Quick Action Shortcuts */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Link
                                href="/admin/products"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Plus className="text-base" />
                                <span>{t('admin.quickActionAddProduct')}</span>
                            </Link>

                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Package className="text-base text-[#8A6305]" />
                                <span>{t('admin.quickActionOrders')}</span>
                            </Link>

                            <Link
                                href="/admin/banners"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all active:scale-95"
                            >
                                <GalleryHorizontal className="text-base text-[#8A6305]" />
                                <span>{t('admin.quickActionBanners')}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Operational Alert Banners */}
                    <div className="flex flex-col gap-2.5">
                        {stats.pipeline.pending > 0 && (
                            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 shadow-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex h-2.5 w-2.5 relative shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                    </span>
                                    <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 truncate">
                                        {t('admin.reviewPendingAlert').replace('{count}', stats.pipeline.pending.toString())}
                                    </p>
                                </div>
                                <Link
                                    href="/admin/orders"
                                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-[#0B192C] text-white text-[11px] sm:text-xs font-bold hover:bg-[#1e293b] transition-all whitespace-nowrap shrink-0"
                                >
                                    {t('admin.reviewPendingBtn')}
                                </Link>
                            </div>
                        )}

                        {(stats.inventory.lowStockCount > 0 || stats.inventory.outOfStockCount > 0) && (
                            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    <AlertTriangle className="text-lg sm:text-xl text-rose-600 dark:text-rose-400 shrink-0" />
                                    <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 truncate">
                                        {t('admin.lowStockAlertRibbon').replace(
                                            '{count}', 
                                            (stats.inventory.lowStockCount + stats.inventory.outOfStockCount).toString()
                                        )}
                                    </p>
                                </div>
                                <Link
                                    href="/admin/products"
                                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0"
                                >
                                    {t('admin.manageStockBtn')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 4 Core Executive Metric Cards (2-cols on mobile, 4-cols on lg) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
                        
                        {/* Card 1: Total Completed Revenue */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
                            <div>
                                <div className="flex justify-between items-center gap-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">
                                        {t('admin.totalRevenue')}
                                    </p>
                                    <div className="p-1.5 sm:p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg sm:rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <DollarSign className="text-lg sm:text-2xl" />
                                    </div>
                                </div>
                                <div className="mt-1 sm:mt-2">
                                    <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-black tracking-tight">
                                        ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] sm:text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {t('admin.allTime')}
                                </span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                                    <TrendingUp className="text-xs sm:text-sm" />
                                    {stats.deliveredOrdersCount} {t('admin.delivered')}
                                </span>
                            </div>
                        </div>

                        {/* Card 2: Total Orders & Processing Rate */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
                            <div>
                                <div className="flex justify-between items-center gap-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">
                                        {t('admin.totalOrders')}
                                    </p>
                                    <div className="p-1.5 sm:p-2.5 bg-sky-50 dark:bg-sky-950/50 rounded-lg sm:rounded-xl text-[#0B192C] dark:text-sky-300 shrink-0">
                                        <Package className="text-lg sm:text-2xl" />
                                    </div>
                                </div>
                                <div className="mt-1 sm:mt-2">
                                    <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-black tracking-tight">
                                        {stats.totalOrders}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] sm:text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {t('admin.fulfillmentRate')}
                                </span>
                                <span className="font-bold text-sky-700 dark:text-sky-300 shrink-0">
                                    {fulfillmentRate}% ({stats.pipeline.delivered})
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Average Order Value (AOV) */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
                            <div>
                                <div className="flex justify-between items-center gap-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">
                                        {t('admin.averageOrderValue')}
                                    </p>
                                    <div className="p-1.5 sm:p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg sm:rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                                        <TrendingUp className="text-lg sm:text-2xl" />
                                    </div>
                                </div>
                                <div className="mt-1 sm:mt-2">
                                    <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-black tracking-tight">
                                        ${stats.averageOrderValue.toFixed(2)}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] sm:text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {t('admin.perDeliveredOrder')}
                                </span>
                                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">
                                    {stats.averageOrderValue > 0 ? `$${stats.averageOrderValue.toFixed(0)}` : "$0.00"}
                                </span>
                            </div>
                        </div>

                        {/* Card 4: Inventory Health */}
                        <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
                            <div>
                                <div className="flex justify-between items-center gap-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">
                                        {t('admin.inventoryHealth')}
                                    </p>
                                    <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 ${
                                        stats.inventory.lowStockCount > 0 || stats.inventory.outOfStockCount > 0
                                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                            : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                                    }`}>
                                        <Store className="text-lg sm:text-2xl" />
                                    </div>
                                </div>
                                <div className="mt-1 sm:mt-2">
                                    <h3 className="text-slate-900 dark:text-white text-lg sm:text-2xl lg:text-3xl font-black tracking-tight">
                                        {stats.inventory.inStockCount} <span className="text-xs sm:text-sm font-semibold text-slate-400">/ {stats.inventory.totalProducts}</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] sm:text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {stats.inventory.lowStockCount + stats.inventory.outOfStockCount > 0 ? (
                                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                                            ⚠️ {stats.inventory.lowStockCount + stats.inventory.outOfStockCount} {t('admin.unitsLeft')}
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                            <CheckCircle2 /> {t('admin.inStock')}
                                        </span>
                                    )}
                                </span>
                                <Link 
                                    href="/admin/products"
                                    className="font-bold text-slate-700 dark:text-slate-300 hover:underline shrink-0"
                                >
                                    {stats.totalCategories} {t('admin.categories')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Sales Velocity Chart (65%) & Fulfillment Pipeline (35%) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                             {/* Interactive Sales Velocity Chart */}
                        <div className="lg:col-span-8 flex flex-col justify-between rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="text-xl text-emerald-600" />
                                            <h3 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold tracking-tight">
                                                {t('admin.salesVelocity')}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                            {t('admin.salesVelocityDesc')}
                                        </p>
                                    </div>

                                    {/* Mode Switcher */}
                                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
                                        <button
                                            onClick={() => setChartMode('revenue')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                chartMode === 'revenue'
                                                    ? 'bg-white dark:bg-[#0f172a] text-emerald-600 dark:text-emerald-400 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {t('admin.revenueView')}
                                        </button>
                                        <button
                                            onClick={() => setChartMode('orders')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                chartMode === 'orders'
                                                    ? 'bg-white dark:bg-[#0f172a] text-sky-600 dark:text-sky-400 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {t('admin.ordersView')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SVG Chart Graphic */}
                            <div className="relative w-full h-[200px] sm:h-[220px] my-1">
                                {chartData.length > 0 ? (
                                    <div className="w-full h-full relative">
                                        <svg 
                                            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                                            className="w-full h-full overflow-visible select-none"
                                        >
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                                </linearGradient>
                                                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>

                                            {/* 3 Horizontal Reference Gridlines */}
                                            {[0, 0.5, 1].map((ratio, i) => {
                                                const y = chartPadding.top + usableHeight * (1 - ratio);
                                                const valueLabel = chartMode === 'revenue' 
                                                    ? `$${Math.round(maxChartValue * ratio)}` 
                                                    : Math.round(maxChartValue * ratio);
                                                return (
                                                    <g key={i}>
                                                        <line 
                                                            x1={chartPadding.left} 
                                                            y1={y} 
                                                            x2={chartWidth - chartPadding.right} 
                                                            y2={y} 
                                                            stroke="currentColor" 
                                                            strokeDasharray="4 4" 
                                                            className="text-slate-200 dark:text-slate-800" 
                                                        />
                                                        <text 
                                                            x={chartPadding.left - 10} 
                                                            y={y + 4} 
                                                            textAnchor="end" 
                                                            fontSize="11"
                                                            fontWeight="600"
                                                            className="fill-slate-400"
                                                        >
                                                            {valueLabel}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            {/* Area Gradient */}
                                            <path 
                                                d={svgAreaD} 
                                                fill={chartMode === 'revenue' ? "url(#revenueGradient)" : "url(#ordersGradient)"} 
                                            />

                                            {/* Line Stroke */}
                                            <path 
                                                d={svgPathD} 
                                                fill="none" 
                                                stroke={chartMode === 'revenue' ? "#10b981" : "#0284c7"} 
                                                strokeWidth="2.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                            />

                                            {/* X-Axis Date Labels (Adaptive 4 on mobile, 7-8 on desktop) */}
                                            {chartPoints.map((p, idx) => {
                                                const isMobileKey = idx === 0 || 
                                                    idx === Math.floor(chartPoints.length / 3) || 
                                                    idx === Math.floor((chartPoints.length * 2) / 3) || 
                                                    idx === chartPoints.length - 1;
                                                const isDesktopKey = idx % 2 === 0 || idx === chartPoints.length - 1;
                                                
                                                if (!isDesktopKey) return null;
                                                return (
                                                    <text 
                                                        key={`lbl-${idx}`}
                                                        x={p.x} 
                                                        y={chartHeight - 10} 
                                                        textAnchor="middle" 
                                                        fontSize="11"
                                                        fontWeight="600"
                                                        className={`fill-slate-400 dark:fill-slate-500 ${isMobileKey ? 'block' : 'hidden sm:inline'}`}
                                                    >
                                                        {p.data.label}
                                                    </text>
                                                );
                                            })}

                                            {/* Data Points, Guidelines & Scrub Touch Zones */}
                                            {chartPoints.map((p, idx) => (
                                                <g key={`pt-${idx}`}>
                                                    {/* Active vertical dotted guideline */}
                                                    {hoveredPointIndex === idx && (
                                                        <line
                                                            x1={p.x}
                                                            y1={chartPadding.top}
                                                            x2={p.x}
                                                            y2={chartHeight - chartPadding.bottom}
                                                            stroke={chartMode === 'revenue' ? '#10b981' : '#0284c7'}
                                                            strokeWidth="1.5"
                                                            strokeDasharray="3 3"
                                                            opacity="0.8"
                                                        />
                                                    )}

                                                    {/* Visible point circle */}
                                                    <circle
                                                        cx={p.x}
                                                        cy={p.y}
                                                        r={hoveredPointIndex === idx ? 6 : 3.5}
                                                        fill={hoveredPointIndex === idx 
                                                            ? (chartMode === 'revenue' ? '#10b981' : '#0284c7') 
                                                            : '#ffffff'
                                                        }
                                                        stroke={chartMode === 'revenue' ? '#10b981' : '#0284c7'}
                                                        strokeWidth={hoveredPointIndex === idx ? 2.5 : 2}
                                                        className="transition-all duration-150 pointer-events-none"
                                                    />

                                                    {/* Invisible wide touch hit-target for phone scrub */}
                                                    <rect
                                                        x={p.x - stepX / 2}
                                                        y={0}
                                                        width={stepX}
                                                        height={chartHeight}
                                                        fill="transparent"
                                                        className="cursor-pointer"
                                                        onMouseEnter={() => setHoveredPointIndex(idx)}
                                                        onTouchStart={() => setHoveredPointIndex(idx)}
                                                    />
                                                </g>
                                            ))}
                                        </svg>

                                        {/* Floating Hover Tooltip (Clamped to Screen) */}
                                        {hoveredPointIndex !== null && chartPoints[hoveredPointIndex] && (
                                            <div 
                                                className="absolute -top-3 transform -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl pointer-events-none z-10 whitespace-nowrap transition-all duration-75"
                                                style={{
                                                    left: `${Math.max(12, Math.min(88, (chartPoints[hoveredPointIndex].x / chartWidth) * 100))}%`
                                                }}
                                            >
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                    {chartPoints[hoveredPointIndex].data.date}
                                                </p>
                                                <p className="font-extrabold text-xs sm:text-sm">
                                                    {chartMode === 'revenue' 
                                                        ? `$${chartPoints[hoveredPointIndex].data.revenue.toFixed(2)}` 
                                                        : `${chartPoints[hoveredPointIndex].data.orders} ${t('admin.totalOrders')}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <TrendingUp className="text-4xl mb-2 text-slate-300" />
                                        <p className="text-xs font-medium">{t('admin.noSalesYet')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Chart Footer Indicator */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
                                {hasSalesData && peakDay && (peakDay.revenue > 0 || peakDay.orders > 0) ? (
                                    <>
                                        <span className="font-medium">
                                            {t('admin.peakDay')}: <strong className="text-slate-800 dark:text-slate-200">{peakDay.label}</strong>
                                        </span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            ${peakDay.revenue.toFixed(2)} ({peakDay.orders} {t('admin.totalOrders')})
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-400 dark:text-slate-500 font-medium italic">
                                        {isArabic ? "لا توجد حركات بيع مسجلة في آخر 14 يوماً" : "No sales activity in the last 14 days"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Order Fulfillment Pipeline (35%) */}
                        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="text-xl text-sky-600" />
                                        <h3 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold tracking-tight">
                                            {t('admin.orderPipeline')}
                                        </h3>
                                    </div>
                                    <Link 
                                        href="/admin/orders" 
                                        className="text-xs font-bold text-[#8A6305] hover:underline"
                                    >
                                        {t('admin.viewAll')}
                                    </Link>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 mb-5">
                                    {t('admin.orderPipelineDesc')}
                                </p>

                                {/* Pipeline Visual Bars */}
                                <div className="flex flex-col gap-3.5">
                                    {/* Pending */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                {t('admin.pending')}
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200">
                                                {stats.pipeline.pending} ({Math.round((stats.pipeline.pending / totalOrdersCount) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(stats.pipeline.pending / totalOrdersCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Processing */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                                {t('admin.processing')}
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200">
                                                {stats.pipeline.processing} ({Math.round((stats.pipeline.processing / totalOrdersCount) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(stats.pipeline.processing / totalOrdersCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Shipped */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                {t('admin.shipped')}
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200">
                                                {stats.pipeline.shipped} ({Math.round((stats.pipeline.shipped / totalOrdersCount) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(stats.pipeline.shipped / totalOrdersCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Delivered */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                {t('admin.delivered')}
                                            </span>
                                            <span className="text-slate-800 dark:text-slate-200">
                                                {stats.pipeline.delivered} ({Math.round((stats.pipeline.delivered / totalOrdersCount) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(stats.pipeline.delivered / totalOrdersCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Cancelled */}
                                    {stats.pipeline.cancelled > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                    {t('admin.cancelled')}
                                                </span>
                                                <span className="text-slate-800 dark:text-slate-200">
                                                    {stats.pipeline.cancelled} ({Math.round((stats.pipeline.cancelled / totalOrdersCount) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${(stats.pipeline.cancelled / totalOrdersCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">{t('admin.totalProcessed')}</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                    {stats.totalOrders} {t('admin.totalOrders')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Third Row: Top Selling Products (60%) & Critical Stock Watchlist (40%) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Top Selling Products */}
                        <div className="lg:col-span-7 flex flex-col rounded-2xl p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="text-xl text-[#8A6305]" />
                                        <h3 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold tracking-tight">
                                            {t('admin.topSellingProducts')}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                        {t('admin.topSellingDesc')}
                                    </p>
                                </div>
                                <Link 
                                    href="/admin/products"
                                    className="text-xs font-bold text-[#8A6305] hover:underline"
                                >
                                    {t('admin.viewAll')}
                                </Link>
                            </div>

                            <div className="flex-1 flex flex-col gap-3">
                                {stats.topProducts.length > 0 ? (
                                    stats.topProducts.map((product, idx) => (
                                        <div 
                                            key={product.id}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Rank badge */}
                                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shrink-0 ${
                                                    idx === 0 
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' 
                                                        : idx === 1 
                                                            ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' 
                                                            : idx === 2 
                                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200' 
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                    #{idx + 1}
                                                </span>

                                                {/* Product Image */}
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/10 flex items-center justify-center relative">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="40px"
                                                        />
                                                    ) : (
                                                        <Store className="text-slate-400 text-lg" />
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {isArabic && product.nameAr ? product.nameAr : product.name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                        ${product.price.toFixed(2)} • {product.stock} {t('admin.stockRemaining')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Sales Volume & Revenue */}
                                            <div className="text-end shrink-0 ms-3">
                                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                    ${product.revenue.toFixed(2)}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400">
                                                    {product.unitsSold} {t('admin.unitsSold')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <ShoppingBag className="text-2xl" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('admin.noSalesYet')}
                                        </p>
                                        <p className="text-[11px] text-slate-500 max-w-sm">
                                            {t('admin.readyForFirstSale')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Critical Restock Watchlist & Regional Demand */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            
                            {/* Restock Watchlist */}
                            <div className="flex flex-col rounded-2xl p-6 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="text-xl text-rose-500" />
                                        <h3 className="text-slate-900 dark:text-white text-base font-bold tracking-tight">
                                            {t('admin.restockWatchlist')}
                                        </h3>
                                    </div>
                                    <Link 
                                        href="/admin/products"
                                        className="text-xs font-bold text-rose-600 hover:underline"
                                    >
                                        {t('admin.viewAll')}
                                    </Link>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                                    {t('admin.restockWatchlistDesc')}
                                </p>

                                <div className="flex flex-col gap-2.5">
                                    {stats.lowStockProducts.length > 0 ? (
                                        stats.lowStockProducts.map((p) => (
                                            <div 
                                                key={p.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
                                                        {p.image ? (
                                                            <Image
                                                                src={p.image}
                                                                alt={p.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="32px"
                                                            />
                                                        ) : (
                                                            <Store className="text-slate-400 text-sm m-auto" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            {isArabic && p.nameAr ? p.nameAr : p.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                            {p.categoryName}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                                        p.stock === 0 
                                                            ? 'bg-rose-600 text-white' 
                                                            : 'bg-amber-500 text-white'
                                                    }`}>
                                                        {p.stock === 0 ? t('admin.outOfStock') : `${p.stock} ${t('admin.unitsLeft')}`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                                            <CheckCircle2 className="text-lg text-emerald-600 shrink-0" />
                                            <span>{t('admin.allStockHealthy')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Regional Demand */}
                            <div className="flex flex-col rounded-2xl p-5 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-xs">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="text-lg text-indigo-600" />
                                    <h3 className="text-slate-900 dark:text-white text-sm font-bold tracking-tight">
                                        {t('admin.topCitiesDemand')}
                                    </h3>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
                                    {t('admin.topCitiesDesc')}
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    {stats.topCities.length > 0 ? (
                                        stats.topCities.map((city, idx) => (
                                            <div 
                                                key={idx}
                                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5"
                                            >
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {city.city}
                                                </p>
                                                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mt-1">
                                                    <span>{city.orderCount} {t('admin.totalOrders')}</span>
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">${city.totalRevenue.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-center py-4 text-xs text-slate-400">
                                            {t('admin.noOrdersFound')}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Recent Orders Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Package className="text-lg text-[#0B192C] dark:text-[#8A6305]" />
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                                    {t('admin.recentOrders')}
                                </h3>
                            </div>
                            <Link
                                href="/admin/orders"
                                className="text-[#8A6305] dark:text-[#8A6305] hover:underline text-xs font-bold transition-all flex items-center gap-1"
                            >
                                <span>{t('admin.viewAll')}</span>
                                {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                            </Link>
                        </div>

                        <OrderDetailsModal
                            isOpen={isDetailsModalOpen}
                            onClose={() => {
                                setIsDetailsModalOpen(false);
                                setSelectedOrder(null);
                            }}
                            order={selectedOrder as any}
                        />

                        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className={`w-full min-w-[800px] ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>
                                    <thead>
                                        <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                {t('admin.orderId')}
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                {t('admin.customer')}
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                {t('admin.product')}
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                {t('admin.date')}
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                {t('admin.amount')}
                                            </th>
                                            <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                {t('admin.status')}
                                            </th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {stats.recentOrders.length > 0 ? (
                                            stats.recentOrders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">
                                                        #{order.id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                        <div>{order.customer}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">{order.city}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                                                        {order.items.length > 0
                                                            ? (order.items[0]?.product?.name || t('admin.unknown')) + (order.items.length > 1 ? ` + ${order.items.length - 1} ${t('common.more')}` : '')
                                                            : t('admin.unknown')}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        {new Date(order.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-extrabold text-[#0B192C] dark:text-[#8A6305]">
                                                        {order.amount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                                                                order.statusColor === "blue" || order.statusColor === "indigo"
                                                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
                                                                    : order.statusColor === "amber"
                                                                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                                                                        : order.statusColor === "emerald"
                                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                                                            : order.statusColor === "red"
                                                                                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                                                                                : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                                            }`}
                                                        >
                                                            {t(`admin.${order.status.toLowerCase()}`)}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>
                                                        <button
                                                            onClick={() => handleViewDetails(order)}
                                                            className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all ${dir === 'rtl' ? 'me-auto' : 'ms-auto'}`}
                                                            title={t('admin.details')}
                                                        >
                                                            {dir === 'rtl' ? <ChevronLeft className="text-xl" /> : <ChevronRight className="text-xl" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                            <Inbox className="text-2xl" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                            {t('admin.noRecentOrders')}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
