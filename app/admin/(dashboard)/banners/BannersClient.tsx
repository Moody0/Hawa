"use client";

import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { useState } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import BannerModal from "./BannerModal";
import { deleteBanner, toggleBannerStatus } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

interface Banner {
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
    createdAt: string;
    updatedAt: string;
}

export default function BannersClient({ banners }: { banners: Banner[] }) {
    const confirm = useConfirm();
    const { data: session } = useSession() || {};
    const { t, dir, language } = useLanguage();
    const isArabic = language === 'ar';
    const canManage = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canManageBanners;
    const canDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canDeleteBanners;

    const { openSidebar } = useAdminSidebar();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleAdd = () => {
        setSelectedBanner(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, title: string) => {
        const ok = await confirm({
            title: isArabic ? "حذف البنر" : "Delete Banner",
            message: t('admin.confirmDeleteBanner').replace('{title}', title),
            confirmText: isArabic ? "حذف" : "Delete",
            cancelText: isArabic ? "إلغاء" : "Cancel",
            variant: "danger",
        });
        if (!ok) return;
        try {
            const result = await deleteBanner(id);
            if (result.success) {
                toast.success(t('admin.bannerDeleted'));
            } else {
                toast.error(result.error || "Failed to delete banner");
            }
        } catch (error) {
            console.error("Error deleting banner:", error);
            toast.error("An unexpected error occurred");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            const result = await toggleBannerStatus(id, !currentStatus);
            if (result.success) {
                toast.success(t('admin.bannerStatusUpdated').replace('{status}', !currentStatus ? t('admin.activated') : t('admin.deactivated')));
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling banner status:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader title={t('admin.homeBanners')} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#111111] p-6 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {t('admin.heroBanners')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                {t('admin.manageHeroBanners')}
                            </p>
                        </div>
                        {canManage && (
                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 bg-[#0B192C] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer"
                            >
                                <Plus className="text-xl" />
                                <span>{t('admin.addNewBanner')}</span>
                            </button>
                        )}
                    </div>

                    <BannerModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        banner={selectedBanner}
                    />

                    <div className="grid grid-cols-1 gap-6">
                        {banners.map((banner) => (
                            <div key={banner.id} className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col lg:flex-row">
                                <div className="lg:w-1/3 aspect-21/9 lg:aspect-auto overflow-hidden bg-slate-100 dark:bg-gray-800 relative min-h-[200px]">
                                    <img
                                        alt={banner.title || "Banner"}
                                        className="w-full h-full object-cover"
                                        src={banner.image}
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {banner.badge && (
                                                <span className="bg-amber-50 text-[#8A6305] border border-amber-200 dark:bg-amber-950/40 dark:text-[#8A6305] dark:border-amber-900 px-3 py-0.5 rounded-full text-[11px] font-bold">
                                                    🇬🇧 {banner.badge}
                                                </span>
                                            )}
                                            {banner.badgeAr && (
                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 px-3 py-0.5 rounded-full text-[11px] font-bold">
                                                    🇸🇦 {banner.badgeAr}
                                                </span>
                                            )}
                                            {!banner.isActive && (
                                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-0.5 rounded-full text-[11px] font-bold">
                                                    {t('admin.hidden')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                🇬🇧 {banner.title || t('admin.noTitle')}
                                            </h3>
                                            {banner.subtitle && (
                                                <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        {banner.titleAr && (
                                            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5 text-end" dir="rtl">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                    🇸🇦 {banner.titleAr}
                                                </h3>
                                                {banner.subtitleAr && (
                                                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2">
                                                        {banner.subtitleAr}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('admin.button') || "Button CTA"}</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {banner.buttonText} {banner.buttonTextAr ? `| ${banner.buttonTextAr}` : ''}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('admin.link') || "Target Link"}</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{banner.link}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                                                disabled={loadingMap[banner.id] || !canManage}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${banner.isActive
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                            >
                                                {loadingMap[banner.id] ? (
                                                    <RefreshCw className="animate-spin text-base" />
                                                ) : (
                                                    banner.isActive ? <Eye className="text-base" /> : <EyeOff className="text-base" />
                                                )}
                                                {banner.isActive ? t('admin.active') : t('admin.hidden')}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {canManage && (
                                                <button
                                                    onClick={() => handleEdit(banner)}
                                                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                                                    title={t('admin.editBanner')}
                                                >
                                                    <Pencil className="text-xl" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(banner.id, banner.title || "Banner")}
                                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors cursor-pointer"
                                                    title={t('admin.deleteBanner')}
                                                >
                                                    <Trash2 className="text-xl" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
