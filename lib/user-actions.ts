"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireSuperAdminSession } from "./admin-auth";
import { ADMIN_PERMISSIONS, type AdminPermission } from "./admin-permissions";
import { writeAdminAuditLog } from "./admin-audit";

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
    permissions?: AdminPermission[];
}

function permissionsFromInput(data: UserInput): AdminPermission[] {
    if (data.role === "SUPER_ADMIN") return [...ADMIN_PERMISSIONS];
    if (data.permissions) return [...new Set(data.permissions)];
    return [
        ...(data.canManageProducts ? ["PRODUCTS_VIEW", "PRODUCTS_MANAGE"] as AdminPermission[] : []),
        ...(data.canDeleteProducts ? ["PRODUCTS_ARCHIVE"] as AdminPermission[] : []),
        ...(data.canManageBrands ? ["BRANDS_VIEW", "BRANDS_MANAGE"] as AdminPermission[] : []),
        ...(data.canDeleteBrands ? ["BRANDS_ARCHIVE"] as AdminPermission[] : []),
        ...(data.canManageCategories ? ["CATEGORIES_VIEW", "CATEGORIES_MANAGE"] as AdminPermission[] : []),
        ...(data.canDeleteCategories ? ["CATEGORIES_ARCHIVE"] as AdminPermission[] : []),
        ...(data.canManageBanners ? ["BANNERS_VIEW", "BANNERS_MANAGE"] as AdminPermission[] : []),
        ...(data.canDeleteBanners ? ["BANNERS_ARCHIVE"] as AdminPermission[] : []),
        ...(data.canManageOrders ? ["ORDERS_VIEW", "ORDERS_MANAGE", "CUSTOMERS_VIEW", "CUSTOMERS_MANAGE"] as AdminPermission[] : []),
        ...(data.canDeleteOrders ? ["ORDERS_ARCHIVE", "CUSTOMERS_ARCHIVE"] as AdminPermission[] : []),
    ];
}

function validateCredentials(usernameValue: string, password?: string, passwordRequired = false) {
    const username = usernameValue.trim().normalize("NFKC").toLocaleLowerCase("en-US");
    if (!username || username.length > 128) throw new Error("Username must contain 1 to 128 characters");
    if (passwordRequired && !password) throw new Error("Password is required");
    if (password && (password.length < 12 || password.length > 128)) throw new Error("Password must contain 12 to 128 characters");
    return username;
}

export async function getUsers() {
        await requireSuperAdminSession();
        const users = await prisma.user.findMany({
            where: { archivedAt: null },
            include: { permissions: { select: { permission: true } } },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users.map(user => {
            const { password: _password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
}

export async function createUser(data: UserInput) {
    try {
        const session = await requireSuperAdminSession();
        const username = validateCredentials(data.username, data.password, true);
        const hashedPassword = await bcrypt.hash(data.password!, 10);
        const permissions = permissionsFromInput(data);
        const user = await prisma.user.create({
            data: {
                username,
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
                permissions: { create: permissions.map(permission => ({ permission })) },
            }
        });
        const audit = await writeAdminAuditLog({ actorId: session.user.id, action: "CREATE", entityType: "User", entityId: user.id, metadata: { role: user.role } });
        revalidatePath('/admin/users');
        return { success: true, auditId: audit.id };
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
        const session = await requireSuperAdminSession();
        const username = validateCredentials(data.username, data.password);
        const updateData: Partial<UserInput> & { password?: string } = {
            username,
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

        const permissions = permissionsFromInput(data);
        await prisma.user.update({
            where: { id, archivedAt: null },
            data: {
                ...updateData,
                permissions: {
                    deleteMany: {},
                    create: permissions.map(permission => ({ permission })),
                },
            }
        });
        const audit = await writeAdminAuditLog({ actorId: session.user.id, action: "UPDATE_PERMISSIONS", entityType: "User", entityId: id, metadata: { role: data.role, permissions } });
        revalidatePath('/admin/users');
        return { success: true, auditId: audit.id };
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

        await prisma.user.update({
            where: { id, archivedAt: null },
            data: { archivedAt: new Date(), disabledAt: new Date() },
        });
        const audit = await writeAdminAuditLog({ actorId: session.user.id, action: "ARCHIVE", entityType: "User", entityId: id });
        revalidatePath('/admin/users');
        return { success: true, auditId: audit.id };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
