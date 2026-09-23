import { getAdminBrands, getAdminCategories } from "../../../../lib/admin-actions";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
    searchParams,
}: {
    searchParams: Promise<{ categoryId?: string | string[] }>;
}) {
    const requestedId = (await searchParams).categoryId;
    const categoryId = typeof requestedId === 'string' ? requestedId : undefined;
    const [data, brands] = await Promise.all([
        getAdminCategories(1, 100, categoryId),
        getAdminBrands(),
    ]);

    return <CategoriesClient key={categoryId ?? 'all'} categories={data.categories} brands={brands} focusedCategoryId={categoryId} />;
}
