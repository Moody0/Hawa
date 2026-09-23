import { getSiteSettings } from "@/lib/public-queries";
import SiteContentClient from "./SiteContentClient";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function SiteContentPage() {
    await requireAdminSession("SITE_CONTENT_VIEW");

    const [siteSettings, mainCategoriesData, categoriesData, productsData] = await Promise.all([
        getSiteSettings(),
        prisma.mainCategory.findMany({
            where: { archivedAt: null },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                isFeatured: true,
                isActive: true,
            },
            orderBy: [{ navOrder: "asc" }, { name: "asc" }],
        }),
        prisma.category.findMany({
            where: { isActive: true, archivedAt: null, brand: { isActive: true } },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                isFeatured: true,
                brand: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [{ name: "asc" }, { id: "asc" }],
        }),
        prisma.product.findMany({
            where: { archivedAt: null, brand: { isActive: true } },
            select: {
                id: true,
                name: true,
                nameAr: true,
                slug: true,
                images: true,
                price: true,
                isTrending: true,
                brand: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [{ name: "asc" }, { id: "asc" }],
            take: 300,
        }),
    ]);
    
    return (
        <SiteContentClient
            initialSettings={siteSettings}
            categories={[
                ...mainCategoriesData.map((mc) => ({
                    id: mc.id,
                    name: mc.name,
                    slug: mc.slug,
                    image: mc.image,
                    isFeatured: mc.isFeatured,
                    brandName: mc.isActive ? "قسم رئيسي • Department" : "قسم رئيسي (معطل) • Department",
                    type: 'main-category' as const,
                    isActive: mc.isActive,
                })),
                ...categoriesData.map((category) => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    image: category.image,
                    isFeatured: category.isFeatured,
                    brandName: category.brand?.name || "فئة فرعية",
                    type: 'category' as const,
                    isActive: true,
                })),
            ]}
            products={productsData.map((product) => ({
                id: product.id,
                name: product.name,
                nameAr: product.nameAr,
                slug: product.slug,
                images: product.images,
                price: product.price ? Number(product.price) : 0,
                isTrending: product.isTrending,
                brandName: product.brand?.name || "",
            }))}
        />
    );
}
