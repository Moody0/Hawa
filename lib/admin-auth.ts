import { cache } from 'react';
import { getLaravelAdmin } from './laravel-server';
import { normalizeAdminPermission, hasAdminPermission, type AdminPermission, type LegacyAdminPermission } from './admin-permissions';
export { type AdminPermission } from './admin-permissions';
export interface AdminUserSession {
    id: string;
    name?: string | null;
    role: "SUPER_ADMIN" | "ADMIN";
    iat?: number;
    permissions: AdminPermission[];
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
export class AdminAuthorizationError extends Error {
    constructor(public readonly status: 401 | 403, message: string) { super(message); }
}
export const getValidAdminSession = cache(async (): Promise<AdminUserSession | null> => { const user = await getLaravelAdmin(); return user as unknown as AdminUserSession | null; });
export async function requireAdminSession(permission?: AdminPermission | LegacyAdminPermission) { const user = await getValidAdminSession(); if (!user)
    throw new AdminAuthorizationError(401, 'Administrator authentication required.'); if (permission && !hasAdminPermission(user.permissions, normalizeAdminPermission(permission), user.role === 'SUPER_ADMIN'))
    throw new AdminAuthorizationError(403, 'Missing administrator permission.'); return { user }; }
export async function requireSuperAdminSession() { const session = await requireAdminSession(); if (session.user.role !== 'SUPER_ADMIN')
    throw new AdminAuthorizationError(403, 'Super administrator required.'); return session; }
export function adminErrorStatus(error: unknown) { return error instanceof AdminAuthorizationError ? error.status : 500; }
