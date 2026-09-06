import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const CUSTOMER_COOKIE_NAME = 'hawa_merchant_session';

function getCustomerSecretKey(): string {
    const secret = process.env.CUSTOMER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('CRITICAL SECURITY ERROR: NEXTAUTH_SECRET or CUSTOMER_AUTH_SECRET must be configured in production environment.');
        }
        return 'hawa-dev-insecure-secret-key-only-for-local-dev';
    }
    return secret;
}

export interface CustomerSessionPayload {
    id: string;
    phone: string;
    shopName: string;
    ownerName: string;
    exp: number;
}

export function convertArabicToEnglishDigits(str: string): string {
    if (!str) return '';
    return str
        .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
        .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06F0));
}

/**
 * Normalizes Syrian mobile phone numbers to the canonical 10-digit format: 09xxxxxxxx
 * Handles variations: +963993..., 00963993..., 963993..., 993..., 0993...
 * Also converts Arabic/Eastern-Indic digits (٠-٩) to standard English digits.
 */
export function normalizeSyrianPhone(rawPhone: string): string {
    if (!rawPhone) return '';
    // 1. Convert Arabic numerals to standard Latin digits first
    const englishDigits = convertArabicToEnglishDigits(rawPhone);
    // 2. Strip everything except digits
    let digits = englishDigits.replace(/[^0-9]/g, '');

    // Handle international prefixes
    if (digits.startsWith('00963')) {
        digits = '0' + digits.slice(5);
    } else if (digits.startsWith('963')) {
        digits = '0' + digits.slice(3);
    }

    // Handle 9-digit format without leading 0 (e.g. 993443901 -> 0993443901)
    if (digits.length === 9 && digits.startsWith('9')) {
        digits = '0' + digits;
    }

    return digits;
}

/**
 * Returns whether a given string is a valid Syrian mobile phone number.
 */
export function isValidSyrianPhone(phone: string): boolean {
    const normalized = normalizeSyrianPhone(phone);
    return /^09[0-9]{8}$/.test(normalized);
}

/**
 * Sanitizes input string to prevent XSS and strip unwanted markup/control characters
 */
export function sanitizeString(val: unknown, maxLen = 200): string {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control chars
        .trim()
        .slice(0, maxLen);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function signToken(payload: Omit<CustomerSessionPayload, 'exp'>, expiresInDays = 30): string {
    const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
    const fullPayload: CustomerSessionPayload = { ...payload, exp };
    const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const secret = getCustomerSecretKey();
    const signature = crypto
        .createHmac('sha256', secret)
        .update(base64Payload)
        .digest('base64url');
    return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): CustomerSessionPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const [base64Payload, signature] = parts;
        const secret = getCustomerSecretKey();
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(base64Payload)
            .digest('base64url');

        // Use constant-time comparison to prevent HMAC timing attacks
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }

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
