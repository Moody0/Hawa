"use client";

import { useEffect, useState } from "react";
import { MdClose, MdSync, MdStar, MdInfoOutline } from "react-icons/md";
import { createMainCategory, updateMainCategory } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import ImageUploadField from "../../components/ImageUploadField";
import { useLanguage } from "@/app/context/LanguageContext";

interface MainCategory {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    isFeatured: boolean;
    showInNav: boolean;
    navOrder: number;
}

interface MainCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mainCategory?: MainCategory | null;
}

export default function MainCategoryModal({ isOpen, onClose, mainCategory }: MainCategoryModalProps) {
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
        isActive: true,
        isFeatured: false,
        showInNav: true,
        navOrder: 0,
    });

    useEffect(() => {
        if (mainCategory) {
            setFormData({
                name: mainCategory.name,
                description: mainCategory.description || "",
                image: mainCategory.image || "",
                isActive: mainCategory.isActive,
                isFeatured: mainCategory.isFeatured,
                showInNav: mainCategory.showInNav ?? true,
                navOrder: mainCategory.navOrder ?? 0,
            });
        } else {
            setFormData({
                name: "",
                description: "",
                image: "",
                isActive: true,
                isFeatured: false,
                showInNav: true,
                navOrder: 0,
            });
        }
    }, [mainCategory, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const result = mainCategory
                ? await updateMainCategory(mainCategory.id, formData)
                : await createMainCategory(formData);

            if (result.success) {
                toast.success(
                    mainCategory 
                        ? (isArabic ? "تم تحديث القسم بنجاح" : "Main category updated successfully") 
                        : (isArabic ? "تم إنشاء القسم بنجاح" : "Main category created successfully")
                );
                onClose();
            } else {
                toast.error(result.error || "Failed to save");
            }
        } catch (error) {
            console.error("Error saving main category:", error);
            toast.error("Failed to save main category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C] dark:text-white">
                            {mainCategory 
                                ? (isArabic ? "تعديل القسم الرئيسي" : "Edit Main Category") 
                                : (isArabic ? "إضافة قسم رئيسي جديد" : "Add Main Category")}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                            {isArabic 
                                ? "أقسام المتجر الكبرى (مثل اللحوم، الباستا، الصوصات، المشروبات)" 
                                : "Major store departments & catalog showcases"}
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={onClose} 
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-6">
                    {/* Arabic Name */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                            {isArabic ? "اسم القسم (بالعربية)" : "Department Name (Arabic)"}
                        </span>
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={isArabic ? "مثال: لحوم باردة ومفرزات" : "e.g. مأكولات وفطور"}
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-[#0B192C] dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20"
                        />
                    </label>

                    {/* English Description / Name */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                            {isArabic ? "الاسم أو الوصف بالإنجليزية (English Title)" : "English Title / Description"}
                        </span>
                        <input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g. Cold Cuts & Meats / Sauces & Condiments"
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-[#0B192C] dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20"
                        />
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MdInfoOutline className="text-xs" />
                            {isArabic ? "يُستخدم كعنوان للقسم في وضع اللغة الإنجليزية ولتوليد رابط الصفحة" : "Used for English UI titles and SEO page slugs"}
                        </span>
                    </label>

                    {/* Image Upload */}
                    <ImageUploadField
                        label={isArabic ? "صورة القسم الرئيسية (Department Image)" : "Department Image"}
                        folder="main-categories"
                        value={formData.image}
                        onChange={(url) => setFormData({ ...formData, image: url })}
                        placeholder="https://example.com/image.jpg"
                    />

                    {/* Toggles (Active, Featured, Show in Nav) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                            formData.isActive 
                                ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20" 
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-800/50"
                        }`}>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="size-4 rounded border-gray-300 text-[#8A6305] focus:ring-[#8A6305]"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#0B192C] dark:text-white">
                                    {isArabic ? "نشط" : "Active"}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {isArabic ? "ظاهر في المتجر" : "Visible in store"}
                                </span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                            formData.isFeatured 
                                ? "border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/20" 
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-800/50"
                        }`}>
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="size-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#0B192C] dark:text-white flex items-center gap-1">
                                    <MdStar className="text-amber-500 text-sm" />
                                    <span>{isArabic ? "مميز" : "Featured"}</span>
                                </span>
                                <span className="text-[10px] text-amber-600/90 dark:text-amber-400">
                                    {isArabic ? "يظهر في (تسوق حسب الفئة)" : "Shop By Category"}
                                </span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                            formData.showInNav 
                                ? "border-[#0B192C]/40 bg-[#0B192C]/5 dark:border-white/20 dark:bg-white/5" 
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-800/50"
                        }`}>
                            <input
                                type="checkbox"
                                checked={formData.showInNav}
                                onChange={(e) => setFormData({ ...formData, showInNav: e.target.checked })}
                                className="size-4 rounded border-gray-300 text-[#0B192C] focus:ring-[#0B192C]"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#0B192C] dark:text-white">
                                    {isArabic ? "القائمة الرئيسية" : "Navbar"}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {isArabic ? "ضمن الميجا منيو" : "In top header menu"}
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Navbar / Display Order */}
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                            {isArabic ? "ترتيب العرض (Display Order)" : "Display Order (0 = First)"}
                        </span>
                        <input
                            type="number"
                            value={formData.navOrder}
                            onChange={(e) => setFormData({ ...formData, navOrder: parseInt(e.target.value) || 0 })}
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-[#0B192C] dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20"
                        />
                        <span className="text-[10px] text-slate-400">
                            {isArabic ? "الرقم الأقل يظهر أولاً في الشريط العلوي وقسم الفئات المميزة" : "Lower number appears first on the website"}
                        </span>
                    </label>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-sm"
                        >
                            {isArabic ? "إلغاء" : "Cancel"}
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] px-4 py-2.5 font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
                        >
                            {isSubmitting && <MdSync className="animate-spin text-base" />}
                            <span>
                                {mainCategory 
                                    ? (isArabic ? "حفظ التعديلات" : "Save Changes") 
                                    : (isArabic ? "إضافة القسم" : "Create Department")}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
