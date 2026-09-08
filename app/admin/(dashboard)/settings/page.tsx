import { getAdminUser } from "../../../../lib/admin-actions";
import SettingsClient from "./SettingsClient";
import { getValidAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await getValidAdminSession();

    if (!session || session.role !== 'SUPER_ADMIN') {
        redirect('/admin/dashboard');
    }

    const adminUser = await getAdminUser();
    
    return <SettingsClient initialUser={adminUser} />;
}
