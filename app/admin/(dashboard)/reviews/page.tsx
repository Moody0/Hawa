import { getValidAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";

export const metadata = {
    title: "Manage Reviews - Admin Dashboard",
};

export default async function ReviewsPage() {
    const adminUser = await getValidAdminSession();

    if (!adminUser) {
        redirect("/admin/login");
    }

    if (!adminUser.canManageReviews && adminUser.role !== "SUPER_ADMIN") {
        redirect("/admin/dashboard");
    }

    return <ReviewsClient />;
}
