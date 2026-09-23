"use client";

import React, { useState, useMemo } from "react";
import ResilientImage from "@/app/components/ResilientImage";
import { 
    Sparkles, 
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
    Clock
} from "lucide-react";

export interface ProductOption {
    id: string;
    name: string;
    nameAr?: string | null;
    slug: string;
    images?: string | null;
    brandName?: string | null;
    price?: number | null;
    isTrending?: boolean;
}

interface HomeFeaturedContentSectionProps {
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
    bestSellerIds: string[];
    setBestSellerIds: React.Dispatch<React.SetStateAction<string[]>>;
    newArrivalIds: string[];
    setNewArrivalIds: React.Dispatch<React.SetStateAction<string[]>>;
    products: ProductOption[];
    isArabic: boolean;
}

export default function HomeFeaturedContentSection({
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
    bestSellerIds,
    setBestSellerIds,
    newArrivalIds,
    setNewArrivalIds,
    products,
    isArabic,
}: HomeFeaturedContentSectionProps) {
    const [subTab, setSubTab] = useState<"text" | "bestsellers" | "newarrivals">("text");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [activeTargetList, setActiveTargetList] = useState<"bestsellers" | "newarrivals">("bestsellers");

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

    // Resolved selected products
    const selectedBestSellers = useMemo(() => {
        return bestSellerIds
            .map((id) => productsMap.get(id))
            .filter((p): p is ProductOption => Boolean(p));
    }, [bestSellerIds, productsMap]);

    const selectedNewArrivals = useMemo(() => {
        return newArrivalIds
            .map((id) => productsMap.get(id))
            .filter((p): p is ProductOption => Boolean(p));
    }, [newArrivalIds, productsMap]);

    // Filtered options for picker dialog
    const availableOptions = useMemo(() => {
        const currentTargetIds = activeTargetList === "bestsellers" ? bestSellerIds : newArrivalIds;
        return products.filter((p) => {
            const isSelected = currentTargetIds.includes(p.id);
            if (isSelected) return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                p.name.toLowerCase().includes(q) ||
                (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
                (p.brandName && p.brandName.toLowerCase().includes(q)) ||
                p.slug.toLowerCase().includes(q)
            );
        });
    }, [products, bestSellerIds, newArrivalIds, activeTargetList, searchQuery]);

    // Reorder Handlers
    const moveProduct = (
        listType: "bestsellers" | "newarrivals",
        index: number,
        direction: "up" | "down"
    ) => {
        const setter = listType === "bestsellers" ? setBestSellerIds : setNewArrivalIds;
        setter((prev) => {
            const next = [...prev];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= next.length) return prev;
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const removeProduct = (listType: "bestsellers" | "newarrivals", id: string) => {
        const setter = listType === "bestsellers" ? setBestSellerIds : setNewArrivalIds;
        setter((prev) => prev.filter((item) => item !== id));
    };

    const addProduct = (id: string) => {
        const setter = activeTargetList === "bestsellers" ? setBestSellerIds : setNewArrivalIds;
        setter((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Header info */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-[#8A6305] dark:text-[#E5B54A] rounded-xl shrink-0">
                            <Sparkles className="text-2xl" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isArabic ? "مختارات الجملة والأكثر طلباً" : "Featured Wholesale Products & Curations"}
                                </h3>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    {isArabic ? "الصفحة الرئيسية" : "Homepage"}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                                {isArabic
                                    ? "تحكم كامل في نصوص وعناوين وقوائم المنتجات المعروضة في قسم مختارات حوا وتبويبات (الأكثر طلباً / وصل حديثاً)."
                                    : "Full control over badges, titles, descriptions, and custom curated products for the Featured tabs."}
                            </p>
                        </div>
                    </div>

                    {/* Sub-tab navigation */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start md:self-auto border border-slate-200/60 dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => setSubTab("text")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                subTab === "text"
                                    ? "bg-white dark:bg-[#0B192C] text-[#0B192C] dark:text-white shadow-xs font-black"
                                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{isArabic ? "النصوص والعناوين" : "Titles & Text"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab("bestsellers")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                subTab === "bestsellers"
                                    ? "bg-white dark:bg-[#0B192C] text-[#0B192C] dark:text-white shadow-xs font-black"
                                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                            }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{isArabic ? "الأكثر طلباً" : "Best Sellers"}</span>
                            {bestSellerIds.length > 0 && (
                                <span className="ms-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                                    {bestSellerIds.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab("newarrivals")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                subTab === "newarrivals"
                                    ? "bg-white dark:bg-[#0B192C] text-[#0B192C] dark:text-white shadow-xs font-black"
                                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isArabic ? "وصل حديثاً" : "New Arrivals"}</span>
                            {newArrivalIds.length > 0 && (
                                <span className="ms-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                                    {newArrivalIds.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* SUB-TAB 1: TITLES & TEXTS */}
            {subTab === "text" && (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {isArabic ? "النصوص والشارات ثنائية اللغة" : "Bilingual Headings & Descriptions"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {isArabic
                                    ? "تظهر هذه النصوص في رأس قسم المنتجات المميزة بالصفحة الرئيسية فوق شريط التبويبات."
                                    : "These texts appear in the header of the Featured Wholesale section above the tab pills."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Column */}
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                                🇬🇧 English
                            </span>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Eyebrow Badge
                                </label>
                                <input
                                    type="text"
                                    value={badge}
                                    onChange={(e) => setBadge(e.target.value)}
                                    placeholder="Hawa Selections"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#0B192C]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Featured Wholesale Products"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm font-bold focus:ring-2 focus:ring-[#0B192C]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Subtitle Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Curated wholesale selection across leading agencies and essentials at direct trade prices"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none focus:ring-2 focus:ring-[#0B192C]"
                                />
                            </div>
                        </div>

                        {/* Arabic Column */}
                        <div className="space-y-4" dir="rtl">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300">
                                🇸🇦 العربية
                            </span>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    نص الشارة العلوية
                                </label>
                                <input
                                    type="text"
                                    value={badgeAr}
                                    onChange={(e) => setBadgeAr(e.target.value)}
                                    placeholder="مختارات حوا"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#0B192C]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    عنوان القسم الرئيسي
                                </label>
                                <input
                                    type="text"
                                    value={titleAr}
                                    onChange={(e) => setTitleAr(e.target.value)}
                                    placeholder="تشكيلة منتجات الجملة الأكثر طلباً"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm font-bold focus:ring-2 focus:ring-[#0B192C]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    الوصف التفصيلي للقسم
                                </label>
                                <textarea
                                    rows={3}
                                    value={descAr}
                                    onChange={(e) => setDescAr(e.target.value)}
                                    placeholder="تشكيلة مختارة من أفضل أصناف الوكالات المعتمدة ومواد الاستهلاك بأسعار الجملة المباشرة"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none text-sm resize-none focus:ring-2 focus:ring-[#0B192C]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isArabic ? "معاينة واجهة المتجر" : "Storefront Live Preview"}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/5">
                            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#8A6305] mb-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {isArabic ? badgeAr || "مختارات حوا" : badge || "Hawa Selections"}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight">
                                {isArabic ? titleAr || "تشكيلة منتجات الجملة الأكثر طلباً" : title || "Featured Wholesale Products"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                                {isArabic ? descAr || "تشكيلة مختارة من أفضل أصناف الوكالات المعتمدة ومواد الاستهلاك بأسعار الجملة المباشرة" : desc || "Curated wholesale selection across leading agencies and essentials at direct trade prices"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB-TAB 2: BEST SELLERS CURATION */}
            {subTab === "bestsellers" && (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isArabic ? "تبويب: الأكثر طلباً (Best Sellers)" : "Tab: Most Ordered (Best Sellers)"}
                                </h4>
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {bestSellerIds.length > 0
                                        ? (isArabic ? `${bestSellerIds.length} صنف مخصص` : `${bestSellerIds.length} Custom Products`)
                                        : (isArabic ? "وضع تلقائي (تلقائي)" : "Auto-Mode Active")}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {bestSellerIds.length > 0
                                    ? (isArabic ? "يتم عرض الأصناف المحددة أدناه وفق الترتيب المخصص." : "Displaying specifically pinned products in this custom order.")
                                    : (isArabic ? "يعرض النظام تلقائياً المنتجات الأكثر طلباً في المتجر (isTrending: true)." : "System automatically pulls trending products marked isTrending.")}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {bestSellerIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setBestSellerIds([])}
                                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-white/10"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>{isArabic ? "استعادة التلقائي" : "Reset to Auto"}</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTargetList("bestsellers");
                                    setSearchQuery("");
                                    setIsPickerOpen(true);
                                }}
                                className="px-4 py-2 bg-[#0B192C] hover:bg-[#132845] text-white dark:bg-[#8A6305] dark:hover:bg-[#a97920] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isArabic ? "إضافة صنف للتبويب" : "Add Product"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Products List */}
                    {selectedBestSellers.length === 0 ? (
                        <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-white/10">
                            <TrendingUp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {isArabic ? "وضع العرض التلقائي نشط" : "Automatic Mode Active"}
                            </h5>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                {isArabic
                                    ? "يتم جلب وعرض الأصناف الموسومة بـ (الأكثر طلباً) تلقائياً من الكتالوج. يمكنك تخصيص الأصناف وترتيبها يدوياً عبر زر 'إضافة صنف للتبويب'."
                                    : "Products marked as trending are dynamically pulled. Click 'Add Product' to switch to manual curated ordering."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedBestSellers.map((product, index) => {
                                const prodImg = getFirstImage(product.images);
                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                                                #{index + 1}
                                            </span>
                                            <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 p-1 flex items-center justify-center">
                                                <ResilientImage
                                                    src={prodImg}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-0.5"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {isArabic && product.nameAr ? product.nameAr : product.name}
                                                </h5>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                    {product.brandName && (
                                                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                                                            {product.brandName}
                                                        </span>
                                                    )}
                                                    {product.price && product.price > 0 && (
                                                        <span>${Number(product.price).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => moveProduct("bestsellers", index, "up")}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === selectedBestSellers.length - 1}
                                                onClick={() => moveProduct("bestsellers", index, "down")}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                                                title="Move Down"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeProduct("bestsellers", product.id)}
                                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                title="Remove"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* SUB-TAB 3: NEW ARRIVALS CURATION */}
            {subTab === "newarrivals" && (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isArabic ? "تبويب: وصل حديثاً (New Arrivals)" : "Tab: New Arrivals"}
                                </h4>
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                    {newArrivalIds.length > 0
                                        ? (isArabic ? `${newArrivalIds.length} صنف مخصص` : `${newArrivalIds.length} Custom Products`)
                                        : (isArabic ? "وضع تلقائي (تلقائي)" : "Auto-Mode Active")}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {newArrivalIds.length > 0
                                    ? (isArabic ? "يتم عرض الأصناف المحددة أدناه في تبويب وصل حديثاً وفق الترتيب المخصص." : "Displaying specifically pinned products in this custom order.")
                                    : (isArabic ? "يعرض النظام تلقائياً أحدث المنتجات المضافة للكتالوج." : "System automatically pulls latest products added to the catalog.")}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {newArrivalIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setNewArrivalIds([])}
                                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-white/10"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>{isArabic ? "استعادة التلقائي" : "Reset to Auto"}</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTargetList("newarrivals");
                                    setSearchQuery("");
                                    setIsPickerOpen(true);
                                }}
                                className="px-4 py-2 bg-[#0B192C] hover:bg-[#132845] text-white dark:bg-[#8A6305] dark:hover:bg-[#a97920] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isArabic ? "إضافة صنف للتبويب" : "Add Product"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Products List */}
                    {selectedNewArrivals.length === 0 ? (
                        <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-white/10">
                            <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {isArabic ? "وضع العرض التلقائي نشط" : "Automatic Mode Active"}
                            </h5>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                {isArabic
                                    ? "يتم جلب وعرض أحدث الأصناف المضافة للمستودع تلقائياً. يمكنك تخصيص قائمة أصناف معينة عبر زر 'إضافة صنف للتبويب'."
                                    : "Recently added inventory is dynamically pulled. Click 'Add Product' to pin specific items."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedNewArrivals.map((product, index) => {
                                const prodImg = getFirstImage(product.images);
                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                                                #{index + 1}
                                            </span>
                                            <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 p-1 flex items-center justify-center">
                                                <ResilientImage
                                                    src={prodImg}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-0.5"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {isArabic && product.nameAr ? product.nameAr : product.name}
                                                </h5>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                    {product.brandName && (
                                                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                                                            {product.brandName}
                                                        </span>
                                                    )}
                                                    {product.price && product.price > 0 && (
                                                        <span>${Number(product.price).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => moveProduct("newarrivals", index, "up")}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === selectedNewArrivals.length - 1}
                                                onClick={() => moveProduct("newarrivals", index, "down")}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                                                title="Move Down"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeProduct("newarrivals", product.id)}
                                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                title="Remove"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* PRODUCT SEARCH & PICKER DIALOG */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isArabic ? "اختيار وإضافة صنف" : "Add Product to Selection"}
                                </h4>
                                <p className="text-xs text-slate-400">
                                    {activeTargetList === "bestsellers"
                                        ? (isArabic ? "إلى تبويب: الأكثر طلباً" : "To Tab: Best Sellers")
                                        : (isArabic ? "إلى تبويب: وصل حديثاً" : "To Tab: New Arrivals")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4 border-b border-slate-100 dark:border-white/5">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isArabic ? "ابحث باسم المنتج أو الوكالة..." : "Search products or brands..."}
                                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0B192C]"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {availableOptions.length === 0 ? (
                                <p className="text-xs text-center text-slate-400 py-8">
                                    {isArabic ? "لا توجد نتائج مطابقة" : "No matching products found"}
                                </p>
                            ) : (
                                availableOptions.map((prod) => {
                                    const prodImg = getFirstImage(prod.images);
                                    return (
                                        <div
                                            key={prod.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="relative w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 p-1 flex items-center justify-center">
                                                    <ResilientImage
                                                        src={prodImg}
                                                        alt={prod.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {isArabic && prod.nameAr ? prod.nameAr : prod.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                        {prod.brandName && (
                                                            <span className="font-semibold text-amber-700 dark:text-amber-400">
                                                                {prod.brandName}
                                                            </span>
                                                        )}
                                                        {prod.price && prod.price > 0 && (
                                                            <span>${Number(prod.price).toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addProduct(prod.id);
                                                }}
                                                className="px-3 py-1.5 bg-[#0B192C] hover:bg-[#132845] text-white dark:bg-[#8A6305] dark:hover:bg-[#a97920] rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>{isArabic ? "إضافة" : "Add"}</span>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                            >
                                {isArabic ? "إغلاق" : "Done"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
