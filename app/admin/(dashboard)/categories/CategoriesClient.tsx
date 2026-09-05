"use client";

import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { useState, useMemo } from "react";
import { 
    MdDelete, 
    MdCheckBox, 
    MdCheckBoxOutlineBlank, 
    MdSearch, 
    MdAdd, 
    MdCheck, 
    MdImage, 
    MdStar, 
    MdStarBorder, 
    MdEdit,
    MdSearchOff,
    MdSync,
    MdVisibility,
    MdShoppingBag,
    MdStorefront,
    MdCategory
} from "react-icons/md";
import CategoryModal from "./CategoryModal";
import { deleteCategory, toggleCategoryFeatured, bulkDeleteCategories } from "../../../../lib/admin-actions";
import RelatedItemsModal from "../components/RelatedItemsModal";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Category {
    id: string;
    name: string;
    slug?: string;
    description: string | null;
    image: string | null;
    brandId: string;
    brand: {
        id: string;
        name: string;
        slug: string;
        group: string;
    } | null;
    isFeatured: boolean;
    _count: {
        products: number;
    };
}

interface Brand {
    id: string;
    name: string;
    slug: string;
    group: string;
    isActive: boolean;
}

export default function CategoriesClient({ categories: initialCategories, brands }: { categories: Category[], brands: Brand[] }) {
    const { data: session } = useSession() || {};
    const { t, dir, language } = useLanguage();
    const isArabic = language === 'ar';
    const canManage = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canManageCategories;
    const canDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canDeleteCategories;

    const { openSidebar } = useAdminSidebar();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("ALL");
    const [filterTab, setFilterTab] = useState<"ALL" | "FEATURED">("ALL");
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

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

    // Live Stats
    const stats = useMemo(() => {
        return {
            total: categories.length,
            featured: categories.filter(c => c.isFeatured).length,
        };
    }, [categories]);

    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            const matchesSearch = 
                category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (category.brand?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (category.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            
            const matchesBrand = selectedBrand === "ALL" || category.brandId === selectedBrand;
            if (!matchesSearch || !matchesBrand) return false;

            if (filterTab === "FEATURED") return category.isFeatured;

            return true;
        });
    }, [categories, searchQuery, selectedBrand, filterTab]);

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredCategories.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCategories.map(c => c.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        
        if (!confirm(isArabic ? `هل أنت متأكد من حذف ${ids.length} فئة؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete ${ids.length} categories? This action cannot be undone.`)) {
            return;
        }

        setIsSubmittingBulk(true);
        try {
            const result = await bulkDeleteCategories(ids);
            if (result.success) {
                setCategories(prev => prev.filter(c => !selectedIds.has(c.id)));
                setSelectedIds(new Set());
                toast.success(isArabic ? `تم حذف ${result.count} فئة بنجاح` : `Deleted ${result.count} categories`);
            } else {
                toast.error(result.error || "Failed to delete categories");
            }
        } catch (error) {
            console.error("Error in bulk delete:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmittingBulk(false);
        }
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(isArabic ? `هل أنت متأكد من حذف فئة "${name}"؟` : `Are you sure you want to delete "${name}"?`)) return;
        
        try {
            const result = await deleteCategory(id);
            if (result.success) {
                setCategories(prev => prev.filter(c => c.id !== id));
                toast.success(t('admin.categoryDeleted') || "Category deleted");
            } else {
                toast.error(result.error || "Failed to delete");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("An unexpected error occurred");
        }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        const nextStatus = !currentStatus;
        // Optimistic update
        setCategories(prev => prev.map(c => c.id === id ? { ...c, isFeatured: nextStatus } : c));

        try {
            const result = await toggleCategoryFeatured(id, nextStatus);
            if (result.success) {
                toast.success(
                    nextStatus 
                        ? (isArabic ? "تمت إضافة الفئة إلى المميزة في الصفحة الرئيسية ⭐" : "Category featured on Home ⭐") 
                        : (isArabic ? "تمت إزالة الفئة من المميزة" : "Category unfeatured")
                );
            } else {
                // Revert
                setCategories(prev => prev.map(c => c.id === id ? { ...c, isFeatured: currentStatus } : c));
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling category featured status:", error);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, isFeatured: currentStatus } : c));
            toast.error("An unexpected error occurred");
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA] dark:bg-[#0B0F14]">
            <AdminHeader title={t('admin.categories')} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-[1440px] mx-auto">
                    {/* Header Top Bar */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#8A6305]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#8A6305] dark:text-[#8A6305]">
                                    {isArabic ? 'إدارة فئات الماركات والمنتجات' : 'Brand Subcategories & Lines'}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] dark:text-white tracking-tight">
                                {t('admin.productCategories')}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                                {isArabic 
                                    ? 'إدارة الفئات الفرعية التابعة لكل علامة تجارية (مثل تونة، برغر بقري، ستربس، باستا).' 
                                    : 'Manage brand product subcategories, imagery, and homepage featured showcase cards.'}
                            </p>
                        </div>

                        {/* Search & Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                                <MdSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={isArabic ? 'بحث بالفئة أو الماركة...' : 'Search categories...'}
                                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 ps-9 pe-4 text-sm text-[#0B192C] dark:text-white outline-none focus:border-[#8A6305] focus:ring-2 focus:ring-[#8A6305]/20 shadow-2xs"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Brand Filter Dropdown */}
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-3.5 text-xs sm:text-sm font-semibold text-[#0B192C] dark:text-white outline-none focus:border-[#8A6305] shadow-2xs cursor-pointer"
                            >
                                <option value="ALL">{isArabic ? 'كافة الماركات' : 'All Brands'}</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>

                            {canManage && (
                                <button
                                    onClick={handleAdd}
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B192C] hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204] px-5 text-sm font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <MdAdd className="text-xl" />
                                    <span>{t('admin.addCategory')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs & Bulk Actions Bar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setFilterTab("ALL")}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    filterTab === "ALL"
                                        ? "bg-[#0B192C] text-white dark:bg-white dark:text-[#0B192C] shadow-xs"
                                        : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-[#8A6305]"
                                }`}
                            >
                                <span>{isArabic ? 'كافة الفئات الفرعية' : 'All Subcategories'}</span>
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
                                <span>{isArabic ? 'المميزة في الرئيسية (Featured Grid)' : 'Featured on Home'}</span>
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterTab === "FEATURED" ? "bg-white/20 text-white" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}>
                                    {stats.featured}
                                </span>
                            </button>
                        </div>

                        {/* Bulk Selection Bar */}
                        <div className="flex items-center gap-2">
                            {selectedIds.size > 0 && canDelete && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isSubmittingBulk}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmittingBulk ? <MdSync className="animate-spin text-sm" /> : <MdDelete className="text-sm" />}
                                    <span>{isArabic ? `حذف المحدد (${selectedIds.size})` : `Delete Selected (${selectedIds.size})`}</span>
                                </button>
                            )}

                            {filteredCategories.length > 0 && (
                                <button
                                    onClick={toggleSelectAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:border-[#8A6305] transition-all cursor-pointer"
                                >
                                    {selectedIds.size === filteredCategories.length ? <MdCheckBox className="text-base text-[#0B192C] dark:text-[#8A6305]" /> : <MdCheckBoxOutlineBlank className="text-base" />}
                                    <span>{selectedIds.size === filteredCategories.length ? (isArabic ? 'إلغاء تحديد الكل' : 'Deselect All') : (isArabic ? 'تحديد الكل' : 'Select All')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <CategoryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        category={selectedCategory}
                        brands={brands}
                    />

                    <RelatedItemsModal
                        isOpen={relatedModalInfo.isOpen}
                        onClose={() => setRelatedModalInfo(prev => ({ ...prev, isOpen: false }))}
                        type={relatedModalInfo.type}
                        entityType="categoryId"
                        entityId={relatedModalInfo.entityId}
                        entityName={relatedModalInfo.entityName}
                    />

                    {/* Category Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                        {filteredCategories.map((category) => {
                            const isFeatLoading = loadingMap[category.id];
                            const isSelected = selectedIds.has(category.id);

                            return (
                                <article 
                                    key={category.id} 
                                    className={`relative group flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 hover:shadow-md ${
                                        isSelected
                                            ? "border-[#0B192C] ring-2 ring-[#0B192C]/30"
                                            : category.isFeatured 
                                            ? "border-amber-400/60 dark:border-amber-500/30 ring-1 ring-amber-400/20" 
                                            : "border-slate-200/80 dark:border-white/10"
                                    }`}
                                >
                                    {/* Top Image Box */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-100 dark:border-white/5 flex items-center justify-center p-3">
                                        {category.image ? (
                                            <img 
                                                src={category.image} 
                                                alt={category.name} 
                                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <MdImage className="text-5xl text-slate-300 dark:text-zinc-600" />
                                        )}

                                        {/* Selection Checkbox (Top Left) */}
                                        <button
                                            type="button"
                                            onClick={() => toggleSelect(category.id)}
                                            className={`absolute top-2.5 start-2.5 size-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                                isSelected 
                                                    ? 'bg-[#0B192C] border-[#0B192C] text-white' 
                                                    : 'bg-white/80 dark:bg-black/40 border-white/60 text-transparent hover:border-[#0B192C]'
                                            }`}
                                        >
                                            <MdCheck className="text-base" />
                                        </button>

                                        {/* Star Toggle Button (Top Right) */}
                                        {canManage && (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(category.id, category.isFeatured)}
                                                disabled={isFeatLoading}
                                                title={category.isFeatured ? (isArabic ? 'فئة مميزة في الرئيسية (اضغط للإلغاء)' : 'Featured on Home (Click to remove)') : (isArabic ? 'اضغط لجعلها مميزة في الصفحة الرئيسية' : 'Click to feature on Home')}
                                                className={`absolute top-2.5 end-2.5 size-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
                                                    category.isFeatured
                                                        ? "bg-amber-500 text-white ring-2 ring-amber-300 dark:ring-amber-900 scale-105"
                                                        : "bg-black/40 hover:bg-amber-500 text-white/80 hover:text-white"
                                                }`}
                                            >
                                                {isFeatLoading ? (
                                                    <MdSync className="text-sm animate-spin" />
                                                ) : category.isFeatured ? (
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
                                            {/* Name & Brand */}
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="min-w-0">
                                                    <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-white truncate">
                                                        {category.name}
                                                    </h3>
                                                    {category.description && (
                                                        <p className="text-xs font-semibold text-[#8A6305] dark:text-[#8A6305] truncate">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {category.brand?.name && (
                                                    <span className="shrink-0 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-gray-300 px-2.5 py-0.5 text-[10px] font-bold border border-slate-200 dark:border-white/5 truncate max-w-[130px]">
                                                        {category.brand.name.split('-')[0].trim()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Slug & Featured Pill */}
                                            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                                                {category.slug && (
                                                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                                                        /categories/{category.slug}
                                                    </span>
                                                )}
                                                {category.isFeatured && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-md">
                                                        <MdStar className="text-xs" />
                                                        <span>{isArabic ? 'مميز بالرئيسية' : 'Featured'}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Relation Counters */}
                                            <div className="flex flex-wrap gap-1.5 mb-4 text-xs font-bold">
                                                <button 
                                                    type="button"
                                                    onClick={() => setRelatedModalInfo({ isOpen: true, type: "products", entityId: category.id, entityName: category.name })}
                                                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 px-2.5 py-1 text-[11px] transition-colors"
                                                    title={isArabic ? 'عرض المنتجات المرتبطة' : 'View products'}
                                                >
                                                    <MdShoppingBag className="text-xs" />
                                                    <span>{category._count.products} {isArabic ? 'منتج' : 'Products'}</span>
                                                </button>

                                                {category.brand?.name && (
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-gray-400 px-2.5 py-1 text-[11px]">
                                                        <MdStorefront className="text-xs" />
                                                        <span>{category.brand.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Bar */}
                                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-auto">
                                            {/* Preview Link */}
                                            {category.slug ? (
                                                <a
                                                    href={`/categories/${category.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-gray-400 hover:text-[#8A6305] transition-colors"
                                                >
                                                    <MdVisibility className="text-sm" />
                                                    <span>{isArabic ? 'معاينة' : 'Preview'}</span>
                                                </a>
                                            ) : <div />}

                                            {/* Edit & Delete Buttons */}
                                            <div className="flex items-center gap-1">
                                                {canManage && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleEdit(category)} 
                                                        className="rounded-lg p-1.5 text-slate-600 dark:text-gray-300 hover:bg-[#8A6305]/10 hover:text-[#8A6305] transition-colors cursor-pointer" 
                                                        title={isArabic ? 'تعديل' : 'Edit'}
                                                    >
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(category.id, category.name)} 
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
                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 mt-6">
                            <MdCategory className="text-5xl text-slate-300 dark:text-zinc-600 mb-2" />
                            <h3 className="text-base font-bold text-[#0B192C] dark:text-white">
                                {isArabic ? 'لا توجد فئات مطابقة للبحث' : 'No categories found'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                {isArabic ? 'جرب تغيير شروط البحث أو اختيار ماركة أخرى.' : 'Try changing your search keywords or selected brand.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
