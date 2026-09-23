export default function AdminDashboardLoading() {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0B1727] animate-in fade-in duration-150">
            {/* Top Header Skeleton */}
            <div className="h-14 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0f172a]/80 px-6 flex items-center justify-between shrink-0">
                <div className="h-5 w-36 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse" />
                <div className="flex items-center gap-3">
                    <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse hidden sm:block" />
                    <div className="h-8 w-16 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
                </div>
            </div>

            {/* Main Content Skeleton Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats / Metric Cards Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-3.5 w-20 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse" />
                                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                            </div>
                            <div className="h-7 w-28 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse" />
                            <div className="h-3 w-16 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Filter & Action Toolbar Skeleton */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="h-10 w-full sm:w-72 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <div className="h-10 w-28 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                        <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse" />
                    </div>
                </div>

                {/* Data Table / Content Grid Skeleton */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs overflow-hidden">
                    <div className="h-12 border-b border-slate-100 dark:border-white/5 px-6 flex items-center justify-between">
                        <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse" />
                        <div className="h-4 w-20 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 flex-1">
                                    <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-white/10 animate-pulse shrink-0" />
                                    <div className="space-y-1.5 flex-1 max-w-sm">
                                        <div className="h-4 w-3/4 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse" />
                                        <div className="h-3 w-1/2 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse hidden sm:block" />
                                <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-white/10 animate-pulse hidden md:block" />
                                <div className="h-8 w-16 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
