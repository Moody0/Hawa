"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { Menu, ExternalLink } from "lucide-react";

interface AdminHeaderProps {
    title: string;
    onMenuClick: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
    const { t, language, setLanguage } = useLanguage();

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shadow-2xs">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
                    aria-label={t("admin.toggleNavigation")}
                >
                    <Menu className="text-[22px]" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    target="_blank"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B192C] dark:text-[#8A6305] hover:bg-[#FAF6EC] dark:hover:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10 transition-all hover:border-[#8A6305]/40"
                    title={t("admin.visitStore") || "Visit Store"}
                >
                    <ExternalLink className="text-[14px]" />
                    <span>{t("admin.visitStore") || "Visit Store"}</span>
                </Link>

                <button
                    type="button"
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={t("admin.switchLanguage")}
                    aria-label={t("admin.switchLanguage")}
                >
                    <span aria-hidden="true" className="text-[15px] text-[#8A6305]">{language === 'ar' ? 'AR' : 'EN'}</span>
                    <span>{t(`language.${language === 'ar' ? 'arabic' : 'english'}`)}</span>
                </button>
            </div>
        </header>
    );
}
