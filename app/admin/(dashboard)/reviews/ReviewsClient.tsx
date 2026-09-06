"use client";

import { useState, useEffect } from "react";
import { MdCheckCircle, MdCancel, MdDelete, MdStar, MdImage, MdChevronRight, MdSearch, MdExpandMore } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/app/context/LanguageContext";
import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import Link from "next/link";

interface Review {
    id: string;
    product: { name: string };
    name: string;
    email: string | null;
    rating: number;
    feedback: string | null;
    image: string | null;
    isApproved: boolean;
    createdAt: string;
}

export default function ReviewsClient() {
    const { t, dir } = useLanguage();
    const { openSidebar } = useAdminSidebar();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/reviews");
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            } else {
                toast.error(t("admin.errorGeneric"));
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            toast.error(t("admin.errorGeneric"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isApproved: !currentStatus }),
            });

            if (res.ok) {
                toast.success(t("admin.reviewStatusUpdated"));
                setReviews(reviews.map((r) => r.id === id ? { ...r, isApproved: !currentStatus } : r));
            } else {
                toast.error(t("admin.errorGeneric"));
            }
        } catch (error) {
            console.error("Failed to update review status:", error);
            toast.error(t("admin.errorGeneric"));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("admin.confirmDeleteReview"))) return;

        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success(t("admin.reviewDeleted"));
                setReviews(reviews.filter((r) => r.id !== id));
            } else {
                toast.error(t("admin.errorGeneric"));
            }
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast.error(t("admin.errorGeneric"));
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch = review.product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (review.email && review.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (review.feedback && review.feedback.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === "ALL" 
            ? true 
            : statusFilter === "APPROVED" 
                ? review.isApproved 
                : !review.isApproved;
                
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <AdminHeader title={t('admin.reviews') || "Reviews"} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-8 pb-10">
                    
                    {/* Page Heading & Breadcrumbs */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-text-sub dark:text-gray-400 mb-1">
                                <Link href="/admin/dashboard" className="hover:text-primary cursor-pointer transition-colors">{t('admin.dashboard')}</Link>
                                <MdChevronRight className={`text-[12px] ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                <span className="text-text-main dark:text-white font-medium">{t('admin.reviews') || "Reviews"}</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-text-main dark:text-white tracking-tight">{t('admin.reviews') || "Reviews"}</h2>
                            <p className="text-text-sub dark:text-gray-400">{t('admin.manageReviews')}</p>
                        </div>
                    </div>

                    {/* Stats Cards (2-cols on mobile, 3-cols on sm) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col gap-1">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">{t('admin.totalReviews') || "Total Reviews"}</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{reviews.length}</p>
                        </div>
                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col gap-1">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">{t('admin.pendingReviews') || "Pending"}</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-amber-500">{reviews.filter(r => !r.isApproved).length}</p>
                        </div>
                        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">{t('admin.approvedReviews') || "Approved"}</p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{reviews.filter(r => r.isApproved).length}</p>
                        </div>
                    </div>

                    {/* Filters & Table Container */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <span className={`absolute inset-y-0 ${dir === 'rtl' ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none`}>
                                    <MdSearch className="text-slate-400 text-[20px]" />
                                </span>
                                <input
                                    className={`block w-full ${dir === 'rtl' ? 'pe-10 ps-3' : 'ps-10 pe-3'} py-2.5 border border-slate-200/80 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-gray-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-[#0B192C] focus:border-[#0B192C] transition-all outline-none`}
                                    placeholder={t('admin.searchPlaceholder') || "Search..."}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative w-full sm:w-48">
                                <select
                                    className={`appearance-none w-full ${dir === 'rtl' ? 'pe-3 ps-10' : 'ps-3 pe-10'} py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0B192C] focus:border-[#0B192C] cursor-pointer outline-none`}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">{t('admin.allStatuses') || "All Statuses"}</option>
                                    <option value="APPROVED">{t('admin.approvedReviews') || "Approved"}</option>
                                    <option value="PENDING">{t('admin.pendingReviews') || "Pending"}</option>
                                </select>
                                <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'start-0 ps-2' : 'end-0 pe-2'} flex items-center pointer-events-none text-slate-400`}>
                                    <MdExpandMore className="text-[20px]" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B192C] border-t-transparent" />
                                </div>
                            ) : filteredReviews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                    <p>{t("admin.noReviewsFound") || "No reviews found"}</p>
                                </div>
                            ) : (
                                <table className={`w-full min-w-[800px] border-collapse ${dir === 'rtl' ? 'text-end' : 'text-start'}`}>
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-white/10 text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            <th className="p-3 sm:p-5">{t("admin.product")}</th>
                                            <th className="p-3 sm:p-5">{t("admin.reviewerName")}</th>
                                            <th className="p-3 sm:p-5">{t("admin.rating")}</th>
                                            <th className="p-3 sm:p-5 max-w-xs">{t("admin.feedback")}</th>
                                            <th className="p-3 sm:p-5">{t("admin.status")}</th>
                                            <th className={`p-3 sm:p-5 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>{t("admin.actions")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {filteredReviews.map((review) => (
                                            <tr key={review.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-3 sm:p-5">
                                                    <span className="font-semibold text-text-main dark:text-white line-clamp-1">{review.product.name}</span>
                                                </td>
                                                <td className="p-3 sm:p-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-semibold text-text-main dark:text-white">{review.name}</span>
                                                        {review.email && (
                                                            <span className="text-xs text-text-sub dark:text-gray-400">{review.email}</span>
                                                        )}
                                                        <span className="text-xs text-text-sub dark:text-slate-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 sm:p-5">
                                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg w-fit border border-amber-100 dark:border-amber-800/30">
                                                        <span className="font-bold text-amber-600 dark:text-amber-500 text-sm">{review.rating}</span>
                                                        <MdStar className="text-amber-500 text-sm" />
                                                    </div>
                                                </td>
                                                <td className="p-3 sm:p-5">
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-text-main dark:text-gray-300 text-sm line-clamp-2 max-w-xs">{review.feedback || "-"}</p>
                                                        {review.image && /^(https?:\/\/|\/uploads\/)/i.test(review.image) && (
                                                            <a href={review.image} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline bg-primary/5 px-2 py-1 rounded w-fit">
                                                                <MdImage className="text-sm" /> {t("products.reviewModal.uploadImage") || "View Image"}
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 sm:p-5">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                        review.isApproved 
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/30" 
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                                                    }`}>
                                                        {review.isApproved ? (
                                                            <><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{t("admin.approvedReviews") || "Approved"}</>
                                                        ) : (
                                                            <><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{t("admin.pendingReviews") || "Pending"}</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className={`p-3 sm:p-5 ${dir === 'rtl' ? 'text-start' : 'text-end'}`}>
                                                    <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                                                        <button
                                                            onClick={() => handleToggleApproval(review.id, review.isApproved)}
                                                            className={`rounded-xl p-2 transition-colors ${
                                                                review.isApproved
                                                                    ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                                    : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            }`}
                                                            title={review.isApproved ? t("admin.unapprove") || "Unapprove" : t("admin.approve") || "Approve"}
                                                        >
                                                            {review.isApproved ? <MdCancel className="text-[20px]" /> : <MdCheckCircle className="text-[20px]" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(review.id)}
                                                            className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
                                                            title={t("admin.deleteReview") || "Delete"}
                                                        >
                                                            <MdDelete className="text-[20px]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
