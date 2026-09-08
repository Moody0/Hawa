import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { verifyOrderAccessToken } from '@/lib/order-token';

export async function POST(req: Request) {
    try {
        const customer = await getAuthenticatedCustomer();
        if (!customer) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول لربط الطلب بحسابك.' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { orderId, orderToken } = body;

        if (!orderId || typeof orderId !== 'string' || !orderToken || typeof orderToken !== 'string') {
            return NextResponse.json(
                { error: 'معرف الطلب ورمز الوصول المشفر مطلوبان لربط الطلب.' },
                { status: 400 }
            );
        }

        // Require possession of a valid signed order access token (Task 4.3)
        const isValid = verifyOrderAccessToken(orderId, orderToken);
        if (!isValid) {
            return NextResponse.json(
                { error: 'رمز وصول الطلب غير صالح أو منتهي الصلاحية.' },
                { status: 403 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, customerId: true },
        });

        if (!order) {
            return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
        }

        if (order.customerId && order.customerId !== customer.id) {
            return NextResponse.json(
                { error: 'هذا الطلب مرتبط بالفعل بحساب تجاري آخر.' },
                { status: 409 }
            );
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { customerId: customer.id },
        });

        return NextResponse.json({
            success: true,
            message: 'تم ربط الطلب بحسابك التجاري بنجاح!',
            orderId,
        });
    } catch (error) {
        console.error('Explicit order claim error:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء ربط الطلب.' }, { status: 500 });
    }
}
