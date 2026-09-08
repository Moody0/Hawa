"use client";

import { SessionProvider } from "next-auth/react";
import AdminSidebar from "../components/AdminSidebar";
import { AdminSidebarProvider, useAdminSidebar } from "../context/AdminSidebarContext";
import { ConfirmDialogProvider } from "../context/ConfirmDialogContext";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { isOpen, closeSidebar } = useAdminSidebar();

    return (
        <div className="flex h-screen w-full overflow-hidden">
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
        <SessionProvider session={session}>
            <AdminSidebarProvider>
                <ConfirmDialogProvider>
                    <DashboardLayoutInner>{children}</DashboardLayoutInner>
                </ConfirmDialogProvider>
            </AdminSidebarProvider>
        </SessionProvider>
    );
}
