import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
    verifyPassword, 
    signToken, 
    setCustomerAuthCookie 
} from '@/lib/customer-auth';
import { validateCustomerLogin } from '@/lib/customer-validation';
import { 
    getClientIp, 
    checkRateLimit, 
    checkLoginBackoff, 
    recordLoginFailure, 
    recordLoginSuccess, 
    checkRequestBodyLimit, 
    recordSecurityMetric 
} from '@/lib/rate-limit';

export async function POST(req: Request) {
    const ip = getClientIp(req);

    // Enforce request body size limit (50KB)
    if (!checkRequestBodyLimit(req, 50 * 1024)) {
        recordSecurityMetric({ action: 'customer_login', ip, status: 'blocked', reason: 'payload_too_large' });
        return NextResponse.json(
            { error: 'حجم الطلب كبير جداً.' },
            { status: 413 }
        );
    }

    // IP-level rate limiting: max 30 attempts per 10 minutes per IP
    const ipLimit = checkRateLimit(`login:ip:${ip}`, 30, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
        recordSecurityMetric({ action: 'customer_login', ip, status: 'blocked', reason: 'ip_rate_limit_exceeded' });
        return NextResponse.json(
            { error: `تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار ${ipLimit.retryAfterSeconds} ثانية.` },
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

        const validation = validateCustomerLogin(body);
        if (!validation.isValid || !validation.cleanData) {
            const primaryError = Object.values(validation.errors)[0] || 'بيانات غير صالحة';
            return NextResponse.json(
                { error: primaryError, errors: validation.errors },
                { status: 400 }
            );
        }

        const { phone, password } = validation.cleanData;

        // Check exponential backoff lockout for this IP + account key
        const backoff = checkLoginBackoff(ip, phone);
        if (!backoff.allowed) {
            recordSecurityMetric({ action: 'customer_login', ip, status: 'blocked', reason: 'backoff_locked' });
            return NextResponse.json(
                { error: `تم حظر المحاولات مؤقتاً بسبب تكرار الأخطاء. يرجى الانتظار ${backoff.retryAfterSeconds} ثانية.` },
                { 
                    status: 429,
                    headers: { 'Retry-After': String(backoff.retryAfterSeconds) }
                }
            );
        }

        // Account-level rate limiting: max 10 attempts per 10 minutes per IP+account
        const accountLimit = checkRateLimit(`login:acc:${ip}:${phone}`, 10, 10 * 60 * 1000);
        if (!accountLimit.allowed) {
            recordSecurityMetric({ action: 'customer_login', ip, status: 'blocked', reason: 'account_rate_limit_exceeded' });
            return NextResponse.json(
                { error: `تم تجاوز الحد المسموح من المحاولات لهذا الحساب. يرجى الانتظار ${accountLimit.retryAfterSeconds} ثانية.` },
                { 
                    status: 429,
                    headers: { 'Retry-After': String(accountLimit.retryAfterSeconds) }
                }
            );
        }

        const customer = await prisma.customer.findUnique({
            where: { phone },
        });

        if (!customer) {
            const failure = recordLoginFailure(ip, phone);
            recordSecurityMetric({ action: 'customer_login', ip, status: 'failed', reason: 'invalid_credentials' });
            const message = failure.retryAfterSeconds > 0
                ? `رقم الهاتف أو كلمة المرور غير صحيحة. تم حظر المحاولات لمدة ${failure.retryAfterSeconds} ثانية.`
                : 'رقم الهاتف أو كلمة المرور غير صحيحة.';
            return NextResponse.json(
                { error: message },
                { 
                    status: 401,
                    ...(failure.retryAfterSeconds > 0 ? { headers: { 'Retry-After': String(failure.retryAfterSeconds) } } : {})
                }
            );
        }

        const isMatch = await verifyPassword(password, customer.password);
        if (!isMatch) {
            const failure = recordLoginFailure(ip, phone);
            recordSecurityMetric({ action: 'customer_login', ip, status: 'failed', reason: 'invalid_credentials' });
            const message = failure.retryAfterSeconds > 0
                ? `رقم الهاتف أو كلمة المرور غير صحيحة. تم حظر المحاولات لمدة ${failure.retryAfterSeconds} ثانية.`
                : 'رقم الهاتف أو كلمة المرور غير صحيحة.';
            return NextResponse.json(
                { error: message },
                { 
                    status: 401,
                    ...(failure.retryAfterSeconds > 0 ? { headers: { 'Retry-After': String(failure.retryAfterSeconds) } } : {})
                }
            );
        }

        // Successful credential verification: reset backoff and record success
        recordLoginSuccess(ip, phone);
        recordSecurityMetric({ action: 'customer_login', ip, status: 'success' });

        if (!customer.isActive) {
            return NextResponse.json(
                { 
                    error: 'ACCOUNT_PENDING', 
                    message: 'حسابك التجاري قيد المراجعة والتدقيق من قبل إدارة المبيعات. سيتم تفعيله قريباً أو يمكنك التواصل معنا مباشرة لتسريع التفعيل.',
                    phone: customer.phone,
                    shopName: customer.shopName
                },
                { status: 403 }
            );
        }

        const token = signToken({
            id: customer.id,
            phone: customer.phone,
            shopName: customer.shopName,
            ownerName: customer.ownerName,
        });

        await setCustomerAuthCookie(token);

        const safeCustomer = {
            id: customer.id,
            shopName: customer.shopName,
            ownerName: customer.ownerName,
            phone: customer.phone,
            city: customer.city,
            address: customer.address,
            notes: customer.notes,
            createdAt: customer.createdAt,
        };

        return NextResponse.json({
            success: true,
            customer: safeCustomer,
            message: 'تم تسجيل الدخول بنجاح!',
        });
    } catch (error: any) {
        console.error('Customer login error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ أثناء تسجيل الدخول' },
            { status: 500 }
        );
    }
}
