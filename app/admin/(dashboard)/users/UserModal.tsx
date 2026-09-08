"use client";

import { useState, useEffect } from "react";
import { createUser, updateUser } from "@/lib/user-actions";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";
import { X, RefreshCw } from 'lucide-react';

interface User {
    id: string;
    username: string;
    role: string;
    canManageBrands: boolean;
    canDeleteBrands: boolean;
    canManageProducts: boolean;
    canDeleteProducts: boolean;
    canManageCategories: boolean;
    canDeleteCategories: boolean;
    canManageBanners: boolean;
    canDeleteBanners: boolean;
    canManageOrders: boolean;
    canDeleteOrders: boolean;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

type PermissionKey =
    | "canManageBrands"
    | "canDeleteBrands"
    | "canManageProducts"
    | "canDeleteProducts"
    | "canManageCategories"
    | "canDeleteCategories"
    | "canManageBanners"
    | "canDeleteBanners"
    | "canManageOrders"
    | "canDeleteOrders";

type UserFormData = {
    username: string;
    password: string;
    role: "ADMIN" | "SUPER_ADMIN";
} & Record<PermissionKey, boolean>;

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
    const { t, dir } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        password: "",
        role: "ADMIN",
        canManageBrands: true,
        canDeleteBrands: true,
        canManageProducts: true,
        canDeleteProducts: true,
        canManageCategories: true,
        canDeleteCategories: true,
        canManageBanners: true,
        canDeleteBanners: true,
        canManageOrders: true,
        canDeleteOrders: true,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                password: "", // Don't show password
                role: user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
                canManageBrands: user.canManageBrands,
                canDeleteBrands: user.canDeleteBrands,
                canManageProducts: user.canManageProducts,
                canDeleteProducts: user.canDeleteProducts,
                canManageCategories: user.canManageCategories,
                canDeleteCategories: user.canDeleteCategories,
                canManageBanners: user.canManageBanners,
                canDeleteBanners: user.canDeleteBanners,
                canManageOrders: user.canManageOrders,
                canDeleteOrders: user.canDeleteOrders,
            });
        } else {
            setFormData({
                username: "",
                password: "",
                role: "ADMIN",
                canManageBrands: true,
                canDeleteBrands: true,
                canManageProducts: true,
                canDeleteProducts: true,
                canManageCategories: true,
                canDeleteCategories: true,
                canManageBanners: true,
                canDeleteBanners: true,
                canManageOrders: true,
                canDeleteOrders: true,
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user && !formData.password) {
            toast.error("Password is required for new users");
            return;
        }

        setIsSubmitting(true);
        try {
            let result;
            if (user) {
                result = await updateUser(user.id, formData);
            } else {
                result = await createUser(formData);
            }

            if (result.success) {
                toast.success(user ? "User updated successfully" : "User created successfully");
                onClose();
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const PermissionCheckbox = ({ name, label, dependsOn }: { name: PermissionKey, label: string, dependsOn?: PermissionKey }) => {
        const isChecked = formData[name];
        const isParentChecked = dependsOn ? formData[dependsOn] : true;

        return (
            <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${!isParentChecked ? 'opacity-40 cursor-not-allowed bg-gray-50/50 dark:bg-black/20/20 border-transparent' :
                isChecked ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-background-light dark:bg-gray-800/50 border-black/[0.04] dark:border-white/[0.04] text-text-sub dark:text-gray-400'
                }`}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isParentChecked}
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.checked })}
                    className="w-4 h-4 text-primary bg-background-light dark:bg-gray-800 border-black/[0.08] dark:border-white/[0.08] rounded focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="text-sm font-medium">{label}</span>
            </label>
        );
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 id="user-modal-title" className="text-2xl md:text-3xl font-bold tracking-tight text-text-main dark:text-white">
                                {user ? t('admin.editUserPermissions') : t('admin.addNewSubAdmin')}
                            </h2>
                            <p className="text-text-sub dark:text-gray-400 text-sm mt-1">
                                {user ? t('admin.updatingAccess').replace('{username}', user.username) : t('admin.createAccount')}
                            </p>
                        </div>
                        <button 
                            onClick={onClose} 
                            aria-label={dir === 'rtl' ? 'إغلاق' : 'Close'}
                            className="p-2 text-text-sub dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        >
                            <X className="text-[24px]" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={`text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.username')}</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className={`w-full px-4 py-3 bg-background-light dark:bg-gray-800 border border-black/[0.04] dark:border-white/[0.04] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main dark:text-white`}
                                    placeholder="e.g. jessica_editor"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={`text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>
                                    {user ? t('admin.newPasswordOptional') : t('admin.password')}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`w-full px-4 py-3 bg-background-light dark:bg-gray-800 border border-black/[0.04] dark:border-white/[0.04] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main dark:text-white`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-4">
                            <label className={`text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.accountRole')}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                                    className={`p-4 rounded-2xl border ${dir === 'rtl' ? 'text-end' : 'text-start'} transition-all ${formData.role === 'ADMIN' ? 'border-primary bg-primary/5' : 'border-black/[0.04] dark:border-white/[0.04] hover:border-primary/50'}`}
                                >
                                    <p className={`font-bold ${formData.role === 'ADMIN' ? 'text-primary' : 'text-text-main dark:text-white'}`}>{t('admin.subAdminDefault')}</p>
                                    <p className="text-xs text-text-sub dark:text-gray-400 mt-1">{t('admin.limitedAccess')}</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'SUPER_ADMIN' })}
                                    className={`p-4 rounded-2xl border ${dir === 'rtl' ? 'text-end' : 'text-start'} transition-all ${formData.role === 'SUPER_ADMIN' ? 'border-amber-500 bg-amber-50' : 'border-black/[0.04] dark:border-white/[0.04] hover:border-amber-500/50'}`}
                                >
                                    <p className={`font-bold ${formData.role === 'SUPER_ADMIN' ? 'text-amber-600' : 'text-text-main dark:text-white'}`}>{t('admin.superAdminRole')}</p>
                                    <p className="text-xs text-text-sub dark:text-gray-400 mt-1">{t('admin.fullAccess')}</p>
                                </button>
                            </div>
                        </div>

                        {/* Granular Permissions */}
                        {formData.role !== 'SUPER_ADMIN' && (
                            <div className="space-y-6 bg-background-light/50 dark:bg-gray-800/30 p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
                                <div>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-sub dark:text-gray-400 uppercase tracking-widest mb-4">{t('admin.permissionsChecklist')}</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <p className={`text-[10px] font-bold text-text-sub dark:text-slate-400 uppercase tracking-widest ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.brands')}</p>
                                            <PermissionCheckbox name="canManageBrands" label={t('admin.canCreateEdit').replace('{resource}', t('admin.brands'))} />
                                            <PermissionCheckbox name="canDeleteBrands" label={t('admin.canDelete').replace('{resource}', t('admin.brands'))} dependsOn="canManageBrands" />
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[10px] font-bold text-text-sub dark:text-slate-400 uppercase tracking-widest ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.products')}</p>
                                            <PermissionCheckbox name="canManageProducts" label={t('admin.canCreateEdit').replace('{resource}', t('admin.products'))} />
                                            <PermissionCheckbox name="canDeleteProducts" label={t('admin.canDelete').replace('{resource}', t('admin.products'))} dependsOn="canManageProducts" />
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[10px] font-bold text-text-sub dark:text-slate-400 uppercase tracking-widest ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.categories')}</p>
                                            <PermissionCheckbox name="canManageCategories" label={t('admin.canCreateEdit').replace('{resource}', t('admin.categories'))} />
                                            <PermissionCheckbox name="canDeleteCategories" label={t('admin.canDelete').replace('{resource}', t('admin.categories'))} dependsOn="canManageCategories" />
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[10px] font-bold text-text-sub dark:text-slate-400 uppercase tracking-widest ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.banners')}</p>
                                            <PermissionCheckbox name="canManageBanners" label={t('admin.canManage').replace('{resource}', t('admin.banners'))} />
                                            <PermissionCheckbox name="canDeleteBanners" label={t('admin.canDelete').replace('{resource}', t('admin.banners'))} dependsOn="canManageBanners" />
                                        </div>

                                        <div className="space-y-3">
                                            <p className={`text-[10px] font-bold text-text-sub dark:text-slate-400 uppercase tracking-widest ${dir === 'rtl' ? 'me-1' : 'ms-1'}`}>{t('admin.orders')}</p>
                                            <PermissionCheckbox name="canManageOrders" label={t('admin.canViewProcess').replace('{resource}', t('admin.orders'))} />
                                            <PermissionCheckbox name="canDeleteOrders" label={t('admin.canDelete').replace('{resource}', t('admin.orders'))} dependsOn="canManageOrders" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-8 py-4 bg-background-light dark:bg-gray-800 border border-black/[0.04] dark:border-white/[0.04] text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                <RefreshCw className="animate-spin text-[18px]" />
                            ) : (
                                user ? t('admin.updateUser') : t('admin.createUser')
                            )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
