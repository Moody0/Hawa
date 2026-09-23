"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatOrderNumber } from "@/lib/order-number";

interface CancelOrderDialogProps {
    orderNumber: number;
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
}

export default function CancelOrderDialog({ orderNumber, isSaving, onClose, onConfirm }: CancelOrderDialogProps) {
    const { language } = useLanguage();
    const isArabic = language === "ar";
    const [reason, setReason] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const message = reason.trim();
        if (message) void onConfirm(message);
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60" onClick={isSaving ? undefined : onClose} />
            <form
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-order-title"
                onSubmit={handleSubmit}
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="cancel-order-title" className="text-lg font-bold text-slate-900 dark:text-white">
                            {isArabic ? "إلغاء الطلب" : "Cancel order"} {formatOrderNumber(orderNumber)}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {isArabic ? "اكتب سبب الإلغاء الذي سيظهر للعميل." : "Write the cancellation reason that the customer will see."}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} disabled={isSaving} aria-label={isArabic ? "إغلاق" : "Close"} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800">
                        <X className="size-5" />
                    </button>
                </div>

                <label htmlFor="order-cancellation-reason" className="mt-5 block text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isArabic ? "سبب الإلغاء" : "Cancellation reason"}
                </label>
                <textarea
                    id="order-cancellation-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    required
                    maxLength={1000}
                    rows={4}
                    disabled={isSaving}
                    placeholder={isArabic ? "اكتب رسالة واضحة للعميل..." : "Explain why this order was cancelled..."}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="mt-1 text-end text-xs text-slate-500">{reason.length}/1000</p>

                <div className="mt-5 flex gap-3">
                    <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        {isArabic ? "رجوع" : "Back"}
                    </button>
                    <button type="submit" disabled={isSaving || !reason.trim()} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {isSaving ? (isArabic ? "جاري الإلغاء..." : "Cancelling...") : (isArabic ? "تأكيد الإلغاء" : "Confirm cancellation")}
                    </button>
                </div>
            </form>
        </div>
    );
}
