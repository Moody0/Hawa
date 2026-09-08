import React from 'react';

export default function BrandLoadingSkeleton() {
    return (
        <div className="flex-1 container-custom py-4 md:py-8" aria-busy="true">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-14 h-3 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                <span className="text-slate-300 dark:text-zinc-700">/</span>
                <div className="w-20 h-3 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                <span className="text-slate-300 dark:text-zinc-700">/</span>
                <div className="w-28 h-3 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Brand Masthead Card Skeleton */}
            <div className="relative rounded-2xl md:rounded-3xl bg-white dark:bg-[#0C1821] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shrink-0 relative overflow-hidden">
                        <div className="image-shimmer absolute inset-0" />
                    </div>
                    <div className="flex-1 flex flex-col items-center sm:items-start gap-2.5 w-full">
                        <div className="w-36 h-4 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-56 h-8 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="w-full max-w-xl h-3.5 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-3/4 max-w-md h-3.5 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                    </div>
                </div>

            </div>

            {/* Toolbar Skeleton */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200/80 dark:border-white/10">
                <div className="w-64 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                <div className="w-32 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-3 sm:p-4 flex flex-col gap-3"
                    >
                        <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden relative">
                            <div className="image-shimmer absolute inset-0" />
                        </div>
                        <div className="w-16 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-full h-4 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-28 h-5 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse mt-auto" />
                        <div className="w-full h-9 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
