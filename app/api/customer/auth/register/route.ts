import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
    hashPassword, 
    normalizeSyrianPhone, 
    isValidSyrianPhone, 
    sanitizeString 
} from '@/lib/customer-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rawShopName = sanitizeString(body.shopName, 100);
        const rawOwnerName = sanitizeString(body.ownerName, 100);
        const rawPhone = String(body.phone || '').trim();
        const rawCity = sanitizeString(body.city, 50);
        const rawAddress = sanitizeString(body.address, 300);
        const rawNotes = sanitizeString(body.notes || '', 500);
        const rawPassword = typeof body.password === 'string' ? body.password.trim() : '';

        // Validation Checks
        if (!rawShopName || rawShopName.length < 2) {
            return NextResponse.json(
                { error: 'يرجى إدخال اسم المحل التجاري بشكل صحيح (حرفين على الأقل).' },
                { status: 400 }
            );
        }

        if (!rawOwnerName || rawOwnerName.length < 2) {
            return NextResponse.json(
                { error: 'يرجى إدخال اسم صاحب المحل / التاجر بشكل صحيح.' },
                { status: 400 }
            );
        }

        const cleanPhone = normalizeSyrianPhone(rawPhone);
        if (!isValidSyrianPhone(cleanPhone)) {
            return NextResponse.json(
                { error: 'يرجى إدخال رقم هاتف محمول سوري صالح مكون من 10 أرقام (مثال: 0993443901 أو 09xxxxxxxx).' },
                { status: 400 }
            );
        }

        if (!rawCity || rawCity.length < 2) {
            return NextResponse.json(
                { error: 'يرجى اختيار المحافظة / المدينة.' },
                { status: 400 }
            );
        }

        if (!rawAddress || rawAddress.length < 4) {
            return NextResponse.json(
                { error: 'يرجى إدخال تفاصيل العنوان (الحي / الشارع / نقطة علامة).' },
                { status: 400 }
            );
        }

        if (!rawPassword || rawPassword.length < 6) {
            return NextResponse.json(
                { error: 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل.' },
                { status: 400 }
            );
        }

        if (rawPassword.length > 64) {
            return NextResponse.json(
                { error: 'كلمة المرور طويلة جداً (الحد الأقصى 64 حرفاً).' },
                { status: 400 }
            );
        }

        // Check if phone already registered
        const existing = await prisma.customer.findUnique({
            where: { phone: cleanPhone },
            select: { id: true, isActive: true },
        });

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json(
                    { error: 'رقم الهاتف هذا مسجل ومفعل مسبقاً. يمكنك تسجيل الدخول مباشرة.' },
                    { status: 409 }
                );
            } else {
                return NextResponse.json(
                    { error: 'رقم الهاتف مسجل بالفعل وطلبك قيد المراجعة والتدقيق لدى إدارة المبيعات.' },
                    { status: 409 }
                );
            }
        }

        const hashedPassword = await hashPassword(rawPassword);

        // Account is created in pending state (isActive: false) awaiting Admin approval
        const newCustomer = await prisma.customer.create({
            data: {
                shopName: rawShopName,
                ownerName: rawOwnerName,
                phone: cleanPhone,
                city: rawCity,
                address: rawAddress,
                password: hashedPassword,
                notes: rawNotes || null,
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

        // Link past guest orders with matching phone
        await prisma.order.updateMany({
            where: {
                phone: cleanPhone,
                customerId: null,
            },
            data: {
                customerId: newCustomer.id,
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
