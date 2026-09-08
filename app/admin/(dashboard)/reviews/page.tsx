import { requireAdminSession } from "@/lib/admin-auth";
import ReviewsClient from "./ReviewsClient";

export const metadata = {
    title: "Manage Reviews - Admin Dashboard",
};

export default async function ReviewsPage() {
    await requireAdminSession("REVIEWS_VIEW");

    return <ReviewsClient />;
}
