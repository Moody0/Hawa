import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const CUSTOMER_COOKIE_NAME = 'hawa_merchant_session';
const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'hawa-distribution-b2b-secret-key-2026';

export interface CustomerSessionPayload {
    id: string;
    phone: string;
    shopName: string;
    ownerName: string;
    exp: number;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function signToken(payload: Omit<CustomerSessionPayload, 'exp'>, expiresInDays = 30): string {
    const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
    const fullPayload: CustomerSessionPayload = { ...payload, exp };
    const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(base64Payload)
        .digest('base64url');
    return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): CustomerSessionPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const [base64Payload, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(base64Payload)
            .digest('base64url');

        if (signature !== expectedSignature) return null;

        const payload: CustomerSessionPayload = JSON.parse(
            Buffer.from(base64Payload, 'base64url').toString('utf-8')
        );

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null; // Expired
        }

        return payload;
    } catch {
        return null;
    }
}

export async function setCustomerAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    });
}

export async function clearCustomerAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

export async function getAuthenticatedCustomer() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
        if (!token) return null;

        const payload = verifyToken(token);
        if (!payload || !payload.id) return null;

        const customer = await prisma.customer.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                shopName: true,
                ownerName: true,
                phone: true,
                city: true,
                address: true,
                notes: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!customer || !customer.isActive) return null;
        return customer;
    } catch (err) {
        console.error('Error fetching authenticated customer:', err);
        return null;
    }
}
