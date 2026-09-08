"use client";

import { useState, useRef } from "react";
import { UploadCloud, Link, X, RefreshCw, Image } from 'lucide-react';
import { toast } from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";

interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    folder?: string;
    placeholder?: string;
    required?: boolean;
}

export default function ImageUploadField({
    value,
    onChange,
    label,
    folder = "brands",
    placeholder = "https://...",
    required = false,
}: ImageUploadFieldProps) {
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const [isUploading, setIsUploading] = useState(false);
    const [mode, setMode] = useState<"file" | "url">(value && value.startsWith("http") ? "url" : "file");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validation for image type and size (< 10MB)
        if (!file.type.startsWith("image/")) {
            toast.error(isArabic ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)" : "Please select a valid image file");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error(isArabic ? "حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)" : "File size is too large (max 10MB)");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
                toast.success(isArabic ? "تم رفع الصورة بنجاح" : "Image uploaded successfully");
            } else {
                toast.error(data.error || (isArabic ? "فشل رفع الصورة" : "Failed to upload image"));
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(isArabic ? "حدث خطأ أثناء رفع الصورة" : "An error occurred during upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                {label && (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                        {label} {required && <span className="text-red-500">*</span>}
                    </span>
                )}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                        type="button"
                        onClick={() => setMode("file")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                            mode === "file"
                                ? "bg-white dark:bg-slate-700 text-[#0B192C] dark:text-[#8A6305] shadow-xs"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                        }`}
                    >
                        <UploadCloud className="text-sm" />
                        <span>{isArabic ? "رفع من الجهاز" : "From PC"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("url")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                            mode === "url"
                                ? "bg-white dark:bg-slate-700 text-[#0B192C] dark:text-[#8A6305] shadow-xs"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                        }`}
                    >
                        <Link className="text-sm" />
                        <span>{isArabic ? "رابط خارجي" : "URL Link"}</span>
                    </button>
                </div>
            </div>

            {/* If an image is selected/uploaded, show preview with remove button */}
            {value ? (
                <div className="relative group rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 flex items-center gap-4">
                    <div className="size-20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 relative">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {value.startsWith("/") ? value.split("/").pop() : value}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                            {isArabic ? "تم اختيار الصورة جاهزة" : "Image selected"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-xs font-bold text-[#0B192C] dark:text-[#8A6305] hover:underline cursor-pointer disabled:opacity-50"
                            >
                                {isArabic ? "تغيير الصورة" : "Change Image"}
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                            >
                                {isArabic ? "حذف" : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : mode === "file" ? (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
                        isUploading
                            ? "border-[#0B192C] bg-slate-50 dark:bg-slate-900/50 opacity-70 cursor-not-allowed"
                            : "border-slate-300 dark:border-slate-700 hover:border-[#0B192C] hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    }`}
                >
                    {isUploading ? (
                        <>
                            <RefreshCw className="text-3xl text-[#0B192C] dark:text-[#8A6305] animate-spin" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {isArabic ? "جاري رفع الصورة..." : "Uploading image..."}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="size-10 rounded-full bg-[#0B192C]/5 dark:bg-white/5 flex items-center justify-center text-[#0B192C] dark:text-[#8A6305]">
                                <UploadCloud className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white">
                                    {isArabic ? "انقر لاختيار صورة من جهازك" : "Click to browse from your PC"}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {isArabic ? "أو اسحب وأفلت الصورة هنا (PNG, JPG, WEBP)" : "or drag and drop file here (PNG, JPG, WEBP)"}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-[#0B192C] focus:ring-2 focus:ring-[#0B192C]/15"
                    />
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
