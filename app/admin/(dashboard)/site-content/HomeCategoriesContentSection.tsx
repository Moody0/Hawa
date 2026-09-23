"use client";

import React, { useState, useMemo } from "react";
import ResilientImage from "@/app/components/ResilientImage";
import { 
    FolderTree, 
    Sparkles, 
    ArrowUp, 
    ArrowDown, 
    X, 
    Plus, 
    Search, 
    Check, 
    RotateCcw,
    Layers,
    BarChart3,
    Eye,
    Save
} from "lucide-react";

export interface CategoryOption {
    id: string;
    name: string;
    slug?: string;
    image?: string | null;
    isFeatured?: boolean;
    brandName?: string;
    type?: 'category' | 'main-category';
    isActive?: boolean;
}

export interface StatMetricItem {
    amount: number;
    suffixAr: string;
    suffixEn: string;
    labelAr: string;
    labelEn: string;
}

interface HomeCategoriesContentSectionProps {
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
    stats: StatMetricItem[];
    setStats: React.Dispatch<React.SetStateAction<StatMetricItem[]>>;
    categories: CategoryOption[];
    selectedCategoryIds: string[];
    setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
    isArabic: boolean;
    onSave?: () => Promise<void> | void;
    isSaving?: boolean;
}

export const DEFAULT_STATS: StatMetricItem[] = [
    {
        amount: 500,
        suffixAr: "+",
        suffixEn: "+",
        labelAr: "صنف متوفر بالمستودعات",
        labelEn: "Wholesale SKUs",
    },
    {
        amount: 8,
        suffixAr: "+",
        suffixEn: "+",
        labelAr: "وكالات تجارية حصرية",
        labelEn: "Exclusive Agencies",
    },
    {
        amount: 48,
        suffixAr: " ساعة",
        suffixEn: "h",
        labelAr: "أقصى مدة للتفريغ والتسليم",
        labelEn: "Max Delivery SLA",
    },
    {
        amount: 1500,
        suffixAr: "+",
        suffixEn: "+",
        labelAr: "متجر وبقالية معتمدة",
        labelEn: "Active Retail Stores",
    },
];

export default function HomeCategoriesContentSection({
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
    stats,
    setStats,
    categories,
    selectedCategoryIds,
    setSelectedCategoryIds,
    isArabic,
    onSave,
    isSaving = false,
}: HomeCategoriesContentSectionProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTab, setSelectedTab] = useState<"content" | "stats" | "categories">("content");

    // Filter available categories for the picker
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const q = searchQuery.toLowerCase().trim();
        return categories.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.brandName && c.brandName.toLowerCase().includes(q))
        );
    }, [categories, searchQuery]);

    // Ordered list of selected categories
    const selectedCategoryObjects = useMemo(() => {
        return selectedCategoryIds
            .map((id) => categories.find((c) => c.id === id))
            .filter((c): c is CategoryOption => Boolean(c));
    }, [selectedCategoryIds, categories]);

    const handleAddCategory = (id: string) => {
        if (selectedCategoryIds.length === 0) {
            // When currently in auto-featured mode, start with all currently featured categories
            // and append the new category so adding doesn't wipe out the existing rail
            const featuredIds = categories.filter((c) => c.isFeatured).map((c) => c.id);
            if (featuredIds.includes(id)) {
                setSelectedCategoryIds(featuredIds);
            } else {
                setSelectedCategoryIds([...featuredIds, id]);
            }
            return;
        }
        if (selectedCategoryIds.includes(id)) return;
        setSelectedCategoryIds((prev) => [...prev, id]);
    };

    const handleRemoveCategory = (id: string) => {
        setSelectedCategoryIds((prev) => prev.filter((catId) => catId !== id));
    };

    const handleMoveCategory = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= selectedCategoryIds.length) return;

        setSelectedCategoryIds((prev) => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const handleAddAllFeatured = () => {
        const featuredIds = categories.filter((c) => c.isFeatured).map((c) => c.id);
        const combined = Array.from(new Set([...selectedCategoryIds, ...featuredIds]));
        setSelectedCategoryIds(combined);
    };

    const handleClearSelection = () => {
        setSelectedCategoryIds([]);
    };

    const handleUpdateStat = (index: number, field: keyof StatMetricItem, value: any) => {
        setStats((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                [field]: field === "amount" ? Number(value) || 0 : value,
            };
            return next;
        });
    };

    const handleResetStats = () => {
        setStats(DEFAULT_STATS);
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Header info banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="p-3 bg-[#8A6305] text-white rounded-xl shadow-xs">
                            <FolderTree className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                {isArabic
                                    ? "إدارة قسم تصنيفات وإحصائيات الصفحة الرئيسية"
                                    : "Homepage Categories & Commercial Statistics"}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                                {isArabic
                                    ? "تحكم كامل بالعناوين والشارات، الإحصائيات والأرقام الأربعة، واختيار وترتيب التصنيفات المعروضة في شريط الصفحة الرئيسية."
                                    : "Full control over titles and badge, the 4 key commercial metrics, and selecting/ordering categories in the homepage rail."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF6EC] dark:bg-amber-950/40 text-[#8A6305] dark:text-amber-300 border border-[#8A6305]/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            {selectedCategoryIds.length > 0
                                ? (isArabic ? `${selectedCategoryIds.length} تصنيف مخصص` : `${selectedCategoryIds.length} custom categories`)
                                : (isArabic ? "عرض تلقائي للمميز" : "Auto-featured")}
                        </span>
                    </div>
                </div>

                {/* Sub tabs navigation */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-amber-200/50 dark:border-white/5">
                    <button
                        type="button"
                        onClick={() => setSelectedTab("content")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            selectedTab === "content"
                                ? "bg-[#0B192C] text-white shadow-xs"
                                : "bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-slate-200 hover:bg-white"
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>{isArabic ? "1. العناوين والنصوص" : "1. Titles & Texts"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab("stats")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            selectedTab === "stats"
                                ? "bg-[#0B192C] text-white shadow-xs"
                                : "bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-slate-200 hover:bg-white"
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>{isArabic ? "2. الإحصائيات والأرقام (4)" : "2. Statistics (4)"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTab("categories")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            selectedTab === "categories"
                                ? "bg-[#0B192C] text-white shadow-xs"
                                : "bg-white/80 dark:bg-zinc-800/80 text-slate-700 dark:text-slate-200 hover:bg-white"
                        }`}
                    >
                        <FolderTree className="w-4 h-4" />
                        <span>{isArabic ? "3. اختيار وترتيب التصنيفات" : "3. Categories & Rail Order"}</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: SECTION HEADINGS & COPY */}
            {selectedTab === "content" && (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs space-y-6">
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#8A6305]" />
                            {isArabic ? "نصوص وعناوين القسم باللغتين" : "Section Titles & Descriptions (Bilingual)"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {isArabic
                                ? "يظهر العنوان أعلى شريط التصنيفات في الصفحة الرئيسية مباشرة."
                                : "Displayed directly above the categories discovery rail on the homepage."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Arabic Column */}
                        <div className="space-y-4 rounded-xl p-5 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5">
                            <span className="text-xs font-black uppercase tracking-wider text-[#8A6305] block">
                                🇸🇾 اللغة العربية (الرئيسية)
                            </span>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    الشارة الترويجية (Eyebrow / Badge)
                                </label>
                                <input
                                    type="text"
                                    value={badgeAr}
                                    onChange={(e) => setBadgeAr(e.target.value)}
                                    placeholder="مثال: تسوق حسب القسم"
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    عنوان القسم الرئيسي (Main Title)
                                </label>
                                <input
                                    type="text"
                                    value={titleAr}
                                    onChange={(e) => setTitleAr(e.target.value)}
                                    placeholder="مثال: تصفح تشكيلة واسعة من الأصناف والمجموعات"
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    الوصف الفرعي (Subtitle / Description)
                                </label>
                                <textarea
                                    rows={2}
                                    value={descAr}
                                    onChange={(e) => setDescAr(e.target.value)}
                                    placeholder="مثال: توفير شامل لكافة احتياجات السوبرماركت ومحلات البقالة بطلب واحد"
                                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
                                />
                            </div>
                        </div>

                        {/* English Column */}
                        <div className="space-y-4 rounded-xl p-5 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                                🇬🇧 English Translation
                            </span>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Eyebrow Badge (English)
                                </label>
                                <input
                                    type="text"
                                    value={badge}
                                    onChange={(e) => setBadge(e.target.value)}
                                    placeholder="e.g. Shop by category"
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Main Section Title (English)
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Browse Key Wholesale Categories"
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Subtitle / Description (English)
                                </label>
                                <textarea
                                    rows={2}
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="e.g. Comprehensive supply for supermarkets and grocery stores in one order"
                                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
                                />
                            </div>
                        </div>
                    </div>

                    {onSave && (
                        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onSave()}
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
                                        <span>{isArabic ? "جاري الحفظ..." : "Saving..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 text-amber-400" />
                                        <span>{isArabic ? "حفظ نصوص وعناوين القسم" : "Save Section Titles"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: COMMERCIAL PROOF METRICS / STATS */}
            {selectedTab === "stats" && (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8A6305]" />
                                {isArabic ? "الإحصائيات والأرقام التجارية (الأعمدة الأربعة)" : "The 4 Key Commercial Metrics"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {isArabic
                                    ? "الأرقام التي تظهر مع تأثير العداد الحركي (Counter Animation) والشريط الذهبي الجانبي."
                                    : "Animated metrics with gold accent bar shown below the section header."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleResetStats}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isArabic ? "استعادة الأرقام الافتراضية" : "Reset to Defaults"}</span>
                        </button>
                    </div>

                    {/* 4 Stats Cards Editor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/40 p-4 space-y-3.5"
                            >
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2">
                                    <span className="text-xs font-extrabold text-[#8A6305] flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-[#8A6305]/15 text-[#8A6305] flex items-center justify-center text-[11px] font-mono">
                                            {idx + 1}
                                        </span>
                                        {isArabic ? `الإحصائية #${idx + 1}` : `Metric #${idx + 1}`}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400">
                                        {stat.amount} {stat.suffixAr}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            {isArabic ? "الرقم (Amount)" : "Amount"}
                                        </label>
                                        <input
                                            type="number"
                                            value={stat.amount}
                                            onChange={(e) => handleUpdateStat(idx, "amount", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#8A6305] font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            {isArabic ? "اللاحقة (عربي)" : "Suffix (Ar)"}
                                        </label>
                                        <input
                                            type="text"
                                            value={stat.suffixAr}
                                            onChange={(e) => handleUpdateStat(idx, "suffixAr", e.target.value)}
                                            placeholder="+"
                                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#8A6305]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            {isArabic ? "اللاحقة (En)" : "Suffix (En)"}
                                        </label>
                                        <input
                                            type="text"
                                            value={stat.suffixEn}
                                            onChange={(e) => handleUpdateStat(idx, "suffixEn", e.target.value)}
                                            placeholder="+"
                                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#8A6305]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            {isArabic ? "الوصف (بالعربية)" : "Label (Arabic)"}
                                        </label>
                                        <input
                                            type="text"
                                            value={stat.labelAr}
                                            onChange={(e) => handleUpdateStat(idx, "labelAr", e.target.value)}
                                            placeholder="مثال: صنف متوفر بالمستودعات"
                                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#8A6305]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            {isArabic ? "الوصف (بالإنجليزية)" : "Label (English)"}
                                        </label>
                                        <input
                                            type="text"
                                            value={stat.labelEn}
                                            onChange={(e) => handleUpdateStat(idx, "labelEn", e.target.value)}
                                            placeholder="e.g. Wholesale SKUs"
                                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#8A6305]"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live Preview Panel */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0B192C] p-5 shadow-xs">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            {isArabic ? "معاينة حية لشريط الإحصائيات كما يظهر للزوار" : "Live Storefront Preview"}
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="flex min-h-[64px] flex-col justify-center border-s-[3px] border-[#B68012] ps-3.5 text-start"
                                >
                                    <span className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-white tracking-tight leading-none mb-1 inline-flex items-baseline font-mono">
                                        {stat.amount.toLocaleString("en-US")}{isArabic ? stat.suffixAr : stat.suffixEn}
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">
                                        {isArabic ? stat.labelAr : stat.labelEn}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {onSave && (
                        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onSave()}
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
                                        <span>{isArabic ? "جاري الحفظ..." : "Saving..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 text-amber-400" />
                                        <span>{isArabic ? "حفظ الإحصائيات والأرقام" : "Save Commercial Metrics"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: CATEGORY RAIL & ORDERING */}
            {selectedTab === "categories" && (
                <div className="space-y-6">
                    {/* Mode & Action Controls */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#8A6305]" />
                                    {isArabic ? "التصنيفات المعروضة في شريط الصفحة الرئيسية" : "Homepage Rail Category Selection"}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {selectedCategoryIds.length > 0
                                        ? (isArabic
                                            ? `يتم حالياً عرض ${selectedCategoryIds.length} تصنيف بالترتيب المخصص المحدد أدناه.`
                                            : `Currently displaying ${selectedCategoryIds.length} custom categories in the specified order.`)
                                        : (isArabic
                                            ? "يتم حالياً عرض كافة التصنيفات المعلمة كـ (مميزة / Featured) تلقائياً."
                                            : "Currently showing all active categories marked as Featured automatically.")}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {onSave && (
                                    <button
                                        type="button"
                                        onClick={() => onSave()}
                                        disabled={isSaving}
                                        className="px-4 py-1.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
                                                <span>{isArabic ? "جاري الحفظ..." : "Saving..."}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3.5 h-3.5 text-amber-400" />
                                                <span>{isArabic ? "حفظ التغييرات" : "Save Changes"}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleAddAllFeatured}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                >
                                    {isArabic ? "إدراج المميز تلقائياً" : "Load All Featured"}
                                </button>
                                {selectedCategoryIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearSelection}
                                        className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                    >
                                        {isArabic ? "إلغاء التخصيص (تلقائي)" : "Clear (Reset to Auto)"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Selected Categories in Order */}
                        {selectedCategoryObjects.length > 0 ? (
                            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                                    {isArabic ? "التصنيفات المختارة وترتيب ظهورها (من اليمين إلى اليسار):" : "Ordered Categories (Left to Right):"}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {selectedCategoryObjects.map((cat, idx) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-2xs"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="w-5 h-5 rounded-md bg-[#0B192C] text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 overflow-hidden relative shrink-0">
                                                    {cat.image && cat.image !== "/placeholder.svg" ? (
                                                        <ResilientImage
                                                            src={cat.image}
                                                            alt={cat.name}
                                                            fill
                                                            className="object-contain p-0.5"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {cat.name}
                                                    </p>
                                                    {cat.type === 'main-category' ? (
                                                        <span className="inline-block text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-md mt-0.5">
                                                            {isArabic ? "قسم رئيسي" : "Main Dept"}
                                                        </span>
                                                    ) : cat.brandName ? (
                                                        <p className="text-[10px] text-slate-400 truncate">
                                                            {cat.brandName}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Reorder and Delete controls */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => handleMoveCategory(idx, "up")}
                                                    title={isArabic ? "تقديم الترتيب" : "Move Earlier"}
                                                    className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === selectedCategoryObjects.length - 1}
                                                    onClick={() => handleMoveCategory(idx, "down")}
                                                    title={isArabic ? "تأخير الترتيب" : "Move Later"}
                                                    className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCategory(cat.id)}
                                                    title={isArabic ? "حذف من الشريط" : "Remove"}
                                                    className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#8A6305] dark:text-amber-300">
                                {isArabic
                                    ? "ℹ️ لم يتم تحديد تصنيفات مخصصة، سيقوم النظام تلقائياً بعرض كافة التصنيفات التي تم تحديدها كـ (مميز) في صفحة التصنيفات."
                                    : "ℹ️ No custom selection configured. The system will automatically display all active categories marked as 'Featured'."}
                            </div>
                        )}
                    </div>

                    {/* Available Categories Picker */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {isArabic ? "البحث وإضافة تصنيفات أخرى للشريط" : "Browse & Add More Categories to Rail"}
                            </h4>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isArabic ? "ابحث بالاسم أو الوكالة..." : "Search name or brand..."}
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 py-1.5 ps-8 pe-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#8A6305]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1">
                            {filteredCategories.map((category) => {
                                const isAdded = selectedCategoryIds.includes(category.id);

                                return (
                                    <div
                                        key={category.id}
                                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                                            isAdded
                                                ? "border-[#8A6305]/40 bg-[#FAF6EC] dark:bg-amber-950/20"
                                                : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 overflow-hidden relative shrink-0">
                                                {category.image && category.image !== "/placeholder.svg" ? (
                                                    <ResilientImage
                                                        src={category.image}
                                                        alt={category.name}
                                                        fill
                                                        className="object-contain p-0.5"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {category.name}
                                                </p>
                                                {category.type === 'main-category' ? (
                                                    <span className="inline-block text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-md mt-0.5">
                                                        {isArabic ? "قسم رئيسي" : "Main Dept"}
                                                    </span>
                                                ) : category.brandName ? (
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {category.brandName}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                isAdded
                                                    ? handleRemoveCategory(category.id)
                                                    : handleAddCategory(category.id)
                                            }
                                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                                                isAdded
                                                    ? "bg-[#8A6305] text-white hover:bg-amber-700"
                                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]"
                                            }`}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>{isArabic ? "مضاف" : "Added"}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>{isArabic ? "إضافة" : "Add"}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {onSave && (
                        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-10 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#8A6305] dark:text-amber-300 shrink-0">
                                    <FolderTree className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        {selectedCategoryIds.length > 0
                                            ? (isArabic
                                                ? `تم اختيار ${selectedCategoryIds.length} تصنيف معروض في شريط الصفحة الرئيسية`
                                                : `${selectedCategoryIds.length} categories configured for the homepage rail`)
                                            : (isArabic
                                                ? "الوضع الحالي: عرض تلقائي لجميع التصنيفات المميزة"
                                                : "Current mode: Auto-displaying all featured categories")}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {isArabic
                                            ? "اضغط حفظ لتطبيق التغييرات وتحديث الصفحة الرئيسية مباشرة بدون تأخير."
                                            : "Click save to apply selections and rail order to the homepage immediately."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onSave()}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                        <span>{isArabic ? "جاري الحفظ..." : "Saving..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 text-amber-400" />
                                        <span>{isArabic ? "حفظ التعديلات في شريط الأقسام الآن" : "Save Rail Changes Now"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
