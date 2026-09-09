"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, ChevronDown, RefreshCw, CheckCircle2, UploadCloud } from 'lucide-react';
import { createProduct, updateProduct } from "../../../../lib/admin-actions";
import { useLanguage } from "@/app/context/LanguageContext";
import { toast } from "react-hot-toast";
import SearchableCombobox from "../../components/SearchableCombobox";

interface Category {
    id: string;
    name: string;
    brandId: string;
    mainCategoryId?: string | null;
}

interface Brand {
    id: string;
    name: string;
    group: string;
    isActive?: boolean;
    mainCategoryId?: string | null;
}

interface MainCategory {
    id: string;
    name: string;
    slug?: string;
}

interface Product {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    description: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    categoryId: string;
    mainCategoryId?: string | null;
    price: number;
    discountPrice: number | null;
    discountType: string | null;
    discountValue: number | null;
    stock: number;
    options?: string | null;
    sku: string | null;
    images: string;
    brandId: string;
    packaging?: string | null;
    itemsPerPackage?: string | null;
    minOrder?: number | null;
    hidePrice?: boolean;
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    brands: Brand[];
    mainCategories?: MainCategory[];
    product?: Product | null;
}

export default function AddProductModal({ isOpen, onClose, categories, brands, mainCategories = [], product }: AddProductModalProps) {
    const { t, language } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        nameAr: "",
        nameEn: "",
        description: "",
        descriptionAr: "",
        descriptionEn: "",
        mainCategoryId: "",
        brandId: brands[0]?.id || "",
        categoryId: "",
        price: "",
        discountType: "NONE", // NONE, PERCENTAGE, FIXED
        discountValue: "",
        stock: "",
        options: "",
        sku: "",
        images: "", // Comma separated links
        packaging: "طرد",
        itemsPerPackage: "",
        minOrder: "1",
        hidePrice: false,
    });

    const [imageLink, setImageLink] = useState("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProductFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploadingImage(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith("image/")) continue;
                const fd = new FormData();
                fd.append("file", file);
                fd.append("folder", "products");
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (res.ok && data.url) {
                    uploadedUrls.push(data.url);
                }
            }
            if (uploadedUrls.length > 0) {
                const currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
                const newImages = [...currentImages, ...uploadedUrls].filter(Boolean).join(',');
                setFormData(prev => ({ ...prev, images: newImages }));
                toast.success(language === 'ar' ? `تم رفع ${uploadedUrls.length} صورة بنجاح` : `Uploaded ${uploadedUrls.length} image(s)`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(language === 'ar' ? "فشل رفع الصورة" : "Failed to upload image");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Effect to pre-fill data when editing
    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                name: product.name,
                nameAr: product.nameAr || "",
                nameEn: product.nameEn || product.name || "",
                description: product.description || "",
                descriptionAr: product.descriptionAr || "",
                descriptionEn: product.descriptionEn || product.description || "",
                mainCategoryId: product.mainCategoryId || "",
                brandId: product.brandId,
                categoryId: product.categoryId,
                price: product.price.toString(),
                discountType: product.discountType || "NONE",
                discountValue: product.discountValue?.toString() || "",
                stock: product.stock.toString(),
                options: product.options || "",
                sku: product.sku || "",
                images: product.images,
                packaging: product.packaging || "طرد",
                itemsPerPackage: product.itemsPerPackage || "",
                minOrder: (product.minOrder || 1).toString(),
                hidePrice: Boolean(product.hidePrice),
            });
        } else if (isOpen) {
            setFormData({
                name: "",
                nameAr: "",
                nameEn: "",
                description: "",
                descriptionAr: "",
                descriptionEn: "",
                mainCategoryId: mainCategories[0]?.id || "",
                brandId: brands[0]?.id || "",
                categoryId: categories[0]?.id || "",
                price: "",
                discountType: "NONE",
                discountValue: "",
                stock: "",
                options: "",
                sku: "",
                images: "",
                packaging: "طرد",
                itemsPerPackage: "",
                minOrder: "1",
                hidePrice: false,
            });
        }
    }, [product, isOpen, brands, categories, mainCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const primaryName = formData.nameEn || formData.name || formData.nameAr;
        if (!primaryName || !formData.brandId || !formData.categoryId || !formData.price || !formData.images) {
            toast.error(t("admin.addProductModal.fillRequiredFields") || "Please fill all required fields");
            return;
        }

        setIsLoading(true);
        try {
            let calculatedDiscountPrice = null;
            if (formData.discountType === "FIXED" && formData.discountValue) {
                calculatedDiscountPrice = parseFloat(formData.discountValue);
            } else if (formData.discountType === "PERCENTAGE" && formData.discountValue) {
                const price = parseFloat(formData.price);
                const percent = parseFloat(formData.discountValue);
                calculatedDiscountPrice = price - (price * percent / 100);
            }

            const formDataToSubmit = {
                ...formData,
                name: primaryName,
                nameAr: formData.nameAr || null,
                nameEn: formData.nameEn || primaryName,
                description: formData.descriptionEn || formData.description || formData.descriptionAr || null,
                descriptionAr: formData.descriptionAr || null,
                descriptionEn: formData.descriptionEn || formData.description || null,
                price: parseFloat(formData.price) || 0,
                discountPrice: calculatedDiscountPrice,
                discountValue: formData.discountType === "NONE" ? null : parseFloat(formData.discountValue),
                stock: parseInt(formData.stock) || 0,
                options: formData.options || null,
                mainCategoryId: formData.mainCategoryId || null,
                packaging: formData.packaging || "طرد",
                itemsPerPackage: formData.itemsPerPackage || null,
                minOrder: parseInt(formData.minOrder) || 1,
                hidePrice: formData.hidePrice,
            };

            const result = product
                ? await updateProduct(product.id, formDataToSubmit)
                : await createProduct(formDataToSubmit);

            if (result.success) {
                toast.success(product ? (t("admin.productUpdated") || "Product updated") : (t("admin.productCreated") || "Product created"));
                onClose();
            } else {
                toast.error(result.error || (product ? "Failed to update product" : "Failed to create product"));
            }
        } catch (err) {
            console.error(product ? "Error updating product:" : "Error creating product:", err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const addImageLink = () => {
        if (!imageLink.trim()) return;
        const currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
        if (!currentImages.includes(imageLink.trim())) {
            const newImages = [...currentImages, imageLink.trim()].filter(Boolean).join(',');
            setFormData({ ...formData, images: newImages });
        }
        setImageLink("");
    };

    const removeImage = (url: string) => {
        const newImages = formData.images.split(',').filter((img: string) => img !== url).join(',');
        setFormData({ ...formData, images: newImages });
    };

    const filteredCategories = categories.filter((category) => !formData.brandId || category.brandId === formData.brandId);

    const brandOptions = useMemo(
        () => brands.map((b) => ({ value: b.id, label: b.name })),
        [brands]
    );

    const categoryOptions = useMemo(
        () => filteredCategories.map((c) => ({ value: c.id, label: c.name })),
        [filteredCategories]
    );

    const mainCategoryOptions = useMemo(
        () => (mainCategories || []).map((mc) => ({ value: mc.id, label: mc.name })),
        [mainCategories]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-text-main/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-surface-dark w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-extrabold text-text-main dark:text-white tracking-tight">
                            {product ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
                        </h3>
                        <p className="text-sm text-text-sub dark:text-gray-400">
                            {product ? (language === 'ar' ? 'تحديث تفاصيل المنتج وبيانات الجملة' : 'Update product details and wholesale data') : (language === 'ar' ? 'أدخل تفاصيل وبيانات المنتج بالعربي والانجليزي' : 'Enter bilingual product details and wholesale specifications')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-sub dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="text-[24px]" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Images Section */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                            {language === 'ar' ? 'صور المنتج (Images)' : 'Product Images'}
                            <span className="block text-[10px] text-primary/70 font-normal">
                                {language === 'ar' ? 'أدخل روابط الصور أو أضف رابط صورة مباشر' : 'Paste direct image URLs and click Add'}
                            </span>
                        </label>

                        {/* Image Gallery */}
                        {formData.images && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {formData.images.split(',').filter(Boolean).map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden group">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        
                                        {/* Main Image Badge */}
                                        {index === 0 && (
                                            <div className="absolute top-2 start-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                                                {language === 'ar' ? 'الرئيسية' : 'Main'}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => removeImage(url)}
                                            className="absolute top-1 end-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                                        >
                                            <X className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingImage}
                                    className="px-4 h-12 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                    {isUploadingImage ? (
                                        <>
                                            <RefreshCw className="text-lg animate-spin text-[#8A6305]" />
                                            <span>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="text-lg text-[#8A6305]" />
                                            <span>{language === 'ar' ? 'رفع صور من الجهاز' : 'Upload from PC'}</span>
                                        </>
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleProductFileUpload(e.target.files)}
                                    className="hidden"
                                />
                                <div className="flex-1 flex gap-2">
                                    <input
                                        className="flex-1 h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                        placeholder={language === 'ar' ? 'أو ضع رابط صورة هنا (https://...)' : 'Or paste image URL here (https://...)'}
                                        type="text"
                                        value={imageLink}
                                        onChange={(e) => setImageLink(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageLink())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addImageLink}
                                        className="px-4 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                                    >
                                        {language === 'ar' ? 'إضافة رابط' : 'Add Link'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Names (Bilingual) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 flex items-center gap-1">
                                {language === 'ar' ? 'اسم المنتج بالعربي (Name ar)' : 'Arabic Product Name (Name ar)'} <span className="text-primary">*</span>
                            </label>
                            <input
                                className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none text-right"
                                placeholder="مثال: معكرونة دي سيكو سباغيتي رقم 12"
                                type="text"
                                dir="rtl"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value, name: formData.nameEn || e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 flex items-center gap-1">
                                {language === 'ar' ? 'اسم المنتج بالانجليزي (Name en)' : 'English Product Name (Name en)'} <span className="text-primary">*</span>
                            </label>
                            <input
                                className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                placeholder="e.g. De Cecco Spaghetti No.12 500g"
                                type="text"
                                required
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value, name: e.target.value || formData.nameAr })}
                            />
                        </div>

                        {/* Descriptions (Bilingual) */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'الوصف بالعربي (description ar)' : 'Arabic Description (description ar)'}
                            </label>
                            <textarea
                                className="w-full rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 py-3 text-sm font-medium leading-relaxed dark:text-white outline-none text-right"
                                placeholder="صف مواصفات وتفاصيل المنتج وتعبئته..."
                                dir="rtl"
                                rows={3}
                                value={formData.descriptionAr}
                                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'الوصف بالانجليزي (description en)' : 'English Description (description en)'}
                            </label>
                            <textarea
                                className="w-full rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 py-3 text-sm font-medium leading-relaxed dark:text-white outline-none"
                                placeholder="Describe product details, packaging specifications..."
                                rows={3}
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Main Category, Brand, Sub Category */}
                        {mainCategories.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                    {language === 'ar' ? 'القسم الرئيسي (Main Category)' : 'Main Category'}
                                </label>
                                <SearchableCombobox
                                    options={mainCategoryOptions}
                                    value={formData.mainCategoryId || ""}
                                    onChange={(val) => setFormData({ ...formData, mainCategoryId: val })}
                                    placeholder={language === 'ar' ? '-- اختر القسم الرئيسي --' : '-- Select Main Category --'}
                                    isArabic={language === 'ar'}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'الشركة / الماركة (Brand Name)' : 'Brand Name'} <span className="text-primary">*</span>
                            </label>
                            <SearchableCombobox
                                options={brandOptions}
                                value={formData.brandId}
                                onChange={(val) => setFormData({ ...formData, brandId: val, categoryId: "" })}
                                placeholder={language === 'ar' ? '-- اختر الماركة / الشركة --' : '-- Select Brand --'}
                                required
                                isArabic={language === 'ar'}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'الفئة الفرعية (Sub Category)' : 'Sub Category'} <span className="text-primary">*</span>
                            </label>
                            <SearchableCombobox
                                options={categoryOptions}
                                value={formData.categoryId}
                                onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                placeholder={language === 'ar' ? '-- اختر الفئة --' : '-- Select Sub Category --'}
                                required
                                isArabic={language === 'ar'}
                                disabled={categoryOptions.length === 0}
                            />
                        </div>

                        {/* Options / Variants */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'الخيارات والأحجام (Options / Variants)' : 'Options / Variants'}
                            </label>
                            <input
                                className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                placeholder={language === 'ar' ? 'مفصولة بفواصل، مثل: 500g, 1kg أو شوكولا, فانيلا' : 'Comma-separated, e.g. 500g, 1kg or Vanilla, Chocolate'}
                                type="text"
                                value={formData.options}
                                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'السعر (Price)' : 'Price ($)'} <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-text-sub font-bold text-sm">$</span>
                                <input
                                    className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all ps-8 pe-4 text-sm font-bold dark:text-white outline-none"
                                    placeholder="0.00"
                                    step="0.01"
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Quantity (Stock) */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'الكمية والمخزون (Quantity / Stock)' : 'Quantity / Stock'}
                            </label>
                            <input
                                className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                placeholder="0"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>

                        {/* SKU */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                {language === 'ar' ? 'رمز المنتج (SKU)' : 'SKU Code'}
                            </label>
                            <input
                                className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                placeholder="HAWA-001"
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>

                        {/* Discounts Section */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                    {language === 'ar' ? 'نوع الخصم (Discount Type)' : 'Discount Type'}
                                </label>
                                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                                    {(["NONE", "PERCENTAGE", "FIXED"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, discountType: type, discountValue: type === "NONE" ? "" : formData.discountValue })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${formData.discountType === type
                                                ? "bg-primary text-white"
                                                : "text-text-sub hover:bg-gray-50 dark:hover:bg-gray-900"
                                                }`}
                                        >
                                            {type === "NONE" ? (language === 'ar' ? 'بدون خصم' : 'No Discount') :
                                                type === "PERCENTAGE" ? (language === 'ar' ? 'نسبة %' : 'Percentage %') :
                                                    (language === 'ar' ? 'سعر مخفض ثابت' : 'Fixed Price')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.discountType !== "NONE" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                        {formData.discountType === "PERCENTAGE" ? (language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)') : (language === 'ar' ? 'السعر بعد الخصم ($)' : 'Discount Price ($)')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-text-sub font-bold text-sm">
                                            {formData.discountType === "PERCENTAGE" ? "%" : "$"}
                                        </span>
                                        <input
                                            className="w-full h-12 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-surface-dark focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all ps-8 pe-4 text-sm font-bold dark:text-white outline-none"
                                            placeholder={formData.discountType === "PERCENTAGE" ? "20" : "15.00"}
                                            step="0.01"
                                            type="number"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* B2B Wholesale Specifications & Price Policy */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#FAF6EC] dark:bg-zinc-800/80 border border-[#8A6305]/25">
                            <div className="md:col-span-3 flex items-center justify-between border-b border-[#8A6305]/20 pb-3">
                                <div>
                                    <h4 className="text-sm font-extrabold text-[#0B192C] dark:text-[#8A6305]">
                                        {language === 'ar' ? '📦 بيانات الجملة والتعبئة وسياسة التسعير' : '📦 Wholesale Packaging & Pricing Policy'}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {language === 'ar' ? 'حدد مواصفات الطرد أو الكرتونة وإمكانية إخفاء السعر ليكون السعر عند الطلب' : 'Define package specifications and whether to hide fixed price for agency quotes'}
                                    </p>
                                </div>
                            </div>

                            {/* Packaging Type */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                    {language === 'ar' ? 'نوع التعبئة (Packaging)' : 'Packaging Type'}
                                </label>
                                <input
                                    className="w-full h-12 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                    placeholder={language === 'ar' ? 'طرد / كرتونة / صندوق' : 'Package / Carton / Box'}
                                    type="text"
                                    value={formData.packaging}
                                    onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                                />
                            </div>

                            {/* Items Per Package */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                    {language === 'ar' ? 'محتوى العبوة / الطرد' : 'Items Per Package'}
                                </label>
                                <input
                                    className="w-full h-12 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                    placeholder={language === 'ar' ? 'مثال: 6 قناني × 1 لتر أو 12 علبة' : 'e.g. 6 bottles x 1L or 12 cans'}
                                    type="text"
                                    value={formData.itemsPerPackage}
                                    onChange={(e) => setFormData({ ...formData, itemsPerPackage: e.target.value })}
                                />
                            </div>

                            {/* Minimum Order */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400">
                                    {language === 'ar' ? 'الحد الأدنى للطلب (بالطرود)' : 'Min. Order (Packages)'}
                                </label>
                                <input
                                    className="w-full h-12 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all px-4 text-sm font-medium dark:text-white outline-none"
                                    placeholder="1"
                                    type="number"
                                    min="1"
                                    value={formData.minOrder}
                                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                                />
                            </div>

                            {/* Hide Price Toggle */}
                            <div className="md:col-span-3 pt-2">
                                <label className="relative flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-[#8A6305]/30 cursor-pointer select-none hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.hidePrice}
                                        onChange={(e) => setFormData({ ...formData, hidePrice: e.target.checked })}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#0B192C] focus:ring-[#8A6305] cursor-pointer"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0B192C] dark:text-white">
                                            {language === 'ar' ? 'السعر عند الطلب (إخفاء السعر الرقمي في المتجر)' : 'Hide Price (Show "Price on Inquiry / Set by Agency")'}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {language === 'ar' 
                                                ? 'عند تفعيل هذا الخيار، سيظهر للمحلات "السعر يحدد حسب الوكالة" بدلاً من الرقم، مع بقاء زر الإضافة للطلب عبر واتساب نشطاً.'
                                                : 'When enabled, store visitors see "Price on Inquiry" instead of numbers, while still being able to order wholesale via WhatsApp.'}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50/50 dark:bg-black/20 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 h-12 rounded-xl text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/[0.04] dark:border-white/[0.04] dark:hover:border-gray-700 transition-all cursor-pointer"
                    >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] disabled:opacity-50 text-white h-12 px-8 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm transform active:scale-[0.98] cursor-pointer"
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin text-[20px]" />
                        ) : (
                            <CheckCircle2 className="text-[20px]" />
                        )}
                        {isLoading ? (product ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')) : (product ? (language === 'ar' ? 'تحديث المنتج' : 'Update Product') : (language === 'ar' ? 'حفظ المنتج' : 'Save Product'))}
                    </button>
                </div>
            </div>
        </div>
    );
}
