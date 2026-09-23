"use client";

import React, { useState } from "react";
import {
    Truck,
    Headphones,
    ShieldCheck,
    Megaphone,
    Warehouse,
    Package,
    Clock,
    Award,
    Sparkles,
    CheckCircle2,
    BarChart3,
    Store,
    Globe,
    Users,
    ShoppingBag,
    Shield,
    HeartHandshake,
    Zap,
    MapPin,
    Building2,
    Plus,
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown,
    Star,
    Check,
    X,
    RotateCcw,
    Save,
    Eye,
    Sliders,
    Layers,
    ExternalLink
} from "lucide-react";
import type { CompanyServiceItem } from "@/lib/public-queries";
import { DEFAULT_COMPANY_SERVICES } from "@/lib/public-queries";

export const AVAILABLE_SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Truck,
    Headphones,
    ShieldCheck,
    Megaphone,
    Warehouse,
    Package,
    Clock,
    Award,
    Sparkles,
    CheckCircle2,
    BarChart3,
    Store,
    Globe,
    Users,
    ShoppingBag,
    Shield,
    HeartHandshake,
    Zap,
    MapPin,
    Building2,
};

export const ACCENT_PRESETS = [
    { id: "gold", label: "Gold / Amber", badgeClass: "text-[#8A6305] dark:text-[#E5B54A]", borderClass: "border-[#8A6305]/25" },
    { id: "blue", label: "Ocean Blue", badgeClass: "text-blue-600 dark:text-sky-400", borderClass: "border-blue-500/20" },
    { id: "purple", label: "Royal Purple", badgeClass: "text-purple-600 dark:text-purple-400", borderClass: "border-purple-500/20" },
    { id: "amber", label: "Deep Amber", badgeClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/20" },
    { id: "emerald", label: "Emerald Green", badgeClass: "text-emerald-600 dark:text-emerald-400", borderClass: "border-emerald-500/20" },
    { id: "rose", label: "Coral Rose", badgeClass: "text-rose-600 dark:text-rose-400", borderClass: "border-rose-500/20" },
];

interface HomeServicesContentSectionProps {
    enabled: boolean;
    setEnabled: (val: boolean) => void;
    title: string;
    setTitle: (val: string) => void;
    titleAr: string;
    setTitleAr: (val: string) => void;
    desc: string;
    setDesc: (val: string) => void;
    descAr: string;
    setDescAr: (val: string) => void;
    services: CompanyServiceItem[];
    setServices: React.Dispatch<React.SetStateAction<CompanyServiceItem[]>>;
    isArabic: boolean;
    onSave?: () => Promise<void> | void;
    isSaving?: boolean;
}

export default function HomeServicesContentSection({
    enabled,
    setEnabled,
    title,
    setTitle,
    titleAr,
    setTitleAr,
    desc,
    setDesc,
    descAr,
    setDescAr,
    services,
    setServices,
    isArabic,
    onSave,
    isSaving = false,
}: HomeServicesContentSectionProps) {
    const [activeTab, setActiveTab] = useState<"cards" | "header" | "preview">("cards");
    const [previewLang, setPreviewLang] = useState<"ar" | "en">(isArabic ? "ar" : "en");
    
    // Modal state for Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CompanyServiceItem | null>(null);

    // Form fields in modal
    const [modalTitle, setModalTitle] = useState("");
    const [modalTitleAr, setModalTitleAr] = useState("");
    const [modalDesc, setModalDesc] = useState("");
    const [modalDescAr, setModalDescAr] = useState("");
    const [modalTag, setModalTag] = useState("");
    const [modalTagAr, setModalTagAr] = useState("");
    const [modalFooterText, setModalFooterText] = useState("");
    const [modalFooterTextAr, setModalFooterTextAr] = useState("");
    const [modalIcon, setModalIcon] = useState("Truck");
    const [modalAccent, setModalAccent] = useState("gold");
    const [modalLink, setModalLink] = useState("");
    const [modalIsFeatured, setModalIsFeatured] = useState(false);
    const [modalIsActive, setModalIsActive] = useState(true);

    const openAddModal = () => {
        setEditingCard(null);
        setModalTitle("");
        setModalTitleAr("");
        setModalDesc("");
        setModalDescAr("");
        setModalTag("");
        setModalTagAr("");
        setModalFooterText("Verified Service");
        setModalFooterTextAr("خدمة معتمدة");
        setModalIcon("Truck");
        setModalAccent("gold");
        setModalLink("");
        setModalIsFeatured(false);
        setModalIsActive(true);
        setIsModalOpen(true);
    };

    const openEditModal = (item: CompanyServiceItem) => {
        setEditingCard(item);
        setModalTitle(item.title || "");
        setModalTitleAr(item.titleAr || "");
        setModalDesc(item.desc || "");
        setModalDescAr(item.descAr || "");
        setModalTag(item.tag || "");
        setModalTagAr(item.tagAr || "");
        setModalFooterText(item.footerText || "Verified Service");
        setModalFooterTextAr(item.footerTextAr || "خدمة معتمدة");
        setModalIcon(item.icon || "Truck");
        setModalAccent(item.accent || "gold");
        setModalLink(item.link || "");
        setModalIsFeatured(Boolean(item.isFeatured));
        setModalIsActive(item.isActive !== false);
        setIsModalOpen(true);
    };

    const handleSaveModal = () => {
        if (!modalTitle.trim() && !modalTitleAr.trim()) {
            return;
        }

        const newItemData: CompanyServiceItem = {
            id: editingCard ? editingCard.id : `srv-${Date.now()}`,
            title: modalTitle.trim() || modalTitleAr.trim(),
            titleAr: modalTitleAr.trim() || modalTitle.trim(),
            desc: modalDesc.trim() || modalDescAr.trim(),
            descAr: modalDescAr.trim() || modalDesc.trim(),
            tag: modalTag.trim(),
            tagAr: modalTagAr.trim(),
            footerText: modalFooterText.trim() || "Verified Service",
            footerTextAr: modalFooterTextAr.trim() || "خدمة معتمدة",
            icon: modalIcon,
            accent: modalAccent,
            link: modalLink.trim() || undefined,
            isFeatured: modalIsFeatured,
            isActive: modalIsActive,
        };

        setServices((prev) => {
            let nextList: CompanyServiceItem[];
            if (editingCard) {
                nextList = prev.map((s) => (s.id === editingCard.id ? newItemData : s));
            } else {
                nextList = [...prev, newItemData];
            }

            // If this card is marked as featured, remove featured flag from others
            if (modalIsFeatured) {
                nextList = nextList.map((s) => ({
                    ...s,
                    isFeatured: s.id === newItemData.id,
                }));
            }

            return nextList;
        });

        setIsModalOpen(false);
    };

    const handleDeleteCard = (id: string) => {
        if (services.length <= 1) {
            alert(isArabic ? "يجب الإبقاء على خدمة واحدة على الأقل" : "You must keep at least one service card.");
            return;
        }
        if (confirm(isArabic ? "هل أنت متأكد من حذف هذه الخدمة؟" : "Are you sure you want to delete this service?")) {
            setServices((prev) => prev.filter((s) => s.id !== id));
        }
    };

    const handleToggleActive = (id: string) => {
        setServices((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isActive: s.isActive === false ? true : false } : s))
        );
    };

    const handleSetFeatured = (id: string) => {
        setServices((prev) =>
            prev.map((s) => ({
                ...s,
                isFeatured: s.id === id,
            }))
        );
    };

    const handleMove = (index: number, direction: "up" | "down") => {
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= services.length) return;
        setServices((prev) => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[target];
            next[target] = temp;
            return next;
        });
    };

    const handleResetDefaults = () => {
        if (
            confirm(
                isArabic
                    ? "هل تريد استعادة البطاقات والنصوص الافتراضية للشركة؟ ستفقد التعديلات الحالية."
                    : "Reset all services to default factory presets? Current modifications will be replaced."
            )
        ) {
            setTitle("Our Comprehensive Distribution Services");
            setTitleAr("خدمات التوزيع والتجارة المتكاملة");
            setDesc("Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands");
            setDescAr("نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل");
            setEnabled(true);
            setServices(DEFAULT_COMPANY_SERVICES);
        }
    };

    // Prepare preview data
    const activeServices = services.filter((s) => s.isActive !== false);
    const featuredCard = activeServices.find((s) => s.isFeatured) || activeServices[0] || DEFAULT_COMPANY_SERVICES[4];
    const supportingCards = activeServices.filter((s) => s.id !== featuredCard?.id);

    return (
        <div className="space-y-6">
            {/* Top Bar with Section Switch & Quick Save */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-[#8A6305] dark:text-[#E5B54A]">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                {isArabic ? "قسم خدمات الشركة ومزايا التوزيع" : "Company Services & Capabilities"}
                            </h3>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    enabled
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                }`}
                            >
                                {enabled ? (isArabic ? "مفعل بالرئيسية" : "Active on Home") : (isArabic ? "معطل" : "Disabled")}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {isArabic
                                ? "تحكم كامل ببطاقة التوزيع الرئيسية، بطاقات الخدمات الأربع، الأيقونات، النصوص، والترتيب"
                                : "Full control over the featured hero card, supporting service cards, icons, copy, and layout order"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
                    {/* Enable / Disable Toggle */}
                    <button
                        type="button"
                        onClick={() => setEnabled(!enabled)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                            enabled
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span>{enabled ? (isArabic ? "القسم ظاهر للزوار" : "Section Visible") : (isArabic ? "القسم مخفي" : "Section Hidden")}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                        title={isArabic ? "استعادة الإعدادات الافتراضية" : "Reset defaults"}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isArabic ? "افتراضي" : "Reset"}</span>
                    </button>

                    {onSave && (
                        <button
                            type="button"
                            onClick={() => onSave()}
                            disabled={isSaving}
                            className="bg-[#0B192C] hover:bg-[#1e293b] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            <span>{isArabic ? "حفظ القسم" : "Save Section"}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
                <button
                    type="button"
                    onClick={() => setActiveTab("cards")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === "cards"
                            ? "bg-[#0B192C] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>{isArabic ? "بطاقات الخدمات والمزايا" : "Service Cards"}</span>
                    <span className="ms-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20">
                        {services.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("header")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === "header"
                            ? "bg-[#0B192C] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                >
                    <Sliders className="w-4 h-4" />
                    <span>{isArabic ? "عنوان ووصف القسم" : "Heading & Text"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === "preview"
                            ? "bg-[#0B192C] text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    <span>{isArabic ? "معاينة حية للمتجر" : "Live Preview"}</span>
                </button>
            </div>

            {/* TAB 1: SERVICE CARDS MANAGEMENT */}
            {activeTab === "cards" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                {isArabic ? "قائمة الخدمات والبطاقات المعروضة" : "Services & Capabilities List"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isArabic
                                    ? "البطاقة المحددة بنجمة ⭐ ستكون البطاقة البارزة الكبيرة (توزيع احترافي) على يمين/أعلى القسم"
                                    : "The card marked with ⭐ will be rendered as the prominent dark hero card"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="bg-[#0B192C] hover:bg-[#1e293b] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isArabic ? "إضافة خدمة جديدة" : "Add New Service"}</span>
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {services.map((item, index) => {
                            const IconComponent = AVAILABLE_SERVICE_ICONS[item.icon] || Truck;
                            const isFirst = index === 0;
                            const isLast = index === services.length - 1;
                            const isItemActive = item.isActive !== false;

                            return (
                                <div
                                    key={item.id}
                                    className={`group rounded-2xl border transition-all p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                        item.isFeatured
                                            ? "bg-[#0B192C] text-white border-[#8A6305] shadow-md"
                                            : isItemActive
                                            ? "bg-white dark:bg-[#0f172a] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs"
                                            : "bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60"
                                    }`}
                                >
                                    {/* Left / Info */}
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                                                item.isFeatured
                                                    ? "bg-[#E5B54A]/15 text-[#E5B54A] border-[#E5B54A]/30"
                                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#8A6305] dark:text-[#E5B54A]"
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span
                                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                                        item.isFeatured
                                                            ? "bg-white/10 border-white/20 text-[#E5B54A]"
                                                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    }`}
                                                >
                                                    {item.tagAr || item.tag || "خدمة"}
                                                </span>

                                                {item.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-[#8A6305] text-white">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span>{isArabic ? "البطاقة الرئيسية البارزة" : "Featured Hero Card"}</span>
                                                    </span>
                                                )}

                                                {!isItemActive && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                                                        {isArabic ? "معطلة" : "Disabled"}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <h5 className={`text-sm sm:text-base font-black truncate ${item.isFeatured ? "text-white" : "text-slate-900 dark:text-white"}`}>
                                                    {item.titleAr || item.title}
                                                </h5>
                                                {item.title && item.titleAr && (
                                                    <span className={`text-xs truncate ${item.isFeatured ? "text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                                                        ({item.title})
                                                    </span>
                                                )}
                                            </div>

                                            <p className={`text-xs mt-1 line-clamp-2 ${item.isFeatured ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                                                {item.descAr || item.desc}
                                            </p>

                                            <div className="flex items-center gap-3 mt-2 text-[11px]">
                                                <span className={item.isFeatured ? "text-[#E5B54A]" : "text-[#8A6305] dark:text-[#E5B54A]"}>
                                                    {item.footerTextAr || item.footerText || "خدمة معتمدة"} ←
                                                </span>
                                                {item.link && (
                                                    <span className="text-blue-400 flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span>{item.link}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right / Actions */}
                                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                                        {/* Reorder Up/Down */}
                                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                                            <button
                                                type="button"
                                                disabled={isFirst}
                                                onClick={() => handleMove(index, "up")}
                                                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={isArabic ? "تحريك لأعلى" : "Move up"}
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isLast}
                                                onClick={() => handleMove(index, "down")}
                                                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={isArabic ? "تحريك لأسفل" : "Move down"}
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Make Featured Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSetFeatured(item.id)}
                                            className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border ${
                                                item.isFeatured
                                                    ? "bg-[#8A6305] text-white border-[#8A6305]"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#8A6305] border-slate-200 dark:border-slate-700"
                                            }`}
                                            title={isArabic ? "تعيين كبطاقة رئيسية بارزة" : "Set as featured hero card"}
                                        >
                                            <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-current" : ""}`} />
                                            <span className="hidden lg:inline text-[11px]">
                                                {item.isFeatured ? (isArabic ? "رئيسية" : "Featured") : (isArabic ? "تمييز" : "Feature")}
                                            </span>
                                        </button>

                                        {/* Toggle Active */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(item.id)}
                                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                                isItemActive
                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                            }`}
                                        >
                                            {isItemActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "معطل" : "Off")}
                                        </button>

                                        {/* Edit */}
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                                            title={isArabic ? "تعديل الخدمة" : "Edit service"}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCard(item.id)}
                                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                                            title={isArabic ? "حذف الخدمة" : "Delete service"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: SECTION HEADING & TEXT */}
            {activeTab === "header" && (
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-xs space-y-6">
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {isArabic ? "نصوص وعنوان القسم في الصفحة الرئيسية" : "Section Heading & Subtitle"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {isArabic
                                ? "يظهر هذا العنوان والنص التوضيحي مباشرة فوق بطاقات الخدمات في الصفحة الرئيسية"
                                : "Displayed directly above the capabilities cards on the home page"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Title Arabic */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isArabic ? "عنوان القسم (بالعربية)" : "Section Title (Arabic)"}
                            </label>
                            <input
                                type="text"
                                dir="rtl"
                                value={titleAr}
                                onChange={(e) => setTitleAr(e.target.value)}
                                placeholder="خدمات التوزيع والتجارة المتكاملة"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A6305]"
                            />
                        </div>

                        {/* Title English */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isArabic ? "عنوان القسم (بالإنجليزية)" : "Section Title (English)"}
                            </label>
                            <input
                                type="text"
                                dir="ltr"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Our Comprehensive Distribution Services"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A6305]"
                            />
                        </div>

                        {/* Description Arabic */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isArabic ? "الوصف التعريفي للقسم (بالعربية)" : "Section Subtitle / Description (Arabic)"}
                            </label>
                            <textarea
                                rows={2}
                                dir="rtl"
                                value={descAr}
                                onChange={(e) => setDescAr(e.target.value)}
                                placeholder="نقدم للشركات المنتجة وأصحاب المحلات منظومة متكاملة تشمل التخزين والتسويق والتوصيل"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A6305]"
                            />
                        </div>

                        {/* Description English */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {isArabic ? "الوصف التعريفي للقسم (بالإنجليزية)" : "Section Subtitle / Description (English)"}
                            </label>
                            <textarea
                                rows={2}
                                dir="ltr"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Delivering end-to-end supply chain, marketing, and distribution solutions for FMCG brands"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A6305]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: LIVE PREVIEW */}
            {activeTab === "preview" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                {isArabic ? "المعاينة التفاعلية المباشرة" : "Interactive Live Preview"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isArabic
                                    ? "شاهد كيف سيظهر هذا القسم لزوار موقع حوا على الهواتف والشاشات الكبيرة"
                                    : "Live preview of how visitors see this section on mobile and desktop"}
                            </p>
                        </div>
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => setPreviewLang("ar")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    previewLang === "ar" ? "bg-white dark:bg-[#0B192C] text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                                }`}
                            >
                                العربية
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewLang("en")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    previewLang === "en" ? "bg-white dark:bg-[#0B192C] text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                                }`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Preview Canvas */}
                    <div
                        dir={previewLang === "ar" ? "rtl" : "ltr"}
                        className="bg-[#FAF7F0] dark:bg-[#101E32] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-white/10"
                    >
                        {/* Section Header */}
                        <div className="text-center mb-7 md:mb-10">
                            <div className="flex items-center justify-center gap-3 mb-1.5">
                                <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0B192C] dark:text-white tracking-tight">
                                    {previewLang === "ar" ? titleAr || "خدمات التوزيع والتجارة المتكاملة" : title || "Our Comprehensive Distribution Services"}
                                </h2>
                                <span className="w-8 sm:w-12 h-0.5 bg-[#8A6305]/60 dark:bg-[#E5B54A]/60 rounded-full" />
                            </div>
                            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 max-w-xl mx-auto">
                                {previewLang === "ar" ? descAr : desc}
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.05fr_1.95fr]">
                            {/* Featured Card */}
                            {featuredCard && (() => {
                                const FeaturedIcon = AVAILABLE_SERVICE_ICONS[featuredCard.icon] || Truck;
                                return (
                                    <div className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[#8A6305]/35 bg-[#0B192C] p-5 sm:p-7 text-white shadow-[0_20px_55px_-38px_rgba(11,25,44,0.8)]">
                                        <div className="absolute -top-14 -end-14 h-44 w-44 rounded-full bg-[#8A6305]/20 blur-3xl" aria-hidden="true" />
                                        <div className="relative flex h-full flex-col justify-between">
                                            <div>
                                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5B54A]/20 bg-[#E5B54A]/10 text-[#E5B54A]">
                                                    <FeaturedIcon className="h-6 w-6" aria-hidden="true" />
                                                </span>
                                                <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-[#E5B54A]">
                                                    {previewLang === "ar" ? featuredCard.tagAr || featuredCard.tag : featuredCard.tag || featuredCard.tagAr}
                                                </span>
                                                <h3 className="mt-3 text-xl sm:text-2xl font-black text-white">
                                                    {previewLang === "ar" ? featuredCard.titleAr || featuredCard.title : featuredCard.title || featuredCard.titleAr}
                                                </h3>
                                                <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-300">
                                                    {previewLang === "ar" ? featuredCard.descAr || featuredCard.desc : featuredCard.desc || featuredCard.descAr}
                                                </p>
                                            </div>
                                            <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-bold text-[#E5B54A]">
                                                <span>
                                                    {previewLang === "ar" ? featuredCard.footerTextAr || featuredCard.footerText || "خدمة توزيع معتمدة" : featuredCard.footerText || featuredCard.footerTextAr || "Verified distribution service"}
                                                </span>
                                                <span className={previewLang === "ar" ? "rotate-180" : ""}>→</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Supporting Cards */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-5">
                                {supportingCards.map((item) => {
                                    const CardIcon = AVAILABLE_SERVICE_ICONS[item.icon] || Headphones;
                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative bg-white/85 dark:bg-[#132035] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200/70 dark:border-white/10 hover:border-[#8A6305] transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2.5 sm:mb-4 gap-1">
                                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-white/10 shadow-xs flex items-center justify-center shrink-0">
                                                        <CardIcon className="text-xl sm:text-2xl text-[#8A6305] dark:text-[#E5B54A]" />
                                                    </div>
                                                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 truncate">
                                                        {previewLang === "ar" ? item.tagAr || item.tag : item.tag || item.tagAr}
                                                    </span>
                                                </div>

                                                <h3 className="text-[13px] sm:text-base font-bold text-[#0B192C] dark:text-white mb-1 sm:mb-2">
                                                    {previewLang === "ar" ? item.titleAr || item.title : item.title || item.titleAr}
                                                </h3>

                                                <p className="text-[11px] sm:text-xs text-[#475569] dark:text-gray-300 leading-relaxed font-medium">
                                                    {previewLang === "ar" ? item.descAr || item.desc : item.desc || item.descAr}
                                                </p>
                                            </div>

                                            <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-gray-200/50 dark:border-white/5 flex items-center text-[10px] sm:text-[11px] font-bold text-[#8A6305] dark:text-[#8A6305]">
                                                <span>{previewLang === "ar" ? item.footerTextAr || item.footerText || "خدمة معتمدة" : item.footerText || item.footerTextAr || "Verified Service"}</span>
                                                <span className={`ms-1 inline-block ${previewLang === "ar" ? "rotate-180" : ""}`}>→</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ADD / EDIT SERVICE CARD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div
                        dir={isArabic ? "rtl" : "ltr"}
                        className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-2xl my-8 overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-[#8A6305]" />
                                <span>{editingCard ? (isArabic ? "تعديل بيانات الخدمة" : "Edit Service Card") : (isArabic ? "إضافة خدمة جديدة" : "Add New Service Card")}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Icon Picker */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {isArabic ? "اختر أيقونة الخدمة" : "Select Service Icon"}
                                </label>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 max-h-40 overflow-y-auto">
                                    {Object.entries(AVAILABLE_SERVICE_ICONS).map(([name, IconComp]) => {
                                        const isSelected = modalIcon === name;
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => setModalIcon(name)}
                                                className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                                                    isSelected
                                                        ? "bg-[#0B192C] text-[#E5B54A] shadow-md ring-2 ring-[#8A6305]"
                                                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                                }`}
                                                title={name}
                                            >
                                                <IconComp className="w-5 h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Titles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? "عنوان الخدمة (بالعربية) *" : "Title (Arabic) *"}
                                    </label>
                                    <input
                                        type="text"
                                        dir="rtl"
                                        value={modalTitleAr}
                                        onChange={(e) => setModalTitleAr(e.target.value)}
                                        placeholder="توزيع احترافي"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? "عنوان الخدمة (بالإنجليزية) *" : "Title (English) *"}
                                    </label>
                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={modalTitle}
                                        onChange={(e) => setModalTitle(e.target.value)}
                                        placeholder="Professional Distribution"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? "الشارة / الميزة الصغيرة (بالعربية)" : "Badge Tag (Arabic)"}
                                    </label>
                                    <input
                                        type="text"
                                        dir="rtl"
                                        value={modalTagAr}
                                        onChange={(e) => setModalTagAr(e.target.value)}
                                        placeholder="سيارات مجهزة / استجابة سريعة"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? "الشارة / الميزة الصغيرة (بالإنجليزية)" : "Badge Tag (English)"}
                                    </label>
                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={modalTag}
                                        onChange={(e) => setModalTag(e.target.value)}
                                        placeholder="Equipped Delivery / Fast Response"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {isArabic ? "شرح الخدمة (بالعربية)" : "Description (Arabic)"}
                                </label>
                                <textarea
                                    rows={2}
                                    dir="rtl"
                                    value={modalDescAr}
                                    onChange={(e) => setModalDescAr(e.target.value)}
                                    placeholder="شبكة توزيع واسعة وسيارات مجهزة تغطي مختلف المناطق..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {isArabic ? "شرح الخدمة (بالإنجليزية)" : "Description (English)"}
                                </label>
                                <textarea
                                    rows={2}
                                    dir="ltr"
                                    value={modalDesc}
                                    onChange={(e) => setModalDesc(e.target.value)}
                                    placeholder="Equipped delivery vehicles covering stores with scheduled delivery..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>

                            {/* Footer Texts & Link */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? "نص الإجراء السفلي (بالعربية)" : "Bottom Action Text (Arabic)"}
                                    </label>
                                    <input
                                        type="text"
                                        dir="rtl"
                                        value={modalFooterTextAr}
                                        onChange={(e) => setModalFooterTextAr(e.target.value)}
                                        placeholder="خدمة معتمدة"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? "نص الإجراء السفلي (بالإنجليزية)" : "Bottom Action Text (English)"}
                                    </label>
                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={modalFooterText}
                                        onChange={(e) => setModalFooterText(e.target.value)}
                                        placeholder="Verified Service"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {isArabic ? "رابط الوجهة (اختياري، مثلاً: /shipping-returns أو /contact)" : "Destination URL (Optional)"}
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    value={modalLink}
                                    onChange={(e) => setModalLink(e.target.value)}
                                    placeholder="/shipping-returns"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-slate-200 dark:border-white/10">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={modalIsFeatured}
                                        onChange={(e) => setModalIsFeatured(e.target.checked)}
                                        className="w-4 h-4 text-[#8A6305] rounded focus:ring-[#8A6305]"
                                    />
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        {isArabic ? "تعيين كبطاقة رئيسية بارزة (Hero Card) ⭐" : "Make this the primary Featured Hero Card ⭐"}
                                    </span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={modalIsActive}
                                        onChange={(e) => setModalIsActive(e.target.checked)}
                                        className="w-4 h-4 text-[#8A6305] rounded focus:ring-[#8A6305]"
                                    />
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        {isArabic ? "تفعيل الخدمة (إظهار)" : "Service Active"}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isArabic ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveModal}
                                className="bg-[#0B192C] hover:bg-[#1e293b] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                                {isArabic ? "حفظ التعديلات" : "Save Service"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
