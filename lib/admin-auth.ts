import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeAdminPermission,
  permissionImplies,
  type AdminPermission,
  type LegacyAdminPermission,
} from "@/lib/admin-permissions";

export { type AdminPermission } from "@/lib/admin-permissions";

export class AdminAuthorizationError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

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

const liveUserInclude = { permissions: { select: { permission: true } } } as const;

async function loadAdminUser(id: string) {
  return prisma.user.findFirst({
    where: { id, archivedAt: null, disabledAt: null },
    include: liveUserInclude,
  });
}

type LiveAdminUser = NonNullable<Awaited<ReturnType<typeof loadAdminUser>>>;

function assertFreshAdmin(dbUser: LiveAdminUser, iat?: number): void {
  if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN") {
    throw new AdminAuthorizationError(403, "Valid administrative role required.");
  }
  if (iat && iat * 1000 < dbUser.updatedAt.getTime() - 1000) {
    throw new AdminAuthorizationError(401, "Session has been invalidated. Please sign in again.");
  }
}

function toAdminSession(dbUser: LiveAdminUser, iat?: number): AdminUserSession {
  return {
    id: dbUser.id,
    name: dbUser.username,
    role: dbUser.role,
    iat,
    permissions: dbUser.permissions.map((item) => item.permission as AdminPermission),
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
}

export async function getValidAdminSession(): Promise<AdminUserSession | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    const tokenUser = session.user as Partial<AdminUserSession>;
    const dbUser = await loadAdminUser(session.user.id);
    if (!dbUser) return null;
    assertFreshAdmin(dbUser, tokenUser.iat);
    return toAdminSession(dbUser, tokenUser.iat);
  } catch {
    return null;
  }
}

export async function requireAdminSession(requiredPermission?: AdminPermission | LegacyAdminPermission) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AdminAuthorizationError(401, "Administrator authentication required.");
  }
  const tokenUser = session.user as Partial<AdminUserSession>;
  const dbUser = await loadAdminUser(session.user.id);
  if (!dbUser) throw new AdminAuthorizationError(401, "Administrator account is unavailable or disabled.");
  assertFreshAdmin(dbUser, tokenUser.iat);

  const live = toAdminSession(dbUser, tokenUser.iat);
  Object.assign(session.user, live);
  if (requiredPermission && live.role !== "SUPER_ADMIN") {
    const required = normalizeAdminPermission(requiredPermission);
    if (!permissionImplies(new Set(live.permissions), required)) {
      throw new AdminAuthorizationError(403, `Missing administrator permission: ${required}`);
    }
  }
  return session;
}

export async function requireSuperAdminSession() {
  const session = await requireAdminSession();
  if ((session.user as AdminUserSession).role !== "SUPER_ADMIN") {
    throw new AdminAuthorizationError(403, "Super administrator privileges required.");
  }
  return session;
}

export function adminErrorStatus(error: unknown): 401 | 403 | 500 {
  return error instanceof AdminAuthorizationError ? error.status : 500;
}

export const assertAdmin = requireAdminSession;
