import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AdminUserSession {
    id: string;
    name?: string | null;
    role: "SUPER_ADMIN" | "ADMIN";
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
 * Asserts an active administrative session.
 * If permission is provided, checks if the user has that specific permission (SUPER_ADMIN has all permissions).
 * Throws an error if unauthenticated or unauthorized.
 */
export async function requireAdminSession(requiredPermission?: keyof AdminUserSession) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error("Unauthorized: Admin authentication required.");
    }

    const user = session.user as AdminUserSession;

    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
        throw new Error("Forbidden: Valid administrative role required.");
    }

    if (user.role === "SUPER_ADMIN") {
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

