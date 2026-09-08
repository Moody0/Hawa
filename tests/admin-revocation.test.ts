import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAdminSession, requireSuperAdminSession, getValidAdminSession } from '@/lib/admin-auth';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

describe('Admin Revocation & Fresh DB Verification (Task 4.4)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('allows an active admin with proper permissions', async () => {
        const mockSession = {
            user: {
                id: 'admin-1',
                name: 'admin',
                role: 'ADMIN',
                iat: 1000,
            },
        };
        (getServerSession as any).mockResolvedValue(mockSession);

        (prisma.user.findFirst as any).mockResolvedValue({
            id: 'admin-1',
            username: 'admin',
            role: 'ADMIN',
            updatedAt: new Date(1000 * 1000),
            canManageProducts: true,
            canDeleteProducts: true,
            permissions: [
                { permission: 'PRODUCTS_MANAGE' },
                { permission: 'PRODUCTS_ARCHIVE' },
            ],
        });

        const session = await requireAdminSession('canManageProducts');
        expect(session.user.id).toBe('admin-1');
        expect(session.user.role).toBe('ADMIN');
    });

    it('immediately rejects an administrator whose account was deleted from the database', async () => {
        const staleSession = {
            user: {
                id: 'deleted-admin-id',
                name: 'deleted-admin',
                role: 'ADMIN',
                iat: 1000,
            },
        };
        (getServerSession as any).mockResolvedValue(staleSession);

        // Account is deleted in DB
        (prisma.user.findFirst as any).mockResolvedValue(null);

        await expect(requireAdminSession()).rejects.toThrow(
            /Administrator account is unavailable or disabled/
        );

        const validSession = await getValidAdminSession();
        expect(validSession).toBeNull();
    });

    it('immediately rejects an administrator who was demoted', async () => {
        const staleSession = {
            user: {
                id: 'demoted-admin-id',
                name: 'former-admin',
                role: 'ADMIN',
                iat: 1000,
            },
        };
        (getServerSession as any).mockResolvedValue(staleSession);

        // Account was demoted to regular USER in DB
        (prisma.user.findFirst as any).mockResolvedValue({
            id: 'demoted-admin-id',
            username: 'former-admin',
            role: 'USER',
            updatedAt: new Date(1000 * 1000),
            permissions: [],
        });

        await expect(requireAdminSession()).rejects.toThrow(
            /Valid administrative role required/
        );

        const validSession = await getValidAdminSession();
        expect(validSession).toBeNull();
    });

    it('immediately rejects an admin whose specific permission was revoked', async () => {
        const staleSession = {
            user: {
                id: 'admin-2',
                name: 'admin-two',
                role: 'ADMIN',
                canDeleteProducts: true, // stale claim in JWT
                iat: 1000,
            },
        };
        (getServerSession as any).mockResolvedValue(staleSession);

        // Permission was revoked in DB
        (prisma.user.findFirst as any).mockResolvedValue({
            id: 'admin-2',
            username: 'admin-two',
            role: 'ADMIN',
            updatedAt: new Date(1000 * 1000),
            canManageProducts: true,
            canDeleteProducts: false,
            permissions: [
                { permission: 'PRODUCTS_MANAGE' },
            ],
        });

        await expect(requireAdminSession('canDeleteProducts')).rejects.toThrow(
            /Missing administrator permission: PRODUCTS_ARCHIVE/
        );
    });

    it('invalidates sessions issued before account modifications/password reset', async () => {
        const oldSession = {
            user: {
                id: 'admin-3',
                name: 'admin-three',
                role: 'ADMIN',
                iat: 1000, // issued at T=1000s
            },
        };
        (getServerSession as any).mockResolvedValue(oldSession);

        // Account was updated / password changed at T=2000s
        (prisma.user.findFirst as any).mockResolvedValue({
            id: 'admin-3',
            username: 'admin-three',
            role: 'ADMIN',
            updatedAt: new Date(2000 * 1000),
            canManageProducts: true,
            permissions: [
                { permission: 'PRODUCTS_MANAGE' },
            ],
        });

        await expect(requireAdminSession()).rejects.toThrow(
            /Session has been invalidated/
        );

        const validSession = await getValidAdminSession();
        expect(validSession).toBeNull();
    });

    it('immediately revokes super admin access if demoted to regular admin when super admin is required', async () => {
        const staleSession = {
            user: {
                id: 'demoted-super-id',
                name: 'former-super',
                role: 'SUPER_ADMIN', // stale JWT claim
                iat: 1000,
            },
        };
        (getServerSession as any).mockResolvedValue(staleSession);

        // Demoted to ADMIN in DB
        (prisma.user.findFirst as any).mockResolvedValue({
            id: 'demoted-super-id',
            username: 'former-super',
            role: 'ADMIN',
            updatedAt: new Date(1000 * 1000),
            permissions: [],
        });

        await expect(requireSuperAdminSession()).rejects.toThrow(
            /Super administrator privileges required/
        );
    });
});
