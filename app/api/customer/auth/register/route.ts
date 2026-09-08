import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/customer-auth';
import { validateCustomerRegistration } from '@/lib/customer-validation';
import { 
    getClientIp, 
    checkRateLimit, 
    checkRequestBodyLimit, 
    recordSecurityMetric 
} from '@/lib/rate-limit';

export async function POST(req: Request) {
    const ip = getClientIp(req);

    // Enforce request body size limit (100KB)
    if (!checkRequestBodyLimit(req, 100 * 1024)) {
        recordSecurityMetric({ action: 'customer_register', ip, status: 'blocked', reason: 'payload_too_large' });
        return NextResponse.json(
            { error: 'حجم الطلب كبير جداً.' },
            { status: 413 }
        );
    }

    // IP-level rate limiting: max 10 registrations per hour per IP
    const ipLimit = checkRateLimit(`register:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!ipLimit.allowed) {
        recordSecurityMetric({ action: 'customer_register', ip, status: 'blocked', reason: 'ip_rate_limit_exceeded' });
        return NextResponse.json(
            { error: `تم تجاوز الحد المسموح من طلبات التسجيل. يرجى الانتظار ${ipLimit.retryAfterSeconds} ثانية.` },
            { 
                status: 429,
                headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) }
            }
        );
    }

    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: 'صيغة البيانات غير صحيحة (JSON غير صالح)', errors: { _general: 'JSON غير صالح' } },
                { status: 400 }
            );
        }

        const validation = validateCustomerRegistration(body);
        if (!validation.isValid || !validation.cleanData) {
            const primaryError = Object.values(validation.errors)[0] || 'بيانات غير صالحة';
            return NextResponse.json(
                { error: primaryError, errors: validation.errors },
                { status: 400 }
            );
        }

        const { shopName, ownerName, phone, city, address, notes, password } = validation.cleanData;

        // Account-level rate limiting: max 5 registrations per hour per IP+phone
        const accLimit = checkRateLimit(`register:acc:${ip}:${phone}`, 5, 60 * 60 * 1000);
        if (!accLimit.allowed) {
            recordSecurityMetric({ action: 'customer_register', ip, status: 'blocked', reason: 'account_rate_limit_exceeded' });
            return NextResponse.json(
                { error: `تم تجاوز الحد المسموح من طلبات التسجيل لهذا الرقم. يرجى الانتظار ${accLimit.retryAfterSeconds} ثانية.` },
                { 
                    status: 429,
                    headers: { 'Retry-After': String(accLimit.retryAfterSeconds) }
                }
            );
        }

        // Check if phone already registered
        const existing = await prisma.customer.findUnique({
            where: { phone },
            select: { id: true, isActive: true },
        });

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json(
                    { error: 'رقم الهاتف هذا مسجل ومفعل مسبقاً. يمكنك تسجيل الدخول مباشرة.', errors: { phone: 'رقم الهاتف مسجل ومفعل مسبقاً' } },
                    { status: 409 }
                );
            } else {
                return NextResponse.json(
                    { error: 'رقم الهاتف مسجل بالفعل وطلبك قيد المراجعة والتدقيق لدى إدارة المبيعات.', errors: { phone: 'رقم الهاتف مسجل بالفعل وقيد المراجعة' } },
                    { status: 409 }
                );
            }
        }

        const hashedPassword = await hashPassword(password);

        // Account is created in pending state (isActive: false) awaiting Admin approval
        const newCustomer = await prisma.customer.create({
            data: {
                shopName,
                ownerName,
                phone,
                city,
                address,
                password: hashedPassword,
                notes: notes || null,
                isActive: false, // Explicitly pending admin review
            },
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

        return NextResponse.json({
            success: true,
            pendingApproval: true,
            customer: newCustomer,
            message: 'تم إرسال طلب تسجيل حسابك التجاري بنجاح! طلبك الآن قيد المراجعة والتدقيق من قبل إدارة المبيعات.',
        });
    } catch (error: any) {
        console.error('Customer register error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ أثناء تسجيل الحساب' },
            { status: 500 }
        );
    }
}
