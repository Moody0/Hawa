import { getAdminProducts, getCatalogFormOptions } from "../../../../lib/admin-actions";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
    const [products, options] = await Promise.all([
        getAdminProducts(),
        getCatalogFormOptions(),
    ]);
    const {categories, brands, mainCategories} = options;

    return (
        <ProductsClient 
            products={products} 
            categories={categories}
            brands={brands}
            mainCategories={mainCategories}
        />
    );
}
