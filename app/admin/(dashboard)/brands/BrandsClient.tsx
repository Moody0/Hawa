"use client";

import { useMemo, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import BrandModal from "./BrandModal";
import { deleteBrand, toggleBrandActive, toggleBrandFeatured } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { 
    MdAdd, 
    MdDelete, 
    MdEdit, 
    MdImage, 
    MdSearch, 
    MdStar, 
    MdStarBorder, 
    MdSync, 
    MdToggleOff, 
    MdToggleOn,
    MdVisibility,
    MdStorefront,
    MdShoppingBag,
    MdCategory,
    MdAccountTree
} from "react-icons/md";
import RelatedItemsModal from "../components/RelatedItemsModal";

interface Brand {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    group?: "MAIN" | "DIFFERENT";
    isActive: boolean;
    isFeatured: boolean;
    mainCategoryId?: string | null;
    mainCategory?: {
        id: string;
        name: string;
    } | null;
    _count: {
        products: number;
        categories: number;
    };
}

export default function BrandsClient({ brands: initialBrands }: { brands: Brand[] }) {
    const { openSidebar } = useAdminSidebar();
    const { data: session } = useSession() || {};
    const { t, language } = useLanguage();
    const isArabic = language === 'ar';
    const canManage = session?.user?.role === "SUPER_ADMIN" || session?.user?.canManageBrands;
    const canDelete = session?.user?.role === "SUPER_ADMIN" || session?.user?.canDeleteBrands;

    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "FEATURED" | "ACTIVE" | "DRAFT">("ALL");
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const [relatedModalInfo, setRelatedModalInfo] = useState<{
        isOpen: boolean;
        type: "products" | "categories";
        entityId: string;
        entityName: string;
    }>({
        isOpen: false,
        type: "products",
        entityId: "",
        entityName: ""
    });

    // Counts for stat tabs
    const stats = useMemo(() => {
        return {
            total: brands.length,
            featured: brands.filter(b => b.isFeatured).length,
            active: brands.filter(b => b.isActive).length,
            draft: brands.filter(b => !b.isActive).length,
        };
    }, [brands]);

    const filteredBrands = useMemo(() => {
        return brands.filter((brand) => {
            const matchesSearch = 
                brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (brand.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (brand.mainCategory?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                brand.slug.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!matchesSearch) return false;

            if (statusFilter === "FEATURED") return brand.isFeatured;
            if (statusFilter === "ACTIVE") return brand.isActive;
            if (statusFilter === "DRAFT") return !brand.isActive;
            return true;
        });
    }, [brands, searchQuery, statusFilter]);

    const handleAdd = () => {
        setSelectedBrand(null);
        setIsModalOpen(true);
    };

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand);
        setIsModalOpen(true);
    };

    const handleDelete = async (brand: Brand) => {
        if (!confirm(isArabic ? `هل أنت متأكد من حذف العلامة التجارية "${brand.name}"؟` : `Are you sure you want to delete "${brand.name}"?`)) return;

        const result = await deleteBrand(brand.id);
        if (result.success) {
            setBrands(prev => prev.filter(b => b.id !== brand.id));
            toast.success(t("admin.brandDeleted") || "Brand deleted");
        } else {
            toast.error(result.error || "Failed to delete brand");
        }
    };

    const handleToggleActive = async (brand: Brand) => {
        setLoadingMap((current) => ({ ...current, [`active:${brand.id}`]: true }));
        const nextState = !brand.isActive;
        // Optimistic update
        setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, isActive: nextState } : b));

        const result = await toggleBrandActive(brand.id, nextState);
        if (result.success) {
            toast.success(nextState ? (isArabic ? 'تم تفعيل الماركة' : 'Brand activated') : (isArabic ? 'تم تعطيل الماركة' : 'Brand deactivated'));
        } else {
            setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, isActive: !nextState } : b));
            toast.error(result.error || "Failed to update status");
        }
        setLoadingMap((current) => ({ ...current, [`active:${brand.id}`]: false }));
    };

    const handleToggleFeatured = async (brand: Brand) => {
        setLoadingMap((current) => ({ ...current, [`featured:${brand.id}`]: true }));
        const nextState = !brand.isFeatured;
        // Optimistic update
        setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, isFeatured: nextState } : b));

        const result = await toggleBrandFeatured(brand.id, nextState);
        if (result.success) {
            toast.success(
                nextState 
                    ? (isArabic ? 'تمت إضافة الماركة إلى الشركاء المميزين ⭐' : 'Brand added to Featured Partners ⭐') 
                    : (isArabic ? 'تمت إزالة الماركة من المميزة' : 'Brand removed from Featured')
            );
        } else {
            setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, isFeatured: !nextState } : b));
            toast.error(result.error || "Failed to update featured status");
        }
        setLoadingMap((current) => ({ ...current, [`featured:${brand.id}`]: false }));
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-[#F8F9FA] dark:bg-[#0B0F14]">
            <AdminHeader title={t("admin.brands")} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-[1440px]">
                    {/* Header Top Bar */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#8A6305]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#8A6305] dark:text-[#8A6305]">
                                    {isArabic ? 'إدارة العلامات التجارية والشركاء' : 'Official Brands & Manufacturer Partners'}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                                {t("admin.brandManagement")}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                                {isArabic 
                                    ? 'إدارة الشركات المصنعة، شعارات الماركات، صفحات العلامات التجارية، والشركاء المميزين في الصفحة الرئيسية.' 
                                    : 'Manage manufacturer brands, logos, brand storefronts, and featured partner rails.'}
                            </p>
                        </div>

                        {/* Search & Add Action */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                                <MdSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={isArabic ? 'بحث بالاسم أو القسم...' : 'Search brands...'}
                                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 ps-9 pe-4 text-sm text-[#0B192C] dark:text-white outline-none focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20 shadow-2xs"
                                />
                            </div>

                            {canManage && (
                                <button 
                                    onClick={handleAdd} 
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] px-5 text-sm font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <MdAdd className="text-xl" />
                                    <span>{t("admin.addBrand")}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs Bar */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === "ALL"
                                    ? "bg-[#0B192C] text-white dark:bg-white dark:text-[#0B192C] shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]"
                            }`}
                        >
                            <span>{isArabic ? 'كافة الماركات' : 'All Brands'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === "ALL" ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-slate-100 dark:bg-zinc-700 text-slate-500"}`}>
                                {stats.total}
                            </span>
                        </button>

                        <button
                            onClick={() => setStatusFilter("FEATURED")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === "FEATURED"
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30 hover:border-amber-500"
                            }`}
                        >
                            <MdStar className="text-sm" />
                            <span>{isArabic ? 'الشركاء المميزين (Featured)' : 'Featured Partners'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === "FEATURED" ? "bg-white/20 text-white" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>
                                {stats.featured}
                            </span>
                        </button>

                        <button
                            onClick={() => setStatusFilter("ACTIVE")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === "ACTIVE"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30 hover:border-emerald-500"
                            }`}
                        >
                            <span>{isArabic ? 'الماركات النشطة' : 'Active'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === "ACTIVE" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"}`}>
                                {stats.active}
                            </span>
                        </button>

                        <button
                            onClick={() => setStatusFilter("DRAFT")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === "DRAFT"
                                    ? "bg-slate-700 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10 hover:border-slate-400"
                            }`}
                        >
                            <span>{isArabic ? 'المعطلة / المسودة' : 'Drafts'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === "DRAFT" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-500"}`}>
                                {stats.draft}
                            </span>
                        </button>
                    </div>

                    <BrandModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        brand={selectedBrand}
                    />

                    <RelatedItemsModal
                        isOpen={relatedModalInfo.isOpen}
                        onClose={() => setRelatedModalInfo(prev => ({ ...prev, isOpen: false }))}
                        type={relatedModalInfo.type}
                        entityType="brandId"
                        entityId={relatedModalInfo.entityId}
                        entityName={relatedModalInfo.entityName}
                    />

                    {/* Brands Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                        {filteredBrands.map((brand) => {
                            const isFeatLoading = loadingMap[`featured:${brand.id}`];

                            return (
                                <article 
                                    key={brand.id} 
                                    className={`relative group flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 hover:shadow-md ${
                                        brand.isFeatured 
                                            ? "border-amber-400/60 dark:border-amber-500/30 ring-1 ring-amber-400/20" 
                                            : "border-slate-200/80 dark:border-white/10"
                                    }`}
                                >
                                    {/* Top Logo / Image Box */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-100 dark:border-white/5 flex items-center justify-center p-4">
                                        {brand.image ? (
                                            <img 
                                                src={brand.image} 
                                                alt={brand.name} 
                                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <MdImage className="text-5xl text-slate-300 dark:text-zinc-600" />
                                        )}

                                        {/* Main Category Badge (Top Left) */}
                                        {brand.mainCategory?.name && (
                                            <div className="absolute top-2.5 start-2.5 flex items-center gap-1 bg-[#0B192C]/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                                <MdAccountTree className="text-xs text-[#8A6305]" />
                                                <span>{brand.mainCategory.name}</span>
                                            </div>
                                        )}

                                        {/* Star Toggle Button (Top Right) */}
                                        {canManage && (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(brand)}
                                                disabled={isFeatLoading}
                                                title={brand.isFeatured ? (isArabic ? 'شريك مميز في الرئيسية (اضغط للإلغاء)' : 'Featured Partner (Click to remove)') : (isArabic ? 'اضغط لجعله شريكاً مميزاً في الصفحة الرئيسية' : 'Click to feature on Home')}
                                                className={`absolute top-2.5 end-2.5 size-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
                                                    brand.isFeatured
                                                        ? "bg-amber-500 text-white ring-2 ring-amber-300 dark:ring-amber-900 scale-105"
                                                        : "bg-black/40 hover:bg-amber-500 text-white/80 hover:text-white"
                                                }`}
                                            >
                                                {isFeatLoading ? (
                                                    <MdSync className="text-sm animate-spin" />
                                                ) : brand.isFeatured ? (
                                                    <MdStar className="text-lg" />
                                                ) : (
                                                    <MdStarBorder className="text-lg" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Content Body */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Name & Badges */}
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="min-w-0">
                                                    <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-white truncate">
                                                        {brand.name}
                                                    </h3>
                                                    {brand.description && (
                                                        <p className="text-xs font-semibold text-[#8A6305] dark:text-[#8A6305] truncate">
                                                            {brand.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                    brand.isActive 
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30" 
                                                        : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-gray-400"
                                                }`}>
                                                    {brand.isActive ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'مسودة' : 'Draft')}
                                                </span>
                                            </div>

                                            {/* Slug & Featured Pill */}
                                            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                                    /brands/{brand.slug}
                                                </span>
                                                {brand.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-md">
                                                        <MdStar className="text-xs" />
                                                        <span>{isArabic ? 'شريك مميز' : 'Featured Partner'}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Relation Counters */}
                                            <div className="flex flex-wrap gap-1.5 mb-4 text-xs font-bold">
                                                <button 
                                                    type="button"
                                                    onClick={() => setRelatedModalInfo({ isOpen: true, type: "products", entityId: brand.id, entityName: brand.name })}
                                                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 px-2.5 py-1 text-[11px] transition-colors"
                                                    title={isArabic ? 'عرض منتجات الماركة' : 'View brand products'}
                                                >
                                                    <MdShoppingBag className="text-xs" />
                                                    <span>{brand._count.products} {isArabic ? 'منتج' : 'Products'}</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    onClick={() => setRelatedModalInfo({ isOpen: true, type: "categories", entityId: brand.id, entityName: brand.name })}
                                                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 px-2.5 py-1 text-[11px] transition-colors"
                                                    title={isArabic ? 'عرض فئات الماركة' : 'View brand categories'}
                                                >
                                                    <MdCategory className="text-xs" />
                                                    <span>{brand._count.categories} {isArabic ? 'فئة' : 'Categories'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Actions Bar */}
                                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-auto">
                                            {/* Preview Link */}
                                            <a
                                                href={`/products?brand=${brand.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-gray-400 hover:text-[#8A6305] transition-colors"
                                            >
                                                <MdVisibility className="text-sm" />
                                                <span>{isArabic ? 'معاينة المتجر' : 'Preview Store'}</span>
                                            </a>

                                            {/* Edit / Active / Delete Buttons */}
                                            <div className="flex items-center gap-1">
                                                {canManage && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleToggleActive(brand)} 
                                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" 
                                                        title={isArabic ? 'تفعيل / تعطيل' : 'Toggle Active'}
                                                    >
                                                        {loadingMap[`active:${brand.id}`] ? (
                                                            <MdSync className="animate-spin text-lg" />
                                                        ) : brand.isActive ? (
                                                            <MdToggleOn className="text-2xl text-emerald-500" />
                                                        ) : (
                                                            <MdToggleOff className="text-2xl text-slate-400" />
                                                        )}
                                                    </button>
                                                )}

                                                {canManage && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleEdit(brand)} 
                                                        className="rounded-lg p-1.5 text-slate-600 dark:text-gray-300 hover:bg-[#8A6305]/10 hover:text-[#8A6305] transition-colors cursor-pointer" 
                                                        title={isArabic ? 'تعديل' : 'Edit'}
                                                    >
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(brand)} 
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors cursor-pointer" 
                                                        title={isArabic ? 'حذف' : 'Delete'}
                                                    >
                                                        <MdDelete className="text-lg" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {filteredBrands.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 mt-6">
                            <MdStorefront className="text-5xl text-slate-300 dark:text-zinc-600 mb-2" />
                            <h3 className="text-base font-bold text-[#0B192C] dark:text-white">
                                {isArabic ? 'لا توجد ماركات مطابقة للبحث' : 'No brands found'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                {isArabic ? 'جرب البحث بكلمات أخرى أو اختر تبويباً مختلفاً.' : 'Try changing your search keywords or filter tab.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
