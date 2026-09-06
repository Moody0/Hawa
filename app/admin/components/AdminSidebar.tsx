"use client";

import Link from "next/link";
import Image from "next/image";
import { 
    MdDashboard, 
    MdShoppingBag, 
    MdStorefront,
    MdCategory, 
    MdViewCarousel, 
    MdInventory2, 
    MdEditNote, 
    MdGroup, 
    MdSettings,
    MdClose,
    MdLogout,
    MdAccountTree,
    MdStar,
    MdPeople,
    MdArticle
} from "react-icons/md";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/app/context/LanguageContext";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

type PermissionKey =
    | "canManageBrands"
    | "canManageProducts"
    | "canManageCategories"
    | "canManageBanners"
    | "canManageOrders"
    | "canManageReviews";

interface NavItem {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    permission?: PermissionKey;
    superAdminOnly?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession() || {};
    const { t, dir, language } = useLanguage();
    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

    const isArabic = language === 'ar';

    const navSections: NavSection[] = [
        {
            title: t('admin.overview') || "Overview",
            items: [
                { href: "/admin/dashboard", icon: MdDashboard, label: t('admin.dashboard') }
            ]
        },
        {
            title: t('admin.catalogManagement') || "Catalog Management",
            items: [
                { href: "/admin/main-categories", icon: MdAccountTree, label: t("admin.mainCategories"), superAdminOnly: true },
                { href: "/admin/categories", icon: MdCategory, label: t('admin.categories'), permission: "canManageCategories" },
                { href: "/admin/brands", icon: MdStorefront, label: t('admin.brands'), permission: "canManageBrands" },
                { href: "/admin/products", icon: MdShoppingBag, label: t('admin.products'), permission: "canManageProducts" }
            ]
        },
        {
            title: t('admin.salesAndCustomers') || "Sales & Customers",
            items: [
                { href: "/admin/orders", icon: MdInventory2, label: t('admin.orders'), permission: "canManageOrders" },
                { href: "/admin/customers", icon: MdPeople, label: t('admin.customers') || "Customers", permission: "canManageOrders" },
                { href: "/admin/reviews", icon: MdStar, label: t('admin.reviews'), permission: "canManageReviews" }
            ]
        },
        {
            title: t('admin.storeAndSystem') || "Store & System",
            items: [
                { href: "/admin/banners", icon: MdViewCarousel, label: t('admin.banners'), permission: "canManageBanners" },
                { href: "/admin/blog", icon: MdArticle, label: t('admin.blog') || "Blog", superAdminOnly: true },
                { href: "/admin/site-content", icon: MdEditNote, label: t('admin.siteContent'), superAdminOnly: true },
                { href: "/admin/users", icon: MdGroup, label: t('admin.users'), superAdminOnly: true },
                { href: "/admin/settings", icon: MdSettings, label: t('admin.settings'), superAdminOnly: true }
            ]
        }
    ];

    const handleSignOut = () => {
        signOut({ callbackUrl: "/admin/login" });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 ${
                    dir === 'rtl' ? 'right-0 border-s' : 'left-0 border-e'
                } z-50 w-[270px] max-w-[85vw] shrink-0 border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0f172a] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
                    isOpen
                        ? "translate-x-0 pointer-events-auto"
                        : dir === 'rtl'
                            ? "translate-x-full pointer-events-none lg:pointer-events-auto lg:translate-x-0"
                            : "-translate-x-full pointer-events-none lg:pointer-events-auto lg:translate-x-0"
                }`}
            >
                <div className="h-full flex flex-col justify-between py-5 px-4 overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col gap-6">
                        {/* Logo & Brand Header */}
                        <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-white/5">
                            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                                <Image
                                    src="/logo.png"
                                    alt="Hawa Distribution"
                                    width={140}
                                    height={44}
                                    priority
                                    className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B192C] dark:text-[#8A6305]">
                                        {isArabic ? "لوحة الإدارة" : "Admin Portal"}
                                    </span>
                                </div>
                            </Link>

                            {/* Close button for mobile */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close Sidebar"
                            >
                                <MdClose className="text-2xl" />
                            </button>
                        </div>

                        {/* Grouped Navigation Sections */}
                        <div className="flex flex-col gap-5">
                            {navSections.map((section, sIdx) => {
                                const visibleItems = section.items.filter((item) => {
                                    if (item.superAdminOnly && !isSuperAdmin) return false;
                                    if (item.permission && !isSuperAdmin && !session?.user?.[item.permission]) return false;
                                    return true;
                                });

                                if (visibleItems.length === 0) return null;

                                return (
                                    <div key={sIdx} className="flex flex-col gap-1">
                                        <p className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#475569] dark:text-slate-300">
                                            {section.title}
                                        </p>
                                        <div className="flex flex-col gap-0.5">
                                            {visibleItems.map((item) => {
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={onClose}
                                                        className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                                                            isActive
                                                                ? "bg-[#0B192C] text-white shadow-xs font-semibold"
                                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium"
                                                        }`}
                                                    >
                                                        <item.icon
                                                            className={`text-[19px] shrink-0 transition-colors ${
                                                                isActive
                                                                    ? "text-[#8A6305]"
                                                                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                                            }`}
                                                        />
                                                        <span className="text-[13.5px] leading-tight">
                                                            {item.label}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom User & Sign Out Footer */}
                    <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-slate-200/80 dark:border-white/10">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
                            <div className="h-8 w-8 rounded-full bg-[#0B192C] dark:bg-[#8A6305] text-white dark:text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-slate-900 dark:text-white text-[13px] font-bold leading-tight truncate">
                                    {session?.user?.name || "Admin"}
                                </p>
                                <p className="text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold tracking-tight uppercase truncate">
                                    {isSuperAdmin ? t('admin.superAdmin') : t('admin.editor')}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-400 transition-colors group text-xs font-semibold"
                        >
                            <MdLogout className={`text-base group-hover:text-rose-600 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                            <span>{t('admin.signOut')}</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
