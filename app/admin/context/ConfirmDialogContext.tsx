"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmDialogProvider");
    }
    return context.confirm;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
    const resolverRef = useRef<((value: boolean) => void) | null>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
    const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
    const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);

    const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
        return new Promise((resolve) => {
            previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
            resolverRef.current = resolve;
            if (typeof opts === "string") {
                setOptions({
                    title: "تأكيد الإجراء",
                    message: opts,
                    confirmText: "تأكيد",
                    cancelText: "إلغاء",
                    variant: "danger",
                });
            } else {
                setOptions({
                    title: opts.title || "تأكيد الإجراء",
                    message: opts.message,
                    confirmText: opts.confirmText || "تأكيد",
                    cancelText: opts.cancelText || "إلغاء",
                    variant: opts.variant || "danger",
                });
            }
            setIsOpen(true);
        });
    }, []);

    const handleClose = useCallback((result: boolean) => {
        setIsOpen(false);
        if (resolverRef.current) {
            resolverRef.current(result);
            resolverRef.current = null;
        }
        if (previouslyFocusedElementRef.current) {
            previouslyFocusedElementRef.current.focus();
            previouslyFocusedElementRef.current = null;
        }
    }, []);

    // Focus management and Escape key handling
    useEffect(() => {
        if (!isOpen) return;

        // Prevent body scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Initial focus on Cancel button (safe default)
        const timer = setTimeout(() => {
            cancelButtonRef.current?.focus();
        }, 30);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose(false);
            } else if (e.key === "Tab") {
                // Focus trap
                const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
                    'button, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements || focusableElements.length === 0) return;

                const firstEl = focusableElements[0];
                const lastEl = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    }
                } else {
                    if (document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timer);
        };
    }, [isOpen, handleClose]);

    const isDanger = options.variant === "danger";

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={() => handleClose(false)}
                    aria-hidden={!isOpen}
                >
                    <div
                        ref={dialogRef}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-dialog-title"
                        aria-describedby="confirm-dialog-desc"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white dark:bg-[#132035] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 text-slate-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-150"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        isDanger
                                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30"
                                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30"
                                    }`}
                                >
                                    {isDanger ? (
                                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                                    )}
                                </div>
                                <h2
                                    id="confirm-dialog-title"
                                    className="text-lg font-bold text-slate-900 dark:text-white leading-snug"
                                >
                                    {options.title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleClose(false)}
                                aria-label="إغلاق"
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Description Message */}
                        <p
                            id="confirm-dialog-desc"
                            className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                        >
                            {options.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                ref={cancelButtonRef}
                                type="button"
                                onClick={() => handleClose(false)}
                                className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-95 cursor-pointer"
                            >
                                {options.cancelText || "إلغاء"}
                            </button>
                            <button
                                ref={confirmButtonRef}
                                type="button"
                                onClick={() => handleClose(true)}
                                className={`min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 cursor-pointer ${
                                    isDanger
                                        ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500"
                                        : "bg-[#8A6305] hover:bg-[#735204] focus-visible:ring-[#8A6305]"
                                }`}
                            >
                                {options.confirmText || "تأكيد"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
