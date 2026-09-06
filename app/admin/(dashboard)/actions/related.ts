"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function getRelatedProducts(type: "brandId" | "mainCategoryId" | "categoryId", id: string, query: string) {
    try {
        await requireAdminSession("canManageProducts");
        const products = await prisma.product.findMany({
            where: {
                [type]: id,
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
        await requireAdminSession("canManageCategories");
        const categories = await prisma.category.findMany({
            where: {
                [type]: id,
                name: { contains: query, mode: "insensitive" }
            },
            select: { id: true, name: true, image: true },
            take: 50,
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
        await requireAdminSession("canManageBrands");
        const brands = await prisma.brand.findMany({
            where: {
                mainCategoryId: id,
                name: { contains: query, mode: "insensitive" }
            },
            select: { id: true, name: true, image: true },
            take: 50,
            orderBy: { name: 'asc' }
        });
        return { success: true, data: brands };
    } catch (error) {
        console.error("Error fetching related brands:", error);
        return { success: false, error: "Failed to fetch brands" };
    }
}
