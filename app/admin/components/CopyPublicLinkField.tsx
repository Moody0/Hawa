"use client";

import { Copy, Link2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface CopyPublicLinkFieldProps {
    path: string;
    label: string;
    isArabic: boolean;
}

async function copyText(value: string) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }
    } catch {
        // Try the browser's legacy clipboard command below when clipboard access is denied.
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
        throw new Error("Clipboard copy failed");
    }
}

export default function CopyPublicLinkField({ path, label, isArabic }: CopyPublicLinkFieldProps) {
    const handleCopy = async () => {
        try {
            await copyText(path);
            toast.success(isArabic ? "تم نسخ الرابط" : "Link copied");
        } catch {
            toast.error(isArabic ? "تعذر نسخ الرابط" : "Could not copy the link");
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-zinc-800/50">
            <div className="mb-2 flex items-center gap-2">
                <Link2 className="size-4 text-[#8A6305]" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{label}</span>
            </div>
            <p className="mb-2 text-[10px] text-slate-500 dark:text-gray-400">
                {isArabic ? "انسخ الرابط والصقه في وجهة البنر" : "Copy this path into the banner destination"}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    readOnly
                    value={path}
                    dir="ltr"
                    aria-label={label}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300"
                    onFocus={(event) => event.currentTarget.select()}
                />
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1e293b] dark:bg-[#8A6305] dark:hover:bg-[#725204]"
                >
                    <Copy className="size-3.5" aria-hidden="true" />
                    {isArabic ? "نسخ الرابط" : "Copy link"}
                </button>
            </div>
        </div>
    );
}
