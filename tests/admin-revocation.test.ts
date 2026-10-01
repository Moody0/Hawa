import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireAdminSession, requireSuperAdminSession, getValidAdminSession } from '@/lib/admin-auth';
import { getLaravelAdmin } from '@/lib/laravel-server';

vi.mock('react', () => ({ cache: (fn: unknown) => fn }));
vi.mock('@/lib/laravel-server', () => ({ getLaravelAdmin: vi.fn() }));

describe('Laravel administrator session and permission enforcement', () => {
  beforeEach(() => vi.clearAllMocks());
  it('uses the current backend session and honours explicit permissions', async () => {
    vi.mocked(getLaravelAdmin).mockResolvedValue({ id: 'admin', role: 'ADMIN', permissions: ['PRODUCTS_MANAGE'] } as any);
    expect((await requireAdminSession('PRODUCTS_VIEW')).user.id).toBe('admin');
    await expect(requireAdminSession('ORDERS_MANAGE')).rejects.toMatchObject({ status: 403 });
    await expect(requireSuperAdminSession()).rejects.toMatchObject({ status: 403 });
  });
  it('rejects a revoked or expired backend session', async () => {
    vi.mocked(getLaravelAdmin).mockResolvedValue(null);
    expect(await getValidAdminSession()).toBeNull();
    await expect(requireAdminSession()).rejects.toMatchObject({ status: 401 });
  });
  it('grants super administrators all permissions', async () => {
    vi.mocked(getLaravelAdmin).mockResolvedValue({ id: 'owner', role: 'SUPER_ADMIN', permissions: [] } as any);
    expect((await requireAdminSession('ORDERS_ARCHIVE')).user.id).toBe('owner');
  });
});
