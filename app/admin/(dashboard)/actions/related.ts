"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function getRelatedProducts(type: "brandId" | "mainCategoryId" | "categoryId", id: string, query: string) {
    try {
        await requireAdminSession("PRODUCTS_VIEW");
        const products = await prisma.product.findMany({
            where: {
                [type]: id,
                archivedAt: null,
                name: { contains: query, mode: "insensitive" }
            },
            select: { id: true, name: true, images: true, price: true, stock: true },
            take: 50,
            orderBy: { name: 'asc' }
        });
        return { success: true, data: products };
    } catch (error) {
        console.error("Error fetching related products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function getRelatedCategories(type: "brandId" | "mainCategoryId", id: string, query: string) {
    try {
        await requireAdminSession("CATEGORIES_VIEW");
        const categories = await prisma.category.findMany({
            where: {
                [type]: id,
                archivedAt: null,
                name: { contains: query, mode: "insensitive" }
            },
            select: { id: true, name: true, image: true },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error("Error fetching related categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function getRelatedBrands(id: string, query: string) {
    try {
        await requireAdminSession("BRANDS_VIEW");
        const brands = await prisma.brand.findMany({
            where: {
                mainCategoryId: id,
                archivedAt: null,
                name: { contains: query, mode: "insensitive" }
            },
            select: { id: true, name: true, image: true },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: brands };
    } catch (error) {
        console.error("Error fetching related brands:", error);
        return { success: false, error: "Failed to fetch brands" };
    }
}
