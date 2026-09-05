"use client";

import { useMemo, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import MainCategoryModal from "./MainCategoryModal";
import { deleteMainCategory, toggleMainCategoryActive, toggleMainCategoryFeatured } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { 
    MdAdd, 
    MdDelete, 
    MdEdit, 
    MdImage, 
    MdSearch, 
    MdSync, 
    MdToggleOff, 
    MdToggleOn,
    MdStar,
    MdStarBorder,
    MdVisibility,
    MdCategory,
    MdShoppingBag,
    MdBrandingWatermark
} from "react-icons/md";
import RelatedItemsModal from "../components/RelatedItemsModal";

interface MainCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    isFeatured: boolean;
    showInNav: boolean;
    navOrder: number;
    _count: {
        brands: number;
        categories: number;
        products: number;
    };
}

export default function MainCategoriesClient({ mainCategories: initialMainCategories }: { mainCategories: MainCategory[] }) {
    const { openSidebar } = useAdminSidebar();
    const { data: session } = useSession() || {};
    const { t, dir, language } = useLanguage();
    const isArabic = language === 'ar';
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

    const [mainCategories, setMainCategories] = useState<MainCategory[]>(initialMainCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<MainCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTab, setFilterTab] = useState<"ALL" | "FEATURED" | "ACTIVE" | "INACTIVE">("ALL");
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const [relatedModalInfo, setRelatedModalInfo] = useState<{
        isOpen: boolean;
        type: "products" | "categories" | "brands";
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
            total: mainCategories.length,
            featured: mainCategories.filter(mc => mc.isFeatured).length,
            active: mainCategories.filter(mc => mc.isActive).length,
            inactive: mainCategories.filter(mc => !mc.isActive).length,
        };
    }, [mainCategories]);

    const filtered = useMemo(() => {
        return mainCategories.filter((mc) => {
            const matchesSearch =
                mc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (mc.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                mc.slug.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (filterTab === "FEATURED") return mc.isFeatured;
            if (filterTab === "ACTIVE") return mc.isActive;
            if (filterTab === "INACTIVE") return !mc.isActive;

            return true;
        });
    }, [mainCategories, searchQuery, filterTab]);

    const handleAdd = () => {
        setSelected(null);
        setIsModalOpen(true);
    };

    const handleEdit = (mc: MainCategory) => {
        setSelected(mc);
        setIsModalOpen(true);
    };

    const handleDelete = async (mc: MainCategory) => {
        if (!confirm(isArabic ? `هل أنت متأكد من حذف قسم "${mc.name}"؟` : `Are you sure you want to delete "${mc.name}"?`)) return;
        const result = await deleteMainCategory(mc.id);
        if (result.success) {
            setMainCategories(prev => prev.filter(item => item.id !== mc.id));
            toast.success(t("admin.mainCategoryDeleted") || "Deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete");
        }
    };

    const handleToggleActive = async (mc: MainCategory) => {
        setLoadingMap((c) => ({ ...c, [mc.id]: true }));
        const nextState = !mc.isActive;
        // Optimistic update
        setMainCategories(prev => prev.map(item => item.id === mc.id ? { ...item, isActive: nextState } : item));
        
        const result = await toggleMainCategoryActive(mc.id, nextState);
        if (result.success) {
            toast.success(nextState ? (isArabic ? 'تم تفعيل القسم' : 'Department activated') : (isArabic ? 'تم تعطيل القسم' : 'Department deactivated'));
        } else {
            // Revert
            setMainCategories(prev => prev.map(item => item.id === mc.id ? { ...item, isActive: !nextState } : item));
            toast.error(result.error || "Failed to update");
        }
        setLoadingMap((c) => ({ ...c, [mc.id]: false }));
    };

    const handleToggleFeatured = async (mc: MainCategory) => {
        setLoadingMap((c) => ({ ...c, [`feat-${mc.id}`]: true }));
        const nextState = !mc.isFeatured;
        // Optimistic update
        setMainCategories(prev => prev.map(item => item.id === mc.id ? { ...item, isFeatured: nextState } : item));

        const result = await toggleMainCategoryFeatured(mc.id, nextState);
        if (result.success) {
            toast.success(
                nextState 
                    ? (isArabic ? 'تمت إضافة القسم إلى المميزة في الصفحة الرئيسية ⭐' : 'Added to Featured Home Categories ⭐') 
                    : (isArabic ? 'تمت إزالة القسم من المميزة' : 'Removed from Featured')
            );
        } else {
            // Revert
            setMainCategories(prev => prev.map(item => item.id === mc.id ? { ...item, isFeatured: !nextState } : item));
            toast.error(result.error || "Failed to update featured status");
        }
        setLoadingMap((c) => ({ ...c, [`feat-${mc.id}`]: false }));
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-[#F8F9FA] dark:bg-[#0B0F14]">
            <AdminHeader title={t("admin.mainCategories")} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-[1440px]">
                    {/* Header Top Bar */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#8A6305]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#8A6305] dark:text-[#8A6305]">
                                    {isArabic ? 'إدارة أقسام المتجر الرئيسية' : 'Store Department Management'}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                                {t("admin.mainCategories")}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                                {isArabic 
                                    ? 'تحكم بالأقسام الرئيسية، الصور، ترتيب العرض، والأقسام المميزة في الصفحة الرئيسية (تسوق حسب الفئة).' 
                                    : 'Manage primary departments, display order, images, and homepage featured highlights.'}
                            </p>
                        </div>

                        {/* Search & Add Action */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                                <MdSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isArabic ? 'بحث بالاسم أو الوصف...' : 'Search departments...'}
                                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 ps-9 pe-4 text-sm text-[#0B192C] dark:text-white outline-none focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20 shadow-2xs"
                                />
                            </div>

                            {isSuperAdmin && (
                                <button 
                                    onClick={handleAdd} 
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] px-5 text-sm font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <MdAdd className="text-xl" />
                                    <span>{t("admin.addMainCategory")}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs Bar */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
                        <button
                            onClick={() => setFilterTab("ALL")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterTab === "ALL"
                                    ? "bg-[#0B192C] text-white dark:bg-white dark:text-[#0B192C] shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]"
                            }`}
                        >
                            <span>{isArabic ? 'كافة الأقسام' : 'All Departments'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === "ALL" ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-slate-100 dark:bg-zinc-700 text-slate-500"}`}>
                                {stats.total}
                            </span>
                        </button>

                        <button
                            onClick={() => setFilterTab("FEATURED")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterTab === "FEATURED"
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30 hover:border-amber-500"
                            }`}
                        >
                            <MdStar className="text-sm" />
                            <span>{isArabic ? 'المميزة في الرئيسية (Shop by Category)' : 'Featured on Home'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === "FEATURED" ? "bg-white/20 text-white" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>
                                {stats.featured}
                            </span>
                        </button>

                        <button
                            onClick={() => setFilterTab("ACTIVE")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterTab === "ACTIVE"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30 hover:border-emerald-500"
                            }`}
                        >
                            <span>{isArabic ? 'النشطة' : 'Active'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === "ACTIVE" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"}`}>
                                {stats.active}
                            </span>
                        </button>

                        <button
                            onClick={() => setFilterTab("INACTIVE")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterTab === "INACTIVE"
                                    ? "bg-slate-700 text-white shadow-xs"
                                    : "bg-white dark:bg-zinc-800 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10 hover:border-slate-400"
                            }`}
                        >
                            <span>{isArabic ? 'المعطلة' : 'Inactive'}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === "INACTIVE" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-500"}`}>
                                {stats.inactive}
                            </span>
                        </button>
                    </div>

                    <MainCategoryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        mainCategory={selected}
                    />

                    <RelatedItemsModal
                        isOpen={relatedModalInfo.isOpen}
                        onClose={() => setRelatedModalInfo(prev => ({ ...prev, isOpen: false }))}
                        type={relatedModalInfo.type}
                        entityType="mainCategoryId"
                        entityId={relatedModalInfo.entityId}
                        entityName={relatedModalInfo.entityName}
                    />

                    {/* Department Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                        {filtered.map((mc) => {
                            const isFeatLoading = loadingMap[`feat-${mc.id}`];

                            return (
                                <article 
                                    key={mc.id} 
                                    className={`relative group flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 hover:shadow-md ${
                                        mc.isFeatured 
                                            ? "border-amber-400/60 dark:border-amber-500/30 ring-1 ring-amber-400/20" 
                                            : "border-slate-200/80 dark:border-white/10"
                                    }`}
                                >
                                    {/* Top Image Box */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-100 dark:border-white/5 flex items-center justify-center p-3">
                                        {mc.image ? (
                                            <img 
                                                src={mc.image} 
                                                alt={mc.name} 
                                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <MdImage className="text-5xl text-slate-300 dark:text-zinc-600" />
                                        )}

                                        {/* Order Indicator (Top Left) */}
                                        <div className="absolute top-2.5 start-2.5 flex items-center gap-1 bg-[#0B192C]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                            <span>#{mc.navOrder}</span>
                                        </div>

                                        {/* Star Toggle Button (Top Right) */}
                                        {isSuperAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(mc)}
                                                disabled={isFeatLoading}
                                                title={mc.isFeatured ? (isArabic ? 'قسم مميز في الرئيسية (اضغط للإلغاء)' : 'Featured on Home (Click to remove)') : (isArabic ? 'اضغط لجعله مميزاً في الصفحة الرئيسية' : 'Click to feature on Home')}
                                                className={`absolute top-2.5 end-2.5 size-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
                                                    mc.isFeatured
                                                        ? "bg-amber-500 text-white ring-2 ring-amber-300 dark:ring-amber-900 scale-105"
                                                        : "bg-black/40 hover:bg-amber-500 text-white/80 hover:text-white"
                                                }`}
                                            >
                                                {isFeatLoading ? (
                                                    <MdSync className="text-sm animate-spin" />
                                                ) : mc.isFeatured ? (
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
                                                        {mc.name}
                                                    </h3>
                                                    {mc.description && (
                                                        <p className="text-xs font-semibold text-[#8A6305] dark:text-[#8A6305] truncate">
                                                            {mc.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                    mc.isActive 
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30" 
                                                        : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-gray-400"
                                                }`}>
                                                    {mc.isActive ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'معطل' : 'Draft')}
                                                </span>
                                            </div>

                                            {/* Slug Pill */}
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                                    /department/{mc.slug}
                                                </span>
                                                {mc.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-md">
                                                        <MdStar className="text-xs" />
                                                        <span>{isArabic ? 'مميز بالرئيسية' : 'Featured'}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Relational Counters */}
                                            <div className="flex flex-wrap gap-1.5 mb-4 text-xs font-bold">
                                                <button 
                                                    type="button"
                                                    onClick={() => setRelatedModalInfo({ isOpen: true, type: "products", entityId: mc.id, entityName: mc.name })}
                                                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 px-2.5 py-1 text-[11px] transition-colors"
                                                    title={isArabic ? 'عرض المنتجات المرتبطة' : 'View products'}
                                                >
                                                    <MdShoppingBag className="text-xs" />
                                                    <span>{mc._count.products} {isArabic ? 'منتج' : 'Products'}</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    onClick={() => setRelatedModalInfo({ isOpen: true, type: "categories", entityId: mc.id, entityName: mc.name })}
                                                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 px-2.5 py-1 text-[11px] transition-colors"
                                                    title={isArabic ? 'عرض الفئات الفرعية' : 'View subcategories'}
                                                >
                                                    <MdCategory className="text-xs" />
                                                    <span>{mc._count.categories} {isArabic ? 'فئة فرعية' : 'Categories'}</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    onClick={() => setRelatedModalInfo({ isOpen: true, type: "brands", entityId: mc.id, entityName: mc.name })}
                                                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 px-2.5 py-1 text-[11px] transition-colors"
                                                    title={isArabic ? 'عرض الشركات الموزعة' : 'View brands'}
                                                >
                                                    <MdBrandingWatermark className="text-xs" />
                                                    <span>{mc._count.brands} {isArabic ? 'ماركات' : 'Brands'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Actions Bar */}
                                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-auto">
                                            {/* Preview Link */}
                                            <a
                                                href={`/department/${mc.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-gray-400 hover:text-[#8A6305] transition-colors"
                                            >
                                                <MdVisibility className="text-sm" />
                                                <span>{isArabic ? 'معاينة' : 'Preview'}</span>
                                            </a>

                                            {/* Edit / Active / Delete Buttons */}
                                            <div className="flex items-center gap-1">
                                                {isSuperAdmin && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleToggleActive(mc)} 
                                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" 
                                                        title={isArabic ? 'تفعيل / تعطيل' : 'Toggle Active'}
                                                    >
                                                        {loadingMap[mc.id] ? (
                                                            <MdSync className="animate-spin text-lg" />
                                                        ) : mc.isActive ? (
                                                            <MdToggleOn className="text-2xl text-emerald-500" />
                                                        ) : (
                                                            <MdToggleOff className="text-2xl text-slate-400" />
                                                        )}
                                                    </button>
                                                )}

                                                {isSuperAdmin && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleEdit(mc)} 
                                                        className="rounded-lg p-1.5 text-slate-600 dark:text-gray-300 hover:bg-[#8A6305]/10 hover:text-[#8A6305] transition-colors cursor-pointer" 
                                                        title={isArabic ? 'تعديل' : 'Edit'}
                                                    >
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                )}

                                                {isSuperAdmin && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(mc)} 
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
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 mt-6">
                            <MdCategory className="text-5xl text-slate-300 dark:text-zinc-600 mb-2" />
                            <h3 className="text-base font-bold text-[#0B192C] dark:text-white">
                                {isArabic ? 'لا توجد أقسام مطابقة للبحث' : 'No departments found'}
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
