import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setCustomerAuthCookie } from '@/lib/customer-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, password } = body;

        if (!phone?.trim() || !password) {
            return NextResponse.json(
                { error: 'يرجى إدخال رقم الهاتف وكلمة المرور.' },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');

        const customer = await prisma.customer.findUnique({
            where: { phone: cleanPhone },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' },
                { status: 401 }
            );
        }

        if (!customer.isActive) {
            return NextResponse.json(
                { error: 'هذا الحساب التجاري غير مفعل، يرجى التواصل مع إدارة الشركة.' },
                { status: 403 }
            );
        }

        const isMatch = await verifyPassword(password, customer.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'رقم الهاتف أو كلمة المرور غير صحيحة.' },
                { status: 401 }
            );
        }

        const token = signToken({
            id: customer.id,
            phone: customer.phone,
            shopName: customer.shopName,
            ownerName: customer.ownerName,
        });

        await setCustomerAuthCookie(token);

        // Retroactively link any past guest orders matching this phone
        await prisma.order.updateMany({
            where: {
                phone: cleanPhone,
                customerId: null,
            },
            data: {
                customerId: customer.id,
            },
        });

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
