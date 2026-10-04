"use server";
import { laravelRequest } from './laravel-server';
import { revalidatePath } from 'next/cache';
import type { AdminPermission } from './admin-permissions';
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
async function send(path: string, method: string, body?: UserInput): Promise<any> { const r = await laravelRequest('/api/admin/users' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const data = await r.json(); if (r.ok && method !== 'GET')
    revalidatePath('/admin/users'); return r.ok ? data : { success: false, error: data.message || data.error }; }
export async function getUsers(): Promise<any[]> { const result = await send('', 'GET'); if (!result.success)
    throw new Error(result.error); return result.data; }
export async function createUser(data: UserInput) { return send('', 'POST', data); }
export async function updateUser(id: string, data: UserInput) { return send('/' + encodeURIComponent(id), 'PATCH', data); }
export async function deleteUser(id: string) { return send('/' + encodeURIComponent(id), 'DELETE'); }
