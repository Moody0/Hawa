import { requireAdminSession } from "@/lib/admin-auth";
import MessagesClient from "./MessagesClient";

export const metadata = {
    title: "Customer Messages - Admin Dashboard | شركة حوا للتوزيع",
};

export default async function MessagesPage() {
    await requireAdminSession("SITE_CONTENT_VIEW");

    return <MessagesClient />;
}
