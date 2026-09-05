"use client";

import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { useState } from "react";
import PromoCodeModal from "./PromoCodeModal";
import { deletePromoCode, togglePromoCodeStatus } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { MdSearch, MdAdd, MdSync, MdToggleOn, MdToggleOff, MdEdit, MdDelete } from "react-icons/md";

interface PromoCode {
    id: string;
    code: string;
    discountPercentage: number;
    delegateName: string | null;
    isActive: boolean;
    totalSales: number;
    thisMonthSales: number;
    usageCount: number;
    createdAt: string;
}

export default function PromoCodesClient({ promoCodes }: { promoCodes: PromoCode[] }) {
    const { data: session } = useSession() || {};
    const { t, dir } = useLanguage();
    const canManage = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canManagePromoCodes;
    const canDelete = session?.user?.role === 'SUPER_ADMIN' || session?.user?.canDeletePromoCodes;

    const { openSidebar } = useAdminSidebar();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const filteredPromoCodes = promoCodes.filter(pc =>
        pc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pc.delegateName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    const handleAdd = () => {
        setSelectedPromoCode(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pc: PromoCode) => {
        setSelectedPromoCode(pc);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, code: string) => {
        if (confirm(t('admin.confirmDeleteCode').replace('{code}', code))) {
            try {
                const result = await deletePromoCode(id);
                if (result.success) {
                    toast.success(t('admin.codeDeleted'));
                } else {
                    toast.error(result.error || "Failed to delete promo code");
                }
            } catch (error) {
                console.error("Error deleting promo code:", error);
                toast.error("An unexpected error occurred");
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            const result = await togglePromoCodeStatus(id, !currentStatus);
            if (result.success) {
                toast.success(t('admin.codeStatusUpdated').replace('{status}', !currentStatus ? t('admin.activated') : t('admin.deactivated')));
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling promo code status:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader title={t('admin.promoCodes')} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div className="">
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main dark:text-white">
                                {t('admin.codesAndDelegates')}
                            </h3>
                            <p className="text-text-sub dark:text-gray-400 mt-1">
                                {t('admin.manageCodes')}
                            </p>
                        </div>
                        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative w-full md:w-72">
                                <MdSearch className={`absolute top-1/2 -translate-y-1/2 text-text-sub/50 dark:text-gray-400/50 text-xl ${dir === 'rtl' ? 'end-3' : 'start-3'}`} />
                                <input
                                    type="text"
                                    placeholder={t('admin.searchCodes')}
                                    className={`w-full py-3 bg-surface-light dark:bg-surface-dark border border-border-color/50 dark:border-white/[0.04] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white ${dir === 'rtl' ? 'pe-10 ps-4' : 'ps-10 pe-4'}`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {canManage && (
                                <button
                                    onClick={handleAdd}
                                    className="w-full md:w-auto bg-[#0B192C] hover:bg-[#1e293b] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                                >
                                    <MdAdd className="text-[20px]" />
                                    {t('admin.addPromoCode')}
                                </button>
                            )}
                        </div>
                    </div>

                    <PromoCodeModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        promoCode={selectedPromoCode}
                    />

                    {/* Stats Summary (2-cols on mobile, 3-cols on md) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 mb-6">
                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col gap-1">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">{t('admin.totalSales')}</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                ${promoCodes.reduce((sum, pc) => sum + pc.totalSales, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col gap-1">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">{t('admin.activeCodes')}</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#2E7D32] dark:text-[#4ade80]">
                                {promoCodes.filter(pc => pc.isActive).length}
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-color/50 dark:border-white/[0.04] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className={`w-full text-start border-collapse ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>
                                <thead>
                                    <tr className="border-b border-border-color/50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-gray-800/50">
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.code')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.discount')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.delegate')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.totalSales')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.thisMonth')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.usage')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>{t('admin.status')}</th>
                                        <th className={`p-5 text-xs font-bold text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>{t('admin.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color/50 dark:divide-gray-700">
                                    {filteredPromoCodes.map((pc) => (
                                        <tr key={pc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-5">
                                                <span className="font-mono font-bold text-text-main dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                                                    {pc.code}
                                                </span>
                                            </td>
                                            <td className="p-5 font-bold text-primary">
                                                {pc.discountPercentage}%
                                            </td>
                                            <td className="p-5 text-text-main dark:text-white font-medium">
                                                {pc.delegateName || <span className="text-text-sub dark:text-gray-500 italic">{t('admin.none')}</span>}
                                            </td>
                                            <td className="p-5 font-bold text-text-main dark:text-white">
                                                ${pc.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-5 font-bold text-emerald-600 dark:text-emerald-400">
                                                ${pc.thisMonthSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-5 text-text-sub dark:text-gray-400">
                                                {pc.usageCount}
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${pc.isActive
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                                    }`}>
                                                    {pc.isActive ? t('admin.active') : t('admin.inactive')}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className={`flex gap-2 justify-end`}>
                                                    {canManage && (
                                                        <button
                                                            onClick={() => handleToggleStatus(pc.id, pc.isActive)}
                                                            disabled={loadingMap[pc.id]}
                                                            className={`p-2 rounded-lg transition-colors ${pc.isActive ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                            title={pc.isActive ? t('admin.deactivate') : t('admin.activate')}
                                                        >
                                                            {loadingMap[pc.id] ? (
                                                                <MdSync className="animate-spin text-[20px]" />
                                                            ) : (
                                                                pc.isActive ? <MdToggleOn className="text-[20px]" /> : <MdToggleOff className="text-[20px]" />
                                                            )}
                                                        </button>
                                                    )}
                                                    {canManage && (
                                                        <button
                                                            onClick={() => handleEdit(pc)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title={t('admin.editPromoCode')}
                                                        >
                                                            <MdEdit className="text-[20px]" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(pc.id, pc.code)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title={t('admin.deletePromoCode')}
                                                        >
                                                            <MdDelete className="text-[20px]" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPromoCodes.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-text-sub/50">
                                                {searchQuery ? t('admin.noCodesFound') : t('admin.noCodesCreated')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
