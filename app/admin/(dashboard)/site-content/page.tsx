import {getAdminMainCategories,getAdminCategories,getAdminProducts} from '@/lib/admin-actions';
import { getSiteSettings } from "@/lib/public-queries";
import SiteContentClient from "./SiteContentClient";
import { requireAdminSession } from "@/lib/admin-auth";
export default async function SiteContentPage() {
    await requireAdminSession("SITE_CONTENT_VIEW");

    const [siteSettings, mainCategoriesData, categoriesData, productsData] = await Promise.all([
        getSiteSettings(),
        getAdminMainCategories(),
        getAdminCategories(1,1000).then(r=>r.categories),
        getAdminProducts({limit:1000}),
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
