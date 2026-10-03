import { getAdminBanners } from "../../../../lib/admin-actions";
import BannersClient from "./BannersClient";
import { getCatalogMainCategories } from "../../../../lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
    const [banners, mainCategories] = await Promise.all([getAdminBanners(), getCatalogMainCategories()]);

    return <BannersClient banners={banners} mainCategories={mainCategories} />;
}
