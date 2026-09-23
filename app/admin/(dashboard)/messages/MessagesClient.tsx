"use client";

import React, { useState, useEffect } from "react";
import {
    Mail,
    MailOpen,
    Trash2,
    Search,
    ChevronRight,
    RefreshCw,
    Phone,
    MapPin,
    Store,
    Calendar,
    MessageSquare,
    Eye,
    Save,
    X,
    ExternalLink,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import AdminHeader from "../../components/AdminHeader";
import { useAdminSidebar } from "../../context/AdminSidebarContext";
import { useConfirm } from "../../context/ConfirmDialogContext";

interface ContactMessageItem {
    id: string;
    name: string;
    phone: string;
    shopName: string | null;
    city: string | null;
    message: string;
    isRead: boolean;
    notes: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export default function MessagesClient() {
    const { t, dir, language } = useLanguage();
    const isArabic = language === "ar" || dir === "rtl";
    const { openSidebar } = useAdminSidebar();
    const confirm = useConfirm();

    const [messages, setMessages] = useState<ContactMessageItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");

    // Metrics
    const [totalCount, setTotalCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [todayCount, setTodayCount] = useState(0);

    // Selected message for detail modal
    const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const prevUnreadRef = React.useRef<number | null>(null);
    const isFirstLoadRef = React.useRef(true);

    const fetchMessages = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            if (searchQuery.trim()) params.set("search", searchQuery.trim());
            params.set("_t", Date.now().toString());

            const res = await fetch(`/api/admin/messages?${params.toString()}`, {
                cache: "no-store",
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.items || []);
                setTotalCount(data.total ?? 0);
                setUnreadCount(data.unreadCount ?? 0);
                setTodayCount(data.todayCount ?? 0);

                // If new unread message arrives while tab is open, alert admin
                if (!isFirstLoadRef.current && prevUnreadRef.current !== null && (data.unreadCount ?? 0) > prevUnreadRef.current) {
                    const diff = (data.unreadCount ?? 0) - prevUnreadRef.current;
                    toast.success(
                        isArabic
                            ? `📬 وصلتك ${diff === 1 ? "رسالة جديدة" : `${diff} رسائل جديدة`} من أحد العملاء!`
                            : `📬 ${diff} new customer inquiry received!`,
                        {
                            id: "new-customer-message-toast",
                            duration: 5000,
                        }
                    );
                }

                prevUnreadRef.current = data.unreadCount ?? 0;
                isFirstLoadRef.current = false;
            } else if (!silent) {
                toast.error(isArabic ? "فشل تحميل رسائل العملاء" : "Failed to load customer messages");
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            if (!silent) {
                toast.error(isArabic ? "حدث خطأ أثناء تحميل الرسائل" : "An error occurred while loading messages");
            }
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    };

    // 1. Initial & dependency-based load
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchMessages(false);
        }, 200);
        return () => clearTimeout(timeout);
    }, [statusFilter, searchQuery]);

    // 2. Real-time background auto-poll every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof document !== "undefined" && document.visibilityState === "visible") {
                fetchMessages(true);
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [statusFilter, searchQuery]);

    // 3. Instant auto-sync when window or tab gains focus
    useEffect(() => {
        const handleSync = () => {
            if (typeof document !== "undefined" && document.visibilityState === "visible") {
                fetchMessages(true);
            }
        };

        window.addEventListener("focus", handleSync);
        document.addEventListener("visibilitychange", handleSync);

        return () => {
            window.removeEventListener("focus", handleSync);
            document.removeEventListener("visibilitychange", handleSync);
        };
    }, [statusFilter, searchQuery]);

    const handleToggleRead = async (msg: ContactMessageItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const nextState = !msg.isRead;

        try {
            const res = await fetch(`/api/admin/messages/${msg.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isRead: nextState }),
            });

            if (res.ok) {
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: nextState } : m));
                setUnreadCount(prev => {
                    const next = nextState ? Math.max(0, prev - 1) : prev + 1;
                    prevUnreadRef.current = next;
                    return next;
                });

                if (selectedMessage?.id === msg.id) {
                    setSelectedMessage(prev => prev ? { ...prev, isRead: nextState } : null);
                }

                toast.success(
                    nextState
                        ? (isArabic ? "تم تحديد الرسالة كمقروءة" : "Marked as read")
                        : (isArabic ? "تم تحديد الرسالة كغير مقروءة" : "Marked as unread")
                );

                // Silent sync with server
                fetchMessages(true);
            } else {
                toast.error(isArabic ? "فشل تحديث حالة الرسالة" : "Failed to update status");
            }
        } catch (error) {
            console.error("Failed to toggle read state:", error);
            toast.error(isArabic ? "فشل التحديث" : "Update failed");
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        const ok = await confirm({
            title: isArabic ? "أرشفة / حذف الرسالة" : "Archive Message",
            message: isArabic
                ? "هل أنت متأكد من رغبتك بأرشفة هذه الرسالة؟ لن تظهر في قائمة الرسائل النشطة."
                : "Are you sure you want to archive this message? It will be removed from active inbox.",
            confirmText: isArabic ? "أرشفة" : "Archive",
            cancelText: isArabic ? "إلغاء" : "Cancel",
            variant: "danger",
        });
        if (!ok) return;

        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success(isArabic ? "تمت أرشفة الرسالة بنجاح" : "Message archived successfully");
                
                // Immediately synchronize local message list and metric counters
                const target = messages.find(m => m.id === id);
                setMessages(prev => prev.filter(m => m.id !== id));
                setTotalCount(prev => Math.max(0, prev - 1));
                if (target && !target.isRead) {
                    setUnreadCount(prev => {
                        const next = Math.max(0, prev - 1);
                        prevUnreadRef.current = next;
                        return next;
                    });
                }
                if (target) {
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);
                    if (new Date(target.createdAt) >= startOfToday) {
                        setTodayCount(prev => Math.max(0, prev - 1));
                    }
                }

                if (selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }

                // Silent background sync
                fetchMessages(true);
            } else {
                toast.error(isArabic ? "فشل حذف الرسالة" : "Failed to archive message");
            }
        } catch (error) {
            console.error("Failed to delete message:", error);
            toast.error(isArabic ? "حدث خطأ أثناء الحذف" : "Error archiving message");
        }
    };

    const handleOpenModal = (msg: ContactMessageItem) => {
        setSelectedMessage(msg);
        setAdminNotes(msg.notes || "");

        // If unread, automatically mark as read
        if (!msg.isRead) {
            handleToggleRead(msg);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedMessage) return;
        setIsSavingNotes(true);

        try {
            const res = await fetch(`/api/admin/messages/${selectedMessage.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: adminNotes }),
            });

            if (res.ok) {
                toast.success(isArabic ? "تم حفظ الملاحظات" : "Notes saved");
                setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, notes: adminNotes } : m));
                setSelectedMessage(prev => prev ? { ...prev, notes: adminNotes } : null);
            } else {
                toast.error(isArabic ? "فشل حفظ الملاحظات" : "Failed to save notes");
            }
        } catch (error) {
            console.error("Failed to save notes:", error);
            toast.error(isArabic ? "حدث خطأ" : "Error occurred");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const cleanPhoneDigits = (phone: string) => phone.replace(/[^0-9]/g, "");

    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            return new Intl.DateTimeFormat(isArabic ? "ar-SY" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(d);
        } catch {
            return dateString;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0b1120]">
            <AdminHeader title={isArabic ? "رسائل العملاء" : "Customer Messages"} onMenuClick={openSidebar} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-8 pb-10">
                    {/* Page Heading & Breadcrumbs */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                                <Link href="/admin/dashboard" className="hover:text-[#8A6305] transition-colors">
                                    {t("admin.dashboard") || "Dashboard"}
                                </Link>
                                <ChevronRight className={`text-xs ${dir === "rtl" ? "rotate-180" : ""}`} />
                                <span className="text-slate-900 dark:text-white font-medium">
                                    {isArabic ? "رسائل العملاء" : "Customer Messages"}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {isArabic ? "رسائل واستفسارات المتجر" : "Customer Inquiries & Messages"}
                            </h2>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {isArabic
                                    ? "صندوق الوارد لرسائل صفحة تواصل معنا مع حماية ضد السبام وإمكانية المتابعة والرد المباشر."
                                    : "Inbox for /contact inquiries with spam protection and quick communication tools."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 self-start md:self-auto">
                            <div
                                title={isArabic ? "مزامنة تلقائية نشطة كل 8 ثوانٍ وعند العودة إلى الصفحة" : "Live auto-sync active every 8s and on tab focus"}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{isArabic ? "مزامنة فورية نشطة" : "Live Auto-Sync"}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => fetchMessages(false)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                                <span>{isArabic ? "تحديث" : "Refresh"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    {isArabic ? "إجمالي الرسائل" : "Total Messages"}
                                </p>
                                <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">
                                    {totalCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                                <MessageSquare />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    {isArabic ? "رسائل جديدة غير مقروءة" : "Unread Inquiries"}
                                </p>
                                <p className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                    {unreadCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                                <Mail />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    {isArabic ? "رسائل اليوم" : "Today's Inquiries"}
                                </p>
                                <p className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                    {todayCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                                <Calendar />
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isArabic ? "ابحث بالاسم، المحل، الهاتف، أو نص الرسالة..." : "Search by name, phone, shop, or text..."}
                                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:border-[#8A6305] transition-colors"
                            />
                        </div>

                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
                            {(["ALL", "UNREAD", "READ"] as const).map((status) => {
                                const labels: Record<string, string> = {
                                    ALL: isArabic ? "كافة الرسائل" : "All",
                                    UNREAD: isArabic ? "غير مقروءة" : "Unread",
                                    READ: isArabic ? "مقروءة" : "Read",
                                };
                                const isActive = statusFilter === status;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                            isActive
                                                ? "bg-[#0B192C] text-white shadow-xs"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        <span>{labels[status]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Messages List / Table */}
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-400">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p className="text-xs">{isArabic ? "جاري تحميل الرسائل..." : "Loading messages..."}</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <MailOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {isArabic ? "لا توجد رسائل مطابقة" : "No messages found"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isArabic
                                        ? "عندما يقوم العملاء بإرسال استفسارات من صفحة تواصل معنا ستظهر هنا مباشرة."
                                        : "Inquiries submitted via /contact will appear here directly."}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => handleOpenModal(msg)}
                                        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                                            !msg.isRead ? "bg-amber-50/30 dark:bg-amber-950/10 font-medium" : ""
                                        }`}
                                    >
                                        {/* Left / Info */}
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            {/* Status Dot */}
                                            <div className="pt-1 shrink-0">
                                                {!msg.isRead ? (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" title="Unread" />
                                                ) : (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 block" title="Read" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {msg.name}
                                                    </h4>
                                                    {msg.shopName && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            <Store className="w-3 h-3" />
                                                            <span>{msg.shopName}</span>
                                                        </span>
                                                    )}
                                                    {msg.city && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{msg.city}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Message Snippet */}
                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                                                    {msg.message}
                                                </p>

                                                {/* Meta */}
                                                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                                                    <span className="font-mono" dir="ltr">{msg.phone}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(msg.createdAt)}</span>
                                                    {msg.notes && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[#8A6305] font-semibold">
                                                                {isArabic ? "يوجد ملاحظات" : "Has notes"}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                            <a
                                                href={`https://wa.me/${cleanPhoneDigits(msg.phone)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                title={isArabic ? "مراسلة عبر واتساب" : "WhatsApp Chat"}
                                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                            >
                                                <FaWhatsapp className="w-4 h-4" />
                                            </a>

                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleRead(msg, e)}
                                                title={msg.isRead ? (isArabic ? "تحديد كغير مقروء" : "Mark as unread") : (isArabic ? "تحديد كمقروء" : "Mark as read")}
                                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                {msg.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(msg)}
                                                title={isArabic ? "عرض التفاصيل" : "View Details"}
                                                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(msg.id, e)}
                                                title={isArabic ? "أرشفة" : "Archive"}
                                                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedMessage(null)}
                >
                    <div
                        className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-in fade-in-50 zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-5">
                            <div>
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold mb-1 ${
                                    selectedMessage.isRead
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                                }`}>
                                    {selectedMessage.isRead
                                        ? (isArabic ? "رسالة مقروءة" : "Read")
                                        : (isArabic ? "رسالة جديدة" : "New / Unread")}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {selectedMessage.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {formatDate(selectedMessage.createdAt)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedMessage(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Customer Information Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                                <p className="text-[11px] font-bold text-slate-400 uppercase">
                                    {isArabic ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp"}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5" dir="ltr">
                                    {selectedMessage.phone}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                                <p className="text-[11px] font-bold text-slate-400 uppercase">
                                    {isArabic ? "اسم المحل / الشركة" : "Shop / Business"}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                    {selectedMessage.shopName || (isArabic ? "غير محدد" : "Not specified")}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                                <p className="text-[11px] font-bold text-slate-400 uppercase">
                                    {isArabic ? "المحافظة / المدينة" : "City / Governorate"}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                    {selectedMessage.city || (isArabic ? "غير محدد" : "Not specified")}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                                <p className="text-[11px] font-bold text-slate-400 uppercase">
                                    {isArabic ? "عنوان IP المرسل" : "Client IP"}
                                </p>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-300 mt-0.5" dir="ltr">
                                    {selectedMessage.ipAddress || "Unknown"}
                                </p>
                            </div>
                        </div>

                        {/* Full Message Body */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                                {isArabic ? "نص الرسالة أو الطلب" : "Message Content"}
                            </p>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.message}
                            </div>
                        </div>

                        {/* Admin Internal Notes */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                    {isArabic ? "ملاحظات الإدارة الداخلية (خاصة)" : "Internal Admin Notes (Private)"}
                                </label>
                                <button
                                    type="button"
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B192C] hover:bg-[#1a2e4c] text-white text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{isSavingNotes ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ الملاحظة" : "Save Notes")}</span>
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder={isArabic ? "اكتب ملاحظات حول متابعة الطلب أو نتيجة الاتصال بالعميل..." : "Write notes regarding follow-up, call outcome, etc..."}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:border-[#8A6305] transition-colors resize-y"
                            />
                        </div>

                        {/* Direct Reply Actions */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5 flex-wrap">
                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://wa.me/${cleanPhoneDigits(selectedMessage.phone)}?text=${encodeURIComponent(
                                        isArabic
                                            ? `مرحباً أستاذ ${selectedMessage.name}، بخصوص رسالتكم إلى شركة حوا للتوزيع:`
                                            : `Hello ${selectedMessage.name}, regarding your inquiry to Hawa Distribution:`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition-all"
                                >
                                    <FaWhatsapp className="text-sm" />
                                    <span>{isArabic ? "رد عبر واتساب" : "Reply via WhatsApp"}</span>
                                    <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>

                                <a
                                    href={`tel:${selectedMessage.phone.replace(/\s+/g, "")}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 text-xs font-bold shadow-xs transition-all"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{isArabic ? "اتصال هاتفي" : "Call Customer"}</span>
                                </a>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleToggleRead(selectedMessage)}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                                >
                                    {selectedMessage.isRead
                                        ? (isArabic ? "تحديد كغير مقروء" : "Mark Unread")
                                        : (isArabic ? "تحديد كمقروء" : "Mark Read")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors"
                                >
                                    {isArabic ? "أرشفة الرسالة" : "Archive"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
