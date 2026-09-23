"use client";

import React, { useState, useMemo } from "react";
import ResilientImage from "@/app/components/ResilientImage";
import { 
    MessageSquareQuote, 
    ArrowUp, 
    ArrowDown, 
    X, 
    Plus, 
    Search, 
    Check, 
    RotateCcw,
    Star,
    Eye,
    Trash2,
    Edit3,
    CheckCircle2
} from "lucide-react";
import { ProductOption } from "./HomeFeaturedContentSection";
import { PublicTestimonialItem, DEFAULT_TESTIMONIALS } from "@/lib/public-queries";

interface HomeTestimonialsContentSectionProps {
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
    testimonials: PublicTestimonialItem[];
    setTestimonials: React.Dispatch<React.SetStateAction<PublicTestimonialItem[]>>;
    products: ProductOption[];
    isArabic: boolean;
}

export default function HomeTestimonialsContentSection({
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
    testimonials,
    setTestimonials,
    products,
    isArabic,
}: HomeTestimonialsContentSectionProps) {
    const [textLang, setTextLang] = useState<"ar" | "en">(isArabic ? "ar" : "en");
    
    // Modal state for Add / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [modalName, setModalName] = useState("");
    const [modalFeedback, setModalFeedback] = useState("");
    const [modalRating, setModalRating] = useState(5);
    const [modalProductSearch, setModalProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [customProductImage, setCustomProductImage] = useState("");
    const [customProductName, setCustomProductName] = useState("");
    const [customProductSlug, setCustomProductSlug] = useState("");

    const openAddModal = () => {
        setEditingIndex(null);
        setModalName("");
        setModalFeedback("");
        setModalRating(5);
        setModalProductSearch("");
        setSelectedProduct(null);
        setCustomProductImage("");
        setCustomProductName("");
        setCustomProductSlug("");
        setIsModalOpen(true);
    };

    const openEditModal = (item: PublicTestimonialItem, index: number) => {
        setEditingIndex(index);
        setModalName(item.name || "");
        setModalFeedback(item.feedback || "");
        setModalRating(item.rating || 5);
        setModalProductSearch("");
        
        // Match with products if exists
        const matched = products.find(p => p.slug === item.productSlug || p.name === item.productNameAr);
        if (matched) {
            setSelectedProduct(matched);
        } else {
            setSelectedProduct(null);
        }
        setCustomProductImage(item.image || "");
        setCustomProductName(item.productNameAr || item.productNameEn || "");
        setCustomProductSlug(item.productSlug || "");
        setIsModalOpen(true);
    };

    const handleSaveModal = () => {
        if (!modalName.trim() || !modalFeedback.trim()) return;

        let finalImage = customProductImage;
        let finalNameAr = customProductName;
        let finalSlug = customProductSlug;

        if (selectedProduct) {
            finalNameAr = selectedProduct.nameAr || selectedProduct.name;
            finalSlug = selectedProduct.slug;
            if (selectedProduct.images) {
                try {
                    const parsed = JSON.parse(selectedProduct.images);
                    finalImage = Array.isArray(parsed) ? parsed[0] : selectedProduct.images;
                } catch {
                    finalImage = selectedProduct.images.split(',')[0]?.trim() || selectedProduct.images;
                }
            }
        }

        const newItem: PublicTestimonialItem = {
            id: editingIndex !== null ? (testimonials[editingIndex]?.id || `rev-${Date.now()}`) : `rev-${Date.now()}`,
            name: modalName.trim(),
            feedback: modalFeedback.trim(),
            rating: modalRating,
            image: finalImage || "/placeholder.svg",
            productNameAr: finalNameAr || undefined,
            productNameEn: finalNameAr || undefined,
            productSlug: finalSlug || undefined,
        };

        if (editingIndex !== null) {
            setTestimonials(prev => {
                const copy = [...prev];
                copy[editingIndex] = newItem;
                return copy;
            });
        } else {
            setTestimonials(prev => [...prev, newItem]);
        }

        setIsModalOpen(false);
    };

    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        setTestimonials(prev => {
            const next = [...prev];
            const temp = next[index - 1];
            next[index - 1] = next[index];
            next[index] = temp;
            return next;
        });
    };

    const handleMoveDown = (index: number) => {
        if (index >= testimonials.length - 1) return;
        setTestimonials(prev => {
            const next = [...prev];
            const temp = next[index + 1];
            next[index + 1] = next[index];
            next[index] = temp;
            return next;
        });
    };

    const handleDelete = (index: number) => {
        setTestimonials(prev => prev.filter((_, i) => i !== index));
    };

    const handleResetToDefault = () => {
        setTestimonials([...DEFAULT_TESTIMONIALS]);
    };

    // Filter products for the modal picker
    const filteredProducts = useMemo(() => {
        if (!modalProductSearch.trim()) return products.slice(0, 12);
        const query = modalProductSearch.toLowerCase().trim();
        return products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.nameAr && p.nameAr.toLowerCase().includes(query)) ||
            (p.brandName && p.brandName.toLowerCase().includes(query))
        ).slice(0, 20);
    }, [products, modalProductSearch]);

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Header Card: Master Switch & Status */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                            <MessageSquareQuote className="text-2xl" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isArabic ? "ثقة أصحاب المحلات والسوبرماركت" : "Merchant Reviews & Testimonials"}
                                </h3>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    enabled 
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40" 
                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                                    {enabled 
                                        ? (isArabic ? "مفعل في الرئيسية" : "Active on Homepage") 
                                        : (isArabic ? "معطل" : "Disabled")}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                                {isArabic 
                                    ? "تحكم كامل في قسم آراء وتجارب شركائنا من أصحاب السوبرماركت ومحلات البقالة، مع إمكانية تعديل النصوص، تقييم النجوم، والمنتجات المرتبطة بها."
                                    : "Full control over the verified retail merchant endorsements carousel on the homepage, including copy, star ratings, and linked products."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={() => setEnabled(!enabled)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                enabled ? "bg-[#0B192C] dark:bg-amber-600" : "bg-slate-200 dark:bg-slate-700"
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    enabled ? (isArabic ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bilingual Texts Editor */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4 mb-6">
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {isArabic ? "عنوان ووصف القسم (ثنائي اللغة)" : "Section Titles & Copy (Bilingual)"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {isArabic ? "قم بتخصيص الشارة، العنوان الرئيسي، والوصف الترويجي." : "Customize the header badge, title, and subtitle description."}
                        </p>
                    </div>

                    <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setTextLang("ar")}
                            className={`px-3 py-1.5 rounded-md transition-all ${
                                textLang === "ar"
                                    ? "bg-white dark:bg-[#0f172a] text-[#0B192C] dark:text-white shadow-xs"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                            }`}
                        >
                            العربية
                        </button>
                        <button
                            type="button"
                            onClick={() => setTextLang("en")}
                            className={`px-3 py-1.5 rounded-md transition-all ${
                                textLang === "en"
                                    ? "bg-white dark:bg-[#0f172a] text-[#0B192C] dark:text-white shadow-xs"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                            }`}
                        >
                            English
                        </button>
                    </div>
                </div>

                {textLang === "ar" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" dir="rtl">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                الشارة العلوية (Badge)
                            </label>
                            <input
                                type="text"
                                value={badgeAr}
                                onChange={(e) => setBadgeAr(e.target.value)}
                                placeholder="آراء شركائنا"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                العنوان الرئيسي (Title)
                            </label>
                            <input
                                type="text"
                                value={titleAr}
                                onChange={(e) => setTitleAr(e.target.value)}
                                placeholder="ثقة أصحاب المحلات والسوبرماركت"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                الوصف التعريفي (Description)
                            </label>
                            <textarea
                                rows={2}
                                value={descAr}
                                onChange={(e) => setDescAr(e.target.value)}
                                placeholder="آراء وتجارب شركائنا من تجار التجزئة وأصحاب البقاليات في مختلف المحافظات"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-normal text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none resize-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" dir="ltr">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Header Badge
                            </label>
                            <input
                                type="text"
                                value={badge}
                                onChange={(e) => setBadge(e.target.value)}
                                placeholder="Verified Endorsements"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Verified Wholesale Buyer Reviews"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Subtitle Description
                            </label>
                            <textarea
                                rows={2}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Endorsements from verified retail merchants and grocery partners across Syria"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-normal text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Testimonials Management Section */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 md:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-5 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {isArabic ? "قائمة آراء وتجارب التجار" : "Testimonials & Merchant Quotes"}
                            </h4>
                            <span className="px-2 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                                {testimonials.length} {isArabic ? "تقييم" : "reviews"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {isArabic 
                                ? "يمكنك إضافة آراء تجار جدد، تعديل التقييمات، إعادة ترتيب العرض، أو ربط التقييم بأي صنف من الكتالوج."
                                : "Add merchant testimonials, customize ratings, reorder items, or associate each quote with a catalog item."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={isArabic ? "استعادة التقييمات الافتراضية" : "Reset to default testimonials"}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isArabic ? "استعادة الافتراضية" : "Reset Default"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-xs transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isArabic ? "إضافة رأي تاجر" : "Add Testimonial"}</span>
                        </button>
                    </div>
                </div>

                {/* Testimonial Cards Grid */}
                {testimonials.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                        <MessageSquareQuote className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {isArabic ? "لا توجد تقييمات مضافة حالياً" : "No testimonials currently added"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">
                            {isArabic ? "اضغط على إضافة رأي جديد أو استعد التقييمات الافتراضية." : "Click Add Testimonial or Reset Default to load standard quotes."}
                        </p>
                        <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isArabic ? "استعادة التقييمات الافتراضية" : "Load Default Quotes"}</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {testimonials.map((item, index) => {
                            const isFirst = index === 0;
                            const isLast = index === testimonials.length - 1;

                            return (
                                <div
                                    key={item.id || index}
                                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-xs"
                                >
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        {/* Sequence Badge */}
                                        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-[#0B192C]/5 dark:bg-white/5 border border-[#0B192C]/10 dark:border-white/10 shrink-0 text-xs font-black text-[#0B192C] dark:text-amber-400">
                                            #{index + 1}
                                        </div>

                                        {/* Linked Product Image */}
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shrink-0">
                                            <ResilientImage
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.productNameAr || item.name}
                                                sizes="48px"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {item.name}
                                                </h5>
                                                {/* Rating stars */}
                                                <div className="flex items-center text-amber-500">
                                                    {[...Array(item.rating || 5)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 fill-current" />
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic mb-1.5">
                                                "{item.feedback}"
                                            </p>

                                            {(item.productNameAr || item.productNameEn) && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400">
                                                    <span className="font-semibold text-[#8A6305] dark:text-amber-400">
                                                        {isArabic ? "الصنف المرتبط:" : "Linked Product:"}
                                                    </span>
                                                    <span className="truncate">
                                                        {item.productNameAr || item.productNameEn}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 shrink-0 self-end md:self-center border-t md:border-t-0 border-slate-200/60 dark:border-white/5 pt-2 md:pt-0 w-full md:w-auto justify-end">
                                        <button
                                            type="button"
                                            disabled={isFirst}
                                            onClick={() => handleMoveUp(index)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                            title={isArabic ? "تحريك لأعلى" : "Move Up"}
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isLast}
                                            onClick={() => handleMoveDown(index)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                            title={isArabic ? "تحريك لأسفل" : "Move Down"}
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item, index)}
                                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                            title={isArabic ? "تعديل" : "Edit"}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(index)}
                                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                            title={isArabic ? "حذف" : "Delete"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div 
                        className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8"
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingIndex !== null 
                                    ? (isArabic ? "تعديل رأي التاجر" : "Edit Testimonial") 
                                    : (isArabic ? "إضافة رأي تاجر جديد" : "Add New Testimonial")}
                            </h4>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Merchant / Store Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isArabic ? "اسم المحل أو السوبرماركت (والمدينة)" : "Store / Merchant Name & City"}
                                </label>
                                <input
                                    type="text"
                                    value={modalName}
                                    onChange={(e) => setModalName(e.target.value)}
                                    placeholder={isArabic ? "مثال: سوبرماركت الشام الحديث (دمشق - كفرسوسة)" : "e.g. Al-Sham Modern Supermarket (Damascus)"}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none"
                                    required
                                />
                            </div>

                            {/* Quote Feedback */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isArabic ? "نص رأي وتجربة التاجر (Feedback Quote)" : "Merchant Quote / Feedback"}
                                </label>
                                <textarea
                                    rows={3}
                                    value={modalFeedback}
                                    onChange={(e) => setModalFeedback(e.target.value)}
                                    placeholder={isArabic ? "أفضل موزع معتمد لوكالات زوان والريف. سرعة استثنائية وبضاعة مضمونة..." : "Best certified distributor, speedy carton dispatch and verified goods..."}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0B192C] outline-none resize-none"
                                    required
                                />
                            </div>

                            {/* Star Rating Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isArabic ? "التقييم بالنجوم" : "Star Rating"}
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setModalRating(star)}
                                            className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                                                star <= modalRating ? "text-amber-500" : "text-slate-300 dark:text-slate-600"
                                            }`}
                                        >
                                            <Star className="w-6 h-6 fill-current" />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-slate-500 ms-2">
                                        ({modalRating} {isArabic ? "نجوم" : "stars"})
                                    </span>
                                </div>
                            </div>

                            {/* Associated Catalog Product */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isArabic ? "ربط بصنف من الكتالوج (اختياري)" : "Link Catalog Product (Optional)"}
                                </label>

                                {selectedProduct ? (
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/20 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                                                <ResilientImage
                                                    src={(selectedProduct.images ? selectedProduct.images.split(',')[0].trim() : '') || "/placeholder.svg"}
                                                    alt={selectedProduct.name}
                                                    sizes="40px"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                                    {selectedProduct.nameAr || selectedProduct.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {selectedProduct.brandName}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProduct(null)}
                                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                        >
                                            {isArabic ? "إلغاء التحديد" : "Clear"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={modalProductSearch}
                                                onChange={(e) => setModalProductSearch(e.target.value)}
                                                placeholder={isArabic ? "ابحث عن منتج لربطه بالتقييم..." : "Search product to link..."}
                                                className="w-full ps-9 pe-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0B192C]"
                                            />
                                        </div>

                                        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900">
                                            {filteredProducts.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setSelectedProduct(p)}
                                                    className="w-full p-2 text-start flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="relative w-7 h-7 rounded-md overflow-hidden bg-slate-100 shrink-0">
                                                            <ResilientImage
                                                                src={(p.images ? p.images.split(',')[0].trim() : '') || "/placeholder.svg"}
                                                                alt={p.name}
                                                                sizes="28px"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate">
                                                            {p.nameAr || p.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                                        {isArabic ? "اختيار" : "Select"}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isArabic ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveModal}
                                disabled={!modalName.trim() || !modalFeedback.trim()}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0B192C] hover:bg-[#1e293b] text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isArabic ? "حفظ التقييم" : "Save Testimonial"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
