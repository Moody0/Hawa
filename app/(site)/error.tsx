"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { MdRefresh, MdHome, MdErrorOutline } from "react-icons/md";

export default function SiteError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log unexpected error details safely
        console.error("Site route error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-900/30">
                    <MdErrorOutline className="text-3xl" />
                </div>
                <h1 className="text-xl font-bold text-[#0B192C] dark:text-white mb-2">
                    حدث خطأ غير متوقع
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    نعتذر عن هذا الخطأ. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#0B192C] hover:bg-[#8A6305] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <MdRefresh className="text-base" />
                        <span>إعادة المحاولة</span>
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#0B192C] dark:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                        <MdHome className="text-base" />
                        <span>الرئيسية</span>
                    </Link>
                </div>
                {error.digest && (
                    <p className="text-[10px] text-slate-400 font-mono mt-6">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
