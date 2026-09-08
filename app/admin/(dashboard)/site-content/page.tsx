import { getAdminCategories } from "../../../../lib/admin-actions";
import { getSiteSettings } from "@/lib/public-queries";
import SiteContentClient from "./SiteContentClient";
import { getValidAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function SiteContentPage() {
    const adminUser = await getValidAdminSession();

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        redirect('/admin/dashboard');
    }

    const [siteSettings, categoriesData] = await Promise.all([
        getSiteSettings(),
        getAdminCategories(1, 500),
    ]);
    
    return (
        <SiteContentClient
            initialSettings={siteSettings}
            categories={categoriesData.categories.map((category) => ({
                id: category.id,
                name: category.name,
            }))}
        />
    );
}
