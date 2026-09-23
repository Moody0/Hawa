"use client";

import React, { useState, useMemo } from "react";
import ResilientImage from "@/app/components/ResilientImage";
import { 
    Flame, 
    ArrowUp, 
    ArrowDown, 
    X, 
    Plus, 
    Search, 
    Check, 
    RotateCcw,
    Layers,
    Eye,
    TrendingUp,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { ProductOption } from "./HomeFeaturedContentSection";

interface HomeTrendingContentSectionProps {
    enabled: boolean;
    setEnabled: (val: boolean) => void;
    badge: string;
    setBadge: (val: string) => void;
    badgeAr: string;
    setBadgeAr: (val: string) => void;
    title: string;
    setTitle: (val: string) => void;
    titleAr: string;
    setTitleAr: (val: string) => void;
    desc: string;
    setDesc: (val: string) => void;
    descAr: string;
    setDescAr: (val: string) => void;
    productIds: string[];
    setProductIds: React.Dispatch<React.SetStateAction<string[]>>;
    products: ProductOption[];
    isArabic: boolean;
}

export default function HomeTrendingContentSection({
    enabled,
    setEnabled,
    badge,
    setBadge,
    badgeAr,
    setBadgeAr,
    title,
    setTitle,
    titleAr,
    setTitleAr,
    desc,
    setDesc,
    descAr,
    setDescAr,
    productIds,
    setProductIds,
    products,
    isArabic,
}: HomeTrendingContentSectionProps) {
    const [subTab, setSubTab] = useState<"text" | "products">("text");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const getFirstImage = (images?: string | null) => {
        if (!images) return "/placeholder.svg";
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : images;
        } catch {
            return images.split(",")[0]?.trim() || "/placeholder.svg";
        }
    };

    // Fast lookup map for products
    const productsMap = useMemo(() => {
        const map = new Map<string, ProductOption>();
        products.forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    // Resolved selected products preserving custom order
    const selectedProducts = useMemo(() => {
        return productIds
            .map((id) => productsMap.get(id))
            .filter((p): p is ProductOption => Boolean(p));
    }, [productIds, productsMap]);

    // Filter available products for picker modal
    const pickerFilteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return products.filter((p) => {
            if (productIds.includes(p.id)) return false;
            if (!query) return true;
            const nameMatch = (p.name || "").toLowerCase().includes(query);
            const nameArMatch = (p.nameAr || "").toLowerCase().includes(query);
            const brandMatch = (p.brandName || "").toLowerCase().includes(query);
            return nameMatch || nameArMatch || brandMatch;
        });
    }, [products, productIds, searchQuery]);

    // Automatic fallback items (top products marked isTrending)
    const autoFallbackProducts = useMemo(() => {
        return products.filter((p) => p.isTrending).slice(0, 9);
    }, [products]);

    // Reorder Handlers
    const moveItem = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= productIds.length) return;

        setProductIds((prev) => {
            const next = [...prev];
            const [removed] = next.splice(index, 1);
            next.splice(targetIndex, 0, removed);
            return next;
        });
    };

    const removeItem = (id: string) => {
        setProductIds((prev) => prev.filter((item) => item !== id));
    };

    const addProduct = (id: string) => {
        setProductIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const resetToAuto = () => {
        setProductIds([]);
    };

    const isCustomMode = productIds.length > 0;

    return (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs animate-in fade-in-50 duration-200 space-y-6">
            {/* Header & Main Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{isArabic ? "المنتجات الأكثر طلباً هذا الأسبوع" : "Weekly Trending Products"}</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                {isArabic ? "الرئيسية" : "Home"}
                            </span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isArabic
                                ? "التحكم الكامل بظهور وقائمة وعناوين قسم الأكثر طلباً أسبوعياً على الصفحة الرئيسية."
                                : "Full control over visibility, products, and bilingual titles for the weekly fast-moving products section."}
                        </p>
                    </div>
                </div>

                {/* Section On/Off Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {enabled ? (isArabic ? "القسم مفعل" : "Section Enabled") : (isArabic ? "القسم معطل" : "Section Disabled")}
                    </span>
                    <button
                        type="button"
                        onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        role="switch"
                        aria-checked={enabled}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                enabled ? (isArabic ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Sub-Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
                <button
                    type="button"
                    onClick={() => setSubTab("text")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        subTab === "text"
                            ? "bg-[#0B192C] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? "النصوص والعناوين" : "Titles & Text"}</span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("products")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        subTab === "products"
                            ? "bg-[#0B192C] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{isArabic ? "قائمة المنتجات المعروضة" : "Curated Products"}</span>
                    {isCustomMode && (
                        <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                            {productIds.length}
                        </span>
                    )}
                </button>
            </div>

            {/* SUB-TAB 1: TEXTS & TITLES */}
            {subTab === "text" && (
                <div className="space-y-6 pt-2">
                    {/* Badge */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                {isArabic ? "شارة القسم (عربي)" : "Section Badge (Arabic)"}
                            </label>
                            <input
                                type="text"
                                value={badgeAr}
                                onChange={(e) => setBadgeAr(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                                placeholder="طلب السوق"
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                {isArabic ? "شارة القسم (إنجليزي)" : "Section Badge (English)"}
                            </label>
                            <input
                                type="text"
                                value={badge}
                                onChange={(e) => setBadge(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                                placeholder="Market demand"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                {isArabic ? "العنوان الرئيسي (عربي)" : "Main Heading (Arabic)"}
                            </label>
                            <input
                                type="text"
                                value={titleAr}
                                onChange={(e) => setTitleAr(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                                placeholder="المنتجات الأكثر طلباً هذا الأسبوع"
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                {isArabic ? "العنوان الرئيسي (إنجليزي)" : "Main Heading (English)"}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                                placeholder="Fast-Moving Weekly Products"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                {isArabic ? "الوصف الفرعي (عربي)" : "Subtitle Description (Arabic)"}
                            </label>
                            <textarea
                                rows={2}
                                value={descAr}
                                onChange={(e) => setDescAr(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none resize-none"
                                placeholder="الأصناف الأكثر حركة وسحباً من قبل المحلات والسوبرماركت بأسعار تفضيلية"
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                {isArabic ? "الوصف الفرعي (إنجليزي)" : "Subtitle Description (English)"}
                            </label>
                            <textarea
                                rows={2}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none resize-none"
                                placeholder="Highest volume FMCG demands ordered by merchants this week"
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: CURATED PRODUCTS */}
            {subTab === "products" && (
                <div className="space-y-6 pt-2">
                    {/* Mode Status Banner & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCustomMode ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                {isCustomMode ? <Sparkles className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    {isCustomMode
                                        ? (isArabic ? `وضع التحديد المخصص (${productIds.length} منتجات محددة)` : `Manual Custom Mode (${productIds.length} pinned products)`)
                                        : (isArabic ? "الوضع التلقائي (الأصناف الأكثر حركة وسحباً)" : "Automatic Mode (Highest volume / isTrending)")}
                                </p>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                                    {isCustomMode
                                        ? (isArabic ? "يتم عرض المنتجات المحددة أدناه وفق الترتيب المختار بدقة." : "Storefront displays only the custom products below in your exact order.")
                                        : (isArabic ? "يقوم النظام تلقائياً بعرض أحدث المنتجات المميزة (isTrending: true)." : "System automatically pulls the top 9 products marked as trending.")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            {isCustomMode && (
                                <button
                                    type="button"
                                    onClick={resetToAuto}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 rounded-lg transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>{isArabic ? "استعادة التلقائي" : "Reset to Auto"}</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setIsPickerOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4 text-amber-400" />
                                <span>{isArabic ? "إضافة منتج للقائمة" : "Add Product"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Products List Display */}
                    {isCustomMode ? (
                        <div className="space-y-2">
                            {selectedProducts.map((product, index) => {
                                const isFirst = index === 0;
                                const isLast = index === selectedProducts.length - 1;

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-slate-300 transition-all shadow-xs"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Sequence badge */}
                                            <span className="w-6 h-6 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center">
                                                {index + 1}
                                            </span>

                                            {/* Product thumbnail */}
                                            <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200/50">
                                                <ResilientImage
                                                    src={getFirstImage(product.images)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {isArabic && product.nameAr ? product.nameAr : product.name}
                                                </p>
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {product.brandName || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions: Move Up, Move Down, Delete */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                disabled={isFirst}
                                                onClick={() => moveItem(index, "up")}
                                                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                title={isArabic ? "تحريك لأعلى" : "Move Up"}
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isLast}
                                                onClick={() => moveItem(index, "down")}
                                                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                title={isArabic ? "تحريك لأسفل" : "Move Down"}
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(product.id)}
                                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                title={isArabic ? "حذف من القائمة" : "Remove"}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                                <Flame className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-60" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {isArabic ? "القسم يعمل حالياً بالوضع التلقائي" : "Section currently runs in Automatic Mode"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                    {isArabic
                                        ? "يقوم النظام تلقائياً بعرض المنتجات الأكثر طلباً في المتجر المحددة كـ (رائج / Trending). يمكنك النقر على 'إضافة منتج' لتحديد منتجات مخصصة يدوياً."
                                        : "System automatically displays products marked as Trending in the catalog. Click 'Add Product' to pin specific items manually."}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setIsPickerOpen(true);
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                                >
                                    <Plus className="w-4 h-4 text-amber-400" />
                                    <span>{isArabic ? "تخصيص القائمة واختيار منتجات" : "Customize Products List"}</span>
                                </button>
                            </div>

                            {/* Preview of Automatic Fallback Items */}
                            {autoFallbackProducts.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                                        {isArabic ? "معاينة الأصناف التلقائية المعروضة حالياً:" : "Current automatically rendered products preview:"}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {autoFallbackProducts.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/60 dark:border-white/5 opacity-80"
                                            >
                                                <div className="relative w-8 h-8 shrink-0 rounded bg-white dark:bg-slate-700 overflow-hidden">
                                                    <ResilientImage
                                                        src={getFirstImage(p.images)}
                                                        alt={p.name}
                                                        fill
                                                        className="object-contain p-0.5"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                                        {isArabic && p.nameAr ? p.nameAr : p.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 truncate">{p.brandName || ""}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* PRODUCT PICKER MODAL */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isArabic ? "إضافة منتج لقائمة الأكثر طلباً" : "Add Product to Weekly Trending"}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isArabic ? "اختر منتجاً لإضافته إلى قائمة العرض المخصصة" : "Select a product to append to your custom list"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isArabic ? "ابحث باسم المنتج أو العلامة التجارية..." : "Search by product or brand name..."}
                                    className="w-full ps-9 pe-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#0B192C]"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Product Picker List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {pickerFilteredProducts.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-8">
                                    {isArabic ? "لم يتم العثور على منتجات مطابقة." : "No matching products found."}
                                </p>
                            ) : (
                                pickerFilteredProducts.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 bg-white dark:bg-slate-800/60 hover:bg-slate-50 transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                                                <ResilientImage
                                                    src={getFirstImage(p.images)}
                                                    alt={p.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {isArabic && p.nameAr ? p.nameAr : p.name}
                                                </p>
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {p.brandName || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                addProduct(p.id);
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{isArabic ? "إضافة" : "Add"}</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(false)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                            >
                                {isArabic ? "تم الانتهاء" : "Done"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
