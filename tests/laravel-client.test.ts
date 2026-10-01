import { afterEach, describe, expect, it, vi } from 'vitest';
import { laravelClientFetch, laravelLogin, authErrorMessage, adminLoginDestination } from '@/lib/laravel-client';

afterEach(() => vi.unstubAllGlobals());
describe('browser session requests', () => {
    it('verifies the first login session before returning success', async () => {
        const calls: string[] = [];
        vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=token' });
        vi.stubGlobal('fetch', vi.fn(async (url: string) => {
            calls.push(url);
            return new Response(url.endsWith('/login') ? JSON.stringify({ user: { id: 'admin-1' } }) : url.endsWith('/me') ? JSON.stringify({ user: { id: 'admin-1' } }) : null, { status: url.includes('csrf') ? 204 : 200 });
        }));
        expect((await laravelLogin('admin', { username: 'owner', password: 'test-only' })).ok).toBe(true);
        expect(calls).toEqual(['/sanctum/csrf-cookie', '/api/admin/auth/login', '/api/admin/auth/me']);
    });
    it('rejects a login whose rotated session cannot be verified', async () => {
        vi.stubGlobal('document', { cookie: '' });
        vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(url.endsWith('/login') ? '{"customer":{"id":"one"}}' : url.endsWith('/me') ? '{"customer":null}' : null, { status: url.includes('csrf') ? 204 : 200 })));
        await expect(laravelLogin('customer', {})).rejects.toMatchObject({ name: 'SessionVerificationError' });
    });
    it('refreshes stale CSRF once without retrying an accepted mutation', async () => {
        let submissions = 0;
        vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=token' });
        vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('csrf') ? new Response(null, { status: 204 }) : new Response(null, { status: ++submissions === 1 ? 419 : 201 })));
        expect((await laravelClientFetch('/api/customer/auth/register', { method: 'POST', body: '{}' })).status).toBe(201);
        expect(submissions).toBe(2);
    });
    it('never retries a failed action with an ambiguous server outcome', async () => {
        vi.stubGlobal('document', { cookie: '' });
        const fetcher = vi.fn(async (url: string) => new Response(null, { status: url.includes('csrf') ? 204 : 500 }));
        vi.stubGlobal('fetch', fetcher);
        expect((await laravelClientFetch('/api/orders', { method: 'POST' })).status).toBe(500);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });
    it('finishes earlier requests and blocks background refreshes while logging out', async () => {
        let releaseEarlier!: (response: Response) => void;
        let releaseLogout!: (response: Response) => void;
        const calls: string[] = [];
        vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=token' });
        vi.stubGlobal('fetch', vi.fn((url: string) => {
            calls.push(url);
            if (url === '/api/earlier') return new Promise<Response>(resolve => { releaseEarlier = resolve; });
            if (url.endsWith('/logout')) return new Promise<Response>(resolve => { releaseLogout = resolve; });
            return Promise.resolve(new Response(null, { status: url.includes('csrf') ? 204 : 200 }));
        }));
        const earlier = laravelClientFetch('/api/earlier');
        const logout = laravelClientFetch('/api/customer/auth/logout', { method: 'POST' });
        const refresh = laravelClientFetch('/api/customer/auth/me');
        expect(calls).toEqual(['/api/earlier']);
        releaseEarlier(new Response('{}'));
        await earlier;
        await vi.waitFor(() => expect(calls).toContain('/api/customer/auth/logout'));
        expect(calls).not.toContain('/api/customer/auth/me');
        releaseLogout(new Response('{}'));
        await Promise.all([logout, refresh]);
        expect(calls.at(-1)).toBe('/api/customer/auth/me');
    });
});
it('constrains administrator return URLs to protected local pages', () => {
    for (const url of ['https://evil.example/admin/users', '//evil.example/admin/users', '/admin/login', '/products', '/admin/\\evil']) expect(adminLoginDestination(url)).toBe('/admin/dashboard');
    expect(adminLoginDestination('/admin/orders?page=2')).toBe('/admin/orders?page=2');
});
it('explains validation and approval failures in the chosen language', () => {
    expect(authErrorMessage(422, { errors: { address: ['The address must be at least 5 characters.'] } }, false)).toContain('5 characters');
    expect(authErrorMessage(409, {}, true)).toContain('مسجل مسبقاً');
    expect(authErrorMessage(500, { error: 'SQL password detail' }, false)).not.toContain('SQL');
});
