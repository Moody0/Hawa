"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MdWarning, MdStorefront } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { updateAdminCredentials } from "../../../../lib/admin-actions";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

interface AdminUser {
    id: string;
    username: string;
    createdAt: string;
    updatedAt: string;
}

export default function SettingsClient({ 
    initialUser
}: { 
    initialUser: AdminUser | null
}) {
    const { t, language } = useLanguage();
    const { openSidebar } = useAdminSidebar();
    
    // Account Settings State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialUser) {
            setNewUsername(initialUser.username);
        }
    }, [initialUser]);

    const handleAccountSubmit = async (e: React.FormEvent) => {
         e.preventDefault();

         if (!currentPassword) {
             toast.error(t('admin.currentPasswordRequired'));
             return;
         }

         if (newPassword && newPassword !== confirmPassword) {
             toast.error(t('admin.passwordsDoNotMatch'));
             return;
         }

         if (newPassword && newPassword.length < 6) {
             toast.error(t('admin.passwordTooShort'));
             return;
         }

         setIsSubmitting(true);

         try {
             const result = await updateAdminCredentials({
                 currentPassword,
                 newUsername: newUsername !== initialUser?.username ? newUsername : undefined,
                 newPassword: newPassword || undefined,
             });

             if (result.success) {
                 toast.success(result.message || t('admin.settingsUpdated'));
                 setCurrentPassword("");
                 setNewPassword("");
                 setConfirmPassword("");

                 // If password was changed, sign out
                 if (newPassword) {
                     toast.success(t('admin.passwordChangedLogout'));
                     setTimeout(() => {
                         signOut({ callbackUrl: "/admin/login" });
                     }, 2000);
                 }
             } else {
                 toast.error(result.error || t('admin.failedToUpdate'));
             }
         } catch (error) {
             console.error("Error updating settings:", error);
             toast.error(t('admin.failedToUpdate'));
         } finally {
             setIsSubmitting(false);
         }
     };

    if (!initialUser) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader title={t('admin.settings')} onMenuClick={openSidebar} />
                <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
                    <div className="max-w-2xl mx-auto">
                        <p className="text-center text-text-sub">{t('admin.unableToLoadUser')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader title={t('admin.settings')} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
                <div className="max-w-2xl mx-auto">
                    {/* B2B Wholesale Statistics & Content Quick Link */}
                    <div className="mb-6 p-5 rounded-2xl bg-[#FAF6EC] dark:bg-zinc-800/80 border border-[#8A6305]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="p-3 rounded-xl bg-[#0B192C] text-[#8A6305] shadow-xs">
                                <MdStorefront className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-[#0B192C] dark:text-[#8A6305]">
                                    {language === 'ar' ? 'إحصائيات الشركة وإعدادات المتجر' : 'Store Settings & Wholesale Metrics'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {language === 'ar' ? 'تعديل أرقام التوصيل، الوكالات، سعر الصرف ومحتوى المتجر' : 'Configure delivery metrics, agencies count, exchange rate, and site content'}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/site-content"
                            className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#1e293b] text-white text-xs font-bold rounded-xl transition-all text-center shrink-0 shadow-xs active:scale-95"
                        >
                            {language === 'ar' ? 'إدارة الإحصائيات والمحتوى' : 'Manage Metrics'}
                        </Link>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main dark:text-white mb-2">
                                {t('admin.adminAccountSettings')}
                            </h2>
                            <p className="text-text-sub dark:text-gray-400">
                                {t('admin.updateCredentials')}
                            </p>
                        </div>

                        <form onSubmit={handleAccountSubmit} className="space-y-6">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-main dark:text-white">
                                    {t('admin.currentPassword')} *
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t('admin.enterCurrentPassword')}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                                <p className="text-xs text-text-sub dark:text-gray-400">
                                    {t('admin.requiredToVerify')}
                                </p>
                            </div>

                            <div className="border-t border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] pt-6">
                                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                                    {t('admin.changeCredentials')}
                                </h3>

                                {/* New Username */}
                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-bold text-text-main dark:text-white">
                                        {t('admin.username')}
                                    </label>
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder={t('admin.enterNewUsername')}
                                        className="w-full px-4 py-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    />
                                </div>

                                {/* New Password */}
                                <div className="space-y-2 mb-6">
                                    <label className="text-sm font-bold text-text-main dark:text-white">
                                        {t('admin.newPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={t('admin.leaveBlank')}
                                        className="w-full px-4 py-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    />
                                    <p className="text-xs text-text-sub dark:text-gray-400">
                                        {t('admin.minChars')}
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                {newPassword && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-main dark:text-white">
                                            {t('admin.confirmNewPassword')}
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t('admin.reEnterNewPassword')}
                                            className="w-full px-4 py-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] dark:border-white/[0.04] bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#0B192C] hover:bg-[#1e293b] text-white py-3 rounded-xl font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                            {t('admin.updating')}
                                        </span>
                                    ) : (
                                        t('admin.updateSettings')
                                    )}
                                </button>
                            </div>

                            {newPassword && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <MdWarning className="text-amber-600 dark:text-amber-400 text-xl" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                                                {t('admin.passwordChangeNotice')}
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                                {t('admin.logoutNotice')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
