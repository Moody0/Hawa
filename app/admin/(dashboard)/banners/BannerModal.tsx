"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, Image, Settings, Languages } from 'lucide-react';
import { createBanner, updateBanner, BannerInput } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";
import ImageUploadField from "../../components/ImageUploadField";

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    banner?: {
        id: string;
        title: string | null;
        subtitle: string | null;
        titleAr: string | null;
        subtitleAr: string | null;
        image: string;
        buttonText: string | null;
        buttonTextAr?: string | null;
        link: string | null;
        badge: string | null;
        badgeAr?: string | null;
        isActive: boolean;
    } | null;
}

export default function BannerModal({ isOpen, onClose, banner }: BannerModalProps) {
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';

    const [activeTab, setActiveTab] = useState<"content" | "media">("content");

    // Form fields
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [titleAr, setTitleAr] = useState("");
    const [subtitleAr, setSubtitleAr] = useState("");
    const [badge, setBadge] = useState("Certified Wholesale");
    const [badgeAr, setBadgeAr] = useState("توزيع جملة معتمد");
    const [buttonText, setButtonText] = useState("Explore Products");
    const [buttonTextAr, setButtonTextAr] = useState("تصفح المنتجات");
    const [image, setImage] = useState("");
    const [link, setLink] = useState("/products");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (banner) {
            setTitle(banner.title || "");
            setSubtitle(banner.subtitle || "");
            setTitleAr(banner.titleAr || "");
            setSubtitleAr(banner.subtitleAr || "");
            setImage(banner.image || "");
            setBadge(banner.badge || "Certified Wholesale");
            setBadgeAr(banner.badgeAr || "توزيع جملة معتمد");
            setButtonText(banner.buttonText || "Explore Products");
            setButtonTextAr(banner.buttonTextAr || "تصفح المنتجات");
            setLink(banner.link || "/products");
            setIsActive(banner.isActive);
        } else {
            setTitle("");
            setSubtitle("");
            setTitleAr("");
            setSubtitleAr("");
            setImage("");
            setBadge("Certified Wholesale");
            setBadgeAr("توزيع جملة معتمد");
            setButtonText("Explore Products");
            setButtonTextAr("تصفح المنتجات");
            setLink("/products");
            setIsActive(true);
        }
        setActiveTab("content");
    }, [banner, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            toast.error(isArabic ? "يرجى رفع أو إضافة صورة للبنر" : "Please upload a banner image");
            setActiveTab("media");
            return;
        }

        setIsSubmitting(true);

        try {
            const data: BannerInput = {
                title,
                subtitle: subtitle || undefined,
                titleAr,
                subtitleAr: subtitleAr || undefined,
                badge: badge || undefined,
                badgeAr: badgeAr || undefined,
                buttonText: buttonText || undefined,
                buttonTextAr: buttonTextAr || undefined,
                image,
                link: link || undefined,
                isActive,
            };

            const result = banner ? await updateBanner(banner.id, data) : await createBanner(data);

            if (result.success) {
                toast.success(banner ? (isArabic ? "تم تحديث البنر بنجاح" : "Banner updated successfully") : (isArabic ? "تم إنشاء البنر بنجاح" : "Banner created successfully"));
                onClose();
            } else {
                toast.error(result.error || (isArabic ? "فشل حفظ البنر" : "Failed to save banner"));
            }
        } catch (error) {
            console.error("Error submitting banner:", error);
            toast.error(isArabic ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
            
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {banner ? (isArabic ? "تعديل بنر الصفحة الرئيسية" : "Edit Home Banner") : (isArabic ? "إضافة بنر جديد" : "Add New Banner")}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isArabic ? "تخصيص العناوين، الشارات، الأزرار باللغتين العربية والإنجليزية" : "Customize bilingual titles, badges, button CTAs, and banner media"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="text-xl" />
                    </button>
                </div>

                {/* Tabs for Seamless Navigation */}
                <div className="flex border-b border-slate-100 dark:border-white/10 px-6 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                        type="button"
                        onClick={() => setActiveTab("content")}
                        className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                            activeTab === "content"
                                ? "border-[#0B192C] text-[#0B192C] dark:border-[#8A6305] dark:text-[#8A6305]"
                                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <Languages className="text-base" />
                        <span>{isArabic ? "النصوص والترجمة (العربية والانجليزية)" : "Bilingual Text & Content"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("media")}
                        className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                            activeTab === "media"
                                ? "border-[#0B192C] text-[#0B192C] dark:border-[#8A6305] dark:text-[#8A6305]"
                                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <Image className="text-base" />
                        <span>{isArabic ? "صورة البنر والرابط" : "Media & Link Settings"}</span>
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {activeTab === "content" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: English Content */}
                            <div className="space-y-4 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 p-4">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                        🇬🇧 English Content
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        Banner Title (EN) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Wholesale Global Food Brands"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        Subtitle (EN)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        placeholder="Brief descriptive highlight..."
                                        className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        Badge (EN)
                                    </label>
                                    <input
                                        type="text"
                                        value={badge}
                                        onChange={(e) => setBadge(e.target.value)}
                                        placeholder="e.g. Certified Wholesale"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        Button Text (EN)
                                    </label>
                                    <input
                                        type="text"
                                        value={buttonText}
                                        onChange={(e) => setButtonText(e.target.value)}
                                        placeholder="e.g. Explore Products"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Arabic Content */}
                            <div className="space-y-4 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 p-4" dir="rtl">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                        🇸🇦 المحتوى بالعربي
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        عنوان البنر (العربية) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={titleAr}
                                        onChange={(e) => setTitleAr(e.target.value)}
                                        placeholder="مثال: توزيع بضائع من كبرى الشركات العالمية"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        الوصف الفرعي (العربية)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={subtitleAr}
                                        onChange={(e) => setSubtitleAr(e.target.value)}
                                        placeholder="نبذة وصفية تسويقية..."
                                        className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        الشارة الترويجية (العربية)
                                    </label>
                                    <input
                                        type="text"
                                        value={badgeAr}
                                        onChange={(e) => setBadgeAr(e.target.value)}
                                        placeholder="مثال: توزيع جملة معتمد"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        نص الزر (العربية)
                                    </label>
                                    <input
                                        type="text"
                                        value={buttonTextAr}
                                        onChange={(e) => setButtonTextAr(e.target.value)}
                                        placeholder="مثال: تصفح المنتجات"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Image Upload Component */}
                            <ImageUploadField
                                label={isArabic ? "صورة البنر (نسبة 16:9 أو 4:3 موصى بها)" : "Banner Image (16:9 recommended)"}
                                folder="banners"
                                value={image}
                                onChange={(url) => setImage(url)}
                                placeholder="https://..."
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                                        {isArabic ? "رابط التوجيه (Link URL)" : "Button Link URL"}
                                    </label>
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="e.g. /products or /department/beverages"
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="size-4 rounded border-gray-300 text-[#0B192C] focus:ring-[#0B192C]"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                                                {isArabic ? "تفعيل البنر (Active)" : "Banner Active"}
                                            </span>
                                            <span className="text-[11px] text-slate-400 block">
                                                {isArabic ? "إظهار البنر في الصفحة الرئيسية" : "Visible in homepage hero carousel"}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Bottom Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                            {activeTab === "content" ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("media")}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {isArabic ? "التالي: الصورة والرابط ➔" : "Next: Media & Link ➔"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("content")}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {isArabic ? "⬅ العودة للنصوص" : "⬅ Back to Content"}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                {t("admin.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white px-5 py-2.5 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting && <RefreshCw className="animate-spin text-base text-[#8A6305]" />}
                                {banner ? (isArabic ? "تحديث البنر" : "Update Banner") : (isArabic ? "إنشاء البنر" : "Create Banner")}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
