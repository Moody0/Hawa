"use client";

import { SessionProvider } from "next-auth/react";
import AdminSidebar from "../components/AdminSidebar";
import { AdminSidebarProvider, useAdminSidebar } from "../context/AdminSidebarContext";
import { ConfirmDialogProvider } from "../context/ConfirmDialogContext";
import { LanguageProvider } from "@/app/context/LanguageContext";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function AdminProgressBar() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (loading) {
            setProgress(100);
            const timer = setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("a");
            if (!target) return;
            const href = target.getAttribute("href");
            if (
                href &&
                href.startsWith("/admin") &&
                !href.startsWith("/admin/login") &&
                target.target !== "_blank" &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.shiftKey
            ) {
                const url = new URL(target.href, window.location.origin);
                if (url.pathname !== window.location.pathname) {
                    setLoading(true);
                    setProgress(30);
                    const t1 = setTimeout(() => setProgress((p) => (p === 30 ? 65 : p)), 150);
                    const t2 = setTimeout(() => setProgress((p) => (p === 65 ? 85 : p)), 400);
                    return () => {
                        clearTimeout(t1);
                        clearTimeout(t2);
                    };
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    if (!loading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-[#8A6305] via-[#E5A93C] to-[#8A6305] shadow-[0_0_10px_rgba(229,169,60,0.8)]"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    transition: progress === 100 ? "width 150ms ease-out, opacity 250ms ease-out 100ms" : "width 300ms ease-out",
                }}
            />
        </div>
    );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { isOpen, closeSidebar } = useAdminSidebar();

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <AdminProgressBar />
            <AdminSidebar isOpen={isOpen} onClose={closeSidebar} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayoutClient({
    children,
    session,
}: {
    children: React.ReactNode;
    session?: any;
}) {
    return (
        <LanguageProvider scope="admin">
            <SessionProvider session={session}>
                <AdminSidebarProvider>
                    <ConfirmDialogProvider>
                        <DashboardLayoutInner>{children}</DashboardLayoutInner>
                    </ConfirmDialogProvider>
                </AdminSidebarProvider>
            </SessionProvider>
        </LanguageProvider>
    );
}
