import React from 'react';

export default function ProductLoadingSkeleton() {
    return (
        <main className="grow w-full mx-auto container-custom py-4 lg:py-8 animate-fadeIn" aria-busy="true">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="w-16 h-3.5 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                <span className="text-gray-300 dark:text-zinc-700">/</span>
                <div className="w-24 h-3.5 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                <span className="text-gray-300 dark:text-zinc-700">/</span>
                <div className="w-32 h-3.5 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full mt-4">
                {/* Product Gallery Skeleton (Left) */}
                <div className="w-full lg:w-[58.5%] flex-shrink-0">
                    <div className="w-full aspect-square rounded-2xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200/60 dark:border-white/10 overflow-hidden relative">
                        <div className="image-shimmer absolute inset-0" />
                    </div>

                    {/* Thumbnail Strip Skeleton */}
                    <div className="flex gap-3 mt-4 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200/40 dark:border-white/5 relative overflow-hidden shrink-0"
                            >
                                <div className="image-shimmer absolute inset-0" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Details Skeleton (Right) */}
                <div className="w-full lg:w-[41.5%] flex flex-col gap-4">
                    {/* Brand Pill */}
                    <div className="w-24 h-4 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse" />

                    {/* Product Title */}
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-7 sm:h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="w-2/3 h-7 sm:h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                    </div>

                    {/* Rating / Stock Badge */}
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-28 h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
                        <div className="w-20 h-5 bg-green-100 dark:bg-green-950/40 rounded-full animate-pulse" />
                    </div>

                    {/* Price Block */}
                    <div className="w-48 h-12 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse mt-2 p-3 flex items-center gap-3">
                        <div className="w-28 h-6 bg-gray-200 dark:bg-zinc-700 rounded" />
                    </div>

                    {/* Add to Cart Button */}
                    <div className="w-full h-13 bg-[#0B192C]/15 dark:bg-white/10 rounded-full animate-pulse mt-3" />

                    {/* Accordion Placeholders */}
                    <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                        <div className="w-full h-12 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5 animate-pulse" />
                        <div className="w-full h-12 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-white/5 animate-pulse" />
                    </div>
                </div>
            </div>
        </main>
    );
}
