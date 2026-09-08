import { getSiteSettings } from "@/lib/public-queries";
import SiteContentClient from "./SiteContentClient";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function SiteContentPage() {
    await requireAdminSession("SITE_CONTENT_VIEW");

    const [siteSettings, categoriesData] = await Promise.all([
        getSiteSettings(),
        prisma.category.findMany({ where: { archivedAt: null }, select: { id: true, name: true }, orderBy: [{ name: "asc" }, { id: "asc" }] }),
    ]);
    
    return (
        <SiteContentClient
            initialSettings={siteSettings}
            categories={categoriesData.map((category) => ({
                id: category.id,
                name: category.name,
            }))}
        />
    );
}
