"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireSuperAdminSession } from "./admin-auth";

interface UserInput {
    username: string;
    password?: string;
    role?: "ADMIN" | "SUPER_ADMIN";
    canManageBrands: boolean;
    canDeleteBrands: boolean;
    canManageProducts: boolean;
    canDeleteProducts: boolean;
    canManageCategories: boolean;
    canDeleteCategories: boolean;
    canManageBanners: boolean;
    canDeleteBanners: boolean;
    canManageOrders: boolean;
    canDeleteOrders: boolean;
    canManagePromoCodes?: boolean;
    canDeletePromoCodes?: boolean;
}

export async function getUsers() {
    try {
        await requireSuperAdminSession();
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users.map(user => {
            const { password: _password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export async function createUser(data: UserInput) {
    try {
        await requireSuperAdminSession();
        const hashedPassword = await bcrypt.hash(data.password || "", 10);
        await prisma.user.create({
            data: {
                username: data.username,
                password: hashedPassword,
                role: data.role || 'ADMIN',
                canManageBrands: data.canManageBrands,
                canDeleteBrands: data.canDeleteBrands,
                canManageProducts: data.canManageProducts,
                canDeleteProducts: data.canDeleteProducts,
                canManageCategories: data.canManageCategories,
                canDeleteCategories: data.canDeleteCategories,
                canManageBanners: data.canManageBanners,
                canDeleteBanners: data.canDeleteBanners,
                canManageOrders: data.canManageOrders,
                canDeleteOrders: data.canDeleteOrders,
                canManagePromoCodes: data.canManagePromoCodes ?? false,
                canDeletePromoCodes: data.canDeletePromoCodes ?? false,
            }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to create user:", error);
        if (typeof error === "object" && error !== null && "code" in error && error.code === 'P2002') {
            return { success: false, error: "Username already exists" };
        }
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUser(id: string, data: UserInput) {
    try {
        await requireSuperAdminSession();
        const updateData: Partial<UserInput> & { password?: string } = {
            username: data.username,
            role: data.role,
            canManageBrands: data.canManageBrands,
            canDeleteBrands: data.canDeleteBrands,
            canManageProducts: data.canManageProducts,
            canDeleteProducts: data.canDeleteProducts,
            canManageCategories: data.canManageCategories,
            canDeleteCategories: data.canDeleteCategories,
            canManageBanners: data.canManageBanners,
            canDeleteBanners: data.canDeleteBanners,
            canManageOrders: data.canManageOrders,
            canDeleteOrders: data.canDeleteOrders,
            canManagePromoCodes: data.canManagePromoCodes,
            canDeletePromoCodes: data.canDeletePromoCodes,
        };

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(id: string) {
    try {
        const session = await requireSuperAdminSession();
        if (session.user.id === id) {
            return { success: false, error: "Cannot delete your own account" };
        }

        await prisma.user.delete({
            where: { id }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
