import { getUsers } from "@/lib/user-actions";
import UsersClient from "./UsersClient";
import { getValidAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
    const adminUser = await getValidAdminSession();

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        redirect('/admin/dashboard');
    }

    const users = await getUsers();

    return <UsersClient users={users as any[]} />;
}
