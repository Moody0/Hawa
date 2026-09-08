import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminPermission =
    | "canManageBrands"
    | "canDeleteBrands"
    | "canManageProducts"
    | "canDeleteProducts"
    | "canManageCategories"
    | "canDeleteCategories"
    | "canManageBanners"
    | "canDeleteBanners"
    | "canManageOrders"
    | "canDeleteOrders"
    | "canManagePromoCodes"
    | "canDeletePromoCodes"
    | "canManageReviews";

export interface AdminUserSession {
    id: string;
    name?: string | null;
    role: "SUPER_ADMIN" | "ADMIN";
    iat?: number;
    canManageBrands?: boolean;
    canDeleteBrands?: boolean;
    canManageProducts?: boolean;
    canDeleteProducts?: boolean;
    canManageCategories?: boolean;
    canDeleteCategories?: boolean;
    canManageBanners?: boolean;
    canDeleteBanners?: boolean;
    canManageOrders?: boolean;
    canDeleteOrders?: boolean;
    canManagePromoCodes?: boolean;
    canDeletePromoCodes?: boolean;
    canManageReviews?: boolean;
}

/**
 * Validates and retrieves the live admin user session from the database.
 * Returns null if the user is unauthenticated, does not exist, is not an admin,
 * or the session was issued before account modifications.
 */
export async function getValidAdminSession(): Promise<AdminUserSession | null> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return null;
        }

        const user = session.user as AdminUserSession;
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!dbUser) {
            return null;
        }

        if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN") {
            return null;
        }

        // Verify session freshness if iat and updatedAt are available
        if (user.iat && dbUser.updatedAt) {
            const tokenIssuedAtMs = user.iat * 1000;
            const userUpdatedAtMs = dbUser.updatedAt.getTime();
            // Allow up to 1 second of clock skew/rounding between JWT iat (seconds) and DB updatedAt (ms)
            if (tokenIssuedAtMs < userUpdatedAtMs - 1000) {
                return null;
            }
        }

        return {
            id: dbUser.id,
            name: dbUser.username,
            role: dbUser.role as "SUPER_ADMIN" | "ADMIN",
            iat: user.iat,
            canManageBrands: dbUser.canManageBrands,
            canDeleteBrands: dbUser.canDeleteBrands,
            canManageProducts: dbUser.canManageProducts,
            canDeleteProducts: dbUser.canDeleteProducts,
            canManageCategories: dbUser.canManageCategories,
            canDeleteCategories: dbUser.canDeleteCategories,
            canManageBanners: dbUser.canManageBanners,
            canDeleteBanners: dbUser.canDeleteBanners,
            canManageOrders: dbUser.canManageOrders,
            canDeleteOrders: dbUser.canDeleteOrders,
            canManagePromoCodes: dbUser.canManagePromoCodes,
            canDeletePromoCodes: dbUser.canDeletePromoCodes,
            canManageReviews: dbUser.canManageReviews,
        };
    } catch {
        return null;
    }
}

/**
 * Asserts an active administrative session with fresh database verification.
 * If permission is provided, checks if the user has that specific permission (SUPER_ADMIN has all permissions).
 * Throws an error if unauthenticated, revoked, demoted, or lacking required permission.
 */
export async function requireAdminSession(requiredPermission?: AdminPermission) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error("Unauthorized: Admin authentication required.");
    }

    const user = session.user as AdminUserSession;
    if (!user.id) {
        throw new Error("Unauthorized: Admin authentication required.");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    if (!dbUser) {
        throw new Error("Unauthorized: Admin account no longer exists or has been deleted.");
    }

    if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN") {
        throw new Error("Forbidden: Valid administrative role required.");
    }

    // Invalidate session if issued before the last user update (password/role/permission modification)
    if (user.iat && dbUser.updatedAt) {
        const tokenIssuedAtMs = user.iat * 1000;
        const userUpdatedAtMs = dbUser.updatedAt.getTime();
        if (tokenIssuedAtMs < userUpdatedAtMs - 1000) {
            throw new Error("Unauthorized: Session has been invalidated due to account modifications. Please log in again.");
        }
    }

    // Synchronize session permissions with live DB state
    user.role = dbUser.role;
    user.name = dbUser.username;
    user.canManageBrands = dbUser.canManageBrands;
    user.canDeleteBrands = dbUser.canDeleteBrands;
    user.canManageProducts = dbUser.canManageProducts;
    user.canDeleteProducts = dbUser.canDeleteProducts;
    user.canManageCategories = dbUser.canManageCategories;
    user.canDeleteCategories = dbUser.canDeleteCategories;
    user.canManageBanners = dbUser.canManageBanners;
    user.canDeleteBanners = dbUser.canDeleteBanners;
    user.canManageOrders = dbUser.canManageOrders;
    user.canDeleteOrders = dbUser.canDeleteOrders;
    user.canManagePromoCodes = dbUser.canManagePromoCodes;
    user.canDeletePromoCodes = dbUser.canDeletePromoCodes;
    user.canManageReviews = dbUser.canManageReviews;

    if (dbUser.role === "SUPER_ADMIN") {
        return session;
    }

    if (requiredPermission && !user[requiredPermission]) {
        throw new Error(`Forbidden: Insufficient administrative privileges (${String(requiredPermission)}).`);
    }

    return session;
}

/**
 * Asserts an active super administrator session.
 * Throws an error if caller is not a SUPER_ADMIN.
 */
export async function requireSuperAdminSession() {
    const session = await requireAdminSession();
    const user = session.user as AdminUserSession;
    if (user.role !== "SUPER_ADMIN") {
        throw new Error("Forbidden: Super Admin privileges required.");
    }
    return session;
}

export const assertAdmin = requireAdminSession;

