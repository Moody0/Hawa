import {headers} from 'next/headers';
import { redirect } from "next/navigation";
import { getValidAdminSession } from "@/lib/admin-auth";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { ADMIN_PAGE_PERMISSIONS, adminLandingPath, hasAdminPermission } from '@/lib/admin-permissions';

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const adminUser = await getValidAdminSession();

    // Don't check auth for login page - it's handled by route group
    // This layout only applies to protected routes
    if (!adminUser) {
        const incoming=await headers();const target=incoming.get('x-admin-return-to')||'/admin/dashboard';
        redirect('/admin/login?callbackUrl='+encodeURIComponent(target));
    }
    const incoming = await headers();
    const path = (incoming.get('x-admin-return-to') || '/admin/dashboard').split('?')[0];
    const permission = ADMIN_PAGE_PERMISSIONS[path.split('/')[2]];
    if ((permission && !hasAdminPermission(adminUser.permissions, permission, adminUser.role === 'SUPER_ADMIN')) || (path === '/admin/users' && adminUser.role !== 'SUPER_ADMIN')) {
        redirect(adminLandingPath(adminUser));
    }

    return <DashboardLayoutClient session={{ user: adminUser }}>{children}</DashboardLayoutClient>;
}
