"use client";

import React, { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    return (
        <html lang="ar" dir="rtl">
            <body className="bg-slate-50 text-slate-900 font-sans min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                        !
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">
                        عذراً، حدث خطأ غير متوقع في النظام
                    </h1>
                    <p className="text-sm text-slate-600 mb-6">
                        An unexpected application error occurred. You can retry refreshing the page.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#8A6305] text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-md"
                    >
                        إعادة المحاولة / Try Again
                    </button>
                    {error.digest && (
                        <p className="text-[10px] text-slate-400 font-mono mt-6">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
