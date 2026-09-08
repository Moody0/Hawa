import { redirect } from "next/navigation";
import { getValidAdminSession } from "@/lib/admin-auth";
import DashboardLayoutClient from "./DashboardLayoutClient";

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
        redirect("/admin/login");
    }

    return <DashboardLayoutClient session={{ user: adminUser }}>{children}</DashboardLayoutClient>;
}
