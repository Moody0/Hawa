"use client";

import { useEffect, useState } from "react";
import { MdClose, MdSync, MdStar } from "react-icons/md";
import { createBrand, updateBrand } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";
import ImageUploadField from "../../components/ImageUploadField";

interface Brand {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    group?: "MAIN" | "DIFFERENT";
    isActive: boolean;
    isFeatured: boolean;
    mainCategoryId?: string | null;
}

interface MainCategoryOption {
    id: string;
    name: string;
}

interface BrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brand?: Brand | null;
}

export default function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mainCategories, setMainCategories] = useState<MainCategoryOption[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
        group: "MAIN" as "MAIN" | "DIFFERENT",
        isActive: true,
        isFeatured: false,
        mainCategoryId: "",
    });

    useEffect(() => {
        fetch("/api/main-categories")
            .then((res) => res.json())
            .then((data) => setMainCategories(data))
            .catch(() => setMainCategories([]));
    }, []);

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name,
                description: brand.description || "",
                image: brand.image || "",
                group: brand.group || "MAIN",
                isActive: brand.isActive,
                isFeatured: brand.isFeatured,
                mainCategoryId: brand.mainCategoryId || "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                image: "",
                group: "MAIN",
                isActive: true,
                isFeatured: false,
                mainCategoryId: "",
            });
        }
    }, [brand, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                group: "MAIN" as const,
                isFeatured: formData.isFeatured,
                mainCategoryId: formData.mainCategoryId || undefined,
            };
            const result = brand ? await updateBrand(brand.id, payload) : await createBrand(payload);

            if (result.success) {
                toast.success(
                    brand 
                        ? (isArabic ? 'تم تحديث الماركة بنجاح' : 'Brand updated successfully') 
                        : (isArabic ? 'تم إنشاء الماركة بنجاح' : 'Brand created successfully')
                );
                onClose();
            } else {
                toast.error(result.error || t("admin.brandSaveError") || "Failed to save");
            }
        } catch (error) {
            console.error("Error saving brand:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
            
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C] dark:text-white">
                            {brand ? (isArabic ? "تعديل العلامة التجارية" : "Edit Brand") : (isArabic ? "إضافة علامة تجارية جديدة" : "Add Brand")}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                            {isArabic ? "الشركات الموزعة والمصنعة المعتمدة" : "Manufacturer & distribution brand profiles"}
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

                <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-6">
                    {/* Brand Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                            {isArabic ? 'اسم العلامة التجارية' : 'Brand Name'}
                        </label>
                        <input
                            required
                            value={formData.name}
                            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                            placeholder="e.g. Captain Fisher / De Cecco / Tat"
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-[#0B192C] dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20"
                        />
                    </div>

                    {/* Department Linked */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                            {isArabic ? 'القسم الرئيسي التابعة له (Department)' : 'Main Department'}
                        </label>
                        <select
                            value={formData.mainCategoryId}
                            onChange={(event) => setFormData({ ...formData, mainCategoryId: event.target.value })}
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-[#0B192C] dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20 cursor-pointer"
                        >
                            <option value="">{isArabic ? 'عام / غير محدد' : 'General / None'}</option>
                            {mainCategories.map((mc) => (
                                <option key={mc.id} value={mc.id}>{mc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brand Logo Upload */}
                    <ImageUploadField
                        label={isArabic ? 'شعار الماركة (Brand Logo)' : 'Brand Logo'}
                        folder="brands"
                        value={formData.image}
                        onChange={(url) => setFormData({ ...formData, image: url })}
                        placeholder="https://example.com/brand-logo.png"
                    />

                    {/* Status Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${
                            formData.isActive 
                                ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20" 
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-800/50"
                        }`}>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                                className="size-4 rounded border-gray-300 text-[#8A6305] focus:ring-[#8A6305]"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#0B192C] dark:text-white">
                                    {isArabic ? 'نشط' : 'Active'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {isArabic ? 'ظاهر في المتجر' : 'Visible in store'}
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
                                onChange={(event) => setFormData({ ...formData, isFeatured: event.target.checked })}
                                className="size-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-[#0B192C] dark:text-white flex items-center gap-1">
                                    <MdStar className="text-amber-500 text-sm" />
                                    <span>{isArabic ? 'شريك مميز' : 'Featured Partner'}</span>
                                </span>
                                <span className="text-[10px] text-amber-600/90 dark:text-amber-400">
                                    {isArabic ? 'يظهر في شريط الشركاء بالرئيسية' : 'Featured in homepage partners rail'}
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                            {isArabic ? 'نبذة عن الماركة (Description)' : 'Brand Description'}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                            rows={3}
                            placeholder={isArabic ? 'نبذة مختصرة عن الشركة والمنتجات...' : 'Brief summary of the brand...'}
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-[#0B192C] dark:text-white outline-none transition-all focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-sm cursor-pointer"
                        >
                            {isArabic ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] px-4 py-2.5 font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 text-sm cursor-pointer"
                        >
                            {isSubmitting && <MdSync className="animate-spin text-base" />}
                            <span>{brand ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : (isArabic ? 'إضافة الماركة' : 'Create Brand')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
